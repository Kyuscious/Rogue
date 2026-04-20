export const formatWeaponEffects = (weapon: any) => {
  if (!weapon || !weapon.effects) return [];
  const descriptions: string[] = [];

  for (const effect of weapon.effects) {
    if (effect.type === 'damage' && effect.damageScaling) {
      const parts: string[] = [];
      if (effect.damageScaling.attackDamage) parts.push(`${effect.damageScaling.attackDamage}%AD`);
      if (effect.damageScaling.abilityPower) parts.push(`${effect.damageScaling.abilityPower}%AP`);
      if (effect.damageScaling.health) parts.push(`${effect.damageScaling.health}%HP`);
      if (effect.damageScaling.trueDamage) parts.push(`${effect.damageScaling.trueDamage} True`);
      if (parts.length > 0) descriptions.push(`[${parts.join(' + ')}] Dmg`);
    }
    if (effect.type === 'movement' && effect.movementAmount) {
      const dir = effect.movementAmount > 0 ? 'Forward' : 'Back';
      descriptions.push(`[${Math.abs(effect.movementAmount)}] ${dir}`);
    }
  }

  return descriptions;
};

export const formatSpellEffects = (spell: any) => {
  if (!spell || !spell.effects) return [];
  const descriptions: string[] = [];

  for (const effect of spell.effects) {
    if (effect.type === 'damage' && effect.damageScaling) {
      const parts: string[] = [];
      if (effect.damageScaling.abilityPower) parts.push(`${effect.damageScaling.abilityPower}%AP`);
      if (effect.damageScaling.attackDamage) parts.push(`${effect.damageScaling.attackDamage}%AD`);
      if (effect.damageScaling.health) parts.push(`${effect.damageScaling.health}%HP`);
      if (effect.damageScaling.flatPhysicalDamage) parts.push(`${effect.damageScaling.flatPhysicalDamage} Phys`);
      if (effect.damageScaling.trueDamage) parts.push(`${effect.damageScaling.trueDamage} True`);
      if (effect.damageScaling.missingHealthTrueDamage) parts.push(`${effect.damageScaling.missingHealthTrueDamage}% Missing HP True`);
      if (parts.length > 0) descriptions.push(`[${parts.join(' + ')}] Dmg`);
    }
    if (effect.type === 'heal' && effect.healScaling) {
      const parts: string[] = [];
      if (effect.healScaling.flatAmount) parts.push(`${effect.healScaling.flatAmount}`);
      if (effect.healScaling.abilityPower) parts.push(`${effect.healScaling.abilityPower}%AP`);
      if (effect.healScaling.missingHealth) parts.push(`${effect.healScaling.missingHealth}%Missing HP`);
      if (parts.length > 0) {
        let healText = `[${parts.join(' + ')}] Heal`;
        if (effect.healScaling.lowHealthBonus) {
          healText += ` [<${effect.healScaling.lowHealthBonus.threshold}%HP: x${effect.healScaling.lowHealthBonus.multiplier}]`;
        }
        descriptions.push(healText);
      }
    }
    if (effect.type === 'stun' && effect.duration) {
      descriptions.push(`[${effect.duration} Turn${effect.duration > 1 ? 's' : ''}] Stun`);
    }
    if (effect.type === 'buff' && effect.description) {
      descriptions.push(`[Buff] ${effect.description}`);
    }
  }

  return descriptions;
};
