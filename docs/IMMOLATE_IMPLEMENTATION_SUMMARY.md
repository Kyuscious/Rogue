# Bami's Cinder Immolate Passive - Complete Implementation Guide

## Summary

You now have a complete system for implementing Bami's Cinder's **Immolate** passive feature. Here's what has been set up:

---

## 📋 What Was Added

### 1. **Immolate Passive (itemPassives.ts)**
- ✅ Fixed syntax error (missing comma)
- ✅ Updated description to match the mechanics
- ✅ Added 'immolate' to PassiveId type

### 2. **Burn Effect System (statusEffects.ts)**
- ✅ Added 'burn' type to StatusEffect interface
- ✅ `applyBurn()` - Apply or stack burn with duration refresh
- ✅ `getBurnDamage()` - Get total damage dealt this turn (stacks × 15)
- ✅ `getBurnStacks()` - Get current number of burn stacks
- ✅ `getBurnDuration()` - Get remaining turns of burn effect

### 3. **Documentation**
- ✅ **IMMOLATE_PASSIVE_GUIDE.md** - Complete mechanics explanation
- ✅ **immolateIntegration.example.ts** - Code examples and integration points

### 4. **Bami's Cinder Item**
- ✅ Already exists in items.ts (epic tier, 900g, 150 health, 5 haste)
- ✅ Has passiveId: 'immolate'
- ✅ Has imagePath for the item icon

---

## 🎮 Core Mechanics

### The Burn Effect

```
Trigger:     Physical attack or when attacked
Damage:      15 damage per stack per turn
Duration:    2 turns
Refresh:     New stacks reset duration to 2 turns
Stacking:    Additive (2 Bami items = 2 stacks per hit)
```

### Example Scenario

**Player has 2 Bami's Cinder items:**

```
Turn 1: Player attacks
  → 2 burn stacks applied to enemy (2 turn duration)
  → Next turn: Enemy takes 2 × 15 = 30 burn damage

Turn 2: Enemy takes 30 burn damage (1 turn remaining)
  → Player attacks again
  → 2 more burn stacks added (now 4 total)
  → Duration resets to 2 turns

Turn 3: Enemy takes 4 × 15 = 60 burn damage (1 turn remaining)

Turn 4: Enemy takes 60 burn damage (0 turns remaining)
  → Burn expires

Turn 5: No burn damage (effect has expired)
```

---

## 🔧 How to Integrate

You need to call these functions in your Battle component:

### 1. **On Physical Attack**

```typescript
import { applyBurn } from './statusEffects';

// When player deals physical damage (not spell damage)
const bamiCount = character.inventory.filter(
  item => item.itemId === 'bamis_cinder'
).length;

if (bamiCount > 0 && damageType === 'physical') {
  effects = applyBurn(effects, enemyId, bamiCount, currentTime, 'player');
}
```

### 2. **On Enemy Attack**

```typescript
// When enemy deals physical damage
const enemyBamiCount = 1; // or however you track enemy items

if (enemyBamiCount > 0 && isDamageTypePhysical) {
  effects = applyBurn(effects, playerId, enemyBamiCount, currentTime, 'enemy');
}
```

### 3. **At Turn Start**

```typescript
import { getBurnDamage, getBurnStacks } from './statusEffects';

// Apply burn damage at start of each turn
const playerBurnDmg = getBurnDamage(effects, 'player', currentTime);
const enemyBurnDmg = getBurnDamage(effects, 'enemy', currentTime);

if (playerBurnDmg > 0) playerHp -= playerBurnDmg;
if (enemyBurnDmg > 0) enemyHp -= enemyBurnDmg;
```

### 4. **For UI Display (Optional)**

```typescript
import { getBurnStacks, getBurnDuration } from './statusEffects';

const stacks = getBurnStacks(effects, entityId, currentTime);
const duration = getBurnDuration(effects, entityId, currentTime);

if (stacks > 0) {
  return `🔥 Burn x${stacks} (${duration.toFixed(1)} turns) - ${stacks * 15} dmg/turn`;
}
```

---

## 📁 Files Modified

| File | Changes |
|------|---------|
| `src/game/itemPassives.ts` | Fixed syntax, added immolate passive, added 'immolate' to PassiveId type |
| `src/game/statusEffects.ts` | Added 'burn' type, added burn effect functions |
| `docs/IMMOLATE_PASSIVE_GUIDE.md` | **NEW** - Complete mechanics guide |
| `src/game/immolateIntegration.example.ts` | **NEW** - Code examples and integration template |

---

## ✅ Integration Checklist

- [ ] Import `applyBurn`, `getBurnDamage`, `getBurnStacks`, `getBurnDuration` in your Battle component
- [ ] Count Bami's Cinder items in player inventory
- [ ] Apply burn on player physical attacks
- [ ] Apply burn on enemy physical attacks
- [ ] Deal burn damage at turn start
- [ ] Update effects array after each action
- [ ] Display burn status in UI (optional)
- [ ] Test with 0 Bami items (no effect)
- [ ] Test with 1 Bami item (1 stack per hit)
- [ ] Test with 2+ Bami items (stacks additively)
- [ ] Test duration expiration (2 turns without new stacks)
- [ ] Test duration refresh (new attacks reset duration)

---

## 🐛 Testing Scenarios

### Test 1: No Items
```
Expected: No burn applied
Action: Player attacks without Bami's Cinder
Result: ✅ No burn stacks added
```

### Test 2: Single Item
```
Expected: 1 burn stack per hit, 15 damage per turn
Action: Player with 1 Bami attacks enemy
Result: ✅ Enemy has 1 burn, takes 15 damage/turn
```

### Test 3: Multiple Items
```
Expected: Stacks additively (2 items = 2 stacks)
Action: Player with 2 Bami attacks enemy
Result: ✅ Enemy has 2 burn, takes 30 damage/turn
```

### Test 4: Stacking Increases
```
Expected: New attacks add to existing stacks, duration resets
Action: Turn 1 attack (2 stacks), Turn 2 attack (4 stacks total)
Result: ✅ Enemy has 4 burns, duration resets to 2 turns
```

### Test 5: Duration Expiration
```
Expected: Burn disappears after 2 turns without new attacks
Action: Apply burn, wait 2 turns, no more attacks
Result: ✅ Burn effects are removed from effects array
```

---

## 📚 Related Documentation

- **IMMOLATE_PASSIVE_GUIDE.md** - Full mechanics explanation with timeline examples
- **immolateIntegration.example.ts** - Runnable code examples showing integration
- **itemPassives.ts** - Passive effect definitions
- **statusEffects.ts** - Burn effect system implementation

---

## 🎯 Key Principles

1. **Additive Stacking:** Multiple Bami items stack the effect linearly
   - 1 item = 1 stack/hit
   - 2 items = 2 stacks/hit
   - 3 items = 3 stacks/hit

2. **Duration Mechanics:** Burn always lasts 2 turns
   - New stacks DON'T add to duration (still 2 turns total)
   - New stacks DO reset the duration timer
   - If 2 turns pass without new attacks, burn expires

3. **Physical Attacks Only:** Spell damage doesn't apply burn
   - Regular attacks: ✅ Apply burn
   - Spell attacks: ❌ No burn
   - Ability damage: ❌ No burn

4. **Damage Calculation:** Simple formula
   - Burn damage per turn = stack count × 15
   - Example: 3 stacks = 45 damage per turn

---

## 🚀 Next Steps

1. Open your Battle component (likely in `src/components/screens/Battle/`)
2. Find where physical damage is handled
3. Follow the integration steps above to add burn application
4. Add burn damage at turn start
5. Update UI to show burn status (optional)
6. Test all scenarios above
7. Iterate and refine based on gameplay feel

---

## 💡 Design Notes

This implementation prioritizes:
- **Clarity:** Simple 15 damage per stack formula
- **Counterplay:** 2-turn duration allows planning
- **Rewards Stacking:** Multiple items meaningfully increase effect
- **Physical Focus:** Balanced by only affecting physical attacks
- **Refreshing Mechanic:** Encourages sustained attacks to maintain burn stack growth

---

**Happy implementing! Good luck with your Roguelike game! 🎮**
