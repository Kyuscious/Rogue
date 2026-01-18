import { CharacterStats } from './statsSystem';

export type PassiveId = 
  | 'life_draining'
  | 'enduring_focus'
  | 'drain'
  | 'pathfinder'
  | 'magical_opus'
  | 'reap'
  | 'glory'
  | 'glory_upgraded';

export type PassiveTrigger = 
  | 'battle_start'
  | 'battle_end'
  | 'turn_start'
  | 'turn_end'
  | 'on_hit'
  | 'on_kill'
  | 'gold_gained'
  | 'stat_calculation';

export interface PassiveEffect {
  id: PassiveId;
  name: string;
  description: string;
  trigger: PassiveTrigger;
  
  // Stat modification effects (applied during stat calculation)
  statModifier?: (stats: CharacterStats, level: number) => Partial<CharacterStats>;
  
  // Event-based effects
  onBattleStart?: (state: any) => void;
  onBattleEnd?: (state: any) => void;
  onTurnStart?: (state: any) => void;
  onTurnEnd?: (state: any) => void;
  onHit?: (damage: number, state: any) => number; // Returns modified damage
  onKill?: (state: any) => void;
  onGoldGained?: (goldAmount: number) => number; // Returns modified gold amount
}

/**
 * Item Passive Effects Database
 * These are game-changing effects that alter gameplay mechanics
 */
export const ITEM_PASSIVES: Record<PassiveId, PassiveEffect> = {
  // DORAN'S BLADE: Life Draining
  // Dealing attack damage increases total AD by 1% stacking for the encounter
  life_draining: {
    id: 'life_draining',
    name: 'Life Draining',
    description: 'Dealing attack damage to enemies increases total AD by 1% (stacks for the encounter).',
    trigger: 'on_hit',
    onHit: (damage: number, _state: any) => {
      // This passive is handled in the Battle component
      // When player deals attack damage, we add a combat buff that increases AD by 1%
      // The buff stacks and persists for the entire encounter
      return damage;
    },
  },

  // DORAN'S SHIELD: Enduring Focus
  // After taking damage, heal 5% of that damage over 3 turns
  enduring_focus: {
    id: 'enduring_focus',
    name: 'Enduring Focus',
    description: 'After taking damage, heal 5% of that damage over 3 turns.',
    trigger: 'on_hit',
    onHit: (damage: number, _state: any) => {
      // This passive is handled in the Battle component
      // When player takes damage, we add/update a heal-over-time buff
      // 5% of damage taken is healed over 3 turns (1.67% per turn)
      return damage;
    },
  },

  // DORAN'S RING: Drain
  // Dealing spell damage increases total AP by 1% stacking for the encounter
  drain: {
    id: 'drain',
    name: 'Drain',
    description: 'Dealing spell damage to enemies increases total AP by 1% (stacks for the encounter).',
    trigger: 'on_hit',
    onHit: (damage: number, _state: any) => {
      // This passive is handled in the Battle component
      // When player deals spell damage, we add a combat buff that increases AP by 1%
      // The buff stacks and persists for the entire encounter
      return damage;
    },
  },

  // Rabadon's Deathcap:Bonus Ability Power
  // Bonus Ability Power based on total Ability Power (30% increase)
  magical_opus: {
    id: 'magical_opus',
    name: 'Magical Opus',
    description: 'Increases your total Ability Power by 30%.',
    trigger: 'stat_calculation',
    statModifier: (stats: CharacterStats, _level: number) => {
      const bonusAP = (stats.abilityPower || 0) * 0.3;
      return {
        abilityPower: (stats.abilityPower || 0) + bonusAP,
      };
    },
  },

  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Gain +100% experience and start with 10 rerolls instead of 5.',
    trigger: 'stat_calculation',
    // This passive's effects are handled directly in the game logic:
    // - XP gain is applied in battleFlow.ts applyVictoryRewards
    // - Reroll count is set in store.ts selectStartingItem
  },

  // THE CULL: Reap
  // Killing an enemy awards 10 additional gold (flat amount, not affected by goldGain stat)
  reap: {
    id: 'reap',
    name: 'Reap',
    description: 'Killing an enemy awards 10 additional gold.',
    trigger: 'on_kill',
    // This passive is handled in battleFlow.ts handleEnemyDefeat
    // When an enemy is killed, add +10 flat gold (before goldGain multiplier)
  },
  
  // DARK SEAL: Glory
  // Defeating Champion or Legend tier enemies grants +10 AP permanently
  glory: {
    id: 'glory',
    name: 'Glory',
    description: 'Defeating Champion or Legend tier enemies grants +10 AP permanently (stacks endlessly).',
    trigger: 'on_kill',
    // This passive is handled in the Battle component
    // When Champion/Legend is defeated, adds permanent AP buff
  },
  
  // MEJAI'S SOULSTEALER: Glory (Upgraded)
  // Defeating Champion or Legend tier enemies grants +15 AP permanently
  glory_upgraded: {
    id: 'glory_upgraded',
    name: 'Glory (Upgraded)',
    description: 'Defeating Champion or Legend tier enemies grants +15 AP permanently (stacks endlessly).',
    trigger: 'on_kill',
    // This passive is handled in the Battle component
    // When Champion/Legend is defeated, adds permanent AP buff
    // Carries over stacks from Dark Seal
  },
};

/**
 * Apply passive stat modifiers to character stats
 */
export function applyPassiveStatModifiers(
  baseStats: CharacterStats,
  level: number,
  passiveIds: PassiveId[]
): CharacterStats {
  let modifiedStats = { ...baseStats };

  for (const passiveId of passiveIds) {
    const passive = ITEM_PASSIVES[passiveId];
    if (passive && passive.statModifier && passive.trigger === 'stat_calculation') {
      const modifications = passive.statModifier(modifiedStats, level);
      modifiedStats = { ...modifiedStats, ...modifications };
    }
  }

  return modifiedStats;
}

/**
 * Get all passives by trigger type
 */
export function getPassivesByTrigger(passiveIds: PassiveId[], trigger: PassiveTrigger): PassiveEffect[] {
  return passiveIds
    .map(id => ITEM_PASSIVES[id])
    .filter(passive => passive && passive.trigger === trigger);
}

/**
 * Get passive effect by ID
 */
export function getPassiveById(passiveId: PassiveId): PassiveEffect | undefined {
  return ITEM_PASSIVES[passiveId];
}

/**
 * Check if a character has a specific passive
 */
export function hasPassive(passiveIds: PassiveId[], passiveId: PassiveId): boolean {
  return passiveIds.includes(passiveId);
}
