/**
 * AI Module — Swagger model registrations.
 *
 * Imported once from ai.resolver.js so that all AI schemas are present
 * in the OpenAPI document before SwaggerBuilder serialises the spec.
 */
import { ApiDocument } from 'core/config/swagger.config';
import { SwaggerDocument } from 'packages/swagger';

ApiDocument.addModel('AiChatDto', {
    session_id: SwaggerDocument.ApiProperty({
        type: 'string',
        example: '12345',
        required: true,
    }),
    message: SwaggerDocument.ApiProperty({
        type: 'string',
        example: 'Tôi muốn tìm việc làm tổng đài gần quận 1',
        required: true,
    }),
});

ApiDocument.addModel('AiVoiceDto', {
    session_id: SwaggerDocument.ApiProperty({
        type: 'string',
        example: '12345',
        required: true,
    }),
    audio: SwaggerDocument.ApiProperty({
        type: 'string',
        example: 'base64-encoded-audio-data',
        required: true,
    }),
    encoding: SwaggerDocument.ApiProperty({
        type: 'string',
        example: 'LINEAR16',
        required: false,
    }),
});

ApiDocument.addModel('AiAuditJdDto', {
    jd: SwaggerDocument.ApiProperty({
        type: 'string',
        example: 'Tuyển nhân viên tổng đài, yêu cầu tiếng Anh, làm việc tại Hà Nội...',
        required: true,
    }),
});

ApiDocument.addModel('AiPostJobDto', {
    title: SwaggerDocument.ApiProperty({ type: 'string', example: 'Nhân viên Tổng đài', required: true }),
    description_raw: SwaggerDocument.ApiProperty({ type: 'string', example: 'Mô tả công việc chi tiết...', required: true }),
    required_skills: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false, example: 'Giao tiếp' }),
    salary_min: SwaggerDocument.ApiProperty({ type: 'int', required: false, example: 5000000 }),
    salary_max: SwaggerDocument.ApiProperty({ type: 'int', required: false, example: 10000000 }),
    has_insurance: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    is_remote: SwaggerDocument.ApiProperty({ type: 'bool', required: false }),
    location_lat: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: '10.7769' }),
    location_lng: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: '106.7009' }),
    work_environment: SwaggerDocument.ApiProperty({ type: 'string', required: false, example: 'Văn phòng, linh hoạt' }),
});

ApiDocument.addModel('AiMatchResultDto', {
    data: SwaggerDocument.ApiProperty({ type: 'array', model: 'string', required: false }),
    total: SwaggerDocument.ApiProperty({ type: 'int', example: 5, required: true }),
});
