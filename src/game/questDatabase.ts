import { Region } from './types';
import { DEMACIA_QUEST_PATHS } from './regions/demacia';
import { IONIA_QUEST_PATHS } from './regions/ionia/quests';
import { SHURIMA_QUEST_PATHS } from './regions/shurima/quests';
import { NOXUS_QUEST_PATHS } from './regions/noxus/quests';
import { FRELJORD_QUEST_PATHS } from './regions/freljord/quests';
import { ZAUN_QUEST_PATHS } from './regions/zaun/quests';
import { IXTAL_QUEST_PATHS } from './regions/ixtal/quests';
import { BANDLE_CITY_QUEST_PATHS } from './regions/bandle_city/quests';
import { BILGEWATER_QUEST_PATHS } from './regions/bilgewater/quests';
import { PILTOVER_QUEST_PATHS } from './regions/piltover/quests';
import { SHADOW_ISLES_QUEST_PATHS } from './regions/shadow_isles/quests';
import { VOID_QUEST_PATHS } from './regions/void/quests';
import { TARGON_QUEST_PATHS } from './regions/targon/quests';
import { CAMAVOR_QUEST_PATHS } from './regions/camavor/quests';
import { MARAI_QUEST_PATHS } from './regions/marai_territory/quests';
import { ICE_SEA_QUEST_PATHS } from './regions/ice_sea/quests';

export interface QuestPath {
  id: string;
  name: string;
  description: string;
  difficulty: 'safe' | 'risky';
  enemyIds: string[];
  lootType: 'damage' | 'defense' | 'mixed';
  rewardGoldMultiplier: number;
  rewardExpMultiplier: number;
  finalBossId?: string; // ID of the final boss for UI preview
}

export interface Quest {
  id: string;
  name: string;
  region: Region;
  flavor: string;
  paths: QuestPath[];
}

// Use the actual quest paths from regions
const DEMACIA_QUESTS: Quest[] = DEMACIA_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'demacia' as Region,
}));

const IONIA_QUESTS: Quest[] = IONIA_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'ionia' as Region,
}));

const SHURIMA_QUESTS: Quest[] = SHURIMA_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'shurima' as Region,
}));

const NOXUS_QUESTS: Quest[] = NOXUS_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'noxus' as Region,
}));

const FRELJORD_QUESTS: Quest[] = FRELJORD_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'freljord' as Region,
}));

const ZAUN_QUESTS: Quest[] = ZAUN_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'zaun' as Region,
}));

const IXTAL_QUESTS: Quest[] = IXTAL_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'ixtal' as Region,
}));

const BANDLE_CITY_QUESTS: Quest[] = BANDLE_CITY_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'bandle_city' as Region,
}));

const BILGEWATER_QUESTS: Quest[] = BILGEWATER_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'bilgewater' as Region,
}));

const PILTOVER_QUESTS: Quest[] = PILTOVER_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'piltover' as Region,
}));

const SHADOW_ISLES_QUESTS: Quest[] = SHADOW_ISLES_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'shadow_isles' as Region,
}));

const VOID_QUESTS: Quest[] = VOID_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'void' as Region,
}));

const TARGON_QUESTS: Quest[] = TARGON_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'targon' as Region,
}));

const CAMAVOR_QUESTS: Quest[] = CAMAVOR_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'camavor' as Region,
}));

const MARAI_QUESTS: Quest[] = MARAI_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'marai_territory' as Region,
}));

const ICE_SEA_QUESTS: Quest[] = ICE_SEA_QUEST_PATHS.map(quest => ({
  ...quest,
  region: 'ice_sea' as Region,
}));

export const QUESTS_BY_REGION: Record<Region, Quest[]> = {
  demacia: DEMACIA_QUESTS,
  ionia: IONIA_QUESTS,
  shurima: SHURIMA_QUESTS,
  noxus: NOXUS_QUESTS,
  freljord: FRELJORD_QUESTS,
  zaun: ZAUN_QUESTS,
  ixtal: IXTAL_QUESTS,
  bandle_city: BANDLE_CITY_QUESTS,
  bilgewater: BILGEWATER_QUESTS,
  piltover: PILTOVER_QUESTS,
  shadow_isles: SHADOW_ISLES_QUESTS,
  void: VOID_QUESTS,
  targon: TARGON_QUESTS,
  camavor: CAMAVOR_QUESTS,
  ice_sea: ICE_SEA_QUESTS,
  marai_territory: MARAI_QUESTS,
};

export function getRandomQuests(region: Region, count: number = 3): Quest[] {
  const quests = QUESTS_BY_REGION[region] || [];
  const shuffled = [...quests].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, quests.length));
}

export function getQuestById(questId: string): Quest | undefined {
  for (const region in QUESTS_BY_REGION) {
    const quest = QUESTS_BY_REGION[region as Region].find((q) => q.id === questId);
    if (quest) return quest;
  }
  return undefined;
}

export function getQuestsByRegion(region: Region): Quest[] {
  return QUESTS_BY_REGION[region] || [];
}
