import { apiClient } from "./client.js";

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  character_id: string;
  final_floor: number;
  final_gold: number;
  total_encounters: number;
  run_duration_seconds?: number;
  created_at: string;
}

export interface SubmitScorePayload {
  characterId: string;
  finalFloor: number;
  finalGold: number;
  totalEncounters?: number;
  runDurationSeconds?: number;
}

export interface GlobalStats {
  totalRuns: number;
  avgFloor: number;
  maxFloor: number;
  avgGold: number;
}

export const leaderboardApi = {
  submit: async (payload: SubmitScorePayload): Promise<LeaderboardEntry> => {
    return apiClient.post<LeaderboardEntry>(
      "/api/leaderboard/submit",
      payload
    );
  },

  getGlobal: async (limit: number = 100): Promise<LeaderboardEntry[]> => {
    return apiClient.get<LeaderboardEntry[]>(
      `/api/leaderboard/global?limit=${limit}`
    );
  },

  getByCharacter: async (
    characterId: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> => {
    return apiClient.get<LeaderboardEntry[]>(
      `/api/leaderboard/character/${characterId}?limit=${limit}`
    );
  },

  getUserBest: async (): Promise<LeaderboardEntry[]> => {
    return apiClient.get<LeaderboardEntry[]>("/api/leaderboard/user/best");
  },

  getUserCharacterBest: async (
    characterId: string
  ): Promise<LeaderboardEntry | null> => {
    return apiClient.get<LeaderboardEntry | null>(
      `/api/leaderboard/user/best/${characterId}`
    );
  },

  getRecent: async (
    hoursBack: number = 24,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> => {
    return apiClient.get<LeaderboardEntry[]>(
      `/api/leaderboard/recent?hoursBack=${hoursBack}&limit=${limit}`
    );
  },

  getGlobalStats: async (): Promise<GlobalStats> => {
    return apiClient.get<GlobalStats>("/api/leaderboard/stats/global");
  },
};
