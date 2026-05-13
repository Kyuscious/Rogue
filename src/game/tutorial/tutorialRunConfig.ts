import type { Region } from '@game/types';

export interface TutorialRunConfig {
  region: Region;
  encounterEnemyIds: string[][];
}

// Creep/Poro/Teemo flow currently maps to existing in-game enemies.
export const CUSTOM_TUTORIAL_RUN_CONFIG: TutorialRunConfig = {
  region: 'bandle_city',
  encounterEnemyIds: [
    ['runeterra_tutorial_creep'], // Creep (Runeterra)
    ['runeterra_tutorial_poro'],  // Poro (Runeterra)
    ['bandle_tutorial_teemo'],    // Teemo tutorial (Bandle City)
  ],
};

export function shouldStartCustomTutorialRun(tutorialStage: string): boolean {
  return tutorialStage === 'pregame';
}