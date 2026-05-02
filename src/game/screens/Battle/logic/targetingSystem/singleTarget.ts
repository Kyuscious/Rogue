import { BattleTarget, chooseAutoTarget } from '@battle/logic/targetingSystem';
import { TargetSelectionRule } from './types';

export function resolveSingleTarget<T extends BattleTarget>(
  targets: T[],
  _preferredTargetId?: string | null,
  selectionRule: TargetSelectionRule = 'first-in-range'
): T | undefined {
  if (targets.length === 0) return undefined;

  if (selectionRule === 'last-in-range') {
    return targets[targets.length - 1];
  }

  if (selectionRule === 'auto-priority') {
    return chooseAutoTarget(targets) || targets[0];
  }

  return targets[0];
}
