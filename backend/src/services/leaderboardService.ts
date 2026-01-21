import { supabase } from "../db/supabase.js";

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

export class LeaderboardService {
  // Submit a run to the leaderboard
  static async submitScore(
    userId: string,
    username: string,
    characterId: string,
    finalFloor: number,
    finalGold: number,
    totalEncounters: number,
    runDurationSeconds?: number
  ): Promise<LeaderboardEntry> {
    const { data, error } = await supabase
      .from("leaderboard_scores")
      .insert({
        user_id: userId,
        username,
        character_id: characterId,
        final_floor: finalFloor,
        final_gold: finalGold,
        total_encounters: totalEncounters,
        run_duration_seconds: runDurationSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get global leaderboard (top scores by floor, then by gold)
  static async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("leaderboard_scores")
      .select("*")
      .order("final_floor", { ascending: false })
      .order("final_gold", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get leaderboard for specific character
  static async getCharacterLeaderboard(
    characterId: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("leaderboard_scores")
      .select("*")
      .eq("character_id", characterId)
      .order("final_floor", { ascending: false })
      .order("final_gold", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get user's personal best scores
  static async getUserBestScores(userId: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("leaderboard_scores")
      .select("*")
      .eq("user_id", userId)
      .order("final_floor", { ascending: false })
      .order("final_gold", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get user's personal best for a specific character
  static async getUserCharacterBest(
    userId: string,
    characterId: string
  ): Promise<LeaderboardEntry | null> {
    const { data, error } = await supabase
      .from("leaderboard_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .order("final_floor", { ascending: false })
      .order("final_gold", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      return null;
    }

    if (error) throw error;
    return data || null;
  }

  // Get recent scores (last 24 hours, last 7 days, etc.)
  static async getRecentScores(hoursBack: number = 24, limit: number = 50): Promise<LeaderboardEntry[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("leaderboard_scores")
      .select("*")
      .gte("created_at", cutoffTime)
      .order("final_floor", { ascending: false })
      .order("final_gold", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get stats aggregates (for fun facts/stats page)
  static async getGlobalStats(): Promise<{
    totalRuns: number;
    avgFloor: number;
    maxFloor: number;
    avgGold: number;
  }> {
    const { data, error, count } = await supabase
      .from("leaderboard_scores")
      .select("final_floor, final_gold", { count: "exact" });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { totalRuns: 0, avgFloor: 0, maxFloor: 0, avgGold: 0 };
    }

    const avgFloor =
      data.reduce((sum: number, row) => sum + (row?.final_floor || 0), 0) / data.length;
    const maxFloor = Math.max(...data.map((row) => row?.final_floor || 0));
    const avgGold =
      data.reduce((sum: number, row) => sum + (row?.final_gold || 0), 0) / data.length;

    return {
      totalRuns: count || 0,
      avgFloor: Math.round(avgFloor * 100) / 100,
      maxFloor,
      avgGold: Math.round(avgGold),
    };
  }
}
