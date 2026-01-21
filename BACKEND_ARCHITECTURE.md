# Backend Architecture Overview

Complete guide to the backend infrastructure for Riot Roguelike.

## Project Structure

```
backend/
├── src/
│   ├── server.ts                 # Express app setup
│   ├── db/
│   │   ├── supabase.ts          # Supabase client
│   │   └── schema.sql           # Database schema
│   ├── services/
│   │   ├── authService.ts       # Auth logic
│   │   ├── gameSaveService.ts   # Save/load logic
│   │   └── leaderboardService.ts # Leaderboard logic
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── gamesaveRoutes.ts    # Save endpoints
│   │   └── leaderboardRoutes.ts # Leaderboard endpoints
│   └── middleware/
│       └── authMiddleware.ts     # JWT verification
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT tokens
- **Deployment**: Render.com or Railway.app

## Data Flow

### Authentication
```
User Input → authApi → Express → AuthService → Supabase Auth
                                                      ↓
Response ← Token Generated ← JW Token Created ←────────
```

### Game Save
```
Game State → gameSaveApi → Express → GameSaveService → Supabase DB
                                                           ↓
Load ← GameSave JSON ← Query Database ←──────────────────
```

### Leaderboard
```
Run End → leaderboardApi → Express → LeaderboardService → Supabase DB
                                                              ↓
Display ← Top Scores ← Query & Sort ←─────────────────────
```

## Key Features

### 1. Authentication
- **Email/Password Registration**: Traditional accounts with usernames
- **Email/Password Login**: Secure password verification
- **Anonymous Login**: Zero-friction guest accounts (`player_xxxxx`)
- **Token-Based**: JWT-like tokens persist across sessions

### 2. Game Saves
- **Auto-Save**: Save game state after each battle
- **Resume**: Load active run on startup
- **Multiple Saves**: Keep multiple completed runs
- **Cloud Sync**: All saves synced to Supabase

### 3. Leaderboards
- **Global Rankings**: Top scores by floor, then gold
- **Character Specific**: Leaderboards per character
- **Personal Best**: User's top scores
- **Stats**: Global averages and records
- **Recent**: Latest runs (last 24h, etc.)

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login with credentials |
| POST | `/login-anonymous` | No | Guest login |

### Game Saves (`/api/gamesave`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/save` | Yes | Save game state |
| GET | `/load` | Yes | Load active save |
| GET | `/load/:runId` | Yes | Load specific run |
| GET | `/list` | Yes | List all saves |
| POST | `/finish/:runId` | Yes | Mark run complete |
| DELETE | `/:runId` | Yes | Delete save |

### Leaderboard (`/api/leaderboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/submit` | Yes | Submit final score |
| GET | `/global` | No | Global leaderboard |
| GET | `/character/:id` | No | Character leaderboard |
| GET | `/user/best` | Yes | User's best runs |
| GET | `/user/best/:id` | Yes | User's best per character |
| GET | `/recent` | No | Recent runs |
| GET | `/stats/global` | No | Global statistics |

## Database Schema

### Tables

#### `auth.users` (Supabase managed)
- Core authentication users
- Managed by Supabase Auth

#### `user_profiles`
- `id` (UUID, PK) - References auth.users
- `username` (TEXT, UNIQUE) - Display name
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `game_saves`
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References auth.users
- `game_state` (JSONB) - Full game state snapshot
- `run_id` (TEXT) - Unique run identifier
- `character_id` (TEXT) - Which character was played
- `floor_number` (INT) - Current floor
- `current_gold` (INT) - Gold on death/completion
- `max_floor_reached` (INT) - Furthest floor reached
- `is_active` (BOOL) - Whether run is in progress
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `leaderboard_scores`
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References auth.users
- `username` (TEXT) - Display name (denormalized for leaderboard)
- `character_id` (TEXT) - Which character was played
- `final_floor` (INT) - Highest floor reached
- `final_gold` (INT) - Total gold earned
- `total_encounters` (INT) - Battles completed
- `run_duration_seconds` (INT, NULLABLE) - Run time
- `created_at` (TIMESTAMP)

## Security

### Authentication
- Passwords hashed by Supabase Auth
- JWT tokens expire after 30 days
- Service key never exposed to frontend
- Refresh tokens managed server-side

### Database Access
- RLS (Row Level Security) policies enforce user isolation
- Users can only see their own saves
- Leaderboard is public read-only
- Service key used for admin operations

### CORS
- Frontend URL validated
- Only registered domain can call API
- Credentials passed securely (Bearer token)

## Deployment Checklist

### Supabase
- [ ] Create project and confirm project URL
- [ ] Run schema.sql to create tables
- [ ] Verify RLS policies are enabled
- [ ] Copy API keys to `.env`

### Backend
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy to Render/Railway
- [ ] Set environment variables
- [ ] Verify health endpoint: `/health`

### Frontend
- [ ] Add `.env.production` with backend URL
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel
- [ ] Test auth flow end-to-end
- [ ] Verify saves and leaderboard working

## Scaling Considerations

### Performance
- Database indexes on `user_id`, `created_at`, `final_floor`
- Leaderboard queries limited to 1000 rows
- JSONB storage for game state (fast queries)

### Reliability
- Render: Auto-restart on crash
- Supabase: Daily backups, 99.9% uptime SLA
- Error logging: Check Render/Railway logs

### Monitoring
- Backend logs available on Render dashboard
- Supabase metrics in PostgreSQL dashboard
- Set up alerts for high error rates

## Common Issues

### "CORS error"
→ Check `FRONTEND_URL` env var matches your frontend domain

### "401 Unauthorized"
→ Token missing or expired. Re-login to get new token

### "Connection refused"
→ Backend down. Check Render logs

### "Save not persisting"
→ Check Supabase connection in backend logs

## Next Steps

1. **User Profiles**: Add avatar, stats, profile page
2. **Cosmetics**: Character skins, item variants
3. **Guilds**: Group leaderboards, team features
4. **Seasons**: Monthly resets with rewards
5. **Achievements**: Badges, special unlocks
6. **Social**: Friend adds, private messages

