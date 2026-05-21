import { BadRequestException, DuplicateException, NotFoundException } from 'packages/httpException';
import { getTransaction } from 'core/database';
import { ApplyJobDto, CreateJobDto } from '../dto';
import { JobApplicationRepository, RecruitmentJobRepository } from '../repository';

class Service {
    constructor() {
        this.jobRepository = RecruitmentJobRepository;
        this.applicationRepository = JobApplicationRepository;
    }

    createJob(payload, employerId) {
        if (!employerId) throw new BadRequestException('Authenticated employer id is required');
        return this.jobRepository.create(CreateJobDto(payload, employerId));
    }

    async applyForJob(payload, candidateId) {
        if (!candidateId) throw new BadRequestException('Authenticated candidate id is required');

        const trx = await getTransaction();

        try {
            const job = await this.jobRepository.findById(payload.job_id, trx);
            if (!job) throw new NotFoundException('Job not found');

            const existing = await this.applicationRepository.findByJobAndCandidate(payload.job_id, candidateId, trx);
            if (existing) throw new DuplicateException('You have already applied for this job');

            const application = await this.applicationRepository.create(ApplyJobDto(payload, candidateId), trx);
            await this.jobRepository.incrementApplicationCount(payload.job_id, trx);
            await trx.commit();
            return application;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

export const RecruitmentService = new Service();
