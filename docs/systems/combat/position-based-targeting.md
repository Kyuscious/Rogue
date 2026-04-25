# Battlefield-Position Targeting System

Status: WIP
Last updated: April 25, 2026

## Core Principle

**The only authoritative concept for targeting is the numeric battlefield position of each unit on the 1D battlefield axis.**

Formation arena slots are a visual approximation of battlefield proximity for readability only.
They carry zero weight in targeting logic, damage resolution, or range checks.
Never use terms like "front", "back", "Slot 1", "Position 1", or "lineup order" in targeting logic or documentation.

---

## Targeting Language

| Correct | Forbidden |
|---|---|
| "the closest enemy in range" | "the frontline enemy" |
| "the second closest enemy in range" | "Position 2 enemy" |
| "all enemies within 50 units of X" | "enemies in the back row" |
| "the enemy at battlefield position 120" | "Slot 3 enemy" |
| "enemy within the AoE radius" | "enemies at back positions" |

---

## How Targeting Works

### Source of truth

Each unit has a numeric battlefield position (for example player is 50, an enemy may be at -50 or -40).
All range, distance, and AoE checks are computed from these coordinates.

### Single-target actions

Resolve in this order:
1. Build list of alive, targetable enemies.
2. Filter to enemies whose battlefield position is within the action's declared range of the acting unit.
3. Sort by absolute distance from acting unit, ascending.
4. Pick the first entry (closest in range).
5. If the list is empty, the action is out of range; show preview but disable the button.

### Multi-target / AoE actions

1. Define the AoE origin (typically the acting unit's position or a target point).
2. Collect all units whose position falls within the AoE radius.
3. Apply damage or effects to every unit in that set.
4. No slot, row, or formation-order concept is involved.

### Fallback

If an action has no explicit targeting metadata, default to the first valid enemy in range (closest alive enemy within the action's attack range).

---

## Action Targeting Metadata

Each weapon or spell exposes targeting rules. Suggested shape:

```ts
targeting: {
  mode: 'single' | 'multi' | 'aoe';
  range: number;              // maximum distance from acting unit to target
  aoeRadius?: number;         // for aoe mode: radius around origin point
  maxTargets?: number;        // for multi mode: cap on affected targets
  fallback: 'nearest-in-range'; // always resolves to closest alive target in range
}
```

---

## Selection Priority

When multiple enemies satisfy an action:

1. Closest battlefield position to the acting unit.
2. If tied by exact coordinate (should not happen after collision system is active), earlier encounter index wins as a tiebreaker only.
3. Ignore defeated or untargetable units.

---

## Visual Formation And Targeting Independence

- Arena formation slots update to reflect approximate battlefield order, but slot occupancy is never queried during target resolution.
- Moving a unit on the battlefield automatically shifts which enemy appears "nearest" in the visual lane, but this is a consequence of the position change, not a targeting input.
- The battlefield display and the log must agree on who was targeted by referencing the unit's name and token (`[E2] Azir`) — never a slot number.

---

## UX Requirements

- Hover over an actionable input previews the effective range on the battlefield track.
- All enemies whose current battlefield position falls within that range are pulsed.
- If no enemy is in range, overlays remain visible, no pulse, action is disabled.
- Log entries identify targets by name and token label, not by slot or position index.

---

## Implementation Phases

1. Targeting resolver
   - Build resolver that operates on battlefield coordinate distance only.
   - Default fallback: nearest alive enemy in action range.

2. Action metadata migration
   - Add `targeting` block to weapons and spells incrementally.
   - Validate old content through nearest-in-range fallback.

3. UI sync
   - Replace any remaining slot-based or formation-order-based target hints with coordinate-derived hover preview.
   - Familiars and summons use the same resolver.

---

## Compatibility Notes

- Existing selection code can remain temporarily during migration.
- Final behavior: all targeting is metadata-driven, distance-computed, with hover preview feedback.
- The collision system (`COLLISION_DISTANCE = 9`, `POSITION_STEP = 10`) guarantees no two units share an identical coordinate, so "nearest" is always unambiguous.
