import { geoScore } from '../shared/geo.js';

// ── Official weights per spec ──────────────────────────────────────────────────
const W = {
  skill: parseFloat(process.env.MATCH_SKILL_WEIGHT || '0.40'),
  exp:   parseFloat(process.env.MATCH_EXP_WEIGHT   || '0.20'),
  at:    parseFloat(process.env.MATCH_AT_WEIGHT     || '0.25'),
  geo:   parseFloat(process.env.MATCH_GEO_WEIGHT    || '0.15'),
};

// ── AT Match (Accommodation Match) — 25% ──────────────────────────────────────
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

  return Math.min(s, 1);
};

// ── Skill overlap (exact + fuzzy via semantic_score boost) ────────────────────
const skillScore = (candidate_skills = [], job_skills = [], semantic_score = 0) => {
  if (!job_skills.length) return semantic_score; // fallback to semantic
  const jLower = job_skills.map((s) => s.toLowerCase());
  const exact = candidate_skills.filter((s) => jLower.includes(s.toLowerCase())).length;
  const base = exact / Math.max(job_skills.length, 1);
  // Boost with semantic similarity for fuzzy matches
  return Math.min(base + semantic_score * 0.3, 1);
};

// ── Experience score ───────────────────────────────────────────────────────────
const expScore = (experience = []) =>
  experience.length >= 3 ? 1 : experience.length >= 1 ? 0.6 : 0.2;

/**
 * Final hybrid score (0–100)
 * skill 40% · exp 20% · AT match 25% · geo 15%
 * semantic_score used as boost inside skillScore, not as direct weight
 */
export const hybridScore = (profile, job, semantic_score = 0) => {
  const allSkills = [
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ];

  const score =
    W.skill * skillScore(allSkills, job.required_skills, semantic_score) +
    W.exp   * expScore(profile.experience) +
    W.at    * atMatchScore(profile.accessibility_needs, job) +
    W.geo   * geoScore(profile.location_lat, profile.location_lng, job.location_lat, job.location_lng);

  return Math.round(score * 100);
};
