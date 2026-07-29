---
name: plan:access-token-revocation-wiring-note
description: "TokenRevocationService/AccessTokenVerifierService are dead code, never consulted by the live JwtValidator auth guard — access-token revocation on logout is currently enforced only indirectly via the refresh-token ref-check"
date: 05-07-26
feature: general
---

## Access-Token Revocation Wiring — NEW PLAN REQUIRED

Date: 2026-07-05
Source: VALIDATE pass (PVL) on `auth-completion_PLAN_05-07-26.md`, Section A step 2 (D5 — logout access-token revocation)

### Gap

`backend/src/core/modules/auth/service/token-revocation.service.js` (`TokenRevocationService`) and
`backend/src/core/modules/auth/service/access-token-verifier.service.js` (`AccessTokenVerifierService`,
which calls `TokenRevocationService.isRevoked()`) exist but have **zero callers** in the live request
path. The actual JWT auth guard used by protected routes is
`backend/src/packages/authModel/module/authentication/JwtValidator.js`, which verifies the JWT
signature and then checks the `refresh_tokens` DB table (`WHERE id = payload.ref AND revoked = false`)
— it never calls `TokenRevocationService.isRevoked()`.

Because every access token embeds `ref` (the refresh token's DB row id) and `logout()` already revokes
that refresh-token row, access tokens are *already* effectively invalidated on the very next protected
request after logout — via the ref-check, not via `TokenRevocationService`. The `auth-completion` plan's
D5 change (wiring `TokenRevocationService.revoke(accessToken)` into `logout()`) is additive,
harmless, and unit-testable, but it does not change what the live auth guard actually enforces —
`isRevoked()` remains unconsulted dead code after that plan lands.

### Files outside blast radius

- `backend/src/packages/authModel/module/authentication/JwtValidator.js` (shared guard used by all
  protected routes — touching it is a bigger, riskier change than a single auth-flow completion pass)

### New API surface

N/A — no new public API; this would be an internal wiring change inside the existing auth-guard
module only.

### Recommendation

If independent, immediate access-token blacklisting (not derived from refresh-token revocation) is an
actual product requirement, a follow-up plan should:
1. Call `AccessTokenVerifierService.verify()` (or at minimum `TokenRevocationService.isRevoked()`)
   from `JwtValidator.validate()`.
2. Add a regression test proving a revoked access token is rejected by `JwtValidator` even when its
   embedded `ref` row has not been revoked.
3. Confirm no double-DB-hit performance regression on every authenticated request (the `ref` check
   already does one DB round trip per request; adding `isRevoked()` may add a second one, or move to a
   single fast-path Redis check when `REDIS_URL` is set).

Until that follow-up plan lands, the `auth-completion` plan's D5 change is accepted as
defense-in-depth (harmless, additive) — the user-facing goal ("logout revokes access token") is
already satisfied today by the pre-existing ref-check mechanism.
