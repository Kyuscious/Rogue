# Quick Start - Backend + Frontend Integration

Get the full game stack running globally in ~30 minutes.

## 5-Minute Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
npm run dev
```

Backend runs at `http://localhost:3000`

### Frontend

```bash
# Root project directory
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Visit `http://localhost:5173` and click "Play as Guest" to test anonymous login.

## Integration Checklist

- [x] Backend services created (Auth, Saves, Leaderboard)
- [x] Frontend API clients created
- [x] Auth store for managing user sessions
- [x] Example auth screen component
- [x] Database schema with RLS policies
- [x] Full documentation

## What's Ready to Use

### Authentication
```typescript
import { authApi } from "@/api/authApi";

// Anonymous (guest login)
const result = await authApi.loginAnonymous();

// Email/password
await authApi.register("user@example.com", "password", "username");
const result = await authApi.login("user@example.com", "password");

// Logout
authApi.logout();
```

### Game Saves
```typescript
import { gameSaveApi } from "@/api/gameSaveApi";

// Save
await gameSaveApi.save({
  gameState: { ... },
  characterId: "jinx",
  floorNumber: 5,
  currentGold: 1000,
  maxFloorReached: 5,
});

// Load
const save = await gameSaveApi.loadActive();

// Get all saves
const saves = await gameSaveApi.list();
```

### Leaderboard
```typescript
import { leaderboardApi } from "@/api/leaderboardApi";

// Submit score
await leaderboardApi.submit({
  characterId: "jinx",
  finalFloor: 10,
  finalGold: 5000,
  totalEncounters: 42,
});

// Get global leaderboard
const top100 = await leaderboardApi.getGlobal(100);

// Get user's personal bests
const userBest = await leaderboardApi.getUserBest();
```

## Environment Variables

### Local Development (`.env.development`)
```env
VITE_API_URL=http://localhost:3000
```

### Production (`.env.production`)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend (`.env.local` in `/backend`)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

## Deploy to Production

### 1. Create Supabase Project (5 min)
1. Go to [supabase.com](https://supabase.com)
2. Create project, get API keys
3. Run `schema.sql` in SQL editor
4. Save keys somewhere

### 2. Deploy Backend (5 min)
1. Go to [render.com](https://render.com)
2. Connect GitHub, select repo
3. Create Web Service
4. Add environment variables
5. Auto-deploys on push

### 3. Deploy Frontend (2 min)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Add `VITE_API_URL` environment variable
4. Deploy

**Result**: Game playable worldwide at `https://your-game.vercel.app`

## File Structure

```
Rogue/
├── src/
│   ├── api/
│   │   ├── client.ts           # HTTP client
│   │   ├── authApi.ts          # Auth methods
│   │   ├── gameSaveApi.ts      # Save methods
│   │   └── leaderboardApi.ts   # Leaderboard methods
│   ├── game/
│   │   ├── authStore.ts        # User session store
│   │   └── store.ts            # Game state store
│   ├── components/
│   │   └── AuthScreen.tsx      # Login/Register/Guest UI
│   └── ...
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express app
│   │   ├── db/
│   │   │   └── schema.sql      # Database
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── gameSaveService.ts
│   │   │   └── leaderboardService.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db/
│   └── package.json
├── BACKEND_DEPLOYMENT.md       # Detailed deployment
├── BACKEND_ARCHITECTURE.md     # System design
├── FRONTEND_INTEGRATION.md     # How to use APIs
└── DIFFICULTY_SCALING.md       # Game balance
```

## Testing End-to-End

### 1. Anonymous Login
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Browser: http://localhost:5173
# Click "Play as Guest"
```

### 2. Save Game
Play a few turns, verify save appears in backend logs.

### 3. Register Account
Create account with email/password, login.

### 4. Submit Score
Complete a run, verify score on leaderboard at `/leaderboard`

### 5. Verify Database
Check Supabase dashboard → Tables → Data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in both root and `/backend` |
| API returns 401 | Token missing. Check localStorage has `auth_token` |
| CORS error | Ensure `FRONTEND_URL` matches frontend domain |
| Leaderboard empty | Finish a run and submit score |
| "Connection refused" | Backend not running. Check `npm run dev` in `/backend` |

## Next: Integrate with Game UI

1. **Character Select**: Skip to game if user logged in
2. **Pause Menu**: Add "Save Progress" button
3. **Game Over**: Auto-submit score to leaderboard
4. **Main Menu**: Add leaderboard view
5. **Settings**: Show login/logout, current user

See `FRONTEND_INTEGRATION.md` for code examples.

## Support

- Backend issues: Check `/backend/README.md`
- API reference: See `BACKEND_ARCHITECTURE.md`
- Deployment: See `BACKEND_DEPLOYMENT.md`
- Integration code: See `FRONTEND_INTEGRATION.md`

