import { useGameStore } from '@game/store';
import { calculateMagicDamage, calculatePhysicalDamage, type CharacterStats } from '@utils/statsSystem';
import { addShield, applyDamageWithShield } from '@battle/Flow/passives/shieldSystem';
import { addOrMergeBuffStack, type CombatBuff } from '@utils/itemSystem';
import { getCharacterName } from '../../../../../../i18n/helpers';
import { getCharacterInstanceId, getEnemyIndexByTargetId } from '@battle/logic/targetingSystem';
import {
  getFamiliarEffectAmount,
  getFamiliarTurnInterval,
  type FamiliarData,
} from '../../../../../entity/Player/familiars';
import type { Character } from '@game/types';

interface ProcessFamiliarTurnEffectsParams {
  currentTurn: number;
  turnCounter: number;
  activeFamiliars: FamiliarData[];
  familiarNextActionTurn: Record<string, number>;
  familiarStates: Record<string, { currentHp: number }>;
  selectedEnemyTargetId: string | null;
  enemyBuffsById: Record<string, CombatBuff[]>;
  enemyDebuffsById: Record<string, CombatBuff[]>;
  playerName: string;
  playerScaledMaxHp: number;
  playerChar: Character;
  applyEnemyCombatModifiers: (baseStats: CharacterStats, buffs: CombatBuff[], debuffs: CombatBuff[]) => CharacterStats;
  updateEnemyHp: (index: number, hp: number) => void;
  updatePlayerHp: (hp: number) => void;
  setPlayerBuffs: (updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
}

export interface ProcessFamiliarTurnEffectsResult {
  updatedTimers: Record<string, number>;
  familiarTurnLineParts: string[];
  familiarTurnLineTooltips: string[];
}

export function processFamiliarTurnEffects(params: ProcessFamiliarTurnEffectsParams): ProcessFamiliarTurnEffectsResult {
  const {
    currentTurn,
    turnCounter,
    activeFamiliars,
    familiarNextActionTurn,
    familiarStates,
    selectedEnemyTargetId,
    enemyBuffsById,
    enemyDebuffsById,
    playerName,
    playerScaledMaxHp,
    playerChar,
    applyEnemyCombatModifiers,
    updateEnemyHp,
    updatePlayerHp,
    setPlayerBuffs,
  } = params;

  const updatedTimers = { ...familiarNextActionTurn };
  const familiarTurnLineParts: string[] = [];
  const familiarTurnLineTooltips: string[] = [];

  activeFamiliars.forEach((familiar) => {
    if (familiar.trigger === 'fight_end') return;

    const currentFamiliarHp = familiarStates[familiar.id]?.currentHp ?? familiar.stats.health;
    if (currentFamiliarHp <= 0) return;

    const nextReadyTurn = familiarNextActionTurn[familiar.id] ?? 1;
    if (currentTurn < nextReadyTurn) return;

    const effectAmount = getFamiliarEffectAmount(familiar);

    if (familiar.effect.type === 'physical' || familiar.effect.type === 'magic') {
      const liveState = useGameStore.getState().state;
      const latestTargetIndex = getEnemyIndexByTargetId(liveState.enemyCharacters, selectedEnemyTargetId);
      const targetIndex = latestTargetIndex >= 0
        ? latestTargetIndex
        : liveState.enemyCharacters.findIndex((enemy) => enemy.hp > 0);
      const latestEnemy = targetIndex >= 0 ? liveState.enemyCharacters[targetIndex] : undefined;

      if (latestEnemy && latestEnemy.hp > 0) {
        const latestTargetInstanceId = getCharacterInstanceId(latestEnemy, targetIndex);
        const latestTargetBuffs = enemyBuffsById[latestTargetInstanceId] || [];
        const latestTargetDebuffs = enemyDebuffsById[latestTargetInstanceId] || [];
        const latestEnemyStats = applyEnemyCombatModifiers(latestEnemy.stats, latestTargetBuffs, latestTargetDebuffs);
        const liveEnemy = {
          ...latestEnemy,
          shields: latestEnemy.shields?.map((shield) => ({ ...shield })),
        };
        const finalDamage = familiar.effect.type === 'physical'
          ? calculatePhysicalDamage(effectAmount, latestEnemyStats.armor, familiar.stats.lethality)
          : calculateMagicDamage(effectAmount, latestEnemyStats.magicResist, familiar.stats.magicPenetration);
        const damageResult = applyDamageWithShield(liveEnemy, finalDamage);
        updateEnemyHp(targetIndex, liveEnemy.hp);

        useGameStore.setState((store) => ({
          state: {
            ...store.state,
            enemyCharacters: store.state.enemyCharacters.map((enemy, idx) =>
              idx === targetIndex ? { ...enemy, shields: liveEnemy.shields } : enemy
            ),
          },
        }));

        if (damageResult.shieldDamage > 0) {
          const shieldDamage = Math.round(damageResult.shieldDamage);
          familiarTurnLineParts.push(`${familiar.icon} ${familiar.name} 🛡️ ${getCharacterName(latestEnemy)} -${shieldDamage}`);
          familiarTurnLineTooltips.push(`${familiar.name} cracked ${shieldDamage} shield on ${getCharacterName(latestEnemy)}.`);
        }
        if (damageResult.hpDamage > 0) {
          const hpDamage = Math.round(damageResult.hpDamage);
          const damageIcon = familiar.effect.type === 'magic' ? '🔮' : '⚔️';
          const damageType = familiar.effect.type === 'magic' ? 'magic' : 'physical';
          familiarTurnLineParts.push(`${familiar.icon} ${familiar.name} ${damageIcon} ${getCharacterName(latestEnemy)} -${hpDamage}`);
          familiarTurnLineTooltips.push(`${familiar.name} dealt ${hpDamage} ${damageType} damage to ${getCharacterName(latestEnemy)}.`);
        }
      }
    } else if (familiar.effect.type === 'heal') {
      const latestPlayer = useGameStore.getState().state.playerCharacter;
      const healedHp = Math.min(Math.round(latestPlayer.hp + effectAmount), Math.round(playerScaledMaxHp));
      const actualHealing = healedHp - latestPlayer.hp;
      if (actualHealing > 0) {
        updatePlayerHp(healedHp);
        familiarTurnLineParts.push(`${familiar.icon} ${familiar.name} ❤️ ${playerName} +${actualHealing}`);
        familiarTurnLineTooltips.push(`${familiar.name} restored ${actualHealing} HP to ${playerName}.`);
      }
    } else if (familiar.effect.type === 'shield') {
      addShield(playerChar, `familiar-${familiar.id}-shield-${currentTurn}`, effectAmount, 2);
      useGameStore.setState((store) => ({
        state: {
          ...store.state,
          playerCharacter: {
            ...store.state.playerCharacter,
            shields: playerChar.shields,
          },
        },
      }));
      familiarTurnLineParts.push(`${familiar.icon} ${familiar.name} 🛡️ ${playerName} +${effectAmount}`);
      familiarTurnLineTooltips.push(`${familiar.name} granted ${effectAmount} shield to ${playerName}.`);

      const buffStat = familiar.effect.buffStat;
      const buffAmount = familiar.effect.buffAmount;
      if (buffStat && buffAmount) {
        setPlayerBuffs((prevBuffs) => addOrMergeBuffStack(
          prevBuffs,
          `${familiar.id}-${String(buffStat)}-buff`,
          `${familiar.name} Ward`,
          buffStat,
          buffAmount,
          familiar.effect.buffDuration || 2,
          turnCounter,
          'instant',
          false
        ));
      }
    }

    updatedTimers[familiar.id] = currentTurn + getFamiliarTurnInterval(familiar);
  });

  return { updatedTimers, familiarTurnLineParts, familiarTurnLineTooltips };
}
