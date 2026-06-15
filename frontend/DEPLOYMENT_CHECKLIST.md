# Shiftify Frontend Deployment Checklist

## Environment

Set these values in Vercel:

```env
VITE_API_URL=https://api.your-domain.com/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

## Build Expectations

1. The frontend must call the backend through `VITE_API_URL`.
2. Do not hardcode localhost in production code paths.
3. Keep auth token handling aligned with the backend contract.
4. Use the same API base URL in all client modules.

## Post-Deploy Smoke

1. Load the app in Vercel preview or production.
2. Confirm the API client resolves to the deployed backend.
3. Confirm login or session refresh works.
4. Confirm one protected API call succeeds.

