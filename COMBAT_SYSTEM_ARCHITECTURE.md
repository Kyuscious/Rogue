# Combat System Architecture

## Overview

The combat system is a complete turn-based roguelike progression engine with:
- **Player-controlled timing** (no fixed 6-second turns)
- **8 character classes** with unique ability sets
- **10-encounter checkpoint system** with Rest/Loot/Special choices
- **Complex but reasonable enemy AI** (to be implemented)
- **Comprehensive stat scaling** (65% AD, 75% AP for abilities)

## Core Systems

### 1. Combat System (`combatSystem.ts`)

**Purpose**: Core turn-based combat mechanics with simultaneous action resolution

**Key Types**:
- `CombatAction`: Represents player/enemy actions (ability, summoner, item, potion)
- `Turn`: Records player and enemy actions, damage dealt/received, heal, battle log
- `CombatState`: Current combat state (HP/Mana, cooldowns, buffs/debuffs, turns)
- `ActiveBuff`/`ActiveDebuff`: Status effects with durations and effects

**Key Functions**:
- `initializeCombat()`: Create new combat state for an encounter
- `calculateDamage()`: Stat scaling formula with armor/MR mitigation
  - Physical: baseDamage + (AD × 0.65), reduced by armor
  - Magical: baseDamage + (AP × 0.75), reduced by MR
- `resolveTurn()`: Simultaneous player + enemy action resolution
- `getAvailableActions()`: Filter actions by cooldown status
- `isPlayerSilenced()` / `isPlayerStunned()`: Debuff checks

### 2. Roguelike Progression (`roguelikeProgression.ts`)

**Purpose**: Run progression, checkpoint system, reward distribution

**Key Concepts**:
- **Run**: Single roguelike attempt with persistent stats/currency
- **Checkpoint**: After 10 encounters, choose Rest/Loot/Special
- **Encounter**: 1v1 battle with an enemy, tracked in run history
- **Loot Pool**: Items gained per encounter, applied at checkpoints

**Run Structure**:
```
Start Run (currentCheckpoint = 0, encountersInCurrentCheckpoint = 0)
  ├─ Encounter 1-10 (currentCheckpoint = 0)
  ├─ Checkpoint Reached (10/10 encounters)
  │   ├─ Option 1: REST (recover 50% HP)
  │   ├─ Option 2: LOOT (choose +20 AD or +20 AP or +100 HP)
  │   └─ Option 3: SPECIAL (region-specific challenging encounter)
  ├─ Encounter 11-20 (currentCheckpoint = 1)
  └─ ... repeat until player dies or chooses to leave
```

**Key Functions**:
- `createRun()`: Start new run with base stats
- `completeEncounter()`: Update run after 1v1 battle
- `generateCheckpointRewards()`: Create 3 reward options based on run state
- `applyLoot()`: Permanently increase player stats from loot choice
- `restAtCheckpoint()`: Heal HP at rest checkpoint
- `getRunSummary()`: End-of-run statistics

**Reward System**:
- **Rest**: 50% HP healing (no stat changes)
- **Loot**: Choose 1 of 3 items (stat boosts tailored to current stats)
  - Offensive: +20 AD or +20 AP (based on which is higher)
  - Defensive: +15 Armor or +15 MR (based on which is lower)
  - Utility: +100 HP (epic rarity)
- **Special**: Region-specific challenging encounter
  - Demacia: Face Garen, rewards +50 HP +10 Armor
  - Shurima: Face Azir, rewards +40 AP
  - Ionia: Spirit Commune, rewards balanced +30 all stats

### 3. Abilities System (`abilities.ts`)

**Purpose**: Define Q/W/E/R abilities for each character class

**Ability Structure**:
```typescript
{
  key: 'Q' | 'W' | 'E' | 'R',
  name: string,
  manaCost: number,
  cooldown: number,  // in turns
  baseDamage: number,
  adScaling: 0.6-1.1,  // % of AD
  apScaling: 0.5-1.0,  // % of AP
  school: 'physical' | 'magical' | 'mixed' | 'true',
  effects: [damage, heal, buff, debuff, crowd_control]
}
```

**8 Character Classes** (each with unique Q/W/E/R):

| Class | Role | Focus | Q | W | E | R |
|-------|------|-------|---|---|---|---|
| **Mage** | Ranged | AP scaling | Fireball | Arcane Mist (silence) | Mana Shield (buff) | Meteor Strike (AoE) |
| **Tank** | Frontline | Survival | Shield Bash | Fortify (armor buff) | Taunt | Unbreakable (mega buff) |
| **Fighter** | Melee | Balanced | Slash | Riposte | Bloodthirst (lifesteal) | Last Stand |
| **Assassin** | Burst | High damage | Quick Strike | Shadow Step (dodge) | Ambush (burst) | Death Mark (execute) |
| **ADC** | Ranged | Sustained AD | Piercing Shot | Volley | Kiting (mobility) | Barrage (multi-hit) |
| **Support** | Utility | Healing/Buff | Holy Bolt (heal) | Blessing (protect) | Cleanse (remove debuffs) | Divine Intervention |
| **Bruiser** | Mixed | AD + survival | Heavy Blow | Tenacity | Momentum | Berserker Rage |
| **Enchanter** | Utility | AP utility | Arcane Orb | Protection Circle | Enchantment | Eternal Blessing |

**Ability Effects**:
- `damage`: Direct HP reduction with scaling
- `heal`: Direct HP recovery
- `buff`: Temporary stat increases (duration in turns)
- `debuff`: Temporary stat decreases or crowd control
- `crowd_control`: Stun (can't act), root (can't move), slow (reduced speed), knockback

**Damage Calculation per Ability**:
```
baseDamage + (sourceStats.ad × adScaling)
           + (sourceStats.ap × apScaling)
           × multiplier (from effects)
           - target mitigation (armor/MR)
```

### 4. Summoner Spells (`summonerSpells.ts`)

**Purpose**: D/F summoner spells with longer cooldowns

**Available Spells** (player chooses 2 at run start):

| Spell | Cooldown | Effect | Mana |
|-------|----------|--------|------|
| **Flash** | 300 turns | Teleport 4 tiles | 0 |
| **Heal** | 240 turns | +100 HP instant | 0 |
| **Ignite** | 180 turns | 50 true damage + burn | 0 |
| **Smite** | 90 turns | 80 true damage | 0 |
| **Exhaust** | 210 turns | 50% slow for 3 turns | 0 |
| **Teleport** | 360 turns | Travel 10 tiles | 0 |
| **Cleanse** | 210 turns | Remove all debuffs | 0 |
| **Ghost** | 240 turns | +100 MS for 10 turns | 0 |
| **Barrier** | 210 turns | +60 armor/+40 MR for 2 turns | 0 |
| **Garrison** | 120 turns | +40 armor/+40 MR for 5 turns | 0 |

**Default Selection**: Flash + Heal

## Game Flow

### 1. Run Initialization
```typescript
const run = createRun('demacia', playerStats);
// run.currentCheckpoint = 0
// run.encountersInCurrentCheckpoint = 0
// run.totalEncountersCompleted = 0
```

### 2. Encounter (1v1 Battle)
```typescript
const combatState = initializeCombat(enemy, playerStats, 1, 10);
// Combat loop:
// - Player selects action (ability, summoner, item)
// - Enemy AI decides action
// - Both execute simultaneously via resolveTurn()
// - Repeat until winner determined

// After victory:
const result = {
  victory: true,
  damageDealt: 85,
  damageTaken: 32,
  currencyEarned: 50,
  lootReceived: [{ name: 'Sword', ... }]
};
const updatedRun = completeEncounter(run, result, lootReceived);
```

### 3. Checkpoint Decision (Every 10 Encounters)
```typescript
if (run.encountersInCurrentCheckpoint === 10) {
  const rewards = generateCheckpointRewards(run);
  // Show player 3 options:
  // rewards.option1 (Rest)
  // rewards.option2 (Loot)
  // rewards.option3 (Special)
  
  // After choice, apply loot or heal
  if (playerChoice === 'loot') {
    run = applyLoot(run, selectedItems);
  } else if (playerChoice === 'rest') {
    run = restAtCheckpoint(run, 50); // 50% healing
  }
}
```

### 4. Run End
```typescript
const summary = getRunSummary(run);
// summary.totalEncounters
// summary.totalCurrency
// summary.finalStats
// summary.success
```

## Damage Calculation Deep Dive

### Physical Damage (AD-based)
```
damage = baseDamage + (sourceStats.attackDamage × 0.65)
armor_mitigation = 1 - (targetStats.armor / (100 + targetStats.armor))
final_damage = damage × armor_mitigation × buffs × debuffs
```

**Example**: Assassin deals 90 base damage with 100 AD
```
90 + (100 × 0.65) = 155 base
target has 30 armor: mitigation = 1 - (30/130) = 0.77
final = 155 × 0.77 = 120 damage
```

### Magical Damage (AP-based)
```
damage = baseDamage + (sourceStats.abilityPower × 0.75)
mr_mitigation = 1 - (targetStats.magicResist / (100 + targetStats.magicResist))
final_damage = damage × mr_mitigation × buffs × debuffs
```

**Example**: Mage casts Q with 80 base damage and 120 AP
```
80 + (120 × 0.75) = 170 base
target has 25 MR: mitigation = 1 - (25/125) = 0.80
final = 170 × 0.80 = 136 damage
```

## Cooldown System

**Ability Cooldowns**:
- Q: 1 turn (usable almost every turn)
- W: 2-3 turns
- E: 3-4 turns
- R: 5-6 turns

**Summoner Cooldowns**: 90-360 turns (much longer than abilities)

**Tracking**:
```typescript
combatState.abilityCooldowns: Map<abilityKey, turnsRemaining>
combatState.summnerSpellCooldowns: Map<spellName, turnsRemaining>
```

Every turn, all cooldown values decrement by 1 until 0.

## Buff/Debuff System

### Buffs (Positive Effects)
- Stat bonuses (armor +30, AP +40)
- Movement/utility (speed +100, tenacity +40)
- Protection (shield effects)
- Duration: 2-5 turns typically

### Debuffs (Negative Effects)
- Crowd control: Stun (can't act), Root (can't move), Slow (speed -40%)
- Damage amplification: Take 20% more damage
- Ability restrictions: Silence (no abilities), can't use items
- Duration: 1-3 turns typically

### Example Application
```typescript
// Mage W ability applies Silence debuff
const effect: DebuffEffect = {
  silenced: true
};
// Enemy can't cast abilities next turn
const canCast = !isPlayerSilenced(combatState);
```

## Enemy AI (To Be Implemented)

**AI Decision Process**:
1. Evaluate player HP (target low HP = kill shot, high HP = whittle down)
2. Check own HP (low HP = defensive, high HP = aggressive)
3. Ability selection:
   - If can finish = use highest damage ability
   - If low HP = use CC (crowd control) or escape ability
   - If high HP = use damage ability for pressure
4. Summoner spell usage (rare, strategic)
5. Item usage (rare, emergency healing)

**Complexity Tiers**:
- **Minion**: Random ability selection (dumb)
- **Elite**: Simple priority (damage if full HP, CC if hurt)
- **Champion**: Adaptive (switches between offense/defense)
- **Boss**: Complex patters, multi-phase, combos

## Integration Points

### With Character Stats
- Used in damage calculation
- Modified by loot at checkpoints
- Reset per run

### With Quest System
- Quest determines starting region
- Region determines enemy pool + special encounter
- Path difficulty affects enemy tiers

### With UI Components (To Be Built)
- Combat HUD: Action bar, cooldowns, buffs/debuffs
- Checkpoint UI: 3 reward options with icons
- Run summary: Final stats, currency, encounters completed
- Enemy health bar, player health bar, mana bar

## Design Decisions

### Why Player-Controlled Timing?
Traditional roguelikes (Hades, Dead Cells) use fixed turn lengths. This system uses player-controlled timing because:
- Feels more responsive
- Reduces passive waiting
- Fits web-based gameplay better
- More skill-expressive (timing dodges, combos)

### Why 10 Encounters per Checkpoint?
- Sweet spot for: difficulty spike feels earned, not overwhelming
- Checkpoints every 10 = natural story beats
- Provides multiple permanent stat increases throughout run
- Less pressure than boss-only progression

### Why Simultaneous Action Resolution?
- More tactical (both sides commit to action)
- Prevents "optimal reactions" to known enemy move
- Matches LoL's turn structure (events happen simultaneously)
- More tense decision-making

### Why These Ability Cooldowns?
- Q: 1 turn = always available (basic spam)
- W: 2-3 turns = secondary spender
- E: 3-4 turns = utility/tactical
- R: 5-6 turns = powerful, uses 100 mana

Follows LoL's scaling (Q << W < E < R).

## Next Implementation Steps

1. **Enemy AI System**: Create `enemyAI.ts` with decision logic
2. **Random Events**: Create between-encounter healing system
3. **Combat UI**: React components for action bar, health bars, cooldowns
4. **Integration**: Wire up progression system to game flow
5. **Boss Encounters**: Special multi-phase boss fights
6. **Difficulty Scaling**: Enemy stat multipliers per checkpoint

