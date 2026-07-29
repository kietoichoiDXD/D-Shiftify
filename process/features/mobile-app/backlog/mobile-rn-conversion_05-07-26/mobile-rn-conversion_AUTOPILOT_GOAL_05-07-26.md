# Autopilot Goal Block — mobile-rn-conversion

Emitted: 2026-07-05. Provisional block. V7 will emit (UPDATE) variant.

```
SESSION GOAL: Convert the entire D-Shiftify web frontend (React 19 + Vite) into a React Native CLI (bare) mobile app living in mobile/, reusing the existing Express backend API unchanged.
ENTRY PHASE: RESEARCH
REMAINING PHASES:
[ ] RESEARCH — vc-research-agent (sonnet, sequential): inventory all web routes/pages/services/stores, auth flow, TTS/STT accessibility surfaces, backend API contracts
[ ] SPEC — vc-spec-agent (sonnet): mobile-parity requirements doc + phase-program scoping
[ ] INNOVATE — vc-innovate-agent (sonnet): navigation/state/speech-stack/library choices for bare RN
[ ] PLAN — vc-plan-agent + vc-generate-phase-program (sonnet): umbrella plan + per-phase plans (expected phases: RN scaffold, auth+role flows, candidate/CV builder, recruiter+training center, accessibility TTS/STT, polish/testing)
[ ] VALIDATE — vc-validate-agent (sonnet): PVL per plan until Gate: PASS
[ ] EXECUTE — vc-execute-agent (opus) per phase + EVL confirmation via vc-tester
[ ] UPDATE PROCESS — vc-update-process-agent (sonnet): archive plans, update context
CLARIFICATIONS LOCKED: scope=entire app (all roles: candidate, recruiter, training_center + accessibility TTS/STT); framework=React Native CLI (bare, NOT Expo); location=mobile/ folder in this repo; backend reused as-is (no API/schema changes); lane=full.
EXECUTE CONSENT: standing-granted — the consolidated clarification round constitutes standing ENTER EXECUTE MODE consent for this run.
DECISION POLICY: Auto-proceed on all reversible decisions (library picks, folder structure, navigation patterns, component design). PVL BLOCKED → backlog note + skip phase per orchestration.md. Supplement loops auto-run to 10-cycle cap. Model policy: EXECUTE=opus, all other phases=sonnet. No inline execution — all source edits and gate runs via spawned agents.
HARD STOPS: (1) irreversible/outward-facing actions not in validate-contract (deploys, publishing, data deletion); (2) live-provider billed feasibility probes; (3) cascade BLOCKED (two consecutive phases blocked); (4) any backend schema/auth/API contract change (out of scope — surface to user).
TEST GATES: TBD — populated after VALIDATE
START: RESEARCH — spawn vc-research-agent to inventory frontend/src (routes, pages, services, stores) + backend API surface. Task folder: process/features/mobile-app/active/mobile-rn-conversion_05-07-26/
```
