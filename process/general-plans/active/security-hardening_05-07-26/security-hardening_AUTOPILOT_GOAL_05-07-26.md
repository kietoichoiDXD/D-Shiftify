# Autopilot Goal Block — security-hardening

Emitted: 2026-07-05. Provisional block. V7 will emit (UPDATE) variant.

```
SESSION GOAL: Security-harden the D-Shiftify project (backend Express API, frontend React, Supabase Postgres, Socket.io) based on a STRIDE/OWASP codebase audit plus external best-practice research. User request: "dùng các skill để nâng cấp về mặt security ... researcher nhiều về kinh nghiệm".
ENTRY PHASE: RESEARCH
REMAINING PHASES:
[ ] RESEARCH — 2 parallel research agents (sonnet): (A) codebase security audit per vc-security STRIDE+OWASP incl. JWT default-secret fallback, RLS disabled on all Supabase tables, rate limiting, CORS, headers, input validation, SQLi via knex.raw, socket auth, secrets scanning, npm audit; (B) external best-practices research for Express 4 + JWT/refresh + Socket.io 4 + Supabase + Vite/React stack
[ ] PLAN — plan role (sonnet): prioritized hardening plan (SPEC/INNOVATE skipped: hardening of existing surfaces, no new product design; INNOVATE folded into research B recommendations)
[ ] VALIDATE — validate role (sonnet): PVL until PASS or resolved-CONDITIONAL
[ ] EXECUTE — execute role (opus) + EVL via tester role (sonnet)
[ ] UPDATE PROCESS — closeout, archive, context update
CLARIFICATIONS LOCKED: scope=code/config-level security hardening of existing surfaces; full autonomy granted by user imperative "cho tôi"; fixes must not break API contracts consumed by the frontend; secret VALUES are never rotated/printed by agents (flagging weak secrets is in scope, rotating them is user's manual action); Supabase-side settings (RLS enablement on live DB) are RECOMMENDED + scripted but NOT auto-applied (DB change = hard stop).
EXECUTE CONSENT: standing-granted — user's imperative "nâng cấp ... cho tôi" constitutes standing ENTER EXECUTE MODE consent for this run.
DECISION POLICY: Auto-proceed on reversible code/config hardening (middleware, headers, validation, cookie flags, removing insecure defaults). PVL BLOCKED → backlog+skip. Loops capped at 10 cycles. EXECUTE=opus, others=sonnet. No inline execution.
HARD STOPS: (1) DB schema/migration/RLS changes on live Supabase; (2) rotating or changing deployed secret VALUES; (3) irreversible/outward-facing actions; (4) billed live-provider calls; (5) cascade BLOCKED; (6) breaking changes to API contracts consumed by the frontend.
TEST GATES: TBD — populated after VALIDATE
START: RESEARCH — spawn 2 parallel research agents. Task folder: process/general-plans/active/security-hardening_05-07-26/
```
