import { Region } from '@game/types';
import {
  DEMACIA_QUEST_PATHS,
  IONIA_QUEST_PATHS,
  SHURIMA_QUEST_PATHS,
  NOXUS_QUEST_PATHS,
  FRELJORD_QUEST_PATHS,
  ZAUN_QUEST_PATHS,
  IXTAL_QUEST_PATHS,
  BANDLE_CITY_QUEST_PATHS,
  BILGEWATER_QUEST_PATHS,
  PILTOVER_QUEST_PATHS,
  SHADOW_ISLES_QUEST_PATHS,
  VOID_QUEST_PATHS,
  TARGON_QUEST_PATHS,
  CAMAVOR_QUEST_PATHS,
  MARAI_QUEST_PATHS,
  ICE_SEA_QUEST_PATHS,
} from '../../../shared/regions';

export type QuestEncounter = string | string[];

export interface QuestPath {
  id: string;
  name: string;
  description: string;
  difficulty: 'safe' | 'fair' | 'risky';
  // Each entry is one encounter by default. Use a nested array to explicitly spawn multiple enemies in the same encounter.
  enemyIds: QuestEncounter[];
  lootType: 'damage' | 'defense' | 'mixed' | 'attackDamage' | 'abilityPower' | 'tankDefense' | 'hybrid' | 'mobility' | 'utility' | 'critical';
  rewardGoldMultiplier: number;
  rewardExpMultiplier: number;
  finalBossId?: string; // ID of the final boss for UI preview
}

export function normalizeEncounterEnemyIds(enemyIds: QuestEncounter[]): string[][] {
  return enemyIds.map((encounter) => Array.isArray(encounter) ? encounter : [encounter]);
}

export function flattenEncounterEnemyIds(enemyIds: QuestEncounter[]): string[] {
  return enemyIds.flatMap((encounter) => Array.isArray(encounter) ? encounter : [encounter]);
}

export interface Quest {
  id: string;
  name: string;
  region: Region;
  flavor: string;
  paths: QuestPath[];
}

// Use the actual quest paths from regions
const DEMACIA_QUESTS: Quest[] = DEMACIA_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'demacia' as Region,
}));

const IONIA_QUESTS: Quest[] = IONIA_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'ionia' as Region,
}));

const SHURIMA_QUESTS: Quest[] = SHURIMA_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'shurima' as Region,
}));

const NOXUS_QUESTS: Quest[] = NOXUS_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'noxus' as Region,
}));

const FRELJORD_QUESTS: Quest[] = FRELJORD_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'freljord' as Region,
}));

const ZAUN_QUESTS: Quest[] = ZAUN_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'zaun' as Region,
}));

const IXTAL_QUESTS: Quest[] = IXTAL_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'ixtal' as Region,
}));

const BANDLE_CITY_QUESTS: Quest[] = BANDLE_CITY_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'bandle_city' as Region,
}));

const BILGEWATER_QUESTS: Quest[] = BILGEWATER_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'bilgewater' as Region,
}));

const PILTOVER_QUESTS: Quest[] = PILTOVER_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'piltover' as Region,
}));

const SHADOW_ISLES_QUESTS: Quest[] = SHADOW_ISLES_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'shadow_isles' as Region,
}));

const VOID_QUESTS: Quest[] = VOID_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'void' as Region,
}));

const TARGON_QUESTS: Quest[] = TARGON_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'targon' as Region,
}));

const CAMAVOR_QUESTS: Quest[] = CAMAVOR_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'camavor' as Region,
}));

const MARAI_QUESTS: Quest[] = MARAI_QUEST_PATHS.map((quest): Quest => ({
  ...quest,
  region: 'marai_territory' as Region,
}));

const ICE_SEA_QUESTS: Quest[] = ICE_SEA_QUEST_PATHS.map((quest): Quest => ({
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
  runeterra: [],
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
