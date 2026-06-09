import { z } from 'zod';

const text = (max = 255) => z.string().trim().min(1).max(max);
const optionalText = (max = 255) => z.string().trim().max(max).optional();

export const CvProfileCreateSchema = z.object({
    fullName: optionalText(255),
    phone: optionalText(30),
    location: optionalText(255),
    headline: optionalText(255),
    bio: optionalText(2000),
    profileImage: optionalText(500),
    skills: z.array(text(80)).max(100).optional(),
}).strict();

export const CvProfileUpdateSchema = CvProfileCreateSchema.partial().strict();

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
