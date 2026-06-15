const stripDiacritics = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const toArray = value => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

const flattenSkills = skills => (skills || [])
  .map(skill => (typeof skill === 'string' ? skill : skill?.name))
  .filter(Boolean);

export const normalizeProfile = (profile = {}) => {
  const cv = profile.cv_data || {};
  const deviceIds = [
    ...toArray(profile.device_ids),
    ...toArray(profile.deviceIds),
    ...toArray(cv.deviceIds),
    ...toArray(profile.accessibility_needs),
  ];

  const hardSkills = [
    ...flattenSkills(profile.hard_skills),
    ...flattenSkills(cv.hard_skills),
    ...flattenSkills(profile.skills),
    ...flattenSkills(cv.skills),
  ].map(stripDiacritics);

  const softSkills = [
    ...flattenSkills(profile.soft_skills),
    ...flattenSkills(cv.soft_skills),
  ].map(stripDiacritics);

  const conditions = [
    ...toArray(profile.conditions),
    ...toArray(cv.conditions),
  ].map(stripDiacritics);

  const disabilities = [
    ...toArray(profile.disability_types),
    ...toArray(profile.disabilityTypes),
    ...toArray(cv.disabilityTypes),
    ...toArray(profile.disability_status ? [profile.disability_status] : []),
    ...toArray(profile.disabilityStatus ? [profile.disabilityStatus] : []),
  ].map(stripDiacritics);

  return {
    ...profile,
    deviceIds,
    hardSkills,
    softSkills,
    conditions,
    disabilities,
    workMode: profile.work_mode || cv.workMode || profile.workMode || null,
    jobType: profile.job_type || cv.jobType || profile.jobType || null,
    mobility: profile.mobility || cv.mobility || null,
    expectedJob: profile.expected_job || cv.expectedJob || profile.expectedJob || null,
    profileText: stripDiacritics([
      profile.name,
      profile.headline,
      profile.bio,
      cv.expectedJob,
    ].filter(Boolean).join(' ')),
  };
};
