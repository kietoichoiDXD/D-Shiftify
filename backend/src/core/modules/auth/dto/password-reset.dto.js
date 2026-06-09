import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
    email: z.string().trim().email(),
}).strict();

export const ResetPasswordSchema = z.object({
    token: z.string().trim().min(20),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
}).strict().refine(data => data.password === data.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
});
