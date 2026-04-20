import { Character } from '@game/types';
import { CharacterStats, getClassStatBonuses } from '@utils/statsSystem';
import { getRandomItemsForEnemy } from '@data/items';
import { calculateEnemyLevel } from '@entities/Player/experienceSystem';
import { getRegionTier } from '@screens/PostRegionChoice/regionGraph';
import type { Region } from '@game/types';

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

  return enemies.map((enemy, index) => {
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

    // Return new enemy with scaled stats while preserving combat metadata
    return {
      ...enemy,
      battleInstanceId: `${enemy.id}_${floor}_${encountersCompleted}_${index}_${Date.now()}`,
      abilities: [...enemy.abilities],
      level: enemyLevel,
      hp: finalStats.health,
      stats: finalStats,
      inventory,
      enemyLoadout: enemy.enemyLoadout
        ? {
            ...enemy.enemyLoadout,
            weapons: [...enemy.enemyLoadout.weapons],
            spells: [...enemy.enemyLoadout.spells],
            items: [...enemy.enemyLoadout.items],
          }
        : undefined,
      lootDrops: enemy.lootDrops
        ? {
            weapons: enemy.lootDrops.weapons ? [...enemy.lootDrops.weapons] : undefined,
            spells: enemy.lootDrops.spells ? [...enemy.lootDrops.spells] : undefined,
            items: enemy.lootDrops.items ? [...enemy.lootDrops.items] : undefined,
            familiars: enemy.lootDrops.familiars ? [...enemy.lootDrops.familiars] : undefined,
          }
        : undefined,
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
    enemyLoadout: e.enemyLoadout
      ? {
          ...e.enemyLoadout,
          weapons: [...e.enemyLoadout.weapons],
          spells: [...e.enemyLoadout.spells],
          items: [...e.enemyLoadout.items],
        }
      : undefined,
    lootDrops: e.lootDrops
      ? {
          weapons: e.lootDrops.weapons ? [...e.lootDrops.weapons] : undefined,
          spells: e.lootDrops.spells ? [...e.lootDrops.spells] : undefined,
          items: e.lootDrops.items ? [...e.lootDrops.items] : undefined,
          familiars: e.lootDrops.familiars ? [...e.lootDrops.familiars] : undefined,
        }
      : undefined,
  }));
}

export function deepCopyEnemyQueue(enemyQueue: Character[][]): Character[][] {
  return enemyQueue.map((encounter) => deepCopyEnemies(encounter));
}
