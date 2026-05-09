import { Module } from 'packages/handler/Module';
import { CandidateController } from './candidate.controller';

export const CandidateResolver = Module.builder()
  .addPrefix({ prefixPath: '/candidate', tag: 'Candidate', module: 'CandidateModule' })
  .register([
    { route: '/profile', method: 'get', controller: CandidateController.getProfile, preAuthorization: false },
  ]);
