/**
 * Event System Utilities
 * Functions for managing events: selecting, filtering, randomizing
 */

import { GameEvent } from './events/eventTypes';
import { RUNETERRA_EVENTS } from './events/runetterraEvents';
import { IONIA_EVENTS } from './regions/ionia/events';
import { PILTOVER_EVENTS } from './regions/piltover/events';
import { NOXUS_EVENTS } from './regions/noxus/events';
import { DEMACIA_EVENTS } from './regions/demacia/events';
import { SHADOW_ISLES_EVENTS } from './regions/shadow_isles/events';
import { FRELJORD_EVENTS } from './regions/freljord/events';
import { TARGON_EVENTS } from './regions/targon/events';

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
};

/**
 * Get all events available for a region
 * Includes: region-specific events + Runeterra events (accessible everywhere)
 */
export function getAllEventsForRegion(region: string): GameEvent[] {
  const regionEvents = REGION_EVENTS[region.toLowerCase()] || [];
  // Combine region-specific events with Runeterra events
  return [...regionEvents, ...RUNETERRA_EVENTS];
}

/**
 * Get a random subset of available events
 * If more events are available than maxOffers, randomly select maxOffers
 */
export function getOfferedEvents(region: string, maxOffers: number = 3): GameEvent[] {
  const available = getAllEventsForRegion(region);

  if (available.length <= maxOffers) {
    return available;
  }

  // Randomly select maxOffers events
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxOffers);
}

/**
 * Get a single random event for a region
 */
export function getRandomEventForRegion(region: string): GameEvent | null {
  const available = getAllEventsForRegion(region);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
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
