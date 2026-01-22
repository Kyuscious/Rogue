import { Region } from './types';
import { RegionEvent } from './eventSystem';

export type PostEncounterChoice = 'loot' | 'rest' | 'modify_build' | 'random_event';

export interface PostEncounterState {
  region: Region;
  questPathId: string;
  encounterId: number;
  isFinalBoss: boolean;
  
  // Available loot from the encounter
  availableLoot: string[];
  selectedLoot?: string;
  
  // Current choice
  currentChoice?: PostEncounterChoice;
  
  // For event outcome
  selectedEvent?: RegionEvent;
  eventOutcome?: boolean;
}

export function isFinalEncounter(encounterId: number, totalEncounters: number = 10): boolean {
  return encounterId === totalEncounters;
}

export function getBossLoot(region: Region, encounterId: number): string[] {
  // Placeholder loot pool - will be expanded based on encounter difficulty
  // This would typically come from the enemy's loot table
  const commonItems = [
    'longsword',
    'cloth_armor',
    'negatron_cloak',
    'mana_crystal',
  ];

  const rareItems = [
    'void_staff',
    'warmogs_armor',
    'thornmail',
  ];

  // Final boss should have better loot options
  if (isFinalEncounter(encounterId)) {
    return [...commonItems, ...rareItems].slice(0, 5);
  }

  return commonItems.slice(0, 3);
}
