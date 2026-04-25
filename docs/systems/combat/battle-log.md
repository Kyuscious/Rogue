# Battle Log Guide

This document defines the expected behavior and formatting rules for the battle log system.

Primary files:

- `src/game/screens/Battle/log/BattleLogPanel.tsx` (log UI rendering)
- `src/game/screens/Battle/log/types.ts` (log entry types)
- `src/game/screens/Battle/Flow/TurnManager/` (turn-tick log event production for regen/buffs/familiars)
- `src/game/screens/Battle/Battle.tsx` (high-level battle orchestration and log state wiring)

## Goals

- Every combat action should be represented in the battle log.
- Log order should reflect battle flow clearly.
- Turn-based effects should be visible and easy to parse.

## Required Structure

### 1) Encounter start

At the beginning of each encounter, the **first log line** must be:

`Encounter X against Y started!`

- `X` = current encounter number in the run (`encountersCompleted + 1`)
- `Y` = current enemy (or enemies) display name

This line is reset when a new enemy encounter loads.

### 2) Pre-turn messages (optional)

Any immediate encounter context can appear after line 1 and before turn 1, for example:

- carried-over cooldown status
- immediate setup/status notifications

### 3) Turn headers and grouped turn-only lines

Each integer turn appends a turn marker:

`--- Turn N ---`

Turn-based effects are then appended as **separate turn-only lines** (not merged into the header).

These turn-only lines must:

- use a dedicated turn-system color style in the log
- support multiple lines in the same turn tick
- use compact icon-first shorthand for quick scanning
- expose full sentence text on hover (line tooltip)

Example:

- `--- Turn 3 ---`
- `💧 Nixie ❤️ Player +30 | 🦀 Paddlemar 🛡️ Player +10`
- `🩸 Enemy -45 | 💚 Player +10`

Hovering these lines should reveal full descriptive sentences.

## Action Logging Rules

All actions should append at least one action line:

- Player attack: `Luci attacked with WeaponName for N damage!`
- Player spell: `Luci cast SpellName for N magic damage!`
- Enemy attack/spell equivalents
- Move/Skip/Item usage actions

### Tokenized readability pattern

Action messages should use a token-first structure so players can map log entries to arena cards and battlefield markers quickly.

Recommended format:

1. Actor token
2. Action phrase
3. Target token (when applicable)

Examples:

- `[P1] attacks [E2] with Iron Blade for 24 damage`
- `[E2] casts Burn on [P1]`

Token labels must remain synchronized with battle arena and battlefield labels.

### Fallback rule

If a weapon/spell action resolves without producing a specific effect message, a fallback action entry is required:

- Player attack fallback: `Luci attacked with WeaponName.`
- Player spell fallback: `Luci cast SpellName.`
- Enemy weapon/spell equivalents

This ensures no silent actions.

## Turn-Based Effects

At integer turn ticks, effects like familiar procs, regen, and DoT are evaluated and emitted into turn-only lines under the current turn header.

Current covered examples:

- Player health regeneration
- Player heal-over-time buffs
- Enemy health regeneration
- Enemy Hemorrhage (DoT)
- Familiar turn trigger outcomes (damage/heal/shield)

## Implementation Notes

- UI rendering and row tooltip behavior live in `BattleLogPanel.tsx`.
- Entry typing lives in `types.ts`.
- Turn-tick emission for turn-based effects lives in `Flow/TurnManager/`.
- Non-turn action emission still lives in `Battle.tsx` (attacks, spells, item actions, reward events, victory/defeat events).

## Future Extension Checklist

When adding a new combat effect/action:

1. Add/confirm direct action log output.
2. If it is turn-based, include it in grouped turn-only log lines under the turn header.
3. Ensure no branch can resolve silently.
4. Preserve encounter-start first-line format.
