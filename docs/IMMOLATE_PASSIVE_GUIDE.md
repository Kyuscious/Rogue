# Bami's Cinder - Immolate Passive Guide

**STATUS:** ✅ DONE - Burn system implemented  
**LAST UPDATED:** February 10, 2026

## Overview

Bami's Cinder is an epic-tier item with the **Immolate** passive effect. This passive applies burn stacks to enemies on physical attacks, dealing damage over time.

## Mechanics

### Core Behavior
- **Trigger:** Every physical attack (player attacking or taking damage from enemy attacks)
- **Effect:** Applies burn stacks to the target
- **Damage per Stack:** 15 damage per turn
- **Duration:** 2 turns (resets when new stacks are added)
- **Additivity:** Multiple Bami's Cinder items stack the effect (2 items = 2 stacks per hit)

### Burn Stack System

#### Applying Burn
```typescript
// When player attacks with physical damage
const bamiCount = inventory.filter(item => item.itemId === 'bamis_cinder').length;
effects = applyBurn(effects, enemyId, bamiCount, currentTime, 'player');

// When enemy attacks with physical damage
const enemyBamiItems = 1; // Assume enemies have 1 for now
effects = applyBurn(effects, playerId, enemyBamiItems, currentTime, 'enemy');
```

#### Duration Mechanics
- **Initial Application:** Burn lasts 2 turns from when applied
- **Stack Refresh:** When new stacks are added, duration resets to 2 turns (not additive)
- **Duration Expiration:** If 2 turns pass without new stacks, burn expires completely

### Example Timeline

```
Turn 1: Player attacks enemy with 2 Bami's Cinder items
  → Apply 2 burn stacks to enemy (2 turn duration)
  → Enemy takes 2 * 15 = 30 damage at turn start next turn

Turn 2: Enemy takes 30 burn damage
  → Burn has 1 turn remaining
  → Player attacks again (non-magical)
  → Apply 2 more burn stacks (now 4 total)
  → Duration resets to 2 turns

Turn 3: Enemy takes 4 * 15 = 60 burn damage
  → Burn has 1 turn remaining
  → Neither party uses physical attacks

Turn 4: Enemy takes 60 burn damage (barely makes it in time)
  → Burn has 0 turns remaining
  → Burn expires

Turn 5: No burn damage (effect has expired)
  → If someone attacks with physical damage, new burn can be applied
```

## Implementation Steps

### 1. **Get Bami's Cinder Count**
In your battle component, count how many Bami's Cinder items the player has:

```typescript
const bamiCount = character.inventory.filter(
  item => item.itemId === 'bamis_cinder'
).length;
```

### 2. **Apply Burn on Physical Attacks**
When the player deals physical damage (not spell damage):

```typescript
// In player attack handler
if (isPhysicalDamage) {
  effects = applyBurn(effects, enemyId, bamiCount, currentTime, 'player');
}
```

### 3. **Apply Burn When Taking Damage**
When the player takes physical damage from enemy:

```typescript
// In enemy attack handler
if (enemyAttackIsPhysical) {
  const enemyBamiCount = 
    enemy.itemDrops?.filter(id => id === 'bamis_cinder').length || 0;
  effects = applyBurn(effects, playerId, enemyBamiCount, currentTime, 'enemy');
}
```

### 4. **Apply Burn Damage Each Turn**
At the start of each turn, deal burn damage:

```typescript
// In turn start logic
const burnDamage = getBurnDamage(effects, targetId, currentTime);
if (burnDamage > 0) {
  // Apply burnDamage to target
  target.hp -= burnDamage;
  
  // Optional: Log for UI feedback
  battleLog.push({
    message: `${targetName} takes ${burnDamage} burn damage (${getBurnStacks(effects, targetId, currentTime)} stacks)`,
    type: 'debuff'
  });
}
```

### 5. **Visual Feedback (Optional)**
Show burn stacks and duration to the player:

```typescript
// In UI component rendering debuffs
const burnStacks = getBurnStacks(effects, enemyId, currentTime);
const burnDuration = getBurnDuration(effects, enemyId, currentTime);

if (burnStacks > 0) {
  return (
    <div className="burn-effect">
      🔥 Burn x{burnStacks} ({burnDuration.toFixed(1)} turns)
      <div className="burn-damage">{burnStacks * 15} dmg/turn</div>
    </div>
  );
}
```

## Key Differences from Other Passives

| Aspect | Immolate | Other Passives |
|--------|----------|----------------|
| **Trigger** | Physical attacks only | May vary (spell, on-hit, etc.) |
| **Stacking** | Count-based (multiple items) | Binary (have it or don't) |
| **Duration** | Resets on refresh | Fixed duration |
| **Effect Type** | Damage-over-time debuff | Various |

## Integration Checklist

- [ ] Import `applyBurn`, `getBurnDamage`, `getBurnStacks`, `getBurnDuration` from `statusEffects.ts`
- [ ] Add Bami's Cinder count tracking in battle component
- [ ] Apply burn on player physical attacks
- [ ] Apply burn on enemy physical attacks
- [ ] Deal burn damage at turn start
- [ ] Update effects array after each action
- [ ] Show burn status in UI (optional but recommended)
- [ ] Test with 0, 1, and 2+ Bami's Cinder items
- [ ] Test duration reset mechanic
- [ ] Test with mixed physical/spell attacks

## Testing Scenarios

1. **Single Item, Single Stack**
   - Player has 1 Bami's Cinder
   - Attack enemy → 1 burn stack → 15 damage per turn

2. **Multiple Items, Additive Stacks**
   - Player has 2 Bami's Cinder
   - Attack enemy → 2 burn stacks → 30 damage per turn
   - Attack again (turn 2) → 4 burn stacks → 60 damage per turn

3. **Duration Expiration**
   - Apply burn
   - Turn 1: Burn active (1 turn left)
   - Turn 2: No new attacks → Burn expires

4. **Duration Refresh**
   - Apply burn (2 turn duration)
   - Turn 1: Take burn damage (1 turn left)
   - Attack again → Duration resets to 2 turns

## FAQ

**Q: Does immunity block burn?**
A: Not yet, but can be added as a special case if needed.

**Q: Can burn stack infinitely?**
A: Yes, stacks are unlimited. Each attack adds more stacks.

**Q: What counts as a physical attack?**
A: Anything that deals `attackDamage` instead of `abilityPower`. Spells don't apply burn.

**Q: Do minion Bami's items count?**
A: Only if explicitly set in enemy itemDrops. For now, recommend only player items apply burn.

**Q: Can burn be cleansed?**
A: Not yet, but can add a cleanse mechanic if needed (e.g., certain abilities clear debuffs).
