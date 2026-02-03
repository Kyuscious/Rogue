/**
 * Supported Languages
 */
export type Language = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ja' | 'ko' | 'ru';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

/**
 * Translation structure for the entire game
 */
export interface Translations {
  // Common UI
  common: {
    loading: string;
    back: string;
    continue: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    level: string;
    gold: string;
    floor: string;
    hp: string;
    hpFull: string;
    damage: string;
    armor: string;
    magicResist: string;
    attackDamage: string;
    abilityPower: string;
    health: string;
    mana: string;
    energy: string;
    // Additional stats
    attackSpeed: string;
    attackRange: string;
    criticalChance: string;
    criticalDamage: string;
    abilityHaste: string;
    lifeSteal: string;
    spellVamp: string;
    omnivamp: string;
    movementSpeed: string;
    tenacity: string;
    goldGain: string;
    xpGain: string;
    lethality: string;
    magicPenetration: string;
    healShieldPower: string;
    healthRegen: string;
    healOverTime: string;
    // Class names
    mage: string;
    vanguard: string;
    warden: string;
    juggernaut: string;
    skirmisher: string;
    assassin: string;
    marksman: string;
    enchanter: string;
    // UI labels
    totalStats: string;
    classBonuses: string;
    survivalStats: string;
    attackStats: string;
    spellStats: string;
    mobilityStats: string;
    miscStats: string;
  };

  // Main Menu
  mainMenu: {
    title: string;
    newGame: string;
    continue: string;
    settings: string;
    credits: string;
    start: string;
    profiles: string;
    index: string;
    options: string;
    disclaimer: string;
    discord: string;
    version: string;
  };

  // Credits
  credits: {
    title: string;
    developedBy: string;
    artsBy: string;
    musicsBy: string;
    testedBy: string;
    supportedBy: string;
    comingSoon: string;
    visitProfile: string;
    supportDevelopment: string;
    kofi: string;
    patreon: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    selectLanguage: string;
    volume: string;
    music: string;
    soundEffects: string;
    fullscreen: string;
    audio: string;
    masterVolume: string;
    sfxVolume: string;
    musicVolume: string;
    voiceVolume: string;
    masterVolumeDesc: string;
    sfxVolumeDesc: string;
    musicVolumeDesc: string;
    voiceVolumeDesc: string;
    displayTheme: string;
    displayThemeDesc: string;
    brightness: string;
    saturation: string;
    contrast: string;
    brightnessMarkers: {
      dark: string;
      normal: string;
      bright: string;
    };
    saturationMarkers: {
      muted: string;
      normal: string;
      vivid: string;
    };
    contrastMarkers: {
      low: string;
      normal: string;
      high: string;
    };
    resetTheme: string;
    languageInfo: string;
  };

  // Character Selection
  characterSelect: {
    title: string;
    selectYourChampion: string;
    chooseRegion: string;
    startAdventure: string;
    stats: string;
    abilities: string;
  };

  // Classes
  classes: {
    marksman: string;
    mage: string;
    vanguard: string;
    assassin: string;
    support: string;
    fighter: string;
  };

  // Regions
  regions: {
    demacia: string;
    noxus: string;
    ionia: string;
    freljord: string;
    piltover: string;
    zaun: string;
    shadow_isles: string;
    bilgewater: string;
    shurima: string;
    targon: string;
    void: string;
    bandle_city: string;
    ixtal: string;
    ice_sea: string;
    marai_territory: string;
    camavor: string;
  };

  // Battle
  battle: {
    yourTurn: string;
    enemyTurn: string;
    victory: string;
    defeat: string;
    selectReward: string;
    nextFloor: string;
    useAbility: string;
    endTurn: string;
    flee: string;
    inventory: string;
  };

  // Inventory
  inventory: {
    title: string;
    equipped: string;
    backpack: string;
    empty: string;
    use: string;
    equip: string;
    unequip: string;
    drop: string;
  };

  // Post-Region Choice
  postRegion: {
    regionCompleted: string;
    chooseNextAction: string;
    restTitle: string;
    restDescription: string;
    modifyBuildTitle: string;
    modifyBuildDescription: string;
    exploreTitle: string;
    exploreDescription: string;
    noEventsAvailable: string;
    currentHp: string;
  };

  // Region Selection
  regionSelection: {
    errorNoRegion: string;
    chooseDestination: string;
    currentRegion: string;
    chooseTravelAction: string;
    travelActionSubtitle: string;
    unavailable: string;
    selected: string;
    selectDestination: string;
    noRegionsAvailable: string;
    longRangeTravelAvailable: string;
    proceedTo: string;
    beginJourney: string;
    selectActionToProceed: string;
    categories: {
      travelling: string;
      hard: string;
      advanced: string;
      hub: string;
      starting: string;
      standard: string;
      endgame: string;
    };
    regionDescriptions: {
      demacia: string;
      ionia: string;
      shurima: string;
      noxus: string;
      freljord: string;
      zaun: string;
      ixtal: string;
      bandle_city: string;
      bilgewater: string;
      piltover: string;
      shadow_isles: string;
      void: string;
      targon: string;
      camavor: string;
      marai_territory: string;
      ice_sea: string;
      runeterra: string;
    };
  };

  // Pre-Game Setup
  preGameSetup: {
    backToMenu: string;
    testCombat: string;
    selectRegion: string;
    selectStartingItem: string;
    startYourRun: string;
    selectRegionAndItem: string;
    startAdventureAt: string;
    startAdventureWith: string;
    locked: string;
    regionDescriptions: {
      demacia: string;
      ionia: string;
      shurima: string;
    };
  };

  questSelect: {
    noRerollsRemaining: string;
    noAlternativePaths: string;
    rerollThisPath: string;
    rerollsLeft: string;
    reward: string;
    risky: string;
    safe: string;
  };

  gearChange: {
    equippedWeapons: string;
    equippedSpells: string;
    equippedItems: string;
    inventory: string;
    dropItemsHere: string;
  };

  uiHeader: {
    encounter: string;
    gold: string;
    settings: string;
    reset: string;
    progressSaved: string;
  };

  resetConfirm: {
    title: string;
    message: string;
    cancel: string;
    confirm: string;
  };

  // Disclaimer Screen
  disclaimer: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
    paragraph5: string;
    paragraph6: string;
    paragraph7: string;
    thankYou: string;
    legalLinkText: string;
    dontShowAgain: string;
    skip: string;
  };

  // Login/Auth Screen
  login: {
    title: string;
    subtitle: string;
    loginTab: string;
    signUpTab: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    passwordHint: string;
    forgotPassword: string;
    rememberMe: string;
    loginButton: string;
    signUpButton: string;
    loggingIn: string;
    creatingAccount: string;
    playAsGuest: string;
    guestWarning: string;
    footer: string;
    errors: {
      emptyCredentials: string;
      emptySignUpCredentials: string;
      passwordTooShort: string;
      accountExists: string;
      invalidCredentials: string;
      savedCredentialsInvalid: string;
      autoLoginFailed: string;
      connectionFailed: string;
      forgotPasswordSoon: string;
    };
  };

  // Items (placeholders - will be populated per item)
  items: {
    [key: string]: {
      name: string;
      description: string;
      passive?: string; // For passive descriptions
      active?: string; // For active ability descriptions
      onUse?: string; // For consumable use effects
    };
  };

  // Weapons
  weapons: {
    [key: string]: {
      name: string;
      description: string;
      lore?: string; // Optional lore text
    };
  };

  // Spells
  spells: {
    [key: string]: {
      name: string;
      description: string;
      effects?: string; // Detailed effect description
    };
  };

  // Enemies (placeholders - will be populated per enemy)
  enemies: {
    [key: string]: {
      name: string;
      description?: string;
      title?: string; // Optional title (e.g., "The Curator of Sands")
    };
  };

  // Abilities (placeholders)
  abilities: {
    [key: string]: {
      name: string;
      description: string;
    };
  };

  // Status Effects
  statusEffects: {
    stunned: string;
    slowed: string;
    rooted: string;
    silenced: string;
    buffed: string;
    debuffed: string;
  };

  // Item Passives
  passives: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}
