import { getUserContext } from 'packages/authModel/module/user';
import { JobService } from '../../modules/job/service/job.service';
import { ValidHttpResponse } from '../../../packages/handler/response/validHttp.response';
import { UpdateJobDto, PostJobDto, GetJobsDto, GetAdminJobsDto, GetRecruiterJobsDto } from '../../modules/job/dto';

class Controller {
    constructor() {
        this.service = JobService;
    }

    getJobById = async req => {
        const jobId = req.params.id;
        const data = await this.service.getJobById(jobId);

        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Get job successfully',
            data,
        });
    }

    getAssistiveDevices = async () => {
        const data = await this.service.getAssistiveDevices();
        return ValidHttpResponse.toOkResponse({ status: 'success', data });
    }

    deletedJobById = async req => {
        const jobId = req.params.id;
        const userId = getUserContext(req).payload.id;
        await this.service.deleteJobById(jobId, userId);

        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Đã đóng tin tuyển dụng thành công',
        });
    }

    createJob = async req => {
        const userId = getUserContext(req).payload.id;
        const data = await this.service.createJob(PostJobDto(req.body), userId);
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Đăng tin tuyển dụng thành công',
            job_id: data.id,
            data: {
                id: data.id,
            },
        });
    }

    updateJobById = async req => {
        const jobId = req.params.id;
        const userId = getUserContext(req).payload.id;
        const data = await this.service.updateJobById(jobId, UpdateJobDto(req.body), userId);

        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Cập nhật thông tin thành công',
            updated_at: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
        });
    }

    getJobs = async req => {
        const { data, total, page, limit, totalPages } = await this.service.getJobs(GetJobsDto(req.query));
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Get jobs successfully',

            total,
            page,
            limit,
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }

    getAdminJobs = async req => {
        const { data, total, page, limit, totalPages } = await this.service.getAdminJobs(GetAdminJobsDto(req.query));
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Get jobs successfully',
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }

    getRecruiterJobs = async req => {
        const userId = getUserContext(req).payload.id;
        const { data, total, page, limit, totalPages } = await this.service.getRecruiterJobs(GetRecruiterJobsDto(req.query), userId);
        return ValidHttpResponse.toOkResponse({
            status: 'success',
            message: 'Get jobs successfully',
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    }
}

export const JobController = new Controller();
