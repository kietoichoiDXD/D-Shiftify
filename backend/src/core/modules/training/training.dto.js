import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('UpsertTrainingCenterDto', {
    name: SwaggerDocument.ApiProperty({ type: 'string' }),
    slogan: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    phone: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    email: SwaggerDocument.ApiProperty({ type: 'string' }),
    website: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    address: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    organizationType: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    supportForDisabled: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    partnerCompanies: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    achievements: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
});

ApiDocument.addModel('CreateCourseDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string' }),
    durationType: SwaggerDocument.ApiProperty({ type: 'string', enum: ['short_term', 'medium_term', 'long_term'] }),
    startDate: SwaggerDocument.ApiProperty({ type: 'string' }),
    endDate: SwaggerDocument.ApiProperty({ type: 'string' }),
    mode: SwaggerDocument.ApiProperty({ type: 'string' }),
    certificateOutput: SwaggerDocument.ApiProperty({ type: 'string', required: false }),
    description: SwaggerDocument.ApiProperty({ type: 'string' }),
});
