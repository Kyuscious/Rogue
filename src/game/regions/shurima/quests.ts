import { SHURIMA_MINIONS, SHURIMA_ELITES, SHURIMA_BOSSES } from './enemies';

export const SHURIMA_QUEST_PATHS = [
  {
    id: 'shurima_path_1',
    name: 'The Golden Sands',
    flavor: 'Journey through the ancient desert of Shurima',
    paths: [
      {
        id: 'shurima_path_1_safe',
        name: 'Safe Route - Oasis Path',
        description: 'Travel between desert oases',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, // Encounters 1-4: Desert nomads and scarabs
          SHURIMA_ELITES[1].id, // Encounter 5: Sun Disc Keeper
          SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, // Encounters 6-9
          SHURIMA_BOSSES[2].id, // Encounter 10: Sun Guardian
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_1_balanced',
        name: 'Balanced Route - Desert Trail',
        description: 'A moderate desert crossing',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, SHURIMA_MINIONS[0].id,
          SHURIMA_ELITES[0].id,
          SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[3].id, SHURIMA_MINIONS[0].id,
          SHURIMA_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_1_risky',
        name: 'Risky Route - Scorched Wastes',
        description: 'The harshest desert environment',
        difficulty: 'risky' as const,
        // 10 encounters: 4 beast minions → 1 beast elite → 4 beast minions → Desert Tyrant boss
        enemyIds: [
          'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab',
          'shurima_xer_sai_tunneler',
          'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab',
          'shurima_desert_tyrant',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'shurima_desert_tyrant',
      },
    ],
  },
  {
    id: 'shurima_path_2',
    name: 'Ancient Tombs',
    flavor: 'Explore the buried crypts of fallen emperors',
    paths: [
      {
        id: 'shurima_path_2_safe',
        name: 'Safe Route - Outer Chambers',
        description: 'Stay in the outer tomb sections',
        difficulty: 'safe' as const,
        // 10 encounters: 4 construct minions → 1 construct elite → 4 construct minions → 1 construct boss
        enemyIds: [
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:boss:construct',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'shurima_emperor_construct',
      },
      {
        id: 'shurima_path_2_balanced',
        name: 'Balanced Route - Royal Crypts',
        description: 'Delve into royal burial chambers',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:boss:construct',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'shurima_emperor_construct',
      },
      {
        id: 'shurima_path_2_risky',
        name: 'Risky Route - Emperor\'s Sanctum',
        description: 'Face the mightiest of ancient Shurima',
        difficulty: 'risky' as const,
        // 10 encounters: 4 construct minions → 1 construct elite → 4 construct minions → Nasus
        enemyIds: [
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'nasus', // Nasus champion
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'nasus',
      },
    ],
  },
  {
    id: 'shurima_path_3',
    name: 'The Sun Disc',
    flavor: 'Ascend to the heart of Shurima\'s power',
    paths: [
      {
        id: 'shurima_path_3_safe',
        name: 'Safe Route - Lower Plaza',
        description: 'Fight through the lower levels',
        difficulty: 'safe' as const,
        enemyIds: [
          SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[4].id, SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[4].id,
          SHURIMA_ELITES[1].id,
          SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[4].id, SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[4].id,
          SHURIMA_BOSSES[2].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_3_balanced',
        name: 'Balanced Route - Solar Steps',
        description: 'Climb the solar steps to the disc',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:mortal', 'random:minion:construct', 'random:minion:mortal', 'random:minion:construct',
          'random:elite:mortal',
          'random:minion:mortal', 'random:minion:construct', 'random:minion:mortal', 'random:minion:construct',
          'random:boss:mortal',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'shurima_sun_guardian',
      },
      {
        id: 'shurima_path_3_risky',
        name: 'Risky Route - Throne of the Emperor',
        description: 'Challenge Azir himself',
        difficulty: 'risky' as const,
        // 10 encounters: mixed → Azir champion
        enemyIds: [
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:construct', 'random:minion:construct', 'random:minion:construct', 'random:minion:construct',
          'azir', // Azir champion
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'azir',
      },
    ],
  },
  {
    id: 'shurima_path_4',
    name: 'Xer\'Sai Burrows',
    flavor: 'Brave the underground tunnels of desert predators',
    paths: [
      {
        id: 'shurima_path_4_safe',
        name: 'Safe Route - Surface Tunnels',
        description: 'Stay near the surface',
        difficulty: 'safe' as const,
        enemyIds: [
          'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab',
          SHURIMA_ELITES[2].id,
          'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab', 'shurima_sand_scarab',
          SHURIMA_BOSSES[1].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_4_balanced',
        name: 'Balanced Route - Deep Network',
        description: 'Navigate the deeper tunnels',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:beast', 'random:minion:beast', 'random:minion:beast', 'random:minion:beast',
          'random:elite:beast',
          'random:minion:beast', 'random:minion:beast', 'random:minion:beast', 'random:minion:beast',
          'random:boss:beast',
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'shurima_desert_tyrant',
      },
      {
        id: 'shurima_path_4_risky',
        name: 'Risky Route - The Nest',
        description: 'Enter the heart of the void',
        difficulty: 'risky' as const,
        enemyIds: [
          'random:minion:beast', 'random:minion:beast', 'random:minion:beast', 'random:minion:beast',
          'random:elite:beast',
          'random:minion:beast', 'random:minion:beast', 'random:minion:beast', 'random:minion:beast',
          'shurima_desert_tyrant',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.0,
      },
    ],
  },
  {
    id: 'shurima_path_5',
    name: 'Legacy of the Ascended',
    flavor: 'Face the ancient powers of Shurima',
    paths: [
      {
        id: 'shurima_path_5_safe',
        name: 'Safe Route - Pilgrim\'s Way',
        description: 'Walk the path of pilgrims',
        difficulty: 'safe' as const,
        enemyIds: [
          SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[4].id, SHURIMA_MINIONS[0].id,
          SHURIMA_ELITES[0].id,
          SHURIMA_MINIONS[2].id, SHURIMA_MINIONS[4].id, SHURIMA_MINIONS[0].id, SHURIMA_MINIONS[2].id,
          SHURIMA_BOSSES[0].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'shurima_path_5_balanced',
        name: 'Balanced Route - Path of Heroes',
        description: 'Follow in the footsteps of heroes',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:construct', 'random:minion:mortal', 'random:minion:beast', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:mortal', 'random:minion:beast', 'random:minion:construct', 'random:minion:mortal',
          'random:boss:construct',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'shurima_emperor_construct',
      },
      {
        id: 'shurima_path_5_risky',
        name: 'Risky Route - Champion\'s Test',
        description: 'Prove yourself against legends',
        difficulty: 'risky' as const,
        enemyIds: [
          'random:minion:construct', 'random:minion:mortal', 'random:minion:beast', 'random:minion:construct',
          'random:elite:construct',
          'random:minion:mortal', 'random:minion:beast', 'random:minion:construct', 'random:minion:mortal',
          'azir',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.2,
        finalBossId: 'azir',
      },
    ],
  },
];

