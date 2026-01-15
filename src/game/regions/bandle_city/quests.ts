// Placeholder quests for Bandle City - to be implemented later
export const BANDLE_CITY_QUEST_PATHS = [
  {
    id: 'bandle_city_path_1',
    name: 'Yordle Mischief',
    flavor: 'Navigate the chaotic magical realm of yordles',
    paths: [
      {
        id: 'bandle_city_path_1_safe',
        name: 'Safe Route - Peaceful Groves',
        description: 'Wander through friendly yordle territory',
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
        id: 'bandle_city_path_1_risky',
        name: 'Risky Route - Twisted Portal',
        description: 'Risk chaotic yordle magic',
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
