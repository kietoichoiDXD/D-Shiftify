import { Module } from 'packages/handler/Module';
import { AiController } from './ai.controller';

export const AiResolver = Module.builder()
  .addPrefix({ prefixPath: '/ai', tag: 'AI', module: 'AiModule' })
  .register([
    { route: '/chat',              method: 'post',   controller: AiController.chat,          preAuthorization: false },
    { route: '/voice',             method: 'post',   controller: AiController.voice,         preAuthorization: false },
    { route: '/audit-jd',          method: 'post',   controller: AiController.auditJD,       preAuthorization: false },
    { route: '/jobs',              method: 'post',   controller: AiController.postJob,       preAuthorization: false },
    { route: '/jobs/:id/skill-gap',method: 'get',    controller: AiController.skillGap,      preAuthorization: false },
    { route: '/market-trends',     method: 'get',    controller: AiController.marketTrends,  preAuthorization: false },
    { route: '/session/:id',       method: 'delete', controller: AiController.clearSession,  preAuthorization: false },
  ]);
