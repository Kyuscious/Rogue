# Content Integration Guide

**STATUS:** ✅ DONE - Comprehensive guide for adding content  
**LAST UPDATED:** February 10, 2026

**Purpose**: Step-by-step checklists for adding new content to the Rogue game. Each section includes all files that need updates and the specific changes required.

---

## Table of Contents
1. [Adding New Items](#adding-new-items)
2. [Adding New Characters](#adding-new-characters)
3. [Adding New Abilities/Passives](#adding-new-abilitiespassives)
4. [Adding New Regions](#adding-new-regions)
5. [Adding New Game Mechanics](#adding-new-game-mechanics)
6. [Adding New Achievements](#adding-new-achievements)

---

## Adding New Items

### 1. Define Item Data

**File**: `src/game/items.ts`

**Location**: `ITEM_DATABASE` object

**Template**:
```typescript
'item_id': {
  id: 'item_id',
  name: 'Item Display Name',
  description: 'What this item does',
  category: 'starter' | 'basic' | 'epic' | 'legendary' | 'consumable',
  tier: 'minion' | 'elite' | 'champion' | 'boss' | 'legend',
  price: 0, // Cost in gold
  consumable: false, // true for potions/consumables
  stackable: false, // true if multiple can be held
  usableInBattle: false, // true if can be used during combat
  
  // Stats the item provides
  stats: {
    health?: number,
    attackDamage?: number,
    abilityPower?: number,
    armor?: number,
    magicResist?: number,
    speed?: number,
    haste?: number,
    criticalChance?: number,
    criticalDamage?: number,
    lethality?: number,
    magicPenetration?: number,
    lifesteal?: number,
    omnivamp?: number,
    healingOnHit?: number,
    movementSpeed?: number,
    attackRange?: number,
    health_regen?: number,
    magicFind?: number, // % chance for better loot
    goldGain?: number, // % bonus gold
  },
  
  // Passive abilities
  passives?: ['passive_id'],
  
  // Class restrictions (leave empty for all classes)
  allowedClasses?: ['Marksman', 'Mage', 'Fighter', 'Tank', 'Assassin', 'Support'],
  
  // Special on-use effects (for consumables)
  onUse?: {
    type: 'heal' | 'buff' | 'damage',
    amount: number,
    duration?: number, // for buffs
    stat?: string, // which stat to buff
  }
}
```

**Checklist**:
- [ ] Item added to `ITEM_DATABASE`
- [ ] Unique `id` (lowercase_with_underscores)
- [ ] Display `name` (Title Case)
- [ ] Clear `description` explaining mechanics
- [ ] Appropriate `category` and `tier`
- [ ] Price set (0 for non-purchasable items)
- [ ] Stats object filled with relevant bonuses
- [ ] Passives array added if item has passive effects
- [ ] Class restrictions set if applicable

---

### 2. Add Passive Effects (if item has passives)

**File**: `src/game/itemSystem.ts`

**Functions to update**:
- `applyPassiveBuff()` - For passive stat bonuses that stack
- `getPassiveDescription()` - For tooltip text
- `createBuffFromItem()` - For temporary buffs

**Template for passive in itemSystem.ts**:
```typescript
// In applyPassiveBuff function
if (passiveIds.includes('passive_id')) {
  // Apply passive effect
  modifiedStats.statName += calculatedAmount;
}

// In getPassiveDescription function
case 'passive_id':
  return 'Description of what passive does';

// If creates stacking buffs (like Life Draining)
export function applyPassiveNameBuff(
  currentBuffs: CombatBuff[],
  triggerValue: number
): CombatBuff[] {
  const buffAmount = Math.floor(triggerValue * 0.01); // Example calculation
  const existingBuff = currentBuffs.find(b => b.id.startsWith('passive_id'));
  
  if (existingBuff) {
    // Stack or refresh
    return currentBuffs.map(buff =>
      buff.id === existingBuff.id
        ? { ...buff, amount: buff.amount + buffAmount, duration: 5 }
        : buff
    );
  } else {
    // Create new buff
    return [...currentBuffs, {
      id: `passive_id_${Date.now()}`,
      type: 'stat_boost',
      stat: 'statName',
      amount: buffAmount,
      duration: 5,
    }];
  }
}
```

**Checklist**:
- [ ] Passive effect logic added to `applyPassiveBuff()`
- [ ] Passive description added to `getPassiveDescription()`
- [ ] Export passive function if it creates buffs
- [ ] Buff logic handles stacking/refreshing correctly
- [ ] Duration and amounts balanced

---

### 3. Integrate Passive in Battle (if applicable)

**File**: `src/components/screens/Battle/Battle.tsx`

**Locations**:
- `handleAttack()` - For on-attack triggers
- `handleSpell()` - For on-spell triggers  
- `handleEnemyAttack()` - For on-hit taken triggers
- Turn effect useEffect - For turn-based triggers

**Template**:
```typescript
// Example: On-attack trigger
if (playerPassiveIds.includes('passive_id')) {
  const baseValue = playerChar.stats.attackDamage || 50;
  setPlayerBuffs((prev) => {
    const updatedBuffs = applyPassiveNameBuff(prev, baseValue);
    // Log if buff changed
    const oldBuff = prev.find((b) => b.id.startsWith('passive_id'));
    const newBuff = updatedBuffs.find((b) => b.id.startsWith('passive_id'));
    if (!oldBuff || (newBuff && newBuff.amount !== oldBuff.amount)) {
      logMessages.push({ message: `⚔️ Passive Name: Effect description!` });
    }
    return updatedBuffs;
  });
}
```

**Checklist**:
- [ ] Passive trigger added to appropriate handler
- [ ] Uses `playerPassiveIds.includes('passive_id')`
- [ ] Calls passive buff function correctly
- [ ] Battle log message added with appropriate emoji
- [ ] Only logs when buff actually changes

---

### 4. Add to Loot Tables

**File**: `src/game/items.ts`

**Function**: `getRandomLootByClass()`

**Template**:
```typescript
// Add to appropriate tier array
const tierItems: string[] = [
  'existing_item_1',
  'existing_item_2',
  'item_id', // Your new item
];
```

**Checklist**:
- [ ] Added to correct tier (minion/elite/champion/boss/legend)
- [ ] Added to correct class pool or 'all' if universal
- [ ] Drop weight considered (rarer items should appear less)

---

### 5. Add Visual Assets (optional)

**File**: `public/assets/items/item_id.png`

**Checklist**:
- [ ] Icon created (64x64px recommended)
- [ ] PNG format with transparency
- [ ] File named exactly as `item_id.png`
- [ ] Visually distinct from other items

---

### 6. Testing Checklist

- [ ] Item appears in loot drops
- [ ] Item stats apply correctly
- [ ] Passive triggers at right times
- [ ] Buff stacking works (if applicable)
- [ ] Battle log messages display
- [ ] No console errors
- [ ] Item description is clear
- [ ] Tooltips show correct information

---

## Adding New Characters

### 1. Define Character Data

**File**: `src/characters/database.ts`

**Location**: `CHARACTER_DATABASE` object

**Template**:
```typescript
character_id: {
  id: 'character_id',
  name: 'Character Name',
  title: 'The Title',
  universe: 'League of Legends' | 'Valorant' | 'Teamfight Tactics' | 'Arcane',
  class: 'Marksman' | 'Mage' | 'Fighter' | 'Tank' | 'Assassin' | 'Support',
  tier: 'minion' | 'elite' | 'champion' | 'boss' | 'legend',
  
  // Base stats at level 1
  stats: {
    health: 100,
    attackDamage: 50,
    abilityPower: 30,
    armor: 30,
    magicResist: 30,
    speed: 100,
    haste: 0,
    criticalChance: 0,
    criticalDamage: 200,
    lethality: 0,
    magicPenetration: 0,
    lifesteal: 0,
    omnivamp: 0,
    healingOnHit: 0,
    movementSpeed: 350,
    attackRange: 125, // Melee: 125, Ranged: 500+
    health_regen: 0,
  },
  
  // Abilities (optional for enemies)
  abilities: [
    {
      name: 'Ability Name',
      description: 'What it does',
      damage: 50,
      cooldown: 3,
      type: 'physical' | 'magic',
      range: 500,
    }
  ],
  
  // Description for character select
  description: 'Lore and playstyle description',
  
  // Unlock requirements (for playable characters)
  unlockRequirements?: {
    defeatedBosses?: string[],
    itemsCollected?: string[],
    regionsUnlocked?: string[],
  },
  
  // Starting items (for playable characters)
  startingItems?: ['item_id_1', 'item_id_2'],
}
```

**Checklist**:
- [ ] Character added to `CHARACTER_DATABASE`
- [ ] Unique `id` and display `name`
- [ ] Correct `universe` and `class`
- [ ] Appropriate `tier` for difficulty
- [ ] Base stats balanced for tier
- [ ] Attack range matches playstyle (melee/ranged)
- [ ] Abilities defined with damage/cooldown
- [ ] Description written
- [ ] Starting items set (for playable)
- [ ] Unlock requirements set (if locked)

---

### 2. Add to Enemy Pools (for enemies)

**File**: `src/game/questGenerator.ts`

**Function**: Enemy generation functions

**Template**:
```typescript
// For region-specific enemies
const enemyPool = [
  'existing_enemy_1',
  'existing_enemy_2',
  'character_id', // Your new enemy
];
```

**Checklist**:
- [ ] Added to appropriate region enemy pool
- [ ] Added to correct tier encounters
- [ ] Spawn weight considered

---

### 3. Add Visual Assets

**Files**:
- `public/assets/characters/character_id.png` - Portrait
- `public/assets/characters/character_id_splash.png` - Full art (optional)

**Checklist**:
- [ ] Portrait created (128x128px recommended)
- [ ] PNG format with transparency
- [ ] File named exactly as `character_id.png`
- [ ] Splash art created if playable character

---

### 4. Add to Character Select (for playable)

**File**: `src/components/screens/CharacterSelect.tsx`

**Checklist**:
- [ ] Character appears in selection grid
- [ ] Displays correctly with portrait
- [ ] Unlock status checked
- [ ] Starting items loaded correctly

---

### 5. Testing Checklist

- [ ] Character stats scale correctly with level
- [ ] Abilities function properly
- [ ] Visual assets load correctly
- [ ] Class bonuses apply
- [ ] Character spawns in correct regions/tiers
- [ ] No console errors

---

## Adding New Abilities/Passives

### 1. Define Ability Mechanics

**File**: `src/game/abilitySystem.ts` (create if doesn't exist)

**Template**:
```typescript
export interface Ability {
  id: string;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  type: 'physical' | 'magic' | 'true';
  range: number;
  effect?: {
    type: 'stun' | 'slow' | 'heal' | 'buff' | 'debuff';
    duration: number;
    amount?: number;
  };
}

export function executeAbility(
  ability: Ability,
  caster: Character,
  target: Character,
  casterStats: CharacterStats
): AbilityResult {
  // Calculate damage
  // Apply effects
  // Return result
}
```

**Checklist**:
- [ ] Ability interface defined
- [ ] Execute function implemented
- [ ] Damage calculation correct
- [ ] Effects applied properly
- [ ] Cooldown system integrated

---

### 2. Integrate into Battle

**File**: `src/components/screens/Battle/Battle.tsx`

**Function**: `handleAbility()`

**Checklist**:
- [ ] Ability button appears when available
- [ ] Cooldown tracked
- [ ] Damage/effects applied correctly
- [ ] Battle log updated
- [ ] Animation triggered (if applicable)

---

## Adding New Regions

### 1. Define Region Data

**File**: `src/game/regions.ts` (or create)

**Template**:
```typescript
export const REGION_DATA: Record<Region, RegionInfo> = {
  region_name: {
    id: 'region_name',
    displayName: 'Region Display Name',
    description: 'Lore and atmosphere description',
    difficulty: 1-5, // 1 = easiest
    
    // Enemy types that spawn here
    enemyTypes: ['enemy_id_1', 'enemy_id_2'],
    
    // Boss for this region
    bossId: 'boss_character_id',
    
    // Unique items that can drop
    uniqueItems: ['item_id_1', 'item_id_2'],
    
    // Unlock requirements
    unlockRequirements: {
      defeatedBosses?: string[],
      floorsCompleted?: number,
    },
    
    // Visual theme
    theme: {
      primaryColor: '#hexcolor',
      backgroundImage: 'path/to/bg.png',
    }
  }
}
```

**Checklist**:
- [ ] Region added to `REGION_DATA`
- [ ] Enemy pool defined
- [ ] Boss assigned
- [ ] Unique items specified
- [ ] Difficulty appropriate
- [ ] Unlock requirements set
- [ ] Theme colors chosen

---

### 2. Create Quest Generator

**File**: `src/game/questGenerator.ts`

**Function**: Add region-specific generation

**Checklist**:
- [ ] Quest generation function added
- [ ] Enemy spawning logic implemented
- [ ] Floor progression defined
- [ ] Boss encounter created

---

### 3. Add Visual Assets

**Files**:
- `public/assets/regions/region_name_bg.png` - Background
- `public/assets/regions/region_name_icon.png` - Map icon

**Checklist**:
- [ ] Background art created
- [ ] Icon created
- [ ] Files named correctly
- [ ] Theme consistent

---

## Adding New Game Mechanics

### 1. Define Mechanic System

**File**: `src/game/mechanicName.ts` (create new file)

**Template**:
```typescript
// Core interfaces
export interface MechanicData {
  // Define data structure
}

// Core functions
export function calculateMechanic(input: any): any {
  // Implementation
}

export function applyMechanic(
  character: Character,
  mechanic: MechanicData
): void {
  // Application logic
}
```

**Checklist**:
- [ ] New system file created
- [ ] Interfaces defined
- [ ] Core functions implemented
- [ ] Integration points identified
- [ ] Exported properly

---

### 2. Integrate into Game Loop

**Files to potentially update**:
- `src/game/store.ts` - If mechanic needs state
- `src/components/screens/Battle/Battle.tsx` - If affects combat
- `src/game/statsSystem.ts` - If affects stats
- `src/components/UI/` - If needs UI component

**Checklist**:
- [ ] State management added
- [ ] Game loop integration complete
- [ ] UI elements created
- [ ] Save/load support added

---

## Adding New Achievements

### 1. Define Achievement Data

**File**: `src/game/achievements.ts` (create if doesn't exist)

**Template**:
```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'progression' | 'collection' | 'exploration';
  
  // Unlock condition
  requirement: {
    type: 'kill_enemies' | 'collect_items' | 'reach_floor' | 'defeat_boss' | 'custom';
    target: number | string;
    current: number; // Progress tracker
  };
  
  // Rewards
  rewards: {
    gold?: number;
    items?: string[];
    unlockCharacter?: string;
    unlockRegion?: string;
  };
  
  // Display
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hidden: boolean; // Secret achievement
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  achievement_id: {
    // Achievement definition
  }
}
```

**Checklist**:
- [ ] Achievement defined
- [ ] Requirement logic clear
- [ ] Rewards specified
- [ ] Icon path set
- [ ] Hidden status set

---

### 2. Add Tracking

**File**: `src/game/achievementTracker.ts` (create if doesn't exist)

**Functions**:
```typescript
export function checkAchievement(
  achievementId: string,
  currentProgress: any
): boolean {
  // Check if unlocked
}

export function updateAchievementProgress(
  achievementId: string,
  progress: number
): void {
  // Update progress
}

export function unlockAchievement(achievementId: string): void {
  // Grant rewards
  // Show notification
}
```

**Checklist**:
- [ ] Check function implemented
- [ ] Update function implemented
- [ ] Unlock function implemented
- [ ] Integrated into relevant game events

---

## Integration Validation

After adding any content, validate:

### General Checklist
- [ ] No TypeScript compilation errors
- [ ] No runtime console errors
- [ ] Hot reload works correctly
- [ ] Content appears in game
- [ ] Save/load preserves content state
- [ ] Content balanced appropriately

### Performance Checklist
- [ ] No memory leaks
- [ ] No unnecessary re-renders
- [ ] Assets optimized
- [ ] Loading times acceptable

### UX Checklist
- [ ] Tooltips display correctly
- [ ] Visual feedback present
- [ ] Animations smooth
- [ ] Text readable
- [ ] Icons clear

---

## Quick Reference: File Index

### Core Game Logic
- `src/game/items.ts` - Item database and loot
- `src/game/itemSystem.ts` - Item effects and passives
- `src/game/statsSystem.ts` - Stat calculations
- `src/game/store.ts` - Global state management
- `src/game/experienceSystem.ts` - Level/XP
- `src/game/battleFlow.ts` - Victory/defeat logic

### Character System
- `src/characters/database.ts` - All characters
- `src/game/questGenerator.ts` - Enemy spawning

### Battle System
- `src/components/screens/Battle/Battle.tsx` - Main battle logic
- `src/components/screens/Battle/TurnTimeline.tsx` - Turn order
- `src/components/screens/Battle/BattleSummary.tsx` - Post-battle UI
- `src/game/turnSystemV2.ts` - Turn calculation
- `src/game/onHitEffects.ts` - On-hit mechanics

### UI Components
- `src/components/screens/CharacterSelect.tsx` - Character selection
- `src/components/screens/Explore.tsx` - Map/exploration
- `src/components/entity/CharacterStatus.tsx` - HP/status display

### Assets
- `public/assets/items/` - Item icons
- `public/assets/characters/` - Character portraits
- `public/assets/regions/` - Region backgrounds

---

## Missing Information Template

When information is missing, request in this format:

```
❓ Missing Information for [Content Name]
Type: [Item/Character/Mechanic/etc]

Needed:
1. [ ] Specific detail 1
2. [ ] Specific detail 2
3. [ ] Specific detail 3

Purpose: [Why this information is needed]
Impact: [What can't be completed without it]
```

---

## AI Assistant Notes

### Best Practices for Reading This Guide
1. Always check ALL sections relevant to the content type
2. Follow checklists in order
3. Verify each file location before editing
4. Test after each major integration point
5. Request missing info using the template above

### Common Pitfalls to Avoid
- Don't skip checklist items
- Don't assume file structures - always verify paths
- Don't forget to export new functions
- Don't mix similar IDs (item vs passive vs character)
- Always add TypeScript types for new data structures

### When in Doubt
1. Search existing similar content as reference
2. Check file imports/exports
3. Look for TypeScript errors first
4. Test incrementally
5. Ask user for clarification with specific questions
