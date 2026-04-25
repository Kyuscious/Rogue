import React, { useRef } from 'react';
import { WEAPON_DATABASE } from '@data/weapons';
import { SPELL_DATABASE } from '@data/spells';
import { ITEM_DATABASE } from '@data/items';
import { getFamiliarById, getFamiliarSourceLabel } from '../entity/Player/familiars';
import { getWeaponName, getWeaponDescription, getSpellName, getSpellDescription, getItemName, getItemDescription } from '../../i18n/helpers';
import { getPassiveDescription } from '@data/items';
import './Tooltip.css';

interface TooltipProps {
  position: { x: number; y: number };
  content: {
    type: 'weapon' | 'spell' | 'item' | 'familiar' | 'region' | 'locked-item';
    weaponId?: string;
    spellId?: string;
    itemId?: string;
    familiarId?: string;
    regionWeaponId?: string;
    regionSpellId?: string;
    lockedItemId?: string;
    unlockRequirement?: string;
    unlockProgress?: { current: number; required: number };
  };
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const renderWeaponTooltip = (weaponId: string) => {
    const weapon = WEAPON_DATABASE[weaponId];
    if (!weapon) return null;

    return (
      <div className="tooltip-content">
        <h4 className="tooltip-title weapon">{getWeaponName(weapon)}</h4>
        <p className="tooltip-description">{getWeaponDescription(weapon)}</p>
        
        {/* Weapon Effects */}
        {weapon.effects && weapon.effects.length > 0 && (
          <div className="tooltip-effects">
            {weapon.effects.map((effect, idx) => (
              <div key={idx} className="tooltip-effect">
                {effect.type === 'damage' && effect.damageScaling && (
                  <>
                    <strong>⚔️ Damage:</strong>
                    {effect.damageScaling.attackDamage && ` ${effect.damageScaling.attackDamage}% AD`}
                    {effect.damageScaling.abilityPower && ` ${effect.damageScaling.attackDamage ? '+' : ''} ${effect.damageScaling.abilityPower}% AP`}
                    {effect.damageScaling.health && ` ${effect.damageScaling.attackDamage || effect.damageScaling.abilityPower ? '+' : ''} ${effect.damageScaling.health}% Max HP`}
                    {effect.damageScaling.trueDamage && ` ${effect.damageScaling.attackDamage || effect.damageScaling.abilityPower || effect.damageScaling.health ? '+' : ''} ${effect.damageScaling.trueDamage} True Damage`}
                  </>
                )}
                {effect.type === 'stun' && effect.stunDuration && (
                  <><strong>🌀 Stun:</strong> {effect.stunDuration} turn{effect.stunDuration !== 1 ? 's' : ''}</>
                )}
                {effect.type === 'movement' && effect.movementAmount && (
                  <><strong>👟 Movement:</strong> {effect.movementAmount > 0 ? '+' : ''}{effect.movementAmount} units</>
                )}
                {effect.type === 'debuff' && (
                  <><strong>🔻 Debuff:</strong> {effect.description}</>
                )}
              </div>
            ))}
          </div>
        )}
        
        {weapon.stats && Object.keys(weapon.stats).length > 0 && (
          <div className="tooltip-stats">
            {weapon.stats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{weapon.stats.attackDamage}</div>
            )}
            {weapon.stats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{weapon.stats.abilityPower}</div>
            )}
            {weapon.stats.speed && (
              <div className="tooltip-stat">⚡ AS: +{weapon.stats.speed}</div>
            )}
            {weapon.stats.attackRange && (
              <div className="tooltip-stat">🎯 Range: +{weapon.stats.attackRange}</div>
            )}
            {weapon.stats.movementSpeed && (
              <div className="tooltip-stat">👟 Move Speed: +{weapon.stats.movementSpeed}</div>
            )}
            {weapon.stats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{weapon.stats.armor}</div>
            )}
            {weapon.stats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{weapon.stats.magicResist}</div>
            )}
            {weapon.stats.health && (
              <div className="tooltip-stat">❤️ HP: +{weapon.stats.health}</div>
            )}
          </div>
        )}
        {weapon.cooldown !== undefined && weapon.cooldown > 0 && (
          <div className="tooltip-cooldown">⏱️ Cooldown: {weapon.cooldown} turn{weapon.cooldown !== 1 ? 's' : ''}</div>
        )}
      </div>
    );
  };

  const renderSpellTooltip = (spellId: string) => {
    const spell = SPELL_DATABASE[spellId];
    if (!spell) return null;

    return (
      <div className="tooltip-content">
        <h4 className="tooltip-title spell">{getSpellName(spell)}</h4>
        <p className="tooltip-description">{getSpellDescription(spell)}</p>
        
        {/* Spell Effects */}
        {spell.effects && spell.effects.length > 0 && (
          <div className="tooltip-effects">
            {spell.effects.map((effect, idx) => (
              <div key={idx} className="tooltip-effect">
                {effect.type === 'damage' && effect.damageScaling && (
                  <>
                    <strong>💥 Damage:</strong>
                    {effect.damageScaling.abilityPower && ` ${effect.damageScaling.abilityPower}% AP`}
                    {effect.damageScaling.attackDamage && ` ${effect.damageScaling.abilityPower ? '+' : ''} ${effect.damageScaling.attackDamage}% AD`}
                    {effect.damageScaling.health && ` ${effect.damageScaling.abilityPower || effect.damageScaling.attackDamage ? '+' : ''} ${effect.damageScaling.health}% Max HP`}
                    {effect.damageScaling.flatPhysicalDamage && ` ${effect.damageScaling.abilityPower || effect.damageScaling.attackDamage || effect.damageScaling.health ? '+' : ''} ${effect.damageScaling.flatPhysicalDamage} Physical Damage`}
                    {effect.damageScaling.trueDamage && ` ${effect.damageScaling.abilityPower || effect.damageScaling.attackDamage || effect.damageScaling.health || effect.damageScaling.flatPhysicalDamage ? '+' : ''} ${effect.damageScaling.trueDamage} True Damage`}
                    {effect.damageScaling.missingHealthTrueDamage && ` ${effect.damageScaling.abilityPower || effect.damageScaling.attackDamage || effect.damageScaling.health || effect.damageScaling.flatPhysicalDamage || effect.damageScaling.trueDamage ? '+' : ''} ${effect.damageScaling.missingHealthTrueDamage}% Missing HP as True Damage`}
                  </>
                )}
                {effect.type === 'heal' && effect.healScaling && (
                  <>
                    <strong>💚 Heal:</strong>
                    {effect.healScaling.flatAmount && ` ${effect.healScaling.flatAmount}`}
                    {effect.healScaling.abilityPower && ` ${effect.healScaling.flatAmount ? '+' : ''} ${effect.healScaling.abilityPower}% AP`}
                    {effect.healScaling.missingHealth && ` ${effect.healScaling.flatAmount || effect.healScaling.abilityPower ? '+' : ''} ${effect.healScaling.missingHealth}% Missing HP`}
                    {effect.healScaling.lowHealthBonus && (
                      <span className="tooltip-bonus"> (×{effect.healScaling.lowHealthBonus.multiplier} when below {effect.healScaling.lowHealthBonus.threshold}% HP)</span>
                    )}
                  </>
                )}
                {effect.type === 'stun' && effect.stunDuration && (
                  <><strong>🌀 Stun:</strong> {effect.stunDuration} turn{effect.stunDuration !== 1 ? 's' : ''}</>
                )}
                {effect.type === 'debuff' && (
                  <>
                    <strong>🔻 Debuff:</strong> {effect.description}
                    {effect.slowPercent && effect.slowDuration && (
                      <span> ({effect.slowPercent}% slow for {effect.slowDuration} turn{effect.slowDuration !== 1 ? 's' : ''})</span>
                    )}
                  </>
                )}
                {effect.type === 'buff' && (
                  <><strong>⬆️ Buff:</strong> {effect.description}</>
                )}
              </div>
            ))}
          </div>
        )}
        
        {spell.cooldown !== undefined && spell.cooldown > 0 && (
          <div className="tooltip-cooldown">⏱️ Cooldown: {spell.cooldown} turn{spell.cooldown !== 1 ? 's' : ''}</div>
        )}
        {spell.range && (
          <div className="tooltip-range">🎯 Range: {spell.range} units</div>
        )}
      </div>
    );
  };

  const renderItemTooltip = (itemId: string) => {
    const item = ITEM_DATABASE[itemId];
    if (!item) return null;

    return (
      <div className="tooltip-content">
        <h4 className={`tooltip-title item rarity-${item.rarity}`}>{getItemName(item)}</h4>
        <p className="tooltip-description">{getItemDescription(item)}</p>
        
        {/* Item Use Effect */}
        {item.onUseEffect && (
          <div className="tooltip-use-effect">
            <strong>📝 Effect:</strong> {item.onUseEffect}
          </div>
        )}
        
        {/* Item Active */}
        {item.active && (
          <div className="tooltip-active">
            <strong>🔮 Active - {item.active.name}:</strong>
            <div>{item.active.description}</div>
            {item.active.cooldown > 0 && (
              <div className="tooltip-cooldown">⏱️ Cooldown: {item.active.cooldown} turn{item.active.cooldown !== 1 ? 's' : ''}</div>
            )}
            {item.active.range && (
              <div className="tooltip-range">🎯 Range: {item.active.range} units</div>
            )}
          </div>
        )}
        
        {item.stats && Object.keys(item.stats).length > 0 && (
          <div className="tooltip-stats">
            {item.stats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{item.stats.attackDamage}</div>
            )}
            {item.stats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{item.stats.abilityPower}</div>
            )}
            {item.stats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{item.stats.armor}</div>
            )}
            {item.stats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{item.stats.magicResist}</div>
            )}
            {item.stats.health && (
              <div className="tooltip-stat">❤️ HP: +{item.stats.health}</div>
            )}
            {item.stats.speed && (
              <div className="tooltip-stat">⚡ AS: +{item.stats.speed}</div>
            )}
            {item.stats.lifeSteal && (
              <div className="tooltip-stat">💉 Lifesteal: +{item.stats.lifeSteal}%</div>
            )}
            {item.stats.omnivamp && (
              <div className="tooltip-stat">🩸 Omnivamp: +{item.stats.omnivamp}%</div>
            )}
            {item.stats.health_regen && (
              <div className="tooltip-stat">💚 HP Regen: +{item.stats.health_regen}</div>
            )}
            {item.stats.criticalChance && (
              <div className="tooltip-stat">🎯 Crit Chance: +{item.stats.criticalChance}%</div>
            )}
            {item.stats.criticalDamage && (
              <div className="tooltip-stat">💥 Crit Dmg: +{item.stats.criticalDamage}%</div>
            )}
            {item.stats.lethality && (
              <div className="tooltip-stat">🗡️ Lethality: +{item.stats.lethality}</div>
            )}
            {item.stats.haste && (
              <div className="tooltip-stat">⏱️ Haste: +{item.stats.haste}</div>
            )}
            {item.stats.magicPenetration && (
              <div className="tooltip-stat">🔹 Magic Pen: +{item.stats.magicPenetration}</div>
            )}
            {item.stats.heal_shield_power && (
              <div className="tooltip-stat">💫 Heal/Shield: +{item.stats.heal_shield_power}%</div>
            )}
            {item.stats.movementSpeed && (
              <div className="tooltip-stat">👟 Move Speed: +{item.stats.movementSpeed}</div>
            )}
            {item.stats.attackRange && (
              <div className="tooltip-stat">🎯 Range: +{item.stats.attackRange}</div>
            )}
            {item.stats.tenacity && (
              <div className="tooltip-stat">💪 Tenacity: +{item.stats.tenacity}%</div>
            )}
            {item.stats.healingOnHit && (
              <div className="tooltip-stat">💝 Healing on Hit: +{item.stats.healingOnHit}</div>
            )}
            {item.stats.trueDamage && (
              <div className="tooltip-stat">⚡ True Damage: +{item.stats.trueDamage}</div>
            )}
            {item.stats.xpGain && (
              <div className="tooltip-stat">📚 XP Gain: +{item.stats.xpGain}</div>
            )}
            {item.stats.goldGain && (
              <div className="tooltip-stat">💰 Gold Gain: +{item.stats.goldGain}</div>
            )}
            {item.stats.magicFind && (
              <div className="tooltip-stat">🔮 Magic Find: +{item.stats.magicFind}%</div>
            )}
          </div>
        )}
        {item.passiveId && (
          <div className="tooltip-passive">
            <strong>Passive:</strong> {getPassiveDescription(item.passiveId)}
          </div>
        )}
      </div>
    );
  };

  const renderFamiliarTooltip = (familiarId: string) => {
    const familiar = getFamiliarById(familiarId);
    if (!familiar) return null;

    return (
      <div className="tooltip-content">
        <h4 className={`tooltip-title item rarity-${familiar.rarity}`}>{familiar.icon} {familiar.name}</h4>
        <p className="tooltip-description">{familiar.description}</p>
        <div className="tooltip-use-effect">
          <strong>Passive action:</strong> {familiar.attackPattern}
        </div>
        <div className="tooltip-stats">
          <div className="tooltip-stat">❤️ HP: {Math.round(familiar.stats.health)}</div>
          <div className="tooltip-stat">⚔️ AD: +{Math.round(familiar.stats.attackDamage)}</div>
          <div className="tooltip-stat">✨ AP: +{Math.round(familiar.stats.abilityPower)}</div>
          <div className="tooltip-stat">🛡️ Armor: +{Math.round(familiar.stats.armor)}</div>
          <div className="tooltip-stat">🔮 MR: +{Math.round(familiar.stats.magicResist)}</div>
          {familiar.trigger === 'turn' && (
            <div className="tooltip-stat">🔁 Acts every {familiar.intervalTurns} turn{familiar.intervalTurns === 1 ? '' : 's'}</div>
          )}
          {familiar.trigger === 'fight_start' && (
            <div className="tooltip-stat">⚡ Activates at fight start</div>
          )}
          {familiar.trigger === 'fight_end' && (
            <div className="tooltip-stat">🏁 Activates at end of fight</div>
          )}
        </div>
        <div className="tooltip-passive">
          <strong>Sources:</strong> {familiar.obtainableFrom.map(getFamiliarSourceLabel).join(', ')}
        </div>
      </div>
    );
  };

  const renderLockedItemTooltip = (itemId: string, requirement: string, progress?: { current: number; required: number }) => {
    const item = ITEM_DATABASE[itemId];
    if (!item) return null;

    return (
      <div className="tooltip-content locked-tooltip">
        <h4 className={`tooltip-title item rarity-${item.rarity} locked`}>🔒 {getItemName(item)}</h4>
        <p className="tooltip-description">{getItemDescription(item)}</p>
        
        <div className="tooltip-locked-info">
          <div className="tooltip-locked-label">Unlock Requirement:</div>
          <div className="tooltip-requirement">{requirement}</div>
          {progress && (
            <div className="tooltip-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
                />
              </div>
              <div className="progress-text">
                {progress.current} / {progress.required}
              </div>
            </div>
          )}
        </div>

        {item.stats && Object.keys(item.stats).length > 0 && (
          <div className="tooltip-stats locked">
            <div className="tooltip-stats-label">Stats when unlocked:</div>
            {item.stats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{item.stats.attackDamage}</div>
            )}
            {item.stats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{item.stats.abilityPower}</div>
            )}
            {item.stats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{item.stats.armor}</div>
            )}
            {item.stats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{item.stats.magicResist}</div>
            )}
            {item.stats.health && (
              <div className="tooltip-stat">❤️ HP: +{item.stats.health}</div>
            )}
            {item.stats.speed && (
              <div className="tooltip-stat">⚡ AS: +{item.stats.speed}</div>
            )}
            {item.stats.lifeSteal && (
              <div className="tooltip-stat">💉 Lifesteal: +{item.stats.lifeSteal}%</div>
            )}
            {item.stats.xpGain && (
              <div className="tooltip-stat">📚 XP Gain: +{item.stats.xpGain}</div>
            )}
            {item.stats.goldGain && (
              <div className="tooltip-stat">💰 Gold Gain: +{item.stats.goldGain}</div>
            )}
            {item.stats.magicFind && (
              <div className="tooltip-stat">🔮 Magic Find: +{item.stats.magicFind}%</div>
            )}
          </div>
        )}
        {item.passiveId && (
          <div className="tooltip-passive locked">
            <strong>Passive:</strong> {getPassiveDescription(item.passiveId)}
          </div>
        )}
      </div>
    );
  };

  const renderRegionTooltip = (weaponId?: string, spellId?: string) => {
    return (
      <div className="tooltip-content region-tooltip">
        <h4 className="tooltip-section-title">Starting Equipment</h4>
        {weaponId && (
          <div className="tooltip-section">
            <div className="tooltip-section-label">🗡️ Weapon</div>
            {renderWeaponTooltip(weaponId)}
          </div>
        )}
        {spellId && (
          <div className="tooltip-section">
            <div className="tooltip-section-label">✨ Spell</div>
            {renderSpellTooltip(spellId)}
          </div>
        )}
      </div>
    );
  };

  const getTooltipContent = () => {
    switch (content.type) {
      case 'weapon':
        return content.weaponId ? renderWeaponTooltip(content.weaponId) : null;
      case 'spell':
        return content.spellId ? renderSpellTooltip(content.spellId) : null;
      case 'item':
        return content.itemId ? renderItemTooltip(content.itemId) : null;
      case 'familiar':
        return content.familiarId ? renderFamiliarTooltip(content.familiarId) : null;
      case 'locked-item':
        return content.lockedItemId && content.unlockRequirement
          ? renderLockedItemTooltip(content.lockedItemId, content.unlockRequirement, content.unlockProgress)
          : null;
      case 'region':
        return renderRegionTooltip(content.regionWeaponId, content.regionSpellId);
      default:
        return null;
    }
  };

  return (
    <div
      ref={tooltipRef}
      className="game-tooltip"
    >
      {getTooltipContent()}
    </div>
  );
};
