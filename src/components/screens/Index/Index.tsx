import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getActiveProfile, isConnectionDiscovered } from '../../../game/profileSystem';
import { ITEM_DATABASE, ItemRarity, getPassiveDescription } from '../../../game/items';
import { REGION_GRAPH } from '../../../game/regionGraph';
import { getQuestsByRegion } from '../../../game/questDatabase';
import { Region } from '../../../game/types';
import { DEMACIA_MINIONS, DEMACIA_ELITES, DEMACIA_BOSSES } from '../../../game/regions/demacia/enemies';
import { CAMAVOR_MINIONS, CAMAVOR_ELITES, CAMAVOR_BOSSES } from '../../../game/regions/camavor/enemies';
import './Index.css';

interface IndexProps {
  onBack: () => void;
}

type TabType = 'achievements' | 'enemies' | 'items' | 'regions';

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
  starter: '#808080',
  common: '#ffffff',
  epic: '#a335ee',
  legendary: '#ff8000',
  mythic: '#e6cc80',
  ultimate: '#00ff96',
  exalted: '#ff0080',
  transcendent: '#00d9ff',
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

export const Index: React.FC<IndexProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [discoveredItems, setDiscoveredItems] = useState<string[]>([]);
  const [discoveredQuests, setDiscoveredQuests] = useState<string[]>([]);
  const [discoveredShopItems, setDiscoveredShopItems] = useState<string[]>([]);
  const [discoveredEnemies, setDiscoveredEnemies] = useState<string[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  useEffect(() => {
    // Load profile data
    const profile = getActiveProfile();
    setDiscoveredItems(profile.stats.itemsDiscovered);
    setDiscoveredQuests(profile.stats.discoveredQuests || []);
    setDiscoveredShopItems(profile.stats.discoveredShopItems || []);
    setDiscoveredEnemies(profile.stats.discoveredEnemies || []);

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
    // Collect all enemies from all regions
    const allEnemies = [
      ...DEMACIA_MINIONS,
      ...DEMACIA_ELITES,
      ...DEMACIA_BOSSES,
      ...CAMAVOR_MINIONS,
      ...CAMAVOR_ELITES,
      ...CAMAVOR_BOSSES,
    ];

    // Group enemies by faction
    const enemiesByFaction: Record<string, any[]> = {};
    allEnemies.forEach(enemy => {
      const faction = enemy.faction || 'Unknown';
      if (!enemiesByFaction[faction]) {
        enemiesByFaction[faction] = [];
      }
      enemiesByFaction[faction].push(enemy);
    });

    const discoveredCount = allEnemies.filter(e => discoveredEnemies.includes(e.id)).length;

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Enemy Index</h2>
          <p className="progress-text">{discoveredCount} / {allEnemies.length} Discovered</p>
        </div>
        
        {Object.entries(enemiesByFaction).map(([faction, enemies]) => (
          <div key={faction} className="faction-section">
            <h3 className="faction-title">Faction: {faction.charAt(0).toUpperCase() + faction.slice(1)}</h3>
            <div className="enemies-list">
              {enemies.map(enemy => {
                const isDiscovered = discoveredEnemies.includes(enemy.id);
                
                return (
                  <div key={enemy.id} className={`enemy-card ${isDiscovered ? 'discovered' : 'undiscovered'}`}>
                    <div className="enemy-header">
                      <h3>{isDiscovered ? enemy.name : '???'}</h3>
                      <span className="enemy-class">{isDiscovered ? enemy.class : '???'}</span>
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
        ))}
      </div>
    );
  };

  const renderItems = () => {
    const items = Object.values(ITEM_DATABASE);
    const discoveredCount = items.filter(item => isItemDiscovered(item.id)).length;

    // Group items by rarity
    const itemsByRarity: Record<ItemRarity, typeof items> = {
      starter: [],
      common: [],
      epic: [],
      legendary: [],
      mythic: [],
      ultimate: [],
      exalted: [],
      transcendent: [],
    };

    items.forEach(item => {
      itemsByRarity[item.rarity].push(item);
    });

    // Further separate common items into usables and equipment
    const commonUsables = itemsByRarity.common.filter(item => item.consumable);
    const commonEquipment = itemsByRarity.common.filter(item => !item.consumable);

    const renderItemCard = (item: typeof items[0]) => {
      const discovered = isItemDiscovered(item.id);
      
      return (
        <div
          key={item.id}
          className={`item-card ${discovered ? 'discovered' : 'undiscovered'}`}
          onMouseEnter={() => {
            if (discovered) {
              setHoveredItemId(item.id);
            }
          }}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {discovered && item.imagePath && (
            <div className="item-image">
              <img src={item.imagePath} alt={item.name} />
            </div>
          )}
          <div 
            className="item-name"
            style={{ color: RARITY_COLORS[item.rarity] }}
          >
            {discovered ? item.name : '???'}
          </div>
        </div>
      );
    };

    // Render tooltip separately using portal
    const renderTooltip = () => {
      if (!hoveredItemId) return null;
      
      const item = items.find(i => i.id === hoveredItemId);
      if (!item) return null;

      return createPortal(
        <div className="item-tooltip-portal">
          <div className="item-rarity">{item.rarity.toUpperCase()}</div>
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
          <p className="progress-text">{discoveredCount} / {items.length} Discovered</p>
        </div>

        {renderTooltip()}

        {/* Starter Items */}
        {itemsByRarity.starter.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.starter }}>Starter Items</h3>
            <div className="items-grid">
              {itemsByRarity.starter.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Common Usables */}
        {commonUsables.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.common }}>Common Usables</h3>
            <div className="items-grid">
              {commonUsables.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Common Equipment */}
        {commonEquipment.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.common }}>Common Items</h3>
            <div className="items-grid">
              {commonEquipment.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Epic Items */}
        {itemsByRarity.epic.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.epic }}>Epic Items</h3>
            <div className="items-grid">
              {itemsByRarity.epic.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Legendary Items */}
        {itemsByRarity.legendary.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.legendary }}>Legendary Items</h3>
            <div className="items-grid">
              {itemsByRarity.legendary.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Mythic Items */}
        {itemsByRarity.mythic.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.mythic }}>Mythic Items</h3>
            <div className="items-grid">
              {itemsByRarity.mythic.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Ultimate Items */}
        {itemsByRarity.ultimate.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.ultimate }}>Ultimate Items</h3>
            <div className="items-grid">
              {itemsByRarity.ultimate.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Exalted Items */}
        {itemsByRarity.exalted.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.exalted }}>Exalted Items</h3>
            <div className="items-grid">
              {itemsByRarity.exalted.map(renderItemCard)}
            </div>
          </div>
        )}

        {/* Transcendent Items */}
        {itemsByRarity.transcendent.length > 0 && (
          <div className="rarity-section">
            <h3 className="rarity-title" style={{ color: RARITY_COLORS.transcendent }}>Transcendent Items</h3>
            <div className="items-grid">
              {itemsByRarity.transcendent.map(renderItemCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRegions = () => {
    const startingRegions: Region[] = ['demacia', 'ionia', 'shurima'];
    const endingRegions: Region[] = ['shadow_isles', 'void', 'targon'];
    const intermediateRegions = Object.keys(REGION_GRAPH).filter(
      r => !startingRegions.includes(r as Region) && !endingRegions.includes(r as Region)
    ) as Region[];

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
          <p className="progress-text">{Object.keys(REGION_GRAPH).length} Regions</p>
        </div>
        
        <div className="regions-section">
          <h3 className="section-title">Starting Regions</h3>
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
          <h3 className="section-title">Intermediate Regions</h3>
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
          <h3 className="section-title">Ending Regions (Act Completion)</h3>
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
            ⚔️ Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'regions' ? 'active' : ''}`}
            onClick={() => setActiveTab('regions')}
          >
            🗺️ Regions
          </button>
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'achievements' && renderAchievements()}
          {activeTab === 'enemies' && renderEnemies()}
          {activeTab === 'items' && renderItems()}
          {activeTab === 'regions' && renderRegions()}
        </div>
      </div>
    </div>
  );
};
