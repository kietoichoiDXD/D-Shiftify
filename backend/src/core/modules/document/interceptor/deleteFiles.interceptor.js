import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';
import { JoiUtils } from 'core/utils';

export const deleteMediasInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        ids: Joi.array()
            .items(Joi.string().trim().pattern(/^[a-zA-Z0-9_/-]+$/).max(255))
            .min(1)
            .max(20)
            .required(),
    })
);
