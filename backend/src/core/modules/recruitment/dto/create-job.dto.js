import { z } from 'zod';
import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('CreateJobDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string' }),
    description: SwaggerDocument.ApiProperty({ type: 'string' }),
    requiredSkills: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false }),
    salaryMin: SwaggerDocument.ApiProperty({ type: 'int', required: false }),
    salaryMax: SwaggerDocument.ApiProperty({ type: 'int', required: false }),
    hasInsurance: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    isRemote: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    locationLat: SwaggerDocument.ApiProperty({ type: 'int', required: false }),
    locationLng: SwaggerDocument.ApiProperty({ type: 'int', required: false }),
    workEnvironment: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
});

export const CreateJobSchema = z.object({
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
}).strict().refine(data => {
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
});
