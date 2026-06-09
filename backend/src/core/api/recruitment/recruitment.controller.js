import { getUserContext } from 'packages/authModel/module/user';
import { RecruitmentService } from 'core/modules/recruitment';
import { ValidHttpResponse } from 'packages/handler/response/validHttp.response';

class Controller {
    constructor() {
        this.service = RecruitmentService;
    }

    /** POST /recruitment/jobs — Employer creates a job (with AI pipeline) */
    createJob = async req => {
        const { id } = getUserContext(req);
        const result = await this.service.createJob(req.body, id);
        return ValidHttpResponse.toCreatedResponse(result);
    };

    /** GET /recruitment/jobs — Public job listing with filters */
    listJobs = async req => {
        const result = await this.service.listJobs(req.query);
        return ValidHttpResponse.toOkResponse(result);
    };

    /** GET /recruitment/jobs/:jobId — Public job detail */
    getJobById = async req => {
        const job = await this.service.getJobById(req.params.jobId);
        return ValidHttpResponse.toOkResponse(job);
    };

    /** GET /recruitment/jobs/me — Employer's own posted jobs */
    getMyJobs = async req => {
        const { id } = getUserContext(req);
        const jobs = await this.service.getMyJobs(id);
        return ValidHttpResponse.toOkResponse(jobs);
    };

    getAdminJobs = async req => {
        const jobs = await this.service.listJobsForAdmin(req.query);
        return ValidHttpResponse.toOkResponse(jobs);
    };

    updateJob = async req => {
        const { id } = getUserContext(req);
        const job = await this.service.updateJob(req.params.jobId || req.params.id, req.body, id);
        return ValidHttpResponse.toOkResponse(job);
    };

    deleteJob = async req => {
        const { id } = getUserContext(req);
        const result = await this.service.deleteJob(req.params.jobId || req.params.id, id);
        return ValidHttpResponse.toOkResponse(result);
    };

    uploadCompanyLogo = async req => {
        const { id } = getUserContext(req);
        const result = await this.service.uploadCompanyLogo(req.params.jobId, req.file, id);
        return ValidHttpResponse.toOkResponse(result);
    };

    /** GET /recruitment/jobs/:jobId/applicants — Employer views candidates who applied */
    getApplicants = async req => {
        const { id } = getUserContext(req);
        const applicants = await this.service.getApplicants(req.params.jobId, id);
        return ValidHttpResponse.toOkResponse(applicants);
    };

    /** GET /recruitment/applications/me — Candidate views own applications */
    getMyApplications = async req => {
        const { id } = getUserContext(req);
        const applications = await this.service.getMyApplications(id);
        return ValidHttpResponse.toOkResponse(applications);
    };

    /** POST /recruitment/applications — Candidate applies for a job */
    applyForJob = async req => {
        const { id } = getUserContext(req);
        const application = await this.service.applyForJob(req.body, id);
        return ValidHttpResponse.toCreatedResponse(application);
    };

    /** PATCH /recruitment/applications/:applicationId/status — Employer accepts/rejects */
    updateApplicationStatus = async req => {
        const { id } = getUserContext(req);
        const updated = await this.service.updateApplicationStatus(
            req.params.applicationId,
            req.body.status,
            id,
        );
        return ValidHttpResponse.toOkResponse(updated);
    };
}

export const RecruitmentController = new Controller();
