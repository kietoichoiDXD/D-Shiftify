import { z } from 'zod';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';

const uuidParamSchema = z.object({
    id: z.string().trim().uuid(),
}).strict();

const sessionParamSchema = z.object({
    id: z.string().trim().min(1).max(255),
}).strict();

const profileParamSchema = z.object({
    profileId: z.string().trim().min(1).max(80),
}).strict();

export const AiChatInterceptor = new ZodValidatorInterceptor(z.object({
    session_id: z.string().trim().min(1).max(255),
    message: z.string().trim().min(1).max(2000),
}).strict(), 'body');

export const AiVoiceInterceptor = new ZodValidatorInterceptor(z.object({
    session_id: z.string().trim().min(1).max(255),
    audio: z.string().trim().min(1),
    encoding: z.string().trim().max(100).optional(),
}).strict(), 'body');

export const AiAuditJdInterceptor = new ZodValidatorInterceptor(z.object({
    jd: z.string().trim().min(20).max(10000),
}).strict(), 'body');

export const AiPostJobInterceptor = new ZodValidatorInterceptor(z.object({
    title: z.string().trim().min(3).max(255),
    description_raw: z.string().trim().min(20).max(10000),
    required_skills: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
    salary_min: z.coerce.number().int().nonnegative().optional(),
    salary_max: z.coerce.number().int().nonnegative().optional(),
    has_insurance: z.coerce.boolean().default(false),
    is_remote: z.coerce.boolean().default(false),
    location_lat: z.coerce.number().min(-90).max(90).optional(),
    location_lng: z.coerce.number().min(-180).max(180).optional(),
    work_environment: z.string().trim().max(255).optional(),
}).strict(), 'body');

export const AiSkillGapParamInterceptor = new ZodValidatorInterceptor(uuidParamSchema, 'params');

export const AiSessionParamInterceptor = new ZodValidatorInterceptor(sessionParamSchema, 'params');

export const AiSkillGapQueryInterceptor = new ZodValidatorInterceptor(z.object({
    score: z.coerce.number().min(0).max(100).default(0),
}).strict(), 'query');

export const AiMatchParamInterceptor = new ZodValidatorInterceptor(profileParamSchema, 'params');

export const AiMatchQueryInterceptor = new ZodValidatorInterceptor(z.object({
    limit: z.coerce.number().int().positive().max(20).default(10),
    minScore: z.coerce.number().int().min(0).max(100).default(0),
    explain: z.coerce.boolean().default(false),
    includeDescription: z.coerce.boolean().default(true),
    priorities: z.string().trim().optional(),
}).strict(), 'query');

export const AiStreamTtsQueryInterceptor = new ZodValidatorInterceptor(z.object({
    text: z.string().trim().min(1).max(1000),
}).strict(), 'query');

export const AiMarketTrendQueryInterceptor = new ZodValidatorInterceptor(z.object({
    industry: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
}).strict(), 'query');
