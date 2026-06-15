# Shiftify Backend Deployment Checklist

## Architecture Snapshot

- Frontend: Vercel
- Backend: Google Cloud Run
- Database: Supabase PostgreSQL with `pgvector`
- Auth: Firebase Authentication
- AI: Google Gemini API
- Speech: Google Cloud Speech-to-Text / Text-to-Speech

## Pre-Deploy

1. Run `npm test`.
2. Run `npm run lint:check`.
3. Run `npm run build`.
4. Run `npm run production:harness`.
5. Run `npm run db:migrate` against the target database.
6. Confirm `DATABASE_URL` points to Supabase PostgreSQL.
7. Confirm `JWT_SECRET` and `JWT_REFRESH_SECRET` are set.
8. Confirm `FRONTEND_URL` and `CORS_ORIGINS` match the deployed Vercel domains.
9. Confirm `TRUST_PROXY=true` for Cloud Run.
10. Confirm `GEMINI_API_KEY` is available to the backend.

## Cloud Run

1. Build the image from `backend/Dockerfile`.
2. Push the image to Artifact Registry.
3. Deploy to Cloud Run in `asia-southeast1`.
4. Use port `8080`.
5. Prefer Secret Manager or service identity for Google credentials.
6. Do not rely on a plain `GOOGLE_APPLICATION_CREDENTIALS` env var in Cloud Run.

## Supabase

1. Enable `pgvector` if AI embeddings or similarity search are used.
2. Apply migrations in order.
3. Verify the app can read/write via the production connection string.
4. Keep RLS and storage policy decisions aligned with product access rules if Supabase features are expanded later.

## Firebase Auth Migration Notes

1. Backend token verification should use Firebase Admin SDK `verifyIdToken`.
2. Frontend should send the Firebase ID token in the `Authorization` header.
3. Backend auth guards should map Firebase identity to internal roles or user records.

## Smoke Test

1. `GET /health`
2. `GET /ready`
3. `GET /docs`
4. One public auth route
5. One protected write route

## Official References

- Cloud Run env vars and secrets: https://cloud.google.com/run/docs/configuring/services/environment-variables
- Firebase Admin verify ID tokens: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Supabase pgvector: https://supabase.com/docs/guides/database/extensions/pgvector
