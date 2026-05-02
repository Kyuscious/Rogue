import { getLivingTargets, BattleTarget } from '@battle/logic/targetingSystem';
import { resolveAreaTargets } from './areaTarget';
import { resolveMultipleTargets } from './multipleTarget';
import { resolveSingleTarget } from './singleTarget';
import {
  ResolveActionTargetingInput,
  ResolveActionTargetingResult,
  isTargetInRange,
} from './types';

export function resolveActionTargeting<T extends BattleTarget>(
  input: ResolveActionTargetingInput<T>
): ResolveActionTargetingResult<T> {
  const {
    actorInstanceId,
    actorSide,
    actorPosition,
    targets,
    preferredTargetId,
    profile,
  } = input;

  const selectionRule = profile.selectionRule || 'first-in-range';
  const defaultTargetSide = actorSide === 'player' ? 'enemy' : 'player';
  const targetSide = profile.targetSide || defaultTargetSide;
  const range = profile.range;

  const livingTargets = getLivingTargets(targets);
  const sideTargets = livingTargets.filter((target) => {
    if (profile.mode === 'self') {
      return target.instanceId === actorInstanceId;
    }

    return target.side === targetSide;
  });

  const inRangeTargets = sideTargets.filter((target) => isTargetInRange(target, actorPosition, range));

  if (profile.mode === 'none') {
    return {
      mode: 'none',
      targetIds: [],
      targets: [],
      range,
    };
  }

  if (profile.mode === 'self') {
    const selfTarget = targets.find((target) => target.instanceId === actorInstanceId);
    if (!selfTarget) {
      return {
        mode: 'self',
        targetIds: [],
        targets: [],
        blockedReason: 'No valid self target.',
        range,
      };
    }

    return {
      mode: 'self',
      targetIds: [selfTarget.instanceId],
      targets: [selfTarget],
      range,
    };
  }

  if (profile.requiresTargetInRange && inRangeTargets.length === 0) {
    return {
      mode: profile.mode,
      targetIds: [],
      targets: [],
      blockedReason: 'No valid targets in range.',
      range,
      aoe: profile.aoe,
    };
  }

  // Sort pool by ascending distance from actor when rule requests closest-first
  let pool = profile.requiresTargetInRange ? inRangeTargets : sideTargets;
  if (selectionRule === 'first-in-range' && actorPosition !== undefined) {
    pool = [...pool].sort((a, b) => {
      const da = a.battlefieldPosition !== undefined ? Math.abs(a.battlefieldPosition - actorPosition) : Infinity;
      const db = b.battlefieldPosition !== undefined ? Math.abs(b.battlefieldPosition - actorPosition) : Infinity;
      return da - db;
    });
  }

  if (profile.mode === 'single') {
    const target = resolveSingleTarget(pool, preferredTargetId, selectionRule);
    if (!target) {
      return {
        mode: 'single',
        targetIds: [],
        targets: [],
        blockedReason: 'No valid single target found.',
        range,
      };
    }

    return {
      mode: 'single',
      targetIds: [target.instanceId],
      targets: [target],
      range,
    };
  }

  if (profile.mode === 'multiple') {
    const resolvedTargets = resolveMultipleTargets(pool, preferredTargetId, selectionRule, profile.maxTargets);
    if (resolvedTargets.length === 0) {
      return {
        mode: 'multiple',
        targetIds: [],
        targets: [],
        blockedReason: 'No valid targets for multi-target action.',
        range,
      };
    }

    return {
      mode: 'multiple',
      targetIds: resolvedTargets.map((target) => target.instanceId),
      targets: resolvedTargets,
      range,
    };
  }

  if (profile.mode === 'aoe') {
    const aoeSize = profile.aoe?.size || 0;
    const areaResolution = resolveAreaTargets(pool, preferredTargetId, selectionRule, aoeSize);

    if (!areaResolution.anchorTarget || areaResolution.targets.length === 0) {
      return {
        mode: 'aoe',
        targetIds: [],
        targets: [],
        blockedReason: 'No valid targets in area.',
        range,
        aoe: profile.aoe,
      };
    }

    return {
      mode: 'aoe',
      targetIds: areaResolution.targets.map((target) => target.instanceId),
      targets: areaResolution.targets,
      range,
      aoe: {
        shape: profile.aoe?.shape || 'circle',
        size: aoeSize,
        anchorTargetId: areaResolution.anchorTarget.instanceId,
        anchorPosition: areaResolution.anchorTarget.battlefieldPosition,
      },
    };
  }

  return {
    mode: profile.mode,
    targetIds: [],
    targets: [],
    blockedReason: 'Unsupported targeting mode.',
    range,
  };
}
