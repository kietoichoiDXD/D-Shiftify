# Shiftify Backend API Contract

## Base URLs

- Local: `http://localhost:3000/api`
- Production: set `API_PUBLIC_URL=https://api.yourdomain.com`
- Swagger UI: `/docs`
- Health check: `GET /health`
- Readiness check: `GET /ready`

## Common Rules

- Auth: `Authorization: Bearer <accessToken>` unless endpoint is public.
- Content type: `application/json`, except upload endpoints using `multipart/form-data`.
- Error format:

```json
{
  "message": "Validation or domain error",
  "code": "BAD_REQUEST",
  "status": 400,
  "detail": {}
}
```

- Rate limit:
  - Auth-sensitive endpoints: 10 requests/minute per IP + method + path.
  - AI-expensive endpoints: 30 requests/minute per IP + method + path.
  - Response header on limit: `Retry-After`.

## Auth

### `POST /auth/login`

Public. Alias kept: `POST /auth/`.

Request:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response `200`:

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

Public. Creates a candidate user.

Request:

```json
{
  "email": "user@example.com",
  "fullName": "User Name",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Response `201`:

```json
{
  "id": "uuid"
}
```

### `POST /auth/refresh-token`

Public. Alias kept: `POST /auth/refresh`.

Request supports both frontend naming styles:

```json
{
  "refresh_token": "jwt"
}
```

or:

```json
{
  "refreshToken": "jwt"
}
```

Response: same token pair format as login.

### `POST /auth/logout`

Protected. Revokes current access token when Redis is configured.

### `POST /auth/forgot-password`

Public. Generates password reset instructions without revealing whether the email exists.

Request:

```json
{
  "email": "user@example.com"
}
```

Response `200`:

```json
{
  "message": "If this email exists, password reset instructions have been generated"
}
```

In non-production environments only, the response can include `resetToken` for local development/testing.

### `POST /auth/reset-password`

Public.

Request:

```json
{
  "token": "password-reset-token",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

Response `200`:

```json
{
  "passwordReset": true
}
```

## Users

### `GET /users/me`

Protected. Returns the authenticated user profile and roles.

### `PUT /users/`

Protected. Updates the authenticated user.

### `GET /users/:id`

Protected, admin/super-admin only.

## Recruitment / Jobs

### `POST /recruitment/jobs`

Protected, employer role.

Request:

```json
{
  "title": "Customer Support",
  "description": "Job description with at least 20 characters",
  "requiredSkills": ["communication", "crm"],
  "salaryMin": 8000000,
  "salaryMax": 12000000,
  "hasInsurance": true,
  "isRemote": false,
  "locationLat": 10.7769,
  "locationLng": 106.7009,
  "workEnvironment": "Accessible office"
}
```

Response `201`: created job.

### `POST /recruitment/applications`

Protected, candidate/user role.

Request:

```json
{
  "job_id": "uuid"
}
```

Response `201`: created application.

### `POST /recruitment/jobs/:jobId/logo`

Protected, employer role. Employer must own the job. Upload field name: `logo`.

Response `200`:

```json
{
  "jobId": "uuid",
  "logoUrl": "https://...",
  "logoPublicId": "recruitment/company-logos/..."
}
```

Alias exists under `POST /v1/jobs/:jobId/logo`.

## CV / Candidate

### `GET /cv/me`

Protected. Returns current candidate CV/profile.

### `POST /cv`

Protected. Creates current candidate CV/profile.

### `PATCH /cv/me`

Protected. Updates current candidate CV/profile.

### `POST /cv/education`, `PATCH /cv/education/:educationId`, `DELETE /cv/education/:educationId`

Protected. Manages CV education entries.

### `POST /cv/experience`, `PATCH /cv/experience/:experienceId`, `DELETE /cv/experience/:experienceId`

Protected. Manages CV experience entries.

### `GET /candidate/:candidateId`

Protected, employer/admin role. Returns public candidate detail for recruitment review.

## AI Matching

### `GET /ai/match/:profileId?limit=10&minScore=0&explain=false&includeDescription=true`

Protected. Returns explicit job recommendations for a candidate AI profile.

Token behavior:

- Default path uses vector retrieval plus deterministic scoring.
- It does not call Gemini once per job.
- `explain=true` returns a lightweight rule-based explanation.
- LLM-based weights/explanations require explicit backend env flags.

Response `200`:

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
      "finalScore": 82,
      "weights": {
        "skill": 0.4,
        "exp": 0.2,
        "at": 0.25,
        "geo": 0.15,
        "culture_fit": 0
      }
    }
  ],
  "total": 1
}
```

## Chat

### `GET /chat/rooms`

Protected. Returns rooms where the authenticated user is candidate or employer.

### `GET /chat/rooms/:roomId/messages?limit=20&offset=0`

Protected. Returns room messages after membership check.

### Socket.IO

Connect with:

```js
io(API_ORIGIN, {
  auth: { token: accessToken }
})
```

Events:

- Client emits `join_room(roomId, ack)`.
- Client emits `send_message({ roomId, content }, ack)`.
- Server emits `receive_message`.
- Server emits `socket_error`.

## Education

### `POST /education/classes/`

Protected, employer/admin role.

Request:

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

Protected, employer/admin role. `multipart/form-data` upload for class thumbnail.

## Frontend Integration

Use Vite env:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Backend production env:

```env
NODE_ENV=production
API_PUBLIC_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourapp.com
CORS_ORIGINS=https://yourapp.com,https://yourapp.vercel.app
JWT_SECRET=...
JWT_REFRESH_SECRET=...
DB_TYPE=pg
DB_HOST=...
DB_PORT=5432
DB_USER=...
DB_PASS=...
DB_NAME=...
REDIS_URL=...
MONGO_URL=...
```

Do not expose backend secrets with `VITE_`, `NEXT_PUBLIC_`, or other frontend-public prefixes.
