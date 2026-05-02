import { BattleTarget, chooseAutoTarget } from '@battle/logic/targetingSystem';
import { TargetSelectionRule } from './types';

export function resolveMultipleTargets<T extends BattleTarget>(
  targets: T[],
  preferredTargetId?: string | null,
  selectionRule: TargetSelectionRule = 'all-in-range',
  maxTargets?: number
): T[] {
  if (targets.length === 0) return [];

  if (selectionRule === 'all-in-range') {
    return maxTargets ? targets.slice(0, maxTargets) : targets;
  }

  if (selectionRule === 'last-in-range') {
    const reversed = [...targets].reverse();
    return maxTargets ? reversed.slice(0, maxTargets) : reversed;
  }

  if (selectionRule === 'auto-priority') {
    const pool = [...targets];
    const selected: T[] = [];

    while (pool.length > 0 && (!maxTargets || selected.length < maxTargets)) {
      const next = chooseAutoTarget(pool);
      if (!next) break;

      selected.push(next);
      const index = pool.findIndex((target) => target.instanceId === next.instanceId);
      if (index >= 0) {
        pool.splice(index, 1);
      }
    }

    return selected;
  }

  return maxTargets ? targets.slice(0, maxTargets) : targets;
}
