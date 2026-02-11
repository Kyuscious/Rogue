# Buff Persistence System - Complete Guide

## Three Types of Buffs

Your game has three distinct buff categories with different persistence rules:

### 1. **Combat-Only Buffs** (Default)
Buffs that expire at the end of each encounter. Cleared automatically when switching enemies.

**Examples:**
- For Demacia (+5% AD & shield for 2 turns)
- Life Draining from Doran's Blade
- Any temporary combat effect

**How it works:**
- Stored in `playerBuffs` state (NOT `persistentBuffs`)
- Uses `BuffStack` with `expiresAtTurn` for turn-based expiry
- Automatically cleared in Battle.tsx when enemy changes:
  ```typescript
  setPlayerBuffs(state.persistentBuffs || []); // Only keep persistent buffs
  ```

**How to create:**
```typescript
// During battle, add to playerBuffs using addOrMergeBuffStack()
const newBuffs = addOrMergeBuffStack(
  playerBuffs,
  'for_demacia',
  'For Demacia',
  'attackDamage',
  5, // +5% AD
  2, // 2 turn duration
  currentTurn,
  'attackDamage'
);
setPlayerBuffs(newBuffs);
```

---

### 2. **Encounter-Persistent Buffs with Duration**
Buffs that carry across multiple encounters but eventually expire after X encounters pass.

**Examples:**
- Well-Rested from rest option (lasts 10 encounters)
- Any item/event that grants stats for a limited duration
- Potions that buff stats temporarily

**How it works:**
- Stored in `persistentBuffs` with `durationType: 'encounters'`
- Has `encountersRemaining: X` field
- `endBattle()` calls `incrementEncounterCount()` which:
  - Decrements `encountersRemaining` for all encounter-type buffs
  - Removes buffs when `encountersRemaining` reaches 0
- **Key fields:**
  - `durationType: 'encounters'` - marks it as encounter-duration type
  - `encountersRemaining: 10` - will last 10 more encounters

**Implementation in store.ts:**
```typescript
// When incrementEncounterCount runs:
const updatedBuffs = persistentBuffs
  .map(buff => {
    if (buff.durationType === 'encounters' && buff.encountersRemaining !== undefined) {
      return { ...buff, encountersRemaining: buff.encountersRemaining - 1 };
    }
    return buff;
  })
  .filter(buff => {
    // Remove if encounter-based buff expired
    if (buff.durationType === 'encounters') {
      return buff.encountersRemaining && buff.encountersRemaining > 0;
    }
    return true; // Keep all other buffs
  });
```

**How to create (example - Well-Rested):**
```typescript
// In store.ts or a buff creation function:
const wellRestedBuff: CombatBuff = {
  id: 'well_rested',
  name: 'Well-Rested',
  stat: 'attackDamage',
  stacks: [{
    addedTime: 0,
    expiresAtTurn: 9999, // Never expires by turn in persistent context
    effectAmount: 10, // +10% AD
    stackId: 'well_rested_stack_1',
  }],
  durationType: 'encounters', // ← KEY: Mark as encounter-duration
  encountersRemaining: 10, // ← Will last exactly 10 encounters
  type: 'stacking_permanent',
};

// Add to persistentBuffs
persistentBuffs: [...persistentBuffs, wellRestedBuff]
```

---

### 3. **Permanent Stacking Buffs**
Buffs that persist for the entire run and never expire. Stack count increases each time effect triggers.

**Examples:**
- Dark Seal stacks (grows each kill)
- Stacking bonuses that never reset
- Permanent run-wide effects

**How it works:**
- Stored in `persistentBuffs` with NO `durationType` or `encountersRemaining`
- Never decremented or removed
- **Key fields:**
  - NO `durationType` field (undefined)
  - NO `encountersRemaining` field
  - Treated as permanent in `incrementEncounterCount()` filter

**Implementation (stays in persistentBuffs forever):**
```typescript
// In incrementEncounterCount():
.filter(buff => {
  if (buff.durationType === 'encounters') {
    return buff.encountersRemaining && buff.encountersRemaining > 0;
  }
  return true; // ← Without durationType, buff always passes (permanent)
});
```

**How to create (example - Dark Seal stacks):**
```typescript
// Create initial Dark Seal buff
const darkSealBuff: CombatBuff = {
  id: 'dark_seal',
  name: 'Dark Seal Stack',
  stat: 'abilityPower',
  stacks: [{
    addedTime: 0,
    expiresAtTurn: 9999, // Permanent - never expires
    effectAmount: 15, // +15 AP per stack
    stackId: 'dark_seal_stack_1',
  }],
  // NO durationType or encountersRemaining - makes it permanent
  type: 'stacking_permanent',
  isInfinite: true,
};

// Add to persistentBuffs
persistentBuffs: [...persistentBuffs, darkSealBuff]

// Later, when condition triggers (kill), add another stack:
const existingDarkSeal = persistentBuffs.find(b => b.id === 'dark_seal');
if (existingDarkSeal) {
  existingDarkSeal.stacks.push({
    addedTime: 0,
    expiresAtTurn: 9999,
    effectAmount: 15,
    stackId: `dark_seal_stack_${Date.now()}`,
  });
}
```

---

## Flow Chart

```
Combat-Only Buffs:
┌─────────────────────────────┐
│ Battle with Enemy           │
│ For Demacia cast            │
│ → Add to playerBuffs        │
│ → Display with 2 turns left │
│ → Decays as turns pass      │
└──────────────┬──────────────┘
               │
               ↓
        ┌──────────────┐
        │ New Enemy    │
        │ switchEnemy  │
        └──────────────┘
               │
               ↓
   ┌───────────────────────┐
   │ playerBuffs reset to  │
   │ only persistentBuffs  │
   │ For Demacia removed   │ ← Automatic cleanup
   └───────────────────────┘

Encounter-Persistent Buffs:
┌─────────────────────────────┐
│ Buff applied               │
│ durationType: 'encounters' │
│ encountersRemaining: 10    │
│ → Added to persistentBuffs │
│ → Persists across battles  │
└──────────────┬──────────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Battle ends          │
    │ endBattle() called   │
    │ incrementEncounter() │
    │ encountersRemaining: │
    │ 10 → 9 → 8 → ...    │
    └──────────────────────┘
               │
               ↓
    ┌──────────────────────┐
    │ After 10 battles     │
    │ encountersRemaining:0│
    │ → REMOVED from list  │
    └──────────────────────┘

Permanent Stacking Buffs:
┌──────────────────────────┐
│ Dark Seal buff created   │
│ NO durationType field    │
│ → Added to persistentBuffs
├──────────────────────────┤
│ All 3 systems           │
│ persistentBuffs includes│
│ → Always survives       │
│   incrementEncounter()  │
│ → Never expires         │
└──────────────────────────┘
```

---

## Helper Functions

Use these functions in `itemSystem.ts` to easily create buffs:

```typescript
// Combat-only buff (for use during battle)
export function createCombatOnlyBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
  durationTurns: number;
  currentTurn?: number;
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: options.currentTurn ?? 0,
      expiresAtTurn: (options.currentTurn ?? 0) + options.durationTurns,
      effectAmount: options.effectAmount,
      stackId: `${options.id}_${Date.now()}`,
    }],
    type: 'instant',
  };
}

// Encounter-persistent buff
export function createEncounterPersistentBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
  encountDuration: number; // Number of encounters this lasts
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: 0,
      expiresAtTurn: 9999,
      effectAmount: options.effectAmount,
      stackId: `${options.id}_persistent_${Date.now()}`,
    }],
    durationType: 'encounters',
    encountersRemaining: options.encountDuration,
    type: 'stacking_permanent',
  };
}

// Permanent stacking buff
export function createPermanentStackingBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: 0,
      expiresAtTurn: 9999,
      effectAmount: options.effectAmount,
      stackId: `${options.id}_stack_${Date.now()}`,
    }],
    type: 'stacking_permanent',
    isInfinite: true,
  };
}
```

---

## Current System Status

✅ **Already implemented:**
- Combat-only buffs clear automatically at encounter boundary
- Encounter-persistent buff decay in `incrementEncounterCount()`
- Permanent buff preservation in filter logic
- `endBattle()` calls increment counter automatically

✅ **Elixirs use this system:**
- Elixir of Iron: `encountersRemaining: 15`
- Elixir of Sorcery: `encountersRemaining: 15`
- Elixir of Wrath: `encountersRemaining: 15`

---

## Integration Checklist

For any new buff-granting item/event, follow this checklist:

- [ ] Determine buff type (combat-only, encounter-persistent, permanent)
- [ ] If combat-only: Add to `playerBuffs` during battle only
- [ ] If encounter-persistent: Set `durationType: 'encounters'` + `encountersRemaining: X`
- [ ] If permanent: Omit `durationType` and `encountersRemaining`
- [ ] Add to `persistentBuffs` if not combat-only
- [ ] Test across multiple encounters to verify expiration
- [ ] Verify `endBattle()` is being called after battle ends
- [ ] Check console logs: "🔢 Encounter X completed. Active persistent buffs: Y"
