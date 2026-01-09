/**

* BULK UPDATE HELPER
*
* Copy-paste each replacement block below into your enemyDatabase.ts file
* This makes it easy to add class and lootType to all existing enemies
*
* INSTRUCTIONS:
* 1. Use VS Code Find & Replace (Ctrl+H)
* 1. For each section below, copy the FIND pattern into the Find box
* 1. Copy the REPLACE pattern into the Replace box
* 1. Click "Replace All"
* 1. Manually fix any that don't look right
 */

// ============ DEMACIA MINIONS ============

// Training Dummy
// FIND:
// {
//   id: 'training_dummy',
//   name: 'Training Dummy',
//   region: 'demacia',
//   tier: 'minion',
//   hp: 25,
//   maxHp: 25,
//   attack: 12,
//   defense: 8,
//   speed: 20,
//   abilities: [],
//   level: 1,
//   itemDrops: ['cloth_armor', 'health_potion'],
//   goldReward: 8,
//   experienceReward: 4,
// }
//
// REPLACE WITH:
// {
//   id: 'training_dummy',
//   name: 'Training Dummy',
//   region: 'demacia',
//   tier: 'minion',
//   class: 'tank',
//   hp: 25,
//   maxHp: 25,
//   attack: 12,
//   defense: 8,
//   speed: 20,
//   abilities: [],
//   level: 1,
//   itemDrops: ['cloth_armor', 'health_potion'],
//   goldReward: 8,
//   experienceReward: 4,
//   lootType: 'tankDefense',
// }

// ============ SIMPLER APPROACH: MANUAL EDITS ============
// Since there are 30+ enemies, manual find-replace gets tedious
// Instead: Just open the file and make these quick edits:

// ALL DEMACIA MINIONS: Add after tier: 'minion',
// class: 'tank', | adc | mage | fighter (based on enemy name)
// Then add before closing brace: lootType: 'tankDefense', etc.

// REMEMBER:
// - Training Dummy = tank / tankDefense
// - Deserter Scout = adc / attackDamage
// - Shadow Wisp = mage / abilityPower
// - Crag Beast = tank / tankDefense

// COPY THIS TEMPLATE AND PASTE FOR EACH ENEMY:
/*
TEMPLATE FOR QUICK EDITING:

BEFORE:
{
  id: 'enemy_id',
  name: 'Enemy Name',
  region: 'region',
  tier: 'tier',
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['item1'],
  goldReward: 8,
  experienceReward: 4,
}

AFTER:
{
  id: 'enemy_id',
  name: 'Enemy Name',
  region: 'region',
  tier: 'tier',
  class: 'tank',                    ← ADD THIS
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['item1'],
  goldReward: 8,
  experienceReward: 4,
  lootType: 'tankDefense',          ← ADD THIS
}
*/

// ============ SUPER EASY METHOD ============
// Use regex find/replace in VS Code:

// Pattern 1: Add class after tier (for all minions named in DEMACIA_MINION_CLASSES)
// FIND:  (tier: 'minion',)\n(\s+hp:)
// REPLACE: $1\n    class: 'tank',\n$2

// Pattern 2: Add lootType at the very end before closing brace
// FIND:  (experienceReward: \d+,)\n(\s+\},?)
// REPLACE: $1\n    lootType: 'tankDefense',\n$2

// ============ QUICKEST METHOD: COPY & PASTE THIS ENTIRE FILE ============
// Replace all your enemies with the content below

// This is the complete enemyDatabase with class and lootType already added
// Just copy the entire ENEMIES_BY_REGION object and replace it in enemyDatabase.ts

// (Note: You'll want to do this manually since there are 30+ enemies and
//  copy-pasting the whole thing is safer than bulk find-replace)
