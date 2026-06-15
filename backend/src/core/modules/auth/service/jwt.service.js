import { sign, decode, verify } from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET, EXPIRE_DAYS, REFRESH_EXPIRE_DAYS } from '../../../env';
import { logger } from '../../../../packages/logger';

class Jwt {
    secret = JWT_SECRET;

    expiresIn = EXPIRE_DAYS;

    constructor() {
        logger.info(`[${Jwt.name}] is bundling`);
    }

    sign(payload) {
        return sign(payload, this.secret, {
            algorithm: 'HS256',
            expiresIn: this.expiresIn
        });
    }

    signRefreshToken(payload) {
        return sign(payload, JWT_REFRESH_SECRET, {
            algorithm: 'HS256',
            expiresIn: REFRESH_EXPIRE_DAYS
        });
    }

    signPasswordResetToken(payload) {
        return sign({ ...payload, tokenType: 'password_reset' }, JWT_REFRESH_SECRET, {
            algorithm: 'HS256',
            expiresIn: '15m',
        });
    }

    decode(token) {
        return decode(token);
    }

    verify(token) {
        return verify(token, this.secret, { algorithms: ['HS256'] });
    }

    verifyRefreshToken(token) {
        return verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
    }

    verifyPasswordResetToken(token) {
        const payload = verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
        if (payload?.tokenType !== 'password_reset') {
            throw new Error('Invalid reset token type');
        }
        return payload;
    }
}

export const JwtService = new Jwt();
