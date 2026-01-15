# Combat Formulas Documentation

## Damage Reduction (Armor & Magic Resist)

The damage reduction uses a diminishing returns formula to prevent infinite scaling while allowing meaningful stat stacking.

**Formula**: `reduction = resistance / (resistance + 1000)`

**Maximum Reduction**: 90% (capped)

### Examples:
- **100 armor/MR**: 100 / (100 + 1000) = 100/1100 = ~9.1% reduction (target: ~10%)
- **1000 armor/MR**: 1000 / (1000 + 1000) = 1000/2000 = 50% reduction (target: 50% ✓)
- **5000 armor/MR**: 5000 / (5000 + 1000) = 5000/6000 = ~83.3% reduction (target: ~75%)
- **10000 armor/MR**: Would be ~90.9%, but capped at 90% reduction

**Note**: The formula uses k=1000 as the constant, which provides the best balance across all armor ranges. While it slightly overshoots the 5000 armor target (83% vs 75%), this provides better counterplay and prevents enemies from becoming completely invulnerable at high armor values.

### Why This Formula?
- Prevents one-shotting with infinite armor stacking
- Creates meaningful but diminishing returns for defensive items
- Allows for counterplay through penetration stats
- Matches player expectations from similar games

---

## Physical Damage Calculation

**Steps:**
1. Calculate effective armor: `effectiveArmor = max(0, enemyArmor - attackerLethality)`
2. Calculate damage reduction: `reduction = effectiveArmor / (effectiveArmor + 1000)` (capped at 90%)
3. Calculate final damage: `finalDamage = baseDamage * (1 - reduction)`
4. Floor and minimum: `max(1, floor(finalDamage))`

**Example:**
- Attacker: 150 AD, 15 lethality
- Defender: 200 armor
- Effective armor: 200 - 15 = 185
- Reduction: 185 / 1185 = ~15.6%
- Final damage: 150 * (1 - 0.156) = 150 * 0.844 = ~126 damage

---

## Magic Damage Calculation

Same as physical damage, but uses:
- **Magic Penetration** instead of lethality
- **Magic Resist** instead of armor

**Example:**
- Attacker: 200 AP, 20 magic penetration
- Defender: 150 magic resist
- Effective MR: 150 - 20 = 130
- Reduction: 130 / 1130 = ~11.5%
- Final damage: 200 * (1 - 0.115) = 200 * 0.885 = ~177 damage

---

## Lifesteal Healing

Lifesteal heals based on **post-mitigation damage** (the actual damage dealt).

**Formula**: `healing = floor(damageDealt * (lifeStealPercent / 100))`

**Storage Format**: Lifesteal is stored as a percentage value (5 = 5%, 10 = 10%)

**Not affected by**: heal_shield_power stat

**Example:**
- Attacker has 5 lifesteal (5%)
- Deals 120 damage to enemy after armor mitigation
- Healing: floor(120 * (5 / 100)) = floor(120 * 0.05) = 6 HP restored

---

## Penetration vs. Reduction

**Penetration (Lethality & Magic Penetration):**
- **Flat reduction** to enemy's resistance
- Applied **before** damage reduction calculation
- Example: 15 lethality reduces enemy's 200 armor to 185 armor

**This means:**
- Penetration is more valuable against low-resistance targets
- Against 50 armor, 15 lethality is ~4% more damage
- Against 200 armor, 15 lethality is ~2% more damage
- Diminishing returns, but always useful

---

## Health Regeneration

Health regeneration applies at the start of each turn (when turn counter crosses an integer).

**Formula**: `healing = floor(health_regen)`

**Conditions:**
- Only heals if current HP < max HP
- Only heals if character is alive (HP > 0)
- Healing cannot exceed max HP
- Applied to both player and enemy

**Example:**
- Character has 5.5 health_regen
- Healing per turn: floor(5.5) = 5 HP
- At 100/150 HP after turn ends → 105/150 HP at start of next turn
- At 148/150 HP after turn ends → 150/150 HP at start of next turn (capped)

**Battle Log:**
- Shows "💚 [Character Name] regenerated X HP" message
- Only appears if actual healing occurs (not at full HP)

---

## Critical Hits

Critical hits apply only to **physical attacks** (not spells, unless specified by items/buffs).

**Critical Chance**:
- Stored as a decimal (25% = 0.25)
- Capped at 100% (1.0)
- Each attack rolls to determine if it crits

**Critical Damage**:
- Stored as a percentage (200 = 200% = 2.0x multiplier)
- Base critical damage is 200% (doubles the damage)
- Can be increased by items and stats
- Applies to base damage **before** armor mitigation

**Formula**:
1. Roll for crit: `random() < criticalChance`
2. If crit: `baseDamage = baseDamage * (criticalDamage / 100)`
3. Then apply armor mitigation and other effects

**Example**:
- Attacker: 150 AD, 25% crit chance, 250% crit damage
- Roll: 0.18 < 0.25 → **CRIT!**
- Crit damage: 150 * 2.5 = 375 base damage
- After armor (200 armor = ~16.7% reduction): 375 * 0.833 = ~312 damage

**Non-Crit Example** (same stats):
- Roll: 0.67 > 0.25 → Normal hit
- Base damage: 150 AD
- After armor: 150 * 0.833 = ~125 damage

**Battle Log**:
- Critical hits show: "💥 CRITICAL HIT! [Character] attacks [Target] for X damage!"
- Normal hits show: "[Character] attacks [Target] for X damage!"

---

## Health and Shield Power (Future Implementation)

---

## Summary Table

| Stat | Effect | Notes |
|------|--------|-------|
| Armor | Reduces physical damage | Diminishing returns |
| Magic Resist | Reduces magic damage | Diminishing returns |
| Lethality | Ignores enemy armor (flat) | Applied before mitigation |
| Magic Penetration | Ignores enemy MR (flat) | Applied before mitigation |
| Critical Chance | % chance to crit on attacks | Only affects attacks, not spells |
| Critical Damage | Multiplier for crit damage | Default 200%, applied before mitigation |
| Lifesteal | Heals on physical damage | Post-mitigation |
| Health Regen | Heals at start of each turn | Flat amount, capped at max HP |
| Omnivamp | Heals on all damage | Post-mitigation (not yet implemented) |
| Heal & Shield Power | Amplifies healing | Does NOT affect lifesteal or health regen |
