# Backend API - Riot Roguelike

Express.js backend for Riot Roguelike game with Supabase integration.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the values from your Supabase project:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key (keep secret!)
- `FRONTEND_URL`: Where your frontend is hosted (for CORS)

### 3. Run Locally
```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Architecture

### Services
- **AuthService**: User registration, login, token generation
- **GameSaveService**: Save/load game state, manage runs
- **LeaderboardService**: Submit and fetch leaderboard scores

### Routes
- `/api/auth` - Authentication endpoints
- `/api/gamesave` - Game save management
- `/api/leaderboard` - Leaderboard operations

### Database
See `src/db/schema.sql` for table definitions.

## API Reference

### Authentication

#### Register
```
POST /api/auth/register
Body: { email, password, username }
Response: { user, token }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

#### Anonymous Login (No credentials)
```
POST /api/auth/login-anonymous
Response: { user, token }
```

### Game Saves

All save endpoints require `Authorization: Bearer <token>` header.

#### Save Game State
```
POST /api/gamesave/save
Body: {
  gameState: { ...state },
  characterId: "string",
  floorNumber: number,
  currentGold: number,
  maxFloorReached: number,
  runId?: "string" (optional, auto-generated if not provided)
}
Response: GameSave object
```

#### Load Active Game
```
GET /api/gamesave/load
Response: GameSave | null
```

#### Load Specific Run
```
GET /api/gamesave/load/:runId
Response: GameSave | null
```

#### List All User Saves
```
GET /api/gamesave/list
Response: GameSave[]
```

#### Finish Run
```
POST /api/gamesave/finish/:runId
Response: GameSave (marked as inactive)
```

#### Delete Save
```
DELETE /api/gamesave/:runId
Response: { success: true }
```

### Leaderboard

#### Submit Score
```
POST /api/leaderboard/submit
Headers: { Authorization: Bearer <token> }
Body: {
  characterId: "string",
  finalFloor: number,
  finalGold: number,
  totalEncounters?: number,
  runDurationSeconds?: number
}
Response: LeaderboardEntry
```

#### Get Global Leaderboard
```
GET /api/leaderboard/global?limit=100
Response: LeaderboardEntry[]
```

#### Get Character Leaderboard
```
GET /api/leaderboard/character/:characterId?limit=100
Response: LeaderboardEntry[]
```

#### Get User's Best Scores
```
GET /api/leaderboard/user/best
Headers: { Authorization: Bearer <token> }
Response: LeaderboardEntry[]
```

#### Get Global Stats
```
GET /api/leaderboard/stats/global
Response: {
  totalRuns: number,
  avgFloor: number,
  maxFloor: number,
  avgGold: number
}
```

## Development

### Adding a New Endpoint

1. Create a service in `src/services/`
2. Create routes in `src/routes/`
3. Import and register in `src/server.ts`

Example:
```typescript
// src/services/newService.ts
export class NewService {
  static async someMethod() { ... }
}

// src/routes/newRoutes.ts
import { Router } from "express";
const router = Router();
router.get("/endpoint", async (req, res) => { ... });
export default router;

// src/server.ts
import newRoutes from "./routes/newRoutes.js";
app.use("/api/new", newRoutes);
```

## Testing

### Test with cURL

Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","username":"testuser"}'
```

Anonymous Login:
```bash
curl -X POST http://localhost:3000/api/auth/login-anonymous
```

## Deployment

See [BACKEND_DEPLOYMENT.md](../BACKEND_DEPLOYMENT.md) for detailed setup on Render, Railway, or other platforms.

## Security Notes

- **SUPABASE_SERVICE_KEY**: Keep this secret! Never expose it to the frontend.
- **Tokens**: Implement proper JWT verification in production
- **Rate Limiting**: Add rate limiting before production
- **CORS**: Configure to your frontend domain only
- **HTTPS**: Always use HTTPS in production

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_SERVICE_KEY | Yes | Supabase service role key |
| FRONTEND_URL | Yes | Frontend URL for CORS |
| PORT | No | Server port (default: 3000) |
| NODE_ENV | No | Environment (development/production) |

