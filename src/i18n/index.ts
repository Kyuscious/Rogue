import { Language, Translations } from './types';
import { en } from './translations/en';
import { fr } from './translations/fr';

// Translation registry
const translations: Record<Language, Translations> = {
  en,
  fr,
  es: fr, // Placeholder - uses FR format for now
  de: fr, // Placeholder
  pt: fr, // Placeholder
  zh: fr, // Placeholder
  ja: fr, // Placeholder
  ko: fr, // Placeholder
  ru: fr, // Placeholder
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.en;
}

/**
 * Translation helper function for use outside React components
 */
export function translate(language: Language, key: string): string {
  const t = getTranslations(language);
  const keys = key.split('.');
  
  let value: any = t;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * Translate item name
 */
export function translateItem(language: Language, itemId: string, fallback: string): string {
  const t = getTranslations(language);
  return t.items[itemId]?.name || fallback;
}

/**
 * Translate enemy name
 */
export function translateEnemy(language: Language, enemyId: string, fallback: string): string {
  const t = getTranslations(language);
  return t.enemies[enemyId]?.name || fallback;
}

/**
 * Translate ability name
 */
export function translateAbility(language: Language, abilityId: string, fallback: string): string {
  const t = getTranslations(language);
  return t.abilities[abilityId]?.name || fallback;
}

/**
 * Translate class name
 */
export function translateClass(language: Language, className: string): string {
  const t = getTranslations(language);
  const normalized = className.toLowerCase() as keyof typeof t.classes;
  return t.classes[normalized] || className;
}

/**
 * Translate region name
 */
export function translateRegion(language: Language, regionId: string): string {
  const t = getTranslations(language);
  const normalized = regionId.toLowerCase() as keyof typeof t.regions;
  return t.regions[normalized] || regionId;
}

export * from './types';
