import { z } from 'zod';
import { geoScore } from '../shared/geo.js';
import db from '../../../../core/database/index.js';

const WeightSchema = z.object({
  skill: z.number().min(0).max(1),
  exp: z.number().min(0).max(1),
  at: z.number().min(0).max(1),
  geo: z.number().min(0).max(1),
  culture_fit: z.number().min(0).max(1),
});

const DEFAULTS = { skill: 0.40, exp: 0.20, at: 0.25, geo: 0.15, culture_fit: 0 };
const weightCache = new Map();
const USE_LLM_WEIGHTS = process.env.AI_MATCH_USE_LLM_WEIGHTS === 'true';

const normalizeWeights = raw => {
  const safe = {
    skill: Number(raw?.skill ?? DEFAULTS.skill),
    exp: Number(raw?.exp ?? DEFAULTS.exp),
    at: Number(raw?.at ?? DEFAULTS.at),
    geo: Number(raw?.geo ?? DEFAULTS.geo),
    culture_fit: Number(raw?.culture_fit ?? DEFAULTS.culture_fit),
  };
  const total = Object.values(safe).reduce((sum, value) => sum + Math.max(value, 0), 0) || 1;
  return Object.fromEntries(
    Object.entries(safe).map(([key, value]) => [key, Math.max(value, 0) / total]),
  );
};

export const heuristicWeights = job => {
  const text = `${job?.title || ''} ${job?.description_raw || ''}`.toLowerCase();
  const requiredSkillsCount = (job?.required_skills || []).length;
  const weights = { ...DEFAULTS };

  if (requiredSkillsCount >= 5 || /(developer|engineer|data|ai|software|technical|react|node|sql)/i.test(text)) {
    weights.skill += 0.10;
    weights.culture_fit -= 0.03;
  }

  if (/(senior|lead|manager|[3-9]\+?\s*(years|nam)|experience|kinh nghiem)/i.test(text)) {
    weights.exp += 0.08;
    weights.skill -= 0.03;
  }

  if (/(remote|hybrid|accessible|screen reader|wheelchair|assistive|accessibility|khuyet tat)/i.test(text)) {
    weights.at += 0.08;
    weights.geo -= 0.03;
  }

  if (job?.is_remote) {
    weights.geo = Math.max(0.05, weights.geo - 0.06);
    weights.at += 0.04;
  }

  return normalizeWeights(weights);
};

export const getJobWeights = job => {
  if (weightCache.has(job.job_id)) return weightCache.get(job.job_id);

  if (job.weights_json) {
    try {
      const parsed = typeof job.weights_json === 'string' ? JSON.parse(job.weights_json) : job.weights_json;
      const weights = normalizeWeights(parsed);
      weightCache.set(job.job_id, weights);
      return weights;
    } catch {
      const weights = heuristicWeights(job);
      weightCache.set(job.job_id, weights);
      return weights;
    }
  }

  const weights = heuristicWeights(job);
  weightCache.set(job.job_id, weights);
  return weights;
};

export const inferWeights = async job => {
  if (weightCache.has(job.job_id)) return weightCache.get(job.job_id);
  if (job.weights_json || !USE_LLM_WEIGHTS) return getJobWeights(job);

  try {
    const { routerModel } = await import('../shared/llm.js');
    const weightModel = routerModel.withStructuredOutput(WeightSchema);
    const raw = await weightModel.invoke(
      'Analyze this job description and return normalized matching weights. ' +
      'Keys: skill, exp, at, geo, culture_fit. Total should be 1.0.\n\n' +
      `JD: "${(job.description_raw || job.title || '').slice(0, 500)}"`,
    );
    const weights = normalizeWeights(raw);

    if (job.job_id && job.job_id !== 'temp') {
      db('job_descriptions')
        .where({ job_id: job.job_id })
        .update({ weights_json: JSON.stringify(weights) })
        .catch(() => {});
    }

    weightCache.set(job.job_id, weights);
    return weights;
  } catch {
    return getJobWeights(job);
  }
};

const atMatchScore = (needs = [], job) => {
  let score = 0;
  const env = (job.work_environment || '').toLowerCase();

  if (needs.includes('screen_reader')) {
    if (['nvda', 'jaws', 'screen_reader'].some(key => env.includes(key))) score += 0.5;
    else if (job.accessibility_level === 'AAA') score += 0.3;
    else if (job.accessibility_level === 'AA') score += 0.15;
  }

  if (needs.includes('voice_control') && job.is_remote) score += 0.3;
  if (job.accessibility_level === 'AAA') score += 0.2;
  else if (job.accessibility_level === 'AA') score += 0.1;
  if (needs.length > 0 && score === 0) return 0.3;
  return Math.min(score, 1);
};

const skillScore = (candidateSkills = [], jobSkills = [], semanticScore = 0) => {
  if (!jobSkills.length) return semanticScore;
  const normalizedJobSkills = jobSkills.map(skill => String(skill).toLowerCase());
  const exact = candidateSkills.filter(skill => normalizedJobSkills.includes(String(skill).toLowerCase())).length;
  return Math.min(exact / jobSkills.length + semanticScore * 0.3, 1);
};

const expScore = (experience = []) =>
  experience.length >= 3 ? 1 : experience.length >= 1 ? 0.6 : 0.2;

export const hybridScore = (profile, job, semanticScore = 0, weights = null) => {
  const selectedWeights = weights || DEFAULTS;
  const allSkills = [
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ];
  const score =
    selectedWeights.skill * skillScore(allSkills, job.required_skills, semanticScore) +
    selectedWeights.exp * expScore(profile.experience) +
    selectedWeights.at * atMatchScore(profile.accessibility_needs, job) +
    selectedWeights.geo * geoScore(profile.location_lat, profile.location_lng, job.location_lat, job.location_lng) +
    selectedWeights.culture_fit * semanticScore;
  return Math.round(score * 100);
};

export const buildMatchExplanation = (profile, job, weights, finalScore) => {
  const dominant = Object.entries(weights || DEFAULTS).sort((a, b) => b[1] - a[1])[0]?.[0] || 'skill';
  const allSkills = [
    ...(profile.hard_skills || []),
    ...(profile.soft_skills || []),
    ...(profile.inferred_skills || []),
  ];
  const jobSkills = job.required_skills || [];
  const normalizedJobSkills = jobSkills.map(skill => String(skill).toLowerCase());
  const matchedSkills = allSkills
    .filter(skill => normalizedJobSkills.includes(String(skill).toLowerCase()))
    .slice(0, 3);

  const reasons = [];
  if (matchedSkills.length) reasons.push(`matched skills: ${matchedSkills.join(', ')}`);
  if (job.is_remote) reasons.push('remote-friendly');
  if (job.accessibility_level) reasons.push(`accessibility ${job.accessibility_level}`);
  if (!reasons.length) reasons.push(`strong ${dominant} fit`);

  return `Match ${finalScore}/100 based on ${reasons.join('; ')}.`;
};
