- Project Type: React + TypeScript Roguelike Game
- Framework: Vite
- Characters: Riot Universe (League of Legends, Valorant, TFT, Arcane)
- Game Engine: Turn-based combat system
- Target: Web browser

## Development Instructions

### Setup
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Game runs at http://localhost:5173

### Project Structure
- `src/components/` - React UI components (CharacterSelect, Battle, CharacterStatus)
- `src/game/` - Game logic (types, combat calculations, state management)
- `src/characters/` - Character database and definitions

### Key Files to Know
- `src/components/App.tsx` - Main game component with scene management
- `src/game/store.ts` - Zustand store for global game state
- `src/characters/database.ts` - Character definitions and abilities
- `src/game/combat.ts` - Combat calculations and mechanics

### Next Steps for Development
1. Implement full turn-based battle logic with enemy AI
2. Add item shop and inventory management
3. Create boss encounter system
4. Add more Riot characters (Yasuo, Jinx, Thresh, Yone, Sage, Jett, etc.)
5. Implement floor progression and difficulty scaling
6. Add animations and particle effects
7. Create leaderboard system
8. Add sound effects and music

### Game Flow
1. Character selection screen
2. Explore screen with floor display and gold counter
3. Battle screen with turn-based combat
4. Victory/defeat handling with gold rewards

### Helpful Commands
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
