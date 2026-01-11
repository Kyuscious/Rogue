import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../../game/store';
import { CharacterStatus } from '../../entity/CharacterStatus';
import { BattlefieldDisplay } from './BattlefieldDisplay';
import { TurnTimeline } from './TurnTimeline';
import { getScaledStats } from '../../../game/statsSystem';
import { getRandomLootByClass, getPassiveIdsFromInventory } from '../../../game/items';
import { 
  TurnEntity, 
  TurnAction, 
  generateTurnSequence
} from '../../../game/turnSystemV2';
import { 
  getItemById,
  createBuffFromItem,
  getUsableItems
} from '../../../game/itemSystem';
import './Battle.css';

interface BattleProps {
  onBack?: () => void;
}

export const Battle: React.FC<BattleProps> = ({ onBack }) => {
  const { state, updateEnemyHp, updatePlayerHp, addInventoryItem, addGold, startBattle } = useGameStore();
  const playerName = state.username;
  const [playerTurnDone, setPlayerTurnDone] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'reward_selection' | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);
  
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
    const pEntity: TurnEntity = {
      id: 'player',
      name: playerChar.name,
      attackSpeed: playerScaledStats.attackSpeed,
      abilityHaste: playerScaledStats.abilityHaste,
    };

    const eEntity: TurnEntity = {
      id: 'enemy',
      name: enemyChar.name,
      attackSpeed: enemyScaledStats.attackSpeed,
      abilityHaste: enemyScaledStats.abilityHaste,
    };

    setPlayerEntity(pEntity);
    setEnemyEntity(eEntity);
    setTurnSequence(generateTurnSequence(pEntity, eEntity, 20));
    
    // Reset battle state for new encounter
    setTurnCounter(0);
    setSequenceIndex(0);
    setPlayerTurnDone(false);
    setBattleEnded(false);
    setBattleResult(null);
    setBattleLog([{ message: 'Battle started!' }, { message: '---' }]);
    setLastLoggedTurn(0);
    
    // Reset positions for new encounter
    setPlayerPosition(50);
    setEnemyPosition(-50);
  }, [enemyChar.id]);

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
    const damage = playerScaledStats.attackDamage;
    
    // Apply enemy armor mitigation (simplified formula)
    const mitigatedDamage = Math.max(1, Math.floor(damage * (100 / (100 + (enemyScaledStats.armor || 0)))));
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - mitigatedDamage);
    updateEnemyHp(0, newEnemyHp);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${playerChar.name} attacks ${enemyChar.name} for ${mitigatedDamage} damage!` },
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
    const spellDamage = playerScaledStats.abilityPower;
    
    // Apply enemy magic resist mitigation (simplified formula)
    const mitigatedDamage = Math.max(1, Math.floor(spellDamage * (100 / (100 + (enemyScaledStats.magicResist || 0)))));
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - mitigatedDamage);
    updateEnemyHp(0, newEnemyHp);
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${playerChar.name} casts a spell on ${enemyChar.name} for ${mitigatedDamage} magic damage!` },
    ]);
    
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
    
    // Create buff from item
    const newBuff = createBuffFromItem(itemId, `buff-${Date.now()}`);
    if (!newBuff) {
      setBattleLog((prev) => [
        ...prev,
        { message: `${item.name} has no usable effects!` },
      ]);
      return;
    }
    
    setBattleLog((prev) => [
      ...prev,
      { message: `${playerChar.name} used ${item.name}! +${newBuff.amount} ${newBuff.stat} for ${newBuff.duration} turns!` },
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
      
      const enemyDamage = enemyScaledStats.attackDamage;
      
      // Apply player armor mitigation
      const mitigatedDamage = Math.max(1, Math.floor(enemyDamage * (100 / (100 + (playerScaledStats.armor || 0)))));
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - mitigatedDamage);
      updatePlayerHp(newPlayerHp);
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${enemyChar.name} attacks ${playerChar.name} for ${mitigatedDamage} damage!` },
      ]);
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
      
      const enemySpellDamage = enemyScaledStats.abilityPower;
      
      // Apply player magic resist mitigation
      const mitigatedDamage = Math.max(1, Math.floor(enemySpellDamage * (100 / (100 + (playerScaledStats.magicResist || 0)))));
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - mitigatedDamage);
      updatePlayerHp(newPlayerHp);
      
      setBattleLog((prev) => [
        ...prev,
        { message: `${enemyChar.name} casts a spell on ${playerChar.name} for ${mitigatedDamage} magic damage!` },
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

  // Reset battle state when new enemy is loaded
  useEffect(() => {
    setBattleEnded(false);
    setBattleResult(null);
    setSequenceIndex(0);
    setTurnCounter(0);
    // Don't reset player HP here - preserve damage from previous battles
  }, [enemyChar.id]);

  // Apply turn-based effects every turn
  useEffect(() => {
    const currentTurn = Math.ceil(turnCounter);
    if (turnCounter > 0 && currentTurn > lastLoggedTurn && turnCounter % 1 === 0) {
      // Turn-based effects trigger at each integer turn count
      // This is where you could add bleed damage, poison, etc.
      setBattleLog((prev) => [
        ...prev,
        { message: `--- Turn ${currentTurn} ---` },
      ]);
      setLastLoggedTurn(currentTurn);
    }
  }, [turnCounter, lastLoggedTurn]);

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
    if (enemyChar.hp <= 0 && !battleEnded) {
      setBattleEnded(true);
      
      // Drop loot based on enemy tier (not level - level only affects stats)
      const tierForLoot = enemyChar.tier || 'minion';
      const lootItem = getRandomLootByClass(enemyChar.class, tierForLoot);
      if (lootItem) {
        addInventoryItem({ itemId: lootItem.id, quantity: 1 });
        
        // If item has HP, heal the player by that amount
        if (lootItem.stats.health) {
          const healthGain = lootItem.stats.health;
          const newHp = Math.min(playerChar.hp + healthGain, playerScaledStats.health + healthGain);
          updatePlayerHp(newHp);
          setBattleLog((prev) => [
            ...prev,
            { message: `${enemyChar.name} defeated!` },
            { message: `🎁 Obtained: ${lootItem.name}` },
            { message: `💚 Gained ${healthGain} HP from item` },
          ]);
        } else {
          setBattleLog((prev) => [
            ...prev,
            { message: `${enemyChar.name} defeated!` },
            { message: `🎁 Obtained: ${lootItem.name}` },
          ]);
        }
      } else {
        setBattleLog((prev) => [
          ...prev,
          { message: `${enemyChar.name} defeated!` },
        ]);
      }
      
      // Add gold reward
      addGold(10);
      setBattleLog((prev) => [
        ...prev,
        { message: `+10 Gold` },
      ]);
      
      // Check encounter number for reward selection (5 and 10)
      const currentEncounter = state.currentFloor;
      if (currentEncounter === 5 || currentEncounter === 10) {
        // Show reward selection screen instead of auto-advancing
        setBattleResult('reward_selection');
      } else {
        // Auto-load next enemy after 1.5 seconds
        setTimeout(() => {
          const remainingEnemies = state.enemyCharacters.slice(1); // Get all enemies after current
          if (remainingEnemies.length > 0) {
            // More enemies in this quest path - start battle with remaining enemies
            startBattle(remainingEnemies);
          } else {
            // All enemies defeated in this quest path - show quest complete
            setBattleResult('victory');
          }
        }, 1500);
      }
    } else if (playerChar.hp <= 0 && !battleEnded) {
      setBattleEnded(true);
      setBattleResult('defeat');
      setBattleLog((prev) => [
        ...prev,
        { message: `${playerChar.name} has been defeated...` },
      ]);
    }
  }, [enemyChar.hp, battleEnded]);

  // Get current turn info
  const currentAction = turnSequence[sequenceIndex];
  const currentActor = currentAction?.entityId === 'player' ? 'P' : 'E';
  const isPlayerTurn = currentActor === 'P' && !playerTurnDone && !battleEnded;
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
          <CharacterStatus />
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

      {/* Turn Timeline */}
      <TurnTimeline
        turnSequence={turnSequence}
        currentIndex={sequenceIndex}
        playerName={playerChar.name}
        enemyName={enemyChar.name}
        isPlayerTurn={isPlayerTurn}
        onSimultaneousAction={handleSimultaneousAction}
      />

      {/* Action Buttons */}
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
            <h2>❌ Defeat!</h2>
            <button className="action-btn" onClick={() => window.location.reload()}>
              Return to Map
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

              {/* Right Section - Spell and Item */}
              <div className="button-section right">
                <button 
                  onClick={handleSpell} 
                  className={`action-btn spell-btn ${!canSpell ? 'disabled' : ''}`}
                  disabled={!canSpell}
                  title={canSpell ? 'Cast spell!' : 'Wait for your spell turn'}
                >
                  ✨ Spell ({playerScaledStats.abilityPower.toFixed(0)} DMG)
                </button>

                {/* UseItem Button - Only show if player has items and it's a spell turn */}
                {getUsableItems(state.inventory).length > 0 && (
                  <button 
                    onClick={() => {
                      const usableItems = getUsableItems(state.inventory);
                      if (usableItems.length > 0) {
                        handleUseItem(usableItems[0].itemId);
                      }
                    }}
                    className={`action-btn item-btn ${!canSpell ? 'disabled' : ''}`}
                    disabled={!canSpell}
                    title={canSpell ? `Use ${getUsableItems(state.inventory)[0]?.item.name || 'item'}` : 'Wait for your spell turn'}
                  >
                    🧪 Use Item
                  </button>
                )}
              </div>
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
    </div>
  );
};