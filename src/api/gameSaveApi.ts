import { apiClient } from "./client.js";

export interface GameSave {
  id: string;
  user_id: string;
  game_state: Record<string, unknown>;
  run_id: string;
  character_id: string;
  floor_number: number;
  current_gold: number;
  max_floor_reached: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameStatePayload {
  gameState: Record<string, unknown>;
  characterId: string;
  floorNumber: number;
  currentGold: number;
  maxFloorReached: number;
  runId?: string;
}

export const gameSaveApi = {
  save: async (payload: GameStatePayload): Promise<GameSave> => {
    return apiClient.post<GameSave>("/api/gamesave/save", payload);
  },

  loadActive: async (): Promise<GameSave | null> => {
    return apiClient.get<GameSave | null>("/api/gamesave/load");
  },

  loadByRunId: async (runId: string): Promise<GameSave | null> => {
    return apiClient.get<GameSave | null>(`/api/gamesave/load/${runId}`);
  },

  list: async (): Promise<GameSave[]> => {
    return apiClient.get<GameSave[]>("/api/gamesave/list");
  },

  finish: async (runId: string): Promise<GameSave> => {
    return apiClient.post<GameSave>(`/api/gamesave/finish/${runId}`, {});
  },

  delete: async (runId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/gamesave/${runId}`);
  },
};
