export const SHURIMA_QUEST_PATHS = [
  {
    id: 'shurima_path_1',
    name: 'The Golden Sands',
    flavor: 'Journey through the ancient desert of Shurima',
    paths: [
      {
        id: 'shurima_path_1_safe',
        name: 'Safe Route - Oasis Path',
        description: 'Shelter from the desert storms',
        difficulty: 'safe' as const,
        enemyIds: [],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_1_balanced',
        name: 'Balanced Route - Desert Trail',
        description: 'A moderate desert crossing',
        difficulty: 'safe' as const,
        enemyIds: [],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'shurima_path_1_risky',
        name: 'Risky Route - Scorched Wastes',
        description: 'The harshest desert environment',
        difficulty: 'risky' as const,
        enemyIds: [],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
