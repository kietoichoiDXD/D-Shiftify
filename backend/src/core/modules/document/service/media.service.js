import { unlink } from 'fs/promises';
import { BadRequestException, InternalServerException } from 'packages/httpException';
import { logger } from 'packages/logger';
import db from 'core/database';
import { cloudinaryUploader } from '../../../config/cloudinary.config';

class Service {
    constructor() {
        this.logger = logger;
    }

    async uploadOne(file, folderName = 'media', ownerId = null) {
        try {
            const response = await cloudinaryUploader.upload(file.path, { folder: folderName });
            await db('media_assets')
                .insert({
                    public_id: response.public_id,
                    url: response.secure_url,
                    owner_id: ownerId,
                    folder: folderName || null,
                    original_name: response.original_filename,
                })
                .onConflict('public_id')
                .merge({
                    url: response.secure_url,
                    owner_id: ownerId,
                    folder: folderName || null,
                    original_name: response.original_filename,
                    deleted_at: null,
                });
            return {
                originalName: response.original_filename,
                url: response.secure_url,
                publicId: response.public_id,
            };
        } catch (error) {
            throw new InternalServerException(error.message);
        } finally {
            await unlink(file.path).catch(error => {
                this.logger.error(error.message);
            });
        }
    }

    async uploadMany(files, folderName = 'media', ownerId = null) {
        const uploadTasks = files.map(file => this.uploadOne(file, folderName, ownerId));

        return Promise.all(uploadTasks);
    }

    async deleteMany(ids, ownerId = null) {
        if (!Array.isArray(ids) || ids.length < 1 || ids.length > 20) {
            throw new BadRequestException('Invalid media ids');
        }
        const deleteTasks = ids.map(id => this.deleteOne(id, ownerId));

        return Promise.all(deleteTasks);
    }

    async deleteOne(id, ownerId = null) {
        if (!/^[a-zA-Z0-9_/-]+$/.test(id)) {
            throw new BadRequestException('Invalid media id');
        }

        const asset = await db('media_assets')
            .where({ public_id: id, owner_id: ownerId })
            .whereNull('deleted_at')
            .first();

        if (!asset) {
            throw new BadRequestException('Media asset not found or not owned by current user');
        }

        const response = await cloudinaryUploader.destroy(id);
        await db('media_assets')
            .where({ public_id: id, owner_id: ownerId })
            .update({ deleted_at: db.fn.now() });

        return {
            id,
            ...response,
        };
    }
}

export const MediaService = new Service();
