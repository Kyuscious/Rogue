import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../../game/store';
import { CharacterStatus } from '../../entity/CharacterStatus';
import { BattlefieldDisplay } from './BattlefieldDisplay';
import { TurnTimeline } from './TurnTimeline';
import { getScaledStats, calculatePhysicalDamage, calculateMagicDamage, rollCriticalStrike, calculateCriticalDamage } from '../../../game/statsSystem';
import { getPassiveIdsFromInventory } from '../../../game/items';
import { calculateOnHitEffects, applyOnHitEffects, formatOnHitEffects } from '../../../game/onHitEffects';
import { 
  TurnEntity, 
  TurnAction, 
  generateTurnSequence
} from '../../../game/turnSystemV2';
import { 
  getItemById,
  createBuffFromItem,
  getUsableItems,
  createHealthPotionBuff,
  CombatBuff,
  applyLifeDrainingBuff,
  applyDrainBuff,
  applyEnduringFocusBuff
} from '../../../game/itemSystem';
import { 
  handleEnemyDefeat,
  getVictoryMessages,
  applyVictoryRewards,
} from '../../../game/battleFlow';
import { generateRewardOptions } from '../../../game/rewardPool';
import { checkLevelUp } from '../../../game/experienceSystem';
import { incrementEnemiesKilled } from '../../../game/profileSystem';
import { ItemBar } from './ItemBar';
import { BattleSummary } from './BattleSummary';
import { InventoryItem } from '../../../game/types';
import './Battle.css';

interface BattleProps {
  onBack?: () => void;
  onQuestComplete?: () => void;
}

export const Battle: React.FC<BattleProps> = ({ onBack, onQuestComplete }) => {
  const { state, updateEnemyHp, updatePlayerHp, addInventoryItem, addGold, startBattle, consumeInventoryItem, addExperience, useReroll, updateMaxAbilityPower } = useGameStore();
  const playerName = state.username;
  const [playerTurnDone, setPlayerTurnDone] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'reward_selection' | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);
  const [rewardOptions, setRewardOptions] = useState<InventoryItem[]>([]);
  const [pendingBattleData, setPendingBattleData] = useState<any>(null);
  
  // Turn entities for new system
  const [playerEntity, setPlayerEntity] = useState<TurnEntity | null>(null);
  const [enemyEntity, setEnemyEntity] = useState<TurnEntity | null>(null);
  const [turnSequence, setTurnSequence] = useState<TurnAction[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Movement and range system
  const [playerPosition, setPlayerPosition] = useState(50);
  const [enemyPosition, setEnemyPosition] = useState(-50);

  const playerChar = state.playerCharacter;
  const enemyChar = state.enemyCharacters[0];

  if (!playerChar || !enemyChar) {
    return <div>Loading battle...</div>;
  }

  // Get passive IDs from inventory
  const playerPassiveIds = getPassiveIdsFromInventory(state.inventory);

  // Get scaled stats for both characters (with class bonuses and passives)
  const playerScaledStats = getScaledStats(playerChar.stats, playerChar.level, playerChar.class, playerPassiveIds);
  const enemyScaledStats = getScaledStats(enemyChar.stats, enemyChar.level, enemyChar.class);

  // Ref for auto-scrolling battle log
  const logEntriesRef = useRef<HTMLDivElement>(null);

  // Initialize/reset turn entities when enemy changes (new encounter)
  useEffect(() => {
    console.log('🔄 NEW ENEMY LOADED:', {
      enemyId: enemyChar.id,
      enemyName: enemyChar.name,
      enemyHp: enemyChar.hp,
    });
    
    // Recalculate scaled stats inside effect to ensure fresh values
    const freshPlayerStats = getScaledStats(playerChar.stats, playerChar.level, playerChar.class, playerPassiveIds);
    const freshEnemyStats = getScaledStats(enemyChar.stats, enemyChar.level, enemyChar.class);
    
    const pEntity: TurnEntity = {
      id: 'player',
      name: playerChar.name,
      attackSpeed: freshPlayerStats.attackSpeed,
      abilityHaste: freshPlayerStats.abilityHaste,
    };

    const eEntity: TurnEntity = {
      id: 'enemy',
      name: enemyChar.name,
      attackSpeed: freshEnemyStats.attackSpeed,
      abilityHaste: freshEnemyStats.abilityHaste,
    };

    setPlayerEntity(pEntity);
    setEnemyEntity(eEntity);
    setTurnSequence(generateTurnSequence(pEntity, eEntity, 20));
    
    // Reset battle state for new encounter
    // =====================================================================
    // CRITICAL FIX FOR RECURRING BUTTON DISAPPEARANCE BUG:
    // =====================================================================
    // Problem: After defeating enemy 1, enemy 2 loads but action buttons don't appear
    // Root Cause: When victory happens, battleEnded=true and playerTurnDone=true.
    //             These flags prevent buttons from showing (isPlayerTurn = false).
    //             The setTimeout delay before startBattle() creates a timing gap.
    // 
    // Solution: TWO layers of protection:
    //   1. This useEffect resets ALL state when enemyChar.id changes (runs on new enemy)
    //   2. Explicit state reset BEFORE startBattle() in victory handler (lines ~740)
    // 
    // Both resets are needed because:
    //   - This useEffect might not run immediately due to React batching
    //   - The setTimeout creates async timing where state can be stale
    //   - Resetting BEFORE startBattle ensures clean state transition
    // =====================================================================
    setTurnCounter(0);
    setSequenceIndex(0);
    setPlayerTurnDone(false); // Critical: Must reset to false for buttons to appear
    console.log('📍 Calling setBattleEnded(false) for new enemy');
    setBattleEnded(false);     // Critical: Must reset to false for buttons to appear
    // Don't reset battleResult here - it needs to persist for handleSummaryContinue
    // handleSummaryContinue will reset it after processing victory/defeat
    setBattleLog([{ message: 'Battle started!' }, { message: '---' }]);
    setLastLoggedTurn(0);
    setItemModeActive(false); // Reset item mode for new encounter
    
    console.log('🔧 Battle state reset complete - battleEnded should now be FALSE');
    
    // Don't reset combat stats or summary rewards here - they need to persist
    // for the summary display. They'll be reset after the user dismisses the summary.
    
    // Reset positions for new encounter
    setPlayerPosition(50);
    setEnemyPosition(-50);
  }, [enemyChar.id, playerChar.level, playerChar.class, state.currentFloor]);

  // Initialize battle log
  interface LogEntry {
    message: string;
    type?: 'normal' | 'simultaneous';
  }
  const [battleLog, setBattleLog] = useState<LogEntry[]>(() => {
    return [
      { message: 'Battle started!' },
      { message: '---' },
    ];
  });

  // Track which turn we've logged to avoid duplicate messages
  const [lastLoggedTurn, setLastLoggedTurn] = useState(0);

  // Track active buffs on player (initialize with persistent buffs from store)
  const [playerBuffs, setPlayerBuffs] = useState<CombatBuff[]>(() => {
    // Get persistent buffs from store (e.g., elixirs)
    const persistentBuffs = state.persistentBuffs || [];
    return [...persistentBuffs];
  });

  // Track item mode active state (when UseItem button is clicked)
  const [itemModeActive, setItemModeActive] = useState(false);
  
  // Track combat statistics for summary
  const [combatStats, setCombatStats] = useState({
    highestDamageDealt: 0,
    highestDamageSource: 'attack' as 'attack' | 'spell',
    highestDamageTaken: 0,
    highestDamageTakenSource: 'attack' as 'attack' | 'spell',
  });
  const [showSummary, setShowSummary] = useState(false);
  const [summaryRewards, setSummaryRewards] = useState<{
    gold: number;
    exp: number;
    items: InventoryItem[];
  } | null>(null);

  // Log component render after all state is declared
  console.log('⚙️ COMPONENT RENDER:', {
    enemyId: enemyChar.id,
    enemyName: enemyChar.name,
    enemyHp: enemyChar.hp,
    battleEnded,
    showSummary,
    enemyCount: state.enemyCharacters.length
  });

  // Handler for simultaneous actions detected by timeline
  const handleSimultaneousAction = (playerAction: string, enemyAction: string, time: number) => {
    const message = `⚡ [${playerAction.toUpperCase()}] from ${playerChar.name} and [${enemyAction.toUpperCase()}] from ${enemyChar.name} happen simultaneously at T${time.toFixed(2)}! ${playerChar.name} has priority!`;
    setBattleLog(prev => [...prev, { message, type: 'simultaneous' }]);
  };

  // Calculate distance between player and enemy
  const currentDistance = Math.abs(playerPosition - enemyPosition);
  
  // Check if player can attack (within attack range)
  const canPlayerAttack = currentDistance <= (playerScaledStats.attackRange || 125);
  
  // Check if player can cast spells (within spell range)
  const canPlayerCastSpell = currentDistance <= 500;
  
  // Movement distance is player's movement speed scaled down for battlefield
  const MOVE_DISTANCE = Math.floor((playerScaledStats.movementSpeed || 350) / 10);

  const handleRewardSelection = (selectedItem: InventoryItem) => {
    // Add selected reward to inventory
    addInventoryItem(selectedItem);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `🎁 Reward selected: ${selectedItem.itemId}` },
    ]);
    
    // Hide summary and continue
    setShowSummary(false);
    
    // Continue to next enemy if there are any
    if (pendingBattleData && pendingBattleData.length > 0) {
      setTimeout(() => {
        // Reset battle state BEFORE calling startBattle
        setBattleEnded(false);
        setPlayerTurnDone(false);
        setBattleResult(null);
        
        // Now start the next battle
        startBattle(pendingBattleData);
        setPendingBattleData(null);
      }, 500);
    } else {
      // No more enemies - check if quest is complete
      if (state.currentFloor >= 10) {
        // Quest complete! Trigger region selection
        if (onQuestComplete) {
          onQuestComplete();
        }
      } else {
        // Continue quest - show victory
        setBattleEnded(true);
        setBattleResult('victory');
        setShowSummary(true);
      }
    }
  };

  const handleSkipReward = () => {
    setBattleLog((prev) => [
      ...prev,
      { message: `⏭️ Reward skipped` },
    ]);
    
    // Hide summary and continue
    setShowSummary(false);
    
    // Continue to next enemy if there are any
    if (pendingBattleData && pendingBattleData.length > 0) {
      setTimeout(() => {
        // Reset battle state BEFORE calling startBattle
        setBattleEnded(false);
        setPlayerTurnDone(false);
        setBattleResult(null);
        
        // Now start the next battle
        startBattle(pendingBattleData);
        setPendingBattleData(null);
      }, 500);
    } else {
      // No more enemies - check if quest is complete
      if (state.currentFloor >= 10) {
        // Quest complete! Trigger region selection
        if (onQuestComplete) {
          onQuestComplete();
        }
      } else {
        // Continue quest - show victory
        setBattleEnded(true);
        setBattleResult('victory');
        setShowSummary(true);
      }
    }
  };

  const handleRerollRewards = () => {
    // Try to use a reroll from global currency
    if (!useReroll()) return;
    
    // Generate new rewards
    const newRewards = generateRewardOptions(state.selectedRegion, state.currentFloor, playerChar.class);
    setRewardOptions(newRewards);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `🎲 Rerolled rewards! (${state.rerolls} rerolls left)` },
    ]);
  };

  const handleAttack = () => {
    if (!playerEntity || !enemyEntity) return;
    
    // Check if player is in range
    if (!canPlayerAttack) {
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} is out of range! (${currentDistance} > ${playerScaledStats.attackRange || 125})` },
      ]);
      // Advance to next action in sequence even if attack fails
      setSequenceIndex((prev) => prev + 1);
      setTurnCounter((prev) => Math.ceil(prev + 1));
      setPlayerTurnDone(true);
      return;
    }
    
    // Use actual Attack Damage stat
    let baseDamage = playerScaledStats.attackDamage;
    let isCrit = false;
    
    // Check for critical strike
    if (rollCriticalStrike(playerScaledStats.criticalChance || 0)) {
      baseDamage = calculateCriticalDamage(baseDamage, playerScaledStats.criticalDamage || 200);
      isCrit = true;
    }
    
    // Apply enemy armor mitigation with lethality
    const finalDamage = calculatePhysicalDamage(
      baseDamage,
      enemyScaledStats.armor || 0,
      playerScaledStats.lethality || 0
    );
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - finalDamage);
    updateEnemyHp(0, newEnemyHp);
    
    // Track damage dealt for combat stats
    if (finalDamage > combatStats.highestDamageDealt) {
      setCombatStats(prev => ({
        ...prev,
        highestDamageDealt: Math.round(finalDamage),
        highestDamageSource: 'attack',
      }));
    }
    
    // Calculate on-hit effects first (declare variables outside if block for logging)
    let onHitResult = { bonusDamage: 0, healing: 0, effects: [] as any[] };
    let totalHealing = 0;
    
    // INSTANT DEATH CHECK: If enemy HP is 0, they're dead - no on-hit effects applied
    if (newEnemyHp > 0) {
      // Calculate and apply on-hit effects (healing on hit, lifesteal, etc.)
      onHitResult = calculateOnHitEffects(
        playerChar,
        enemyChar,
        finalDamage,
        playerScaledStats
      );
      
      const healingResult = applyOnHitEffects(
        playerChar,
        enemyChar,
        onHitResult
      );
      totalHealing = healingResult.totalHealing;
      
      // Apply healing from on-hit effects
      if (totalHealing > 0) {
        const newPlayerHp = Math.min(
          playerChar.hp + totalHealing,
          playerScaledStats.health
        );
        updatePlayerHp(newPlayerHp);
      }
    }
    
    // Build battle log messages
    const logMessages: Array<{ message: string }> = [];
    
    if (isCrit) {
      logMessages.push({ message: `💥 CRITICAL HIT! ${playerChar.name} attacks ${enemyChar.name} for ${finalDamage} damage!` });
    } else {
      logMessages.push({ message: `${playerChar.name} attacks ${enemyChar.name} for ${finalDamage} damage!` });
    }
    
    // Add on-hit effects to log (only if enemy survived)
    if (newEnemyHp > 0 && totalHealing > 0) {
      const effectsText = formatOnHitEffects(onHitResult.effects);
      logMessages.push({ message: `💚 Healed ${Math.round(totalHealing)} HP${effectsText}` });
    }
    
    // Check for Life Draining passive (Doran's Blade)
    if (playerPassiveIds.includes('life_draining')) {
      const baseAD = playerChar.stats.attackDamage || 50; // Base AD without buffs
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyLifeDrainingBuff(prev, baseAD);
        // Check if buff was added/updated
        const oldBuff = prev.find((b) => b.id.startsWith('life_draining'));
        const newBuff = updatedBuffs.find((b) => b.id.startsWith('life_draining'));
        if (!oldBuff || (newBuff && newBuff.amount !== oldBuff.amount)) {
          logMessages.push({ message: `⚔️ Life Draining: +${Math.floor(baseAD * 0.01)} AD!` });
        }
        return updatedBuffs;
      });
    }
    
    setBattleLog((prev) => [...prev, ...logMessages]);
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleSpell = () => {
    if (!playerEntity || !enemyEntity) return;
    
    // Check if player is in range
    if (!canPlayerCastSpell) {
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name}'s spell is out of range! (${currentDistance} > 500)` },
      ]);
      // Advance to next action in sequence even if spell fails
      setSequenceIndex((prev) => prev + 1);
      setTurnCounter((prev) => Math.ceil(prev + 1));
      setPlayerTurnDone(true);
      return;
    }
    
    // Use Ability Power stat for spell damage
    const baseSpellDamage = playerScaledStats.abilityPower;
    
    // Apply enemy magic resist mitigation with magic penetration
    const finalDamage = calculateMagicDamage(
      baseSpellDamage,
      enemyScaledStats.magicResist || 0,
      playerScaledStats.magicPenetration || 0
    );
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - finalDamage);
    updateEnemyHp(0, newEnemyHp);
    
    // Track damage dealt for combat stats
    if (finalDamage > combatStats.highestDamageDealt) {
      setCombatStats(prev => ({
        ...prev,
        highestDamageDealt: Math.round(finalDamage),
        highestDamageSource: 'spell',
      }));
    }
    
    // Calculate omnivamp healing (only if enemy survived)
    let omnivampHealing = 0;
    if (newEnemyHp > 0 && playerScaledStats.omnivamp && playerScaledStats.omnivamp > 0) {
      omnivampHealing = Math.max(1, Math.round(finalDamage * (playerScaledStats.omnivamp / 100)));
      const newPlayerHp = Math.min(
        playerChar.hp + omnivampHealing,
        playerScaledStats.health
      );
      updatePlayerHp(newPlayerHp);
    }
    
    const logMessages: Array<{ message: string }> = [];
    logMessages.push({ message: `${playerChar.name} casts a spell on ${enemyChar.name} for ${finalDamage} magic damage!` });
    
    // Add omnivamp healing to log
    if (omnivampHealing > 0) {
      logMessages.push({ message: `💚 Healed ${omnivampHealing} HP [Omnivamp]` });
    }
    
    // Check for Drain passive (Doran's Ring)
    if (playerPassiveIds.includes('drain')) {
      const baseAP = playerChar.stats.abilityPower || 30; // Base AP without buffs
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyDrainBuff(prev, baseAP);
        // Check if buff was added/updated
        const oldBuff = prev.find((b) => b.id.startsWith('drain'));
        const newBuff = updatedBuffs.find((b) => b.id.startsWith('drain'));
        if (!oldBuff || (newBuff && newBuff.amount !== oldBuff.amount)) {
          logMessages.push({ message: `✨ Drain: +${Math.floor(baseAP * 0.01)} AP!` });
        }
        return updatedBuffs;
      });
    }
    
    setBattleLog((prev) => [...prev, ...logMessages]);
    
    // Advance to next action
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handlePlayerMove = (direction: 'away' | 'towards') => {
    if (!playerEntity || !enemyEntity || !playerChar) return;
    
    // Calculate new position based on movement direction
    let newPosition = playerPosition;
    
    if (direction === 'away') {
      // Move towards positive (away from enemy at -50)
      newPosition = playerPosition + MOVE_DISTANCE;
    } else {
      // Move towards negative (towards enemy at -50)
      newPosition = playerPosition - MOVE_DISTANCE;
    }
    
    // Check if player would escape/flee
    if (newPosition > 500 || newPosition < -500) {
      setBattleEnded(true);
      setBattleResult('defeat');
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} fled the battlefield!` },
      ]);
      return;
    }
    
    setPlayerPosition(newPosition);
    const newDistance = Math.abs(newPosition - enemyPosition);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${playerChar.name} moved ${direction} by ${MOVE_DISTANCE} units. Distance: ${newDistance}` },
    ]);
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleUseItem = (itemId: string) => {
    if (!playerEntity || !enemyEntity) return;
    
    const item = getItemById(itemId);
    if (!item) return;
    
    // Check if item is consumable
    if (!item.consumable) {
      setBattleLog((prev) => [
        ...prev,
        { message: `${item.name} cannot be used in battle!` },
      ]);
      return;
    }
    
    // Handle specific item effects
    if (itemId === 'health_potion') {
      const newBuff = createHealthPotionBuff(`buff-${Date.now()}`);
      setPlayerBuffs((prev) => [...prev, newBuff]);
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} used ${item.name}! Restoring 10 HP per turn for 5 turns.` },
      ]);
      
      // Consume the item from inventory
      consumeInventoryItem(itemId);
    } else {
      // Fallback for other items
      const newBuff = createBuffFromItem(itemId, `buff-${Date.now()}`);
      if (!newBuff) {
        setBattleLog((prev) => [
          ...prev,
          { message: `${item.name} has no usable effects!` },
        ]);
        return;
      }
      
      setPlayerBuffs((prev) => [...prev, newBuff]);
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} used ${item.name}! +${newBuff.amount} ${newBuff.stat} for ${newBuff.duration} turns!` },
      ]);
      
      // Consume the item from inventory
      consumeInventoryItem(itemId);
    }
    
    // Reset item mode after using an item
    setItemModeActive(false);
    
    // Advance to next action in sequence (using item counts as an action)
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleEnemyMove = () => {
    if (!enemyEntity || !enemyChar) return;
    
    // AI: Only move if out of range to attack
    const enemyAttackRange = enemyScaledStats.attackRange || 125;
    const distance = Math.abs(playerPosition - enemyPosition);
    
    // If in range to attack, don't move
    if (distance <= enemyAttackRange) {
      return; // Will let normal attack/spell handle it
    }
    
    // Out of range, so move towards player
    let newPosition = enemyPosition + MOVE_DISTANCE;
    
    // Check if enemy would escape
    if (newPosition > 500 || newPosition < -500) {
      setBattleEnded(true);
      setBattleResult('victory');
      setBattleLog((prev) => [
        ...prev,
        { message: `${enemyChar.name} fled the battlefield! (Out of range)` },
      ]);
      return;
    }
    
    setEnemyPosition(newPosition);
    const newDistance = Math.abs(playerPosition - newPosition);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${enemyChar.name} moved towards by ${MOVE_DISTANCE} units. Distance: ${newDistance}` },
    ]);
  };

  const handleSkip = () => {
    if (!playerEntity || !enemyEntity) return;
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${playerChar.name} skipped their turn!` },
    ]);
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleEnemyAttack = () => {
    if (!playerEntity || !enemyEntity || enemyChar.hp <= 0) return;
    
    const currentAction = turnSequence[sequenceIndex];
    if (!currentAction) return;
    
    if (currentAction.actionType === 'attack') {
      // Check if enemy is in range
      const enemyAttackRange = enemyScaledStats.attackRange || 125;
      if (currentDistance > enemyAttackRange) {
        setBattleLog((prev) => [
          ...prev,
          { message: `${enemyChar.name} is out of range! (${currentDistance} > ${enemyAttackRange})` },
        ]);
        // Advance to next action even if attack fails
        setSequenceIndex((prev) => prev + 1);
        setTurnCounter((prev) => {
          const nextAction = turnSequence[sequenceIndex + 1];
          return nextAction ? Math.ceil(nextAction.turnNumber) : prev + 1;
        });
        return;
      }
      
      let enemyBaseDamage = enemyScaledStats.attackDamage;
      let isCrit = false;
      
      // Check for critical strike
      if (rollCriticalStrike(enemyScaledStats.criticalChance || 0)) {
        enemyBaseDamage = calculateCriticalDamage(enemyBaseDamage, enemyScaledStats.criticalDamage || 200);
        isCrit = true;
      }
      
      // Apply player armor mitigation with enemy lethality
      const finalDamage = calculatePhysicalDamage(
        enemyBaseDamage,
        playerScaledStats.armor || 0,
        enemyScaledStats.lethality || 0
      );
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - finalDamage);
      updatePlayerHp(newPlayerHp);
      
      // Track damage taken for combat stats
      if (finalDamage > combatStats.highestDamageTaken) {
        setCombatStats(prev => ({
          ...prev,
          highestDamageTaken: Math.round(finalDamage),
          highestDamageTakenSource: 'attack',
        }));
      }
      
      // IMMEDIATE DEATH CHECK: End battle instantly if player dies
      if (newPlayerHp <= 0 && !battleEnded) {
        setBattleEnded(true);
        setBattleResult('defeat');
        setShowSummary(true);
        return; // Stop processing this turn
      }
      
      // INSTANT DEATH CHECK: If player HP is 0, they're dead - no buffs applied
      if (newPlayerHp > 0 && playerPassiveIds.includes('enduring_focus')) {
        setPlayerBuffs((prev) => {
          const updatedBuffs = applyEnduringFocusBuff(prev, finalDamage);
          return updatedBuffs;
        });
      }
      
      if (isCrit) {
        setBattleLog((prev) => [
          ...prev,
          { message: `💥 CRITICAL HIT! ${enemyChar.name} attacks ${playerChar.name} for ${finalDamage} damage!` },
          ...(newPlayerHp > 0 && playerPassiveIds.includes('enduring_focus') 
            ? [{ message: `🛡️ Enduring Focus: Healing ${Math.floor((finalDamage * 0.05) / 3)} HP per turn for 3 turns!` }]
            : []),
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          { message: `${enemyChar.name} attacks ${playerChar.name} for ${finalDamage} damage!` },
          ...(newPlayerHp > 0 && playerPassiveIds.includes('enduring_focus') 
            ? [{ message: `🛡️ Enduring Focus: Healing ${Math.floor((finalDamage * 0.05) / 3)} HP per turn for 3 turns!` }]
            : []),
        ]);
      }
    } else if (currentAction.actionType === 'spell') {
      // Check if enemy spell is in range
      if (currentDistance > 500) {
        setBattleLog((prev) => [
          ...prev,
          { message: `${enemyChar.name}'s spell is out of range! (${currentDistance} > 500)` },
        ]);
        // Advance to next action even if spell fails
        setSequenceIndex((prev) => prev + 1);
        setTurnCounter((prev) => {
          const nextAction = turnSequence[sequenceIndex + 1];
          return nextAction ? Math.ceil(nextAction.turnNumber) : prev + 1;
        });
        return;
      }
      
      const enemyBaseSpellDamage = enemyScaledStats.abilityPower;
      
      // Apply player magic resist mitigation with enemy magic penetration
      const finalDamage = calculateMagicDamage(
        enemyBaseSpellDamage,
        playerScaledStats.magicResist || 0,
        enemyScaledStats.magicPenetration || 0
      );
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - finalDamage);
      updatePlayerHp(newPlayerHp);
      
      // Track damage taken for combat stats
      if (finalDamage > combatStats.highestDamageTaken) {
        setCombatStats(prev => ({
          ...prev,
          highestDamageTaken: Math.round(finalDamage),
          highestDamageTakenSource: 'spell',
        }));
      }
      
      // IMMEDIATE DEATH CHECK: End battle instantly if player dies
      if (newPlayerHp <= 0 && !battleEnded) {
        setBattleEnded(true);
        setBattleResult('defeat');
        setShowSummary(true);
        return; // Stop processing this turn
      }
      
      // INSTANT DEATH CHECK: If player HP is 0, they're dead - no buffs applied
      if (newPlayerHp > 0 && playerPassiveIds.includes('enduring_focus')) {
        setPlayerBuffs((prev) => {
          const updatedBuffs = applyEnduringFocusBuff(prev, finalDamage);
          return updatedBuffs;
        });
      }
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${enemyChar.name} casts a spell on ${playerChar.name} for ${finalDamage} magic damage!` },
        ...(newPlayerHp > 0 && playerPassiveIds.includes('enduring_focus') 
          ? [{ message: `🛡️ Enduring Focus: Healing ${Math.floor((finalDamage * 0.05) / 3)} HP per turn for 3 turns!` }]
          : []),
      ]);
    }
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => {
      const nextAction = turnSequence[sequenceIndex + 1];
      return nextAction ? Math.ceil(nextAction.turnNumber) : prev + 1;
    });
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleAbility = (abilityIndex: number) => {
    const ability = playerChar.abilities[abilityIndex];
    if (ability.damage) {
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} uses ${ability.name}! Deals ${ability.damage} damage!` },
      ]);
    }
    
    // End player turn
    setPlayerTurnDone(true);
  };
  
  const handleSummaryContinue = () => {
    console.log('🎯 handleSummaryContinue called!', {
      battleResult,
      hasPendingData: !!pendingBattleData,
      pendingCount: pendingBattleData?.length,
      currentFloor: state.currentFloor
    });
    
    setShowSummary(false);
    
    // Reset combat stats and rewards after hiding summary
    setCombatStats({
      highestDamageDealt: 0,
      highestDamageSource: 'attack',
      highestDamageTaken: 0,
      highestDamageTakenSource: 'attack',
    });
    setSummaryRewards(null);
    
    if (battleResult === 'defeat') {
      console.log('💀 Handling defeat - reloading');
      // Return to main menu on defeat
      localStorage.removeItem('savedRun');
      window.location.reload();
    } else if (battleResult === 'victory') {
      console.log('✅ Handling victory', { hasPendingData: !!pendingBattleData, count: pendingBattleData?.length });
      // Continue to next enemy if there are any
      if (pendingBattleData && pendingBattleData.length > 0) {
        console.log('⏭️ Continuing to next enemy...');
        // Continue to next enemy
        setTimeout(() => {
          console.log('🚀 Starting next battle with enemies:', pendingBattleData.map((e: any) => ({ id: e.id, name: e.name, hp: e.hp })));
          // Reset battle state BEFORE calling startBattle
          setBattleEnded(false);
          setPlayerTurnDone(false);
          setBattleResult(null);
          
          // Now start the next battle
          startBattle(pendingBattleData);
          setPendingBattleData(null);
        }, 100);
      } else {
        console.log('🏁 No more enemies - quest complete or returning');
        // All encounters complete
        if (state.currentFloor >= 10) {
          // Quest complete! Trigger region selection
          if (onQuestComplete) {
            onQuestComplete();
          }
        } else if (onBack) {
          onBack();
        } else {
          window.location.reload();
        }
      }
    }
    // Note: If battleResult === 'reward_selection', this won't be called
    // because the Continue button is hidden and reward selection handles its own flow
  };

  // Auto-scroll battle log to bottom when new entries are added
  useEffect(() => {
    if (logEntriesRef.current) {
      logEntriesRef.current.scrollTop = logEntriesRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Auto-scroll when turn indicator appears (player's turn)
  useEffect(() => {
    if (logEntriesRef.current && !playerTurnDone && !battleEnded) {
      const currentAction = turnSequence[sequenceIndex];
      if (currentAction && currentAction.entityId === 'player') {
        logEntriesRef.current.scrollTop = logEntriesRef.current.scrollHeight;
      }
    }
  }, [sequenceIndex, playerTurnDone, battleEnded, turnSequence]);

  // Apply turn-based effects every turn
  useEffect(() => {
    const currentTurn = Math.ceil(turnCounter);
    if (turnCounter > 0 && currentTurn > lastLoggedTurn && turnCounter % 1 === 0) {
      // Turn-based effects trigger at each integer turn count
      const newLogMessages: Array<{ message: string }> = [];
      newLogMessages.push({ message: `--- Turn ${currentTurn} ---` });
      
      // INSTANT DEATH CHECK: Only apply healing if player is alive (HP > 0)
      // Apply player health regeneration from base stats
      if (playerChar && playerChar.hp > 0 && playerScaledStats.health_regen > 0) {
        const regenAmount = Math.floor(playerScaledStats.health_regen);
        if (regenAmount > 0 && playerChar.hp < playerScaledStats.health) {
          const newPlayerHp = Math.min(playerChar.hp + regenAmount, playerScaledStats.health);
          const actualHealing = newPlayerHp - playerChar.hp;
          if (actualHealing > 0) {
            updatePlayerHp(newPlayerHp);
            newLogMessages.push({ message: `💚 ${playerChar.name} regenerated ${actualHealing} HP` });
          }
        }
      }
      
      // Apply heal-over-time buffs (only if player is alive)
      if (playerBuffs.length > 0 && playerChar && playerChar.hp > 0) {
        const hotBuffs = playerBuffs.filter(b => b.type === 'heal_over_time');
        if (hotBuffs.length > 0 && playerChar.hp < playerScaledStats.health) {
          const totalHealing = hotBuffs.reduce((sum, buff) => sum + buff.amount, 0);
          // Ensure minimum 1 HP healing per turn
          const healingAmount = Math.max(1, Math.floor(totalHealing));
          const newPlayerHp = Math.min(playerChar.hp + healingAmount, playerScaledStats.health);
          const actualHealing = newPlayerHp - playerChar.hp;
          if (actualHealing > 0) {
            updatePlayerHp(newPlayerHp);
            newLogMessages.push({ message: `🧪 ${playerChar.name} healed ${actualHealing} HP from potion` });
          }
        }
        
        // Decay buff durations
        setPlayerBuffs((prevBuffs) => 
          prevBuffs
            .map(buff => ({ ...buff, duration: buff.duration - 1 }))
            .filter(buff => buff.duration > 0)
        );
      }
      
      // Apply enemy health regeneration
      if (enemyChar && enemyScaledStats.health_regen > 0) {
        const regenAmount = Math.floor(enemyScaledStats.health_regen);
        if (regenAmount > 0 && enemyChar.hp > 0 && enemyChar.hp < enemyScaledStats.health) {
          const newEnemyHp = Math.min(enemyChar.hp + regenAmount, enemyScaledStats.health);
          const actualHealing = newEnemyHp - enemyChar.hp;
          if (actualHealing > 0) {
            updateEnemyHp(0, newEnemyHp);
            newLogMessages.push({ message: `💚 ${enemyChar.name} regenerated ${actualHealing} HP` });
          }
        }
      }
      
      setBattleLog((prev) => [...prev, ...newLogMessages]);
      setLastLoggedTurn(currentTurn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCounter, lastLoggedTurn, playerBuffs]);

  // Reset playerTurnDone when it becomes player's turn again
  useEffect(() => {
    if (!turnSequence[sequenceIndex] || battleEnded) return;
    
    const currentAction = turnSequence[sequenceIndex];
    if (currentAction.entityId === 'player' && playerTurnDone) {
      setPlayerTurnDone(false);
    }
  }, [sequenceIndex, battleEnded, playerTurnDone, turnSequence]);

  // Handle enemy turn automatically (only enemy moves auto, player chooses)
  useEffect(() => {
    if (!turnSequence[sequenceIndex] || battleEnded) return;
    
    const currentAction = turnSequence[sequenceIndex];
    
    // If it's enemy's turn, execute their action
    if (currentAction.entityId === 'enemy' && enemyChar.hp > 0) {
      // Wait a bit before executing enemy action for better UX
      const timer = setTimeout(() => {
        if (currentAction.actionType === 'move') {
          handleEnemyMove();
        } else {
          handleEnemyAttack();
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [sequenceIndex, battleEnded, enemyChar.hp, turnSequence]);

  // Check for victory/defeat
  useEffect(() => {
    console.log('🔍 VICTORY CHECK:', {
      enemyId: enemyChar.id,
      enemyName: enemyChar.name,
      enemyHp: enemyChar.hp,
      battleEnded,
      willTrigger: enemyChar.hp <= 0 && !battleEnded,
      timestamp: Date.now()
    });
    
    // Skip if already processing a battle end
    if (battleEnded) {
      console.log('⏹️ Skipping - battle already ended (battleEnded=true)');
      return;
    }
    
    if (enemyChar.hp <= 0) {
      console.log('💀 ENEMY DEFEATED! Starting victory sequence...', { battleEnded });
      setBattleEnded(true);
      console.log('📍 Called setBattleEnded(true)');
      
      // Track enemy kill in profile
      incrementEnemiesKilled();
      
      // Check for Glory passive (Dark Seal / Mejai's Soulstealer)
      // Grants stacking AP buff when defeating Champion or Legend tier enemies
      if (enemyChar.tier === 'champion' || enemyChar.tier === 'legend') {
        const hasGlory = playerPassiveIds.includes('glory');
        const hasGloryUpgraded = playerPassiveIds.includes('glory_upgraded');
        
        if (hasGlory || hasGloryUpgraded) {
          const apGain = hasGloryUpgraded ? 15 : 10;
          const passiveName = hasGloryUpgraded ? "Glory (Upgraded)" : "Glory";
          
          // Add permanent AP buff
          setPlayerBuffs((prev) => {
            const existingGloryBuff = prev.find(b => b.id === 'glory_stacks');
            
            let newBuffs;
            if (existingGloryBuff) {
              // Stack the buff
              newBuffs = prev.map(buff =>
                buff.id === 'glory_stacks'
                  ? { ...buff, name: passiveName + ' Stacks', amount: buff.amount + apGain, duration: 999 }
                  : buff
              );
            } else {
              // Create new permanent buff
              newBuffs = [...prev, {
                id: 'glory_stacks',
                name: passiveName + ' Stacks',
                stat: 'abilityPower',
                amount: apGain,
                duration: 999, // Effectively permanent (999 turns)
              } as CombatBuff];
            }
            
            // Calculate current total AP with new buff
            const baseAP = playerChar.stats.abilityPower || 0;
            const buffAP = newBuffs
              .filter(b => b.stat === 'abilityPower')
              .reduce((sum, b) => sum + (b.amount || 0), 0);
            const totalAP = baseAP + buffAP;
            
            // Track max AP reached for unlock tracking
            updateMaxAbilityPower(totalAP);
            
            return newBuffs;
          });
          
          setBattleLog((prev) => [
            ...prev,
            { message: `✨ ${passiveName}: +${apGain} AP gained! (Champion/Legend defeated)` },
          ]);
        }
      }
      
      // Use battleFlow system to handle victory
      // Calculate player's magicFind and goldGain from inventory
      const totalMagicFind = state.inventory.reduce((sum, invItem) => {
        const item = getItemById(invItem.itemId);
        return sum + (item?.stats.magicFind || 0);
      }, 0);
      
      const totalGoldGain = state.inventory.reduce((sum, invItem) => {
        const item = getItemById(invItem.itemId);
        return sum + (item?.stats.goldGain || 0);
      }, 0);
      
      // Check if player has reap passive (Cull's passive)
      const hasReapPassive = playerPassiveIds.includes('reap');
      
      const victoryResult = handleEnemyDefeat(
        enemyChar,
        state.enemyCharacters.slice(1),
        state.currentFloor,
        state.selectedRegion,
        playerChar.level,
        totalMagicFind,
        totalGoldGain,
        hasReapPassive
      );
      
      // Apply rewards to game state
      applyVictoryRewards(
        victoryResult,
        addInventoryItem,
        addGold,
        addExperience,
        updatePlayerHp,
        playerChar.hp,
        playerScaledStats.health,
        state.inventory
      );
      
      // Add victory messages to battle log
      const messages = getVictoryMessages(enemyChar.name, victoryResult);
      setBattleLog((prev) => [...prev, ...messages.map(msg => ({ message: msg }))]);
      
      // Prepare summary rewards including item drops
      const itemDrops = victoryResult.loot
        ?.filter(reward => reward.type === 'item' && reward.itemId)
        .map(reward => ({ itemId: reward.itemId!, quantity: 1 })) || [];
      
      setSummaryRewards({
        gold: victoryResult.goldReward,
        exp: victoryResult.expReward,
        items: itemDrops,
      });
      
      // Show battle summary
      setShowSummary(true);
      console.log('✅ Victory sequence complete - summary should show');
      
      // Check for level up after applying experience
      const newPlayerExp = playerChar.experience + victoryResult.expReward;
      const levelUpResult = checkLevelUp(newPlayerExp, playerChar.level);
      if (levelUpResult) {
        const levelsGained = levelUpResult.newLevel - playerChar.level;
        setBattleLog((prev) => [
          ...prev,
          { message: `🎉 LEVEL UP! ${playerChar.name} reached level ${levelUpResult.newLevel}!` },
          { message: `💪 Gained ${levelsGained} level${levelsGained > 1 ? 's' : ''}! All stats increased!` },
        ]);
      }
      
      // Handle next steps - store data for user-triggered progression
      if (victoryResult.shouldShowRewardSelection) {
        // Generate reward options and integrate into summary
        const rewards = generateRewardOptions(state.selectedRegion, state.currentFloor, playerChar.class);
        setRewardOptions(rewards);
        
        // Store next enemies for after reward selection
        setPendingBattleData(victoryResult.nextEnemies);
        
        // Mark as reward selection mode (will be integrated in summary)
        setBattleResult('reward_selection');
        console.log('🎁 Reward selection mode activated');
      } else if (victoryResult.hasMoreEnemies && victoryResult.nextEnemies) {
        // Store next enemies - user will click Continue to proceed
        setPendingBattleData(victoryResult.nextEnemies);
        setBattleResult('victory'); // Regular victory with more enemies pending
        console.log('⏭️ More enemies pending:', victoryResult.nextEnemies.length);
      } else {
        // All enemies defeated - show quest complete
        setPendingBattleData(null);
        setBattleResult('victory');
        console.log('🏆 Quest complete - all enemies defeated');
      }
    }
    // Note: Player defeat is now handled immediately when damage is dealt
    // Note: battleEnded is NOT in dependencies to avoid circular triggers
    // It's checked with early return instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyChar.hp, enemyChar.id]);

  // Get current turn info
  const currentAction = turnSequence[sequenceIndex];
  const currentActor = currentAction?.entityId === 'player' ? 'P' : 'E';
  // CRITICAL: Check battleEnded FIRST to prevent any actions on defeated enemies
  const isPlayerTurn = !battleEnded && currentActor === 'P' && !playerTurnDone;
  const canAttack = isPlayerTurn && currentAction?.actionType === 'attack';
  const canSpell = isPlayerTurn && currentAction?.actionType === 'spell';
  // Can move on attack OR move turns (move is alternative to attack)
  const canMove = isPlayerTurn && (currentAction?.actionType === 'attack' || currentAction?.actionType === 'move');
  // Player movement distance based on his movement speed
  const moveDistance = Math.floor(MOVE_DISTANCE);

  return (
    <div className="battle-screen">
      {/* Character Panels with Battlefield */}
      <div className="battle-arena">
        <div className="team-player">
          <CharacterStatus combatBuffs={playerBuffs} />
        </div>
        
        {/* Vertical Battlefield Display in Center */}
        <BattlefieldDisplay
          playerPosition={playerPosition}
          enemyPosition={enemyPosition}
          playerName={playerChar.name}
          enemyName={enemyChar.name}
          playerAttackRange={playerScaledStats.attackRange || 125}
          enemyAttackRange={enemyScaledStats.attackRange || 125}
          distance={currentDistance}
          vertical={true}
        />
        
        <div className="team-enemy">
          <CharacterStatus characterId={enemyChar.id} />
        </div>
      </div>

      {/* Battle Log */}
      <div className="battle-log">
        <div className="log-entries" ref={logEntriesRef}>
          {battleLog.map((entry, idx) => (
            <div key={idx} className={`log-entry ${entry.type || ''}`}>
              {entry.message}
            </div>
          ))}
          {isPlayerTurn && !playerTurnDone && !battleEnded && currentAction && (
            <div className="log-entry turn-indicator">
              {currentAction.actionType === 'attack' || currentAction.actionType === 'move'
                ? `It's ${playerName || 'your'} turn to Attack or Move`
                : `It's ${playerName || 'your'} turn to use a Spell or Item`}
            </div>
          )}
        </div>
      </div>

      {/* Turn Timeline - key forces full remount on new enemy */}
      {!showSummary && (
        <TurnTimeline
          key={enemyChar.id}
          turnSequence={turnSequence}
          currentIndex={sequenceIndex}
          playerName={playerChar.name}
          enemyName={enemyChar.name}
          isPlayerTurn={isPlayerTurn}
          onSimultaneousAction={handleSimultaneousAction}
        />
      )}

      {/* Action Buttons */}
      {!showSummary && (
        <div className="battle-actions">
        {battleEnded && battleResult === 'victory' && (
          <div className="battle-result">
            <h2>✅ Quest Complete!</h2>
            <button className="action-btn" onClick={() => onBack ? onBack() : window.location.reload()}>
              Back to Start
            </button>
          </div>
        )}
        {battleEnded && battleResult === 'reward_selection' && (
          <div className="battle-result">
            <h2>🎁 Choose Your Reward</h2>
            <button className="action-btn" onClick={() => { setBattleResult(null); setBattleEnded(false); }}>
              Continue to Next Fight
            </button>
          </div>
        )}
        {battleEnded && battleResult === 'defeat' && (
          <div className="battle-result">
            <h2>💀 Run Ended!</h2>
            <p>Your journey has come to an end...</p>
            <button className="action-btn" onClick={() => window.location.reload()}>
              Return to Main Menu
            </button>
          </div>
        )}
        {!battleEnded && (
          <>
            <div className="action-buttons">
              {/* Left Section - Move and Attack */}
              <div className="button-section left">
                {/* Move Container - Horizontal Layout */}
                <div className="move-container">
                  <button 
                    onClick={() => handlePlayerMove('towards')} 
                    className={`move-arrow-btn up-btn ${!canMove ? 'disabled' : ''} ${canMove && !canPlayerAttack ? 'breathing-yellow' : ''}`}
                    disabled={!canMove}
                    title={canMove ? 'Move forward towards enemy' : 'Wait for your turn'}
                  >
                    ↑
                  </button>
                  <div className="move-label">move {moveDistance}</div>
                  <button 
                    onClick={() => handlePlayerMove('away')} 
                    className={`move-arrow-btn down-btn ${!canMove ? 'disabled' : ''}`}
                    disabled={!canMove}
                    title={canMove ? 'Move back away from enemy' : 'Wait for your turn'}
                  >
                    ↓
                  </button>
                </div>

                <button 
                  onClick={handleAttack} 
                  className={`action-btn attack-btn ${!canAttack ? 'disabled' : ''} ${isPlayerTurn && !canPlayerAttack ? 'breathing-red' : ''}`}
                  disabled={!canAttack}
                  title={canAttack ? 'Attack!' : 'Wait for your attack turn'}
                >
                  ⚔️ Attack ({playerScaledStats.attackDamage.toFixed(0)} DMG)
                </button>
              </div>

              {/* Center Section - Skip */}
              <div className="button-section center">
                <button 
                  onClick={handleSkip} 
                  className={`action-btn skip-btn ${!isPlayerTurn ? 'disabled' : ''}`}
                  disabled={!isPlayerTurn}
                  title={isPlayerTurn ? 'Skip this turn' : 'Wait for your turn'}
                >
                  ⏭️ Skip
                </button>
              </div>

              {/* Right Section - Spell & Use Item */}
              <div className="button-section right">
                <button 
                  onClick={handleSpell} 
                  className={`action-btn spell-btn ${!canSpell ? 'disabled' : ''}`}
                  disabled={!canSpell}
                  title={canSpell ? 'Cast spell!' : 'Wait for your spell turn'}
                >
                  ✨ Spell ({playerScaledStats.abilityPower.toFixed(0)} DMG)
                </button>
                <button 
                  onClick={() => setItemModeActive(!itemModeActive)} 
                  className={`action-btn item-btn ${!canSpell ? 'disabled' : ''}`}
                  disabled={!canSpell}
                  title={canSpell ? 'Use an item' : 'Wait for your spell turn'}
                >
                  🧪 Use Item
                </button>
              </div>
            </div>
            
            {/* Item Bar - Shows usable items below action buttons */}
            <ItemBar
              usableItems={getUsableItems(state.inventory)}
              onUseItem={handleUseItem}
              canUse={canSpell && itemModeActive}
            />
            {playerChar.abilities.length > 0 && (
              <div className="ability-buttons">
                {playerChar.abilities.map((ability: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAbility(idx)}
                    className={`action-btn ability-btn ${!isPlayerTurn ? 'disabled' : ''}`}
                    disabled={!isPlayerTurn}
                    title={isPlayerTurn ? `Use ${ability.name}` : 'Wait for your turn'}
                  >
                    {ability.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      )}
      
      {/* Battle Summary Overlay */}
      {showSummary && (
        <BattleSummary
          isVictory={battleResult !== 'defeat'}
          combatStats={combatStats}
          rewards={battleResult !== 'defeat' && battleResult !== 'reward_selection' ? summaryRewards || undefined : undefined}
          rewardSelection={battleResult === 'reward_selection' && rewardOptions.length > 0 ? {
            options: rewardOptions,
            onSelect: handleRewardSelection,
            onSkip: handleSkipReward,
            onReroll: handleRerollRewards,
            rerollsRemaining: state.rerolls,
          } : undefined}
          runStats={battleResult === 'defeat' ? {
            itemsOwned: state.inventory.length,
            encountersFaced: state.currentFloor,
            unlocksEarned: [], // TODO: Track unlocks from this run
          } : undefined}
          onContinue={handleSummaryContinue}
        />
      )}
    </div>
  );
};