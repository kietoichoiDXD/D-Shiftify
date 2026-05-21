import { DeleteFileDto, MediaService } from 'core/modules/document';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { getUserContext } from 'packages/authModel/module/user';

class Controller {
    constructor() {
        this.service = MediaService;
    }

    uploadMany = async req => {
        const { id } = getUserContext(req);
        const data = await this.service.uploadMany(req.files, 'media', id);
        return ValidHttpResponse.toOkResponse(data);
    };

    deleteMany = async req => {
        const { id } = getUserContext(req);
        const data = await this.service.deleteMany(DeleteFileDto(req.body).ids, id);
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const MediaController = new Controller();
