import { getUserContext } from 'packages/authModel/module/user';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';
import { ClassService } from 'core/modules/education';

class Controller {
    constructor() {
        this.service = ClassService;
    }

    createClass = async req => {
        const actor = getUserContext(req);
        const data = await this.service.createClass(req.body, actor);
        return ValidHttpResponse.toCreatedResponse(data);
    };

    uploadThumbnail = async req => {
        const data = await this.service.uploadThumbnail(req.file);
        return ValidHttpResponse.toOkResponse(data);
    };
}

export const EducationController = new Controller();
