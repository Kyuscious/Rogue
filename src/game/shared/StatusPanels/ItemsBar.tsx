import React, { useState } from 'react';
import { useGameStore } from '@game/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { getItemById, getPassiveDescription } from '@data/items';
import { InventoryItem } from '@game/types';
import './ItemsBar.css';

interface ItemsBarProps {
  inventory?: InventoryItem[]; // Optional inventory prop for enemy/custom display
  isRevealed?: boolean; // Whether to show item details or blur them
}

export const ItemsBar: React.FC<ItemsBarProps> = ({ inventory: customInventory, isRevealed = true }) => {
  const { state } = useGameStore();
  const t = useTranslation();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [totalTooltipPosition, setTotalTooltipPosition] = useState({ x: 0, y: 0 });

  // Use custom inventory if provided, otherwise use player inventory from state
  // If custom inventory is explicitly an empty array, use that (don't fallback to player inventory)
  const inventory = Array.isArray(customInventory) ? customInventory : (customInventory || state.inventory);
  
  // Filter to only show non-consumable items with stats (equipment/passives)
  const equipmentItems = inventory.filter(item => {
    const itemData = getItemById(item.itemId);
    if (!itemData) return false;
    if (itemData.consumable) return false;
    // Show item if it has any stats
    const hasStats = Object.values(itemData.stats).some(value => value && value > 0);
    return hasStats;
  });

  if (equipmentItems.length === 0) return null;

  // Calculate total stats from all equipment items
  const calculateTotalStats = () => {
    const totals: any = {};
    equipmentItems.forEach((item) => {
      const itemData = getItemById(item.itemId);
      if (itemData) {
        Object.entries(itemData.stats).forEach(([stat, value]) => {
          if (value && value > 0) {
            totals[stat] = (totals[stat] || 0) + (value * item.quantity);
          }
        });
      }
    });
    return totals;
  };

  const totalStats = calculateTotalStats();

  // Get item icon
  const getItemIcon = (name: string) => {
    if (name.includes('Blade')) return '⚔️';
    if (name.includes('Shield')) return '🛡️';
    if (name.includes('Ring')) return '💍';
    return '📦';
  };

  return (
    <div className="items-bar">
      <div className="items-bar-container">
        {/* Total Icon */}
        <div
          className="item-icon-slot total-slot bar-total-button"
          onMouseEnter={(e) => {
            if (!isRevealed) return; // Don't show total tooltip when hidden
            setShowTotalTooltip(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setTotalTooltipPosition({
              x: rect.left,
              y: rect.bottom + 5,
            });
          }}
          onMouseLeave={() => setShowTotalTooltip(false)}
        >
          <span className="total-icon">I</span>
        </div>

        {/* Item Slots */}
        {equipmentItems.map((item, idx) => {
          const itemData = getItemById(item.itemId);
          if (!itemData) return null;

          return (
            <div
              key={idx}
              className={`item-icon-slot rarity-${itemData.rarity} ${!isRevealed ? 'blurred-item' : ''}`}
              onMouseEnter={(e) => {
                if (!isRevealed) return; // Don't show tooltip when hidden
                setHoveredItemId(item.itemId);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left,
                  y: rect.bottom + 5,
                });
              }}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              {!isRevealed ? (
                // When hidden, show only the blurred rarity-colored square
                <span className="item-blur-icon">?</span>
              ) : (
                // When revealed, show the normal item icon
                <>
                  {itemData.imagePath ? (
                    <img src={itemData.imagePath} alt={itemData.name} className="item-icon-image" />
                  ) : (
                    <span className="item-icon">{getItemIcon(itemData.name || '')}</span>
                  )}
                </>
              )}
              {item.quantity > 1 && <span className="item-qty">x{item.quantity}</span>}
            </div>
          );
        })}
      </div>

      {/* Total Stats Tooltip */}
      {showTotalTooltip && isRevealed && Object.keys(totalStats).length > 0 && (
        <div className="item-tooltip-bar total-tooltip" style={{ left: `${totalTooltipPosition.x}px`, top: `${totalTooltipPosition.y}px` }}>
          <h4 className="tooltip-item-name">Total Items Stats</h4>
          <p className="tooltip-item-description">Combined stats from all items</p>
          <div className="tooltip-item-stats">
            {totalStats.attackDamage && (
              <div className="tooltip-stat">⚔️ {t.common.attackDamage}: +{totalStats.attackDamage}</div>
            )}
            {totalStats.abilityPower && (
              <div className="tooltip-stat">✨ {t.common.abilityPower}: +{totalStats.abilityPower}</div>
            )}
            {totalStats.armor && (
              <div className="tooltip-stat">🛡️ {t.common.armor}: +{totalStats.armor}</div>
            )}
            {totalStats.magicResist && (
              <div className="tooltip-stat">🔮 {t.common.magicResist}: +{totalStats.magicResist}</div>
            )}
            {totalStats.health && (
              <div className="tooltip-stat">❤️ {t.common.health}: +{totalStats.health}</div>
            )}
            {totalStats.speed && (
              <div className="tooltip-stat">⚡ {t.common.speed}: +{totalStats.speed}</div>
            )}
            {totalStats.lifeSteal && (
              <div className="tooltip-stat">💉 {t.common.lifeSteal}: +{totalStats.lifeSteal}%</div>
            )}
            {totalStats.omnivamp && (
              <div className="tooltip-stat">🩸 {t.common.omnivamp}: +{totalStats.omnivamp}%</div>
            )}
            {totalStats.health_regen && (
              <div className="tooltip-stat">💚 {t.common.healthRegen}: +{totalStats.health_regen}</div>
            )}
            {totalStats.criticalChance && (
              <div className="tooltip-stat">🎯 {t.common.criticalChance}: +{totalStats.criticalChance}%</div>
            )}
            {totalStats.criticalDamage && (
              <div className="tooltip-stat">💥 {t.common.criticalDamage}: +{totalStats.criticalDamage}%</div>
            )}
            {totalStats.lethality && (
              <div className="tooltip-stat">🗡️ {t.common.lethality}: +{totalStats.lethality}</div>
            )}
            {totalStats.haste && (
              <div className="tooltip-stat">⏱️ {t.common.haste}: +{totalStats.haste}</div>
            )}
            {totalStats.magicPenetration && (
              <div className="tooltip-stat">🔹 {t.common.magicPenetration}: +{totalStats.magicPenetration}</div>
            )}
            {totalStats.heal_shield_power && (
              <div className="tooltip-stat">💫 {t.common.healShieldPower}: +{totalStats.heal_shield_power}%</div>
            )}
            {totalStats.movementSpeed && (
              <div className="tooltip-stat">👟 {t.common.movementSpeed}: +{totalStats.movementSpeed}</div>
            )}
            {totalStats.attackRange && (
              <div className="tooltip-stat">🎯 {t.common.attackRange}: +{totalStats.attackRange}</div>
            )}
            {totalStats.tenacity && (
              <div className="tooltip-stat">💪 {t.common.tenacity}: +{totalStats.tenacity}%</div>
            )}
            {totalStats.healingOnHit && (
              <div className="tooltip-stat">💝 Healing on Hit: +{totalStats.healingOnHit}</div>
            )}
            {totalStats.trueDamage && (
              <div className="tooltip-stat">⚡ True Damage: +{totalStats.trueDamage}</div>
            )}
            {totalStats.xpGain && (
              <div className="tooltip-stat">📚 {t.common.xpGain}: +{totalStats.xpGain}</div>
            )}
            {totalStats.goldGain && (
              <div className="tooltip-stat">💰 {t.common.goldGain}: +{totalStats.goldGain}</div>
            )}
            {totalStats.magicFind && (
              <div className="tooltip-stat">🔮 Magic Find: +{totalStats.magicFind}%</div>
            )}
          </div>
        </div>
      )}

      {/* Single Item Tooltip */}
      {hoveredItemId && isRevealed && getItemById(hoveredItemId) && (() => {
        const itemData = getItemById(hoveredItemId);
        const inventoryItem = inventory.find(i => i.itemId === hoveredItemId);
        const quantity = inventoryItem?.quantity || 1;
        const isStacked = quantity > 1;

        return (
          <>
            {/* Single Item Stats */}
            <div className={`item-tooltip-bar ${itemData?.rarity ? `rarity-${itemData.rarity}` : ''}`} style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
              <h4 className={`tooltip-item-name ${itemData?.rarity ? `rarity-${itemData.rarity}` : ''}`}>{itemData?.name} {isStacked && '(×1)'}</h4>
              <p className="tooltip-item-description">{itemData?.description}</p>
              <div className="tooltip-item-stats">
                {itemData?.stats.attackDamage && (
                  <div className="tooltip-stat">⚔️ AD: +{itemData.stats.attackDamage}</div>
                )}
                {itemData?.stats.abilityPower && (
                  <div className="tooltip-stat">✨ AP: +{itemData.stats.abilityPower}</div>
                )}
                {itemData?.stats.armor && (
                  <div className="tooltip-stat">🛡️ Armor: +{itemData.stats.armor}</div>
                )}
                {itemData?.stats.magicResist && (
                  <div className="tooltip-stat">🔮 MR: +{itemData.stats.magicResist}</div>
                )}
                {itemData?.stats.health && (
                  <div className="tooltip-stat">❤️ HP: +{itemData.stats.health}</div>
                )}
                {itemData?.stats.speed && (
                  <div className="tooltip-stat">⚡ AS: +{itemData.stats.speed}</div>
                )}
                {itemData?.stats.lifeSteal && (
                  <div className="tooltip-stat">💉 Lifesteal: +{itemData.stats.lifeSteal}%</div>
                )}
                {itemData?.stats.omnivamp && (
                  <div className="tooltip-stat">🩸 Omnivamp: +{itemData.stats.omnivamp}%</div>
                )}
                {itemData?.stats.health_regen && (
                  <div className="tooltip-stat">💚 HP Regen: +{itemData.stats.health_regen}</div>
                )}
                {itemData?.stats.criticalChance && (
                  <div className="tooltip-stat">🎯 Crit Chance: +{itemData.stats.criticalChance}%</div>
                )}
                {itemData?.stats.criticalDamage && (
                  <div className="tooltip-stat">💥 Crit Dmg: +{itemData.stats.criticalDamage}%</div>
                )}
                {itemData?.stats.lethality && (
                  <div className="tooltip-stat">🗡️ Lethality: +{itemData.stats.lethality}</div>
                )}
                {itemData?.stats.haste && (
                  <div className="tooltip-stat">⏱️ Haste: +{itemData.stats.haste}</div>
                )}
                {itemData?.stats.magicPenetration && (
                  <div className="tooltip-stat">🔹 Magic Pen: +{itemData.stats.magicPenetration}</div>
                )}
                {itemData?.stats.heal_shield_power && (
                  <div className="tooltip-stat">💫 Heal/Shield: +{itemData.stats.heal_shield_power}%</div>
                )}
                {itemData?.stats.movementSpeed && (
                  <div className="tooltip-stat">👟 Move Speed: +{itemData.stats.movementSpeed}</div>
                )}
                {itemData?.stats.attackRange && (
                  <div className="tooltip-stat">🎯 Range: +{itemData.stats.attackRange}</div>
                )}
                {itemData?.stats.tenacity && (
                  <div className="tooltip-stat">💪 Tenacity: +{itemData.stats.tenacity}%</div>
                )}
                {itemData?.stats.healingOnHit && (
                  <div className="tooltip-stat">💝 Healing on Hit: +{itemData.stats.healingOnHit}</div>
                )}
                {itemData?.stats.trueDamage && (
                  <div className="tooltip-stat">⚡ True Damage: +{itemData.stats.trueDamage}</div>
                )}
                {itemData?.stats.xpGain && (
                  <div className="tooltip-stat">📚 XP Gain: +{itemData.stats.xpGain}</div>
                )}
                {itemData?.stats.goldGain && (
                  <div className="tooltip-stat">💰 Gold Gain: +{itemData.stats.goldGain}</div>
                )}
                {itemData?.stats.magicFind && (
                  <div className="tooltip-stat">🔮 Magic Find: +{itemData.stats.magicFind}%</div>
                )}
              </div>
              {itemData?.passiveId && getPassiveDescription(itemData.passiveId) && (
                <div className="tooltip-item-passive">
                  <strong>Passive:</strong> {getPassiveDescription(itemData.passiveId)}
                </div>
              )}
            </div>

            {/* Stacked Total Tooltip (only if quantity > 1) */}
            {isStacked && (
              <div className={`item-tooltip-bar stack-tooltip ${itemData?.rarity ? `rarity-${itemData.rarity}` : ''}`} style={{ left: `${tooltipPosition.x + 260}px`, top: `${tooltipPosition.y}px` }}>
                <h4 className={`tooltip-item-name ${itemData?.rarity ? `rarity-${itemData.rarity}` : ''}`}>{itemData?.name} (×{quantity})</h4>
                <p className="tooltip-item-description">Total from stack</p>
                <div className="tooltip-item-stats">
                  {itemData?.stats.attackDamage && (
                    <div className="tooltip-stat">⚔️ AD: +{itemData.stats.attackDamage * quantity}</div>
                  )}
                  {itemData?.stats.abilityPower && (
                    <div className="tooltip-stat">✨ AP: +{itemData.stats.abilityPower * quantity}</div>
                  )}
                  {itemData?.stats.armor && (
                    <div className="tooltip-stat">🛡️ Armor: +{itemData.stats.armor * quantity}</div>
                  )}
                  {itemData?.stats.magicResist && (
                    <div className="tooltip-stat">🔮 MR: +{itemData.stats.magicResist * quantity}</div>
                  )}
                  {itemData?.stats.health && (
                    <div className="tooltip-stat">❤️ HP: +{itemData.stats.health * quantity}</div>
                  )}
                  {itemData?.stats.speed && (
                    <div className="tooltip-stat">⚡ AS: +{itemData.stats.speed * quantity}</div>
                  )}
                  {itemData?.stats.lifeSteal && (
                    <div className="tooltip-stat">💉 Lifesteal: +{itemData.stats.lifeSteal * quantity}%</div>
                  )}
                  {itemData?.stats.omnivamp && (
                    <div className="tooltip-stat">🩸 Omnivamp: +{itemData.stats.omnivamp * quantity}%</div>
                  )}
                  {itemData?.stats.health_regen && (
                    <div className="tooltip-stat">💚 HP Regen: +{itemData.stats.health_regen * quantity}</div>
                  )}
                  {itemData?.stats.criticalChance && (
                    <div className="tooltip-stat">🎯 Crit Chance: +{itemData.stats.criticalChance * quantity}%</div>
                  )}
                  {itemData?.stats.criticalDamage && (
                    <div className="tooltip-stat">💥 Crit Dmg: +{itemData.stats.criticalDamage * quantity}%</div>
                  )}
                  {itemData?.stats.lethality && (
                    <div className="tooltip-stat">🗡️ Lethality: +{itemData.stats.lethality * quantity}</div>
                  )}
                  {itemData?.stats.haste && (
                    <div className="tooltip-stat">⏱️ Haste: +{itemData.stats.haste * quantity}</div>
                  )}
                  {itemData?.stats.magicPenetration && (
                    <div className="tooltip-stat">🔹 Magic Pen: +{itemData.stats.magicPenetration * quantity}</div>
                  )}
                  {itemData?.stats.heal_shield_power && (
                    <div className="tooltip-stat">💫 Heal/Shield: +{itemData.stats.heal_shield_power * quantity}%</div>
                  )}
                  {itemData?.stats.movementSpeed && (
                    <div className="tooltip-stat">👟 Move Speed: +{itemData.stats.movementSpeed * quantity}</div>
                  )}
                  {itemData?.stats.attackRange && (
                    <div className="tooltip-stat">🎯 Range: +{itemData.stats.attackRange * quantity}</div>
                  )}
                  {itemData?.stats.tenacity && (
                    <div className="tooltip-stat">💪 Tenacity: +{itemData.stats.tenacity * quantity}%</div>
                  )}
                  {itemData?.stats.healingOnHit && (
                    <div className="tooltip-stat">💝 Healing on Hit: +{itemData.stats.healingOnHit * quantity}</div>
                  )}
                  {itemData?.stats.trueDamage && (
                    <div className="tooltip-stat">⚡ True Damage: +{itemData.stats.trueDamage * quantity}</div>
                  )}
                  {itemData?.stats.xpGain && (
                    <div className="tooltip-stat">📚 XP Gain: +{itemData.stats.xpGain * quantity}</div>
                  )}
                  {itemData?.stats.goldGain && (
                    <div className="tooltip-stat">💰 Gold Gain: +{itemData.stats.goldGain * quantity}</div>
                  )}
                  {itemData?.stats.magicFind && (
                    <div className="tooltip-stat">🔮 Magic Find: +{itemData.stats.magicFind * quantity}%</div>
                  )}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};
