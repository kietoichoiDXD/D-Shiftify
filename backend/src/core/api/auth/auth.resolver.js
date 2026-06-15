import { LoginInterceptor, RefreshTokenInterceptor } from 'core/modules/auth';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';
import { ForgotPasswordSchema, ResetPasswordSchema } from 'core/modules/auth/dto/password-reset.dto';
import { CreateUserInterceptor } from 'core/modules/user/interceptor';
import { Module } from 'packages/handler/Module';
// Register Auth Swagger models for forgot/reset password (side-effect import)
import 'core/common/swagger/auth.swagger';
import { AuthController } from './auth.controller';

const ForgotPasswordInterceptor = new ZodValidatorInterceptor(ForgotPasswordSchema, 'body');
const ResetPasswordInterceptor = new ZodValidatorInterceptor(ResetPasswordSchema, 'body');

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
            route: '/login',
            method: 'post',
            interceptors: [LoginInterceptor],
            body: 'LoginDto',
            controller: AuthController.login,
        },
        {
            route: '/register',
            method: 'post',
            interceptors: [CreateUserInterceptor],
            body: 'CreateUserDto',
            controller: AuthController.register,
        },
        {
            route: '/refresh-token',
            method: 'post',
            interceptors: [RefreshTokenInterceptor],
            body: 'RefreshTokenDto',
            controller: AuthController.refreshToken,
        },
        {
            route: '/refresh',
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
        {
            route: '/forgot-password',
            method: 'post',
            interceptors: [ForgotPasswordInterceptor],
            body: 'ForgotPasswordDto',
            controller: AuthController.forgotPassword,
        },
        {
            route: '/reset-password',
            method: 'post',
            interceptors: [ResetPasswordInterceptor],
            body: 'ResetPasswordDto',
            controller: AuthController.resetPassword,
        },
    ]);
