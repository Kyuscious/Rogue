import { Character } from './types';

export function calculateDamage(
  _attacker: Character,
  defender: Character,
  baseDamage: number
): number {
  const variance = 0.9 + Math.random() * 0.2; // 0.9 - 1.1x variance
  const defenseMitigation = Math.max(0, 1 - (defender.stats.armor || 0) / 100);
  return Math.max(1, Math.floor(baseDamage * variance * defenseMitigation));
}

export function calculateAttackDamage(attacker: Character, defender: Character): number {
  return calculateDamage(attacker, defender, attacker.stats.attackDamage || 0);
}

export function isCritical(critChance: number = 0.15): boolean {
  return Math.random() < critChance;
}

export function getAttackMessage(
  attackerName: string,
  defenderName: string,
  damage: number,
  isCrit: boolean
): string {
  if (isCrit) {
    return `${attackerName} lands a critical hit on ${defenderName} for ${damage} damage!`;
  }
  return `${attackerName} attacks ${defenderName} for ${damage} damage.`;
}
