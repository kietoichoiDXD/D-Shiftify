import { JwtService } from 'core/utils';
import { TokenRevocationService } from 'core/modules/auth/service/token-revocation.service';
import { UnAuthorizedException } from '../../../httpException';
import { AUTH_CONTEXT } from '../../common/enum/authContext';

export class JwtValidator {
    #accessToken;

    #payload;

    static builder() {
        return new JwtValidator();
    }

    applyToken(accessToken) {
        if (accessToken) {
            this.#accessToken = accessToken.startsWith(AUTH_CONTEXT.PREFIX_HEADER)
                ? accessToken.slice(7)
                : accessToken;
        }
        return this;
    }

    async validate() {
        if (this.#accessToken) {
            try {
                if (await TokenRevocationService.isRevoked(this.#accessToken)) {
                    throw new UnAuthorizedException();
                }
                this.#payload = JwtService.verify(this.#accessToken);
            } catch (e) {
                throw new UnAuthorizedException();
            }
        }
        return this;
    }

    getPayload() {
        return this.#payload;
    }
}
