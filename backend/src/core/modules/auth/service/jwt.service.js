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

    decode(token) {
        return decode(token);
    }

    verify(token) {
        return verify(token, this.secret, { algorithms: ['HS256'] });
    }

    verifyRefreshToken(token) {
        return verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
    }
}

export const JwtService = new Jwt();
