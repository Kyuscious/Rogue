import React from 'react';
import { useGameStore } from '../../../game/store';
import { getWeaponById } from '../../../game/weapons';
import './WeaponSelector.css';

interface WeaponSelectorProps {
  onSelect?: () => void; // Called after switching weapon
  attackRange?: number; // For tooltip display
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({ onSelect, attackRange }) => {
  const { state, equipWeapon } = useGameStore();
  const { weapons, equippedWeaponIndex } = state;
  const handleSelectWeapon = (index: number) => {
    if (index < weapons.length) {
      equipWeapon(index);
      onSelect?.();
    }
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
        className={`weapon-slot ${isEquipped ? 'equipped' : ''} ${!isAvailable ? 'disabled' : ''}`}
        onClick={() => handleSelectWeapon(i)}
        disabled={!isAvailable}
        title={weapon ? weapon.name : 'Empty Slot'}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
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
      <div className="weapon-selector-label">Weapons:</div>
      <div className="weapon-slots">{slots}</div>
    </div>
  );
};
