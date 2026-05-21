import { uploadClassThumbnailSwagger } from 'core/common/swagger';
import { hasEmployerOrAdminRole } from 'core/modules/auth/guard';
import { ClassThumbnailInterceptor, CreateClassInterceptor } from 'core/modules/education';
import { Module } from 'packages/handler/Module';
import { EducationController } from './education.controller';

export const EducationResolver = Module.builder()
    .addPrefix({
        prefixPath: '/education/classes',
        tag: 'education-classes',
        module: 'EducationClassModule',
    })
    .register([
        {
            route: '/',
            method: 'post',
            interceptors: [CreateClassInterceptor],
            guards: [hasEmployerOrAdminRole],
            body: 'CreateClassDto',
            controller: EducationController.createClass,
            preAuthorization: true,
        },
        {
            route: '/thumbnail',
            method: 'post',
            params: [uploadClassThumbnailSwagger],
            consumes: ['multipart/form-data'],
            interceptors: [new ClassThumbnailInterceptor()],
            guards: [hasEmployerOrAdminRole],
            controller: EducationController.uploadThumbnail,
            preAuthorization: true,
        },
    ]);
