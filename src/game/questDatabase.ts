import { Region } from './types';
import { DEMACIA_QUEST_PATHS } from './regions/demacia';

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

export const QUESTS_BY_REGION: Record<Region, Quest[]> = {
  demacia: DEMACIA_QUESTS,
  shurima: [],
  ionia: [],
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
