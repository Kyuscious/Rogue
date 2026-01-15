// Placeholder quests for Zaun - to be implemented later
export const ZAUN_QUEST_PATHS = [
  {
    id: 'zaun_path_1',
    name: 'Toxic Depths',
    flavor: 'Descend into the chemtech-infested undercity',
    paths: [
      {
        id: 'zaun_path_1_safe',
        name: 'Safe Route - Upper Sump',
        description: 'Navigate the safer upper levels',
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
        id: 'zaun_path_1_risky',
        name: 'Risky Route - Deep Sump',
        description: 'Face mutated chemtech experiments',
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
