import { AccessTokenVerifierService } from 'core/modules/auth/service/access-token-verifier.service';
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
                this.#payload = await AccessTokenVerifierService.verify(this.#accessToken);
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
