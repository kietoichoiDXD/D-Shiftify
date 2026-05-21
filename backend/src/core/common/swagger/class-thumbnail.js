import { SwaggerDocument } from '../../../packages/swagger';

export const uploadClassThumbnailSwagger = SwaggerDocument.ApiParams({
    name: 'thumbnail',
    paramsIn: 'formData',
    require: true,
    type: 'file',
    description: 'Class thumbnail image (.png, .jpg, .jpeg, max 5MB)',
});
