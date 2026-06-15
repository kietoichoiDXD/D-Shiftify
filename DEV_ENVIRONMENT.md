# D-Shiftify Backend Developer Environment Setup Guide

This guide describes how to set up, run, seed, and verify the backend development environment for the D-Shiftify platform.

## 1. Prerequisites

Ensure you have the following installed on your local machine:
- **NodeJS** (v18 or newer, recommended v20+)
- **npm** (v9+ or yarn)
- **PostgreSQL** (with pgvector extension enabled)
- **MongoDB** (optional, for persistent AI profiles, falls back to Redis)
- **Redis** (optional, for session stores and fast caches)

---

## 2. Environment Configuration

1. In the `backend` folder, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the values:
   - **PostgreSQL (Knex & PG)**: Set `DATABASE_URL` (e.g. `postgresql://user:pass@localhost:5432/dbname`) and DB_* variables.
   - **Gemini API Key**: Set `GEMINI_API_KEY` (mandatory for AI features).
   - **CORS Configuration**: Set `CORS_ALLOW=*` and `CORS_ORIGINS=*`.
   - **Other Credentials**: If using MongoDB, set `MONGO_URL`. If using Redis, set `REDIS_URL`. If using Speech-to-Text / Text-to-Speech fallbacks, set `FPT_AI_API_KEY` or `GROQ_API_KEY`.

---

## 3. Installing Dependencies

Navigate to the `backend` directory and run:
```bash
npm install
```

---

## 4. Database Initialization

Run database migrations to initialize PostgreSQL schemas:
```bash
npm run db:migrate
```
Run seed files to populate reference and initial test data:
```bash
npm run db:seed
```

---

## 5. Running the Application

To start the development server with hot reload (using nodemon & Babel):
```bash
npm run dev
```
The server will start at the port configured in `.env` (default is `3000`).

To access the API Swagger documentation, open:
`http://localhost:3000/docs/`

---

## 6. Verifying the Gemini Connection

To verify that the Gemini API is correctly connected and generating 768-dimensional embeddings, run:
```bash
npx babel-node test_gemini.js
```
Expected output:
```text
Testing Gemini Text Generation (analystModel)...
Gemini Response: Mục tiêu của Shiftify là...

Testing Gemini Text Embedding (embedText)...
Embedding Success! Vector length: 768
```

---

## 7. Running Unit & Integration Tests

Ensure the entire test suite compiles and runs successfully:
```bash
npm run test
```

---

## 8. AI Features Architecture

D-Shiftify leverages LangGraph and Gemini models (`gemini-2.5-flash` and `gemini-embedding-001`) to drive several AI features:
1. **Interactive Voice Intake Agent (`intakeNode`)**: Conducts an audio/text interview, extracting skills, work experiences, and assistive technology (AT) needs.
2. **Resume Builder (`resumeNode`)**: Compiles raw interview transcripts into structured Zod-validated CV models.
3. **8-Criteria Priority Matching (`matchNode` & `match.scoring.js`)**: Matches candidates to jobs using location, experience, assistive devices, career goals, hard skills, soft skills, certificates, and custom fields. Supports checkbox/priority customization.
4. **Inclusive JD Auditor (`hrNode`)**: Scores job descriptions for inclusive hiring practices, highlights ableist terms, and writes suggestions/rewritten JDs.
5. **Speech (STT / TTS)**: Conversational audio streams are transcribed using Google STT (fallback to Groq Whisper) and read out using Google Cloud TTS (fallback to FPT AI / Google Translate).
