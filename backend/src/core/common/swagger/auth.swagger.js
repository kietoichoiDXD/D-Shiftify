/**
 * Auth Module — Swagger model registrations for endpoints that have no DTO file.
 */
import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('ForgotPasswordDto', {
    email: SwaggerDocument.ApiProperty({ type: 'string', example: 'user@example.com', required: true }),
});

ApiDocument.addModel('ResetPasswordDto', {
    token: SwaggerDocument.ApiProperty({ type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', required: true }),
    password: SwaggerDocument.ApiProperty({ type: 'string', example: 'NewPass@2026', required: true }),
    confirmPassword: SwaggerDocument.ApiProperty({ type: 'string', example: 'NewPass@2026', required: true }),
});
