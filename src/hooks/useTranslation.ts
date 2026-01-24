import { useMemo } from 'react';
import { useGameStore } from '../game/store';
import { getTranslations, Translations } from '../i18n';

/**
 * Hook to access translations in React components
 * @returns Translations object for current language
 */
export function useTranslation(): Translations {
  const language = useGameStore((store) => store.state.currentLanguage);
  
  return useMemo(() => getTranslations(language), [language]);
}
