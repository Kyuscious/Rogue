# Targeting System

**Status:** ✅ Initial foundation implemented  
**Last Updated:** April 19, 2026

---

## Overview

The targeting system decides which unit an action is aimed at once battles contain more than one valid target.

This is designed for future encounters such as:
- multiple enemies on the field
- one boss with summons
- player team setups that include familiars

---

## Current Rules

### Player targeting
- The player can focus a specific enemy target from the enemy team panel.
- A valid target should always exist while at least one enemy is alive.
- Battle start should auto-select the first living enemy.
- If the current target dies, focus should immediately move to the next living enemy from left to right.
- The player must still be able to switch target manually at any time.

### Enemy targeting
- Enemies can now choose between the player and active familiars.
- Defensive familiars are slightly more likely to draw attention than fragile support familiars.

### Familiar targeting
- Active familiars automatically attack or support based on their defined behavior.
- Offensive familiar effects follow the current focused enemy target.

---

## Target Priority Model

Each targetable unit can expose optional targeting metadata:

- `targetPriority` — higher value means the unit is more likely to be focused
- `canBeTargeted` — allows future untargetable or hidden states
- `ownerId` / `isSummon` — supports bosses with summoned allies later on

---

## Immediate UX Requirements

The first summon-heavy encounters exposed several practical UI problems that need a tighter combat presentation layer.

### Enemy team panel limits
- The enemy team battlefield panel should show a maximum of 4 enemy cards at once.
- If more than 4 enemies are alive, the panel should support paging or scrolling so target controls never overflow off-screen.
- Target switching controls must remain clickable even when summons increase the team size.

### Persistent target visibility
- The battlefield should always visually highlight the currently selected enemy.
- The selected target shown in the battlefield, target panel, and action resolution must always stay in sync.
- There should never be a state where the player has no selected target while enemies are alive.

### Timeline visibility
- The timeline should display actions for every enemy currently participating in battle, not just the primary enemy.
- Summons should appear with their own action entries so the player can understand incoming pressure.
- Duplicate enemy types should still be distinguishable through battle instance identifiers or display labels.

## Implementation Order

To keep combat stable, these changes should be done in small passes:

1. **Persistent auto-targeting**
   - Always select the first living enemy on battle start.
   - Auto-advance target selection when the focused enemy dies.

2. **Battlefield focus sync**
   - Make the active battlefield unit always mirror the selected target.
   - Ensure attack, spell, and familiar logic all resolve against the same focused unit.

3. **Enemy overflow handling**
   - Limit visible enemy cards to 4 at a time.
   - Add next and previous navigation or horizontal scrolling for larger summon waves.

4. **Full enemy timeline coverage**
   - Render timeline entries for all enemy participants.
   - Support boss plus summons encounters without hiding actions.

## Future Expansion

Planned next steps for this system:
- taunt / guard mechanics
- front-line vs back-line rules
- true multi-enemy turn order
- summon ownership and despawn behavior
- battlefield-position-aware targeting
