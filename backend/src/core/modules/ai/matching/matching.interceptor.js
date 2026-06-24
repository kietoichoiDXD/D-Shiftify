import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';

export const MatchJobsInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        cvId: Joi.string().uuid().required(),
        jobIds: Joi.array().items(Joi.string().uuid()).max(50).default([]),
        priorities: Joi.array().items(Joi.string()).max(8).default([]),
        limit: Joi.number().integer().min(1).max(50).default(20),
    }),
);
