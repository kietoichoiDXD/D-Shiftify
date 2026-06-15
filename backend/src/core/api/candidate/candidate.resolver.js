import { Module } from 'packages/handler/Module';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { hasEmployerOrAdminRole } from 'core/modules/auth/guard';
import { z } from 'zod';
import { CandidateController } from './candidate.controller';

const CandidateIdInterceptor = new ZodValidatorInterceptor(z.object({
  candidateId: z.string().trim().uuid(),
}).strict(), 'params');

export const CandidateResolver = Module.builder()
  .addPrefix({ prefixPath: '/candidate', tag: 'Candidate', module: 'CandidateModule' })
  .register([
    { route: '/profile', method: 'get', controller: CandidateController.getProfile, preAuthorization: true },
    { route: '/alerts', method: 'get', controller: CandidateController.getAlerts, preAuthorization: true },
    {
      route: '/:candidateId',
      method: 'get',
      interceptors: [CandidateIdInterceptor],
      guards: [hasEmployerOrAdminRole],
      controller: CandidateController.getDetail,
      preAuthorization: true,
    },
  ]);
