import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';
import { JoiUtils } from '../../../utils';

export const CreateApplicationInterceptor = new DefaultValidatorInterceptor(
        Joi.object({
            jobId: Joi.string().optional(),
            cvId: Joi.string().optional(),
            job_id: Joi.string().optional(),
            cv_id: Joi.string().optional(),
        })
            .or('jobId', 'job_id')
            .or('cvId', 'cv_id')
            .unknown(true)
    );
