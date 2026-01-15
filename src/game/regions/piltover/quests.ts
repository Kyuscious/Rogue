// Placeholder quests for Piltover - to be implemented later
export const PILTOVER_QUEST_PATHS = [
  {
    id: 'piltover_path_1',
    name: 'City of Progress',
    flavor: 'Navigate the gleaming hextech metropolis',
    paths: [
      {
        id: 'piltover_path_1_safe',
        name: 'Safe Route - Academy District',
        description: 'Face rogue inventions and experiments',
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
        id: 'piltover_path_1_risky',
        name: 'Risky Route - Experimental Labs',
        description: 'Challenge dangerous hextech prototypes',
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
