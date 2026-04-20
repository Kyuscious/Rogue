export const CAMAVOR_QUEST_PATHS = [
  {
    id: 'camavor_path_1',
    name: 'The Ruined Kingdom',
    flavor: 'Explore the fallen empire of Camavor',
    paths: [
      {
        id: 'camavor_path_1_safe',
        name: 'Safe Route - Outer Ruins',
        description: 'Navigate the crumbling outskirts',
        difficulty: 'safe' as const,
        enemyIds: ['camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_knight', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_viego'],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'camavor_path_1_balanced',
        name: 'Balanced Route - Palace Halls',
        description: 'Traverse the haunted palace',
        difficulty: 'safe' as const,
        enemyIds: ['camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_knight', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_viego'],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'camavor_path_1_risky',
        name: 'Risky Route - Throne Room',
        description: 'Face the heart of the Ruination',
        difficulty: 'risky' as const,
        enemyIds: ['camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_knight', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_wraith', 'camavor_viego'],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
