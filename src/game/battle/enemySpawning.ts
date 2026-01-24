import { Character } from '../types';
import { CharacterStats, getClassStatBonuses } from '../statsSystem';
import { getRandomItemsForEnemy } from '../items';
import { calculateEnemyLevel } from '../experienceSystem';
import { getRegionTier } from '../regionGraph';
import type { Region } from '../types';

/**
 * Spawn and scale enemies for a battle encounter
 * Handles level calculation, item assignment, and stat scaling
 */
export function spawnEnemies(
  enemies: Character[],
  floor: number,
  encountersCompleted: number,
  currentRegion: Region
): Character[] {
  const regionTier = getRegionTier(currentRegion);

  return enemies.map((enemy) => {
    // Calculate enemy level based on floor and tier
    const enemyLevel = calculateEnemyLevel(floor, enemy.tier || 'minion');

    console.log('🐛 ENEMY SPAWN:', enemy.name);
    console.log('  📊 Base stats:', {
      health: enemy.stats.health,
      attackDamage: enemy.stats.attackDamage,
      abilityPower: enemy.stats.abilityPower,
    });
    console.log('  🎯 Floor:', floor, '| Tier:', enemy.tier, '| Level:', enemyLevel);

    // Get items for this enemy
    const enemyItems = getRandomItemsForEnemy(
      enemy.class,
      encountersCompleted + 1,
      regionTier
    );
    console.log('  🎁 Items:', enemyItems.map((i) => i.name));

    // Apply item stats to base stats
    const statsWithItems: CharacterStats = { ...enemy.stats };
    enemyItems.forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (typeof value === 'number') {
          (statsWithItems as any)[stat] = ((statsWithItems as any)[stat] || 0) + value;
        }
      });
    });
    console.log('  📈 Stats after items:', {
      health: statsWithItems.health,
      attackDamage: statsWithItems.attackDamage,
      abilityPower: statsWithItems.abilityPower,
    });

    // Apply class bonuses (enemies don't get 5% level multiplier, only class bonuses)
    const classBonuses = getClassStatBonuses(enemy.class, enemyLevel);
    const finalStats: CharacterStats = { ...statsWithItems };

    Object.entries(classBonuses).forEach(([stat, bonus]) => {
      if (bonus) {
        (finalStats as any)[stat] = ((finalStats as any)[stat] || 0) + bonus;
      }
    });

    console.log('  ⚡ Final stats:', {
      health: finalStats.health,
      attackDamage: finalStats.attackDamage,
      abilityPower: finalStats.abilityPower,
    });
    console.log('  ✅ Class bonuses applied (level', enemyLevel, ')');
    console.log('---');

    // Convert items to inventory format
    const inventory = enemyItems.map((item) => ({
      itemId: item.id,
      quantity: 1,
    }));

    // Return new enemy with scaled stats
    return {
      id: enemy.id,
      name: enemy.name,
      role: enemy.role,
      class: enemy.class,
      region: enemy.region,
      tier: enemy.tier,
      faction: enemy.faction,
      abilities: [...enemy.abilities],
      experience: enemy.experience,
      level: enemyLevel,
      hp: finalStats.health,
      stats: finalStats,
      inventory,
    };
  });
}

/**
 * Create deep copies of enemies to prevent mutation
 */
export function deepCopyEnemies(enemies: Character[]): Character[] {
  return enemies.map((e) => ({
    ...e,
    stats: { ...e.stats },
    abilities: [...e.abilities],
    inventory: e.inventory ? [...e.inventory] : undefined,
  }));
}
