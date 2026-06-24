import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';

export const UpsertTrainingCenterInterceptor = new DefaultValidatorInterceptor(Joi.object({
    name: Joi.string().trim().min(2).max(255).required(),
    slogan: Joi.string().allow('').max(255).optional(),
    phone: Joi.string().allow('').max(30).optional(),
    email: Joi.string().email().required(),
    website: Joi.string().allow('').max(255).optional(),
    address: Joi.string().allow('').max(500).optional(),
    organizationType: Joi.string().allow('').max(100).optional(),
    supportForDisabled: Joi.string().allow('').max(5000).optional(),
    partnerCompanies: Joi.string().allow('').max(5000).optional(),
    achievements: Joi.string().allow('').max(5000).optional(),
}).unknown(false));

export const CreateCourseInterceptor = new DefaultValidatorInterceptor(Joi.object({
    title: Joi.string().trim().min(2).max(255).required(),
    durationType: Joi.string().valid('short_term', 'medium_term', 'long_term').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    mode: Joi.string().valid('online', 'offline', 'hybrid').required(),
    certificateOutput: Joi.string().allow('').max(1000).optional(),
    description: Joi.string().trim().min(10).max(10000).required(),
}).unknown(false));
