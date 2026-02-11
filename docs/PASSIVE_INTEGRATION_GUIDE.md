# Passive System Integration Guide

**STATUS:** 🚧 WIP - Integration pending  
**LAST UPDATED:** February 10, 2026  
**NOTE:** New PassiveManager system created but NOT yet integrated into Battle.tsx. Use this guide when ready to migrate.

## Overview

The new passive system has been designed. This guide explains how to integrate it into your combat system.

## New Files Created

1. **`src/game/passiveContext.ts`** - Context builder for passive execution
2. **`src/game/passiveSystem.ts`** - PassiveManager class
3. **`src/game/itemPassivesV2.ts`** - Refactored passive definitions
4. **`PASSIVE_SYSTEM_REFACTOR.md`** - Architecture documentation

## Migration Steps

### Step 1: Add PassiveManager to Game Store

**File: `src/game/store.ts`**

```typescript
import { PassiveManager } from './passiveSystem';

// Add to GameStore interface
interface GameStore {
  // ... existing properties
  passiveManager: PassiveManager;
}

// Initialize in createGameStore
const createGameStore = () => {
  const passiveManager = new PassiveManager();
  
  return {
    // ... existing state
    passiveManager,
    
    // Add initialization method
    initializePassives: () => {
      const inventory = get().state.inventory;
      passiveManager.initialize(inventory);
    },
  };
};
```

### Step 2: Integrate with Battle.tsx

**File: `src/components/screens/Battle/Battle.tsx`**

#### 2a. Import the new system

```typescript
import { getPassiveManager } from '../../../game/passiveSystem';
import { createPassiveContext } from '../../../game/passiveContext';
```

#### 2b. Initialize on battle start

Replace this pattern:
```typescript
// OLD: Hardcoded passive checks
useEffect(() => {
  // ... battle initialization
}, []);
```

With:
```typescript
// NEW: Initialize passive manager
useEffect(() => {
  const passiveManager = getPassiveManager();
  passiveManager.initialize(state.inventory);
  
  // Trigger battle_start event
  const context = createPassiveContext(playerChar, enemyChar)
    .setUtilities({
      addBuff: (targetId, buff) => {
        // Add buff to state
      },
      addLog: (message) => {
        // Add to battle log
      },
      // ... other utilities
    })
    .build();
  
  passiveManager.trigger('battle_start', context);
}, [enemyChar.id]); // Re-initialize on new enemy
```

#### 2c. Replace hardcoded passive checks

**REMOVE these hardcoded checks:**

```typescript
// OLD: Around line 748
if (playerPassiveIds.includes('life_draining')) {
  setCombatBuffs((prev) => {
    const updatedBuffs = applyLifeDrainingBuff(prev);
    // ...
  });
}

// OLD: Around line 1084
if (playerPassiveIds.includes('drain')) {
  // ...
}

// OLD: Around line 1475
if (playerPassiveIds.includes('enduring_focus')) {
  // ...
}
```

**REPLACE with event triggers:**

```typescript
// NEW: After dealing damage
const passiveManager = getPassiveManager();
const context = createPassiveContext(attacker, target)
  .setDamage(damageDealt)
  .setIsAttack(true)
  .setDamageType('physical')
  .setUtilities({
    addBuff: (targetId, buff) => setCombatBuffs(prev => [...prev, buff]),
    addLog: (msg) => addBattleLogEntry(msg),
    getStats: (charId) => charId === 'player' ? playerScaledStats : enemyScaledStats,
  })
  .build();

passiveManager.trigger('after_damage_dealt', context);
```

### Step 3: Hook Into Combat Events

Add passive triggers at these key points:

#### Battle Start/End
```typescript
// Battle start
useEffect(() => {
  passiveManager.trigger('battle_start', context);
}, []);

// Battle end (victory)
const handleVictory = () => {
  passiveManager.trigger('battle_end', context);
  // ... rest of victory logic
};
```

#### Turn Start/End
```typescript
// Turn start
const handleTurnStart = () => {
  passiveManager.trigger('turn_start', context);
  // ... rest of turn logic
};

// Turn end
const handleTurnEnd = () => {
  passiveManager.trigger('turn_end', context);
  // ... rest of turn logic
};
```

#### Attack/Damage Events
```typescript
// Before attack
const handleAttack = () => {
  const contextBefore = createPassiveContext(attacker, target)
    .setIsAttack(true)
    .build();
  passiveManager.trigger('before_attack', contextBefore);
  
  // Calculate damage
  let damage = calculateDamage();
  
  // After damage dealt
  const contextAfter = createPassiveContext(attacker, target)
    .setDamage(damage)
    .setIsAttack(true)
    .setDamageType('physical')
    .build();
  passiveManager.trigger('after_damage_dealt', contextAfter);
  
  // After damage taken (on target)
  const contextTaken = createPassiveContext(target, attacker)
    .setDamage(damage)
    .build();
  passiveManager.trigger('after_damage_taken', contextTaken);
};
```

#### Kill Event
```typescript
const handleEnemyDeath = () => {
  const context = createPassiveContext(playerChar, enemyChar)
    .setGoldAmount(goldReward)
    .build();
  
  const modifiedContext = passiveManager.trigger('on_kill', context);
  
  // Use modified gold amount
  addGold(modifiedContext.goldAmount || goldReward);
};
```

#### Gold/Experience Events
```typescript
const awardGold = (amount: number) => {
  const context = createPassiveContext(playerChar, enemyChar)
    .setGoldAmount(amount)
    .build();
  
  const modified = passiveManager.trigger('gold_gained', context);
  addGold(modified.goldAmount || amount);
};

const awardExp = (amount: number) => {
  const context = createPassiveContext(playerChar, enemyChar)
    .setExpAmount(amount)
    .build();
    
  const modified = passiveManager.trigger('exp_gained', context);
  addExperience(modified.expAmount || amount);
};
```

### Step 4: Update Stat Calculation

**File: `src/game/statsSystem.ts`**

Replace the old passive modifier call:

```typescript
// OLD
import { applyPassiveStatModifiers } from './itemPassives';

export function getScaledStats(...) {
  // ... calculations
  const statsWithPassives = applyPassiveStatModifiers(statsWithClass, level, passiveIds);
  return statsWithPassives;
}
```

With the new system:

```typescript
// NEW
import { getPassiveManager } from './passiveSystem';

export function getScaledStats(...) {
  // ... calculations
  const passiveManager = getPassiveManager();
  const statsWithPassives = passiveManager.applyStatModifiers(statsWithClass, level);
  return statsWithPassives;
}
```

### Step 5: Update Item System

**File: `src/game/items.ts`**

Update the exports to use the new passive system:

```typescript
// Export from both old and new systems during transition
export { PassiveId, getPassiveById } from './itemPassives'; // OLD (keep for compatibility)
export { PassiveId as PassiveIdV2, ITEM_PASSIVES_V2 } from './itemPassivesV2'; // NEW
export { getPassiveManager } from './passiveSystem'; // NEW
```

## Testing Checklist

After integration, test these scenarios:

- [ ] Life Draining (Doran's Blade) stacks AD correctly
- [ ] Enduring Focus (Doran's Shield) heals over time
- [ ] Drain (Doran's Ring) stacks AP correctly
- [ ] Reap (The Cull) grants bonus gold on kill
- [ ] Glory (Dark Seal) grants permanent AP on champion/legend kills
- [ ] Glory Upgraded (Mejai's) inherits Dark Seal stacks
- [ ] Magical Opus (Rabadon's) increases AP by 30%
- [ ] Pathfinder (Frostfang) doubles experience
- [ ] Immolate applies burn stacks
- [ ] Thorns reflects damage
- [ ] Grievous Wounds reduces healing
- [ ] Rage stacks AD when taking damage

## Example: Complete Integration Pattern

Here's a complete example of handling a player attack:

```typescript
const handlePlayerAttack = (weaponId: string) => {
  const passiveManager = getPassiveManager();
  
  // 1. Before attack trigger
  let ctx = createPassiveContext(playerChar, enemyChar)
    .setIsAttack(true)
    .setWeaponId(weaponId)
    .setUtilities({
      addBuff: (targetId, buff) => setCombatBuffs(prev => [...prev, buff]),
      addStatusEffect: (targetId, effect) => setStatusEffects(prev => [...prev, effect]),
      addLog: (msg) => addBattleLogEntry(msg),
      getStats: (id) => id === playerChar.id ? playerScaledStats : enemyScaledStats,
    })
    .build();
  
  passiveManager.trigger('before_attack', ctx);
  
  // 2. Calculate damage (with weapon effects, stats, etc.)
  const baseDamage = calculatePhysicalDamage(playerScaledStats, enemyScaledStats);
  const isCrit = rollCriticalStrike(playerScaledStats.critChance || 0);
  const finalDamage = isCrit ? calculateCriticalDamage(baseDamage, playerScaledStats) : baseDamage;
  
  // 3. On hit trigger
  ctx = createPassiveContext(playerChar, enemyChar)
    .setDamage(finalDamage)
    .setIsAttack(true)
    .setDamageType('physical')
    .setIsCrit(isCrit)
    .setWeaponId(weaponId)
    .setUtilities(/* same as above */)
    .build();
  
  const modifiedCtx = passiveManager.trigger('on_hit', ctx);
  
  // 4. Apply damage
  const actualDamage = modifiedCtx.damage || finalDamage;
  applyDamageWithShield(enemyChar, actualDamage, updateEnemyHp);
  
  // 5. After damage dealt trigger
  ctx = createPassiveContext(playerChar, enemyChar)
    .setDamage(actualDamage)
    .setIsAttack(true)
    .setDamageType('physical')
    .setUtilities(/* same as above */)
    .build();
  
  passiveManager.trigger('after_damage_dealt', ctx);
  
  // 6. After damage taken trigger (on enemy)
  ctx = createPassiveContext(enemyChar, playerChar)
    .setDamage(actualDamage)
    .setUtilities(/* same as above */)
    .build();
  
  passiveManager.trigger('after_damage_taken', ctx);
  
  // 7. Check for kill
  if (enemyChar.hp <= 0) {
    ctx = createPassiveContext(playerChar, enemyChar)
      .setGoldAmount(goldReward)
      .setUtilities(/* same as above */)
      .build();
    
    const killCtx = passiveManager.trigger('on_kill', ctx);
    addGold(killCtx.goldAmount || goldReward);
  }
};
```

## Benefits of New System

1. **No more hardcoded checks** - All passive logic is in one place
2. **Easy to add new passives** - Just add to itemPassivesV2.ts
3. **Consistent behavior** - All passives use same event system
4. **Better debugging** - Clear event flow and logging
5. **Type-safe** - Full TypeScript support
6. **Extensible** - Easy to add new trigger types

## Migration Strategy

You can migrate gradually:
1. Keep old system running
2. Add new system alongside
3. Test new passives one by one
4. Remove old code when confident
5. Delete old itemPassives.ts when fully migrated

## Next Steps

1. Implement the integration in Battle.tsx
2. Test each passive individually
3. Add missing utility functions (shield, status effects, etc.)
4. Implement remaining placeholder passives
5. Add passive stacking UI indicators
6. Performance profiling and optimization
