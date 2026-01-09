# Riot Roguelike

A roguelike game featuring characters from the Riot universe of Runeterra (League of Legends, Teamfight Tactics, Arcane ... more to come). Battle your way through increasingly difficult floors, collect items, and upgrade your champion.

## Features

- **Turn-Based Combat**: Strategic battle system with abilities and item effects
- **Roguelike Progression**: Floor-based progression with increasing difficulty
- **Character Database**: Expandable character system with abilities and stats

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: CSS3 with modern gradients and animations

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the dev server:

```bash
npm run dev
```

The game will open at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # React components (UI, Battle, CharacterSelect)
├── game/             # Core game logic (types, combat, state management)
├── characters/       # Character database and definitions
└── main.tsx          # Entry point
```

## Game Systems

### Characters
- Stats: HP, Attack, Defense, Speed
- Abilities: Special moves with damage/healing and cooldowns
- Level system: Gain experience and improve stats

### Combat
- Damage calculation with defense mitigation
- Critical hit system (15% chance)
- Ability-based attacks

### Progression
- Floor-based dungeon crawling
- Gold collection from victories
- Item system for stat enhancements

## Planned Features

- [ ] Enemy AI for battles
- [ ] Item shop between battles
- [ ] Boss encounters
- [ ] Ability upgrade system
- [ ] Leaderboards
- [ ] More Riot universe characters
- [ ] Animations and visual effects
- [ ] Sound effects

## Contributing

Feel free to add more characters, abilities, and features!

## License

MIT
