# Profile Unlockables System

## Overview
The profile unlockables system tracks what content each player profile has unlocked based on their progression. It's designed to be easily exportable for future remote sync capabilities.

## File Location
`src/game/profileUnlocks.ts`

## Architecture

### Key Features
- ✅ Centralized unlock tracking per profile
- ✅ Flexible requirement types (battles won, regions visited, etc.)
- ✅ Progress tracking for locked items
- ✅ Export/import functionality for remote sync (future)
- ✅ Easily extensible for new unlockables

### Data Structure

```typescript
interface UnlockableItem {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: 'starter_item' | 'character' | 'feature';
  requirement: UnlockRequirement;
  isUnlocked: (stats) => boolean;    // Check function
  getProgress: (stats) => { current, required }; // Progress tracker
}
```

## Adding New Unlockables

### 1. Starter Items

Add to the `UNLOCKABLES` object in `profileUnlocks.ts`:

```typescript
your_item_id: {
  id: 'your_item_id',
  name: 'Your Item Name',
  category: 'starter_item',
  requirement: {
    type: 'battles_won',
    value: 25,
    description: 'Win 25 battles',
  },
  isUnlocked: (stats) => (stats.battlesWon || 0) >= 25,
  getProgress: (stats) => ({ 
    current: stats.battlesWon || 0, 
    required: 25 
  }),
},
```

### 2. Requirement Types

Currently supported:
- `battles_won` - Number of battles won
- `regions_visited` - Number of unique regions visited
- `items_discovered` - Number of unique items discovered
- `games_completed` - Number of complete game runs

### 3. Example: Complex Requirement

```typescript
special_item: {
  id: 'special_item',
  name: 'Special Item',
  category: 'starter_item',
  requirement: {
    type: 'battles_won',
    value: 50,
    description: 'Win 50 battles AND visit 10 regions',
  },
  isUnlocked: (stats) => 
    (stats.battlesWon || 0) >= 50 && 
    (stats.visitedRegions?.length || 0) >= 10,
  getProgress: (stats) => {
    const battlesProgress = Math.min((stats.battlesWon || 0) / 50, 1);
    const regionsProgress = Math.min((stats.visitedRegions?.length || 0) / 10, 1);
    const totalProgress = (battlesProgress + regionsProgress) / 2;
    return { 
      current: Math.floor(totalProgress * 100), 
      required: 100 
    };
  },
},
```

## Usage in Components

### Check if Item is Unlocked
```typescript
import { isItemUnlocked } from '../../../game/profileUnlocks';

const unlocked = isItemUnlocked('cull');
```

### Get Unlock Progress
```typescript
import { getUnlockProgress } from '../../../game/profileUnlocks';

const progress = getUnlockProgress('cull');
// Returns: { current: 5, required: 10 }
```

### Get All Starter Items with Status
```typescript
import { getStarterItemsWithUnlockStatus } from '../../../game/profileUnlocks';

const items = getStarterItemsWithUnlockStatus();
// Returns array of items with unlock status and progress
```

## Remote Sync (Future Implementation)

### Export Profile Data
```typescript
import { exportProfileUnlocks } from '../../../game/profileUnlocks';

const data = exportProfileUnlocks(profileId);
// Send `data` to your backend API
```

### Import Profile Data
```typescript
import { importProfileUnlocks } from '../../../game/profileUnlocks';

// Receive `data` from your backend API
importProfileUnlocks(data);
// Automatically merges with local data, taking higher values
```

### Export Format
```json
{
  "profileId": 1,
  "profileName": "Player 1",
  "stats": {
    "battlesWon": 25,
    "gamesCompleted": 2,
    "visitedRegions": ["demacia", "ionia"],
    // ... all stats
  },
  "unlockedItems": ["dorans_blade", "dorans_shield", "cull"],
  "exportedAt": 1705449600000,
  "version": "1.0.0"
}
```

## Current Unlockables

| Item | Requirement | Progress Metric |
|------|-------------|-----------------|
| Doran's Blade | None (starter) | - |
| Doran's Shield | None (starter) | - |
| Doran's Ring | None (starter) | - |
| **Cull** | **10 Battles Won** | `battlesWon / 10` |
| World Atlas | 14 Regions Visited | `visitedRegions.length / 14` |

## Best Practices

1. **Use Profile Stats**: Always base unlocks on `ProfileStats` tracked in `profileSystem.ts`
2. **Clear Requirements**: Make requirement descriptions user-friendly
3. **Fallback Values**: Always use `|| 0` or `?.length || 0` for safety
4. **Test Unlocks**: Verify unlock logic with both new and existing profiles
5. **Version Control**: Update export version when changing data structure

## Adding New Requirement Types

If you need a new requirement type (e.g., `enemies_killed`, `gold_earned`):

1. Add stat tracking to `ProfileStats` in `profileSystem.ts`
2. Add increment function in `profileSystem.ts`
3. Add new type to `UnlockRequirement['type']` union
4. Create unlockable entry using the new type
5. Update this README

## Migration Guide

When existing profiles load, they'll have default values:
- Missing stats default to `0`
- Missing arrays default to `[]`
- This ensures backward compatibility
