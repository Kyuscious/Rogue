# Timing System - Hybrid Model (Option 3)

## Overview

The game uses a **Hybrid Timing Model** that balances immediate responsiveness with predictable duration tracking. This document explains how different effects are timed and provides guidelines for implementing new time-based mechanics.

## Core Principles

### 1. Timeline System
- **Timeline bar** progresses continuously based on attack speed and ability haste
- Actions occur at **precise decimal times** (e.g., 1.65, 2.34, 3.00)
- Turn boundaries are at **integer values** (1.00, 2.00, 3.00, etc.)

### 2. Two Timing Categories

#### **Instant Effects** (Immediate Application)
Effects that apply **immediately** at the exact action time:
- ✅ Direct damage
- ✅ Direct healing
- ✅ Stat changes (armor reduction, movement speed changes)
- ✅ Position changes (dashes, knockbacks)

**Example:**
```
Cast healing spell at T1.65
→ Player healed IMMEDIATELY at T1.65
→ No delay, instant gratification
```

#### **Duration Effects** (Integer Turn Snapping)
Effects that tick/reduce at **integer turn boundaries only**:
- 🔄 Buffs (temporary stat increases)
- 🔄 Debuffs (slows, armor reduction over time)
- 🔄 Damage-over-time (DoTs)
- 🔄 Heal-over-time (HoTs)
- 🔄 Spell cooldowns
- 🔄 Stun/CC durations

**Example:**
```
Apply 3-turn buff at T2.34
→ Set duration to 4 (3 intended + 1 for partial turn)
→ Ticks at T3.00 (duration = 3)
→ Ticks at T4.00 (duration = 2)
→ Ticks at T5.00 (duration = 1)
→ Expires before T6.00
→ Exactly 3 full ticks guaranteed
```

## Implementation Guidelines

### Spell Cooldowns

**Rule:** Add +1 to base cooldown to account for partial turn.

```typescript
// ❌ OLD WAY (incorrect)
spellCooldowns[spellId] = spell.cooldown; // Cast at T1.65 with CD=5 → Ready at T6.00 (only 4.35 turns!)

// ✅ NEW WAY (correct)
const adjustedCooldown = spell.cooldown + 1; // Cast at T1.65 with CD=5 → +1 = 6 → Ready at T7.00 (full 5 turns!)
spellCooldowns[spellId] = adjustedCooldown;
```

**Example Timeline:**
```
T1.65: Cast spell with 5-turn cooldown
       → Set cooldown to 6 (5 + 1 for partial turn)
T2.00: Cooldown reduces to 5
T3.00: Cooldown reduces to 4
T4.00: Cooldown reduces to 3
T5.00: Cooldown reduces to 2
T6.00: Cooldown reduces to 1
T7.00: Cooldown reduces to 0 → SPELL READY
```

### Buffs and Debuffs

**Rule:** Add +1 to intended duration to account for partial turn.

```typescript
// ❌ OLD WAY (incorrect)
{
  duration: 3, // Applied at T2.34 → May only tick 2 times!
}

// ✅ NEW WAY (correct)
{
  duration: 4, // 3 intended + 1 for partial turn → Always ticks 3 times
}
```

**Example Timeline:**
```
T2.34: Apply 3-turn attack damage buff (+20 AD)
       → Set duration to 4
       → Buff is ACTIVE immediately (instant effect on stats)
T3.00: Duration reduces to 3 (1st tick - buff still active)
T4.00: Duration reduces to 2 (2nd tick - buff still active)
T5.00: Duration reduces to 1 (3rd tick - buff still active)
T6.00: Duration reduces to 0 → Buff EXPIRES (removed from list)
```

### Heal-over-Time / Damage-over-Time

**Rule:** Add +1 to tick count to account for partial turn.

```typescript
// Health Potion: Heal 50 HP over 5 turns
export function createHealthPotionBuff(): CombatBuff {
  return {
    stat: 'heal_over_time',
    amount: 10, // 50 HP / 5 ticks = 10 HP per tick
    duration: 6, // 5 ticks + 1 for partial turn
    type: 'heal_over_time',
  };
}
```

**Example Timeline:**
```
T1.92: Use health potion (50 HP over 5 turns)
       → Set duration to 6, amount to 10 HP/turn
T2.00: Heal 10 HP (duration = 5)
T3.00: Heal 10 HP (duration = 4)
T4.00: Heal 10 HP (duration = 3)
T5.00: Heal 10 HP (duration = 2)
T6.00: Heal 10 HP (duration = 1)
T7.00: Expires (duration = 0)
→ Total: 50 HP healed over 5 ticks ✓
```

### Stuns and Crowd Control

**Rule:** Stun duration is in full turns from next integer boundary.

```typescript
// 2-turn stun
{
  type: 'stun',
  duration: 3, // 2 intended + 1 for partial turn
}
```

**Example Timeline:**
```
T3.47: Apply 2-turn stun
       → Set duration to 3
       → Entity CANNOT act at T3.47
T4.00: Stunned (duration = 2)
T5.00: Stunned (duration = 1)
T6.00: Stun expires (duration = 0) → Entity can act again
```

## Code Patterns

### When Creating Duration Effects

Always add +1 to the intended duration:

```typescript
// Pattern for buff creation
function createBuff(intendedTurns: number): CombatBuff {
  return {
    duration: intendedTurns + 1, // +1 for partial turn
    // ... other properties
  };
}

// Pattern for cooldown setting
function setCooldown(spellId: string, baseCooldown: number) {
  const adjustedCooldown = baseCooldown + 1; // +1 for partial turn
  spellCooldowns[spellId] = adjustedCooldown;
}
```

### When Reducing Durations

Durations reduce by 1 at each **integer turn boundary**:

```typescript
// In turn-based effects useEffect (triggered when turnCounter is integer)
useEffect(() => {
  const currentTurn = Math.ceil(turnCounter);
  if (turnCounter > 0 && currentTurn > lastLoggedTurn && turnCounter % 1 === 0) {
    // Reduce buff durations
    setPlayerBuffs((prevBuffs) => 
      prevBuffs
        .map(buff => ({ ...buff, duration: buff.duration - 1 }))
        .filter(buff => buff.duration > 0)
    );
    
    // Reduce spell cooldowns
    reduceSpellCooldowns();
  }
}, [turnCounter]);
```

## Why This Model?

### ✅ Advantages

1. **Immediate Feedback**: Damage and healing feel responsive (happen instantly)
2. **Predictable Countdowns**: BuffBar shows clean 5→4→3→2→1 countdown
3. **Fair Duration**: All buffs/cooldowns last their full advertised duration
4. **Easy to Track**: Timeline only shows actions, not effect ticks
5. **Clear UI**: Players understand "5 turn cooldown" means 5 full turns

### ⚠️ What Players See

- **Attack at T1.65** → Enemy takes damage **immediately** at T1.65
- **Cast spell at T2.34 with 5 CD** → Cooldown shows "5 turns" → Ready at T7.00
- **Use potion at T3.89** → Get first heal tick at T4.00
- **Get 3-turn buff at T2.50** → Buff Bar shows "3 turns" → Ticks at T3, T4, T5

## Common Mistakes to Avoid

### ❌ Don't: Use base duration directly
```typescript
duration: 3 // Applied at T2.34 → May only last until T5.00 (2.66 turns!)
```

### ✅ Do: Add +1 for partial turn
```typescript
duration: 4 // Applied at T2.34 → Lasts until T6.00 (3.66 turns = 3 full ticks)
```

### ❌ Don't: Reduce duration on every action
```typescript
// In handleAttack()
reduceSpellCooldowns(); // Cooldowns reduce too fast!
```

### ✅ Do: Reduce duration at integer turns only
```typescript
// In turn-based effects useEffect
if (turnCounter % 1 === 0) {
  reduceSpellCooldowns(); // Only at T1.00, T2.00, T3.00...
}
```

## Examples by Effect Type

| Effect Type | Application Time | Tick Time | Example |
|------------|------------------|-----------|---------|
| Direct Damage | Immediate (T1.65) | N/A | Attack deals 50 damage → Enemy HP reduced at T1.65 |
| Direct Heal | Immediate (T1.65) | N/A | Heal spell → Player HP increased at T1.65 |
| Buff (3 turns) | Immediate stats | T+1, T+2, T+3 | +20 AD buff → Stats boost immediately, countdown at T3,4,5 |
| DoT (3 ticks) | N/A | T+1, T+2, T+3 | Burn 10/turn → Damage at T2, T3, T4 |
| HoT (5 ticks) | N/A | T+1 to T+5 | Heal 10/turn → Healing at T2-T6 |
| Cooldown (5) | Set at T1.65 | T2-T6 | Ready at T7.00 (5 full turns) |
| Stun (2 turns) | Immediate lock | T+1, T+2 | Can't act until T4.00 (2 full turns) |

## Testing Checklist

When implementing new duration effects:

- [ ] Instant effects apply immediately (damage, healing, stat changes)
- [ ] Duration is base value + 1 (to account for partial turn)
- [ ] Effect ticks at integer turn boundaries only
- [ ] BuffBar countdown shows correct number (3 turns = shows 3→2→1)
- [ ] Effect lasts exactly the advertised duration (5 turns = 5 full ticks)
- [ ] Cooldown is ready at expected time (cast at T1.65 + 5 CD = ready at T7.00)

## Future Considerations

### New Effect Types

When adding new time-based mechanics:

1. **Decide category**: Is it instant or duration-based?
2. **Instant effects**: Apply immediately at action time
3. **Duration effects**: 
   - Add +1 to intended duration
   - Tick/reduce at integer turn boundaries only
   - Document in this guide

### Timeline Visualization

Currently, the timeline shows **actions only** (attacks, spells, moves). If effects need to be visualized:
- Consider adding a separate "Active Effects" panel below timeline
- Show buff/debuff icons with countdown timers
- Keep timeline clean and focused on actions

---

**Last Updated:** January 19, 2026  
**Version:** 1.0 - Initial Hybrid Model Documentation
