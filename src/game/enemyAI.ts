/**
 * ENEMY AI SYSTEM
 * 
 * Handles decision-making for enemy turns in combat.
 * Enemies can use weapons, spells, items, and movement just like the player.
 * 
 * AI Behavior Profiles:
 * - AGGRESSIVE: Prioritizes damage, uses offensive abilities
 * - DEFENSIVE: Prioritizes survival, heals when low
 * - BALANCED: Mix of offense/defense
 * - RANGED: Maintains distance, uses spells
 * - MELEE: Closes distance, uses weapons
 */

import { Character } from './types';
import { getWeaponById } from './weapons';
import { getSpellById } from './spells';
import { getItemById } from './items';

export type AIBehaviorProfile = 
  | 'aggressive' 
  | 'defensive' 
  | 'balanced' 
  | 'ranged' 
  | 'melee'
  | 'tactical'; // Uses terrain/positioning strategically

export interface EnemyLoadout {
  weapons: string[]; // Up to 2 weapon IDs
  spells: string[]; // Up to 3 spell IDs
  items: string[]; // Up to 1 consumable item ID
  equippedWeaponIndex: number;
  equippedSpellIndex: number;
}

export interface AIDecisionContext {
  enemy: Character;
  player: Character;
  enemyPosition: number;
  playerPosition: number;
  enemyStats: any; // ScaledStats
  playerStats: any; // ScaledStats
  turnCounter: number;
  weaponCooldowns: Record<string, number>;
  spellCooldowns: Record<string, number>;
  behaviorProfile: AIBehaviorProfile;
  enemyLoadout: EnemyLoadout;
}

export type AIAction = 
  | { type: 'weapon'; weaponIndex: number }
  | { type: 'spell'; spellIndex: number }
  | { type: 'item'; itemId: string }
  | { type: 'move'; direction: 'towards' | 'away'; distance: number }
  | { type: 'skip' };

/**
 * Calculate priority score for using a weapon (higher = better)
 */
function evaluateWeaponUse(
  context: AIDecisionContext,
  weaponIndex: number
): number {
  const { enemyStats, enemyLoadout, weaponCooldowns } = context;
  const distance = Math.abs(context.enemyPosition - context.playerPosition);
  
  const weaponId = enemyLoadout.weapons[weaponIndex];
  if (!weaponId) return 0;
  
  const weapon = getWeaponById(weaponId);
  if (!weapon) return 0;
  
  // Check cooldown
  const cooldown = weaponCooldowns[weaponId] || 0;
  if (cooldown > 0) return 0;
  
  // Check range
  const attackRange = enemyStats.attackRange || 125;
  if (distance > attackRange) return 0; // Out of range
  
  let score = 50; // Base score for available weapon
  
  // Prefer weapons with higher damage potential
  if (weapon.effects) {
    weapon.effects.forEach((effect: any) => {
      if (effect.type === 'damage' && effect.damageScaling) {
        // Calculate potential damage
        let potentialDamage = 0;
        if (effect.damageScaling.attackDamage) {
          potentialDamage += (enemyStats.attackDamage || 0) * (effect.damageScaling.attackDamage / 100);
        }
        if (effect.damageScaling.abilityPower) {
          potentialDamage += (enemyStats.abilityPower || 0) * (effect.damageScaling.abilityPower / 100);
        }
        score += potentialDamage * 0.5; // Weight damage potential
      }
      
      // Bonus for stun effects
      if (effect.type === 'stun') {
        score += 30;
      }
      
      // Bonus for gap-closing movement
      if (effect.type === 'movement' && effect.movementAmount && effect.movementAmount > 0) {
        score += 20;
      }
    });
  }
  
  // Bonus if weapon cooldown is low (encourages using cooldowns)
  if (weapon.cooldown && weapon.cooldown > 0) {
    score += 10; // Slight bonus for cooldown abilities (impactful)
  }
  
  return score;
}

/**
 * Calculate priority score for using a spell (higher = better)
 */
function evaluateSpellUse(
  context: AIDecisionContext,
  spellIndex: number
): number {
  const { enemy, enemyStats, enemyLoadout, spellCooldowns } = context;
  const distance = Math.abs(context.enemyPosition - context.playerPosition);
  
  const spellId = enemyLoadout.spells[spellIndex];
  if (!spellId) return 0;
  
  const spell = getSpellById(spellId);
  if (!spell) return 0;
  
  // Check cooldown
  const cooldown = spellCooldowns[spellId] || 0;
  if (cooldown > 0) return 0;
  
  // Check range
  const spellRange = spell.range || 500;
  if (distance > spellRange) return 0; // Out of range
  
  let score = 50; // Base score for available spell
  
  // Evaluate spell effects
  if (spell.effects) {
    spell.effects.forEach((effect: any) => {
      if (effect.type === 'damage' && effect.damageScaling) {
        // Calculate potential damage
        let potentialDamage = 0;
        if (effect.damageScaling.abilityPower) {
          potentialDamage += (enemyStats.abilityPower || 0) * (effect.damageScaling.abilityPower / 100);
        }
        if (effect.damageScaling.attackDamage) {
          potentialDamage += (enemyStats.attackDamage || 0) * (effect.damageScaling.attackDamage / 100);
        }
        score += potentialDamage * 0.5;
      }
      
      // High priority for healing when low HP
      if (effect.type === 'heal') {
        const healthPercent = (enemy.hp / enemyStats.health) * 100;
        if (healthPercent < 30) {
          score += 100; // CRITICAL: Heal when very low
        } else if (healthPercent < 50) {
          score += 50; // HIGH: Heal when low
        } else if (healthPercent < 70) {
          score += 20; // MEDIUM: Heal when damaged
        }
      }
      
      // Bonus for stun effects
      if (effect.type === 'stun') {
        score += 40; // Spells with stun are high priority
      }
      
      // Bonus for debuffs
      if (effect.type === 'debuff') {
        score += 25;
      }
      
      // Bonus for buffs
      if (effect.type === 'buff') {
        score += 30;
      }
    });
  }
  
  // Higher priority for spells with cooldowns (usually stronger)
  if (spell.cooldown && spell.cooldown > 0) {
    score += 15;
  }
  
  return score;
}

/**
 * Calculate priority score for using an item (higher = better)
 */
function evaluateItemUse(
  context: AIDecisionContext,
  itemId: string
): number {
  const { enemy, enemyStats } = context;
  
  const item = getItemById(itemId);
  if (!item || !item.consumable) return 0;
  
  let score = 0;
  
  // Health potions are only valuable when low HP
  if (itemId === 'health_potion') {
    const healthPercent = (enemy.hp / enemyStats.health) * 100;
    if (healthPercent < 20) {
      score = 90; // CRITICAL
    } else if (healthPercent < 40) {
      score = 60; // HIGH
    } else if (healthPercent < 60) {
      score = 30; // MEDIUM
    }
  }
  
  // Vision items (wards) - low priority for enemies
  if (itemId === 'stealth_ward' || itemId === 'control_ward') {
    score = 10; // Low priority
  }
  
  return score;
}

/**
 * Calculate priority score for moving (higher = better)
 */
function evaluateMovement(
  context: AIDecisionContext,
  direction: 'towards' | 'away'
): number {
  const { enemy, player, enemyStats, playerStats, behaviorProfile } = context;
  const distance = Math.abs(context.enemyPosition - context.playerPosition);
  const attackRange = enemyStats.attackRange || 125;
  const spellRange = 500; // Standard spell range
  
  let score = 0;
  
  if (direction === 'towards') {
    // Moving towards is good when:
    // 1. Out of attack range
    // 2. Melee/aggressive profile
    // 3. Player is low HP (finish them)
    
    if (distance > attackRange) {
      score += 40; // Need to close gap
    }
    
    if (behaviorProfile === 'melee' || behaviorProfile === 'aggressive') {
      score += 30;
    }
    
    const playerHealthPercent = (player.hp / playerStats.health) * 100;
    if (playerHealthPercent < 30) {
      score += 20; // Close in for kill
    }
    
    // Reduce score if already in range
    if (distance <= attackRange) {
      score -= 50; // Already in range, don't move
    }
  } else {
    // Moving away is good when:
    // 1. Low HP (defensive)
    // 2. Ranged profile and too close
    // 3. Player is strong/high HP
    
    const enemyHealthPercent = (enemy.hp / enemyStats.health) * 100;
    if (enemyHealthPercent < 40) {
      score += 50; // Retreat when low
    }
    
    if (behaviorProfile === 'ranged' || behaviorProfile === 'defensive') {
      if (distance < spellRange * 0.5) {
        score += 40; // Maintain distance for ranged
      }
    }
    
    const playerHealthPercent = (player.hp / playerStats.health) * 100;
    if (playerHealthPercent > 70) {
      score += 15; // Be cautious of healthy player
    }
  }
  
  return Math.max(0, score);
}

/**
 * Main AI decision function - returns the best action for the enemy to take
 */
export function decideEnemyAction(context: AIDecisionContext): AIAction {
  const { behaviorProfile, enemyLoadout, enemy, enemyStats } = context;
  
  console.log('🤖 AI Decision Making:', {
    profile: behaviorProfile,
    enemyHp: enemy.hp,
    enemyHpPercent: `${Math.round((enemy.hp / enemyStats.health) * 100)}%`,
    distance: Math.abs(context.enemyPosition - context.playerPosition),
  });
  
  // Evaluate all possible actions
  const actions: Array<{ action: AIAction; score: number }> = [];
  
  // Evaluate weapons
  enemyLoadout.weapons.forEach((weaponId, index) => {
    if (weaponId) {
      const score = evaluateWeaponUse(context, index);
      if (score > 0) {
        actions.push({ action: { type: 'weapon', weaponIndex: index }, score });
        console.log(`  Weapon ${index} (${weaponId}): ${score}`);
      }
    }
  });
  
  // Evaluate spells
  enemyLoadout.spells.forEach((spellId, index) => {
    if (spellId) {
      const score = evaluateSpellUse(context, index);
      if (score > 0) {
        actions.push({ action: { type: 'spell', spellIndex: index }, score });
        console.log(`  Spell ${index} (${spellId}): ${score}`);
      }
    }
  });
  
  // Evaluate items
  enemyLoadout.items.forEach(itemId => {
    if (itemId) {
      const score = evaluateItemUse(context, itemId);
      if (score > 0) {
        actions.push({ action: { type: 'item', itemId }, score });
        console.log(`  Item (${itemId}): ${score}`);
      }
    }
  });
  
  // Evaluate movement
  const towardsScore = evaluateMovement(context, 'towards');
  if (towardsScore > 0) {
    const moveDistance = Math.floor((enemyStats.movementSpeed || 350) / 10);
    actions.push({ 
      action: { type: 'move', direction: 'towards', distance: moveDistance }, 
      score: towardsScore 
    });
    console.log(`  Move towards: ${towardsScore}`);
  }
  
  const awayScore = evaluateMovement(context, 'away');
  if (awayScore > 0) {
    const moveDistance = Math.floor((enemyStats.movementSpeed || 350) / 10);
    actions.push({ 
      action: { type: 'move', direction: 'away', distance: moveDistance }, 
      score: awayScore 
    });
    console.log(`  Move away: ${awayScore}`);
  }
  
  // Behavior profile modifications
  if (behaviorProfile === 'aggressive') {
    // Boost weapon/spell scores, reduce movement away
    actions.forEach(a => {
      if (a.action.type === 'weapon' || a.action.type === 'spell') {
        a.score *= 1.3;
      }
      if (a.action.type === 'move' && a.action.direction === 'away') {
        a.score *= 0.5;
      }
    });
  } else if (behaviorProfile === 'defensive') {
    // Boost healing/item scores, increase movement away
    actions.forEach(a => {
      if (a.action.type === 'item') {
        a.score *= 1.5;
      }
      if (a.action.type === 'move' && a.action.direction === 'away') {
        a.score *= 1.5;
      }
      if (a.action.type === 'weapon' || a.action.type === 'spell') {
        a.score *= 0.8;
      }
    });
  } else if (behaviorProfile === 'ranged') {
    // Boost spell scores, prefer maintaining distance
    actions.forEach(a => {
      if (a.action.type === 'spell') {
        a.score *= 1.4;
      }
      if (a.action.type === 'move' && a.action.direction === 'away') {
        a.score *= 1.2;
      }
    });
  } else if (behaviorProfile === 'melee') {
    // Boost weapon scores, prefer closing distance
    actions.forEach(a => {
      if (a.action.type === 'weapon') {
        a.score *= 1.4;
      }
      if (a.action.type === 'move' && a.action.direction === 'towards') {
        a.score *= 1.2;
      }
    });
  } else if (behaviorProfile === 'tactical') {
    // Boost high-impact cooldown abilities
    actions.forEach(a => {
      if (a.action.type === 'spell') {
        const spellId = enemyLoadout.spells[(a.action as any).spellIndex];
        const spell = getSpellById(spellId);
        if (spell?.cooldown && spell.cooldown > 3) {
          a.score *= 1.5; // Big cooldowns = tactical plays
        }
      }
    });
  }
  
  // Sort actions by score (highest first)
  actions.sort((a, b) => b.score - a.score);
  
  // Return best action, or skip if no good options
  if (actions.length > 0 && actions[0].score > 0) {
    console.log(`  ✅ Selected: ${actions[0].action.type} (score: ${actions[0].score})`);
    return actions[0].action;
  }
  
  console.log('  ❌ No good actions, skipping turn');
  return { type: 'skip' };
}

/**
 * Get default loadout for an enemy (used if not specified)
 */
export function getDefaultEnemyLoadout(): EnemyLoadout {
  return {
    weapons: ['test_weapon'], // Basic weapon
    spells: ['test_spell'],    // Basic spell
    items: [],
    equippedWeaponIndex: 0,
    equippedSpellIndex: 0,
  };
}
