import React, { useState } from 'react';
import { useGameStore } from '../../game/store';
import { useTranslation } from '../../hooks/useTranslation';
import { HealthDisplay } from './HealthDisplay';
import { LevelDisplay } from './LevelDisplay';
import { BuffsDisplay } from './BuffsDisplay';
import { ItemsBar } from './ItemsBar';
import { StatsPanel } from './StatsPanel';
import { getClassStatBonuses } from '../../game/statsSystem';
import { CombatBuff, computeBuffDisplayValues } from '../../game/itemSystem';
import { getWeaponById } from '../../game/weapons';
import { getSpellById } from '../../game/spells';
import { getDefaultEnemyLoadout } from '../../game/enemyAI';
import { getCharacterName } from '../../i18n/helpers';
import type { StatsPanelProps } from './StatsPanel';
import './CharacterStatus.css';

const CLASS_ICONS: Record<string, string> = {
  mage: '✨',
  vanguard: '🛡️',
  warden: '🧙',
  juggernaut: '⚔️',
  skirmisher: '💨',
  assassin: '🗡️',
  marksman: '🏹',
  enchanter: '✨',
};

const FACTION_ICONS: Record<string, string> = {
  guard: '🛡️',
  beast: '🐾',
  legion: '🪖',
  warband: '🪓',
  assassin: '🗡️',
  magic: '🔮',
  demacian_champion: '👑',
  spirit: '👻',
  shadow: '🌑',
  martial: '🥋',
  vastayan: '🦊',
  undead: '💀',
  ruined: '⛓️',
  marai: '🌊',
  construct: '🏺',
  mortal: '🧭',
  frostborn: '❄️',
  criminal: '🎭',
  mercenary: '💰',
  void: '🕳️',
  dragon: '🐉',
  elemental: '🌪️',
  wanderer: '🥾',
  none: '❔',
  unknown: '❔',
};

const REGION_ICONS: Record<string, string> = {
  demacia: '🦁',
  ionia: '🍃',
  shurima: '☀️',
  noxus: '🩸',
  freljord: '❄️',
  zaun: '🧪',
  ixtal: '🌿',
  bandle_city: '🍄',
  bilgewater: '⚓',
  piltover: '⚙️',
  shadow_isles: '👻',
  void: '🕳️',
  targon: '⭐',
  camavor: '🌘',
  ice_sea: '🧊',
  marai_territory: '🌊',
  runeterra: '🌍',
};

type TooltipTone = 'class' | 'weapon' | 'spell' | 'faction';

interface HoverInfo {
  title: string;
  subtitle?: string;
  lines?: string[];
  tone: TooltipTone;
}

const prettifyLabel = (value?: string): string => {
  if (!value) return 'Unknown';
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getEnemyTierClass = (tier?: string): string => {
  switch (tier) {
    case 'elite':
      return 'enemy-tier-elite';
    case 'champion':
      return 'enemy-tier-champion';
    case 'boss':
      return 'enemy-tier-boss';
    case 'legend':
      return 'enemy-tier-legend';
    case 'minion':
    default:
      return 'enemy-tier-minion';
  }
};

export const CharacterStatus: React.FC<{ 
  characterId?: string; 
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
  isRevealed?: boolean; // For stealth/control ward mechanic - enemy visibility
  turnCounter?: number; // Actual turn counter for accurate duration display
}> = ({ characterId, combatBuffs, combatDebuffs, isRevealed = true, turnCounter = 0 }) => {
  const { state } = useGameStore();
  const t = useTranslation();
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Map class names to translations
  const getClassName = (classType: string): string => {
    const classMap: Record<string, keyof typeof t.common> = {
      mage: 'mage',
      vanguard: 'vanguard',
      warden: 'warden',
      juggernaut: 'juggernaut',
      skirmisher: 'skirmisher',
      assassin: 'assassin',
      marksman: 'marksman',
      enchanter: 'enchanter',
    };
    return t.common[classMap[classType]] || classType;
  };

  // Map stat names to translated names
  const getStatDisplayName = (statName: string): string => {
    const statMap: Record<string, keyof typeof t.common> = {
      health: 'health',
      attackDamage: 'attackDamage',
      abilityPower: 'abilityPower',
      armor: 'armor',
      magicResist: 'magicResist',
      speed: 'speed',
      attackRange: 'attackRange',
      criticalChance: 'criticalChance',
      criticalDamage: 'criticalDamage',
      haste: 'haste',
      lifeSteal: 'lifeSteal',
      omnivamp: 'omnivamp',
      movementSpeed: 'movementSpeed',
      tenacity: 'tenacity',
    };
    return t.common[statMap[statName]] || statName;
  };
  
  const character = characterId
    ? state.enemyCharacters.find((c) => c.id === characterId)
    : state.playerCharacter;

  if (!character) return null;

  const isEnemy = character.role === 'enemy';
  const displayName = getCharacterName(character);
  const enemyLoadout = isEnemy ? (character.enemyLoadout || getDefaultEnemyLoadout()) : null;
  const equippedWeaponId = isEnemy
    ? enemyLoadout?.weapons[enemyLoadout.equippedWeaponIndex]
    : state.weapons[state.equippedWeaponIndex];
  const equippedSpellId = isEnemy
    ? enemyLoadout?.spells[enemyLoadout.equippedSpellIndex]
    : state.spells[state.equippedSpellIndex];
  const equippedWeapon = equippedWeaponId ? getWeaponById(equippedWeaponId) : undefined;
  const equippedSpell = equippedSpellId ? getSpellById(equippedSpellId) : undefined;

  const rawFaction = character.faction || (!isEnemy ? (state.selectedRegion || character.region) : character.region) || 'unknown';
  const factionLabel = prettifyLabel(rawFaction);
  const factionIcon = FACTION_ICONS[rawFaction] || REGION_ICONS[rawFaction] || '🌍';

  const formatStatValue = (statName: string, value: number): string => {
    const decimalStats = ['speed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'haste', 'health_regen', 'heal_shield_power', 'magicFind'];
    const isDecimalStat = decimalStats.includes(statName);
    const numericValue = isDecimalStat && !Number.isInteger(value) ? value.toFixed(Math.abs(value) < 1 ? 2 : 1) : Math.round(value).toString();
    return `${value > 0 ? '+' : ''}${numericValue} ${getStatDisplayName(statName)}`;
  };

  const showTooltip = (
    info: HoverInfo,
    event: React.MouseEvent<HTMLElement>,
    allowWhenHidden = false
  ) => {
    if (!isRevealed && !allowWhenHidden) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setHoveredInfo(info);
  };

  const hideTooltip = () => setHoveredInfo(null);

  const classBonuses = getClassStatBonuses(character.class, character.level);
  const classTooltip: HoverInfo = {
    title: `${getClassName(character.class)} (Lvl ${character.level})`,
    tone: 'class',
    lines: Object.entries(classBonuses)
      .filter(([_, value]) => value && value !== 0)
      .map(([stat, value]) => formatStatValue(stat, value as number)),
  };

  const weaponTooltip: HoverInfo | null = equippedWeapon ? {
    title: equippedWeapon.name || 'Weapon',
    subtitle: 'Weapon',
    tone: 'weapon',
    lines: [
      ...(equippedWeapon.description ? [equippedWeapon.description] : []),
      ...Object.entries(equippedWeapon.stats || {}).map(([stat, value]) => formatStatValue(stat, value as number)),
      ...equippedWeapon.effects.map(effect => effect.description),
      ...(equippedWeapon.cooldown && equippedWeapon.cooldown > 0 ? [`Cooldown: ${equippedWeapon.cooldown} turn${equippedWeapon.cooldown > 1 ? 's' : ''}`] : []),
    ],
  } : null;

  const spellTooltip: HoverInfo | null = equippedSpell ? {
    title: equippedSpell.name || 'Spell',
    subtitle: 'Spell',
    tone: 'spell',
    lines: [
      ...(equippedSpell.description ? [equippedSpell.description] : []),
      ...equippedSpell.effects.map(effect => effect.description),
      ...(equippedSpell.range ? [`Range: ${equippedSpell.range} units`] : []),
      ...(equippedSpell.castTime && equippedSpell.castTime > 0 ? [`Cast time: ${equippedSpell.castTime} turn${equippedSpell.castTime > 1 ? 's' : ''}`] : []),
      ...(equippedSpell.cooldown && equippedSpell.cooldown > 0 ? [`Cooldown: ${equippedSpell.cooldown} turn${equippedSpell.cooldown > 1 ? 's' : ''}`] : []),
    ],
  } : null;

  const factionTooltip: HoverInfo = {
    title: factionLabel,
    subtitle: character.faction ? 'Faction' : 'Origin',
    tone: 'faction',
    lines: character.region && character.region !== rawFaction ? [`Region: ${prettifyLabel(character.region)}`] : undefined,
  };

  const renderIconBadge = (
    icon: string,
    info: HoverInfo,
    className: string,
    shouldHideWhenUnrevealed = true,
    allowTooltipWhenHidden = false
  ) => (
    <button
      type="button"
      className={`status-icon-badge ${className} ${!isRevealed && shouldHideWhenUnrevealed ? 'blurred-status-badge' : ''}`}
      onMouseEnter={(event) => showTooltip(info, event, allowTooltipWhenHidden)}
      onMouseLeave={hideTooltip}
      aria-label={info.title}
    >
      <span className="status-icon">{!isRevealed && shouldHideWhenUnrevealed ? '?' : icon}</span>
    </button>
  );

  const classBadge = renderIconBadge(CLASS_ICONS[character.class], classTooltip, 'class-badge');
  const factionBadge = renderIconBadge(factionIcon, factionTooltip, 'faction-badge', false, true);
  const weaponBadge = weaponTooltip ? renderIconBadge('⚔️', weaponTooltip, 'weapon-badge') : null;
  const spellBadge = spellTooltip ? renderIconBadge('✦', spellTooltip, 'spell-badge') : null;

  const statsPanelProps: Pick<StatsPanelProps, 'classBadge' | 'weaponBadge' | 'spellBadge'> = {
    classBadge,
    weaponBadge,
    spellBadge,
  };

  // Convert CombatBuffs to TemporaryStatModifiers for BuffsDisplay (NEW STACKING SYSTEM)
  const temporaryStats = combatBuffs?.map(buff => {
    const { totalAmount, maxDuration } = computeBuffDisplayValues(buff, turnCounter);
    
    // Decimal stats (xpGain, goldGain, magicFind, etc.) should not be forced to min 1 or rounded
    const decimalStats = ['speed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'haste', 'health_regen', 'heal_shield_power', 'magicFind'];
    const isDecimalStat = decimalStats.includes(buff.stat);
    
    return {
      statName: buff.stat,
      value: isDecimalStat ? totalAmount : Math.max(1, Math.round(totalAmount)), // Keep decimals for decimal stats
      source: buff.name,
      duration: buff.isInfinite ? -1 : maxDuration, // -1 for infinite, otherwise longest remaining
      isDebuff: false,
      stackCount: buff.stacks.length, // Track number of stacks for display
    };
  }) || [];

  // Log display stats for debugging
  if (character.role === 'player' && temporaryStats.length > 0) {
    console.log('📊 PLAYER BUFF DISPLAY:', {
      total: temporaryStats.length,
      buffs: temporaryStats.map(t => ({ source: t.source, value: t.value, stacks: t.stackCount, duration: t.duration })),
    });
  }

  // Convert CombatDebuffs to TemporaryStatModifiers for BuffsDisplay (NEW STACKING SYSTEM)
  const temporaryDebuffs = combatDebuffs?.map(debuff => {
    const { totalAmount, maxDuration } = computeBuffDisplayValues(debuff, turnCounter);
    return {
      statName: debuff.stat,
      value: Math.round(totalAmount), // Total of all active stacks (can be negative)
      source: debuff.name,
      duration: debuff.isInfinite ? -1 : maxDuration,
      isDebuff: true,
      stackCount: debuff.stacks.length,
    };
  }) || [];

  // Convert character.effects (StatusEffect) to TemporaryStatModifiers
  const statusEffectBuffs = character.effects
    ?.filter(effect => effect.type === 'buff')
    .map(effect => ({
      statName: effect.statModifiers?.attackDamage ? 'attackDamage' : 
                 effect.statModifiers?.abilityPower ? 'abilityPower' :
                 effect.statModifiers?.health ? 'health' : 'health',
      value: effect.statModifiers?.attackDamage || effect.statModifiers?.abilityPower || effect.statModifiers?.health || 0,
      source: effect.name,
      duration: effect.duration,
      isDebuff: false,
    })) || [];

  // Convert character.effects debuffs to TemporaryStatModifiers
  const statusEffectDebuffs = character.effects
    ?.filter(effect => effect.type === 'debuff')
    .map(effect => ({
      statName: 'debuff',
      value: 0,
      source: effect.name,
      duration: effect.duration,
      isDebuff: true,
    })) || [];

  // Combine all buffs and debuffs
  const allTemporaryStats = [...temporaryStats, ...temporaryDebuffs, ...statusEffectBuffs, ...statusEffectDebuffs];

  return (
    <div className={`character-status ${character.role === 'enemy' ? 'enemy-status' : 'player-status'}`}>
      <div className="character-status-layout">
        <div className="character-main-content">
          <div className="character-top-row">
            <div className="character-header-wrap">
              <div className="character-header">
                {isEnemy ? (
                  <div className="status-name-group enemy-name-group">
                    <h2 className={`character-name ${getEnemyTierClass(character.tier)}`}>{displayName}</h2>
                    {factionBadge}
                  </div>
                ) : (
                  <div className="status-name-group">
                    {factionBadge}
                    <h2 className="character-name">{displayName}</h2>
                  </div>
                )}

                {hoveredInfo && (isRevealed || hoveredInfo.tone === 'faction') && (
                  <div
                    className={`class-tooltip status-hover-tooltip ${hoveredInfo.tone}`}
                    style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
                  >
                    <div className="tooltip-title">{hoveredInfo.title}</div>
                    {hoveredInfo.subtitle && <div className="tooltip-subtitle">{hoveredInfo.subtitle}</div>}
                    {hoveredInfo.lines && hoveredInfo.lines.length > 0 && (
                      <div className="tooltip-stats">
                        {hoveredInfo.lines.map((line, index) => (
                          <div key={`${hoveredInfo.title}-${index}`} className="tooltip-stat">
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`status-art-slot ${character.role === 'enemy' ? 'enemy-art-slot' : 'player-art-slot'}`}>
            {character.role === 'enemy' ? 'Enemy Art Slot' : 'Player Art Slot'}
          </div>

          <div className="character-bottom-row">
            <ItemsBar inventory={characterId ? character.inventory : state.inventory} isRevealed={isRevealed} />
            <LevelDisplay character={character} />
            <HealthDisplay character={character} />
          </div>
        </div>

        <div className="status-stats-container">
          <StatsPanel
            character={character}
            combatBuffs={combatBuffs}
            combatDebuffs={combatDebuffs}
            isRevealed={isRevealed}
            turnCounter={turnCounter}
            {...statsPanelProps}
          />
        </div>

        <div className="status-buffs-container">
          <BuffsDisplay temporaryStats={allTemporaryStats} />
        </div>
      </div>
    </div>
  );
};
