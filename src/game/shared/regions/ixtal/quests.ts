// Placeholder quests for Ixtal - to be implemented later
export const IXTAL_QUEST_PATHS = [
  {
    id: 'ixtal_path_1',
    name: 'Jungle Mysteries',
    flavor: 'Uncover the secrets of the ancient jungle',
    paths: [
      {
        id: 'ixtal_path_1_safe',
        name: 'Safe Route - Outer Jungle',
        description: 'Explore the jungle outskirts',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ixtal_path_1_risky',
        name: 'Risky Route - Ancient Ruins',
        description: 'Delve into forbidden Ixtali ruins',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
