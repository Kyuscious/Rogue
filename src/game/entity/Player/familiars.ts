import type { CombatBuffStats } from '@utils/itemSystem';
import { CharacterStats, DEFAULT_STATS } from '@utils/statsSystem';

export type FamiliarRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type FamiliarSource = 'event' | 'battle' | 'reward' | 'shop';
export type FamiliarEffectType = 'physical' | 'magic' | 'heal' | 'shield' | 'buff';
export type FamiliarTrigger = 'fight_start' | 'turn' | 'fight_end';

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
  trigger: FamiliarTrigger;
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
  criticalChance: 0,
  criticalDamage: 175,
  lethality: 0,
  lifeSteal: 0,
  healingOnHit: 0,
  abilityPower: 18,
  magicPenetration: 0,
  heal_shield_power: 0,
  omnivamp: 0,
  goldGain: 1,
  xpGain: 1,
  magicFind: 0,
  trueDamage: 0,
  ...overrides,
});

export const MAX_ACTIVE_FAMILIARS = 4;

export const FAMILIAR_DATABASE: Record<string, FamiliarData> = {
  star_guardian_dango: {
    id: 'star_guardian_dango',
    name: 'Star Guardian Dango',
    title: 'Celestial Striker',
    description: 'A star-blessed companion that relentlessly harasses exposed enemies.',
    icon: '🌟',
    imagePath: '/assets/global/images/player/familiars/star_guardian_dango.png',
    rarity: 'common',
    trigger: 'turn',
    attackPattern: 'Stardive Strike',
    intervalTurns: 2,
    obtainableFrom: ['event', 'battle'],
    stats: createFamiliarStats({
      health: 240,
      attackDamage: 28,
      armor: 16,
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
  nixie: {
    id: 'nixie',
    name: 'Nixie',
    title: 'Dewdrop Mender',
    description: 'A gentle water spirit that restores the player\'s vitality every few turns.',
    icon: '💧',
    imagePath: '/assets/global/images/player/familiars/nixie.png',
    rarity: 'rare',
    trigger: 'turn',
    attackPattern: 'Restorative Pulse',
    intervalTurns: 3,
    obtainableFrom: ['event', 'reward'],
    stats: createFamiliarStats({
      health: 210,
      abilityPower: 32,
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
  cosmic_squink: {
    id: 'cosmic_squink',
    name: 'Cosmic Squink',
    title: 'Void-Ink Arcanist',
    description: 'An otherworldly creature that channels cosmic energy into magic bolts.',
    icon: '🐙',
    imagePath: '/assets/global/images/player/familiars/cosmic_squink.png',
    rarity: 'epic',
    trigger: 'turn',
    attackPattern: 'Void Bolt',
    intervalTurns: 2,
    obtainableFrom: ['event', 'reward'],
    stats: createFamiliarStats({
      health: 200,
      abilityPower: 40,
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
  paddlemar: {
    id: 'paddlemar',
    name: 'Paddlemar',
    title: 'Tideforged Bulwark',
    description: 'A stalwart sea creature that braces the team with a protective ward at the start of every fight.',
    icon: '🦀',
    imagePath: '/assets/global/images/player/familiars/paddlemar.png',
    rarity: 'rare',
    trigger: 'fight_start',
    attackPattern: 'Tidal Ward',
    intervalTurns: 1,
    obtainableFrom: ['event', 'battle'],
    stats: createFamiliarStats({
      health: 320,
      armor: 26,
      magicResist: 24,
      abilityPower: 20,
    }),
    effect: {
      type: 'shield',
      target: 'player',
      baseAmount: 14,
      scalingStat: 'health',
      scalingRatio: 0.08,
      description: 'At the start of each fight, grants a protective ward.',
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
  if (familiar.trigger !== 'turn') return Infinity;
  return Math.max(1, familiar.intervalTurns);
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
