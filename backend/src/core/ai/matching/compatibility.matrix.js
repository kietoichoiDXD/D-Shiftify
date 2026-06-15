const stripDiacritics = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const hasAny = (haystack, needles = []) => needles.some(item => haystack.includes(item));

export const DISABILITY_COMPATIBILITY = {
  vision: {
    avoid: ['heavy-visual-only', 'image-only', 'screen-dense'],
    prefer: ['screen_reader', 'voice_control', 'keyboard', 'accessible'],
  },
  hearing: {
    avoid: ['call-heavy', 'audio-only', 'phone-first'],
    prefer: ['text-first', 'async', 'chat', 'caption'],
  },
  mobility: {
    avoid: ['must-commute', 'field-work', 'on-site-only', 'travel-heavy'],
    prefer: ['remote', 'hybrid', 'flexible', 'work-from-home'],
  },
  cognitive: {
    avoid: ['fast-paced', 'multitasking', 'high-pressure'],
    prefer: ['clear-steps', 'stable', 'documented', 'structured'],
  },
  multiple: {
    avoid: ['on-site-only', 'audio-only', 'fast-paced', 'travel-heavy'],
    prefer: ['remote', 'accessible', 'structured', 'async'],
  },
};

export const detectDisabilityKinds = profile => {
  const raw = [
    ...(profile.disabilities || []),
    ...(profile.disability_types || []),
    ...(profile.cv_data?.disabilityTypes || []),
    profile.disability_status,
    profile.disabilityStatus,
  ].map(stripDiacritics);

  const kinds = new Set();
  const joined = raw.join(' ');
  if (hasAny(joined, ['vision', 'mat', 'thi'])) kinds.add('vision');
  if (hasAny(joined, ['hearing', 'deaf', 'audio', 'tai'])) kinds.add('hearing');
  if (hasAny(joined, ['mobility', 'movement', 'wheelchair', 'di chuyen'])) kinds.add('mobility');
  if (hasAny(joined, ['cognitive', 'memory', 'learning', 'attention'])) kinds.add('cognitive');
  if (kinds.size === 0 && raw.length > 0) kinds.add('multiple');
  return [...kinds];
};

export const evaluateCompatibility = (profile, job) => {
  const kinds = detectDisabilityKinds(profile);
  const env = stripDiacritics([
    job.work_environment,
    job.accessibility_level,
    job.job_type,
    job.work_mode,
    job.description_raw,
  ].filter(Boolean).join(' '));

  let penalty = 0;
  let reward = 0;
  const reasons = [];

  for (const kind of kinds) {
    const rule = DISABILITY_COMPATIBILITY[kind];
    if (rule) {
      if (hasAny(env, rule.avoid)) {
        penalty += 40;
        reasons.push(`job co dau hieu khong phu hop voi ${kind}`);
      }
      if (hasAny(env, rule.prefer)) {
        reward += 20;
        reasons.push(`job co dac tinh phu hop voi ${kind}`);
      }
    }
  }

  const result = Math.max(0, Math.min(100, 50 + reward - penalty));
  return { score: result, reasons, kinds };
};
