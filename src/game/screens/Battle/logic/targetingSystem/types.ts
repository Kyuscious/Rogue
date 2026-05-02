import { Spell } from '@data/spells';
import { Weapon } from '@data/weapons';
import { BattleTarget, BattleTargetSide } from '@battle/logic/targetingSystem';

export type ActionTargetMode = 'none' | 'self' | 'single' | 'multiple' | 'aoe';
export type TargetSelectionRule = 'first-in-range' | 'last-in-range' | 'all-in-range' | 'auto-priority';

export interface ActionTargetingProfile {
  mode: ActionTargetMode;
  selectionRule?: TargetSelectionRule;
  range?: number;
  maxTargets?: number;
  targetSide?: BattleTargetSide;
  requiresTargetInRange?: boolean;
  aoe?: {
    shape: 'circle' | 'rectangle';
    size: number;
  };
}

export interface ResolveActionTargetingInput<T extends BattleTarget> {
  actorInstanceId: string;
  actorSide: BattleTargetSide;
  actorPosition?: number;
  targets: T[];
  preferredTargetId?: string | null;
  profile: ActionTargetingProfile;
}

export interface ResolveActionTargetingResult<T extends BattleTarget> {
  mode: ActionTargetMode;
  targetIds: string[];
  targets: T[];
  blockedReason?: string;
  range?: number;
  aoe?: {
    shape: 'circle' | 'rectangle';
    size: number;
    anchorTargetId?: string;
    anchorPosition?: number;
  };
}

export function isTargetInRange(target: BattleTarget, actorPosition: number | undefined, range: number | undefined): boolean {
  if (range === undefined) return true;
  if (actorPosition === undefined || target.battlefieldPosition === undefined) return true;
  return Math.abs(actorPosition - target.battlefieldPosition) <= range;
}

export function getDefaultWeaponTargetingProfile(weapon: Weapon, fallbackRange: number): ActionTargetingProfile {
  if (weapon.targeting) {
    return {
      mode: weapon.targeting.mode,
      selectionRule: weapon.targeting.selectionRule,
      range: weapon.targeting.range ?? fallbackRange,
      maxTargets: weapon.targeting.maxTargets,
      targetSide: weapon.targeting.targetSide,
      requiresTargetInRange: weapon.targeting.requiresTargetInRange,
    };
  }

  const hasDamageLikeEffect = weapon.effects.some((effect) => effect.type === 'damage' || effect.type === 'stun' || effect.type === 'debuff');
  if (!hasDamageLikeEffect) {
    return { mode: 'none' };
  }

  return {
    mode: 'single',
    selectionRule: 'first-in-range',
    range: fallbackRange,
    targetSide: 'enemy',
    requiresTargetInRange: true,
  };
}

export function getDefaultSpellTargetingProfile(spell: Spell): ActionTargetingProfile {
  if (spell.targeting) {
    return {
      mode: spell.targeting.mode,
      selectionRule: spell.targeting.selectionRule,
      range: spell.targeting.range ?? spell.range,
      maxTargets: spell.targeting.maxTargets,
      targetSide: spell.targeting.targetSide,
      requiresTargetInRange: spell.targeting.requiresTargetInRange,
      aoe: spell.targeting.mode === 'aoe' && spell.areaOfEffect
        ? {
            shape: spell.areaOfEffect.type,
            size: spell.areaOfEffect.size,
          }
        : undefined,
    };
  }

  const hasOffensiveEffect = spell.effects.some((effect) => effect.type === 'damage' || effect.type === 'stun' || effect.type === 'debuff');
  const hasSelfEffect = spell.effects.some((effect) => effect.type === 'heal' || effect.type === 'buff');
  const spellRange = spell.range || 500;

  if (spell.areaOfEffect && hasOffensiveEffect) {
    return {
      mode: 'aoe',
      selectionRule: 'first-in-range',
      range: spellRange,
      targetSide: 'enemy',
      requiresTargetInRange: true,
      aoe: {
        shape: spell.areaOfEffect.type,
        size: spell.areaOfEffect.size,
      },
    };
  }

  if (hasOffensiveEffect) {
    return {
      mode: 'single',
      selectionRule: 'first-in-range',
      range: spellRange,
      targetSide: 'enemy',
      requiresTargetInRange: true,
    };
  }

  if (hasSelfEffect) {
    return {
      mode: 'self',
      targetSide: 'player',
    };
  }

  return { mode: 'none' };
}
