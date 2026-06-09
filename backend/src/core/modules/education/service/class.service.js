import { BadRequestException } from 'packages/httpException';
import { MediaService } from 'core/modules/document';
import { CreateClassDto } from '../dto';
import { ClassRepository } from '../repository';

class Service {
    constructor() {
        this.repository = ClassRepository;
        this.mediaService = MediaService;
    }

    /**
     * Create a new education class.
     * @param {object} payload - Validated class data (title, description, level, category, startDate, endDate, maxStudents, status)
     * @param {object} actor   - User context from getUserContext(req) — shape: { id, roles, email, ... }
     */
    createClass(payload, actor) {
        // getUserContext returns the JWT payload directly (no nested .payload)
        if (!actor?.id) {
            throw new BadRequestException('Authenticated user id is required');
        }

        return this.repository.create({
            ...CreateClassDto(payload),
            created_by: actor.id,
        });
    }

    async uploadThumbnail(file) {
        if (!file) {
            throw new BadRequestException('Thumbnail file is required');
        }
        const uploaded = await this.mediaService.uploadOne(file, 'education/classes/thumbnails');
        return {
            thumbnailUrl: uploaded.url,
            thumbnailPublicId: uploaded.publicId,
            originalName: uploaded.originalName,
        };
    }
}

export const ClassService = new Service();
