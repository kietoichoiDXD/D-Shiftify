import { ApplicationsRepository } from '../repositories/application.repository';
import { CreateApplicationDto , ApplicationDto } from '../dto/index';
import { ConversationService } from 'core/modules/chat/services/conversation.service';
import { getTransaction } from 'core/database';
import { APPLICATION_STATUS } from './application.enum';
import { NotFoundException, DuplicateException, BadRequestException} from 'packages/httpException';

const normalizeSkills = skills => {
    if (!Array.isArray(skills)) return [];
    return skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
};

class Service {
    constructor() {
        this.repository = ApplicationsRepository;
    }

    async createOne(payload) {

        const data = CreateApplicationDto(payload);

        const existedApplication = await this.repository.findByJobAndCv( data.job_id, data.cv_id );

        if (existedApplication) {
            throw new DuplicateException();
        }

        const application =
            await this.repository.createOne({
                ...data,
                status: APPLICATION_STATUS.APPLIED,
            });

        return application[0];
    }

    async getApplications(page, size, filters = {}) {
        const totalResult = await this.repository.getTotalCount(filters);
        const total = totalResult?.total ? parseInt(totalResult.total, 10) : 0;

        const rows = await this.repository.getAll(page, size, filters);
        const data = rows.map(row => ({
            application_id: row.id,
            candidate: {
                full_name: row.fullName || null,
                phone: row.phone || null,
                avatar_url: null,
            },
            cv_summary: {
                expected_job: row.expectedJob || null,
                skills: normalizeSkills(row.skills),
            },
            applied_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
            status: row.status,
        }));

        return { total, data };
    }

    async getById(id) {
        const application = await this.repository.findById(id);

        if (!application) {
            throw new NotFoundException();
        }
        return application;
    }

    async updateStatus(id, status) {
        const trx = await getTransaction();

        try {

            const oldApplication = await this.repository.findById(id,trx);

            if (!oldApplication) {
                throw new NotFoundException();
            }

            const updatedApplication = await this.repository.updateStatus(id,status,trx );

            if (!updatedApplication || updatedApplication.length === 0) {
                throw new Error('Application not found or update failed');
            }

             let conversation = null;

            if (status === APPLICATION_STATUS.ACCEPTED && oldApplication.status !== APPLICATION_STATUS.ACCEPTED) {
                conversation = await ConversationService.createConversationFromApplication(
                    {
                        status,
                        job_id: oldApplication.jobId,
                        cv_id: oldApplication.cvId,
                    },
                    trx
                );
            }

            await trx.commit();

            const updated = updatedApplication[0];
            return {
                status: 'success',
                message: 'Đã cập nhật trạng thái ứng tuyển thành công',
                updated_at: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt,
                conversation,
            };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

export const ApplicationsService = new Service();
