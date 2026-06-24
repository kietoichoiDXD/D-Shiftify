import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';
import { JoiUtils } from '../../../utils';

export const CreateMessageSchema =
    Joi.object({
        conversationId: JoiUtils.requiredString(),
        content: Joi.string().trim().min(1),
        voiceUrl: Joi.string().trim().uri(),
    }).or('content', 'voiceUrl').unknown(true);


export const CreateMessageInterceptor = new DefaultValidatorInterceptor(CreateMessageSchema);