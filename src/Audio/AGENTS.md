# AGENTS.md — Audio (`src/Audio/`)

Instructions for background music and in-game sound effects.

## Audio Map (`src/Audio/`)

| File              | Responsibility                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `BGM.js`          | Background music playback, format selection, playback position, and BGM preference volume.                         |
| `SoundManager.js` | Web Audio sound effects; loads and decodes WAV assets, caches buffers, and manages spatialized playback instances. |

## Invariants

- Audio assets are loaded through `Client.loadFile`; preserve the VFS path and browser/PWA/Electron compatibility.
- Playback is preference-controlled through `Preferences/Audio.js`. Keep volume and enable/disable behavior synchronized with settings.
- `SoundManager` shares decoded buffers and an audio context, while limiting repeated/simultaneous instances. Preserve stop and pending-play cancellation behavior when changing its caches or lifecycle.
- Browser audio may require a user gesture to resume. Preserve the existing initialization and playback paths rather than assuming an always-running context.
- Do not add or commit proprietary game audio assets.
