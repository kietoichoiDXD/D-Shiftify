import { Module } from 'packages/handler/Module';
import {
    SynthesizeSpeechInterceptor,
    TranscribeSpeechInterceptor,
} from 'core/modules/ai/speech/speech.interceptor';
import 'core/modules/ai/speech/speech.dto';
import { SpeechController } from './speech.controller';

export const SpeechResolver = Module.builder()
    .addPrefix({
        prefixPath: '/ai/speech',
        tag: 'ai-speech',
        module: 'AiSpeechModule',
    })
    .register([
        {
            route: '/transcribe',
            method: 'post',
            body: 'TranscribeSpeechDto',
            description: 'Transcribe short audio with Google Cloud Speech-to-Text',
            interceptors: [TranscribeSpeechInterceptor],
            preAuthorization: true,
            controller: SpeechController.transcribe,
        },
        {
            route: '/synthesize',
            method: 'post',
            body: 'SynthesizeSpeechDto',
            description: 'Create Vietnamese MP3 audio with Google Cloud Text-to-Speech',
            interceptors: [SynthesizeSpeechInterceptor],
            preAuthorization: true,
            controller: SpeechController.synthesize,
        },
    ]);
