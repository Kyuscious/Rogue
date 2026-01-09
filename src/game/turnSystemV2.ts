/**
 * Turn System V2 - Corrected Inverse Cooldown Model
 * 
 * Bar starts at 1.0. Entities accumulate actions based on their stats.
 * 
 * Attack Speed: Inverse cooldown
 *   - 0.7 AS: attacks every 1.3 units (1.3, 2.6, 3.9, ...)
 *   - 0.5 AS: attacks every 1.5 units (1.5, 3.0, 4.5, ...)
 *   - 2.0 AS: attacks every 0.5 units (1.0, 1.5, 2.0, 2.5, ...)
 *   - 7.0 AS: attacks every 0.143 units (1.0, 1.143, 1.286, ...)
 * 
 * Ability Haste: Spell cooldown reduction
 *   - 0 haste: spells at 1.0, 2.0, 3.0 (1 per turn)
 *   - 10 haste: spells at 0.99, 1.99, 2.99
 *   - 100 haste: spells at 0.9, 1.9, 2.9
 *   - 500 haste (cap): spells at 0.5, 1.0, 1.5, 2.0 (2 per turn)
 */

export interface TurnEntity {
  id: string;
  name: string;
  attackSpeed: number;
  abilityHaste: number;
}

export interface TurnAction {
  entityId: string;
  entityName: string;
  turnNumber: number; // Which turn boundary (1, 2, 3, etc.)
  time: number; // Exact time on bar (1.0, 1.3, 1.5, 2.0, etc.)
  actionType: 'attack' | 'spell';
  description: string;
  priority: number; // 0 = player first, 1 = enemy second (for ties)
  accumulatedTime?: number; // For backwards compatibility
}

/**
 * Calculate attack increment based on attack speed
 */
function getAttackIncrement(attackSpeed: number): number {
  if (attackSpeed >= 1.0) {
    // 1 / AS (attacks start at 1.0)
    return 1.0 / attackSpeed;
  } else {
    // 2 - AS (attacks start at 2-AS)
    return 2.0 - attackSpeed;
  }
}

/**
 * Calculate first attack time
 */
function getFirstAttackTime(attackSpeed: number): number {
  if (attackSpeed >= 1.0) {
    return 1.0; // Always start at 1.0 for fast attacks
  } else {
    return 2.0 - attackSpeed; // Same as increment for slow attacks
  }
}

/**
 * Calculate spell cooldown based on ability haste
 * Base cooldown is 1.0, reduced by haste/1000
 */
function getSpellCooldown(abilityHaste: number): number {
  const cappedHaste = Math.min(abilityHaste, 500);
  return 1.0 - (cappedHaste / 1000.0);
}

/**
 * Generate turn sequence for N turns
 */
export function generateTurnSequence(
  playerEntity: TurnEntity,
  enemyEntity: TurnEntity,
  maxTurns: number = 20
): TurnAction[] {
  const actions: TurnAction[] = [];
  
  // Calculate attack parameters
  const playerAttackIncrement = getAttackIncrement(playerEntity.attackSpeed);
  const playerFirstAttack = getFirstAttackTime(playerEntity.attackSpeed);
  const enemyAttackIncrement = getAttackIncrement(enemyEntity.attackSpeed);
  const enemyFirstAttack = getFirstAttackTime(enemyEntity.attackSpeed);
  
  // Calculate spell parameters
  const playerSpellCooldown = getSpellCooldown(playerEntity.abilityHaste);
  const enemySpellCooldown = getSpellCooldown(enemyEntity.abilityHaste);
  
  // Generate actions for each turn
  for (let turn = 1; turn <= maxTurns; turn++) {
    // Generate player attacks for this turn
    let playerAttackTime = playerFirstAttack;
    while (playerAttackTime < turn + 1) {
      if (playerAttackTime >= turn) {
        actions.push({
          entityId: 'player',
          entityName: playerEntity.name,
          turnNumber: turn,
          time: playerAttackTime,
          accumulatedTime: playerAttackTime,
          actionType: 'attack',
          description: `${playerEntity.name} attacks`,
          priority: 0,
        });
      }
      playerAttackTime += playerAttackIncrement;
    }
    
    // Generate enemy attacks for this turn
    let enemyAttackTime = enemyFirstAttack;
    while (enemyAttackTime < turn + 1) {
      if (enemyAttackTime >= turn) {
        actions.push({
          entityId: 'enemy',
          entityName: enemyEntity.name,
          turnNumber: turn,
          time: enemyAttackTime,
          accumulatedTime: enemyAttackTime,
          actionType: 'attack',
          description: `${enemyEntity.name} attacks`,
          priority: 1,
        });
      }
      enemyAttackTime += enemyAttackIncrement;
    }
    
    // Generate player spells for this turn
    let playerSpellTime = playerSpellCooldown;
    let playerSpellCount = 0;
    while (playerSpellTime < turn + 1 && playerSpellCount < 100) {
      if (playerSpellTime >= turn) {
        actions.push({
          entityId: 'player',
          entityName: playerEntity.name,
          turnNumber: turn,
          time: playerSpellTime,
          accumulatedTime: playerSpellTime,
          actionType: 'spell',
          description: `${playerEntity.name} casts spell`,
          priority: 0,
        });
      }
      playerSpellTime += playerSpellCooldown;
      playerSpellCount++;
    }
    
    // Generate enemy spells for this turn
    let enemySpellTime = enemySpellCooldown;
    let enemySpellCount = 0;
    while (enemySpellTime < turn + 1 && enemySpellCount < 100) {
      if (enemySpellTime >= turn) {
        actions.push({
          entityId: 'enemy',
          entityName: enemyEntity.name,
          turnNumber: turn,
          time: enemySpellTime,
          accumulatedTime: enemySpellTime,
          actionType: 'spell',
          description: `${enemyEntity.name} casts spell`,
          priority: 1,
        });
      }
      enemySpellTime += enemySpellCooldown;
      enemySpellCount++;
    }
  }
  
  // Sort by: time, then priority
  return actions.sort((a, b) => {
    if (Math.abs(a.time - b.time) > 0.0001) {
      return a.time - b.time; // Chronological order
    }
    return a.priority - b.priority; // Player (0) before enemy (1) on ties
  });
}

/**
 * Stun an entity
 */
export function stunEntity(entity: TurnEntity): TurnEntity {
  return entity;
}

/**
 * Slow an entity (reduces attack speed)
 */
export function slowEntity(entity: TurnEntity, amount: number): TurnEntity {
  return {
    ...entity,
    attackSpeed: Math.max(0.1, entity.attackSpeed * (1 - amount / 100)),
  };
}

