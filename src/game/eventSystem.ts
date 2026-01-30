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

import { GameEvent } from './events/eventTypes';
import { RUNETERRA_EVENTS } from './regions/runeterra/events';
import { IONIA_EVENTS } from './regions/ionia/events';
import { PILTOVER_EVENTS } from './regions/piltover/events';
import { NOXUS_EVENTS } from './regions/noxus/events';
import { DEMACIA_EVENTS } from './regions/demacia/events';
import { SHADOW_ISLES_EVENTS } from './regions/shadow_isles/events';
import { FRELJORD_EVENTS } from './regions/freljord/events';
import { TARGON_EVENTS } from './regions/targon/events';
import { CAMAVOR_EVENTS } from './regions/camavor/events';
import { BANDLE_CITY_EVENTS } from './regions/bandle_city/events';
import { BILGEWATER_EVENTS } from './regions/bilgewater/events';
import { IXTAL_EVENTS } from './regions/ixtal/events';
import { VOID_EVENTS } from './regions/void/events';
import { ZAUN_EVENTS } from './regions/zaun/events';
import { ICE_SEA_EVENTS } from './regions/ice_sea/events';
import { MARAI_TERRITORY_EVENTS } from './regions/marai_territory/events';
import { SHURIMA_EVENTS } from './regions/shurima/events';

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
