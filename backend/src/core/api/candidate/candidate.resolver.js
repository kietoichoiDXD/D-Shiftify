import { Module } from 'packages/handler/Module';
import { CandidateController } from './candidate.controller';

export const CandidateResolver = Module.builder()
  .addPrefix({ prefixPath: '/candidate', tag: 'Candidate', module: 'CandidateModule' })
  .register([
    { route: '/profile', method: 'get', controller: CandidateController.getProfile, preAuthorization: true },
    { route: '/alerts', method: 'get', controller: CandidateController.getAlerts, preAuthorization: true },
  ]);
