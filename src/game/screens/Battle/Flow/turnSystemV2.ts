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
  speed: number;
  haste: number;
}

export interface TurnAction {
  entityId: string;
  entityName: string;
  turnNumber: number; // Which turn boundary (1, 2, 3, etc.)
  time: number; // Exact time on bar (1.0, 1.3, 1.5, 2.0, etc.)
  actionType: 'attack' | 'spell' | 'move';
  description: string;
  priority: number; // 0 = player first, 1 = enemy second (for ties)
  accumulatedTime?: number; // For backwards compatibility
  isDelayed?: boolean; // True if this action was delayed by a stun
  delayedBy?: number; // Amount of delay applied
}

/**
 * Calculate attack increment based on attack speed
 */
function getAttackIncrement(speed: number): number {
  if (speed >= 1.0) {
    // 1 / AS (attacks start at 1.0)
    return 1.0 / speed;
  } else {
    // 2 - AS (attacks start at 2-AS)
    return 2.0 - speed;
  }
}

/**
 * Calculate first attack time
 */
function getFirstAttackTime(speed: number): number {
  if (speed >= 1.0) {
    return 1.0; // Always start at 1.0 for fast attacks
  } else {
    return 2.0 - speed; // Same as increment for slow attacks
  }
}

/**
 * Calculate spell cooldown based on ability haste
 * Base cooldown is 1.0, reduced by haste/1000
 */
function getSpellCooldown(haste: number): number {
  const cappedHaste = Math.min(haste, 500);
  return 1.0 - (cappedHaste / 1000.0);
}

/**
 * Generate turn sequence for N entities over maxTurns turns.
 * Each entity is independent: its own speed, haste, and ID.
 * Player (id='player') gets priority 0; all others get priority 1.
 */
export function generateTurnSequence(
  playerEntity: TurnEntity,
  enemyEntity: TurnEntity,
  maxTurns: number = 20
): TurnAction[] {
  return generateMultiEntityTurnSequence([playerEntity, enemyEntity], maxTurns);
}

/**
 * Multi-entity turn sequence: accepts any number of entities.
 * Player entity must have id='player'. All other IDs are treated as enemies.
 */
export function generateMultiEntityTurnSequence(
  entities: TurnEntity[],
  maxTurns: number = 20
): TurnAction[] {
  const actions: TurnAction[] = [];

  for (const entity of entities) {
    const isPlayer = entity.id === 'player';
    const priority = isPlayer ? 0 : 1;

    const attackIncrement = getAttackIncrement(entity.speed);
    const firstAttack = getFirstAttackTime(entity.speed);
    const spellCooldown = getSpellCooldown(entity.haste);

    for (let turn = 1; turn <= maxTurns; turn++) {
      // Attacks
      let attackTime = firstAttack;
      while (attackTime < turn + 1) {
        if (attackTime >= turn) {
          actions.push({
            entityId: entity.id,
            entityName: entity.name,
            turnNumber: turn,
            time: attackTime,
            accumulatedTime: attackTime,
            actionType: 'attack',
            description: `${entity.name} attacks`,
            priority,
          });
        }
        attackTime += attackIncrement;
      }

      // Spells
      let spellTime = spellCooldown;
      let spellCount = 0;
      while (spellTime < turn + 1 && spellCount < 100) {
        if (spellTime >= turn) {
          actions.push({
            entityId: entity.id,
            entityName: entity.name,
            turnNumber: turn,
            time: spellTime,
            accumulatedTime: spellTime,
            actionType: 'spell',
            description: `${entity.name} casts spell`,
            priority,
          });
        }
        spellTime += spellCooldown;
        spellCount++;
      }
    }
  }

  // Sort chronologically, player first on ties
  return actions.sort((a, b) => {
    if (Math.abs(a.time - b.time) > 0.0001) return a.time - b.time;
    return a.priority - b.priority;
  });
}

/**
 * Apply stun delay to future actions of an entity
 * @param turnSequence Current turn sequence
 * @param targetEntityId Entity to stun ('player' or 'enemy')
 * @param stunDuration Duration in turns to delay actions
 * @param currentTime Current time on timeline when stun is applied
 * @returns Updated turn sequence with delayed actions
 */
export function applyStunDelay(
  turnSequence: TurnAction[],
  targetEntityId: string,
  stunDuration: number,
  currentTime: number
): TurnAction[] {
  return turnSequence.map((action) => {
    // Only delay future actions of the target entity
    if (action.entityId === targetEntityId && action.time > currentTime) {
      return {
        ...action,
        time: action.time + stunDuration,
        turnNumber: Math.ceil(action.time + stunDuration),
        isDelayed: true,
        delayedBy: (action.delayedBy || 0) + stunDuration,
      };
    }
    return action;
  }).sort((a, b) => {
    if (Math.abs(a.time - b.time) < 0.001) {
      return a.priority - b.priority;
    }
    return a.time - b.time;
  });
}

/**
 * Stun an entity
 */
export function stunEntity(entity: TurnEntity): TurnEntity {
  return entity;
}

/**
 * Chills an entity (reduces attack speed)
 */
export function chillEntity(entity: TurnEntity, amount: number): TurnEntity {
  return {
    ...entity,
    speed: Math.max(0.1, entity.speed * (1 - amount / 100)),
  };
}

