/**
 * Starter Equipment System
 * Maps regions to their starting weapons, spells, and items
 */

import { Region } from './types';

export interface StarterEquipment {
  weapon: string; // Weapon ID
  spell: string; // Spell ID  
  items: string[]; // Item IDs (empty for now)
}

/**
 * Mapping of regions to their starter equipment
 */
export const REGION_STARTER_EQUIPMENT: Record<Region, StarterEquipment> = {
  // STARTING REGIONS
  demacia: {
    weapon: 'demacian_steel_blade', // +10 MR, +5 AD
    spell: 'for_demacia', // +5% AD, +0.5 AS for 1 turn
    items: [], // No starting items
  },
  ionia: {
    weapon: 'spirit_tree_bow', // +375 Range, +30 MS
    spell: 'rejuvenation', // Heals 20 + 20% AP
    items: [], // No starting items
  },
  shurima: {
    weapon: 'glyphed_bronze_spear', // +0.2 AS, +100 Range
    spell: 'quicksand', // Damage + 10% MS slow for 3 turns
    items: [], // No starting items
  },
  
  // OTHER REGIONS (no starter equipment)
  noxus: {
    weapon: '',
    spell: '',
    items: [],
  },
  freljord: {
    weapon: '',
    spell: '',
    items: [],
  },
  zaun: {
    weapon: '',
    spell: '',
    items: [],
  },
  ixtal: {
    weapon: '',
    spell: '',
    items: [],
  },
  bandle_city: {
    weapon: '',
    spell: '',
    items: [],
  },
  bilgewater: {
    weapon: '',
    spell: '',
    items: [],
  },
  piltover: {
    weapon: '',
    spell: '',
    items: [],
  },
  shadow_isles: {
    weapon: '',
    spell: '',
    items: [],
  },
  void: {
    weapon: '',
    spell: '',
    items: [],
  },
  targon: {
    weapon: '',
    spell: '',
    items: [],
  },
  camavor: {
    weapon: '',
    spell: '',
    items: [],
  },
  ice_sea: {
    weapon: '',
    spell: '',
    items: [],
  },
  marai_territory: {
    weapon: '',
    spell: '',
    items: [],
  },
  runeterra: {
    weapon: '',
    spell: '',
    items: [],
  },
  
};

/**
 * Get starter equipment for a region
 */
export function getStarterEquipment(region: Region): StarterEquipment {
  return REGION_STARTER_EQUIPMENT[region];
}

/**
 * Check if a region has starter equipment
 */
export function hasStarterEquipment(region: Region): boolean {
  const equipment = REGION_STARTER_EQUIPMENT[region];
  return !!equipment.weapon || !!equipment.spell || equipment.items.length > 0;
}

/**
 * Get all starting regions (regions with starter equipment)
 */
export function getStartingRegions(): Region[] {
  return Object.entries(REGION_STARTER_EQUIPMENT)
    .filter(([_, equipment]) => !!equipment.weapon || !!equipment.spell || equipment.items.length > 0)
    .map(([region, _]) => region as Region);
}
