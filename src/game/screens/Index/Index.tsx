import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getActiveProfile, isConnectionDiscovered } from '../MainMenu/Profiles/profileSystem';
import { ITEM_DATABASE, Item, ItemRarity, getPassiveDescription } from '@data/items';
import { getAllWeapons, Weapon } from '@data/weapons';
import { getAllSpells, Spell } from '@data/spells';
import { getSpellDescription, getSpellName, getWeaponDescription, getWeaponName } from '../../../i18n/helpers';
import { REGION_GRAPH } from '../PostRegionChoice/regionGraph';
import { getQuestsByRegion } from '../QuestSelect/logic';
import { Region } from '@game/types';
import {
  DEMACIA_MINIONS, DEMACIA_ELITES, DEMACIA_BOSSES, DEMACIA_CHAMPIONS, DEMACIA_LEGENDS,
  CAMAVOR_MINIONS, CAMAVOR_ELITES, CAMAVOR_BOSSES, CAMAVOR_CHAMPIONS, CAMAVOR_LEGENDS,
  IONIA_MINIONS, IONIA_ELITES, IONIA_BOSSES, IONIA_CHAMPIONS, IONIA_LEGENDS,
  SHURIMA_MINIONS, SHURIMA_ELITES, SHURIMA_BOSSES, SHURIMA_CHAMPIONS, SHURIMA_LEGENDS,
  NOXUS_MINIONS, NOXUS_ELITES, NOXUS_BOSSES, NOXUS_CHAMPIONS, NOXUS_LEGENDS,
  FRELJORD_MINIONS, FRELJORD_ELITES, FRELJORD_BOSSES,
  ZAUN_MINIONS, ZAUN_ELITES, ZAUN_BOSSES,
  IXTAL_MINIONS, IXTAL_ELITES, IXTAL_BOSSES,
  BANDLE_CITY_MINIONS, BANDLE_CITY_ELITES, BANDLE_CITY_BOSSES,
  BILGEWATER_MINIONS, BILGEWATER_ELITES, BILGEWATER_BOSSES,
  PILTOVER_MINIONS, PILTOVER_ELITES, PILTOVER_BOSSES,
  SHADOW_ISLES_MINIONS, SHADOW_ISLES_ELITES, SHADOW_ISLES_BOSSES,
  VOID_MINIONS, VOID_ELITES, VOID_BOSSES,
  TARGON_MINIONS, TARGON_ELITES, TARGON_BOSSES,
  MARAI_MINIONS, MARAI_ELITES, MARAI_BOSSES,
  ICE_SEA_MINIONS, ICE_SEA_ELITES, ICE_SEA_BOSSES,
  RUNETERRA_MINIONS, RUNETERRA_ELITES, RUNETERRA_BOSSES, RUNETERRA_CHAMPIONS, RUNETERRA_LEGENDS,
} from '../../shared/regions';
import './Index.css';

interface IndexProps {
  onBack: () => void;
}

type TabType = 'achievements' | 'enemies' | 'items' | 'weapons' | 'spells' | 'regions' | 'misc';
type EnemySortMode = 'faction' | 'region' | 'class' | 'tier';
type ItemSortMode = 'rarity' | 'lootType';
type LoadoutSortMode = 'rarity' | 'region' | 'type';

// Achievement definitions
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_victory', name: 'First Victory', description: 'Win your first battle', icon: '🎖️', unlocked: false },
  { id: 'ten_battles', name: 'Veteran', description: 'Win 10 battles', icon: '⚔️', unlocked: false },
  { id: 'fifty_battles', name: 'Champion', description: 'Win 50 battles', icon: '👑', unlocked: false },
  { id: 'complete_game', name: 'Victor', description: 'Complete a full game', icon: '🏆', unlocked: false },
  { id: 'five_games', name: 'Legend', description: 'Complete 5 games', icon: '⭐', unlocked: false },
  { id: 'discover_10_items', name: 'Collector', description: 'Discover 10 different items', icon: '🎁', unlocked: false },
  { id: 'discover_25_items', name: 'Hoarder', description: 'Discover 25 different items', icon: '💎', unlocked: false },
  { id: 'discover_all_items', name: 'Master Collector', description: 'Discover all items', icon: '✨', unlocked: false },
  { id: 'play_10_hours', name: 'Dedicated', description: 'Play for 10 hours', icon: '⏱️', unlocked: false },
  { id: 'survive_10_fails', name: 'Persistent', description: 'Fail 10 runs', icon: '💀', unlocked: false },
];

const RARITY_COLORS: Record<ItemRarity, string> = {
  starter: '#0f4c81',
  common: '#22c55e',
  epic: '#7dd3fc',
  legendary: '#ef4444',
  mythic: '#a855f7',
  ultimate: '#f97316',
  exalted: '#fbbf24',
  transcendent: '#f8fafc',
};

const REGION_NAMES: Record<Region, string> = {
  demacia: 'Demacia',
  ionia: 'Ionia',
  shurima: 'Shurima',
  noxus: 'Noxus',
  freljord: 'Freljord',
  zaun: 'Zaun',
  ixtal: 'Ixtal',
  bandle_city: 'Bandle City',
  bilgewater: 'Bilgewater',
  piltover: 'Piltover',
  shadow_isles: 'Shadow Isles',
  void: 'The Void',
  targon: 'Mount Targon',
  camavor: 'Camavor',
  ice_sea: 'Ice Sea',
  marai_territory: 'Marai Territory',
  runeterra: 'Runeterra',
};

const LOADOUT_RARITIES = ['starter', 'common', 'epic', 'legendary'] as const;

const LOADOUT_STAT_LABELS: Record<string, string> = {
  health: 'HP',
  armor: 'Armor',
  magicResist: 'MR',
  attackRange: 'Range',
  attackDamage: 'AD',
  speed: 'Speed',
  abilityPower: 'AP',
  movementSpeed: 'Move Speed',
};

const formatLoadoutStatName = (stat: string) =>
  LOADOUT_STAT_LABELS[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());

const formatLoadoutValue = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

const getEffectIcon = (effectType: string) => {
  switch (effectType) {
    case 'damage':
      return '💥';
    case 'heal':
      return '💚';
    case 'buff':
      return '✨';
    case 'debuff':
      return '🩸';
    case 'stun':
      return '💫';
    case 'movement':
      return '👟';
    case 'utility':
      return '🛠️';
    default:
      return '🔹';
  }
};

const formatEnemyLabel = (value: string) =>
  value
    .split(/[_-]/g)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getEnemyClassList = (enemyClass: unknown): string[] => {
  if (Array.isArray(enemyClass)) {
    return [...new Set(enemyClass.flatMap(value =>
      typeof value === 'string'
        ? value.split(/[\/,|]/g).map(part => part.trim()).filter(Boolean)
        : []
    ))];
  }

  if (typeof enemyClass === 'string') {
    return [...new Set(enemyClass.split(/[\/,|]/g).map(part => part.trim()).filter(Boolean))];
  }

  return ['unknown'];
};

const getItemLootCategory = (item: Item): string => {
  const stats = item.stats || {};

  if (item.consumable) return 'consumable';

  const hasPhysical = Boolean(
    stats.attackDamage ||
    stats.criticalChance ||
    stats.criticalDamage ||
    stats.lethality ||
    stats.lifeSteal ||
    stats.healingOnHit
  );
  const hasMagical = Boolean(
    stats.abilityPower ||
    stats.haste ||
    stats.magicPenetration ||
    stats.omnivamp ||
    stats.heal_shield_power
  );
  const hasTank = Boolean(
    stats.health ||
    stats.health_regen ||
    stats.armor ||
    stats.magicResist ||
    stats.tenacity
  );
  const hasMobility = Boolean(stats.movementSpeed || stats.attackRange);
  const hasUtility = Boolean(stats.magicFind || stats.goldGain || stats.xpGain);

  const activeTags = [hasPhysical, hasMagical, hasTank, hasMobility, hasUtility].filter(Boolean).length;

  if (activeTags > 1) return 'mixed';
  if (hasPhysical) return 'physical';
  if (hasMagical) return 'magical';
  if (hasTank) return 'tank';
  if (hasMobility) return 'mobility';
  if (hasUtility) return 'utility';

  return 'mixed';
};

const formatItemLootLabel = (lootCategory: string) => {
  switch (lootCategory) {
    case 'physical':
      return 'Physical';
    case 'magical':
      return 'Magical';
    case 'tank':
      return 'Tank';
    case 'mobility':
      return 'Mobility';
    case 'utility':
      return 'Utility';
    case 'consumable':
      return 'Consumable';
    case 'mixed':
    default:
      return 'Mixed';
  }
};

const getOriginRegionLabel = (originRegion?: Region) =>
  originRegion ? REGION_NAMES[originRegion] || formatEnemyLabel(originRegion) : 'Unknown Origin';

const getLoadoutEffectTypes = (entry: Weapon | Spell): string[] => {
  const effectTypes = entry.effects.map(effect => formatEnemyLabel(effect.type));

  return effectTypes.length > 0 ? [...new Set(effectTypes)] : ['Unknown'];
};

export const Index: React.FC<IndexProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [discoveredItems, setDiscoveredItems] = useState<string[]>([]);
  const [discoveredQuests, setDiscoveredQuests] = useState<string[]>([]);
  const [discoveredShopItems, setDiscoveredShopItems] = useState<string[]>([]);
  const [discoveredEnemies, setDiscoveredEnemies] = useState<string[]>([]);
  const [discoveredWeapons, setDiscoveredWeapons] = useState<string[]>([]);
  const [discoveredSpells, setDiscoveredSpells] = useState<string[]>([]);
  const [visitedRegions, setVisitedRegions] = useState<string[]>([]);
  const [enemySearch, setEnemySearch] = useState('');
  const [enemySortMode, setEnemySortMode] = useState<EnemySortMode>('faction');
  const [itemSearch, setItemSearch] = useState('');
  const [itemSortMode, setItemSortMode] = useState<ItemSortMode>('rarity');
  const [weaponSearch, setWeaponSearch] = useState('');
  const [weaponSortMode, setWeaponSortMode] = useState<LoadoutSortMode>('rarity');
  const [spellSearch, setSpellSearch] = useState('');
  const [spellSortMode, setSpellSortMode] = useState<LoadoutSortMode>('rarity');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    // Load profile data
    const profile = getActiveProfile();
    setDiscoveredItems(profile.stats.itemsDiscovered);
    setDiscoveredQuests(profile.stats.discoveredQuests || []);
    setDiscoveredShopItems(profile.stats.discoveredShopItems || []);
    setDiscoveredEnemies(profile.stats.discoveredEnemies || []);
    setDiscoveredWeapons(profile.stats.discoveredWeapons || []);
    setDiscoveredSpells(profile.stats.discoveredSpells || []);
    setVisitedRegions(profile.stats.visitedRegions || []);

    // Calculate achievement progress
    const updatedAchievements = ACHIEVEMENTS.map(achievement => {
      let unlocked = false;
      
      // Don't unlock achievements if disabled on profile
      if (profile.stats.achievementsDisabled) {
        return { ...achievement, unlocked: false };
      }

      switch (achievement.id) {
        case 'first_victory':
          unlocked = profile.stats.battlesWon >= 1;
          break;
        case 'ten_battles':
          unlocked = profile.stats.battlesWon >= 10;
          break;
        case 'fifty_battles':
          unlocked = profile.stats.battlesWon >= 50;
          break;
        case 'complete_game':
          unlocked = profile.stats.gamesCompleted >= 1;
          break;
        case 'five_games':
          unlocked = profile.stats.gamesCompleted >= 5;
          break;
        case 'discover_10_items':
          unlocked = profile.stats.itemsDiscovered.length >= 10;
          break;
        case 'discover_25_items':
          unlocked = profile.stats.itemsDiscovered.length >= 25;
          break;
        case 'discover_all_items':
          unlocked = profile.stats.itemsDiscovered.length >= Object.keys(ITEM_DATABASE).length;
          break;
        case 'play_10_hours':
          unlocked = profile.stats.hoursPlayed >= 10;
          break;
        case 'survive_10_fails':
          unlocked = profile.stats.runsFailed >= 10;
          break;
      }
      
      return { ...achievement, unlocked };
    });

    setAchievements(updatedAchievements);
  }, []);

  const isItemDiscovered = (itemId: string) => {
    // Starter items (except World Atlas) are always discovered/visible
    const alwaysVisibleStarters = ['dorans_blade', 'dorans_shield', 'dorans_ring'];
    if (alwaysVisibleStarters.includes(itemId)) return true;
    
    return discoveredItems.includes(itemId);
  };

  const isWeaponDiscovered = (weaponId: string) => discoveredWeapons.includes(weaponId);

  const isSpellDiscovered = (spellId: string) => discoveredSpells.includes(spellId);

  const renderSectionCounter = (discoveredCount: number, totalCount: number) => (
    <span className="section-counter">{discoveredCount}/{totalCount}</span>
  );

  const renderAchievements = () => {
    const profile = getActiveProfile();
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Achievements</h2>
          <p className="progress-text">
            {profile.stats.achievementsDisabled ? (
              <span className="achievements-disabled-notice">⚠️ Achievements disabled on this profile</span>
            ) : (
              `${unlockedCount} / ${achievements.length} Unlocked`
            )}
          </p>
        </div>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
              </div>
              {achievement.unlocked && <div className="unlock-badge">✓</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEnemies = () => {
    const allEnemies = [
      ...DEMACIA_MINIONS, ...DEMACIA_ELITES, ...DEMACIA_BOSSES, ...DEMACIA_CHAMPIONS, ...DEMACIA_LEGENDS,
      ...CAMAVOR_MINIONS, ...CAMAVOR_ELITES, ...CAMAVOR_BOSSES, ...CAMAVOR_CHAMPIONS, ...CAMAVOR_LEGENDS,
      ...IONIA_MINIONS, ...IONIA_ELITES, ...IONIA_BOSSES, ...IONIA_CHAMPIONS, ...IONIA_LEGENDS,
      ...SHURIMA_MINIONS, ...SHURIMA_ELITES, ...SHURIMA_BOSSES, ...SHURIMA_CHAMPIONS, ...SHURIMA_LEGENDS,
      ...NOXUS_MINIONS, ...NOXUS_ELITES, ...NOXUS_BOSSES, ...NOXUS_CHAMPIONS, ...NOXUS_LEGENDS,
      ...FRELJORD_MINIONS, ...FRELJORD_ELITES, ...FRELJORD_BOSSES,
      ...ZAUN_MINIONS, ...ZAUN_ELITES, ...ZAUN_BOSSES,
      ...IXTAL_MINIONS, ...IXTAL_ELITES, ...IXTAL_BOSSES,
      ...BANDLE_CITY_MINIONS, ...BANDLE_CITY_ELITES, ...BANDLE_CITY_BOSSES,
      ...BILGEWATER_MINIONS, ...BILGEWATER_ELITES, ...BILGEWATER_BOSSES,
      ...PILTOVER_MINIONS, ...PILTOVER_ELITES, ...PILTOVER_BOSSES,
      ...SHADOW_ISLES_MINIONS, ...SHADOW_ISLES_ELITES, ...SHADOW_ISLES_BOSSES,
      ...VOID_MINIONS, ...VOID_ELITES, ...VOID_BOSSES,
      ...TARGON_MINIONS, ...TARGON_ELITES, ...TARGON_BOSSES,
      ...MARAI_MINIONS, ...MARAI_ELITES, ...MARAI_BOSSES,
      ...ICE_SEA_MINIONS, ...ICE_SEA_ELITES, ...ICE_SEA_BOSSES,
      ...RUNETERRA_MINIONS, ...RUNETERRA_ELITES, ...RUNETERRA_BOSSES, ...RUNETERRA_CHAMPIONS, ...RUNETERRA_LEGENDS,
    ];

    const discoveredCount = allEnemies.filter(e => discoveredEnemies.includes(e.id)).length;
    const normalizedQuery = enemySearch.trim().toLowerCase();

    const filteredEnemies = allEnemies.filter(enemy => {
      if (!normalizedQuery) return true;
      if (!discoveredEnemies.includes(enemy.id)) return false;

      const searchableText = [
        enemy.name,
        enemy.faction,
        enemy.tier,
        REGION_NAMES[enemy.region as Region],
        ...getEnemyClassList(enemy.class),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    const groupedEnemies: Record<string, any[]> = {};
    filteredEnemies.forEach(enemy => {
      let groupKeys: string[] = [];

      switch (enemySortMode) {
        case 'region':
          groupKeys = [REGION_NAMES[enemy.region as Region] || 'Unknown'];
          break;
        case 'class':
          groupKeys = getEnemyClassList(enemy.class).map(formatEnemyLabel);
          break;
        case 'tier':
          groupKeys = [formatEnemyLabel(enemy.tier || 'unknown')];
          break;
        case 'faction':
        default:
          groupKeys = [formatEnemyLabel(enemy.faction || 'unknown')];
          break;
      }

      [...new Set(groupKeys)].forEach(groupKey => {
        if (!groupedEnemies[groupKey]) {
          groupedEnemies[groupKey] = [];
        }
        groupedEnemies[groupKey].push(enemy);
      });
    });

    const tierOrder: Record<string, number> = {
      Minion: 0,
      Elite: 1,
      Champion: 2,
      Boss: 3,
      Legend: 4,
      Unknown: 99,
    };

    const sortedGroups = Object.entries(groupedEnemies)
      .sort(([a], [b]) => {
        if (enemySortMode === 'tier') {
          return (tierOrder[a] ?? 99) - (tierOrder[b] ?? 99);
        }
        return a.localeCompare(b);
      })
      .map(([group, enemies]) => [
        group,
        [...enemies].sort((a, b) => {
          const aDiscovered = discoveredEnemies.includes(a.id);
          const bDiscovered = discoveredEnemies.includes(b.id);
          if (aDiscovered !== bDiscovered) return aDiscovered ? -1 : 1;
          const aName = aDiscovered ? a.name : a.id;
          const bName = bDiscovered ? b.name : b.id;
          return aName.localeCompare(bName);
        }),
      ] as const);

    const groupLabel = enemySortMode.charAt(0).toUpperCase() + enemySortMode.slice(1);

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Enemy Index</h2>
          <p className="progress-text">
            {discoveredCount} / {allEnemies.length} Discovered
            {normalizedQuery && ` • ${filteredEnemies.length} Match${filteredEnemies.length === 1 ? '' : 'es'}`}
          </p>
        </div>

        <div className="enemy-controls">
          <input
            className="enemy-search-input"
            type="text"
            value={enemySearch}
            onChange={(e) => setEnemySearch(e.target.value)}
            placeholder="Search discovered enemies..."
          />

          <label className="enemy-sort-label">
            <span>Group by</span>
            <select
              className="enemy-sort-select"
              value={enemySortMode}
              onChange={(e) => setEnemySortMode(e.target.value as EnemySortMode)}
            >
              <option value="faction">Faction</option>
              <option value="region">Region</option>
              <option value="class">Class</option>
              <option value="tier">Tier</option>
            </select>
          </label>
        </div>

        {sortedGroups.length === 0 ? (
          <div className="misc-placeholder">
            <h3>No enemies found</h3>
            <p>Try another search term or grouping option.</p>
          </div>
        ) : (
          sortedGroups.map(([group, enemies]) => {
            const groupDiscoveredCount = enemies.filter(enemy => discoveredEnemies.includes(enemy.id)).length;

            return (
            <div key={group} className="faction-section">
              <h3 className="faction-title">
                <span>{groupLabel}: {group}</span>
                {renderSectionCounter(groupDiscoveredCount, enemies.length)}
              </h3>
              <div className="enemies-list">
                {enemies.map(enemy => {
                  const isDiscovered = discoveredEnemies.includes(enemy.id);
                  const enemyClasses = getEnemyClassList(enemy.class).map(formatEnemyLabel).join(' / ');

                  return (
                    <div key={`${group}-${enemy.id}`} className={`enemy-card ${isDiscovered ? 'discovered' : 'undiscovered'}`}>
                      <div className="enemy-header">
                        <h3>{isDiscovered ? enemy.name : '???'}</h3>
                        <span className="enemy-class">{isDiscovered ? enemyClasses : '???'}</span>
                      </div>
                      {isDiscovered ? (
                        <>
                          <div className="enemy-stats">
                            <div className="enemy-stat">
                              <span className="stat-icon">❤️</span>
                              <span className="stat-label">HP:</span>
                              <span className="stat-value">{enemy.stats.health}</span>
                            </div>
                            <div className="enemy-stat">
                              <span className="stat-icon">⚔️</span>
                              <span className="stat-label">Attack:</span>
                              <span className="stat-value">{enemy.stats.attackDamage}</span>
                            </div>
                            <div className="enemy-stat">
                              <span className="stat-icon">🛡️</span>
                              <span className="stat-label">Armor:</span>
                              <span className="stat-value">{enemy.stats.armor}</span>
                            </div>
                            <div className="enemy-stat">
                              <span className="stat-icon">✨</span>
                              <span className="stat-label">MR:</span>
                              <span className="stat-value">{enemy.stats.magicResist}</span>
                            </div>
                          </div>
                          <div className="enemy-footer">
                            <span className="enemy-tier">{enemy.tier}</span>
                            <span className="enemy-region">📍 {REGION_NAMES[enemy.region as Region]}</span>
                          </div>
                        </>
                      ) : (
                        <div className="undiscovered-notice">
                          <p>❓ Defeat this enemy to unlock</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
          })
        )}
      </div>
    );
  };

  const renderItems = () => {
    const items = Object.values(ITEM_DATABASE).sort((a, b) => {
      const aDiscovered = isItemDiscovered(a.id);
      const bDiscovered = isItemDiscovered(b.id);
      if (aDiscovered !== bDiscovered) return aDiscovered ? -1 : 1;
      return (a.name || a.id).localeCompare(b.name || b.id);
    });

    const discoveredCount = items.filter(item => isItemDiscovered(item.id)).length;
    const normalizedQuery = itemSearch.trim().toLowerCase();

    const filteredItems = items.filter(item => {
      if (!normalizedQuery) return true;
      if (!isItemDiscovered(item.id)) return false;

      const searchableText = [
        item.name,
        item.description,
        item.rarity,
        formatItemLootLabel(getItemLootCategory(item)),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    const groupedItems: Record<string, Item[]> = {};
    filteredItems.forEach(item => {
      const groupKey = itemSortMode === 'lootType'
        ? formatItemLootLabel(getItemLootCategory(item))
        : item.rarity === 'common' && item.consumable
          ? 'Common Usables'
          : item.rarity === 'common'
            ? 'Common Items'
            : `${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} Items`;

      if (!groupedItems[groupKey]) {
        groupedItems[groupKey] = [];
      }
      groupedItems[groupKey].push(item);
    });

    const itemGroupOrder: Record<string, number> = {
      'Starter Items': 0,
      'Common Usables': 1,
      'Common Items': 2,
      'Epic Items': 3,
      'Legendary Items': 4,
      'Mythic Items': 5,
      'Ultimate Items': 6,
      'Exalted Items': 7,
      'Transcendent Items': 8,
      Mixed: 0,
      Physical: 1,
      Magical: 2,
      Tank: 3,
      Mobility: 4,
      Utility: 5,
      Consumable: 6,
    };

    const getItemGroupColor = (groupName: string) => {
      if (groupName.includes('Starter')) return RARITY_COLORS.starter;
      if (groupName.includes('Common')) return RARITY_COLORS.common;
      if (groupName.includes('Epic')) return RARITY_COLORS.epic;
      if (groupName.includes('Legendary')) return RARITY_COLORS.legendary;
      if (groupName.includes('Mythic')) return RARITY_COLORS.mythic;
      if (groupName.includes('Ultimate')) return RARITY_COLORS.ultimate;
      if (groupName.includes('Exalted')) return RARITY_COLORS.exalted;
      if (groupName.includes('Transcendent')) return RARITY_COLORS.transcendent;

      switch (groupName) {
        case 'Physical':
          return '#f87171';
        case 'Magical':
          return '#7dd3fc';
        case 'Tank':
          return '#22c55e';
        case 'Mobility':
          return '#fbbf24';
        case 'Utility':
          return '#c084fc';
        case 'Consumable':
          return '#fb7185';
        case 'Mixed':
        default:
          return '#4a9eff';
      }
    };

    const sortedGroups = Object.entries(groupedItems).sort(([a], [b]) => {
      return (itemGroupOrder[a] ?? 99) - (itemGroupOrder[b] ?? 99) || a.localeCompare(b);
    });

    const renderItemCard = (item: Item) => {
      const discovered = isItemDiscovered(item.id);
      const lootLabel = formatItemLootLabel(getItemLootCategory(item));
      
      return (
        <div
          key={item.id}
          className={`item-card rarity-${item.rarity} ${discovered ? 'discovered' : 'undiscovered'}`}
          onMouseEnter={() => {
            if (discovered) {
              setHoveredItemId(item.id);
            }
          }}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {discovered && item.imagePath && (
            <div className="item-image">
              <img src={item.imagePath} alt={item.name || item.id} />
            </div>
          )}
          <div 
            className="item-name"
            style={{ color: RARITY_COLORS[item.rarity] }}
          >
            {discovered ? item.name : '???'}
          </div>
          {discovered && (
            <div className="item-meta-line">
              {lootLabel} • {item.rarity}
            </div>
          )}
        </div>
      );
    };

    const renderTooltip = () => {
      if (!hoveredItemId) return null;
      
      const item = items.find(i => i.id === hoveredItemId);
      if (!item) return null;

      return createPortal(
        <div className="item-tooltip-portal">
          <div
            className="item-rarity"
            style={{
              color: RARITY_COLORS[item.rarity],
              border: `1px solid ${RARITY_COLORS[item.rarity]}`,
              background: `${RARITY_COLORS[item.rarity]}22`,
            }}
          >
            {item.rarity.toUpperCase()}
          </div>
          <div className="item-description">{item.description}</div>
          <div className="item-stats">
            {Object.entries(item.stats)
              .filter(([_, value]) => value && value > 0)
              .map(([stat, value]) => (
                <div key={stat} className="item-stat">
                  <span className="stat-name">{stat.replace(/_/g, ' ')}:</span>
                  <span className="stat-value">+{value}</span>
                </div>
              ))
            }
          </div>
          {item.passiveId && getPassiveDescription(item.passiveId) && (
            <div className="item-passive">
              <strong>Passive:</strong> {getPassiveDescription(item.passiveId)}
            </div>
          )}
        </div>,
        document.body
      );
    };

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Item Index</h2>
          <p className="progress-text">
            {discoveredCount} / {items.length} Discovered
            {normalizedQuery && ` • ${filteredItems.length} Match${filteredItems.length === 1 ? '' : 'es'}`}
          </p>
        </div>

        <div className="catalog-controls">
          <input
            className="catalog-search-input"
            type="text"
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            placeholder="Search discovered items..."
          />

          <label className="catalog-sort-label">
            <span>Group by</span>
            <select
              className="catalog-sort-select"
              value={itemSortMode}
              onChange={(e) => setItemSortMode(e.target.value as ItemSortMode)}
            >
              <option value="rarity">Rarity</option>
              <option value="lootType">Loot Type</option>
            </select>
          </label>
        </div>

        {renderTooltip()}

        {sortedGroups.length === 0 ? (
          <div className="misc-placeholder">
            <h3>No items found</h3>
            <p>Try another search term or grouping option.</p>
          </div>
        ) : (
          sortedGroups.map(([group, groupItems]) => (
            <div key={group} className="rarity-section">
              <h3 className="rarity-title" style={{ color: getItemGroupColor(group) }}>
                <span>{group}</span>
                {renderSectionCounter(groupItems.filter(item => isItemDiscovered(item.id)).length, groupItems.length)}
              </h3>
              <div className="items-grid">
                {groupItems.map(renderItemCard)}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderLoadoutIndex = (mode: 'weapons' | 'spells') => {
    const isWeaponMode = mode === 'weapons';
    const loadoutSearch = isWeaponMode ? weaponSearch : spellSearch;
    const setLoadoutSearch = isWeaponMode ? setWeaponSearch : setSpellSearch;
    const loadoutSortMode = isWeaponMode ? weaponSortMode : spellSortMode;
    const setLoadoutSortMode = isWeaponMode ? setWeaponSortMode : setSpellSortMode;

    const entries = isWeaponMode
      ? getAllWeapons().sort((a, b) => getWeaponName(a).localeCompare(getWeaponName(b)))
      : getAllSpells().sort((a, b) => getSpellName(a).localeCompare(getSpellName(b)));

    const discoveredCount = entries.filter(entry =>
      isWeaponMode ? isWeaponDiscovered(entry.id) : isSpellDiscovered(entry.id)
    ).length;

    const normalizedQuery = loadoutSearch.trim().toLowerCase();

    const filteredEntries = entries.filter(entry => {
      if (!normalizedQuery) return true;

      const discovered = isWeaponMode ? isWeaponDiscovered(entry.id) : isSpellDiscovered(entry.id);
      if (!discovered) return false;

      const searchableText = [
        isWeaponMode ? getWeaponName(entry as Weapon) : getSpellName(entry as Spell),
        isWeaponMode ? getWeaponDescription(entry as Weapon) : getSpellDescription(entry as Spell),
        entry.rarity,
        getOriginRegionLabel(entry.originRegion),
        ...getLoadoutEffectTypes(entry),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    const groupedEntries: Record<string, Array<Weapon | Spell>> = {};
    filteredEntries.forEach(entry => {
      const groupKeys = loadoutSortMode === 'type'
        ? getLoadoutEffectTypes(entry)
        : [
            loadoutSortMode === 'region'
              ? getOriginRegionLabel(entry.originRegion)
              : `${entry.rarity.charAt(0).toUpperCase() + entry.rarity.slice(1)} ${isWeaponMode ? 'Weapons' : 'Spells'}`
          ];

      [...new Set(groupKeys)].forEach(groupKey => {
        if (!groupedEntries[groupKey]) {
          groupedEntries[groupKey] = [];
        }
        groupedEntries[groupKey].push(entry as Weapon | Spell);
      });
    });

    const rarityOrder: Record<(typeof LOADOUT_RARITIES)[number], number> = {
      starter: 0,
      common: 1,
      epic: 2,
      legendary: 3,
    };

    const sortedGroups = Object.entries(groupedEntries)
      .sort(([a, entriesA], [b, entriesB]) => {
        if (loadoutSortMode === 'rarity') {
          return (rarityOrder[entriesA[0].rarity] ?? 99) - (rarityOrder[entriesB[0].rarity] ?? 99);
        }
        return a.localeCompare(b);
      })
      .map(([group, groupEntries]) => [
        group,
        [...groupEntries].sort((a, b) => {
          const aDiscovered = isWeaponMode ? isWeaponDiscovered(a.id) : isSpellDiscovered(a.id);
          const bDiscovered = isWeaponMode ? isWeaponDiscovered(b.id) : isSpellDiscovered(b.id);
          if (aDiscovered !== bDiscovered) return aDiscovered ? -1 : 1;
          const aName = isWeaponMode ? getWeaponName(a as Weapon) : getSpellName(a as Spell);
          const bName = isWeaponMode ? getWeaponName(b as Weapon) : getSpellName(b as Spell);
          return aName.localeCompare(bName);
        }),
      ] as const);

    const renderStatChips = (stats?: Weapon['stats']) => {
      if (!stats) return null;

      const statEntries = Object.entries(stats).filter(([, value]) => value !== undefined && value !== 0);
      if (statEntries.length === 0) return null;

      return (
        <div className="loadout-stat-list">
          {statEntries.map(([stat, value]) => (
            <span key={stat} className="loadout-stat-chip">
              +{formatLoadoutValue(value as number)} {formatLoadoutStatName(stat)}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>{isWeaponMode ? 'Weapon Index' : 'Spell Index'}</h2>
          <p className="progress-text">
            {discoveredCount} / {entries.length} Discovered
            {normalizedQuery && ` • ${filteredEntries.length} Match${filteredEntries.length === 1 ? '' : 'es'}`}
          </p>
        </div>

        <div className="catalog-controls">
          <input
            className="catalog-search-input"
            type="text"
            value={loadoutSearch}
            onChange={(e) => setLoadoutSearch(e.target.value)}
            placeholder={`Search discovered ${isWeaponMode ? 'weapons' : 'spells'}...`}
          />

          <label className="catalog-sort-label">
            <span>Group by</span>
            <select
              className="catalog-sort-select"
              value={loadoutSortMode}
              onChange={(e) => setLoadoutSortMode(e.target.value as LoadoutSortMode)}
            >
              <option value="rarity">Rarity</option>
              <option value="region">Region of Origin</option>
              <option value="type">Type</option>
            </select>
          </label>
        </div>

        {sortedGroups.length === 0 ? (
          <div className="misc-placeholder">
            <h3>No {isWeaponMode ? 'weapons' : 'spells'} found</h3>
            <p>Try another search term or grouping option.</p>
          </div>
        ) : (
          <div className="catalog-column">
            {sortedGroups.map(([group, groupEntries]) => (
              <div key={group} className="rarity-section">
                <h4 className="rarity-title" style={{ color: loadoutSortMode === 'rarity' ? RARITY_COLORS[groupEntries[0].rarity] : loadoutSortMode === 'type' ? '#4ade80' : '#4a9eff' }}>
                  <span>{loadoutSortMode === 'region' ? `Origin: ${group}` : loadoutSortMode === 'type' ? `Type: ${group}` : group}</span>
                  {renderSectionCounter(
                    groupEntries.filter(entry => isWeaponMode ? isWeaponDiscovered(entry.id) : isSpellDiscovered(entry.id)).length,
                    groupEntries.length
                  )}
                </h4>
                <div className="catalog-grid">
                  {groupEntries.map(entry => {
                    const discovered = isWeaponMode ? isWeaponDiscovered(entry.id) : isSpellDiscovered(entry.id);
                    const originRegion = getOriginRegionLabel(entry.originRegion);

                    return (
                      <div
                        key={entry.id}
                        className={`loadout-card rarity-${entry.rarity} ${isWeaponMode ? 'weapon-card' : 'spell-card'} ${discovered ? 'discovered' : 'undiscovered'}`}
                      >
                        <div className="loadout-card-header">
                          <div>
                            <h4 style={{ color: discovered ? RARITY_COLORS[entry.rarity] : 'rgba(255, 255, 255, 0.75)' }}>
                              {discovered
                                ? (isWeaponMode ? getWeaponName(entry as Weapon) : getSpellName(entry as Spell))
                                : '???'}
                            </h4>
                            <p className="loadout-card-description">
                              {discovered
                                ? (isWeaponMode ? getWeaponDescription(entry as Weapon) : getSpellDescription(entry as Spell))
                                : `Use this ${isWeaponMode ? 'weapon' : 'spell'} on this profile to reveal it.`}
                            </p>
                          </div>
                          <span
                            className="loadout-rarity-badge"
                            style={{
                              color: RARITY_COLORS[entry.rarity],
                              border: `1px solid ${RARITY_COLORS[entry.rarity]}`,
                              background: `${RARITY_COLORS[entry.rarity]}22`,
                            }}
                          >
                            {entry.rarity}
                          </span>
                        </div>

                        {discovered ? (
                          <>
                            {isWeaponMode ? (
                              <>
                                <div className="loadout-meta">
                                  <span>📍 {originRegion}</span>
                                  <span>🧩 {getLoadoutEffectTypes(entry).join(' / ')}</span>
                                  <span>⏳ {(entry as Weapon).cooldown ? `${(entry as Weapon).cooldown} turn CD` : 'No cooldown'}</span>
                                  <span>📏 {(entry as Weapon).stats?.attackRange ? `${(entry as Weapon).stats?.attackRange} range` : 'Base range'}</span>
                                </div>
                                {renderStatChips((entry as Weapon).stats)}
                              </>
                            ) : (
                              <div className="loadout-meta">
                                <span>📍 {originRegion}</span>
                                <span>🧩 {getLoadoutEffectTypes(entry).join(' / ')}</span>
                                <span>📏 {(entry as Spell).range ?? 500} range</span>
                                <span>⏳ {(entry as Spell).cooldown ? `${(entry as Spell).cooldown} turn CD` : 'No cooldown'}</span>
                                <span>🕒 {(entry as Spell).castTime ? `${formatLoadoutValue((entry as Spell).castTime as number)} turn cast` : 'Instant'}</span>
                                {(entry as Spell).areaOfEffect && <span>🎯 {(entry as Spell).areaOfEffect?.type} AoE</span>}
                              </div>
                            )}

                            <div className="loadout-effects-list">
                              {entry.effects.map((effect, index) => (
                                <div key={`${entry.id}-${index}`} className="loadout-effect">
                                  <span>{getEffectIcon(effect.type)}</span>
                                  <span>{effect.description}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="loadout-locked-notice">
                            {isWeaponMode ? '⚔️ Attack with this weapon once to unlock its full entry.' : '✨ Cast this spell once to unlock its full entry.'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMiscellaneous = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Miscellaneous</h2>
          <p className="progress-text">Reserved for future index entries</p>
        </div>

        <div className="misc-placeholder">
          <h3>Nothing here yet</h3>
          <p>This tab is ready for future systems that do not fit the other index categories.</p>
        </div>
      </div>
    );
  };

  const renderRegions = () => {
    const startingRegions: Region[] = ['demacia', 'ionia', 'shurima'];
    const endingRegions: Region[] = ['shadow_isles', 'void', 'targon'];
    const intermediateRegions = Object.keys(REGION_GRAPH).filter(
      r => !startingRegions.includes(r as Region) && !endingRegions.includes(r as Region)
    ) as Region[];

    const visitedStartingCount = startingRegions.filter(region => visitedRegions.includes(region)).length;
    const visitedIntermediateCount = intermediateRegions.filter(region => visitedRegions.includes(region)).length;
    const visitedEndingCount = endingRegions.filter(region => visitedRegions.includes(region)).length;

    // Helper function to find which regions lead TO this region
    const getRegionsLeadingTo = (targetRegion: Region): Region[] => {
      const leadingRegions: Region[] = [];
      Object.entries(REGION_GRAPH).forEach(([fromRegion, destinations]) => {
        if (destinations.includes(targetRegion)) {
          leadingRegions.push(fromRegion as Region);
        }
      });
      return leadingRegions;
    };

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Region Index</h2>
          <p className="progress-text">{visitedRegions.length} / {Object.keys(REGION_GRAPH).length} Visited</p>
        </div>
        
        <div className="regions-section">
          <h3 className="section-title">
            <span>Starting Regions</span>
            {renderSectionCounter(visitedStartingCount, startingRegions.length)}
          </h3>
          <div className="regions-list">
            {startingRegions.map(region => {
              const discoveredDestinations = REGION_GRAPH[region].filter(dest => 
                isConnectionDiscovered(region, dest)
              );
              const allQuests = getQuestsByRegion(region);
              const discoveredRegionQuests = allQuests.filter(q => discoveredQuests.includes(q.id));
              const regionsLeadingHere = getRegionsLeadingTo(region).filter(fromRegion =>
                isConnectionDiscovered(fromRegion, region)
              );
              
              return (
                <div key={region} className="region-card starting">
                  <h4>{REGION_NAMES[region]}</h4>
                  
                  {/* Travel Section */}
                  <div className="region-travel">
                    <div className="section-header">🗺️ Travel</div>
                    
                    {/* Is From */}
                    <div className="travel-subsection">
                      <span className="travel-label">Is from:</span>
                      {regionsLeadingHere.length > 0 ? (
                        <div className="connections-wrapper">
                          {regionsLeadingHere.map(fromRegion => (
                            <span key={fromRegion} className="connection-badge discovered">
                              {REGION_NAMES[fromRegion]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Starting region</span>
                      )}
                    </div>

                    {/* Leads To */}
                    <div className="travel-subsection">
                      <span className="travel-label">Leads to:</span>
                      {discoveredDestinations.length > 0 ? (
                        <div className="connections-wrapper">
                          {discoveredDestinations.map(destination => (
                            <span key={destination} className="connection-badge discovered">
                              {REGION_NAMES[destination]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Not yet discovered</span>
                      )}
                    </div>
                  </div>

                  {/* Quests */}
                  <div className="region-quests">
                    <div className="section-header">📜 Available Quests</div>
                    {discoveredRegionQuests.length > 0 ? (
                      <div className="quest-list">
                        {discoveredRegionQuests.map(quest => (
                          <div key={quest.id} className="quest-item">
                            <span className="quest-name">{quest.name}</span>
                            <span className="quest-paths">{quest.paths.length} paths</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-notice">No quests discovered yet</div>
                    )}
                  </div>

                  {/* Shop */}
                  <div className="region-shop">
                    <div className="section-header">🛒 Shop Items</div>
                    <div className="shop-items-list">
                      {discoveredShopItems.includes(`${region}:cloth_armor`) && (
                        <div className="shop-item">Cloth Armor</div>
                      )}
                      {discoveredShopItems.includes(`${region}:health_potion`) && (
                        <div className="shop-item">Health Potion</div>
                      )}
                      {discoveredShopItems.includes(`${region}:random_items`) && (
                        <div className="shop-item">Random Items</div>
                      )}
                      {!discoveredShopItems.some(item => item.startsWith(`${region}:`)) && (
                        <div className="empty-notice">No shop items discovered yet</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="regions-section">
          <h3 className="section-title">
            <span>Intermediate Regions</span>
            {renderSectionCounter(visitedIntermediateCount, intermediateRegions.length)}
          </h3>
          <div className="regions-list">
            {intermediateRegions.map(region => {
              const discoveredDestinations = REGION_GRAPH[region].filter(dest => 
                isConnectionDiscovered(region, dest)
              );
              const allQuests = getQuestsByRegion(region);
              const discoveredRegionQuests = allQuests.filter(q => discoveredQuests.includes(q.id));
              const regionsLeadingHere = getRegionsLeadingTo(region).filter(fromRegion =>
                isConnectionDiscovered(fromRegion, region)
              );
              
              return (
                <div key={region} className="region-card intermediate">
                  <h4>{REGION_NAMES[region]}</h4>
                  
                  {/* Travel Section */}
                  <div className="region-travel">
                    <div className="section-header">🗺️ Travel</div>
                    
                    {/* Is From */}
                    <div className="travel-subsection">
                      <span className="travel-label">Is from:</span>
                      {regionsLeadingHere.length > 0 ? (
                        <div className="connections-wrapper">
                          {regionsLeadingHere.map(fromRegion => (
                            <span key={fromRegion} className="connection-badge discovered">
                              {REGION_NAMES[fromRegion]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Not yet discovered</span>
                      )}
                    </div>

                    {/* Leads To */}
                    <div className="travel-subsection">
                      <span className="travel-label">Leads to:</span>
                      {discoveredDestinations.length > 0 ? (
                        <div className="connections-wrapper">
                          {discoveredDestinations.map(destination => (
                            <span key={destination} className="connection-badge discovered">
                              {REGION_NAMES[destination]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Not yet discovered</span>
                      )}
                    </div>
                  </div>

                  {/* Quests */}
                  <div className="region-quests">
                    <div className="section-header">📜 Available Quests</div>
                    {discoveredRegionQuests.length > 0 ? (
                      <div className="quest-list">
                        {discoveredRegionQuests.map(quest => (
                          <div key={quest.id} className="quest-item">
                            <span className="quest-name">{quest.name}</span>
                            <span className="quest-paths">{quest.paths.length} paths</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-notice">No quests discovered yet</div>
                    )}
                  </div>

                  {/* Shop */}
                  <div className="region-shop">
                    <div className="section-header">🛒 Shop Items</div>
                    <div className="shop-items-list">
                      {discoveredShopItems.includes(`${region}:cloth_armor`) && (
                        <div className="shop-item">Cloth Armor</div>
                      )}
                      {discoveredShopItems.includes(`${region}:health_potion`) && (
                        <div className="shop-item">Health Potion</div>
                      )}
                      {discoveredShopItems.includes(`${region}:random_items`) && (
                        <div className="shop-item">Random Items</div>
                      )}
                      {!discoveredShopItems.some(item => item.startsWith(`${region}:`)) && (
                        <div className="empty-notice">No shop items discovered yet</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="regions-section">
          <h3 className="section-title">
            <span>Ending Regions</span>
            {renderSectionCounter(visitedEndingCount, endingRegions.length)}
          </h3>
          <div className="regions-list">
            {endingRegions.map(region => {
              const discoveredDestinations = REGION_GRAPH[region].filter(dest => 
                isConnectionDiscovered(region, dest)
              );
              const allQuests = getQuestsByRegion(region);
              const discoveredRegionQuests = allQuests.filter(q => discoveredQuests.includes(q.id));
              const regionsLeadingHere = getRegionsLeadingTo(region).filter(fromRegion =>
                isConnectionDiscovered(fromRegion, region)
              );
              
              return (
                <div key={region} className="region-card ending">
                  <h4>{REGION_NAMES[region]}</h4>
                  
                  {/* Travel Section */}
                  <div className="region-travel">
                    <div className="section-header">🗺️ Travel</div>
                    
                    {/* Is From */}
                    <div className="travel-subsection">
                      <span className="travel-label">Is from:</span>
                      {regionsLeadingHere.length > 0 ? (
                        <div className="connections-wrapper">
                          {regionsLeadingHere.map(fromRegion => (
                            <span key={fromRegion} className="connection-badge discovered">
                              {REGION_NAMES[fromRegion]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Not yet discovered</span>
                      )}
                    </div>

                    {/* Leads To (Next Act) */}
                    <div className="travel-subsection">
                      <span className="travel-label">Next act starts at:</span>
                      {discoveredDestinations.length > 0 ? (
                        <div className="connections-wrapper">
                          {discoveredDestinations.map(destination => (
                            <span key={destination} className="connection-badge discovered">
                              {REGION_NAMES[destination]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-text">Not yet discovered</span>
                      )}
                    </div>
                  </div>

                  {/* Quests */}
                  <div className="region-quests">
                    <div className="section-header">📜 Available Quests</div>
                    {discoveredRegionQuests.length > 0 ? (
                      <div className="quest-list">
                        {discoveredRegionQuests.map(quest => (
                          <div key={quest.id} className="quest-item">
                            <span className="quest-name">{quest.name}</span>
                            <span className="quest-paths">{quest.paths.length} paths</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-notice">No quests discovered yet</div>
                    )}
                  </div>

                  {/* Shop */}
                  <div className="region-shop">
                    <div className="section-header">🛒 Shop Items</div>
                    <div className="shop-items-list">
                      {discoveredShopItems.includes(`${region}:cloth_armor`) && (
                        <div className="shop-item">Cloth Armor</div>
                      )}
                      {discoveredShopItems.includes(`${region}:health_potion`) && (
                        <div className="shop-item">Health Potion</div>
                      )}
                      {discoveredShopItems.includes(`${region}:random_items`) && (
                        <div className="shop-item">Random Items</div>
                      )}
                      {!discoveredShopItems.some(item => item.startsWith(`${region}:`)) && (
                        <div className="empty-notice">No shop items discovered yet</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="index-screen">
      <button className="back-btn" onClick={onBack}>
        ← Back to Menu
      </button>

      <div className="index-container">
        <h1 className="index-title">Game Index</h1>
        
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
          </button>
          <button
            className={`tab-btn ${activeTab === 'enemies' ? 'active' : ''}`}
            onClick={() => setActiveTab('enemies')}
          >
            👹 Enemies
          </button>
          <button
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            🎒 Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            ⚔️ Weapons
          </button>
          <button
            className={`tab-btn ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            ✨ Spells
          </button>
          <button
            className={`tab-btn ${activeTab === 'regions' ? 'active' : ''}`}
            onClick={() => setActiveTab('regions')}
          >
            🗺️ Regions
          </button>
          <button
            className={`tab-btn ${activeTab === 'misc' ? 'active' : ''}`}
            onClick={() => setActiveTab('misc')}
          >
            📦 Miscellaneous
          </button>
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'enemies' && renderEnemies()}
          {activeTab === 'items' && renderItems()}
          {activeTab === 'weapons' && renderLoadoutIndex('weapons')}
          {activeTab === 'spells' && renderLoadoutIndex('spells')}
          {activeTab === 'regions' && renderRegions()}
          {activeTab === 'misc' && renderMiscellaneous()}
        </div>
      </div>
    </div>
  );
};
