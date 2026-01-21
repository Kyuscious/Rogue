import { supabase } from "../db/supabase.js";
import { v4 as uuidv4 } from "uuid";

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

export class GameSaveService {
  // Save or update game state
  static async saveGame(
    userId: string,
    gameState: Record<string, unknown>,
    characterId: string,
    floorNumber: number,
    currentGold: number,
    maxFloorReached: number,
    runId?: string
  ): Promise<GameSave> {
    const finalRunId = runId || uuidv4();

    // Try to update existing save, or insert if doesn't exist
    const { data: existing } = await supabase
      .from("game_saves")
      .select("id")
      .eq("user_id", userId)
      .eq("run_id", finalRunId)
      .single();

    if (existing) {
      // Update existing save
      const { data, error } = await supabase
        .from("game_saves")
        .update({
          game_state: gameState,
          character_id: characterId,
          floor_number: floorNumber,
          current_gold: currentGold,
          max_floor_reached: Math.max(maxFloorReached, floorNumber),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new save
      const { data, error } = await supabase
        .from("game_saves")
        .insert({
          user_id: userId,
          game_state: gameState,
          run_id: finalRunId,
          character_id: characterId,
          floor_number: floorNumber,
          current_gold: currentGold,
          max_floor_reached: floorNumber,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Load active game save for user
  static async loadActiveGame(userId: string): Promise<GameSave | null> {
    const { data, error } = await supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      // No rows returned
      return null;
    }

    if (error) throw error;
    return data || null;
  }

  // Load specific save by run_id
  static async loadSaveByRunId(
    userId: string,
    runId: string
  ): Promise<GameSave | null> {
    const { data, error } = await supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", userId)
      .eq("run_id", runId)
      .single();

    if (error && error.code === "PGRST116") {
      return null;
    }

    if (error) throw error;
    return data || null;
  }

  // Get all saves for a user
  static async getUserSaves(userId: string): Promise<GameSave[]> {
    const { data, error } = await supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Finish a run (mark as inactive and return stats for leaderboard)
  static async finishRun(userId: string, runId: string): Promise<GameSave> {
    const { data, error } = await supabase
      .from("game_saves")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("run_id", runId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a save
  static async deleteSave(userId: string, runId: string): Promise<void> {
    const { error } = await supabase
      .from("game_saves")
      .delete()
      .eq("user_id", userId)
      .eq("run_id", runId);

    if (error) throw error;
  }
}
