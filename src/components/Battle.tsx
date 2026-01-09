import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { CharacterStatus } from './CharacterStatus';
import { getScaledStats } from '../game/statsSystem';
import { getRandomLootByClass } from '../game/items';
import { 
  TurnEntity, 
  TurnAction, 
  generateTurnSequence
} from '../game/turnSystemV2';
import './Battle.css';

export const Battle: React.FC = () => {
  const { state, updateEnemyHp, updatePlayerHp, addInventoryItem, addGold, startBattle } = useGameStore();
  const [playerTurnDone, setPlayerTurnDone] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'reward_selection' | null>(null);
  const [turnCounter, setTurnCounter] = useState(0);
  
  // Turn entities for new system
  const [playerEntity, setPlayerEntity] = useState<TurnEntity | null>(null);
  const [enemyEntity, setEnemyEntity] = useState<TurnEntity | null>(null);
  const [turnSequence, setTurnSequence] = useState<TurnAction[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  const playerChar = state.playerCharacter;
  const enemyChar = state.enemyCharacters[0];

  if (!playerChar || !enemyChar) {
    return <div>Loading battle...</div>;
  }

  // Get scaled stats for both characters (with class bonuses)
  const playerScaledStats = getScaledStats(playerChar.stats, playerChar.level, playerChar.class);
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
    setBattleLog(['Battle started!', '---']);
    setLastLoggedTurn(0);
  }, [enemyChar.id]);

  // Initialize battle log
  const [battleLog, setBattleLog] = useState<string[]>(() => {
    return [
      'Battle started!',
      '---',
    ];
  });

  // Track which turn we've logged to avoid duplicate messages
  const [lastLoggedTurn, setLastLoggedTurn] = useState(0);

  const handleAttack = () => {
    if (!playerEntity || !enemyEntity) return;
    
    // Use actual Attack Damage stat
    const damage = playerScaledStats.attackDamage;
    
    // Apply enemy armor mitigation (simplified formula)
    const mitigatedDamage = Math.max(1, Math.floor(damage * (100 / (100 + (enemyScaledStats.armor || 0)))));
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - mitigatedDamage);
    updateEnemyHp(0, newEnemyHp);
    
    setBattleLog((prev) => [
      ...prev,
      `${playerChar.name} attacks ${enemyChar.name} for ${mitigatedDamage} damage!`,
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
    
    // Use Ability Power stat for spell damage
    const spellDamage = playerScaledStats.abilityPower;
    
    // Apply enemy magic resist mitigation (simplified formula)
    const mitigatedDamage = Math.max(1, Math.floor(spellDamage * (100 / (100 + (enemyScaledStats.magicResist || 0)))));
    
    // Update enemy HP
    const newEnemyHp = Math.max(0, enemyChar.hp - mitigatedDamage);
    updateEnemyHp(0, newEnemyHp);
    
    setBattleLog((prev) => [
      ...prev,
      `${playerChar.name} casts a spell on ${enemyChar.name} for ${mitigatedDamage} magic damage!`,
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

  const handleEnemyAttack = () => {
    if (!playerEntity || !enemyEntity || enemyChar.hp <= 0) return;
    
    const currentAction = turnSequence[sequenceIndex];
    if (!currentAction) return;
    
    if (currentAction.actionType === 'attack') {
      const enemyDamage = enemyScaledStats.attackDamage;
      
      // Apply player armor mitigation
      const mitigatedDamage = Math.max(1, Math.floor(enemyDamage * (100 / (100 + (playerScaledStats.armor || 0)))));
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - mitigatedDamage);
      updatePlayerHp(newPlayerHp);
      
      setBattleLog((prev) => [
        ...prev,
        `${enemyChar.name} attacks ${playerChar.name} for ${mitigatedDamage} damage!`,
      ]);
    } else if (currentAction.actionType === 'spell') {
      const enemySpellDamage = enemyScaledStats.abilityPower;
      
      // Apply player magic resist mitigation
      const mitigatedDamage = Math.max(1, Math.floor(enemySpellDamage * (100 / (100 + (playerScaledStats.magicResist || 0)))));
      
      // Update player HP
      const newPlayerHp = Math.max(0, playerChar.hp - mitigatedDamage);
      updatePlayerHp(newPlayerHp);
      
      setBattleLog((prev) => [
        ...prev,
        `${enemyChar.name} casts a spell on ${playerChar.name} for ${mitigatedDamage} magic damage!`,
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
        `${playerChar.name} uses ${ability.name}! Deals ${ability.damage} damage!`,
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
        `--- Turn ${currentTurn} ---`,
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

  // Handle enemy turn automatically
  useEffect(() => {
    if (!turnSequence[sequenceIndex] || battleEnded) return;
    
    const currentAction = turnSequence[sequenceIndex];
    
    // If it's enemy's turn, execute their action
    if (currentAction.entityId === 'enemy' && enemyChar.hp > 0) {
      // Wait a bit before executing enemy action for better UX
      const timer = setTimeout(() => {
        handleEnemyAttack();
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
        setBattleLog((prev) => [
          ...prev,
          `${enemyChar.name} defeated!`,
          `🎁 Obtained: ${lootItem.name}`,
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          `${enemyChar.name} defeated!`,
        ]);
      }
      
      // Add gold reward
      addGold(10);
      setBattleLog((prev) => [
        ...prev,
        `+10 Gold`,
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
          }
        }, 1500);
      }
    } else if (playerChar.hp <= 0 && !battleEnded) {
      setBattleEnded(true);
      setBattleResult('defeat');
      setBattleLog((prev) => [
        ...prev,
        `${playerChar.name} has been defeated...`,
      ]);
    }
  }, [enemyChar.hp, battleEnded]);

  // Get current turn info
  const currentAction = turnSequence[sequenceIndex];
  const currentActor = currentAction?.entityId === 'player' ? 'P' : 'E';
  const isPlayerTurn = currentActor === 'P' && !playerTurnDone && !battleEnded;
  const canAttack = isPlayerTurn && currentAction?.actionType === 'attack';
  const canSpell = isPlayerTurn && currentAction?.actionType === 'spell';
  
  // Get next 5 actions for visualization
  const nextActions = turnSequence.slice(sequenceIndex, sequenceIndex + 5);
  
  // Calculate progress bar for next action
  const getProgressPercentage = (index: number) => {
    if (index === 0) return 100; // Current action is at 100%
    return ((index / 5) * 100); // Distribute remaining actions
  };

  return (
    <div className="battle-screen">
      {/* Header */}
      <div className="battle-header">
        <h1>Riot Roguelike</h1>
        <div className="battle-stats">
          <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
          <span>Encounter: {state.currentFloor}</span>
          <span>Turn: {turnCounter}</span>
          <span>Gold: {state.gold}</span>
        </div>
      </div>

      {/* Turn Order Display with Progress Bar */}
      <div className="turn-order">
        <div className="turn-label">Turn Sequence:</div>
        <div className="turn-bar-container">
          {nextActions.map((action, idx) => (
            <div key={idx} className="turn-bar-item">
              <div className="turn-bar-label">
                {action.entityId === 'player' ? 'P' : 'E'}
                <span className="action-type">{action.actionType === 'spell' ? '✨' : '⚔️'}</span>
              </div>
              <div className="turn-bar-progress">
                <div 
                  className={`progress-fill ${idx === 0 ? 'active' : ''} ${action.entityId === 'player' ? 'player' : 'enemy'}`}
                  style={{ width: `${getProgressPercentage(idx)}%` }}
                />
              </div>
              <div className="turn-time">{action.time.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Character Panels */}
      <div className="battle-arena">
        <div className="team-player">
          <CharacterStatus />
        </div>
        <div className="vs-text">VS</div>
        <div className="team-enemy">
          <CharacterStatus characterId={enemyChar.id} />
        </div>
      </div>

      {/* Battle Log */}
      <div className="battle-log">
        <div className="log-entries" ref={logEntriesRef}>
          {battleLog.map((entry, idx) => (
            <div key={idx} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="battle-actions">
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
              <button 
                onClick={handleAttack} 
                className={`action-btn attack-btn ${!canAttack ? 'disabled' : ''}`}
                disabled={!canAttack}
                title={canAttack ? 'Attack!' : 'Wait for your attack turn'}
              >
                ⚔️ Attack ({playerScaledStats.attackDamage.toFixed(0)} DMG)
              </button>
              <button 
                onClick={handleSpell} 
                className={`action-btn spell-btn ${!canSpell ? 'disabled' : ''}`}
                disabled={!canSpell}
                title={canSpell ? 'Cast spell!' : 'Wait for your spell turn'}
              >
                ✨ Spell ({playerScaledStats.abilityPower.toFixed(0)} DMG)
              </button>
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
