import { z } from 'zod';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';

export const RefreshTokenInterceptor = new ZodValidatorInterceptor(
    z.object({
        refreshToken: z.string().trim().min(20).optional(),
        refresh_token: z.string().trim().min(20).optional(),
    }).refine(data => data.refreshToken || data.refresh_token, {
        message: 'refreshToken or refresh_token is required',
    }).strict(),
);
