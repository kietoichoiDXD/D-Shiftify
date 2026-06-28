import { Module } from 'packages/handler/Module';
import { CreateCVInterceptor, UpdateCVInterceptor } from 'core/modules/cv/interceptor';
import { CVController } from './cv.controller';

export const CVsResolver = Module.builder()
    .addPrefix({
        prefixPath: '/cvs',
        tag: 'cvs',
        module: 'CVsModule',
    })
    .register([
        {
            route: '/',
            method: 'post',
            body: 'CreateCVDto',
            interceptors: [CreateCVInterceptor],
            controller: CVController.createForSheet,
            preAuthorization: true,
        },
        {
            route: '/',
            method: 'get',
            controller: CVController.listForSheet,
            preAuthorization: true,
        },
        {
            route: '/:id',
            method: 'get',
            controller: CVController.getByIdForSheet,
            preAuthorization: true,
        },
        {
            route: '/:id',
            method: 'patch',
            body: 'UpdateCVDto',
            interceptors: [UpdateCVInterceptor],
            controller: CVController.updateForSheet,
            preAuthorization: true,
        },
        {
            route: '/:id',
            method: 'delete',
            controller: CVController.deleteForSheet,
            preAuthorization: true,
        },
    ]);
