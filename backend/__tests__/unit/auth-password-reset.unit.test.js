import { ForgotPasswordSchema, ResetPasswordSchema } from '../../src/core/modules/auth/dto/password-reset.dto';

describe('Password reset validation', () => {
    it('validates forgot password email payloads', () => {
        expect(ForgotPasswordSchema.parse({ email: 'candidate@example.com' })).toEqual({
            email: 'candidate@example.com',
        });
    });

    it('rejects mismatched reset passwords', () => {
        expect(() => ResetPasswordSchema.parse({
            token: 'reset-token-value-long-enough',
            password: 'new-password',
            confirmPassword: 'different-password',
        })).toThrow();
    });
});
