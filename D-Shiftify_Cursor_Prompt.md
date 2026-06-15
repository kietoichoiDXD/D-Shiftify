You are a senior NestJS backend engineer specializing in TypeScript, OpenAPI/Swagger documentation, and RESTful API design. You are working on **D-Shiftify** — an AI-powered job platform for visually impaired users built with NestJS + TypeScript.

---

## YOUR MISSION

Fix 4 critical issues in the current Swagger UI and complete the AI module API documentation so the React frontend can successfully call all endpoints.

---

## CURRENT ISSUES (from Swagger UI screenshot)

### Issue 1 — Broken Schema References (red error box at top of Swagger)
```
Could not resolve reference: #/components/schemas/CreateLessonDto
Could not resolve reference: #/components/schemas/ApplyToJobDto
Could not resolve reference: #/components/schemas/CreateJobDto
```
**Root cause:** DTO classes are missing `@ApiProperty()` decorators or not exported from barrel files.

### Issue 2 — AI Endpoints Have Empty Request Body
These endpoints show blank "Request body" in Swagger:
- `POST /ai/chat`
- `POST /ai/session`
- `POST /ai/match-jd`

**Root cause:** Missing `@ApiBody()` decorator and DTO classes in AI controller.

### Issue 3 — All Responses Show Only "Successful operation"
Every single endpoint returns `200: Successful operation` with no schema.
**Root cause:** Missing `@ApiResponse({ type: SomeDto })` decorators throughout.

### Issue 4 — CORS Not Configured for Frontend
Base URL hardcoded as `http://localhost:3000/api`. Frontend on different port/domain will be blocked.
**Root cause:** `app.enableCors()` not configured properly in `main.ts`.

---

## WHAT I NEED YOU TO DO

### Step 1 — Fix broken DTOs
Find and fix these 3 DTO files. Add proper `@ApiProperty()` to every field:
- `CreateJobDto` — job title, description, requiredSkills[], salaryMin, salaryMax, hasInsurance, isRemote, locationLat, locationLng
- `ApplyToJobDto` — jobId, coverLetter (optional)
- `CreateLessonDto` — whatever fields this has

### Step 2 — Create complete AI DTOs
Create `src/ai/dto/ai.dto.ts` with these classes. Each field MUST have `@ApiProperty()` with realistic example values:

**AiChatDto** (POST /ai/chat request):
- `message: string` — user's voice/text input
- `sessionId?: string` (UUID, optional) — for continuing conversation

**AiChatResponseDto** (response):
- `sessionId: string`
- `reply: string` — AI's response text (for TTS)
- `currentStep: string` — enum: intake | resume_building | job_matching | completed
- `profileCompleteness: number` — 0.0 to 1.0
- `missingFields?: string[]`

**CreateAiSessionDto** (POST /ai/session request):
- `language?: string` — enum: vi | en, default vi

**AiSessionResponseDto** (response):
- `sessionId: string`
- `welcomeMessage: string`
- `createdAt: string`
- `expiresAt: string` — 30 minutes TTL

**MatchJdDto** (POST /ai/match-jd request):
- `profileId: string` (UUID, required)
- `structuredWeight?: number` — 0.0-1.0, default 0.5 (α in scoring formula)
- `semanticWeight?: number` — 0.0-1.0, default 0.5 (β in scoring formula)
- `radiusKm?: number` — default 10
- `topK?: number` — default 3

**MatchJdResponseDto** (response):
- `results: JobMatchResultDto[]`
- `total: number`
- `matchedAt: string`

**JobMatchResultDto**:
- `jobId: string`
- `title: string`
- `company: string`
- `score: number` — 0-100
- `accessibilityLevel: string` — enum: A | AA | AAA
- `explanation: string` — plain language for TTS, max 2 sentences
- `distance: string` — e.g. "1.2 km"
- `scoreBreakdown: object` — { skillSim, accessibility, geo, welfare }

### Step 3 — Update AI Controller
Update `src/ai/ai.controller.ts` to add:
- `@ApiTags('AI')`
- `@ApiBearerAuth('access-token')` on the class
- `@ApiOperation({ summary, description })` on each method
- `@ApiBody({ type: XxxDto })` on POST methods
- `@ApiResponse({ status: 200, type: XxxDto })` on every method
- `@ApiResponse({ status: 401, description: 'Unauthorized' })` on all

Also add these 2 missing endpoints that are required by the frontend:
1. `POST /ai/voice` — accepts `multipart/form-data` with `audio` file + optional `sessionId`
2. `GET /ai/match/:profileId/explanation/:jobId` — returns explanation text + TTS audio URL

### Step 4 — Fix main.ts
Update `src/main.ts`:

```typescript
// CORS — allow frontend origins
app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Swagger config
const config = new DocumentBuilder()
  .setTitle('Shiftify Backend API')
  .setDescription('D-Shiftify — AI job platform for visually impaired users')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'access-token'
  )
  .addServer(`http://localhost:${process.env.PORT ?? 3000}/api`, 'Local')
  .addServer(`${process.env.API_URL}/api`, 'Production')
  .build();
```

Also add `swaggerOptions: { persistAuthorization: true }` so the JWT token persists on page refresh.

---

## CONSTRAINTS

- Stack: NestJS + TypeScript + `@nestjs/swagger` + `class-validator` + `class-transformer`
- Do NOT change business logic — only add decorators and create DTO files
- All `@ApiProperty()` must have `example` values that are realistic for a Vietnamese job platform
- Response DTOs must use Vietnamese example values where applicable
- Use `@ApiPropertyOptional()` for optional fields, not `@ApiProperty({ required: false })`
- Every DTO class must be exported from its module's barrel file (`dto/index.ts`)

---

## OUTPUT FORMAT

For each file you create or modify, output:
1. The full file path
2. The complete file content (no truncation)
3. A one-line comment explaining what changed

Start with the file that fixes the red error box first (broken schema references), then proceed in order.

---

## VERIFICATION

After all changes, these commands must pass:

```bash
# No broken references
curl http://localhost:3000/docs/json | python3 -c "
import json, sys
d = json.load(sys.stdin)
schemas = d.get('components', {}).get('schemas', {})
ai_schemas = [k for k in schemas if 'Ai' in k or 'Match' in k or 'Chat' in k]
print('AI schemas found:', ai_schemas)
assert len(ai_schemas) >= 5, 'Missing AI DTO schemas'
print('✅ All AI schemas present')
"

# CORS works
curl -I http://localhost:3000/api/ai/chat \
  -H "Origin: http://localhost:5173" | grep -i "access-control-allow-origin"
# Expected: Access-Control-Allow-Origin: http://localhost:5173

# AI chat endpoint accepts correct body
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d '{"message": "Tôi muốn tìm việc"}' \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
assert 'sessionId' in d
assert 'reply' in d
assert 'profileCompleteness' in d
print('✅ AI chat response shape correct')
"
```
