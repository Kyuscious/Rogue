import React from 'react';
import { Weapon } from '../../../game/weapons';
import { Spell } from '../../../game/spells';
import './AbilityTooltip.css';

interface AbilityTooltipProps {
  weapon?: Weapon;
  spell?: Spell;
  attackRange?: number; // Pass player's attack range for weapons that use it
  position?: { x: number; y: number };
  visible: boolean;
}

export const AbilityTooltip: React.FC<AbilityTooltipProps> = ({
  weapon,
  spell,
  attackRange,
  position = { x: 0, y: 0 },
  visible,
}) => {
  if (!visible || (!weapon && !spell)) return null;

  const isWeapon = !!weapon;
  const ability = weapon || spell;
  if (!ability) return null;

  // Determine range display
  let rangeDisplay = '';
  if (isWeapon && weapon) {
    rangeDisplay = attackRange ? `${attackRange} units (uses Attack Range)` : 'Melee';
  } else if (spell) {
    rangeDisplay = spell.range ? `${spell.range} units` : '500 units (default)';
  }

  // Collect effects
  const effects: string[] = [];
  
  if (isWeapon && weapon) {
    weapon.effects.forEach(effect => {
      if (effect.type === 'damage' && effect.damageScaling) {
        if (effect.damageScaling.attackDamage) {
          effects.push(`${effect.damageScaling.attackDamage}% AD damage`);
        }
        if (effect.damageScaling.abilityPower) {
          effects.push(`${effect.damageScaling.abilityPower}% AP damage`);
        }
        if (effect.damageScaling.health) {
          effects.push(`${effect.damageScaling.health}% max HP damage`);
        }
        if (effect.damageScaling.trueDamage) {
          effects.push(`${effect.damageScaling.trueDamage} true damage`);
        }
      }
      if (effect.type === 'stun' && effect.stunDuration) {
        effects.push(`Stun for ${effect.stunDuration} turn${effect.stunDuration > 1 ? 's' : ''}`);
      }
      if (effect.type === 'movement' && effect.movementAmount) {
        const direction = effect.movementAmount > 0 ? 'towards' : 'away from';
        effects.push(`Move ${Math.abs(effect.movementAmount)} units ${direction} enemy`);
      }
    });
  } else if (spell) {
    spell.effects.forEach(effect => {
      if (effect.type === 'damage' && effect.damageScaling) {
        if (effect.damageScaling.abilityPower) {
          effects.push(`${effect.damageScaling.abilityPower}% AP magic damage`);
        }
        if (effect.damageScaling.attackDamage) {
          effects.push(`${effect.damageScaling.attackDamage}% AD damage`);
        }
        if (effect.damageScaling.trueDamage) {
          effects.push(`${effect.damageScaling.trueDamage} true damage`);
        }
      }
      if (effect.type === 'heal' && effect.healScaling) {
        if (effect.healScaling.flatAmount) {
          effects.push(`Heal ${effect.healScaling.flatAmount} HP`);
        }
        if (effect.healScaling.abilityPower) {
          effects.push(`Heal ${effect.healScaling.abilityPower}% AP`);
        }
        if (effect.healScaling.missingHealth) {
          effects.push(`Heal ${effect.healScaling.missingHealth}% missing HP`);
        }
      }
      if (effect.type === 'stun' && effect.stunDuration) {
        effects.push(`Stun for ${effect.stunDuration} turn${effect.stunDuration > 1 ? 's' : ''}`);
      }
    });
    
    // Add cast time info
    if (spell.castTime && spell.castTime > 0) {
      effects.push(`Cast time: ${spell.castTime} turn${spell.castTime > 1 ? 's' : ''}`);
    }
    
    // Add AoE info
    if (spell.areaOfEffect) {
      const aoeType = spell.areaOfEffect.type === 'circle' ? 'Circle' : 'Rectangle';
      effects.push(`${aoeType} AoE (${spell.areaOfEffect.size} units)`);
    }
  }

  // Cooldown info
  const cooldown = ability.cooldown || 0;
  const cooldownText = cooldown > 0 ? `${cooldown} turn${cooldown > 1 ? 's' : ''}` : 'No cooldown';

  return (
    <div 
      className="ability-tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="tooltip-header">
        <span className={`tooltip-name rarity-${ability.rarity}`}>{ability.name}</span>
        <span className="tooltip-type">{isWeapon ? 'Weapon' : 'Spell'}</span>
      </div>
      
      <div className="tooltip-description">{ability.description}</div>
      
      <div className="tooltip-stats">
        <div className="tooltip-stat">
          <span className="stat-label">Range:</span>
          <span className="stat-value">{rangeDisplay}</span>
        </div>
        <div className="tooltip-stat">
          <span className="stat-label">Cooldown:</span>
          <span className="stat-value">{cooldownText}</span>
        </div>
      </div>
      
      {effects.length > 0 && (
        <div className="tooltip-effects">
          <div className="effects-label">Effects:</div>
          {effects.map((effect, idx) => (
            <div key={idx} className="effect-item">• {effect}</div>
          ))}
        </div>
      )}
    </div>
  );
};
