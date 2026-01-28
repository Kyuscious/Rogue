import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../../game/store';
import { CharacterStatus } from '../../entity/CharacterStatus';
import { BattlefieldDisplay, AoEIndicator } from './BattlefieldDisplay';
import { TurnTimeline } from './TurnTimeline';
import { getScaledStats, calculatePhysicalDamage, calculateMagicDamage, rollCriticalStrike, calculateCriticalDamage } from '../../../game/statsSystem';
import { getPassiveIdsFromInventory } from '../../../game/items';
import { calculateOnHitEffects, applyOnHitEffects, formatOnHitEffects } from '../../../game/onHitEffects';
import { calculateCCDuration } from '../../../game/crowdControlSystem';
import { applyForDemaciaBuff, applyDamageWithShield, decayShieldDurations } from '../../../game/shieldSystem';
import { 
  TurnEntity, 
  TurnAction, 
  generateTurnSequence,
  applyStunDelay
} from '../../../game/turnSystemV2';
import { StatusEffect, createStunEffect, createSlowEffect, getSlowModifier } from '../../../game/statusEffects';
import { calculateAoEDirection } from '../../../game/aoeUtils';
import { getCharacterName } from '../../../i18n/helpers';
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
import { WeaponSelector } from './WeaponSelector';
import { SpellSelector } from './SpellSelector';
import { getWeaponById } from '../../../game/weapons';
import { getSpellById } from '../../../game/spells';
import { InventoryItem } from '../../../game/types';
import './Battle.css';

interface BattleProps {
  onBack?: () => void;
  onQuestComplete?: () => void;
}

// Helper function to format weapon effect descriptions
const formatWeaponEffects = (weapon: any) => {
  if (!weapon || !weapon.effects) return [];
  const descriptions: string[] = [];
  
  for (const effect of weapon.effects) {
    if (effect.type === 'damage' && effect.damageScaling) {
      const parts: string[] = [];
      if (effect.damageScaling.attackDamage) parts.push(`${effect.damageScaling.attackDamage}%AD`);
      if (effect.damageScaling.abilityPower) parts.push(`${effect.damageScaling.abilityPower}%AP`);
      if (effect.damageScaling.health) parts.push(`${effect.damageScaling.health}%HP`);
      if (effect.damageScaling.trueDamage) parts.push(`${effect.damageScaling.trueDamage} True`);
      if (parts.length > 0) descriptions.push(`[${parts.join(' + ')}] Dmg`);
    }
    if (effect.type === 'movement' && effect.movementAmount) {
      const dir = effect.movementAmount > 0 ? 'Forward' : 'Back';
      descriptions.push(`[${Math.abs(effect.movementAmount)}] ${dir}`);
    }
  }
  return descriptions;
};

// Helper function to format spell effect descriptions
const formatSpellEffects = (spell: any) => {
  if (!spell || !spell.effects) return [];
  const descriptions: string[] = [];
  
  for (const effect of spell.effects) {
    if (effect.type === 'damage' && effect.damageScaling) {
      const parts: string[] = [];
      if (effect.damageScaling.abilityPower) parts.push(`${effect.damageScaling.abilityPower}%AP`);
      if (effect.damageScaling.attackDamage) parts.push(`${effect.damageScaling.attackDamage}%AD`);
      if (effect.damageScaling.health) parts.push(`${effect.damageScaling.health}%HP`);
      if (effect.damageScaling.trueDamage) parts.push(`${effect.damageScaling.trueDamage} True`);
      if (parts.length > 0) descriptions.push(`[${parts.join(' + ')}] Dmg`);
    }
    if (effect.type === 'heal' && effect.healScaling) {
      const parts: string[] = [];
      if (effect.healScaling.flatAmount) parts.push(`${effect.healScaling.flatAmount}`);
      if (effect.healScaling.abilityPower) parts.push(`${effect.healScaling.abilityPower}%AP`);
      if (effect.healScaling.missingHealth) parts.push(`${effect.healScaling.missingHealth}%Missing HP`);
      if (parts.length > 0) {
        let healText = `[${parts.join(' + ')}] Heal`;
        if (effect.healScaling.lowHealthBonus) {
          healText += ` [<${effect.healScaling.lowHealthBonus.threshold}%HP: x${effect.healScaling.lowHealthBonus.multiplier}]`;
        }
        descriptions.push(healText);
      }
    }
    if (effect.type === 'stun' && effect.duration) {
      descriptions.push(`[${effect.duration} Turn${effect.duration > 1 ? 's' : ''}] Stun`);
    }
    if (effect.type === 'buff' && effect.description) {
      descriptions.push(`[Buff] ${effect.description}`);
    }
  }
  return descriptions;
};

export const Battle: React.FC<BattleProps> = ({ onBack, onQuestComplete }) => {
  const store = useGameStore();
  const state = store.state;
  const { updateEnemyHp, updatePlayerHp, addInventoryItem, addGold, startBattle, consumeInventoryItem, addExperience, useReroll, updateMaxAbilityPower, setCompletedRegion, revealEnemy, decayRevealedEnemies } = store;
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

  // Get equipped weapon and merge its stats with character stats
  const equippedWeaponId = state.weapons[state.equippedWeaponIndex];
  const equippedWeapon = equippedWeaponId ? getWeaponById(equippedWeaponId) : null;
  
  // Create a copy of player stats and apply weapon bonuses
  const playerStatsWithWeapon = { ...playerChar.stats };
  if (equippedWeapon?.stats) {
    // Merge weapon stats into character stats
    (Object.keys(equippedWeapon.stats) as Array<keyof typeof equippedWeapon.stats>).forEach((statKey) => {
      const weaponStatValue = equippedWeapon.stats?.[statKey];
      if (weaponStatValue !== undefined && weaponStatValue !== null) {
        const currentValue = playerStatsWithWeapon[statKey as keyof typeof playerStatsWithWeapon] || 0;
        playerStatsWithWeapon[statKey as keyof typeof playerStatsWithWeapon] = (currentValue + weaponStatValue) as any;
      }
    });
  }

  // Get scaled stats for both characters (with class bonuses, weapon stats, and passives)
  const playerScaledStats = getScaledStats(playerStatsWithWeapon, playerChar.level, playerChar.class, playerPassiveIds);
  // Enemy stats are already scaled at spawn in store.ts, don't recalculate
  const enemyScaledStats = enemyChar.stats;

  // DEBUG: Log weapon stats merge
  console.log('🔫 WEAPON STATS MERGE DEBUG:', {
    equippedWeaponId,
    equippedWeaponName: equippedWeapon?.name,
    equippedWeaponStats: equippedWeapon?.stats,
    playerBaseAD: playerChar.stats.attackDamage,
    playerStatsWithWeaponAD: playerStatsWithWeapon.attackDamage,
    playerScaledAD: playerScaledStats.attackDamage,
  });

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
    // Enemy stats are already scaled at spawn in store.ts, don't recalculate
    const freshEnemyStats = enemyChar.stats;
    
    const pEntity: TurnEntity = {
      id: 'player',
      name: getCharacterName(playerChar),
      attackSpeed: freshPlayerStats.attackSpeed,
      abilityHaste: freshPlayerStats.abilityHaste,
    };

    const eEntity: TurnEntity = {
      id: 'enemy',
      name: getCharacterName(enemyChar),
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
    setSelectedItemId(null); // Reset selected item for new encounter
    setEnemyDebuffs([]); // Reset enemy debuffs for new encounter
    
    // Log cooldown reductions from previous encounter
    const activeCooldowns = Object.entries(state.spellCooldowns);
    if (activeCooldowns.length > 0) {
      const cooldownMessages = activeCooldowns.map(([spellId, cd]) => {
        const spell = getSpellById(spellId);
        return `⏳ ${spell?.name || 'Spell'}: ${cd} turn${cd > 1 ? 's' : ''} remaining`;
      });
      setBattleLog(prev => [...prev, ...cooldownMessages.map(msg => ({ message: msg }))]);
    }
    
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

  // Track active debuffs on enemy (DoTs, armor reduction, etc.)
  const [enemyDebuffs, setEnemyDebuffs] = useState<CombatBuff[]>([]);

  // Track selected item for use
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
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

  // Helper function to reduce spell cooldowns by 1 turn (called per timeline turn)
  const reduceSpellCooldowns = () => {
    useGameStore.setState((store) => {
      const currentCooldowns = store.state.spellCooldowns;
      const updatedCooldowns: Record<string, number> = {};
      
      for (const [spellId, cooldown] of Object.entries(currentCooldowns)) {
        if ((cooldown as number) > 1) {
          updatedCooldowns[spellId] = (cooldown as number) - 1;
        }
        // If cooldown is 1, it will be removed (spell is ready next turn)
      }
      
      console.log('🔄 Reducing spell cooldowns (timeline turn):', { before: currentCooldowns, after: updatedCooldowns });
      
      return {
        state: {
          ...store.state,
          spellCooldowns: updatedCooldowns,
        },
      };
    });
    
    // Also reduce weapon cooldowns
    setWeaponCooldowns(prev => {
      const updated: Record<string, number> = {};
      for (const [weaponId, cooldown] of Object.entries(prev)) {
        if (cooldown > 1) {
          updated[weaponId] = cooldown - 1;
        }
      }
      console.log('🔄 Reducing weapon cooldowns (timeline turn):', { before: prev, after: updated });
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
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} has no weapon equipped!` },
      ]);
      return;
    }
    
    // Check weapon cooldown
    const weaponCooldown = weaponCooldowns[equippedWeaponId] || 0;
    if (weaponCooldown > 0) {
      console.log('❌ Weapon on cooldown, blocking attack');
      setBattleLog((prev) => [
        ...prev,
        { message: `⏰ ${equippedWeapon.name} is on cooldown (${weaponCooldown} turn${weaponCooldown > 1 ? 's' : ''} remaining)!` },
      ]);
      return;
    }
    
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
    
    // Calculate damage based on weapon effects
    let totalDamage = 0;
    const logMessages: Array<{ message: string }> = [];
    
    for (const effect of equippedWeapon.effects) {
      if (effect.type === 'damage' && effect.damageScaling) {
        let baseDamage = 0;
        
        // Calculate base damage from scaling
        if (effect.damageScaling.attackDamage) {
          baseDamage += playerScaledStats.attackDamage * (effect.damageScaling.attackDamage / 100);
        }
        if (effect.damageScaling.abilityPower) {
          baseDamage += playerScaledStats.abilityPower * (effect.damageScaling.abilityPower / 100);
        }
        if (effect.damageScaling.health) {
          baseDamage += playerScaledStats.health * (effect.damageScaling.health / 100);
        }
        
        // Log damage calculation debug info
        console.log('💥 DAMAGE CALCULATION DEBUG:', {
          weaponName: equippedWeapon.name,
          playerScaledAD: playerScaledStats.attackDamage,
          playerScaledAP: playerScaledStats.abilityPower,
          damageScaling: effect.damageScaling,
          baseDamageBeforeReductions: baseDamage,
          enemyArmor: enemyScaledStats.armor,
        });
        
        // Check for critical strike
        let isCrit = false;
        if (rollCriticalStrike(playerScaledStats.criticalChance || 0)) {
          baseDamage = calculateCriticalDamage(baseDamage, playerScaledStats.criticalDamage || 200);
          isCrit = true;
        }
        
        // Apply enemy armor mitigation for physical damage (AD scaling)
        let finalDamage = baseDamage;
        if (effect.damageScaling.attackDamage) {
          finalDamage = calculatePhysicalDamage(
            baseDamage,
            enemyScaledStats.armor || 0,
            playerScaledStats.lethality || 0
          );
          console.log('🛡️ ARMOR MITIGATION:', {
            baseDamage,
            enemyArmor: enemyScaledStats.armor,
            finalDamageAfterArmor: finalDamage,
          });
        }
        
        // Add true damage (bypasses resistances)
        if (effect.damageScaling.trueDamage) {
          finalDamage += effect.damageScaling.trueDamage;
        }
        
        totalDamage += finalDamage;
        
        if (isCrit) {
          logMessages.push({ message: `💥 CRITICAL HIT! ${playerChar.name} attacks with ${equippedWeapon.name} for ${Math.round(finalDamage)} damage!` });
        } else {
          logMessages.push({ message: `${playerChar.name} attacks with ${equippedWeapon.name} for ${Math.round(finalDamage)} damage!` });
        }
      }
      
      // Handle movement effects
      if (effect.type === 'movement' && effect.movementAmount) {
        const direction = effect.movementAmount > 0 ? 'towards' : 'away';
        const distance = Math.abs(effect.movementAmount);
        const newPosition = direction === 'towards' 
          ? playerPosition + distance
          : playerPosition - distance;
        setPlayerPosition(newPosition);
        logMessages.push({ message: `${playerChar.name} moves ${direction} by ${distance} units!` });
      }
    }
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - totalDamage);
    updateEnemyHp(0, newEnemyHp);

    // Check for Hemorrhage debuff (Delverhold Greateaxe)
    if (equippedWeaponId === 'delverhold_greateaxe' && newEnemyHp > 0) {
      setEnemyDebuffs((prevDebuffs) => {
        const hemorrhageDebuffs = prevDebuffs.filter(d => d.id.startsWith('hemorrhage'));
        const stackCount = hemorrhageDebuffs.length;
        
        if (stackCount < 5) {
          // Add new stack
          const damagePerTurn = playerScaledStats.attackDamage * 0.30;
          logMessages.push({ message: `🩸 Hemorrhage applied! (Stack ${stackCount + 1}/5) - ${Math.round(damagePerTurn)} damage/turn` });
          return [
            ...prevDebuffs,
            {
              id: `hemorrhage_${Date.now()}`,
              name: 'Hemorrhage',
              stat: 'attackDamage', // Using as damage source reference
              amount: damagePerTurn,
              duration: 6, // 5 turns + 1 for partial turn (Hybrid Timing Model)
              type: 'instant',
            } as CombatBuff,
          ];
        } else {
          // At max stacks (5), refresh duration of all stacks
          logMessages.push({ message: `🩸 Hemorrhage refreshed! (5/5 stacks) - ${Math.round(playerScaledStats.attackDamage * 1.50)} damage/turn` });
          return prevDebuffs.map(d => 
            d.id.startsWith('hemorrhage') 
              ? { ...d, duration: 6 } // Refresh to 5 turns + 1 for partial turn
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
        enemyChar,
        totalDamage,
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
          const enemyTenacity = enemyChar.stats.tenacity || 0;
          const effectiveDuration = calculateCCDuration(baseDuration, enemyTenacity, 'stun');
          
          console.log(`[STUN WEAPON] Applying stun: base=${baseDuration}, tenacity=${enemyTenacity}, effective=${effectiveDuration}`);
          
          // Only apply stun if effective duration > 0 (not immune due to 100 tenacity)
          if (effectiveDuration > 0) {
            // Apply stun immediately (no cast time for weapon attacks)
            setTurnSequence(prev => applyStunDelay(prev, 'enemy', effectiveDuration, currentTime));
            
            // Track stun period for timeline visualization
            const stunStartTime = currentTime;
            const stunEndTime = currentTime + effectiveDuration;
            console.log(`🔵 STUN WEAPON: Adding stun period from ${stunStartTime.toFixed(2)} to ${stunEndTime.toFixed(2)} (duration: ${effectiveDuration})`);
            setStunPeriods(prev => [...prev, {
              entityId: 'enemy',
              entityName: getCharacterName(enemyChar),
              startTime: stunStartTime,
              endTime: stunEndTime,
            }]);
            
            // Add stunned debuff for visual indicator
            setEnemyDebuffs((prevDebuffs) => [
              ...prevDebuffs,
              {
                id: `stunned_${Date.now()}`,
                name: `Stunned (${stunStartTime.toFixed(2)}>${stunEndTime.toFixed(2)})`,
                stat: 'health', // Use health as placeholder to avoid stat display issues
                amount: 0, // Zero amount so no stat change shows
                duration: Math.ceil(effectiveDuration) + 1, // Duration for visual display
                type: 'instant',
              } as CombatBuff,
            ]);
            
            logMessages.push({ message: `💫 ${enemyChar.name} is stunned for ${effectiveDuration} turn(s)!` });
          } else {
            logMessages.push({ message: `🛡️ ${enemyChar.name}'s tenacity (${enemyTenacity}) negates the stun!` });
          }
        }
      }
    }
    
    // Check for Life Draining passive (Doran's Blade)
    if (playerPassiveIds.includes('life_draining')) {
      const baseAD = playerChar.stats.attackDamage || 50;
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyLifeDrainingBuff(prev, baseAD);
        const oldBuff = prev.find((b) => b.id.startsWith('life_draining'));
        const newBuff = updatedBuffs.find((b) => b.id.startsWith('life_draining'));
        if (!oldBuff || (newBuff && newBuff.amount !== oldBuff.amount)) {
          logMessages.push({ message: `⚔️ Life Draining: +${Math.floor(baseAD * 0.01)} AD!` });
        }
        return updatedBuffs;
      });
    }
    
    setBattleLog((prev) => [...prev, ...logMessages]);
    
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
      setTurnSequence(generateTurnSequence(playerEntity, enemyEntity, 20));
      setSequenceIndex(0);
    }
  };

  const handleSpell = () => {
    if (!playerEntity || !enemyEntity) return;
    
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
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} has no spell equipped!` },
      ]);
      return;
    }
    
    // Check cooldown
    const cooldownRemaining = state.spellCooldowns[equippedSpellId] || 0;
    if (cooldownRemaining > 0) {
      console.log('❌ Spell on cooldown, blocking cast');
      setBattleLog((prev) => [
        ...prev,
        { message: `${equippedSpell.name} is on cooldown! (${cooldownRemaining} turn${cooldownRemaining > 1 ? 's' : ''} remaining)` },
      ]);
      return;
    }
    
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
    
    // Calculate damage/effects based on spell
    let totalDamage = 0;
    let totalHealing = 0;
    const logMessages: Array<{ message: string }> = [];
    
    for (const effect of equippedSpell.effects) {
      if (effect.type === 'damage' && effect.damageScaling) {
        let baseDamage = 0;
        
        // Calculate base damage from scaling
        if (effect.damageScaling.abilityPower) {
          baseDamage += playerScaledStats.abilityPower * (effect.damageScaling.abilityPower / 100);
        }
        if (effect.damageScaling.attackDamage) {
          baseDamage += playerScaledStats.attackDamage * (effect.damageScaling.attackDamage / 100);
        }
        if (effect.damageScaling.health) {
          baseDamage += playerScaledStats.health * (effect.damageScaling.health / 100);
        }
        
        // Apply enemy magic resist mitigation for magic damage (AP scaling)
        let finalDamage = baseDamage;
        if (effect.damageScaling.abilityPower) {
          finalDamage = calculateMagicDamage(
            baseDamage,
            enemyScaledStats.magicResist || 0,
            playerScaledStats.magicPenetration || 0
          );
        }
        
        // Add true damage (bypasses resistances)
        if (effect.damageScaling.trueDamage) {
          finalDamage += effect.damageScaling.trueDamage;
        }
        
        totalDamage += finalDamage;
        logMessages.push({ message: `${playerChar.name} casts ${equippedSpell.name} for ${Math.round(finalDamage)} magic damage!` });
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
        const enemyTenacity = enemyChar.stats.tenacity || 0;
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
            logMessages.push({ message: `💫 ${playerChar.name} stuns ${enemyChar.name} for ${effectiveDuration} turn(s)!` });
            // Apply stun immediately if no cast time
            setTurnSequence(prev => applyStunDelay(prev, 'enemy', effectiveDuration, currentTime));
          }
        } else {
          logMessages.push({ message: `❌ ${enemyChar.name} is out of range! (${Math.round(currentDistance)} > ${spellRange})` });
        }
        } else {
          logMessages.push({ message: `🛡️ ${enemyChar.name}'s tenacity (${enemyTenacity}) negates the stun!` });
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
          const enemyBaseMovement = enemyScaledStats.movementSpeed || 350;
          const flatReduction = Math.round(enemyBaseMovement * (slowPercent / 100));
          
          // Also add as CombatBuff for display and stat modification
          const slowDebuff: CombatBuff = {
            id: `slow_${Date.now()}`,
            name: `Slowed (${slowPercent}%)`,
            stat: 'movementSpeed',
            amount: -flatReduction, // Negative flat amount for debuff
            duration: slowDuration,
            durationType: 'turns',
          };
          setEnemyDebuffs(prev => [...prev, slowDebuff]);
          
          logMessages.push({ message: `🐌 ${enemyChar.name} is slowed by ${slowPercent}% for ${slowDuration} turn(s)!` });
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
          
          // Add combat buff for display
          const adBonus = Math.round(playerScaledStats.attackDamage * 0.05);
          const combatBuff: CombatBuff = {
            id: uniqueId,
            name: 'For Demacia!',
            stat: 'attackDamage',
            amount: adBonus,
            duration: 2, // 2 turns: current turn + next turn
            durationType: 'turns',
          };
          setPlayerBuffs(prev => [...prev, combatBuff]);
          
          logMessages.push({ message: `🛡️ ${playerChar.name} gains +${adBonus} AD and ${buff.shieldAmount} shield for 1 turn!` });
        }
      }
    }
    
    // Update enemy HP if damage was dealt
    if (totalDamage > 0) {
      const newEnemyHp = Math.max(0, enemyChar.hp - totalDamage);
      updateEnemyHp(0, newEnemyHp);
      
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
      setPlayerBuffs((prev) => {
        const updatedBuffs = applyDrainBuff(prev, baseAP);
        const oldBuff = prev.find((b) => b.id.startsWith('drain'));
        const newBuff = updatedBuffs.find((b) => b.id.startsWith('drain'));
        if (!oldBuff || (newBuff && newBuff.amount !== oldBuff.amount)) {
          logMessages.push({ message: `✨ Drain: +${Math.floor(baseAP * 0.01)} AP!` });
        }
        return updatedBuffs;
      });
    }
    
    setBattleLog((prev) => [...prev, ...logMessages]);
    
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
    if (newPosition > 1500 || newPosition < -1500) {
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
      setBattleLog((prev) => [
        ...prev,
        { message: `${item.name} cannot be used in battle!` },
      ]);
      return;
    }
    
    // Handle specific item effects
    if (selectedItemId === 'health_potion') {
      const newBuff = createHealthPotionBuff(`buff-${Date.now()}`);
      setPlayerBuffs((prev) => [...prev, newBuff]);
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} used ${item.name}! Restoring 10 HP per turn for 5 turns.` },
      ]);
      
      // Consume the item from inventory
      consumeInventoryItem(selectedItemId);
    } else if (selectedItemId === 'stealth_ward') {
      // Stealth Ward: Reveal enemy stats for current encounter only (1 turn remaining after this battle)
      for (const enemy of state.enemyCharacters) {
        revealEnemy(enemy.id, 1);
      }
      
      setBattleLog((prev) => [
        ...prev,
        { message: `👁️ ${playerChar.name} placed a Stealth Ward! Enemy stats are now revealed!` },
      ]);
      
      consumeInventoryItem(selectedItemId);
    } else if (selectedItemId === 'control_ward') {
      // Control Ward: Reveal enemy stats for 3 encounters (current + next 2)
      for (const enemy of state.enemyCharacters) {
        revealEnemy(enemy.id, 3);
      }
      
      setBattleLog((prev) => [
        ...prev,
        { message: `👁️ ${playerChar.name} placed a Control Ward! Enemy stats will be revealed for the next 3 encounters!` },
      ]);
      
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
        setBattleLog((prev) => [
          ...prev,
          { message: `❌ Enemy is out of range! (${currentDistance} > ${trapRange})` },
        ]);
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
      
      setBattleLog((prev) => [
        ...prev,
        { message: `💣 ${playerChar.name} placed a Flashbomb Trap! It will activate in ${setupTime} turn(s).` },
      ]);
      
      // Consume the item from inventory
      consumeInventoryItem(selectedItemId);
    } else {
      // Fallback for other items
      const newBuff = createBuffFromItem(selectedItemId, `buff-${Date.now()}`);
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
      consumeInventoryItem(selectedItemId);
    }
    
    // Clear selected item after using
    setSelectedItemId(null);
    
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
    
    // Calculate enemy movement speed with debuffs
    const baseEnemyMovement = Math.floor((enemyScaledStats.movementSpeed || 350) / 10);
    const slowModifier = getSlowModifier(_statusEffects, 'enemy', turnSequence[sequenceIndex]?.time || 0);
    const enemyMoveDistance = Math.max(1, Math.floor(baseEnemyMovement * slowModifier));
    
    // Out of range, so move towards player
    let newPosition = enemyPosition + enemyMoveDistance;
    
    // Check if enemy would escape
    if (newPosition > 2500 || newPosition < -2500) {
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
      { message: `${enemyChar.name} moved towards by ${enemyMoveDistance} units. Distance: ${newDistance}` },
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
      
      // Update player HP using shield-aware damage
      const damageResult = applyDamageWithShield(playerChar, finalDamage);
      updatePlayerHp(playerChar.hp);
      
      // Track damage taken for combat stats
      if (finalDamage > combatStats.highestDamageTaken) {
        setCombatStats(prev => ({
          ...prev,
          highestDamageTaken: Math.round(finalDamage),
          highestDamageTakenSource: 'attack',
        }));
      }
      
      // Log shield damage if any
      if (damageResult.shieldDamage > 0) {
        setBattleLog((prev) => [
          ...prev,
          { message: `🛡️ Shield absorbed ${damageResult.shieldDamage} damage!` },
        ]);
      }
      
      // IMMEDIATE DEATH CHECK: End battle instantly if player dies
      if (playerChar.hp <= 0 && !battleEnded) {
        setBattleEnded(true);
        setBattleResult('defeat');
        setShowSummary(true);
        return; // Stop processing this turn
      }
      
      // INSTANT DEATH CHECK: If player HP is 0, they're dead - no buffs applied
      if (playerChar.hp > 0 && playerPassiveIds.includes('enduring_focus')) {
        setPlayerBuffs((prev) => {
          const updatedBuffs = applyEnduringFocusBuff(prev, finalDamage);
          return updatedBuffs;
        });
      }
      
      if (isCrit) {
        setBattleLog((prev) => [
          ...prev,
          { message: `💥 CRITICAL HIT! ${enemyChar.name} attacks ${playerChar.name} for ${finalDamage} damage!` },
          ...(playerChar.hp > 0 && playerPassiveIds.includes('enduring_focus') 
            ? [{ message: `🛡️ Enduring Focus: Healing ${Math.floor((finalDamage * 0.05) / 3)} HP per turn for 3 turns!` }]
            : []),
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          { message: `${enemyChar.name} attacks ${playerChar.name} for ${finalDamage} damage!` },
          ...(playerChar.hp > 0 && playerPassiveIds.includes('enduring_focus') 
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
      
      // Update player HP using shield-aware damage
      const damageResult = applyDamageWithShield(playerChar, finalDamage);
      updatePlayerHp(playerChar.hp);
      
      // Track damage taken for combat stats
      if (finalDamage > combatStats.highestDamageTaken) {
        setCombatStats(prev => ({
          ...prev,
          highestDamageTaken: Math.round(finalDamage),
          highestDamageTakenSource: 'spell',
        }));
      }
      
      // Log shield damage if any
      if (damageResult.shieldDamage > 0) {
        setBattleLog((prev) => [
          ...prev,
          { message: `🛡️ Shield absorbed ${damageResult.shieldDamage} damage!` },
        ]);
      }
      
      // IMMEDIATE DEATH CHECK: End battle instantly if player dies
      if (playerChar.hp <= 0 && !battleEnded) {
        setBattleEnded(true);
        setBattleResult('defeat');
        setShowSummary(true);
        return; // Stop processing this turn
      }
      
      // INSTANT DEATH CHECK: If player HP is 0, they're dead - no buffs applied
      if (playerChar.hp > 0 && playerPassiveIds.includes('enduring_focus')) {
        setPlayerBuffs((prev) => {
          const updatedBuffs = applyEnduringFocusBuff(prev, finalDamage);
          return updatedBuffs;
        });
      }
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${enemyChar.name} casts a spell on ${playerChar.name} for ${finalDamage} magic damage!` },
        ...(playerChar.hp > 0 && playerPassiveIds.includes('enduring_focus') 
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
          
          setBattleLog(prev => [
            ...prev,
            { message: `💥 Flashbomb Trap activated! ${enemyChar.name} is stunned!` }
          ]);
          
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
        setBattleLog(prev => [
          ...prev,
          { message: `💫 ${targetName} is stunned for ${stun.duration} turn(s)!` }
        ]);
      });
      
      // Remove applied stuns from pending list
      setPendingStuns(prev => prev.filter(stun => currentTime < stun.currentTime));
    }
  }, [sequenceIndex, turnSequence, pendingStuns, playerChar.name, enemyChar.name]);

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
  // TIMING MODEL - Hybrid:
  // - Instant effects (damage, healing): Apply immediately at action time
  // - Duration effects (buffs, DoTs, cooldowns): Tick at integer turns only
  // This ensures predictable countdowns while maintaining responsive instant effects
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
          const newPlayerHp = Math.min(Math.round(playerChar.hp + regenAmount), Math.round(playerScaledStats.health));
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
          const newPlayerHp = Math.min(Math.round(playerChar.hp + healingAmount), Math.round(playerScaledStats.health));
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
      
      // Process StatusEffect durations and shield removal (always, not just when buffs exist)
      if (playerChar && playerChar.effects && playerChar.effects.length > 0) {
        // First decrement all durations
        playerChar.effects = playerChar.effects.map(effect => ({
          ...effect,
          duration: effect.duration - 1,
        }));
        
        // Filter out all expired effects
        playerChar.effects = playerChar.effects.filter(e => e.duration > 0);
      }
      
      // Decay shield durations at turn boundaries (removes expired shields)
      if (playerChar) {
        const beforeShields = playerChar.shields?.map(s => ({
          id: s.id,
          duration: s.duration,
        })) || [];
        
        decayShieldDurations(playerChar);
        
        const afterShields = playerChar.shields?.map(s => ({
          id: s.id,
          duration: s.duration,
        })) || [];
        
        console.log('🛡️ SHIELD DECAY:', {
          before: beforeShields,
          after: afterShields,
          removed: beforeShields.filter((b: any) => !afterShields.some((a: any) => a.id === b.id)).length,
        });
        
        // Force update the store so React detects the shield changes
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
      
      // Reduce spell cooldowns once per timeline turn
      reduceSpellCooldowns();
      
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

      // Apply damage-over-time debuffs to enemy (e.g., Hemorrhage)
      if (enemyDebuffs.length > 0 && enemyChar && enemyChar.hp > 0) {
        // Calculate Hemorrhage damage (stacking DoT)
        const hemorrhageDebuffs = enemyDebuffs.filter(d => d.id.startsWith('hemorrhage'));
        if (hemorrhageDebuffs.length > 0) {
          const totalDamage = hemorrhageDebuffs.reduce((sum, debuff) => sum + debuff.amount, 0);
          const damageAmount = Math.max(1, Math.floor(totalDamage));
          const newEnemyHp = Math.max(0, enemyChar.hp - damageAmount);
          const actualDamage = enemyChar.hp - newEnemyHp;
          if (actualDamage > 0) {
            updateEnemyHp(0, newEnemyHp);
            newLogMessages.push({ message: `🩸 ${enemyChar.name} takes ${actualDamage} damage from Hemorrhage (${hemorrhageDebuffs.length} stack${hemorrhageDebuffs.length > 1 ? 's' : ''})` });
          }

          // Check for immediate death from DoT
          if (newEnemyHp <= 0 && !battleEnded) {
            // Enemy died from bleeding - victory will be handled by the victory check useEffect
          }
        }

        // Decay debuff durations
        setEnemyDebuffs((prevDebuffs) => 
          prevDebuffs
            .map(debuff => ({ ...debuff, duration: debuff.duration - 1 }))
            .filter(debuff => debuff.duration > 0)
        );
      }
      
      setBattleLog((prev) => [...prev, ...newLogMessages]);
      setLastLoggedTurn(currentTurn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCounter, lastLoggedTurn, playerBuffs, enemyDebuffs]);

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
        state.originalEnemyQueue.slice(1), // Use original unprocessed enemies
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
      const messages = getVictoryMessages(getCharacterName(enemyChar), victoryResult);
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
          playerName={getCharacterName(playerChar)}
          enemyName={getCharacterName(enemyChar)}
          playerAttackRange={playerScaledStats.attackRange || 125}
          enemyAttackRange={enemyScaledStats.attackRange || 125}
          distance={currentDistance}
          vertical={true}
          aoeIndicators={aoeIndicators}
        />
        
        <div className="team-enemy">
          <CharacterStatus characterId={enemyChar.id} combatDebuffs={enemyDebuffs} isRevealed={store.isEnemyRevealed(enemyChar.id)} />
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
          playerName={getCharacterName(playerChar)}
          enemyName={getCharacterName(enemyChar)}
          isPlayerTurn={isPlayerTurn}
          stunPeriods={stunPeriods}
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
            <div className="battle-actions-container">
              {/* Main Action Row */}
              <div className="main-actions-row">
                {/* Move Section */}
                <div className="action-section move-section">
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
                <div className="action-section attack-section">
                  <div className="section-label">Attack</div>
                  <button 
                    onClick={handleAttack} 
                    className={`main-action-btn attack-btn ${!canAttack ? 'disabled' : ''} ${isPlayerTurn && !canPlayerAttack ? 'breathing-red' : ''}`}
                    disabled={!canAttack}
                    title={canAttack ? 'Attack with equipped weapon!' : 'Wait for your attack turn'}
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
                <div className="action-section skip-section">
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

                {/* Spell Section */}
                <div className="action-section spell-section">
                  <div className="section-label">Cast</div>
                  <button 
                    onClick={handleSpell} 
                    className={`main-action-btn spell-btn ${!canSpell ? 'disabled' : ''} ${(() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      const cooldown = spellId ? (state.spellCooldowns[spellId] || 0) : 0;
                      return cooldown > 0 ? 'on-cooldown' : '';
                    })()}`}
                    disabled={!canSpell || (() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      return (state.spellCooldowns[spellId] || 0) > 0;
                    })()}
                    title={(() => {
                      const spellId = state.spells[state.equippedSpellIndex];
                      const cooldown = state.spellCooldowns[spellId] || 0;
                      if (cooldown > 0) return `Spell on cooldown (${cooldown} turn${cooldown > 1 ? 's' : ''} remaining)`;
                      if (!canSpell) return 'Wait for your spell turn';
                      return 'Cast equipped spell!';
                    })()}
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

                {/* Item Section */}
                <div className="action-section item-section">
                  <div className="section-label">Item</div>
                  <button 
                    onClick={handleUseSelectedItem} 
                    className={`main-action-btn item-btn ${!canSpell || !selectedItemId ? 'disabled' : ''}`}
                    disabled={!canSpell || !selectedItemId}
                    title={!canSpell ? 'Wait for your spell turn' : !selectedItemId ? 'Select an item first' : 'Use selected item'}
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
              </div>
              
              {/* Removed separate item-bar-container - now inside item-section */}
            </div>
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