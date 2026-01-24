# Translation System (i18n)

## Overview
The game now has a comprehensive translation/internationalization (i18n) system that allows the entire game to be translated into multiple languages.

## Supported Languages
Currently configured languages:
- 🇺🇸 English (en) - **Fully implemented**
- 🇫🇷 French (fr) - Placeholder with [FR] prefix
- 🇪🇸 Spanish (es) - Placeholder (uses French template)
- 🇩🇪 German (de) - Placeholder (uses French template)
- 🇵🇹 Portuguese (pt) - Placeholder (uses French template)
- 🇨🇳 Chinese (zh) - Placeholder (uses French template)
- 🇯🇵 Japanese (ja) - Placeholder (uses French template)
- 🇰🇷 Korean (ko) - Placeholder (uses French template)
- 🇷🇺 Russian (ru) - Placeholder (uses French template)

## File Structure
```
src/i18n/
├── index.ts              # Main export and translation functions
├── types.ts              # TypeScript interfaces for translations
└── translations/
    ├── en.ts             # English translations (complete)
    └── fr.ts             # French placeholder (template for other languages)
```

## Usage

### In React Components
```tsx
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t.mainMenu.title}</h1>
      <button>{t.common.continue}</button>
      <p>{t.battle.victory}</p>
    </div>
  );
};
```

### Outside React (utility functions)
```ts
import { translate, translateEnemy, translateItem, translateClass, translateRegion } from '../i18n';

// Generic translation
const text = translate(language, 'battle.victory');

// Specific translators with fallbacks
const enemyName = translateEnemy(language, 'garen', 'Garen');
const itemName = translateItem(language, 'longsword', 'Long Sword');
const className = translateClass(language, 'marksman'); // returns 'Marksman' or translation
const regionName = translateRegion(language, 'demacia'); // returns 'Demacia' or translation
```

## Translation Structure

### Common UI
- `common.loading`, `common.back`, `common.continue`, etc.
- Stats: `common.hp`, `common.gold`, `common.level`, etc.

### Main Menu
- `mainMenu.title`, `mainMenu.newGame`, `mainMenu.settings`, etc.

### Settings
- `settings.title`, `settings.language`, `settings.selectLanguage`

### Character Selection
- `characterSelect.title`, `characterSelect.selectYourChampion`, etc.

### Classes
- `classes.marksman`, `classes.mage`, `classes.vanguard`, etc.

### Regions
- `regions.demacia`, `regions.noxus`, `regions.freljord`, etc.

### Battle
- `battle.yourTurn`, `battle.victory`, `battle.defeat`, etc.

### Inventory
- `inventory.title`, `inventory.equipped`, `inventory.use`, etc.

### Post-Region Choice
- `postRegion.regionCompleted`, `postRegion.restTitle`, `postRegion.exploreTitle`, etc.

### Dynamic Content
- `items[itemId].name` - Item translations (to be populated)
- `enemies[enemyId].name` - Enemy translations (to be populated)
- `abilities[abilityId].name` - Ability translations (to be populated)

## Settings Access
Click the ⚙️ (gear icon) in the top-right header of any game screen to open settings and change language.

## Adding New Translations

### Step 1: Create Translation File
Create `src/i18n/translations/{languageCode}.ts`:

```ts
import { Translations } from '../types';

export const {languageCode}: Translations = {
  common: {
    loading: 'Loading...',  // Translate this
    back: 'Back',           // Translate this
    // ... etc
  },
  // ... rest of structure
};
```

### Step 2: Register Translation
In `src/i18n/index.ts`:

```ts
import { {languageCode} } from './translations/{languageCode}';

const translations: Record<Language, Translations> = {
  en,
  fr,
  {languageCode},  // Add your language here
  // ...
};
```

### Step 3: Add Language Option
In `src/i18n/types.ts`:

```ts
export type Language = 'en' | 'fr' | '{languageCode}' | ...;

export const LANGUAGES: LanguageOption[] = [
  // ...
  { code: '{languageCode}', name: 'Language Name', nativeName: 'Native Name', flag: '🏁' },
];
```

## Translation Status

### ✅ Completed
- Translation system infrastructure
- Settings UI with language selector
- Settings button in all game headers
- English translations for all UI elements
- Translation hooks and helper functions
- Language persistence across run resets

### 🟡 In Progress
- Item name/description translations (placeholders exist)
- Enemy name translations (placeholders exist)
- Ability name/description translations (placeholders exist)

### ⏳ To Do
- Translate all items individually
- Translate all enemies individually
- Translate all abilities individually
- Complete French translations
- Add Spanish, German, Portuguese, Chinese, Japanese, Korean, Russian translations
- Character/Champion names and descriptions
- Quest names and descriptions
- Flavor text and lore

## Technical Notes
- Language preference stored in global game state
- Language persists across run resets (not lost on death)
- Translations are type-safe with TypeScript
- Missing translations fall back to English or the original key
- Translation files are lazy-loaded and cached
- All placeholder languages currently show [LANG] prefix for easy identification

## Contributing Translations
When translating:
1. Maintain the same tone and style as the English version
2. Keep UI text concise (buttons, labels)
3. Consider string length for UI layout
4. Include contextual notes for translators if needed
5. Test translations in-game to ensure they fit properly
6. Use proper unicode characters for special symbols
