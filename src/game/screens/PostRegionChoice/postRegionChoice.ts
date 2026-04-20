import { Region } from '@game/types';

export type PostRegionChoice = 'rest' | 'trade' | 'event';

/**
 * Shared post-region action metadata for the active region travel flow.
 * Used by Region Selection to present the action cards after a completed region.
 */

export interface PostRegionChoiceOption {
  type: PostRegionChoice;
  icon: string;
  // Note: title and description are now handled via i18n
  // See: t.postRegion.restTitle, t.postRegion.modifyBuildTitle, t.postRegion.exploreTitle
  // and their corresponding description keys
}

export const POST_REGION_CHOICES: PostRegionChoiceOption[] = [
  {
    type: 'rest',
    icon: '🛏️',
  },
  {
    type: 'trade',
    icon: '🛍️',
  },
  {
    type: 'event',
    icon: '🎲',
  },
];

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
