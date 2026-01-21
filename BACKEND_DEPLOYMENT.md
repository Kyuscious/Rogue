# Backend Setup & Deployment Guide

## Overview
This guide walks through setting up Supabase, deploying the backend to Render, and configuring the frontend for global playability.

## Stack
- **Frontend**: Vercel (React + Vite)
- **Backend API**: Render or Railway (Express + TypeScript)
- **Database**: Supabase (PostgreSQL + Auth)

---

## Part 1: Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - Project name: `riot-roguelike`
   - Database password: Save this somewhere secure
   - Region: Choose closest to you
4. Wait for project to initialize (5-10 minutes)

### 2. Create Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query** → **New SQL snippet**
3. Copy contents of `backend/src/db/schema.sql`
4. Paste into the editor and click **Run**
5. Tables should now be created

### 3. Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `SUPABASE_URL`
   - `anon key` → `SUPABASE_ANON_KEY` (for frontend)
   - `service_role key` → `SUPABASE_SERVICE_KEY` (for backend - keep secret!)

---

## Part 2: Backend Deployment

### Option A: Deploy to Render.com (Recommended)

#### 1. Prepare Backend
```bash
cd backend
npm install
npm run build
```

#### 2. Create Render Account
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Connect your GitHub repo

#### 3. Create New Web Service
1. Click **New +** → **Web Service**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `riot-roguelike-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `/` (or leave blank)

#### 4. Add Environment Variables
1. In Render dashboard, go to **Environment** for your service
2. Add these variables:
   ```
   SUPABASE_URL=<paste from Supabase>
   SUPABASE_SERVICE_KEY=<paste from Supabase>
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-url.vercel.app
   PORT=3000
   ```

#### 5. Deploy
1. Render will auto-deploy after push to GitHub
2. Your API URL will be: `https://riot-roguelike-api.onrender.com`

### Option B: Deploy to Railway.app

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select repository
4. Railway auto-detects `package.json` and deploys
5. Add environment variables in **Variables** tab
6. Your API URL will be automatically generated

---

## Part 3: Frontend Configuration

### 1. Create `.env` Files

**`.env.development`** (local testing):
```
VITE_API_URL=http://localhost:3000
```

**`.env.production`** (production):
```
VITE_API_URL=https://riot-roguelike-api.onrender.com
```

### 2. Update `vite.config.ts` (if needed)
The frontend will automatically use the environment variable based on build mode.

---

## Part 4: Deploy Frontend to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add backend API integration"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import your GitHub repository
4. Vercel auto-detects it's a Vite project
5. Click **Deploy**

### 3. Add Environment Variables
1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://riot-roguelike-api.onrender.com
   ```
3. Re-deploy from the **Deployments** tab

### 4. Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions

---

## Part 5: Testing the Full Setup

### 1. Test Backend Health
```bash
curl https://riot-roguelike-api.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Auth Endpoint
```bash
curl -X POST https://riot-roguelike-api.onrender.com/api/auth/login-anonymous \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Test Frontend
1. Visit your Vercel URL
2. Click "Play as Guest" (anonymous login)
3. Game should load
4. Play a run and check if saves/leaderboard work

---

## Troubleshooting

### Backend won't deploy
- Check `backend/package.json` exists
- Ensure all dependencies are in `package.json` (not global)
- Check build command works locally: `npm run build`

### API calls fail with 401
- Backend isn't receiving auth token
- Check frontend is passing `Authorization: Bearer <token>` header
- Verify token was saved to localStorage

### Database errors
- Verify `SUPABASE_SERVICE_KEY` is the **service role key** (not anon key)
- Check RLS policies are created by running `schema.sql` again
- Verify tables exist: Supabase → **Table Editor**

### CORS errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL
- Check Render environment variables are set correctly
- Re-deploy backend after changing `FRONTEND_URL`

### Leaderboard doesn't show
- Verify backend can connect to Supabase: Check Render logs
- Ensure leaderboard API endpoints are called correctly from frontend
- Check game is submitting scores on run completion

---

## API Endpoints Reference

### Auth
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/login-anonymous` - Guest login

### Game Saves
- `POST /api/gamesave/save` - Save game state
- `GET /api/gamesave/load` - Load active game
- `GET /api/gamesave/load/:runId` - Load specific run
- `GET /api/gamesave/list` - List all user saves
- `POST /api/gamesave/finish/:runId` - Mark run as finished
- `DELETE /api/gamesave/:runId` - Delete a save

### Leaderboard
- `POST /api/leaderboard/submit` - Submit final score
- `GET /api/leaderboard/global` - Get global leaderboard
- `GET /api/leaderboard/character/:id` - Get character leaderboard
- `GET /api/leaderboard/user/best` - Get user's best scores
- `GET /api/leaderboard/stats/global` - Get global stats

---

## Next Steps

1. **Integrate into Game UI**
   - Add login/register screen
   - Connect character select to auth
   - Save game state on each turn
   - Submit scores on run completion

2. **Add Features**
   - Leaderboard display in UI
   - Character cosmetics/skins per user
   - Season resets
   - Achievements/badges

3. **Monitor & Optimize**
   - Check backend logs on Render
   - Monitor Supabase usage
   - Set up alerts for high error rates

