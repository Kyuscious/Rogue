-- Supabase Schema for Riot Roguelike

-- Enable JWT auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game saves table
CREATE TABLE IF NOT EXISTS public.game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL,
  run_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  floor_number INTEGER DEFAULT 1,
  current_gold INTEGER DEFAULT 0,
  max_floor_reached INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, run_id)
);

-- Leaderboard scores table
CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  character_id TEXT NOT NULL,
  final_floor INTEGER NOT NULL,
  final_gold INTEGER NOT NULL,
  total_encounters INTEGER DEFAULT 0,
  run_duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON public.game_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_run_id ON public.game_saves(run_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_final_floor ON public.leaderboard_scores(final_floor DESC);

-- RLS (Row Level Security) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- User profiles RLS
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Game saves RLS
CREATE POLICY "Users can view own saves" ON public.game_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saves" ON public.game_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saves" ON public.game_saves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON public.game_saves FOR DELETE USING (auth.uid() = user_id);

-- Leaderboard scores RLS
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON public.leaderboard_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
