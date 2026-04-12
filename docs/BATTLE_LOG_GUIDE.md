# Battle Log Guide

This document defines the expected behavior and formatting rules for the battle log in `Battle.tsx`.

## Goals

- Every combat action should be represented in the battle log.
- Log order should reflect battle flow clearly.
- Turn-based effects should be visible and easy to parse.

## Required Structure

### 1) Encounter start

At the beginning of each encounter, the **first log line** must be:

`Encounter X against Y started!`

- `X` = current encounter number in the run (`encountersCompleted + 1`)
- `Y` = current enemy display name

This line is reset when a new enemy encounter loads.

### 2) Pre-turn messages (optional)

Any immediate encounter context can appear after line 1 and before turn 1, for example:

- carried-over cooldown status
- immediate setup/status notifications

### 3) Turn headers

Each integer turn appends a turn marker:

`--- Turn N ---`

If turn-based effects trigger on that turn, they are appended on the **same line**:

`--- Turn N --- Enemy takes 24 damage from Hemorrhage (2 stacks) | Luci regenerated 8 HP`

## Action Logging Rules

All actions should append at least one action line:

- Player attack: `Luci attacked with WeaponName for N damage!`
- Player spell: `Luci cast SpellName for N magic damage!`
- Enemy attack/spell equivalents
- Move/Skip/Item usage actions

### Fallback rule

If a weapon/spell action resolves without producing a specific effect message, a fallback action entry is required:

- Player attack fallback: `Luci attacked with WeaponName.`
- Player spell fallback: `Luci cast SpellName.`
- Enemy weapon/spell equivalents

This ensures no silent actions.

## Turn-Based Effects

At integer turn ticks, effects like regen/DoT are evaluated and summarized in the turn header line.

Current covered examples:

- Player health regeneration
- Player heal-over-time buffs
- Enemy health regeneration
- Enemy Hemorrhage (DoT)

## Implementation Notes

- Helpers in `Battle.tsx`:
  - `appendLog(message, type?)`
  - `appendLogs(messages, type?)`
- Encounter line helper:
  - `getEncounterStartMessage()`

## Future Extension Checklist

When adding a new combat effect/action:

1. Add/confirm direct action log output.
2. If it is turn-based, include summary text in the turn header aggregation.
3. Ensure no branch can resolve silently.
4. Preserve encounter-start first-line format.
