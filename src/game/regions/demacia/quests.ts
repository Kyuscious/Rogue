import { DEMACIA_MINIONS, DEMACIA_ELITES, DEMACIA_BOSSES } from './enemies';

export const DEMACIA_QUEST_PATHS = [
  {
    id: 'demacia_path_1',
    name: 'The Crags of Demacia',
    flavor: 'A treacherous journey through rocky mountain terrain',
    paths: [
      {
        id: 'demacia_path_1_safe',
        name: 'Safe Route - The Merchant Road',
        description: 'A well-traveled path with weaker enemies',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, // Encounters 1-4: Minions
          DEMACIA_ELITES[0].id, // Encounter 5: Elite
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, // Encounters 6-9: Minions
          DEMACIA_BOSSES[0].id, // Encounter 10: Boss
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'demacia_path_1_balanced',
        name: 'Balanced Route - The Highland Trail',
        description: 'A moderate path with varied challenges',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss (harder enemies)
        enemyIds: [
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, // Encounters 1-4: Minions
          DEMACIA_ELITES[1].id, // Encounter 5: Elite
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, // Encounters 6-9: Minions
          DEMACIA_BOSSES[1].id, // Encounter 10: Boss
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'demacia_path_1_risky',
        name: 'Risky Route - The Beast Territory',
        description: 'A dangerous path through monster-infested lands',
        difficulty: 'risky' as const,
        // 10 encounters: Beast faction minions → Crag Beast elite → Beast minions → Crag Beast Elder boss
        enemyIds: [
          'demacia_wild_boar', 'demacia_wild_boar', 'demacia_wild_boar', 'demacia_wild_boar', // Encounters 1-4: Beast minions
          'demacia_crag_beast', // Encounter 5: Crag Beast Elite
          'demacia_wild_boar', 'demacia_wild_boar', 'demacia_wild_boar', 'demacia_wild_boar', // Encounters 6-9: Beast minions
          'demacia_crag_elder', // Encounter 10: Crag Beast Elder (Boss)
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
  {
    id: 'demacia_path_2',
    name: "Might of Demacia",
    flavor: 'Prove your strength against Demacia\'s finest warriors',
    paths: [
      {
        id: 'demacia_path_2_safe',
        name: 'Safe Route - Outer Defenses',
        description: 'Encounter the outer guard posts',
        difficulty: 'safe' as const,
        // 10 encounters: 4 random guard minions → 1 random guard elite → 4 random guard minions → 1 random guard boss
        enemyIds: [
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 1-4: Random guard minions
          'random:elite:guard', // Encounter 5: Random guard elite
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 6-9: Random guard minions
          'random:boss:guard', // Encounter 10: Random guard boss
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'demacia_warhorse_commander', // For UI preview
      },
      {
        id: 'demacia_path_2_balanced',
        name: 'Balanced Route - Inner Sanctum',
        description: 'Battle through the inner defenses',
        difficulty: 'safe' as const,
        // 10 encounters: 4 random guard minions → 1 random guard elite → 4 random guard minions → 1 random guard boss
        enemyIds: [
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 1-4: Random guard minions
          'random:elite:guard', // Encounter 5: Random guard elite
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 6-9: Random guard minions
          'random:boss:guard', // Encounter 10: Random guard boss
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'demacia_mageseeker', // For UI preview
      },
      {
        id: 'demacia_path_2_risky',
        name: 'Risky Route - Champion Circle',
        description: 'Face the Mightiest of Demacia',
        difficulty: 'risky' as const,
        // 10 encounters: 4 random guard minions → 1 random guard elite → 4 random guard minions → Garen (champion)
        enemyIds: [
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 1-4: Random guard minions
          'random:elite:guard', // Encounter 5: Random guard elite
          'random:minion:guard', 'random:minion:guard', 'random:minion:guard', 'random:minion:guard', // Encounters 6-9: Random guard minions
          'garen', // Encounter 10: Garen (champion)
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
        finalBossId: 'garen', // For UI preview - Garen is the final boss
      },
    ],
  },
  {
    id: 'demacia_path_3',
    name: 'The Final Trial',
    flavor: 'The ultimate test of strength in Demacia',
    paths: [
      {
        id: 'demacia_path_3_safe',
        name: 'Safe Route - Training Grounds',
        description: 'Practice against lesser opponents',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, // Encounters 1-4: Minions
          DEMACIA_ELITES[0].id, // Encounter 5: Elite
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, // Encounters 6-9: Minions
          DEMACIA_BOSSES[2].id, // Encounter 10: Boss
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'demacia_path_3_balanced',
        name: 'Balanced Route - Warriors Trial',
        description: 'Test yourself against skilled warriors',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, // Encounters 1-4: Minions
          DEMACIA_ELITES[1].id, // Encounter 5: Elite
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, // Encounters 6-9: Minions
          DEMACIA_BOSSES[0].id, // Encounter 10: Boss
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'demacia_path_3_risky',
        name: 'Risky Route - Legend Clash',
        description: 'Battle legends and beasts in one epic encounter',
        difficulty: 'risky' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 legend boss
        enemyIds: [
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, // Encounters 1-4: Minions
          DEMACIA_ELITES[2].id, // Encounter 5: Elite
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, // Encounters 6-9: Minions
          DEMACIA_BOSSES[1].id, // Encounter 10: Legend Boss
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
  {
    id: 'demacia_path_4',
    name: 'Petricite Mines',
    flavor: 'Delve deep into the magical stone quarries',
    paths: [
      {
        id: 'demacia_path_4_safe',
        name: 'Safe Route - Upper Mines',
        description: 'Stay in the safer upper levels',
        difficulty: 'safe' as const,
        enemyIds: [
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id,
          DEMACIA_ELITES[0].id,
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id,
          DEMACIA_BOSSES[2].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'demacia_path_4_balanced',
        name: 'Balanced Route - Deep Shafts',
        description: 'Venture into the deeper sections',
        difficulty: 'safe' as const,
        enemyIds: [
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id,
          DEMACIA_ELITES[1].id,
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id,
          DEMACIA_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'demacia_path_4_risky',
        name: 'Risky Route - Crystal Depths',
        description: 'Face the dangers of the deepest mines',
        difficulty: 'risky' as const,
        enemyIds: [
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id,
          DEMACIA_ELITES[2].id,
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id,
          DEMACIA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
  {
    id: 'demacia_path_5',
    name: 'Forbidden Archives',
    flavor: 'Uncover ancient secrets in the royal library',
    paths: [
      {
        id: 'demacia_path_5_safe',
        name: 'Safe Route - Public Halls',
        description: 'Navigate through the public sections',
        difficulty: 'safe' as const,
        enemyIds: [
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id,
          DEMACIA_ELITES[0].id,
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id,
          DEMACIA_BOSSES[2].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'demacia_path_5_balanced',
        name: 'Balanced Route - Restricted Section',
        description: 'Enter the restricted archives',
        difficulty: 'safe' as const,
        enemyIds: [
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id,
          DEMACIA_ELITES[1].id,
          DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id,
          DEMACIA_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
      },
      {
        id: 'demacia_path_5_risky',
        name: 'Risky Route - Forbidden Vault',
        description: 'Brave the most dangerous secrets',
        difficulty: 'risky' as const,
        enemyIds: [
          DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[2].id,
          DEMACIA_ELITES[2].id,
          DEMACIA_MINIONS[0].id, DEMACIA_MINIONS[2].id, DEMACIA_MINIONS[1].id, DEMACIA_MINIONS[0].id,
          DEMACIA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.5,
      },
    ],
  },
];
