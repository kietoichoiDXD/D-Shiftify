import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';
import { JoiUtils } from '../../../utils';

export const CreateCVInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        profile: Joi.object({
            fullName: JoiUtils.requiredString(),
            dob: JoiUtils.optionalString(),
            gender: JoiUtils.optionalString(),
            phone: JoiUtils.optionalString(),
            disabilityStatus: JoiUtils.optionalString(),
        }).required(),
        cv: Joi.object({
            deviceIds: Joi.array().items(Joi.string().uuid()).optional(),
            jobType: JoiUtils.optionalString(),
            workMode: JoiUtils.optionalString(),
            mobility: JoiUtils.optionalString(),
            expectedJob: JoiUtils.optionalString(),
            skills: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        type: Joi.string()
                            .valid('hard_skill', 'soft_skill')
                            .required(),
                    })
                )
                .optional(),
            conditions: Joi.array().items(Joi.string()).optional(),
            experiences: Joi.array()
                .items(
                    Joi.object({
                        company: Joi.string().optional(),
                        position: Joi.string().optional(),
                        description: Joi.string().optional(),
                        startDate: Joi.string().optional(),
                        endDate: Joi.string().optional(),
                    })
                )
                .optional(),
            certificates: Joi.array().items(Joi.string()).optional(),
            customSections: Joi.array()
                .items(
                    Joi.object({
                        title: Joi.string().required(),
                        items: Joi.array()
                            .items(Joi.object().unknown(true))
                            .required(),
                    })
                )
                .optional(),
        }).optional(),
    }).unknown(false)
);