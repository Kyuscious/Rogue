# Project Structure Guide

**STATUS:** ✅ DONE - Architecture guidance for the current refactor  
**LAST UPDATED:** April 19, 2026

## Goal
Adopt a feature-first structure for UI-heavy screens while keeping reusable, framework-agnostic rules in the shared game layer.

## Recommended Ownership

### Battle
Battle is the most system-dense feature and should own the deepest UI folder structure.

- `src/components/screens/Battle/`
  - `visuals/` for battlefield rendering and display-only visuals
  - `selectors/` for weapons, spells, and item selection UI
  - `summary/` for results and reward presentation
  - `timeline/` for action-order UI
  - `shared/` for battle-only presentation helpers
  - `logic/` for small screen helpers extracted from the main container

- `src/game/battle/`
  - framework-agnostic combat logic only
  - AI, timing, targeting, passives, field rules, and flow logic

### Quest Select
Quest browsing is a screen-level concern, so its quest catalog helpers can live with the feature itself.

- `src/components/screens/QuestSelect/`
  - `logic/questDatabase.ts`
  - `logic/questPathSystem.ts`

### Entity
The `entity/` area is a good home for shared presentation that appears across multiple screens.
Future grouping can split it into folders like:
- `status/`
- `equipment/`
- `tooltips/`
- `shared/`

## Rule of Thumb
- If it is **pure UI for one screen**, colocate it in that screen folder.
- If it is **shared UI across many screens**, place it under the shared/entity layer.
- If it is **gameplay logic without React**, keep it in `src/game/`.
- Only Battle should have many nested subfolders by default because it is the main complex gameplay surface.

## Refactor Outcome So Far
- Battle UI is now split into subfolders
- Battle mechanics are grouped in `src/game/battle/`
- Quest data helpers are colocated with Quest Select
- Duplicate compatibility files were removed to reduce confusion
