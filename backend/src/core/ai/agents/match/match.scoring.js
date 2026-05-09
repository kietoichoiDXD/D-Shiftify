import { z } from 'zod';
import { routerModel } from '../shared/llm.js';
import { geoScore } from '../shared/geo.js';
import db from '../../../../core/database/index.js';

const WeightSchema = z.object({
  skill:        z.number().min(0).max(1),
  exp:          z.number().min(0).max(1),
  at:           z.number().min(0).max(1),
  geo:          z.number().min(0).max(1),
  culture_fit:  z.number().min(0).max(1),
});

const weightModel = routerModel.withStructuredOutput(WeightSchema);

const DEFAULTS = { skill: 0.40, exp: 0.20, at: 0.25, geo: 0.15, culture_fit: 0 };

// Process-level cache — avoids DB round-trip for hot jobs
const weightCache = new Map();

export const inferWeights = async (job) => {
  if (weightCache.has(job.job_id)) return weightCache.get(job.job_id);

  // 1. Load from DB (persisted at ingestion time)
  if (job.weights_json) {
    const w = typeof job.weights_json === 'string' ? JSON.parse(job.weights_json) : job.weights_json;
    weightCache.set(job.job_id, w);
    return w;
  }

  // 2. Gemini inference (cold path — only on first encounter)
  try {
    const raw = await weightModel.invoke(
      `Bạn là chuyên gia tuyển dụng. Phân tích JD sau và trả về trọng số chấm điểm (tổng = 1.0).\n\n` +
      `JD: "${(job.description_raw || job.title || '').slice(0, 800)}"\n\n` +
      `- skill: mức độ yêu cầu kỹ năng kỹ thuật cụ thể\n` +
      `- exp: mức độ yêu cầu kinh nghiệm năm tháng\n` +
      `- at: mức độ quan trọng của hỗ trợ accessibility\n` +
      `- geo: mức độ quan trọng của vị trí địa lý\n` +
      `- culture_fit: mức độ quan trọng của văn hóa, thái độ, soft skills ẩn`,
    );

    const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
    const w = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / total]));

    // 3. Persist to DB (fire-and-forget)
    db('job_descriptions').where({ job_id: job.job_id }).update({ weights_json: JSON.stringify(w) }).catch(() => {});

    weightCache.set(job.job_id, w);
    return w;
  } catch {
    return DEFAULTS;
  }
};

// ── AT Match — accessibility compatibility ────────────────────────────────────
const atMatchScore = (needs = [], job) => {
  let s = 0;
  const env = (job.work_environment || '').toLowerCase();

  if (needs.includes('screen_reader')) {
    if (['nvda', 'jaws', 'screen_reader'].some((k) => env.includes(k))) s += 0.5;
    else if (job.accessibility_level === 'AAA') s += 0.3;
    else if (job.accessibility_level === 'AA')  s += 0.15;
  }
  if (needs.includes('voice_control') && job.is_remote) s += 0.3;
  if (job.accessibility_level === 'AAA') s += 0.2;
  else if (job.accessibility_level === 'AA') s += 0.1;

  // AT Safety Floor: never penalize candidate for having accessibility needs
  if (needs.length > 0 && s === 0) return 0.3;

  return Math.min(s, 1);
};

// ── Skill score — exact match + semantic boost ────────────────────────────────
const skillScore = (candidate_skills = [], job_skills = [], semantic_score = 0) => {
  if (!job_skills.length) return semantic_score;
  const jLower = job_skills.map((s) => s.toLowerCase());
  const exact = candidate_skills.filter((s) => jLower.includes(s.toLowerCase())).length;
  return Math.min(exact / job_skills.length + semantic_score * 0.3, 1);
};

const expScore = (experience = []) =>
  experience.length >= 3 ? 1 : experience.length >= 1 ? 0.6 : 0.2;

/**
 * Dynamic hybrid score (0–100).
 *
 * Weights are inferred per-job by Gemini from description_raw.
 * culture_fit_score = semantic cosine similarity (narrative ↔ JD embedding).
 * This means "hard-working", "hứng thú Figma", "startup culture" are captured
 * even when they don't appear in required_skills[].
 *
 * @param {object} profile
 * @param {object} job          — must include job_id, description_raw
 * @param {number} semantic_score — cosine(narrative_embedding, jd_embedding) from pgvector
 * @param {object} [weights]    — pre-computed weights (pass to avoid extra Gemini call)
 */
export const hybridScore = (profile, job, semantic_score = 0, weights = null) => {
  const w = weights || { skill: 0.40, exp: 0.20, at: 0.25, geo: 0.15, culture_fit: 0 };

  const allSkills = [
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ];

  const score =
    w.skill       * skillScore(allSkills, job.required_skills, semantic_score) +
    w.exp         * expScore(profile.experience) +
    w.at          * atMatchScore(profile.accessibility_needs, job) +
    w.geo         * geoScore(profile.location_lat, profile.location_lng, job.location_lat, job.location_lng) +
    w.culture_fit * semantic_score;

  return Math.round(score * 100);
};
