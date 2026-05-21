import { getUserContext } from 'packages/authModel/module/user';
import { RecruitmentService } from 'core/modules/recruitment';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';

class Controller {
    constructor() {
        this.service = RecruitmentService;
    }

    createJob = async req => {
        const { id } = getUserContext(req);
        const job = await this.service.createJob(req.body, id);
        return ValidHttpResponse.toCreatedResponse(job);
    };

    applyForJob = async req => {
        const { id } = getUserContext(req);
        const application = await this.service.applyForJob(req.body, id);
        return ValidHttpResponse.toCreatedResponse(application);
    };
}

export const RecruitmentController = new Controller();
