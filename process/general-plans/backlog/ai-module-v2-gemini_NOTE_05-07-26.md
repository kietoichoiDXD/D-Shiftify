# Backlog Note: AI Module V2 (Gemini) Deferral + Follow-ups from product-completion

**Date:** 2026-07-05
**Source run:** `process/general-plans/completed/product-completion_05-07-26/` (product completion
& hardening batch, branch dev-kiet)
**Status:** DEFERRED / TRACKED — not started

## 1. AI Module V2 (Gemini) — deferred

`08_AI_MODULE_V2_GEMINI.md` (repo root) proposes migrating the AI module to `@google/genai`,
switching STT/TTS to Gemini-native speech, and introducing `match.scoring.v2`. This was explicitly
**deferred** during the `product-completion_05-07-26` INNOVATE phase (2026-07-05) to avoid
destabilizing the working AI stack (Google Cloud STT/TTS with browser-speech fallback, Groq Whisper
STT) while the hardening batch was in flight. No code from this proposal was touched by that run —
only the hardcoded GCP project id (RFC-006) was de-hardcoded within the existing (V1) AI stack.

**Recommended next step:** run a fresh RESEARCH → SPEC → INNOVATE pass scoped specifically to
`08_AI_MODULE_V2_GEMINI.md` when there is dedicated time to validate the migration path (new
dependency, new provider billing/quota, and confirm no regression to the fallback chain the
hardening batch just stabilized).

## 2. Frontend TS typecheck/build baseline debt

`npm run build` (frontend, `tsc -b && vite build`) fails at baseline with ~21 pre-existing
TypeScript errors, all unrelated to the product-completion batch (confirmed clean in every
RFC-touched file):

- `firebase.ts` — missing `firebase/app`/`firebase/auth` package + a `firebase` config property
  (~8 errors). Looks like dead/unfinished code referencing an uninstalled dependency.
- `axios-client.ts`, `SocketContext.tsx`, `use-query-auth.ts` — `AuthStore` shape mismatches.
- `useWebRTCCall.ts` — `SocketEventHandler` signature mismatches (~4 errors).
- `cv-confirmation-form-page.tsx` — `CvPayload` shape mismatch.
- `register-form-card.tsx` — generic constraint error.
- `Login.tsx` — response shape mismatch.

Additionally, `npm run check:type` (frontend) is a **weak gate**: the root `tsconfig.json` only
declares `"files": []` + `"references"` (no `-b`/`--noEmit` deep check), so it exits 0 even when
real type errors are present in the referenced projects.

**Recommended next steps:**
1. Change the `check:type` script to `tsc -b --noEmit` (or equivalent) so it becomes a meaningful
   standalone gate instead of a no-op.
2. Fix the ~21 baseline errors, starting with `firebase.ts` (decide: install `firebase` and wire it
   up, or remove the dead module if unused).

## 3. Chat contract test coverage gap

The product-completion run deleted `backend/__tests__/unit/chat-contract.unit.test.js` (RFC-003) —
it imported Zod schemas (`CreateRoomSchema`, `MessageHistoryQuerySchema`, `SendMessageSchema`) from
the old singular `chat/{dto,repository,service}` module design, which had already been removed from
the `dev-kiet` tree. The new plural chat module
(`backend/src/core/modules/chat/{dto,repositories,services,interceptor,socket}`) has **no
automated contract test** today.

**Recommended next step:** write a new contract test against the current plural module's actual
DTO/mapper shapes (`conversationId`/`conversation_id`-based, plain mapper functions — not Zod
schemas) rather than resurrecting the deleted test.

## 4. `form-controls.tsx` `no-explicit-any` debt (accessibility-critical)

`frontend/src/pages/_shared/figma-web/form-controls.tsx` carries `no-explicit-any` warnings that
were intentionally left untouched during the product-completion lint cleanup (RFC-008) because this
file is accessibility-critical (drives the accessible form fields with speech hooks) — any
type-narrowing there deserves a dedicated reviewed change, not an incidental lint-sweep fix.

**Recommended next step:** scope a small, standalone plan to type-narrow this file's `any` usages
with explicit review of the accessibility behavior before/after.

## Status

**Status:** DONE (note captured)
**Summary:** 4 tracked follow-ups from the product-completion hardening run — 1 deliberate scope
deferral (AI Module V2) and 3 pre-existing debt items surfaced during that run's VALIDATE/EXECUTE.
**Concerns/Blockers:** None — none of these block current product functionality; all are documented
so they are not silently lost.
