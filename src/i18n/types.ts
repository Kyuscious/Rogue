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
    damage: string;
    armor: string;
    magicResist: string;
    attackDamage: string;
    abilityPower: string;
    health: string;
    mana: string;
    energy: string;
  };

  // Main Menu
  mainMenu: {
    title: string;
    newGame: string;
    continue: string;
    settings: string;
    credits: string;
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

  // Items (placeholders - will be populated per item)
  items: {
    [key: string]: {
      name: string;
      description: string;
    };
  };

  // Enemies (placeholders - will be populated per enemy)
  enemies: {
    [key: string]: {
      name: string;
      description?: string;
    };
  };

  // Abilities (placeholders)
  abilities: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}
