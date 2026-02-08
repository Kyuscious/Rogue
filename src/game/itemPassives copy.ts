import { CharacterStats } from './statsSystem';

export type PassiveId = 
  | 'life_draining'
  | 'enduring_focus'
  | 'drain'
  | 'pathfinder'
  | 'magical_opus'
  | 'reap'
  | 'glory'
  | 'glory_upgraded'
  | 'immolate'
  | 'thorns'
  | 'eternity'
  | 'grievous_wounds'
  | 'madness'
  | 'lifeline'
  | 'revved'
  | 'soul_anchor'
  | 'enlighten'
  | 'rage'
  | 'quicksilver'
  | 'sting'
  | 'bullseyes'
  | 'time_stop'
  | 'spellblade'
  | 'crescent'
  | 'annul'
  | 'rock_solid';

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

  immolate: {
    id: 'immolate',
    name: 'Immolate',
    description: 'Every attack or when attacked applies a burn stack to target. Each stack deals 15 damage/turn for 2 turns. Refreshes duration when new stacks added. Stacks additively (2 items = 2 stacks per hit).',
    trigger: 'on_hit',
    onHit: (damage: number, _state: any) => {
      // This passive is handled in the Battle component
      // When player deals or takes attack damage, we apply burn stacks to the target
      // Each stack deals 15 damage per turn for 2 turns
      // Duration resets to 2 turns when new stacks are added
      // Multiple items stack the effect additively
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

  // PLACEHOLDER PASSIVES - To be implemented with combat system refactor
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    description: '[PLACEHOLDER] Reflects damage back to attackers.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  eternity: {
    id: 'eternity',
    name: 'Eternity',
    description: '[PLACEHOLDER] Increase resource/CDR effects.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  grievous_wounds: {
    id: 'grievous_wounds',
    name: 'Grievous Wounds',
    description: '[PLACEHOLDER] Reduce enemy healing.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  madness: {
    id: 'madness',
    name: 'Madness',
    description: '[PLACEHOLDER] Gain attack damage based on missing health.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  lifeline: {
    id: 'lifeline',
    name: 'Lifeline',
    description: '[PLACEHOLDER] Prevent lethal damage once.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  revved: {
    id: 'revved',
    name: 'Revved',
    description: '[PLACEHOLDER] Deal bonus damage periodically.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  soul_anchor: {
    id: 'soul_anchor',
    name: 'Soul Anchor',
    description: '[PLACEHOLDER] Sacrifice ability power for defensive utility.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  enlighten: {
    id: 'enlighten',
    name: 'Enlighten',
    description: '[PLACEHOLDER] Bonus experience scaling.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  rage: {
    id: 'rage',
    name: 'Rage',
    description: '[PLACEHOLDER] Gain attack damage as you take damage.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  quicksilver: {
    id: 'quicksilver',
    name: 'Quicksilver',
    description: '[PLACEHOLDER] Increased attack speed and movement.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  sting: {
    id: 'sting',
    name: 'Sting',
    description: '[PLACEHOLDER] Physical damage applies stacking debuff.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  bullseyes: {
    id: 'bullseyes',
    name: 'Bullseyes',
    description: '[PLACEHOLDER] Increased critical strike effectiveness.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
  },

  time_stop: {
    id: 'time_stop',
    name: 'Time Stop',
    description: '[PLACEHOLDER] Ability to briefly halt enemy actions.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  spellblade: {
    id: 'spellblade',
    name: 'Spellblade',
    description: '[PLACEHOLDER] Spells empower next attack.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  crescent: {
    id: 'crescent',
    name: 'Crescent',
    description: '[PLACEHOLDER] Gain stacking attack damage bonus.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  annul: {
    id: 'annul',
    name: 'Annul',
    description: '[PLACEHOLDER] Negate negative effects periodically.',
    trigger: 'on_hit',
    // TODO: Implement in combat system refactor
  },

  rock_solid: {
    id: 'rock_solid',
    name: 'Rock Solid',
    description: '[PLACEHOLDER] Increased defense and tenacity.',
    trigger: 'stat_calculation',
    // TODO: Implement in combat system refactor
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
