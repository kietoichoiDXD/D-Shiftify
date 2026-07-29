---
name: plan:auth-completion
description: "Fix D-Shiftify auth wiring (store shape, field casing, refresh fallback, revocation, role redirect, dead-code cleanup) so login/logout/role-redirect work end-to-end"
date: 05-07-26
feature: general
phase: "single"
---

# Auth Completion — Implementation Plan

**SPEC/INNOVATE status:** Both SKIPPED. Reason: this is a completion/fix pass over an already-designed
auth flow (JWT + rotated opaque refresh tokens, role-based redirect, cookie + LS dual storage). No new
product surface, no new design choice — every fix below is dictated by a concrete bug found in RESEARCH
(wrong field casing, orphaned store, dead UI, missing wiring). Per CLAUDE.md Phase Table, SPEC/INNOVATE
are skippable when "the how is mechanical." Locked decisions D1–D9 (see Autopilot goal block /
`auth-completion_AUTOPILOT_GOAL_05-07-26.md`) were made under autopilot decision policy and are NOT
reopened here — this plan sequences and scopes them.

**Autopilot context:** decision policy = auto-proceed on reversible decisions; PVL BLOCKED → backlog +
skip; loop cap 10 cycles; EXECUTE = opus, all other phases = sonnet; no inline execution.

**Date**: 05-07-26
**Status**: VALIDATE complete — ready for EXECUTE
**Complexity**: SIMPLE

---

## Overview

D-Shiftify's backend auth (login/register/refresh/logout, JWT access token + DB-backed rotated opaque
refresh token) is structurally sound. The frontend has 5 concrete wiring bugs that break login
persistence, refresh, logout revocation, and redirect consistency, plus dead/orphaned code adding
confusion. This plan fixes all of it without touching schema, JWT strategy, or any consumed API
contract shape (backend response stays `{ accessToken, refreshToken, expiresIn, user }`).

## Goals

1. Login persists real tokens; reload does not silently log the user out.
2. Body-based token refresh (used by `axios-client.ts`/`apiClient.ts` interceptors) actually works against the backend.
3. Logout revokes both the refresh token (already done) and the access token (currently missing).
4. Role redirect logic has exactly one source of truth.
5. Dead/orphaned auth code is removed so future changes don't touch the wrong file.
6. `npx tsc --noEmit` auth-surface errors go from 5 to 0; total errors do not regress past 18 (baseline 23, minus the 5 fixed).

## Non-Goals / Out of Scope (recorded per D7)

- Email verification / resend-verification-email backend implementation (mail infra) — **known-gap, backlogged**, not built in this plan. Frontend calls to these endpoints will continue to 404 until a future plan adds them.
- DB schema/migration changes.
- JWT secret/expiry strategy changes.
- Non-auth typecheck errors (firebase module missing, WebRTC, CV form typing) — explicitly out of scope per RESEARCH.
- Wiring `TokenRevocationService.isRevoked()` into the shared `JwtValidator` request-auth guard — **known-gap, backlogged** (see `## Known Gaps (Resolved via Backlog)`). Touching the shared guard used by every protected route is a bigger, riskier change than this completion pass; the current plan's access-token-revocation addition is accepted as defense-in-depth only (see VALIDATE finding below).

---

## Touchpoints

**Backend**
- `backend/src/core/api/auth/auth.controller.js` — refresh() body fallback (D4); logout() extracts access token
- `backend/src/core/modules/auth/service/auth.service.js` — logout() wires TokenRevocationService (D5)
- `backend/src/core/modules/auth/service/token-revocation.service.js` — read-only reference (revoke() signature)
- `backend/__tests__/unit/` — new `auth-service.unit.test.js` (or extend existing pattern) covering login/refresh/logout incl. body-fallback + revocation

**Frontend**
- `frontend/src/core/store/features/auth/authStore.ts` — add token fields + actions (D1)
- `frontend/src/core/store/features/auth/types.ts` — extend `AuthState`/`AuthStore` (D1)
- `frontend/src/core/shared/auth.ts` — implement `getPersistedAuth()`/`isAuthenticated()`/`getCurrentUser()` (D1)
- `frontend/src/core/store/auth.store.ts` — **DELETE if zero importers at execute time** (orphaned, D1). VALIDATE found ONE current importer: `frontend/src/pages/candidate/profile.tsx` (itself dead/unrouted — zero references anywhere in the router). Per the zero-importer safety check this deletion will be skipped and noted; do not widen scope to also delete `profile.tsx` (out of blast radius) — record as a phase-report concern instead.
- `frontend/src/pages/login/Login.tsx` — **DELETE** (dead, D2). VALIDATE confirmed zero importers (router uses `pages/auth/login` → `figma-auth-shell.tsx`, not this file).
- `frontend/src/pages/auth/register/components/register-form-card.tsx` and `frontend/src/pages/auth/register/components/role-selection-card.tsx` — **DELETE** (dead, D2; VALIDATE confirmed zero importers for both).
- `frontend/src/pages/auth/register/index.tsx` — **DO NOT DELETE.** VALIDATE correction: this file is the LIVE component the router lazy-imports (`frontend/src/hooks/routes/use-router-element.tsx:15,71` — `const Register = lazy(() => import('@/pages/auth/register'))`, rendered at the public `/register` route, which is linked from header nav, homepage CTAs, and the login form). It is a two-line wrapper (`return <FigmaAuthShell mode='register' />`) — keep it as-is. RESEARCH's original "expected zero importers for the whole directory" claim was wrong for this one file; only the two `components/*.tsx` files under it are actually dead.
- `frontend/src/pages/auth/components/figma-auth-shell.tsx` — field casing fix + role-redirect unification (D3, D6)
- `frontend/src/core/services/api/apiClient.ts` — field casing fix in `refreshToken()` (D3)
- `frontend/src/core/services/axios-client.ts` — field casing fix in interceptor + store field names (D3)
- `frontend/src/core/services/auth.service.ts` — no casing bug found (uses typed `LoginResponse`/`RegisterRequest` already); verify against new store shape only
- `frontend/src/models/interface/auth.interfaces.ts` — canonical camelCase types (no change expected; confirm consumers align)
- `frontend/src/models/interface/auth.interface.ts` (singular) and `frontend/src/models/auth/interfaces.ts` — **DELETE if zero importers** (dead snake_case duplicate types found in RESEARCH). VALIDATE found `frontend/src/models/interface/auth.interface.ts` (singular) IS currently imported by `frontend/src/pages/login/Login.tsx` (which this plan deletes in the same pass, Section E step 14). Because step 11 (Section C) runs BEFORE step 14 (Section E), the zero-importer check at step 11 will find this importer and skip the deletion by default — **execute-agent must re-run the zero-importer grep for `models/interface/auth.interface.ts` again after Section E completes (Login.tsx is gone) and delete it then if clear**, so cleanup is not silently left half-done. `models/auth/interfaces.ts` has zero importers throughout — no sequencing issue.
- `frontend/src/core/helpers/auth-route.ts` — unchanged; becomes sole redirect source (D6)
- `frontend/src/contexts/SocketContext.tsx` — read new store field name (D8)
- `frontend/src/pages/communication/chat/SharedChatLayout.tsx` — read new store field name (D8)
- `frontend/src/hooks/tanstack-query/auth/use-query-auth.ts` — fix `useRegisterAuth` call-site typing for `role`/`full_name` (D9). Note: VALIDATE confirmed this hook's only current consumer is `frontend/src/pages/register/Register.tsx`, which is itself unrouted/dead — the fix is still required to hit the "0 auth-surface tsc errors" gate, but has no live-UX effect (the live register flow goes through `figma-auth-shell.tsx` directly, not this hook).

**Manual verification only (no file change)**
- Candidate / recruiter / training_center login + logout smoke test

---

## Public Contracts

- Backend `/api/v1/auth/login`, `/register`, `/refresh`, `/logout` response shapes are **unchanged** (`{ accessToken, refreshToken, expiresIn, user }` on login; `{ accessToken, refreshToken }` on refresh). D3 only changes what the frontend reads, not what the backend returns.
- `/api/v1/auth/refresh` gains an **additive** accept path: `req.body.refresh_token` as fallback when `req.cookies.refresh_token` is absent. Cookie-based callers are unaffected (D4).
- `useAuthStore` (active store) public shape changes: adds `accessToken: string | null`, `refreshToken: string | null`, `setToken(accessToken, refreshToken)`, `clearToken()`. Existing fields (`user`, `isAuthenticated`, `isLoading`, `error`) and existing actions (`loginStart`, `loginSuccess`, `loginFailure`, `logout`, `updateUser`) are preserved — this is additive, not a breaking rename, so all current importers (`protected-route.tsx`, `use-auth.ts`, `use-auth-redirect.ts`, router, `SocketContext.tsx`, `SharedChatLayout.tsx`) keep working after their internal field references are updated (D8).
- `getDashboardRouteByRole()` in `auth-route.ts` becomes the single role-redirect authority; the inline map in `figma-auth-shell.tsx` is deleted (D6). No signature change. **VALIDATE note:** the actual destinations differ from the inline map being replaced — candidate goes from `ROUTE.DISABILITY.JOBS` (`/disability/jobs`) to `ROUTE.DISABILITY.DASHBOARD` (`/dashboard/disability`), recruiter goes from `ROUTE.BUSINESS.JOB_CREATE` (`/business/jobs/create`) to `ROUTE.BUSINESS.DASHBOARD` (`/dashboard/business`); training_center is unchanged (`/educator/profile/update` both ways). This is the intended effect of locked decision D6 (single source of truth), not a bug — the manual smoke test (Section F item 21) must verify against the NEW `getDashboardRouteByRole()` destinations, not the old inline-map ones.

---

## Blast Radius

- **Risk class:** auth/identity (HIGH-RISK — per orchestration.md high-risk classes). Manual-first smoke test required before closure (see Verification Evidence).
- **Files touched:** ~13 files (7 frontend edits, 5 frontend deletions [corrected: 2 register sub-components + Login.tsx + up to 2 model files, `index.tsx` is NOT deleted], 2 backend edits). No schema/migration changes. No new dependency, agent, or runtime surface.
- **Packages:** `backend` (auth module only), `frontend` (auth store, auth services, 2 chat consumers, auth UI).
- **Blast radius is NOT phase-program scale** — single SIMPLE plan, sequential execution, no parallel fan-out needed for EXECUTE.

---

## Implementation Checklist

Ordered so nothing depends on a later step; store shape lands before consumers are repointed.

### Section A — Backend fixes (D4, D5)

1. **`backend/src/core/api/auth/auth.controller.js`** — in `refresh()`, change token resolution to:
   `const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token;` (cookie still takes priority; body is fallback). Keep the existing `if (!refreshToken) throw UnAuthorizedException` guard unchanged.
2. **`backend/src/core/modules/auth/service/auth.service.js`** — in `logout(logoutDto)`:
   - import `TokenRevocationService` from `./token-revocation.service.js` and add `this.tokenRevocationService = TokenRevocationService;` in the `Service` constructor (alongside the other service assignments), matching the existing DI-style pattern in this class.
   - after resolving `tokenRecord`, if the caller can supply an access token, call `this.tokenRevocationService.revoke(accessToken)`. Since `logout()` currently only receives `refresh_token` in the DTO, extend `logoutDto`/controller call to also pass the access token — read it from `req.cookies?.access_token` (already set at login/refresh) or from the `Authorization` header if present, whichever the controller already has access to. Do this via `backend/src/core/api/auth/auth.controller.js` `logout()`: extract `const accessToken = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];` and pass `{ refresh_token: refreshToken, access_token: accessToken }` to `this.service.logout(...)`.
   - `logout()` service: only call `revoke()` when `access_token` is present (do not throw if absent — logout must remain best-effort per its existing "always return 200" comment).
   - **VALIDATE finding (defense-in-depth note):** the live request-auth guard (`backend/src/packages/authModel/module/authentication/JwtValidator.js`) does NOT call `TokenRevocationService.isRevoked()` — it checks the `refresh_tokens` DB row (`WHERE id = payload.ref AND revoked = false`) instead. Because every access token embeds `ref` and `logout()` already revokes that refresh-token row (pre-existing code), access tokens are already effectively invalidated on the next protected request via that ref-check, independent of this step. Add a one-line code comment at the `revoke()` call site noting this is additive defense-in-depth, not the primary enforcement path — see `process/general-plans/backlog/access-token-revocation-wiring_NOTE_05-07-26.md` for the full analysis and the follow-up-plan recommendation (out of scope here).
3. **New backend unit test** `backend/__tests__/unit/auth-service.unit.test.js` (jest, mirrors the pattern in `auth-password-reset.unit.test.js`): cover (a) login success path, (b) refresh via cookie, (c) refresh via body fallback (new), (d) logout calls `TokenRevocationService.revoke()` when access token present, (e) logout does not throw when access token absent. Mock `UserRepository`, `RefreshTokenRepository`, `TokenRevocationService`, `JwtService`, `BcryptService` per existing test conventions in the `__tests__/unit/` folder.

### Section B — Frontend store consolidation (D1)

4. **`frontend/src/core/store/features/auth/types.ts`** — extend `AuthState` with `accessToken: string | null` and `refreshToken: string | null`; extend `AuthStore` with `setToken: (accessToken: string, refreshToken: string) => void` and `clearToken: () => void`.
5. **`frontend/src/core/store/features/auth/authStore.ts`**:
   - add `accessToken: null, refreshToken: null` to `initialState`.
   - add `setToken: (accessToken, refreshToken) => { setAccessTokenToLS(accessToken); setRefreshTokenToLS(refreshToken); set({ accessToken, refreshToken }) }` (import `setAccessTokenToLS`/`setRefreshTokenToLS` from `@/core/shared/storage`).
   - add `clearToken: () => set({ accessToken: null, refreshToken: null })`.
   - in `logout()`, also call `clearToken()`-equivalent inline (or just include token fields in the `...initialState` reset — already covered since `initialState` now has the token fields at null).
6. **`frontend/src/core/shared/auth.ts`** — implement for real:
   ```
   getPersistedAuth(): read accessToken/refreshToken via getAccessTokenFromLS()/getRefreshTokenFromLS()
     (from '@/core/shared/storage'), user via getUserFromLS(); return
     { accessToken: accessToken || null, refreshToken: refreshToken || null,
       user: user || null, isAuthenticated: !!(accessToken && user) }.
   isAuthenticated(): return !!getAccessTokenFromLS() && !!getUserFromLS()
   getCurrentUser(): return getUserFromLS()
   ```
   This fixes the "reload always logs out" bug — `authStore.ts` already spreads `...getPersistedAuth()` at store creation. VALIDATE confirmed `getPersistedAuth()` currently returns a hardcoded `{}` stub and all named storage helpers (`getAccessTokenFromLS`, `getRefreshTokenFromLS`, `getUserFromLS`) already exist in `@/core/shared/storage` exactly as named — mechanically feasible as written.
7. **DELETE `frontend/src/core/store/auth.store.ts`** — confirm zero importers first (`grep -rl "core/store/auth.store" frontend/src`). VALIDATE found ONE importer (`frontend/src/pages/candidate/profile.tsx`, itself dead/unrouted) — expect this check to find it and skip deletion; note as a phase-report concern rather than widening scope to touch `profile.tsx`.

### Section C — Field casing fix (D3)

8. **`frontend/src/pages/auth/components/figma-auth-shell.tsx`** line ~204: replace
   `setToken(data.access_token, data.refresh_token)` → `setToken(data.accessToken, data.refreshToken)`.
   (`data` already comes from `res.data ?? res` where the backend returns camelCase — this was the literal breakage.)
9. **`frontend/src/core/services/api/apiClient.ts`** `refreshToken()` (~line 168-193): change
   `response.data?.data?.access_token || response.data?.access_token` → `response.data?.data?.accessToken || response.data?.accessToken`; same for `refresh_token` → `refreshToken`. Update the thrown error message text only if it references the old field name (cosmetic, optional).
10. **`frontend/src/core/services/axios-client.ts`** interceptor (~lines 113-142): change
    `refreshResponse?.data?.access_token || refreshResponse?.access_token` → `...?.data?.accessToken || refreshResponse?.accessToken`; same for refresh_token. Change `useAuthStore.setState({ access_token, isAuthenticated: true })` → `useAuthStore.setState({ accessToken: access_token, isAuthenticated: true })` (keep local const names `access_token`/`next_refresh_token` as-is, just fix the store field key); same fix for `useAuthStore.setState({ refresh_token: next_refresh_token })` → `useAuthStore.setState({ refreshToken: next_refresh_token })`.
11. **DELETE dead duplicate model files** `frontend/src/models/interface/auth.interface.ts` (singular) and `frontend/src/models/auth/interfaces.ts` — confirm zero importers first (`grep -rl "models/interface/auth.interface'" frontend/src` and `grep -rl "models/auth/interfaces" frontend/src`); these hold the snake_case `TokenResponse` shape and are a likely source of future confusion. **VALIDATE finding:** `auth.interface.ts` (singular) is currently imported by `frontend/src/pages/login/Login.tsx` (deleted later in this same pass, Section E step 14) — the check at this step will find that importer and skip deletion; **execute-agent must re-run this exact grep again after Section E step 14 completes and delete `auth.interface.ts` then if it is clear**, so the cleanup isn't left half-done purely due to checklist ordering. `models/auth/interfaces.ts` has zero importers now and can be deleted at this step as originally planned. If any *other* unexpected importer is found for either file, skip deletion and note it in the phase report instead (do not widen scope to fix an unexpected consumer).

### Section D — Backend refresh fallback consumption check (D4 cont.)

12. Confirm `apiClient.ts`/`axios-client.ts` refresh calls (which POST `{ refresh_token }` in the body) now succeed end-to-end against the Section A fix — this is covered by the manual smoke test in Section F, not a separate code change.

### Section E — Role redirect + dead code + misc (D6, D2, D8, D9)

13. **`frontend/src/pages/auth/components/figma-auth-shell.tsx`** lines ~208-211: delete the inline role→route map; import `getDashboardRouteByRole` from `@/core/helpers/auth-route` and replace the 3-branch `if/else if/else navigate(...)` with `navigate(getDashboardRouteByRole(userRole))`. Confirm this intentionally changes the candidate/recruiter landing destinations per the VALIDATE note in Public Contracts above (training_center is unaffected).
14. **DELETE `frontend/src/pages/login/Login.tsx`** — confirm it is not referenced by any router file first (`grep -rl "pages/login/Login" frontend/src`); VALIDATE confirmed zero importers (active auth UI is `figma-auth-shell.tsx` via `pages/auth/login.tsx`). After this deletion, re-run the Section C step 11 zero-importer check for `frontend/src/models/interface/auth.interface.ts` (singular) and delete it if now clear.
15. **DELETE ONLY `frontend/src/pages/auth/register/components/register-form-card.tsx` and `frontend/src/pages/auth/register/components/role-selection-card.tsx`** — confirm zero importers first (`grep -rl "register-form-card\|role-selection-card" frontend/src`); VALIDATE confirmed zero importers for both. **Do NOT delete `frontend/src/pages/auth/register/index.tsx`** — VALIDATE found it is the LIVE component the router lazy-imports for the public `/register` route (`frontend/src/hooks/routes/use-router-element.tsx:15,71`); it is a two-line wrapper around `figma-auth-shell.tsx` and must be kept. (Corrected from the original plan text, which called for deleting the whole directory based on a RESEARCH claim of zero router references that did not hold for `index.tsx`.)
16. **`frontend/src/contexts/SocketContext.tsx`** line ~15: `useAuthStore((state) => state.access_token)` → `useAuthStore((state) => state.accessToken)`. Keep the existing `getAccessTokenFromLS()` fallback logic unchanged if present downstream in the same file.
17. **`frontend/src/pages/communication/chat/SharedChatLayout.tsx`** line ~55: same fix, `state.access_token` → `state.accessToken`.
18. **`frontend/src/hooks/tanstack-query/auth/use-query-auth.ts`** line 32-33 (`useRegisterAuth`'s `mutationFn: (...) => authApi.register(data)`), where `data` is typed from `RegisterSchema` (which has `role`/`full_name` as `.optional()`) but `authApi.register` expects `RegisterRequest` (`role: string; full_name: string`, both required). Fix at the call site — do NOT change `RegisterRequest` (API contract): narrow before calling, e.g.
    ```
    mutationFn: ({ confirmPassword: _confirmPassword, ...data }: z.infer<typeof RegisterSchema>) => {
      if (!data.role || !data.full_name) {
        return Promise.reject(new Error('Role và họ tên là bắt buộc'))
      }
      return authApi.register({ ...data, role: data.role, full_name: data.full_name })
    }
    ```
    (Exact TS-narrowing approach may use a type guard instead of the manual literal above — execute-agent should pick whichever compiles cleanly and keeps the Vietnamese validation-message convention already used in this file.) VALIDATE confirmed this is TS2345 error `use-query-auth.ts(33,24)`, one of the 5 auth-surface baseline errors, and this fix is mechanically exact against the current file content.

### Section F — Verification (all sections)

19. Run `cd frontend && npx tsc -p tsconfig.app.json --noEmit` — confirm the 5 auth-surface errors are gone and total error count ≤ 18. VALIDATE ran this gate against the current baseline and confirmed exactly 23 total errors today, with exactly 5 on the auth surface targeted by this plan (`SocketContext.tsx:15`, `axios-client.ts:133`, `axios-client.ts:138`, `use-query-auth.ts:33`, `SharedChatLayout.tsx:55`) plus 2 more auth-adjacent errors that will disappear on their own once `Login.tsx` and `register-form-card.tsx` are deleted (`Login.tsx:63`, `register-form-card.tsx:28`) — so the real post-fix total should land at 16, comfortably under the ≤18 bar.
20. Run `cd backend && npm test -- auth-service.unit.test.js` (or `npm test` full suite via `jest --runInBand`) — new test green, no regressions in existing `__tests__/unit/*`. VALIDATE confirmed `npm test -- <pattern>` works exactly this way against the existing `auth-password-reset.unit.test.js` (2/2 passing).
21. Manual smoke test (see Verification Evidence) — login as candidate, recruiter, training_center; confirm redirect target per role (against the NEW `getDashboardRouteByRole()` destinations — see Public Contracts note); reload page and confirm still logged in; logout and confirm redirected to public/login and localStorage cleared.

---

## Dependencies

- Section C (casing fix) depends on Section B existing (store must have `accessToken`/`refreshToken` fields before `axios-client.ts`/`figma-auth-shell.tsx` can set them correctly) — but Section B additions are backward-compatible even before Section C lands, so B before C is the safe order, not a hard blocker.
- Section E step 13 (role redirect) has no dependency on A/B/C — can run anytime, but sequenced last here to keep the diff reviewable by concern.
- Section A (backend) is fully independent of B/C/D/E — can run in parallel if desired, but sequential execution is fine given SIMPLE plan.
- Deletions (steps 7, 11, 14, 15) MUST run their `grep -rl` zero-importer check at execute time, not planning time — a new importer could appear between PLAN and EXECUTE. Step 11's re-check for `auth.interface.ts` (singular) MUST run again after step 14 (see Section C/E notes above) — this is a required two-pass check, not optional.

## Risks

| Risk | Mitigation |
|---|---|
| Deleting `auth.store.ts` or dead UI files turns out to have a late-added importer | Step-level zero-importer grep check before each delete; if found, skip deletion, note as concern, do not widen scope to fix the surprise importer |
| Access-token revocation on logout requires reading the JWT off a cookie/header that may not always be present (e.g. token already expired) | Logout stays best-effort per existing code comment — `revoke()` call is conditional on token presence, never blocks the 200 response |
| Body-fallback refresh could be seen as weakening cookie-based CSRF posture | Additive only — cookie path is checked first and unchanged; body fallback only activates when no cookie is present (matches current frontend interceptor behavior which already sends body-based refresh) |
| `RegisterSchema` narrowing at the call site (step 18) might not match whichever TS-narrowing pattern compiles cleanest | Left flexible in the checklist item — execute-agent picks the cleanest compiling approach; test gate (tsc) is the actual bar, not the exact code shape |
| Deleting the whole `pages/auth/register/` directory would have broken the live public `/register` route | VALIDATE caught this before EXECUTE and corrected the checklist (step 15) to per-file granularity — `index.tsx` is explicitly kept |
| New `TokenRevocationService.revoke()` wiring gives false confidence that access-token revocation is enforced end-to-end | VALIDATE traced the live `JwtValidator` guard and confirmed the ref-based refresh-token check already achieves the user-facing goal; recorded as a known-gap + backlog note rather than silently assumed |

---

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| `cd frontend && npx tsc -p tsconfig.app.json --noEmit` — auth-surface errors = 0, total ≤ 18 | Fully-Automated | Goal 6 (typecheck regression bar) |
| `backend/__tests__/unit/auth-service.unit.test.js` — login/refresh(cookie)/refresh(body-fallback)/logout(with+without access token) all green via `npm test` (jest --runInBand) | Fully-Automated | Goal 2 (body refresh works), Goal 3 (logout revokes access token) |
| Manual smoke: login as `candidate` → lands on `ROUTE.DISABILITY.DASHBOARD` (`/dashboard/disability`) per `getDashboardRouteByRole`; reload page → still authenticated (no forced logout) | Agent-Probe (or human manual) | Goal 1 (login persistence), Goal 4 (single redirect source) |
| Manual smoke: login as `recruiter`/`business` → lands on `ROUTE.BUSINESS.DASHBOARD` (`/dashboard/business`) | Agent-Probe (or human manual) | Goal 4 |
| Manual smoke: login as `training_center`/`educator` → lands on `ROUTE.EDUCATOR.PROFILE_UPDATE` (`/educator/profile/update`) | Agent-Probe (or human manual) | Goal 4 |
| Manual smoke: logout from any role → localStorage tokens cleared, redirected away from protected route | Agent-Probe (or human manual) | Goal 1, Goal 3 |
| `grep -rl` zero-importer checks pass for all deletion targets (steps 7, 11 [x2 passes], 14, 15 [per-file]) before deletion | Fully-Automated | Goal 5 (dead code removed safely) |

**Known-gap (recorded per D7, not tested here):** `verify-email` / `resend-verification-email` endpoints remain 404 on the backend — out of scope, backlogged, not part of this plan's PASS criteria.

**Known-gap (recorded per VALIDATE, not tested here):** `TokenRevocationService.isRevoked()` is not wired into the live `JwtValidator` request-auth guard — see `## Known Gaps (Resolved via Backlog)` below.

---

## Acceptance Criteria

- [ ] `npx tsc -p tsconfig.app.json --noEmit` (frontend) shows 0 auth-surface errors and total errors ≤ 18.
- [ ] `backend/__tests__/unit/auth-service.unit.test.js` passes (login, cookie-refresh, body-fallback-refresh, logout-with-revocation, logout-without-token).
- [ ] Login as candidate/recruiter/training_center each redirects to the correct role dashboard via `getDashboardRouteByRole` (single source, inline map removed).
- [ ] Page reload after login keeps the user authenticated (no forced logout).
- [ ] Logout clears localStorage tokens and revokes both refresh token (existing) and access token (new).
- [ ] `frontend/src/core/store/auth.store.ts`, `frontend/src/pages/login/Login.tsx` are deleted (zero-importer confirmed) OR explicitly retained with a documented reason if an importer was found; `frontend/src/pages/auth/register/components/register-form-card.tsx` and `role-selection-card.tsx` are deleted (zero-importer confirmed); `frontend/src/pages/auth/register/index.tsx` is explicitly KEPT (live router dependency).
- [ ] `verify-email`/`resend-verification-email` remain explicitly out of scope (known-gap recorded, not silently dropped).
- [ ] Access-token revocation wiring gap (`TokenRevocationService.isRevoked()` unused by `JwtValidator`) remains explicitly out of scope (known-gap recorded, not silently dropped).

## Phase Completion Rules

This is a SIMPLE, single-phase plan (no phase program). The plan is considered CODE DONE when
Implementation Checklist items 1-18 are applied and `tsc`/`jest` gates in Section F pass. The plan is
considered VERIFIED only after the manual smoke test (item 21) is performed and confirmed by a human
or agent-probe, per the high-risk auth/identity classification requiring manual-first evidence before
closure (`orchestration.md` §High-Risk Execution Handoff). Do not mark this plan archived/complete
until both CODE DONE and VERIFIED are satisfied.

## Known Gaps (Resolved via Backlog)

- verify-email / resend-verification-email backend endpoints: known-gap: documented as NEW PLAN REQUIRED — see `process/general-plans/backlog/ai-module-v2-gemini_NOTE_05-07-26.md`'s sibling scope note in this plan's Non-Goals (D7); no dedicated backlog file was requested for this pre-existing, already-recorded gap.
- Access-token revocation not enforced by `JwtValidator` (only by the pre-existing refresh-token ref-check): known-gap: documented as NEW PLAN REQUIRED — see `backlog/access-token-revocation-wiring_NOTE_05-07-26.md`.

## Test Infra Improvement Notes

(none identified yet)

---

## Resume and Execution Handoff

1. **Selected plan file path:** `process/general-plans/active/auth-completion_05-07-26/auth-completion_PLAN_05-07-26.md`
2. **Last completed phase or step:** VALIDATE complete (V1-V7 run 2026-07-05, Gate: PASS). SPEC/INNOVATE skipped per header.
3. **Validate-contract status:** written — see below.
4. **Supporting context files loaded:** `process/context/all-context.md`, `process/context/tests/all-tests.md`, `process/general-plans/active/auth-completion_05-07-26/auth-completion_AUTOPILOT_GOAL_05-07-26.md`; backend files read: `auth.controller.js`, `auth.service.js`, `token-revocation.service.js`, `access-token-verifier.service.js`, `JwtValidator.js`, `jest.config.js`; frontend files read: `authStore.ts`, `types.ts`, `auth.store.ts` (orphaned), `shared/auth.ts`, `shared/storage.ts`, `figma-auth-shell.tsx`, `apiClient.ts`, `axios-client.ts`, `auth.service.ts`, `auth-route.ts`, `use-auth.ts`, `use-query-auth.ts`, `register.zod.ts`, `models/interface/auth.interfaces.ts`, `use-router-element.tsx`, `pages/candidate/profile.tsx`, `pages/auth/register/index.tsx`, `pages/register/Register.tsx`, `path.ts`.
5. **Next step for a fresh agent:** EXECUTE Section A → B → C → E → F in order (Section D has no independent code change). EXECUTE must re-run the `grep -rl` zero-importer checks live before each deletion, including the required SECOND pass for `models/interface/auth.interface.ts` after Section E step 14.

---

## Validate Contract

Status: PASS
Date: 05-07-26
date: 2026-07-05
generated-by: outer-pvl

Parallel strategy: sequential
Rationale: signal score 3/7 (S2 auth surface, S6 high-risk class, S7 5+ files) = MEDIUM band, but this is a single SIMPLE plan with a small (~13 file), non-phase-program blast radius and no independent parallel workstreams for EXECUTE — sequential is the right fit per the Strategy-by-Fit rules (score selects a *ceiling*, not a mandate; fit still governs). VALIDATE itself was run as a single deep-investigation pass (Simple Mode fan-out equivalent) rather than spawning parallel Layer 1/Layer 2 subagents, because the plan is self-contained and the investigation needed direct file/grep verification more than breadth-parallelism.

Test gates (C3 5-column table):

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| goal-6-typecheck | Frontend auth-surface tsc errors = 0, total ≤ 18 | Fully-Automated | `cd frontend && npx tsc -p tsconfig.app.json --noEmit` | B |
| goal-2-3-backend-unit | Login / refresh(cookie) / refresh(body-fallback) / logout(with+without access token) all pass | Fully-Automated | `cd backend && npm test -- auth-service.unit.test.js` | B |
| goal-5-dead-code-checks | Zero-importer confirmed before each deletion (4 targets, 2-pass for auth.interface.ts) | Fully-Automated | `grep -rl "<target>" frontend/src` per Section B/C/E deletion step | B |
| goal-1-4-login-persist-redirect | Login as candidate/recruiter/training_center lands on correct `getDashboardRouteByRole` destination; reload keeps session | Agent-Probe | Manual smoke test, Section F item 21 (3 roles + reload) | B |
| goal-1-3-logout | Logout clears LS tokens, revokes refresh token (existing) + access token (new); redirected to public/login | Agent-Probe | Manual smoke test, Section F item 21 (logout case) | B |
| known-gap-verify-email | verify-email / resend-verification-email endpoints | N/A (known-gap) | — | D |
| known-gap-token-revocation-wiring | `TokenRevocationService.isRevoked()` wiring into `JwtValidator` | N/A (known-gap) | — | D |

gap-resolution legend:
- A — proven now (gate passes in this cycle)
- B — fixed in this plan (gate added by this plan's checklist)
- C — deferred to a named later phase/plan
- D — backlog test-building stub (named residual; keep-active; continue)

C-4 reconciliation: the `strategy:` column carries ONLY the 3 proving strategies (Fully-Automated / Hybrid / Agent-Probe). Known-Gap is never a `strategy:` value here — the two known-gap rows above carry `N/A (known-gap)` and are named residuals via gap-resolution D, tracked by the backlog notes referenced in `## Known Gaps (Resolved via Backlog)`.

Legacy line form (retained so existing validate-contract consumers still parse):
- Frontend typecheck: Fully-automated: `cd frontend && npx tsc -p tsconfig.app.json --noEmit` (0 auth-surface errors, total ≤ 18)
- Backend auth unit test: Fully-automated: `cd backend && npm test -- auth-service.unit.test.js`
- Dead-code zero-importer checks: Fully-automated: `grep -rl "<target>" frontend/src` before each of the 4 (corrected: 4, per-file) deletion targets
- Login/redirect/reload (3 roles): Agent-probe: manual smoke test per Verification Evidence table
- Logout (revocation + LS clear + redirect): Agent-probe: manual smoke test per Verification Evidence table
- verify-email/resend-verification-email: known-gap: documented, backlogged (D7)
- Access-token revocation not enforced by JwtValidator: known-gap: documented, backlogged (`backlog/access-token-revocation-wiring_NOTE_05-07-26.md`)

Dimension findings:
- Infra fit: PASS — no container/proxy/gateway/runtime surface touched; all edit targets are plain frontend/backend source files; backend test runner (`jest --runInBand` via `npm test`) confirmed working against the existing `__tests__/unit/` pattern.
- Test coverage: PASS — tsc baseline empirically re-run and confirmed (23 total / 5 auth-surface matches the task's stated baseline exactly); backend test command pattern (`npm test -- <file>`) empirically confirmed against `auth-password-reset.unit.test.js` (2/2 passing); manual smoke test required and present per the auth/identity high-risk class (no known-gap used to avoid a hybrid/agent-probe gate on the high-risk surface).
- Breaking changes: PASS (after plan correction) — API response shapes unchanged; `useAuthStore` change is additive; `/auth/refresh` body-fallback is additive. One real regression risk was found and fixed in this VALIDATE pass: the original checklist would have deleted the LIVE `frontend/src/pages/auth/register/index.tsx` (router-imported at the public `/register` route) — corrected to per-file deletion (only the two genuinely dead sub-components). No unresolved breaking-change risk remains.
- Security surface: CONCERN → resolved as known-gap — the plan's D5 access-token-revocation addition is mechanically correct and harmless, but VALIDATE traced the live `JwtValidator` guard and found it does not consult `TokenRevocationService.isRevoked()` at all; the guard's pre-existing ref-based refresh-token-revocation check already achieves the user-facing goal ("access token stops working after logout"), so there is no security regression, but the new code is defense-in-depth rather than the enforcement path. Recorded as a named backlog gap rather than silently assumed to be "the" fix — see `## Known Gaps (Resolved via Backlog)`.
- Section A (backend fixes) feasibility: PASS — `refresh()` cookie/body edit target matches file content verbatim (line 35); `TokenRevocationService.revoke(token, payload)` export confirmed with the exact call shape the plan proposes; `logout()`'s existing DTO is a plain object literal (no Zod), so extending it with `access_token` is a trivial, non-breaking change; highest-risk edit is the revocation wiring, mitigated by the defense-in-depth note added above.
- Section B (store consolidation) feasibility: PASS — `getPersistedAuth()` confirmed as a `{}` stub today (matches the described bug exactly); all named storage helpers exist verbatim in `@/core/shared/storage`; `auth.store.ts` deletion gap found and documented (see Breaking changes / Touchpoints correction) — non-blocking, self-healing via the built-in zero-importer check.
- Section C (field casing) feasibility: PASS — every cited line/expression in `figma-auth-shell.tsx`, `apiClient.ts`, and `axios-client.ts` matches current file content exactly (verified via direct grep, not assumed); model-file deletion sequencing gap found and fixed via the required two-pass check added to steps 11/14.
- Section E (redirect + dead code + misc) feasibility: PASS (after correction) — `use-query-auth.ts` line 32-33 matches the plan's proposed fix exactly and is confirmed as one of the 5 baseline auth-surface tsc errors; role-redirect destination change (D6) confirmed intentional but the actual before/after routes were undocumented in the original plan — added explicitly; register-directory deletion granularity corrected (see Breaking changes above) — this was the highest-risk finding of the whole VALIDATE pass and is now resolved in the checklist text itself, not merely noted.

Open gaps:
- Access-token revocation wiring: known-gap: documented as NEW PLAN REQUIRED — see backlog/access-token-revocation-wiring_NOTE_05-07-26.md
- verify-email/resend-verification-email endpoints: known-gap: documented as NEW PLAN REQUIRED (pre-existing, recorded under D7 in this plan's Non-Goals)

What This Coverage Does NOT Prove:
- `cd frontend && npx tsc -p tsconfig.app.json --noEmit`: proves the 5 named auth-surface call sites type-check and no new type errors are introduced anywhere else in the auth surface; does NOT prove runtime correctness (a value can be well-typed and still wrong), and does NOT prove the 16 non-auth baseline errors were not accidentally worsened by an unrelated import change (mitigated by the total-count ≤18 ceiling, but the ceiling could theoretically hide one auth-surface regression offset by one accidental non-auth-surface fix — low likelihood given the small diff).
- `cd backend && npm test -- auth-service.unit.test.js`: proves the service-layer logic (login/refresh/logout branches) behaves correctly against mocked repositories; does NOT prove the real Postgres-backed `refresh_tokens`/`users` tables behave the same way, and does NOT prove the HTTP layer (controller cookie/header parsing, actual `Set-Cookie` headers) is wired correctly — that gap is covered instead by the manual smoke test.
- Manual smoke test (3 roles + reload + logout): proves the end-to-end browser flow works for the 3 role redirect destinations, session persistence, and logout cleanup, as observed by a human or agent-probe at one point in time; does NOT prove behavior under concurrent tabs, token-expiry-mid-session, or network-failure-during-refresh — those are out of scope for this plan and not claimed as covered.
- Zero-importer grep checks: prove no *static* import references the deleted files at the moment the check runs; do NOT prove there is no dynamic string-based `import()` path construction referencing them (none found in this codebase's patterns during VALIDATE, so treated as low-risk).

Gate: PASS (no FAILs, plan updated — the one FAIL-severity mechanical issue found [live `/register` route deletion] was corrected directly in the checklist text during this VALIDATE pass, and the one open CONCERN [access-token revocation wiring] was resolved into a properly documented, backlogged known-gap rather than left as an unresolved CONCERN)
Accepted by: session (autonomous, /goal execution) — accepted known-gaps: (1) verify-email/resend-verification-email endpoints (pre-existing, D7), (2) access-token revocation not enforced by JwtValidator (new, this VALIDATE pass) — both recorded per the Known-gap exclusion rule and excluded from the CONCERN/FAIL count.

---

## Autonomous Goal Block

```
SESSION GOAL: Complete D-Shiftify login/logout + role-based post-login flows (candidate, recruiter/business, training_center/educator) end-to-end on branch dev-kiet.
Charter + umbrella plan: N/A — single plan (process/general-plans/active/auth-completion_05-07-26/auth-completion_PLAN_05-07-26.md)
Autonomy: standing EXECUTE consent granted (autopilot goal block, auth-completion_AUTOPILOT_GOAL_05-07-26.md). Decision policy: auto-proceed on reversible decisions (type fixes, store shape alignment, redirect logic, logout cleanup). PVL BLOCKED -> backlog+skip. Loops capped at 10 cycles. EXECUTE=opus, others=sonnet. No inline execution.
Hard stop conditions / safety constraints:
- No DB schema/migration changes
- No JWT secret/expiry strategy changes affecting deployed tokens
- No irreversible/outward-facing actions
- No billed live-provider calls
- Cascade BLOCKED (two consecutive phases BLOCKED) — not applicable, single SIMPLE plan
Next phase: EXECUTE: process/general-plans/active/auth-completion_05-07-26/auth-completion_PLAN_05-07-26.md (Section A -> B -> C -> E -> F in order; Section D has no independent code change)
Validate contract: inline in plan (## Validate Contract section above), Gate: PASS
Execute start: fully-auto commands: `cd frontend && npx tsc -p tsconfig.app.json --noEmit` (auth-surface=0, total<=18) and `cd backend && npm test -- auth-service.unit.test.js` | e2e spec: none (no browser E2E harness in this repo) | probe scenario: manual smoke test, 3 roles + reload + logout (Section F item 21) | high-risk pack: yes — auth/identity class; manual-first smoke test required before closure per Phase Completion Rules
```
