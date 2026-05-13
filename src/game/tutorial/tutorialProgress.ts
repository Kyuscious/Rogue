import type { PlayerProfile } from '../screens/MainMenu/Profiles/profileSystem';

export type TutorialStage =
  | 'none'
  | 'pregame'
  | 'quest'
  | 'battle'
  | 'battleLoot'
  | 'battleElite'
  | 'eliteReward'
  | 'regionTravel'
  | 'shop';

export interface TutorialStorageKeys {
  completed: string;
  introSeen: string;
  eliteSeen: string;
  eliteRewardSeen: string;
  regionTravelSeen: string;
}

export function getTutorialStorageKeys(profileId: number): TutorialStorageKeys {
  return {
    completed: `tutorialCompleted_profile_${profileId}`,
    introSeen: `tutorialIntroSeen_profile_${profileId}`,
    eliteSeen: `eliteTutorialSeen_profile_${profileId}`,
    eliteRewardSeen: `eliteRewardTutorialSeen_profile_${profileId}`,
    regionTravelSeen: `regionTravelTutorialSeen_profile_${profileId}`,
  };
}

export function shouldStartFirstTimeTutorial(profile: PlayerProfile): boolean {
  const keys = getTutorialStorageKeys(profile.id);
  const hasCompletedTutorial = localStorage.getItem(keys.completed) === 'true';
  const introSeenRaw = localStorage.getItem(keys.introSeen);

  // Migration path for older profiles that do not have introSeen persisted yet.
  if (introSeenRaw === null) {
    const hasNeverPlayed = profile.stats.hoursPlayed <= 0;
    return hasNeverPlayed && !hasCompletedTutorial;
  }

  const hasSeenIntro = introSeenRaw === 'true';
  return !hasSeenIntro && !hasCompletedTutorial;
}

export function markTutorialIntroSeen(profileId: number, seen: boolean): void {
  const keys = getTutorialStorageKeys(profileId);
  localStorage.setItem(keys.introSeen, seen ? 'true' : 'false');
}

export function markTutorialCompleted(profileId: number, completed: boolean): void {
  const keys = getTutorialStorageKeys(profileId);
  localStorage.setItem(keys.completed, completed ? 'true' : 'false');
}

export function hasSeenEliteTutorial(profileId: number): boolean {
  const keys = getTutorialStorageKeys(profileId);
  return localStorage.getItem(keys.eliteSeen) === 'true';
}

export function markEliteTutorialSeen(profileId: number, seen: boolean): void {
  const keys = getTutorialStorageKeys(profileId);
  localStorage.setItem(keys.eliteSeen, seen ? 'true' : 'false');
}

export function hasSeenEliteRewardTutorial(profileId: number): boolean {
  const keys = getTutorialStorageKeys(profileId);
  return localStorage.getItem(keys.eliteRewardSeen) === 'true';
}

export function markEliteRewardTutorialSeen(profileId: number, seen: boolean): void {
  const keys = getTutorialStorageKeys(profileId);
  localStorage.setItem(keys.eliteRewardSeen, seen ? 'true' : 'false');
}

export function hasSeenRegionTravelTutorial(profileId: number): boolean {
  const keys = getTutorialStorageKeys(profileId);
  return localStorage.getItem(keys.regionTravelSeen) === 'true';
}

export function markRegionTravelTutorialSeen(profileId: number, seen: boolean): void {
  const keys = getTutorialStorageKeys(profileId);
  localStorage.setItem(keys.regionTravelSeen, seen ? 'true' : 'false');
}

export function resetTutorialReplayFlags(profileId: number): void {
  markTutorialCompleted(profileId, false);
  markEliteTutorialSeen(profileId, false);
  markEliteRewardTutorialSeen(profileId, false);
  markRegionTravelTutorialSeen(profileId, false);
}

export function markTutorialFullySkipped(profileId: number): void {
  markTutorialCompleted(profileId, true);
  markEliteTutorialSeen(profileId, true);
  markEliteRewardTutorialSeen(profileId, true);
  markRegionTravelTutorialSeen(profileId, true);
}

export function resolveTutorialStageForScene(scene: string): Exclude<TutorialStage, 'none'> {
  if (scene === 'quest') return 'quest';
  if (scene === 'battle') return 'battle';
  if (scene === 'shop') return 'shop';
  if (scene === 'regionSelection') return 'regionTravel';
  return 'pregame';
}