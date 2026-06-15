/**
 * Chat Module — Swagger model registrations.
 */
import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('CreateRoomDto', {
    jobId: SwaggerDocument.ApiProperty({ type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', required: true }),
    candidateId: SwaggerDocument.ApiProperty({ type: 'int', example: 42, required: false }),
});
