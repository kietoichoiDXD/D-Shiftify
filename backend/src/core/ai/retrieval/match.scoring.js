import { z } from 'zod';
import { geoScore } from '../utils/geo.js';
import db from '../../database/index.js';

const WeightSchema = z.object({
  skill: z.number().min(0).max(1),
  exp: z.number().min(0).max(1),
  at: z.number().min(0).max(1),
  geo: z.number().min(0).max(1),
  culture_fit: z.number().min(0).max(1),
});

const DEFAULTS = { skill: 0.4, exp: 0.2, at: 0.25, geo: 0.15, culture_fit: 0 };
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
    weights.skill += 0.1;
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
    const { routerModel } = await import('../llm/gemini.client.js');
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

export const MATCHING_CRITERIA_V2 = [
  { key: 'priority', label: 'Ưu tiên công việc', weight: 0.25 },
  { key: 'experience', label: 'Kinh nghiệm làm việc', weight: 0.2 },
  { key: 'devices', label: 'Thiết bị hiện có', weight: 0.15 },
  { key: 'career_goal', label: 'Mục tiêu nghề nghiệp', weight: 0.15 },
  { key: 'hard_skills', label: 'Kỹ năng cứng', weight: 0.1 },
  { key: 'soft_skills', label: 'Kỹ năng mềm', weight: 0.05 },
  { key: 'certificates', label: 'Chứng chỉ', weight: 0.05 },
  { key: 'custom', label: 'Trường phụ', weight: 0.05 },
];

export const STANDARD_WEIGHTS = MATCHING_CRITERIA_V2.map(item => item.weight);
export const DEFAULT_CRITERIA = MATCHING_CRITERIA_V2.map(item => item.key);

const normalizeKey = key => String(key || '').trim().toLowerCase().replace(/\s+/g, '_');

const stripDiacritics = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const mapPriorityKey = (key) => {
  const k = stripDiacritics(key);
  if (k === 'priority' || k.includes('uu tien') || k.includes('dia_chi') || k.includes('dieu_kien') || k.includes('work_preference')) return 'priority';
  if (k === 'experience' || k.includes('kinh_nghiem') || k.includes('work_exp') || k.includes('work_experience')) return 'experience';
  if (k === 'devices' || k.includes('thiet_bi') || k.includes('equipment') || k.includes('tools')) return 'devices';
  if (k === 'career_goal' || k === 'career' || k.includes('muc_tieu') || k.includes('goal')) return 'career_goal';
  if (k === 'hard_skills' || k.includes('ky_nang_cung') || k.includes('hard')) return 'hard_skills';
  if (k === 'soft_skills' || k.includes('ky_nang_mem') || k.includes('soft')) return 'soft_skills';
  if (k === 'certificates' || k.includes('chung_chi') || k.includes('cert')) return 'certificates';
  if (k === 'custom' || k.includes('truong_phu') || k.includes('phu') || k.includes('extra')) return 'custom';
  return null;
};

export const calculateWeights = (tickedPriorities = []) => {
  let ticked = tickedPriorities;
  if (typeof tickedPriorities === 'string') {
    ticked = tickedPriorities.split(',').map(s => s.trim());
  }
  if (!Array.isArray(ticked)) ticked = [];

  const normalizedTicked = ticked
    .map(mapPriorityKey)
    .filter((k) => k !== null && DEFAULT_CRITERIA.includes(k));

  const uniqueTicked = [...new Set(normalizedTicked)];
  const unticked = DEFAULT_CRITERIA.filter(c => !uniqueTicked.includes(c));
  const finalOrder = [...uniqueTicked, ...unticked];

  const weights = {};
  for (let i = 0; i < finalOrder.length; i++) {
    weights[finalOrder[i]] = STANDARD_WEIGHTS[i];
  }
  return weights;
};

export const calculatePriorityScore = (profile, job) => {
  if (job.is_remote && (profile.work_mode === 'remote' || profile.cv_data?.workMode === 'remote')) {
    return 100;
  }

  const candidateLat = profile.location_lat;
  const candidateLng = profile.location_lng;
  const jobLat = job.location_lat;
  const jobLng = job.location_lng;

  if (candidateLat !== null && candidateLng !== null && jobLat !== null && jobLng !== null) {
    const distanceScore = geoScore(candidateLat, candidateLng, jobLat, jobLng);
    if (distanceScore >= 0.8) return 100;
  }

  const candidateConditions = profile.conditions || profile.cv_data?.conditions || [];
  if (candidateConditions.includes('health_insurance') && job.has_insurance) return 100;
  if (candidateConditions.includes('flexible_working_hours') && stripDiacritics(job.work_environment || '').includes('flexible')) return 100;

  return 50;
};

export const getTitleMatchLevel = (expTitle = '', jobTitle = '') => {
  const t1 = stripDiacritics(expTitle).trim();
  const t2 = stripDiacritics(jobTitle).trim();
  if (!t1 || !t2) return 4;
  if (t1 === t2) return 1;

  const isIntern1 = t1.includes('intern') || t1.includes('thuc_tap') || t1.includes('hoc_viec');
  const isIntern2 = t2.includes('intern') || t2.includes('thuc_tap') || t2.includes('hoc_viec');
  if (isIntern1 !== isIntern2) {
    const keywords1 = t1.split(/[\s_-]+/).filter(w => w.length > 2);
    const keywords2 = t2.split(/[\s_-]+/).filter(w => w.length > 2);
    const common = keywords1.filter(w => keywords2.includes(w) && !['intern'].includes(w));
    if (common.length > 0 || (t1.includes('backend') && t2.includes('backend')) || (t1.includes('frontend') && t2.includes('frontend'))) {
      return 2;
    }
    return 4;
  }

  const synonymGroups = [
    ['backend', 'developer', 'engineer', 'lap_trinh', 'coder', 'programmer'],
    ['frontend', 'react', 'vue', 'angular', 'javascript', 'ui'],
    ['design', 'designer', 'ui/ux', 'ux'],
    ['sale', 'sales', 'ban_hang', 'kinh_doanh'],
    ['marketing', 'pr', 'content', 'writer', 'viet_lach'],
  ];

  const checkSynonyms = syns => syns.some(s => t1.includes(s)) && syns.some(s => t2.includes(s));
  if (synonymGroups.some(group => checkSynonyms(group))) return 1;

  const keywords1 = t1.split(/[\s_-]+/).filter(w => w.length > 2);
  const keywords2 = t2.split(/[\s_-]+/).filter(w => w.length > 2);
  const common = keywords1.filter(w => keywords2.includes(w));
  if (common.length > 0) return 2;

  if ((t1.includes('tech') || t1.includes('software') || t1.includes('it') || t1.includes('may_tinh')) &&
      (t2.includes('tech') || t2.includes('software') || t2.includes('it') || t2.includes('may_tinh'))) {
    return 2;
  }

  if (t1.includes('giao_tiep') || t1.includes('communication') || t1.includes('support') || t1.includes('cskh') || t1.includes('admin')) {
    return 3;
  }

  return 4;
};

const parseRequiredExperience = (jdText = '') => {
  const lower = stripDiacritics(jdText);
  const match = lower.match(/(\d+)\s*(nam|year)/);
  if (match) return parseInt(match[1], 10) * 12;
  const matchMonth = lower.match(/(\d+)\s*(thang|month)/);
  if (matchMonth) return parseInt(matchMonth[1], 10);
  return 12;
};

const parseExperienceMonths = (exp) => {
  if (exp.startDate) {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const diffYears = end.getFullYear() - start.getFullYear();
    const diffMonths = end.getMonth() - start.getMonth();
    return Math.max(1, diffYears * 12 + diffMonths);
  }
  const dur = stripDiacritics(exp.duration || '');
  const matchYear = dur.match(/(\d+)\s*(nam|year)/);
  if (matchYear) return parseInt(matchYear[1], 10) * 12;
  const matchMonth = dur.match(/(\d+)\s*(thang|month)/);
  if (matchMonth) return parseInt(matchMonth[1], 10);
  return 6;
};

export const calculateExperienceScore = (profile, job) => {
  const experiences = profile.experience || profile.cv_data?.experience || [];
  if (!experiences.length) return 0;

  let maxTitleScore = 0;
  let totalValidMonths = 0;
  const jobTitle = job.title;

  for (const exp of experiences) {
    const level = getTitleMatchLevel(exp.title, jobTitle);
    let titleScore = 0;
    let coeff = 0;
    if (level === 1) { titleScore = 75; coeff = 1.0; }
    else if (level === 2) { titleScore = 50; coeff = 0.5; }
    else if (level === 3) { titleScore = 25; coeff = 0.25; }

    if (titleScore > maxTitleScore) maxTitleScore = titleScore;
    const months = parseExperienceMonths(exp);
    totalValidMonths += months * coeff;
  }

  const requiredMonths = parseRequiredExperience(job.description_raw);
  let durationScore = 25;
  if (totalValidMonths < requiredMonths) {
    durationScore = (totalValidMonths / requiredMonths) * 25;
  }

  return Math.min(maxTitleScore + durationScore, 100);
};

export const calculateDevicesScore = (profile, job) => {
  const env = stripDiacritics(job.work_environment || '');
  const possibleDevices = ['screen_reader', 'braille', 'magnifier', 'voice_control'];
  const required = possibleDevices.filter(d => env.includes(d));

  if (!required.length) return 100;

  const candidateDevices = [
    ...(profile.device_ids || []),
    ...(profile.deviceIds || []),
    ...(profile.cv_data?.deviceIds || []),
    ...(profile.accessibility_needs || []),
  ].map(d => stripDiacritics(d));

  let matchingCount = 0;
  for (const req of required) {
    if (candidateDevices.some(cd => cd.includes(req))) matchingCount++;
  }
  return Math.round((matchingCount / required.length) * 100);
};

export const calculateCareerGoalScore = (profile, job, semanticScore) => {
  let score = 40;
  if (semanticScore >= 0.75) {
    score = 70 + Math.round((semanticScore - 0.75) * 120);
  } else if (semanticScore >= 0.5) {
    score = 40 + Math.round((semanticScore - 0.5) * 116);
  } else {
    score = Math.round(semanticScore * 80);
  }
  return Math.min(Math.max(score, 0), 100);
};

export const calculateHardSkillsScore = (profile, job) => {
  const jobSkills = job.required_skills || [];
  if (!jobSkills.length) return 100;

  const candidateHardSkills = [
    ...(profile.hard_skills || []),
    ...(profile.cv_data?.hard_skills || []),
  ].map(s => stripDiacritics(s));

  const matchingCount = jobSkills.filter(s => candidateHardSkills.includes(stripDiacritics(s))).length;
  const ratio = matchingCount / jobSkills.length;

  if (ratio >= 0.8) {
    return 80 + Math.round((ratio - 0.8) * 100);
  }
  if (ratio >= 0.5) {
    return 50 + Math.round((ratio - 0.5) * 96.6);
  }
  return Math.round(ratio * 98);
};

export const calculateSoftSkillsScore = (profile) => {
  const softSkills = [
    ...(profile.soft_skills || []),
    ...(profile.cv_data?.soft_skills || []),
  ];
  if (softSkills.length >= 3) {
    return 85 + Math.min(Math.round((softSkills.length - 3) * 5), 15);
  }
  if (softSkills.length >= 1) return 65;
  return 30;
};

export const calculateCertificatesScore = (profile) => {
  const certs = [
    ...(profile.certificates || []),
    ...(profile.cv_data?.certificates || []),
  ];
  if (!certs.length) return 0;

  let maxScore = 55;
  for (const cert of certs) {
    const c = stripDiacritics(cert);
    if (['bachelor', 'bang', 'degree', 'dai_hoc', 'cao_dang', 'university', 'college'].some(k => c.includes(k))) {
      maxScore = 90;
      break;
    }
    if (['online', 'coursera', 'udemy', 'chung_chi', 'certificate', 'khoa_hoc', 'vocational', 'trung_tam'].some(k => c.includes(k))) {
      if (maxScore < 65) maxScore = 65;
    }
  }
  return maxScore;
};

export const calculateCustomScore = (profile) => {
  const customs = profile.custom_sections || profile.cv_data?.customSections || [];
  if (!customs.length) return 100;

  let filled = 0;
  for (const sec of customs) {
    if (sec.items?.length || sec.title) filled++;
  }
  return Math.round((filled / customs.length) * 100);
};

export const hybridScore = (profile, job, semanticScore = 0, weights = null) => {
  const selectedWeights = weights || calculateWeights([]);

  const sPriority = calculatePriorityScore(profile, job);
  const sExperience = calculateExperienceScore(profile, job);
  const sDevices = calculateDevicesScore(profile, job);
  const sCareerGoal = calculateCareerGoalScore(profile, job, semanticScore);
  const sHardSkills = calculateHardSkillsScore(profile, job);
  const sSoftSkills = calculateSoftSkillsScore(profile);
  const sCertificates = calculateCertificatesScore(profile);
  const sCustom = calculateCustomScore(profile);

  const score =
    selectedWeights.priority * sPriority +
    selectedWeights.experience * sExperience +
    selectedWeights.devices * sDevices +
    selectedWeights.career_goal * sCareerGoal +
    selectedWeights.hard_skills * sHardSkills +
    selectedWeights.soft_skills * sSoftSkills +
    selectedWeights.certificates * sCertificates +
    selectedWeights.custom * sCustom;

  return Math.round(score);
};

export const buildMatchExplanation = (profile, job, weights, finalScore) => {
  const w = weights || calculateWeights([]);
  const dominantKey = Object.entries(w).sort((a, b) => b[1] - a[1])[0]?.[0] || 'priority';
  const dominant = MATCHING_CRITERIA_V2.find(item => item.key === dominantKey)?.label || 'Ưu tiên công việc';

  const sPriority = calculatePriorityScore(profile, job);
  const sExperience = calculateExperienceScore(profile, job);
  const sDevices = calculateDevicesScore(profile, job);
  const sCareerGoal = calculateCareerGoalScore(profile, job, parseFloat(job.semantic_score || 0));
  const sHardSkills = calculateHardSkillsScore(profile, job);
  const sSoftSkills = calculateSoftSkillsScore(profile);
  const sCertificates = calculateCertificatesScore(profile);
  const sCustom = calculateCustomScore(profile);

  const reasons = [];
  if (sPriority >= 80) reasons.push('Ưu tiên công việc khớp');
  if (sExperience >= 70) reasons.push('Kinh nghiệm làm việc phù hợp');
  if (sDevices >= 80) reasons.push('Thiết bị hiện có đáp ứng');
  if (sCareerGoal >= 70) reasons.push('Mục tiêu nghề nghiệp khớp');
  if (sHardSkills >= 80) reasons.push('Kỹ năng cứng đáp ứng tốt');
  if (sSoftSkills >= 80) reasons.push('Kỹ năng mềm phù hợp');
  if (sCertificates >= 80) reasons.push('Chứng chỉ hỗ trợ tốt');
  if (sCustom >= 80) reasons.push('Trường phụ bổ trợ tốt');
  if (!reasons.length) reasons.push(`Tối ưu theo trọng số ${dominant}`);

  return `Phù hợp ${finalScore}/100 dựa trên: ${reasons.join(', ')}.`;
};
