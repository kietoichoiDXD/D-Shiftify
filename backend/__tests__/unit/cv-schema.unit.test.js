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

    it('rejects unknown CV profile fields', () => {
        expect(() => CvProfileUpdateSchema.parse({
            fullName: 'Nguyen Van A',
            password_hash: 'should-not-pass',
        })).toThrow();
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
