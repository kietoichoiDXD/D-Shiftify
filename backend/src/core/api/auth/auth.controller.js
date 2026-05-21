import { AuthService } from '../../modules/auth/service/auth.service';
import { LoginDto, RefreshTokenDto } from '../../modules/auth';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';

class Controller {
    constructor() {
        this.service = AuthService;
    }

    login = async req => {
        const data = await this.service.login(LoginDto(req.body));
        return ValidHttpResponse.toOkResponse(data);
    }

    refreshToken = async req => {
        const data = await this.service.refreshToken(RefreshTokenDto(req.body));
        return ValidHttpResponse.toOkResponse(data);
    }

    logout = async req => {
        const data = await this.service.logout(req.headers.authorization);
        return ValidHttpResponse.toOkResponse(data);
    }
}

export const AuthController = new Controller();
