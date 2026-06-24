import { Module } from 'packages/handler/Module';
import { hashRole } from 'core/modules/auth/guard';
import { CreateCVInterceptor, UpdateCVInterceptor } from 'core/modules/cv/interceptor';
import { CVController } from './cv.controller';

export const CVResolver = Module.builder()
    .addPrefix({
        prefixPath: '/cv',
        tag: 'cv',
        module: 'CVModule',
    })
    .register([
        {
            route: '/me',
            method: 'get',
            controller: CVController.findCurrent,
            preAuthorization: true,
        },
        {
            route: '/disability-options',
            method: 'get',
            controller: CVController.getDisabilityOptions,
            preAuthorization: true,
        },
        {
            route: '/preview',
            method: 'post',
            controller: CVController.preview,
            preAuthorization: true,
        },
        {
            route: '/',
            method: 'post',
            body: 'CreateCVDto',
            // guards: [hashRole],
            interceptors: [CreateCVInterceptor],
            controller: CVController.createOne,
            preAuthorization: true,
        },
        {
            route: '/:id',
            method: 'get',
            controller: CVController.findById,
            preAuthorization: true,
        },
        {
            route: '/:id',
            method: 'put',
            body: 'UpdateCVDto',
            interceptors: [UpdateCVInterceptor],
            controller: CVController.updateCV,
            preAuthorization: true,
        },
    ]);
