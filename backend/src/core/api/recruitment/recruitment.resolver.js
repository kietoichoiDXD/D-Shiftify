import { hasCandidateOrUserRole, hasEmployerRole } from 'core/modules/auth/guard';
import {
    ApplyJobInterceptor,
    CreateJobInterceptor,
    JobFilterInterceptor,
    UpdateJobInterceptor,
    UpdateApplicationStatusInterceptor,
} from 'core/modules/recruitment';
import { Module } from 'packages/handler/Module';
import { CompanyLogoInterceptor } from 'core/modules/document/interceptor';
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
            method: 'get',
            interceptors: [JobFilterInterceptor],
            controller: RecruitmentController.listJobs,
        },
        {
            route: '/jobs/me',
            method: 'get',
            guards: [hasEmployerRole],
            controller: RecruitmentController.getMyJobs,
            preAuthorization: true,
        },
        {
            route: '/jobs/:jobId',
            method: 'get',
            controller: RecruitmentController.getJobById,
        },
        {
            route: '/admin/jobs',
            method: 'get',
            interceptors: [JobFilterInterceptor],
            controller: RecruitmentController.getAdminJobs,
            preAuthorization: true,
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
            route: '/jobs/:jobId/applicants',
            method: 'get',
            guards: [hasEmployerRole],
            controller: RecruitmentController.getApplicants,
            preAuthorization: true,
        },
        {
            route: '/applications/me',
            method: 'get',
            guards: [hasCandidateOrUserRole],
            controller: RecruitmentController.getMyApplications,
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
        {
            route: '/applications/:applicationId/status',
            method: 'patch',
            interceptors: [UpdateApplicationStatusInterceptor],
            guards: [hasEmployerRole],
            controller: RecruitmentController.updateApplicationStatus,
            preAuthorization: true,
        },
    ]);
