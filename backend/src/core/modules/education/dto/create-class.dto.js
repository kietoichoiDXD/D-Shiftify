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

export const UpdateClassSchema = z
    .object({
        title: z.string().trim().min(3).max(255).optional(),
        description: z.string().trim().min(10).max(5000).optional(),
        level: z.string().trim().min(2).max(50).optional(),
        category: z.string().trim().min(2).max(100).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        maxStudents: z.coerce.number().int().positive().max(10000).optional(),
        status: ClassStatus.optional(),
        thumbnailUrl: z.string().trim().url().optional(),
        thumbnailPublicId: z.string().trim().optional(),
    })
    .strict()
    .refine(data => {
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
        }
        return true;
    }, {
        message: 'endDate must be later than startDate',
        path: ['endDate'],
    });

export const UpdateClassDto = data => {
    const dto = {};
    if (data.title !== undefined) dto.title = data.title;
    if (data.description !== undefined) dto.description = data.description;
    if (data.level !== undefined) dto.level = data.level;
    if (data.category !== undefined) dto.category = data.category;
    if (data.startDate !== undefined) dto.start_date = data.startDate;
    if (data.endDate !== undefined) dto.end_date = data.endDate;
    if (data.maxStudents !== undefined) dto.max_students = data.maxStudents;
    if (data.status !== undefined) dto.status = data.status;
    if (data.thumbnailUrl !== undefined) dto.thumbnail_url = data.thumbnailUrl;
    if (data.thumbnailPublicId !== undefined) dto.thumbnail_public_id = data.thumbnailPublicId;
    return dto;
};

export const ClassFilterSchema = z.object({
    status: ClassStatus.optional(),
    level: z.string().trim().optional(),
    category: z.string().trim().optional(),
    createdBy: z.string().trim().uuid().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
}).strict();
