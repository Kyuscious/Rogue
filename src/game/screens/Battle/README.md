# Battle Screen Structure

This folder now uses a feature-oriented layout:

- `Battle.tsx` - main battle screen container
- `battlefield/` - battlefield rendering and visual-only battle displays
- `selectors/` - weapon, spell, and item selection panels
- `summary/` - battle summary and reward presentation
- `timeline/` - upcoming action timeline UI
- `shared/` - battle-specific shared presentation helpers
- `logic/` - lightweight screen helpers extracted from the main component

Framework-agnostic combat rules remain in `src/game/battle/`, while battle-screen UI now stays colocated here.
