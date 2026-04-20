import { IONIA_MINIONS, IONIA_ELITES, IONIA_BOSSES } from './enemies';

export const IONIA_QUEST_PATHS = [
  {
    id: 'ionia_path_1',
    name: 'The Spirit Realm',
    flavor: 'Journey through the mystical spirit realm of Ionia',
    paths: [
      {
        id: 'ionia_path_1_safe',
        name: 'Safe Route - Peaceful Grove',
        description: 'Harmonious spirits guide your path',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          IONIA_MINIONS[0].id, IONIA_MINIONS[4].id, IONIA_MINIONS[0].id, IONIA_MINIONS[4].id, // Encounters 1-4: Spirit minions
          IONIA_ELITES[1].id, // Encounter 5: Spirit Blossom Elite
          IONIA_MINIONS[0].id, IONIA_MINIONS[4].id, IONIA_MINIONS[0].id, IONIA_MINIONS[4].id, // Encounters 6-9: Spirit minions
          IONIA_BOSSES[1].id, // Encounter 10: Ancient Spirit Boss
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_1_balanced',
        name: 'Balanced Route - Spirit Dance',
        description: 'A balanced spiritual journey',
        difficulty: 'safe' as const,
        // 10 encounters: 4 minions → 1 elite → 4 minions → 1 boss
        enemyIds: [
          IONIA_MINIONS[0].id, IONIA_MINIONS[2].id, IONIA_MINIONS[4].id, IONIA_MINIONS[0].id, // Encounters 1-4: Mixed minions
          IONIA_ELITES[0].id, // Encounter 5: Master Swordsman Elite
          IONIA_MINIONS[2].id, IONIA_MINIONS[0].id, IONIA_MINIONS[4].id, IONIA_MINIONS[2].id, // Encounters 6-9: Mixed minions
          IONIA_BOSSES[2].id, // Encounter 10: Wuju Bladesman Boss
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_1_risky',
        name: 'Risky Route - Chaos Nexus',
        description: 'Chaotic spirits test your resolve',
        difficulty: 'risky' as const,
        // 10 encounters: 4 shadow minions → 1 shadow boss → 4 shadow minions → Yasuo (champion)
        enemyIds: [
          'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', // Encounters 1-4: Shadow assassins
          'ionia_shadow_reaper', // Encounter 5: Shadow Reaper Boss
          'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', // Encounters 6-9: Shadow assassins
          'yasuo', // Encounter 10: Yasuo (champion)
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'yasuo',
      },
    ],
  },
  {
    id: 'ionia_path_2',
    name: 'Path of the Martial Arts',
    flavor: 'Test your skill against Ionia\'s finest warriors',
    paths: [
      {
        id: 'ionia_path_2_safe',
        name: 'Safe Route - Training Grounds',
        description: 'Face novice martial artists',
        difficulty: 'safe' as const,
        // 10 encounters: 4 random martial minions → 1 random martial elite → 4 random martial minions → 1 random martial boss
        enemyIds: [
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial', // Encounters 1-4
          'random:elite:martial', // Encounter 5
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial', // Encounters 6-9
          'random:boss:martial', // Encounter 10
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'ionia_wuju_bladesman',
      },
      {
        id: 'ionia_path_2_balanced',
        name: 'Balanced Route - Warrior\'s Trial',
        description: 'Face skilled combat masters',
        difficulty: 'safe' as const,
        // 10 encounters: mixed martial enemies
        enemyIds: [
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial',
          'random:elite:martial',
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial',
          'random:boss:martial',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'ionia_wuju_bladesman',
      },
      {
        id: 'ionia_path_2_risky',
        name: 'Risky Route - Champion\'s Challenge',
        description: 'Face the legendary Yasuo',
        difficulty: 'risky' as const,
        // 10 encounters: 4 martial minions → 1 martial elite → 4 martial minions → Yasuo
        enemyIds: [
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial',
          'random:elite:martial',
          'random:minion:martial', 'random:minion:martial', 'random:minion:martial', 'random:minion:martial',
          'yasuo', // Yasuo champion
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'yasuo',
      },
    ],
  },
  {
    id: 'ionia_path_3',
    name: 'Vastayan Wilds',
    flavor: 'Venture into the territory of magical creatures',
    paths: [
      {
        id: 'ionia_path_3_safe',
        name: 'Safe Route - Forest Edge',
        description: 'Stay at the edge of Vastayan lands',
        difficulty: 'safe' as const,
        enemyIds: [
          IONIA_MINIONS[3].id, IONIA_MINIONS[3].id, IONIA_MINIONS[3].id, IONIA_MINIONS[3].id,
          IONIA_ELITES[2].id,
          IONIA_MINIONS[3].id, IONIA_MINIONS[3].id, IONIA_MINIONS[3].id, IONIA_MINIONS[3].id,
          IONIA_BOSSES[0].id,
        ],
        lootType: 'defense' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_3_balanced',
        name: 'Balanced Route - Deep Woods',
        description: 'Journey deeper into Vastayan territory',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan',
          'random:elite:vastayan',
          'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan',
          IONIA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_3_risky',
        name: 'Risky Route - Heart of Magic',
        description: 'Face Ahri in her domain',
        difficulty: 'risky' as const,
        enemyIds: [
          'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan',
          'random:elite:vastayan',
          'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan', 'random:minion:vastayan',
          'ahri', // Ahri champion
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.2,
        rewardExpMultiplier: 1.2,
        finalBossId: 'ahri',
      },
    ],
  },
  {
    id: 'ionia_path_4',
    name: 'Shadow Order',
    flavor: 'Infiltrate the domain of shadow assassins',
    paths: [
      {
        id: 'ionia_path_4_safe',
        name: 'Safe Route - Outer Shadows',
        description: 'Face lesser shadow operatives',
        difficulty: 'safe' as const,
        enemyIds: [
          'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin',
          IONIA_ELITES[0].id,
          'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin', 'ionia_shadow_assassin',
          IONIA_BOSSES[0].id,
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_4_balanced',
        name: 'Balanced Route - Inner Sanctum',
        description: 'Battle through shadow defenses',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow',
          'random:elite:martial',
          'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow',
          'random:boss:shadow',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'ionia_shadow_reaper',
      },
      {
        id: 'ionia_path_4_risky',
        name: 'Risky Route - The Dark Heart',
        description: 'Face the ultimate shadow challenge',
        difficulty: 'risky' as const,
        enemyIds: [
          'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow',
          'random:elite:martial',
          'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow', 'random:minion:shadow',
          'ionia_shadow_reaper',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.0,
      },
    ],
  },
  {
    id: 'ionia_path_5',
    name: 'Harmony and Balance',
    flavor: 'Find equilibrium in Ionia\'s diverse challenges',
    paths: [
      {
        id: 'ionia_path_5_safe',
        name: 'Safe Route - Balanced Path',
        description: 'A harmonious journey through Ionia',
        difficulty: 'safe' as const,
        enemyIds: [
          IONIA_MINIONS[0].id, IONIA_MINIONS[2].id, IONIA_MINIONS[3].id, IONIA_MINIONS[4].id,
          IONIA_ELITES[1].id,
          IONIA_MINIONS[0].id, IONIA_MINIONS[2].id, IONIA_MINIONS[3].id, IONIA_MINIONS[4].id,
          IONIA_BOSSES[1].id,
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
      },
      {
        id: 'ionia_path_5_balanced',
        name: 'Balanced Route - Shifting Forces',
        description: 'Face a variety of Ionian challenges',
        difficulty: 'safe' as const,
        enemyIds: [
          'random:minion:spirit', 'random:minion:martial', 'random:minion:vastayan', 'random:minion:shadow',
          'random:elite:spirit',
          'random:minion:spirit', 'random:minion:martial', 'random:minion:vastayan', 'random:minion:shadow',
          'random:boss:spirit',
        ],
        lootType: 'mixed' as const,
        rewardGoldMultiplier: 1.0,
        rewardExpMultiplier: 1.0,
        finalBossId: 'ionia_ancient_spirit',
      },
      {
        id: 'ionia_path_5_risky',
        name: 'Risky Route - Ultimate Trial',
        description: 'Face Ionia\'s greatest champions',
        difficulty: 'risky' as const,
        enemyIds: [
          'random:minion:spirit', 'random:minion:martial', 'random:minion:vastayan', 'random:minion:shadow',
          'random:elite:martial',
          'random:minion:spirit', 'random:minion:martial', 'random:minion:vastayan', 'random:minion:shadow',
          'yasuo',
        ],
        lootType: 'damage' as const,
        rewardGoldMultiplier: 1.5,
        rewardExpMultiplier: 1.2,
        finalBossId: 'yasuo',
      },
    ],
  },
];

