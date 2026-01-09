# How to Apply the Class & Loot Type Updates - Easy Guide

## Option 1: Copy & Paste (Easiest - Takes 30 seconds)

### Step 1: Open the updated database
- Open `UPDATED_ENEMY_DATABASE.ts` in VS Code

### Step 2: Copy the entire ENEMIES_BY_REGION object
- Select all the code from `export const ENEMIES_BY_REGION: Record<...>` down to the closing `};`
- Copy (Ctrl+C)

### Step 3: Paste into your main file
- Open `src/game/enemyDatabase.ts`
- Find the line: `export const ENEMIES_BY_REGION: Record<string, Record<string, Enemy[]>> = {`
- Select from there all the way to `};` (the closing bracket of the entire object)
- Paste the new version (Ctrl+V)
- **That's it!** The whole thing is updated.

### Step 4: Verify
- Check that the file has no red squiggly underlines
- The file should compile with no errors

---

## Option 2: Manual Find-Replace (For Learning)

If you want to understand what changed, do this manually:

### For each enemy, add TWO lines:

**STEP 1:** After the `tier: 'minion'` (or 'elite', 'champion', 'boss') line:
```typescript
class: 'tank',  // or 'mage', 'fighter', 'adc', 'assassin', 'bruiser', 'support', 'enchanter'
```

**STEP 2:** After the `experienceReward: XX,` line:
```typescript
lootType: 'tankDefense',  // or 'abilityPower', 'attackDamage', 'hybrid', 'critical', 'mobility', 'utility'
```

---

## Quick Reference for Each Enemy

| Enemy ID | Class | Loot Type | Region | Tier |
|---|---|---|---|---|
| training_dummy | tank | tankDefense | demacia | minion |
| deserter_scout | adc | attackDamage | demacia | minion |
| shadow_wisp | mage | abilityPower | demacia | minion |
| crag_beast | tank | tankDefense | demacia | minion |
| silverwing_raptor | assassin | critical | demacia | elite |
| corrupted_soldier | fighter | hybrid | demacia | elite |
| void_minion_demacia | mage | abilityPower | demacia | elite |
| sylas_champion | bruiser | hybrid | demacia | champion |
| garen_champion | tank | tankDefense | demacia | champion |
| garen_boss | tank | tankDefense | demacia | boss |
| shadow_lord | mage | abilityPower | demacia | boss |
| sand_soldier | fighter | hybrid | shurima | minion |
| void_minion_shurima | mage | abilityPower | shurima | minion |
| void_scout | adc | attackDamage | shurima | minion |
| corrupted_golem | tank | tankDefense | shurima | elite |
| sun_sentinel | fighter | hybrid | shurima | champion |
| azir_champion | mage | abilityPower | shurima | champion |
| void_herald | mage | abilityPower | shurima | champion |
| azir_encounter | mage | abilityPower | shurima | boss |
| spirit_beast | fighter | hybrid | ionia | minion |
| void_minion_ionia | mage | abilityPower | ionia | minion |
| corrupted_monk | fighter | hybrid | ionia | minion |
| shadow_sprite | mage | abilityPower | ionia | minion |
| light_guardian | support | utility | ionia | minion |
| spirit_guardian | support | utility | ionia | elite |
| wind_warrior | fighter | hybrid | ionia | champion |
| yasuo_champion | assassin | critical | ionia | champion |
| balance_keeper | enchanter | abilityPower | ionia | champion |
| yasuo_encounter | assassin | critical | ionia | boss |

---

## Troubleshooting

### Error: "Property 'class' is missing"
- You didn't add the `class: 'xxx',` line
- Check the quick reference table above

### Error: "Property 'lootType' is missing"  
- You didn't add the `lootType: 'xxx',` line at the end
- Check the quick reference table above

### Error: "Type '...' is not assignable to type 'CharacterClass'"
- You used a class name that doesn't exist
- Valid classes: `'mage' | 'tank' | 'fighter' | 'assassin' | 'adc' | 'support' | 'bruiser' | 'enchanter'`
- Check for typos (no quotes around values, no apostrophes needed if already in type definition)

### Error: "Type '...' is not assignable to type 'LootType'"
- You used a loot type that doesn't exist
- Valid loot types: `'attackDamage' | 'abilityPower' | 'tankDefense' | 'mobility' | 'utility' | 'hybrid' | 'critical'`

---

## What These Changes Do

### `class` field
- Defines what archetype the enemy is (tank, mage, fighter, etc.)
- Used for AI behavior (future feature)
- Used for quest recommendations
- Used for stat scaling (future feature)

### `lootType` field
- Determines what kind of items they drop
- Tanks drop tank items (armor, magic resist)
- Mages drop AP items
- etc.
- Makes roguelike item progression make sense

---

## After You Update

Your game will now:
✅ Have properly classified enemies
✅ Compile without TypeScript errors
✅ Quest system can recommend enemies based on player needs
✅ Item drops will match enemy class (mages drop AP items, etc.)

No gameplay changes needed yet - the new fields are just data that can be used by future features!

---

## Next Steps (Optional)

You can now:
1. Add more enemies with the new `class` and `lootType` fields automatically
2. Implement class-based AI behavior (mages stay back, tanks charge forward)
3. Implement stat scaling based on class (tanks get more HP scaling)
4. Create quest recommendations based on player build (show more mages if player needs AP items)
5. Balance enemy rewards based on class (harder enemies give better items)
