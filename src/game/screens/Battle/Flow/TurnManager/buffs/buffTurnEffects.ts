import { computeBuffDisplayValues, decayBuffStacks, type CombatBuff } from '@utils/itemSystem';

interface PlayerTurnBuffParams {
  playerName: string;
  playerHp: number;
  playerMaxHp: number;
  playerHealthRegen: number;
  playerBuffs: CombatBuff[];
  turnCounter: number;
  updatePlayerHp: (hp: number) => void;
  setPlayerBuffs: (updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  statusTurnLineParts: string[];
  statusTurnLineTooltips: string[];
}

interface EnemyTurnBuffParams {
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyHealthRegen: number;
  enemyBuffs: CombatBuff[];
  enemyDebuffs: CombatBuff[];
  turnCounter: number;
  enemyCharIndex: number;
  activeEnemyInstanceId: string;
  updateEnemyHp: (index: number, hp: number) => void;
  updateEnemyDebuffsForId: (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  updateEnemyBuffsForId: (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => void;
  statusTurnLineParts: string[];
  statusTurnLineTooltips: string[];
}

export function applyPlayerTurnBuffAndRegenEffects(params: PlayerTurnBuffParams): void {
  const {
    playerName,
    playerHp,
    playerMaxHp,
    playerHealthRegen,
    playerBuffs,
    turnCounter,
    updatePlayerHp,
    setPlayerBuffs,
    statusTurnLineParts,
    statusTurnLineTooltips,
  } = params;

  if (playerHp > 0 && playerHealthRegen > 0 && playerHp < playerMaxHp) {
    const regenAmount = Math.floor(playerHealthRegen);
    if (regenAmount > 0) {
      const newPlayerHp = Math.min(Math.round(playerHp + regenAmount), Math.round(playerMaxHp));
      const actualHealing = newPlayerHp - playerHp;
      if (actualHealing > 0) {
        updatePlayerHp(newPlayerHp);
        statusTurnLineParts.push(`💚 ${playerName} +${actualHealing}`);
        statusTurnLineTooltips.push(`${playerName} regenerated ${actualHealing} HP.`);
      }
    }
  }

  if (playerBuffs.length > 0 && playerHp > 0 && playerHp < playerMaxHp) {
    const hotBuffs = playerBuffs.filter((b) => b.type === 'heal_over_time');
    if (hotBuffs.length > 0) {
      let totalHealing = 0;
      hotBuffs.forEach((buff) => {
        const { totalAmount } = computeBuffDisplayValues(buff, turnCounter);
        totalHealing += totalAmount;
      });

      const healingAmount = Math.max(1, Math.floor(totalHealing));
      const newPlayerHp = Math.min(Math.round(playerHp + healingAmount), Math.round(playerMaxHp));
      const actualHealing = newPlayerHp - playerHp;
      if (actualHealing > 0) {
        updatePlayerHp(newPlayerHp);
        statusTurnLineParts.push(`✨ ${playerName} +${actualHealing}`);
        statusTurnLineTooltips.push(`${playerName} healed ${actualHealing} HP from buffs.`);
      }
    }
  }

  if (playerBuffs.length > 0) {
    setPlayerBuffs((prevBuffs) => decayBuffStacks(prevBuffs, turnCounter));
  }
}

export function applyEnemyTurnBuffAndDebuffEffects(params: EnemyTurnBuffParams): void {
  const {
    enemyName,
    enemyHp,
    enemyMaxHp,
    enemyHealthRegen,
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
  } = params;

  if (enemyHealthRegen > 0 && enemyHp > 0 && enemyHp < enemyMaxHp) {
    const regenAmount = Math.floor(enemyHealthRegen);
    if (regenAmount > 0) {
      const newEnemyHp = Math.min(enemyHp + regenAmount, enemyMaxHp);
      const actualHealing = newEnemyHp - enemyHp;
      if (actualHealing > 0) {
        updateEnemyHp(enemyCharIndex, newEnemyHp);
        statusTurnLineParts.push(`💚 ${enemyName} +${actualHealing}`);
        statusTurnLineTooltips.push(`${enemyName} regenerated ${actualHealing} HP.`);
      }
    }
  }

  if (enemyDebuffs.length > 0 && enemyHp > 0) {
    const hemorrhageBuff = enemyDebuffs.find((d) => d.id === 'hemorrhage');
    if (hemorrhageBuff) {
      const { totalAmount } = computeBuffDisplayValues(hemorrhageBuff, turnCounter);
      const damageAmount = Math.max(1, Math.floor(totalAmount));
      const stackCount = hemorrhageBuff.stacks.length;
      const newEnemyHp = Math.max(0, enemyHp - damageAmount);
      const actualDamage = enemyHp - newEnemyHp;
      if (actualDamage > 0) {
        updateEnemyHp(enemyCharIndex, newEnemyHp);
        statusTurnLineParts.push(`🩸 ${enemyName} -${actualDamage}`);
        statusTurnLineTooltips.push(`${enemyName} took ${actualDamage} damage from Hemorrhage (${stackCount} stack${stackCount > 1 ? 's' : ''}).`);
      }
    }

    updateEnemyDebuffsForId(activeEnemyInstanceId, (prevDebuffs) => decayBuffStacks(prevDebuffs, turnCounter));
  }

  if (enemyBuffs.length > 0) {
    updateEnemyBuffsForId(activeEnemyInstanceId, (prevBuffs) => decayBuffStacks(prevBuffs, turnCounter));
  }
}
