import { CharacterStats } from './statsSystem';

export type PassiveId = 
  | 'blade_lifesteal_amplifier'
  | 'shield_adaptive_defense'
  | 'ring_spell_scaling'
  | 'magical_opus';

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
  // DORAN'S BLADE: Lifesteal Amplifier
  // Converts 1% of Attack Damage to Lifesteal
  blade_lifesteal_amplifier: {
    id: 'blade_lifesteal_amplifier',
    name: 'Vampiric Edge',
    description: 'Converts 1% of your Attack Damage into Lifesteal. Trade of damage for healing.',
    trigger: 'stat_calculation',
    statModifier: (stats: CharacterStats, _level: number) => {
      const adToLifesteal = (stats.attackDamage || 0) * 0.01;
      return {
        attackDamage: (stats.attackDamage || 0) - adToLifesteal,
        lifeSteal: (stats.lifeSteal || 0) + adToLifesteal,
      };
    },
  },

  // DORAN'S SHIELD: Adaptive Defense
  // Converts Health into Armor and Magic Resist (1 HP = 0.05 Armor/MR)
  shield_adaptive_defense: {
    id: 'shield_adaptive_defense',
    name: 'Adaptive Fortification',
    description: 'Your vitality strengthens your defenses. Converts 5% of your Health into Armor and Magic Resist.',
    trigger: 'stat_calculation',
    statModifier: (stats: CharacterStats, _level: number) => {
      const healthToDefense = (stats.health || 0) * 0.05;
      return {
        armor: (stats.armor || 0) + healthToDefense,
        magicResist: (stats.magicResist || 0) + healthToDefense,
      };
    },
  },

  // DORAN'S RING: Spell Scaling
  // Ability Power increases by 1% per level (multiplicative)
  ring_spell_scaling: {
    id: 'ring_spell_scaling',
    name: 'Arcane Growth',
    description: 'Your magical power grows with experience. Gain +5% Ability Power per level.',
    trigger: 'stat_calculation',
    statModifier: (stats: CharacterStats, level: number) => {
      const apMultiplier = 1 + (level * 0.05);
      return {
        abilityPower: (stats.abilityPower || 0) * apMultiplier,
      };
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
