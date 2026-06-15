import { z } from 'zod';

const text = (max = 255) => z.string().trim().min(1).max(max);
const optionalText = (max = 255) => z.string().trim().max(max).optional();
const optionalStringArray = z.array(z.string().trim().min(1).max(120)).max(100).optional();

const splitTextList = value => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value || typeof value !== 'string') return [];
    return value
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(Boolean);
};

const SkillItemSchema = z.object({
    name: text(80),
    type: optionalText(50),
}).strict();

const CvExperiencePayloadSchema = z.object({
    company: optionalText(255),
    position: optionalText(255),
    title: optionalText(255),
    description: optionalText(2000),
    startDate: optionalText(50),
    endDate: optionalText(50),
    current: z.coerce.boolean().optional(),
}).strict();

const CvCustomSectionSchema = z.object({
    title: text(120),
    items: z.array(z.record(z.any())).max(50).default([]),
}).strict();

const NestedCvSchema = z.object({
    deviceIds: optionalStringArray,
    jobType: optionalText(80),
    workMode: optionalText(80),
    mobility: optionalText(80),
    expectedJob: optionalText(255),
    skills: z.array(SkillItemSchema).max(100).optional(),
    conditions: optionalStringArray,
    experiences: z.array(CvExperiencePayloadSchema).max(50).optional(),
    certificates: optionalStringArray,
    customSections: z.array(CvCustomSectionSchema).max(30).optional(),
}).strict();

const NestedProfileSchema = z.object({
    fullName: optionalText(255),
    dob: optionalText(30),
    gender: optionalText(30),
    phone: optionalText(30),
    disabilityStatus: optionalText(80),
    location: optionalText(255),
    headline: optionalText(255),
    bio: optionalText(2000),
    profileImage: optionalText(500),
}).strict();

const CvCompositeSchema = z.object({
    profile: NestedProfileSchema.default({}),
    cv: NestedCvSchema.default({}),
}).passthrough();

const CvFlatSchema = z.object({
    fullName: optionalText(255),
    phone: optionalText(30),
    location: optionalText(255),
    headline: optionalText(255),
    bio: optionalText(2000),
    profileImage: optionalText(500),
    avatarUrl: optionalText(500),
    dob: optionalText(30),
    birthday: optionalText(30),
    gender: optionalText(30),
    disabilityStatus: optionalText(80),
    disabilityTypes: optionalStringArray,
    disabilityLevel: optionalText(80),
    supportNeeds: optionalText(1000),
    address: optionalText(255),
    email: optionalText(255),
    skills: z.array(z.union([text(80), SkillItemSchema])).max(100).optional(),
    hardSkills: optionalText(1000),
    softSkills: optionalText(1000),
    deviceIds: optionalStringArray,
    availableEquipment: optionalStringArray,
    jobType: optionalText(80),
    workTime: optionalText(80),
    workMode: optionalText(80),
    mobility: optionalText(80),
    expectedJob: optionalText(255),
    careerGoals: optionalText(1000),
    conditions: optionalStringArray,
    workConditions: optionalStringArray,
    experiences: z.array(CvExperiencePayloadSchema).max(50).optional(),
    workExperiences: z.array(z.object({
        companyName: optionalText(255),
        jobTitle: optionalText(255),
        contributionStart: optionalText(50),
        contributionEnd: optionalText(50),
        workTime: optionalText(80),
        workMode: optionalText(80),
        experience: optionalText(2000),
        isCurrent: z.coerce.boolean().optional(),
    }).strict()).max(50).optional(),
    experience: optionalText(2000),
    companyName: optionalText(255),
    jobTitle: optionalText(255),
    contributionStart: optionalText(50),
    contributionEnd: optionalText(50),
    education: optionalText(1500),
    schoolName: optionalText(255),
    major: optionalText(255),
    achievement: optionalText(1000),
    educationStart: optionalText(50),
    educationEnd: optionalText(50),
    certificates: z.union([optionalStringArray.unwrap(), z.string().trim().max(1000)]).optional(),
    certifications: optionalText(1000),
    customSections: z.array(CvCustomSectionSchema).max(30).optional(),
    audioReviewUrl: optionalText(1000),
}).passthrough();

const mapEducationSections = sections => (sections || [])
    .filter(section => section.title?.toLowerCase() === 'education')
    .flatMap(section => section.items || [])
    .map(item => ({
        school: item.school || item.institution || '',
        degree: item.degree || '',
        fieldOfStudy: item.major || item.fieldOfStudy || null,
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        description: item.description || null,
    }))
    .filter(item => item.school || item.degree);

const mapNestedExperiences = experiences => (experiences || [])
    .map(item => ({
        title: item.position || item.title || '',
        company: item.company || '',
        description: item.description || null,
        startDate: item.startDate || '',
        endDate: item.endDate || null,
        current: item.current || false,
    }))
    .filter(item => item.title || item.company);

const mapFlatExperiences = payload => {
    if (payload.workExperiences?.length) {
        return payload.workExperiences
            .map(item => ({
                title: item.jobTitle || '',
                company: item.companyName || '',
                description: item.experience || null,
                startDate: item.contributionStart || '',
                endDate: item.contributionEnd || null,
                current: item.isCurrent || false,
                workTime: item.workTime || null,
                workMode: item.workMode || null,
            }))
            .filter(item => item.title || item.company);
    }

    if (payload.jobTitle || payload.companyName || payload.experience) {
        return [{
            title: payload.jobTitle || '',
            company: payload.companyName || '',
            description: payload.experience || null,
            startDate: payload.contributionStart || '',
            endDate: payload.contributionEnd || null,
            current: false,
            workTime: payload.workTime || null,
            workMode: payload.workMode || null,
        }];
    }

    return mapNestedExperiences(payload.experiences);
};

const mapFlatEducation = payload => {
    if (payload.schoolName || payload.major || payload.education) {
        return [{
            school: payload.schoolName || '',
            degree: payload.education || '',
            fieldOfStudy: payload.major || null,
            startDate: payload.educationStart || '',
            endDate: payload.educationEnd || '',
            description: payload.achievement || null,
        }];
    }

    return [];
};

const normalizeSkills = (skills = [], hardSkills = '', softSkills = '') => {
    const fromArray = skills.map(skill => (typeof skill === 'string' ? skill : skill.name)).filter(Boolean);
    return [...new Set([...fromArray, ...splitTextList(hardSkills), ...splitTextList(softSkills)])];
};

const normalizeSkillDetails = (skills = [], hardSkills = '', softSkills = '') => [
    ...skills.map(skill => (typeof skill === 'string' ? { name: skill, type: null } : skill)),
    ...splitTextList(hardSkills).map(name => ({ name, type: 'hard_skill' })),
    ...splitTextList(softSkills).map(name => ({ name, type: 'soft_skill' })),
].filter(skill => skill.name);

const normalizeCompositePayload = payload => {
    const profile = payload.profile || {};
    const cv = payload.cv || {};
    const skillDetails = normalizeSkillDetails(cv.skills || []);
    const customSections = cv.customSections || [];
    const experiences = mapNestedExperiences(cv.experiences);

    return {
        fullName: profile.fullName,
        phone: profile.phone,
        location: profile.location,
        headline: profile.headline || cv.expectedJob,
        bio: profile.bio,
        profileImage: profile.profileImage,
        dob: profile.dob,
        gender: profile.gender,
        disabilityStatus: profile.disabilityStatus,
        deviceIds: cv.deviceIds || [],
        jobType: cv.jobType,
        workMode: cv.workMode,
        mobility: cv.mobility,
        expectedJob: cv.expectedJob,
        conditions: cv.conditions || [],
        certificates: cv.certificates || [],
        customSections,
        skills: normalizeSkills(cv.skills || []),
        skillDetails,
        education: mapEducationSections(customSections),
        experience: experiences,
        cvPayload: {
            ...cv,
            skills: skillDetails,
            experiences,
        },
    };
};

const normalizeFlatPayload = payload => {
    const skillDetails = normalizeSkillDetails(payload.skills || [], payload.hardSkills, payload.softSkills);
    const customSections = payload.customSections || [];
    const experiences = mapFlatExperiences(payload);
    const education = [
        ...mapFlatEducation(payload),
        ...mapEducationSections(customSections),
    ];

    return {
        fullName: payload.fullName,
        phone: payload.phone,
        location: payload.location || payload.address,
        headline: payload.headline || payload.expectedJob || payload.careerGoals,
        bio: payload.bio || payload.supportNeeds,
        profileImage: payload.profileImage || payload.avatarUrl,
        dob: payload.dob || payload.birthday,
        gender: payload.gender,
        disabilityStatus: payload.disabilityStatus,
        deviceIds: payload.deviceIds || payload.availableEquipment || [],
        jobType: payload.jobType || payload.workTime,
        workMode: payload.workMode || payload.workExperiences?.[0]?.workMode,
        mobility: payload.mobility,
        expectedJob: payload.expectedJob || payload.careerGoals,
        conditions: payload.conditions || payload.workConditions || [],
        certificates: splitTextList(payload.certificates || payload.certifications),
        customSections,
        skills: normalizeSkills(payload.skills || [], payload.hardSkills, payload.softSkills),
        skillDetails,
        education,
        experience: experiences,
        cvPayload: {
            ...payload,
            skills: skillDetails,
            experiences,
            education,
        },
    };
};

export const normalizeCvProfilePayload = payload => (
    payload && (payload.profile || payload.cv)
        ? normalizeCompositePayload(payload)
        : normalizeFlatPayload(payload || {})
);

const CvIncomingSchema = z.object({
    profile: z.record(z.any()).optional(),
    cv: z.record(z.any()).optional(),
}).passthrough().superRefine((payload, ctx) => {
    ['password_hash', 'password', 'refreshToken', 'accessToken'].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${key} is not allowed`,
                path: [key],
            });
        }
    });
});

export const CvProfileCreateSchema = CvIncomingSchema
    .transform(normalizeCvProfilePayload);

export const CvProfileUpdateSchema = CvProfileCreateSchema;

export const CvEducationCreateSchema = z.object({
    school: text(255),
    degree: text(255),
    fieldOfStudy: optionalText(255),
    startDate: text(50),
    endDate: text(50),
}).strict();

export const CvEducationUpdateSchema = CvEducationCreateSchema.partial().strict();

export const CvExperienceCreateSchema = z.object({
    title: text(255),
    company: text(255),
    description: optionalText(2000),
    startDate: text(50),
    endDate: optionalText(50),
    current: z.coerce.boolean().optional(),
}).strict();

export const CvExperienceUpdateSchema = CvExperienceCreateSchema.partial().strict();
