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

## Critical Gotchas
- Timing model is easy to break: duration effects use the documented +1 turn handling and integer-turn boundary reduction rules. Read `docs/TIMING_SYSTEM.md` before changing combat timing/buffs/cooldowns.
- Passive refactor is in progress; hardcoded behavior still exists in battle flow. Check `docs/PASSIVE_SYSTEM_REFACTOR.md` and `docs/PASSIVE_INTEGRATION_GUIDE.md` before editing passives.
- Revisit penalty system is documented but not fully implemented; check TODOs in `src/game/store.ts` and `docs/DIFFICULTY_SCALING.md`.

## Environment
- Frontend expects `VITE_API_URL`.
- Backend expects `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `FRONTEND_URL`.
- CORS issues are usually `FRONTEND_URL` mismatches in backend env config.

## Link-First References
- Setup and API integration: `BACKEND_QUICKSTART.md`, `FRONTEND_INTEGRATION.md`, `BACKEND_ARCHITECTURE.md`.
- Combat and balance: `docs/combat-formulas.md`, `docs/TIMING_SYSTEM.md`, `docs/DIFFICULTY_SCALING.md`.
- Content and systems: `docs/CONTENT_INTEGRATION_GUIDE.md`, `docs/POST_ENCOUNTER_SYSTEM.md`, `docs/EVENT_WEIGHT_SYSTEM.md`, `docs/ASSET_LOADING.md`.
- Full docs map and status: `docs/DOCS_INDEX.md`.
