// Placeholder quests for Targon - to be implemented later
// This is an ACT-ENDING region
export const TARGON_QUEST_PATHS = [
  {
    id: 'targon_path_1',
    name: 'Ascension Peak',
    flavor: 'Climb the sacred mountain to face celestial trials',
    paths: [
      {
        id: 'targon_path_1_safe',
        name: 'Safe Route - Mountain Base',
        description: 'Begin your ascent through lower peaks',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'targon_path_1_risky',
        name: 'Risky Route - Summit Trial',
        description: 'Face the Aspects themselves',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.8,
        rewardExpMultiplier: 1.8,
      },
    ],
  },
];
