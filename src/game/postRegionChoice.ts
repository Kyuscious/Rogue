import { Region, Character } from './types';

export type PostRegionChoice = 'rest' | 'modify_build' | 'random_event';

/**
 * Post-Region Choice Options
 * After completing a region, players can choose to:
 * 1. Rest - Heal HP and restore resources
 * 2. Modify Build - Change class, manage items/spells/weapons
 * 3. Random Event - Trigger a region-specific event
 */

export interface PostRegionChoiceOption {
  type: PostRegionChoice;
  title: string;
  description: string;
  icon: string;
}

export const POST_REGION_CHOICES: PostRegionChoiceOption[] = [
  {
    type: 'rest',
    title: 'Rest',
    description: 'Heal to full HP and restore all resources. Safe and reliable.',
    icon: '🛏️',
  },
  {
    type: 'modify_build',
    title: 'Modify Build',
    description: 'Change your class, reorganize items, or adjust spells and weapons.',
    icon: '⚙️',
  },
  {
    type: 'random_event',
    title: 'Explore',
    description: 'Trigger a random event from this region. Risk and reward!',
    icon: '🎲',
  },
];

/**
 * Apply rest choice - heal player to full HP
 */
export function applyRestChoice(player: Character, maxHp: number): Character {
  return {
    ...player,
    hp: maxHp,
  };
}

/**
 * Check if region has random events available
 */
export function hasRegionEvents(region: Region): boolean {
  const regionsWithEvents: Region[] = [
    'demacia',
    'noxus',
    'freljord',
    'ionia',
    'piltover',
    'zaun',
    'shadow_isles',
    'bilgewater',
    'shurima',
    'targon',
    'void',
    'bandle_city',
    'ixtal',
    'ice_sea',
    'marai_territory',
    'camavor',
  ];
  return regionsWithEvents.includes(region);
}
