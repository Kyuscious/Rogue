import { Character, Region } from '@game/types';
import { DEFAULT_STATS } from '@utils/statsSystem';

export const SUMMONER: Character = {
  id: 'summoner',
  name: 'Summoner',
  region: 'demacia',
  role: 'player',
  class: 'juggernaut',
  characterArt: '/assets/global/images/player/miko1.png',
  hp: DEFAULT_STATS.health,
  abilities: [],
  level: 1,
  experience: 0,
  stats: DEFAULT_STATS,
};

export function getCharacterById(id: string): Character | undefined {
  const characters: Record<string, Character> = {
    summoner: SUMMONER,
  };
  return characters[id];
}

export function getCharactersByRegion(_region: Region): Character[] {
  return [SUMMONER];
}
