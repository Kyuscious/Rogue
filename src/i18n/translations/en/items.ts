export const items = {
  // Starting Items
  dorans_blade: {
    name: "Doran's Blade",
    description: 'A blade for damage-dealing explorers',
    passive: 'Lifedrain: Gain 20 HP on enemy kill',
  },
  dorans_shield: {
    name: "Doran's Shield",
    description: 'Protective gear for explorers who prefer defense',
    passive: 'Enduring Focus: +2% max HP per encounter',
  },
  dorans_ring: {
    name: "Doran's Ring",
    description: 'A mystical focus for spellcasting explorers',
    passive: 'Drain: Deal 10 true damage on spell hit',
  },
  cull: {
    name: 'Cull',
    description: 'A scythe for greedy explorers',
    passive: 'Harvest: Double gold from Champion and Legend enemies',
  },
  world_atlas: {
    name: 'World Atlas',
    description: 'The book for the most curious explorers',
    passive: 'Trailblazer: +20% XP gain',
  },
  dark_seal: {
    name: 'Dark Seal',
    description: 'Glory: Defeating Champion or Legend rank enemies grants +10 AP permanently (stacks infinitely).',
    passive: 'Glory: +10 AP permanently per Champion/Legend defeated',
  },
  // Common Consumables
  health_potion: {
    name: 'Health Potion',
    description: 'A magical elixir that restores health over time',
    onUse: 'Restores 50 health over 5 turns',
  },
  flashbomb_trap: {
    name: 'Flashbomb Trap',
    description: 'A trap that stuns enemies after an arming time',
    onUse: 'Places a trap that stuns after 0.5 turn. Can be dodged by moving away.',
    active: 'Place a trap at enemy location (range 500). After 0.5 turn arming time, stuns for 0.5 turn in 50 unit radius.',
  },
  stealth_ward: {
    name: 'Stealth Ward',
    description: 'Invisible ward that reveals enemy stats',
    onUse: 'Reveals enemy stats for the rest of the encounter',
  },
  control_ward: {
    name: 'Control Ward',
    description: 'A ward that reveals enemy stats for multiple encounters',
  },
  oracle_lens: {
    name: 'Oracle Lens',
    description: 'A mystical lens that reveals hidden enemies',
    onUse: 'Allows attacking invisible enemies for the next 3 turns',
  },
  farsight_alteration: {
    name: 'Farsight Alteration',
    description: 'A magical device that allows planning ahead',
    onUse: 'Reveals what the next encounter will be',
  },
  poro_snax: {
    name: 'Poro Snax',
    description: 'A treat for poros',
  },
  // Common Items
  shield_of_daybreak: {
    name: 'Shield of Daybreak',
    description: 'A radiant shield that stuns enemies with each strike. Deals 30% AD damage and stuns for 1.0 turn on attack.',
  },
  shield_of_daybreak_old: {
    name: 'Shield of Daybreak (Active)',
    description: 'A radiant shield that can stun enemies on activation',
    active: 'Stuns enemy for 1.0 turn. Must be within attack range.',
  },
  long_sword: {
    name: 'Long Sword',
    description: 'A basic sword for the journey ahead',
  },
  cloth_armor: {
    name: 'Cloth Armor',
    description: 'Basic protection',
  },
  amplifying_tome: {
    name: 'Amplifying Tome',
    description: 'A simple book to enhance magical power',
  },
  kindlegem: {
    name: 'Kindlegem',
    description: 'A glowing gem of inner warmth',
  },
  sapphire_crystal: {
    name: 'Sapphire Crystal',
    description: 'A crystal that enhances magical abilities',
  },
  fearie_charm: {
    name: 'Fearie Charm',
    description: 'A charm that boosts magical abilities',
  },
  dagger: {
    name: 'Dagger',
    description: 'A small blade for quick strikes',
  },
  rejuvenation_bead: {
    name: 'Rejuvenation Bead',
    description: 'A bead that enhances health regeneration',
  },
  boots: {
    name: 'Boots',
    description: 'Basic footwear to increase movement speed',
  },
  // Epic Consumables
  elixir_of_iron: {
    name: 'Elixir of Iron',
    description: 'Grants a powerful buff for 15 encounters',
    onUse: 'Gain +300 Health, +250 Tenacity, and +150 Movement Speed for 15 encounters (persists across acts/regions)',
  },
  elixir_of_sorcery: {
    name: 'Elixir of Sorcery',
    description: 'Grants magical power and true damage for 15 encounters',
    onUse: 'Gain +50 Ability Power, +10 Magic Discovery, and +25 True Damage for 15 encounters',
  },
  elixir_of_wrath: {
    name: 'Elixir of Wrath',
    description: 'Grants physical power and lifesteal for 15 encounters',
    onUse: 'Gain +30 Attack Damage and +12% Lifesteal for 15 encounters',
  },
  // Epic Items
  pickaxe: {
    name: 'Pickaxe',
    description: 'A powerful mining tool turned weapon',
  },
  null_magic_mantle: {
    name: 'Null-Magic Mantle',
    description: 'Magical protection against spells',
  },
  // Legendary Items
  mejais_soulstealer: {
    name: "Mejai's Soulstealer",
    description: 'Enhanced Glory: Defeating Champion or Legend rank enemies grants +15 AP permanently (stacks infinitely). Retains stacks from Dark Seal.',
    passive: 'Enhanced Glory: +15 AP permanently per Champion/Legend defeated',
  },
  infinity_edge: {
    name: 'Infinity Edge',
    description: 'Attack damage and critical strike power',
  },
  abyssal_mask: {
    name: 'Abyssal Mask',
    description: 'Protection from the ocean depths',
  },
  nashor_tooth: {
    name: "Nashor's Tooth",
    description: "The fang of Nashor the beast",
  },
  rabadons_deathcap: {
    name: "Rabadon's Deathcap",
    description: 'Amplifies all ability power',
    passive: 'Magical Opus: Increase your total Ability Power by 30%',
  },
  kaenic_rookern: {
    name: 'Kaenic Rookern',
    description: 'A legendary shield',
  },
  warmogs_armor: {
    name: "Warmog's Armor",
    description: 'Massive health increase',
    passive: 'Heals 5% each turn you take no damage',
  },
  // Mythic Items
  trinity_force: {
    name: 'Trinity Force',
    description: 'A legendary combination of power',
  },
  // Transcendent Items
  lich_bane: {
    name: 'Lich Bane',
    description: 'Empowers your next attack after using an ability',
    passive: 'After using an ability, your next basic attack deals bonus magic damage',
  },
  guardian_angel: {
    name: 'Guardian Angel',
    description: 'Revives on death',
    passive: 'On death, revive with 50% health on the next turn',
  },
  // Exalted Items
  chalicar: {
    name: 'Chalicar',
    description: 'The legendary jewel-adorned crossblade boomerang',
  },
};
