import { Translations } from '../types';

export const en: Translations = {
  common: {
    loading: 'Loading...',
    back: 'Back',
    continue: 'Continue',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    save: 'Save',
    level: 'Level',
    gold: 'Gold',
    floor: 'Floor',
    hp: 'HP',
    damage: 'Damage',
    armor: 'Armor',
    magicResist: 'Magic Resist',
    attackDamage: 'Attack Damage',
    abilityPower: 'Ability Power',
    health: 'Health',
    mana: 'Mana',
    energy: 'Energy',
  },

  mainMenu: {
    title: 'Runeterra Roguelike',
    newGame: 'New Game',
    continue: 'Continue',
    settings: 'Settings',
    credits: 'Credits',
  },

  settings: {
    title: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',
    volume: 'Volume',
    music: 'Music',
    soundEffects: 'Sound Effects',
    fullscreen: 'Fullscreen',
    audio: 'Audio',
    masterVolume: 'Master Volume',
    sfxVolume: 'SFX Volume',
    musicVolume: 'Music Volume',
    voiceVolume: 'Voice Volume',
    masterVolumeDesc: 'Overall game volume',
    sfxVolumeDesc: 'Sound effects volume',
    musicVolumeDesc: 'Background music volume',
    voiceVolumeDesc: 'Character voice volume',
  },

  characterSelect: {
    title: 'Choose Your Champion',
    selectYourChampion: 'Select Your Champion',
    chooseRegion: 'Choose Your Starting Region',
    startAdventure: 'Start Adventure',
    stats: 'Stats',
    abilities: 'Abilities',
  },

  classes: {
    marksman: 'Marksman',
    mage: 'Mage',
    vanguard: 'Vanguard',
    assassin: 'Assassin',
    support: 'Support',
    fighter: 'Fighter',
  },

  battle: {
    yourTurn: 'Your Turn',
    enemyTurn: 'Enemy Turn',
    victory: 'Victory!',
    defeat: 'Defeat',
    selectReward: 'Select Your Reward',
    nextFloor: 'Next Floor',
    useAbility: 'Use Ability',
    endTurn: 'End Turn',
    flee: 'Flee',
    inventory: 'Inventory',
  },

  inventory: {
    title: 'Inventory',
    equipped: 'Equipped',
    backpack: 'Backpack',
    empty: 'Empty',
    use: 'Use',
    equip: 'Equip',
    unequip: 'Unequip',
    drop: 'Drop',
  },

  postRegion: {
    regionCompleted: 'Region Completed!',
    chooseNextAction: 'Choose Your Next Action',
    restTitle: 'Rest',
    restDescription: 'Restore health and prepare for the next challenge',
    modifyBuildTitle: 'Modify Build',
    modifyBuildDescription: 'Upgrade your equipment and abilities',
    exploreTitle: 'Explore',
    exploreDescription: 'Search for treasures and encounters',
    noEventsAvailable: 'No events available',
    currentHp: 'Current HP',
  },

  disclaimer: {
    title: 'Runeterrogue',
    subtitle: 'A Runeterra Roguelike Adventure',
    paragraph1: 'This is a fan-made project. Most of the characters, names, and IP are property of Riot Games, Inc.',
    paragraph2: 'This project is not affiliated with, endorsed by, sponsored by, or approved by Riot Games. (Yet? Hopefully one day Corporate Mundo will notice us!)',
    paragraph3: "According to Riot Games's Legal Jibber Jabber, this project is strictly for non-commercial use for the community to enjoy totally for free forever. We will however try to register this product and apply for a Production API usage once it's completely stable (v1.0.0).",
    paragraph4: "All artwork, sound effects, music, and medias are created locally but still subject to Riot's IP, we try to remain as Lore-accurate as possible purely for the sake of immersion and discovery of Runeterra.",
    paragraph5: "If for any reason, at any given time riot's legal team decides to see this project taken down, we will comply immediately by stopping development and distribution. (Though we hope it never comes to that, we stay realistic!)",
    paragraph6: "It's an honour to create something inspired by Riot's amazing work, and we hope you enjoy playing this work of passion as much as we do creating it!",
    paragraph7: 'If you have any questions or concerns, please contact us through our information below.',
    thankYou: 'Thank you!',
    legalLinkText: 'Legal Jibber Jabber',
    dontShowAgain: 'Do not show again',
    skip: 'Skip',
  },

  items: {
    // ===== STARTER ITEMS =====
    dorans_blade: {
      name: "Doran's Blade",
      description: "A blade for explorers who deal physical damage",
      passive: "Life Draining: Gain 20 HP when defeating an enemy",
    },
    dorans_shield: {
      name: "Doran's Shield",
      description: "Protective gear for explorers who prefer defense",
      passive: "Enduring Focus: +2% max HP per encounter",
    },
    dorans_ring: {
      name: "Doran's Ring",
      description: "A mystic focus for spellcasting explorers",
      passive: "Drain: Deal 10 true damage on spell hit",
    },
    cull: {
      name: "Cull",
      description: "A scythe for greedy explorers",
      passive: "Reap: Double gold from Champion and Legend enemies",
    },
    world_atlas: {
      name: "World Atlas",
      description: "The book for the most curious explorers",
      passive: "Pathfinder: +20% XP gain",
    },
    dark_seal: {
      name: "Dark Seal",
      description: "Glory: Defeating Champion or Legend tier enemies grants +10 AP permanently (stacks endlessly).",
      passive: "Glory: +10 AP permanently per Champion/Legend defeated",
    },
    
    // ===== CONSUMABLES =====
    health_potion: {
      name: "Health Potion",
      description: "A magical elixir that restores health over time",
      onUse: "Restores 50 health over 5 turns",
    },
    flashbomb_trap: {
      name: "Flashbomb Trap",
      description: "A trap that stuns enemies after setup time",
      onUse: "Places a trap that stuns after 0.5 turns. Can be dodged by moving away.",
      active: "Places trap at enemy location (500 range). After 0.5 turn setup, stuns for 0.5 turns in 50 unit radius.",
    },
    stealth_ward: {
      name: "Stealth Ward",
      description: "Invisible ward that reveals the stats of the enemy",
      onUse: "Reveals the enemy stats for the remainder of the encounter",
    },
    oracle_lens: {
      name: "Oracle Lens",
      description: "A mystical lens that reveals hidden enemies",
      onUse: "Allows to attack invisible enemies for the next 3 turns",
    },
    farsight_alteration: {
      name: "Farsight Alteration",
      description: "A magical device that allows to plan ahead",
      onUse: "Reveals what the next encounter will be",
    },
    
    // ===== ELIXIRS =====
    elixir_of_iron: {
      name: "Elixir of Iron",
      description: "Grants a powerful buff for 15 encounters",
      onUse: "Gain +300 Health, +250 Tenacity, and +150 Movement Speed for 15 encounters (persists across acts/regions)",
    },
    elixir_of_sorcery: {
      name: "Elixir of Sorcery",
      description: "Grants magical power and true damage for 15 encounters",
      onUse: "Gain +50 Ability Power, +10 Magic Find, and +25 True Damage for 15 encounters",
    },
    elixir_of_wrath: {
      name: "Elixir of Wrath",
      description: "Grants physical power and lifesteal for 15 encounters",
      onUse: "Gain +30 Attack Damage and +12% Lifesteal for 15 encounters",
    },
    
    // ===== COMMON ITEMS =====
    shield_of_daybreak: {
      name: "Shield of Daybreak",
      description: "A radiant shield that stuns enemies with each strike. Deals 30% AD damage and stuns for 1.0 turn on attack.",
    },
    shield_of_daybreak_old: {
      name: "Shield of Daybreak (Active)",
      description: "A radiant shield that can stun enemies on activation",
      active: "Stuns the enemy for 1.0 turn. Must be in attack range.",
    },
    long_sword: {
      name: "Long Sword",
      description: "A basic sword for the journey ahead",
    },
    cloth_armor: {
      name: "Cloth Armor",
      description: "Basic protection",
    },
    amplifying_tome: {
      name: "Amplifying Tome",
      description: "A simple book to enhance magical power",
    },
    kindlegem: {
      name: "Kindlegem",
      description: "A glowing gem of inner warmth",
    },
    sapphire_crystal: {
      name: "Sapphire Crystal",
      description: "A crystal that enhances magical abilities",
    },
    fearie_charm: {
      name: "Faerie Charm",
      description: "A charm that boosts magical abilities",
    },
    dagger: {
      name: "Dagger",
      description: "A small blade for quick strikes",
    },
    rejuvenation_bead: {
      name: "Rejuvenation Bead",
      description: "A bead that enhances health regeneration",
    },
    boots: {
      name: "Boots",
      description: "Basic footwear to increase movement speed",
    },
    
    // ===== EPIC ITEMS =====
    pickaxe: {
      name: "Pickaxe",
      description: "A powerful mining tool turned weapon",
    },
    null_magic_mantle: {
      name: "Null-Magic Mantle",
      description: "Magical protection against spells",
    },
    
    // ===== LEGENDARY ITEMS =====
    mejais_soulstealer: {
      name: "Mejai's Soulstealer",
      description: "Upgraded Glory: Defeating Champion or Legend tier enemies grants +15 AP permanently (stacks endlessly). Carries over stacks from Dark Seal.",
      passive: "Glory Upgraded: +15 AP permanently per Champion/Legend defeated",
    },
    infinity_edge: {
      name: "Infinity Edge",
      description: "Attack damage and critical strike power",
    },
    abyssal_mask: {
      name: "Abyssal Mask",
      description: "Deep sea protection",
    },
    nashor_tooth: {
      name: "Nashor's Tooth",
      description: "The fang of Nasthor the beast",
    },
    trinity_force: {
      name: "Trinity Force",
      description: "A legendary combination of power",
    },
    rabadons_deathcap: {
      name: "Rabadon's Deathcap",
      description: "Amplifies all ability power",
      passive: "Magical Opus: Increases your total Ability Power by 30%",
    },
    kaenic_rookern: {
      name: "Kaenic Rookern",
      description: "A legendary shield",
    },
    warmogs_armor: {
      name: "Warmog's Armor",
      description: "Massive health boost",
      passive: "Heals 5% every round you do not get damaged",
    },
    lich_bane: {
      name: "Lich Bane",
      description: "Empowers your next attack after using an ability",
      passive: "After using an ability, your next basic attack deals bonus magic damage",
    },
    
    // ===== ULTIMATE ITEMS =====
    guardian_angel: {
      name: "Guardian Angel",
      description: "Revive upon death",
      passive: "Upon death, revive with 50% health on the next turn",
    },
    
    // ===== EXALTED ITEMS =====
    chalicar: {
      name: "Chalicar",
      description: "The Legendary Jeweled crossblade boomerang",
    },
  },

  weapons: {
    // ===== STARTER WEAPONS =====
    demacian_steel_blade: {
      name: "Demacian Steel Blade",
      description: "A demacian sword that protects you from magic and deals Attack damage.",
      lore: "Forged in the heart of Demacia, this blade channels the kingdom's unwavering resolve.",
    },
    spirit_tree_bow: {
      name: "Spirit Tree Bow",
      description: "A bow crafted from the wood of ancient spirit trees that deals both physical and magical damage.",
      lore: "The spirits of Ionia guide each arrow to its mark.",
    },
    glyphed_bronze_spear: {
      name: "Glyphed Bronze Spear",
      description: "A spear etched with ancient runes that channels magical energy to quickly strike foes.",
      lore: "Ancient Shuriman spear wielded by the sand warriors of old.",
    },
    test_weapon: {
      name: "Test Weapon",
      description: "A basic weapon that deals physical damage based on your Attack Damage.",
    },
    
    // ===== LOOTABLE WEAPONS =====
    swinging_glaive: {
      name: "Swinging Glaive",
      description: "A heavy glaive that deals significant physical damage with each swing.",
    },
    shield_of_daybreak: {
      name: "Shield of Daybreak",
      description: "Strike enemies with radiant force, dealing 30% AD damage and stunning them for 1.0 turn. Uses your attack range.",
    },
    delverhold_greateaxe: {
      name: "Delverhold Greateaxe",
      description: "A massive axe that causes devastating bleeding wounds. Each strike inflicts Hemorrhage, dealing 30% AD per turn for 5 turns. Stacks up to 5 times.",
    },
  },

  spells: {
    // ===== STARTER SPELLS =====
    for_demacia: {
      name: "For Demacia!",
      description: "Warcry of Demacia that bolsters your resolve, granting +5% AD and +0.5 Attack Speed for 1 turn.",
      effects: "Grants +5% Attack Damage and +0.5 Attack Speed for the next turn",
    },
    rejuvenation: {
      name: "Rejuvenation",
      description: "Concentrate your spiritual energy to heal your wounds for 20 HP + 20% of your Ability Power.",
      effects: "Heals for 20 + 20% AP",
    },
    quicksand: {
      name: "Quicksand",
      description: "Summon quicksand to damage and slow an enemy, reducing their movement speed by 10% for 3 turns.",
      effects: "Deals 20% AP damage and reduces target movement speed by 10% for 3 turns",
    },
    test_spell: {
      name: "Test Spell",
      description: "A basic spell that deals magic damage based on your Ability Power.",
      effects: "Deals 100% AP as magic damage",
    },
    
    // ===== COMMON SPELLS =====
    purify: {
      name: "Purify",
      description: "Removes all debuffs from a target ally.",
      effects: "Removes all debuffs from target ally",
    },
    
    // ===== LEGENDARY SPELLS =====
    wish: {
      name: "Wish",
      description: "Restore health. Heals for 150 + 50% AP. If below 40% HP, heals for 50% more!",
      effects: "Heals 150 + 50% AP. Heals 50% more if below 40% max HP",
    },
    dazzle: {
      name: "Dazzle",
      description: "After 1.0 turn cast time, stuns the target for 1.0 turn. Range: 625 units.",
      effects: "Stuns target for 1.0 turn after 1.0 turn cast time",
    },
  },

  enemies: {
    // ===== DEMACIA =====
    demacia_soldier: { name: 'Demacia Soldier' },
    demacia_scout: { name: 'Demacia Scout' },
    demacia_guard: { name: 'Demacia Guard' },
    demacia_wild_boar: { name: 'Demacia Wild Boar' },
    garen: { name: 'Garen, the Might of Demacia' },
    lux: { name: 'Lux, the Lady of Luminosity' },
    jarvan_iv: { name: 'Jarvan IV, the Exemplar of Demacia' },
    
    // ===== SHURIMA =====
    shurima_sand_soldier: { name: 'Sand Soldier' },
    shurima_tomb_guardian: { name: 'Tomb Guardian' },
    shurima_desert_nomad: { name: 'Desert Nomad' },
    shurima_sand_scarab: { name: 'Sand Scarab' },
    shurima_sun_priest: { name: 'Sun Priest' },
    nasus: { name: 'Nasus, the Curator of the Sands' },
    azir: { name: 'Azir, the Emperor of the Sands' },
    xerath: { name: 'Xerath, the Magus Ascendant' },
    renekton: { name: 'Renekton, the Butcher of the Sands' },
    
    // ===== IONIA =====
    ionia_spirit_walker: { name: 'Spirit Walker' },
    ionia_shadow_assassin: { name: 'Shadow Assassin' },
    ionia_kinkou_ninja: { name: 'Kinkou Ninja' },
    ionia_vastayan_hunter: { name: 'Vastayan Hunter' },
    ionia_forest_spirit: { name: 'Forest Spirit' },
    yasuo: { name: 'Yasuo, the Unforgiven' },
    ahri: { name: 'Ahri, the Nine-Tailed Fox' },
    master_yi: { name: 'Master Yi, the Wuju Bladesman' },
    shen: { name: 'Shen, the Eye of Twilight' },
    
    // ===== NOXUS =====
    noxus_legionnaire: { name: 'Noxus Legionnaire' },
    noxus_assassin: { name: 'Noxus Assassin' },
    noxus_executioner: { name: 'Noxus Executioner' },
    darius: { name: 'Darius, the Hand of Noxus' },
    draven: { name: 'Draven, the Glorious Executioner' },
    katarina: { name: 'Katarina, the Sinister Blade' },
    swain: { name: 'Swain, the Noxian Grand General' },
    
    // ===== CAMAVOR =====
    camavor_shadow_creature: { name: 'Shadow Creature' },
    camavor_ruined_knight: { name: 'Ruined Knight' },
    viego: { name: 'Viego, the Ruined King' },
    
    // ===== MARAI TERRITORY =====
    marai_tidecaller: { name: 'Tidecaller' },
    marai_depth_guardian: { name: 'Depth Guardian' },
    nami: { name: 'Nami, the Tidecaller' },
    
    // ===== ICE SEA =====
    ice_sea_frost_troll: { name: 'Frost Troll' },
    ice_sea_ice_wraith: { name: 'Ice Wraith' },
    sejuani: { name: 'Sejuani, the Winter\'s Wrath' },
    
    // ===== RUNETERRA =====
    runeterra_wanderer: { name: 'Wanderer' },
    runeterra_mercenary: { name: 'Mercenary' },
  },

  regions: {
    demacia: 'Demacia',
    noxus: 'Noxus',
    ionia: 'Ionia',
    freljord: 'Freljord',
    piltover: 'Piltover',
    zaun: 'Zaun',
    shadow_isles: 'Shadow Isles',
    bilgewater: 'Bilgewater',
    shurima: 'Shurima',
    targon: 'Targon',
    void: 'Void',
    bandle_city: 'Bandle City',
    ixtal: 'Ixtal',
    ice_sea: 'Ice Sea',
    marai_territory: 'Marai Territory',
    camavor: 'Camavor',
  },

  passives: {
    life_draining: {
      name: 'Life Draining',
      description: 'Gain 20 HP when defeating an enemy',
    },
    enduring_focus: {
      name: 'Enduring Focus',
      description: '+2% max HP per encounter',
    },
    drain: {
      name: 'Drain',
      description: 'Deal 10 true damage on spell hit',
    },
    reap: {
      name: 'Reap',
      description: 'Double gold from Champion and Legend enemies',
    },
    glory: {
      name: 'Glory',
      description: '+10 AP permanently per Champion/Legend defeated',
    },
    glory_upgraded: {
      name: 'Glory (Upgraded)',
      description: '+15 AP permanently per Champion/Legend defeated',
    },
    magical_opus: {
      name: 'Magical Opus',
      description: 'Increases your total Ability Power by 30%',
    },
    pathfinder: {
      name: 'Pathfinder',
      description: '+20% XP gain',
    },
  },

  abilities: {},

  statusEffects: {
    stunned: 'Stunned',
    slowed: 'Slowed',
    rooted: 'Rooted',
    silenced: 'Silenced',
    buffed: 'Buffed',
    debuffed: 'Debuffed',
  },
};
