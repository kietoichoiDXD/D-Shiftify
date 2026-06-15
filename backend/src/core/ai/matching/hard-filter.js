import { evaluateCompatibility } from './compatibility.matrix.js';

const stripDiacritics = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const experienceMonths = profile => {
  const experiences = profile.experience || profile.cv_data?.experience || [];
  return experiences.length * 12;
};

export const hardFilterJob = (profile, job) => {
  const reasons = [];

  const remoteRequested = String(profile.workMode || profile.work_mode || profile.cv_data?.workMode || '').toLowerCase() === 'remote';
  if (remoteRequested && job.is_remote === false) {
    reasons.push('user uu tien remote nhung job khong remote');
  }

  const accessibilityLevel = String(job.accessibility_level || '').toUpperCase();
  if (accessibilityLevel && !['AA', 'AAA'].includes(accessibilityLevel)) {
    reasons.push('muc do accessibility chua du');
  }

  const requiredSkills = (job.required_skills || []).map(stripDiacritics);
  const candidateSkills = [
    ...(profile.hardSkills || []),
    ...(profile.hard_skills || []),
    ...(profile.cv_data?.hard_skills || []),
  ].map(stripDiacritics);
  const missingSkills = requiredSkills.filter(skill => !candidateSkills.includes(skill));

  if (requiredSkills.length >= 4 && missingSkills.length === requiredSkills.length) {
    reasons.push('khong co giao nhau ve hard skills');
  }

  const requiredMonthsMatch = String(job.description_raw || '').match(/(\d+)\s*(nam|year|years)/i);
  if (requiredMonthsMatch) {
    const requiredMonths = parseInt(requiredMonthsMatch[1], 10) * 12;
    if (experienceMonths(profile) + 3 < requiredMonths) {
      reasons.push('thieu kinh nghiem toi thieu');
    }
  }

  const compatibility = evaluateCompatibility(profile, job);
  if (compatibility.score < 30) {
    reasons.push('do phu hop accessibility qua thap');
  }

  return {
    passed: reasons.length === 0,
    reasons,
    compatibility,
  };
};
