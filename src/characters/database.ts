import { Character, Region } from '../game/types';
import { DEFAULT_STATS } from '../game/statsSystem';

export const SUMMONER: Character = {
  id: 'summoner',
  name: 'Summoner',
  role: 'summoner',
  region: 'demacia',
  class: 'juggernaut',
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
