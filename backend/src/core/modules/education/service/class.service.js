import { BadRequestException } from 'packages/httpException';
import { MediaService } from 'core/modules/document';
import { CreateClassDto } from '../dto';
import { ClassRepository } from '../repository';

class Service {
    constructor() {
        this.repository = ClassRepository;
        this.mediaService = MediaService;
    }

    createClass(payload, actor) {
        if (!actor?.payload?.id) {
            throw new BadRequestException('Authenticated user id is required');
        }

        return this.repository.create({
            ...CreateClassDto(payload),
            created_by: actor.payload.id,
        });
    }

    async uploadThumbnail(file) {
        const uploaded = await this.mediaService.uploadOne(file, 'education/classes/thumbnails');
        return {
            thumbnailUrl: uploaded.url,
            thumbnailPublicId: uploaded.publicId,
            originalName: uploaded.originalName,
        };
    }
}

export const ClassService = new Service();
