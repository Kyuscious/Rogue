/**
 * Item Passives System
 * 
 * Central database for all item passive effects.
 * Buff application is handled in Battle.tsx via itemSystem functions.
 * This file contains metadata and stat calculation modifiers only.
 */

import { CharacterStats } from './statsSystem';

export type PassiveTrigger = 
  | 'battle_start'
  | 'battle_end'
  | 'turn_start'
  | 'turn_end'
  | 'before_attack'
  | 'on_hit'
  | 'after_damage_dealt'
  | 'after_damage_taken'
  | 'on_kill'
  | 'on_death'
  | 'on_heal'
  | 'on_crit'
  | 'on_spell_cast'
  | 'on_item_use'
  | 'gold_gained'
  | 'exp_gained'
  | 'stat_calculation';

export type PassiveId = 
  | 'life_draining'
  | 'enduring_focus'
  | 'drain'
  | 'pathfinder'
  | 'magical_opus'
  | 'reap'
  | 'glory'
  | 'glory_upgraded'
  | 'manaflow'
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

/**
 * Passive Effect Interface
 */
export interface PassiveEffect {
  id: PassiveId;
  name: string;
  description: string;
  triggers: PassiveTrigger[];
  
  // Stat modification (runs during stat calculation)
  statModifier?: (stats: CharacterStats, level: number, stacks?: number) => Partial<CharacterStats>;
  
  // Metadata
  stackable?: boolean;
  maxStacks?: number;
  persistsBetweenBattles?: boolean;
}

/**
 * Item Passive Effects Database
 * 
 * NOTE: Passive execution (buffs, healing, damage) is handled in Battle.tsx
 * This database contains only metadata and stat calculation modifiers
 */
export const ITEM_PASSIVES: Record<PassiveId, PassiveEffect> = {
  // ==========================================
  // DORAN'S BLADE: Life Draining
  // ==========================================
  life_draining: {
    id: 'life_draining',
    name: 'Life Draining',
    description: 'Dealing attack damage increases total AD by 1% (stacks for the encounter).',
    triggers: ['after_damage_dealt'],
    stackable: true,
    persistsBetweenBattles: false,
  },

  // ==========================================
  // DORAN'S SHIELD: Enduring Focus
  // ==========================================
  enduring_focus: {
    id: 'enduring_focus',
    name: 'Enduring Focus',
    description: 'After taking damage, heal 5% of that damage over 3 turns.',
    triggers: ['after_damage_taken'],
  },

  // ==========================================
  // DORAN'S RING: Drain
  // ==========================================
  drain: {
    id: 'drain',
    name: 'Drain',
    description: 'Dealing spell damage increases total AP by 1% (stacks for the encounter).',
    triggers: ['after_damage_dealt'],
    stackable: true,
    persistsBetweenBattles: false,
  },

  // ==========================================
  // RABADON'S DEATHCAP: Magical Opus
  // ==========================================
  magical_opus: {
    id: 'magical_opus',
    name: 'Magical Opus',
    description: 'Increases your total Ability Power by 30%.',
    triggers: ['stat_calculation'],
    statModifier: (stats: CharacterStats) => {
      const bonusAP = (stats.abilityPower || 0) * 0.3;
      return {
        abilityPower: (stats.abilityPower || 0) + bonusAP,
      };
    },
  },

  // ==========================================
  // THE CULL: Reap
  // ==========================================
  reap: {
    id: 'reap',
    name: 'Reap',
    description: 'Killing an enemy awards 10 additional gold.',
    triggers: ['on_kill'],
  },

  // ==========================================
  // DARK SEAL: Glory
  // ==========================================
  glory: {
    id: 'glory',
    name: 'Glory',
    description: 'Defeating Champion or Legend tier enemies grants +10 AP permanently (stacks endlessly).',
    triggers: ['on_kill'],
    stackable: true,
    persistsBetweenBattles: true,
  },

  // ==========================================
  // MEJAI'S SOULSTEALER: Glory (Upgraded)
  // ==========================================
  glory_upgraded: {
    id: 'glory_upgraded',
    name: 'Glory (Upgraded)',
    description: 'Defeating Champion or Legend tier enemies grants +15 AP permanently (stacks endlessly). Inherits stacks from Dark Seal.',
    triggers: ['on_kill'],
    stackable: true,
    persistsBetweenBattles: true,
  },

  // ==========================================
  // TEAR OF THE GODDESS: Manaflow
  // ==========================================
  manaflow: {
    id: 'manaflow',
    name: 'Manaflow',
    description: 'Winning encounters grants +10 stacks (max 360). Each stack grants +0.01 xpGain (max +3.6 xpGain at 360 stacks).',
    triggers: ['battle_end', 'stat_calculation'],
    stackable: true,
    maxStacks: 360,
    persistsBetweenBattles: true,
    statModifier: (stats: CharacterStats, _level: number, stacks: number = 0) => {
      // Each stack grants +0.01 xpGain (max 360 stacks = +3.6 xpGain)
      const bonusXpGain = stacks * 0.01;
      return {
        xpGain: (stats.xpGain || 0) + bonusXpGain,
      };
    },
  },

  // ==========================================
  // BAMI'S CINDER / SUNFIRE: Immolate
  // ==========================================
  immolate: {
    id: 'immolate',
    name: 'Immolate',
    description: 'Every attack or when attacked applies a burn stack to target. Each stack deals 15 damage/turn for 2 turns.',
    triggers: ['after_damage_dealt', 'after_damage_taken'],
  },

  // ==========================================
  // PATHFINDER: Frostfang
  // ==========================================
  pathfinder: {
    id: 'pathfinder',
    name: 'Pathfinder',
    description: 'Gain +100% experience and start with 10 rerolls instead of 5.',
    triggers: ['exp_gained'],
  },

  // ==========================================
  // THORNMAIL: Thorns
  // ==========================================
  thorns: {
    id: 'thorns',
    name: 'Thorns',
    description: 'Reflects 20% of damage taken back to attackers.',
    triggers: ['after_damage_taken'],
  },

  // ==========================================
  // MORELLONOMICON: Grievous Wounds
  // ==========================================
  grievous_wounds: {
    id: 'grievous_wounds',
    name: 'Grievous Wounds',
    description: 'Attacks reduce enemy healing by 40% for 3 turns.',
    triggers: ['on_hit'],
  },

  // ==========================================
  // WARMOG: Madness
  // ==========================================
  madness: {
    id: 'madness',
    name: 'Madness',
    description: 'Gain 1% AD per 1% missing health.',
    triggers: ['stat_calculation'],
  },

  // ==========================================
  // STERAK'S: Lifeline
  // ==========================================
  lifeline: {
    id: 'lifeline',
    name: 'Lifeline',
    description: 'When reduced below 30% HP, gain a shield for 30% max HP (300s cooldown).',
    triggers: ['after_damage_taken'],
  },

  // ==========================================
  // ATMA'S: Rage
  // ==========================================
  rage: {
    id: 'rage',
    name: 'Rage',
    description: 'Gain 2 AD each time you take damage (stacks for the encounter).',
    triggers: ['after_damage_taken'],
    stackable: true,
  },

  // ==========================================
  // RUNAAN'S: Quicksilver
  // ==========================================
  quicksilver: {
    id: 'quicksilver',
    name: 'Quicksilver',
    description: 'Gain 15% bonus attack speed.',
    triggers: ['stat_calculation'],
  },

  // ==========================================
  // SHEEN: Spellblade
  // ==========================================
  spellblade: {
    id: 'spellblade',
    name: 'Spellblade',
    description: 'After casting a spell, your next attack deals 50% bonus damage.',
    triggers: ['on_spell_cast', 'before_attack'],
  },

  // ==========================================
  // PLACEHOLDER PASSIVES
  // ==========================================

  eternity: {
    id: 'eternity',
    name: 'Eternity',
    description: '[PLACEHOLDER] Resource restoration effects.',
    triggers: ['on_spell_cast'],
  },

  revved: {
    id: 'revved',
    name: 'Revved',
    description: '[PLACEHOLDER] Deal bonus damage periodically.',
    triggers: ['on_hit'],
  },

  soul_anchor: {
    id: 'soul_anchor',
    name: 'Soul Anchor',
    description: '[PLACEHOLDER] Trade AP for defensive utility.',
    triggers: ['stat_calculation'],
  },

  enlighten: {
    id: 'enlighten',
    name: 'Enlighten',
    description: '[PLACEHOLDER] Bonus experience scaling.',
    triggers: ['exp_gained'],
  },

  sting: {
    id: 'sting',
    name: 'Sting',
    description: '[PLACEHOLDER] Physical damage applies stacking debuff.',
    triggers: ['on_hit'],
  },

  bullseyes: {
    id: 'bullseyes',
    name: 'Bullseyes',
    description: '[PLACEHOLDER] Increased critical effectiveness.',
    triggers: ['on_crit'],
  },

  time_stop: {
    id: 'time_stop',
    name: 'Time Stop',
    description: '[PLACEHOLDER] Halt enemy actions briefly.',
    triggers: ['on_spell_cast'],
  },

  crescent: {
    id: 'crescent',
    name: 'Crescent',
    description: '[PLACEHOLDER] Gain stacking attack damage.',
    triggers: ['on_hit'],
  },

  annul: {
    id: 'annul',
    name: 'Annul',
    description: '[PLACEHOLDER] Periodically negate negative effects.',
    triggers: ['turn_start'],
  },

  rock_solid: {
    id: 'rock_solid',
    name: 'Rock Solid',
    description: '[PLACEHOLDER] Increased defense and tenacity.',
    triggers: ['stat_calculation'],
  },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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
    if (passive && passive.statModifier && passive.triggers.includes('stat_calculation')) {
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
    .filter((passive): passive is PassiveEffect => passive !== undefined && passive.triggers.includes(trigger));
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
