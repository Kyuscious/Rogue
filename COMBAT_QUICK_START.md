# Combat System Quick Start Guide

## How to Use the Combat Systems

### 1. Starting a Run

```typescript
import { createRun, generateCheckpointRewards, applyLoot } from '@/game/roguelikeProgression';
import { initializeCombat, resolveTurn } from '@/game/combatSystem';
import { getAbilitiesForClass } from '@/game/abilities';
import { getDefaultSummonerSpells } from '@/game/summonerSpells';

// 1a. Create new run
const playerStats = {
  health: 100,
  attackDamage: 50,
  abilityPower: 30,
  armor: 20,
  magicResist: 15,
  // ... other 14 stats
};

const run = createRun('demacia', playerStats);
// run.currentCheckpoint = 0
// run.encountersInCurrentCheckpoint = 0
// run.totalEncountersCompleted = 0
// run.playerCurrentHp = 100 (max HP)
// run.runCurrency = 0
```

### 2. Starting a Battle

```typescript
import { getEnemyById } from '@/game/enemyDatabase';

// Get enemy from database
const enemy = getEnemyById('demacia_minion_soldier');

// Initialize combat
const combatState = initializeCombat(
  enemy,
  run.playerStats,
  1,  // First encounter
  10  // Total encounters in path
);

// combatState now has:
// - playerHp / playerMaxHp / playerMana
// - enemy reference
// - abilityCooldowns (all 0 at start)
// - turns: []
// - buffs: [], debuffs: []
```

### 3. Getting Available Abilities

```typescript
import { getAbilitiesForClass, getAbility } from '@/game/abilities';

// Get all abilities for player class
const abilities = getAbilitiesForClass('mage');
// abilities = [Q, W, E, R]

// Get specific ability
const q = getAbility('mage', 'Q');
console.log(q.name);        // "Fireball"
console.log(q.manaCost);    // 40
console.log(q.cooldown);    // 1
console.log(q.baseDamage);  // 60
console.log(q.apScaling);   // 0.75
```

### 4. Resolving a Combat Turn

```typescript
// Player decides to cast ability Q
const playerAction: CombatAction = {
  type: 'ability',
  abilityKey: 'Q',
  targetType: 'enemy'
};

// Enemy decides to attack (simplified, real AI is more complex)
const enemyAction: CombatAction = {
  type: 'ability',
  abilityKey: 'Q',
  targetType: 'player'
};

// Resolve turn - both actions happen simultaneously
const newCombatState = resolveTurn(combatState, playerAction, enemyAction);

// After turn:
// - newCombatState.enemy.hp reduced
// - newCombatState.playerHp reduced
// - newCombatState.turns has new Turn object
// - Cooldowns decremented
// - Check newCombatState.winner (null = combat continues)
```

### 5. Handling Combat Victory

```typescript
// After combatState.winner is set to 'player'

const encounterResult = {
  encounterNumber: 1,
  checkpointNumber: 0,
  enemy: enemy,
  victory: true,
  damageDealt: 120,
  damageTaken: 45,
  currencyEarned: 50,
  lootReceived: [
    {
      id: 'loot_sword',
      name: 'Sword of Power',
      type: 'stat_boost',
      statModifier: { attackDamage: 10 },
      rarity: 'common'
    }
  ],
  turnsUsed: 8
};

// Complete encounter in run
const updatedRun = completeEncounter(
  run,
  encounterResult,
  encounterResult.lootReceived
);

// updatedRun now has:
// - totalEncountersCompleted: 1
// - encountersInCurrentCheckpoint: 1
// - runCurrency: 50
// - lootPool: [sword]
```

### 6. Reaching a Checkpoint (Every 10 Encounters)

```typescript
// After 10 encounters...
if (updatedRun.encountersInCurrentCheckpoint === 10) {
  // Generate 3 reward options
  const rewards = generateCheckpointRewards(updatedRun);
  
  // rewards.option1 = { type: 'rest', healing: 50 }
  // rewards.option2 = { type: 'loot', items: [...] }
  // rewards.option3 = { type: 'special', specialEncounter: {...} }
  
  // Show UI with 3 buttons...
  
  // If player chooses REST
  if (playerChoice === 'rest') {
    updatedRun = restAtCheckpoint(updatedRun, 50);
    // playerCurrentHp += maxHp * 0.5
  }
  
  // If player chooses LOOT
  else if (playerChoice === 'loot') {
    const selectedItem = rewards.option2.items[0]; // Player picks one
    updatedRun = applyLoot(updatedRun, [selectedItem]);
    // playerStats.attackDamage += 20
  }
  
  // If player chooses SPECIAL
  else if (playerChoice === 'special') {
    const specialEnemy = rewards.option3.specialEncounter.enemy;
    // Start combat with special enemy
    // Higher difficulty, bigger rewards
  }
  
  // Reset for next checkpoint
  updatedRun.encountersInCurrentCheckpoint = 0;
  updatedRun.currentCheckpoint += 1;
}
```

### 7. Getting Summoner Spells

```typescript
import { 
  getDefaultSummonerSpells, 
  getSummonerSpellsForSlot,
  selectSummonerSpells 
} from '@/game/summonerSpells';

// Get default (Flash + Heal)
const [spellD, spellF] = getDefaultSummonerSpells();

// Or let player choose from pool
const dSlotOptions = getSummonerSpellsForSlot('D');  // All D-slot spells
const fSlotOptions = getSummonerSpellsForSlot('F');  // All F-slot spells

// Select
const [chosen_D, chosen_F] = selectSummonerSpells(
  dSlotOptions[0],  // Flash
  fSlotOptions[2]   // Ignite
);

// Use in combat
const summonerAction: CombatAction = {
  type: 'summoner',
  spellName: 'Flash',
  targetType: 'self'
};
```

### 8. Calculating Damage Manually

```typescript
import { calculateDamage } from '@/game/combatSystem';

// Mage with 100 AP casting ability
const damage = calculateDamage(
  80,                    // base damage
  playerStats,          // source (caster)
  enemyStats,           // target (receiver)
  'magical',            // type
  { playerBuff: 1.2 }   // 20% ability power buff
);

// Calculation:
// 80 + (100 × 0.75) = 155 base
// × 1.2 (buff) = 186
// × MR mitigation = final
```

### 9. Getting Run Summary

```typescript
import { getRunSummary } from '@/game/roguelikeProgression';

// At end of run
const summary = getRunSummary(run);

// summary contains:
// - totalEncounters: 23
// - totalCurrency: 750
// - finalStats: { ... }
// - encounters: [EncounterResult[], ...]
// - success: true/false
```

### 10. Checking Debuffs

```typescript
import { isPlayerSilenced, isPlayerStunned } from '@/game/combatSystem';

// In UI or combat logic
if (isPlayerSilenced(combatState)) {
  // Disable ability buttons
  // Show "SILENCED" warning
}

if (isPlayerStunned(combatState)) {
  // Disable all action buttons
  // Show "STUNNED" warning
  // Auto-pass turn
}
```

## Common Patterns

### Pattern 1: Full Combat Loop

```typescript
let combatState = initializeCombat(enemy, playerStats, 1, 10);

while (combatState.combatActive) {
  // Get player action (from UI)
  const playerAction = await getPlayerAction();
  
  // Get enemy action (from AI)
  const enemyAction = getEnemyAction(combatState);
  
  // Resolve
  combatState = resolveTurn(combatState, playerAction, enemyAction);
  
  // Update UI with new state
  updateCombatUI(combatState);
  
  // Delay for animations
  await delay(500);
}

// Handle victory/defeat
if (combatState.winner === 'player') {
  return { victory: true, ... };
} else {
  return { victory: false, ... };
}
```

### Pattern 2: Checkpoint Decision

```typescript
const rewards = generateCheckpointRewards(run);

// Show 3 buttons with rewards
const choice = await showCheckpointUI(rewards);

switch (choice) {
  case 'rest':
    run = restAtCheckpoint(run, 50);
    break;
  case 'loot':
    run = applyLoot(run, [rewards.option2.items[selectedIndex]]);
    break;
  case 'special':
    // Start special combat
    break;
}

// Progress to next checkpoint
run.encountersInCurrentCheckpoint = 0;
run.currentCheckpoint += 1;
```

### Pattern 3: Build Customization

```typescript
// Player is AD-focused (Assassin, ADC, Bruiser)
const adBuild = {
  abilities: getAbilitiesForClass('assassin'),
  summoners: [Flash, Exhaust],  // Mobility + CC
  targetLoot: ['attackDamage', 'critical', 'lifesteal']
};

// Player is AP-focused (Mage, Enchanter)
const apBuild = {
  abilities: getAbilitiesForClass('mage'),
  summoners: [Flash, Heal],  // Safety + sustain
  targetLoot: ['abilityPower', 'magic', 'manaRegen']
};

// Player is tank-focused (Tank, Bruiser)
const tankBuild = {
  abilities: getAbilitiesForClass('tank'),
  summoners: [Cleanse, Barrier],  // Protection
  targetLoot: ['tankDefense', 'health', 'tenacity']
};
```

## Data Structures Quick Reference

### CombatAction
```typescript
{
  type: 'ability' | 'summoner' | 'item' | 'potion';
  // If ability:
  abilityKey?: 'Q' | 'W' | 'E' | 'R';
  // If summoner:
  spellName?: string;
  // If item/potion:
  itemId?: string;
  // Common:
  targetType: 'enemy' | 'self' | 'ally'; // (ally unused in 1v1)
}
```

### CombatState
```typescript
{
  currentEncounter: number;
  currentPathEncounters: number;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  playerStats: CharacterStats;
  enemy: Enemy;
  enemyCurrentHp: number;
  turns: Turn[];
  abilityCooldowns: Map<'Q'|'W'|'E'|'R', number>;
  summnerSpellCooldowns: Map<string, number>;
  itemCooldowns: Map<string, number>;
  buffs: ActiveBuff[];
  debuffs: ActiveDebuff[];
  isPlayerTurn: boolean;
  combatActive: boolean;
  winner: 'player' | 'enemy' | null;
}
```

### Ability
```typescript
{
  key: 'Q' | 'W' | 'E' | 'R';
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  range: number;
  baseDamage: number;
  adScaling: number;      // 0.6 = 60% AD
  apScaling: number;      // 0.75 = 75% AP
  school: 'physical' | 'magical' | 'mixed' | 'true';
  effects: AbilityEffect[];
}
```

## Debugging Tips

```typescript
// Log ability info
const q = getAbility('mage', 'Q');
console.log(`${q.name}: ${q.baseDamage} + ${q.apScaling * 100}% AP`);

// Log damage calculation
const dmg = calculateDamage(q.baseDamage, playerStats, enemyStats, 'magical');
console.log(`Final damage: ${dmg}`);

// Log combat state
console.log(`Player: ${combatState.playerHp}/${combatState.playerMaxHp}`);
console.log(`Enemy: ${combatState.enemyCurrentHp}/${combatState.enemy.maxHp}`);
console.log(`Cooldowns:`, Object.fromEntries(combatState.abilityCooldowns));

// Log run progress
console.log(`Checkpoint ${run.currentCheckpoint}, Encounter ${run.encountersInCurrentCheckpoint}/10`);
console.log(`Total completed: ${run.totalEncountersCompleted}`);
console.log(`Current HP: ${run.playerCurrentHp}/${run.playerMaxHp}`);
console.log(`Currency: ${run.runCurrency}`);
```

## Next: Implementing Enemy AI

The system is ready for AI! Key function signature:

```typescript
// In src/game/enemyAI.ts
export function getEnemyAction(
  combatState: CombatState
): CombatAction {
  const { enemy, enemyCurrentHp, playerHp } = combatState;
  
  // Decision logic:
  // 1. If player HP < 30% → use ability with highest damage
  // 2. If enemy HP < 50% → use CC or heal
  // 3. Otherwise → use cooldown-available ability
  
  return { type: 'ability', abilityKey: 'Q', targetType: 'enemy' };
}
```

All systems ready to go! 🚀
