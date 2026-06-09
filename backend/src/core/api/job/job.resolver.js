import { hasAdminOrSuperAdminRole, hasEmployerRole } from 'core/modules/auth/guard';
import {
    CreateJobInterceptor,
    JobFilterInterceptor,
    UpdateJobInterceptor,
} from 'core/modules/recruitment';
import { Module } from 'packages/handler/Module';
import { CompanyLogoInterceptor } from 'core/modules/document/interceptor';
import { RecruitmentController } from '../recruitment/recruitment.controller';

export const JobResolver = Module.builder()
    .addPrefix({
        prefixPath: '/v1',
        tag: 'v1-jobs',
        module: 'V1JobModule',
    })
    .register([
        {
            route: '/jobs',
            method: 'get',
            interceptors: [JobFilterInterceptor],
            controller: RecruitmentController.listJobs,
        },
        {
            route: '/jobs/:jobId',
            method: 'get',
            controller: RecruitmentController.getJobById,
        },
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
            route: '/jobs/:jobId',
            method: 'patch',
            interceptors: [UpdateJobInterceptor],
            guards: [hasEmployerRole],
            controller: RecruitmentController.updateJob,
            preAuthorization: true,
        },
        {
            route: '/jobs/:jobId',
            method: 'delete',
            guards: [hasEmployerRole],
            controller: RecruitmentController.deleteJob,
            preAuthorization: true,
        },
        {
            route: '/jobs/:jobId/logo',
            method: 'post',
            consumes: ['multipart/form-data'],
            interceptors: [new CompanyLogoInterceptor()],
            guards: [hasEmployerRole],
            controller: RecruitmentController.uploadCompanyLogo,
            preAuthorization: true,
        },
        {
            route: '/recruiter/jobs',
            method: 'get',
            guards: [hasEmployerRole],
            controller: RecruitmentController.getMyJobs,
            preAuthorization: true,
        },
        {
            route: '/admin/jobs',
            method: 'get',
            interceptors: [JobFilterInterceptor],
            guards: [hasAdminOrSuperAdminRole],
            controller: RecruitmentController.getAdminJobs,
            preAuthorization: true,
        },
    ]);
