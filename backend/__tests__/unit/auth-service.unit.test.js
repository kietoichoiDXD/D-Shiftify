// Unit tests for the auth service layer: login, refresh (cookie + body fallback paths
// both resolve to the same service.refresh call), and logout access-token revocation wiring.
// Repositories, DB, jwt, bcrypt, and the revocation service are mocked per the __tests__/unit/
// conventions so no real Postgres/Redis is required.

jest.mock('core/database', () => ({
    __esModule: true,
    default: {},
    getTransaction: jest.fn(),
}));

jest.mock('../../src/core/modules/user/repository/user.repository', () => ({
    UserRepository: {
        findByEmail: jest.fn(),
        findById: jest.fn(),
    },
}));

jest.mock('../../src/core/modules/auth/repository/refresh-token.repository', () => ({
    RefreshTokenRepository: {
        findValidToken: jest.fn(),
        revokeToken: jest.fn(),
        createToken: jest.fn(),
    },
}));

jest.mock('../../src/core/modules/auth/repository/password-reset-token.repository', () => ({
    PasswordResetTokenRepository: {},
}));

jest.mock('../../src/core/modules/auth/service/bcrypt.service', () => ({
    BcryptService: { compare: jest.fn(), hash: jest.fn() },
}));

jest.mock('../../src/core/modules/auth/service/jwt.service', () => ({
    JwtService: { sign: jest.fn() },
}));

jest.mock('../../src/core/modules/auth/service/token-revocation.service', () => ({
    TokenRevocationService: { revoke: jest.fn(), isRevoked: jest.fn() },
}));

import { AuthService } from '../../src/core/modules/auth/service/auth.service';
import { getTransaction } from 'core/database';
import { UserRepository } from '../../src/core/modules/user/repository/user.repository';
import { RefreshTokenRepository } from '../../src/core/modules/auth/repository/refresh-token.repository';
import { BcryptService } from '../../src/core/modules/auth/service/bcrypt.service';
import { JwtService } from '../../src/core/modules/auth/service/jwt.service';
import { TokenRevocationService } from '../../src/core/modules/auth/service/token-revocation.service';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('returns camelCase tokens + user on the happy path', async () => {
            UserRepository.findByEmail.mockResolvedValue({
                id: 'u1',
                email: 'candidate@example.com',
                role: 'candidate',
                fullName: 'Candidate One',
                password_hash: 'hashed',
            });
            BcryptService.compare.mockReturnValue(true);
            RefreshTokenRepository.createToken.mockResolvedValue([{ id: 'ref1', token: 'refresh-1' }]);
            JwtService.sign.mockReturnValue('access-1');

            const result = await AuthService.login({ email: 'candidate@example.com', password: 'pw' });

            expect(result.accessToken).toBe('access-1');
            expect(result.refreshToken).toBe('refresh-1');
            expect(typeof result.expiresIn).toBe('number');
            expect(result.user).toEqual({
                id: 'u1',
                email: 'candidate@example.com',
                role: 'candidate',
                fullName: 'Candidate One',
            });
        });

        it('throws when the password does not match', async () => {
            UserRepository.findByEmail.mockResolvedValue({ id: 'u1', password_hash: 'hashed' });
            BcryptService.compare.mockReturnValue(false);

            await expect(
                AuthService.login({ email: 'candidate@example.com', password: 'wrong' }),
            ).rejects.toThrow('Email or password is incorrect');
        });
    });

    describe('refresh', () => {
        const mockTrx = () => ({ commit: jest.fn(), rollback: jest.fn() });

        it('rotates the refresh token and issues a new access token (cookie or body token — same path)', async () => {
            RefreshTokenRepository.findValidToken.mockResolvedValue({ id: 'rid', user_id: 'u1' });
            UserRepository.findById.mockResolvedValue({ id: 'u1', role: 'candidate' });
            getTransaction.mockResolvedValue(mockTrx());
            RefreshTokenRepository.createToken.mockResolvedValue([{ id: 'ref2', token: 'refresh-2' }]);
            JwtService.sign.mockReturnValue('access-2');

            // Controller resolves cookie first, body as fallback; both hand the service { refresh_token }.
            const result = await AuthService.refresh({ refresh_token: 'refresh-1' });

            expect(RefreshTokenRepository.findValidToken).toHaveBeenCalledWith('refresh-1');
            expect(RefreshTokenRepository.revokeToken).toHaveBeenCalledWith('rid', expect.anything());
            expect(result).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
        });

        it('throws when the refresh token is invalid or expired', async () => {
            RefreshTokenRepository.findValidToken.mockResolvedValue(null);

            await expect(
                AuthService.refresh({ refresh_token: 'bad' }),
            ).rejects.toThrow('Refresh token is invalid or expired');
        });
    });

    describe('logout', () => {
        it('revokes the refresh token and the access token when an access token is supplied', async () => {
            RefreshTokenRepository.findValidToken.mockResolvedValue({ id: 'rid' });

            const result = await AuthService.logout({ refresh_token: 'refresh-1', access_token: 'access-1' });

            expect(RefreshTokenRepository.revokeToken).toHaveBeenCalledWith('rid');
            expect(TokenRevocationService.revoke).toHaveBeenCalledWith('access-1');
            expect(result).toEqual({ message: 'Logout successful.' });
        });

        it('does not revoke an access token or throw when none is supplied', async () => {
            RefreshTokenRepository.findValidToken.mockResolvedValue({ id: 'rid' });

            const result = await AuthService.logout({ refresh_token: 'refresh-1' });

            expect(TokenRevocationService.revoke).not.toHaveBeenCalled();
            expect(result).toEqual({ message: 'Logout successful.' });
        });
    });
});
