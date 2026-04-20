# Battle Flee Implementation Guide

## Overview
The battle flee system ends combat immediately when either combatant reaches a battlefield edge.

- Battlefield bounds: `-500` to `+500`
- Total battlefield width: `1000` units
- Result on flee: **no rewards**, no reward selection, encounter is skipped
- Run flow: continues to next encounter (does not end run)
- Summary shown: **Battle Fled**

## Source of Truth
Battlefield constants are centralized in:

- `src/game/battlefield.ts`

Exports:
- `BATTLEFIELD_MIN_X`
- `BATTLEFIELD_MAX_X`
- `BATTLEFIELD_WIDTH`
- `PLAYER_START_POSITION`
- `ENEMY_START_POSITION`
- `isOutsideBattlefield(position)`

## Runtime Flow
Primary flee detection is centralized in:

- `src/components/screens/Battle/Battle.tsx`

A `useEffect` watches `playerPosition` and `enemyPosition`.

When `isOutsideBattlefield(position)` is true for either side:
1. `battleEnded` is set to `true`
2. `battleResult` is set to `'battle_fled'`
3. `fleeOutcome` is set to `'player_fled'` or `'enemy_fled'`
4. Summary rewards are cleared (`setSummaryRewards(null)`)
5. Pending enemy queue is cleared (`setPendingBattleData(null)`)
6. `showSummary` is set to `true`
7. On summary continue, `incrementEncounterCount()` is called
8. Battle starts with `remainingEnemies` (`originalEnemyQueue.slice(1)`) if available

This covers **all movement sources** (manual move, AI move, and movement effects from abilities/weapons), not just one action handler.

## UI/UX Behavior
Battle summary component supports a dedicated result mode:

- `resultType: 'battle_fled'`
- Header: `Battle Fled`
- Message:
  - `The enemy has fled the battle.`
  - or `You have fled the battle.`
- Reward selection is not shown
- Gold/EXP/item rewards are not shown
- Clicking Continue skips to the next encounter

## Why This Fixes Infinite Battles
Before this change, flee checks were hardcoded in a few handlers and used inconsistent bounds (`1500`, `2500`).
Movement updates outside those handlers could miss flee termination, causing endless combat.

Now:
- Bounds are consistent (`-500` / `+500`)
- Detection is centralized and always active
- Battle always terminates with a flee result when a boundary is reached
