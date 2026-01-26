# I18n Content Organization Guide

## Overview
All user-visible text should be stored in translation files for scalability and multi-language support.

## File Structure
```
src/i18n/
├── types.ts           # TypeScript interfaces for all translations
├── helpers.ts         # Helper functions to access translations
├── index.ts          # Main i18n export
└── translations/
    ├── en.ts         # English translations (source of truth)
    ├── fr.ts         # French translations
    └── ... (other languages)
```

## How to Add New Content

### 1. Items
```typescript
// In items.ts (data file)
export const ITEM_DATABASE: Record<string, Item> = {
  my_new_item: {
    id: 'my_new_item',
    // NO name or description here!
    rarity: 'epic',
    price: 500,
    stats: { attackDamage: 25 },
    passiveId: 'my_passive',
  }
};

// In translations/en.ts
items: {
  my_new_item: {
    name: "My New Item",
    description: "This is what the item does",
    passive: "Special ability description", // Optional
    active: "Active ability description",   // Optional
    onUse: "What happens when used",        // Optional for consumables
  }
}
```

### 2. Weapons
```typescript
// In weapons.ts (data file)
export const WEAPON_DATABASE: Record<string, Weapon> = {
  my_weapon: {
    id: 'my_weapon',
    // NO name or description here!
    stats: { attackDamage: 30 },
    attackEffects: [...]
  }
};

// In translations/en.ts
weapons: {
  my_weapon: {
    name: "My Weapon",
    description: "Attack effect details",
    lore: "Optional background story", // Optional
  }
}
```

### 3. Spells
```typescript
// In spells.ts (data file)
export const SPELL_DATABASE: Record<string, Spell> = {
  my_spell: {
    id: 'my_spell',
    // NO name or description here!
    cooldown: 3,
    range: 500,
    effects: [...]
  }
};

// In translations/en.ts
spells: {
  my_spell: {
    name: "My Spell",
    description: "What the spell does",
    effects: "Detailed effect breakdown", // Optional
  }
}
```

### 4. Enemies
```typescript
// In enemies.ts (data file)
export const ENEMY_DATABASE: Character[] = [
  {
    id: 'my_enemy',
    // NO name here!
    role: 'enemy',
    class: 'mage',
    // ... other stats
  }
];

// In translations/en.ts
enemies: {
  my_enemy: {
    name: "Enemy Name",
    description: "Brief lore or description", // Optional
    title: "The Mighty One",                  // Optional
  }
}
```

### 5. Item Passives
```typescript
// In itemPassives.ts
export const ITEM_PASSIVES: Record<PassiveId, ItemPassive> = {
  my_passive: {
    id: 'my_passive',
    // NO name or description here!
    statModifiers: {...}
  }
};

// In translations/en.ts
passives: {
  my_passive: {
    name: "Passive Name",
    description: "What the passive does"
  }
}
```

## Using Translations in Code

### React Components (Recommended)
```typescript
import { useTranslations } from '../i18n/helpers';

function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t.items.health_potion.name}</h1>
      <p>{t.items.health_potion.description}</p>
      <button>{t.common.use}</button>
    </div>
  );
}
```

### Helper Functions (For Data Processing)
```typescript
import { getItemTranslation, getWeaponTranslation } from '../i18n/helpers';

function displayItem(itemId: string) {
  const { name, description } = getItemTranslation(itemId);
  console.log(`${name}: ${description}`);
}
```

### Direct Access (Non-React)
```typescript
import { getTranslations } from '../i18n/helpers';

function logMessage() {
  const t = getTranslations();
  return t.battle.victory;
}
```

## Translation Workflow

### Adding New Languages
1. Copy `en.ts` to `newlang.ts`
2. Translate all values (keep keys the same!)
3. Add language to `types.ts` Language type
4. Add to LANGUAGES array in `types.ts`
5. Update helper functions to include new language

### Best Practices
1. **Always use translation keys**: Never hardcode visible text
2. **Keep descriptions clear**: Think about translators who may not play the game
3. **Use consistent terminology**: "HP" not "Health" or "Hitpoints" mixed
4. **Provide context**: Add comments for translators if needed
5. **Test frequently**: Switch languages during development to catch issues

### Migration Strategy
1. Start with high-visibility UI elements (main menu, battle screen)
2. Move to items, weapons, spells
3. Finally migrate tooltips, descriptions, lore text
4. Use search/replace to find hardcoded strings: `name: "Literal Text"`

## Common Patterns

### Dynamic Text with Variables
```typescript
// Use template literals with translations
const t = useTranslations();
const message = `${t.battle.victory} ${t.common.gold}: ${goldAmount}`;
```

### Conditional Display
```typescript
const t = useTranslations();
const itemTrans = getItemTranslation(itemId);

return (
  <div>
    <h2>{itemTrans.name}</h2>
    <p>{itemTrans.description}</p>
    {itemTrans.passive && <p>Passive: {itemTrans.passive}</p>}
    {itemTrans.onUse && <p>Use: {itemTrans.onUse}</p>}
  </div>
);
```

### Stat Formatting (Keep Numbers Separate)
```typescript
// Good: Numbers stay as data, labels are translated
const t = useTranslations();
<div>{t.common.attackDamage}: {stats.attackDamage}</div>

// Bad: Don't translate numbers or embed them in translation strings
```

## Tools & Validation

### Type Safety
TypeScript will catch:
- Missing translation keys
- Typos in key names
- Wrong property names

### Runtime Checks
Helper functions provide fallbacks:
- Returns itemId as name if translation missing
- Empty string for optional fields

### Future Enhancement Ideas
1. Translation completion checker
2. Auto-generate translation templates
3. Translation key usage analyzer (find unused keys)
4. Export/import CSV for translators
