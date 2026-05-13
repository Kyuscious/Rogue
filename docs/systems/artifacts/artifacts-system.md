# Artifacts System

## Overview

Artifacts are powerful, run-modifying modifiers selectable before a run starts, on the **PreGameSetup** screen. Each artifact can be toggled **on or off** independently. All artifacts are **profile-locked by default** and must be unlocked through in-game achievements.

Unlike starter items, artifacts do not have visible unlock requirements — the player must discover how to unlock them on their own.

---

## Architecture

### Data Layer (`src/game/data/artifacts.ts`)

Each artifact is an `Artifact` object with:
- `id` — unique identifier (snake_case)
- `name` — display name
- `description` — what the artifact does during the run (visible to the player once unlocked)
- `effect` — structured effect definition consumed by game systems

### Store Integration (`src/game/store.ts`)

`activeArtifacts: string[]` is added to run state. It holds the IDs of all artifacts enabled for the current run.

- Populated when the player clicks **Start Run** (via `setActiveArtifacts`)
- Cleared on `resetRun`
- Accessible anywhere via `useGameStore` or `useGameStore.getState()`

### Unlock System (`src/game/screens/MainMenu/Profiles/profileUnlocks.ts`)

Artifacts use a separate `'artifact'` category in `UNLOCKABLES`. Their unlock requirements use the same `isUnlocked(stats)` / `getProgress(stats)` pattern, but:
- The `requirement.description` is always `'???'` — the player cannot see how to unlock them
- No progress bar is shown in any UI — the item is either locked (`🔒`) or usable
- `getArtifactsWithUnlockStatus()` returns only unlocked or visible artifacts for the PreGameSetup UI

### PreGameSetup Integration

A new **Artifacts** section appears below the Starting Item section. Each artifact is a toggle card:
- **Locked** → shown greyed out with 🔒, no tooltip hint about unlock method
- **Unlocked** → can be toggled on (active) or off (inactive)
- Active artifacts show a glowing active state

The selected artifact set is passed into `setActiveArtifacts` in the store just before `onStartRun` is called.

### Battle Integration (`src/game/screens/Battle/Battle.tsx`)

At component level, Battle reads `state.activeArtifacts` and derives a `artifactDamageMultiplier`. This multiplier is applied to **all** `finalDamage` values in:
- Player weapon attacks
- Player spell attacks
- Enemy weapon attacks
- Enemy spell attacks

The multiplier affects both player-dealt and enemy-dealt damage equally (per the "World Rune" theme — all violence is amplified).

---

## Artifact Effect Types

| Type | Description |
|------|-------------|
| `damage_multiplier` | Multiply all final damage values (before HP application) by a scalar |

New types should be added here as artifacts are designed.

---

## Implemented Artifacts

### World Rune of Domination

| Property | Value |
|----------|-------|
| **ID** | `world_rune_of_domination` |
| **Effect** | All damage dealt and received is doubled |
| **Effect Type** | `damage_multiplier` × 2 |
| **Unlock** | ??? |

**Design Notes**: This artifact fundamentally alters risk/reward. Enemy burst threats become lethal. Player glass-cannon builds become god-tier, but one mistake ends the run. Intended for players who want faster, more chaotic runs where every hit matters.

---

## Adding a New Artifact

1. Add a new entry to `ARTIFACT_DATABASE` in `src/game/data/artifacts.ts`
2. Add the corresponding unlock entry (category `'artifact'`) to `UNLOCKABLES` in `profileUnlocks.ts` — set `requirement.description` to `'???'`
3. If the artifact introduces a new **effect type**, add handling in `Battle.tsx` (or the appropriate system)
4. Update this doc with the new artifact's entry

---

## Design Philosophy

- Artifacts should have **run-wide, highly visible consequences** — not subtle stat tweaks
- They should create **new gameplay experiences**, not just make the game easier
- All artifacts are **opt-in** — the player consciously activates chaos
- Unlock methods are **intentionally hidden** — discovery is part of the game loop
