/**
 * IMMOLATE PASSIVE - INTEGRATION EXAMPLE
 * This file shows how to integrate Bami's Cinder's Immolate passive into the Battle component
 * 
 * Copy-paste relevant sections into your BattleSystem or Battle component
 */

import { applyBurn, getBurnDamage, getBurnStacks, getBurnDuration } from './statusEffects';
import { getItemById } from './items';

// ============================================================================
// STEP 1: Count Bami's Cinder Items
// ============================================================================

/**
 * Get the number of Bami's Cinder items a character has
 */
function getBamiCinderCount(inventory: Array<{ itemId: string; quantity: number }>): number {
  const bamiItem = inventory.find(item => item.itemId === 'bamis_cinder');
  return bamiItem ? bamiItem.quantity : 0;
}

// ============================================================================
// STEP 2: Apply Burn on Attack
// ============================================================================

/**
 * When player attacks with physical damage, apply burn to enemy
 * Call this after player deals physical attack damage
 */
function handlePlayerPhysicalAttack(
  effects: any[],
  enemyId: string,
  currentTime: number,
  playerInventory: Array<{ itemId: string; quantity: number }>,
  damageType: 'physical' | 'spell'
): any[] {
  // Only apply burn for physical attacks (not spell attacks)
  if (damageType !== 'physical') {
    return effects;
  }

  const bamiCount = getBamiCinderCount(playerInventory);
  
  if (bamiCount > 0) {
    // Apply burn stacks (additive: 1 Bami = 1 stack, 2 Bami = 2 stacks per hit)
    effects = applyBurn(effects, enemyId, bamiCount, currentTime, 'player');
    
    console.log(`Applied ${bamiCount} burn stack(s) to enemy`);
  }

  return effects;
}

/**
 * When enemy attacks with physical damage, apply burn to player
 * Call this after enemy deals physical attack damage
 */
function handleEnemyPhysicalAttack(
  effects: any[],
  playerId: string,
  currentTime: number,
  enemyHasImmolate: boolean = false, // Whether enemy has Bami's Cinder
  enemyBamiCount: number = 0
): any[] {
  if (!enemyHasImmolate || enemyBamiCount === 0) {
    return effects;
  }

  // Apply burn stacks from enemy
  effects = applyBurn(effects, playerId, enemyBamiCount, currentTime, 'enemy');
  
  console.log(`Enemy applied ${enemyBamiCount} burn stack(s) to player`);

  return effects;
}

// ============================================================================
// STEP 3: Apply Burn Damage Each Turn
// ============================================================================

/**
 * At the start of each turn, apply burn damage to both player and enemy
 * Call this during the turn start phase
 */
function applyBurnDamageAtTurnStart(
  effects: any[],
  playerState: any,
  enemyState: any,
  currentTime: number
): { playerDamage: number; enemyDamage: number } {
  // Get burn damage for player
  const playerBurnDamage = getBurnDamage(effects, 'player', currentTime);
  if (playerBurnDamage > 0) {
    playerState.hp -= playerBurnDamage;
    console.log(`Player takes ${playerBurnDamage} burn damage`);
  }

  // Get burn damage for enemy
  const enemyBurnDamage = getBurnDamage(effects, 'enemy', currentTime);
  if (enemyBurnDamage > 0) {
    enemyState.hp -= enemyBurnDamage;
    console.log(`Enemy takes ${enemyBurnDamage} burn damage`);
  }

  return {
    playerDamage: playerBurnDamage,
    enemyDamage: enemyBurnDamage,
  };
}

// ============================================================================
// STEP 4: Display Burn Status (UI)
// ============================================================================

/**
 * Get burn status string for UI display
 */
function getBurnStatusString(
  effects: any[],
  entityId: string,
  currentTime: number
): string {
  const stacks = getBurnStacks(effects, entityId, currentTime);
  if (stacks === 0) return '';

  const duration = getBurnDuration(effects, entityId, currentTime);
  const damage = stacks * 15;

  return `🔥 Burn x${stacks} (${Math.ceil(duration)} turns) - ${damage} dmg/turn`;
}

// ============================================================================
// COMPLETE EXAMPLE: Where to call these functions in Battle Loop
// ============================================================================

/**
 * Example of how to integrate into battle loop
 */
function exampleBattleLoopIntegration() {
  let effects: any[] = [];
  let playerState = { hp: 100, inventory: [{ itemId: 'bamis_cinder', quantity: 2 }] };
  let enemyState = { hp: 100 };
  let currentTime = 0;

  // ===== TURN 1: Player attacks =====
  console.log('\n=== TURN 1: Player Attack ===');
  
  // Player deals 30 physical damage
  const playerDamage = 30;
  enemyState.hp -= playerDamage;
  console.log(`Player deals ${playerDamage} damage to enemy`);

  // Apply burn (2 Bami items = 2 stacks)
  effects = handlePlayerPhysicalAttack(
    effects,
    'enemy',
    currentTime,
    playerState.inventory,
    'physical'
  );

  currentTime += 1;

  // ===== TURN 2: Burn damage + Enemy attacks =====
  console.log('\n=== TURN 2: Burn Damage + Enemy Attack ===');
  
  // Apply burn damage at start of turn
  const { playerDamage: burnDmgTaken, enemyDamage: enemyBurnDmg } = 
    applyBurnDamageAtTurnStart(effects, playerState, enemyState, currentTime);

  // Enemy deals 25 physical damage (no Immolate)
  const enemyPhysicalDamage = 25;
  playerState.hp -= enemyPhysicalDamage;
  console.log(`Enemy deals ${enemyPhysicalDamage} damage to player`);

  currentTime += 1;

  // ===== TURN 3: Burn damage expires if no new attacks =====
  console.log('\n=== TURN 3: Turn with no attacks ===');
  
  const { enemyDamage: turn3Burn } = 
    applyBurnDamageAtTurnStart(effects, playerState, enemyState, currentTime);

  // After this turn, burn expires (2 turns have passed)
  console.log('Burn is about to expire (was 2 turns, now 1 turn left)');
  
  currentTime += 2; // Simulate 2 turns passing

  // ===== TURN 5: Check burn expiration =====
  console.log('\n=== TURN 5: Burn Expired ===');
  
  const burnStacks = getBurnStacks(effects, 'enemy', currentTime);
  console.log(`Enemy burn stacks: ${burnStacks} (expired)`);
}

// ============================================================================
// UTILITY: Debug Burn Status
// ============================================================================

/**
 * Print current burn status for debugging
 */
function debugBurnStatus(effects: any[], currentTime: number) {
  console.log('\n=== BURN STATUS ===');
  console.log(`Player burn: ${getBurnStatusString(effects, 'player', currentTime)}`);
  console.log(`Enemy burn: ${getBurnStatusString(effects, 'enemy', currentTime)}`);
}

export {
  getBamiCinderCount,
  handlePlayerPhysicalAttack,
  handleEnemyPhysicalAttack,
  applyBurnDamageAtTurnStart,
  getBurnStatusString,
  debugBurnStatus,
};
