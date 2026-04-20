// Placeholder quests for Shadow Isles - to be implemented later
// This is an ACT-ENDING region
export const SHADOW_ISLES_QUEST_PATHS = [
  {
    id: 'shadow_isles_path_1',
    name: 'Realm of the Damned',
    flavor: 'Face the eternal curse of the Shadow Isles',
    paths: [
      {
        id: 'shadow_isles_path_1_safe',
        name: 'Safe Route - Cursed Shores',
        description: 'Navigate the haunted coastline',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'shadow_isles_path_1_risky',
        name: 'Risky Route - Ruined King\'s Domain',
        description: 'Face the most powerful undead',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.8,
        rewardExpMultiplier: 1.8,
      },
    ],
  },
];
