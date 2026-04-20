// Placeholder quests for Void - to be implemented later
// This is an ACT-ENDING region
export const VOID_QUEST_PATHS = [
  {
    id: 'void_path_1',
    name: 'Into the Abyss',
    flavor: 'Face the horrors from beyond reality',
    paths: [
      {
        id: 'void_path_1_safe',
        name: 'Safe Route - Void Rift Edges',
        description: 'Battle lesser Voidborn creatures',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'void_path_1_risky',
        name: 'Risky Route - Void Heart',
        description: 'Challenge ancient Voidborn titans',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.8,
        rewardExpMultiplier: 1.8,
      },
    ],
  },
];
