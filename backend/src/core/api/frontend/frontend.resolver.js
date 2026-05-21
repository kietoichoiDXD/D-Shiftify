import { Module } from 'packages/handler/Module';
import { FrontendController } from './frontend.controller';

export const FrontendResolver = Module.builder()
    .addPrefix({
        prefixPath: '/frontend',
        tag: 'frontend',
        module: 'FrontendModule',
    })
    .register([
        {
            route: '/status',
            method: 'get',
            controller: FrontendController.status,
            preAuthorization: false,
        },
    ]);
