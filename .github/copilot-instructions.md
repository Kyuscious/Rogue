# Project Guidelines

## Stack
- React + TypeScript roguelike (Vite frontend, Express backend, Supabase persistence).
- Browser game with turn-based combat and Riot-universe characters/content.

## Architecture
- UI code lives in `src/components/` and custom hooks in `src/hooks/`.
- Core game logic lives in `src/game/` and should stay framework-agnostic.
- API client layer lives in `src/api/`; backend routes/services live in `backend/src/routes/` and `backend/src/services/`.
- Global game state uses Zustand in `src/game/store.ts`; auth state uses `src/game/authStore.ts`.

## Build And Run
- Frontend dev: `npm run dev` (port 5173).
- Frontend lint: `npm run lint`.
- Full build (frontend + backend): `npm run build`.
- Backend dev: `cd backend && npm run dev` (port 3000).
- Backend build/start: `cd backend && npm run build` then `npm start`.

## Conventions
- Keep strict TypeScript typing; prefer shared domain types from `src/game/types.ts`.
- Do not import React/component code into `src/game/`.
- Keep API and game layers decoupled; pass data through function args instead of coupling store access into API clients.
- Follow existing inventory/item patterns (`{ itemId, quantity }` + `ITEM_DATABASE` lookups).
- UI tutorial convention: every major screen should support a reopenable contextual tutorial explaining that page, and the ❔ help button should live in the top banner/header whenever that screen has one.

## Critical Gotchas
- Timing model is easy to break: duration effects use the documented +1 turn handling and integer-turn boundary reduction rules. Read `docs/systems/combat/timing-system.md` before changing combat timing/buffs/cooldowns.
- Passive refactor is in progress; hardcoded behavior still exists in battle flow. Check `docs/systems/passive/architecture.md` and `docs/systems/passive/integration-guide.md` before editing passives.
- Revisit penalty system is documented but not fully implemented; check TODOs in `src/game/store.ts` and `docs/systems/combat/difficulty-scaling.md`.

## Environment
- Frontend expects `VITE_API_URL`.
- Backend expects `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `FRONTEND_URL`.
- CORS issues are usually `FRONTEND_URL` mismatches in backend env config.

## Link-First References
- Setup and API integration: `BACKEND_QUICKSTART.md`, `FRONTEND_INTEGRATION.md`, `BACKEND_ARCHITECTURE.md`.
- Combat and balance: `docs/systems/combat/formulas.md`, `docs/systems/combat/timing-system.md`, `docs/systems/combat/difficulty-scaling.md`.
- Content and systems: `docs/guides/content-integration.md`, `docs/features/post-encounter.md`, `docs/systems/events/event-weight-system.md`, `docs/features/asset-loading.md`.
- Full docs map and status: `docs/DOCS_INDEX.md`.
