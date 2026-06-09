import { Module } from 'packages/handler/Module';
import { hasEmployerRole } from 'core/modules/auth/guard';
import {
  AiAuditJdInterceptor,
  AiChatInterceptor,
  AiMarketTrendQueryInterceptor,
  AiMatchParamInterceptor,
  AiMatchQueryInterceptor,
  AiPostJobInterceptor,
  AiSessionParamInterceptor,
  AiSkillGapParamInterceptor,
  AiSkillGapQueryInterceptor,
  AiStreamTtsQueryInterceptor,
  AiVoiceInterceptor,
} from 'core/modules/ai/interceptor/ai.interceptor';
import { AiController } from './ai.controller';

export const AiResolver = Module.builder()
  .addPrefix({ prefixPath: '/ai', tag: 'AI', module: 'AiModule' })
  .register([
    { route: '/chat',               method: 'post',   interceptors: [AiChatInterceptor], controller: AiController.chat, preAuthorization: true },
    { route: '/voice',              method: 'post',   interceptors: [AiVoiceInterceptor], controller: AiController.voice, preAuthorization: true },
    { route: '/voice/stream',       method: 'get',    interceptors: [AiStreamTtsQueryInterceptor], controller: AiController.streamTts, preAuthorization: true },
    { route: '/audit-jd',           method: 'post',   interceptors: [AiAuditJdInterceptor], guards: [hasEmployerRole], controller: AiController.auditJD, preAuthorization: true },
    { route: '/jobs',               method: 'post',   interceptors: [AiPostJobInterceptor], guards: [hasEmployerRole], controller: AiController.postJob, preAuthorization: true },
    { route: '/jobs/:id/skill-gap', method: 'get',    interceptors: [AiSkillGapParamInterceptor, AiSkillGapQueryInterceptor], controller: AiController.skillGap, preAuthorization: true },
    { route: '/match/:profileId',    method: 'get',    interceptors: [AiMatchParamInterceptor, AiMatchQueryInterceptor], controller: AiController.matchJobs, preAuthorization: true },
    { route: '/market-trends',      method: 'get',    interceptors: [AiMarketTrendQueryInterceptor], controller: AiController.marketTrends, preAuthorization: true },
    { route: '/session/:id',        method: 'delete', interceptors: [AiSessionParamInterceptor], controller: AiController.clearSession, preAuthorization: true },
  ]);
