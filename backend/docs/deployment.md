# Shiftify Backend Deployment

## Repository Assessment

- Framework: Express 4 with a custom module/resolver layer
- Runtime: Node.js 20 (`.nvmrc`)
- Package manager: `npm` is the validated default (`package-lock.json` present)
- Relational database: PostgreSQL via Knex migrations
- Optional services: MongoDB (AI profile storage), Redis (session/rate-limit/token revocation), Cloudinary (media upload)
- Authentication: JWT access token + refresh token, role-based guards, Socket.IO token auth
- Existing deployment style: Dockerfile, docker-compose, Swagger UI at `/docs`, health endpoints at `/health` and `/ready`

## Prerequisites

- Ubuntu 22.04+ or another Linux server with systemd
- Node.js 20.x
- npm 10+
- PostgreSQL 14+
- Optional: Redis 7+, MongoDB 7+, Nginx, PM2

## Required Environment Variables

Copy `.env.example` to `.env` and fill production values.

Core:

```bash
NODE_ENV=production
PORT=3000
HOST=https://api.example.com
API_PUBLIC_URL=https://api.example.com
FRONTEND_URL=https://app.example.com
CORS_ORIGINS=https://app.example.com,https://staging.example.com
TRUST_PROXY=true
JWT_SECRET=replace-with-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
SALT_ROUNDS=10
```

Database, option A:

```bash
DB_TYPE=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=shiftify
DB_PASS=change-me
DB_NAME=shiftify
```

Database, option B:

```bash
DB_TYPE=pg
DATABASE_URL=postgres://shiftify:change-me@127.0.0.1:5432/shiftify
```

Optional services:

```bash
REDIS_URL=redis://127.0.0.1:6379
MONGO_URL=mongodb://127.0.0.1:27017/dshiftify
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN=
GEMINI_API_KEY=
GROQ_API_KEY=
FPT_AI_API_KEY=
VNCORENLP_URL=http://127.0.0.1:9000
GOOGLE_APPLICATION_CREDENTIALS=/opt/shiftify/google-credentials.json
```

## Installation

```bash
git clone https://github.com/dscdut/D-Shiftify.git
cd D-Shiftify/backend
nvm use 20
npm ci
```

## Build

```bash
npm run build
```

## Database Migration

```bash
npm run db:migrate
```

Seed only when you are preparing a non-production environment:

```bash
npm run db:seed
```

## Start Commands

Direct process:

```bash
npm run start:prod
```

PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Docker:

```bash
docker build -t shiftify-backend .
docker run -d \
  --name shiftify-backend \
  --env-file .env \
  -p 3000:3000 \
  shiftify-backend
```

## Reverse Proxy

Example Nginx config: [deploy/nginx.backend.conf](/D:/HACKATHON/Shiftify/D-Shiftify/backend/deploy/nginx.backend.conf)

After copying the file, validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

Build and quality checks:

```bash
npm run lint:check
npm test
npm run build
npm run production:harness
npm audit --audit-level=moderate
npm run db:migrate
```

Runtime checks:

```bash
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/ready
curl -I http://127.0.0.1:3000/docs
npm run smoke
```

GitHub Actions:

- Backend CI workflow: [backend/.github/workflows/backend-ci.yml](/D:/HACKATHON/Shiftify/D-Shiftify/backend/.github/workflows/backend-ci.yml)
- Legacy VPS deploy workflow still exists at [backend/.github/workflows/deploy.yml](/D:/HACKATHON/Shiftify/D-Shiftify/backend/.github/workflows/deploy.yml), but Cloud Run is the preferred production path.

## Troubleshooting

- `Missing production environment variables`: check `.env` and confirm either `DATABASE_URL` or full `DB_*` values exist.
- `Origin is not allowed by CORS`: update `CORS_ORIGINS` to include the real frontend domain and rebuild/restart.
- `JWT_SECRET and JWT_REFRESH_SECRET are required`: both secrets must be set before boot.
- `Database connection error`: verify PostgreSQL is reachable and run `npm run db:migrate`.
- Upload failures: confirm `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- `503 /ready`: the process is still starting, database is unavailable, or graceful shutdown is in progress.
