import { Region } from './types';

/**
 * Region traversal system for the roguelike campaign
 * Each act consists of traversing regions until reaching an ending region
 */

export type StartingRegion = 'demacia' | 'ionia' | 'shurima';
export type EndingRegion = 'shadow_isles' | 'void' | 'targon';
export type IntermediateRegion = 'noxus' | 'freljord' | 'zaun' | 'ixtal' | 'bandle_city' | 'bilgewater' | 'piltover';

export interface RegionConnection {
  from: Region;
  to: Region[];
}

/**
 * Region graph defining all possible one-way connections
 * Each path can only be used once per act
 */
export const REGION_GRAPH: Record<Region, Region[]> = {
  // Starting regions
  demacia: ['noxus', 'freljord'],
  ionia: ['bandle_city', 'bilgewater'],
  shurima: ['ixtal', 'zaun'],
  
  // Intermediate regions
  noxus: ['freljord', 'piltover'],
  freljord: ['targon', 'zaun'],
  zaun: ['ixtal', 'piltover'],
  ixtal: ['void', 'bandle_city'],
  bandle_city: ['piltover', 'bilgewater'],
  bilgewater: ['shadow_isles', 'noxus'],
  
  // Special region - Piltover teleports back to starting regions
  piltover: ['demacia', 'ionia', 'shurima'],
  
  // Ending regions - start next act
  shadow_isles: ['ionia', 'demacia'],
  void: ['shurima', 'ionia'],
  targon: ['demacia', 'shurima'],
  
  // Special event-only region
  camavor: [],
};

/**
 * Check if a region is a starting region
 */
export function isStartingRegion(region: Region): region is StartingRegion {
  return region === 'demacia' || region === 'ionia' || region === 'shurima';
}

/**
 * Check if a region is an ending region (completes an act)
 */
export function isEndingRegion(region: Region): region is EndingRegion {
  return region === 'shadow_isles' || region === 'void' || region === 'targon';
}

/**
 * Check if a region is Piltover (special teleport region)
 */
export function isPiltover(region: Region): boolean {
  return region === 'piltover';
}

/**
 * Get available destinations from current region
 * Filters out paths that have already been used in this act
 * Filters out original starting region from Piltover destinations
 */
export function getAvailableDestinations(
  currentRegion: Region,
  usedPaths: string[],
  originalStartingRegion: Region,
  piltoverVisits: number
): Region[] {
  const possibleDestinations = REGION_GRAPH[currentRegion] || [];
  
  // Filter out used paths
  const availableDestinations = possibleDestinations.filter(destination => {
    const pathKey = `${currentRegion}→${destination}`;
    return !usedPaths.includes(pathKey);
  });
  
  // Special Piltover handling
  if (currentRegion === 'piltover') {
    // After 3rd visit, can only go to original starting region
    if (piltoverVisits >= 3) {
      return [originalStartingRegion];
    }
    // Otherwise, cannot go to original starting region
    return availableDestinations.filter(dest => dest !== originalStartingRegion);
  }
  
  return availableDestinations;
}

/**
 * Create a path key for tracking used paths
 */
export function createPathKey(from: Region, to: Region): string {
  return `${from}→${to}`;
}

/**
 * Get the display name for a region
 */
export function getRegionDisplayName(region: Region): string {
  const names: Record<Region, string> = {
    demacia: 'Demacia',
    ionia: 'Ionia',
    shurima: 'Shurima',
    noxus: 'Noxus',
    freljord: 'Freljord',
    zaun: 'Zaun',
    ixtal: 'Ixtal',
    bandle_city: 'Bandle City',
    bilgewater: 'Bilgewater',
    piltover: 'Piltover',
    shadow_isles: 'Shadow Isles',
    void: 'The Void',
    targon: 'Mount Targon',
    camavor: 'Camavor',
  };
  return names[region] || region;
}

/**
 * Get region description
 */
export function getRegionDescription(region: Region): string {
  const descriptions: Record<Region, string> = {
    demacia: 'A strong, lawful kingdom with a prestigious military.',
    ionia: 'A land of natural magic and spirituality.',
    shurima: 'A vast desert empire of ancient power.',
    noxus: 'A brutal expansionist empire.',
    freljord: 'A harsh, frozen tundra of warring tribes.',
    zaun: 'The undercity of chemtech and experimentation.',
    ixtal: 'A jungle nation of elemental magic.',
    bandle_city: 'A whimsical yordle haven.',
    bilgewater: 'A lawless port city of pirates.',
    piltover: 'The City of Progress - Teleports you elsewhere!',
    shadow_isles: 'A cursed land of undeath. (Ends Act)',
    void: 'An unknowable dimension of horror. (Ends Act)',
    targon: 'A mystical mountain realm. (Ends Act)',
    camavor: 'A cursed kingdom of ruin and shadow. (Special Event)',
  };
  return descriptions[region] || '';
}
