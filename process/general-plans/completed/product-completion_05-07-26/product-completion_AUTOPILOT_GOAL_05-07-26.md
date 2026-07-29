# Autopilot Goal Block — product-completion

Emitted: 2026-07-05. Provisional block. V7 will emit (UPDATE) variant.

```
SESSION GOAL: Complete and professionalize the D-Shiftify product on branch dev-kiet: error-free professional backend (Express 4 + Knex/Postgres), smooth polished frontend UX (React 19 + Vite + Tailwind), and a fully working AI module (Gemini LLM, TTS/STT speech accessibility). Mobile conversion is CANCELLED (backlogged).
ENTRY PHASE: RESEARCH
REMAINING PHASES:
[ ] RESEARCH — vc-research-agent (sonnet): audit current state incl. uncommitted dev-kiet changes — backend modules, deleted chat module remnants, AI/speech/Gemini wiring, frontend pages/flows, error-handling gaps, broken imports
[ ] SPEC — vc-spec-agent (sonnet): requirements doc — definition of "complete + professional" per surface (backend, frontend, AI)
[ ] INNOVATE — vc-innovate-agent (sonnet): approach choices for hardening (error handling, validation, UX polish patterns)
[ ] PLAN — vc-plan-agent (sonnet): plan (or phase program if 3+ dependent phases) with touchpoints + blast radius
[ ] VALIDATE — vc-validate-agent (sonnet): PVL until Gate: PASS
[ ] EXECUTE — vc-execute-agent (opus) + EVL confirmation via vc-tester
[ ] UPDATE PROCESS — vc-update-process-agent (sonnet): archive, context update
CLARIFICATIONS LOCKED: scope=whole product (backend + frontend + AI module); quality bar=professional, no runtime errors, smooth user experience; existing API behavior preserved (refactor allowed, contract changes are a hard stop); mobile/React Native work cancelled and backlogged; lane=full; user instruction: "call skills, do it and finish" = full autonomy.
EXECUTE CONSENT: standing-granted — user's "hãy làm và hoàn thành" instruction constitutes standing ENTER EXECUTE MODE consent for this run.
DECISION POLICY: Auto-proceed on all reversible decisions (refactors, error-handling patterns, UI polish, lib picks). PVL BLOCKED → backlog note + skip. Supplement loops auto-run to 10-cycle cap. Model policy: EXECUTE=opus, all other phases=sonnet. No inline execution — all source edits and gate runs via spawned agents.
HARD STOPS: (1) irreversible/outward-facing actions not in validate-contract (deploys, publishing, data deletion, force-push); (2) live-provider billed feasibility probes (Google Cloud/Gemini/Groq billed calls); (3) cascade BLOCKED (two consecutive phases blocked); (4) backend schema/auth/public API contract changes beyond already-staged migrations.
TEST GATES: TBD — populated after VALIDATE
START: RESEARCH — spawn vc-research-agent to audit backend/, frontend/, AI module state + uncommitted git changes. Task folder: process/general-plans/active/product-completion_05-07-26/
```

## (UPDATE) 2026-07-05

Post-VALIDATE V7 update. RESEARCH/PLAN/VALIDATE complete. PVL: Gate: CONDITIONAL with both concerns resolved in-pass (results.tsv HALTED_SUCCESS, 0 open gaps) — accepted per decision policy.

```
SESSION GOAL: (UPDATE) Complete and professionalize the D-Shiftify product on branch dev-kiet: error-free professional backend, smooth frontend UX, working AI module. Mobile conversion CANCELLED (backlogged).
ENTRY PHASE: EXECUTE
REMAINING PHASES:
[x] RESEARCH — done (audit report in chat; 3 severity-A bugs found)
[x] SPEC — skipped: defect-hardening batch, research findings are the requirements
[x] INNOVATE — skipped: mechanical; locked decisions: defer AI Module V2, keep TTS fallback chain de-hardcoded
[x] PLAN — product-completion_PLAN_05-07-26.md (strict-pass, 10 RFCs)
[x] VALIDATE — Gate: CONDITIONAL, 2 concerns fixed in-plan, accepted (results.tsv HALTED_SUCCESS)
[ ] EXECUTE — vc-execute-agent role (opus), per validate-contract instructions
[ ] EVL — vc-tester role re-runs gates independently
[ ] UPDATE PROCESS — archive plan, update context
CLARIFICATIONS LOCKED: scope=whole product (backend+frontend+AI); quality bar=professional, no runtime errors, smooth UX; API behavior preserved; AI Module V2 deferred; lane=full.
EXECUTE CONSENT: standing-granted
DECISION POLICY: Auto-proceed on reversible decisions; EVL fix loops to 10-cycle cap; EXECUTE=opus, others=sonnet; no inline execution.
HARD STOPS: (1) irreversible/outward-facing actions; (2) billed live-provider probes; (3) cascade BLOCKED; (4) schema/auth/public API contract changes.
TEST GATES: backend: (cd backend) npm run lint:check → 0 errors; npm run build. frontend: (cd frontend) npm run lint → 0 errors; npm run check:type; npm run build → no NEW TS errors vs recorded baseline (~20 pre-existing unrelated errors: firebase pkg, AuthStore, useWebRTCCall). Live-DB jest suites = manual only, NOT gates.
START: EXECUTE — spawn execute agent (opus) with plan path process/general-plans/active/product-completion_05-07-26/product-completion_PLAN_05-07-26.md, follow validate-contract execute-agent instructions exactly.
```

