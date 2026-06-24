import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';

export const UpsertCompanyInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        name: Joi.string().trim().min(2).max(255).required(),
        slogan: Joi.string().allow('').max(255).optional(),
        phone: Joi.string().allow('').max(30).optional(),
        email: Joi.string().email().required(),
        website: Joi.string().allow('').max(255).optional(),
        industry: Joi.string().allow('').max(255).optional(),
        taxCode: Joi.string().allow('').max(100).optional(),
        address: Joi.string().allow('').max(500).optional(),
        policyForDisabled: Joi.string().allow('').max(5000).optional(),
        experienceWithDisabled: Joi.string().allow('').max(5000).optional(),
        licenseFile: Joi.string().allow('').max(1000).optional(),
        logoUrl: Joi.string().allow('').max(1000).optional(),
    }).unknown(false),
);
