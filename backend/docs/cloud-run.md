# Shiftify Backend on Google Cloud Run

## Current Connection Status

- Authenticated GCP account detected locally
- Active project: `bdien-muonmay`
- Cloud Run API already enabled
- Existing Cloud Run services already present in the project
- Recommended region for this backend: `asia-southeast1`

## Recommended Architecture

```text
Frontend (Vercel)
        |
        v
Cloud Run Backend
        |
        +-- Supabase PostgreSQL / pgvector
        +-- Firebase Authentication
        +-- Gemini API
        +-- Google Cloud Speech-to-Text
        +-- Google Cloud Text-to-Speech
```

## One-Time Setup

### 1. Set project

```bash
gcloud config set project bdien-muonmay
```

### 2. Create Artifact Registry repository

```bash
gcloud artifacts repositories create shiftify-backend \
  --repository-format=docker \
  --location=asia-southeast1
```

### 3. Grant Cloud Build access to deploy Cloud Run

```bash
PROJECT_NUMBER=228457572181

gcloud projects add-iam-policy-binding bdien-muonmay \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding bdien-muonmay \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 4. Store runtime secrets in Secret Manager

```bash
printf "replace-me" | gcloud secrets create shiftify-jwt-secret --data-file=-
printf "replace-me-too" | gcloud secrets create shiftify-jwt-refresh-secret --data-file=-
printf "postgres://..." | gcloud secrets create shiftify-database-url --data-file=-
printf "https://app.example.com" | gcloud secrets create shiftify-frontend-url --data-file=-
printf "https://app.example.com,https://staging.example.com" | gcloud secrets create shiftify-cors-origins --data-file=-
```

If a secret already exists, use:

```bash
printf "new-value" | gcloud secrets versions add shiftify-jwt-secret --data-file=-
```

## First Deployment

From [backend](/D:/HACKATHON/Shiftify/D-Shiftify/backend):

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _SERVICE_NAME=shiftify-backend,_REGION=asia-southeast1,_REPOSITORY=shiftify-backend,_IMAGE=shiftify-backend
```

Before deploying from `main`, the backend CI gate should already be green:

```text
backend/.github/workflows/backend-ci.yml
```

## Attach Environment Variables and Secrets

After the first deploy, update the service:

```bash
gcloud run services update shiftify-backend \
  --region asia-southeast1 \
  --set-env-vars NODE_ENV=production,PORT=3000,DB_TYPE=pg,TRUST_PROXY=true,API_PUBLIC_URL=https://YOUR_SERVICE_URL \
  --update-secrets JWT_SECRET=shiftify-jwt-secret:latest,JWT_REFRESH_SECRET=shiftify-jwt-refresh-secret:latest,DATABASE_URL=shiftify-database-url:latest,FRONTEND_URL=shiftify-frontend-url:latest,CORS_ORIGINS=shiftify-cors-origins:latest
```

Optional:

```bash
gcloud run services update shiftify-backend \
  --region asia-southeast1 \
  --update-secrets GEMINI_API_KEY=shiftify-gemini-api-key:latest,GROQ_API_KEY=shiftify-groq-api-key:latest,FPT_AI_API_KEY=shiftify-fpt-api-key:latest
```

## Verify

```bash
gcloud run services describe shiftify-backend --region asia-southeast1
```

```bash
SERVICE_URL=$(gcloud run services describe shiftify-backend --region asia-southeast1 --format="value(status.url)")
curl "$SERVICE_URL/health"
curl "$SERVICE_URL/ready"
curl -I "$SERVICE_URL/docs"
```

## PowerShell Shortcut

From Windows PowerShell:

```powershell
.\scripts\deploy-cloud-run.ps1
```

## Important Notes

- This backend still uses its own JWT flow today. Moving fully to Firebase Auth would be a separate auth integration change, not a deployment-only step.
- Cloud Run supports HTTP streaming well; Socket.IO/WebSocket support is possible, but sticky long-lived realtime traffic should be tested carefully against your chat workload.
- Use Supabase connection pooling or a pooler-compatible `DATABASE_URL` for Cloud Run scale-out.
- Keep Cloud Run secrets in Secret Manager; do not store them in GitHub Actions plaintext repo variables.
