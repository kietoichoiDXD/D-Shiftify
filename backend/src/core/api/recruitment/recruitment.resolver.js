import { hasCandidateOrUserRole, hasEmployerRole } from 'core/modules/auth/guard';
import { ApplyJobInterceptor, CreateJobInterceptor } from 'core/modules/recruitment';
import { Module } from 'packages/handler/Module';
import { RecruitmentController } from './recruitment.controller';

export const RecruitmentResolver = Module.builder()
    .addPrefix({
        prefixPath: '/recruitment',
        tag: 'recruitment',
        module: 'RecruitmentModule',
    })
    .register([
        {
            route: '/jobs',
            method: 'post',
            interceptors: [CreateJobInterceptor],
            guards: [hasEmployerRole],
            body: 'CreateJobDto',
            controller: RecruitmentController.createJob,
            preAuthorization: true,
        },
        {
            route: '/applications',
            method: 'post',
            interceptors: [ApplyJobInterceptor],
            guards: [hasCandidateOrUserRole],
            body: 'ApplyJobDto',
            controller: RecruitmentController.applyForJob,
            preAuthorization: true,
        },
    ]);
