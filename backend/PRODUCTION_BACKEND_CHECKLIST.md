# Shiftify Backend Production Checklist

Last audit: 2026-06-02

## Professional References Used

- OWASP API Security Top 10 2023: https://owasp.org/www-project-api-security/
- Express production security best practices: https://expressjs.com/en/advanced/best-practice-security.html
- Express production performance and reliability best practices: https://expressjs.com/en/advanced/best-practice-performance.html
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html

## Current Production Baseline

- API documentation: Swagger at `/docs` and contract notes in `API_CONTRACT.md`.
- Health checks: `/health` for liveness and `/ready` for readiness/load-balancer gating.
- Security headers: `helmet` enabled and `x-powered-by` disabled.
- Response compression: `compression` enabled.
- CORS: whitelist-only via `CORS_ORIGINS`/`FRONTEND_URL`, credentials enabled.
- Auth: JWT access/refresh token flow, token revocation on logout, socket auth.
- Authorization: role guards on employer/admin/candidate business routes.
- Input validation: Zod/Joi-style interceptors across auth, recruitment, chat, education, AI.
- Rate limiting: auth-sensitive and AI-expensive route buckets with Redis fallback support.
- Database: Knex migrations, soft-delete support for production job listings.
- Shutdown: SIGINT/SIGTERM graceful shutdown closes Socket.IO, HTTP, and database.
- Verification: `npm test`, `npm run build`, `npm run lint:check`, `npm audit --audit-level=moderate`.

## Backend Logic Checklist

### Auth and User

- [x] `POST /api/auth/login`
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/refresh` and `/refresh-token`
- [x] `POST /api/auth/logout`
- [x] `POST /api/auth/forgot-password`
- [x] `POST /api/auth/reset-password`
- [x] `GET /api/users/me`
- [x] Password hashing with configurable `SALT_ROUNDS`
- [x] JWT secrets required at boot
- [x] Auth endpoint rate limiting
- [ ] Add integration tests for login/register/refresh/logout against a test database

### Recruitment, Job, Application

- [x] Public job listing/detail
- [x] Employer create/update/delete own jobs
- [x] Recruiter jobs alias under `/api/v1/recruiter/jobs`
- [x] Admin jobs alias under `/api/v1/admin/jobs`
- [x] Candidate apply for job
- [x] Candidate application list
- [x] Employer applicants and accept/reject
- [x] Candidate detail endpoint for employer/admin review
- [x] Company logo upload endpoint for employer-owned jobs
- [x] Duplicate application prevention
- [x] Soft delete for production job records
- [ ] Add integration tests for RBAC, ownership, status transition, and duplicate application race

### CV and Candidate Profile

- [x] `GET /api/cv/me`
- [x] `POST /api/cv`
- [x] `PATCH /api/cv/me`
- [x] Education add/update/delete
- [x] Experience add/update/delete
- [x] Candidate profile read and alerts
- [x] Route-level validation interceptors for CV body payloads
- [ ] Add integration tests for create/update CV and JSON field formatting

### Chat and Socket

- [x] Room list/create
- [x] Message history
- [x] Socket JWT authentication
- [x] Join room membership check
- [x] Send message persistence and realtime broadcast
- [x] Socket CORS whitelist
- [ ] Add socket integration tests for unauthorized join/send and successful broadcast

### Education

- [x] Create class
- [x] Validate class payload
- [x] Thumbnail upload
- [x] Role guard for employer/admin
- [ ] Add integration tests for upload limits and invalid MIME handling

### AI, Matching, STT, TTS

- [x] Explicit job recommendation endpoint: `GET /api/ai/match/:profileId`
- [x] AI chat and voice endpoints
- [x] JD audit
- [x] Skill gap and market trend endpoints
- [x] TTS streaming
- [x] STT support through Groq
- [x] Expensive AI route rate limiting
- [ ] Move heavyweight AI calls to background jobs when latency exceeds gateway timeout budget
- [ ] Add mocks/tests for AI fallback behavior and missing API keys

### Environment and Deployment

- [x] Production env validation for database/frontend URL
- [x] CORS origin config
- [x] Redis optional support for rate limit/session/revocation
- [x] Sentry optional error reporting
- [x] Cloudinary env support for uploads
- [x] Add CI job that runs `knex migrate:latest`/`migrate:rollback` against a disposable database
- [ ] Add staging smoke test that hits `/health`, `/ready`, `/docs`, auth, job listing, and upload

## Release Gate

Before merging/deploying backend, all commands below should pass:

```bash
npm test
npm run lint:check
npm run build
npm run production:harness
npm audit --audit-level=moderate
npm run knex migrate:latest
```

For production/staging, verify:

- `NODE_ENV=production`
- `FRONTEND_URL` and `CORS_ORIGINS` are real HTTPS frontend origins
- `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong and not exposed to frontend
- `DB_*` or database connection config points to the production database
- `REDIS_URL` is configured when running multiple backend instances
- `TRUST_PROXY=true` when behind a reverse proxy/load balancer
- Upload credentials and AI keys are configured only on backend
