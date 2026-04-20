/**
 * Event System Utilities
 * Functions for managing events: selecting, filtering, randomizing with weighted probability
 * 
 * EVENT WEIGHT SYSTEM:
 * - Events have a "weight" property (0-100, default 1.0) that affects probability of selection
 * - Higher weight = higher probability of appearing in offered events
 * - Regional events default to weight 1.0 (normal probability)
 * - Runeterra events default to weight 0.2-0.5 (rare, universal events)
 * 
 * ITEM MODIFICATION SYSTEM (Future Implementation):
 * Items can modify event weights to increase chances of certain event types appearing:
 * - Example: "Tome of Fortune" → multiplies treasure event weight by 2.0
 * - Example: "Cursed Amulet" → multiplies curse event weight by 3.0
 * - Example: "Wanderer's Compass" → multiplies Runeterra event weight by 2.0
 * 
 * Usage: useGameStore.getState().modifyEventWeight(eventId, multiplier)
 * Or: useGameStore.getState().modifyEventTypeWeight('treasure', 1.5)
 * Or: useGameStore.getState().modifyRunetterraEventWeight(2.0)
 * 
 * WEIGHTED RANDOM SELECTION:
 * getOfferedEvents() uses weighted random selection to pick events based on their weights.
 * This creates a more controlled RNG system similar to enemy rarity drops.
 */

import { GameEvent } from './eventTypes';
import {
  RUNETERRA_EVENTS,
  IONIA_EVENTS,
  PILTOVER_EVENTS,
  NOXUS_EVENTS,
  DEMACIA_EVENTS,
  SHADOW_ISLES_EVENTS,
  FRELJORD_EVENTS,
  TARGON_EVENTS,
  CAMAVOR_EVENTS,
  BANDLE_CITY_EVENTS,
  BILGEWATER_EVENTS,
  IXTAL_EVENTS,
  VOID_EVENTS,
  ZAUN_EVENTS,
  ICE_SEA_EVENTS,
  MARAI_TERRITORY_EVENTS,
  SHURIMA_EVENTS,
} from '../../../shared/regions';

/**
 * Map regions to their event pools
 */
const REGION_EVENTS: Record<string, GameEvent[]> = {
  ionia: IONIA_EVENTS,
  piltover: PILTOVER_EVENTS,
  noxus: NOXUS_EVENTS,
  demacia: DEMACIA_EVENTS,
  shadow_isles: SHADOW_ISLES_EVENTS,
  freljord: FRELJORD_EVENTS,
  targon: TARGON_EVENTS,
  camavor: CAMAVOR_EVENTS,
  bandle_city: BANDLE_CITY_EVENTS,
  bilgewater: BILGEWATER_EVENTS,
  ixtal: IXTAL_EVENTS,
  void: VOID_EVENTS,
  zaun: ZAUN_EVENTS,
  ice_sea: ICE_SEA_EVENTS,
  marai_territory: MARAI_TERRITORY_EVENTS,
  shurima: SHURIMA_EVENTS,
};

/**
 * Get weight of an event (default 1.0 for normal probability)
 * Weight system allows items/buffs to make certain events appear more frequently
 */
function getEventWeight(event: GameEvent): number {
  return event.weight ?? 1.0;
}

/**
 * Weighted random selection from an array of items
 * Higher weight = higher probability of selection
 */
function weightedRandomSelection<T extends { weight?: number }>(items: T[], count: number): T[] {
  if (items.length <= count) return items;

  const result: T[] = [];
  const available = [...items];

  for (let i = 0; i < count && available.length > 0; i++) {
    // Calculate total weight
    const totalWeight = available.reduce((sum, item) => sum + getEventWeight(item as any), 0);

    // Generate weighted random selection
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < available.length; j++) {
      random -= getEventWeight(available[j] as any);
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    result.push(available[selectedIndex]);
    available.splice(selectedIndex, 1);
  }

  return result;
}

/**
 * Get all events available for a region
 * Includes: region-specific events + Runeterra events (accessible everywhere, lower weight)
 */
export function getAllEventsForRegion(region: string): GameEvent[] {
  const regionEvents = REGION_EVENTS[region.toLowerCase()] || [];
  // Combine region-specific events with Runeterra events
  return [...regionEvents, ...RUNETERRA_EVENTS];
}

/**
 * Get a random subset of available events using weighted probability
 * Region events have higher default weight than Runeterra events
 * If more events are available than maxOffers, selects using weighted randomization
 */
export function getOfferedEvents(region: string, maxOffers: number = 3): GameEvent[] {
  const available = getAllEventsForRegion(region);

  if (available.length <= maxOffers) {
    return available;
  }

  // Use weighted random selection based on event weights
  return weightedRandomSelection(available, maxOffers);
}

/**
 * Get a single random event for a region using weighted probability
 */
export function getRandomEventForRegion(region: string): GameEvent | null {
  const available = getAllEventsForRegion(region);
  if (available.length === 0) return null;

  // Weighted random selection for single event
  const [event] = weightedRandomSelection(available, 1);
  return event;
}

/**
 * Get event by ID
 */
export function getEventById(eventId: string): GameEvent | null {
  const allRegions = Object.values(REGION_EVENTS);
  for (const regionEvents of allRegions) {
    const event = regionEvents.find(e => e.id === eventId);
    if (event) return event;
  }
  // Check Runeterra events
  return RUNETERRA_EVENTS.find(e => e.id === eventId) || null;
}

/**
 * Check if a region has any events
 */
export function hasRegionEvents(region: string): boolean {
  return getAllEventsForRegion(region).length > 0;
}

/**
 * Get event icon (emoji)
 */
export function getEventIcon(event: GameEvent): string {
  return event.icon || '✨';
}

/**
 * Get event type label
 */
export function getEventTypeLabel(type: GameEvent['type']): string {
  const labels: Record<string, string> = {
    encounter: '⚔️ Combat',
    visual_novel: '📖 Choice',
    mini_game: '🎮 Challenge',
    treasure: '💎 Treasure',
    curse: '🔮 Curse',
    dialogue: '💬 Dialogue',
  };
  return labels[type] || type;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: GameEvent['rarity']): string {
  const colors: Record<string, string> = {
    common: '#b0b0b0',
    rare: '#4a90e2',
    epic: '#a855f7',
    legendary: '#fbbf24',
  };
  return colors[rarity] || '#ffffff';
}

/**
 * Get rarity badge
 */
export function getRarityBadge(rarity: GameEvent['rarity']): string {
  const badges: Record<string, string> = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  };
  return badges[rarity] || rarity;
}
