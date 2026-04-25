import React, { useState, useEffect, useMemo } from 'react';
import { Character } from '@game/types';
import { DEFAULT_STATS, getScaledStats, getClassStatBonuses, CharacterStats } from '@utils/statsSystem';
import { ITEM_DATABASE, getPassiveIdsFromInventory, getItemById, getRandomItemsForEnemy } from '@data/items';
import { getAllWeapons } from '@data/weapons';
import { getAllSpells } from '@data/spells';
import * as regionData from '@shared/regions';
import { getRegionTier } from '@screens/PostRegionChoice/regionGraph';
import { calculateEnemyLevel } from '@entities/Player/experienceSystem';
import { useGameStore } from '@game/store';
import { FAMILIAR_DATABASE, MAX_ACTIVE_FAMILIARS } from '@entities/Player/familiars';
import './PreTestSetup.css';

interface ItemWithQuantity {
  itemId: string;
  quantity: number;
}

interface DatabaseEnemyRosterEntry {
  key: string;
  sourceEnemyId: string;
  sourceName: string;
  sourceRegion: string;
  sourceTier: string;
  encounterCounter: number;
  regionVisitCount: number;
  levelScaled: boolean;
  itemScaled: boolean;
  enemy: Character;
}

interface PreTestSetupProps {
  onStartTestBattle: (
    player: Character,
    enemies: Character[],
    playerItems: ItemWithQuantity[],
    playerUseItems: ItemWithQuantity[],
    playerWeapons: string[],
    playerSpells: string[],
    playerFamiliars: string[]
  ) => void;
  onBack: () => void;
}

const CHARACTER_CLASSES = ['juggernaut', 'vanguard', 'warden', 'assassin', 'mage', 'marksman', 'skirmisher', 'enchanter'] as const;
const BEHAVIOR_PROFILES = ['aggressive', 'defensive', 'balanced', 'ranged', 'melee', 'tactical'] as const;

function isEnemyCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Character;
  return candidate.role === 'enemy' && typeof candidate.id === 'string' && !!candidate.stats;
}

const DATABASE_ENEMIES: Character[] = (() => {
  const enemyById = new Map<string, Character>();

  Object.values(regionData).forEach((exportValue) => {
    if (!Array.isArray(exportValue)) return;
    if (!exportValue.every(isEnemyCharacter)) return;

    exportValue.forEach((enemy) => {
      if (!enemyById.has(enemy.id)) {
        enemyById.set(enemy.id, enemy);
      }
    });
  });

  return Array.from(enemyById.values()).sort((a, b) => {
    const regionCompare = (a.region || '').localeCompare(b.region || '');
    if (regionCompare !== 0) return regionCompare;
    const tierCompare = (a.tier || '').localeCompare(b.tier || '');
    if (tierCompare !== 0) return tierCompare;
    return a.id.localeCompare(b.id);
  });
})();

export const PreTestSetup: React.FC<PreTestSetupProps> = ({ onStartTestBattle, onBack }) => {
  const { state } = useGameStore();

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
  const [enemyBehaviorProfile, setEnemyBehaviorProfile] = useState<typeof BEHAVIOR_PROFILES[number]>('balanced');

  // Items for each character (with quantities)
  const [playerItems, setPlayerItems] = useState<ItemWithQuantity[]>([]);
  const [enemyItems, setEnemyItems] = useState<ItemWithQuantity[]>([]);
  
  // Use-items (consumables) for each character (with quantities)
  const [playerUseItems, setPlayerUseItems] = useState<ItemWithQuantity[]>([]);
  const [enemyUseItems, setEnemyUseItems] = useState<ItemWithQuantity[]>([]);
  
  // Weapons for each character (up to 3)
  const [playerWeapons, setPlayerWeapons] = useState<string[]>([]);
  const [enemyWeapons, setEnemyWeapons] = useState<string[]>([]);
  
  // Spells for each character (up to 5)
  const [playerSpells, setPlayerSpells] = useState<string[]>([]);
  const [enemySpells, setEnemySpells] = useState<string[]>([]);

  // Familiars for player (up to MAX_ACTIVE_FAMILIARS)
  const [playerFamiliars, setPlayerFamiliars] = useState<string[]>([]);

  // Tooltip states
  const [showPlayerLevelTooltip, setShowPlayerLevelTooltip] = useState(false);
  const [showEnemyLevelTooltip, setShowEnemyLevelTooltip] = useState(false);
  const [levelTooltipPosition, setLevelTooltipPosition] = useState({ x: 0, y: 0 });

  // Enemy database test mode
  const [useDatabaseEnemies, setUseDatabaseEnemies] = useState(true);
  const [enemySearchQuery, setEnemySearchQuery] = useState('');
  const [applyEnemyLevelScaling, setApplyEnemyLevelScaling] = useState(true);
  const [applyEnemyItemScaling, setApplyEnemyItemScaling] = useState(true);
  const [encounterCounter, setEncounterCounter] = useState(Math.max(1, state.currentFloor || state.encountersCompleted + 1 || 1));
  const [regionVisitCount, setRegionVisitCount] = useState(
    Math.max(1, state.selectedRegion ? state.visitedRegionsThisRun.filter((region) => region === state.selectedRegion).length : 1)
  );
  const [databaseEnemySelection, setDatabaseEnemySelection] = useState(DATABASE_ENEMIES[0]?.id || '');
  const [databaseEnemyRoster, setDatabaseEnemyRoster] = useState<DatabaseEnemyRosterEntry[]>([]);

  const databaseEnemyById = useMemo(
    () => new Map(DATABASE_ENEMIES.map((enemy) => [enemy.id, enemy])),
    []
  );

  const filteredDatabaseEnemies = useMemo(() => {
    const query = enemySearchQuery.trim().toLowerCase();
    if (!query) return DATABASE_ENEMIES;

    return DATABASE_ENEMIES.filter((enemy) => {
      const name = enemy.name?.toLowerCase() || '';
      const id = enemy.id.toLowerCase();
      const region = (enemy.region || '').toLowerCase();
      const tier = (enemy.tier || '').toLowerCase();
      return name.includes(query) || id.includes(query) || region.includes(query) || tier.includes(query);
    });
  }, [enemySearchQuery]);

  useEffect(() => {
    if (filteredDatabaseEnemies.length === 0) return;
    const currentExists = filteredDatabaseEnemies.some((enemy) => enemy.id === databaseEnemySelection);
    if (!currentExists) {
      setDatabaseEnemySelection(filteredDatabaseEnemies[0].id);
    }
  }, [filteredDatabaseEnemies, databaseEnemySelection]);

  // Calculate player max HP when stats change
  useEffect(() => {
    // Apply regular item stats first
    const statsWithItems = { ...playerStats };
    playerItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + (itemValue * quantity);
        });
      }
    });
    
    // Apply use-item stats
    playerUseItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + (itemValue * quantity);
        });
      }
    });
    
    const passiveIds = getPassiveIdsFromInventory([...playerItems, ...playerUseItems]);
    const scaledStats = getScaledStats(statsWithItems, playerLevel, playerClass, passiveIds);
    setPlayerMaxHp(scaledStats.health);
  }, [playerLevel, playerClass, playerStats, playerItems, playerUseItems]);

  // Calculate enemy max HP when stats change
  useEffect(() => {
    // Apply regular item stats first
    const statsWithItems = { ...enemyStats };
    enemyItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + (itemValue * quantity);
        });
      }
    });
    
    // Apply use-item stats
    enemyUseItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (statsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (statsWithItems[stat] as number) = currentValue + (itemValue * quantity);
        });
      }
    });
    
    const passiveIds = getPassiveIdsFromInventory([...enemyItems, ...enemyUseItems]);
    const scaledStats = getScaledStats(statsWithItems, enemyLevel, enemyClass, passiveIds);
    setEnemyMaxHp(scaledStats.health);
  }, [enemyLevel, enemyClass, enemyStats, enemyItems, enemyUseItems]);

  const getRevisitScalingBonuses = (visitCount: number): { levelBonus: number; encounterBonusForItems: number } => {
    if (visitCount <= 1) return { levelBonus: 0, encounterBonusForItems: 0 };
    if (visitCount === 2) return { levelBonus: 2, encounterBonusForItems: 1 };
    if (visitCount === 3) return { levelBonus: 4, encounterBonusForItems: 2 };
    return { levelBonus: 6, encounterBonusForItems: 3 };
  };

  const buildDatabaseEnemyForBattle = (
    enemy: Character,
    index: number,
    currentEncounterCounter: number,
    currentRegionVisitCount: number,
    shouldApplyLevelScaling: boolean,
    shouldApplyItemScaling: boolean
  ): Character => {
    const safeEncounterCounter = Math.max(1, currentEncounterCounter);
    const safeRegionVisitCount = Math.max(1, currentRegionVisitCount);
    const revisitBonuses = getRevisitScalingBonuses(safeRegionVisitCount);

    const baseLevelFromEncounter = calculateEnemyLevel(safeEncounterCounter, enemy.tier || 'minion');
    const finalLevel = shouldApplyLevelScaling
      ? baseLevelFromEncounter + revisitBonuses.levelBonus
      : enemy.level || 1;

    let scaledStats: CharacterStats = { ...enemy.stats };
    let scaledInventory = enemy.inventory ? [...enemy.inventory] : [];

    if (shouldApplyItemScaling) {
      const region = enemy.region || 'demacia';
      const regionTier = getRegionTier(region);
      const effectiveEncounterForItems = safeEncounterCounter + revisitBonuses.encounterBonusForItems;
      const generatedItems = getRandomItemsForEnemy(enemy.class, effectiveEncounterForItems, regionTier);

      generatedItems.forEach((item) => {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach((stat) => {
          const currentValue = (scaledStats[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (scaledStats[stat] as number) = currentValue + itemValue;
        });
      });

      scaledInventory = generatedItems.map((item) => ({ itemId: item.id, quantity: 1 }));
    }

    if (shouldApplyLevelScaling) {
      const classBonuses = getClassStatBonuses(enemy.class, finalLevel);
      (Object.keys(classBonuses) as Array<keyof CharacterStats>).forEach((stat) => {
        const bonus = classBonuses[stat] || 0;
        const currentValue = (scaledStats[stat] as number) || 0;
        (scaledStats[stat] as number) = currentValue + bonus;
      });
    }

    const maxHp = Math.max(1, Math.ceil(scaledStats.health));
    const currentHp = Math.ceil((enemyHpPercent / 100) * maxHp);

    return {
      ...enemy,
      abilities: [...enemy.abilities],
      stats: scaledStats,
      level: finalLevel,
      hp: currentHp,
      inventory: scaledInventory,
      battleInstanceId: `pretest_${enemy.id}_${index}_${Date.now()}`,
      enemyLoadout: enemy.enemyLoadout
        ? {
            ...enemy.enemyLoadout,
            weapons: [...enemy.enemyLoadout.weapons],
            spells: [...enemy.enemyLoadout.spells],
            items: [...enemy.enemyLoadout.items],
          }
        : undefined,
      lootDrops: enemy.lootDrops
        ? {
            weapons: enemy.lootDrops.weapons ? [...enemy.lootDrops.weapons] : undefined,
            spells: enemy.lootDrops.spells ? [...enemy.lootDrops.spells] : undefined,
            items: enemy.lootDrops.items ? [...enemy.lootDrops.items] : undefined,
            familiars: enemy.lootDrops.familiars ? [...enemy.lootDrops.familiars] : undefined,
          }
        : undefined,
    };
  };

  const handleAddDatabaseEnemy = () => {
    if (!databaseEnemySelection) return;
    const enemy = databaseEnemyById.get(databaseEnemySelection);
    if (!enemy) return;

    const rosterIndex = databaseEnemyRoster.length;
    const builtEnemy = buildDatabaseEnemyForBattle(
      enemy,
      rosterIndex,
      encounterCounter,
      regionVisitCount,
      applyEnemyLevelScaling,
      applyEnemyItemScaling
    );

    const newEntry: DatabaseEnemyRosterEntry = {
      key: `${enemy.id}_${Date.now()}_${rosterIndex}`,
      sourceEnemyId: enemy.id,
      sourceName: enemy.name || enemy.id,
      sourceRegion: enemy.region || 'unknown',
      sourceTier: enemy.tier || 'unknown',
      encounterCounter: Math.max(1, encounterCounter),
      regionVisitCount: Math.max(1, regionVisitCount),
      levelScaled: applyEnemyLevelScaling,
      itemScaled: applyEnemyItemScaling,
      enemy: builtEnemy,
    };

    setDatabaseEnemyRoster((prev) => [...prev, newEntry]);
  };

  const handleRemoveDatabaseEnemy = (indexToRemove: number) => {
    setDatabaseEnemyRoster((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClearDatabaseRoster = () => {
    setDatabaseEnemyRoster([]);
  };

  const handleStartBattle = () => {
    const playerCurrentHp = Math.ceil((playerHpPercent / 100) * playerMaxHp);
    const enemyCurrentHp = Math.ceil((enemyHpPercent / 100) * enemyMaxHp);

    // Apply item stats to player (with quantities)
    const playerStatsWithItems = { ...playerStats };
    playerItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (playerStatsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (playerStatsWithItems[stat] as number) = currentValue + (itemValue * quantity);
        });
      }
    });

    // Apply item stats to enemy (with quantities)
    const enemyStatsWithItems = { ...enemyStats };
    enemyItems.forEach(({ itemId, quantity }) => {
      const item = getItemById(itemId);
      if (item && item.stats) {
        (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
          const currentValue = (enemyStatsWithItems[stat] as number) || 0;
          const itemValue = (item.stats[stat] as number) || 0;
          (enemyStatsWithItems[stat] as number) = currentValue + (itemValue * quantity);
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

    if (useDatabaseEnemies) {
      const roster = databaseEnemyRoster.map((entry, index) => {
        const maxHp = Math.max(1, Math.ceil(entry.enemy.stats.health));
        return {
          ...entry.enemy,
          hp: Math.ceil((enemyHpPercent / 100) * maxHp),
          battleInstanceId: `pretest_${entry.enemy.id}_${index}_${Date.now()}`,
        };
      });
      if (roster.length === 0) {
        return;
      }

      onStartTestBattle(
        playerChar,
        roster,
        playerItems,
        playerUseItems,
        playerWeapons,
        playerSpells,
        playerFamiliars
      );
      return;
    }

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
      // Enemy AI configuration
      behaviorProfile: enemyBehaviorProfile,
      enemyLoadout: {
        weapons: enemyWeapons.slice(0, 2), // Max 2 weapons for enemies
        spells: enemySpells.slice(0, 3), // Max 3 spells for enemies
        items: enemyUseItems.length > 0 ? [enemyUseItems[0].itemId] : [], // Max 1 item
        equippedWeaponIndex: 0,
        equippedSpellIndex: 0,
      },
      enemyWeaponCooldowns: {},
      enemySpellCooldowns: {},
    };

    onStartTestBattle(
      playerChar,
      [enemyChar],
      playerItems,
      playerUseItems,
      playerWeapons,
      playerSpells,
      playerFamiliars
    );
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
    setPlayerItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handlePlayerItemQuantity = (itemId: string, quantity: number) => {
    setPlayerItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.itemId !== itemId);
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity } : i);
      }
      return [...prev, { itemId, quantity }];
    });
  };

  const handleEnemyItemToggle = (itemId: string) => {
    setEnemyItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handleEnemyItemQuantity = (itemId: string, quantity: number) => {
    setEnemyItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.itemId !== itemId);
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity } : i);
      }
      return [...prev, { itemId, quantity }];
    });
  };

  const handlePlayerUseItemToggle = (itemId: string) => {
    setPlayerUseItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handlePlayerUseItemQuantity = (itemId: string, quantity: number) => {
    setPlayerUseItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.itemId !== itemId);
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity } : i);
      }
      return [...prev, { itemId, quantity }];
    });
  };

  const handleEnemyUseItemToggle = (itemId: string) => {
    setEnemyUseItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handleEnemyUseItemQuantity = (itemId: string, quantity: number) => {
    setEnemyUseItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.itemId !== itemId);
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity } : i);
      }
      return [...prev, { itemId, quantity }];
    });
  };

  const handlePlayerWeaponToggle = (weaponId: string) => {
    setPlayerWeapons(prev => {
      if (prev.includes(weaponId)) {
        return prev.filter(id => id !== weaponId);
      }
      if (prev.length >= 3) return prev; // Max 3 weapons
      return [...prev, weaponId];
    });
  };

  const handleEnemyWeaponToggle = (weaponId: string) => {
    setEnemyWeapons(prev => {
      if (prev.includes(weaponId)) {
        return prev.filter(id => id !== weaponId);
      }
      if (prev.length >= 2) return prev; // Max 2 weapons for enemies
      return [...prev, weaponId];
    });
  };

  const handlePlayerSpellToggle = (spellId: string) => {
    setPlayerSpells(prev => {
      if (prev.includes(spellId)) {
        return prev.filter(id => id !== spellId);
      }
      if (prev.length >= 5) return prev; // Max 5 spells
      return [...prev, spellId];
    });
  };

  const handleEnemySpellToggle = (spellId: string) => {
    setEnemySpells(prev => {
      if (prev.includes(spellId)) {
        return prev.filter(id => id !== spellId);
      }
      if (prev.length >= 3) return prev; // Max 3 spells for enemies
      return [...prev, spellId];
    });
  };

  const handlePlayerFamiliarToggle = (familiarId: string) => {
    setPlayerFamiliars(prev => {
      if (prev.includes(familiarId)) {
        return prev.filter(id => id !== familiarId);
      }
      if (prev.length >= MAX_ACTIVE_FAMILIARS) return prev;
      return [...prev, familiarId];
    });
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
                    <input type="number" step="0.01" value={playerStats.speed} onChange={(e) => handlePlayerStatChange('speed', parseFloat(e.target.value))} />
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
                    <input type="number" value={playerStats.haste} onChange={(e) => handlePlayerStatChange('haste', parseFloat(e.target.value))} />
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
              {availableItems.filter(item => !item.consumable).map(item => {
                const selected = playerItems.find(i => i.itemId === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`item-slot-with-quantity rarity-${item.rarity} ${selected ? 'selected' : ''}`}
                    title={item.name}
                  >
                    <div 
                      className="item-slot-content"
                      onClick={() => handlePlayerItemToggle(item.id)}
                    >
                      <div className="item-name">{item.name}</div>
                      <div className="item-rarity">{item.rarity}</div>
                    </div>
                    {selected && (
                      <input 
                        type="number"
                        min="1"
                        className="quantity-input"
                        value={selected.quantity}
                        onChange={(e) => handlePlayerItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Use Items (Consumables) ({playerUseItems.length} selected)</h3>
            <div className="items-grid">
              {availableItems.filter(item => item.consumable).map(item => {
                const selected = playerUseItems.find(i => i.itemId === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`item-slot-with-quantity rarity-${item.rarity} ${selected ? 'selected' : ''}`}
                    title={item.name}
                  >
                    <div 
                      className="item-slot-content"
                      onClick={() => handlePlayerUseItemToggle(item.id)}
                    >
                      <div className="item-name">{item.name}</div>
                      <div className="item-rarity">Consumable</div>
                    </div>
                    {selected && (
                      <input 
                        type="number"
                        min="1"
                        className="quantity-input"
                        value={selected.quantity}
                        onChange={(e) => handlePlayerUseItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Weapons ({playerWeapons.length}/3 selected)</h3>
            <div className="items-grid">
              {getAllWeapons().map(weapon => (
                <div 
                  key={weapon.id}
                  className={`item-slot rarity-${weapon.rarity || 'starter'} ${playerWeapons.includes(weapon.id) ? 'selected' : ''} ${playerWeapons.length >= 3 && !playerWeapons.includes(weapon.id) ? 'disabled' : ''}`}
                  onClick={() => handlePlayerWeaponToggle(weapon.id)}
                  title={weapon.name}
                >
                  <div className="item-name">{weapon.name}</div>
                  <div className="item-rarity">{weapon.rarity || 'Weapon'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Spells ({playerSpells.length}/5 selected)</h3>
            <div className="items-grid">
              {getAllSpells().map(spell => (
                <div 
                  key={spell.id}
                  className={`item-slot rarity-${spell.rarity || 'starter'} ${playerSpells.includes(spell.id) ? 'selected' : ''} ${playerSpells.length >= 5 && !playerSpells.includes(spell.id) ? 'disabled' : ''}`}
                  onClick={() => handlePlayerSpellToggle(spell.id)}
                  title={spell.name}
                >
                  <div className="item-name">{spell.name}</div>
                  <div className="item-rarity">{spell.cooldown}s</div>
                </div>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h3>Familiars ({playerFamiliars.length}/{MAX_ACTIVE_FAMILIARS} active)</h3>
            <div className="items-grid">
              {Object.values(FAMILIAR_DATABASE).map(familiar => (
                <div
                  key={familiar.id}
                  className={`item-slot rarity-${familiar.rarity} ${playerFamiliars.includes(familiar.id) ? 'selected' : ''} ${playerFamiliars.length >= MAX_ACTIVE_FAMILIARS && !playerFamiliars.includes(familiar.id) ? 'disabled' : ''}`}
                  onClick={() => handlePlayerFamiliarToggle(familiar.id)}
                  title={`${familiar.name} — ${familiar.effect.description}`}
                >
                  <div className="item-name">{familiar.icon} {familiar.name}</div>
                  <div className="item-rarity">{familiar.trigger === 'fight_start' ? 'Fight Start' : familiar.trigger === 'fight_end' ? 'Fight End' : `Every ${familiar.intervalTurns}t`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Configuration */}
        <div className="character-config enemy-config">
          <h2>Enemy Character</h2>

          <div className="config-section">
            <label>Enemy Source:</label>
            <select
              value={useDatabaseEnemies ? 'database' : 'custom'}
              onChange={(e) => setUseDatabaseEnemies(e.target.value === 'database')}
            >
              <option value="database">Database Enemies (Recommended)</option>
              <option value="custom">Custom Enemy Builder</option>
            </select>
          </div>

          {useDatabaseEnemies && (
            <>
              <div className="config-section">
                <label>Search Enemies:</label>
                <input
                  type="text"
                  value={enemySearchQuery}
                  onChange={(e) => setEnemySearchQuery(e.target.value)}
                  placeholder="Search by name, id, region, or tier"
                />
              </div>

              <div className="config-section inline-config-section">
                <label>Select Enemy:</label>
                <div className="inline-field-row">
                  <select
                    value={databaseEnemySelection}
                    onChange={(e) => setDatabaseEnemySelection(e.target.value)}
                  >
                    {filteredDatabaseEnemies.map((enemy) => (
                      <option key={enemy.id} value={enemy.id}>
                        {(enemy.name || enemy.id)} [{enemy.region || 'unknown'} | {enemy.tier || 'unknown'}]
                      </option>
                    ))}
                  </select>
                  <button type="button" className="queue-enemy-btn" onClick={handleAddDatabaseEnemy}>
                    Add
                  </button>
                </div>
              </div>

              <div className="config-section database-enemy-list-section">
                <label>Battle Roster ({databaseEnemyRoster.length}):</label>
                <div className="database-enemy-list">
                  {databaseEnemyRoster.map((entry, index) => (
                    <div key={entry.key} className="database-enemy-row">
                      <span>
                        {index + 1}. {entry.sourceName} ({entry.sourceRegion} / {entry.sourceTier}) L{entry.enemy.level}
                        {' '}[E{entry.encounterCounter}, V{entry.regionVisitCount}, {entry.levelScaled ? 'Level ON' : 'Level OFF'}, {entry.itemScaled ? 'Items ON' : 'Items OFF'}]
                      </span>
                      <button
                        type="button"
                        className="remove-enemy-btn"
                        onClick={() => handleRemoveDatabaseEnemy(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {databaseEnemyRoster.length > 0 && (
                  <button type="button" className="queue-enemy-btn" onClick={handleClearDatabaseRoster}>
                    Clear Roster
                  </button>
                )}
              </div>

              <div className="config-section">
                <label>Encounter Counter (header value):</label>
                <input
                  type="number"
                  min="1"
                  value={encounterCounter}
                  onChange={(e) => setEncounterCounter(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="config-section">
                <label>Region Visit Count:</label>
                <input
                  type="number"
                  min="1"
                  value={regionVisitCount}
                  onChange={(e) => setRegionVisitCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="config-section checkbox-config-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applyEnemyLevelScaling}
                    onChange={(e) => setApplyEnemyLevelScaling(e.target.checked)}
                  />
                  Apply Level Scaling
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={applyEnemyItemScaling}
                    onChange={(e) => setApplyEnemyItemScaling(e.target.checked)}
                  />
                  Apply Item Scaling
                </label>
              </div>

              <div className="config-section hp-slider-section">
                <label>Starting HP (all selected enemies):</label>
                <div className="hp-slider-container">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={enemyHpPercent}
                    onChange={(e) => setEnemyHpPercent(parseInt(e.target.value))}
                    className="hp-slider"
                  />
                  <span className="hp-display">{enemyHpPercent}%</span>
                </div>
              </div>
            </>
          )}

          {!useDatabaseEnemies && (
            <>
          
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
            <label>AI Behavior:</label>
            <select value={enemyBehaviorProfile} onChange={(e) => setEnemyBehaviorProfile(e.target.value as any)}>
              {BEHAVIOR_PROFILES.map(profile => (
                <option key={profile} value={profile}>{profile}</option>
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
                    <input type="number" step="0.01" value={enemyStats.speed} onChange={(e) => handleEnemyStatChange('speed', parseFloat(e.target.value))} />
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
                    <input type="number" value={enemyStats.haste} onChange={(e) => handleEnemyStatChange('haste', parseFloat(e.target.value))} />
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
              {availableItems.filter(item => !item.consumable).map(item => {
                const selected = enemyItems.find(i => i.itemId === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`item-slot-with-quantity rarity-${item.rarity} ${selected ? 'selected' : ''}`}
                    title={item.name}
                  >
                    <div 
                      className="item-slot-content"
                      onClick={() => handleEnemyItemToggle(item.id)}
                    >
                      <div className="item-name">{item.name}</div>
                      <div className="item-rarity">{item.rarity}</div>
                    </div>
                    {selected && (
                      <input 
                        type="number"
                        min="1"
                        className="quantity-input"
                        value={selected.quantity}
                        onChange={(e) => handleEnemyItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Use Items (Consumables) ({enemyUseItems.length} selected)</h3>
            <div className="items-grid">
              {availableItems.filter(item => item.consumable).map(item => {
                const selected = enemyUseItems.find(i => i.itemId === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`item-slot-with-quantity rarity-${item.rarity} ${selected ? 'selected' : ''}`}
                    title={item.name}
                  >
                    <div 
                      className="item-slot-content"
                      onClick={() => handleEnemyUseItemToggle(item.id)}
                    >
                      <div className="item-name">{item.name}</div>
                      <div className="item-rarity">Consumable</div>
                    </div>
                    {selected && (
                      <input 
                        type="number"
                        min="1"
                        className="quantity-input"
                        value={selected.quantity}
                        onChange={(e) => handleEnemyUseItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Weapons ({enemyWeapons.length}/2 selected)</h3>
            <div className="items-grid">
              {getAllWeapons().map(weapon => (
                <div 
                  key={weapon.id}
                  className={`item-slot rarity-${weapon.rarity || 'starter'} ${enemyWeapons.includes(weapon.id) ? 'selected' : ''} ${enemyWeapons.length >= 2 && !enemyWeapons.includes(weapon.id) ? 'disabled' : ''}`}
                  onClick={() => handleEnemyWeaponToggle(weapon.id)}
                  title={weapon.name}
                >
                  <div className="item-name">{weapon.name}</div>
                  <div className="item-rarity">{weapon.rarity || 'Weapon'}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="items-section">
            <h3>Spells ({enemySpells.length}/3 selected)</h3>
            <div className="items-grid">
              {getAllSpells().map(spell => (
                <div 
                  key={spell.id}
                  className={`item-slot rarity-${spell.rarity || 'starter'} ${enemySpells.includes(spell.id) ? 'selected' : ''} ${enemySpells.length >= 3 && !enemySpells.includes(spell.id) ? 'disabled' : ''}`}
                  onClick={() => handleEnemySpellToggle(spell.id)}
                  title={spell.name}
                >
                  <div className="item-name">{spell.name}</div>
                  <div className="item-rarity">{spell.cooldown}s</div>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
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
