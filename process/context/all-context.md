# D-Shiftify - All Context

Last updated: 2026-07-05

This file is the root context entrypoint for the repo.

Use it for two things:

1. quick routing to the right context pack or root file
2. broad architecture and repository understanding

Start here before loading deeper context files.

---

## How This File Works (the `all-*.md` Convention)

Every `process/context/` directory has one `all-*.md` entrypoint that acts as an attachable quick router for that domain. This root file (`all-context.md`) is the top-level router. Context groups each have their own `all-{group}.md` entrypoint.

---

## Quick Start

For most substantial tasks:

1. read this file first
2. choose the smallest relevant root file or context group from the tables below
3. only then load deeper files

---

## Current Root Entry Points

| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| `planning` | `process/context/planning/all-planning.md` | SIMPLE/COMPLEX plan calibration and examples |
| `tests` | `process/context/tests/all-tests.md` | Test runner commands, decision guides, and debugging reference |

---

## Task Routing Table

| If the task involves... | Start with |
|---|---|
| architecture or stack questions | this file |
| testing or verification | `process/context/tests/all-tests.md` |
| creating a new plan | `process/context/planning/all-planning.md` |

---

## Context Group Lifecycle

Context groups are durable knowledge domains, not feature folders.

Create a group when:

- a topic has 3+ durable docs
- a single doc exceeds roughly 800 lines with separable subtopics
- multiple agents repeatedly need only one slice of a large context file
- the topic maps to a stable operational domain (tests, infra, database, auth, UI, workflows, etc.)

Do not create a group when:

- the content is a temporary report
- the content is a plan or execution artifact
- the topic is feature-specific and belongs in `process/features/...`

Move or split one group at a time. Use `all-{group}.md` entrypoints. Run the `audit-context` skill after every context organization change.

## Naming Convention

There are no `README.md` files inside `process/context/`.

Canonical entrypoints use `all-*.md`:

- root: `process/context/all-context.md`
- group: `process/context/{group}/all-{group}.md`

Each `all-{group}.md` file should act as the attachable quick router for that domain:

- tell the agent what the group covers
- give quick procedures and decision rules
- route to smaller deeper files

## Context Update Protocol

When durable project knowledge changes:

1. update the smallest relevant context file
2. update this file if routing, ownership, naming, or groups changed
3. update the owning `all-{group}.md` entrypoint when a group exists
4. run `audit-context`

---

## Repository Structure

```
D-Shiftify/
  backend/            -- Node.js + Express API server (uses Knex & pg)
    src/
      core/
        api/          -- Route controllers and resolvers (e.g. ai/speech.controller.js)
        database/     -- Knex migrations & seeds
        modules/      -- Business services (e.g. ai/speech/speech.service.js)
  frontend/           -- React 19 + Vite 6 + Tailwind CSS frontend
    src/
      core/
        configs/      -- Global configs and environment variables
        constants/    -- Route paths (path.ts)
        services/     -- API clients (speech.service.ts, axios-client.ts)
      hooks/
        routes/       -- Router setups (use-router-element.tsx)
      pages/
        auth/         -- Login/Register flows with Role Selection
        disability/   -- Disability pages including CV Builder (PersonalInfo/ProfileSteps)
        _shared/
          figma-web/  -- Figma mock layout assets & form-controls
  supabase/           -- Supabase database configurations & schemas
  process/
    context/          -- this context system
    development-protocols/ -- RIPER-5 specification and execution docs
```

---

## Technology Stack

- **Frontend Framework**: React 19 (Vite 6, TypeScript 5.4)
- **Styling**: Tailwind CSS + Shadcn/ui (Radix-based)
- **State Management**: Zustand 5 for client state caching, Tanstack Query 5 for API query caching
- **Backend API**: Node.js + Express 4 (uses Babel transpilation)
- **Database**: PostgreSQL (Supabase-hosted, migration & seeds managed via Knex 1)
- **Realtime**: Socket.io 4 for WebSockets chat
- **Speech AI Integration**: Google Cloud Speech 7 (STT) & Google Cloud Text-to-Speech 6 (TTS)
- **Package Manager**: npm 10 (root package.json + local lockfiles)

---

## Key Patterns and Conventions

### 1. Form Accessibility Controls (TTS & STT)
- **Client-side Speech Recognition**: Field input voice dictation uses browser-native `window.SpeechRecognition || window.webkitSpeechRecognition` configured for language `'vi-VN'` (defined in `frontend/src/pages/_shared/figma-web/form-controls.tsx`).
- **Accessible Text-to-Speech**: Form label/placeholder playbacks are triggered via `speakAccessibleText(text)` (defined in `frontend/src/core/services/speech.service.ts`). It calls backend AI TTS API `/api/v1/ai/speech/synthesize` to generate a high-quality Google Cloud TTS MP3 stream. If the API fails or base URL is empty, it falls back to native browser speech synthesis (`window.speechSynthesis`).

### 2. Role-Based Auth Flow
- Registration starts with choosing a role (`role-selection-card.tsx`) mapping to:
  - `candidate` (job candidate with disability)
  - `recruiter` (company recruiter / business)
  - `training_center` (educator / training center)
- Authenticated routes are wrapped under `ProtectedRoute` inside `use-router-element.tsx`.

---

## Environment and Configuration

**Config files**: `package.json`, `tsconfig.json`, `vite.config.ts`, `backend/.env`, `frontend/.env`

**Important Env Groups**:
- **Database Connection**: `DATABASE_URL` (Pooler address), `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- **JWT Settings**: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `EXPIRE_DAYS`
- **Speech AI Configurations**: `GOOGLE_CLOUD_PROJECT` (seeded: `bdien-muonmay`), `GOOGLE_SPEECH_LANGUAGE` (default: `vi-VN`), `GOOGLE_TTS_VOICE`, `GOOGLE_TTS_GENDER`, `SPEECH_MAX_AUDIO_BYTES`, `SPEECH_MAX_TEXT_LENGTH`
- **API Keys**: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`

---

## Source References

- `frontend/src/core/services/speech.service.ts` -- client audio play and synthesize fallback
- `backend/src/core/modules/ai/speech/speech.service.js` -- backend Google Cloud STT/TTS service
- `frontend/src/pages/_shared/figma-web/form-controls.tsx` -- accessible form fields with speech hooks
- `frontend/src/hooks/routes/use-router-element.tsx` -- client route definitions

---

## Current Implementation State

- **Chat module (2026-07-05):** the legacy room-based chat module (singular `backend/src/core/modules/chat/{dto,repository,service}` + `backend/src/core/socket.js` + the frontend `pages/communication/chat/ChatContainer.tsx`/`MessageRoom.tsx` tree) was removed and replaced by a conversation-based design: backend `backend/src/core/modules/chat/{dto,repositories,services,interceptor,socket}` (plural dirs, plain mapper DTOs keyed on `conversationId`/`conversation_id`, no Zod schemas) and frontend `frontend/src/pages/communication/chat/ChatPageRefactored.tsx` + `SharedChatLayout.tsx` + `components/*`. Realtime transport is unchanged — still Socket.io 4.
- **Rate limiting / `TRUST_PROXY` (2026-07-05):** `backend/src/core/env/index.js` exports `TRUST_PROXY` (`process.env.TRUST_PROXY === 'true'`, default `false`); `backend/src/core/middleware/security-rate-limit.middleware.js` uses it to decide whether `x-forwarded-for` is trusted when computing the rate-limit bucket key. Leave `TRUST_PROXY` unset/`false` on non-proxied deployments.
- **AI Module V2 (Gemini rewrite):** `08_AI_MODULE_V2_GEMINI.md` is deferred/backlogged — see `process/general-plans/backlog/ai-module-v2-gemini_NOTE_05-07-26.md`. The current AI stack (Google Cloud STT/TTS with browser-speech fallback, Groq Whisper STT) is unchanged and is the active implementation.
- Source of these facts: `process/general-plans/completed/product-completion_05-07-26/` (hardening run closeout).

---

## Open Questions

- None at the moment. All core configurations for auth and speech have been verified against the codebase.

---

## Scan Metadata

- Generated: 2026-06-20
- HEAD: (git rev-parse HEAD)
- Mode: Flow A (New Project Setup)
- Package manager: npm
