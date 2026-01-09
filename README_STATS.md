# 📚 Documentation Index - Stats & Class System

## 🎯 Start Here

**New to the system?** → Start with [SYSTEM_MAP.txt](SYSTEM_MAP.txt)
- Visual overview of all 18 stats, 8 classes, 7 loot types
- Shows how everything connects
- Takes 2 minutes to understand the whole thing

---

## 📖 Core Documentation

### [STATS_GUIDE.md](STATS_GUIDE.md) - **Comprehensive Reference**
- Full list of all 18 stats with descriptions
- All 8 character classes with strengths/weaknesses
- All 7 loot types with examples
- Before/after examples
- **Best for:** Understanding the complete system

### [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md) - **What You Have**
- Overview of everything created
- Which files to look at
- Impact on gameplay
- What can be built next
- **Best for:** Getting oriented

### [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - **Cheat Sheet**
- One-page quick lookup
- All stats listed
- All classes listed
- All loot types listed
- **Best for:** Quick lookups while coding

---

## 🔧 Implementation Guides

### [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) - **REQUIRED - Apply Updates Here**
- **Option 1:** Copy & Paste method (30 seconds) ⭐ **FASTEST**
- **Option 2:** Manual editing method (with cheat sheet)
- Troubleshooting common errors
- What each change does
- **Best for:** Actually applying the updates to your code

### [BULK_UPDATE.md](BULK_UPDATE.md) - **Bulk Edit Reference**
- Find & Replace patterns
- Regex examples for VS Code
- Templates for each enemy
- **Best for:** If you want to use Find & Replace

### [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - **Class Mapping Reference**
- Mapping of enemies to classes
- Mapping of classes to loot types
- Quick reference tables
- **Best for:** Looking up specific enemy classifications

---

## 💻 Source Code Files

### [src/game/statsSystem.ts](src/game/statsSystem.ts) - **Core System**
- CharacterStats interface (18 stats)
- CharacterClass type (8 classes)
- LootType type (7 loot types)
- Helper functions:
  - `getScaledStats()` - Apply class multipliers
  - `calculateArmorMitigation()` - Reduce damage by armor
  - `calculateMagicMitigation()` - Reduce damage by MR
  - `getClassDescription()` - Get flavor text
- Default stat values
- Class stat multipliers
- Loot type to class alignment
- **Best for:** Implementing new features using the system

### [src/game/items.ts](src/game/items.ts) - **Updated Type Definitions**
- `CharacterClass` type added
- `LootType` type added  
- `Enemy` interface updated with `class` and `lootType` fields
- **Best for:** TypeScript type checking

### [src/game/enemyDatabase.ts](src/game/enemyDatabase.ts) - **UPDATE NEEDED**
- Currently missing `class` and `lootType` on all enemies
- Use [UPDATED_ENEMY_DATABASE.ts](UPDATED_ENEMY_DATABASE.ts) to replace it
- **Best for:** Reference (will be replaced)

---

## ✅ Updated Files Ready to Use

### [UPDATED_ENEMY_DATABASE.ts](UPDATED_ENEMY_DATABASE.ts) - **Ready to Deploy**
- Complete enemy database
- All 30+ enemies have `class` and `lootType` fields
- Copy-paste ready
- **How to use:** Copy → Paste into src/game/enemyDatabase.ts
- **Time to apply:** 30 seconds

---

## 🎮 Game Design Documents

### System Overview
```
18 STATS (what characters have)
  ↓
8 CLASSES (what archetype they are)
  ↓
7 LOOT TYPES (what items they drop)
  ↓
30+ ENEMIES (all classified)
  ↓
ROGUELIKE PROGRESSION (player collects items matching their build)
```

### Class Distribution (What You Have Now)
- **Demacia:** 2 Tanks, 1 Assassin, 2 Fighters, 2 Mages, 1 ADC
- **Shurima:** 3 Mages, 1 Tank, 2 Fighters, 1 ADC
- **Ionia:** 2 Support/Enchanter, 2 Mages, 1 Fighter, 1 Assassin, 2 Mages

---

## 🚀 Quick Start Workflow

1. **Understand the system** (2 min)
   - Read [SYSTEM_MAP.txt](SYSTEM_MAP.txt)

2. **Pick your update method** (30 sec decision)
   - Read [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) start

3. **Apply the update** (30 seconds to 5 minutes)
   - Option 1: Copy-paste from [UPDATED_ENEMY_DATABASE.ts](UPDATED_ENEMY_DATABASE.ts)
   - Option 2: Manual editing with [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md)

4. **Verify success** (10 sec)
   - Check for TypeScript errors
   - All enemies have red squiggles gone

5. **Done!** 🎉
   - You now have a complete LoL-inspired stats system

---

## 📋 File Organization

```
PROJECT_ROOT/
├── SYSTEM_MAP.txt                      ← Start here for visual overview
├── STATS_GUIDE.md                      ← Complete stat reference
├── COMPLETE_SUMMARY.md                 ← What you have now
├── QUICK_REFERENCE.md                  ← One-page cheat sheet
├── HOW_TO_UPDATE.md                    ← Apply updates here ⭐
├── BULK_UPDATE.md                      ← Find & Replace patterns
├── MIGRATION_GUIDE.md                  ← Class mappings
├── UPDATED_ENEMY_DATABASE.ts           ← Ready-to-use database
└── src/game/
    ├── statsSystem.ts                  ← Core system (NEW)
    ├── items.ts                        ← Types updated (MODIFIED)
    └── enemyDatabase.ts                ← Needs update (FROM UPDATED_ENEMY_DATABASE.ts)
```

---

## ❓ Common Questions

**Q: Where do I start?**
A: Read [SYSTEM_MAP.txt](SYSTEM_MAP.txt) first (2 minutes), then [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md)

**Q: How do I apply the updates?**
A: Follow [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) - copy-paste method is fastest (30 seconds)

**Q: What if I get TypeScript errors after updating?**
A: Check [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) troubleshooting section

**Q: Can I add more loot types?**
A: Yes! Add to `LootType` in items.ts, then reference in enemies

**Q: Can I add more classes?**
A: Yes! Add to `CharacterClass` in items.ts, then update in statsSystem.ts

**Q: What about existing code that doesn't use the new fields yet?**
A: Everything still works. The new fields are just data. You can use them in future features.

---

## 🎯 Next Steps After Updating

Once you've applied the updates:

1. **Test the game** - Make sure quest system still works
2. **Use these helpers** in future features:
   - `getScaledStats()` - For dynamic enemy difficulty
   - `calculateArmorMitigation()` - For damage calculations
   - `CLASS_STAT_MULTIPLIERS` - For balancing
3. **Implement new features** using class/loot data:
   - AI behavior based on class
   - Quest recommendations
   - Item suggestions to player
   - Class-specific abilities

---

## 📞 Support

- **Stuck on an update?** → See [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) troubleshooting
- **Don't understand a stat?** → Look in [STATS_GUIDE.md](STATS_GUIDE.md)
- **Need a quick reference?** → Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Want to understand everything?** → Start with [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)

---

## ✨ You're All Set!

Everything you need is in this folder. Pick an option in [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md) and apply it.

**Time to complete: 5 minutes total**

Good luck! 🚀
