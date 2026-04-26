import React, { useEffect, useMemo } from 'react';
import { Character } from '@game/types';
import { CharacterStats } from '@utils/statsSystem';
import { useGameStore } from '@game/store';
import { getCharacterName, getSpellName, getWeaponName } from '../../../i18n/helpers';
import { getClassStatBonuses } from '@utils/statsSystem';
import { getWeaponById } from '@data/weapons';
import { getSpellById } from '@data/spells';
import { getItemById } from '@data/items';
import { getPassiveIdsFromInventory } from '@data/items';
import { getFamiliarById, getFamiliarMaxHp } from '@entities/Player/familiars';
import { getDefaultEnemyLoadout } from '@entities/ai/enemyAI';
import { CombatBuff, computeBuffDisplayValues } from '@utils/itemSystem';
import { StatsPanel } from '../../shared/StatusPanels/StatsPanel';
import { ItemsBar } from '../../shared/StatusPanels/ItemsBar';
import './EntityInspectPanel.css';

export type EntityInspectContext = 'battle' | 'index' | 'quest' | 'region' | 'reward' | 'build' | 'generic';

export interface EntityInspectTarget {
  id: string;
  kind: 'character' | 'familiar';
  context: EntityInspectContext;
  isRevealed?: boolean;
  character?: Character;
  familiarId?: string;
  familiarCurrentHp?: number;
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
  turnCounter?: number;
}

interface EntityInspectPanelProps {
  isOpen: boolean;
  targets: EntityInspectTarget[];
  activeTargetId: string | null;
  onClose: () => void;
  onSelectTarget: (targetId: string) => void;
}

const PRETTY_CLASS: Record<string, string> = {
  mage: 'Mage',
  vanguard: 'Vanguard',
  warden: 'Warden',
  juggernaut: 'Juggernaut',
  skirmisher: 'Skirmisher',
  assassin: 'Assassin',
  marksman: 'Marksman',
  enchanter: 'Enchanter',
};

const STAT_ABBREV: Partial<Record<string, string>> = {
  attackDamage: 'AD',
  abilityPower: 'AP',
  health: 'HP',
  armor: 'Armor',
  magicResist: 'MR',
  speed: 'Spd',
  criticalChance: 'Crit%',
  criticalDamage: 'CritDmg',
  lifeSteal: 'LS',
  omnivamp: 'OV',
  tenacity: 'Ten',
  haste: 'Haste',
  heal_shield_power: 'HSP',
  magicFind: 'MF',
  goldGain: 'Gold',
  xpGain: 'XP',
};

const PRETTY_TRIGGER: Record<string, string> = {
  turn: 'Acts every N turns',
  fight_start: 'At fight start',
  fight_end: 'At fight end',
};

const formatLabel = (value?: string): string => {
  if (!value) return 'Unknown';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatValue = (stat: keyof CharacterStats, value: number): string => {
  if (stat === 'speed') return value.toFixed(2);
  if (stat === 'goldGain' || stat === 'xpGain') return `${value.toFixed(1)}x`;
  if (
    stat === 'criticalChance' ||
    stat === 'criticalDamage' ||
    stat === 'lifeSteal' ||
    stat === 'omnivamp' ||
    stat === 'tenacity' ||
    stat === 'haste' ||
    stat === 'heal_shield_power' ||
    stat === 'magicFind'
  ) {
    return `${Math.round(value)}%`;
  }
  return Math.round(value).toString();
};

const mapBuffsToRows = (buffs: CombatBuff[] = [], turnCounter = 0, isDebuff = false): string[] => {
  return buffs.map((buff) => {
    const { totalAmount, maxDuration } = computeBuffDisplayValues(buff, turnCounter);
    const sign = totalAmount > 0 ? '+' : '';
    const duration = buff.isInfinite ? 'inf' : `${Math.max(0, maxDuration)}t`;
    return `${isDebuff ? 'Debuff' : 'Buff'}: ${buff.name} (${sign}${totalAmount.toFixed(1)} ${buff.stat}, ${duration}, x${buff.stacks.length})`;
  });
};

export const EntityInspectPanel: React.FC<EntityInspectPanelProps> = ({
  isOpen,
  targets,
  activeTargetId,
  onClose,
  onSelectTarget,
}) => {
  const { state } = useGameStore();

  const activeIndex = useMemo(
    () => Math.max(0, targets.findIndex((target) => target.id === activeTargetId)),
    [targets, activeTargetId]
  );
  const activeTarget = targets[activeIndex];

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft' && targets.length > 1) {
        const nextIndex = (activeIndex - 1 + targets.length) % targets.length;
        onSelectTarget(targets[nextIndex].id);
      }
      if (event.key === 'ArrowRight' && targets.length > 1) {
        const nextIndex = (activeIndex + 1) % targets.length;
        onSelectTarget(targets[nextIndex].id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, onSelectTarget, activeIndex, targets]);

  if (!isOpen || !activeTarget) return null;

  const canReveal = activeTarget.kind === 'familiar' || activeTarget.isRevealed !== false;
  const isCharacter = activeTarget.kind === 'character' && activeTarget.character;
  const isFamiliar = activeTarget.kind === 'familiar' && activeTarget.familiarId;

  const previousTarget = targets[(activeIndex - 1 + targets.length) % targets.length];
  const nextTarget = targets[(activeIndex + 1) % targets.length];

  const familiar = isFamiliar ? getFamiliarById(activeTarget.familiarId!) : undefined;

  const character = isCharacter ? activeTarget.character! : undefined;
  const characterName = character ? getCharacterName(character) : undefined;
  const resolvedCharacterArt = character
    ? (character.characterArt || (character.role === 'player' ? '/assets/global/images/player/miko1.png' : undefined))
    : undefined;
  const title = isCharacter
    ? `${character?.role === 'enemy' ? 'Enemy' : 'Player'} Inspect: ${canReveal ? characterName : 'Unknown Target'}`
    : `Familiar Inspect: ${familiar?.name || 'Unknown Familiar'}`;

  const loadout = character
    ? (character.role === 'enemy'
      ? (character.enemyLoadout || getDefaultEnemyLoadout())
      : {
          weapons: state.weapons,
          spells: state.spells,
          items: state.inventory.filter((entry) => getItemById(entry.itemId)?.consumable).map((entry) => entry.itemId),
          equippedWeaponIndex: state.equippedWeaponIndex,
          equippedSpellIndex: state.equippedSpellIndex,
        })
    : null;

  const equippedItems = character
    ? (character.role === 'player' ? state.inventory : (character.inventory || []))
    : [];

  const passiveLines = character
    ? (character.role === 'player'
      ? getPassiveIdsFromInventory(state.inventory).map((passiveId) => formatLabel(passiveId))
      : (character.inventory || [])
          .map((entry) => getItemById(entry.itemId)?.passiveId)
          .filter((passiveId): passiveId is string => Boolean(passiveId))
          .map((passiveId) => formatLabel(passiveId)))
    : [];

  const classBonuses = character ? getClassStatBonuses(character.class, character.level) : null;

  const buffRows = mapBuffsToRows(activeTarget.combatBuffs, activeTarget.turnCounter, false);
  const debuffRows = mapBuffsToRows(activeTarget.combatDebuffs, activeTarget.turnCounter, true);

  const familiarMaxHp = familiar ? getFamiliarMaxHp(familiar.id) : 0;
  const familiarCurrentHp = familiar
    ? Math.max(0, Math.min(activeTarget.familiarCurrentHp ?? familiarMaxHp, familiarMaxHp))
    : 0;

  return (
    <div className="entity-inspect-overlay" onClick={onClose}>
      <div className="entity-inspect-panel" onClick={(event) => event.stopPropagation()}>
        <div className="entity-inspect-header">
          <div>
            <h2>{title}</h2>
            {activeTarget.context && <p className="inspect-context-line">Context: {formatLabel(activeTarget.context)}</p>}
          </div>
          <div className="inspect-header-actions">
            {character?.role === 'enemy' && (
              <span className={`inspect-reveal-state ${canReveal ? 'revealed' : 'hidden'}`}>
                {canReveal ? 'Revealed' : 'Hidden by intel'}
              </span>
            )}
            <button type="button" className="inspect-close-button" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="entity-inspect-body">
          <section className="inspect-column inspect-identity-column">
            {isCharacter && (
              <>
                {resolvedCharacterArt && (
                  <div className="inspect-portrait-frame">
                    <img src={resolvedCharacterArt} alt={characterName} className="inspect-portrait" />
                  </div>
                )}
                <div className="inspect-identity-info">
                  <h3>{canReveal ? characterName : 'Unknown Enemy'}</h3>
                  <p>{formatLabel(character!.tier || character!.role)}</p>
                  {character!.role === 'enemy' && <p>Faction: {canReveal ? formatLabel(character!.faction || 'unknown') : '???'}</p>}
                  {character!.role === 'player' && <p>Faction: N/A</p>}
                  {character!.region && <p>Region: {formatLabel(character!.region)}</p>}
                </div>
              </>
            )}

            {isFamiliar && familiar && (
              <>
                {familiar.imagePath && (
                  <div className="inspect-portrait-frame">
                    <img src={familiar.imagePath} alt={familiar.name} className="inspect-portrait" />
                  </div>
                )}
                <div className="inspect-identity-info">
                  <h3>{familiar.name}</h3>
                  <p>{familiar.title}</p>
                  <p>Rarity: {formatLabel(familiar.rarity)}</p>
                  <p>Trigger: {PRETTY_TRIGGER[familiar.trigger] || formatLabel(familiar.trigger)}</p>
                  <p>{familiar.description}</p>
                </div>
              </>
            )}
          </section>

          <section className="inspect-column inspect-stats-column">
            {isCharacter && character && (
              <>
                <div className="inspect-hp-block">
                  <span className="inspect-hp-label">HP</span>
                  <span className="inspect-hp-value">
                    {canReveal ? `${Math.max(0, Math.round(character.hp))} / ${Math.max(1, Math.round(character.stats.health))}` : '??? / ???'}
                  </span>
                  <div className="inspect-hp-bar-track">
                    <div
                      className="inspect-hp-bar-fill"
                      style={{ width: canReveal ? `${Math.max(0, Math.min(100, (character.hp / Math.max(1, character.stats.health)) * 100))}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="inspect-class-line">
                  {canReveal && classBonuses ? (
                    <span className="inspect-class-chips">
                      <span className="inspect-class-name">{PRETTY_CLASS[character!.class] || formatLabel(character!.class)}</span>
                      {Object.entries(classBonuses)
                        .filter(([_, value]) => Boolean(value))
                        .map(([stat, value]) => (
                          <span key={stat} className="inspect-class-chip">
                            {value && value > 0 ? '+' : ''}{value} {STAT_ABBREV[stat] || formatLabel(stat)}
                          </span>
                        ))}
                    </span>
                  ) : (
                    <span className="inspect-class-name inspect-obscured-copy">Class hidden</span>
                  )}
                </div>

                <StatsPanel
                  character={character}
                  combatBuffs={activeTarget.combatBuffs}
                  combatDebuffs={activeTarget.combatDebuffs}
                  isRevealed={canReveal}
                  turnCounter={activeTarget.turnCounter}
                  detailedView
                />

                {activeTarget.context === 'battle' && (
                  <div className="inspect-buff-list">
                    <h4>Buffs And Debuffs</h4>
                    {[...buffRows, ...debuffRows].length > 0 ? (
                      <div className="inspect-stack-list">
                        {[...buffRows, ...debuffRows].map((line) => (
                          <div key={line} className="inspect-stack-row">{canReveal ? line : 'Hidden'}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="inspect-obscured-copy">No active combat modifiers.</p>
                    )}
                  </div>
                )}
              </>
            )}

            {isFamiliar && familiar && (
              <div className="inspect-familiar-stats">
                <div className="inspect-hp-block">
                  <span className="inspect-hp-label">HP</span>
                  <span className="inspect-hp-value">{Math.round(familiarCurrentHp)} / {Math.round(familiarMaxHp)}</span>
                  <div className="inspect-hp-bar-track">
                    <div
                      className="inspect-hp-bar-fill"
                      style={{ width: familiarMaxHp > 0 ? `${Math.max(0, Math.min(100, (familiarCurrentHp / familiarMaxHp) * 100))}%` : '0%' }}
                    />
                  </div>
                </div>
                <h4>Stats</h4>
                <div className="inspect-familiar-grid">
                  {Object.entries(familiar.stats).map(([key, value]) => (
                    <div key={key} className="inspect-inline-row">
                      <span>{formatLabel(key)}</span>
                      <span>{formatValue(key as keyof CharacterStats, Number(value))}</span>
                    </div>
                  ))}
                </div>
                <h4>Effect</h4>
                <p>{familiar.effect.description}</p>
                <p>
                  Base: {familiar.effect.baseAmount}
                  {familiar.effect.scalingStat ? ` | Scaling: ${formatLabel(familiar.effect.scalingStat)} x${familiar.effect.scalingRatio || 0}` : ''}
                </p>
              </div>
            )}
          </section>

          <section className="inspect-column inspect-loadout-column">
            <h4>Loadout</h4>
            {isCharacter && character && loadout ? (
              <>
                <div className="inspect-loadout-group">
                  <h5>Weapons</h5>
                  {loadout.weapons.length > 0 ? (
                    loadout.weapons.map((weaponId, index) => {
                      const weapon = getWeaponById(weaponId);
                      return (
                        <div key={`${weaponId}-${index}`} className="inspect-loadout-row">
                          <span>{canReveal ? getWeaponName(weaponId) : '???'}</span>
                          {index === loadout.equippedWeaponIndex && <span className="inspect-equipped-chip">Equipped</span>}
                          {weapon?.cooldown ? <span className="inspect-cooldown-chip">CD {weapon.cooldown}</span> : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="inspect-obscured-copy">No weapon data.</p>
                  )}
                </div>

                <div className="inspect-loadout-group">
                  <h5>Spells</h5>
                  {loadout.spells.length > 0 ? (
                    loadout.spells.map((spellId, index) => {
                      const spell = getSpellById(spellId);
                      return (
                        <div key={`${spellId}-${index}`} className="inspect-loadout-row">
                          <span>{canReveal ? getSpellName(spellId) : '???'}</span>
                          {index === loadout.equippedSpellIndex && <span className="inspect-equipped-chip">Equipped</span>}
                          {spell?.cooldown ? <span className="inspect-cooldown-chip">CD {spell.cooldown}</span> : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="inspect-obscured-copy">No spell data.</p>
                  )}
                </div>

                <div className="inspect-loadout-group">
                  <h5>Consumables</h5>
                  {loadout.items.length > 0 ? (
                    loadout.items.map((itemId, index) => {
                      const item = getItemById(itemId);
                      return (
                        <div key={`${itemId}-${index}`} className="inspect-loadout-row">
                          <span>{canReveal ? (item?.name || itemId) : '???'}</span>
                          {item?.active?.cooldown ? <span className="inspect-cooldown-chip">CD {item.active.cooldown}</span> : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="inspect-obscured-copy">No consumables equipped.</p>
                  )}
                </div>

                <div className="inspect-loadout-group">
                  <h5>Passives</h5>
                  {passiveLines.length > 0 ? (
                    passiveLines.map((passive) => <div key={passive} className="inspect-loadout-row"><span>{canReveal ? passive : '???'}</span></div>)
                  ) : (
                    <p className="inspect-obscured-copy">No passive entries.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="inspect-loadout-group">
                <h5>Familiar Behavior</h5>
                <p>{familiar?.attackPattern || 'Unknown pattern'}</p>
                {familiar?.intervalTurns ? <p>Interval: every {familiar.intervalTurns} turns</p> : null}
              </div>
            )}
          </section>
        </div>

        <div className="entity-inspect-footer">
          <ItemsBar
            inventory={equippedItems}
            isRevealed={canReveal}
          />
        </div>

        <div className="entity-inspect-nav-strip">
          <button type="button" onClick={() => onSelectTarget(previousTarget.id)} disabled={targets.length <= 1}>Prev</button>
          <div className="inspect-nav-middle">{activeIndex + 1} / {targets.length}</div>
          <button type="button" onClick={() => onSelectTarget(nextTarget.id)} disabled={targets.length <= 1}>Next</button>
        </div>
      </div>
    </div>
  );
};
