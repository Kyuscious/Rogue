# Frontend Integration Guide

How to integrate the backend API into your React game.

## Setup

### 1. Add Environment Variables

Create `.env.development` and `.env.production`:

```env
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://riot-roguelike-api.onrender.com
```

### 2. Install Backend (if not already done)
```bash
npm install  # Root project
```

## Usage

### Authentication

#### Show Auth Screen on Game Start
```typescript
import { AuthScreen } from "./components/AuthScreen";
import { useAuthStore } from "./game/authStore";

function App() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <AuthScreen onSuccess={() => {/* start game */}} />;
  }

  return <GameScreen />;
}
```

#### Get Current User
```typescript
import { useAuthStore } from "./game/authStore";

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  return <div>Playing as {user?.username}</div>;
}
```

### Saving Game State

Save game after each battle or at intervals:

```typescript
import { gameSaveApi } from "../api/gameSaveApi";
import { useGameStore } from "../game/store";
import { useAuthStore } from "../game/authStore";

async function handleBattleEnd() {
  const gameState = useGameStore((state) => state.state);
  const user = useAuthStore((state) => state.user);

  if (!user) return; // Not logged in

  try {
    await gameSaveApi.save({
      gameState: gameState,
      characterId: gameState.playerCharacter.id,
      floorNumber: gameState.currentFloor,
      currentGold: gameState.gold,
      maxFloorReached: gameState.currentFloor,
      runId: gameState.runId, // Store runId in game state
    });
  } catch (error) {
    console.error("Save failed:", error);
  }
}
```

### Loading Game State

Load saved game on startup:

```typescript
import { gameSaveApi } from "../api/gameSaveApi";
import { useGameStore } from "../game/store";
import { useAuthStore } from "../game/authStore";

async function loadSavedGame() {
  const user = useAuthStore((state) => state.user);
  if (!user) return;

  try {
    const save = await gameSaveApi.loadActive();
    if (save) {
      // Restore game state from save
      const restoreGame = useGameStore((state) => state.restoreFromSave);
      restoreGame(save);
    }
  } catch (error) {
    console.error("Load failed:", error);
  }
}
```

### Leaderboard Display

Fetch and display global leaderboard:

```typescript
import { leaderboardApi } from "../api/leaderboardApi";
import { useState, useEffect } from "react";

function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardApi.getGlobal(50).then(setScores).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Character</th>
          <th>Floor</th>
          <th>Gold</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((score, i) => (
          <tr key={score.id}>
            <td>{i + 1}</td>
            <td>{score.username}</td>
            <td>{score.character_id}</td>
            <td>{score.final_floor}</td>
            <td>{score.final_gold}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Submit Score on Run End

When player completes/dies:

```typescript
import { leaderboardApi } from "../api/leaderboardApi";
import { useGameStore } from "../game/store";
import { useAuthStore } from "../game/authStore";

async function submitRunScore() {
  const gameState = useGameStore((state) => state.state);
  const user = useAuthStore((state) => state.user);

  if (!user) return;

  try {
    const startTime = useGameStore((state) => state.runStartTime);
    const runDuration = Math.floor((Date.now() - startTime) / 1000);

    await leaderboardApi.submit({
      characterId: gameState.playerCharacter.id,
      finalFloor: gameState.currentFloor,
      finalGold: gameState.gold,
      totalEncounters: gameState.encountersCompleted,
      runDurationSeconds: runDuration,
    });

    // Mark run as finished
    await gameSaveApi.finish(gameState.runId);
  } catch (error) {
    console.error("Score submission failed:", error);
  }
}
```

### Get User's Best Scores

```typescript
import { leaderboardApi } from "../api/leaderboardApi";

async function showUserStats() {
  try {
    const bestScores = await leaderboardApi.getUserBest();
    console.log("Your best runs:", bestScores);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
  }
}
```

## Integrating with Game Store

Update `src/game/store.ts` to add backend methods:

```typescript
export interface GameStoreState {
  state: {
    // ...existing state
    runId: string; // Add this
    runStartTime: number; // Add this
  };

  // Add these methods:
  saveGameState: () => Promise<void>;
  loadGameState: () => Promise<void>;
  submitScore: () => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  // ...existing state

  saveGameState: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const state = get().state;
    await gameSaveApi.save({
      gameState: state,
      characterId: state.playerCharacter.id,
      floorNumber: state.currentFloor,
      currentGold: state.gold,
      maxFloorReached: state.currentFloor,
      runId: state.runId,
    });
  },

  loadGameState: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const save = await gameSaveApi.loadActive();
    if (save) {
      set((state) => ({
        state: {
          ...state.state,
          // Restore properties from save.game_state
          ...save.game_state,
        },
      }));
    }
  },

  submitScore: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const state = get().state;
    await leaderboardApi.submit({
      characterId: state.playerCharacter.id,
      finalFloor: state.currentFloor,
      finalGold: state.gold,
      totalEncounters: state.encountersCompleted,
      runDurationSeconds: Math.floor((Date.now() - state.runStartTime) / 1000),
    });
  },
}));
```

## Error Handling

```typescript
import { authApi } from "../api/authApi";

try {
  await authApi.login(email, password);
} catch (error) {
  // Handle error
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("Login failed:", message);

  // Show error UI
  setError(message);
}
```

## Network Conditions

Consider offline scenarios:

```typescript
if (!navigator.onLine) {
  console.log("Offline mode - save will sync when online");
  // Store in local cache, sync later
}
```

## Debug Mode

Check if API calls are working:

```typescript
// Add to App.tsx or main component
useEffect(() => {
  async function checkBackend() {
    try {
      const response = await fetch("http://localhost:3000/health");
      console.log("Backend health:", response.ok);
    } catch (error) {
      console.warn("Backend not available:", error);
    }
  }
  checkBackend();
}, []);
```

## Type Definitions

All types are available from API modules:

```typescript
import type { AuthUser, AuthResponse } from "../api/authApi";
import type { GameSave, GameStatePayload } from "../api/gameSaveApi";
import type { LeaderboardEntry, SubmitScorePayload } from "../api/leaderboardApi";
```

