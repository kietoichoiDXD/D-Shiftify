import { Module } from 'packages/handler/Module';
import { MatchesController } from './matches.controller';

export const MatchesResolver = Module.builder()
    .addPrefix({
        prefixPath: '/matches',
        tag: 'matches',
        module: 'MatchesModule',
    })
    .register([
        {
            route: '/jobs',
            method: 'get',
            controller: MatchesController.suggestedJobs,
            preAuthorization: true,
        },
        {
            route: '/candidates/:job_id',
            method: 'get',
            controller: MatchesController.suggestedCandidates,
            preAuthorization: true,
        },
    ]);
