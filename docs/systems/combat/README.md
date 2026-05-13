# Combat Systems

This folder contains the core combat rules and battle-flow documentation for the project.

## Included Docs
- `formulas.md` - damage, crit, mitigation, and related combat formulas
- `timing-system.md` - turn timing, duration handling, and effect boundaries
- `difficulty-scaling.md` - encounter scaling and progression tuning
- `stun-mechanics.md` - stun behavior and planned/implemented interactions
- `TARGETING_SYSTEM.md` - targeting rules for multi-enemy encounters
- `position-based-targeting.md` - frontline/backline lineup and auto-targeting criteria
- `enemy-ai-system.md` - enemy decision logic and behavior notes

## Notes
Read the timing doc before changing buffs, debuffs, cooldowns, or turn-order logic.

## Enemy Intel Visibility Contract
Apply this rule consistently for enemy presentation in battle cards, inspect panels, and any future combat UI:

- Always visible: enemy name, current/max HP, faction/origin labels, active buffs, and active debuffs.
- Hidden until reveal/intel: enemy class details, numeric stat breakdowns, item details, and loadout details (weapons/spells/consumables/passives).

This is a global UX rule and should not be overridden per-fight.
