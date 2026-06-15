import { z } from 'zod';
import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('CreateJobDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Senior Frontend Developer' }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'We are looking for an experienced React developer...' }),
    requiredSkills: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'React' }),
    salaryMin: SwaggerDocument.ApiProperty({ type: 'int', required: false, example: 1500 }),
    salaryMax: SwaggerDocument.ApiProperty({ type: 'int', required: false, example: 3000 }),
    hasInsurance: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    isRemote: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    locationLat: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: '10.7769' }),
    locationLng: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: '106.7009' }),
    workEnvironment: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: 'Office, Hybrid' }),
    status: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: 'open' }),
});

ApiDocument.addModel('ApplyJobDto', {
    job_id: SwaggerDocument.ApiProperty({ type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }),
});

const JobPayloadSchema = z.object({
    title: z.string().trim().min(3).max(255),
    description: z.string().trim().min(20).max(10000),
    requiredSkills: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    hasInsurance: z.coerce.boolean().default(false),
    isRemote: z.coerce.boolean().default(false),
    locationLat: z.coerce.number().min(-90).max(90).optional(),
    locationLng: z.coerce.number().min(-180).max(180).optional(),
    workEnvironment: z.string().trim().max(255).optional(),
    status: z.enum(['open', 'paused', 'closed']).optional(),
}).strict();

const JobUpdatePayloadSchema = z.object({
    title: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().min(20).max(10000).optional(),
    requiredSkills: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    hasInsurance: z.coerce.boolean().optional(),
    isRemote: z.coerce.boolean().optional(),
    locationLat: z.coerce.number().min(-90).max(90).optional(),
    locationLng: z.coerce.number().min(-180).max(180).optional(),
    workEnvironment: z.string().trim().max(255).optional(),
    status: z.enum(['open', 'paused', 'closed']).optional(),
}).strict();

export const CreateJobSchema = JobPayloadSchema.refine(data => {
    if (data.salaryMin === undefined || data.salaryMax === undefined) return true;
    return data.salaryMax >= data.salaryMin;
}, {
    message: 'salaryMax must be greater than or equal to salaryMin',
    path: ['salaryMax'],
});

export const CreateJobDto = (body, employerUserId) => ({
    employer_user_id: employerUserId,
    title: body.title,
    description_raw: body.description,
    required_skills: body.requiredSkills,
    salary_min: body.salaryMin ?? null,
    salary_max: body.salaryMax ?? null,
    has_insurance: body.hasInsurance,
    is_remote: body.isRemote,
    location_lat: body.locationLat ?? null,
    location_lng: body.locationLng ?? null,
    work_environment: body.workEnvironment ?? null,
    accessibility_level: 'AA',
    status: body.status ?? 'open',
});

export const UpdateJobSchema = JobUpdatePayloadSchema.refine(data => {
    if (data.salaryMin === undefined || data.salaryMax === undefined) return true;
    return data.salaryMax >= data.salaryMin;
}, {
    message: 'salaryMax must be greater than or equal to salaryMin',
    path: ['salaryMax'],
});

export const UpdateJobDto = body => {
    const data = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description_raw = body.description;
    if (body.requiredSkills !== undefined) data.required_skills = body.requiredSkills;
    if (body.salaryMin !== undefined) data.salary_min = body.salaryMin;
    if (body.salaryMax !== undefined) data.salary_max = body.salaryMax;
    if (body.hasInsurance !== undefined) data.has_insurance = body.hasInsurance;
    if (body.isRemote !== undefined) data.is_remote = body.isRemote;
    if (body.locationLat !== undefined) data.location_lat = body.locationLat;
    if (body.locationLng !== undefined) data.location_lng = body.locationLng;
    if (body.workEnvironment !== undefined) data.work_environment = body.workEnvironment;
    if (body.status !== undefined) data.status = body.status;
    return data;
};

export const ApplyJobSchema = z.object({
    job_id: z.string().trim().uuid(),
}).strict();

export const ApplyJobDto = (body, candidateId) => ({
    job_id: body.job_id,
    candidate_id: candidateId,
});

export const JobFilterSchema = z.object({
    keyword: z.string().trim().max(200).optional(),
    status: z.enum(['open', 'paused', 'closed']).optional(),
    isRemote: z.preprocess(v => {
        if (v === 'true') return true;
        if (v === 'false') return false;
        return v;
    }, z.boolean().optional()),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    skills: z.preprocess(v => {
        if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
        if (Array.isArray(v)) return v;
        return undefined;
    }, z.array(z.string()).optional()),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
}).strict();

export const APPLICATION_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'];

export const UpdateApplicationStatusSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
}).strict();
