/**
 * MIGRATION SCRIPT - Easy Batch Update for Enemy Database
 * 
 * This script shows you how to easily update all enemies with class and lootType
 * 
 * USAGE:
 * 1. Copy this entire file into your browser console (F12)
 * 2. Or use it as a template to understand the structure
 * 3. It will generate properly formatted enemy objects
 * 
 * The script provides helper functions to classify enemies and generate the output
 */

// Step 1: Copy this mapping - it shows which classes to use for each enemy by name
const ENEMY_CLASS_MAP: Record<string, 'mage' | 'tank' | 'fighter' | 'assassin' | 'adc' | 'support' | 'bruiser' | 'enchanter'> = {
  // Demacia
  'Training Dummy': 'tank',
  'Deserter Scout': 'adc',
  'Shadow Wisp': 'mage',
  'Crag Beast': 'tank',
  'Silverwing Raptor': 'assassin',
  'Corrupted Soldier': 'fighter',
  'Void Minion': 'mage',
  'Sylas': 'bruiser',
  'Garen': 'tank',
  'Shadow Lord': 'mage',
  
  // Shurima
  'Sand Soldier': 'fighter',
  'Void Scout': 'adc',
  'Corrupted Golem': 'tank',
  'Sun Sentinel': 'fighter',
  'Azir': 'mage',
  'Void Herald': 'mage',
  
  // Ionia
  'Spirit Beast': 'fighter',
  'Void Creature': 'mage',
  'Corrupted Monk': 'fighter',
  'Spirit Wisp': 'mage',
  'Light Guardian': 'support',
  'Spirit Guardian': 'support',
  'Wind Warrior': 'fighter',
  'Yasuo': 'assassin',
  'Balance Keeper': 'enchanter',
};

// Step 2: LootType mapping based on class
const CLASS_LOOT_MAP = {
  'mage': 'abilityPower',
  'tank': 'tankDefense',
  'fighter': 'hybrid',
  'assassin': 'critical',
  'adc': 'attackDamage',
  'support': 'utility',
  'bruiser': 'hybrid',
  'enchanter': 'abilityPower',
};

/**
 * SIMPLE COPY-PASTE TEMPLATE FOR EACH ENEMY
 * Just fill in the values and paste into enemyDatabase.ts
 * 
 * Example for a minion:
 * {
 *   id: 'enemy_id',
 *   name: 'Enemy Name',
 *   region: 'demacia',
 *   tier: 'minion',
 *   class: 'tank',                    // NEW: ADD THIS
 *   hp: 25,
 *   maxHp: 25,
 *   attack: 12,
 *   defense: 8,
 *   speed: 20,
 *   abilities: [],
 *   level: 1,
 *   itemDrops: ['cloth_armor', 'health_potion'],
 *   goldReward: 8,
 *   experienceReward: 4,
 *   lootType: 'tankDefense',          // NEW: ADD THIS
 * },
 */

/**
 * INSTRUCTIONS FOR BATCH UPDATE:
 * 
 * OPTION 1: Manual Find & Replace (Easiest for a few enemies)
 * ============================================================
 * 1. Open src/game/enemyDatabase.ts
 * 2. For each enemy object, add two lines after "tier: 'minion'," etc:
 *    - class: '[type from ENEMY_CLASS_MAP above]',
 *    - lootType: '[type from CLASS_LOOT_MAP above]',
 * 
 * Example enemy before:
 *   {
 *     id: 'training_dummy',
 *     name: 'Training Dummy',
 *     region: 'demacia',
 *     tier: 'minion',
 *     hp: 25,
 *     ...
 *   }
 * 
 * After adding class and lootType:
 *   {
 *     id: 'training_dummy',
 *     name: 'Training Dummy',
 *     region: 'demacia',
 *     tier: 'minion',
 *     class: 'tank',
 *     hp: 25,
 *     ...
 *     lootType: 'tankDefense',
 *   }
 * 
 * 
 * OPTION 2: Script Generator (For all enemies at once)
 * =====================================================
 * Use this function to generate the updated code:
 */

function generateEnemyClassUpdates() {
  console.log(`
  ============================================
  ENEMY CLASS & LOOT TYPE REFERENCE
  ============================================
  `);
  
  Object.entries(ENEMY_CLASS_MAP).forEach(([name, className]) => {
    const lootType = CLASS_LOOT_MAP[className];
    console.log(`"${name}": class: '${className}', lootType: '${lootType}'`);
  });
  
  console.log(`
  ============================================
  
  To update your enemyDatabase.ts:
  
  1. Find each enemy by name
  2. Add "class: '[class_name]'," after the tier line
  3. Add "lootType: '[loot_type]'," at the end (before closing brace)
  
  Classes available: 'mage', 'tank', 'fighter', 'assassin', 'adc', 'support', 'bruiser', 'enchanter'
  LootTypes available: 'attackDamage', 'abilityPower', 'tankDefense', 'mobility', 'utility', 'hybrid', 'critical'
  ============================================
  `);
}

// Run this to see the mapping
generateEnemyClassUpdates();

/**
 * QUICK REFERENCE BY TIER
 * ========================
 * 
 * MINIONS (tier: 'minion'):
 * - Training Dummy: tank
 * - Deserter Scout: adc
 * - Shadow Wisp: mage
 * - Crag Beast: tank
 * - Sand Soldier: fighter
 * - Void Scout: adc
 * - Spirit Beast: fighter
 * - Void Creature: mage
 * - Corrupted Monk: fighter
 * - Spirit Wisp: mage
 * - Light Guardian: support
 * 
 * ELITES (tier: 'elite'):
 * - Silverwing Raptor: assassin
 * - Corrupted Soldier: fighter
 * - Void Minion (Demacia): mage
 * - Corrupted Golem: tank
 * - Spirit Guardian: support
 * 
 * CHAMPIONS (tier: 'champion'):
 * - Sylas: bruiser
 * - Garen: tank
 * - Sun Sentinel: fighter
 * - Azir: mage
 * - Void Herald: mage
 * - Wind Warrior: fighter
 * - Yasuo: assassin
 * - Balance Keeper: enchanter
 * 
 * BOSSES (tier: 'boss'):
 * - Garen Boss: tank
 * - Shadow Lord: mage
 * - Azir Encounter: mage
 * - Yasuo Encounter: assassin
 * - Balance Master: enchanter
 * ========================
 */

export { ENEMY_CLASS_MAP, CLASS_LOOT_MAP, generateEnemyClassUpdates };
