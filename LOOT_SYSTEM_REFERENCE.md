# Loot System Reference Guide

## Overview
This document defines what items can drop from which enemy tiers and how rarity pools work throughout the game.

---

## Rarity Tiers

### Available Rarities (In Order)
1. **Starter** - Only obtained through character selection, NOT droppable
2. **Common** - Basic items, low stats
3. **Epic** - Moderate stats, some unique effects
4. **Legendary** - High stats, powerful effects
5. **Mythic** - Very high stats, game-changing effects
6. **Ultimate** - Extremely powerful, rare drops
7. **Exalted** - Near-endgame power level
8. **Transcendent** - Maximum power level (not currently droppable)

---

## Enemy Tiers & Loot Pools

### **MINION TIER** (Basic Enemies)
**Location**: Early quest paths, filler encounters

**Rarity Pool**:
- **80%** Common
- **20%** Epic

**Notes**: 
- Starter items have been REMOVED from minion pools (as of fix)
- Lowest tier loot, appropriate for early game
- Cannot drop Legendary or higher

---

### **ELITE TIER** (Mid-Tier Enemies)
**Location**: Mid-game encounters, challenging paths

**Rarity Pool**:
- **10%** Common
- **15%** Epic  
- **60%** Legendary
- **15%** Mythic

**Notes**:
- First tier that can drop Legendary items
- Primary source of mid-game gear upgrades
- Magic Find strongly affects Legendary/Mythic chances

---

### **CHAMPION TIER** (High-Tier Enemies)
**Location**: Late-game encounters, difficult paths

**Rarity Pool**:
- **5%** Epic
- **10%** Legendary
- **15%** Mythic
- **55%** Ultimate
- **15%** Exalted

**Notes**:
- First tier that can drop Ultimate and Exalted items
- Primarily drops high-end gear
- Best pre-boss loot source

---

### **BOSS TIER** (Region/Floor Bosses)
**Location**: Floor 5, Floor 10 (region completion), special encounters

**Rarity Pool**:
- **5%** Epic
- **45%** Legendary
- **35%** Mythic
- **10%** Ultimate
- **5%** Exalted

**Notes**:
- Guaranteed powerful loot
- Best balance of Legendary/Mythic drops
- Higher Ultimate chance than Champions
- Floors 5 & 10 always trigger reward selection

---

## Magic Find System

**Magic Find** is a player stat that shifts rarity weights toward higher rarities.

### Formula
```
modifiedWeight = baseWeight + (magicFind × rarityIndex / (poolLength - 1))
```

### Example with 50 Magic Find:
**Elite Pool (4 rarities total)**:
- Common: 10 + (50 × 0/3) = 10 weight
- Epic: 15 + (50 × 1/3) = 31.67 weight
- Legendary: 60 + (50 × 2/3) = 93.33 weight
- Mythic: 15 + (50 × 3/3) = 65 weight

**Result**: Dramatically increases Legendary & Mythic chances

---

## Drop Chance Calculation

For a specific item:
```
itemDropChance = (rarityWeight / totalWeight) × (1 / itemsInRarity) × 100
```

### Example:
Elite enemy, 50 Magic Find, trying to drop a specific Legendary item:

1. Total weight = 10 + 31.67 + 93.33 + 65 = 200
2. Legendary weight = 93.33
3. Assume 20 Legendary items exist
4. Chance = (93.33 / 200) × (1 / 20) × 100 = **2.33%**

---

## Quest Path Loot Calculations

Each quest path has multiple enemies. The loot preview aggregates ALL possible drops:

1. **Resolve all enemy IDs** in the path (by region)
2. **Get each enemy's tier** (minion/elite/champion/boss)
3. **Calculate drop odds** for each tier using player's Magic Find
4. **Aggregate unique items** across all possible rarities
5. **Display grouped by rarity** with drop percentages

---

## Starter Items - IMPORTANT

**Starter items are NOT lootable anywhere in the game.**

### How to Obtain Starter Items:
- **Character Selection**: Each character starts with 1-2 starter items
- **NOT dropped** by any enemy tier
- **NOT available** in shops (unless special event)
- **NOT craftable** or obtainable post-game start

### Why This Matters:
- Starter items are intentionally weak to encourage progression
- They should feel like "training weapons" that you replace quickly
- Allowing them to drop would dilute loot pools with weak items

---

## Regional Scaling (Future Enhancement)

*Note: Not currently implemented, but planned*

Different regions should have different loot tier distributions:

### Early Regions (Demacia, Freljord)
- Higher minion/elite encounters
- Lower legendary drop rates

### Mid Regions (Noxus, Piltover & Zaun)
- More elite/champion encounters  
- Moderate legendary rates

### Late Regions (Ionia, Shadow Isles, Void)
- More champion/boss encounters
- Higher ultimate/exalted rates

---

## Loot Preview System

### Quest Select Preview
- **Location**: QuestSelect screen, 👁️ button on each path
- **Shows**: All possible items from ALL enemies in that path
- **Calculations**: Uses player's current Magic Find stat
- **Display**: Grouped by rarity with drop percentages

### Battle Summary Preview
- **Location**: BattleSummary screen during reward selection
- **Shows**: All possible items from the boss/boss pool
- **Purpose**: Let players see what else COULD have dropped
- **Display**: Same format as quest select

---

## Re-Roll System

### How Re-Rolls Work:
1. Player gets 3 random items from boss loot pool
2. Player can spend a reroll to get 3 NEW random items
3. **Exclusion Rule**: Previously shown items won't appear again
4. **Validation**: Reroll button disabled when <3 unique items remain

### Re-Roll Sources:
- Start with 2-3 rerolls per run
- Can find more in shops or as event rewards
- Limited resource - use wisely!

---

## Implementation Files

### Core System:
- `src/game/items.ts` - ITEM_DATABASE, rarity pools
- `src/game/lootCalculator.ts` - Drop chance calculations
- `src/game/rewardPool.ts` - Reward generation logic

### UI Components:
- `src/components/shared/LootPreviewModal.tsx` - Preview modal
- `src/components/screens/QuestSelect/QuestSelect.tsx` - Quest preview
- `src/components/screens/Battle/BattleSummary.tsx` - Reward selection

### Documentation:
- `LOOT_PREVIEW_GUIDE.md` - Implementation guide
- `LOOT_PREVIEW_SUMMARY.md` - Feature summary
- `LOOT_SYSTEM_REFERENCE.md` - This document

---

## Common Issues & Solutions

### Issue: "I can see Starter items in loot preview"
**Solution**: This has been fixed. MINION_RARITY_POOL no longer includes starter rarity.

### Issue: "Every quest shows all 75 items as possible drops"
**Cause**: Loot calculator aggregates ALL items of valid rarities
**Clarification**: This is correct behavior! The preview shows what COULD drop, not what WILL drop. Individual drop chances are very low (usually <2% per item).

### Issue: "I can see Legendary/Mythic/Exalted from Floor 1"
**Cause**: If fighting Elite/Champion/Boss enemies, these rarities ARE possible
**Solution**: If this feels wrong, we need to gate enemy tiers by floor/region (future enhancement)

### Issue: "Loot preview button doesn't show on LootSelectionScreen"
**Cause**: LootSelectionScreen needs `region` and `enemyIds` props passed from parent
**Solution**: Pass these props when rendering from Battle.tsx (see implementation below)

---

## Future Enhancements

### 1. Region-Specific Loot Pools
Some items should only drop in certain regions (e.g., Freljord-themed items only in Freljord)

### 2. Floor-Based Tier Gating
- Floors 1-3: Minions only
- Floors 4-6: Minions + Elites
- Floors 7-9: Elites + Champions
- Floor 10: Boss

### 3. Pity System
Guarantee a Legendary+ item after X bosses with no good drops

### 4. Duplicate Protection
Reduce chance of dropping items you already own

### 5. Class-Specific Drops
Increase drop rate for items usable by your character's class

---

## Quick Reference Table

| Enemy Tier | Common | Epic | Legendary | Mythic | Ultimate | Exalted |
|-----------|--------|------|-----------|--------|----------|---------|
| Minion    | 80%    | 20%  | -         | -      | -        | -       |
| Elite     | 10%    | 15%  | 60%       | 15%    | -        | -       |
| Champion  | -      | 5%   | 10%       | 15%    | 55%      | 15%     |
| Boss      | -      | 5%   | 45%       | 35%    | 10%      | 5%      |

**Note**: Percentages are base weights before Magic Find modifiers.

---

## Contact & Support

For questions about loot system implementation, refer to:
- `src/game/lootCalculator.ts` source code
- `LOOT_PREVIEW_GUIDE.md` for integration examples
- This document for game design rules
