# D-Shiftify Product Completion & Hardening

**Date**: 2026-07-05
**Complexity**: Complex
**Status**: ✅ VALIDATED (Gate: CONDITIONAL — resolved via plan fixes, see Validate Contract) — ready for EXECUTE
**Execution Model**: Standard complex (one execution stream, RFC-by-RFC verification gates — not a multi-phase program: no separate umbrella plan, no phase-plan set)

## Overview

Harden the D-Shiftify product (branch `dev-kiet`) to a professional, error-free state across backend
(Express 4 + Knex/Postgres) and frontend (React 19 + Vite + Tailwind), per the standing autopilot
goal (`process/general-plans/active/product-completion_05-07-26/product-completion_AUTOPILOT_GOAL_05-07-26.md`).
This plan fixes three confirmed runtime-breaking bugs (a missing export crashing every job-posting
call, a missing env export crashing the rate limiter, and a stale unit test importing deleted
schemas), removes confirmed dead/duplicate code, de-hardcodes a GCP project ID, fixes a copy-paste
routing bug, clears real lint errors (not stylistic `any` debt), strips leftover `console.*` calls
from shipped chat UI, and — as an explicitly optional final RFC — replaces bare placeholder spans on
reachable `/admin/analytics/*` routes with a minimal "coming soon" page. AI Module V2 (Gemini
rewrite, `08_AI_MODULE_V2_GEMINI.md`) is explicitly **out of scope / deferred** per locked decision.
No schema, auth, or public API contract changes are made anywhere in this plan.

All touchpoints below were independently re-verified with Read/Grep against the live `dev-kiet`
working tree immediately before this plan was written (see the confirmation notes under each RFC).

---

## Quick Links

- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Architecture Decisions](#architecture-decisions-final)
- [Security Posture](#security-posture)
- [Database Schema / API Surface](#database-schema)
- [Phased Delivery Plan — Current Status](#phased-delivery-plan)
- [RFCs](#rfcs-strict-sequential-order)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Test Gates](#test-gates)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Acceptance Criteria](#acceptance-criteria)
- [Validate Contract](#validate-contract)

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:
- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each RFC, document:
- [ ] What was tested manually
- [ ] Data verified in DB (show query + result) — only where the RFC touches data
- [ ] Errors encountered and fixed
- [ ] User confirmation received

---

## Execution Brief

### Group 1 (RFC-001..003): Critical Runtime Fixes

**What happens:** Fix the missing `inferWeights` export crashing `POST /api/ai/jobs`; export
`TRUST_PROXY` from `core/env` so the rate-limit middleware loads; remove the stale
`chat-contract.unit.test.js` that imports deleted Zod schemas and fails Jest at import time.

**Integration points:** `job.ingestion.service.js` → `match.scoring.js`; `security-rate-limit.middleware.js`
→ `core/env`; Jest test runner → `backend/src/core/modules/chat/dto`.

**Test:** `npm run lint:check` (backend) still passes; manually exercise `POST /api/ai/jobs` (or a
targeted script) and confirm no throw; `npm test` no longer fails at the import/collection stage
for the removed test file.

**Verify:** `job.weights_json` still populates on a saved job row (existing behavior preserved,
values sourced from `getJobWeights` instead of the missing `inferWeights`); rate-limit middleware
does not throw `TRUST_PROXY is not defined` on server boot.

**Done when:** server boots clean, `POST /api/ai/jobs` succeeds end-to-end, `npm test` no longer
errors on `chat-contract.unit.test.js`.

### Group 2 (RFC-004..007): Dead Code, Duplication, Hardcoding, Routing Bug

**What happens:** Delete the orphaned `chat/interceptor/chat.interceptor.js` (imports schemas that
no longer exist, unused everywhere else); canonicalize `detectATTools` in `at_detector.js` and make
`nlp.js` import it instead of redefining a weaker copy; replace the hardcoded GCP project string in
`stt.js`/`tts.js` with the existing `GOOGLE_CLOUD_PROJECT` env export (fallback preserved); fix the
educator dashboard route that renders `EducatorProfileUpdatePage` instead of a dashboard.

**Test:** backend build/lint still green after deletions; `grep -rn "detectATTools"` shows one
definition; STT/TTS requests still carry the correct `x-goog-user-project` header (visually diffed,
value driven by env not literal); `/educator/dashboard` renders something other than the profile
update form.

**Verify:** no other file imports the deleted `chat.interceptor.js` exports (re-confirm via grep
post-delete); `GOOGLE_CLOUD_PROJECT` env fallback still equals the previous hardcoded value in dev
`.env` so behavior is unchanged when env is unset in the reference environment.

**Done when:** duplication and dead files are gone, GCP project id is env-driven, educator dashboard
route no longer copy-paste-renders the wrong page.

### Group 3 (RFC-008..009): Lint Hygiene & Console Cleanup

**What happens:** Run `eslint --fix` in both packages, then hand-fix the remaining REAL errors
(comment-syntax error in `applications.resolver.js`, class-member spacing in `training.controller.js`,
unused imports, the `useChat`/`ChatWindow` exhaustive-deps gap). Leave non-critical `no-explicit-any`
warnings as accepted debt (documented, not silently ignored). Strip or dev-guard leftover
`console.*` calls in shipped chat UI files.

**Test:** `npm run lint:check` (backend) and `npm run lint` (frontend) exit 0 (or with only the
explicitly accepted `no-explicit-any` warning count, never with errors).

**Verify:** diff review confirms no behavior change from `eslint --fix` (only formatting/import
order); console-cleanup diff confirms no logic removed, only logging calls removed/guarded.

**Done when:** both lint commands exit clean of errors; console output no longer leaks in shipped
chat pages/hooks/services.

### Group 4 (RFC-010, optional): Admin Analytics Placeholder

**What happens:** `/admin/analytics/*` is reachable from the admin sidebar nav
(`general.const.tsx` lines 23-45) and currently renders a bare unstyled `<span>`. Replace with one
minimal shared "coming soon" component reused across the four analytics routes.

**Test:** navigate to each of the 4 analytics routes from the admin sidebar; each renders the
coming-soon component instead of a bare span.

**Verify:** no new dependency, no route path change, no data fetching added.

**Done when:** all 4 analytics routes render a minimally-styled placeholder consistent with the rest
of the admin shell.

### Expected Outcome

- Backend boots and serves `POST /api/ai/jobs` without throwing.
- Rate-limit middleware loads without a missing-export crash.
- `npm test` (backend) no longer fails at collection due to a stale chat test.
- No orphaned/duplicate AI-utility code; GCP project id is configurable via env.
- Educator dashboard route renders a real dashboard surface, not the profile-update form.
- `npm run lint:check` (backend) and `npm run lint` (frontend) both exit without errors.
- No leftover `console.*` noise in shipped chat UI.
- (Optional) Admin analytics nav no longer shows bare placeholder spans.

---

## Phased Execution Workflow

This is a **standard complex** plan (one authoritative file, one execution stream) — not a phase
program. Each RFC below still follows the repo's phase-by-phase discipline:

- **Step 1: Pre-Phase Research** — already done for every RFC in this plan; findings and exact
  file:line confirmations are inlined in each RFC below (re-verified via Read/Grep immediately
  before writing this plan). EXECUTE does not need to re-derive these.
- **Step 2: Detailed Planning** — the Stages/Steps under each RFC are the approved implementation
  detail; no further planning needed before EXECUTE.
- **Step 3: Implementation** — vc-execute-agent implements exactly as specified per RFC, no
  deviation, no scope growth beyond the listed touchpoints.
- **Step 4: Testing & Verification** — run the RFC's Test Procedure + the global Test Gates.
- **Step 5: User Confirmation** — under the standing autopilot goal block, confirmation is
  auto-proceed (EXECUTE CONSENT already granted); vc-execute-agent still records what was tested,
  what changed, and what remains for EVL.

**CRITICAL: Do NOT proceed to RFC-00N+1 until RFC-00N's Verification Checklist is satisfied** (or,
under autopilot's decision policy, until a BLOCKED item has an explicit backlog note per the
orchestrator's BLOCKED Escalation Path).

---

## Scope

**In scope:**
- RFC-001 through RFC-009 (mandatory)
- RFC-010 (optional — admin analytics placeholder; execute only if time/priority allows after
  RFC-001..009 are VERIFIED)

**Out of scope (explicit, locked decisions — do not deviate):**
- **AI Module V2 (Gemini rewrite)** — `08_AI_MODULE_V2_GEMINI.md` is DEFERRED. This plan does not
  touch the V2 design; existing TTS/STT provider fallback chain (Google Cloud → browser
  `speechSynthesis` fallback, Groq Whisper STT) is preserved as-is — only the hardcoded GCP project
  ID (RFC-006) is de-hardcoded, nothing else in that chain changes.
- **Mobile / React Native conversion** — cancelled, backlogged per the standing goal block.
- **Any schema, auth, or public API contract change** — hard stop per the standing goal block's
  HARD STOPS #4. `inferWeights` → `getJobWeights` (RFC-001) is an internal-only fix; the public
  `POST /api/ai/jobs` request/response contract and the `weights_json` storage shape are unchanged.
- **`no-explicit-any` warnings in non-critical files** — accepted debt, left as-is except where
  listed explicitly in RFC-008 (accessibility-critical `form-controls.tsx` is still in scope because
  it is accessibility-critical, not because of the lint rule alone — re-scope note in RFC-008).
- **Jest suites requiring a live DB** — not a gate in this plan (see Test Gates); noted as
  manual/optional follow-up only.

---

## Non-Goals and Constraints

**Non-Goals:**
- No new features, no new endpoints, no new UI pages beyond the optional RFC-010 placeholder.
- No dependency upgrades beyond what `eslint --fix` might already assume is installed.
- No refactor of the chat module's new plural-directory structure (`modules/chat/dto`,
  `repositories/`, `services/`, `interceptor/`, `socket/`) beyond deleting the one confirmed
  orphaned file (RFC-004). That structure is the *replacement* for the deleted singular
  `chat/{dto,repository,service}` files seen in git status — it is intentional, not broken, and is
  out of scope for further change here.

**Constraints:**
- Must not change `backend/src/core/database/migrations/` (no new migrations).
- Must not change any Supabase schema under `supabase/`.
- Must preserve the existing TTS/STT fallback chain ordering.
- Every RFC must be independently revertible (small, disjoint diffs).

---

## Architecture Decisions (Final)

### AD-001: Fix `inferWeights` via existing `getJobWeights`, not a new function

**Decision**: Replace the import of the non-existent `inferWeights` in `job.ingestion.service.js`
with the existing exported `getJobWeights(job)` from `match.scoring.js`, called with the caller's
`jobPayload` (not a reduced object), so any `priorities`/`criteria_priorities`/`weightPriorities`
field already present on the payload is honored; absent that, `getJobWeights` falls back to default
V2 weights exactly as `calculateWeights([])` would.

**Rationale**: `getJobWeights(job = {})` (match.scoring.js:107) already has the exact semantics the
call site wants — "per-job weight map, honoring priorities if present, else defaults." Writing a
new `inferWeights` would duplicate this logic. `calculateWeights(priorities)` alone would require
the call site to manually extract the priorities field itself, which `getJobWeights` already does.

**Implications**: `weights_json` on saved jobs is unchanged in shape (still a `{criterion: weight}`
map); behavior for jobs without explicit priorities is unchanged (defaults were always the fallback
anyway, since `inferWeights` never ran successfully before this fix — this endpoint was previously
100% broken).

### AD-002: Export `TRUST_PROXY` from `core/env` with a safe default

**Decision**: Add `export const TRUST_PROXY = process.env.TRUST_PROXY === 'true';` (or equivalent
boolean coercion) to `backend/src/core/env/index.js`, defaulting to `false` when unset.

**Rationale**: `security-rate-limit.middleware.js` already imports and uses `TRUST_PROXY` to decide
whether to trust `x-forwarded-for`; the env module simply never declared it. Defaulting to `false`
is the safe choice — trusting `x-forwarded-for` by default on a non-proxied deployment would let
clients spoof their rate-limit bucket key.

**Implications**: No other file's behavior changes; the middleware crash (module load failure) is
resolved by the export existing at all.

### AD-003: Delete the stale `chat-contract.unit.test.js` rather than rewrite it

**Decision**: Delete `backend/__tests__/unit/chat-contract.unit.test.js` instead of rewriting it
against the new chat module's contracts.

**Rationale**: The old singular `chat/{dto,repository,service}` module (whose `CreateRoomSchema`,
`MessageHistoryQuerySchema`, `SendMessageSchema` this test imports) was deliberately deleted per the
`dev-kiet` git status. The new plural `modules/chat/{dto,repositories,services,interceptor,socket}`
module uses a completely different, non-Zod-schema DTO shape (plain mapper functions like
`CreateMessageDto(body)`) built around `conversationId`/`conversation_id`, not `roomId`/`room_id`.
The old test asserts contract semantics (room-based, Zod-schema-based) that no longer exist anywhere
in the codebase — it is testing a removed design, not a renamed one. Rewriting it would mean
inventing new test content the SPEC never asked for; deleting it removes dead test debt cleanly.

**Implications**: `npm test` no longer fails at collection; no chat-contract test coverage remains
for the new module (documented as a gap in Test Infra Improvement Notes below, not silently lost).

### AD-004: Delete orphaned `chat/interceptor/chat.interceptor.js`

**Decision**: Delete `backend/src/core/modules/chat/interceptor/chat.interceptor.js`.

**Rationale**: Confirmed via grep — `RoomIdParamInterceptor`, `CreateRoomInterceptor`,
`MessageHistoryQueryInterceptor` (this file's only exports) are referenced nowhere else in
`backend/src`. The file's own `interceptor/index.js` re-export list does not even include it
(only `createMessage.interceptor`, `joinConversation.interceptor`, `socketAuth.interceptor` are
re-exported). It imports `CreateRoomSchema`, `MessageHistoryQuerySchema`, `RoomIdParamSchema` from
`../dto`, none of which exist in the current `dto/index.js`. This file is confirmed dead and broken.

**Implications**: None — nothing imports it.

### AD-005: Canonicalize `detectATTools` in `at_detector.js`

**Decision**: Keep `at_detector.js`'s `detectATTools` as the single implementation (it has a null/
empty-text guard, more AT_MAP categories — `no_video`, plus richer keyword lists — and the existing
`mergeATNeeds` helper). Remove the duplicate `detectATTools` definition from `nlp.js` and instead
import it from `./at_detector.js`, keeping `nlp.js`'s internal caller (`extractEntities`, line 50)
working unchanged.

**Rationale**: `backend/src/core/ai/utils/index.js` does `export * from './at_detector.js'` before
`export * from './nlp.js'` — with two same-named exports across `export *` re-exports, resolution is
ambiguous/last-wins depending on the bundler/runtime, which is exactly the "silent shadowing" risk
flagged. `at_detector.js`'s version is a strict superset (more categories, more keywords, null
guard) so it is the correct canonical implementation.

**Implications**: Any consumer of `detectATTools` via `core/ai/utils` gets the more complete
behavior (previously-undetected `no_video` AT need now detected; previously-crashing call with
falsy `text` now returns `[]` instead of throwing on `text.toLowerCase()`).

### AD-006: De-hardcode GCP project ID via `GOOGLE_CLOUD_PROJECT`

**Decision**: Replace the literal `'bdien-muonmay'` in `stt.js:42` and `tts.js:73`
(`x-goog-user-project` header) with the already-exported `GOOGLE_CLOUD_PROJECT` from `core/env`
(`process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT`), falling back to the literal
`'bdien-muonmay'` only if the env resolves to `undefined`, so dev/prod behavior is unchanged unless
the env var is explicitly set elsewhere.

**Rationale**: `GOOGLE_CLOUD_PROJECT` is already a documented env var (`process/context/all-context.md`
Environment section) and already exported from `core/env`; the header value should follow it instead
of a literal string duplicated in two files.

**Implications**: No behavior change when env is unset (fallback preserves the current value); the
TTS/STT provider fallback chain itself is untouched (locked constraint).

### AD-007: Minimal-risk fix for the educator dashboard route

**Decision**: Point `ROUTE.EDUCATOR.DASHBOARD` at a new thin `EducatorDashboardPage` that composes
existing educator components/data (reusing the same patterns as `BusinessDashboardPage`), rather
than either leaving the copy-paste bug or trying to repurpose `EducatorProfileUpdatePage` in place.

**Rationale**: Repurposing `EducatorProfileUpdatePage` for both dashboard and profile-update routes
would conflate two different page responsibilities and risk regressing the profile-update flow.
Creating one thin new page file that reuses existing shared components (e.g. any shared dashboard
card/stat components also used by `BusinessDashboardPage`) is the smallest, lowest-risk fix that
gives educators a real dashboard distinct from the profile form. EXECUTE must inspect
`BusinessDashboardPage` and existing educator components first to maximize reuse (no new component
library, no new data-fetching pattern).

**Implications**: One new file (`EducatorDashboardPage`), one one-line route wiring change in
`use-router-element.tsx:109`. No API contract change — dashboard page reuses existing data hooks/
endpoints already available to the educator role.

### AD-008: `eslint --fix` first, manual fixes only for real errors, `any`-debt accepted

**Decision**: Run `eslint --fix` in both packages first (23 of 41 backend errors are auto-fixable
per the research audit; frontend import/order issues are also auto-fixable). Manually fix only:
backend `applications.resolver.js` comment-syntax error, backend `training.controller.js`
class-member spacing error, frontend unused imports (`Plus`, `ReactNode`, `ShieldAlert`, `Mic`),
frontend `ChatWindow.tsx:47` exhaustive-deps missing `messages`. Leave `no-explicit-any` warnings in
non-critical files as accepted debt; do NOT touch `form-controls.tsx`'s `any` usages under this
lint-cleanup RFC specifically because it's accessibility-critical and any type-narrowing there
deserves its own reviewed change, not a lint-sweep side-effect — flag it in Test Infra Improvement
Notes instead of silently fixing or silently ignoring it.

**Rationale**: Matches the SEVERITY B research guidance precisely — fix real errors and the two
concrete warnings named, accept the broader `any` debt, and do not let an accessibility-sensitive
file get incidental changes under a lint-hygiene RFC.

**Implications**: `npm run lint:check` (backend) / `npm run lint` (frontend) reach 0 errors; some
`no-explicit-any` warnings remain, by design, and are recorded as accepted debt in this plan (not
silently dropped).

### AD-009: Console cleanup — remove or dev-guard, never silently drop error visibility

**Decision**: For each `console.*` call in the confirmed files (see RFC-009 Touchpoints), either
remove it (if it's leftover debug noise) or wrap it behind a `if (import.meta.env.DEV)` guard /
route it through an existing logger utility if the codebase has one (check first — if none exists,
prefer removal over inventing a new logging utility in this RFC's scope). Never delete a
`console.error` that is the *only* surfaced feedback for a caught error without replacing it with
equivalent user-facing error handling (e.g., a toast) — if such a case is found, keep the console
call and note it as a follow-up rather than silently swallowing the error.

**Rationale**: Matches SEVERITY B guidance; avoids trading "console noise" for "silent failures,"
which would be a regression, not hardening.

**Implications**: Chat UI files (RFC-009 Touchpoints) no longer log to console in normal operation;
any error paths that only had console output get flagged, not silently removed, if no user-facing
fallback already exists.

---

## Security Posture

- **RTRUST_PROXY (RFC-002)**: no security posture change beyond fixing the crash — the safe default
  (`false`, do not trust `x-forwarded-for` unless explicitly configured) matches current
  non-configured behavior and prevents rate-limit-bucket spoofing via a forged header on
  non-proxied deployments.
- **No auth changes**: JWT/session logic, `auth` module, and role-based route guards are untouched.
- **No new endpoints, no new external calls**: all fixes are internal wiring corrections; RFC-006
  changes which env var supplies a header value already sent to Google Cloud, not what is sent to
  whom.
- **No secrets touched**: `GOOGLE_CLOUD_PROJECT` was already a documented, non-secret env var.

---

## Database Schema

**N/A — no schema changes.** This plan does not touch `backend/src/core/database/migrations/`,
Knex seeds, or `supabase/` schema definitions. This is a locked constraint from the standing goal
block (HARD STOPS #4).

## API Surface

**N/A — no public API contract changes.** `POST /api/ai/jobs` request/response shape is unchanged
(RFC-001 fixes an internal crash, not the contract). No routes are added, removed, or renamed on the
backend. `RFC-007`'s frontend route fix changes which component renders at an existing frontend
route path — it does not change any backend API surface.

---

## Phased Delivery Plan

### Current Status

🔨 **RFC-001**: Fix `inferWeights` → `getJobWeights` (CODE DONE — gates green; runtime probe pending EVL)
🔨 **RFC-002**: Export `TRUST_PROXY` from env (CODE DONE — gates green; boot probe pending EVL)
✅ **RFC-003**: Delete stale chat-contract unit test (DONE — file absent, build green)
✅ **RFC-004**: Delete orphaned `chat.interceptor.js` (DONE — file absent, build green)
🔨 **RFC-005**: Canonicalize `detectATTools` (CODE DONE — single def in at_detector.js; importers rewired: nlp.js + intake.agent.js now import canonical)
🔨 **RFC-006**: De-hardcode GCP project ID (CODE DONE — env-driven, literal only in `||` fallback)
🔨 **RFC-007**: Fix educator dashboard route (CODE DONE — wired existing `educator/dashboard.tsx`; see deviation note)
🔨 **RFC-008**: Lint cleanup backend + frontend (CODE DONE — backend 0 errors, frontend 0 errors)
🔨 **RFC-009**: Console-log cleanup in chat UI (CODE DONE — debug logs removed; caught-error warn/error kept per AD-009)
🔨 **RFC-010**: Admin analytics placeholder (CODE DONE — shared `ComingSoon` wired into 5 analytics routes)

**Execution note (05-07-26, EXECUTE)**: All 10 RFCs implemented. Gate results (final run):
- Backend `npm run lint:check`: **0 errors**, 15 no-console warnings (accepted debt in seed/script files).
- Backend `npm run build`: **success** (440 files compiled).
- Frontend `npm run lint`: **0 errors**, 51 warnings (accepted `no-explicit-any` debt; down from 90 after console cleanup).
- Frontend `npm run check:type`: **exit 0**.
- Frontend `npm run build`: 23 TS errors, **all in the recorded pre-existing baseline files** (firebase.ts, axios-client.ts, SocketContext.tsx, use-query-auth.ts, useWebRTCCall.ts, cv-confirmation-form-page.tsx, register-form-card.tsx, Login.tsx, SharedChatLayout.tsx AuthStore) — **0 new errors** in any RFC-touched file (use-router-element.tsx, educator/dashboard.tsx, coming-soon.tsx, and all 9 RFC-009 chat files are clean). Gate PASSES per baseline-relative rule (E1).

**Deviations from plan (2, both minimal-risk, documented):**
1. **RFC-007**: The plan (AD-007) and validate-contract assumed no `EducatorDashboardPage` file existed and instructed creating a new thin page. In fact `frontend/src/pages/educator/dashboard.tsx` already exists and exports a working dashboard (`EducatorDashboardPrototype`). The minimal-risk fix was to wire `ROUTE.EDUCATOR.DASHBOARD` to this existing page rather than create a duplicate. Achieves the plan's goal (dashboard distinct from profile form) with less risk and no new file.
2. **RFC-005 side-effect**: removing `detectATTools` from `nlp.js` broke a previously-unlisted importer, `backend/src/core/ai/agents/intake.agent.js:3`, which imported `detectATTools` directly from `../utils/nlp.js`. Rewired it to import from the canonical `../utils/at_detector.js` (keeps importer resolving without re-introducing the barrel double-export). Caught by the backend lint gate and fixed.

---

## RFCs (STRICT sequential order)

### RFC-001: Fix `POST /api/ai/jobs` crash — `inferWeights` does not exist

**Summary**: `backend/src/core/modules/ai/services/job.ingestion.service.js:6` imports
`inferWeights` from `match.scoring.js`, which does not export it. Line 26 calls it inside
`Promise.all`, so every `ingestJob` call throws. Replace with the existing `getJobWeights` export.

**Dependencies**: None.

**Stage 1: Fix the import and call site**
1. In `backend/src/core/modules/ai/services/job.ingestion.service.js`, change
   `import { inferWeights } from '../../../ai/retrieval/match.scoring.js';` to
   `import { getJobWeights } from '../../../ai/retrieval/match.scoring.js';`.
2. Change the call `inferWeights({ job_id: 'temp', description_raw, title })` to
   `getJobWeights(jobPayload)` (pass the full destructured payload so any `priorities` field the
   caller supplies is honored; `getJobWeights` internally falls back to defaults when absent).
3. Confirm `weights_json: JSON.stringify(weights)` still receives a plain object (verify
   `getJobWeights`'s return type — it returns an object keyed by criterion, matching prior
   expectations of `weights_json`).

**Post-Phase Testing**:
- Manual: call the ingestion path (existing route/resolver that invokes `ingestJob`) with a minimal
  valid job payload; confirm no throw and a job row is created with a non-null `weights_json`.
- Automated: `npm run lint:check` (backend) still passes (no new lint errors introduced).

**Verification Checklist**:
- [ ] `grep -n "inferWeights" backend/src/core/modules/ai/services/job.ingestion.service.js` returns
      no matches.
- [ ] Manual `ingestJob` call succeeds; `weights_json` is populated on the saved row.
- [ ] No other file in `backend/src` imports `inferWeights` (confirm via grep — none expected).

**Acceptance Criteria**: `POST /api/ai/jobs` (or the direct `ingestJob` call path) completes without
throwing; `job.weights_json` is a valid JSON object string.

**What's Functional Now**: Job posting / ingestion works end-to-end again.

**Ready For**: RFC-002.

**Implementation Checklist**:
- [ ] Update import + call site in `job.ingestion.service.js`
- [ ] Manually verify `ingestJob` succeeds
- [ ] Run `npm run lint:check` (backend)

---

### RFC-002: Export `TRUST_PROXY` from `core/env`

**Summary**: `backend/src/core/middleware/security-rate-limit.middleware.js:2,46` imports
`TRUST_PROXY` from `core/env`, which never exports it — the middleware module fails to load.

**Dependencies**: None (independent of RFC-001).

**Stage 1: Add the export**
1. In `backend/src/core/env/index.js`, add:
   `export const TRUST_PROXY = process.env.TRUST_PROXY === 'true';`
   (placed near the other simple env exports, e.g. after `HOST`).
2. No change needed in `security-rate-limit.middleware.js` — its existing import/usage is already
   correct once the export exists.

**Post-Phase Testing**:
- Manual: start the backend (`npm run dev`), confirm no `TRUST_PROXY is not defined` /
  module-load error in the console; hit a rate-limited route (e.g. `/api/auth/login`) repeatedly and
  confirm 429 responses trigger correctly.
- Automated: `npm run lint:check` (backend) still passes.

**Verification Checklist**:
- [ ] Server boots without error referencing `TRUST_PROXY`.
- [ ] Rate limiting still triggers (429) after exceeding the configured window/max for at least one
      of the two defined windows (`auth-sensitive` or `ai-expensive`).
- [ ] With `TRUST_PROXY` unset, `x-forwarded-for` is ignored (bucket key uses `req.ip` /
      `req.connection.remoteAddress` as before).

**Acceptance Criteria**: Backend boots clean; rate limiting behaves identically to before the
crash was introduced (safe default `false`).

**What's Functional Now**: All routes behind `security-rate-limit.middleware.js` are reachable
again (the middleware module no longer fails to import).

**Ready For**: RFC-003.

**Implementation Checklist**:
- [ ] Add `TRUST_PROXY` export to `backend/src/core/env/index.js`
- [ ] Manually verify server boot + one rate-limited route

---

### RFC-003: Delete stale `chat-contract.unit.test.js`

**Summary**: `backend/__tests__/unit/chat-contract.unit.test.js` imports `CreateRoomSchema`,
`MessageHistoryQuerySchema`, `SendMessageSchema`, `CreateMessageDto` from
`../../src/core/modules/chat/dto`. None of the three Schema exports exist in the current
`dto/index.js` (which only re-exports `conversation.dto`, `conversationCrud.dto`,
`createMessage.dto`, `joinConversation.dto` — all plain mapper functions, no Zod schemas, and a
different `conversationId`/`room_id`-less shape). Jest fails at import/collection for this file.

**Dependencies**: None (independent).

**Stage 1: Confirm no salvageable content**
1. Confirm (already done during planning — see AD-003) that no equivalent
   `CreateRoomSchema`/`MessageHistoryQuerySchema`/`SendMessageSchema` exists anywhere in the new
   `modules/chat/` tree under any name.
2. Confirm no other test file imports from this test file (it should be a leaf).

**Stage 2: Delete**
1. Delete `backend/__tests__/unit/chat-contract.unit.test.js`.

**Post-Phase Testing**:
- Automated: `npm test` (backend Jest) no longer reports a collection failure for this file. (Note:
  the full `npm test` suite is NOT a required gate for this plan per Test Gates below — this check
  is scoped to confirming the collection-time crash from this one file is gone, e.g. via
  `npx jest __tests__/unit/chat-contract.unit.test.js` returning "no tests found" cleanly instead of
  an import error, or simply confirming the file no longer exists.)

**Verification Checklist**:
- [ ] File no longer exists at `backend/__tests__/unit/chat-contract.unit.test.js`.
- [ ] No other file references this test file's path.

**Acceptance Criteria**: Jest collection no longer fails due to this file's deleted-schema imports.

**What's Functional Now**: Backend test suite no longer has a guaranteed-failing test file.

**Ready For**: RFC-004.

**Implementation Checklist**:
- [ ] Delete `backend/__tests__/unit/chat-contract.unit.test.js`
- [ ] Confirm no other reference to it

---

### RFC-004: Delete orphaned `chat/interceptor/chat.interceptor.js`

**Summary**: This file imports `CreateRoomSchema`, `MessageHistoryQuerySchema`, `RoomIdParamSchema`
from `../dto` (none exist). It exports `RoomIdParamInterceptor`, `MessageHistoryQueryInterceptor`,
`CreateRoomInterceptor` — confirmed (via grep) referenced nowhere else in `backend/src`. It is also
not re-exported by its own `interceptor/index.js` (which only re-exports
`createMessage.interceptor`, `joinConversation.interceptor`, `socketAuth.interceptor`).

**Dependencies**: None (independent; do after RFC-003 only because both are chat-module cleanup —
no actual code dependency).

**Stage 1: Delete**
1. Delete `backend/src/core/modules/chat/interceptor/chat.interceptor.js`.
2. Re-confirm `backend/src/core/modules/chat/interceptor/index.js` needs no change (it never
   referenced this file).

**Post-Phase Testing**:
- Automated: `npm run lint:check` (backend) and `npm run build` (backend) both still succeed
  (confirms no lingering import of the deleted file anywhere).

**Verification Checklist**:
- [ ] File deleted.
- [ ] `grep -rn "chat.interceptor" backend/src` returns no matches (confirms no stray path import).
- [ ] Backend build still succeeds.

**Acceptance Criteria**: No broken imports introduced by the deletion; backend builds clean.

**What's Functional Now**: One fewer broken/dead file in the chat module.

**Ready For**: RFC-005.

**Implementation Checklist**:
- [ ] Delete `chat.interceptor.js`
- [ ] Run backend build to confirm no breakage

---

### RFC-005: Canonicalize `detectATTools`

**Summary**: `detectATTools` is independently defined in both
`backend/src/core/ai/utils/at_detector.js:10` and `backend/src/core/ai/utils/nlp.js:12`, and both
are re-exported via `export * from` in `backend/src/core/ai/utils/index.js` — an ambiguous/
shadowing double export. `at_detector.js`'s version is the more complete implementation (extra
`no_video` category, richer keyword lists, a `!text` guard, and the paired `mergeATNeeds` helper).

**Dependencies**: None (independent).

**Stage 1: Remove the duplicate, delegate to canonical**
1. In `backend/src/core/ai/utils/nlp.js`, remove the local `AT_MAP` block and the local
   `detectATTools` function (lines ~5-17, the smaller `AT_MAP` and its `detectATTools`).
2. Add `import { detectATTools } from './at_detector.js';` at the top of `nlp.js`.
3. Confirm `nlp.js`'s internal usage at `extractEntities` (`const at_tools = detectATTools(text);`)
   still resolves correctly against the imported (canonical) function.

**Stage 2: Confirm the barrel export is now unambiguous**
1. Re-check `backend/src/core/ai/utils/index.js` — after this change, only `at_detector.js` defines
   `detectATTools`, so `export *` from both files no longer collides.

**Post-Phase Testing**:
- Automated: `npm run lint:check` (backend) passes (no unused-import errors from the removed local
  `AT_MAP`/`detectATTools` in `nlp.js`).
- Manual: call `extractEntities` (or any consumer importing `detectATTools` via
  `core/ai/utils`) with text containing an AT keyword only present in the richer `at_detector.js`
  map (e.g. an `audio only` / `no_video` phrase) and confirm it is now detected where it previously
  was not via the `nlp.js` copy.

**Verification Checklist**:
- [ ] `grep -n "detectATTools" backend/src/core/ai/utils/at_detector.js backend/src/core/ai/utils/nlp.js`
      shows exactly one function definition (in `at_detector.js`) and one import line (in `nlp.js`).
- [ ] `extractEntities` still returns `at_tools` correctly for a sample input.
- [ ] No lint errors from unused `AT_MAP` remnants in `nlp.js`.

**Acceptance Criteria**: Single canonical `detectATTools`; no behavior regression in `nlp.js`
consumers; strictly more AT-need categories detected than before (superset behavior).

**What's Functional Now**: No silent-shadowing risk on `detectATTools`; richer AT-tool detection
available everywhere it's used.

**Ready For**: RFC-006.

**Implementation Checklist**:
- [ ] Remove duplicate `AT_MAP`/`detectATTools` from `nlp.js`; import from `at_detector.js` instead
- [ ] Run `npm run lint:check` (backend)
- [ ] Manually spot-check `extractEntities` output

---

### RFC-006: De-hardcode GCP project ID in STT/TTS

**Summary**: `backend/src/core/ai/utils/stt.js:42` and `backend/src/core/ai/utils/tts.js:73` both
hardcode `'x-goog-user-project': 'bdien-muonmay'`. `GOOGLE_CLOUD_PROJECT` is already exported from
`core/env` (`backend/src/core/env/index.js`) and documented in `process/context/all-context.md`.

**Dependencies**: None (independent).

**Stage 1: Read env in both files**
1. In `stt.js`, import `GOOGLE_CLOUD_PROJECT` from the env module (adjust relative path to
   `core/env`, matching the existing import convention used elsewhere in `backend/src/core/ai`).
2. Replace `'x-goog-user-project': 'bdien-muonmay'` with
   `'x-goog-user-project': GOOGLE_CLOUD_PROJECT || 'bdien-muonmay'` (fallback preserves current
   behavior when env is unset).
3. Repeat identically in `tts.js:73`.

**Post-Phase Testing**:
- Manual: with `.env` `GOOGLE_CLOUD_PROJECT` unset, confirm the outgoing header value is still
  `bdien-muonmay` (no behavior change). With it set to a different value in a local test env,
  confirm the header reflects the new value (e.g. via a debug log removed before commit, or a
  request-interception check).
- Automated: `npm run lint:check` (backend) passes.

**Verification Checklist**:
- [ ] `grep -n "bdien-muonmay" backend/src/core/ai/utils/stt.js backend/src/core/ai/utils/tts.js`
      shows the literal only inside the `||` fallback, not as the sole value.
- [ ] Header value follows `GOOGLE_CLOUD_PROJECT` when set.

**Acceptance Criteria**: GCP project id is configurable via env with no default-behavior change.

**What's Functional Now**: STT/TTS Google Cloud calls are portable across environments/projects.

**Ready For**: RFC-007.

**Implementation Checklist**:
- [ ] Import `GOOGLE_CLOUD_PROJECT` in `stt.js` and `tts.js`
- [ ] Replace hardcoded literal with `GOOGLE_CLOUD_PROJECT || 'bdien-muonmay'` in both files
- [ ] Manually confirm fallback + override behavior

---

### RFC-007: Fix educator dashboard route copy-paste bug

**Summary**: `frontend/src/hooks/routes/use-router-element.tsx:109` wires
`ROUTE.EDUCATOR.DASHBOARD` to `<EducatorProfileUpdatePage />` — identical to the very next line's
`ROUTE.EDUCATOR.PROFILE_UPDATE`. No `EducatorDashboardPage` currently exists.

**Dependencies**: None (independent).

**Stage 1: Research existing patterns**
1. Read `BusinessDashboardPage` (`ROUTE.BUSINESS.DASHBOARD` target) for the dashboard-page pattern
   used elsewhere in the app (shared cards/stats components, data hooks).
2. Check for existing educator-specific components/hooks that a dashboard could reuse (e.g. course/
   class data already fetched for `EducatorCourseCreatePage`/`EducatorClassCreatePage`).

**Stage 2: Implement minimal `EducatorDashboardPage`**
1. Create a thin new page component (exact file location alongside sibling educator pages, matching
   existing naming convention observed in Stage 1) that composes existing shared dashboard
   components with educator-relevant data (e.g. courses/classes summary) — reuse, do not invent a
   new component library or new data-fetching pattern.
2. Update `use-router-element.tsx:109` to render the new component for `ROUTE.EDUCATOR.DASHBOARD`,
   leaving line 110 (`ROUTE.EDUCATOR.PROFILE_UPDATE` → `EducatorProfileUpdatePage`) untouched.

**Post-Phase Testing**:
- Manual: log in as an educator (or navigate directly to the dashboard route in a dev session),
  confirm `/educator/dashboard`-equivalent route renders the new dashboard, not the profile-update
  form; confirm the profile-update route still renders `EducatorProfileUpdatePage` correctly.
- Automated: `npm run check:type` (frontend) exits 0 (weak gate, see Test Gates note); `npm run
  build` (frontend) introduces no NEW errors beyond the recorded pre-existing baseline (see Test
  Gates section) in `use-router-element.tsx` or the new `EducatorDashboardPage`.

**Verification Checklist**:
- [ ] `ROUTE.EDUCATOR.DASHBOARD` and `ROUTE.EDUCATOR.PROFILE_UPDATE` render different components.
- [ ] New dashboard page renders without runtime error for an educator-role session.
- [ ] No regression to the profile-update flow.

**Acceptance Criteria**: Educator dashboard route shows dashboard content, not the profile form;
profile-update route is unaffected.

**What's Functional Now**: Educators have a real (if minimal) dashboard distinct from the profile
form.

**Ready For**: RFC-008.

**Implementation Checklist**:
- [ ] Research `BusinessDashboardPage` + existing educator components for reuse
- [ ] Create thin `EducatorDashboardPage` composing existing components/hooks
- [ ] Update route wiring at `use-router-element.tsx:109`
- [ ] Manually verify both educator routes render distinct, correct content

---

### RFC-008: Lint hygiene cleanup (backend + frontend)

**Summary**: Backend `npm run lint:check` currently reports 41 errors / 15 warnings (23
auto-fixable, plus a comment-syntax error in `applications.resolver.js` and class-member spacing in
`training.controller.js`). Frontend `npm run lint` reports 54 errors / 90 warnings (import/order,
unused imports `Plus`/`ReactNode`/`ShieldAlert`/`Mic`, ~25 `no-explicit-any` including
accessibility-critical `form-controls.tsx`, and `ChatWindow.tsx:47` missing `messages` in
exhaustive-deps).

**VALIDATE correction (05-07-26 — re-run `npx eslint --ext .js --fix-dry-run backend/` confirmed
this):** after `eslint --fix` plus RFC-001..005's fixes, **6 additional real (non-auto-fixable)
backend errors remain** that were not in the original Stage 2 list:
- `backend/src/core/ai/utils/groq.stt.js:36,37,44` — `no-undef` on `FormData`, `Blob`, `fetch`
  (Node 18+ global Web APIs not declared to this project's ESLint env).
- `backend/src/core/modules/chat/services/conversation.service.js:68` — `no-continue` on
  `if (!conversation) continue;` inside `getUserConversations`.
- `backend/src/core/modules/chat/services/message.service.js:92` — `no-return-await` on
  `return await this.messageRepository.update(messageId, updateData);`.
- `backend/src/core/modules/voice/services/voice.service.js:8` — `no-undef` on `fetch` (same
  Node-global gap as `groq.stt.js`).

Without fixing these, `npm run lint:check` (backend) cannot reach 0 errors as this RFC's own
Acceptance Criteria requires — added to Stage 2 below as items 3-6.

**VALIDATE informational note (no action needed):** `backend/src/core/ai/index.js:13,15` also
currently reports "Multiple exports of name 'detectATTools'" — this is the same root cause as
`backend/src/core/ai/utils/index.js` (both barrel-export `nlp.js` and `at_detector.js`) and is
resolved automatically as a side effect of RFC-005's fix. No separate touchpoint required.

**Dependencies**: Best run after RFC-001..007 so lint isn't re-run against code that's still
mid-fix; no hard code dependency otherwise.

**Stage 1: Auto-fix**
1. Run `npm run lint` in `backend/` (this repo's backend `lint` script is `eslint --fix --ext .js .`
   — confirm this is what's intended as "auto-fix" here, distinct from `lint:check` which is the
   gate).
2. Run `npm run check:lint` in `frontend/` (`eslint . --fix`).
3. Diff-review both auto-fix results — confirm changes are only formatting/import-order, no logic
   changes.

**Stage 2: Manual fixes — backend**
1. Fix the comment-syntax error in `applications.resolver.js:2` (the `spaced-comment` rule wants a
   space after `//` — e.g. `//import { hasCandidateRole , hasRecruiter } from ...` →
   `// import { hasCandidateRole , hasRecruiter } from ...`).
2. Fix the class-member spacing errors (`lines-between-class-members`) in `training.controller.js`
   (10 occurrences at the lines the fresh `lint:check` run reports at execution time — add a blank
   line between adjacent class members/methods).
3. Fix `backend/src/core/ai/utils/groq.stt.js:36,37,44` — `no-undef` on `FormData`/`Blob`/`fetch`.
   These are legitimate Node 18+ global Web APIs actually available at runtime; add a
   `/* eslint-env node */`-compatible fix via a `/* global fetch, FormData, Blob */` comment at the
   top of the file (do not disable the rule file-wide, do not add a new ESLint config — this file
   already runs correctly, only the lint config lacks the global declarations).
4. Fix `backend/src/core/modules/chat/services/conversation.service.js:68` — replace the
   `if (!conversation) continue;` inside the `for...of` loop in `getUserConversations` with an
   equivalent structure that avoids `continue` (e.g. wrap the remaining loop body in
   `if (conversation) { ... }`, or pre-filter the loop's collection) without changing the resulting
   `items` array's contents.
5. Fix `backend/src/core/modules/chat/services/message.service.js:92` — remove the redundant
   `await` on `return await this.messageRepository.update(messageId, updateData);` (change to
   `return this.messageRepository.update(messageId, updateData);` — behaviorally identical, since
   the caller already awaits/returns the promise).
6. Fix `backend/src/core/modules/voice/services/voice.service.js:8` — same `no-undef` fix as item 3
   (`fetch` global) applied to this file.

**Stage 3: Manual fixes — frontend**
1. Remove unused imports: `Plus`, `ReactNode`, `ShieldAlert`, `Mic` (exact files identified via
   `npm run lint` output at execution time — re-run lint first since RFC-001..007 changes may shift
   line numbers).
2. Fix `ChatWindow.tsx:47` exhaustive-deps warning by adding `messages` to the dependency array (or
   restructuring the effect if adding it causes an infinite-loop risk — verify manually).
3. Explicitly do NOT touch `form-controls.tsx`'s `no-explicit-any` warnings in this RFC (per
   AD-008) — confirm remaining warning count includes these and note it under Test Infra
   Improvement Notes as accepted debt, not silently fixed.

**Post-Phase Testing**:
- Automated: `npm run lint:check` (backend) exits 0. `npm run lint` (frontend) exits 0 for errors
  (documented remaining `no-explicit-any` warnings are acceptable per AD-008 — confirm the warning
  count matches only the accepted-debt category, i.e. no NEW warning types appear).
- Manual: spot-check `ChatWindow` still renders/updates messages correctly after the exhaustive-deps
  fix (no infinite re-render).

**Verification Checklist**:
- [ ] `npm run lint:check` (backend) → 0 errors (includes the 6 additional errors found during
      VALIDATE: `groq.stt.js` ×3, `conversation.service.js` no-continue, `message.service.js`
      no-return-await, `voice.service.js` no-undef).
- [ ] `npm run lint` (frontend) → 0 errors; remaining warnings are only the accepted `any`-debt
      category.
- [ ] `ChatWindow` manually confirmed not to infinite-loop after the deps fix.
- [ ] Diff review confirms auto-fix changes are non-behavioral.
- [ ] `conversation.service.js`'s `getUserConversations` still skips null conversations (same
      resulting `items` contents as before the `no-continue` refactor).

**Acceptance Criteria**: Both lint gates pass with 0 errors; documented accepted-debt warnings only.

**What's Functional Now**: Codebase lints clean; CI/local lint gate is trustworthy again.

**Ready For**: RFC-009.

**Implementation Checklist**:
- [ ] Run backend auto-fix (`npm run lint`) and frontend auto-fix (`npm run check:lint`)
- [ ] Diff-review auto-fix output for behavior changes
- [ ] Fix backend comment-syntax error (`applications.resolver.js`)
- [ ] Fix backend class-member spacing error (`training.controller.js`)
- [ ] Fix backend `no-undef` (`groq.stt.js`, `voice.service.js`), `no-continue`
      (`conversation.service.js`), `no-return-await` (`message.service.js`) — found during VALIDATE
- [ ] Remove frontend unused imports (`Plus`, `ReactNode`, `ShieldAlert`, `Mic`) — note: likely
      already resolved by the Stage 1 auto-fix (`unused-imports` rule is auto-fixable); re-check
      lint output before treating as a separate manual step
- [ ] Fix `ChatWindow.tsx:47` exhaustive-deps; manually confirm no infinite loop
- [ ] Run both lint gates to confirm 0 errors

---

### RFC-009: Remove/guard leftover `console.*` in shipped chat UI

**Summary**: Confirmed `console.*` calls in (corrected paths — re-verified live, differs from the
initial research note for one file):
`frontend/src/pages/business/messages/index.tsx` (4), `frontend/src/pages/disability/messages/index.tsx`
(4), `frontend/src/pages/disability/messages/DisabilityEducatorChat.tsx` (4),
`frontend/src/pages/disability/messages/DisabilityBusinessChat.tsx` (4),
`frontend/src/pages/educator/messages/index.tsx` (4), `frontend/src/pages/communication/chat/useChat.ts` (5),
`frontend/src/pages/communication/chat/useSocketMessages.ts` (3),
`frontend/src/pages/communication/chat/message.service.ts` (6),
`frontend/src/pages/communication/chat/SharedChatLayout.tsx` (2, found during re-verification —
not in the original research list, included here since it's the same surface).

**Correction note**: the original research finding cited `frontend/src/core/services/message.service.ts`
for one of these files — that path does not exist. The actual file is
`frontend/src/pages/communication/chat/message.service.ts` (confirmed via `find`). Use the corrected
path.

**Dependencies**: Best run after RFC-008 (lint cleanup) so this diff is not conflated with
lint-driven formatting changes; no hard code dependency.

**Stage 1: Classify each console call**
1. For each file above, read every `console.*` call and classify as: (a) leftover debug noise → 
   remove; (b) the only surfaced error feedback for a caught exception → keep for now if no
   user-facing fallback (e.g. toast) exists, and note it as a follow-up per AD-009 — do not silently
   drop error visibility.
2. Check whether the codebase already has a logger utility (`grep -rn "logger" frontend/src` or
   similar) before deciding between removal and a dev-guard.

**Stage 2: Apply**
1. Remove debug-noise console calls.
2. For calls classified as "keep, but guard," wrap with `if (import.meta.env.DEV) { ... }` (Vite env
   check) unless an existing logger utility is found, in which case route through it instead.

**Post-Phase Testing**:
- Manual: open the messaging pages (business, disability, educator, communication/chat) in a dev
  build, exercise send/receive, confirm no console noise from these files in production build mode
  (`npm run build` + `npm run preview`) while normal error paths still surface user-visible feedback
  where they previously relied on console output alone (or are flagged as a noted follow-up).
- Automated: `npm run lint:check` / `npm run lint` (frontend) still passes.

**Verification Checklist**:
- [ ] `grep -rn "console\." frontend/src/pages/business/messages frontend/src/pages/disability/messages frontend/src/pages/educator/messages frontend/src/pages/communication/chat` shows
      only intentionally-kept, dev-guarded, or logger-routed calls (zero unguarded debug noise).
- [ ] No caught-error path silently lost its only feedback mechanism (confirmed via Stage 1
      classification notes).
- [ ] Frontend build (`npm run build`) introduces no NEW errors beyond the recorded pre-existing
      baseline (see Test Gates section) — note: `SharedChatLayout.tsx` (one of this RFC's own 9
      files) already has a pre-existing, unrelated baseline error (`AuthStore.access_token` at
      line 54); this RFC's console-cleanup diff must not add further errors to that file but is not
      expected to fix the pre-existing one.

**Acceptance Criteria**: No unguarded debug-noise `console.*` remains in the listed chat UI files;
any kept console calls are either dev-guarded or documented as an intentional follow-up.

**What's Functional Now**: Shipped chat UI no longer leaks console noise in production builds.

**Ready For**: RFC-010 (optional) or Validate/EVL if RFC-010 is deferred.

**Implementation Checklist**:
- [ ] Classify every `console.*` call across the 9 confirmed files
- [ ] Remove debug-noise calls; dev-guard or logger-route the rest
- [ ] Manually verify send/receive flows + production build console output
- [ ] Run frontend lint + build gates

---

### RFC-010 (Optional): Admin analytics placeholder pages

**Summary**: `frontend/src/hooks/routes/use-router-element.tsx:121-125` renders bare
`<span>Analytics</span>` (and 3 sibling spans) for `ROUTE.ADMIN.ANALYTICS.{ROOT,OVERVIEW,SALES,USERS,PERFORMANCE}`.
Confirmed reachable from the admin sidebar nav (`frontend/src/core/constants/general.const.tsx`
lines 23-45 list all 4 sub-routes under an "Analytics" nav item with icon).

**Dependencies**: None; explicitly optional — execute only after RFC-001..009 are VERIFIED, time
and priority allowing.

**Stage 1: Minimal shared placeholder component**
1. Create one small reusable "coming soon" component (no new dependency; reuse existing card/layout
   primitives already used elsewhere in the admin shell for visual consistency).
2. Replace each bare `<span>...</span>` in `use-router-element.tsx:121-125` with the new component,
   passing a title prop (e.g. "Analytics Overview", "Sales Analytics", etc. matching the sidebar nav
   labels in `general.const.tsx`).

**Post-Phase Testing**:
- Manual: navigate to each of the 4 analytics routes via the admin sidebar; confirm each renders the
  placeholder component with the correct title, styled consistently with the rest of the admin
  shell (not a bare unstyled span).
- Automated: `npm run check:type` (frontend) exits 0 (weak gate, see Test Gates note); `npm run
  build` (frontend) introduces no NEW errors beyond the recorded pre-existing baseline (see Test
  Gates section) in `use-router-element.tsx` or the new placeholder component.

**Verification Checklist**:
- [ ] All 4 analytics routes render the new component, not a bare span.
- [ ] No new route paths added/changed — only the rendered element per existing route.
- [ ] No new dependency introduced.

**Acceptance Criteria**: Reachable admin analytics nav no longer shows unstyled placeholder text.

**What's Functional Now**: Admin analytics section looks intentional (a real "coming soon" state)
instead of an obviously broken/unfinished span.

**Ready For**: VALIDATE / EVL confirmation (final RFC in this plan).

**Implementation Checklist**:
- [ ] Create shared "coming soon" placeholder component
- [ ] Wire it into the 4 analytics routes with correct titles
- [ ] Manually verify all 4 routes render correctly

---

## Rules (for this project)

- **Tech stack**: Node.js + Express 4 (Babel-transpiled) + Knex/Postgres (backend); React 19 + Vite
  6 + Tailwind + Shadcn/ui (frontend). See `process/context/all-context.md` for full stack detail.
- **Code standards**: match existing file conventions exactly (import ordering, relative-path
  style, existing ESLint config) — do not introduce a new lint config or override rules to make
  errors disappear.
- **Architecture**: no new services, no new sidecars, no new background workers introduced by this
  plan.
- **Performance**: no perf-sensitive change in this plan beyond what lint auto-fix/env-lookups
  naturally cost (negligible).
- **Security**: see Security Posture above — no auth/schema changes; `TRUST_PROXY` default is
  safe-by-default.
- **Documentation**: update `process/context/all-context.md` during UPDATE PROCESS if any of these
  fixes change a documented pattern (e.g., note the `TRUST_PROXY` env var once it exists).

---

## Verification (Comprehensive Review)

**Gap Analysis**: The original research audit had two path/detail errors, both corrected during
this plan's re-verification pass: (1) `message.service.ts` lives at
`frontend/src/pages/communication/chat/message.service.ts`, not
`frontend/src/core/services/message.service.ts`; (2) an additional file with console calls,
`SharedChatLayout.tsx`, was found in the same directory during re-verification and is included in
RFC-009's scope. All other findings (RFC-001 through RFC-008, RFC-010) were confirmed exactly as
described via direct Read/Grep against the live tree.

**Improvement Recommendations**: none beyond what's already folded into the RFCs above (accepted
`any`-debt, deferred chat-contract test coverage, deferred mobile/AI-V2).

**Quality Assessment**: Scope is bounded, each RFC is independently revertible, and every touchpoint
was re-verified immediately before writing this plan (not solely trusted from the upstream research
summary) — high confidence in touchpoint accuracy.

---

## Touchpoints

| # | File | Change | RFC |
|---|---|---|---|
| 1 | `backend/src/core/modules/ai/services/job.ingestion.service.js` | import + call site fix | RFC-001 |
| 2 | `backend/src/core/env/index.js` | add `TRUST_PROXY` export | RFC-002 |
| 3 | `backend/__tests__/unit/chat-contract.unit.test.js` | delete | RFC-003 |
| 4 | `backend/src/core/modules/chat/interceptor/chat.interceptor.js` | delete | RFC-004 |
| 5 | `backend/src/core/ai/utils/nlp.js` | remove duplicate `AT_MAP`/`detectATTools`, import canonical | RFC-005 |
| 6 | `backend/src/core/ai/utils/at_detector.js` | (read-only — confirmed canonical, no change needed) | RFC-005 |
| 7 | `backend/src/core/ai/utils/stt.js` | env-driven GCP project id | RFC-006 |
| 8 | `backend/src/core/ai/utils/tts.js` | env-driven GCP project id | RFC-006 |
| 9 | `frontend/src/hooks/routes/use-router-element.tsx` | fix educator dashboard route (line 109) + analytics routes (lines 121-125, RFC-010) | RFC-007, RFC-010 |
| 10 | new file: `EducatorDashboardPage` (path TBD by EXECUTE research, alongside sibling educator pages) | create | RFC-007 |
| 11 | `backend/` (repo-wide, via `eslint --fix`) | lint auto-fix + 6 manual fixes (`applications.resolver.js`, `training.controller.js`, `groq.stt.js`, `conversation.service.js`, `message.service.js`, `voice.service.js` — 2 found at plan-write time, 4 found during VALIDATE) | RFC-008 |
| 12 | `frontend/` (repo-wide, via `eslint . --fix`) | lint auto-fix + manual fixes (unused imports, exhaustive-deps) | RFC-008 |
| 13 | `frontend/src/pages/business/messages/index.tsx` | console cleanup | RFC-009 |
| 14 | `frontend/src/pages/disability/messages/index.tsx` | console cleanup | RFC-009 |
| 15 | `frontend/src/pages/disability/messages/DisabilityEducatorChat.tsx` | console cleanup | RFC-009 |
| 16 | `frontend/src/pages/disability/messages/DisabilityBusinessChat.tsx` | console cleanup | RFC-009 |
| 17 | `frontend/src/pages/educator/messages/index.tsx` | console cleanup | RFC-009 |
| 18 | `frontend/src/pages/communication/chat/useChat.ts` | console cleanup | RFC-009 |
| 19 | `frontend/src/pages/communication/chat/useSocketMessages.ts` | console cleanup | RFC-009 |
| 20 | `frontend/src/pages/communication/chat/message.service.ts` | console cleanup (corrected path) | RFC-009 |
| 21 | `frontend/src/pages/communication/chat/SharedChatLayout.tsx` | console cleanup (found during re-verification) | RFC-009 |
| 22 | new shared component (path TBD by EXECUTE, e.g. `frontend/src/pages/admin/analytics/ComingSoon.tsx`) | create | RFC-010 |

---

## Public Contracts

- **No public API contract changes anywhere in this plan** (locked constraint). Specifically:
  - `POST /api/ai/jobs` request/response shape: unchanged (RFC-001 is an internal fix).
  - `job.weights_json` storage shape: unchanged (`{criterion: weight}` map, same as before the bug
    — the endpoint was previously 100% broken, so there is no "prior working shape" to diverge
    from; the shape now matches what was always intended).
  - No backend routes added/removed/renamed.
  - Frontend route paths (`ROUTE.EDUCATOR.DASHBOARD`, `ROUTE.ADMIN.ANALYTICS.*`) are unchanged —
    only the rendered component per path changes (RFC-007, RFC-010).
  - `core/ai/utils` barrel export (`detectATTools`) becomes unambiguous but is not a breaking change
    for any consumer — its call signature `(text: string) => string[]` is identical before and
    after; only the *quality* of detection improves (superset behavior, RFC-005).
  - The deleted `chat-contract.unit.test.js` (RFC-003) and `chat.interceptor.js` (RFC-004) exported
    only internal test/interceptor symbols never consumed elsewhere — their removal has zero public
    contract impact.

---

## Blast Radius

| RFC | Files touched | Packages | Risk class |
|---|---|---|---|
| RFC-001 | 1 | backend | Low (internal fix, restores broken endpoint) |
| RFC-002 | 1 | backend | Low (adds missing export, safe default) |
| RFC-003 | 1 (delete) | backend | Low (removes dead/broken test) |
| RFC-004 | 1 (delete) | backend | Low (removes confirmed-orphaned file) |
| RFC-005 | 1 (edit) + 1 (read-only confirm) | backend | Low-Medium (behavior superset change in AT detection) |
| RFC-006 | 2 | backend | Low (env fallback preserves current behavior) |
| RFC-007 | 2 (1 edit + 1 new file) | frontend | Medium (new page, route rewiring — user-visible) |
| RFC-008 | repo-wide (backend + frontend), scoped to lint-fixable + 4 named manual fixes | backend + frontend | Low-Medium (auto-fix touches many files; manual review required per file) |
| RFC-009 | 9 files | frontend | Low-Medium (must not silently drop error-path visibility) |
| RFC-010 (optional) | 2 (1 edit + 1 new file) | frontend | Low (isolated placeholder UI) |

**Overall**: no schema/migration/auth/public-API blast radius anywhere in this plan. Highest-risk
items are RFC-007 (new page + route rewiring) and RFC-008 (repo-wide auto-fix diff, requires
careful diff review to avoid incidental behavior change) — both have explicit manual verification
steps above.

---

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| `npm run lint:check` (backend) exits 0 | Fully-Automated | Backend lint hygiene (RFC-008) |
| `npm run build` (backend, `clean && build:babel`) succeeds | Fully-Automated | No broken imports after RFC-001/003/004/005/006 |
| `npm run lint` (frontend) exits 0 for errors | Fully-Automated | Frontend lint hygiene (RFC-008) |
| `npm run check:type` (frontend) exits 0 | Fully-Automated (weak — see Test Gates note; passes regardless due to root tsconfig `files: []`) | No gross config breakage |
| `npm run build` (frontend, `tsc -b && vite build`) — no NEW errors vs. recorded ~20-error baseline | Fully-Automated (baseline-relative — see Test Gates note) | No TS regressions from RFC-007/009/010 in the files they touch |
| Manual: `ingestJob`/`POST /api/ai/jobs` call succeeds, `weights_json` populated | Agent-Probe | RFC-001 acceptance criteria |
| Manual: backend boots, rate-limited route returns 429 after threshold | Agent-Probe | RFC-002 acceptance criteria |
| `grep` confirms no `inferWeights`/duplicate `detectATTools`/hardcoded GCP literal remain (outside fallback) | Fully-Automated | RFC-001, RFC-005, RFC-006 correctness |
| Manual: educator dashboard route renders distinct content from profile-update route | Agent-Probe | RFC-007 acceptance criteria |
| Manual: chat UI console output absent/guarded in a production build preview | Hybrid | RFC-009 acceptance criteria |
| Manual: 4 admin analytics routes render placeholder component, not bare span | Agent-Probe | RFC-010 acceptance criteria (optional) |

---

## Test Infra Improvement Notes

- Documented gap (not a blocker): deleting `chat-contract.unit.test.js` (RFC-003) removes all
  automated contract coverage for the new plural chat module. No replacement test is in scope for
  this plan — flagged here as a legitimate follow-up for a future test-coverage plan.
- Documented gap: `form-controls.tsx`'s `no-explicit-any` warnings are intentionally left untouched
  by RFC-008 despite being accessibility-critical — flagged for a dedicated future review, not
  silently accepted forever.
- **Found during VALIDATE (05-07-26):** `npm run check:type` (frontend) is a weak gate — the root
  `tsconfig.json` (`files: []` + `references` only, no `-b` flag) does not actually typecheck the
  referenced projects, so it exits 0 even with real type errors present. Follow-up: change the
  script to `tsc -b --noEmit` (or equivalent) so `check:type` becomes a meaningful standalone gate.
  Out of scope for this plan (would risk surfacing the ~20 pre-existing baseline errors below as a
  new gate failure unrelated to this plan's RFCs).
- **Found during VALIDATE (05-07-26):** `npm run build` (frontend, `tsc -b && vite build`) fails at
  baseline with ~20 pre-existing TypeScript errors unrelated to this plan (missing `firebase`
  package, `AuthStore` shape mismatches in `axios-client.ts`/`SocketContext.tsx`, `useWebRTCCall.ts`
  handler signatures, `CvPayload` shape in `cv-confirmation-form-page.tsx`, a generic constraint in
  `register-form-card.tsx`, and a response-shape issue in `Login.tsx`). Follow-up: a dedicated
  future plan should fix these (starting with removing/implementing the `firebase.ts` module, which
  looks like dead/unfinished code referencing an uninstalled dependency). This plan's Test Gates
  section redefines the frontend build gate as baseline-relative for this reason — see Test Gates.

---

## Test Gates

Run from each package root (`backend/`, `frontend/`) unless noted:

- **Backend lint (gate)**: `npm run lint:check` (in `backend/`)
- **Backend build (gate)**: `npm run build` (in `backend/` — runs `clean` then `build:babel`)
- **Frontend lint (gate)**: `npm run lint` (in `frontend/`)
- **Frontend type-check (gate, weak — see note)**: `npm run check:type` (in `frontend/`)
- **Frontend build (gate, baseline-relative — see note)**: `npm run build` (in `frontend/` — runs
  `tsc -b && vite build`)

**VALIDATE correction (05-07-26 — confirmed by running both commands read-only against the live
`dev-kiet` tree before any RFC changes):**

1. **`npm run check:type` is a weak gate.** The root `frontend/tsconfig.json` has `"files": []` and
   only `"references"` (to `tsconfig.app.json`/`tsconfig.node.json`); running `tsc --project
   tsconfig.json --noEmit` against it does not meaningfully typecheck the referenced projects' files
   — it currently exits 0 even though real type errors exist (confirmed below). Keep it as a gate
   (cheap, catches gross config breakage) but do NOT treat a clean `check:type` as proof of type
   safety for this plan's RFCs.
2. **`npm run build` (frontend, `tsc -b && vite build`) currently FAILS at baseline** — confirmed by
   running it against the unmodified `dev-kiet` tree — with ~20 pre-existing TypeScript errors that
   are **unrelated to any RFC in this plan** and are **out of scope to fix here** (fixing them would
   be a large, unplanned scope expansion — e.g. a missing `firebase` package dependency, `AuthStore`
   type shape mismatches, WebRTC handler signature mismatches, CV payload type mismatches). Full
   baseline error list: `firebase.ts` (missing `firebase/app`/`firebase/auth` module + `firebase`
   config property, 8 errors), `axios-client.ts:133,138` (`AuthStore` shape), `SocketContext.tsx:15`
   (`AuthStore.access_token`), `use-query-auth.ts:33` (`RegisterRequest.role`), `useWebRTCCall.ts`
   (4 errors, `SocketEventHandler` signature), `cv-confirmation-form-page.tsx:92,94` (`CvPayload`
   shape), `register-form-card.tsx:28` (generic constraint), `Login.tsx:63` (response shape).
   **Gate redefinition for this plan: "frontend build" passes when `tsc -b && vite build` reports
   NO NEW errors beyond this recorded baseline list** — i.e. diff the error output against the list
   above; only errors in files this plan's RFCs actually touch (`use-router-element.tsx`, the new
   `EducatorDashboardPage`, the new analytics placeholder component, and the 9 RFC-009 chat-UI
   files) count against this plan's gate. Do NOT attempt to fix the baseline errors under this
   plan — they are known-gap, tracked below.
3. This changes **RFC-007, RFC-009, and RFC-010's** "Automated: `npm run check:type` and `npm run
   build` (frontend) succeed" Post-Phase Testing lines: read as "no new errors beyond the recorded
   baseline, in the files this RFC touches."

**Not gates (manual/optional only)** — do not block EXECUTE/EVL completion on these:
- `npm test` (backend Jest, `jest --runInBand`) — several suites require a live DB/external
  credentials (e.g. `test:ai` needs Google Cloud credentials per `process/context/tests/all-tests.md`);
  only use manually to spot-check RFC-003's collection-failure fix.
- `npm test` (frontend Jest) — run manually if useful, but not a required gate for this plan since
  no test files are added/changed here beyond the one deletion in RFC-003 (backend-only test).

---

## Resume and Execution Handoff

1. **Selected plan file path**: `process/general-plans/active/product-completion_05-07-26/product-completion_PLAN_05-07-26.md`
2. **Last completed phase or step**: VALIDATE complete (05-07-26) — Gate: CONDITIONAL, resolved via
   2 in-session plan-text fixes (see `## Validate Contract`); no RFC has started EXECUTE yet.
3. **Validate-contract status**: written — `Gate: CONDITIONAL` (0 FAILs, 2 CONCERNs both resolved by
   plan fixes applied during this VALIDATE pass — RFC-008 backend manual-fix list expanded; frontend
   build gate redefined as baseline-relative). Standing autopilot EXECUTE consent already covers
   this verdict — no further approval prompt required before EXECUTE.
4. **Supporting context files loaded**: `process/context/all-context.md`,
   `process/context/tests/all-tests.md`, `process/context/planning/all-planning.md`,
   `.claude/skills/vc-generate-plan/references/generate-plan.md`,
   `.claude/skills/vc-generate-plan/references/example-complex-prd.md`,
   `.claude/skills/vc-validate-findings/references/example-validate-output.md`,
   `process/general-plans/active/product-completion_05-07-26/product-completion_AUTOPILOT_GOAL_05-07-26.md`.
5. **Next step for a fresh agent picking up mid-execution**: read this plan's `## Validate Contract`
   section — it is complete (not a placeholder). Proceed directly to EXECUTE: RFC-001 through
   RFC-009 in strict order (each is independent but sequenced by severity/grouping above); RFC-010
   is optional and comes last. Re-run the Test Gates after every RFC, not just at the end. Pay
   particular attention to Execute-agent instructions E1-E3 in the Validate Contract (frontend-build
   baseline comparison, fresh lint line numbers, and the already-likely-fixed unused-imports check).

---

## Acceptance Criteria

- [ ] `POST /api/ai/jobs` (or direct `ingestJob` call) completes without throwing; `weights_json` populated.
- [ ] Backend boots without a `TRUST_PROXY` (or any) missing-export error.
- [ ] `backend/__tests__/unit/chat-contract.unit.test.js` no longer exists / no longer fails Jest collection.
- [ ] `backend/src/core/modules/chat/interceptor/chat.interceptor.js` no longer exists; backend still builds.
- [ ] Exactly one `detectATTools` definition exists (`at_detector.js`); `nlp.js` imports it.
- [ ] `stt.js`/`tts.js` read `GOOGLE_CLOUD_PROJECT` from env with the prior literal only as fallback.
- [ ] Educator dashboard route renders distinct content from the profile-update route.
- [ ] `npm run lint:check` (backend) and `npm run lint` (frontend) both exit with 0 errors.
- [ ] No unguarded `console.*` debug noise remains in the 9 confirmed chat UI files.
- [ ] (Optional) All 4 admin analytics routes render a placeholder component instead of a bare span.
- [ ] All 5 Test Gates (backend lint/build, frontend lint/type-check/build) pass — frontend build
      gate evaluated as "no NEW errors vs. the recorded ~20-error pre-existing baseline" per the
      Test Gates section correction (baseline errors are known-gap, out of scope for this plan).

---

## Validate Contract

Status: CONDITIONAL
Date: 05-07-26
Gate: CONDITIONAL — 0 FAILs; 2 CONCERNs found, both resolved by plan-text fixes applied directly
above during this VALIDATE pass (2 plan fixes; 0 execute-agent-only instructions; 0 known-gaps
requiring further acceptance). Proceed to EXECUTE.
generated-by: outer-pvl

### How this contract was produced

V1 (pre-check): plan file read in full (1113 lines pre-edit). Blast radius: 22 touchpoints across
2 packages (backend, frontend). No schema/auth/API surface. Signal score: 2/7 (S6 partial — no
actual high-risk class touched, S7 — 22 touchpoints ≥5). Existing `## Validate Contract` was a
placeholder — full V1-V7 run required (not skippable).

V2 (fan-out): ran all 4 Layer 1 dimension checks and 4 Layer 2 section checks (grouped by the
plan's own Execution Brief Groups 1-4) using direct Read/Grep/lint/build verification against the
live `dev-kiet` working tree (no live DB, no billed API calls — all checks were static/read-only or
local lint/build runs).

V3 (synthesis): see Net Gate Derivation below.

### Layer 1 — Dimension Findings

**Infra / Setup Fit**

| Finding | Severity | Proposed fix |
|---|---|---|
| `getJobWeights` exists at `match.scoring.js:107-108`, signature `(job = {})`, matches RFC-001's call-site fix exactly | ✅ PASS | — |
| `TRUST_PROXY` confirmed imported/used at `security-rate-limit.middleware.js:2,46` but never exported from `core/env` — confirmed via live `lint:check` run (`import/named` error) | ✅ PASS | — |
| `chat-contract.unit.test.js` confirmed importing 3 non-existent Zod schema exports — confirmed via `eslint --fix-dry-run` (`import/named` errors) | ✅ PASS | — |
| `chat.interceptor.js` confirmed dead: `grep -rn` across `backend/src` shows its 3 exports referenced nowhere outside the file itself; not re-exported by its own `interceptor/index.js` | ✅ PASS | — |
| `detectATTools` duplicate confirmed in both `at_detector.js:10` and `nlp.js:12`; both re-exported via `export *` in `backend/src/core/ai/utils/index.js` AND (found during VALIDATE) `backend/src/core/ai/index.js` — live lint confirms "Multiple exports of name 'detectATTools'" errors in both barrels | ✅ PASS (RFC-005 fixes both barrels as one change) | — |
| `bdien-muonmay` hardcode confirmed at `stt.js:42` and `tts.js:73`; `GOOGLE_CLOUD_PROJECT` already exported from `core/env:19` | ✅ PASS | — |
| `use-router-element.tsx:109` confirmed rendering `EducatorProfileUpdatePage` for both `ROUTE.EDUCATOR.DASHBOARD` and `ROUTE.EDUCATOR.PROFILE_UPDATE`; no `EducatorDashboardPage` file exists anywhere in `frontend/src`; `BusinessDashboardPage` pattern confirmed reusable (`@/pages/business/dashboard`) | ✅ PASS | — |
| `use-router-element.tsx:121-125` confirmed rendering bare `<span>` for all 4 admin analytics routes; `general.const.tsx:23-45` confirms sidebar nav reachability | ✅ PASS | — |
| Backend `npm run lint:check` baseline: 41 errors/15 warnings — **exact match** to plan's stated count | ✅ PASS | — |
| Frontend `npm run lint` baseline: 54 errors/90 warnings — **exact match** to plan's stated count | ✅ PASS | — |
| Backend `npm run build` (babel) succeeds cleanly at baseline | ✅ PASS | — |
| RFC-008 Stage 2 backend manual-fix list was incomplete: 6 additional real, non-auto-fixable lint errors found via `eslint --fix-dry-run` (`groq.stt.js` ×3 `no-undef`, `conversation.service.js` `no-continue`, `message.service.js` `no-return-await`, `voice.service.js` `no-undef`) that block the RFC's own "0 errors" acceptance criteria | CONCERN | Applied to plan: added as Stage 2 items 3-6, Touchpoints row 11, Verification/Implementation Checklists in RFC-008 |
| Frontend `npm run check:type` passes but is a no-op-ish gate (root `tsconfig.json` has `files: []` + `references` only, not built via `-b`) | CONCERN | Applied to plan: Test Gates section now documents this explicitly; kept as a gate but not relied on for type-safety proof |
| Frontend `npm run build` (`tsc -b && vite build`) **fails at baseline** with ~20 pre-existing TS errors entirely unrelated to this plan's RFCs (missing `firebase` package, `AuthStore` shape mismatches, `useWebRTCCall.ts` handler signatures, `CvPayload` shape, generic constraint in `register-form-card.tsx`, `Login.tsx` response shape) | CONCERN | Applied to plan: Test Gates section redefines this gate as "no NEW errors vs. recorded baseline"; RFC-007/009/010 Post-Phase Testing and Verification Checklist lines updated to match; baseline list also recorded in Test Infra Improvement Notes as a known future-plan follow-up |

**Test Coverage**

| Finding | Severity | Proposed fix |
|---|---|---|
| All 5 Test Gates are Fully-Automated (lint ×2, build ×2, type-check ×1); no hybrid/agent-probe tier is forced since no high-risk class (auth/billing/schema/public-API/container/secrets) is touched anywhere in this plan | ✅ PASS | — |
| `npm test` (backend, requires live DB/GCP creds for some suites) correctly excluded as a non-gate; RFC-003's own scoped check (confirm file deleted / `npx jest` on the single path) does not require a live DB | ✅ PASS | — |
| Two of five gates were unreliable as originally worded (see Infra findings above: weak `check:type`, baseline-failing `build`) | CONCERN | Same fix as above — gate wording corrected in plan |

**Breaking Changes**

| Finding | Severity | Proposed fix |
|---|---|---|
| No schema/migration files touched; `backend/src/core/database/migrations/` and `supabase/` confirmed untouched by any RFC | ✅ PASS | — |
| No public API route added/removed/renamed; `POST /api/ai/jobs` request/response shape unchanged (RFC-001 is an internal-only fix, confirmed by reading the call site — `jobPayload` destructuring is unchanged, only the weights source changes) | ✅ PASS | — |
| `core/ai/utils` barrel's `detectATTools` call signature `(text: string) => string[]` unchanged before/after RFC-005 — confirmed by reading both current implementations; only detection completeness improves (superset) | ✅ PASS | — |
| Deleted files' exports (`chat-contract.unit.test.js`, `chat.interceptor.js`) confirmed to have zero consumers via repo-wide grep | ✅ PASS | — |

**Security Surface**

| Finding | Severity | Proposed fix |
|---|---|---|
| `TRUST_PROXY` default (`process.env.TRUST_PROXY === 'true'`, else `false`) confirmed safe — matches current de-facto behavior (untrusted `x-forwarded-for` today since the middleware currently fails to load at all) | ✅ PASS | — |
| No auth/session/JWT/role-guard files touched by any RFC (confirmed via Touchpoints table — no `auth` module file listed) | ✅ PASS | — |
| `GOOGLE_CLOUD_PROJECT` confirmed already a non-secret, documented env var (`core/env:19`, `process/context/all-context.md`) | ✅ PASS | — |
| No new endpoints, no new external calls, no secrets read/written by any RFC | ✅ PASS | — |

---

### Layer 2 — Per-Section Feasibility

**Group 1 (RFC-001..003) — Critical Runtime Fixes**

| Question | Verdict | Detail |
|---|---|---|
| Mechanical feasibility | PASS | All 3 edit targets confirmed present and uniquely matchable (`inferWeights` import line, `TRUST_PROXY` import line, the stale test file path). |
| Plan gaps | PASS | None found — `getJobWeights(jobPayload)` correctly receives the full payload object (destructuring in `ingestJob` reads from, does not replace, `jobPayload`). |
| Conflicts | PASS | None — all 3 RFCs are independent, non-overlapping files. |
| Highest-risk edit | RFC-001's call-site change (passing full `jobPayload` instead of a 3-field object) — low risk; `getJobWeights` only reads `priorities`/`criteria_priorities`/`weightPriorities`, ignores everything else, so passing the superset object is safe. |

**Group 2 (RFC-004..007) — Dead Code, Duplication, Hardcoding, Routing Bug**

| Question | Verdict | Detail |
|---|---|---|
| Mechanical feasibility | PASS | All 4 edit/delete targets confirmed exactly at the claimed locations. |
| Plan gaps | PASS | None beyond the already-noted `ai/index.js` side-benefit (informational, no separate action). |
| Conflicts | PASS | None. |
| Highest-risk edit | RFC-007 (new `EducatorDashboardPage` + route rewiring) — user-visible, requires EXECUTE to research `BusinessDashboardPage`'s pattern first (already instructed in the plan); mitigation: keep the new page minimal/thin per AD-007. |

**Group 3 (RFC-008..009) — Lint Hygiene & Console Cleanup**

| Question | Verdict | Detail |
|---|---|---|
| Mechanical feasibility | CONCERN → now PASS after plan fix | RFC-008's original Stage 2 list was incomplete (see Infra finding above) — fixed directly in the plan. RFC-009's 9 file/count claims verified **exactly** via `grep -c "console\."` against live files (4,4,4,4,4,5,3,6,2 — all match). |
| Plan gaps | PASS (after fix) | Closed by the Stage 2 addendum above. |
| Conflicts | PASS | No logger utility found in `frontend/src` (confirmed via grep) — plan's "prefer removal over inventing a logger" guidance is correctly the default path. |
| Highest-risk edit | RFC-008's repo-wide auto-fix diff — mitigation already specified in the plan (diff-review requirement in Stage 1.3). |

**Group 4 (RFC-010, optional) — Admin Analytics Placeholder**

| Question | Verdict | Detail |
|---|---|---|
| Mechanical feasibility | PASS | 4 bare `<span>` targets confirmed at `use-router-element.tsx:121-125`; sidebar nav reachability confirmed at `general.const.tsx:23-45` (Analytics nav block with 4 children, matching plan claim exactly). |
| Plan gaps | PASS | None. |
| Conflicts | PASS | None — isolated, optional, no dependency on other RFCs' internals. |
| Highest-risk edit | None significant — shares the frontend-build baseline caveat noted above, not a risk specific to this RFC. |

---

### Net Gate Derivation

| Layer 1 dimensions | Status |
|---|---|
| Infra fit | CONCERN (2 items — both resolved by plan fix) |
| Test coverage | CONCERN (same 2 items) |
| Breaking changes | PASS |
| Security surface | PASS |

| Layer 2 sections | Status |
|---|---|
| Group 1 — Critical Runtime Fixes | PASS |
| Group 2 — Dead Code/Duplication/Hardcoding/Routing | PASS |
| Group 3 — Lint Hygiene & Console Cleanup | CONCERN → resolved by plan fix |
| Group 4 — Admin Analytics Placeholder (optional) | PASS |

**Totals: 0 FAILs / 2 distinct CONCERNs (each surfaced from both a Layer 1 and its corresponding Layer 2 angle) / all resolved via direct plan-text fixes during this VALIDATE pass.**

**→ Net Gate: CONDITIONAL — 2 concerns resolved: 2 plan fixes (RFC-008 Stage 2 backend manual-fix list expanded; Test Gates/Verification Evidence/RFC-007+009+010 frontend-build gate redefined as baseline-relative), 0 execute-agent-only instructions, 0 known-gaps requiring further user acceptance. Proceed to EXECUTE.**

### Plan updates applied

- [x] RFC-008: added 6 additional real backend lint errors (found via live `eslint --fix-dry-run`) to Stage 2 Manual Fixes, Verification Checklist, and Implementation Checklist (`groq.stt.js` ×3 no-undef, `conversation.service.js` no-continue, `message.service.js` no-return-await, `voice.service.js` no-undef); Touchpoints row 11 updated.
- [x] Test Gates section: redefined the frontend build gate as "no NEW errors vs. a recorded ~20-error pre-existing baseline" (confirmed by running `tsc -b && vite build` against the unmodified tree) and flagged `check:type` as a weak/non-diagnostic gate; propagated the same wording into RFC-007, RFC-009, and RFC-010's Post-Phase Testing / Verification Checklist lines, the Verification Evidence table, the global Acceptance Criteria, and Test Infra Improvement Notes (2 new dated entries).

### Execute-agent instructions

| # | Instruction | Trigger condition |
|---|---|---|
| E1 | When running the frontend build gate after RFC-007/009/010, compare `tsc -b` output against the baseline error list in the Test Gates section — only treat NEW errors (in files this plan's RFCs touch) as gate failures. Do not attempt to fix the baseline errors; if a baseline error's file happens to be touched by an RFC (e.g. `SharedChatLayout.tsx` in RFC-009), only its RFC-scoped edit needs to stay error-count-neutral for that file, not error-free. | Any frontend build gate run after RFC-007, RFC-009, or RFC-010 |
| E2 | Before starting RFC-008 Stage 2, re-run `npm run lint:check` (backend) fresh (post RFC-001..005, post RFC-008 Stage 1 auto-fix) to get current line numbers — the line numbers cited in the plan for `training.controller.js` and `groq.stt.js`/`conversation.service.js`/`message.service.js`/`voice.service.js` may shift slightly depending on exact auto-fix output; match by rule name + file, not by hardcoded line number alone. | RFC-008 Stage 2 entry |
| E3 | For RFC-008 Stage 3 item 1 (unused imports `Plus`/`ReactNode`/`ShieldAlert`/`Mic`): check whether Stage 1's `eslint . --fix` already removed them (confirmed likely — `unused-imports` rule is auto-fixable) before treating this as separate manual work; only act if they still appear in a fresh lint run. | RFC-008 Stage 3 entry |

### Test gates (run after each RFC group; full regression suite after Group 4 or after Group 3 if RFC-010 is skipped)

**Backend (Groups 1-3)**
- Fully-automated: `npm run lint:check` (in `backend/`) exits 0 — proves RFC-001, RFC-002, RFC-005, RFC-006, RFC-008 correctness (import fixes, no lingering hardcodes, no duplicate exports, 0 real lint errors including the 6 found during VALIDATE)
- Fully-automated: `npm run build` (in `backend/`) succeeds — proves no broken imports after any deletion/edit (RFC-001, 003, 004, 005, 006, 008)
- Agent-probe: manually invoke `ingestJob`/`POST /api/ai/jobs` with a minimal payload; confirm no throw, `weights_json` populated — proves RFC-001
- Agent-probe: start backend, hit a rate-limited route past threshold, confirm 429 — proves RFC-002
- Known-gap: full `npm test` (backend Jest) — not a gate (several suites need live DB/GCP creds per `process/context/tests/all-tests.md`); manual spot-check only for RFC-003's collection-failure fix

**Frontend (Groups 2-4)**
- Fully-automated: `npm run lint` (in `frontend/`) exits 0 for errors — proves RFC-008 frontend cleanup; remaining warnings must be only the accepted `any`-debt category
- Fully-automated (weak, see note): `npm run check:type` (in `frontend/`) exits 0
- Fully-automated (baseline-relative, see note): `npm run build` (in `frontend/`) introduces no NEW errors vs. the recorded ~20-error baseline — proves RFC-007/009/010 don't regress type safety in the files they touch
- Agent-probe: navigate to educator dashboard + profile-update routes, confirm distinct rendering — proves RFC-007
- Agent-probe: exercise messaging pages in dev + a production preview build, confirm no unguarded console noise and no lost error feedback — proves RFC-009
- Agent-probe (optional): navigate to all 4 admin analytics routes, confirm placeholder component renders — proves RFC-010

**Regression suite (after Group 3, mandatory; after Group 4 if RFC-010 executed)**
- `npm run lint:check` (backend) exits 0
- `npm run build` (backend) succeeds
- `npm run lint` (frontend) exits 0 for errors
- `npm run build` (frontend) — no NEW errors vs. baseline

### High-risk pack

Required: no — no auth/billing/schema/public-API/container-gateway/secrets class is touched
anywhere in this plan (confirmed across all 10 RFCs during Layer 1 Security Surface and Breaking
Changes checks above).

### Backlog artifacts to create during durable capture

- `test-chat-contract-coverage_NOTE_05-07-26.md` — tracks the loss of automated contract test
  coverage for the new plural chat module after RFC-003 deletes the stale test (no replacement in
  scope for this plan).
- `frontend-typecheck-and-build-baseline_NOTE_05-07-26.md` — tracks (a) making `check:type` a real
  gate (`tsc -b --noEmit` or equivalent) and (b) fixing the ~20 pre-existing `tsc -b && vite build`
  baseline errors (missing `firebase` package, `AuthStore` shape mismatches, `useWebRTCCall.ts`
  handler signatures, `CvPayload` shape, `register-form-card.tsx` generic constraint, `Login.tsx`
  response shape) — both found during this VALIDATE pass, both out of scope for this hardening plan.
- `form-controls-any-debt-review_NOTE_05-07-26.md` — tracks a dedicated future review of
  `form-controls.tsx`'s `no-explicit-any` usages, intentionally left untouched by RFC-008 per AD-008.

### Known gaps on record

- None requiring further user acceptance — both CONCERNs found during this VALIDATE pass were
  resolved by direct plan-text fixes (see Plan updates applied above), not deferred as known-gaps.
  The 3 backlog artifacts above are pre-existing/out-of-scope follow-ups, not gaps in this plan's
  own correctness.

### Accepted by

session (autopilot standing consent, `product-completion_05-07-26` goal block) — both CONCERNs
were resolved in-session by applying the plan-text fixes listed above; no user round-trip was
required per the standing autopilot EXECUTE consent and the VALIDATE skill's CONDITIONAL-with-plan-fixes path.

---

## Next Step

**RIPER-5**: VALIDATE is complete — `Gate: CONDITIONAL` (0 FAILs, 2 CONCERNs, both resolved via
plan-text fixes applied during VALIDATE; see `## Validate Contract`). Per the standing autopilot
goal block, EXECUTE consent is already standing for this verdict — no further approval prompt is
required. Say **"ENTER EXECUTE MODE"** to begin RFC-001.

**Cursor Plan mode**: import the per-RFC "Implementation Checklist" blocks above in RFC order;
after each RFC, update its status marker in [Phased Delivery Plan](#phased-delivery-plan) and
re-run the relevant Test Gates before moving to the next RFC.
