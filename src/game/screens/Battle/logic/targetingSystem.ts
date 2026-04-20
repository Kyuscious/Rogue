import { getCharacterName } from '@i18n/helpers';
import { getFamiliarById } from '@entities/Player/familiars';
import { Character } from '@game/types';

export type BattleTargetSide = 'player' | 'enemy';
export type BattleTargetKind = 'player' | 'enemy' | 'familiar' | 'summon';

export interface BattleTarget {
  instanceId: string;
  baseId: string;
  side: BattleTargetSide;
  kind: BattleTargetKind;
  name: string;
  currentHp: number;
  maxHp: number;
  targetPriority: number;
  canBeTargeted: boolean;
}

export function getCharacterInstanceId(character: Character, fallbackIndex = 0): string {
  return character.battleInstanceId || `${character.id}__${fallbackIndex}`;
}

export function buildEnemyTargets(enemyCharacters: Character[]): BattleTarget[] {
  return enemyCharacters.map((enemy, index) => ({
    instanceId: getCharacterInstanceId(enemy, index),
    baseId: enemy.id,
    side: 'enemy',
    kind: enemy.isSummon ? 'summon' : 'enemy',
    name: getCharacterName(enemy),
    currentHp: enemy.hp,
    maxHp: enemy.stats.health || enemy.hp,
    targetPriority: enemy.targetPriority ?? (enemy.isSummon ? 0.85 : 1),
    canBeTargeted: enemy.canBeTargeted !== false,
  }));
}

export function buildPlayerTargets(
  playerCharacter: Character,
  familiarIds: string[],
  familiarStates: Record<string, { currentHp: number }>
): BattleTarget[] {
  const playerTarget: BattleTarget = {
    instanceId: 'player',
    baseId: playerCharacter.id,
    side: 'player',
    kind: 'player',
    name: getCharacterName(playerCharacter),
    currentHp: playerCharacter.hp,
    maxHp: playerCharacter.stats.health || playerCharacter.hp,
    targetPriority: playerCharacter.targetPriority ?? 1.15,
    canBeTargeted: playerCharacter.canBeTargeted !== false,
  };

  const familiarTargets = familiarIds
    .map<BattleTarget | null>((familiarId, index) => {
      const familiar = getFamiliarById(familiarId);
      if (!familiar) return null;

      return {
        instanceId: `familiar:${familiarId}:${index}`,
        baseId: familiarId,
        side: 'player',
        kind: 'familiar',
        name: familiar.name,
        currentHp: familiarStates[familiarId]?.currentHp ?? familiar.stats.health,
        maxHp: familiar.stats.health,
        targetPriority: familiar.effect.type === 'shield' ? 1.05 : 0.8,
        canBeTargeted: true,
      };
    })
    .filter((target): target is BattleTarget => target !== null);

  return [playerTarget, ...familiarTargets];
}

export function getLivingTargets<T extends BattleTarget>(targets: T[]): T[] {
  return targets.filter((target) => target.canBeTargeted && target.currentHp > 0);
}

export function resolveSelectedTarget<T extends BattleTarget>(
  targets: T[],
  preferredTargetId?: string | null
): T | undefined {
  const livingTargets = getLivingTargets(targets);

  if (livingTargets.length === 0) {
    return undefined;
  }

  if (preferredTargetId) {
    const preferredTarget = livingTargets.find((target) => target.instanceId === preferredTargetId);
    if (preferredTarget) return preferredTarget;

    const previousTargetIndex = targets.findIndex((target) => target.instanceId === preferredTargetId);
    if (previousTargetIndex >= 0) {
      const nextLivingTarget = targets
        .slice(previousTargetIndex + 1)
        .find((target): target is T => target.canBeTargeted && target.currentHp > 0);

      if (nextLivingTarget) {
        return nextLivingTarget;
      }
    }
  }

  return livingTargets[0];
}

export function chooseAutoTarget<T extends BattleTarget>(targets: T[]): T | undefined {
  const livingTargets = getLivingTargets(targets);

  return [...livingTargets].sort((a, b) => {
    const aFocusScore = a.targetPriority + (1 - a.currentHp / Math.max(1, a.maxHp)) * 0.35;
    const bFocusScore = b.targetPriority + (1 - b.currentHp / Math.max(1, b.maxHp)) * 0.35;

    if (bFocusScore !== aFocusScore) {
      return bFocusScore - aFocusScore;
    }

    return a.currentHp - b.currentHp;
  })[0];
}

export function getEnemyIndexByTargetId(enemyCharacters: Character[], targetId?: string | null): number {
  if (!targetId) {
    return enemyCharacters.findIndex((enemy) => enemy.hp > 0);
  }

  return enemyCharacters.findIndex((enemy, index) => getCharacterInstanceId(enemy, index) === targetId);
}
