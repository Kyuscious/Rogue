export const spells = {
  // Starting Spells
  for_demacia: {
    name: "For Demacia!",
    description: "Demacia's rallying cry that strengthens your resolve, granting +5% AD and +0.5 Attack Speed for 1 turn.",
    effects: "Grants +5% Attack Damage and +0.5 Attack Speed for the next turn",
  },
  rejuvenation: {
    name: "Rejuvenation",
    description: "Focus your spiritual energy to heal your wounds for 20 HP + 20% of your Ability Power.",
    effects: "Heals for 20 + 20% AP",
  },
  quicksand: {
    name: "Quicksand",
    description: "Summon quicksand to damage and slow an enemy, reducing their movement speed by 10% for 3 turns.",
    effects: "Deals 20% AP damage and reduces target's movement speed by 10% for 3 turns",
  },
  test_spell: {
    name: "Test Spell",
    description: "A basic spell that deals magic damage based on your Ability Power.",
    effects: "Deals 100% AP magic damage",
  },
  // Common Spells
  purify: {
    name: "Purify",
    description: "Removes all debuffs from a targeted ally.",
    effects: "Removes all debuffs from targeted ally",
  },
  // Legendary Spells
  wish: {
    name: "Wish",
    description: "Restores health. Heals for 150 + 50% AP. If below 40% HP, heals for 50% more!",
    effects: "Heals for 150 + 50% AP. Heals for 50% more if below 40% max HP",
  },
  dazzle: {
    name: "Dazzle",
    description: "After 1.0 turn cast time, stuns target for 1.0 turn. Range: 625 units.",
    effects: "Stuns target for 1.0 turn after 1.0 turn cast time",
  },
};
