import { LoginInterceptor, RefreshTokenInterceptor } from 'core/modules/auth';
import { Module } from 'packages/handler/Module';
import { AuthController } from './auth.controller';

export const AuthResolver = Module.builder()
    .addPrefix({
        prefixPath: '/auth',
        tag: 'auth',
        module: 'AuthModule'
    })
    .register([
        {
            route: '/',
            method: 'post',
            interceptors: [LoginInterceptor],
            body: 'LoginDto',
            controller: AuthController.login,
        },
        {
            route: '/refresh-token',
            method: 'post',
            interceptors: [RefreshTokenInterceptor],
            body: 'RefreshTokenDto',
            controller: AuthController.refreshToken,
        },
        {
            route: '/logout',
            method: 'post',
            controller: AuthController.logout,
            preAuthorization: true,
        },
    ]);
