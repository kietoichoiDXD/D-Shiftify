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

const SOFT_SKILLS = [
    'communication', 'giao tiep', 'teamwork', 'lam viec nhom', 'leadership',
    'lanh dao', 'problem solving', 'giai quyet van de', 'time management',
    'quan ly thoi gian', 'adaptability', 'thich nghi', 'creativity', 'sang tao',
];

const STOP_WORDS = new Set([
    'and', 'the', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are',
    'cua', 'cho', 'voi', 'cac', 'mot', 'nhung', 'trong', 'cong', 'viec', 'lam',
    'yeu', 'cau', 'ung', 'vien', 'nhan', 'su', 'tai', 'duoc', 'co', 'va', 'la',
]);

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const parseArray = value => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return value.split(',').map(item => item.trim()).filter(Boolean);
        }
    }
    return [];
};

const stripDiacritics = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const normalizeText = value => stripDiacritics(value)
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const readName = value => normalizeText(
    typeof value === 'object' && value !== null
        ? value.name || value.title || value.label || value.value
        : value,
);

const names = values => parseArray(values).map(readName).filter(Boolean);

const tokens = value => new Set(
    normalizeText(value)
        .split(/[\s,/|()-]+/)
        .filter(token => token.length > 1 && !STOP_WORDS.has(token)),
);

const lexicalSimilarity = (left, right) => {
    const leftTokens = tokens(left);
    const rightTokens = tokens(right);
    if (!leftTokens.size || !rightTokens.size) return 0;
    let intersection = 0;
    leftTokens.forEach(token => {
        if (rightTokens.has(token)) intersection += 1;
    });
    return intersection / new Set([...leftTokens, ...rightTokens]).size;
};

const mapPriorityKey = value => {
    const key = normalizeText(value).replace(/\s+/g, '_');
    if (key === 'priority' || key.includes('uu_tien') || key.includes('work_preference')) return 'priority';
    if (key === 'experience' || key.includes('kinh_nghiem') || key.includes('work_experience')) return 'experience';
    if (key === 'devices' || key.includes('thiet_bi') || key.includes('equipment')) return 'devices';
    if (key === 'career_goal' || key.includes('muc_tieu') || key.includes('career')) return 'career_goal';
    if (key === 'hard_skills' || key.includes('ky_nang_cung') || key.includes('hard')) return 'hard_skills';
    if (key === 'soft_skills' || key.includes('ky_nang_mem') || key.includes('soft')) return 'soft_skills';
    if (key === 'certificates' || key.includes('chung_chi') || key.includes('cert')) return 'certificates';
    if (key === 'custom' || key.includes('truong_phu') || key.includes('extra')) return 'custom';
    return null;
};

export const calculateWeights = (priorities = []) => {
    const requested = typeof priorities === 'string' ? priorities.split(',') : priorities;
    const selected = Array.isArray(requested)
        ? [...new Set(requested.map(mapPriorityKey).filter(Boolean))]
        : [];
    const order = [...selected, ...DEFAULT_CRITERIA.filter(key => !selected.includes(key))];
    return order.reduce((result, key, index) => ({
        ...result,
        [key]: STANDARD_WEIGHTS[index],
    }), {});
};

// Per-job weight map used by the LangGraph agent path (match.agent.js / ai.service.js).
// Honours any priority order stored on the job; otherwise returns the default v2 weights.
export const getJobWeights = (job = {}) =>
    calculateWeights(job.priorities || job.criteria_priorities || job.weightPriorities || []);

export const getTitleMatchLevel = (candidateTitle = '', jobTitle = '') => {
    const candidate = normalizeText(candidateTitle);
    const job = normalizeText(jobTitle);
    if (!candidate || !job) return 4;
    if (candidate === job) return 1;

    const synonymGroups = [
        ['backend', 'server', 'nodejs', 'node', 'api'],
        ['frontend', 'react', 'vue', 'angular', 'web'],
        ['developer', 'engineer', 'programmer', 'lap trinh', 'coder'],
        ['design', 'designer', 'ui', 'ux'],
        ['data', 'analyst', 'analytics', 'phan tich'],
        ['sale', 'sales', 'kinh doanh', 'ban hang'],
        ['marketing', 'content', 'pr'],
    ];
    const candidateWords = tokens(candidate);
    const jobWords = tokens(job);
    const common = [...candidateWords].filter(word => jobWords.has(word));
    if (common.length >= 2) return 1;
    if (common.length === 1) return 2;

    const related = synonymGroups.some(group => (
        group.some(word => candidate.includes(word)) && group.some(word => job.includes(word))
    ));
    if (related) return 2;
    if (lexicalSimilarity(candidate, job) >= 0.1) return 3;
    return 4;
};

const parseRequiredExperience = job => {
    const value = normalizeText(`${job.experienceRequired || job.experience_required || ''} ${job.description || ''}`);
    const yearMatch = value.match(/(\d+(?:\.\d+)?)\s*(nam|year)/);
    if (yearMatch) return Math.max(Number(yearMatch[1]) * 12, 1);
    const monthMatch = value.match(/(\d+)\s*(thang|month)/);
    if (monthMatch) return Math.max(Number(monthMatch[1]), 1);
    return 0;
};

const experienceMonths = experience => {
    const startValue = experience.startDate || experience.start_date;
    const endValue = experience.endDate || experience.end_date;
    if (startValue) {
        const start = new Date(startValue);
        const end = endValue ? new Date(endValue) : new Date();
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
            return Math.max((end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth(), 1);
        }
    }
    const value = normalizeText(experience.duration);
    const yearMatch = value.match(/(\d+(?:\.\d+)?)\s*(nam|year)/);
    if (yearMatch) return Number(yearMatch[1]) * 12;
    const monthMatch = value.match(/(\d+)\s*(thang|month)/);
    return monthMatch ? Number(monthMatch[1]) : 0;
};

const ratioToBandScore = ratio => {
    const safeRatio = clamp(ratio, 0, 1);
    if (safeRatio >= 0.8) return 80 + Math.round((safeRatio - 0.8) * 100);
    if (safeRatio >= 0.5) return 50 + Math.round((safeRatio - 0.5) * 100);
    return Math.round(safeRatio * 98);
};

export const calculatePriorityScore = (profile, job) => {
    const candidateWorkMode = normalizeText(profile.workMode || profile.work_mode);
    const candidateJobType = normalizeText(profile.jobType || profile.job_type);
    const jobWorkMode = normalizeText(job.workMode || job.work_mode);
    const jobType = normalizeText(job.jobType || job.job_type);
    const preferences = parseArray(profile.conditions).map(normalizeText);

    const workModeMatches = candidateWorkMode && (
        candidateWorkMode === jobWorkMode ||
        (candidateWorkMode === 'remote' && jobWorkMode === 'hybrid')
    );
    const jobTypeMatches = candidateJobType && candidateJobType === jobType;
    const flexibleMatches = preferences.some(item => item.includes('flexible')) &&
        normalizeText(job.description).includes('flexible');
    return workModeMatches || jobTypeMatches || flexibleMatches ? 100 : 50;
};

export const calculateExperienceScore = (profile, job) => {
    const experiences = parseArray(profile.experiences || profile.experience);
    if (!experiences.length) return 0;

    let titleScore = 0;
    let validMonths = 0;
    experiences.forEach(experience => {
        const title = experience.position || experience.title || experience.role;
        const level = getTitleMatchLevel(title, job.title);
        const levelScore = [0, 75, 50, 25, 0][level];
        const coefficient = [0, 1, 0.5, 0.25, 0][level];
        titleScore = Math.max(titleScore, levelScore);
        validMonths += experienceMonths(experience) * coefficient;
    });

    const requiredMonths = parseRequiredExperience(job);
    const durationScore = requiredMonths === 0
        ? 25
        : Math.min(validMonths / requiredMonths, 1) * 25;
    return Math.round(clamp(titleScore + durationScore));
};

export const calculateDevicesScore = (profile, job) => {
    const required = names(job.devices || job.assistiveDevices || job.assistive_devices);
    if (!required.length) return 100;
    const available = names(profile.devices || profile.deviceNames || profile.device_ids || profile.deviceIds);
    const matches = required.filter(requiredDevice => available.some(device => (
        device.includes(requiredDevice) || requiredDevice.includes(device)
    )));
    return Math.round((matches.length / required.length) * 100);
};

export const calculateCareerGoalScore = (profile, job) => {
    const goal = profile.expectedJob || profile.expected_job || profile.careerGoal || '';
    if (!goal) return 40;
    const level = getTitleMatchLevel(goal, job.title);
    if (level === 1) return 95;
    if (level === 2) return 70;
    if (level === 3) return 45;
    return clamp(Math.round(lexicalSimilarity(goal, `${job.title} ${job.description}`) * 100));
};

const splitSkills = values => parseArray(values).reduce((result, skill) => {
    const type = normalizeText(typeof skill === 'object' ? skill.type : 'hard_skill');
    const name = readName(skill);
    if (!name) return result;
    if (type.includes('soft')) result.soft.push(name);
    else result.hard.push(name);
    return result;
}, { hard: [], soft: [] });

const skillMatchRatio = (candidateSkills, requiredSkills) => {
    if (!requiredSkills.length) return 1;
    const matches = requiredSkills.filter(required => candidateSkills.some(candidate => (
        candidate === required || candidate.includes(required) || required.includes(candidate)
    )));
    return matches.length / requiredSkills.length;
};

export const calculateHardSkillsScore = (profile, job) => {
    const candidate = splitSkills(profile.skills).hard;
    const required = splitSkills(job.skills).hard;
    return ratioToBandScore(skillMatchRatio(candidate, required));
};

export const calculateSoftSkillsScore = (profile, job) => {
    const candidate = splitSkills(profile.skills).soft;
    const explicit = splitSkills(job.skills).soft;
    const description = normalizeText(job.description);
    const inferred = SOFT_SKILLS.filter(skill => description.includes(skill));
    const required = [...new Set([...explicit, ...inferred])];
    if (!required.length) return candidate.length ? 80 : 70;
    return ratioToBandScore(skillMatchRatio(candidate, required));
};

export const calculateCertificatesScore = (profile, job) => {
    const candidate = names(profile.certificates);
    const required = names(job.certificates || job.requiredCertificates || job.required_certificates);
    if (!required.length) return 100;
    if (!candidate.length) return 0;
    const ratio = skillMatchRatio(candidate, required);
    if (ratio > 0) return ratioToBandScore(ratio);
    const hasCourseCertificate = candidate.some(certificate => (
        /coursera|udemy|online|khoa hoc|trung tam|vocational/.test(certificate)
    ));
    return hasCourseCertificate ? 55 : 0;
};

const flattenValues = value => {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) return value.flatMap(flattenValues);
    if (typeof value === 'object') return Object.values(value).flatMap(flattenValues);
    return [String(value)];
};

export const calculateCustomScore = (profile, job) => {
    const sections = parseArray(profile.customSections || profile.custom_sections);
    if (!sections.length) return 100;
    const jobText = `${job.title || ''} ${job.description || ''}`;
    const scores = sections.map(section => {
        const sectionText = flattenValues(section).join(' ');
        return clamp(Math.round(lexicalSimilarity(sectionText, jobText) * 300));
    });
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

export const calculateAccessibilityScore = job => {
    const description = normalizeText(job.description);
    const workMode = normalizeText(job.workMode || job.work_mode);
    const devices = names(job.devices || job.assistiveDevices || job.assistive_devices);
    const signals = [];
    const warnings = [];
    let score = 15;

    if (workMode === 'remote' || workMode === 'hybrid') {
        score += 25;
        signals.push('Có hình thức làm việc từ xa hoặc kết hợp');
    }
    if (devices.length || /screen reader|braille|voice control|tro nang|thiet bi ho tro|accessible/.test(description)) {
        score += 30;
        signals.push('Có hỗ trợ công nghệ hoặc thiết bị trợ năng');
    }
    if (/flexible|linh hoat|accommodation|ho tro dieu chinh|inclusive|hoa nhap/.test(description)) {
        score += 20;
        signals.push('Có chính sách điều chỉnh và hòa nhập');
    }
    if (/khong nhan nguoi khuyet tat|ngoai hinh ua nhin|suc khoe tot tuyet doi/.test(description)) {
        score -= 25;
        warnings.push('Mô tả có dấu hiệu loại trừ hoặc yêu cầu không cần thiết');
    } else {
        score += 10;
    }

    return { score: clamp(score), signals, warnings };
};

export const evaluateMatch = (profile, job, priorities = []) => {
    const weights = calculateWeights(priorities);
    const scores = {
        priority: calculatePriorityScore(profile, job),
        experience: calculateExperienceScore(profile, job),
        devices: calculateDevicesScore(profile, job),
        career_goal: calculateCareerGoalScore(profile, job),
        hard_skills: calculateHardSkillsScore(profile, job),
        soft_skills: calculateSoftSkillsScore(profile, job),
        certificates: calculateCertificatesScore(profile, job),
        custom: calculateCustomScore(profile, job),
    };
    const criteria = MATCHING_CRITERIA_V2.map(criterion => ({
        ...criterion,
        weight: weights[criterion.key],
        score: scores[criterion.key],
        contribution: Number((scores[criterion.key] * weights[criterion.key]).toFixed(2)),
    }));
    const totalScore = Math.round(criteria.reduce((sum, item) => sum + item.contribution, 0));
    const strengths = criteria.filter(item => item.score >= 80).map(item => item.label);
    const gaps = criteria.filter(item => item.score < 50).map(item => item.label);
    const accessibility = calculateAccessibilityScore(job);
    const summary = strengths.length
        ? `Phù hợp ${totalScore}/100. Điểm mạnh: ${strengths.join(', ')}.`
        : `Phù hợp ${totalScore}/100. Cần bổ sung thêm thông tin để tăng độ chính xác.`;

    return {
        criteriaVersion: 'v2',
        score: totalScore,
        criteria,
        strengths,
        gaps,
        accessibility,
        explanation: summary,
    };
};

export const hybridScore = (profile, job, ...legacyOptions) => {
    const weights = legacyOptions.length > 1 ? legacyOptions[1] : null;
    const priorities = weights
        ? Object.entries(weights).sort((left, right) => right[1] - left[1]).map(([key]) => key)
        : [];
    return evaluateMatch(profile, job, priorities).score;
};

export const buildMatchExplanation = (profile, job, weights) => {
    const priorities = weights
        ? Object.entries(weights).sort((left, right) => right[1] - left[1]).map(([key]) => key)
        : [];
    return evaluateMatch(profile, job, priorities).explanation;
};
