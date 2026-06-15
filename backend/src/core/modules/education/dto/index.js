import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

// Register Swagger models here (not in individual DTO files) to avoid
// circular-import issues when swagger.config is the same singleton
// that DTO files try to import at module-evaluation time.
ApiDocument.addModel('CreateClassDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Introduction to React' }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'A comprehensive React course for beginners.' }),
    level: SwaggerDocument.ApiProperty({ type: 'string', example: 'beginner' }),
    category: SwaggerDocument.ApiProperty({ type: 'string', example: 'Frontend' }),
    startDate: SwaggerDocument.ApiProperty({ type: 'dateTime', example: '2026-06-01T08:00:00Z' }),
    endDate: SwaggerDocument.ApiProperty({ type: 'dateTime', example: '2026-08-31T18:00:00Z' }),
    maxStudents: SwaggerDocument.ApiProperty({ type: 'int', example: 30 }),
    status: SwaggerDocument.ApiProperty({ type: 'string', example: 'DRAFT', required: false }),
});

ApiDocument.addModel('UpdateClassDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Advanced React', required: false }),
    description: SwaggerDocument.ApiProperty({ type: 'string', example: 'Updated description.', required: false }),
    level: SwaggerDocument.ApiProperty({ type: 'string', example: 'advanced', required: false }),
    category: SwaggerDocument.ApiProperty({ type: 'string', example: 'Frontend', required: false }),
    startDate: SwaggerDocument.ApiProperty({ type: 'dateTime', example: '2026-06-01T08:00:00Z', required: false }),
    endDate: SwaggerDocument.ApiProperty({ type: 'dateTime', example: '2026-08-31T18:00:00Z', required: false }),
    maxStudents: SwaggerDocument.ApiProperty({ type: 'int', example: 50, required: false }),
    status: SwaggerDocument.ApiProperty({ type: 'string', example: 'PUBLISHED', required: false }),
});

export * from './create-class.dto';
