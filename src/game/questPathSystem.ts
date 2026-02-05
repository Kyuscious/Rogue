/**
 * Quest Path Completion System
 * 
 * Manages which quest paths have been completed in the current run.
 * Prevents paths from being offered again once completed in the same run.
 */

/**
 * Generate a unique identifier for a quest path
 * Format: "questId:pathId"
 */
export const generatePathId = (questId: string, pathId: string): string => {
  return `${questId}:${pathId}`;
};

/**
 * Parse a path identifier into its components
 */
export const parsePathId = (id: string): { questId: string; pathId: string } | null => {
  const [questId, pathId] = id.split(':');
  if (!questId || !pathId) return null;
  return { questId, pathId };
};

/**
 * Check if a quest path has been completed
 */
export const isPathCompleted = (
  completedPaths: string[],
  questId: string,
  pathId: string
): boolean => {
  const id = generatePathId(questId, pathId);
  return completedPaths.includes(id);
};

/**
 * Mark a quest path as completed
 */
export const markPathCompleted = (
  completedPaths: string[],
  questId: string,
  pathId: string
): string[] => {
  const id = generatePathId(questId, pathId);
  if (completedPaths.includes(id)) {
    return completedPaths;
  }
  return [...completedPaths, id];
};

/**
 * Reset all completed paths (for new run)
 */
export const resetCompletedPaths = (): string[] => {
  return [];
};

/**
 * Get count of completed paths
 */
export const getCompletedPathCount = (completedPaths: string[]): number => {
  return completedPaths.length;
};
