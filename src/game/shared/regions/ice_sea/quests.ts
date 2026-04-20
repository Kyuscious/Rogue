import { ICE_SEA_MINIONS, ICE_SEA_ELITES, ICE_SEA_BOSSES } from './enemies.js';

export const ICE_SEA_QUEST_PATHS= [

  {
    id: 'ice_sea_path_1',
    name: 'Frozen Wastes',
    flavor: 'Traverse the endless frozen tundra of Ice Sea',
    paths: [
      {
        id: 'ice_sea_path_1_safe',
        name: 'Safe Route - Icy Passage',
        description: 'A protected path through settled frozen lands',
        difficulty: 'safe' as const,
        enemyIds: [
          ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id,
          ICE_SEA_ELITES[0].id,
          ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id,
          ICE_SEA_BOSSES[0].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ice_sea_path_1_balanced',
        name: 'Balanced Route - Blizzard Trail',
        description: 'A moderate journey through severe blizzard conditions',
        difficulty: 'safe' as const,
        enemyIds: [
          ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[2].id,
          ICE_SEA_ELITES[1].id,
          ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id,
          ICE_SEA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'ice_sea_path_1_risky',
        name: 'Risky Route - Howling Peak',
        description: 'Brave the dangerous heights of the frozen peaks',
        difficulty: 'risky' as const,
        enemyIds: [
          ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id,
          ICE_SEA_ELITES[1].id,
          ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id,
          ICE_SEA_BOSSES[0].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.8,
        rewardExpMultiplier: 1.8,
      },
    ],
  },
  {
    id: 'ice_sea_path_2',
    name: 'The Frost Citadel',
    flavor: 'Assault the stronghold of the Frost Tyrant',
    paths: [
      {
        id: 'ice_sea_path_2_safe',
        name: 'Safe Route - Outer Defenses',
        description: 'Bypass the outer sentries of the citadel',
        difficulty: 'safe' as const,
        enemyIds: [
          ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[1].id,
          ICE_SEA_ELITES[0].id,
          ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[1].id,
          ICE_SEA_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ice_sea_path_2_balanced',
        name: 'Balanced Route - Inner Sanctum',
        description: 'Navigate the inner halls of the citadel',
        difficulty: 'safe' as const,
        enemyIds: [
          ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[2].id,
          ICE_SEA_ELITES[0].id,
          ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[1].id, ICE_SEA_MINIONS[2].id,
          ICE_SEA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.3,
        rewardExpMultiplier: 1.3,
      },
      {
        id: 'ice_sea_path_2_risky',
        name: 'Risky Route - The Tyrant\'s Chamber',
        description: 'Challenge the Frost Tyrant directly',
        difficulty: 'risky' as const,
        enemyIds: [
          ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id,
          ICE_SEA_ELITES[1].id,
          ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id, ICE_SEA_MINIONS[2].id, ICE_SEA_MINIONS[0].id,
          ICE_SEA_BOSSES[0].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.7,
        rewardExpMultiplier: 1.7,
      },
    ],
  },
];
