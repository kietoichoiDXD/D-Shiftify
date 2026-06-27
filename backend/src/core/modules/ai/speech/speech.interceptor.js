import Joi from 'joi';
import { DefaultValidatorInterceptor } from 'core/infrastructure/interceptor';

export const TranscribeSpeechInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        audioBase64: Joi.string().required(),
        encoding: Joi.string().valid('WEBM_OPUS', 'OGG_OPUS', 'LINEAR16', 'FLAC', 'MULAW', 'MP3', 'AMR', 'AMR_WB').default('WEBM_OPUS'),
        sampleRateHertz: Joi.number().integer().min(8000).max(48000).optional(),
        languageCode: Joi.string().pattern(/^[a-z]{2,3}-[A-Z]{2}$/).default('vi-VN'),
        model: Joi.string().valid('latest_long', 'latest_short', 'telephony', 'medical_dictation').default('latest_long'),
    }),
);

export const SynthesizeSpeechInterceptor = new DefaultValidatorInterceptor(
    Joi.object({
        text: Joi.string().trim().min(1).max(5000).optional(),
        ssml: Joi.string().trim().min(1).max(5000).optional(),
        languageCode: Joi.string().pattern(/^[a-z]{2,3}-[A-Z]{2}$/).default('vi-VN'),
        voiceName: Joi.string().trim().max(100).allow('').optional(),
        gender: Joi.string().valid('MALE', 'FEMALE', 'NEUTRAL').default('NEUTRAL'),
        speakingRate: Joi.number().min(0.25).max(4).default(1),
        pitch: Joi.number().min(-20).max(20).default(0),
    }).or('text', 'ssml'),
);
