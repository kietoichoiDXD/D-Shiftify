import { UserService } from '../../modules/user/services/user.service';
import { CreateUserDto, UpdateUserDto } from '../../modules/user/dto';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';
import { getUserContext } from '../../../packages/authModel/module/user';

class Controller {
    constructor() {
        this.service = UserService;
    }

    updateOne = async req => {
        const { id } = getUserContext(req);
        await this.service.updateOne(id, UpdateUserDto(req.body));
        return ValidHttpResponse.toNoContentResponse();
    };

    createOne = async req => {
        const data = await this.service.createOne(CreateUserDto(req.body));
        return ValidHttpResponse.toCreatedResponse(data);
    };

    findById = async req => {
        const data = await this.service.findById(req.params.id);
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const UserController = new Controller();
