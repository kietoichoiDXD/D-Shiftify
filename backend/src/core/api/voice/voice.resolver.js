import { Module } from 'packages/handler/Module';
import { VoiceController } from './voice.controller';

export const VoiceResolver = Module.builder()
    .addPrefix({
        prefixPath: '/voice',
        tag: 'voice',
        module: 'VoiceModule',
    })
    .register([
        {
            route: '/stt/batch',
            method: 'post',
            controller: VoiceController.sttBatch,
            preAuthorization: true,
        },
        {
            route: '/stt',
            method: 'post',
            controller: VoiceController.stt,
            preAuthorization: true,
        },
        {
            route: '/tts/previewer',
            method: 'post',
            controller: VoiceController.ttsPreview,
            preAuthorization: true,
        },
        {
            route: '/tts',
            method: 'post',
            controller: VoiceController.tts,
            preAuthorization: true,
        },
        {
            route: '/logs/summary',
            method: 'get',
            controller: VoiceController.summary,
            preAuthorization: true,
        },
        {
            route: '/logs/:id/retry',
            method: 'post',
            controller: VoiceController.retry,
            preAuthorization: true,
        },
        {
            route: '/logs/:voice_log_id/status',
            method: 'patch',
            controller: VoiceController.updateStatus,
            preAuthorization: true,
        },
        {
            route: '/logs',
            method: 'post',
            controller: VoiceController.createLog,
            preAuthorization: true,
        },
        {
            route: '/logs',
            method: 'get',
            controller: VoiceController.listLogs,
            preAuthorization: true,
        },
        {
            route: '/logs/:voice_log_id',
            method: 'get',
            controller: VoiceController.getLog,
            preAuthorization: true,
        },
        {
            route: '/logs/:voice_log_id',
            method: 'delete',
            controller: VoiceController.deleteLog,
            preAuthorization: true,
        },
    ]);
