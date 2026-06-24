import { Module } from 'packages/handler/Module';
import { MatchJobsInterceptor } from 'core/modules/ai/matching/matching.interceptor';
import 'core/modules/ai/matching/matching.dto';
import { MatchingController } from './matching.controller';

export const MatchingResolver = Module.builder()
    .addPrefix({
        prefixPath: '/ai/matching',
        tag: 'ai-matching',
        module: 'AiMatchingModule',
    })
    .register([
        {
            route: '/criteria',
            method: 'get',
            description: 'Get matching criteria v2 and default weights',
            controller: MatchingController.getCriteria,
        },
        {
            route: '/jobs',
            method: 'post',
            body: 'MatchJobsDto',
            description: 'Match one owned CV against up to 50 jobs without per-job LLM calls',
            interceptors: [MatchJobsInterceptor],
            preAuthorization: true,
            controller: MatchingController.matchJobs,
        },
    ]);
