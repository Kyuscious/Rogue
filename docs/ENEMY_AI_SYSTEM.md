# Enemy AI System

## Overview

The Enemy AI System enables enemies to make intelligent combat decisions, using weapons, spells, items, and movement just like the player. Each enemy has a **Behavior Profile** that influences their decision-making patterns.

## Enemy Capabilities

### Loadout Slots

Enemies have the following equipment slots:

| Slot Type | Maximum | Description |
|-----------|---------|-------------|
| Weapons   | 2       | Physical attack options with cooldowns |
| Spells    | 3       | Magical abilities with cooldowns |
| Items     | 1       | Consumable items (potions, wards, etc.) |

This is intentionally different from the player (who has 5 weapons and 6 item slots) to balance difficulty.

### Available Actions

On their turn, enemies can:
1. **Use a Weapon** - Attack with equipped weapon (checks range, cooldown)
2. **Cast a Spell** - Use equipped spell (checks range, cooldown, mana)
3. **Use an Item** - Consume a potion or deployable (limited usage)
4. **Move** - Reposition towards or away from player
5. **Skip Turn** - Do nothing (only if no valid options)

## Behavior Profiles

Each enemy has a **AI Behavior Profile** that determines their combat strategy:

### `aggressive`
- **Strategy**: All-out offense, relentless attacks
- **Traits**:
  - +30% priority for weapon/spell damage
  - -50% priority for retreating
  - Ignores low HP until critical (<20%)
  - Prefers high-damage abilities
- **Example Enemies**: Berserkers, Assassins, Darius

### `defensive`
- **Strategy**: Survival-focused, cautious play
- **Traits**:
  - +50% priority for healing items/spells
  - +50% priority for retreating when damaged
  - -20% priority for offensive abilities
  - Uses healing at 60% HP (vs 30% for others)
- **Example Enemies**: Tanks, Support characters, Braum

### `balanced`
- **Strategy**: Adaptable mix of offense and defense
- **Traits**:
  - No score modifiers (baseline)
  - Heals at 50% HP
  - Advances/retreats based on situation
  - Balanced weapon/spell usage
- **Example Enemies**: Most standard enemies, Garen

### `ranged`
- **Strategy**: Maintain distance, spell-focused
- **Traits**:
  - +40% priority for spell damage
  - +20% priority for staying at range
  - Retreats if player gets within 50% of spell range
  - Prefers spells over weapons
- **Example Enemies**: Mages, Marksmen, Ezreal, Lux

### `melee`
- **Strategy**: Close-quarters combat specialist
- **Traits**:
  - +40% priority for weapon damage
  - +20% priority for gap-closing
  - Aggressive pursuit if out of range
  - Prefers weapons over spells
- **Example Enemies**: Juggernauts, Divers, Vi, Sett

### `tactical`
- **Strategy**: High-impact ability usage, calculated plays
- **Traits**:
  - +50% priority for abilities with long cooldowns
  - Holds cooldowns for optimal moments
  - Uses terrain/positioning strategically
  - Adapts to player strengths/weaknesses
- **Example Enemies**: Elite enemies, Bosses, Yasuo, Zed

## AI Decision-Making Process

The AI evaluates all available actions each turn and assigns a **priority score** to each:

### 1. Weapon Evaluation
```
Base Score: 50 (if in range and off cooldown)
+ Potential Damage * 0.5
+ 30 (if weapon has stun)
+ 20 (if weapon has gap-closing movement)
+ 10 (if weapon has cooldown - indicates impactful ability)
```

### 2. Spell Evaluation
```
Base Score: 50 (if in range and off cooldown)
+ Potential Damage * 0.5
+ 100 (if HP < 30% and spell heals)
+ 50 (if HP < 50% and spell heals)
+ 40 (if spell has stun)
+ 30 (if spell has buffs)
+ 25 (if spell has debuffs)
+ 15 (if spell has cooldown - indicates strong spell)
```

### 3. Item Evaluation
```
Health Potion:
- Score 90 if HP < 20%
- Score 60 if HP < 40%
- Score 30 if HP < 60%

Vision Items (Wards):
- Score 10 (low priority for enemies)
```

### 4. Movement Evaluation

**Moving Towards Player:**
```
+ 40 (if out of attack range)
+ 30 (if melee/aggressive profile)
+ 20 (if player HP < 30%)
- 50 (if already in range)
```

**Moving Away From Player:**
```
+ 50 (if own HP < 40%)
+ 40 (if ranged/defensive and player too close)
+ 15 (if player HP > 70%)
```

### 5. Final Decision

After calculating scores:
1. Apply **behavior profile modifiers** (see above)
2. Sort actions by score (highest first)
3. Execute the highest-scoring valid action
4. If no valid actions (score > 0), skip turn

## Implementation Examples

### Example 1: Aggressive Melee Enemy
```typescript
// In character database:
{
  id: 'bandit_bruiser',
  name: 'Bandit Bruiser',
  behaviorProfile: 'aggressive',
  loadout: {
    weapons: ['iron_sword', 'executioners_axe'],
    spells: ['battle_cry'], // Buff spell
    items: ['health_potion'],
    equippedWeaponIndex: 0,
    equippedSpellIndex: 0,
  },
  // ... stats ...
}
```

**Expected Behavior:**
- Rushes player immediately
- Uses weapons primarily
- Only heals when critical (<20% HP)
- Never retreats unless stunned

### Example 2: Defensive Ranged Enemy
```typescript
{
  id: 'frost_mage',
  name: 'Frost Mage',
  behaviorProfile: 'defensive',
  loadout: {
    weapons: ['staff'],
    spells: ['frostbolt', 'ice_barrier', 'heal'],
    items: ['health_potion'],
    equippedWeaponIndex: 0,
    equippedSpellIndex: 0,
  },
}
```

**Expected Behavior:**
- Maintains distance (retreats if player approaches)
- Uses spells primarily
- Heals at 60% HP (earlier than aggressive)
- Uses ice_barrier defensively

### Example 3: Tactical Boss
```typescript
{
  id: 'yasuo_boss',
  name: 'Yasuo, the Unforgiven',
  tier: 'legend',
  behaviorProfile: 'tactical',
  loadout: {
    weapons: ['steel_tempest', 'sweeping_blade'],
    spells: ['wind_wall', 'last_breath', 'steel_tempest_tornado'],
    items: [], // No items for bosses
    equippedWeaponIndex: 0,
    equippedSpellIndex: 0,
  },
}
```

**Expected Behavior:**
- Holds ultimate (Last Breath) for optimal moment
- Uses Wind Wall when player casts spell
- Dashes strategically with Sweeping Blade
- Combines abilities for maximum impact

## Range and Positioning

Enemies consider distance when making decisions:

| Range | Enemy Action |
|-------|--------------|
| 0-125 | Melee attack range - weapons usable |
| 126-500 | Spell range - spells usable, melee enemies advance |
| 501+ | Out of range - must move closer |

**Special Cases:**
- Enemies with long-range weapons (bows, crossbows) have extended attack range
- Some spells have reduced range (melee spells: 125, AoE: 300, projectiles: 500+)

## Cooldown Management

Enemies track cooldowns like the player:
- **Weapon Cooldowns**: Stored per weapon ID, reduces each turn
- **Spell Cooldowns**: Stored per spell ID, reduces each turn
- **Item Cooldowns**: Items are consumed (no cooldown, limited quantity)

The AI automatically skips actions that are on cooldown.

## Future Enhancements

Planned improvements for the AI system:

1. **Combo Recognition**: Chain abilities together (e.g., stun → high damage)
2. **Player Threat Assessment**: React to player's equipped weapon/spell
3. **Phase-Based Behavior**: Bosses change tactics at HP thresholds
4. **Team AI**: Enemies coordinate in multi-enemy encounters
5. **Learning AI**: Adjust behavior based on player's patterns
6. **Conditional Spells**: Reserve certain spells for specific situations

## Testing

Use `PreTestSetup` battle encounter for AI testing:
- Equip enemies with `test_weapon` and `test_spell` for baseline
- Test different behavior profiles to see decision-making
- Verify range calculations and cooldown tracking
- Observe movement patterns based on profile

## Design Philosophy

**"Enemies should feel intelligent, not random"**

The AI is designed to:
- ✅ Make logical decisions based on battlefield state
- ✅ Play to the enemy's strengths (profile)
- ✅ Feel challenging but fair
- ✅ Be predictable enough for player counterplay
- ❌ Not randomly spam abilities
- ❌ Not make obviously bad decisions
- ❌ Not perfectly counter the player (no omniscience)

Different enemies should feel **distinctly different** in combat. A defensive mage should play very differently from an aggressive berserker, even with similar stat totals.
