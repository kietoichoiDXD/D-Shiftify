import {
    BadRequestException,
    DuplicateException,
    ForbiddenException,
    NotFoundException,
} from 'packages/httpException';
import { getTransaction } from 'core/database';
import {
    APPLICATION_STATUSES,
    CreateJobDto,
    ApplyJobDto,
    UpdateJobDto,
} from '../dto';
import { JobApplicationRepository, RecruitmentJobRepository } from '../repository';
import { ingestJob } from 'core/modules/ai/services/job.ingestion.service';
import { MediaService } from 'core/modules/document';
import { logger } from 'packages/logger';

class Service {
    constructor() {
        this.jobRepository = RecruitmentJobRepository;
        this.applicationRepository = JobApplicationRepository;
        this.mediaService = MediaService;
    }

    /**
     * Create a job with AI accessibility audit + embedding ingestion.
     * Falls back to plain DB insert if AI pipeline fails (graceful degradation).
     */
    async createJob(payload, employerId) {
        if (!employerId) throw new BadRequestException('Authenticated employer id is required');

        const dto = CreateJobDto(payload, employerId);

        try {
            // AI pipeline: accessibility audit + pgvector embedding
            const result = await ingestJob(dto);
            return result;
        } catch (aiError) {
            // Graceful degradation: log AI failure, still save the job
            logger.warn('[RecruitmentService.createJob] AI pipeline failed, saving job without embedding', {
                error: aiError.message,
            });

            const job = await this.jobRepository.create(dto);
            return { job, accessibility: null };
        }
    }

    /**
     * List all public jobs with optional filters + pagination.
     */
    listJobs(filters) {
        return this.jobRepository.findAll(filters);
    }

    /**
     * Get a single job by ID.
     */
    async getJobById(jobId) {
        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new NotFoundException(`Job ${jobId} not found`);
        return job;
    }

    /**
     * Get employer's own posted jobs.
     */
    getMyJobs(employerId) {
        return this.jobRepository.findByEmployerUserId(employerId);
    }

    listJobsForAdmin(filters) {
        return this.jobRepository.findAllForAdmin(filters);
    }

    async updateJob(jobId, payload, employerId) {
        const data = UpdateJobDto(payload);
        if (Object.keys(data).length === 0) {
            throw new BadRequestException('At least one job field is required');
        }

        const existing = await this.jobRepository.findById(jobId);
        if (!existing) throw new NotFoundException('Job not found');
        if (existing.employer_user_id !== employerId) {
            throw new ForbiddenException('You are not authorized to update this job');
        }
        if (['closed', 'paused'].includes(existing.status)) {
            throw new BadRequestException('Closed or paused jobs cannot be edited');
        }

        const updated = await this.jobRepository.updateOwned(jobId, employerId, data);
        if (!updated) throw new NotFoundException('Job not found');
        return updated;
    }

    async deleteJob(jobId, employerId) {
        const deleted = await this.jobRepository.softDeleteOwned(jobId, employerId);
        if (!deleted) throw new NotFoundException('Job not found');
        return { deleted: true, jobId };
    }

    async uploadCompanyLogo(jobId, file, employerId) {
        if (!file) throw new BadRequestException('Company logo file is required');

        const job = await this.jobRepository.findById(jobId);
        if (!job) throw new NotFoundException('Job not found');
        if (job.employer_user_id !== employerId) {
            throw new ForbiddenException('You are not authorized to update this job logo');
        }

        const uploaded = await this.mediaService.uploadOne(file, 'recruitment/company-logos', employerId);
        const updated = await this.jobRepository.updateLogoOwned(jobId, employerId, {
            url: uploaded.url,
            publicId: uploaded.publicId,
        });

        return {
            jobId,
            logoUrl: updated.company_logo_url,
            logoPublicId: updated.company_logo_public_id,
        };
    }

    /**
     * Get all candidates who applied to a specific job (employer only).
     */
    async getApplicants(jobId, employerId) {
        if (!employerId) throw new BadRequestException('Employer id is required');

        const applicants = await this.jobRepository.findApplicantsByJobId(jobId, employerId);
        if (applicants === null) {
            throw new ForbiddenException('You do not own this job or it does not exist');
        }
        return applicants;
    }

    /**
     * Get candidate's own applications with job info.
     */
    getMyApplications(candidateId) {
        if (!candidateId) throw new BadRequestException('Candidate id is required');
        return this.applicationRepository.findByCandidateId(candidateId);
    }

    /**
     * Apply for a job — atomic with transaction.
     * Prevents duplicate applications via DB unique constraint + pre-check.
     */
    async applyForJob(payload, candidateId) {
        if (!candidateId) throw new BadRequestException('Authenticated candidate id is required');
        if (!payload?.job_id) throw new BadRequestException('job_id is required');

        const trx = await getTransaction();

        try {
            const job = await this.jobRepository.findById(payload.job_id, trx);
            if (!job) throw new NotFoundException('Job not found');

            const existing = await this.applicationRepository.findByJobAndCandidate(
                payload.job_id, candidateId, trx,
            );
            if (existing) throw new DuplicateException('You have already applied for this job');

            const application = await this.applicationRepository.create(
                ApplyJobDto(payload, candidateId), trx,
            );
            await this.jobRepository.incrementApplicationCount(payload.job_id, trx);
            await trx.commit();
            return application;
        } catch (error) {
            await trx.rollback();
            // Catch DB-level unique constraint race condition
            if (error?.code === '23505') {
                throw new DuplicateException('You have already applied for this job');
            }
            throw error;
        }
    }

    /**
     * Update application status — only the employer who owns the job can do this.
     *
     * Logic:
     *  1. Find application
     *  2. Verify employer owns the job linked to this application
     *  3. Prevent transitioning from a terminal state (ACCEPTED/REJECTED → cannot change back)
     *  4. Update status
     */
    async updateApplicationStatus(applicationId, status, employerId) {
        if (!APPLICATION_STATUSES.includes(status)) {
            throw new BadRequestException(`Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}`);
        }

        const application = await this.applicationRepository.findById(applicationId);
        if (!application) throw new NotFoundException('Application not found');

        // Verify employer owns the job
        const job = await this.jobRepository.findById(application.job_id);
        if (!job) throw new NotFoundException('Job not found');

        if (job.employer_user_id !== employerId) {
            throw new ForbiddenException('You are not authorized to update this application');
        }

        // Prevent changing from terminal state
        if (application.status !== 'PENDING') {
            throw new BadRequestException(
                `Cannot change application status from '${application.status}'. Only PENDING applications can be updated.`,
            );
        }

        const updated = await this.applicationRepository.updateStatus(applicationId, status);
        return updated;
    }
}

export const RecruitmentService = new Service();
