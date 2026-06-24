import { NotFoundException, BadRequestException } from 'packages/httpException';
import { ForbiddenException } from 'packages/httpException/ForbiddenException';
import connection, { getTransaction } from 'core/database';
import { JobRepository } from '../repository/job.repository';

class Service {
    constructor() {
        this.jobRepository = JobRepository;
    }

    async getJobById(jobId) {
        const job = await this.jobRepository.getJobById(jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const {
            company_id,
            job_type,
            work_mode,
            experience_required,
            salary_min,
            salary_max,
            working_time,
            created_at,
            updated_at,
            skills,
            ...rest
        } = job;

        return {
            ...rest,
            companyId: company_id,
            jobType: job_type,
            workMode: work_mode,
            experienceRequired: experience_required,
            salaryMin: salary_min,
            salaryMax: salary_max,
            workingTime: working_time,
            createdAt: created_at,
            updatedAt: updated_at,
            skills: typeof skills === 'string' ? JSON.parse(skills) : skills,
        };
    }

    async getAssistiveDevices() {
        return connection('assistive_devices')
            .select('id', 'name')
            .orderBy('name', 'asc');
    }

    async deleteJobById(jobId, userId) {
        const job = await this.jobRepository.getJobByIdForRecruiter(jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const company = await connection('companies')
            .where('user_id', userId)
            .whereNull('deleted_at')
            .first();

        if (!company || job.company_id !== company.id) {
            throw new ForbiddenException('You do not have permission to delete this job');
        }

        const trx = await getTransaction();
        try {
            await this.jobRepository.update(
                jobId,
                {
                    deleted_at: new Date(),
                    updated_at: new Date(),
                },
                trx,
            );
            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }

        return {
            message: 'Job deleted successfully',
        };
    }

    async createJob(data, userId) {
        const company = await connection('companies')
            .where('user_id', userId)
            .whereNull('deleted_at')
            .first();

        if (!company) {
            throw new ForbiddenException('You must create a company profile before posting a job');
        }

        const { assistive_devices, ...jobData } = data;

        // Stringify skills array of objects for PostgreSQL jsonb column compatibility if present
        if (jobData.skills) {
            jobData.skills = JSON.stringify(jobData.skills);
        }

        const trx = await getTransaction();
        try {
            const [insertedJob] = await this.jobRepository.insert(
                {
                    ...jobData,
                    company_id: company.id,
                },
                trx,
                ['id'],
            );
            const jobId = insertedJob.id || insertedJob;

            // Map assistive devices to the job in the join table
            if (assistive_devices && assistive_devices.length > 0) {
                const jobDevicesRows = assistive_devices.map(deviceId => ({
                    job_id: jobId,
                    device_id: deviceId,
                }));
                await connection('job_devices')
                    .insert(jobDevicesRows)
                    .transacting(trx);
            }

            await trx.commit();

            return {
                id: jobId,
                message: 'Job created successfully',
            };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async updateJobById(jobId, data, userId) {
        const job = await this.jobRepository.getJobByIdForRecruiter(jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const company = await connection('companies')
            .where('user_id', userId)
            .whereNull('deleted_at')
            .first();

        if (!company || job.company_id !== company.id) {
            throw new ForbiddenException('You do not have permission to update this job');
        }

        // Validate salary constraint (salary_max >= salary_min) to avoid database constraint violations
        const salaryMin = data.salary_min !== undefined ? data.salary_min : job.salary_min;
        const salaryMax = data.salary_max !== undefined ? data.salary_max : job.salary_max;

        if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
            throw new BadRequestException('Maximum salary must be greater than or equal to minimum salary');
        }

        // Stringify skills array of objects for PostgreSQL jsonb column compatibility if present
        if (data.skills) {
            data.skills = JSON.stringify(data.skills);
        }

        const trx = await getTransaction();
        try {
            await this.jobRepository.update(
                jobId,
                {
                    ...data,
                    updated_at: new Date(),
                },
                trx,
            );
            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }

        return {
            message: 'Job updated successfully',
        };
    }

    async getJobs(query) {
        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const rawData = await this.jobRepository.getJobs(query, offset, limit);
        const total = await this.jobRepository.countJobs(query);
        const totalPages = Math.ceil(total / limit) || 0;

        const data = rawData.map(job => ({
            id: job.id,
            companyId: job.company_id,
            company: {
                name: job.company_name,
                logoUrl: job.company_logo_url,
            },
            title: job.title,
            jobType: job.job_type,
            workMode: job.work_mode,
            experienceRequired: job.experience_required,
            skills: (() => {
                if (typeof job.skills === 'string') {
                    try {
                        return JSON.parse(job.skills);
                    } catch {
                        return [];
                    }
                }
                return job.skills;
            })(),
            salaryMin: job.salary_min,
            salaryMax: job.salary_max,
            location: job.location,
            latitude: job.latitude,
            longitude: job.longitude,
            workingTime: job.working_time,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
        }));

        return { data, total, page, limit, totalPages };
    }

    formatJobResponse(job) {
        return {
            id: job.id,
            title: job.title,
            status: job.status,
            company: {
                name: job.company_name,
                logoUrl: job.company_logo_url,
            },
            location: job.location,
            jobType: job.job_type,
            workMode: job.work_mode,
            salary: {
                min: job.salary_min,
                max: job.salary_max,
                currency: 'VND',
            },
            createdAt: job.created_at,
        };
    }

    async getAdminJobs(query) {
        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const rawData = await this.jobRepository.getAdminJobs(query, offset, limit);
        const total = await this.jobRepository.countAdminJobs(query);
        const totalPages = Math.ceil(total / limit) || 0;

        const data = rawData.map(job => this.formatJobResponse(job));

        return { data, total, page, limit, totalPages };
    }

    async getRecruiterJobs(query, userId) {
        const company = await connection('companies')
            .where('user_id', userId)
            .whereNull('deleted_at')
            .first();

        if (!company) {
            throw new ForbiddenException('You must create a company profile first');
        }

        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const rawData = await this.jobRepository.getRecruiterJobs(company.id, query, offset, limit);
        const total = await this.jobRepository.countRecruiterJobs(company.id, query);
        const totalPages = Math.ceil(total / limit) || 0;

        const data = rawData.map(job => this.formatJobResponse(job));

        return { data, total, page, limit, totalPages };
    }
}

export const JobService = new Service();
