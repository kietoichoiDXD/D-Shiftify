import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('MatchJobsDto', {
    cvId: SwaggerDocument.ApiProperty({ type: 'string' }),
    jobIds: SwaggerDocument.ApiProperty({ type: 'array', items: { type: 'string' }, required: false }),
    priorities: SwaggerDocument.ApiProperty({ type: 'array', items: { type: 'string' }, required: false }),
    limit: SwaggerDocument.ApiProperty({ type: 'number', required: false }),
    useAi: SwaggerDocument.ApiProperty({ type: 'boolean', required: false }),
});
