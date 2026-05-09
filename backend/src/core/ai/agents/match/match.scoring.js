import { z } from 'zod';
import { routerModel } from '../shared/llm.js';
import { geoScore } from '../shared/geo.js';

// ── Dynamic weight schema ──────────────────────────────────────────────────────
const WeightSchema = z.object({
  skill:        z.number().min(0).max(1),
  exp:          z.number().min(0).max(1),
  at:           z.number().min(0).max(1),
  geo:          z.number().min(0).max(1),
  culture_fit:  z.number().min(0).max(1),
});

const weightModel = routerModel.withStructuredOutput(WeightSchema);

// In-memory cache: job_id → weights (avoids re-calling Gemini per candidate)
const weightCache = new Map();

/**
 * Ask Gemini to infer scoring weights from the raw JD text.
 * Weights must sum to 1.0.
 * Results cached by job_id for the lifetime of the process.
 */
export const inferWeights = async (job) => {
  if (weightCache.has(job.job_id)) return weightCache.get(job.job_id);

  try {
    const raw = await weightModel.invoke(
      `Bạn là chuyên gia tuyển dụng. Phân tích JD sau và trả về trọng số chấm điểm (tổng = 1.0).\n\n` +
      `JD: "${(job.description_raw || job.title || '').slice(0, 800)}"\n\n` +
      `Hướng dẫn:\n` +
      `- skill: mức độ yêu cầu kỹ năng kỹ thuật cụ thể\n` +
      `- exp: mức độ yêu cầu kinh nghiệm năm tháng\n` +
      `- at: mức độ quan trọng của hỗ trợ accessibility (screen reader, remote...)\n` +
      `- geo: mức độ quan trọng của vị trí địa lý\n` +
      `- culture_fit: mức độ quan trọng của văn hóa, thái độ, soft skills ẩn\n\n` +
      `Ví dụ startup sáng tạo: skill=0.25, exp=0.10, at=0.20, geo=0.10, culture_fit=0.35\n` +
      `Ví dụ ngân hàng: skill=0.45, exp=0.35, at=0.10, geo=0.05, culture_fit=0.05`,
    );

    // Normalize to sum = 1.0
    const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
    const w = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / total]));

    weightCache.set(job.job_id, w);
    return w;
  } catch {
    // Fallback to spec defaults
    return { skill: 0.40, exp: 0.20, at: 0.25, geo: 0.15, culture_fit: 0 };
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
