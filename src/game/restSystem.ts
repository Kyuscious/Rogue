import { Character } from './types';

export interface RestOutcome {
  healthRestored: number;
  debuffsRemoved: number;
  itemsRefilled: number;
}

export function performRest(character: Character): RestOutcome {
  const maxHealth = character.stats.health;
  const currentHealth = character.hp;
  const healthToRestore = Math.floor(maxHealth * 0.5);
  const healthRestored = Math.min(healthToRestore, maxHealth - currentHealth);

  // Reset HP to restored amount
  character.hp = Math.min(currentHealth + healthRestored, maxHealth);

  // Count and remove debuffs (placeholder for now)
  let debuffsRemoved = 0;
  if (character.effects) {
    debuffsRemoved = character.effects.filter(e => e.type === 'debuff').length;
    character.effects = character.effects.filter(e => e.type !== 'debuff');
  }

  // Refill refillable items (placeholder - will expand later)
  let itemsRefilled = 0;
  if (character.inventory) {
    itemsRefilled = character.inventory.length; // Placeholder: just count items for now
  }

  return {
    healthRestored,
    debuffsRemoved,
    itemsRefilled,
  };
}

export function canRest(character: Character): boolean {
  return character.hp < character.stats.health;
}
