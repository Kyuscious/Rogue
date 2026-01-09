# LoL-Inspired Stats System & Class Guide

## Complete Stats List (All 18 Stats)

Your game now supports these stats (inspired by League of Legends):

### Primary Combat Stats
- **Health (HP)** - Max health points, determines survivability
- **Attack Damage (AD)** - Physical damage multiplier
- **Ability Power (AP)** - Magic damage multiplier
- **Armor** - Physical damage reduction
- **Magic Resist (MR)** - Magic damage reduction

### Attack Stats
- **Attack Speed (AS)** - Attacks per second multiplier
- **Attack Range** - Distance from which character can attack
- **Critical Chance (CRIT%)** - Probability of critical hit
- **Critical Damage** - Damage multiplier for critical hits (default 2.0 = 200%)

### Ability Stats
- **Cooldown Reduction (CDR)** - Reduces ability cooldowns
- **Ability Haste** - Alternative way to calculate CDR

### Survivability
- **Life Steal** - Percentage of physical damage converted to healing
- **Spell Vamp** - Percentage of spell damage converted to healing
- **Omnivamp** - Percentage of all damage converted to healing

### Mobility & Utility
- **Movement Speed** - Base movement speed
- **Tenacity** - Crowd control reduction (stun, slow, etc.)
- **Lethality** - Armor penetration value
- **Magic Penetration** - Magic resist penetration

### Passive Stats
- **Gold Gain** - Multiplier for gold earned
- **XP Gain** - Multiplier for experience earned

---

## Character Classes (8 Types)

### 1. **Mage** 🔮
- **Primary Stats**: Ability Power, Magic Penetration
- **Strengths**: High burst damage, crowd control
- **Loot Type**: abilityPower
- **Examples**: Shadow Wisp, Azir, Balance Keeper

### 2. **Tank** 🛡️
- **Primary Stats**: Health, Armor, Magic Resist
- **Strengths**: High durability, crowd control
- **Loot Type**: tankDefense
- **Examples**: Garen, Training Dummy, Corrupted Golem

### 3. **Fighter** ⚔️
- **Primary Stats**: Attack Damage, Health, Armor
- **Strengths**: Balanced offense and defense
- **Loot Type**: hybrid
- **Examples**: Corrupted Soldier, Sand Soldier, Sylas

### 4. **Assassin** 🗡️
- **Primary Stats**: Attack Damage, Critical Chance, Lethality
- **Strengths**: High burst damage, mobility, low durability
- **Loot Type**: critical
- **Examples**: Silverwing Raptor, Yasuo

### 5. **ADC (Attack Damage Carry)** 🏹
- **Primary Stats**: Attack Damage, Attack Speed, Critical Damage
- **Strengths**: Sustained physical damage, long range
- **Loot Type**: attackDamage
- **Examples**: Deserter Scout, Void Scout

### 6. **Support** 🛠️
- **Primary Stats**: Cooldown Reduction, Utility
- **Strengths**: Buffs, heals, crowd control
- **Loot Type**: utility
- **Examples**: Light Guardian, Spirit Guardian

### 7. **Bruiser** 💪
- **Primary Stats**: Attack Damage, Health, Omnivamp
- **Strengths**: Sustained healing, balanced stats
- **Loot Type**: hybrid
- **Examples**: Sylas, Wind Warrior

### 8. **Enchanter** ✨
- **Primary Stats**: Ability Power, Cooldown Reduction
- **Strengths**: AP-based buffs and shields
- **Loot Type**: abilityPower
- **Examples**: Balance Keeper

---

## Loot Types (7 Categories)

### 1. **Attack Damage** (⚔️)
- Items that increase AD, attack speed, critical chance
- Dropped by: ADC, Assassins, Fighters
- Example Items: Long Sword, Pickaxe, Infinity Edge

### 2. **Ability Power** (✨)
- Items that increase AP, CDR, magic penetration
- Dropped by: Mages, Enchanters
- Example Items: Needlessly Large Rod, Rabadon's Deathcap

### 3. **Tank Defense** (🛡️)
- Items that increase armor, magic resist, health
- Dropped by: Tanks, Fighters
- Example Items: Cloth Armor, Null Magic Mantle, Kaenic Rookern

### 4. **Mobility** (💨)
- Items that increase movement speed, attack speed, attack range
- Dropped by: Assassins, ADC, Mages
- Example Items: Boots, Spear of Shojin

### 5. **Utility** (🛠️)
- Items with unique effects, CDR, tenacity
- Dropped by: Support, Enchanters, Tanks
- Example Items: Kindlegem, Hollow Radiance

### 6. **Hybrid** (🔄)
- Mixed stats (AD + AP, AD + Tank, etc.)
- Dropped by: Bruisers, Fighters, Tanks
- Example Items: Trinity Force, Nashor's Tooth

### 7. **Critical** (⚡)
- Items focused on crit chance and crit damage
- Dropped by: ADC, Assassins
- Example Items: Infinity Edge, Rapid Firecannon

---

## How to Update Your Enemy Database

### The Easy Way: Find & Replace + Manual Edits

**Step 1:** Open `src/game/enemyDatabase.ts`

**Step 2:** For EACH enemy object, add two new fields:

```typescript
{
  id: 'training_dummy',
  name: 'Training Dummy',
  region: 'demacia',
  tier: 'minion',
  
  // ADD THESE TWO LINES:
  class: 'tank',
  
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['cloth_armor', 'health_potion'],
  goldReward: 8,
  experienceReward: 4,
  
  // ADD THIS AT THE END (before closing brace):
  lootType: 'tankDefense',
}
```

### Quick Copy-Paste Template

Use this template for new enemies:

```typescript
{
  id: 'enemy_id',
  name: 'Enemy Name',
  region: 'demacia', // or 'shurima', 'ionia'
  tier: 'minion',    // 'minion' | 'elite' | 'champion' | 'boss'
  class: 'tank',     // 'mage' | 'tank' | 'fighter' | 'assassin' | 'adc' | 'support' | 'bruiser' | 'enchanter'
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['cloth_armor'],
  goldReward: 8,
  experienceReward: 4,
  lootType: 'tankDefense', // 'attackDamage' | 'abilityPower' | 'tankDefense' | 'mobility' | 'utility' | 'hybrid' | 'critical'
}
```

### Mapping Cheat Sheet

| Enemy Name | Class | Loot Type |
|---|---|---|
| **DEMACIA** | | |
| Training Dummy | tank | tankDefense |
| Deserter Scout | adc | attackDamage |
| Shadow Wisp | mage | abilityPower |
| Crag Beast | tank | tankDefense |
| Silverwing Raptor | assassin | critical |
| Corrupted Soldier | fighter | hybrid |
| Void Minion (Demacia) | mage | abilityPower |
| Sylas | bruiser | hybrid |
| Garen | tank | tankDefense |
| Shadow Lord | mage | abilityPower |
| **SHURIMA** | | |
| Sand Soldier | fighter | hybrid |
| Void Scout | adc | attackDamage |
| Corrupted Golem | tank | tankDefense |
| Sun Sentinel | fighter | hybrid |
| Azir | mage | abilityPower |
| Void Herald | mage | abilityPower |
| **IONIA** | | |
| Spirit Beast | fighter | hybrid |
| Void Creature | mage | abilityPower |
| Corrupted Monk | fighter | hybrid |
| Spirit Wisp | mage | abilityPower |
| Light Guardian | support | utility |
| Spirit Guardian | support | utility |
| Wind Warrior | fighter | hybrid |
| Yasuo | assassin | critical |
| Balance Keeper | enchanter | abilityPower |

---

## Examples: Before & After

### Example 1: Minion Enemy
**BEFORE:**
```typescript
{
  id: 'training_dummy',
  name: 'Training Dummy',
  region: 'demacia',
  tier: 'minion',
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['cloth_armor', 'health_potion'],
  goldReward: 8,
  experienceReward: 4,
}
```

**AFTER:**
```typescript
{
  id: 'training_dummy',
  name: 'Training Dummy',
  region: 'demacia',
  tier: 'minion',
  class: 'tank',          // ← NEW
  hp: 25,
  maxHp: 25,
  attack: 12,
  defense: 8,
  speed: 20,
  abilities: [],
  level: 1,
  itemDrops: ['cloth_armor', 'health_potion'],
  goldReward: 8,
  experienceReward: 4,
  lootType: 'tankDefense', // ← NEW
}
```

### Example 2: Champion Enemy
**BEFORE:**
```typescript
{
  id: 'sylas_champion',
  name: 'Sylas',
  region: 'demacia',
  tier: 'champion',
  hp: 120,
  maxHp: 120,
  attack: 60,
  defense: 35,
  speed: 50,
  abilities: [],
  level: 4,
  itemDrops: ['trinity_force', 'rabadons_deathcap'],
  goldReward: 90,
  experienceReward: 45,
}
```

**AFTER:**
```typescript
{
  id: 'sylas_champion',
  name: 'Sylas',
  region: 'demacia',
  tier: 'champion',
  class: 'bruiser',        // ← NEW
  hp: 120,
  maxHp: 120,
  attack: 60,
  defense: 35,
  speed: 50,
  abilities: [],
  level: 4,
  itemDrops: ['trinity_force', 'rabadons_deathcap'],
  goldReward: 90,
  experienceReward: 45,
  lootType: 'hybrid',      // ← NEW
}
```

---

## Adding More Loot Types in the Future

To add new loot types like "cdr" (cooldown reduction), "lifesteal", etc.:

1. Add to `CharacterClass` type in `src/game/items.ts`:
```typescript
export type LootType = 
  | 'attackDamage' 
  | 'abilityPower' 
  | 'tankDefense' 
  | 'mobility' 
  | 'utility' 
  | 'hybrid' 
  | 'critical'
  | 'cooldownReduction'  // ← NEW TYPE
  | 'lifeSteal';         // ← NEW TYPE
```

2. Add corresponding items in `src/game/itemDatabase.ts`

3. Update enemy database to use new types

---

## Summary

✅ **18 stats tracked** (all LoL-inspired)
✅ **8 character classes** with different strengths
✅ **7 loot types** matching class synergies
✅ **Easy migration** - just add 2 fields per enemy
✅ **Scalable system** - add more types anytime

You now have a professional RPG stat system ready to expand!
