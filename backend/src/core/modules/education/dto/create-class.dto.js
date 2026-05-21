import { z } from 'zod';

const ClassStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const CreateClassSchema = z
    .object({
        title: z.string().trim().min(3).max(255),
        description: z.string().trim().min(10).max(5000),
        level: z.string().trim().min(2).max(50),
        category: z.string().trim().min(2).max(100),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        maxStudents: z.coerce.number().int().positive().max(10000),
        thumbnailUrl: z.string().trim().url().max(1000).optional(),
        thumbnailPublicId: z.string().trim().max(255).optional(),
        status: ClassStatus.default('DRAFT'),
    })
    .strict()
    .refine(data => data.endDate > data.startDate, {
        message: 'endDate must be later than startDate',
        path: ['endDate'],
    });

export const CreateClassDto = data => ({
    title: data.title,
    description: data.description,
    level: data.level,
    category: data.category,
    start_date: data.startDate,
    end_date: data.endDate,
    max_students: data.maxStudents,
    thumbnail_url: data.thumbnailUrl || null,
    thumbnail_public_id: data.thumbnailPublicId || null,
    status: data.status,
});
