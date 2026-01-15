// Placeholder quests for Noxus - to be implemented later
export const NOXUS_QUEST_PATHS = [
  {
    id: 'noxus_path_1',
    name: 'Conquest of the Weak',
    flavor: 'Prove your might in the arena of war',
    paths: [
      {
        id: 'noxus_path_1_safe',
        name: 'Safe Route - Recruit Grounds',
        description: 'Face Noxian recruits and conscripts',
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
        id: 'noxus_path_1_risky',
        name: 'Risky Route - Warband Territory',
        description: 'Challenge elite Noxian warbands',
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
