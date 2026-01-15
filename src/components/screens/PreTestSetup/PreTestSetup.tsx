import React, { useState, useEffect } from 'react';
import { Character } from '../../../game/types';
import { DEFAULT_STATS, getScaledStats, getClassStatBonuses, CharacterStats } from '../../../game/statsSystem';
import { ITEM_DATABASE, getPassiveIdsFromInventory, getItemById } from '../../../game/items';
import './PreTestSetup.css';

interface PreTestSetupProps {
  onStartTestBattle: (player: Character, enemy: Character, playerItems: string[], enemyItems: string[]) => void;
  onBack: () => void;
}

const CHARACTER_CLASSES = ['juggernaut', 'vanguard', 'warden', 'assassin', 'mage', 'marksman', 'skirmisher', 'enchanter'] as const;

export const PreTestSetup: React.FC<PreTestSetupProps> = ({ onStartTestBattle, onBack }) => {
  // Player character state
  const [playerName, setPlayerName] = useState('Test Player');
  const [playerClass, setPlayerClass] = useState<typeof CHARACTER_CLASSES[number]>('juggernaut');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerHpPercent, setPlayerHpPercent] = useState(100); // 1-100%
  const [playerMaxHp, setPlayerMaxHp] = useState(DEFAULT_STATS.health);
  const [playerStats, setPlayerStats] = useState({ ...DEFAULT_STATS });

  // Enemy character state
  const [enemyName, setEnemyName] = useState('Test Enemy');
  const [enemyClass, setEnemyClass] = useState<typeof CHARACTER_CLASSES[number]>('juggernaut');
  const [enemyLevel, setEnemyLevel] = useState(1);
  const [enemyHpPercent, setEnemyHpPercent] = useState(100); // 1-100%
  const [enemyMaxHp, setEnemyMaxHp] = useState(DEFAULT_STATS.health);
  const [enemyStats, setEnemyStats] = useState({ ...DEFAULT_STATS });

  // Items for each character
  const [playerItems, setPlayerItems] = useState<string[]>([]);
  const [enemyItems, setEnemyItems] = useState<string[]>([]);

  // Tooltip states
  const [showPlayerLevelTooltip, setShowPlayerLevelTooltip] = useState(false);
  const [showEnemyLevelTooltip, setShowEnemyLevelTooltip] = useState(false);
  const [levelTooltipPosition, setLevelTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate player max HP when stats change
  useEffect(() => {
    // Apply item stats first
    const statsWithItems = { ...playerStats };
    playerItems.forEach(itemId => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + itemValue;
        });
      }
    });
    
    const passiveIds = getPassiveIdsFromInventory(playerItems.map(id => ({ itemId: id, quantity: 1 })));
    const scaledStats = getScaledStats(statsWithItems, playerLevel, playerClass, passiveIds);
    setPlayerMaxHp(scaledStats.health);
  }, [playerLevel, playerClass, playerStats, playerItems]);

  // Calculate enemy max HP when stats change
  useEffect(() => {
    // Apply item stats first
    const statsWithItems = { ...enemyStats };
    enemyItems.forEach(itemId => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + itemValue;
        });
      }
    });
    
    const passiveIds = getPassiveIdsFromInventory(enemyItems.map(id => ({ itemId: id, quantity: 1 })));
    const scaledStats = getScaledStats(statsWithItems, enemyLevel, enemyClass, passiveIds);
    setEnemyMaxHp(scaledStats.health);
  }, [enemyLevel, enemyClass, enemyStats, enemyItems]);

  const handleStartBattle = () => {
    const playerCurrentHp = Math.ceil((playerHpPercent / 100) * playerMaxHp);
    const enemyCurrentHp = Math.ceil((enemyHpPercent / 100) * enemyMaxHp);

    // Apply item stats to player
    const playerStatsWithItems = { ...playerStats };
    playerItems.forEach(itemId => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (playerStatsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (playerStatsWithItems[stat] as number) = currentValue + itemValue;
        });
      }
    });

    // Apply item stats to enemy
    const enemyStatsWithItems = { ...enemyStats };
    enemyItems.forEach(itemId => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (enemyStatsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (enemyStatsWithItems[stat] as number) = currentValue + itemValue;
        });
      }
    });

    const playerChar: Character = {
      id: 'test-player',
      name: playerName,
      role: 'player',
      region: 'demacia',
      class: playerClass,
      hp: playerCurrentHp,
      abilities: [],
      level: playerLevel,
      experience: 0,
      stats: playerStatsWithItems,
      tier: 'minion',
    };

    const enemyChar: Character = {
      id: 'test-enemy',
      name: enemyName,
      role: 'enemy',
      region: 'demacia',
      class: enemyClass,
      hp: enemyCurrentHp,
      abilities: [],
      level: enemyLevel,
      experience: 0,
      stats: enemyStatsWithItems,
      tier: 'minion',
    };

    onStartTestBattle(playerChar, enemyChar, playerItems, enemyItems);
  };

  const handlePlayerStatChange = (stat: keyof typeof DEFAULT_STATS, value: number) => {
    // Prevent NaN values from being set
    if (isNaN(value)) return;
    setPlayerStats(prev => ({ ...prev, [stat]: value }));
  };

  const handleEnemyStatChange = (stat: keyof typeof DEFAULT_STATS, value: number) => {
    // Prevent NaN values from being set
    if (isNaN(value)) return;
    setEnemyStats(prev => ({ ...prev, [stat]: value }));
  };

  const handlePlayerItemToggle = (itemId: string) => {
    setPlayerItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEnemyItemToggle = (itemId: string) => {
    setEnemyItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const availableItems = Object.values(ITEM_DATABASE).filter(item => !item.id.startsWith('locked'));

  return (
    <div className="pretest-setup">
      <div className="pretest-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Combat Test Setup</h1>
      </div>

      <div className="test-container">
        {/* Player Configuration */}
        <div className="character-config player-config">
          <h2>Player Character</h2>
          
          <div className="config-section">
            <label>Name:</label>
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
            />
          </div>

          <div className="config-section">
            <label>Class:</label>
            <select value={playerClass} onChange={(e) => setPlayerClass(e.target.value as any)}>
              {CHARACTER_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label>Level:</label>
            <input 
              type="number" 
              min="1" 
              max="18" 
              value={playerLevel} 
              onChange={(e) => setPlayerLevel(parseInt(e.target.value))}
              onMouseEnter={(e) => {
                setShowPlayerLevelTooltip(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setLevelTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
              }}
              onMouseLeave={() => setShowPlayerLevelTooltip(false)}
            />
          </div>

          <div className="config-section hp-slider-section">
            <label>Starting HP:</label>
            <div className="hp-slider-container">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={playerHpPercent} 
                onChange={(e) => setPlayerHpPercent(parseInt(e.target.value))}
                className="hp-slider"
              />
              <span className="hp-display">
                {Math.ceil((playerHpPercent / 100) * playerMaxHp)} / {playerMaxHp} ({playerHpPercent}%)
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <h3>Stats</h3>
            <div className="stats-columns">
              <div className="stats-column">
                {/* Mobility */}
                <div className="stats-category">
                  <h4>Mobility</h4>
                  <div className="stat-input-row">
                    <label>Movement Speed:</label>
                    <input type="number" value={playerStats.movementSpeed} onChange={(e) => handlePlayerStatChange('movementSpeed', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Miscellaneous */}
                <div className="stats-category">
                  <h4>Miscellaneous</h4>
                  <div className="stat-input-row">
                    <label>Gold Gain:</label>
                    <input type="number" step="0.1" value={playerStats.goldGain} onChange={(e) => handlePlayerStatChange('goldGain', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>XP Gain:</label>
                    <input type="number" step="0.1" value={playerStats.xpGain} onChange={(e) => handlePlayerStatChange('xpGain', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Find:</label>
                    <input type="number" value={playerStats.magicFind} onChange={(e) => handlePlayerStatChange('magicFind', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Attack */}
                <div className="stats-category">
                  <h4>Attack</h4>
                  <div className="stat-input-row">
                    <label>Attack Range:</label>
                    <input type="number" value={playerStats.attackRange} onChange={(e) => handlePlayerStatChange('attackRange', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Attack Damage:</label>
                    <input type="number" value={playerStats.attackDamage} onChange={(e) => handlePlayerStatChange('attackDamage', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Attack Speed:</label>
                    <input type="number" step="0.01" value={playerStats.attackSpeed} onChange={(e) => handlePlayerStatChange('attackSpeed', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Critical Chance:</label>
                    <input type="number" value={playerStats.criticalChance} onChange={(e) => handlePlayerStatChange('criticalChance', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Critical Damage:</label>
                    <input type="number" value={playerStats.criticalDamage} onChange={(e) => handlePlayerStatChange('criticalDamage', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Lethality:</label>
                    <input type="number" value={playerStats.lethality} onChange={(e) => handlePlayerStatChange('lethality', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Lifesteal:</label>
                    <input type="number" value={playerStats.lifeSteal} onChange={(e) => handlePlayerStatChange('lifeSteal', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="stats-column">
                {/* Survivability */}
                <div className="stats-category">
                  <h4>Survivability</h4>
                  <div className="stat-input-row">
                    <label>Health:</label>
                    <input type="number" value={playerStats.health} onChange={(e) => handlePlayerStatChange('health', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Health Regen:</label>
                    <input type="number" value={playerStats.health_regen} onChange={(e) => handlePlayerStatChange('health_regen', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Armor:</label>
                    <input type="number" value={playerStats.armor} onChange={(e) => handlePlayerStatChange('armor', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Resist:</label>
                    <input type="number" value={playerStats.magicResist} onChange={(e) => handlePlayerStatChange('magicResist', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Tenacity:</label>
                    <input type="number" value={playerStats.tenacity} onChange={(e) => handlePlayerStatChange('tenacity', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Spell */}
                <div className="stats-category">
                  <h4>Spell</h4>
                  <div className="stat-input-row">
                    <label>Ability Power:</label>
                    <input type="number" value={playerStats.abilityPower} onChange={(e) => handlePlayerStatChange('abilityPower', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Ability Haste:</label>
                    <input type="number" value={playerStats.abilityHaste} onChange={(e) => handlePlayerStatChange('abilityHaste', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Penetration:</label>
                    <input type="number" value={playerStats.magicPenetration} onChange={(e) => handlePlayerStatChange('magicPenetration', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Heal & Shield Power:</label>
                    <input type="number" value={playerStats.heal_shield_power} onChange={(e) => handlePlayerStatChange('heal_shield_power', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Omnivamp:</label>
                    <input type="number" value={playerStats.omnivamp} onChange={(e) => handlePlayerStatChange('omnivamp', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <h3>Items ({playerItems.length} selected)</h3>
            <div className="items-grid">
              {availableItems.map(item => (
                <div 
                  key={item.id}
                  className={`item-slot ${playerItems.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => handlePlayerItemToggle(item.id)}
                  title={item.name}
                >
                  <div className="item-name">{item.name}</div>
                  <div className="item-rarity">{item.rarity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Configuration */}
        <div className="character-config enemy-config">
          <h2>Enemy Character</h2>
          
          <div className="config-section">
            <label>Name:</label>
            <input 
              type="text" 
              value={enemyName} 
              onChange={(e) => setEnemyName(e.target.value)} 
            />
          </div>

          <div className="config-section">
            <label>Class:</label>
            <select value={enemyClass} onChange={(e) => setEnemyClass(e.target.value as any)}>
              {CHARACTER_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label>Level:</label>
            <input 
              type="number" 
              min="1" 
              max="18" 
              value={enemyLevel} 
              onChange={(e) => setEnemyLevel(parseInt(e.target.value))}
              onMouseEnter={(e) => {
                setShowEnemyLevelTooltip(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setLevelTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
              }}
              onMouseLeave={() => setShowEnemyLevelTooltip(false)}
            />
          </div>

          <div className="config-section hp-slider-section">
            <label>Starting HP:</label>
            <div className="hp-slider-container">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={enemyHpPercent} 
                onChange={(e) => setEnemyHpPercent(parseInt(e.target.value))}
                className="hp-slider"
              />
              <span className="hp-display">
                {Math.ceil((enemyHpPercent / 100) * enemyMaxHp)} / {enemyMaxHp} ({enemyHpPercent}%)
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <h3>Stats</h3>
            <div className="stats-columns">
              <div className="stats-column">
                {/* Mobility */}
                <div className="stats-category">
                  <h4>Mobility</h4>
                  <div className="stat-input-row">
                    <label>Movement Speed:</label>
                    <input type="number" value={enemyStats.movementSpeed} onChange={(e) => handleEnemyStatChange('movementSpeed', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Miscellaneous */}
                <div className="stats-category">
                  <h4>Miscellaneous</h4>
                  <div className="stat-input-row">
                    <label>Gold Gain:</label>
                    <input type="number" step="0.1" value={enemyStats.goldGain} onChange={(e) => handleEnemyStatChange('goldGain', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>XP Gain:</label>
                    <input type="number" step="0.1" value={enemyStats.xpGain} onChange={(e) => handleEnemyStatChange('xpGain', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Find:</label>
                    <input type="number" value={enemyStats.magicFind} onChange={(e) => handleEnemyStatChange('magicFind', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Attack */}
                <div className="stats-category">
                  <h4>Attack</h4>
                  <div className="stat-input-row">
                    <label>Attack Range:</label>
                    <input type="number" value={enemyStats.attackRange} onChange={(e) => handleEnemyStatChange('attackRange', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Attack Damage:</label>
                    <input type="number" value={enemyStats.attackDamage} onChange={(e) => handleEnemyStatChange('attackDamage', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Attack Speed:</label>
                    <input type="number" step="0.01" value={enemyStats.attackSpeed} onChange={(e) => handleEnemyStatChange('attackSpeed', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Critical Chance:</label>
                    <input type="number" value={enemyStats.criticalChance} onChange={(e) => handleEnemyStatChange('criticalChance', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Critical Damage:</label>
                    <input type="number" value={enemyStats.criticalDamage} onChange={(e) => handleEnemyStatChange('criticalDamage', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Lethality:</label>
                    <input type="number" value={enemyStats.lethality} onChange={(e) => handleEnemyStatChange('lethality', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Lifesteal:</label>
                    <input type="number" value={enemyStats.lifeSteal} onChange={(e) => handleEnemyStatChange('lifeSteal', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="stats-column">
                {/* Survivability */}
                <div className="stats-category">
                  <h4>Survivability</h4>
                  <div className="stat-input-row">
                    <label>Health:</label>
                    <input type="number" value={enemyStats.health} onChange={(e) => handleEnemyStatChange('health', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Health Regen:</label>
                    <input type="number" value={enemyStats.health_regen} onChange={(e) => handleEnemyStatChange('health_regen', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Armor:</label>
                    <input type="number" value={enemyStats.armor} onChange={(e) => handleEnemyStatChange('armor', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Resist:</label>
                    <input type="number" value={enemyStats.magicResist} onChange={(e) => handleEnemyStatChange('magicResist', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Tenacity:</label>
                    <input type="number" value={enemyStats.tenacity} onChange={(e) => handleEnemyStatChange('tenacity', parseFloat(e.target.value))} />
                  </div>
                </div>

                {/* Spell */}
                <div className="stats-category">
                  <h4>Spell</h4>
                  <div className="stat-input-row">
                    <label>Ability Power:</label>
                    <input type="number" value={enemyStats.abilityPower} onChange={(e) => handleEnemyStatChange('abilityPower', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Ability Haste:</label>
                    <input type="number" value={enemyStats.abilityHaste} onChange={(e) => handleEnemyStatChange('abilityHaste', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Magic Penetration:</label>
                    <input type="number" value={enemyStats.magicPenetration} onChange={(e) => handleEnemyStatChange('magicPenetration', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Heal & Shield Power:</label>
                    <input type="number" value={enemyStats.heal_shield_power} onChange={(e) => handleEnemyStatChange('heal_shield_power', parseFloat(e.target.value))} />
                  </div>
                  <div className="stat-input-row">
                    <label>Omnivamp:</label>
                    <input type="number" value={enemyStats.omnivamp} onChange={(e) => handleEnemyStatChange('omnivamp', parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <h3>Items ({enemyItems.length} selected)</h3>
            <div className="items-grid">
              {availableItems.map(item => (
                <div 
                  key={item.id}
                  className={`item-slot ${enemyItems.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => handleEnemyItemToggle(item.id)}
                  title={item.name}
                >
                  <div className="item-name">{item.name}</div>
                  <div className="item-rarity">{item.rarity}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="test-actions">
        <button className="start-test-btn" onClick={handleStartBattle}>
          ⚔️ Start Test Battle
        </button>
      </div>

      {/* Player Level Tooltip */}
      {showPlayerLevelTooltip && (
        <div 
          className="level-bonus-tooltip"
          style={{ left: `${levelTooltipPosition.x}px`, top: `${levelTooltipPosition.y}px` }}
        >
          <h4>Level {playerLevel} Bonuses ({playerClass})</h4>
          {Object.entries(getClassStatBonuses(playerClass, playerLevel))
            .filter(([_, value]) => value && value !== 0)
            .map(([stat, value]) => (
              <div key={stat} className="tooltip-stat">
                +{value} {stat}
              </div>
            ))}
          <div className="tooltip-note">Base stats are also scaled by {((playerLevel - 1) * 5).toFixed(0)}%</div>
        </div>
      )}

      {/* Enemy Level Tooltip */}
      {showEnemyLevelTooltip && (
        <div 
          className="level-bonus-tooltip"
          style={{ left: `${levelTooltipPosition.x}px`, top: `${levelTooltipPosition.y}px` }}
        >
          <h4>Level {enemyLevel} Bonuses ({enemyClass})</h4>
          {Object.entries(getClassStatBonuses(enemyClass, enemyLevel))
            .filter(([_, value]) => value && value !== 0)
            .map(([stat, value]) => (
              <div key={stat} className="tooltip-stat">
                +{value} {stat}
              </div>
            ))}
          <div className="tooltip-note">Base stats are also scaled by {((enemyLevel - 1) * 5).toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
};
