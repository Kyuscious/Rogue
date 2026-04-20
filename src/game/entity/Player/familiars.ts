import type { CombatBuffStats } from '@utils/itemSystem';
import { CharacterStats, DEFAULT_STATS } from '@utils/statsSystem';

export type FamiliarRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type FamiliarSource = 'event' | 'battle' | 'reward' | 'shop';
export type FamiliarEffectType = 'physical' | 'magic' | 'heal' | 'shield' | 'buff';

export interface FamiliarEffect {
  type: FamiliarEffectType;
  description: string;
  target: 'enemy' | 'player';
  baseAmount: number;
  scalingStat?: keyof Pick<CharacterStats, 'attackDamage' | 'abilityPower' | 'health'>;
  scalingRatio?: number;
  buffStat?: keyof CombatBuffStats;
  buffAmount?: number;
  buffDuration?: number;
}

export interface FamiliarData {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  imagePath?: string;
  rarity: FamiliarRarity;
  attackPattern: string;
  intervalTurns: number;
  stats: CharacterStats;
  obtainableFrom: FamiliarSource[];
  effect: FamiliarEffect;
}

export interface FamiliarState {
  currentHp: number;
}

const createFamiliarStats = (overrides: Partial<CharacterStats>): CharacterStats => ({
  ...DEFAULT_STATS,
  health: 220,
  health_regen: 4,
  armor: 12,
  magicResist: 12,
  attackRange: 275,
  attackDamage: 20,
  speed: 1,
  criticalChance: 0,
  criticalDamage: 175,
  lethality: 0,
  lifeSteal: 0,
  healingOnHit: 0,
  abilityPower: 18,
  haste: 0,
  magicPenetration: 0,
  heal_shield_power: 0,
  omnivamp: 0,
  movementSpeed: 325,
  goldGain: 1,
  xpGain: 1,
  magicFind: 0,
  trueDamage: 0,
  ...overrides,
});

export const MAX_ACTIVE_FAMILIARS = 2;

export const FAMILIAR_DATABASE: Record<string, FamiliarData> = {
  silverwing_scout: {
    id: 'silverwing_scout',
    name: 'Silverwing Scout',
    title: 'Skybound Companion',
    description: 'A vigilant silverwing that dives at exposed enemies.',
    icon: '🕊️',
    rarity: 'common',
    attackPattern: 'Dive Strike',
    intervalTurns: 2,
    obtainableFrom: ['event', 'battle'],
    stats: createFamiliarStats({
      health: 240,
      attackDamage: 28,
      speed: 1.25,
      armor: 16,
      movementSpeed: 360,
    }),
    effect: {
      type: 'physical',
      target: 'enemy',
      baseAmount: 10,
      scalingStat: 'attackDamage',
      scalingRatio: 0.9,
      description: 'Every 2 turns, dives for physical damage.',
    },
  },
  rune_sprite: {
    id: 'rune_sprite',
    name: 'Rune Sprite',
    title: 'Arcane Wisp',
    description: 'A floating spark of ancient magic that protects its summoner.',
    icon: '✨',
    rarity: 'rare',
    attackPattern: 'Restorative Pulse',
    intervalTurns: 3,
    obtainableFrom: ['event', 'reward'],
    stats: createFamiliarStats({
      health: 210,
      abilityPower: 32,
      haste: 18,
      magicResist: 20,
      heal_shield_power: 8,
    }),
    effect: {
      type: 'heal',
      target: 'player',
      baseAmount: 16,
      scalingStat: 'abilityPower',
      scalingRatio: 0.65,
      description: 'Every 3 turns, restores health to the player.',
    },
  },
  ember_fox: {
    id: 'ember_fox',
    name: 'Ember Fox',
    title: 'Flame-Tailed Trickster',
    description: 'A quick fox spirit that scorches foes with ember bolts.',
    icon: '🦊',
    rarity: 'epic',
    attackPattern: 'Ember Bolt',
    intervalTurns: 2,
    obtainableFrom: ['event', 'reward'],
    stats: createFamiliarStats({
      health: 200,
      abilityPower: 40,
      haste: 12,
      speed: 1.35,
      magicPenetration: 8,
    }),
    effect: {
      type: 'magic',
      target: 'enemy',
      baseAmount: 12,
      scalingStat: 'abilityPower',
      scalingRatio: 0.85,
      description: 'Every 2 turns, fires a magic projectile.',
    },
  },
  ironback_crab: {
    id: 'ironback_crab',
    name: 'Ironback Crab',
    title: 'Tideforged Bulwark',
    description: 'A sturdy crab companion that braces the team with shields.',
    icon: '🦀',
    rarity: 'rare',
    attackPattern: 'Shell Ward',
    intervalTurns: 4,
    obtainableFrom: ['event', 'battle'],
    stats: createFamiliarStats({
      health: 320,
      armor: 26,
      magicResist: 24,
      abilityPower: 20,
      haste: 10,
    }),
    effect: {
      type: 'shield',
      target: 'player',
      baseAmount: 14,
      scalingStat: 'health',
      scalingRatio: 0.08,
      description: 'Every 4 turns, grants a small restorative ward.',
      buffStat: 'armor',
      buffAmount: 4,
      buffDuration: 2,
    },
  },
};

export function getFamiliarById(familiarId: string): FamiliarData | undefined {
  return FAMILIAR_DATABASE[familiarId];
}

export function initializeFamiliarState(familiarId: string): FamiliarState {
  const familiar = getFamiliarById(familiarId);
  return {
    currentHp: familiar?.stats.health || 1,
  };
}

export function getFamiliarMaxHp(familiarId: string): number {
  return getFamiliarById(familiarId)?.stats.health || 1;
}

export function getFamiliarTurnInterval(familiar: FamiliarData): number {
  const speedFactor = familiar.stats.speed > 0 ? familiar.stats.speed : 1;
  const hasteFactor = 100 / (100 + Math.max(0, familiar.stats.haste));
  return Math.max(1, Math.round(familiar.intervalTurns * hasteFactor / speedFactor));
}

export function getActiveFamiliarIds(familiars: string[]): string[] {
  return familiars.slice(0, MAX_ACTIVE_FAMILIARS);
}

export function getFamiliarEffectAmount(familiar: FamiliarData): number {
  const scalingValue = familiar.effect.scalingStat
    ? familiar.stats[familiar.effect.scalingStat] || 0
    : 0;
  const scalingBonus = scalingValue * (familiar.effect.scalingRatio || 0);
  return Math.max(1, Math.round(familiar.effect.baseAmount + scalingBonus));
}

export function getFamiliarSourceLabel(source: FamiliarSource): string {
  switch (source) {
    case 'event':
      return 'Events';
    case 'battle':
      return 'Battle Drops';
    case 'reward':
      return 'Milestone Rewards';
    case 'shop':
      return 'Shop';
    default:
      return 'Unknown';
  }
}
