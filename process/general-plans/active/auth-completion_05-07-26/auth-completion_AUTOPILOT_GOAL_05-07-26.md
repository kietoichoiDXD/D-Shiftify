# Autopilot Goal Block — auth-completion

Emitted: 2026-07-05. Provisional block. V7 will emit (UPDATE) variant.

```
SESSION GOAL: Check and complete D-Shiftify login/logout and role-based post-login flows (candidate, recruiter/business, training_center/educator) end-to-end on branch dev-kiet: backend auth API + JWT/refresh, frontend login/logout UX, AuthStore, ProtectedRoute, role-based routing after login. Auth is the explicit user-requested scope for this run.
ENTRY PHASE: RESEARCH
REMAINING PHASES:
[x] RESEARCH — research role (sonnet): audit auth end-to-end incl. the known auth-surface TS baseline errors (AuthStore shape, Login.tsx:63, use-query-auth.ts role, register-form-card.tsx, axios-client interceptors, SocketContext access_token)
[x] PLAN — plan role (sonnet): plan with touchpoints/blast radius/test gates (SPEC/INNOVATE skipped if scope is completion/fix of existing designed flows; record reason)
[x] VALIDATE — validate role (sonnet): PVL until PASS or resolved-CONDITIONAL
[x] EXECUTE — execute role (opus) + EVL via tester role (sonnet) — EVL green 05-07-26; manual smoke PENDING-USER
[ ] UPDATE PROCESS — closeout, archive, context update
CLARIFICATIONS LOCKED: scope=login + logout + role-based login flows for all 3 roles; user instruction "check và hoàn thành ... cho tôi" = full autonomy; auth surface changes ARE in scope this run (explicitly requested) but DB schema changes and token-strategy rewrites require a hard-stop check; existing API contract preserved where already consumed; risk class=auth/identity → manual-first smoke test required before final closure.
EXECUTE CONSENT: standing-granted — user's imperative "hoàn thành ... cho tôi" constitutes standing ENTER EXECUTE MODE consent for this run.
DECISION POLICY: Auto-proceed on reversible decisions (type fixes, store shape alignment, redirect logic, logout cleanup). PVL BLOCKED → backlog+skip. Loops capped at 10 cycles. EXECUTE=opus, others=sonnet. No inline execution.
HARD STOPS: (1) DB schema/migration changes; (2) JWT secret/expiry strategy changes affecting deployed tokens; (3) irreversible/outward-facing actions; (4) billed live-provider calls; (5) cascade BLOCKED.
TEST GATES: TBD — populated after VALIDATE
START: RESEARCH — spawn research agent to audit auth end-to-end. Task folder: process/general-plans/active/auth-completion_05-07-26/
```
