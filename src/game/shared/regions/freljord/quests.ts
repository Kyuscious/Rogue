// Placeholder quests for Freljord - to be implemented later
export const FRELJORD_QUEST_PATHS = [
  {
    id: 'freljord_path_1',
    name: 'Frozen Tundra',
    flavor: 'Survive the harsh frozen wastelands',
    paths: [
      {
        id: 'freljord_path_1_safe',
        name: 'Safe Route - Ice Fields',
        description: 'Navigate through frozen plains',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'freljord_path_1_risky',
        name: 'Risky Route - Winter\'s Claw Territory',
        description: 'Face the fiercest Freljordian warriors',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
