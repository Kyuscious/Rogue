import React, { useState } from 'react';
import { useGameStore } from '@game/store';
import { getWeaponById } from '@data/weapons';
import { Tooltip } from '../../../shared/Tooltip';
import { useTranslation } from '../../../../hooks/useTranslation';
import './WeaponSelector.css';

interface WeaponSelectorProps {
  onAttack: (index: number) => void;
  canAttack: boolean;
  attackRange?: number;
  onHoverChange?: (weaponId: string | null) => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({ onAttack, canAttack, onHoverChange }) => {
  const { state, equipWeapon } = useGameStore();
  const { weapons, equippedWeaponIndex } = state;
  const [tooltipData, setTooltipData] = useState<{ weaponId: string; position: { x: number; y: number } } | null>(null);
  const t = useTranslation();
  const handleSelectWeapon = (index: number) => {
    if (index < weapons.length) {
      equipWeapon(index);
      onAttack(index);
    }
  };

  const handleWeaponMouseEnter = (weaponId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      weaponId,
      position: { x: rect.left + rect.width / 2, y: rect.bottom }
    });
    onHoverChange?.(weaponId);
  };

  const handleWeaponMouseLeave = () => {
    setTooltipData(null);
    onHoverChange?.(null);
  };

  // Always show 3 slots
  const slots = Array.from({ length: 3 }, (_, i) => {
    const weaponId = weapons[i];
    const weapon = weaponId ? getWeaponById(weaponId) : null;
    const isEquipped = i === equippedWeaponIndex;
    const isAvailable = i < weapons.length;

    return (
      <button
        key={i}
        className={`weapon-slot ${weapon ? `rarity-${weapon.rarity}` : ''} ${isEquipped ? 'equipped' : ''} ${!isAvailable || !canAttack ? 'disabled' : ''}`}
        onClick={() => handleSelectWeapon(i)}
        disabled={!isAvailable || !canAttack}
        onMouseEnter={(e) => weapon && handleWeaponMouseEnter(weapon.id, e)}
        onMouseLeave={handleWeaponMouseLeave}
      >
        {weapon ? (
          <>
            {weapon.imagePath ? (
              <img src={weapon.imagePath} alt={weapon.name} className="weapon-icon" />
            ) : (
              <span className="weapon-icon-text">⚔️</span>
            )}
            <span className="weapon-name">{weapon.name}</span>
          </>
        ) : (
          <span className="weapon-empty">-</span>
        )}
      </button>
    );
  });

  return (
    <div className="weapon-selector">
      <div className="weapon-selector-label">{t.battle.weaponsLabel}</div>
      <div className="weapon-slots">{slots}</div>
      
      {tooltipData && (
        <Tooltip
          content={{ type: 'weapon', weaponId: tooltipData.weaponId }}
          position={tooltipData.position}
        />
      )}
    </div>
  );
};
