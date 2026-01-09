export const IONIA_QUEST_PATHS = [
  {
    id: 'ionia_path_1',
    name: 'The Spirit Realm',
    flavor: 'Commune with the spirits of Ionia',
    paths: [
      {
        id: 'ionia_path_1_safe',
        name: 'Safe Route - Peaceful Grove',
        description: 'Harmonious spirits guide you',
        difficulty: 'safe' as const,
        enemyIds: [],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_1_balanced',
        name: 'Balanced Route - Spirit Dance',
        description: 'A balanced spiritual journey',
        difficulty: 'safe' as const,
        enemyIds: [],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'ionia_path_1_risky',
        name: 'Risky Route - Chaos Nexus',
        description: 'Chaotic spirits test your resolve',
        difficulty: 'risky' as const,
        enemyIds: [],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
