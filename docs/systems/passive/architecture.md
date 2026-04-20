# Passive System Refactor Plan

**STATUS:** 🚧 WIP - System designed, integration pending  
**LAST UPDATED:** February 10, 2026  
**NOTE:** Hardcoded passives still in Battle.tsx (lines 802, 1149, 1540+). New event-driven system created but not yet integrated.

## Current Problems

### 1. **Hardcoded Passive Checks**
- Passives are manually checked in Battle.tsx with `if (playerPassiveIds.includes('life_draining'))`
- No centralized system to trigger passive effects
- Logic scattered across multiple files

### 2. **Unused Callback Architecture**
- PassiveEffect interface has callbacks (onHit, onKill, etc.) that aren't actually invoked
- Implementations are in comments saying "handled in Battle component"
- The callback functions return values but don't modify state

### 3. **Poor Integration with Combat System**
- Doesn't integrate with existing systems:
  - Turn system (turnSystemV2.ts)
  - Status effects (statusEffects.ts)
  - Combat buffs (itemSystem.ts)
  - Shield system (shieldSystem.ts)
  - On-hit effects (onHitEffects.ts)
  - Crowd control (crowdControlSystem.ts)

### 4. **Missing Features**
- Many passives are placeholders
- No proper damage/healing modification pipeline
- No way to chain or stack passive effects
- Can't easily add new passive types

## New Architecture

### Core Concepts

1. **Event-Driven System**
   - Passives subscribe to game events
   - Events trigger at specific moments in combat
   - Passives can modify event data before it's applied

2. **Passive Context**
   - All passive functions receive a context object with:
     - Current game state
     - Character data (attacker, target)
     - Action data (damage, healing, etc.)
     - Utility functions (addBuff, applyDamage, addLog, etc.)

3. **Execution Pipeline**
   - Events pass through all relevant passives in order
   - Each passive can modify the data
   - Final result is applied to game state

4. **Unified with Combat Systems**
   - Integrate with CombatBuff system for temporary effects
   - Use StatusEffect system for debuffs
   - Work with onHitEffects for damage modifications
   - Respect shield and crowd control systems

### Event Types (Triggers)

```typescript
// Core combat events
'battle_start'        // When battle begins
'battle_end'          // When battle ends (victory/defeat)
'turn_start'          // At the start of each turn
'turn_end'            // At the end of each turn
'before_attack'       // Before damage calculation
'on_hit'              // When attack/spell hits
'after_damage_dealt'  // After dealing damage
'after_damage_taken'  // After taking damage
'on_kill'             // When killing an enemy
'on_death'            // When dying
'on_heal'             // When healing
'on_crit'             // When landing a critical strike
'on_spell_cast'       // When casting a spell
'on_item_use'         // When using an item
'gold_gained'         // When gaining gold
'exp_gained'          // When gaining experience

// Stat modification
'stat_calculation'    // During stat calculation (remains)
```

### New PassiveContext Interface

```typescript
interface PassiveContext {
  // State references
  state: GameState;
  attacker: Character;
  target: Character;
  
  // Action data (mutable)
  damage?: number;
  healing?: number;
  goldAmount?: number;
  expAmount?: number;
  
  // Combat data
  isCrit?: boolean;
  damageType?: 'physical' | 'magic' | 'true';
  isSpell?: boolean;
  isAttack?: boolean;
  
  // Utility functions
  addBuff: (targetId: string, buff: CombatBuff) => void;
  addStatusEffect: (targetId: string, effect: StatusEffect) => void;
  applyDamage: (targetId: string, amount: number, type: DamageType) => void;
  applyHealing: (targetId: string, amount: number) => void;
  addLog: (message: string) => void;
  
  // Item/passive info
  passiveStacks: Record<string, number>; // Track stacks per passive
}
```

### Refactored PassiveEffect Interface

```typescript
interface PassiveEffect {
  id: PassiveId;
  name: string;
  description: string;
  triggers: PassiveTrigger[]; // Multiple triggers allowed
  
  // Event handlers (receive context, can modify it)
  execute?: (ctx: PassiveContext) => void;
  
  // Stat modification (special case, runs during stat calculation)
  statModifier?: (stats: CharacterStats, level: number, stacks?: number) => Partial<CharacterStats>;
  
  // Metadata
  stackable?: boolean;
  maxStacks?: number;
  persistsBetweenBattles?: boolean; // For permanent buffs like Glory
}
```

### PassiveManager Class

```typescript
class PassiveManager {
  private passives: Map<PassiveId, PassiveEffect>;
  private activePassives: PassiveId[];
  private passiveStacks: Record<PassiveId, number>;
  
  // Register passives from inventory
  initialize(inventory: InventoryItem[]): void;
  
  // Trigger event and execute all matching passives
  trigger(event: PassiveTrigger, context: PassiveContext): PassiveContext;
  
  // Apply stat modifications
  applyStatModifiers(stats: CharacterStats, level: number): CharacterStats;
  
  // Stack management
  addStack(passiveId: PassiveId, amount: number): void;
  getStacks(passiveId: PassiveId): number;
  resetStacks(resetPermanent?: boolean): void;
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create `passiveSystem.ts` with new interfaces and PassiveManager
2. Create `passiveContext.ts` for context building
3. Update `itemPassives.ts` with new format (start with existing working passives)

### Phase 2: Integration Points
1. Add PassiveManager to game store
2. Hook into Battle.tsx at key moments:
   - Battle start/end
   - Before/after damage
   - Turn start/end
   - Kill events
3. Remove hardcoded passive checks

### Phase 3: Migrate Existing Passives
1. Life Draining (Doran's Blade)
2. Enduring Focus (Doran's Shield)
3. Drain (Doran's Ring)
4. Immolate (Bami's Cinder)
5. Glory/Glory Upgraded (Dark Seal/Mejai's)
6. Reap (The Cull)
7. Magical Opus (Rabadon's)
8. Pathfinder

### Phase 4: Implement Placeholder Passives
1. Thorns - Reflect damage
2. Grievous Wounds - Reduce healing
3. Lifeline - Prevent lethal damage
4. Madness - Gain AD from missing HP
5. Rage - Gain AD when taking damage
6. Quicksilver - Bonus attack speed
7. Spellblade - Empower next attack after spell
8. Others...

### Phase 5: Testing & Polish
1. Test each passive independently
2. Test passive stacking
3. Test passive interactions
4. Performance optimization
5. Documentation

## Benefits

1. **Maintainability**: All passive logic in one place
2. **Extensibility**: Easy to add new passives
3. **Consistency**: All passives use same system
4. **Debugging**: Clear event flow and logging
5. **Performance**: Can optimize the pipeline as needed
6. **Type Safety**: Strong typing for all passive interactions

## Example: Refactored Life Draining

### Old (Hardcoded in Battle.tsx)
```typescript
// Around line 748 in Battle.tsx
if (playerPassiveIds.includes('life_draining')) {
  setCombatBuffs((prev) => {
    const updatedBuffs = applyLifeDrainingBuff(prev);
    // ... manual buff tracking logic
  });
}
```

### New (Event-Driven)
```typescript
// In itemPassives.ts
life_draining: {
  id: 'life_draining',
  name: 'Life Draining',
  description: 'Dealing attack damage increases total AD by 1% (stacks for the encounter).',
  triggers: ['after_damage_dealt'],
  stackable: true,
  execute: (ctx: PassiveContext) => {
    if (ctx.isAttack && ctx.damage > 0) {
      // Add stacking AD buff
      ctx.addBuff(ctx.attacker.id, {
        id: `life_draining_${Date.now()}`,
        name: 'Life Draining',
        type: 'combat',
        duration: -1, // Permanent for battle
        statModifiers: {
          attackDamage: 1, // 1% AD increase
        },
        isPercentage: true,
        stackable: true,
      });
      
      ctx.addLog(`${ctx.attacker.name}: Life Draining (+1% AD)`);
    }
  },
},
```

### Usage in Battle.tsx
```typescript
// Single line replaces all hardcoded checks
const modifiedContext = passiveManager.trigger('after_damage_dealt', context);
```
