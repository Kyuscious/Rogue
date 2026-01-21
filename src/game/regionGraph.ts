import { Region } from './types';

/**
 * Region traversal system for the roguelike campaign
 * Each act consists of traversing regions until reaching an ending region
 */

export type StartingRegion = 'demacia' | 'ionia' | 'shurima';
export type EndingRegion = 'shadow_isles' | 'void' | 'targon';
export type IntermediateRegion = 'noxus' | 'freljord' | 'zaun' | 'ixtal' | 'bandle_city' | 'bilgewater' | 'piltover';

export type RegionTier = 'starting' | 'standard' | 'advanced' | 'hard' | 'travelling';

export interface RegionConnection {
  from: Region;
  to: Region[];
}

/**
 * Get the difficulty tier of a region for scaling purposes
 */
export function getRegionTier(region: Region): RegionTier {
  const startingRegions: Region[] = ['demacia', 'ionia', 'shurima'];
  const standardRegions: Region[] = ['piltover', 'noxus', 'zaun', 'ixtal'];
  const advancedRegions: Region[] = ['bilgewater', 'bandle_city', 'freljord'];
  const hardRegions: Region[] = ['void', 'targon', 'shadow_isles'];
  const travellingRegions: Region[] = ['ice_sea', 'marai', 'camavor'];
  
  if (startingRegions.includes(region)) return 'starting';
  if (standardRegions.includes(region)) return 'standard';
  if (advancedRegions.includes(region)) return 'advanced';
  if (hardRegions.includes(region)) return 'hard';
  if (travellingRegions.includes(region)) return 'travelling';
  
  return 'standard'; // Default fallback
}

/**
 * Region graph defining all possible connections
 * Players cannot backtrack to the region they just came from
 */
export const REGION_GRAPH: Record<Region, Region[]> = {
  // Starting regions
  demacia: ['freljord', 'noxus'],
  ionia: ['ixtal', 'bilgewater'],
  shurima: ['zaun', 'bandle_city'],
  
  // Standard regions
  piltover: ['noxus', 'ionia', 'ixtal', 'shurima', 'zaun', 'demacia'],
  noxus: ['ionia', 'demacia', 'freljord', 'piltover'],
  zaun: ['shurima', 'demacia', 'bandle_city', 'piltover'],
  ixtal: ['ionia', 'shurima', 'piltover', 'bilgewater'],
  
  // Advanced regions
  bilgewater: ['shadow_isles', 'ixtal', 'ionia'],
  bandle_city: ['targon', 'shurima', 'zaun'],
  freljord: ['void', 'noxus', 'demacia'],
  
  // Hard regions
  void: ['ice_sea'],
  targon: ['marai'],
  shadow_isles: ['camavor'],
  
  // Travelling regions
  ice_sea: ['freljord', 'marai', 'ionia', 'demacia', 'camavor'],
  camavor: ['ice_sea', 'ionia', 'bilgewater', 'shurima', 'marai'],
  marai: ['ice_sea', 'shurima', 'bandle_city', 'demacia', 'camavor'],
};

/**
 * Check if a region is a starting region
 */
export function isStartingRegion(region: Region): boolean {
  return region === 'demacia' || region === 'ionia' || region === 'shurima';
}

/**
 * Check if a region is an end-game region (leads to travelling regions)
 */
export function isEndGameRegion(region: Region): boolean {
  return region === 'shadow_isles' || region === 'void' || region === 'targon';
}

/**
 * Check if a region is a travelling region
 */
export function isTravellingRegion(region: Region): boolean {
  return region === 'camavor' || region === 'marai' || region === 'ice_sea';
}

/**
 * Get available destinations from current region
 * Filters out the previous region to prevent immediate backtracking (e.g., Ionia>Ixtal>Ionia)
 */
export function getAvailableDestinations(
  currentRegion: Region,
  visitedRegionsThisRun: Region[]
): Region[] {
  const allDestinations = REGION_GRAPH[currentRegion] || [];
  
  // Get the previous region (the one before current)
  if (visitedRegionsThisRun.length < 2) {
    // If we're at the first region, no filtering needed
    return allDestinations;
  }
  
  const previousRegion = visitedRegionsThisRun[visitedRegionsThisRun.length - 2];
  
  // Filter out the previous region to prevent backtracking
  return allDestinations.filter(dest => dest !== previousRegion);
}

/**
 * Check if a region has been visited this run
 */
export function hasVisitedRegion(region: Region, visitedRegions: Region[]): boolean {
  return visitedRegions.includes(region);
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
    ice_sea: 'Ice Sea',
    marai: 'Marai',
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
    piltover: 'The City of Progress - Hub of connections.',
    shadow_isles: 'A cursed land of undeath.',
    void: 'An unknowable dimension of horror.',
    targon: 'A mystical mountain realm.',
    camavor: 'A cursed kingdom of ruin and shadow. Gateway to many lands.',
    marai: 'The depths of the ocean. Connects distant shores.',
    ice_sea: 'Frozen waters between continents. A treacherous passage.',
  };
  return descriptions[region] || '';
}
