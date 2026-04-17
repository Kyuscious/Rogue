# Loot System Reference Guide

## Overview
This document defines how path loot works, which item families are shown by each route, and how rarity pools behave throughout the game.

The current system is path-aware:
- the path icon shows both loot type and difficulty
- the icon background color indicates difficulty: green = easy, orange = fair, red = hard
- the possible loot preview and elite or boss reward choices are filtered by the selected path context, not by the full global item list

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

Each quest path now carries its own reward context:
- difficulty: safe, fair, or risky
- loot type: damage, defense, mixed, and related variants
- path name and description, used to support the fair route presentation

The preview and reward selection now work like this:

1. **Read the selected path context** from Quest Select
2. **Map the loot icon to a class family**
3. **Apply a difficulty-based rarity bias**
4. **Filter the item pool** to items that match both the loot family and the allowed rarity band
5. **Display grouped by rarity** with drop percentages based on that filtered pool

### Current path rules

#### Easy routes (green)
- mainly Common rewards
- intended for cleaner, lower-risk progression

#### Fair routes (orange)
- Common and Epic mix
- used for balanced paths

#### Hard routes (red)
- mostly Epic, with some Legendary on stronger reward rolls
- intended for higher-risk, higher-upgrade paths

### Loot-type class mapping

#### Sword or damage paths
- classes favored: Assassin, Skirmisher, Marksman, Juggernaut

#### Shield or tanky paths
- classes favored: Vanguard, Warden, Juggernaut

#### Magic paths
- classes favored: Mage, Enchanter

#### Mixed paths
- allow a broader combined pool

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
- **Location**: Quest Select screen, via the eye button on each path
- **Shows**: the filtered loot pool that route can offer for elite or boss reward selection
- **Calculations**: uses the player's current Magic Find stat and the path's loot context
- **Display**: grouped by rarity with drop percentages

### Battle Summary Preview
- **Location**: Battle Summary screen during reward selection
- **Shows**: the same filtered loot pool for the currently selected route
- **Purpose**: let players see what else could have appeared from that route's reward pool
- **Display**: same format as Quest Select preview

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

### Issue: "A route preview shows too many unrelated items"
**Cause**: Missing or incorrect path loot context
**Current Behavior**: This is now fixed. Route previews should be filtered by the selected path's loot type and difficulty.

### Issue: "A hard shield path should not show mage or marksman gear"
**Expected Behavior**: Hard shield paths should primarily show Vanguard, Warden, and Juggernaut items, with a mostly Epic bias and some Legendary results.

### Issue: "An easy damage path should not show all rarities"
**Expected Behavior**: Easy green sword-style routes should stay mostly Common and focus on Assassin, Skirmisher, Marksman, and Juggernaut gear

### Issue: "Loot preview button doesn't show on LootSelectionScreen"
**Cause**: LootSelectionScreen needs `region` and `enemyIds` props passed from parent
**Solution**: Pass these props when rendering from Battle.tsx (see implementation below)

---

## Future Enhancements

### 1. Region-Specific Loot Pools
Some items should only drop in certain regions (e.g., Freljord-themed items only in Freljord)

### 2. Encounter-Based Tier Gating
- Not sure

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

### Path Reward Bias Quick Table

| Path Color | Meaning | Main Rarity Bias | Typical Class Pool |
|-----------|---------|------------------|--------------------|
| Green | Easy | Common | Damage or defense classes based on icon |
| Orange | Fair | Common + Epic | Balanced pool based on icon |
| Red | Hard | Mostly Epic, some Legendary | Higher-upgrade pool based on icon |

**Note**: Enemy-tier percentages are base weights before Magic Find modifiers. Path color then narrows the reward selection pool further.

---

## Contact & Support

For questions about loot system implementation, refer to:
- `src/game/lootCalculator.ts` source code
- `LOOT_PREVIEW_GUIDE.md` for integration examples
- This document for game design rules
