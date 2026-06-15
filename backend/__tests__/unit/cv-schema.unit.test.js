import {
    CvEducationCreateSchema,
    CvExperienceCreateSchema,
    CvProfileCreateSchema,
    CvProfileUpdateSchema,
} from '../../src/core/modules/candidate/candidate.schema';

describe('CV validation schemas', () => {
    it('accepts frontend-compatible CV profile payloads', () => {
        const payload = CvProfileCreateSchema.parse({
            fullName: 'Nguyen Van A',
            phone: '0900000000',
            location: 'Da Nang',
            headline: 'Accessible frontend developer',
            bio: 'Looking for inclusive workplaces.',
            skills: ['React', 'WCAG'],
        });

        expect(payload.skills).toEqual(['React', 'WCAG']);
    });

    it('accepts nested profile and CV payloads', () => {
        const payload = CvProfileCreateSchema.parse({
            profile: {
                fullName: 'Nguyen Anh Thu',
                dob: '2002-01-15',
                gender: 'male',
                phone: '0905123456',
                disabilityStatus: 'none',
            },
            cv: {
                deviceIds: [
                    '10db43b7-0603-4fb1-96a8-1dc2e0ce4ed6',
                    'a86ec0d4-72c1-4ae5-9a73-8cd5dd5423ff',
                ],
                jobType: 'full_time',
                workMode: 'remote',
                mobility: 'can_relocate',
                expectedJob: 'Backend Developer',
                skills: [
                    { name: 'NodeJS', type: 'hard_skill' },
                    { name: 'PostgreSQL', type: 'hard_skill' },
                    { name: 'Communication', type: 'soft_skill' },
                ],
                conditions: ['health_insurance', 'flexible_working_hours'],
                experiences: [{
                    company: 'ABC Software',
                    position: 'Backend Intern',
                    description: 'Developed REST APIs using ExpressJS and PostgreSQL',
                    startDate: '2024-01-01',
                    endDate: '2024-06-30',
                }],
                certificates: ['TOEIC 650', 'AWS Cloud Practitioner'],
                customSections: [{
                    title: 'education',
                    items: [{
                        school: 'Duy Tan University',
                        major: 'Software Engineering',
                        degree: 'Bachelor',
                        startDate: '2021-09',
                        endDate: '2025-06',
                        description: 'GPA 3.4',
                    }],
                }],
            },
        });

        expect(payload.fullName).toBe('Nguyen Anh Thu');
        expect(payload.dob).toBe('2002-01-15');
        expect(payload.deviceIds).toHaveLength(2);
        expect(payload.skills).toEqual(['NodeJS', 'PostgreSQL', 'Communication']);
        expect(payload.education[0].school).toBe('Duy Tan University');
        expect(payload.experience[0].title).toBe('Backend Intern');
        expect(payload.cvPayload.expectedJob).toBe('Backend Developer');
    });

    it('rejects unknown CV profile fields', () => {
        expect(() => CvProfileUpdateSchema.parse({
            fullName: 'Nguyen Van A',
            password_hash: 'should-not-pass',
        })).toThrow();
    });

    it('preserves undefined/absent fields in nested partial updates', () => {
        const payload = CvProfileUpdateSchema.parse({
            profile: {
                fullName: 'Nguyen Anh Thu',
            }
        });

        expect(payload.fullName).toBe('Nguyen Anh Thu');
        expect(payload.deviceIds).toBeUndefined();
        expect(payload.skills).toBeUndefined();
        expect(payload.experience).toBeUndefined();
        expect(payload.education).toBeUndefined();
    });

    it('requires education and experience minimum fields', () => {
        expect(() => CvEducationCreateSchema.parse({
            school: 'DUT',
            degree: 'Computer Science',
            startDate: '2022',
            endDate: '2026',
        })).not.toThrow();

        expect(() => CvExperienceCreateSchema.parse({
            title: 'Developer',
            company: 'Shiftify',
            startDate: '2025',
        })).not.toThrow();
    });
});
