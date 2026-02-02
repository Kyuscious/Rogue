export const items = {
  // Objets de Départ
  dorans_blade: {
    name: "Lame de Doran",
    description: 'Une lame pour les explorateurs qui infligent des dégâts physiques',
    passive: 'Drain de Vie : Gagnez 20 PV en vainquant un ennemi',
  },
  dorans_shield: {
    name: "Bouclier de Doran",
    description: 'Équipement protecteur pour les explorateurs qui préfèrent la défense',
    passive: 'Concentration Durable : +2% de PV max par rencontre',
  },
  dorans_ring: {
    name: "Anneau de Doran",
    description: 'Un focus mystique pour les explorateurs lanceurs de sorts',
    passive: 'Drain : Inflige 10 dégâts véritables lors d\'un coup de sort',
  },
  cull: {
    name: 'Cueilleur',
    description: 'Une faux pour les explorateurs avides',
    passive: 'Moisson : Double l\'or des ennemis Champion et Légende',
  },
  world_atlas: {
    name: 'Atlas Mondial',
    description: 'Le livre pour les explorateurs les plus curieux',
    passive: 'Éclaireur : +20% de gain d\'XP',
  },
  dark_seal: {
    name: 'Sceau Noir',
    description: 'Gloire : Vaincre des ennemis de rang Champion ou Légende octroie +10 PA en permanence (cumul infini).',
    passive: 'Gloire : +10 PA en permanence par Champion/Légende vaincu',
  },
  // Consommables Communs
  health_potion: {
    name: 'Potion de Santé',
    description: 'Un élixir magique qui restaure la santé au fil du temps',
    onUse: 'Restaure 50 points de vie sur 5 tours',
  },
  flashbomb_trap: {
    name: 'Piège Flash',
    description: 'Un piège qui étourdit les ennemis après un temps de préparation',
    onUse: 'Place un piège qui étourdit après 0,5 tour. Peut être évité en s\'éloignant.',
    active: 'Place un piège à l\'emplacement de l\'ennemi (portée 500). Après 0,5 tour de préparation, étourdit pendant 0,5 tour dans un rayon de 50 unités.',
  },
  stealth_ward: {
    name: 'Balise Furtive',
    description: 'Balise invisible qui révèle les statistiques de l\'ennemi',
    onUse: 'Révèle les statistiques de l\'ennemi pour le reste de la rencontre',
  },
  control_ward: {
    name: 'Balise de Contrôle',
    description: 'Une balise qui révèle les statistiques des ennemis pour plusieurs rencontres',
  },
  oracle_lens: {
    name: 'Lentille d\'Oracle',
    description: 'Une lentille mystique qui révèle les ennemis cachés',
    onUse: 'Permet d\'attaquer les ennemis invisibles pendant les 3 prochains tours',
  },
  farsight_alteration: {
    name: 'Altération Longue-vue',
    description: 'Un appareil magique qui permet de planifier à l\'avance',
    onUse: 'Révèle ce que sera la prochaine rencontre',
  },
  poro_snax: {
    name: 'Friandise pour Poro',
    description: 'Une gâterie pour les poros',
  },
  // Objets Communs
  shield_of_daybreak: {
    name: 'Bouclier de l\'Aube',
    description: 'Un bouclier radieux qui étourdit les ennemis à chaque frappe. Inflige 30% de dégâts de DA et étourdit pendant 1,0 tour lors de l\'attaque.',
  },
  shield_of_daybreak_old: {
    name: 'Bouclier de l\'Aube (Actif)',
    description: 'Un bouclier radieux qui peut étourdir les ennemis lors de l\'activation',
    active: 'Étourdit l\'ennemi pendant 1,0 tour. Doit être à portée d\'attaque.',
  },
  long_sword: {
    name: 'Épée Longue',
    description: 'Une épée basique pour le voyage à venir',
  },
  cloth_armor: {
    name: 'Armure de Tissu',
    description: 'Protection basique',
  },
  amplifying_tome: {
    name: 'Tome Amplificateur',
    description: 'Un livre simple pour améliorer la puissance magique',
  },
  kindlegem: {
    name: 'Gemme Ardente',
    description: 'Une gemme brillante de chaleur intérieure',
  },
  sapphire_crystal: {
    name: 'Cristal de Saphir',
    description: 'Un cristal qui améliore les capacités magiques',
  },
  fearie_charm: {
    name: 'Charme de Fée',
    description: 'Un charme qui augmente les capacités magiques',
  },
  dagger: {
    name: 'Dague',
    description: 'Une petite lame pour des frappes rapides',
  },
  rejuvenation_bead: {
    name: 'Perle de Rajeunissement',
    description: 'Une perle qui améliore la régénération de santé',
  },
  boots: {
    name: 'Bottes',
    description: 'Chaussures de base pour augmenter la vitesse de déplacement',
  },
  // Consommables Épiques
  elixir_of_iron: {
    name: 'Élixir de Fer',
    description: 'Accorde un puissant buff pour 15 rencontres',
    onUse: 'Gagnez +300 Points de Vie, +250 Ténacité et +150 Vitesse de Déplacement pendant 15 rencontres (persiste entre les actes/régions)',
  },
  elixir_of_sorcery: {
    name: 'Élixir de Sorcellerie',
    description: 'Accorde de la puissance magique et des dégâts véritables pour 15 rencontres',
    onUse: 'Gagnez +50 Puissance des Capacités, +10 Découverte Magique et +25 Dégâts Véritables pendant 15 rencontres',
  },
  elixir_of_wrath: {
    name: 'Élixir de Courroux',
    description: 'Accorde de la puissance physique et du vol de vie pour 15 rencontres',
    onUse: 'Gagnez +30 Dégâts d\'Attaque et +12% de Vol de Vie pendant 15 rencontres',
  },
  // Objets Épiques
  pickaxe: {
    name: 'Pioche',
    description: 'Un puissant outil minier transformé en arme',
  },
  null_magic_mantle: {
    name: 'Manteau Anti-Magie',
    description: 'Protection magique contre les sorts',
  },
  // Objets Légendaires
  mejais_soulstealer: {
    name: "Voleur d'Âmes de Mejai",
    description: 'Gloire Améliorée : Vaincre des ennemis de rang Champion ou Légende octroie +15 PA en permanence (cumul infini). Conserve les cumuls du Sceau Noir.',
    passive: 'Gloire Améliorée : +15 PA en permanence par Champion/Légende vaincu',
  },
  infinity_edge: {
    name: 'Lame Infinie',
    description: 'Dégâts d\'attaque et puissance de coup critique',
  },
  abyssal_mask: {
    name: 'Masque Abyssal',
    description: 'Protection des profondeurs marines',
  },
  nashor_tooth: {
    name: "Dent de Nashor",
    description: "Le croc de Nashor la bête",
  },
  rabadons_deathcap: {
    name: "Coiffe de Rabadon",
    description: 'Amplifie toute la puissance des capacités',
    passive: 'Opus Magique : Augmente votre Puissance des Capacités totale de 30%',
  },
  kaenic_rookern: {
    name: 'Rookern Kaenique',
    description: 'Un bouclier légendaire',
  },
  warmogs_armor: {
    name: "Armure de Warmog",
    description: 'Augmentation massive de santé',
    passive: 'Soigne 5% chaque tour où vous ne subissez pas de dégâts',
  },
  // Objets Mythiques
  trinity_force: {
    name: 'Force de la Trinité',
    description: 'Une combinaison légendaire de puissance',
  },
  // Objets Transcendants
  lich_bane: {
    name: 'Fléau de Liche',
    description: 'Renforce votre prochaine attaque après avoir utilisé une capacité',
    passive: 'Après avoir utilisé une capacité, votre prochaine attaque de base inflige des dégâts magiques bonus',
  },
  guardian_angel: {
    name: 'Ange Gardien',
    description: 'Ressuscite à la mort',
    passive: 'À la mort, ressuscite avec 50% de santé au prochain tour',
  },
  // Objets Exaltés
  chalicar: {
    name: 'Chalicar',
    description: 'Le légendaire boomerang à lame croisée ornée de joyaux',
  },
};
