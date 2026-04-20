# Quest Select Structure

This feature owns the UI-facing quest browsing and path selection flow.

## Folder layout
- `QuestSelect.tsx` - main quest selection screen
- `GearChange.tsx` - pre-run loadout adjustments
- `logic/` - quest catalog and path-completion helpers used by the quest-selection flow and related UI surfaces

Quest definitions are colocated here for easier discovery from the UI side, while region/enemy data still lives in the shared game layer.
