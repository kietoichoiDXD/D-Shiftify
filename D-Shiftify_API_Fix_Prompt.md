# D-Shiftify Backend — API Fix & Swagger Completion Prompt
> Dành cho: Backend Developer (Angtygravy hoặc bất kỳ dev nào nhận task này)
> Stack: NestJS + TypeScript + Swagger (OpenAPI 3.0)
> Mục tiêu: Fix toàn bộ lỗi Swagger + bổ sung DTO để Frontend call được

---

## CONTEXT — Tình trạng hiện tại

Swagger UI tại `http://localhost:3000/docs` đang có **4 vấn đề nghiêm trọng**:

1. **Broken schema references** — hộp đỏ đầu trang:
   ```
   Could not resolve reference: #/components/schemas/CreateLessonDto
   Could not resolve reference: #/components/schemas/ApplyToJobDto
   Could not resolve reference: #/components/schemas/CreateJobDto
   ```

2. **AI endpoints thiếu Request Body** — `POST /ai/chat`, `POST /ai/session`,
   `POST /ai/match-jd` hiển thị "Request body" trống → Frontend không biết gửi gì

3. **Response schema rỗng** — mọi endpoint chỉ trả `200: Successful operation`,
   không có shape → Frontend phải đoán mò khi parse response

4. **CORS chưa đúng** — base URL `http://localhost:3000/api` hardcode,
   Frontend deploy lên domain khác sẽ bị block

---

## TASK 1 — Fix Broken Schema References

### Vấn đề
NestJS Swagger không tìm thấy DTO class vì thiếu `@ApiProperty()` hoặc chưa được
export đúng trong barrel file.

### Fix

**Bước 1** — Kiểm tra 3 file DTO bị lỗi:
```bash
# Tìm file DTO
find ./src -name "*.dto.ts" | xargs grep -l "CreateLesson\|ApplyToJob\|CreateJob"
```

**Bước 2** — Thêm `@ApiProperty()` vào từng field:
```typescript
// src/recruitment/dto/create-job.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ example: 'Nhân viên Tổng đài', description: 'Tên vị trí tuyển dụng' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Mô tả công việc chi tiết...', description: 'Toàn bộ JD gốc' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['Giao tiếp', 'Tiếng Anh'], description: 'Kỹ năng yêu cầu' })
  @IsArray()
  requiredSkills: string[];

  @ApiPropertyOptional({ example: 5000000 })
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasInsurance: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isRemote: boolean;

  @ApiPropertyOptional({ example: 10.776530 })
  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @ApiPropertyOptional({ example: 106.700981 })
  @IsNumber()
  @IsOptional()
  locationLng?: number;
}
```

```typescript
// src/recruitment/dto/apply-to-job.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyToJobDto {
  @ApiProperty({ example: 'uuid-of-job', description: 'ID của job muốn ứng tuyển' })
  jobId: string;

  @ApiPropertyOptional({ example: 'Thư giới thiệu của tôi...' })
  coverLetter?: string;
}
```

**Bước 3** — Export từ barrel file:
```typescript
// src/recruitment/dto/index.ts
export * from './create-job.dto';
export * from './apply-to-job.dto';
export * from './update-job.dto';
```

---

## TASK 2 — Bổ sung DTO cho toàn bộ AI endpoints

Đây là phần **quan trọng nhất** — AI endpoints là core của D-Shiftify nhưng
hiện tại Request Body hoàn toàn trống.

### 2.1 — Tạo AI DTO file

```typescript
// src/ai/dto/ai.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

// ── Chat ─────────────────────────────────────────────────────────────────────
export class AiChatDto {
  @ApiProperty({
    example: 'Tôi muốn tìm việc làm tổng đài gần quận 1',
    description: 'Tin nhắn của người dùng gửi cho AI agent'
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Session ID để duy trì ngữ cảnh hội thoại. Bỏ trống nếu là lần đầu.'
  })
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class AiChatResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sessionId: string;

  @ApiProperty({ example: 'Bạn đang muốn tìm việc ở khu vực nào?' })
  reply: string;

  @ApiProperty({ example: 'intake', enum: ['intake', 'resume_building', 'job_matching', 'completed'] })
  currentStep: string;

  @ApiProperty({ example: 0.45, description: 'Độ hoàn thiện profile 0.0 → 1.0' })
  profileCompleteness: number;

  @ApiPropertyOptional({ example: ['experience', 'education'], description: 'Các trường còn thiếu' })
  missingFields?: string[];
}

// ── Session ───────────────────────────────────────────────────────────────────
export class CreateAiSessionDto {
  @ApiPropertyOptional({
    example: 'vi',
    description: 'Ngôn ngữ hội thoại. Mặc định: vi',
    enum: ['vi', 'en']
  })
  @IsOptional()
  @IsString()
  language?: string;
}

export class AiSessionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sessionId: string;

  @ApiProperty({ example: 'Xin chào! Tôi là trợ lý tuyển dụng AI...' })
  welcomeMessage: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-05-01T10:30:00.000Z', description: 'Session hết hạn sau 30 phút' })
  expiresAt: string;
}

// ── Match JD ─────────────────────────────────────────────────────────────────
export class MatchJdDto {
  @ApiProperty({
    example: 'uuid-of-profile',
    description: 'Profile ID của ứng viên cần match'
  })
  @IsUUID()
  profileId: string;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Weight cho structured matching (0.0-1.0). α + β = 1. Default: 0.5',
    minimum: 0, maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0) @Max(1)
  structuredWeight?: number;  // α

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Weight cho semantic matching (0.0-1.0). Default: 0.5',
    minimum: 0, maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0) @Max(1)
  semanticWeight?: number;    // β

  @ApiPropertyOptional({
    example: 10,
    description: 'Bán kính tìm kiếm tính bằng km. Default: 10km'
  })
  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Số lượng kết quả trả về. Default: 3 (voice), 10 (web)'
  })
  @IsOptional()
  @IsNumber()
  topK?: number;
}

export class JobMatchResultDto {
  @ApiProperty({ example: 'uuid-of-job' })
  jobId: string;

  @ApiProperty({ example: 'Nhân viên Tổng đài' })
  title: string;

  @ApiProperty({ example: 'Viettel Telecom' })
  company: string;

  @ApiProperty({ example: 85, description: 'Matching score 0-100' })
  score: number;

  @ApiProperty({ example: 'AA', enum: ['A', 'AA', 'AAA'] })
  accessibilityLevel: string;

  @ApiProperty({
    example: 'Công việc này phù hợp vì công ty hỗ trợ screen reader và kỹ năng tổng đài của bạn rất khớp.',
    description: 'Giải thích bằng ngôn ngữ tự nhiên để đọc qua TTS'
  })
  explanation: string;

  @ApiProperty({ example: '1.2 km' })
  distance: string;

  @ApiProperty({ example: { skillSim: 88, accessibility: 95, geo: 90, welfare: 80 } })
  scoreBreakdown: {
    skillSim: number;
    accessibility: number;
    geo: number;
    welfare: number;
  };
}

export class MatchJdResponseDto {
  @ApiProperty({ type: [JobMatchResultDto] })
  results: JobMatchResultDto[];

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  matchedAt: string;
}
```

### 2.2 — Cập nhật AI Controller

```typescript
// src/ai/ai.controller.ts
import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiBody, ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import {
  AiChatDto, AiChatResponseDto,
  CreateAiSessionDto, AiSessionResponseDto,
  MatchJdDto, MatchJdResponseDto
} from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {

  constructor(private readonly aiService: AiService) {}

  // ── POST /ai/chat ──────────────────────────────────────────────────────────
  @Post('chat')
  @ApiOperation({
    summary: 'Gửi tin nhắn cho AI agent',
    description: `
      Endpoint chính để tương tác với Intake Agent.
      - Lần đầu: không cần sessionId, hệ thống tự tạo session mới
      - Các lần tiếp theo: gửi kèm sessionId để duy trì ngữ cảnh
      - AI sẽ hỏi lại nếu thông tin chưa đủ (Dynamic Prompting)
      - Khi profileCompleteness >= 0.6, AI tự động chuyển sang bước match job
    `
  })
  @ApiBody({ type: AiChatDto })
  @ApiResponse({ status: 200, type: AiChatResponseDto, description: 'AI phản hồi thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized — thiếu JWT token' })
  async chat(@Body() dto: AiChatDto): Promise<AiChatResponseDto> {
    return this.aiService.chat(dto);
  }

  // ── POST /ai/session ───────────────────────────────────────────────────────
  @Post('session')
  @ApiOperation({
    summary: 'Tạo session hội thoại mới',
    description: 'Khởi tạo session mới với LangGraph state. TTL = 30 phút.'
  })
  @ApiBody({ type: CreateAiSessionDto })
  @ApiResponse({ status: 201, type: AiSessionResponseDto })
  async createSession(@Body() dto: CreateAiSessionDto): Promise<AiSessionResponseDto> {
    return this.aiService.createSession(dto);
  }

  // ── GET /ai/session ────────────────────────────────────────────────────────
  @Get('session')
  @ApiOperation({
    summary: 'Lấy session hiện tại của user',
    description: 'Trả về session đang active (nếu chưa hết TTL 30 phút)'
  })
  @ApiResponse({ status: 200, type: AiSessionResponseDto })
  @ApiResponse({ status: 404, description: 'Không có session active' })
  async getSession(): Promise<AiSessionResponseDto> {
    return this.aiService.getSession();
  }

  // ── GET /ai/session/stream ─────────────────────────────────────────────────
  @Get('session/stream')
  @ApiOperation({
    summary: 'Stream phản hồi AI theo thời gian thực (SSE)',
    description: `
      Server-Sent Events endpoint.
      Frontend subscribe bằng EventSource API:
      \`\`\`js
      const es = new EventSource('/api/ai/session/stream', {
        headers: { Authorization: 'Bearer <token>' }
      });
      es.onmessage = (e) => console.log(JSON.parse(e.data));
      \`\`\`
    `
  })
  @ApiResponse({ status: 200, description: 'SSE stream — text/event-stream' })
  streamSession() {
    return this.aiService.streamSession();
  }

  // ── POST /ai/match-jd ──────────────────────────────────────────────────────
  @Post('match-jd')
  @ApiOperation({
    summary: 'Trigger Job Matching cho profile',
    description: `
      Chạy Hybrid Matching Engine (2 lớp):
      - Layer 1 (Structured): skill match × 0.40 + accessibility × 0.25 + geo × 0.20 + welfare × 0.15
      - Layer 2 (Semantic): cosine_similarity(narrative_raw, description_raw)
      - Final = α × structured + β × semantic

      ⚠️ Yêu cầu: Profile phải có embedding_vector (narrative_raw đã được embed).
      Nếu chưa có → trả về 422 với hướng dẫn hoàn thiện profile trước.
    `
  })
  @ApiBody({ type: MatchJdDto })
  @ApiResponse({ status: 200, type: MatchJdResponseDto })
  @ApiResponse({ status: 422, description: 'Profile chưa đủ thông tin hoặc chưa được embed' })
  async matchJd(@Body() dto: MatchJdDto): Promise<MatchJdResponseDto> {
    return this.aiService.matchJd(dto);
  }

  // ── GET /ai/match/:profileId ───────────────────────────────────────────────
  @Get('match/:profileId')
  @ApiOperation({
    summary: 'Lấy kết quả match đã lưu của profile',
    description: 'Trả về cached matching results. Không tính lại score.'
  })
  @ApiParam({ name: 'profileId', type: 'string', description: 'UUID của profile' })
  @ApiResponse({ status: 200, type: MatchJdResponseDto })
  async getMatchResults(@Param('profileId') profileId: string): Promise<MatchJdResponseDto> {
    return this.aiService.getMatchResults(profileId);
  }

  // ── DELETE /ai/sessions/:id ────────────────────────────────────────────────
  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Xóa session theo ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Session đã được xóa' })
  async deleteSession(@Param('id') id: string) {
    return this.aiService.deleteSession(id);
  }
}
```

---

## TASK 3 — Fix Response Schema cho tất cả endpoints

Thêm Response DTO cho các module còn lại:

```typescript
// src/candidate/dto/candidate-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CandidateProfileDto {
  @ApiProperty({ example: 'uuid' })
  userId: string;

  @ApiProperty({ example: ['Giao tiếp', 'Tiếng Anh'] })
  hardSkills: string[];

  @ApiProperty({ example: ['Chăm chỉ', 'Kiên nhẫn'] })
  softSkills: string[];

  @ApiProperty({ example: ['screen_reader', 'voice_control'] })
  accessibilityNeeds: string[];

  @ApiProperty({ example: 0.75, description: 'Độ hoàn thiện profile 0.0 → 1.0' })
  profileCompleteness: number;

  @ApiProperty({ example: 'Tôi hay dùng điện thoại để nghe nhạc...' })
  narrativeRaw: string;
}

// Áp dụng vào controller:
// @ApiResponse({ status: 200, type: CandidateProfileDto })
```

---

## TASK 4 — Fix CORS và Server Config

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:5173',   // Vite dev
      'http://localhost:3001',   // React dev fallback
      process.env.FRONTEND_URL, // Production URL từ env
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global validation ──────────────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api');

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Shiftify Backend API')
    .setDescription(`
      D-Shiftify Backend API — Hệ thống AI hỗ trợ việc làm cho người khiếm thị.
      
      ## Authentication
      Hầu hết endpoints yêu cầu JWT Bearer token.
      Lấy token từ \`POST /api/auth/\` (login) hoặc \`POST /api/auth/signup\`.
      
      ## AI Workflow
      1. POST /api/ai/session → tạo session
      2. POST /api/ai/chat → hội thoại với Intake Agent
      3. POST /api/ai/match-jd → trigger job matching
      4. GET /api/ai/match/{profileId} → xem kết quả
    `)
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token'
    )
    .addServer(
      `http://localhost:${process.env.PORT ?? 3000}/api`,
      'Local Development'
    )
    .addServer(
      `${process.env.API_URL ?? 'https://api.dshiftify.com'}/api`,
      'Production'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,  // Giữ token sau khi refresh trang
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`📚 Swagger: http://localhost:${process.env.PORT ?? 3000}/docs`);
}

bootstrap();
```

---

## TASK 5 — Thêm endpoint còn thiếu so với AI Architecture

Các endpoint trong AI Context Document chưa có trong Swagger:

```typescript
// Thêm vào ai.controller.ts

// POST /ai/voice — nhận audio blob → STT → Intake Agent
@Post('voice')
@ApiOperation({ summary: 'Upload audio → chuyển thành text → gửi Intake Agent' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      audio: { type: 'string', format: 'binary', description: 'File audio (webm, wav, mp3)' },
      sessionId: { type: 'string', description: 'Session ID (optional)' },
    },
    required: ['audio']
  }
})
@ApiResponse({ status: 200, type: AiChatResponseDto })
async voiceChat(@Body() body: any) {
  return this.aiService.voiceChat(body);
}

// GET /ai/match/:profileId/explanation/:jobId
@Get('match/:profileId/explanation/:jobId')
@ApiOperation({
  summary: 'Lấy giải thích chi tiết cho 1 job cụ thể',
  description: 'Trả về explanation text để đọc qua TTS'
})
@ApiParam({ name: 'profileId', type: 'string' })
@ApiParam({ name: 'jobId', type: 'string' })
@ApiResponse({
  status: 200,
  schema: {
    properties: {
      explanation: { type: 'string', example: 'Công việc này phù hợp vì...' },
      audioUrl: { type: 'string', example: 'https://tts.googleapis.com/...' },
      score: { type: 'number', example: 85 }
    }
  }
})
async getExplanation(
  @Param('profileId') profileId: string,
  @Param('jobId') jobId: string,
) {
  return this.aiService.getExplanation(profileId, jobId);
}
```

---

## CHECKLIST FIX — Thứ tự thực hiện

```
□ 1. Fix 3 broken DTO (CreateJobDto, ApplyToJobDto, CreateLessonDto)
     → Chạy lại server, hộp đỏ phải biến mất

□ 2. Tạo src/ai/dto/ai.dto.ts với đủ 6 DTO classes

□ 3. Cập nhật ai.controller.ts với @ApiBody() + @ApiResponse()

□ 4. Fix main.ts: CORS + addBearerAuth + addServer

□ 5. Thêm @ApiResponse() type cho candidate, recruitment, CV

□ 6. Thêm POST /ai/voice endpoint

□ 7. Thêm GET /ai/match/:profileId/explanation/:jobId

□ 8. Test: curl -X POST http://localhost:3000/api/ai/chat \
          -H "Authorization: Bearer <token>" \
          -H "Content-Type: application/json" \
          -d '{"message": "Tôi muốn tìm việc"}' \
          → Phải nhận được AiChatResponseDto shape
```

---

## VERIFY — Sau khi fix xong

Chạy lệnh này để verify Frontend call được:
```bash
# 1. Kiểm tra không còn lỗi broken schema
curl http://localhost:3000/docs/json | python3 -c "
import json,sys
d=json.load(sys.stdin)
schemas=d.get('components',{}).get('schemas',{})
print('Schemas count:', len(schemas))
print('AI schemas:', [k for k in schemas if 'Ai' in k or 'Match' in k])
"

# 2. Test AI chat endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Tôi muốn tìm việc gần quận 1"}'

# 3. Test CORS header
curl -I http://localhost:3000/api/ai/chat \
  -H "Origin: http://localhost:5173" \
  | grep -i "access-control"
# Expected: Access-Control-Allow-Origin: http://localhost:5173
```

---

*Tài liệu này được tạo dựa trên phân tích Swagger UI của D-Shiftify backend*
*Stack: NestJS + TypeScript + @nestjs/swagger + class-validator*
