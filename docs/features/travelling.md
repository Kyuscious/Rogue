# Travelling

## Purpose
This document defines the intended region travel flow after a region is cleared, including post-region actions, destination rules, and revisit scaling.

## Post-Clear Flow
1. Player clears the active region quest arc.
2. Region is marked as completed for travel context.
3. Player must pick one travel action:
   - Rest
   - Modify Build (trade/loadout)
   - Explore (event, only when region supports events)
4. Player picks the next destination from valid connected regions only.
5. Selected action resolves, then travel happens.
6. Next region quest selection begins.

## Destination Rules
- Destination options come from REGION_GRAPH adjacency, not from all regions.
- Immediate backtracking is blocked:
  - If path is A -> B, destination list from B excludes A.
- If no valid destination exists, UI shows a safe fallback message (this should be rare and indicates data mismatch).

## Revisit Rules
- Revisit count is per-region within the current run.
- Revisit count is derived from visitedRegionsThisRun occurrences.
- Entering a region again increases revisit count and enemy scaling pressure.

### Revisit Scaling
Status: provisional, subject to balance updates.

- Visit 1: +0 enemy level, +0 encounter item scaling.
- Visit 2: +2 enemy levels, +1 encounter item scaling.
- Visit 3: +4 enemy levels, +2 encounter item scaling.
- Visit 4+: +6 enemy levels, +3 encounter item scaling.

UI warning text for revisits is optional future work and is currently disabled.

## Quest Path Repeat Rules
- Quest paths cannot be selected twice in the same run.
- Completed path IDs use questId:pathId and are filtered out in QuestSelect.

## Data Sources
- Region graph and travel helpers:
  - src/game/screens/PostRegionChoice/regionGraph.ts
- Travel scene UI:
  - src/game/screens/RegionSelection/RegionSelection.tsx
- Revisit scaling application in enemy spawn:
  - src/game/screens/Battle/Field/enemySpawning.ts
- Run state and visit tracking:
  - src/game/store.ts

## Notes
- Keep game-layer travel logic framework-agnostic where possible.
- Avoid duplicating adjacency data in multiple places; REGION_GRAPH is the source of truth.
