import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';
import { ApplicationsService } from 'core/modules/applications/services/application.service';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'core/common/constants/index.js';

const iso = v => (v instanceof Date ? v.toISOString() : v ?? null);

class Controller {
    constructor() {
        this.service = ApplicationsService;
    }

    createApplication = async req => {
        const application = await this.service.createOne(req.body);
        return ValidHttpResponse.toCreatedResponse({
            application_id: application.id,
            status: application.status,
            created_at: iso(application.createdAt),
            message: 'Nộp đơn ứng tuyển thành công',
        });
    };

    getApplications = async req => {
        const page = Number(req.query.page) || DEFAULT_PAGE;
        const size = Number(req.query.limit) || Number(req.query.size) || DEFAULT_PAGE_SIZE;
        const data = await this.service.getApplications(page, size, {
            jobId: req.query.job_id,
            status: req.query.status,
        });
        return ValidHttpResponse.toOkResponse(data);
    };

    updateApplicationStatus = async req => {
        const data = await this.service.updateStatus(req.params.id, req.body.status);
        return ValidHttpResponse.toOkResponse({
            status: data.status,
            message: data.message,
            updated_at: data.updated_at,
        });
    };
}

export const ApplicationsController = new Controller();
