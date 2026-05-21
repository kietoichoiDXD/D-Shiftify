import { z } from 'zod';
import { ZodValidatorInterceptor } from 'core/infrastructure/interceptor';

export const RefreshTokenInterceptor = new ZodValidatorInterceptor(
    z.object({
        refreshToken: z.string().trim().min(20),
    }).strict(),
);
