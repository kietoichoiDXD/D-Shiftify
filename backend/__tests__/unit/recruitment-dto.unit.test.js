import {
    CreateJobDto,
    CreateJobSchema,
    UpdateJobDto,
    UpdateJobSchema,
} from '../../src/core/modules/recruitment/dto';

describe('Recruitment DTOs', () => {
    it('validates and maps create job payloads for production API contract', () => {
        const payload = CreateJobSchema.parse({
            title: 'Accessible React Developer',
            description: 'Build accessible web experiences for candidates and employers.',
            requiredSkills: ['React', 'WCAG'],
            salaryMin: 1000,
            salaryMax: 2000,
            hasInsurance: true,
            isRemote: true,
            status: 'open',
        });

        expect(CreateJobDto(payload, 'user-1')).toMatchObject({
            employer_user_id: 'user-1',
            title: 'Accessible React Developer',
            description_raw: payload.description,
            required_skills: ['React', 'WCAG'],
            salary_min: 1000,
            salary_max: 2000,
            has_insurance: true,
            is_remote: true,
            accessibility_level: 'AA',
            status: 'open',
        });
    });

    it('rejects invalid salary ranges', () => {
        expect(() => CreateJobSchema.parse({
            title: 'Bad Salary',
            description: 'This description is long enough to pass validation.',
            salaryMin: 3000,
            salaryMax: 1000,
        })).toThrow();
    });

    it('maps partial update payloads without overwriting absent fields', () => {
        const payload = UpdateJobSchema.parse({
            title: 'Updated title',
            isRemote: false,
        });

        expect(UpdateJobDto(payload)).toEqual({
            title: 'Updated title',
            is_remote: false,
        });
    });
});
