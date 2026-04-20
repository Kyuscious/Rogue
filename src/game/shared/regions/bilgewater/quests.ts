// Placeholder quests for Bilgewater - to be implemented later
export const BILGEWATER_QUEST_PATHS = [
  {
    id: 'bilgewater_path_1',
    name: 'Pirate\'s Cove',
    flavor: 'Survive the lawless port city',
    paths: [
      {
        id: 'bilgewater_path_1_safe',
        name: 'Safe Route - Harbor District',
        description: 'Navigate the busy docks',
        difficulty: 'safe' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'bilgewater_path_1_risky',
        name: 'Risky Route - Dead Pool',
        description: 'Venture into pirate-infested waters',
        difficulty: 'risky' as const,
        enemyIds: [
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_elite',
          'placeholder_minion', 'placeholder_minion', 'placeholder_minion', 'placeholder_minion',
          'placeholder_boss',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
