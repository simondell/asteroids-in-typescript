# AGENTS.md

Notes for AI agents (and future-me) working on this repo. Keep it minimal —
expand only when a convention has actually proven itself, don't pad it out
in advance.

## What this is
A learning project: functional TS, TDD, and a hand-rolled redux-like store
(`src/libs/store.ts`) driving an Asteroids clone (`src/game.ts`, `src/web.ts`).
Expect rough edges — it was written to explore ideas, not shipped as a product.

## Working conventions
- Install with `npm ci` (lockfile is committed; `node_modules` is not).
- Run `npx jest --ci` before committing changes under `src/`.
- One feature/task per branch; use [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `refactor:`, `chore:`, ...).
- Prefer a GitHub issue for anything bigger than a one-sitting change, so
  intent and design discussion live with the code, not just in chat.
