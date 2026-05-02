import { BattleTarget } from '@battle/logic/targetingSystem';
import { resolveSingleTarget } from './singleTarget';
import { TargetSelectionRule } from './types';

export interface AreaResolution<T extends BattleTarget> {
  anchorTarget?: T;
  targets: T[];
}

export function resolveAreaTargets<T extends BattleTarget>(
  targets: T[],
  preferredTargetId: string | null | undefined,
  selectionRule: TargetSelectionRule,
  areaSize: number
): AreaResolution<T> {
  // 'all-in-range': hit every target in the pool without anchor-based area filtering.
  // The caller is expected to have already pre-filtered the pool to in-range targets.
  if (selectionRule === 'all-in-range') {
    return { anchorTarget: targets[0], targets };
  }

  const anchorTarget = resolveSingleTarget(targets, preferredTargetId, selectionRule);
  if (!anchorTarget) {
    return { anchorTarget: undefined, targets: [] };
  }

  if (anchorTarget.battlefieldPosition === undefined) {
    return { anchorTarget, targets };
  }

  const affectedTargets = targets.filter((target) => {
    if (target.battlefieldPosition === undefined) return false;
    return Math.abs(target.battlefieldPosition - anchorTarget.battlefieldPosition) <= areaSize;
  });

  return {
    anchorTarget,
    targets: affectedTargets,
  };
}
