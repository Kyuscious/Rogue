# Loot Preview & Re-roll System - Implementation Guide

## Overview
This implementation adds a comprehensive loot preview system that shows all possible loot drops with their probabilities, and refactors the loot selection to prevent duplicate items on re-roll.

## New Files Created

### 1. `src/game/lootCalculator.ts`
Utility module for calculating loot drop probabilities and generating unique loot.

**Key Functions:**
- `calculateQuestLoot(enemyIds, region, magicFind)` - Calculates all possible loot from a quest path with drop rates
- `generateUniqueLoot(enemyIds, region, magicFind, count, excludeIds)` - Generates unique loot excluding already-offered items
- `canReroll(enemyIds, region, excludeIds, requiredCount)` - Checks if there are enough unique items remaining for a re-roll

### 2. `src/components/shared/LootPreviewModal.tsx` & `.css`
Modal component that displays all possible loot drops grouped by rarity with drop chance percentages.

**Features:**
- Groups items by rarity (color-coded)
- Shows drop chance as percentage
- Displays item images
- Shows total unique item count and average rarity
- Notes Magic Find's effect on drop rates

### 3. Integration in `QuestSelect` Component
Added a loot preview button (👁️ icon) next to each quest path's loot type indicator.

**Usage:**
```tsx
// When user clicks the preview button:
const lootInfo = calculateQuestLoot(path.enemyIds, region, playerMagicFind);
// Opens modal showing all possible drops
```

### 4. Refactored `LootSelectionScreen` Component
Enhanced to support:
- Preview button to show all possible loot
- Re-roll button with smart exclusion system
- Tracks offered items to prevent duplicates
- Disables re-roll when no unique items remain

## How to Use in Battle Flow

### When Boss is Defeated:

```tsx
// Example integration in Battle.tsx
const [offeredLootItems, setOfferedLootItems] = useState<string[]>([]);
const [excludedItemIds, setExcludedItemIds] = useState<string[]>([]);

// Generate initial loot (after boss defeat)
const initialLoot = generateUniqueLoot(
  currentQuest.enemyIds, // Enemy IDs from current path
  state.selectedRegion,
  state.playerCharacter.stats.magicFind || 0,
  3, // Generate 3 items
  [] // No exclusions on first generation
);
setOfferedLootItems(initialLoot);
setExcludedItemIds(initialLoot); // Track what's been offered

// On re-roll
const handleLootReroll = () => {
  const newLoot = generateUniqueLoot(
    currentQuest.enemyIds,
    state.selectedRegion,
    state.playerCharacter.stats.magicFind || 0,
    3,
    excludedItemIds // Exclude already offered items
  );
  setOfferedLootItems(newLoot);
  setExcludedItemIds([...excludedItemIds, ...newLoot]); // Add to exclusion list
};

// Render LootSelectionScreen
<LootSelectionScreen
  availableLoot={offeredLootItems}
  onSelectLoot={handleSelectLoot}
  character={state.playerCharacter}
  region={state.selectedRegion}
  enemyIds={currentQuest.enemyIds}
  onReroll={handleLootReroll}
  rerollsRemaining={state.rerolls}
/>
```

## Key Features

### 1. Quest Route Loot Preview
- Hover or click the 👁️ icon on any quest path
- See all possible loot drops from that path's enemies
- Drop rates calculated based on enemy tiers
- Magic Find stat is factored into probabilities

### 2. Boss Loot Selection with Preview
- After defeating a boss, view current offered items
- Click "View All Possible Loot" to see the full loot table
- See what you could potentially get with re-rolls

### 3. Smart Re-roll System
- Re-rolling never offers the same item twice in one session
- Re-roll button automatically disables when no unique items remain
- Displays remaining re-roll count
- Uses weighted probability based on drop chances

### 4. Magic Find Impact
- All loot calculations factor in player's Magic Find stat
- Positive Magic Find increases odds of higher rarity items
- Negative Magic Find decreases odds (increases lower rarities)
- Formula: `modifiedWeight = baseWeight + (magicFind * rarityIndex / (poolLength - 1))`

## Drop Rate Calculations

The system uses tier-based rarity pools:

**Minion Tier:**
- 5% Starter, 75% Common, 20% Epic

**Elite Tier:**
- 10% Common, 15% Epic, 60% Legendary, 15% Mythic

**Champion Tier:**
- 5% Epic, 10% Legendary, 15% Mythic, 55% Ultimate, 15% Exalted

**Boss Tier:**
- 5% Epic, 45% Legendary, 35% Mythic, 10% Ultimate, 5% Exalted

Drop chance for a specific item = (rarity_weight / total_weight) × (1 / items_in_rarity) × 100

## Testing Checklist

- [ ] Quest path loot preview opens correctly
- [ ] Modal shows all items grouped by rarity
- [ ] Drop percentages add up logically
- [ ] Boss loot selection shows preview button
- [ ] Re-roll generates different items
- [ ] Re-roll disabled when no items remain
- [ ] Magic Find affects drop rates correctly
- [ ] Excluded items don't reappear on re-roll

## Future Enhancements

1. **Visual Indicators**
   - Highlight items you don't own yet
   - Show item tier/class restrictions
   
2. **Filtering**
   - Filter loot preview by rarity
   - Search for specific items
   
3. **Statistics**
   - Track drop rates across runs
   - Show "you've seen this X times"
   
4. **Smart Recommendations**
   - Highlight items that synergize with current build
   - Show items that complete item sets

## Notes

- The system respects the existing loot generation from `items.ts`
- Enemy tier determines the rarity pool used
- Legend tier enemies don't drop random loot (special rewards only)
- All calculations are done client-side for instant results
- The loot preview Modal is reusable across different contexts
