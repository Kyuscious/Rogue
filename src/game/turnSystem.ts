/**
 * Turn System - Similar to Othercide
 * 
 * Each entity has a NextTurnTime that increases based on their stats.
 * The entity with the lowest NextTurnTime acts next.
 * 
 * Attack Speed: How often you can attack
 *   - 0.5 = every 2 units on the bar
 *   - 1.0 = every 1 unit on the bar
 *   - 2.0 = every 0.5 units on the bar
 * 
 * Ability Haste: How often you can cast spells
 *   - 0 = every 1 unit on the bar
 *   - 50 = every 0.67 units on the bar (50% cooldown reduction)
 *   - 100 = every 0.5 units on the bar (100% cooldown reduction cap)
 */

export interface TurnEntity {
  id: string;
  name: string;
  nextTurnTime: number;
  speed: number; // How often can attack (higher = more often)
  haste: number; // Cooldown reduction in % (0-100)
  isStuned: boolean;
  stunDuration: number;
  isSlowed: boolean;
  slowAmount: number; // 0-100, percentage reduction to attack speed
}

export interface TurnAction {
  entityId: string;
  entityName: string;
  time: number;
  actionType: 'attack' | 'spell' | 'ability' | 'effect';
  description: string;
}

/**
 * Calculate the next turn time for an entity after they act
 */
export function getNextTurnIncrement(entity: TurnEntity): number {
  let baseIncrement = 1 / Math.max(0.1, entity.speed); // Inverse of attack speed
  
  // Apply slow effect
  if (entity.isSlowed) {
    baseIncrement = baseIncrement * (1 + entity.slowAmount / 100);
  }
  
  // Apply stun by pushing turn time further
  if (entity.isStuned) {
    baseIncrement += entity.stunDuration;
  }
  
  return baseIncrement;
}

/**
 * Calculate next spell casting time
 */
export function getNextSpellIncrement(entity: TurnEntity): number {
  let baseIncrement = 2; // Base spell cooldown is 2 units (longer than attacks)
  
  // Ability Haste reduces cooldown (max 100% reduction = 50% of base)
  const cooldownReduction = Math.min(entity.haste, 100) / 100;
  baseIncrement = baseIncrement * (1 - cooldownReduction * 0.5); // Max 50% reduction
  
  // Apply slow effect to ability cooldown as well
  if (entity.isSlowed) {
    baseIncrement = baseIncrement * (1 + entity.slowAmount / 100);
  }
  
  return baseIncrement;
}

/**
 * Generate turn order for the next N actions in the battle
 */
export function generateTurnSequence(
  playerEntity: TurnEntity,
  enemyEntity: TurnEntity,
  actionCount: number = 20
): TurnAction[] {
  const actions: TurnAction[] = [];
  
  let playerNextAttack = playerEntity.nextTurnTime;
  let playerNextSpell = playerEntity.nextTurnTime + 2; // Spells start with initial delay
  let enemyNextAttack = enemyEntity.nextTurnTime;
  let enemyNextSpell = enemyEntity.nextTurnTime + 2; // Spells start with initial delay
  
  for (let i = 0; i < actionCount; i++) {
    // Find who acts next
    const nextTimes = [
      { time: playerNextAttack, entity: playerEntity, type: 'attack' as const },
      { time: playerNextSpell, entity: playerEntity, type: 'spell' as const },
      { time: enemyNextAttack, entity: enemyEntity, type: 'attack' as const },
      { time: enemyNextSpell, entity: enemyEntity, type: 'spell' as const },
    ];
    
    const next = nextTimes.reduce((min, curr) => 
      curr.time < min.time ? curr : min
    );
    
    actions.push({
      entityId: next.entity.id,
      entityName: next.entity.name,
      time: next.time,
      actionType: next.type === 'attack' ? 'attack' : 'spell',
      description: `${next.entity.name} ${next.type}s`,
    });
    
    // Update the entity's next action time
    if (next.entity.id === playerEntity.id && next.type === 'attack') {
      playerNextAttack += getNextTurnIncrement(playerEntity);
    } else if (next.entity.id === playerEntity.id && next.type === 'spell') {
      playerNextSpell += getNextSpellIncrement(playerEntity);
    } else if (next.entity.id === enemyEntity.id && next.type === 'attack') {
      enemyNextAttack += getNextTurnIncrement(enemyEntity);
    } else if (next.entity.id === enemyEntity.id && next.type === 'spell') {
      enemyNextSpell += getNextSpellIncrement(enemyEntity);
    }
  }
  
  return actions;
}

/**
 * Get the current acting entity based on turn sequence
 */
export function getCurrentActor(
  playerEntity: TurnEntity,
  enemyEntity: TurnEntity
): 'player' | 'enemy' {
  const playerNextAction = Math.min(playerEntity.nextTurnTime, playerEntity.nextTurnTime);
  const enemyNextAction = Math.min(enemyEntity.nextTurnTime, enemyEntity.nextTurnTime);
  
  return playerNextAction <= enemyNextAction ? 'player' : 'enemy';
}

/**
 * Stun an entity by pushing their turn times forward
 */
export function stunEntity(entity: TurnEntity, duration: number): TurnEntity {
  return {
    ...entity,
    isStuned: true,
    stunDuration: duration,
    nextTurnTime: entity.nextTurnTime + duration,
  };
}

/**
 * Slow an entity
 */
export function slowEntity(entity: TurnEntity, slowAmount: number): TurnEntity {
  return {
    ...entity,
    isSlowed: true,
    slowAmount: Math.min(slowAmount, 100),
  };
}

/**
 * Execute an attack and advance the turn counter
 */
export function executeAttack(entity: TurnEntity): TurnEntity {
  return {
    ...entity,
    nextTurnTime: entity.nextTurnTime + getNextTurnIncrement(entity),
  };
}

/**
 * Execute a spell and advance the spell counter
 */
export function executeSpell(entity: TurnEntity): TurnEntity {
  return {
    ...entity,
    nextTurnTime: entity.nextTurnTime + getNextSpellIncrement(entity),
  };
}
