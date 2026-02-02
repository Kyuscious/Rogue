/**
 * I18n Helper Functions
 * Provides convenient access to translations throughout the codebase
 */

import { useGameStore } from '../game/store';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { Translations } from './types';

/**
 * Get the current translations object based on selected language
 */
export function getTranslations(): Translations {
  const language = useGameStore.getState().state.currentLanguage;
  
  switch (language) {
    case 'fr':
      return fr;
    case 'en':
    default:
      return en;
  }
}

/**
 * Get translation for an item
 */
export function getItemTranslation(itemId: string): { name: string; description: string } {
  const t = getTranslations();
  return t.items[itemId] || { name: itemId, description: '' };
}

/**
 * Get translation for a weapon
 */
export function getWeaponTranslation(weaponId: string): { name: string; description: string } {
  const t = getTranslations();
  return t.weapons[weaponId] || { name: weaponId, description: '' };
}

/**
 * Get translation for a spell
 */
export function getSpellTranslation(spellId: string): { name: string; description: string } {
  const t = getTranslations();
  return t.spells[spellId] || { name: spellId, description: '' };
}

/**
 * Get translation for an enemy
 */
export function getEnemyTranslation(enemyId: string): { name: string; description?: string } {
  const t = getTranslations();
  return t.enemies[enemyId] || { name: enemyId };
}

/**
 * Get translation for a passive
 */
export function getPassiveTranslation(passiveId: string): { name: string; description: string } {
  const t = getTranslations();
  return t.passives[passiveId] || { name: passiveId, description: '' };
}

/**
 * Get translation for a region
 */
export function getRegionTranslation(regionKey: keyof Translations['regions']): string {
  const t = getTranslations();
  return t.regions[regionKey] || regionKey;
}

/**
 * Get translation for a status effect
 */
export function getStatusEffectTranslation(effectKey: keyof Translations['statusEffects']): string {
  const t = getTranslations();
  return t.statusEffects[effectKey] || effectKey;
}

/**
 * Get display name for a Character (supports both legacy name field and translations)
 * Use this for displaying character names in UI
 */
export function getCharacterName(character: { id: string; name?: string; role?: 'player' | 'enemy' }): string {
  // For player characters, use the name field (player-entered name)
  if (character.role === 'player' && character.name) {
    return character.name;
  }
  
  // For enemies, try translation first, fall back to name field, then ID
  if (character.role === 'enemy') {
    const translation = getEnemyTranslation(character.id);
    if (translation.name !== character.id) {
      return translation.name;
    }
  }
  
  // Fallback to deprecated name field or ID
  return character.name || character.id;
}

/**
 * Hook to use translations in React components
 */
export function useTranslations(): Translations {
  const language = useGameStore((state) => state.state.currentLanguage);
  
  switch (language) {
    case 'fr':
      return fr;
    case 'en':
    default:
      return en;
  }
}

/**
 * Get translated item name and description
 * Use this helper when you have an item object and need its translated properties
 */
export function getItemName(item: { id: string; name?: string }): string {
  const translation = getItemTranslation(item.id);
  // If translation returns the ID itself, it means no translation exists - use fallback
  if (translation.name && translation.name !== item.id) {
    return translation.name;
  }
  return item.name || item.id;
}

export function getItemDescription(item: { id: string; description?: string }): string {
  const translation = getItemTranslation(item.id);
  // If translation exists and is not empty, use it
  if (translation.description && translation.description !== '') {
    return translation.description;
  }
  return item.description || '';
}

/**
 * Get translated weapon name
 * Use this helper when you have a weapon object and need its translated name
 */
export function getWeaponName(weapon: { id: string; name?: string }): string {
  const translation = getWeaponTranslation(weapon.id);
  // If translation returns the ID itself, it means no translation exists - use fallback
  if (translation.name && translation.name !== weapon.id) {
    return translation.name;
  }
  return weapon.name || weapon.id;
}

/**
 * Get translated weapon description
 */
export function getWeaponDescription(weapon: { id: string; description?: string }): string {
  const translation = getWeaponTranslation(weapon.id);
  if (translation.description && translation.description !== '') {
    return translation.description;
  }
  return weapon.description || '';
}

/**
 * Get translated spell name
 * Use this helper when you have a spell object and need its translated name
 */
export function getSpellName(spell: { id: string; name?: string }): string {
  const translation = getSpellTranslation(spell.id);
  // If translation returns the ID itself, it means no translation exists - use fallback
  if (translation.name && translation.name !== spell.id) {
    return translation.name;
  }
  return spell.name || spell.id;
}

/**
 * Get translated spell description
 */
export function getSpellDescription(spell: { id: string; description?: string }): string {
  const translation = getSpellTranslation(spell.id);
  if (translation.description && translation.description !== '') {
    return translation.description;
  }
  return spell.description || '';
}
