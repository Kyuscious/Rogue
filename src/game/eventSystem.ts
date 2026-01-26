import { Region } from './types';

export interface RegionEvent {
  id: string;
  name: string;
  description: string;
  flavor: string;
  type: 'treasure' | 'encounter' | 'relic' | 'quest' | 'mystery';
  region: Region;
  
  // Potential outcomes/effects
  rewardType?: 'gold' | 'items' | 'stats' | 'curse' | 'buff' | 'mixed';
  goldReward?: number;
  itemRewards?: string[];
  statModifiers?: {
    health?: number;
    attackDamage?: number;
    abilityPower?: number;
    armor?: number;
    magicResist?: number;
  };
  
  // For special encounters
  enemyId?: string;
  
  // Flavor text for outcome
  successText?: string;
  failureText?: string;
}

export interface EventOutcome {
  eventId: string;
  succeeded: boolean;
  goldGained: number;
  itemsGained: string[];
  statsModified: boolean;
}

export const REGION_EVENTS: Record<Region, RegionEvent[]> = {
  demacia: [],
  ionia: [],
  shurima: [],
  noxus: [],
  freljord: [],
  zaun: [],
  ixtal: [],
  bandle_city: [],
  bilgewater: [],
  piltover: [],
  shadow_isles: [],
  void: [],
  targon: [],
  camavor: [],
  ice_sea: [],
  marai_territory: [],
  runeterra: [],
};

export function getRandomEventForRegion(region: Region): RegionEvent | undefined {
  const events = REGION_EVENTS[region] || [];
  if (events.length === 0) return undefined;
  return events[Math.floor(Math.random() * events.length)];
}

export function hasRegionEvents(region: Region): boolean {
  const events = REGION_EVENTS[region] || [];
  return events.length > 0;
}

export function registerRegionEvents(region: Region, events: RegionEvent[]): void {
  REGION_EVENTS[region] = events;
}
