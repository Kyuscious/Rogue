export const spells = {
  // Sorts de Départ
  for_demacia: {
    name: "Pour Demacia !",
    description: "Cri de guerre de Demacia qui renforce votre résolution, accordant +5% de DA et +0,5 Vitesse d'Attaque pendant 1 tour.",
    effects: "Accorde +5% de Dégâts d'Attaque et +0,5 Vitesse d'Attaque pour le prochain tour",
  },
  rejuvenation: {
    name: "Rajeunissement",
    description: "Concentrez votre énergie spirituelle pour soigner vos blessures de 20 PV + 20% de votre Puissance des Capacités.",
    effects: "Soigne de 20 + 20% PA",
  },
  quicksand: {
    name: "Sables Mouvants",
    description: "Invoquez des sables mouvants pour blesser et ralentir un ennemi, réduisant sa vitesse de déplacement de 10% pendant 3 turns.",
    effects: "Inflige 20% de dégâts de PA et réduit la vitesse de déplacement de la cible de 10% pendant 3 tours",
  },
  test_spell: {
    name: "Sort de Test",
    description: "Un sort basique qui inflige des dégâts magiques basés sur votre Puissance des Capacités.",
    effects: "Inflige 100% de PA en dégâts magiques",
  },
  // Sorts Communs
  purify: {
    name: "Purification",
    description: "Retire tous les débuffs d'un allié ciblé.",
    effects: "Retire tous les débuffs de l'allié ciblé",
  },
  // Sorts Légendaires
  wish: {
    name: "Vœu",
    description: "Restaure la santé. Soigne de 150 + 50% PA. Si en dessous de 40% PV, soigne 50% de plus !",
    effects: "Soigne de 150 + 50% PA. Soigne 50% de plus si en dessous de 40% PV max",
  },
  dazzle: {
    name: "Éblouissement",
    description: "Après 1,0 tour de lancement, étourdit la cible pendant 1,0 tour. Portée : 625 unités.",
    effects: "Étourdit la cible pendant 1,0 tour après 1,0 tour de lancement",
  },
};
