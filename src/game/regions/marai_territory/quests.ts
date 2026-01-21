import { MARAI_MINIONS, MARAI_ELITES, MARAI_BOSSES } from './enemies';
import type { QuestPath } from '../../questDatabase';

export const MARAI_QUEST_PATHS: Array<{
  id: string;
  name: string;
  flavor: string;
  paths: QuestPath[];
}> = [
  {
    id: 'marai_path_1',
    name: 'Depths of Marai',
    flavor: 'Venture into the mysterious underwater realm of Marai',
    paths: [
      {
        id: 'marai_path_1_safe',
        name: 'Safe Route - Shallow Waters',
        description: 'A peaceful journey through calm tidal zones',
        difficulty: 'safe' as const,
        enemyIds: [
          MARAI_MINIONS[0].id, MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id,
          MARAI_ELITES[0].id,
          MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id, MARAI_MINIONS[1].id,
          MARAI_BOSSES[0].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'marai_path_1_balanced',
        name: 'Balanced Route - The Abyss Trail',
        description: 'A moderate descent into deeper waters',
        difficulty: 'safe' as const,
        enemyIds: [
          MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id, MARAI_MINIONS[2].id,
          MARAI_ELITES[1].id,
          MARAI_MINIONS[0].id, MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id,
          MARAI_BOSSES[1].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'marai_path_1_risky',
        name: 'Risky Route - The Leviathan\'s Domain',
        description: 'Brave the deepest trenches where ancient creatures dwell',
        difficulty: 'risky' as const,
        enemyIds: [
          MARAI_MINIONS[2].id, MARAI_MINIONS[2].id, MARAI_MINIONS[2].id, MARAI_MINIONS[2].id,
          MARAI_ELITES[1].id,
          MARAI_MINIONS[2].id, MARAI_MINIONS[2].id, MARAI_MINIONS[2].id, MARAI_MINIONS[2].id,
          MARAI_BOSSES[1].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.8,
        rewardExpMultiplier: 1.8,
      },
    ],
  },
  {
    id: 'marai_path_2',
    name: 'Siren\'s Call',
    flavor: 'Answer the mysterious call echoing through the tides',
    paths: [
      {
        id: 'marai_path_2_safe',
        name: 'Safe Route - Echo Chamber',
        description: 'Follow the gentle whispers of the sirens',
        difficulty: 'safe' as const,
        enemyIds: [
          MARAI_MINIONS[0].id, MARAI_MINIONS[0].id, MARAI_MINIONS[1].id, MARAI_MINIONS[1].id,
          MARAI_ELITES[0].id,
          MARAI_MINIONS[0].id, MARAI_MINIONS[1].id, MARAI_MINIONS[0].id, MARAI_MINIONS[1].id,
          MARAI_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'marai_path_2_balanced',
        name: 'Balanced Route - Siren\'s Grotto',
        description: 'Navigate the halls where sirens gather',
        difficulty: 'safe' as const,
        enemyIds: [
          MARAI_MINIONS[1].id, MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[2].id,
          MARAI_ELITES[0].id,
          MARAI_MINIONS[1].id, MARAI_MINIONS[2].id, MARAI_MINIONS[1].id, MARAI_MINIONS[2].id,
          MARAI_BOSSES[0].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.3,
        rewardExpMultiplier: 1.3,
      },
      {
        id: 'marai_path_2_risky',
        name: 'Risky Route - Siren\'s Throne',
        description: 'Confront the Siren Warden in her domain',
        difficulty: 'risky' as const,
        enemyIds: [
          MARAI_MINIONS[2].id, MARAI_MINIONS[0].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id,
          MARAI_ELITES[1].id,
          MARAI_MINIONS[2].id, MARAI_MINIONS[0].id, MARAI_MINIONS[2].id, MARAI_MINIONS[0].id,
          MARAI_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.6,
        rewardExpMultiplier: 1.6,
      },
    ],
  },
];
