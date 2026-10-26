# AGENTS.md — User Preferences (`src/Preferences/`)

Instructions for persistent user settings consumed by controls, audio, rendering, maps, and UI.

## Preference Map (`src/Preferences/`)

| File                  | Responsibility                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `Audio.js`            | Defaults and persistent settings for background music and sound effects.                      |
| `Camera.js`           | Camera behavior and view-related settings.                                                    |
| `Controls.js`         | Movement, targeting, and other gameplay control settings.                                     |
| `Graphics.js`         | Display and renderer settings, including quality, frame rate, effects, and visual options.    |
| `Map.js`              | Map display and gameplay map preferences.                                                     |
| `ShortCutControls.js` | Persistent shortcut definitions, initialized with the key identifiers from `KeyEventHandler`. |
| `UI.js`               | Interface behavior and display preferences.                                                   |

## Invariants

- Preference objects are created and persisted by `Core/Preferences.js`; preserve its storage and versioning contract.
- Treat defaults and version arguments passed to `Preferences.get(...)` as part of persisted-data compatibility. When a schema changes, preserve or deliberately migrate existing user settings.
- Check every relevant consumer before renaming or changing a setting; preference properties are read across controls, audio, renderer, and UI code.
- Keep defaults safe for fresh profiles and retain the existing behavior when a stored preference is absent.
