import { Character, InventoryItem, Region } from '@game/types';
import { getItemById } from '@data/items';
import { PathRewardContext } from '@data/rewardPool';
import { generateRewardOptions } from '@data/rewardPool';
import { handleEnemyDefeat, getVictoryMessages, applyVictoryRewards } from '@battle/Flow/battleFlow';
import { getCharacterName } from '../../../../../i18n/helpers';
import { checkLevelUp } from '../../../../entity/Player/experienceSystem';
import { CombatBuff, addOrMergeBuffStack, computeBuffDisplayValues } from '@utils/itemSystem';
import { BattleLogEntry } from '../../log/types';

export interface ResolverQuestPath {
  difficulty?: 'safe' | 'fair' | 'risky';
  lootType?: string;
  name?: string;
  description?: string;
}

export interface SummaryRewards {
  gold: number;
  exp: number;
  items: InventoryItem[];
  spells: string[];
  weapons: string[];
  familiars: string[];
}

export interface ResolveEnemyDefeatParams {
  enemyChar: Character;
  playerChar: Character;
  playerScaledHealth: number;
  playerBuffs: CombatBuff[];
  playerPassiveIds: string[];
  turnCounter: number;
  stateCurrentFloor: number;
  stateSelectedRegion: Region | null;
  stateOriginalEnemyQueue: Character[][];
  stateInventory: InventoryItem[];
  currentQuestPath: ResolverQuestPath | null;

  appendLog: (message: string) => void;
  appendLogs: (messages: string[]) => void;
  appendEntries: (entries: BattleLogEntry[]) => void;

  setBattleEnded: (value: boolean) => void;
  setShowSummary: (value: boolean) => void;
  setBattleResult: (value: 'victory' | 'reward_selection') => void;
  setRewardOptions: (value: InventoryItem[]) => void;
  setPendingBattleData: (value: Character[][] | null) => void;
  setSummaryRewards: (value: SummaryRewards) => void;
  setPlayerBuffs: (value: CombatBuff[]) => void;

  discoverEnemy: (enemyId: string) => void;
  incrementEnemiesKilled: () => void;
  discoverFamiliar: (familiarId: string) => void;
  updatePersistentBuff: (buff: CombatBuff) => void;
  updateMaxAbilityPower: (value: number) => void;

  addInventoryItem: (item: InventoryItem) => void;
  addWeapon: (weaponId: string) => void;
  addSpell: (spellId: string) => void;
  addFamiliar: (familiarId: string) => void;
  addGold: (amount: number) => void;
  addExperience: (amount: number) => void;
  updatePlayerHp: (newHp: number) => void;
}

export function resolvePlayerDefeat(params: {
  setBattleEnded: (value: boolean) => void;
  setBattleResult: (value: 'defeat') => void;
  setShowSummary: (value: boolean) => void;
  appendEntries: (entries: BattleLogEntry[]) => void;
  logMessages: BattleLogEntry[];
}): void {
  const { setBattleEnded, setBattleResult, setShowSummary, appendEntries, logMessages } = params;
  setBattleEnded(true);
  setBattleResult('defeat');
  setShowSummary(true);
  appendEntries(logMessages);
}

export function resolveEnemyDefeat(params: ResolveEnemyDefeatParams): void {
  const {
    enemyChar,
    playerChar,
    playerScaledHealth,
    playerBuffs,
    playerPassiveIds,
    turnCounter,
    stateCurrentFloor,
    stateSelectedRegion,
    stateOriginalEnemyQueue,
    stateInventory,
    currentQuestPath,
    appendLog,
    appendLogs,
    appendEntries,
    setBattleEnded,
    setShowSummary,
    setBattleResult,
    setRewardOptions,
    setPendingBattleData,
    setSummaryRewards,
    setPlayerBuffs,
    discoverEnemy,
    incrementEnemiesKilled,
    discoverFamiliar,
    updatePersistentBuff,
    updateMaxAbilityPower,
    addInventoryItem,
    addWeapon,
    addSpell,
    addFamiliar,
    addGold,
    addExperience,
    updatePlayerHp,
  } = params;

  setBattleEnded(true);

  // Track enemy defeat in profile.
  discoverEnemy(enemyChar.id);
  incrementEnemiesKilled();

  // Check for Glory passive (Dark Seal / Mejai's Soulstealer).
  if (enemyChar.tier === 'champion' || enemyChar.tier === 'legend') {
    const hasGlory = playerPassiveIds.includes('glory');
    const hasGloryUpgraded = playerPassiveIds.includes('glory_upgraded');

    if (hasGlory || hasGloryUpgraded) {
      const apGain = hasGloryUpgraded ? 15 : 10;
      const passiveName = hasGloryUpgraded ? 'Glory (Upgraded)' : 'Glory';

      const updatedBuffs = addOrMergeBuffStack(
        playerBuffs,
        'glory_stacks',
        passiveName + ' Stacks',
        'abilityPower',
        apGain,
        9999,
        turnCounter,
        'stacking_permanent',
        true
      );

      setPlayerBuffs(updatedBuffs);
      const gloryBuff = updatedBuffs.find((b) => b.id === 'glory_stacks');
      if (gloryBuff) {
        updatePersistentBuff(gloryBuff);
      }

      const baseAP = playerChar.stats.abilityPower || 0;
      const buffAP = updatedBuffs
        .filter((b) => b.stat === 'abilityPower')
        .reduce((sum, b) => {
          const { totalAmount } = computeBuffDisplayValues(b, turnCounter);
          return sum + totalAmount;
        }, 0);
      updateMaxAbilityPower(baseAP + buffAP);

      appendLog(`✨ ${passiveName}: +${apGain} AP gained! (Champion/Legend defeated)`);
    }
  }

  // Check for Manaflow passive (Tear of the Goddess).
  if (playerPassiveIds.includes('manaflow')) {
    const stacksPerVictory = 10;
    const maxStacks = 360;
    const existingBuff = playerBuffs.find((b) => b.id === 'manaflow_stacks');
    const currentStackCount = existingBuff?.stacks.length || 0;

    if (currentStackCount < maxStacks) {
      const stacksToAdd = Math.min(stacksPerVictory, maxStacks - currentStackCount);

      let updatedBuffs = playerBuffs;
      for (let i = 0; i < stacksToAdd; i++) {
        updatedBuffs = addOrMergeBuffStack(
          updatedBuffs,
          'manaflow_stacks',
          'Manaflow',
          'xpGain',
          0.01,
          9999,
          turnCounter,
          'stacking_permanent',
          true
        );
      }

      setPlayerBuffs(updatedBuffs);
      const manaflowBuff = updatedBuffs.find((b) => b.id === 'manaflow_stacks');
      if (manaflowBuff) {
        updatePersistentBuff(manaflowBuff);
      }

      const newStackCount = Math.min(currentStackCount + stacksToAdd, maxStacks);
      const xpGainBonus = newStackCount * 0.01;
      appendLog(`💧 Manaflow: +${stacksToAdd} stacks gained! (${newStackCount}/${maxStacks}, +${xpGainBonus.toFixed(2)} XP Gain)`);
    }
  }

  const totalMagicFind = stateInventory.reduce((sum, invItem) => {
    const item = getItemById(invItem.itemId);
    return sum + (item?.stats.magicFind || 0);
  }, 0);

  const totalGoldGain = stateInventory.reduce((sum, invItem) => {
    const item = getItemById(invItem.itemId);
    return sum + (item?.stats.goldGain || 0);
  }, 0);

  const hasReapPassive = playerPassiveIds.includes('reap');

  const victoryResult = handleEnemyDefeat(
    enemyChar,
    stateOriginalEnemyQueue,
    stateCurrentFloor,
    stateSelectedRegion,
    playerChar.level,
    totalMagicFind,
    totalGoldGain,
    hasReapPassive
  );

  const manaflowBuff = playerBuffs.find((b) => b.id === 'manaflow_stacks');
  if (manaflowBuff) {
    const stackCount = manaflowBuff.stacks.length;
    const manaflowXpGain = stackCount * 0.01;
    const manaflowMultiplier = 1 + (manaflowXpGain / 100);
    victoryResult.expReward = Math.floor(victoryResult.expReward * manaflowMultiplier);
  }

  applyVictoryRewards(
    victoryResult,
    addInventoryItem,
    addWeapon,
    addSpell,
    addFamiliar,
    addGold,
    addExperience,
    updatePlayerHp,
    playerChar.hp,
    playerScaledHealth,
    stateInventory
  );

  const messages = getVictoryMessages(getCharacterName(enemyChar), victoryResult);
  appendLogs(messages);

  const itemDrops =
    victoryResult.loot
      ?.filter((reward) => reward.type === 'item' && reward.itemId)
      .map((reward) => ({ itemId: reward.itemId!, quantity: reward.amount || 1 })) || [];
  const spellDrops =
    victoryResult.loot
      ?.filter((reward) => reward.type === 'spell' && reward.spellId)
      .map((reward) => reward.spellId!) || [];
  const weaponDrops =
    victoryResult.loot
      ?.filter((reward) => reward.type === 'weapon' && reward.weaponId)
      .map((reward) => reward.weaponId!) || [];
  const familiarDrops =
    victoryResult.loot
      ?.filter((reward) => reward.type === 'familiar' && reward.familiarId)
      .map((reward) => reward.familiarId!) || [];

  familiarDrops.forEach((familiarId) => discoverFamiliar(familiarId));

  setSummaryRewards({
    gold: victoryResult.goldReward,
    exp: victoryResult.expReward,
    items: itemDrops,
    spells: spellDrops,
    weapons: weaponDrops,
    familiars: familiarDrops,
  });

  setShowSummary(true);

  const newPlayerExp = playerChar.experience + victoryResult.expReward;
  const levelUpResult = checkLevelUp(newPlayerExp, playerChar.level);
  if (levelUpResult) {
    const levelsGained = levelUpResult.newLevel - playerChar.level;
    appendEntries([
      { message: `🎉 LEVEL UP! ${playerChar.name} reached level ${levelUpResult.newLevel}!` },
      { message: `💪 Gained ${levelsGained} level${levelsGained > 1 ? 's' : ''}! All stats increased!` },
    ]);
  }

  if (victoryResult.shouldShowRewardSelection) {
    const rewards = generateRewardOptions(
      stateSelectedRegion,
      stateCurrentFloor,
      playerChar.class,
      currentQuestPath
        ? ({
            difficulty: currentQuestPath.difficulty,
            lootType: currentQuestPath.lootType,
            pathName: currentQuestPath.name,
            pathDescription: currentQuestPath.description,
          } satisfies PathRewardContext)
        : undefined
    );
    setRewardOptions(rewards);
    setPendingBattleData(victoryResult.nextEnemies ?? null);
    setBattleResult('reward_selection');
    return;
  }

  if (victoryResult.hasMoreEnemies && victoryResult.nextEnemies) {
    setPendingBattleData(victoryResult.nextEnemies ?? null);
    setBattleResult('victory');
    return;
  }

  setPendingBattleData(null);
  setBattleResult('victory');
}
