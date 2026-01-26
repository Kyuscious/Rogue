/**
 * STUN MECHANIC IMPLEMENTATION GUIDE
 * ==================================
 * 
 * This file documents the implementation of the stun mechanic and related items/spells.
 * 
 * OVERVIEW:
 * - Stuns delay enemy actions on the timeline by a specified amount
 * - Three implementations: Shield of Daybreak (item), Dazzle (spell), Flashbomb Trap (consumable)
 * 
 * FILES CREATED/MODIFIED:
 * 1. src/game/statusEffects.ts - NEW - Core stun system
 * 2. src/game/spells.ts - MODIFIED - Added range, castTime, AoE support + Dazzle spell
 * 3. src/game/items.ts - NEEDS UPDATE - Add Shield of Daybreak & Flashbomb Trap
 * 4. src/game/turnSystemV2.ts - NEEDS UPDATE - Support action delays from stuns
 * 5. src/components/screens/Battle/BattlefieldDisplay.tsx - NEEDS UPDATE - Visual AoE indicators
 * 6. src/components/screens/Battle/Battle.tsx - NEEDS UPDATE - Handle stun application
 * 
 * ITEMS TO ADD:
 * 
 * 1. Shield of Daybreak (Active Item)
 *    - Type: Active (usable in combat)
 *    - Effect: Stuns enemy for 1.0 turn
 *    - Range: Player's attack range
 *    - Cooldown: 3 turns
 *    - Stats: +20 Armor
 * 
 * 2. Flashbomb Trap (Consumable)
 *    - Type: Consumable
 *    - Effect: Places trap at enemy location (500 range)
 *    - Setup time: 0.5 turns
 *    - Stun duration: 0.5 turns after setup
 *    - Effect radius: 50 units (can be dodged)
 *    - Use range: 500 units
 *    - Stackable: Yes
 * 
 * SPELL ADDED:
 * 
 * Dazzle
 * - Cast time: 1.0 turn
 * - Stun duration: 1.0 turn
 * - Range: 625 units
 * - AoE: Rectangle (625 units)
 * - Cooldown: 3 turns
 * - Rarity: Epic
 * 
 * TURN SYSTEM CHANGES NEEDED:
 * 
 * 1. Track status effects in Battle component state
 * 2. When generating turn sequence, apply stun delays to affected entity actions
 * 3. When stun is applied:
 *    - Find all future actions for stunned entity
 *    - Delay their time values by stun amount
 *    - Re-sort the timeline
 * 
 * VISUALIZATION NEEDED:
 * 
 * 1. AoE Indicators:
 *    - Rectangle for Dazzle (blue, from player toward enemy, 625 units)
 *    - Circle for Flashbomb (red during setup, yellow when active, 50 unit radius)
 * 
 * 2. Timeline Indicators:
 *    - Show stun icon on delayed actions
 *    - Show cast time for delayed effects (Dazzle, Flashbomb)
 * 
 * IMPLEMENTATION PRIORITY:
 * 1. ✅ Status effects system (statusEffects.ts)
 * 2. ✅ Spell updates (range, castTime, AoE)
 * 3. ✅ Dazzle spell added
 * 4. ⏳ Add items to items.ts
 * 5. ⏳ Update turn system to apply stun delays
 * 6. ⏳ Add stun logic to Battle component
 * 7. ⏳ Add AoE visualization to BattlefieldDisplay
 * 
 * NEXT STEPS:
 * - Continue implementation with items
 * - Integrate stun delays into turn system
 * - Add visual feedback for AoE and stuns
 */
