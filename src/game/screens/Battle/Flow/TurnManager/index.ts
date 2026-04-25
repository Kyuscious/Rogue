import { useGameStore } from '@game/store';
import { decayShieldDurations } from '@battle/Flow/passives/shieldSystem';
import type { BattleLogEntry } from '../../log/types';
import type { CombatBuff } from '@utils/itemSystem';
import type { FamiliarData } from '../../../../entity/Player/familiars';
import { processFamiliarTurnEffects } from './familiars/processFamiliarTurnEffects';
import { applyEnemyTurnBuffAndDebuffEffects, applyPlayerTurnBuffAndRegenEffects } from './buffs/buffTurnEffects';

interface RunTurnManagerParams {
  currentTurn: number;
  turnCounter: number;
  playerChar: any;
  enemyChar: any;
  enemyCharIndex: number;
  playerScaledStats: any;
  enemyScaledStats: any;
  playerBuffs: CombatBuff[];
  enemyBuffs: CombatBuff[];
  enemyDebuffs: CombatBuff[];
  enemyBuffsById: Record<string, CombatBuff[]>;
  enemyDebuffsById: Record<string, CombatBuff[]>;
  activeFamiliars: FamiliarData[];
  familiarNextActionTurn: Record<string, number>;
  familiarStates: Record<string, { currentHp: number }>;
  selectedEnemyTargetId: string | null;
  activeEnemyInstanceId: string;
  applyEnemyCombatModifiers: (baseStats: any, buffs: CombatBuff[], debuffs: CombatBuff[]) => any;
  updatePlayerHp: (hp: number) => void;
  updateEnemyHp: (index: number, hp: number) => void;
  updateEnemyDebuffsForId: (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  updateEnemyBuffsForId: (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  setPlayerBuffs: (updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  setFamiliarNextActionTurn: (next: Record<string, number>) => void;
  reduceSpellCooldowns: () => void;
}

export function runTurnManager(params: RunTurnManagerParams): BattleLogEntry[] {
  const {
    currentTurn,
    turnCounter,
    playerChar,
    enemyChar,
    enemyCharIndex,
    playerScaledStats,
    enemyScaledStats,
    playerBuffs,
    enemyBuffs,
    enemyDebuffs,
    enemyBuffsById,
    enemyDebuffsById,
    activeFamiliars,
    familiarNextActionTurn,
    familiarStates,
    selectedEnemyTargetId,
    activeEnemyInstanceId,
    applyEnemyCombatModifiers,
    updatePlayerHp,
    updateEnemyHp,
    updateEnemyDebuffsForId,
    updateEnemyBuffsForId,
    setPlayerBuffs,
    setFamiliarNextActionTurn,
    reduceSpellCooldowns,
  } = params;

  const newLogMessages: BattleLogEntry[] = [];
  const statusTurnLineParts: string[] = [];
  const statusTurnLineTooltips: string[] = [];

  applyPlayerTurnBuffAndRegenEffects({
    playerName: playerChar.name,
    playerHp: playerChar.hp,
    playerMaxHp: playerScaledStats.health,
    playerHealthRegen: playerScaledStats.health_regen,
    playerBuffs,
    turnCounter,
    updatePlayerHp,
    setPlayerBuffs,
    statusTurnLineParts,
    statusTurnLineTooltips,
  });

  if (playerChar?.effects?.length > 0) {
    playerChar.effects = playerChar.effects.map((effect: any) => ({
      ...effect,
      duration: effect.duration - 1,
    })).filter((effect: any) => effect.duration > 0);
  }

  if (playerChar) {
    const beforeShields = playerChar.shields?.map((s: any) => ({ id: s.id, duration: s.duration })) || [];
    decayShieldDurations(playerChar);
    const afterShields = playerChar.shields?.map((s: any) => ({ id: s.id, duration: s.duration })) || [];
    const playerShieldsChanged = beforeShields.length !== afterShields.length
      || beforeShields.some((shield: any, index: number) => {
        const nextShield = afterShields[index];
        return !nextShield || nextShield.id !== shield.id || nextShield.duration !== shield.duration;
      });

    if (playerShieldsChanged) {
      useGameStore.setState((store) => ({
        state: {
          ...store.state,
          playerCharacter: {
            ...store.state.playerCharacter,
            shields: playerChar.shields,
          },
        },
      }));
    }
  }

  reduceSpellCooldowns();

  const familiarResult = processFamiliarTurnEffects({
    currentTurn,
    turnCounter,
    activeFamiliars,
    familiarNextActionTurn,
    familiarStates,
    selectedEnemyTargetId,
    enemyBuffsById,
    enemyDebuffsById,
    playerName: playerChar.name,
    playerScaledMaxHp: playerScaledStats.health,
    playerChar,
    applyEnemyCombatModifiers,
    updateEnemyHp,
    updatePlayerHp,
    setPlayerBuffs,
  });
  setFamiliarNextActionTurn(familiarResult.updatedTimers);

  applyEnemyTurnBuffAndDebuffEffects({
    enemyName: enemyChar.name,
    enemyHp: enemyChar.hp,
    enemyMaxHp: enemyScaledStats.health,
    enemyHealthRegen: enemyScaledStats.health_regen,
    enemyBuffs,
    enemyDebuffs,
    turnCounter,
    enemyCharIndex,
    activeEnemyInstanceId,
    updateEnemyHp,
    updateEnemyDebuffsForId,
    updateEnemyBuffsForId,
    statusTurnLineParts,
    statusTurnLineTooltips,
  });

  if (enemyChar) {
    const beforeEnemyShields = enemyChar.shields?.map((s: any) => ({ id: s.id, duration: s.duration })) || [];
    decayShieldDurations(enemyChar);
    const afterEnemyShields = enemyChar.shields?.map((s: any) => ({ id: s.id, duration: s.duration })) || [];
    const enemyShieldsChanged = beforeEnemyShields.length !== afterEnemyShields.length
      || beforeEnemyShields.some((shield: any, index: number) => {
        const nextShield = afterEnemyShields[index];
        return !nextShield || nextShield.id !== shield.id || nextShield.duration !== shield.duration;
      });

    if (enemyShieldsChanged) {
      useGameStore.setState((store) => ({
        state: {
          ...store.state,
          enemyCharacters: store.state.enemyCharacters.map((enemy: any, idx: number) =>
            idx === enemyCharIndex ? { ...enemy, shields: enemyChar.shields } : enemy
          ),
        },
      }));
    }
  }

  newLogMessages.push({ message: `--- Turn ${currentTurn} ---`, type: 'turn-system' });

  if (familiarResult.familiarTurnLineParts.length > 0) {
    newLogMessages.push({
      message: familiarResult.familiarTurnLineParts.join(' | '),
      type: 'turn-system',
      tooltip: familiarResult.familiarTurnLineTooltips.join(' | '),
    });
  }

  if (statusTurnLineParts.length > 0) {
    newLogMessages.push({
      message: statusTurnLineParts.join(' | '),
      type: 'turn-system',
      tooltip: statusTurnLineTooltips.join(' | '),
    });
  }

  return newLogMessages;
}
