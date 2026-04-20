# Delverhold Greateaxe - Implementation Example

**STATUS:** ✅ DONE - Example documentation for Hemorrhage DoT mechanic  
**LAST UPDATED:** February 10, 2026

## Weapon Overview

**Delverhold Greateaxe** - A legendary weapon that demonstrates the Hybrid Timing Model with stacking damage-over-time mechanics.

### Stats
- **Rarity:** Legendary
- **Base Damage:** 100% AD (instant)
- **Debuff:** Hemorrhage (DoT)

### Hemorrhage Mechanic

**Effect:** Applies a bleeding debuff to enemies that stacks up to 5 times.

- **Damage per Stack:** 30% AD per turn
- **Max Stacks:** 5 (150% AD total per turn)
- **Duration:** 5 turns per stack
- **Refresh:** Attacking refreshes all stack durations to 5 turns (if at least 1 turn remaining)

## Timing System Application

### Attack Timeline Example

```
Player has 100 AD

T1.65: Attack with Delverhold Greateaxe
       → Deal 100 damage instantly (100% AD)
       → Apply Hemorrhage Stack 1 (30 damage/turn, duration=6)
       
T2.00: Hemorrhage ticks
       → Enemy takes 30 damage (1 stack)
       → Duration reduces to 5
       
T2.80: Attack with Delverhold Greateaxe again
       → Deal 100 damage instantly
       → Apply Hemorrhage Stack 2 (30 damage/turn, duration=6)
       → Stack 1 duration remains at 5
       
T3.00: Hemorrhage ticks
       → Enemy takes 60 damage (2 stacks × 30)
       → Stack 1 duration: 4
       → Stack 2 duration: 5
       
T3.40: Attack #3
       → Deal 100 damage instantly
       → Apply Stack 3 (duration=6)
       
T4.00: Hemorrhage ticks
       → Enemy takes 90 damage (3 stacks × 30)
       → Durations: 3, 4, 5
       
T5.00: Attack #4
       → Deal 100 damage instantly
       → Apply Stack 4 (duration=6)
       → Hemorrhage ticks: 120 damage (4 stacks)
       → Durations: 2, 3, 4, 6
       
T5.55: Attack #5
       → Deal 100 damage instantly
       → Apply Stack 5 (duration=6)
       → Now at MAX STACKS (5/5)
       
T6.00: Hemorrhage ticks
       → Enemy takes 150 damage (5 stacks × 30) 🔥
       → Durations: 1, 2, 3, 5, 6
       
T6.20: Attack #6 (at max stacks)
       → Deal 100 damage instantly
       → ALL stacks refresh to duration=6 ⚡
       
T7.00: Hemorrhage ticks
       → Enemy takes 150 damage (5 stacks maintained)
       → All durations: 5
```

## Code Implementation

### 1. Weapon Definition (weapons.ts)

```typescript
delverhold_greateaxe: {
  id: 'delverhold_greateaxe',
  name: 'Delverhold Greateaxe',
  description: 'A massive axe that causes devastating bleeding wounds...',
  rarity: 'legendary',
  effects: [
    {
      type: 'damage',
      damageScaling: { attackDamage: 100 },
      description: 'Deals 100% of your Attack Damage as physical damage.',
    },
    {
      type: 'debuff',
      description: 'Applies Hemorrhage: 30% AD damage per turn for 5 turns. Stacks up to 5 times.',
    },
  ],
}
```

### 2. Debuff Application (Battle.tsx - handleAttack)

```typescript
// Check for Hemorrhage debuff (Delverhold Greateaxe)
if (equippedWeaponId === 'delverhold_greateaxe' && newEnemyHp > 0) {
  setEnemyDebuffs((prevDebuffs) => {
    const hemorrhageDebuffs = prevDebuffs.filter(d => d.id.startsWith('hemorrhage'));
    const stackCount = hemorrhageDebuffs.length;
    
    if (stackCount < 5) {
      // Add new stack
      const damagePerTurn = playerScaledStats.attackDamage * 0.30;
      return [
        ...prevDebuffs,
        {
          id: `hemorrhage_${Date.now()}`,
          name: 'Hemorrhage',
          stat: 'attackDamage',
          amount: damagePerTurn,
          duration: 6, // 5 turns + 1 for partial turn (Hybrid Timing Model)
          type: 'instant',
        },
      ];
    } else {
      // At max stacks (5), refresh duration of all stacks
      return prevDebuffs.map(d => 
        d.id.startsWith('hemorrhage') 
          ? { ...d, duration: 6 } // Refresh to 5 turns + 1
          : d
      );
    }
  });
}
```

### 3. Debuff Ticking (Battle.tsx - turn-based effects useEffect)

```typescript
// Apply damage-over-time debuffs to enemy (e.g., Hemorrhage)
if (enemyDebuffs.length > 0 && enemyChar && enemyChar.hp > 0) {
  const hemorrhageDebuffs = enemyDebuffs.filter(d => d.id.startsWith('hemorrhage'));
  if (hemorrhageDebuffs.length > 0) {
    const totalDamage = hemorrhageDebuffs.reduce((sum, debuff) => sum + debuff.amount, 0);
    const damageAmount = Math.max(1, Math.floor(totalDamage));
    const newEnemyHp = Math.max(0, enemyChar.hp - damageAmount);
    updateEnemyHp(0, newEnemyHp);
    
    // Log damage
    newLogMessages.push({ 
      message: `🩸 ${enemyChar.name} takes ${damageAmount} damage from Hemorrhage (${hemorrhageDebuffs.length} stacks)` 
    });
  }

  // Decay debuff durations
  setEnemyDebuffs((prevDebuffs) => 
    prevDebuffs
      .map(debuff => ({ ...debuff, duration: debuff.duration - 1 }))
      .filter(debuff => debuff.duration > 0)
  );
}
```

## Key Timing Features

### ✅ Instant Effects
- **Direct damage:** 100% AD applied immediately at attack time (T1.65, T2.80, etc.)
- **Debuff application:** Stack added instantly to enemyDebuffs array

### 🔄 Duration Effects
- **DoT damage:** Ticks only at integer turn boundaries (T2.00, T3.00, T4.00...)
- **Duration countdown:** Reduces by 1 at each integer turn
- **Partial turn compensation:** Duration set to 6 (5 intended + 1 for partial turn)

### 🎯 Stack Mechanics
- **Independent stacks:** Each attack creates a unique debuff instance
- **Additive damage:** All stacks deal damage simultaneously at integer turns
- **Duration refresh:** At max stacks (5), attacking refreshes ALL durations to 6

## Expected Player Experience

1. **Immediate feedback:** See "Hemorrhage applied" message right after attack
2. **Predictable DoT:** Damage ticks at clean turn boundaries (2.00, 3.00, 4.00...)
3. **Visual stacking:** Battle log shows stack count (e.g., "3 stacks")
4. **Clear duration:** BuffBar (future) would show clean 5→4→3→2→1 countdown
5. **Strategic play:** Build stacks early for sustained damage throughout fight

## Testing Checklist

- [x] Weapon added to database
- [x] Weapon given to player at run start
- [x] Direct damage applies instantly
- [x] Hemorrhage debuff applies on hit
- [x] Stacks up to 5 times correctly
- [x] Duration is 5 full turns (set to 6 for partial turn)
- [x] DoT damage ticks at integer turns only
- [x] Duration refreshes when attacking at max stacks
- [x] Durations decay independently
- [x] Enemy can die from DoT damage
- [x] Debuffs reset on new enemy

---

**Implementation Date:** January 19, 2026  
**Timing Model:** Option 3 - Hybrid (Instant + Duration)
