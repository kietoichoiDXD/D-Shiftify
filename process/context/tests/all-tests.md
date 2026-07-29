# D-Shiftify - All Tests

Last updated: 2026-06-20

Attach this file first when the task involves testing, verification, or test debugging.

This is the fast operator guide for the testing surface:

- which runner to use
- what command to start with
- how to quickly debug common failures
- which deeper file to read next

Do not load the whole `process/context/tests/` folder by default. Start here, then drill down.

---

## How This File Works

This is the `all-tests.md` entrypoint for the `tests/` context group. It follows the `all-*.md` routing convention:

1. Agents read `all-context.md` first and get routed here for testing tasks
2. This file gives quick decision rules and commands
3. For deeper details, agents follow the routing table below to specific docs

---

## What This Covers

- test runner selection
- quick commands by package
- fast debugging procedures
- current testing gaps worth remembering

## Read This When

Use this file when you need to:

- run tests after implementation
- decide between test runners
- debug failing tests

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

## Quick Decision Guide

### Use Jest (Frontend) when

- the change is in React components, hooks, stores, or UI logic.
- unit tests are located in `frontend/src/__tests__/` or `frontend/` folder.

### Use custom node runner (Backend) when

- verifying AI speech production APIs.
- testing Google Cloud TTS/STT or Gemini integration.

---

## Default Verification Order

Unless the task clearly needs a different path:

1. run the narrowest existing automated test
2. use unit/integration tests before full-stack browser tests
3. use manual verification only when the real UI/accessible voice feedback is the thing being verified

## Commands

| Package | Runner | Command | Notes |
|---|---|---|---|
| `frontend` | Jest | `npm test` | Runs frontend unit and integration tests |
| `backend` | Babel Node | `npm run test:ai` | Runs AI integration tests (`test/ai-production.test.js`) |

**Lint & Format:**
- Frontend: `npm run lint` or `npm run check:all`
- Backend: `npm run lint`

---

## Debugging Quick Reference

- **jsdom environment**: `frontend` uses `jest-environment-jsdom`. Browser globals are mocked in `jest.setup.cjs`.
- **Google Cloud Speech API**: Requires google cloud credentials configurations for backend test `test:ai` to pass. Make sure `.env` variables `GOOGLE_CLOUD_PROJECT` are set.
