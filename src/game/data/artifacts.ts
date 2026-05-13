/**
 * Artifact System
 * Artifacts are run-modifying toggles selectable before a run on the PreGameSetup screen.
 * They fundamentally change how a run plays out. All artifacts are profile-locked by default.
 *
 * See docs/systems/artifacts/artifacts-system.md for full documentation.
 */

export interface ArtifactEffect {
  /** Multiplies all final damage values (player and enemy) by this scalar */
  damageMultiplier?: number;
}

export interface Artifact {
  id: string;
  name: string;
  /** Describes what the artifact does during the run (visible once unlocked). */
  description: string;
  /** Lore flavour — shown beneath the description in the UI. */
  flavourText?: string;
  effect: ArtifactEffect;
}

export const ARTIFACT_DATABASE: Record<string, Artifact> = {
  world_rune_of_domination: {
    id: 'world_rune_of_domination',
    name: 'World Rune of Domination',
    description: 'All damage dealt and received is doubled.',
    flavourText: '"Power without measure. Destruction without restraint."',
    effect: {
      damageMultiplier: 2,
    },
  },
};

/**
 * Get the combined damage multiplier from a set of active artifacts.
 * Multiple damage-multiplying artifacts stack multiplicatively.
 */
export function getArtifactDamageMultiplier(activeArtifacts: string[]): number {
  let multiplier = 1;
  for (const id of activeArtifacts) {
    const artifact = ARTIFACT_DATABASE[id];
    if (artifact?.effect.damageMultiplier) {
      multiplier *= artifact.effect.damageMultiplier;
    }
  }
  return multiplier;
}
