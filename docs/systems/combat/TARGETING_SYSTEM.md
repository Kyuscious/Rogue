# Targeting System

**Status:** In Progress (Targeting Modes + Resolver Foundation Implemented)
**Last Updated:** May 1, 2026

---

## Purpose

Targeting now uses an explicit per-action contract so every combat action is always in one of these states:

- `single`
- `multiple`
- `aoe`
- `self`
- `none`

This removes ambiguous behavior and ensures action resolution, UI preview, and click validation are consistent.

---

## Action Targeting Contract

Each action (weapon/spell, and eventually item actives) resolves from a `targeting` profile.

Core fields:

- `mode`: `none | self | single | multiple | aoe`
- `selectionRule`: `selected | first-in-range | last-in-range | all-in-range | auto-priority`
- `range`: effective cast/attack range
- `maxTargets`: cap for multi-target actions
- `requiresTargetInRange`: blocks execution when no target is in range
- `targetSide`: `player` or `enemy`
- `aoe`: shape + size (`circle` or `rectangle`)

If content has no explicit `targeting` field, defaults are inferred from effects:

- offensive weapon/spell -> `single` target, range-gated
- self heal/buff spell -> `self`
- spell with AoE metadata + offensive effect -> `aoe`
- non-targeted utility/special effects -> `none`

---

## Resolver Modules

Targeting logic is split into focused modules under [src/game/screens/Battle/logic/targetingSystem/index.ts](src/game/screens/Battle/logic/targetingSystem/index.ts):

- [src/game/screens/Battle/logic/targetingSystem/singleTarget.ts](src/game/screens/Battle/logic/targetingSystem/singleTarget.ts): single target resolution
- [src/game/screens/Battle/logic/targetingSystem/multipleTarget.ts](src/game/screens/Battle/logic/targetingSystem/multipleTarget.ts): multi-target resolution and ordering
- [src/game/screens/Battle/logic/targetingSystem/areaTarget.ts](src/game/screens/Battle/logic/targetingSystem/areaTarget.ts): anchor + area inclusion
- [src/game/screens/Battle/logic/targetingSystem/actionTargeting.ts](src/game/screens/Battle/logic/targetingSystem/actionTargeting.ts): unified action-level resolution
- [src/game/screens/Battle/logic/targetingSystem/types.ts](src/game/screens/Battle/logic/targetingSystem/types.ts): shared profile/result typing and profile defaults

The base target model in [src/game/screens/Battle/logic/targetingSystem.ts](src/game/screens/Battle/logic/targetingSystem.ts) now includes battlefield position metadata so range checks can be deterministic.

---

## UI Behavior

### Hover Preview

When hovering a weapon/spell slot:

- target candidates are resolved using the same targeting profile used for execution
- targeted units are highlighted in lane cards and battlefield markers
- effective range is shown as a battlefield range band
- for self-target actions, the player is highlighted

### AoE Preview

For AoE actions:

- area shape/size comes from action metadata
- preview highlights all currently affected units based on anchor + area size
- battlefield AoE indicator rendering uses the same shape conventions (`circle` / `rectangle`)

---

## Click Validation

Before an action executes:

- targets are resolved from the targeting profile and current battlefield positions
- if `requiresTargetInRange` is true and no valid target exists, action execution is blocked
- battle log shows the prompt: `No valid targets in range.` (or action-specific equivalent)

This prevents invalid casts/attacks and avoids consuming turns on impossible actions.

---

## Player Targeting Rules

Current player-facing behavior:

- primary offensive actions resolve against selected target intent
- target validity is still range-gated by the resolver
- self-target actions (heal/buff) resolve to player self

Planned extension:

- expose action-level selection rules in content (`first-in-range`, `last-in-range`, `all-in-range`) for player actions where manual selection is not required

---

## Enemy Targeting Rules

Enemy actions now use the same resolver pipeline:

- weapon/spell action type determines targeting profile
- enemy resolves valid targets from player side (player + familiars)
- `auto-priority` can be used for AI target choice while still obeying range and mode
- if no valid target exists in range, the action is blocked and logged

This aligns player and enemy targeting semantics.

---

## Data Integration

- Spells support explicit targeting metadata in [src/game/data/spells.ts](src/game/data/spells.ts).
- Weapons support targeting metadata in [src/game/data/weapons.ts](src/game/data/weapons.ts).
- Existing content continues to work via inferred defaults when metadata is omitted.

Recommended content authoring rule:

- every damage-dealing action should define `mode` and `range` explicitly
- AoE actions should define shape + size explicitly

---

## Known Follow-Ups

1. Apply explicit `targeting` metadata to all existing weapons and spells (not just defaults).
2. Extend the same model to item actives that can target enemies/allies.
3. Add UI text chips on action buttons/tooltips showing targeting mode and selection rule.
4. Add tests for resolver edge cases (no targets, range boundary, tie ordering, AoE anchor loss).

---

## Summary

Targeting is now defined per action mode and resolved through modular resolvers. Hover previews, range checks, and action execution all use the same profile-driven logic, and invalid in-range targeting is blocked with clear log feedback.
