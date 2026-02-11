# Event Weight System Documentation

**STATUS:** ✅ DONE - Weighted event system implemented  
**LAST UPDATED:** February 10, 2026

## Overview

The Event Weight System is a probability-based mechanism for controlling which events players encounter. It works similarly to the enemy rarity system, allowing for weighted random selection where certain events can be more or less common based on their weight value.

## Core Concept

- **Weight**: A multiplier (0-100, default 1.0) that determines an event's probability of appearing
- **Higher weight** = higher chance to appear in the offered event pool
- **Lower weight** = lower chance to appear, can be used for rare universal events

## Event Weight Values

### Regional Events (Default)
- **Default weight: 1.0** (normal probability)
- Events from the current region have equal baseline probability
- Examples: Ionia Events, Demacia Events, Noxus Events

### Runeterra Events (Universal)
- **Default weight: 0.2-0.5** (rare)
- These events are accessible from ALL regions
- Lower weight makes them special/uncommon encounters
- Represent fundamental forces and mysteries of Runeterra
- Possible events:
  - Ancient Ruin (weight 0.5)
  - Wandering Scholar (weight 0.5)
  - Treasure Hoard (weight 0.3)
  - Mysterious Fog (weight 0.4)
  - Fortune Teller (weight 0.2)

## How Weighted Selection Works

When `getOfferedEvents(region, maxOffers)` is called:

1. Collects all regional events + Runeterra events
2. Calculates cumulative weights for all available events
3. Performs weighted random selection without replacement
4. Returns `maxOffers` events based on their weight probabilities

**Example:**
```
Regional Events Pool: 5 events (weight 1.0 each) = 5.0 total
Runeterra Events Pool: 5 events (weights 0.2-0.5) = 1.9 total

Total pool weight: 6.9

Probability of selecting each event:
- Regional event A: 1.0 / 6.9 = 14.5%
- Regional event B: 1.0 / 6.9 = 14.5%
- Fortune Teller: 0.2 / 6.9 = 2.9%
- Ancient Ruin: 0.5 / 6.9 = 7.2%
```

## Implementation Details

### Files Modified

1. **src/game/events/eventTypes.ts**
   - Added `weight?: number` property to `GameEvent` interface
   - Documentation notes for item modification system

2. **src/game/regions/runeterra/events.ts**
   - Created with 5 universal events
   - Each event has a weight property (0.2-0.5)
   - Accessible from any region

3. **src/game/eventSystem.ts**
   - Implemented `weightedRandomSelection()` algorithm
   - Updated `getOfferedEvents()` to use weighted selection
   - Updated `getRandomEventForRegion()` to use weighted selection
   - Added comprehensive documentation

4. **src/game/store.ts**
   - Added `eventWeightModifiers` to GameState (Event ID → multiplier)
   - Added `globalEventWeightModifier` (affects all events)
   - Added weight modification methods:
     - `modifyEventWeight(eventId, multiplier)` - Modify specific event
     - `modifyEventTypeWeight(eventType, multiplier)` - Modify event type
     - `modifyRunetterraEventWeight(multiplier)` - Modify Runeterra events
     - `setGlobalEventWeightModifier(multiplier)` - Global multiplier
     - `getEventWeightMultiplier(eventId)` - Query current multiplier
     - `resetEventWeights()` - Reset to defaults

## Future: Item Integration

Items can modify event weights to create interesting build synergies:

### Example Items (to be implemented)

**Tome of Fortune** (Rare Item)
```typescript
{
  id: 'tome_of_fortune',
  name: 'Tome of Fortune',
  description: 'Treasure events appear 2x more frequently',
  onAcquire: () => {
    useGameStore.getState().modifyEventTypeWeight('treasure', 2.0);
  }
}
```

**Cursed Amulet** (Epic Item)
```typescript
{
  id: 'cursed_amulet',
  name: 'Cursed Amulet',
  description: 'Curse events appear 3x more frequently',
  onAcquire: () => {
    useGameStore.getState().modifyEventTypeWeight('curse', 3.0);
  }
}
```

**Wanderer's Compass** (Rare Item)
```typescript
{
  id: 'wanderers_compass',
  name: "Wanderer's Compass",
  description: 'Runeterra events appear 2x more frequently',
  onAcquire: () => {
    useGameStore.getState().modifyRunetterraEventWeight(2.0);
  }
}
```

**Scholarly Mind** (Rare Item)
```typescript
{
  id: 'scholarly_mind',
  name: 'Scholarly Mind',
  description: 'Encounter events 1.5x more frequently',
  onAcquire: () => {
    useGameStore.getState().modifyEventTypeWeight('encounter', 1.5);
  }
}
```

## Event Types

Events are categorized by type, allowing for type-based weight modification:

- `encounter` - Combat events
- `visual_novel` - Choice-based narrative events
- `mini_game` - Skill-based challenge events
- `treasure` - Reward/treasure events
- `curse` - Negative/curse events
- `dialogue` - Conversation/dialogue events

## Rarity Tiers

Events have rarity levels:
- `common` - Basic events
- `rare` - Uncommon events
- `epic` - Very rare events
- `legendary` - Extremely rare events

(Note: Rarity affects presentation, weight affects probability)

## API Usage

### Getting Events with Weights

```typescript
import { getOfferedEvents, getAllEventsForRegion } from './game/eventSystem';

// Get 3 offered events for a region (with weighted selection)
const offeredEvents = getOfferedEvents('demacia', 3);

// Get all available events for a region
const allEvents = getAllEventsForRegion('ionia');
```

### Modifying Event Weights

```typescript
import { useGameStore } from './game/store';

const store = useGameStore.getState();

// Modify a specific event's weight
store.modifyEventWeight('runeterra_fortune_teller', 2.0);

// Modify all events of a type
store.modifyEventTypeWeight('treasure', 1.5);

// Modify all Runeterra events
store.modifyRunetterraEventWeight(2.0);

// Set global multiplier for all events
store.setGlobalEventWeightModifier(1.5);

// Get current multiplier for an event
const multiplier = store.getEventWeightMultiplier('runeterra_fortune_teller');

// Reset all modifications
store.resetEventWeights();
```

## Design Rationale

### Why Weight System?

1. **Player Agency**: Items can modify which events appear, creating build diversity
2. **Rarity Feeling**: Universal events feel special because they're less common
3. **Balance**: Regional events remain the primary source, Runeterra adds mystery
4. **Extensibility**: Easy to add more events or weight modifiers later

### Why Runeterra Events Accessible Everywhere?

1. **Cohesive World**: Runeterra events represent universal forces, not specific regions
2. **Discovery**: Players can encounter them anywhere, rewarding exploration
3. **Low Probability**: Their lower weights prevent them from overshadowing regional events
4. **Item Synergy**: Allows items to create "universal event builds" vs "regional builds"

## Future Enhancements

1. **Negative Weights**: Items that reduce event weight (avoid certain events)
2. **Time-based Weights**: Event weights that change over run progression
3. **Build-based Weights**: Weights that change based on player class/stats
4. **Event Chains**: Events that modify weights of related events
5. **Difficulty Scaling**: Weights adjust based on difficulty settings
6. **Achievement Bonuses**: Unlock weight modifiers by completing achievements

## Testing

To verify the weight system is working:

1. Run the dev server: `npm run dev`
2. Select a region and complete an encounter
3. On the Event Screen, note which events appear
4. Repeat multiple times - you should see:
   - Regional events appearing frequently
   - Runeterra events appearing occasionally (lower probability)
5. Use console to modify weights:
   ```javascript
   useGameStore.getState().modifyRunetterraEventWeight(5.0);
   // Now Runeterra events should appear much more frequently
   ```

## Implementation Checklist

- ✅ Weight property added to GameEvent interface
- ✅ Runeterra events created with weight properties
- ✅ Weighted random selection algorithm implemented
- ✅ getOfferedEvents() updated to use weighted selection
- ✅ Store methods for weight modification added
- ✅ Documentation completed
- ⏳ Item integration (future)
- ⏳ Event weight UI display (future)
- ⏳ Analytics/telemetry for event weight usage (future)
