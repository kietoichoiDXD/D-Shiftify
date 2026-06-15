# Shiftify Backend API

Base URL:

```text
https://api.example.com/api
```

Swagger UI:

```text
https://api.example.com/docs
```

## Common Conventions

- Auth header: `Authorization: Bearer <accessToken>`
- Content type: `application/json` unless the endpoint uses `multipart/form-data`
- Error shape:

```json
{
  "message": "Validation or domain error",
  "code": "BAD_REQUEST",
  "status": 400,
  "detail": {}
}
```

## Health

### `GET /health`

- Authentication: none
- Description: liveness endpoint

Success:

```json
{
  "status": "ok",
  "uptime": 123.45
}
```

### `GET /ready`

- Authentication: none
- Description: readiness endpoint, returns `503` during startup or shutdown

Success:

```json
{
  "status": "ready",
  "uptime": 123.45
}
```

## Auth

### `POST /auth/login`

- Authentication: none
- Request body:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

- Success `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["candidate"]
  },
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "access_token": "jwt",
  "refresh_token": "jwt"
}
```

### `POST /auth/register`

- Authentication: none
- Request body:

```json
{
  "email": "user@example.com",
  "fullName": "User Name",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

- Success `201`:

```json
{
  "id": "uuid"
}
```

### `POST /auth/refresh-token`

- Authentication: none
- Request body:

```json
{
  "refreshToken": "jwt"
}
```

or

```json
{
  "refresh_token": "jwt"
}
```

- Success `200`: same shape as login

### `POST /auth/logout`

- Authentication: bearer token required
- Success `200`:

```json
{
  "logout": true
}
```

### `POST /auth/forgot-password`

- Authentication: none
- Request body:

```json
{
  "email": "user@example.com"
}
```

- Success `200`:

```json
{
  "message": "If this email exists, password reset instructions have been generated"
}
```

### `POST /auth/reset-password`

- Authentication: none
- Request body:

```json
{
  "token": "password-reset-token",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

- Success `200`:

```json
{
  "passwordReset": true
}
```

## Users

### `GET /users/me`

- Authentication: bearer token required
- Success `200`: authenticated user profile with roles

### `PUT /users/`

- Authentication: bearer token required
- Request body example:

```json
{
  "fullName": "Updated Name",
  "phone": "0900000000"
}
```

- Success `204`
- Frontend note: this route is currently guarded by admin role in backend policy.

### `GET /users/:id`

- Authentication: admin or super-admin token required
- Path params:
  - `id`: user UUID

## Media

### `POST /media/images`

- Authentication: bearer token required
- Content type: `multipart/form-data`
- Form fields:
  - `files`: up to 10 files

- Success `200`:

```json
[
  {
    "originalName": "logo.png",
    "url": "https://res.cloudinary.com/.../logo.png",
    "publicId": "media/abc123"
  }
]
```

### `DELETE /media/images`

- Authentication: bearer token required
- Request body:

```json
{
  "ids": ["media/abc123"]
}
```

- Success `200`:

```json
[
  {
    "id": "media/abc123",
    "result": "ok"
  }
]
```

## Recruitment

### `GET /recruitment/jobs`

- Authentication: none
- Query params: `page`, `limit`, `keyword`, `status`, `isRemote`

### `GET /recruitment/jobs/:jobId`

- Authentication: none

### `GET /recruitment/jobs/me`

- Authentication: employer token required

### `GET /recruitment/admin/jobs`

- Authentication: bearer token required
- Frontend note: this is the broad admin list, not the public marketplace list.

### `POST /recruitment/jobs`

- Authentication: employer token required
- Request body:

```json
{
  "title": "Customer Support Specialist",
  "description": "Accessible office-based customer support role with assistive tooling.",
  "requiredSkills": ["communication", "crm"],
  "salaryMin": 8000000,
  "salaryMax": 12000000,
  "hasInsurance": true,
  "isRemote": false,
  "locationLat": 10.7769,
  "locationLng": 106.7009,
  "workEnvironment": "Wheelchair accessible office"
}
```

- Success `201`: created job object

### `PATCH /recruitment/jobs/:jobId`

- Authentication: employer token required

### `DELETE /recruitment/jobs/:jobId`

- Authentication: employer token required
- Success `200`:

```json
{
  "deleted": true
}
```

### `POST /recruitment/jobs/:jobId/logo`

- Authentication: employer token required
- Content type: `multipart/form-data`
- Form fields:
  - `logo`: image file

- Success `200`:

```json
{
  "jobId": "uuid",
  "logoUrl": "https://res.cloudinary.com/.../logo.png",
  "logoPublicId": "recruitment/company-logos/abc123"
}
```

### `GET /recruitment/jobs/:jobId/applicants`

- Authentication: employer token required

### `GET /recruitment/applications/me`

- Authentication: candidate token required

### `POST /recruitment/applications`

- Authentication: candidate token required
- Request body:

```json
{
  "job_id": "uuid"
}
```

- Success `201`: created application object

### `PATCH /recruitment/applications/:applicationId/status`

- Authentication: employer token required
- Request body:

```json
{
  "status": "accepted"
}
```

## v1 Job Aliases

These routes are compatibility aliases over the same recruitment logic:

- `GET /v1/jobs`
- `GET /v1/jobs/:jobId`
- `POST /v1/jobs`
- `PATCH /v1/jobs/:jobId`
- `DELETE /v1/jobs/:jobId`
- `POST /v1/jobs/:jobId/logo`
- `GET /v1/recruiter/jobs`
- `GET /v1/admin/jobs`

## CV

### `GET /cv/me`

- Authentication: bearer token required

### `POST /cv`

- Authentication: bearer token required
- Request body example:

```json
{
  "headline": "Frontend Developer with accessibility focus",
  "summary": "Three years of React experience and inclusive design practice.",
  "skills": ["React", "TypeScript", "WCAG"],
  "education": [],
  "experience": []
}
```

- Success `201`: created CV/profile object

### `PATCH /cv/me`

- Authentication: bearer token required

### `POST /cv/education`

- Authentication: bearer token required

### `PATCH /cv/education/:educationId`

- Authentication: bearer token required

### `DELETE /cv/education/:educationId`

- Authentication: bearer token required

### `POST /cv/experience`

- Authentication: bearer token required

### `PATCH /cv/experience/:experienceId`

- Authentication: bearer token required

### `DELETE /cv/experience/:experienceId`

- Authentication: bearer token required

## Candidate

### `GET /candidate/profile`

- Authentication: bearer token required

### `GET /candidate/alerts`

- Authentication: bearer token required

### `GET /candidate/:candidateId`

- Authentication: employer or admin token required
- Path params:
  - `candidateId`: user UUID

## AI

### `POST /ai/chat`

- Authentication: bearer token required
- Request body:

```json
{
  "session_id": "authenticated-user-id",
  "message": "Suggest suitable jobs for me"
}
```

### `POST /ai/voice`

- Authentication: bearer token required

### `GET /ai/voice/stream`

- Authentication: bearer token required
- Query params:
  - `text`: URL-encoded text

### `POST /ai/audit-jd`

- Authentication: employer token required
- Request body:

```json
{
  "jd": "Raw job description text"
}
```

### `POST /ai/jobs`

- Authentication: employer token required

### `GET /ai/jobs/:id/skill-gap`

- Authentication: bearer token required
- Query params:
  - `score`: optional numeric threshold

### `GET /ai/match/:profileId`

- Authentication: bearer token required
- Query params:
  - `limit`: optional number
  - `minScore`: optional number
  - `explain`: optional boolean, returns rule-based explanation without extra LLM calls
  - `includeDescription`: optional boolean, defaults to `true`

- Token note: this endpoint uses embedding/vector retrieval plus deterministic scoring by default. It does not call Gemini once per job unless `AI_MATCH_USE_LLM_WEIGHTS=true` or `AI_MATCH_USE_LLM_EXPLANATIONS=true` is explicitly enabled.

- Success `200`:

```json
{
  "data": [
    {
      "jobId": "uuid",
      "title": "Accessible React Developer",
      "requiredSkills": ["React", "WCAG"],
      "salaryMin": 1000,
      "salaryMax": 2000,
      "isRemote": true,
      "accessibilityLevel": "AA",
      "finalScore": 82
    }
  ],
  "total": 1
}
```

### `GET /ai/market-trends`

- Authentication: bearer token required

### `DELETE /ai/session/:id`

- Authentication: bearer token required

## Chat

### `GET /chat/rooms`

- Authentication: bearer token required

### `POST /chat/rooms`

- Authentication: bearer token required
- Request body:

```json
{
  "candidateId": "uuid",
  "employerId": "uuid",
  "jobId": "uuid"
}
```

### `GET /chat/rooms/:roomId/messages`

- Authentication: bearer token required
- Query params:
  - `limit`: default `20`
  - `offset`: default `0`

### Socket.IO

Connect with:

```js
io(API_ORIGIN, {
  auth: { token: accessToken }
})
```

Events:

- client: `join_room(roomId, ack)`
- client: `send_message({ roomId, content }, ack)`
- server: `receive_message`
- server: `socket_error`

## Education

### `POST /education/classes/`

- Authentication: employer or admin token required
- Request body:

```json
{
  "title": "Digital Skills 101",
  "description": "Introductory class description",
  "level": "Beginner",
  "category": "Technology",
  "startDate": "2026-06-01T09:00:00Z",
  "endDate": "2026-07-01T09:00:00Z",
  "maxStudents": 30,
  "status": "DRAFT"
}
```

### `POST /education/classes/thumbnail`

- Authentication: employer or admin token required
- Content type: `multipart/form-data`
- Form fields:
  - `thumbnail`: image file

## Error Examples

Unauthorized:

```json
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED",
  "status": 401
}
```

Forbidden:

```json
{
  "message": "Permission denied",
  "code": "FORBIDDEN",
  "status": 403
}
```

Validation:

```json
{
  "message": "Validation failed",
  "code": "BAD_REQUEST",
  "status": 400,
  "detail": {
    "field": "email"
  }
}
```
