# Post-Encounter Reward System

**STATUS:** ✅ DONE - Complete system implemented  
**LAST UPDATED:** February 10, 2026  
**NOTE:** This is the comprehensive documentation. See DOCS_INDEX.md for quick reference.

## Overview

After defeating the final encounter (boss/legend tier enemy) in a quest path, players now enter a new system that allows them to make strategic choices before continuing to the next floor or quest.

## System Flow

```
Boss Defeated
    ↓
[Loot Selection Screen]
    Player chooses 1 item from the boss's loot table
    ↓
[Post-Encounter Choice Screen]
    Player chooses one of three options:
    1. Rest
    2. Modify Build
    3. Random Event
    ↓
[Based on Choice]
    - Rest: Recover and continue
    - Modify Build: Change class, manage items, modify stats
    - Random Event: Face a region-specific challenge or reward
```

## Components

### 1. LootSelectionScreen.tsx
**Purpose**: Display boss loot and let players select one item

**Features**:
- Shows available loot from boss encounter
- Display character preview (HP, Gold)
- Click to select an item
- Items are added to inventory

**File**: `src/components/LootSelectionScreen.tsx`

### 2. PostEncounterScreen.tsx
**Purpose**: Display three post-encounter choices

**Choices Available**:
- **Rest** (Green option)
  - Recover 50% of max HP
  - Remove all debuffs
  - Refill refillable items (placeholder for expansion)
  - Disabled if player is at full health

- **Modify Build** (Orange option)
  - Change character class
  - Manage inventory (discard items)
  - Modify stats (placeholder)
  - Remove cursed items (placeholder)

- **Random Event** (Yellow option)
  - Face region-specific random event
  - Varies by region
  - Can reward items, gold, stats, or impose curses

**File**: `src/components/PostEncounterScreen.tsx`

### 3. BuildModificationScreen.tsx
**Purpose**: Detailed interface for modifying character build

**Tabs**:
- **Class Tab**
  - Change character class
  - Shows available classes with descriptions
  - Visual feedback for selected class
  - Warning when changing from current class

- **Items Tab** (Implemented)
  - View all items in inventory
  - Discard unwanted items
  - Placeholder for curse removal

- **Stats Tab** (Placeholder)
  - Currently shows character's current stats
  - TODO: Implement stat respec system
  - TODO: Add point allocation UI

**File**: `src/components/BuildModificationScreen.tsx`

## Game Systems

### Event System
**Location**: `src/game/eventSystem.ts`

**Features**:
- `RegionEvent` interface for defining events
- Region-based event registry
- `getRandomEventForRegion()` function
- Event types: treasure, encounter, relic, quest, mystery
- Reward types: gold, items, stats, curse, buff, mixed

**Region Event Files**:
- `src/game/regions/demacia/events.ts` - 6 Demacia events
- `src/game/regions/marai_territory/events.ts` - 6 Marai events
- `src/game/regions/ice_sea/events.ts` - 6 Ice Sea events

### Rest System
**Location**: `src/game/restSystem.ts`

**Features**:
- `performRest()`: Execute rest action
  - Restores 50% of max HP
  - Removes debuffs
  - Counts refilled items
  - Returns `RestOutcome` with amounts

- `canRest()`: Check if player can rest
  - Returns true if HP < max HP

### Post-Encounter Rewards System
**Location**: `src/game/postEncounterRewards.ts`

**Features**:
- `PostEncounterState` interface for tracking state
- `isFinalEncounter()`: Check if encounter is the 10th
- `getBossLoot()`: Generate loot table for encounter
  - Common items for normal boss
  - Rare items for final boss

### Build Modification System
**Location**: `src/game/buildModificationSystem.ts`

**Features** (Currently Placeholders):
- `changeCharacterClass()`: Change player class with stat recalculation
- `modifyStatPoints()`: Redistribute stat points
- `discardItem()`: Remove item from inventory
- `removeCurse()`: Remove curse from item (costs gold)
- `getAvailableClasses()`: Get list of available classes

## Region Events Examples

### Demacia Events (6 total)
1. **Petricite Crystal Discovery** - Treasure, grants 2x mana crystal
2. **Royal Emissary** - Quest, grants 250 gold
3. **Garen's Challenge** - Encounter, fight Garen for 500g + warmogs_armor
4. **Ancient Vault Uncovered** - Treasure, multiple items
5. **Divine Boon** - Relic buff, +50 health, +10 armor
6. **Cursed Plate Armor** - Mystery, risky armor with curse

### Marai Events (6 total)
1. **Coral Treasure Cache** - Treasure
2. **Siren's Blessing** - Relic buff
3. **Deep Guardian's Trial** - Encounter
4. **Leviathan's Whisper** - Mystery
5. **Pearl of Wisdom** - Treasure with gold
6. **Cursed Shell Armor** - Mystery

### Ice Sea Events (6 total)
1. **Frozen Treasure Vault** - Treasure
2. **Eternal Winter's Blessing** - Relic buff
3. **Frostborn Champion's Trial** - Encounter
4. **Glacial Artifacts Discovery** - Treasure
5. **Blizzard Spirits' Gift** - Relic buff
6. **Cursed Frostbite Weapon** - Mystery

## TODO / Future Expansions

### High Priority
- [ ] Integrate post-encounter screen into battle system
- [ ] Implement class change stat recalculation
- [ ] Create curse removal mechanic with gold cost
- [ ] Add more region events (additional to current 6 per region)
- [ ] Create event outcome animations/effects

### Medium Priority
- [ ] Implement stat respec system
- [ ] Add synergy bonuses for item combinations
- [ ] Create stat cap system
- [ ] Add refillable items mechanics (potions, scrolls, etc.)
- [ ] Implement build templates/presets

### Low Priority
- [ ] Add sound effects for choices
- [ ] Create animated transitions between screens
- [ ] Add achievements for specific event chains
- [ ] Implement event difficulty scaling
- [ ] Create event history/log

## Integration Notes

To integrate this system into the battle flow:

1. After final boss defeat in a quest path
2. Display `LootSelectionScreen` component
3. After loot selection, display `PostEncounterScreen`
4. Based on user choice:
   - **Rest**: Call `performRest()`, show summary, continue
   - **Modify Build**: Display `BuildModificationScreen`, apply changes
   - **Event**: Get random event with `getRandomEventForRegion()`, show event screen, apply outcome
5. After choice resolution, either:
   - Continue to next quest
   - Return to region select
   - Show floor completion summary

## File Structure

```
src/game/
  ├── eventSystem.ts
  ├── restSystem.ts
  ├── postEncounterRewards.ts
  ├── buildModificationSystem.ts
  └── regions/
      ├── demacia/
      │   └── events.ts
      ├── marai_territory/
      │   └── events.ts
      └── ice_sea/
          └── events.ts

src/components/
  ├── LootSelectionScreen.tsx
  ├── PostEncounterScreen.tsx
  └── BuildModificationScreen.tsx

src/styles/
  ├── LootSelectionScreen.css
  ├── PostEncounterScreen.css
  └── BuildModificationScreen.css
```

## CSS Features

- **Dark theme** with region-specific accent colors
- **Responsive grid layouts** for loot and choices
- **Hover effects** for interactive elements
- **Color-coded choices** (green/rest, orange/build, yellow/event)
- **Animation transitions** for smooth visual feedback
- **Mobile-friendly** design with media query support

