import { Module } from 'packages/handler/Module';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import {
    CvEducationCreateSchema,
    CvEducationUpdateSchema,
    CvExperienceCreateSchema,
    CvExperienceUpdateSchema,
    CvProfileCreateSchema,
    CvProfileUpdateSchema,
} from 'core/modules/candidate/candidate.schema';
import { CvController } from './cv.controller';

const CvProfileCreateInterceptor = new ZodValidatorInterceptor(CvProfileCreateSchema, 'body');
const CvProfileUpdateInterceptor = new ZodValidatorInterceptor(CvProfileUpdateSchema, 'body');
const CvEducationCreateInterceptor = new ZodValidatorInterceptor(CvEducationCreateSchema, 'body');
const CvEducationUpdateInterceptor = new ZodValidatorInterceptor(CvEducationUpdateSchema, 'body');
const CvExperienceCreateInterceptor = new ZodValidatorInterceptor(CvExperienceCreateSchema, 'body');
const CvExperienceUpdateInterceptor = new ZodValidatorInterceptor(CvExperienceUpdateSchema, 'body');

export const CvResolver = Module.builder()
    .addPrefix({
        prefixPath: '/cv',
        tag: 'cv',
        module: 'CvModule',
    })
    .register([
        {
            route: '/me',
            method: 'get',
            controller: CvController.getMine,
            preAuthorization: true,
        },
        {
            route: '/',
            method: 'post',
            interceptors: [CvProfileCreateInterceptor],
            controller: CvController.create,
            preAuthorization: true,
        },
        {
            route: '/me',
            method: 'patch',
            interceptors: [CvProfileUpdateInterceptor],
            controller: CvController.update,
            preAuthorization: true,
        },
        {
            route: '/education',
            method: 'post',
            interceptors: [CvEducationCreateInterceptor],
            controller: CvController.addEducation,
            preAuthorization: true,
        },
        {
            route: '/education/:educationId',
            method: 'patch',
            interceptors: [CvEducationUpdateInterceptor],
            controller: CvController.updateEducation,
            preAuthorization: true,
        },
        {
            route: '/education/:educationId',
            method: 'delete',
            controller: CvController.deleteEducation,
            preAuthorization: true,
        },
        {
            route: '/experience',
            method: 'post',
            interceptors: [CvExperienceCreateInterceptor],
            controller: CvController.addExperience,
            preAuthorization: true,
        },
        {
            route: '/experience/:experienceId',
            method: 'patch',
            interceptors: [CvExperienceUpdateInterceptor],
            controller: CvController.updateExperience,
            preAuthorization: true,
        },
        {
            route: '/experience/:experienceId',
            method: 'delete',
            controller: CvController.deleteExperience,
            preAuthorization: true,
        },
    ]);
