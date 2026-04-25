import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@game/store';
import { CharacterStatus } from '../../shared/StatusPanels/CharacterStatus';
import { FamiliarStatus } from '../../shared/StatusPanels/FamiliarStatus';
import { BattlefieldDisplay, AoEIndicator } from './Field';
import { TurnTimeline } from './timeline';
import { BattleLogPanel } from './log/BattleLogPanel';
import { useBattleLog } from './log/useBattleLog';
import { runTurnManager } from './Flow/TurnManager';
import { formatSpellEffects, formatWeaponEffects } from './logic/abilityFormatters';
import { getScaledStats, calculatePhysicalDamage, calculateMagicDamage, rollCriticalStrike, calculateCriticalDamage } from '@utils/statsSystem';
import { getPassiveIdsFromInventory } from '@data/items';
import { calculateOnHitEffects, applyOnHitEffects, formatOnHitEffects } from '@battle/logic/onHitEffects';
import { calculateCCDuration } from '@battle/logic/crowdControlSystem';
import { applyForDemaciaBuff, applyDamageWithShield } from '@battle/Flow/passives/shieldSystem';
import { 
  TurnEntity, 
  TurnAction, 
  generateMultiEntityTurnSequence,
  applyStunDelay
} from './Flow/turnSystemV2';
import { StatusEffect, createStunEffect, createSlowEffect, getSlowModifier } from '@data/statusEffects';
import { calculateAoEDirection } from './logic/aoeUtils';
import { getCharacterName } from '../../../i18n/helpers';
import { 
  getItemById,
  createBuffFromItem,
  getUsableItems,
  createHealthPotionBuff,
  CombatBuff,
  applyLifeDrainingBuff,
  applyDrainBuff,
  addOrMergeBuffStack,
  computeBuffDisplayValues,
} from '@utils/itemSystem';
import { generateRewardOptions } from '@data/rewardPool';
import { flattenEncounterEnemyIds, getQuestById } from '../QuestSelect/logic';
import { discoverEnemy, discoverFamiliar, discoverSpell, discoverWeapon, incrementEnemiesKilled } from '../MainMenu/Profiles/profileSystem';
import { useTranslation } from '../../../hooks/useTranslation';
import { ItemBar, SpellSelector, WeaponSelector } from './selectors';
import { BattleSummary } from './summary';
import { getWeaponById } from '@data/weapons';
import { getSpellById } from '@data/spells';
import { mergePlayerEquipmentStats } from '../../entity/Player/playerStats';
import { Character, InventoryItem } from '@game/types';
import { 
  decideEnemyAction, 
  getDefaultEnemyLoadout, 
  AIDecisionContext 
} from '../../entity/ai/enemyAI';
import {
  BATTLEFIELD_MIN_X,
  BATTLEFIELD_MAX_X,
  PLAYER_START_POSITION,
  ENEMY_START_POSITION,
  isOutsideBattlefield,
  BattleFleeOutcome,
} from '@battle/Field/battlefield';
import { getActiveFamiliarIds, getFamiliarById } from '../../entity/Player/familiars';
import { createShurimaSandSoldierSummon } from '../../shared/regions';
import { buildEnemyTargets, buildPlayerTargets, chooseAutoTarget, getCharacterInstanceId, getEnemyIndexByTargetId, resolveSelectedTarget } from '@battle/logic/targetingSystem';
import { resolveEnemyDefeat, resolvePlayerDefeat } from './Flow/Resolver';
import './Battle.css';

interface BattleProps {
  onBack?: () => void;
  onQuestComplete?: () => void;
  tutorialFocus?: 'battle' | 'enemy' | 'turns-battlefield' | 'turns-timeline' | 'turns-log' | 'actions' | 'speed' | 'speed-move' | 'speed-attack' | 'haste' | 'haste-item' | 'cast' | null;
  tutorialActionPromptActive?: boolean;
  eliteRewardTutorialEnabled?: boolean;
  onEliteRewardTutorialTrigger?: () => void;
  onEliteRewardTutorialComplete?: () => void;
  onTutorialActionUsed?: () => void;
  lootTutorialEnabled?: boolean;
  onLootTutorialComplete?: () => void;
}

export const Battle: React.FC<BattleProps> = ({
  onBack,
  onQuestComplete,
  tutorialFocus = null,
  tutorialActionPromptActive = false,
  eliteRewardTutorialEnabled = false,
  onEliteRewardTutorialTrigger,
  onEliteRewardTutorialComplete,
  onTutorialActionUsed,
  lootTutorialEnabled = false,
  onLootTutorialComplete,
}) => {
  const t = useTranslation();
  const store = useGameStore();
  const state = store.state;
  const { updateEnemyHp, updatePlayerHp, addInventoryItem, addWeapon, addSpell, addFamiliar, addGold, startBattle, consumeInventoryItem, addExperience, useReroll, updateMaxAbilityPower, setCompletedRegion, revealEnemy, decayRevealedEnemies, updatePersistentBuff, incrementEncounterCount, updateFamiliarHp } = store;
  const playerName = state.username;
  const [playerTurnDone, setPlayerTurnDone] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [logExpanded, setLogExpanded] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'reward_selection' | 'battle_fled' | null>(null);
  const [fleeOutcome, setFleeOutcome] = useState<BattleFleeOutcome | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);
  const [rewardOptions, setRewardOptions] = useState<InventoryItem[]>([]);
  const [pendingBattleData, setPendingBattleData] = useState<any>(null);
  
  // Turn entities for new system
  const [playerEntity, setPlayerEntity] = useState<TurnEntity | null>(null);
  const [enemyEntity, setEnemyEntity] = useState<TurnEntity | null>(null);
  const [allTurnEntities, setAllTurnEntities] = useState<TurnEntity[]>([]);
  const [turnSequence, setTurnSequence] = useState<TurnAction[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  
  // Status effects system
  const [_statusEffects, setStatusEffects] = useState<StatusEffect[]>([]);
  const [pendingStuns, setPendingStuns] = useState<Array<{targetId: string; duration: number; currentTime: number}>>([]);
  const [aoeIndicators, setAoeIndicators] = useState<AoEIndicator[]>([]);
  const [aoeRemovalTimes, setAoeRemovalTimes] = useState<Array<{ label: string; removalTime: number }>>([]);
  const [stunPeriods, setStunPeriods] = useState<Array<{
    entityId: string;
    entityName: string;
    startTime: number;
    endTime: number;
  }>>([]);
  const [weaponCooldowns, setWeaponCooldowns] = useState<Record<string, number>>({});
  
  // Enemy AI cooldown tracking
  const [enemyWeaponCooldowns, setEnemyWeaponCooldowns] = useState<Record<string, number>>({});
  const [enemySpellCooldowns, setEnemySpellCooldowns] = useState<Record<string, number>>({});
  const [familiarNextActionTurn, setFamiliarNextActionTurn] = useState<Record<string, number>>({});
  const [selectedEnemyTargetId, setSelectedEnemyTargetId] = useState<string | null>(null);

  // Movement and range system
  const [playerPosition, setPlayerPosition] = useState(PLAYER_START_POSITION);
  const [enemyPositionsById, setEnemyPositionsById] = useState<Record<string, number>>({});

  const playerChar = state.playerCharacter;
  const enemyChar = state.enemyCharacters.find((enemy) => enemy.hp > 0) || state.enemyCharacters[0];

  if (!playerChar || !enemyChar) {
    return <div>Loading battle...</div>;
  }

  const activeFamiliarIds = useMemo(() => getActiveFamiliarIds(state.familiars), [state.familiars]);
  const activeFamiliars = useMemo(
    () => activeFamiliarIds
      .map((id) => getFamiliarById(id))
      .filter((familiar): familiar is NonNullable<typeof familiar> => familiar !== undefined),
    [activeFamiliarIds]
  );
  const activeFamiliarKey = activeFamiliarIds.join('|');
  const enemyTargets = useMemo(() => buildEnemyTargets(state.enemyCharacters), [state.enemyCharacters]);
  const selectedEnemyTarget = useMemo(
    () => resolveSelectedTarget(enemyTargets, selectedEnemyTargetId),
    [enemyTargets, selectedEnemyTargetId]
  );
  const enemyCharIndex = useMemo(
    () => state.enemyCharacters.findIndex((enemy, index) => getCharacterInstanceId(enemy, index) === getCharacterInstanceId(enemyChar)),
    [state.enemyCharacters, enemyChar]
  );
  const selectedEnemyIndex = useMemo(() => {
    const resolvedIndex = getEnemyIndexByTargetId(state.enemyCharacters, selectedEnemyTarget?.instanceId || selectedEnemyTargetId);
    return resolvedIndex >= 0 ? resolvedIndex : Math.max(0, enemyCharIndex);
  }, [state.enemyCharacters, selectedEnemyTarget, selectedEnemyTargetId, enemyCharIndex]);
  const selectedEnemyChar = state.enemyCharacters[selectedEnemyIndex] || enemyChar;
  const defaultEnemyTargetId = enemyTargets.find((target) => target.canBeTargeted && target.currentHp > 0)?.instanceId ?? null;
  const activeEnemyInstanceId = getCharacterInstanceId(enemyChar, Math.max(0, enemyCharIndex));
  const selectedEnemyInstanceId = getCharacterInstanceId(selectedEnemyChar, Math.max(0, selectedEnemyIndex));
  const POSITION_STEP = 10;
  const COLLISION_DISTANCE = 9;

  const getDefaultEnemySpawnPosition = (index: number): number => ENEMY_START_POSITION + index * POSITION_STEP;

  const getEnemyPositionById = (instanceId: string, fallbackIndex: number): number => {
    return enemyPositionsById[instanceId] ?? getDefaultEnemySpawnPosition(fallbackIndex);
  };

  const getNearestCollision = (position: number, occupiedPositions: number[]): number | null => {
    let nearest: number | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    occupiedPositions.forEach((occupied) => {
      const distance = Math.abs(position - occupied);
      if (distance < COLLISION_DISTANCE && distance < nearestDistance) {
        nearest = occupied;
        nearestDistance = distance;
      }
    });

    return nearest;
  };

  const resolveSpawnPosition = (desiredPosition: number, occupiedPositions: number[]): number => {
    let resolved = desiredPosition;
    let guard = 0;

    while (getNearestCollision(resolved, occupiedPositions) !== null && guard < 64) {
      resolved += POSITION_STEP;
      guard += 1;
    }

    return resolved;
  };

  const resolveMovementPosition = (
    attemptedPosition: number,
    previousPosition: number,
    occupiedPositions: number[]
  ): number => {
    let resolved = attemptedPosition;
    let guard = 0;

    while (guard < 64) {
      const collisionWith = getNearestCollision(resolved, occupiedPositions);
      if (collisionWith === null) {
        break;
      }

      if (resolved === collisionWith) {
        const approachDirection = Math.sign(attemptedPosition - previousPosition) || 1;
        resolved = collisionWith - approachDirection * POSITION_STEP;
      } else if (resolved < collisionWith) {
        resolved = collisionWith - POSITION_STEP;
      } else {
        resolved = collisionWith + POSITION_STEP;
      }

      guard += 1;
    }

    return resolved;
  };

  const getAliveEnemyPositionsExcluding = (excludedInstanceId?: string): number[] => {
    return state.enemyCharacters
      .map((enemy, index) => ({
        enemy,
        instanceId: getCharacterInstanceId(enemy, index),
        position: getEnemyPositionById(getCharacterInstanceId(enemy, index), index),
      }))
      .filter(({ enemy, instanceId }) => enemy.hp > 0 && instanceId !== excludedInstanceId)
      .map(({ position }) => position);
  };

  const selectedEnemyPosition = getEnemyPositionById(selectedEnemyInstanceId, Math.max(0, selectedEnemyIndex));
  const enemyPosition = selectedEnemyPosition;

  const playerTeamTargets = useMemo(
    () => buildPlayerTargets(playerChar, activeFamiliarIds, state.familiarStates),
    [playerChar, activeFamiliarIds, state.familiarStates]
  );

  // Get passive IDs from inventory
  const playerPassiveIds = getPassiveIdsFromInventory(state.inventory);

  // Get equipped weapon and merge its stats with character stats
  const equippedWeaponId = state.weapons[state.equippedWeaponIndex];
  const equippedWeapon = equippedWeaponId ? getWeaponById(equippedWeaponId) : null;
  
  const playerStatsWithWeapon = useMemo(
    () => mergePlayerEquipmentStats(playerChar, state.inventory, equippedWeaponId),
    [playerChar, state.inventory, equippedWeaponId]
  );

  // Get base scaled stats for both characters (with class bonuses, weapon stats, inventory items, and passives)
  const playerBaseStats = getScaledStats(playerStatsWithWeapon, playerChar.level, playerChar.class, playerPassiveIds);
  // Enemy stats are already scaled at spawn in store.ts, don't recalculate
  const enemyBaseStats = enemyChar.stats;

  // DEBUG: Log weapon stats merge
  console.log('🔫 WEAPON STATS MERGE DEBUG:', {
    equippedWeaponId,
    equippedWeaponName: equippedWeapon?.name,
    equippedWeaponStats: equippedWeapon?.stats,
    playerBaseAD: playerChar.stats.attackDamage,
    playerStatsWithWeaponAD: playerStatsWithWeapon.attackDamage,
    playerBaseScaledAD: playerBaseStats.attackDamage, // Base stats before buffs
  });

  useEffect(() => {
    const initialTimers = activeFamiliarIds.reduce((acc, familiarId) => {
      acc[familiarId] = 1;
      return acc;
    }, {} as Record<string, number>);
    setFamiliarNextActionTurn(initialTimers);
  }, [activeEnemyInstanceId, activeFamiliarKey]);

  useEffect(() => {
    const resolvedTarget = resolveSelectedTarget(enemyTargets, selectedEnemyTargetId);
    const nextTargetId = resolvedTarget?.instanceId ?? null;

    if (nextTargetId !== selectedEnemyTargetId) {
      setSelectedEnemyTargetId(nextTargetId);
    }
  }, [enemyTargets, selectedEnemyTargetId]);
  const processedTurnEffectsRef = useRef(0);

  // Initialize/reset turn entities when enemy changes (new encounter)
  useEffect(() => {
    console.log('🔄 NEW ENEMY LOADED:', {
      enemyId: enemyChar.id,
      enemyName: enemyChar.name,
      enemyHp: enemyChar.hp,
    });
    
    // Recalculate scaled stats inside effect to ensure fresh values
    const freshPlayerStats = getScaledStats(playerStatsWithWeapon, playerChar.level, playerChar.class, playerPassiveIds);
    // Enemy stats are already scaled at spawn in store.ts, don't recalculate

    const pEntity: TurnEntity = {
      id: 'player',
      name: getCharacterName(playerChar),
      speed: freshPlayerStats.speed,
      haste: freshPlayerStats.haste,
    };

    // Build entity for every enemy in the encounter (use instance ID so each is unique)
    const enemyEntities: TurnEntity[] = state.enemyCharacters.map((enemy, index) => {
      const instanceId = getCharacterInstanceId(enemy, index);
      return {
        id: instanceId,
        name: getCharacterName(enemy),
        speed: enemy.stats.speed,
        haste: enemy.stats.haste,
      };
    });

    // Keep first enemy as the legacy `enemyEntity` reference (used by handlers that haven't been updated yet)
    const eEntity: TurnEntity = enemyEntities[0] ?? {
      id: 'enemy',
      name: getCharacterName(enemyChar),
      speed: enemyChar.stats.speed,
      haste: enemyChar.stats.haste,
    };

    const allEntities = [pEntity, ...enemyEntities];

    setPlayerEntity(pEntity);
    setEnemyEntity(eEntity);
    setAllTurnEntities(allEntities);
    setTurnSequence(generateMultiEntityTurnSequence(allEntities, 20));
    
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
    resetLog(getEncounterStartMessage());
    processedTurnEffectsRef.current = 0;
    setLastLoggedTurn(0);
    setSelectedEnemyTargetId(defaultEnemyTargetId);
    setSelectedItemId(null); // Will be auto-selected by useEffect watching inventory
    setEnemyBuffsById({});
    setEnemyDebuffsById({}); // Reset enemy debuffs for new encounter
    
    // CRITICAL FIX FOR BUFF DURATION EXTENDING BETWEEN ENCOUNTERS:
    // Reset playerBuffs to only persistent buffs (clear temporary buffs from previous fight)
    // This prevents old buffs with old expiresAtTurn values from showing extended durations
    setPlayerBuffs(state.persistentBuffs || []);
    
    // Initialize manaflow buff if player has the passive but no buff exists yet
    const hasManaflowPassive = playerPassiveIds.includes('manaflow');
    const hasManaflowBuff = (state.persistentBuffs || []).some(b => b.id === 'manaflow_stacks');
    
    if (hasManaflowPassive && !hasManaflowBuff) {
      // Create initial manaflow buff with 0 stacks
      const initialManaflowBuff: CombatBuff = {
        id: 'manaflow_stacks',
        name: 'Manaflow',
        stat: 'xpGain',
        stacks: [], // Start with 0 stacks
        type: 'stacking_permanent',
        isInfinite: true,
      };
      
      // Add to both local state and store
      setPlayerBuffs(prev => [...prev, initialManaflowBuff]);
      updatePersistentBuff(initialManaflowBuff);
    }
    
    // Log cooldown reductions from previous encounter
    const activeCooldowns = Object.entries(state.spellCooldowns);
    if (activeCooldowns.length > 0) {
      const cooldownMessages = activeCooldowns.map(([spellId, cd]) => {
        const spell = getSpellById(spellId);
        return `⏳ ${spell?.name || 'Spell'}: ${cd} turn${cd > 1 ? 's' : ''} remaining`;
      });
      appendLogs(cooldownMessages);
    }
    
    console.log('🔧 Battle state reset complete - battleEnded should now be FALSE');
    
    // Reset enemy AI cooldowns for new encounter
    setEnemyWeaponCooldowns({});
    setEnemySpellCooldowns({});
    setFleeOutcome(null);
    
    // Don't reset combat stats or summary rewards here - they need to persist
    // for the summary display. They'll be reset after the user dismisses the summary.
    
    // Reset positions for new encounter
    const nextEnemyPositions: Record<string, number> = {};
    const occupiedSpawnPositions: number[] = [];

    state.enemyCharacters.forEach((enemy, index) => {
      const instanceId = getCharacterInstanceId(enemy, index);
      const desiredSpawn = getDefaultEnemySpawnPosition(index);
      const resolvedSpawn = resolveSpawnPosition(desiredSpawn, occupiedSpawnPositions);
      nextEnemyPositions[instanceId] = resolvedSpawn;
      occupiedSpawnPositions.push(resolvedSpawn);
    });

    setPlayerPosition(PLAYER_START_POSITION);
    setEnemyPositionsById(nextEnemyPositions);
  }, [activeEnemyInstanceId, defaultEnemyTargetId, playerChar.level, playerChar.class, state.currentFloor]);

  // Initialize battle log
  const encounterNumber = state.encountersCompleted + 1;
  const getEncounterStartMessage = () => `Encounter ${encounterNumber} against ${getCharacterName(enemyChar)} started!`;

  const { battleLog, appendLog, appendLogs, appendEntries, resetLog } = useBattleLog(getEncounterStartMessage());

  // Track which turn we've logged to avoid duplicate messages
  const [lastLoggedTurn, setLastLoggedTurn] = useState(0);

  // Track active buffs on player (initialize with persistent buffs from store)
  const [playerBuffs, setPlayerBuffs] = useState<CombatBuff[]>(() => {
    // Get persistent buffs from store (e.g., elixirs)
    const persistentBuffs = state.persistentBuffs || [];
    return [...persistentBuffs];
  });

  // Track active buffs and debuffs on enemies by battle instance
  const [enemyBuffsById, setEnemyBuffsById] = useState<Record<string, CombatBuff[]>>({});
  const [enemyDebuffsById, setEnemyDebuffsById] = useState<Record<string, CombatBuff[]>>({});
  const enemyBuffs = enemyBuffsById[activeEnemyInstanceId] || [];
  const enemyDebuffs = enemyDebuffsById[activeEnemyInstanceId] || [];
  const selectedEnemyBuffs = enemyBuffsById[selectedEnemyInstanceId] || [];
  const selectedEnemyDebuffs = enemyDebuffsById[selectedEnemyInstanceId] || [];

  const updateEnemyBuffsForId = (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => {
    setEnemyBuffsById((prev) => ({
      ...prev,
      [targetId]: updater(prev[targetId] || []),
    }));
  };

  const updateEnemyDebuffsForId = (targetId: string, updater: (prev: CombatBuff[]) => CombatBuff[]) => {
    setEnemyDebuffsById((prev) => ({
      [targetId]: updater(prev[targetId] || []),
    }));
  };

  const applyEnemyCombatModifiers = (baseStats: typeof enemyBaseStats, buffs: CombatBuff[], debuffs: CombatBuff[]) => {
    let stats = { ...baseStats };

    buffs.forEach(buff => {
      const { totalAmount } = computeBuffDisplayValues(buff, turnCounter);
      if (buff.stat in stats) {
        const currentValue = stats[buff.stat as keyof typeof stats] || 0;
        stats = {
          ...stats,
          [buff.stat]: currentValue + totalAmount,
        };
      }
    });

    debuffs.forEach(debuff => {
      const { totalAmount } = computeBuffDisplayValues(debuff, turnCounter);
      if (debuff.stat in stats) {
        const currentValue = stats[debuff.stat as keyof typeof stats] || 0;
        stats = {
          ...stats,
          [debuff.stat]: Math.max(0, currentValue + totalAmount),
        };
      }
    });

    return stats;
  };

  // Compute player stats with active buffs applied (recalculates when buffs/turn changes)
  const playerScaledStats = useMemo(() => {
    let stats = { ...playerBaseStats };
    
    playerBuffs.forEach(buff => {
      const { totalAmount } = computeBuffDisplayValues(buff, turnCounter);
      if (buff.stat in stats) {
        const currentValue = stats[buff.stat as keyof typeof stats] || 0;
        stats = {
          ...stats,
          [buff.stat]: currentValue + totalAmount,
        };
      }
    });
    
    return stats;
  }, [playerBaseStats, playerBuffs, turnCounter]);

  // Compute enemy stats with active debuffs applied (recalculates when debuffs/turn changes)
  const enemyScaledStats = useMemo(
    () => applyEnemyCombatModifiers(enemyBaseStats, enemyBuffs, enemyDebuffs),
    [enemyBaseStats, enemyBuffs, enemyDebuffs, turnCounter]
  );

  const selectedEnemyScaledStats = useMemo(() => {
    if (selectedEnemyInstanceId === activeEnemyInstanceId) {
      return enemyScaledStats;
    }

    return applyEnemyCombatModifiers(selectedEnemyChar.stats, selectedEnemyBuffs, selectedEnemyDebuffs);
  }, [selectedEnemyChar.stats, selectedEnemyBuffs, selectedEnemyDebuffs, turnCounter, selectedEnemyInstanceId, activeEnemyInstanceId, enemyScaledStats]);

  // Track selected item for use
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredActionPreview, setHoveredActionPreview] = useState<'attack' | 'spell' | 'item' | null>(null);
  
  // Track combat statistics for summary
  const [combatStats, setCombatStats] = useState({
    highestDamageDealt: 0,
    highestDamageSource: 'attack' as 'attack' | 'spell',
    highestDamageTaken: 0,
    highestDamageTakenSource: 'attack' as 'attack' | 'spell',
  });
  const [showSummary, setShowSummary] = useState(false);
  const [showLootTutorialPrompt, setShowLootTutorialPrompt] = useState(false);
  const [summaryRewards, setSummaryRewards] = useState<{
    gold: number;
    exp: number;
    items: InventoryItem[];
    spells: string[];
    weapons: string[];
    familiars: string[];
  } | null>(null);

  useEffect(() => {
    if (
      lootTutorialEnabled &&
      showSummary &&
      battleResult === 'victory' &&
      !!summaryRewards &&
      !!pendingBattleData &&
      pendingBattleData.length > 0 &&
      !showLootTutorialPrompt
    ) {
      setShowLootTutorialPrompt(true);
    }
  }, [lootTutorialEnabled, showSummary, battleResult, summaryRewards, pendingBattleData, showLootTutorialPrompt]);

  const handleLootTutorialConfirm = () => {
    setShowLootTutorialPrompt(false);
    onLootTutorialComplete?.();
    handleSummaryContinue();
  };

  // Auto-select first available item whenever inventory changes
  useEffect(() => {
    const usableItemsList = getUsableItems(state.inventory);
    
    // If currently selected item still exists in inventory with quantity > 0, keep it
    if (selectedItemId) {
      const currentItemExists = usableItemsList.some((item: { itemId: string; item: any; quantity: number }) => item.item.id === selectedItemId);
      if (currentItemExists) {
        return; // Keep current selection
      }
    }
    
    // Otherwise, auto-select first available item
    if (usableItemsList.length > 0) {
      setSelectedItemId(usableItemsList[0].item.id);
    } else {
      setSelectedItemId(null);
    }
  }, [state.inventory, selectedItemId]);

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
    appendLog(message, 'simultaneous');
  };

  // Calculate distance between player and enemy
  const currentDistance = Math.abs(playerPosition - enemyPosition);

  useEffect(() => {
    if (battleEnded) return;

    if (isOutsideBattlefield(playerPosition)) {
      const remainingEnemies = state.originalEnemyQueue;
      setBattleEnded(true);
      setBattleResult('battle_fled');
      setFleeOutcome('player_fled');
      setPendingBattleData(remainingEnemies.length > 0 ? remainingEnemies : null);
      setSummaryRewards(null);
      setShowSummary(true);
      appendLog(`${playerChar.name} fled the battlefield at ${playerPosition} (bounds ${BATTLEFIELD_MIN_X} to ${BATTLEFIELD_MAX_X}).`);
      return;
    }

    const escapedEnemy = state.enemyCharacters.find((enemy, index) => {
      if (enemy.hp <= 0) return false;
      const instanceId = getCharacterInstanceId(enemy, index);
      return isOutsideBattlefield(getEnemyPositionById(instanceId, index));
    });

    if (escapedEnemy) {
      const remainingEnemies = state.originalEnemyQueue;
      setBattleEnded(true);
      setBattleResult('battle_fled');
      setFleeOutcome('enemy_fled');
      setPendingBattleData(remainingEnemies.length > 0 ? remainingEnemies : null);
      setSummaryRewards(null);
      setShowSummary(true);
      appendLog(`${escapedEnemy.name} fled the battlefield (bounds ${BATTLEFIELD_MIN_X} to ${BATTLEFIELD_MAX_X}).`);
    }
  }, [battleEnded, playerPosition, enemyPositionsById, playerChar.name, state.enemyCharacters, state.originalEnemyQueue]);
  
  useEffect(() => {
    if (!showSummary) return;
    if (battleResult !== 'reward_selection') return;
    if (state.currentFloor !== 5) return;
    if (eliteRewardTutorialEnabled) return;

    onEliteRewardTutorialTrigger?.();
  }, [showSummary, battleResult, state.currentFloor, eliteRewardTutorialEnabled, onEliteRewardTutorialTrigger]);

  // Check if player can attack (within attack range)
  const canPlayerAttack = currentDistance <= (playerScaledStats.attackRange || 125);
  
  // Check if player can cast spells (within spell range)
  const canPlayerCastSpell = currentDistance <= 500;
  
  // Movement distance is player's movement speed scaled down for battlefield
  const MOVE_DISTANCE = Math.floor((playerScaledStats.movementSpeed || 350) / 10);

  const hoveredPreviewTargetIds = useMemo(() => {
    if (!hoveredActionPreview) {
      return [] as string[];
    }

    if (hoveredActionPreview === 'attack') {
      const equippedWeaponId = state.weapons[state.equippedWeaponIndex];
      if (!equippedWeaponId || !canPlayerAttack) {
        return [] as string[];
      }

      return [selectedEnemyInstanceId];
    }

    if (hoveredActionPreview === 'spell') {
      const equippedSpellId = state.spells[state.equippedSpellIndex];
      const equippedSpell = equippedSpellId ? getSpellById(equippedSpellId) : null;
      if (!equippedSpell) {
        return [] as string[];
      }

      const previewTargets = new Set<string>();
      const spellRange = equippedSpell.range || 500;
      const hasOffensiveEffect = equippedSpell.effects.some((effect) => effect.type === 'damage' || effect.type === 'stun' || effect.type === 'debuff');
      const hasSelfEffect = equippedSpell.effects.some((effect) => effect.type === 'heal' || effect.type === 'buff');

      if (hasOffensiveEffect && currentDistance <= spellRange) {
        previewTargets.add(selectedEnemyInstanceId);
      }

      if (hasSelfEffect) {
        previewTargets.add('player-main');
      }

      return Array.from(previewTargets);
    }

    if (!selectedItemId) {
      return [] as string[];
    }

    const selectedItem = getItemById(selectedItemId);
    if (!selectedItem?.consumable) {
      return [] as string[];
    }

    if (selectedItemId === 'flashbomb_trap') {
      const trapRange = selectedItem.active?.range || 500;
      return currentDistance <= trapRange ? [selectedEnemyInstanceId] : [];
    }

    if (selectedItemId === 'stealth_ward' || selectedItemId === 'control_ward') {
      return [] as string[];
    }

    return ['player-main'];
  }, [
    hoveredActionPreview,
    state.weapons,
    state.equippedWeaponIndex,
    state.spells,
    state.equippedSpellIndex,
    selectedItemId,
    selectedEnemyInstanceId,
    canPlayerAttack,
    currentDistance,
  ]);

  const highlightedBattlefieldMarkerIds = hoveredActionPreview ? hoveredPreviewTargetIds : [];

  const handleRewardSelection = (selectedItem: InventoryItem) => {
    onEliteRewardTutorialComplete?.();

    // Add selected reward to inventory
    addInventoryItem(selectedItem);
    
    appendLog(`🎁 Reward selected: ${selectedItem.itemId}`);
    
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
      // Decay all reveal durations for next encounter
      decayRevealedEnemies();
      
      if (state.currentFloor >= 10 && state.selectedRegion) {
        // Region complete! Mark it and navigate to region selection with actions
        console.log('🎉 Region complete (after reward) - setting completedRegion to:', state.selectedRegion);
        setCompletedRegion(state.selectedRegion); // Mark region as completed
        // Use setTimeout to ensure state update propagates before navigation
        if (onQuestComplete) {
          setTimeout(() => {
            console.log('🚀 Navigating to region selection after state update (from reward)');
            onQuestComplete();
          }, 50);
        }
      } else if (state.currentFloor >= 10) {
        // Quest complete but no region (shouldn't happen) - just navigate
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
    onEliteRewardTutorialComplete?.();
    appendLog('⏭️ Reward skipped');
    
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
    const newRewards = generateRewardOptions(
      state.selectedRegion,
      state.currentFloor,
      playerChar.class,
      currentQuestPath
        ? {
            difficulty: currentQuestPath.difficulty,
            lootType: currentQuestPath.lootType,
            pathName: currentQuestPath.name,
            pathDescription: currentQuestPath.description,
          }
        : undefined
    );
    setRewardOptions(newRewards);
    
    appendLog(`🎲 Rerolled rewards! (${state.rerolls} rerolls left)`);
  };

  // Helper function to reduce spell cooldowns by 1 turn (called per timeline turn)
  const reduceSpellCooldowns = () => {
    // Reduce player spell cooldowns
    useGameStore.setState((store) => {
      const currentCooldowns = store.state.spellCooldowns;
      const updatedCooldowns: Record<string, number> = {};
      
      for (const [spellId, cooldown] of Object.entries(currentCooldowns)) {
        if ((cooldown as number) > 1) {
          updatedCooldowns[spellId] = (cooldown as number) - 1;
        }
        // If cooldown is 1, it will be removed (spell is ready next turn)
      }
      
      console.log('🔄 Reducing player spell cooldowns (timeline turn):', { before: currentCooldowns, after: updatedCooldowns });
      
      return {
        state: {
          ...store.state,
          spellCooldowns: updatedCooldowns,
        },
      };
    });
    
    // Reduce player weapon cooldowns
    setWeaponCooldowns(prev => {
      const updated: Record<string, number> = {};
      for (const [weaponId, cooldown] of Object.entries(prev)) {
        if (cooldown > 1) {
          updated[weaponId] = cooldown - 1;
        }
      }
      console.log('🔄 Reducing player weapon cooldowns (timeline turn):', { before: prev, after: updated });
      return updated;
    });
    
    // Reduce enemy weapon cooldowns
    setEnemyWeaponCooldowns(prev => {
      const updated: Record<string, number> = {};
      for (const [weaponId, cooldown] of Object.entries(prev)) {
        if (cooldown > 1) {
          updated[weaponId] = cooldown - 1;
        }
      }
      console.log('🔄 Reducing enemy weapon cooldowns (timeline turn):', { before: prev, after: updated });
      return updated;
    });
    
    // Reduce enemy spell cooldowns
    setEnemySpellCooldowns(prev => {
      const updated: Record<string, number> = {};
      for (const [spellId, cooldown] of Object.entries(prev)) {
        if (cooldown > 1) {
          updated[spellId] = cooldown - 1;
        }
      }
      console.log('🔄 Reducing enemy spell cooldowns (timeline turn):', { before: prev, after: updated });
      return updated;
    });
  };

  const handleAttack = () => {
    if (!playerEntity || !enemyEntity) return;
    
    // Get equipped weapon
    const equippedWeaponId = state.weapons[state.equippedWeaponIndex];
    const equippedWeapon = equippedWeaponId ? getWeaponById(equippedWeaponId) : null;
    
    console.log('🔍 FULL WEAPON OBJECT:', equippedWeapon);
    
    if (!equippedWeapon) {
      appendLog(`[P1] ${playerChar.name} has no weapon equipped!`);
      return;
    }
    
    // Check weapon cooldown
    const weaponCooldown = weaponCooldowns[equippedWeaponId] || 0;
    if (weaponCooldown > 0) {
      console.log('❌ Weapon on cooldown, blocking attack');
      appendLog(`[P1] ⏰ ${equippedWeapon.name} is on cooldown (${weaponCooldown} turn${weaponCooldown > 1 ? 's' : ''} remaining)!`);
      return;
    }
    
    // Check if player is in range
    if (!canPlayerAttack) {
      appendLog(`[P1] ${playerChar.name} is out of range from [E${selectedEnemyIndex + 1}] ${getCharacterName(selectedEnemyChar)}! (${currentDistance} > ${playerScaledStats.attackRange || 125})`);
      // Advance to next action in sequence even if attack fails
      setSequenceIndex((prev) => prev + 1);
      setTurnCounter((prev) => Math.ceil(prev + 1));
      setPlayerTurnDone(true);
      return;
    }
    
    discoverWeapon(equippedWeaponId);

    // Calculate damage based on weapon effects
    let totalDamage = 0;
    const logMessages: Array<{ message: string }> = [];
    
    for (const effect of equippedWeapon.effects) {
      if (effect.type === 'damage' && effect.damageScaling) {
        let physicalBaseDamage = 0;
        let magicBaseDamage = 0;
        let trueDamage = effect.damageScaling.trueDamage || 0;
        
        // Calculate base damage from scaling
        if (effect.damageScaling.attackDamage) {
          physicalBaseDamage += playerScaledStats.attackDamage * (effect.damageScaling.attackDamage / 100);
        }
        if (effect.damageScaling.abilityPower) {
          magicBaseDamage += playerScaledStats.abilityPower * (effect.damageScaling.abilityPower / 100);
        }
        if (effect.damageScaling.health) {
          physicalBaseDamage += playerScaledStats.health * (effect.damageScaling.health / 100);
        }
        
        const rawDamage = physicalBaseDamage + magicBaseDamage + trueDamage;
        console.log('💥 DAMAGE CALCULATION DEBUG:', {
          weaponName: equippedWeapon.name,
          playerScaledAD: playerScaledStats.attackDamage,
          playerScaledAP: playerScaledStats.abilityPower,
          damageScaling: effect.damageScaling,
          baseDamageBeforeReductions: rawDamage,
          enemyArmor: selectedEnemyScaledStats.armor,
          enemyMagicResist: selectedEnemyScaledStats.magicResist,
        });
        
        // Check for critical strike
        let isCrit = false;
        if (rollCriticalStrike(playerScaledStats.criticalChance || 0)) {
          physicalBaseDamage = calculateCriticalDamage(physicalBaseDamage, playerScaledStats.criticalDamage || 200);
          magicBaseDamage = calculateCriticalDamage(magicBaseDamage, playerScaledStats.criticalDamage || 200);
          isCrit = true;
        }
        
        let finalDamage = 0;
        if (physicalBaseDamage > 0) {
          const physicalDamage = calculatePhysicalDamage(
            physicalBaseDamage,
            selectedEnemyScaledStats.armor || 0,
            playerScaledStats.lethality || 0
          );
          finalDamage += physicalDamage;
        }
        if (magicBaseDamage > 0) {
          const magicDamage = calculateMagicDamage(
            magicBaseDamage,
            selectedEnemyScaledStats.magicResist || 0,
            playerScaledStats.magicPenetration || 0
          );
          finalDamage += magicDamage;
        }
        
        finalDamage += trueDamage;
        totalDamage += finalDamage;
        
        if (isCrit) {
          logMessages.push({ message: `[P1] 💥 CRITICAL HIT! ${playerChar.name} attacks [E${selectedEnemyIndex + 1}] ${getCharacterName(selectedEnemyChar)} with ${equippedWeapon.name} for ${Math.round(finalDamage)} damage!` });
        } else {
          logMessages.push({ message: `[P1] ${playerChar.name} attacks [E${selectedEnemyIndex + 1}] ${getCharacterName(selectedEnemyChar)} with ${equippedWeapon.name} for ${Math.round(finalDamage)} damage!` });
        }
      }
      
      // Handle movement effects
      if (effect.type === 'movement' && effect.movementAmount) {
        const direction = effect.movementAmount > 0 ? 'towards' : 'away';
        const distance = Math.abs(effect.movementAmount);
        const attemptedPosition = direction === 'towards' 
          ? playerPosition + distance
          : playerPosition - distance;
        const blockers = [
          ...getAliveEnemyPositionsExcluding(),
          ...familiarCombatants.map((_, index) => playerPosition + (index + 1) * POSITION_STEP),
        ];
        const newPosition = resolveMovementPosition(attemptedPosition, playerPosition, blockers);
        setPlayerPosition(newPosition);
        logMessages.push({ message: `[P1] ${playerChar.name} moves ${direction} by ${distance} units!` });
      }
    }
    
    // Update targeted enemy HP with shield handling
    const liveTargetEnemy = {
      ...selectedEnemyChar,
      shields: selectedEnemyChar.shields?.map((shield) => ({ ...shield })),
    };
    const damageResult = applyDamageWithShield(liveTargetEnemy, totalDamage);
    const newEnemyHp = liveTargetEnemy.hp;
    updateEnemyHp(selectedEnemyIndex, newEnemyHp);

    useGameStore.setState((store) => ({
      state: {
        ...store.state,
        enemyCharacters: store.state.enemyCharacters.map((enemy, idx) =>
          idx === selectedEnemyIndex ? { ...enemy, shields: liveTargetEnemy.shields } : enemy
        ),
      },
    }));

    if (damageResult.shieldDamage > 0) {
      logMessages.push({ message: `[E${selectedEnemyIndex + 1}] 🛡️ ${getCharacterName(selectedEnemyChar)}'s shield absorbed ${Math.round(damageResult.shieldDamage)} damage!` });
    }

    // Check for Hemorrhage debuff (Delverhold Greateaxe)
    if (equippedWeaponId === 'delverhold_greateaxe' && newEnemyHp > 0) {
      updateEnemyDebuffsForId(selectedEnemyInstanceId, (prevDebuffs) => {
        const hemorrhageBuff = prevDebuffs.find(d => d.id === 'hemorrhage');
        const currentStacks = hemorrhageBuff?.stacks.length || 0;
        
        if (currentStacks < 5) {
          // Add new stack (30% AD damage per turn)
          const damagePerTurn = Math.round(playerScaledStats.attackDamage * 0.30);
          logMessages.push({ message: `🩸 Hemorrhage applied! (Stack ${currentStacks + 1}/5) - ${damagePerTurn} damage/turn` });
          return addOrMergeBuffStack(
            prevDebuffs,
            'hemorrhage',
            'Hemorrhage',
            'trueDamage',
            damagePerTurn,
            5, // Lasts 5 turns
            turnCounter,
            'instant',
            false
          );
        } else {
          // At max stacks (5), refresh all stack durations
          const totalDamage = Math.round(playerScaledStats.attackDamage * 1.50); // 5 stacks * 30%
          logMessages.push({ message: `🩸 Hemorrhage refreshed! (5/5 stacks) - ${totalDamage} damage/turn` });
          return prevDebuffs.map(d => 
            d.id === 'hemorrhage'
              ? {
                  ...d,
                  stacks: d.stacks.map(stack => ({
                    ...stack,
                    expiresAtTurn: turnCounter + 5, // Refresh to 5 turns
                  })),
                }
              : d
          );
        }
      });
    }
    
    // Track damage dealt for combat stats
    if (totalDamage > combatStats.highestDamageDealt) {
      setCombatStats(prev => ({
        ...prev,
        highestDamageDealt: Math.round(totalDamage),
        highestDamageSource: 'attack',
      }));
    }
    
    // Calculate on-hit effects (only if enemy survived)
    let totalHealing = 0;
    if (newEnemyHp > 0) {
      const onHitResult = calculateOnHitEffects(
        playerChar,
        selectedEnemyChar,
        totalDamage,
        playerScaledStats
      );
      
      const healingResult = applyOnHitEffects(
        playerChar,
        selectedEnemyChar,
        onHitResult
      );
      totalHealing = healingResult.totalHealing;
      
      // Apply healing from on-hit effects
      if (totalHealing > 0) {
        const newPlayerHp = Math.min(
          Math.round(playerChar.hp + totalHealing),
          Math.round(playerScaledStats.health)
        );
        updatePlayerHp(newPlayerHp);
        const effectsText = formatOnHitEffects(onHitResult.effects);
        logMessages.push({ message: `💚 Healed ${Math.round(totalHealing)} HP${effectsText}` });
      }
    }
    
    // Check for stun-on-hit from weapon (Shield of Daybreak)
    if (newEnemyHp > 0) {
      const hasStunEffect = equippedWeapon.effects.some(effect => effect.type === 'stun');
      if (hasStunEffect) {
        const stunEffect = equippedWeapon.effects.find(effect => effect.type === 'stun');
        if (stunEffect && stunEffect.stunDuration) {
          const currentTime = turnSequence[sequenceIndex]?.time || 0;
          const baseDuration = stunEffect.stunDuration;
          
          // Calculate effective stun duration after enemy tenacity reduction
          const enemyTenacity = selectedEnemyChar.stats.tenacity || 0;
          const effectiveDuration = calculateCCDuration(baseDuration, enemyTenacity, 'stun');
          
          console.log(`[STUN WEAPON] Applying stun: base=${baseDuration}, tenacity=${enemyTenacity}, effective=${effectiveDuration}`);
          
          // Only apply stun if effective duration > 0 (not immune due to 100 tenacity)
          if (effectiveDuration > 0) {
            if (selectedEnemyInstanceId === activeEnemyInstanceId) {
              // Apply stun immediately (no cast time for weapon attacks)
              setTurnSequence(prev => applyStunDelay(prev, selectedEnemyInstanceId || 'enemy', effectiveDuration, currentTime));
              
              // Track stun period for timeline visualization
              const stunStartTime = currentTime;
              const stunEndTime = currentTime + effectiveDuration;
              console.log(`🔵 STUN WEAPON: Adding stun period from ${stunStartTime.toFixed(2)} to ${stunEndTime.toFixed(2)} (duration: ${effectiveDuration})`);
              setStunPeriods(prev => [...prev, {
                entityId: selectedEnemyInstanceId || 'enemy',
                entityName: getCharacterName(selectedEnemyChar),
                startTime: stunStartTime,
                endTime: stunEndTime,
              }]);

              updateEnemyDebuffsForId(selectedEnemyInstanceId, (prevDebuffs) => 
                addOrMergeBuffStack(
                  prevDebuffs,
                  'stunned',
                  `Stunned (${stunStartTime.toFixed(2)}>${stunEndTime.toFixed(2)})`,
                  'health',
                  0,
                  Math.ceil(effectiveDuration),
                  turnCounter,
                  'instant',
                  false
                )
              );
            }
            
            logMessages.push({ message: `💫 ${getCharacterName(selectedEnemyChar)} is stunned for ${effectiveDuration} turn(s)!` });
          } else {
            logMessages.push({ message: `🛡️ ${getCharacterName(selectedEnemyChar)}'s tenacity (${enemyTenacity}) negates the stun!` });
          }
        }
      }
    }
    
    // Check for Life Draining passive (Doran's Blade)
    if (playerPassiveIds.includes('life_draining')) {
      const baseAD = playerChar.stats.attackDamage || 50;
      const adBonus = Math.max(1, Math.floor(baseAD * 0.01));
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyLifeDrainingBuff(prev, baseAD, turnCounter);
        logMessages.push({ message: `⚔️ Life Draining: +${adBonus} AD!` });
        return updatedBuffs;
      });
    }
    
    if (logMessages.length === 0) {
      logMessages.push({ message: `${playerChar.name} attacked with ${equippedWeapon.name}.` });
    }
    appendEntries(logMessages);
    
    // Apply weapon cooldown
    // TIMING MODEL: Cooldowns snap to next integer turn (same as spells)
    // Example: Attack at T1.65 with 3 CD → +1 for partial turn → 4 turns → Ready at T5.00
    // This ensures cooldowns always count in full turn increments from next boundary
    if (equippedWeapon.cooldown && equippedWeapon.cooldown > 0) {
      const baseCooldown = equippedWeapon.cooldown as number;
      // Add 1 to account for the partial turn we're in (snap to next integer turn)
      const adjustedCooldown = baseCooldown + 1;
      
      console.log('⏰ Setting weapon cooldown:', {
        weaponId: equippedWeaponId,
        weaponName: equippedWeapon.name,
        baseCooldown,
        adjustedCooldown,
        currentTime: currentAction?.time,
        readyAt: `T${Math.ceil(currentAction?.time || 0) + baseCooldown}.00`,
      });
      
      setWeaponCooldowns(prev => {
        const updated: Record<string, number> = {
          ...prev,
          [equippedWeaponId]: adjustedCooldown
        };
        return updated;
      });
    }
    
    // Advance to next action in sequence
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
      setSequenceIndex(0);
    }
  };

  const handleSpell = () => {
    if (!playerEntity || !enemyEntity) return;
    const isCastTutorialStep = tutorialFocus === 'cast';
    
    // Get equipped spell
    const equippedSpellId = state.spells[state.equippedSpellIndex];
    const equippedSpell = equippedSpellId ? getSpellById(equippedSpellId) : null;
    
    console.log('🔮 Attempting to cast spell:', {
      spellId: equippedSpellId,
      spellName: equippedSpell?.name,
      currentCooldowns: state.spellCooldowns,
      cooldownRemaining: state.spellCooldowns[equippedSpellId || ''],
    });
    
    if (!equippedSpell) {
      appendLog(`[P1] ${playerChar.name} has no spell equipped!`);
      return;
    }
    
    // Check cooldown
    const cooldownRemaining = state.spellCooldowns[equippedSpellId] || 0;
    if (cooldownRemaining > 0 && !isCastTutorialStep) {
      console.log('❌ Spell on cooldown, blocking cast');
      appendLog(`[P1] ${equippedSpell.name} is on cooldown! (${cooldownRemaining} turn${cooldownRemaining > 1 ? 's' : ''} remaining)`);
      return;
    }
    
    // Check if player is in range
    if (!canPlayerCastSpell && !isCastTutorialStep) {
      appendLog(`[P1] ${playerChar.name}'s spell is out of range from [E${selectedEnemyIndex + 1}] ${getCharacterName(selectedEnemyChar)}! (${currentDistance} > 500)`);
      // Advance to next action in sequence even if spell fails
      setSequenceIndex((prev) => prev + 1);
      setTurnCounter((prev) => Math.ceil(prev + 1));
      setPlayerTurnDone(true);
      return;
    }
    
    discoverSpell(equippedSpellId);

    // Calculate damage/effects based on spell
    let totalDamage = 0;
    let totalHealing = 0;
    const logMessages: Array<{ message: string }> = [];
    
    for (const effect of equippedSpell.effects) {
      if (effect.type === 'damage' && effect.damageScaling) {
        let physicalBaseDamage = effect.damageScaling.flatPhysicalDamage || 0;
        let magicBaseDamage = 0;
        let trueDamage = effect.damageScaling.trueDamage || 0;

        // Calculate base damage from scaling
        if (effect.damageScaling.abilityPower) {
          magicBaseDamage += playerScaledStats.abilityPower * (effect.damageScaling.abilityPower / 100);
        }
        if (effect.damageScaling.attackDamage) {
          physicalBaseDamage += playerScaledStats.attackDamage * (effect.damageScaling.attackDamage / 100);
        }
        if (effect.damageScaling.health) {
          magicBaseDamage += playerScaledStats.health * (effect.damageScaling.health / 100);
        }
        if (effect.damageScaling.missingHealthTrueDamage) {
          const missingHpBeforeHit = Math.max(0, selectedEnemyScaledStats.health - selectedEnemyChar.hp);
          trueDamage += missingHpBeforeHit * (effect.damageScaling.missingHealthTrueDamage / 100);
        }

        let finalDamage = 0;
        if (physicalBaseDamage > 0) {
          finalDamage += calculatePhysicalDamage(
            physicalBaseDamage,
            selectedEnemyScaledStats.armor || 0,
            playerScaledStats.lethality || 0
          );
        }
        if (magicBaseDamage > 0) {
          finalDamage += calculateMagicDamage(
            magicBaseDamage,
            selectedEnemyScaledStats.magicResist || 0,
            playerScaledStats.magicPenetration || 0
          );
        }

        // Add true damage (bypasses resistances)
        finalDamage += trueDamage;
        
        totalDamage += finalDamage;
        logMessages.push({ message: `[P1] ${playerChar.name} casts ${equippedSpell.name} on [E${selectedEnemyIndex + 1}] ${getCharacterName(selectedEnemyChar)} for ${Math.round(finalDamage)} damage!` });
      }
      
      if (effect.type === 'heal' && effect.healScaling) {
        let healAmount = 0;
        
        if (effect.healScaling.flatAmount) {
          healAmount += effect.healScaling.flatAmount;
        }
        if (effect.healScaling.abilityPower) {
          healAmount += playerScaledStats.abilityPower * (effect.healScaling.abilityPower / 100);
        }
        if (effect.healScaling.missingHealth) {
          const missingHp = playerScaledStats.health - playerChar.hp;
          healAmount += missingHp * (effect.healScaling.missingHealth / 100);
        }
        
        // Check for low health bonus
        if (effect.healScaling.lowHealthBonus) {
          const currentHpPercent = (playerChar.hp / playerScaledStats.health) * 100;
          if (currentHpPercent < effect.healScaling.lowHealthBonus.threshold) {
            healAmount *= effect.healScaling.lowHealthBonus.multiplier;
            logMessages.push({ message: `✨ Low health bonus activated! (${currentHpPercent.toFixed(1)}% HP < ${effect.healScaling.lowHealthBonus.threshold}%)` });
          }
        }
        
        totalHealing += healAmount;
        logMessages.push({ message: `💚 ${playerChar.name} heals for ${Math.round(healAmount)} HP!` });
      }
      
      // Handle stun effects
      if (effect.type === 'stun' && effect.stunDuration) {
        const currentTime = turnSequence[sequenceIndex]?.time || 0;
        const castTime = equippedSpell.castTime || 0;
        const baseDuration = effect.stunDuration; // Base stun duration
        
        // Calculate effective stun duration after enemy tenacity reduction
        const enemyTenacity = selectedEnemyChar.stats.tenacity || 0;
        const effectiveDuration = calculateCCDuration(baseDuration, enemyTenacity, 'stun');
        
        console.log(`[STUN] Applying stun: base=${baseDuration}, tenacity=${enemyTenacity}, effective=${effectiveDuration}`);
        
        // Only apply stun if effective duration > 0 (not immune due to 100 tenacity)
        if (effectiveDuration > 0) {
          // Check if enemy is in range
          const spellRange = equippedSpell.range || 500; // Default spell range
          if (currentDistance <= spellRange) {
            // Apply stun with reduced duration
            const stunEffect = createStunEffect('enemy', effectiveDuration, currentTime, 'player', castTime);
            setStatusEffects(prev => [...prev, stunEffect]);
          
          // Show AoE indicator during cast time
          if (equippedSpell.areaOfEffect) {
            const aoe = equippedSpell.areaOfEffect;
            // Use utility to calculate proper AoE direction
            const aoeCalc = calculateAoEDirection(
              playerPosition,
              enemyPosition,
              spellRange,
              aoe.size
            );
            
            const aoeId = `${equippedSpell.name}_${Date.now()}`;
            setAoeIndicators(prev => [...prev, {
              type: aoe.type,
              position: aoeCalc.sourcePosition,
              size: aoe.size,
              color: '#4A90E2',
              label: equippedSpell.name, // Display the spell name
              id: aoeId, // Unique ID for tracking
              targetPosition: aoeCalc.targetPosition,
            }]);
            
            // Track when to remove AoE indicator (at cast completion time)
            const removalTime = currentTime + castTime;
            console.log(`🎯 AoE indicator for ${equippedSpell.name} will be removed at T${removalTime.toFixed(2)}`);
            setAoeRemovalTimes(prev => [...prev, { label: aoeId, removalTime }]);
          }
          
          // Schedule stun application
          setPendingStuns(prev => [...prev, {
            targetId: 'enemy',
            duration: effectiveDuration,
            currentTime: currentTime + castTime
          }]);
          
          if (castTime > 0) {
            logMessages.push({ message: `⏰ ${playerChar.name} begins casting ${equippedSpell.name}! Stun will apply in ${castTime} turn(s).` });
          } else {
            logMessages.push({ message: `💫 ${playerChar.name} stuns ${getCharacterName(selectedEnemyChar)} for ${effectiveDuration} turn(s)!` });
            // Apply stun immediately if no cast time
            if (selectedEnemyInstanceId === activeEnemyInstanceId) {
              setTurnSequence(prev => applyStunDelay(prev, selectedEnemyInstanceId || 'enemy', effectiveDuration, currentTime));
            }
          }
        } else {
          logMessages.push({ message: `❌ ${getCharacterName(selectedEnemyChar)} is out of range! (${Math.round(currentDistance)} > ${spellRange})` });
        }
        } else {
          logMessages.push({ message: `🛡️ ${getCharacterName(selectedEnemyChar)}'s tenacity (${enemyTenacity}) negates the stun!` });
        }
      }
      
      // Handle slow debuff effects
      if (effect.type === 'debuff' && effect.slowPercent && effect.slowDuration) {
        const currentTime = turnSequence[sequenceIndex]?.time || 0;
        const slowPercent = effect.slowPercent;
        const slowDuration = effect.slowDuration;
        const spellRange = equippedSpell.range || 500;
        
        // Check if enemy is in range
        if (currentDistance <= spellRange) {
          // Create StatusEffect for internal tracking
          const slowEffect = createSlowEffect('enemy', slowDuration, slowPercent, currentTime, 'player');
          setStatusEffects(prev => [...prev, slowEffect]);
          
          // Calculate flat movement speed reduction based on enemy's base movement speed
          const enemyBaseMovement = selectedEnemyScaledStats.movementSpeed || 350;
          const flatReduction = Math.round(enemyBaseMovement * (slowPercent / 100));
          
          // Add slow as CombatBuff for display and stat modification using new stacking system
          updateEnemyDebuffsForId(selectedEnemyInstanceId, (prev) => 
            addOrMergeBuffStack(
              prev,
              'slowed',
              `Slowed (${slowPercent}%)`,
              'movementSpeed',
              -flatReduction,
              slowDuration,
              turnCounter,
              'instant',
              false
            )
          );
          
          logMessages.push({ message: `🐌 ${getCharacterName(selectedEnemyChar)} is slowed by ${slowPercent}% for ${slowDuration} turn(s)!` });
        } else {
          logMessages.push({ message: `❌ Target out of range for ${equippedSpell.name}!` });
        }
      }

      // Handle buff effects (e.g., For Demacia!)
      if (effect.type === 'buff') {
        // Special handling for For Demacia spell
        if (equippedSpell.id === 'for_demacia') {
          console.log('🎯 For Demacia spell casting!');
          const uniqueId = `for_demacia_${Date.now()}`;
          const buff = applyForDemaciaBuff(playerChar, uniqueId);
          console.log('✅ For Demacia buff applied:', {
            shieldId: `${uniqueId}_shield`,
            shieldAmount: buff.shieldAmount,
            playerShields: playerChar.shields,
          });
          
          // Add combat buff for display using new stacking system
          const adBonus = Math.round(playerScaledStats.attackDamage * 0.05);
          setPlayerBuffs(prev => {
            const updated = addOrMergeBuffStack(
              prev,
              'for_demacia',
              'For Demacia!',
              'attackDamage',
              adBonus,
              2, // 2 turns (current + next)
              turnCounter,
              'instant',
              false
            );
            console.log('📊 For Demacia buffer update:', {
              buffsBefore: prev.map(b => ({ id: b.id, stacks: b.stacks.length, stat: b.stat })),
              buffsAfter: updated.map(b => ({ id: b.id, stacks: b.stacks.length, stat: b.stat })),
              totalADBuffs: updated.filter(b => b.stat === 'attackDamage').length,
              adBonus,
            });
            return updated;
          });
          
          logMessages.push({ message: `🛡️ ${playerChar.name} gains +${adBonus} AD and ${buff.shieldAmount} shield for 2 turns!` });
        }
      }
    }
    
    // Update enemy HP if damage was dealt
    if (totalDamage > 0) {
      const liveTargetEnemy = {
        ...selectedEnemyChar,
        shields: selectedEnemyChar.shields?.map((shield) => ({ ...shield })),
      };
      const damageResult = applyDamageWithShield(liveTargetEnemy, totalDamage);
      const newEnemyHp = liveTargetEnemy.hp;
      updateEnemyHp(selectedEnemyIndex, newEnemyHp);

      useGameStore.setState((store) => ({
        state: {
          ...store.state,
          enemyCharacters: store.state.enemyCharacters.map((enemy, idx) =>
            idx === selectedEnemyIndex ? { ...enemy, shields: liveTargetEnemy.shields } : enemy
          ),
        },
      }));

      if (damageResult.shieldDamage > 0) {
        logMessages.push({ message: `🛡️ ${getCharacterName(selectedEnemyChar)}'s shield absorbed ${Math.round(damageResult.shieldDamage)} damage!` });
      }
      
      // Track damage dealt for combat stats
      if (totalDamage > combatStats.highestDamageDealt) {
        setCombatStats(prev => ({
          ...prev,
          highestDamageDealt: Math.round(totalDamage),
          highestDamageSource: 'spell',
        }));
      }
      
      // Calculate omnivamp healing (only if enemy survived)
      if (newEnemyHp > 0 && playerScaledStats.omnivamp && playerScaledStats.omnivamp > 0) {
        const omnivampHealing = Math.max(1, Math.round(totalDamage * (playerScaledStats.omnivamp / 100)));
        totalHealing += omnivampHealing;
        logMessages.push({ message: `💚 Healed ${omnivampHealing} HP [Omnivamp]` });
      }
    }
    
    // Apply healing
    if (totalHealing > 0) {
      const newPlayerHp = Math.min(
        Math.round(playerChar.hp + totalHealing),
        Math.round(playerScaledStats.health)
      );
      updatePlayerHp(newPlayerHp);
    }
    
    // Check for Drain passive (Doran's Ring)
    if (playerPassiveIds.includes('drain')) {
      const baseAP = playerChar.stats.abilityPower || 30;
      const apBonus = Math.max(1, Math.floor(baseAP * 0.01));
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyDrainBuff(prev, baseAP, turnCounter);
        logMessages.push({ message: `✨ Drain: +${apBonus} AP!` });
        return updatedBuffs;
      });
    }
    
    if (logMessages.length === 0) {
      logMessages.push({ message: `${playerChar.name} cast ${equippedSpell.name}.` });
    }
    appendEntries(logMessages);
    
    // Update store with any changes made to playerChar (shields, effects, etc.)
    // Note: Do NOT include hp here since updatePlayerHp() already synced it to the store
    useGameStore.setState((store) => ({
      state: {
        ...store.state,
        playerCharacter: {
          ...store.state.playerCharacter,
          shields: playerChar.shields,
          effects: playerChar.effects,
        },
      },
    }));
    
    // Apply spell cooldown
    // TIMING MODEL: Cooldowns snap to next integer turn
    // Example: Cast at T1.65 with 5 CD → +1 for partial turn → 6 turns → Ready at T7.00
    // This ensures cooldowns always count in full turn increments from next boundary
    if (equippedSpell.cooldown && equippedSpell.cooldown > 0) {
      const baseCooldown = equippedSpell.cooldown as number;
      // Add 1 to account for the partial turn we're in (snap to next integer turn)
      const adjustedCooldown = baseCooldown + 1;
      
      console.log('⏳ Setting spell cooldown:', {
        spellId: equippedSpellId,
        baseCooldown,
        adjustedCooldown,
        currentTime: currentAction?.time,
        readyAt: `T${Math.ceil(currentAction?.time || 0) + baseCooldown}.00`,
      });
      
      useGameStore.setState((store) => ({
        state: {
          ...store.state,
          spellCooldowns: {
            ...store.state.spellCooldowns,
            [equippedSpellId]: adjustedCooldown,
          },
        },
      }));
    }
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    onTutorialActionUsed?.();
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
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
    
    const collisionBlockers = [
      ...getAliveEnemyPositionsExcluding(),
      ...familiarCombatants.map((_, index) => playerPosition + (index + 1) * POSITION_STEP),
    ];
    const resolvedPosition = resolveMovementPosition(newPosition, playerPosition, collisionBlockers);

    setPlayerPosition(resolvedPosition);
    const newDistance = Math.abs(resolvedPosition - enemyPosition);
    
    appendLog(`[P1] ${playerChar.name} moved ${direction} by ${MOVE_DISTANCE} units. Distance: ${newDistance}`);
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
      setSequenceIndex(0);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleUseSelectedItem = () => {
    if (!selectedItemId) return;
    if (!playerEntity || !enemyEntity) return;
    
    const item = getItemById(selectedItemId);
    if (!item) return;
    
    // Check if item is consumable
    if (!item.consumable) {
      appendLog(`${item.name} cannot be used in battle!`);
      return;
    }
    
    // Handle specific item effects
    if (selectedItemId === 'health_potion') {
      const newBuff = createHealthPotionBuff(`buff-${Date.now()}`);
      setPlayerBuffs((prev) => [...prev, newBuff]);
      
      appendLog(`${playerChar.name} used ${item.name}! Restoring 10 HP per turn for 5 turns.`);
      
      // Consume the item from inventory
      consumeInventoryItem(selectedItemId);
    } else if (selectedItemId === 'stealth_ward') {
      // Stealth Ward: Reveal enemy stats for current encounter only (1 turn remaining after this battle)
      for (const enemy of state.enemyCharacters) {
        revealEnemy(enemy.id, 1);
      }
      
      appendLog(`👁️ ${playerChar.name} placed a Stealth Ward! Enemy stats are now revealed!`);
      
      consumeInventoryItem(selectedItemId);
    } else if (selectedItemId === 'control_ward') {
      // Control Ward: Reveal enemy stats for 3 encounters (current + next 2)
      for (const enemy of state.enemyCharacters) {
        revealEnemy(enemy.id, 3);
      }
      
      appendLog(`👁️ ${playerChar.name} placed a Control Ward! Enemy stats will be revealed for the next 3 encounters!`);
      
      consumeInventoryItem(selectedItemId);
    } else if (selectedItemId === 'flashbomb_trap' && item.active) {
      // Handle flashbomb trap placement
      const trapRange = item.active.range || 500;
      const setupTime = item.active.setupTime || 0.5;
      const stunDuration = item.active.stunDuration || 0.5;
      const effectRadius = item.active.effectRadius || 50;
      const currentTime = turnSequence[sequenceIndex]?.time || 0;
      
      // Check if enemy is in range
      if (currentDistance > trapRange) {
        appendLog(`❌ Enemy is out of range! (${currentDistance} > ${trapRange})`);
        return;
      }
      
      // Place trap at enemy's current position
      const trapPosition = enemyPosition;
      const trapId = `flashbomb_${Date.now()}`;
      const activationTime = currentTime + setupTime;
      const stunEndTime = activationTime + stunDuration;
      
      // Show trap indicator (red during setup, yellow when active)
      setAoeIndicators(prev => [...prev, {
        type: 'circle',
        position: trapPosition,
        size: effectRadius,
        color: '#ff4444', // Red during setup
        label: 'Flashbomb', // Display name
        id: trapId, // Unique ID for tracking
      }]);
      
      // Schedule trap activation (color change)
      setAoeRemovalTimes(prev => [...prev, { 
        label: trapId, 
        removalTime: activationTime 
      }]);
      
      // Create stun effect that activates after setup time
      const stunEffect = createStunEffect('enemy', stunDuration, activationTime, 'player', setupTime);
      setStatusEffects(prev => [...prev, stunEffect]);
      
      // Add stun period tracking
      setStunPeriods(prev => [...prev, {
        entityId: 'enemy',
        entityName: getCharacterName(enemyChar),
        startTime: activationTime,
        endTime: stunEndTime,
      }]);
      
      appendLog(`💣 ${playerChar.name} placed a Flashbomb Trap! It will activate in ${setupTime} turn(s).`);
      
      // Consume the item from inventory
      consumeInventoryItem(selectedItemId);
    } else {
      // Fallback for other items
      const newBuff = createBuffFromItem(selectedItemId, `buff-${Date.now()}`, turnCounter);
      if (!newBuff) {
        appendLog(`${item.name} has no usable effects!`);
        return;
      }
      
      // Compute display values from buff
      const { totalAmount, maxDuration } = computeBuffDisplayValues(newBuff, turnCounter);
      
      setPlayerBuffs((prev) => [...prev, newBuff]);
      appendLog(`${playerChar.name} used ${item.name}! +${totalAmount} ${newBuff.stat} for ${maxDuration} turns!`);
      
      // Consume the item from inventory
      consumeInventoryItem(selectedItemId);
    }
    
    // Auto-selection will be handled by the inventory change useEffect
    
    // Advance to next action in sequence (using item counts as an action)
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    onTutorialActionUsed?.();
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
      setSequenceIndex(0);
    }
  };

  const summonEnemyUnits = (summons: Character[], anchorPosition?: number) => {
    if (summons.length === 0) return;

    const liveEnemies = useGameStore.getState().state.enemyCharacters;
    const occupiedPositions = liveEnemies
      .map((enemy, index) => {
        const instanceId = getCharacterInstanceId(enemy, index);
        return enemy.hp > 0 ? getEnemyPositionById(instanceId, index) : null;
      })
      .filter((position): position is number => position !== null);

    setEnemyPositionsById((prev) => {
      const next = { ...prev };
      const spawnAnchor = anchorPosition ?? getDefaultEnemySpawnPosition(liveEnemies.length);

      summons.forEach((summon, index) => {
        const summonInstanceId = getCharacterInstanceId(summon, liveEnemies.length + index);
        const desiredSpawn = spawnAnchor + index * POSITION_STEP;
        const resolvedSpawn = resolveSpawnPosition(desiredSpawn, occupiedPositions);
        next[summonInstanceId] = resolvedSpawn;
        occupiedPositions.push(resolvedSpawn);
      });

      return next;
    });

    useGameStore.setState((store) => ({
      state: {
        ...store.state,
        enemyCharacters: [...store.state.enemyCharacters, ...summons],
      },
    }));
  };

  const handleEnemyMove = () => {
    if (!enemyEntity || !enemyChar) return;
    
    const currentAction = turnSequence[sequenceIndex];
    // Resolve which enemy is acting
    const actingEnemyIndex = currentAction
      ? state.enemyCharacters.findIndex((e, i) => getCharacterInstanceId(e, i) === currentAction.entityId)
      : 0;
    const actingEnemy = state.enemyCharacters[actingEnemyIndex] ?? enemyChar;
    const actingEnemyStats = actingEnemy.stats;
    const actingEnemyInstanceId = getCharacterInstanceId(actingEnemy, Math.max(0, actingEnemyIndex));
    const actingEnemyPosition = getEnemyPositionById(actingEnemyInstanceId, Math.max(0, actingEnemyIndex));

    // AI: Only move if out of range to attack
    const enemyAttackRange = actingEnemyStats.attackRange || 125;
    const distance = Math.abs(playerPosition - actingEnemyPosition);
    
    // If in range to attack, don't move
    if (distance <= enemyAttackRange) {
      appendLog(`${actingEnemy.name} held position (already in range).`);
      setSequenceIndex((prev) => prev + 1);
      setTurnCounter((prev) => {
        const nextAction = turnSequence[sequenceIndex + 1];
        return nextAction ? Math.ceil(nextAction.turnNumber) : prev + 1;
      });
      return;
    }
    
    // Calculate enemy movement speed with debuffs
    const baseEnemyMovement = Math.floor((actingEnemyStats.movementSpeed || 350) / 10);
    const slowModifier = getSlowModifier(_statusEffects, 'enemy', currentAction?.time || 0);
    const enemyMoveDistance = Math.max(1, Math.floor(baseEnemyMovement * slowModifier));
    
    // Out of range, so move towards player
    const attemptedPosition = actingEnemyPosition + enemyMoveDistance;
    const blockers = [
      playerPosition,
      ...familiarCombatants.map((_, index) => playerPosition + (index + 1) * POSITION_STEP),
      ...getAliveEnemyPositionsExcluding(actingEnemyInstanceId),
    ];
    const newPosition = resolveMovementPosition(attemptedPosition, actingEnemyPosition, blockers);

    setEnemyPositionsById((prev) => ({
      ...prev,
      [actingEnemyInstanceId]: newPosition,
    }));
    const newDistance = Math.abs(playerPosition - newPosition);
    
    appendLog(`${actingEnemy.name} moved towards by ${enemyMoveDistance} units. Distance: ${newDistance}`);
  };

  const handleSkip = () => {
    if (!playerEntity || !enemyEntity) return;
    
    appendLog(`${playerChar.name} skipped their turn!`);
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => Math.ceil(prev + 1));
    setPlayerTurnDone(true);
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
      setSequenceIndex(0);
    }
  };

  const handleEnemyAttack = () => {
    if (!playerEntity || !enemyEntity || enemyChar.hp <= 0) return;
    
    const currentAction = turnSequence[sequenceIndex];
    if (!currentAction) return;

    // Resolve which enemy is acting based on the turn sequence entity ID
    const actingEnemyIndex = state.enemyCharacters.findIndex(
      (e, i) => getCharacterInstanceId(e, i) === currentAction.entityId
    );
    const actingEnemy = actingEnemyIndex >= 0 ? state.enemyCharacters[actingEnemyIndex] : enemyChar;
    const actingEnemyStats = actingEnemy.stats;
    const actingEnemyInstanceId = getCharacterInstanceId(actingEnemy, Math.max(0, actingEnemyIndex));
    const actingEnemyPosition = getEnemyPositionById(actingEnemyInstanceId, Math.max(0, actingEnemyIndex));

    // Guard: skip if acting enemy is dead (should have been caught earlier, but just in case)
    if (actingEnemy.hp <= 0) {
      setSequenceIndex((prev) => prev + 1);
      return;
    }
    
    // Get enemy loadout (use default if not specified)
    const enemyLoadout = actingEnemy.enemyLoadout || getDefaultEnemyLoadout();
    const behaviorProfile = actingEnemy.behaviorProfile || 'balanced';
    
    // Build AI decision context
    const aiContext: AIDecisionContext = {
      enemy: actingEnemy,
      player: playerChar,
      enemyPosition: actingEnemyPosition,
      playerPosition,
      enemyStats: actingEnemyStats,
      playerStats: playerScaledStats,
      turnCounter,
      weaponCooldowns: enemyWeaponCooldowns,
      spellCooldowns: enemySpellCooldowns,
      behaviorProfile,
      enemyLoadout,
      currentActionType: currentAction.actionType,
    };
    
    // Get AI decision
    const aiAction = decideEnemyAction(aiContext);
    const chosenEnemyTarget = chooseAutoTarget(playerTeamTargets) || playerTeamTargets[0];
    const targetedFamiliar = chosenEnemyTarget?.kind === 'familiar' ? getFamiliarById(chosenEnemyTarget.baseId) : null;
    const targetDefenseStats = targetedFamiliar ? targetedFamiliar.stats : playerScaledStats;
    const targetCurrentHp = targetedFamiliar
      ? (state.familiarStates[chosenEnemyTarget.baseId]?.currentHp ?? targetedFamiliar.stats.health)
      : playerChar.hp;
    const targetMaxHp = targetedFamiliar ? targetedFamiliar.stats.health : playerScaledStats.health;
    const targetName = chosenEnemyTarget?.name || playerChar.name;
    
    console.log('🤖 Enemy AI Action:', aiAction, '| target:', targetName);
    
    // Execute AI decision
    if (aiAction.type === 'weapon') {
      // Enemy uses a weapon
      const weaponId = enemyLoadout.weapons[aiAction.weaponIndex];
      const weapon = weaponId ? getWeaponById(weaponId) : null;
      
      if (!weapon) {
        console.error('Enemy weapon not found:', weaponId);
        handleSkip();
        return;
      }
      
      // Calculate weapon damage and effects
      let totalDamage = 0;
      const logMessages: Array<{ message: string }> = [];
      
      for (const effect of weapon.effects) {
        if (effect.type === 'damage' && effect.damageScaling) {
          let physicalBaseDamage = 0;
          let magicBaseDamage = 0;
          let trueDamage = effect.damageScaling.trueDamage || 0;
          
          if (effect.damageScaling.attackDamage) {
            physicalBaseDamage += (actingEnemyStats.attackDamage || 0) * (effect.damageScaling.attackDamage / 100);
          }
          if (effect.damageScaling.abilityPower) {
            magicBaseDamage += (actingEnemyStats.abilityPower || 0) * (effect.damageScaling.abilityPower / 100);
          }
          if (effect.damageScaling.health) {
            physicalBaseDamage += (actingEnemyStats.health || 0) * (effect.damageScaling.health / 100);
          }
          
          // Check for critical strike
          let isCrit = false;
          if (rollCriticalStrike(actingEnemyStats.criticalChance || 0)) {
            physicalBaseDamage = calculateCriticalDamage(physicalBaseDamage, actingEnemyStats.criticalDamage || 200);
            magicBaseDamage = calculateCriticalDamage(magicBaseDamage, actingEnemyStats.criticalDamage || 200);
            isCrit = true;
          }
          
          let finalDamage = 0;
          if (physicalBaseDamage > 0) {
            finalDamage += calculatePhysicalDamage(
              physicalBaseDamage,
              targetDefenseStats.armor || 0,
              actingEnemyStats.lethality || 0
            );
          }
          if (magicBaseDamage > 0) {
            finalDamage += calculateMagicDamage(
              magicBaseDamage,
              targetDefenseStats.magicResist || 0,
              actingEnemyStats.magicPenetration || 0
            );
          }
          
          finalDamage += trueDamage;
          totalDamage += finalDamage;
          
          if (isCrit) {
            logMessages.push({ message: `💥 CRITICAL HIT! ${getCharacterName(actingEnemy)} uses ${weapon.name} on ${targetName} for ${Math.round(finalDamage)} damage!` });
          } else {
            logMessages.push({ message: `${getCharacterName(actingEnemy)} uses ${weapon.name} on ${targetName} for ${Math.round(finalDamage)} damage!` });
          }
        }
        
        // Handle movement effects
        if (effect.type === 'movement' && effect.movementAmount) {
          const direction = effect.movementAmount > 0 ? 'towards' : 'away';
          const distance = Math.abs(effect.movementAmount);
          const attemptedPosition = direction === 'towards' 
            ? actingEnemyPosition + distance
            : actingEnemyPosition - distance;
          const blockers = [
            playerPosition,
            ...familiarCombatants.map((_, index) => playerPosition + (index + 1) * POSITION_STEP),
            ...getAliveEnemyPositionsExcluding(actingEnemyInstanceId),
          ];
          const newPosition = resolveMovementPosition(attemptedPosition, actingEnemyPosition, blockers);
          setEnemyPositionsById((prev) => ({
            ...prev,
            [actingEnemyInstanceId]: newPosition,
          }));
          logMessages.push({ message: `${getCharacterName(actingEnemy)} dashes ${direction}!` });
        }
      }
      
      // Apply damage to the chosen target
      if (totalDamage > 0) {
        if (targetedFamiliar && chosenEnemyTarget) {
          const newFamiliarHp = Math.max(0, Math.round(targetCurrentHp - totalDamage));
          updateFamiliarHp(chosenEnemyTarget.baseId, newFamiliarHp);
          logMessages.push({ message: `🐾 ${targetName} takes ${Math.round(totalDamage)} damage.` });
        } else {
          const damageResult = applyDamageWithShield(playerChar, totalDamage);
          updatePlayerHp(playerChar.hp);
          
          // Track damage taken
          if (totalDamage > combatStats.highestDamageTaken) {
            setCombatStats(prev => ({
              ...prev,
              highestDamageTaken: Math.round(totalDamage),
              highestDamageTakenSource: 'attack',
            }));
          }
          
          if (damageResult.shieldDamage > 0) {
            logMessages.push({ message: `🛡️ Shield absorbed ${damageResult.shieldDamage} damage!` });
          }
          
          // Check player death
          if (playerChar.hp <= 0 && !battleEnded) {
            resolvePlayerDefeat({
              setBattleEnded,
              setBattleResult: (result) => setBattleResult(result),
              setShowSummary,
              appendEntries,
              logMessages,
            });
            return;
          }
        }
      }
      
      if (logMessages.length === 0) {
        logMessages.push({ message: `${getCharacterName(actingEnemy)} used ${weapon.name}.` });
      }
      appendEntries(logMessages);
      
      // Apply weapon cooldown
      if (weapon.cooldown && weapon.cooldown > 0) {
        const adjustedCooldown = weapon.cooldown + 1;
        setEnemyWeaponCooldowns(prev => ({
          ...prev,
          [weaponId]: adjustedCooldown
        }));
      }
      
    } else if (aiAction.type === 'spell') {
      // Enemy casts a spell
      const spellId = enemyLoadout.spells[aiAction.spellIndex];
      const spell = spellId ? getSpellById(spellId) : null;
      
      if (!spell) {
        console.error('Enemy spell not found:', spellId);
        handleSkip();
        return;
      }
      
      let totalDamage = 0;
      let totalHealing = 0;
      const logMessages: Array<{ message: string }> = [];
      
      for (const effect of spell.effects) {
        if (spell.id === 'emperors_divide' && effect.type === 'special') {
          const liveEnemyState = useGameStore.getState().state.enemyCharacters;
          const livingSoldiers = liveEnemyState.filter((enemy) => enemy.isSummon && enemy.ownerId === activeEnemyInstanceId && enemy.id === 'shurima_sand_soldier' && enemy.hp > 0);
          const summonsNeeded = Math.max(0, 2 - livingSoldiers.length);

          if (summonsNeeded > 0) {
            const newSoldiers = Array.from({ length: summonsNeeded }, (_, idx) =>
              createShurimaSandSoldierSummon(activeEnemyInstanceId, actingEnemy.level, livingSoldiers.length + idx + 1)
            );
            summonEnemyUnits(newSoldiers, actingEnemyPosition);
            logMessages.push({ message: `🏺 ${getCharacterName(actingEnemy)} summons ${summonsNeeded} Sand Soldier${summonsNeeded > 1 ? 's' : ''}!` });
          } else {
            logMessages.push({ message: `🏺 ${getCharacterName(actingEnemy)} commands his existing sand soldiers to hold the line!` });
          }
        }

        if (effect.type === 'damage' && effect.damageScaling) {
          let physicalBaseDamage = effect.damageScaling.flatPhysicalDamage || 0;
          let magicBaseDamage = 0;
          let trueDamage = effect.damageScaling.trueDamage || 0;

          if (effect.damageScaling.abilityPower) {
            magicBaseDamage += (actingEnemyStats.abilityPower || 0) * (effect.damageScaling.abilityPower / 100);
          }
          if (effect.damageScaling.attackDamage) {
            physicalBaseDamage += (actingEnemyStats.attackDamage || 0) * (effect.damageScaling.attackDamage / 100);
          }
          if (effect.damageScaling.health) {
            magicBaseDamage += (actingEnemyStats.health || 0) * (effect.damageScaling.health / 100);
          }
          if (effect.damageScaling.missingHealthTrueDamage) {
            const missingHpBeforeHit = Math.max(0, targetMaxHp - targetCurrentHp);
            trueDamage += missingHpBeforeHit * (effect.damageScaling.missingHealthTrueDamage / 100);
          }

          let finalDamage = 0;
          if (physicalBaseDamage > 0) {
            finalDamage += calculatePhysicalDamage(
              physicalBaseDamage,
              targetDefenseStats.armor || 0,
              actingEnemyStats.lethality || 0
            );
          }
          if (magicBaseDamage > 0) {
            finalDamage += calculateMagicDamage(
              magicBaseDamage,
              targetDefenseStats.magicResist || 0,
              actingEnemyStats.magicPenetration || 0
            );
          }

          finalDamage += trueDamage;
          
          totalDamage += finalDamage;
          logMessages.push({ message: `${getCharacterName(actingEnemy)} casts ${spell.name} on ${targetName} for ${Math.round(finalDamage)} damage!` });
        }
        
        if (effect.type === 'heal' && effect.healScaling) {
          let healAmount = 0;
          
          if (effect.healScaling.flatAmount) {
            healAmount += effect.healScaling.flatAmount;
          }
          if (effect.healScaling.abilityPower) {
            healAmount += (actingEnemyStats.abilityPower || 0) * (effect.healScaling.abilityPower / 100);
          }
          if (effect.healScaling.missingHealth) {
            const missingHp = actingEnemyStats.health - actingEnemy.hp;
            healAmount += missingHp * (effect.healScaling.missingHealth / 100);
          }
          
          totalHealing += healAmount;
          logMessages.push({ message: `💚 ${getCharacterName(actingEnemy)} heals for ${Math.round(healAmount)} HP!` });
        }

        if (effect.type === 'buff' && spell.id === 'for_demacia') {
          const uniqueId = `enemy_for_demacia_${Date.now()}`;
          const buff = applyForDemaciaBuff(actingEnemy, uniqueId);
          const adBonus = Math.round((actingEnemyStats.attackDamage || 0) * 0.05);

          updateEnemyBuffsForId(activeEnemyInstanceId, (prev) =>
            addOrMergeBuffStack(
              prev,
              'enemy_for_demacia',
              'For Demacia!',
              'attackDamage',
              adBonus,
              2,
              turnCounter,
              'instant',
              false
            )
          );

          logMessages.push({ message: `🛡️ ${getCharacterName(actingEnemy)} gains +${adBonus} AD and ${buff.shieldAmount} shield for 2 turns!` });
        }
      }
      
      // Apply damage to the chosen target
      if (totalDamage > 0) {
        if (targetedFamiliar && chosenEnemyTarget) {
          const newFamiliarHp = Math.max(0, Math.round(targetCurrentHp - totalDamage));
          updateFamiliarHp(chosenEnemyTarget.baseId, newFamiliarHp);
          logMessages.push({ message: `🐾 ${targetName} takes ${Math.round(totalDamage)} damage.` });
        } else {
          const damageResult = applyDamageWithShield(playerChar, totalDamage);
          updatePlayerHp(playerChar.hp);
          
          if (totalDamage > combatStats.highestDamageTaken) {
            setCombatStats(prev => ({
              ...prev,
              highestDamageTaken: Math.round(totalDamage),
              highestDamageTakenSource: 'spell',
            }));
          }
          
          if (damageResult.shieldDamage > 0) {
            logMessages.push({ message: `🛡️ Shield absorbed ${damageResult.shieldDamage} damage!` });
          }
          
          if (playerChar.hp <= 0 && !battleEnded) {
            resolvePlayerDefeat({
              setBattleEnded,
              setBattleResult: (result) => setBattleResult(result),
              setShowSummary,
              appendEntries,
              logMessages,
            });
            return;
          }
        }
      }
      
      // Apply healing to enemy
      if (totalHealing > 0) {
        const newEnemyHp = Math.min(
          Math.round(actingEnemy.hp + totalHealing),
          Math.round(actingEnemyStats.health)
        );
        updateEnemyHp(actingEnemyIndex >= 0 ? actingEnemyIndex : enemyCharIndex, newEnemyHp);
      }
      
      if (logMessages.length === 0) {
        logMessages.push({ message: `${getCharacterName(actingEnemy)} cast ${spell.name}.` });
      }
      appendEntries(logMessages);
      
      // Apply spell cooldown
      if (spell.cooldown && spell.cooldown > 0) {
        const adjustedCooldown = spell.cooldown + 1;
        setEnemySpellCooldowns(prev => ({
          ...prev,
          [spellId]: adjustedCooldown
        }));
      }
      
    } else if (aiAction.type === 'item') {
      // Enemy uses an item
      const item = getItemById(aiAction.itemId);
      
      if (!item) {
        console.error('Enemy item not found:', aiAction.itemId);
        handleSkip();
        return;
      }
      
      // Handle health potion
      if (aiAction.itemId === 'health_potion') {
        // Heal enemy over time (simplified for enemies)
        const healAmount = 50; // Flat heal for simplicity
        const newEnemyHp = Math.min(
          Math.round(actingEnemy.hp + healAmount),
          Math.round(actingEnemyStats.health)
        );
        updateEnemyHp(actingEnemyIndex >= 0 ? actingEnemyIndex : enemyCharIndex, newEnemyHp);
        
        appendLog(`${getCharacterName(actingEnemy)} used ${item.name}! Restored ${healAmount} HP.`);
      }
      
    } else if (aiAction.type === 'move') {
      // Enemy moves
      const moveDistance = aiAction.distance;
      const direction = aiAction.direction;
      
      let newPosition = direction === 'towards' 
        ? actingEnemyPosition + moveDistance
        : actingEnemyPosition - moveDistance;
      const blockers = [
        playerPosition,
        ...familiarCombatants.map((_, index) => playerPosition + (index + 1) * POSITION_STEP),
        ...getAliveEnemyPositionsExcluding(actingEnemyInstanceId),
      ];
      newPosition = resolveMovementPosition(newPosition, actingEnemyPosition, blockers);

      setEnemyPositionsById((prev) => ({
        ...prev,
        [actingEnemyInstanceId]: newPosition,
      }));
      const newDistance = Math.abs(playerPosition - newPosition);
      
      appendLog(`${getCharacterName(actingEnemy)} moved ${direction} by ${moveDistance} units. Distance: ${newDistance}`);
      
    } else if (aiAction.type === 'skip') {
      // Enemy skips turn
      appendLog(`${getCharacterName(actingEnemy)} skipped their turn.`);
    }
    
    // Advance to next action in sequence
    setSequenceIndex((prev) => prev + 1);
    setTurnCounter((prev) => {
      const nextAction = turnSequence[sequenceIndex + 1];
      return nextAction ? Math.ceil(nextAction.turnNumber) : prev + 1;
    });
    
    // Regenerate if needed
    if (sequenceIndex > turnSequence.length - 10) {
      setTurnSequence(generateMultiEntityTurnSequence(allTurnEntities, 20));
      setSequenceIndex(0);
    }
  };

  const handleAbility = (abilityIndex: number) => {
    const ability = playerChar.abilities[abilityIndex];
    if (ability.damage) {
      appendLog(`${playerChar.name} uses ${ability.name}! Deals ${ability.damage} damage!`);
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
    } else if (battleResult === 'battle_fled') {
      console.log('🏃 Handling battle fled - skip encounter, no rewards');
      incrementEncounterCount();

      if (pendingBattleData && pendingBattleData.length > 0) {
        setTimeout(() => {
          setBattleEnded(false);
          setPlayerTurnDone(false);
          setBattleResult(null);
          startBattle(pendingBattleData);
          setPendingBattleData(null);
          setFleeOutcome(null);
        }, 100);
      } else {
        if (state.currentFloor >= 10 && state.selectedRegion) {
          setCompletedRegion(state.selectedRegion);
          if (onQuestComplete) {
            setTimeout(() => {
              onQuestComplete();
            }, 50);
          }
        } else if (onQuestComplete) {
          onQuestComplete();
        } else if (onBack) {
          onBack();
        } else {
          window.location.reload();
        }
      }
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
        // All encounters complete - check if we should show post-region choice
        if (state.currentFloor >= 10 && state.selectedRegion) {
          // Region complete! Mark it and navigate to region selection with actions
          console.log('🎉 Region complete - setting completedRegion to:', state.selectedRegion);
          setCompletedRegion(state.selectedRegion); // Mark region as completed
          // Use setTimeout to ensure state update propagates before navigation
          if (onQuestComplete) {
            setTimeout(() => {
              console.log('🚀 Navigating to region selection after state update');
              onQuestComplete(); // This will navigate to regionSelection via App.tsx
            }, 50);
          }
        } else if (onQuestComplete) {
          // Normal quest completion (less than 10 floors)
          onQuestComplete();
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

  // Remove AoE indicators when timeline reaches their removal time
  useEffect(() => {
    if (aoeRemovalTimes.length === 0 || !turnSequence[sequenceIndex]) return;
    
    const currentTime = turnSequence[sequenceIndex].time;
    const indicatorsToRemove = aoeRemovalTimes.filter(item => currentTime >= item.removalTime);
    
    if (indicatorsToRemove.length > 0) {
      indicatorsToRemove.forEach(item => {
        console.log(`🎯 Removing AoE indicator "${item.label}" at T${currentTime.toFixed(2)}`);
        
        // Check if this is a flashbomb trap activating
        if (item.label.startsWith('flashbomb_')) {
          // Change trap color to yellow (active) and add activation message
          setAoeIndicators(prev => prev.map(indicator => 
            indicator.id === item.label 
              ? { ...indicator, color: '#ffcc00' } // Change to yellow
              : indicator
          ));
          
          appendLog(`💥 Flashbomb Trap activated! ${enemyChar.name} is stunned!`);
          
          // Schedule actual removal after stun ends (another 0.5 turns)
          const aoeIndicator = aoeIndicators.find(a => a.id === item.label);
          if (aoeIndicator) {
            setTimeout(() => {
              setAoeIndicators(prev => prev.filter(a => a.id !== item.label));
            }, 500); // Remove after a brief delay
          }
        } else {
          // Normal AoE removal (use id if available, fallback to label)
          setAoeIndicators(prev => prev.filter(a => (a.id || a.label) !== item.label));
        }
      });
      
      // Remove from tracking list
      setAoeRemovalTimes(prev => prev.filter(item => currentTime < item.removalTime));
    }
  }, [sequenceIndex, turnSequence, aoeRemovalTimes, aoeIndicators, enemyChar]);

  // Process pending stuns when timeline advances past their cast time
  useEffect(() => {
    if (pendingStuns.length === 0 || !turnSequence[sequenceIndex]) return;
    
    const currentTime = turnSequence[sequenceIndex].time;
    const stunsToApply = pendingStuns.filter(stun => currentTime >= stun.currentTime);
    
    if (stunsToApply.length > 0) {
      stunsToApply.forEach(stun => {
        // Apply the stun delay to the turn sequence
        setTurnSequence(prev => applyStunDelay(prev, stun.targetId, stun.duration, currentTime));
        
        // Track stun period for timeline visualization
        console.log(`🔵 STUN SPELL: Adding stun period from ${currentTime.toFixed(2)} to ${(currentTime + stun.duration).toFixed(2)} (duration: ${stun.duration})`);
        setStunPeriods(prev => [...prev, {
          entityId: stun.targetId,
          entityName: stun.targetId === 'player' ? getCharacterName(playerChar) : getCharacterName(enemyChar),
          startTime: currentTime,
          endTime: currentTime + stun.duration,
        }]);
        
        // Add log message
        const targetName = stun.targetId === 'player' ? playerChar.name : enemyChar.name;
        appendLog(`💫 ${targetName} is stunned for ${stun.duration} turn(s)!`);
      });
      
      // Remove applied stuns from pending list
      setPendingStuns(prev => prev.filter(stun => currentTime < stun.currentTime));
    }
  }, [sequenceIndex, turnSequence, pendingStuns, playerChar.name, enemyChar.name]);

  // Apply turn-based effects every turn
  // TIMING MODEL - Hybrid:
  // - Instant effects (damage, healing): Apply immediately at action time
  // - Duration effects (buffs, DoTs, cooldowns): Tick at integer turns only
  // This ensures predictable countdowns while maintaining responsive instant effects
  useEffect(() => {
    if (battleEnded) return;

    const currentTurn = Math.ceil(turnCounter);
    const isWholeTurn = turnCounter > 0 && Number.isInteger(turnCounter);

    if (!isWholeTurn || currentTurn <= lastLoggedTurn || processedTurnEffectsRef.current === currentTurn) {
      return;
    }

    processedTurnEffectsRef.current = currentTurn;

    const newLogMessages = runTurnManager({
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
      familiarStates: state.familiarStates,
      selectedEnemyTargetId,
      activeEnemyInstanceId,
      applyEnemyCombatModifiers,
      updatePlayerHp,
      updateEnemyHp,
      updateEnemyDebuffsForId,
      updateEnemyBuffsForId,
      setPlayerBuffs: (updater) => setPlayerBuffs(updater),
      setFamiliarNextActionTurn: (nextTimers) => setFamiliarNextActionTurn(nextTimers),
      reduceSpellCooldowns,
    });
      
      appendEntries(newLogMessages);
      setLastLoggedTurn(currentTurn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCounter, battleEnded, lastLoggedTurn, activeEnemyInstanceId]);

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
    
    // It's an enemy's turn if the acting entity is not the player
    if (currentAction.entityId !== 'player') {
      // Find which enemy index this action belongs to
      const actingEnemyIndex = state.enemyCharacters.findIndex(
        (enemy, index) => getCharacterInstanceId(enemy, index) === currentAction.entityId
      );
      const actingEnemy = actingEnemyIndex >= 0 ? state.enemyCharacters[actingEnemyIndex] : null;

      // Skip this turn if the acting enemy is already dead
      if (!actingEnemy || actingEnemy.hp <= 0) {
        const timer = setTimeout(() => {
          setSequenceIndex((prev) => prev + 1);
        }, 200);
        return () => clearTimeout(timer);
      }

      const timer = setTimeout(() => {
        if (currentAction.actionType === 'move') {
          handleEnemyMove();
        } else {
          handleEnemyAttack();
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [sequenceIndex, battleEnded, state.enemyCharacters, turnSequence]);

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
      resolveEnemyDefeat({
        enemyChar,
        playerChar,
        playerScaledHealth: playerScaledStats.health,
        playerBuffs,
        playerPassiveIds,
        turnCounter,
        stateCurrentFloor: state.currentFloor,
        stateSelectedRegion: state.selectedRegion,
        stateOriginalEnemyQueue: state.originalEnemyQueue,
        stateInventory: state.inventory,
        currentQuestPath,
        appendLog,
        appendLogs,
        appendEntries,
        setBattleEnded,
        setShowSummary,
        setBattleResult: (result) => setBattleResult(result),
        setRewardOptions,
        setPendingBattleData,
        setSummaryRewards: (rewards) => setSummaryRewards(rewards),
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
      });
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
  const currentQuestPath = useMemo(() => {
    if (!state.selectedQuest) return null;

    const selectedQuest = getQuestById(state.selectedQuest.questId);
    return selectedQuest?.paths.find((path) => path.id === state.selectedQuest?.pathId) || null;
  }, [state.selectedQuest]);

  const isBattleTutorial = tutorialFocus !== null;
  const isBattleFocus = tutorialFocus === 'battle';
  const isArenaFocus = tutorialFocus === 'enemy';
  const isBattlefieldFocus = tutorialFocus === 'turns-battlefield';
  const isTimelineFocus = tutorialFocus === 'turns-timeline';
  const isLogFocus = tutorialFocus === 'turns-log';
  const isActionsFocus = tutorialFocus === 'actions';
  const isSpeedFocus = tutorialFocus === 'speed';
  const isMoveFocus = tutorialFocus === 'speed-move';
  const isAttackFocus = tutorialFocus === 'speed-attack';
  const isHasteFocus = tutorialFocus === 'haste';
  const isItemFocus = tutorialFocus === 'haste-item';
  const isCastFocus = tutorialFocus === 'cast';
  const allowCastTutorialOverride = tutorialFocus === 'cast';
  const blockSpellDuringTutorial = tutorialFocus === 'actions' || tutorialFocus === 'haste';
  const blockItemDuringTutorial = tutorialFocus === 'actions' || tutorialFocus === 'haste';
  const getTutorialClass = (isHighlighted: boolean) => {
    if (!isBattleTutorial) return '';
    return isHighlighted ? 'battle-tutorial-highlight' : 'battle-tutorial-muted';
  };

  // Formation presets: per-count configuration for spacing and slot placement
  type SpacingMode = 'cinematic' | 'normal' | 'compact';
  
  interface FormationPreset {
    slotIndices: number[];
    spacing: SpacingMode;
  }

  const FORMATION_PRESETS: Record<number, FormationPreset> = {
    1: { slotIndices: [2], spacing: 'cinematic' },
    2: { slotIndices: [1, 2], spacing: 'normal' },
    3: { slotIndices: [1, 2, 3], spacing: 'normal' },
    4: { slotIndices: [1, 2, 3, 4], spacing: 'compact' },
    5: { slotIndices: [0, 1, 2, 3, 4], spacing: 'compact' },
  };

  const getFormationPreset = (count: number): FormationPreset => {
    if (count <= 0) return { slotIndices: [], spacing: 'normal' };
    return FORMATION_PRESETS[count] || FORMATION_PRESETS[5];
  };

  type FormationUnit = {
    id: string;
    position: number;
    team: 'player' | 'enemy';
    tokenLabel: string;
    tokenShape: 'circle' | 'square' | 'diamond';
    tokenAccent: string;
    markerImageSrc?: string;
    markerFallbackLabel?: string;
    compact?: boolean;
    defeated?: boolean;
    heightClass?: 'h-full' | 'h-90' | 'h-75' | 'h-70';
    widthClass?: 'w-100' | 'w-90' | 'w-75' | 'w-70';
    content: React.ReactNode;
  };

  const familiarCombatants = useMemo(
    () => activeFamiliars.filter((familiar) => (state.familiarStates[familiar.id]?.currentHp || 0) > 0),
    [activeFamiliars, state.familiarStates]
  );

  const playerFormationUnits = useMemo<FormationUnit[]>(() => {
    const units: FormationUnit[] = [
      {
        id: 'player-main',
        position: playerPosition,
        team: 'player',
        tokenLabel: 'P1',
        tokenShape: 'circle',
        tokenAccent: '#1fb6ff',
        markerImageSrc: playerChar.characterArt || '/assets/global/images/player/miko1.png',
        widthClass: 'w-100',
        content: <CharacterStatus combatBuffs={playerBuffs} turnCounter={turnCounter} compact />,
      },
    ];

    familiarCombatants.forEach((familiar, index) => {
      units.push({
        id: `familiar-${familiar.id}`,
        position: playerPosition + (index + 1) * 10,
        team: 'player',
        tokenLabel: `F${index + 1}`,
        tokenShape: 'diamond',
        tokenAccent: '#7dd3fc',
        markerImageSrc: familiar.imagePath,
        markerFallbackLabel: `F${index + 1}`,
        compact: true,
        heightClass: 'h-70',
        widthClass: 'w-70',
        content: (
          <FamiliarStatus
            familiarId={familiar.id}
            compact
            currentTurn={Math.ceil(turnCounter)}
            nextActionTurn={familiarNextActionTurn[familiar.id]}
          />
        ),
      });
    });

    return units.sort((a, b) => a.position - b.position);
  }, [familiarCombatants, familiarNextActionTurn, playerBuffs, playerPosition, turnCounter]);

  const enemyFormationUnits = useMemo<FormationUnit[]>(() => {
    const units = state.enemyCharacters.map((enemy, index) => {
      const targetId = getCharacterInstanceId(enemy, index);
      const enemyBattlePosition = getEnemyPositionById(targetId, index);
      const isMinionTier = enemy.tier === 'minion';
      const isHighTier = enemy.tier === 'elite' || enemy.tier === 'champion';
      const enemyHeightClass: FormationUnit['heightClass'] = isMinionTier ? 'h-75' : isHighTier ? 'h-90' : 'h-full';
      const enemyWidthClass: FormationUnit['widthClass'] = isMinionTier ? 'w-75' : isHighTier ? 'w-90' : 'w-100';

      return {
        id: targetId,
        position: enemyBattlePosition,
        team: 'enemy' as const,
        tokenLabel: `E${index + 1}`,
        tokenShape: (enemy.tier === 'boss' || enemy.tier === 'legend' ? 'diamond' : 'square') as 'diamond' | 'square',
        tokenAccent: enemy.hp > 0 ? '#ff8f66' : '#8f6a5c',
        markerImageSrc: enemy.characterArt,
        markerFallbackLabel: `E${index + 1}`,
        compact: isMinionTier,
        defeated: enemy.hp <= 0,
        heightClass: enemyHeightClass,
        widthClass: enemyWidthClass,
        content: (
          <CharacterStatus
            characterId={targetId}
            combatDebuffs={enemyDebuffsById[targetId] || []}
            isRevealed={store.isEnemyRevealed(enemy.id)}
            turnCounter={turnCounter}
            compact
          />
        ),
      };
    });

    return units.sort((a, b) => b.position - a.position);
  }, [enemyDebuffsById, enemyPositionsById, state.enemyCharacters, store, turnCounter]);

  const assignUnitsToLane = (units: FormationUnit[], slotIndices: number[]): Array<FormationUnit | null> => {
    const result: Array<FormationUnit | null> = [null, null, null, null, null];
    const laneUnits = units.slice(0, slotIndices.length);
    laneUnits.forEach((unit, idx) => {
      result[slotIndices[idx]] = unit;
    });
    return result;
  };

  const playerPreset = useMemo(() => getFormationPreset(playerFormationUnits.length), [playerFormationUnits.length]);
  const enemyPreset = useMemo(() => getFormationPreset(enemyFormationUnits.length), [enemyFormationUnits.length]);

  const playerLaneSlots = useMemo(
    () => assignUnitsToLane(playerFormationUnits, playerPreset.slotIndices),
    [playerFormationUnits, playerPreset.slotIndices]
  );
  const enemyLaneSlots = useMemo(
    () => assignUnitsToLane(enemyFormationUnits, enemyPreset.slotIndices),
    [enemyFormationUnits, enemyPreset.slotIndices]
  );

  const selectedEnemyBattlePosition = useMemo(
    () => enemyFormationUnits.find((unit) => unit.id === selectedEnemyInstanceId)?.position ?? selectedEnemyPosition,
    [enemyFormationUnits, selectedEnemyInstanceId, selectedEnemyPosition]
  );

  const battlefieldMarkers = useMemo(
    () => [...playerFormationUnits, ...enemyFormationUnits].map((unit) => {
      let markerPosition = unit.position;

      // Keep lane order and battlefield marker order aligned for player companions.
      if (unit.team === 'player' && unit.tokenLabel.startsWith('F')) {
        const familiarOrder = Number(unit.tokenLabel.slice(1));
        if (!Number.isNaN(familiarOrder) && familiarOrder > 0) {
          markerPosition = playerPosition - familiarOrder * 20;
        }
      }

      return {
        id: unit.id,
        label: unit.tokenLabel,
        position: markerPosition,
        team: unit.team,
        shape: unit.tokenShape,
        accentColor: unit.tokenAccent,
        pulsing: !unit.defeated && highlightedBattlefieldMarkerIds.includes(unit.id),
        imageSrc: unit.markerImageSrc,
        fallbackLabel: unit.markerFallbackLabel,
      };
    }),
    [enemyFormationUnits, playerFormationUnits, highlightedBattlefieldMarkerIds, playerPosition]
  );

  const battlefieldRangePreview = useMemo(() => {
    if (!hoveredActionPreview) {
      return null;
    }

    if (hoveredActionPreview === 'attack') {
      const equippedWeaponId = state.weapons[state.equippedWeaponIndex];
      if (!equippedWeaponId) {
        return null;
      }

      return {
        sourcePosition: playerPosition,
        targetPosition: selectedEnemyBattlePosition,
        range: playerScaledStats.attackRange || 125,
        color: '#7dd3fc',
      };
    }

    if (hoveredActionPreview === 'spell') {
      const equippedSpellId = state.spells[state.equippedSpellIndex];
      const equippedSpell = equippedSpellId ? getSpellById(equippedSpellId) : null;
      if (!equippedSpell) {
        return null;
      }

      return {
        sourcePosition: playerPosition,
        targetPosition: selectedEnemyBattlePosition,
        range: equippedSpell.range || 500,
        color: '#93c5fd',
      };
    }

    if (!selectedItemId) {
      return null;
    }

    const selectedItem = getItemById(selectedItemId);
    const itemRange = selectedItem?.active?.range;
    if (!itemRange || itemRange <= 0) {
      return null;
    }

    return {
      sourcePosition: playerPosition,
      targetPosition: selectedEnemyBattlePosition,
      range: itemRange,
      color: '#fbbf24',
    };
  }, [
    hoveredActionPreview,
    state.weapons,
    state.equippedWeaponIndex,
    state.spells,
    state.equippedSpellIndex,
    selectedItemId,
    playerPosition,
    selectedEnemyBattlePosition,
    playerScaledStats.attackRange,
  ]);

  return (
    <div className={`battle-screen${logExpanded ? ' log-expanded' : ''}`}>
      {/* Character Panels */}
      <div className={`battle-arena ${getTutorialClass(isBattleFocus || isArenaFocus || isBattlefieldFocus)}`}>
        <div className={`battle-arena-track ${getTutorialClass(isBattlefieldFocus)}`}>
          <BattlefieldDisplay
            key={selectedEnemyInstanceId}
            playerPosition={playerPosition}
            enemyPosition={enemyPosition}
            playerName={getCharacterName(playerChar)}
            enemyName={getCharacterName(selectedEnemyChar)}
            playerAttackRange={playerScaledStats.attackRange || 125}
            enemyAttackRange={selectedEnemyScaledStats.attackRange || 125}
            distance={currentDistance}
            aoeIndicators={aoeIndicators}
            markers={battlefieldMarkers}
            highlightedMarkerIds={highlightedBattlefieldMarkerIds}
            rangePreview={battlefieldRangePreview}
          />
        </div>

        <div className="battle-lanes">
          <div className="team-player formation-lane team-player-theme">
            <div className="formation-lane-grid" data-spacing={playerPreset.spacing}>
              {playerLaneSlots.map((slotUnit, slotIndex) => (
                <div
                  key={`player-slot-${slotIndex + 1}`}
                  className={`formation-slot player-slot slot-${slotIndex + 1} ${slotUnit ? 'has-unit' : 'is-empty'} ${slotUnit?.compact ? 'compact-slot' : slotUnit ? 'primary-slot' : ''} ${slotUnit?.heightClass ?? 'h-full'} ${slotUnit?.widthClass ?? 'w-100'}`}
                >
                  {slotUnit && (
                    <div className={`team-status-slot formation-entity-card ${slotUnit.compact ? 'compact-unit-card' : 'primary-unit-card'} ${hoveredPreviewTargetIds.includes(slotUnit.id) ? 'preview-targeted' : ''}`}>
                      <div className={`entity-token-chip team-${slotUnit.team} token-${slotUnit.tokenShape}`} style={{ borderColor: slotUnit.tokenAccent }}>
                        {slotUnit.tokenLabel}
                      </div>
                      {slotUnit.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="team-enemy formation-lane team-enemy-theme">
            <div className="formation-lane-grid" data-spacing={enemyPreset.spacing}>
              {enemyLaneSlots.map((slotUnit, slotIndex) => (
                <div
                  key={`enemy-slot-${slotIndex + 1}`}
                  className={`formation-slot enemy-slot slot-${slotIndex + 1} ${slotUnit ? 'has-unit' : 'is-empty'} ${slotUnit?.compact ? 'compact-slot' : slotUnit ? 'primary-slot' : ''} ${slotUnit?.heightClass ?? 'h-full'} ${slotUnit?.widthClass ?? 'w-100'}`}
                >
                  {slotUnit && (
                    <div
                      className={`team-status-slot enemy-status-slot formation-entity-card enemy-target-panel ${slotUnit.compact ? 'compact-unit-card' : 'primary-unit-card'} ${slotUnit.defeated ? 'defeated' : ''} ${slotUnit.id === selectedEnemyInstanceId ? 'selected' : ''} ${hoveredPreviewTargetIds.includes(slotUnit.id) ? 'preview-targeted' : ''}`}
                    >
                      <div className={`entity-token-chip team-${slotUnit.team} token-${slotUnit.tokenShape}`} style={{ borderColor: slotUnit.tokenAccent }}>
                        {slotUnit.tokenLabel}
                      </div>
                      {slotUnit.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Combat Layout (desktop) */}
      <div className="battle-combat-layout">
        <BattleLogPanel
          battleLog={battleLog}
          isPlayerTurn={isPlayerTurn}
          playerTurnDone={playerTurnDone}
          battleEnded={battleEnded}
          currentAction={currentAction}
          playerName={playerName || ''}
          tutorialClassName={getTutorialClass(isLogFocus)}
          expanded={logExpanded}
          onToggleExpand={() => setLogExpanded(v => !v)}
        />

        <div className={`battle-controls-panel ${getTutorialClass(isActionsFocus)}`}>
          {/* Turn Timeline - key forces full remount on new enemy */}
          {!showSummary && (
            <div className={getTutorialClass(isTimelineFocus)}>
              <TurnTimeline
                key={enemyChar.id}
                turnSequence={turnSequence}
                currentIndex={sequenceIndex}
                playerName={getCharacterName(playerChar)}
                enemyName={getCharacterName(enemyChar)}
                isPlayerTurn={isPlayerTurn}
                stunPeriods={stunPeriods}
                onSimultaneousAction={handleSimultaneousAction}
              />
            </div>
          )}

          {!showSummary && !battleEnded && (
            <div className={`battle-actions-container ${getTutorialClass(isActionsFocus || isSpeedFocus || isMoveFocus || isAttackFocus || isHasteFocus || isItemFocus || isCastFocus)}`}>
              {/* Main Action Row */}
              <div className="main-actions-row">
                {/* Move Section */}
                <div className={`action-section move-section ${getTutorialClass(isSpeedFocus || isMoveFocus)}`}>
                  <div className="section-label">Move</div>
                  <div className="move-buttons-vertical">
                    <button 
                      onClick={() => handlePlayerMove('towards')} 
                      className={`move-btn forward ${!canMove ? 'disabled' : ''} ${canMove && !canPlayerAttack ? 'breathing-yellow' : ''}`}
                      disabled={!canMove}
                      title={canMove ? 'Move forward towards enemy' : 'Wait for your turn'}
                    >
                      <span className="arrow">↑</span>
                      <span className="move-text">Forward</span>
                      <span className="move-dist">{moveDistance}</span>
                    </button>
                    <button 
                      onClick={() => handlePlayerMove('away')} 
                      className={`move-btn backward ${!canMove ? 'disabled' : ''}`}
                      disabled={!canMove}
                      title={canMove ? 'Move back away from enemy' : 'Wait for your turn'}
                    >
                      <span className="arrow">↓</span>
                      <span className="move-text">Back</span>
                      <span className="move-dist">{moveDistance}</span>
                    </button>
                  </div>
                </div>

                {/* Attack Section */}
                <div className={`action-section attack-section ${getTutorialClass(isSpeedFocus || isAttackFocus)}`}>
                  <div className="section-label">Attack</div>
                  <button 
                    onClick={handleAttack} 
                    className={`main-action-btn attack-btn ${!canAttack ? 'disabled' : ''} ${isPlayerTurn && !canPlayerAttack ? 'breathing-red' : ''}`}
                    disabled={!canAttack}
                    title={canAttack ? 'Attack with equipped weapon!' : 'Wait for your attack turn'}
                    onMouseEnter={() => setHoveredActionPreview('attack')}
                    onMouseLeave={() => setHoveredActionPreview(null)}
                  >
                    <span className="action-icon">⚔️</span>
                    <span className="action-text">
                      {(() => {
                        const weaponId = state.weapons[state.equippedWeaponIndex];
                        const weapon = weaponId ? getWeaponById(weaponId) : null;
                        return weapon ? `Attack with ${weapon.name}` : 'Attack';
                      })()}
                    </span>
                    {(() => {
                      const weaponId = state.weapons[state.equippedWeaponIndex];
                      const weapon = weaponId ? getWeaponById(weaponId) : null;
                      const effects = formatWeaponEffects(weapon);
                      return effects.length > 0 ? (
                        <span className="effect-preview">{effects.join(' + ')}</span>
                      ) : null;
                    })()}
                  </button>
                  <WeaponSelector attackRange={playerScaledStats.attackRange} />
                </div>

                {/* Skip Section */}
                <div className={`action-section skip-section ${getTutorialClass(false)}`}>
                  <div className="section-label">Skip</div>
                  <button 
                    onClick={handleSkip} 
                    className={`main-action-btn skip-btn ${!isPlayerTurn ? 'disabled' : ''}`}
                    disabled={!isPlayerTurn}
                    title={isPlayerTurn ? 'Skip this turn' : 'Wait for your turn'}
                  >
                    <span className="action-icon">⏭️</span>
                    <span className="action-text">Skip Turn</span>
                  </button>
                </div>

                {/* Item Section */}
                <div className={`action-section item-section ${getTutorialClass(isHasteFocus || isItemFocus)} ${tutorialActionPromptActive ? 'tutorial-action-choice-highlight' : ''}`}>
                  <div className="section-label">Item</div>
                  <button 
                    onClick={handleUseSelectedItem} 
                    className={`main-action-btn item-btn ${!canSpell || !selectedItemId ? 'disabled' : ''} ${tutorialActionPromptActive ? 'tutorial-action-choice-highlight' : ''}`}
                    disabled={!canSpell || !selectedItemId || blockItemDuringTutorial}
                    title={!canSpell ? 'Wait for your spell turn' : !selectedItemId ? 'Select an item first' : 'Use selected item'}
                    onMouseEnter={() => setHoveredActionPreview('item')}
                    onMouseLeave={() => setHoveredActionPreview(null)}
                  >
                    <span className="action-icon">🧪</span>
                    <span className="action-text">Use Item</span>
                  </button>
                  {/* Item Bar - Always visible */}
                  <ItemBar
                    usableItems={getUsableItems(state.inventory)}
                    onSelectItem={handleSelectItem}
                    selectedItemId={selectedItemId}
                    canUse={canSpell}
                  />
                </div>

                {/* Spell Section */}
                <div className={`action-section spell-section ${getTutorialClass(isHasteFocus || isCastFocus)} ${tutorialActionPromptActive ? 'tutorial-action-choice-highlight' : ''}`}>
                  <div className="section-label">Cast</div>
                  <button 
                    onClick={handleSpell} 
                    className={`main-action-btn spell-btn ${!canSpell && !allowCastTutorialOverride ? 'disabled' : ''} ${tutorialActionPromptActive ? 'tutorial-action-choice-highlight' : ''} ${(() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      const cooldown = spellId ? (state.spellCooldowns[spellId] || 0) : 0;
                      return cooldown > 0 && !allowCastTutorialOverride ? 'on-cooldown' : '';
                    })()}`}
                    disabled={(!canSpell && !allowCastTutorialOverride) || blockSpellDuringTutorial || (() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      return (state.spellCooldowns[spellId] || 0) > 0 && !allowCastTutorialOverride;
                    })()}
                    title={(() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      const cooldown = state.spellCooldowns[spellId] || 0;
                      if (cooldown > 0 && !allowCastTutorialOverride) return `Spell on cooldown (${cooldown} turn${cooldown > 1 ? 's' : ''} remaining)`;
                      if (!canSpell && !allowCastTutorialOverride) return 'Wait for your spell turn';
                      return 'Cast equipped spell!';
                    })()}
                    onMouseEnter={() => setHoveredActionPreview('spell')}
                    onMouseLeave={() => setHoveredActionPreview(null)}
                  >
                    <span className="action-icon">✨</span>
                    <span className="action-text">
                      {(() => {
                        const spellId = state.spells[state.equippedSpellIndex];
                        const spell = spellId ? getSpellById(spellId) : null;
                        const cooldown = spellId ? (state.spellCooldowns[spellId] || 0) : 0;

                        if (cooldown > 0) {
                          return `${cooldown} Turn${cooldown > 1 ? 's' : ''} Cooldown`;
                        }

                        return spell ? `Cast ${spell.name}` : 'Cast Spell';
                      })()}
                    </span>
                    {(() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      const spell = spellId ? getSpellById(spellId) : null;
                      const effects = formatSpellEffects(spell);
                      const cooldown = spellId ? (state.spellCooldowns[spellId] || 0) : 0;

                      // Don't show effects if on cooldown
                      if (cooldown > 0) return null;

                      return effects.length > 0 ? (
                        <span className="effect-preview">{effects.join(' + ')}</span>
                      ) : null;
                    })()}
                  </button>
                  <SpellSelector attackRange={playerScaledStats.attackRange} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Results */}
      {!showSummary && (battleEnded || playerChar.abilities.length > 0) && (
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
        {!battleEnded && playerChar.abilities.length > 0 && (
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
        </div>
      )}
      
      {/* Battle Summary Overlay */}
      {showSummary && (
        <BattleSummary
          resultType={battleResult === 'battle_fled' ? 'battle_fled' : battleResult === 'defeat' ? 'defeat' : 'victory'}
          combatStats={combatStats}
          rewards={summaryRewards || undefined}
          rewardSelection={battleResult === 'reward_selection' && rewardOptions.length > 0 ? {
            options: rewardOptions,
            onSelect: handleRewardSelection,
            onSkip: handleSkipReward,
            onReroll: handleRerollRewards,
            rerollsRemaining: state.rerolls,
            region: state.selectedRegion || undefined,
            enemyIds: currentQuestPath ? flattenEncounterEnemyIds(currentQuestPath.enemyIds) : [],
            playerMagicFind: playerChar.stats.magicFind || 0,
            pathLootType: currentQuestPath?.lootType,
            pathDifficulty: currentQuestPath?.difficulty,
            pathName: currentQuestPath?.name,
          } : undefined}
          runStats={battleResult === 'defeat' ? {
            itemsOwned: state.inventory.length,
            encountersFaced: state.currentFloor,
            unlocksEarned: [], // TODO: Track unlocks from this run
          } : undefined}
          disableAutoContinue={showLootTutorialPrompt}
          rewardTutorialActive={eliteRewardTutorialEnabled}
          rewardTutorialText={eliteRewardTutorialEnabled ? t.tutorial.battle.eliteRewardPrompt : undefined}
          tutorialText={showLootTutorialPrompt ? t.tutorial.battle.loot : undefined}
          onTutorialConfirm={showLootTutorialPrompt ? handleLootTutorialConfirm : undefined}
          onContinue={handleSummaryContinue}
          fleeMessage={
            fleeOutcome === 'enemy_fled'
              ? 'The enemy has fled the battle.'
              : fleeOutcome === 'player_fled'
                ? 'You have fled the battle.'
                : undefined
          }
        />
      )}
    </div>
  );
};