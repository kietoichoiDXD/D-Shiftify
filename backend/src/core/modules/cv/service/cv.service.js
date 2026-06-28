import { CVRepository } from '../repository/cv.repository.js';
import { getTransaction } from 'core/database';
import { CreateCVDto , UpdateCVDto} from "../dto/index.js";
import { UserDeviceRepository } from '../../user/repository/user_devices.repository.js';
import { ProfileRepository } from '../../profile/repository/profile.repository.js';
import { CreateProfileDto , UpdateProfileDto} from "../../profile/dto/index.js";
import { NotFoundException } from 'packages/httpException';
import { ForbiddenException } from 'packages/httpException/ForbiddenException';

class Service {
    constructor() {
        this.repository = CVRepository;
    }

    async createOne(cvData) {

        const trx = await getTransaction();
        try {

            const { userId } = cvData;
            const deviceIds = cvData.cv?.deviceIds || [];

            let userProfile = await ProfileRepository.findByUserId(userId);

            if (!userProfile) {
                userProfile = await ProfileRepository.create({ user_id: userId, ...CreateProfileDto(cvData.profile) }, trx);
            } else {
                await ProfileRepository.updateByUserId(userId, UpdateProfileDto(cvData.profile), trx);
                userProfile = await ProfileRepository.findByUserId(userId);
            }

             if (deviceIds.length) {
                await UserDeviceRepository.createUserDevices(userProfile.id, deviceIds, trx );
            }

            const cv = await this.repository.createCV(CreateCVDto({ ...cvData, profileId: userProfile.id }),trx);

            await trx.commit();
            return cv;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }

    async getCurrentCv(userId) {
        const cv = await this.repository.findLatestByUserId(userId);
        if (!cv) {
            throw new NotFoundException('CV not found');
        }
        return cv;
    }

    async listMyCvs(userId) {
        return this.repository.findAllByUserId(userId);
    }

    async deleteCV(id, userId) {
        const existing = await this.repository.findByIdAndUserId(id, userId);
        if (!existing) {
            throw new ForbiddenException('You do not have permission to delete this CV');
        }
        await this.repository.softDelete(id);
        return { message: 'Đã xóa CV thành công' };
    }

    async getCvById(id, userId) {
        const cv = await this.repository.findByIdAndUserId(id, userId);
        if (!cv) {
            throw new NotFoundException('CV not found');
        }
        return cv;
    }

    async updateCV(id, cvData, userId) {
        const existing = await this.repository.findByIdAndUserId(id, userId);
        if (!existing) {
            throw new ForbiddenException('You do not have permission to update this CV');
        }
        const trx = await getTransaction();
        try {
            const payload = UpdateCVDto({ ...cvData, profileId: existing.profileId });
            const updatedCV = await this.repository.updateCV(id, payload, trx);

            if (!updatedCV || updatedCV.length === 0) {
                throw new Error('CV not found or update failed');
            }

            if (cvData.cv?.deviceIds !== undefined) {
                await UserDeviceRepository.deleteByProfileId(existing.profileId,trx);

                if (cvData.cv.deviceIds.length) {
                    await UserDeviceRepository.createUserDevices(existing.profileId, cvData.cv.deviceIds, trx);
                }
            }

            if (cvData.profile) {
                await ProfileRepository.updateByUserId(userId, UpdateProfileDto(cvData.profile), trx);
            }

            await trx.commit();
            return updatedCV[0];

        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
}
export const CVService = new Service();
