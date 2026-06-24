import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('UpdateCVDto', {
    profile: SwaggerDocument.ApiProperty({ type: 'object', required: true, properties: {
        fullName: { type: 'string' },
        dob: { type: 'string' },
        gender: { type: 'string' },
        phone: { type: 'string' },
        disabilityStatus: { type: 'string' },
    }}),
    cv: SwaggerDocument.ApiProperty({ type: 'object', properties: {
        deviceIds: SwaggerDocument.ApiProperty({ type: 'array', required: false, items: { type: 'string' } }),
        jobType: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
        workMode: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
        mobility: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
        expectedJob: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
        skills: SwaggerDocument.ApiProperty({
            type: 'array',
            required: false,
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['hard_skill', 'soft_skill'] },
                },
            },
        }),
        conditions: SwaggerDocument.ApiProperty({ type: 'array', required: false, items: { type: 'string' } }),
        experiences: SwaggerDocument.ApiProperty({
            type: 'array',
            required: false,
            items: {
                type: 'object',
                properties: {
                    description: { type: 'string' },
                    company: { type: 'string' },
                    position: { type: 'string' },
                    startDate: { type: 'string' },
                    endDate: { type: 'string' },
                },
            },
        }),
        certificates: SwaggerDocument.ApiProperty({ type: 'array', required: false, items: { type: 'string' } }),
        customSections: SwaggerDocument.ApiProperty({
            type: 'array',
            required: false,
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    items: { type: 'array', items: { type: 'object', additionalProperties: true } },
                },
            },
        }),

    }}),
});
export const UpdateCVDto = body => ({
 profile_id: body.profileId,
    job_type: body.cv?.jobType || null,
    work_mode: body.cv?.workMode || null,
    mobility: body.cv?.mobility || null,
    expected_job: body.cv?.expectedJob || null,
    skills: body.cv?.skills ? JSON.stringify(body.cv.skills) : null,
    conditions: body.cv?.conditions ? JSON.stringify(body.cv.conditions) : null,
    experiences: body.cv?.experiences ? JSON.stringify(body.cv.experiences) : null,
    certificates: body.cv?.certificates ? JSON.stringify(body.cv.certificates) : null,
    custom_sections: body.cv?.customSections ? JSON.stringify(body.cv.customSections) : null,
});