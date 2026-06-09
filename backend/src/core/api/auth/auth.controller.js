import { AuthService } from '../../modules/auth/service/auth.service';
import { LoginDto, RefreshTokenDto } from '../../modules/auth';
import { CreateUserDto } from '../../modules/user/dto';
import { UserService } from '../../modules/user/services/user.service';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';

class Controller {
    constructor() {
        this.service = AuthService;
        this.userService = UserService;
    }

    login = async req => {
        const data = await this.service.login(LoginDto(req.body));
        return ValidHttpResponse.toOkResponse(data);
    }

    register = async req => {
        const data = await this.userService.createOne(CreateUserDto(req.body));
        return ValidHttpResponse.toCreatedResponse(data);
    }

    refreshToken = async req => {
        const data = await this.service.refreshToken(RefreshTokenDto(req.body));
        return ValidHttpResponse.toOkResponse(data);
    }

    logout = async req => {
        const data = await this.service.logout(req.headers.authorization);
        return ValidHttpResponse.toOkResponse(data);
    }

    forgotPassword = async req => {
        const data = await this.service.forgotPassword(req.body);
        return ValidHttpResponse.toOkResponse(data);
    }

    resetPassword = async req => {
        const data = await this.service.resetPassword(req.body);
        return ValidHttpResponse.toOkResponse(data);
    }
}

export const AuthController = new Controller();
