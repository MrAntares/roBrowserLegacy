# Architecture, Modernization & Debugging Reference

Supporting reference for AI coding agents working on **roBrowserLegacy**. Consult the root [`AGENTS.md`](../AGENTS.md) and subsystem-scoped `src/*/AGENTS.md` files first; open this document when you need deeper architectural context, legacy modernization patterns, or troubleshooting diagnostics.

---

## 1. Project Overview & Runtime Environments

roBrowserLegacy is a web-based Ragnarok Online client built with ES modules, Vite + a custom builder (`applications/tools/builder-web.mjs`), and WebGL (OpenGL ES 2.0). It runs in three primary environments:

1. **Web Browser** — Connects via WebSocket (`src/Network/SocketHelpers/WebSocket.js`) through a `wsProxy` server and loads assets from local dropped files or an HTTP Remote Client.
2. **Progressive Web App (PWA)** — Built via `npm run build:pwa` using `applications/pwa/` manifest and assets.
3. **Electron Desktop App** — Entry in `applications/electron/main.js`, using `src/Network/SocketHelpers/NodeSocket.js` for direct TCP connections via the preload `contextBridge` and `webserverAddress` for HTTP `/emblem` and `/userconfig` requests.

### Application Entry Points

- **`src/App/Online.js`** — Full online game client.
- **Six Asset Viewers (`src/App/`)** — `EffectViewer.js`, `GrannyModelViewer.js`, `GrfViewer.js`, `MapViewer.js`, `ModelViewer.js`, `StrViewer.js`.
- **Utilities & Workers** — `src/App/PreLoader.js` (preload utility) and `src/Core/ThreadEventHandler.js` (Web Worker entry point).

### External Infrastructure

- **wsProxy** — Server-side TCP-to-WebSocket proxy required by browser clients.
- **Remote Client (PHP / JS / Rust)** — HTTP service that extracts and serves assets on demand from `.grf` archives.
- **Game Server** — rAthena or Hercules (with `packet_obfuscation` disabled).
- **kRO Client Files** — `.grf` archives, `DATA.INI`, `BGM/`, `System/`, `AI/`, and the client executable (which can be used for `PACKETVER` auto-detection from its PE header timestamp via `src/Utils/Executable.js`).

---

## 2. Subsystem Overview & Runtime Data Flow

### Runtime Data Flow

1. **Initialization:** `GameEngine` loads `ROConfig` via `Configs`; `Client` initializes `ThreadEventHandler` and loads GRFs/executable; `PACKETVER` is set from config (`packetver`) or auto-detected from the executable's PE timestamp.
2. **Login & Char Selection:** `LoginEngine` and `CharEngine` use `NetworkManager` (`WebSocket` in browser, `NodeSocket` in Electron) to authenticate and select a character using date-versioned packets.
3. **Map Entry:** `MapEngine` loads the map (`MapLoader` → `MapRenderer`), initializes `EntityManager` and the 29 `src/Engine/MapEngine/` subsystems, selects versioned UI controllers via `UIVersionManager`, and enables `Controls`.
4. **Frame & Network Loop:** Input handlers (`MouseEventHandler`, `KeyEventHandler`, `EntityControl`, `MapControl`, `BattleMode`) invoke `ProcessCommand` or UI callbacks → `NetworkManager` sends outbound `CZ` packets → inbound `ZC` packet handlers update `Session`, `EntityManager`, `EffectManager`, and UI components → `Renderer` draws the scene each frame.

### Supporting Subsystems Without Dedicated `AGENTS.md`

For subsystems with dedicated agent instructions, read their scoped files (`src/UI/AGENTS.md`, `src/Network/AGENTS.md`, `src/Renderer/AGENTS.md`, `src/Engine/AGENTS.md`, `src/Loaders/AGENTS.md`, `src/DB/AGENTS.md`, `src/Core/AGENTS.md`). The remaining directories are:

- **`src/Controls/`** — `EntityControl.js` (mixed into `Entity`), `MapControl.js`, `KeyEventHandler.js`, `MouseEventHandler.js`, `ProcessCommand.js` (chat commands & shortcuts), `BattleMode.js`, `ScreenShot.js`.
- **`src/Audio/`** — `BGM.js` (background music) and `SoundManager.js` (spatial/UI `.wav` sound effects).
- **`src/Preferences/`** — Persistent user preference schemas: `Audio.js`, `Camera.js`, `Controls.js`, `Graphics.js`, `Map.js`, `ShortCutControls.js`, `UI.js`.
- **`src/Plugins/`** — `PluginManager.js` for configuring and loading custom client plugins from `ROConfig.plugins`.
- **`src/Utils/`** — `BinaryReader.js`, `BinaryWriter.js`, `Struct.js`, `Inflate.js`, `PathFinding.js`, `WebGL.js`, `Texture.js`, `Executable.js`, `CRC32.js`, `CodepageManager.js`, `ConsoleManager.js`, `HTMLEntity.js`, `HtmlHelper.js`, `Queue.js`, `Base62.js`, `Rijndael.js`, `colors.js`, `partyColors.js`, `gl-matrix.js`.
- **`src/Vendors/`** — Frozen third-party libraries (excluded from ESLint; **never modify**).

---

## 3. JavaScript Modernization Guidelines

When touching legacy code as part of a task, modernize the code you are already changing when doing so is safe and behavior-preserving. Do **not** perform sweeping modernization on files unrelated to your task.

| Older Pattern | Preferred Pattern |
| --- | --- |
| Callback `function(a, b) { ... }` | `(a, b) => { ... }` **only** when lexical `this` is safe. |
| String concatenation with variables | Template literals (`` `${a}${b}` ``). |
| Constructor function + prototype methods | ES `class` and instance methods (except `Entity.js` mixins and `Entity.prototype` data whitelist). |
| Object-literal singleton methods | Static `class` methods when safe and consistent with the module. |
| `var x = obj.x \|\| defaultVal` | `const` / `let` with destructuring defaults or explicit defaulting where semantics match. |
| File-local global assignment | Explicit ES module imports/exports after auditing all consumers. |

**Critical `this` Caveat:** Arrow functions capture `this` lexically. Before converting callbacks, event handlers, asset/canvas loaders, or prototype methods, verify whether the caller invokes the function with dynamic `this` (`.call()` / `.apply()`). Keep a regular `function()` wherever dynamic binding is required.

### Globals Still in Use

- `ROConfig` (`window.ROConfig`, `window.ROConfigBase`, `window.ROConfigLocal`) — Runtime configuration objects.
- `ROBrowser` — Global constructor/namespace used when embedding or orchestrating viewers (e.g., `applications/api/api.js`, `demo.html`, `GrfViewer.js`).
- `SEEK_CUR`, `SEEK_SET`, `SEEK_END` — `BinaryReader` seek constants. Prefer importing from `Utils/BinaryReader.js` in new code, but do not remove global exposure without auditing all consumers (including Web Workers).
- `window._OBJ_DRAG_` — Cross-component UI drag-and-drop payload contract (see `src/UI/AGENTS.md` and `REVIEW.md`).
- `window.electronAPI` — Electron preload `contextBridge` API.

---

## 4. Debugging & Troubleshooting

### Enabling Logs & Telemetry

- `ConsoleManager` (`src/Utils/ConsoleManager.js`) silences console output in production builds. If logs appear missing, check `ROConfig` flags before assuming a code path did not run:
  - `development: true` — Enables development mode and console output.
  - `enableConsole: true` — Enables console output without full development mode.
  - `disableConsole: true` — Forces console output off regardless of `development`.
  - `packetDump: true` — Logs raw packet hex dumps for comparison with `PacketStructure.js`.
  - `perfProbe: true` — Enables frame-time, draw-call, map-load, and startup profiling (`src/Core/PerfProbe.js`); inspect in-game via `/perf`.

### Symptom-to-First-Check Matrix

| Symptom | First Checks |
| --- | --- |
| Missing assets / 404s | GRF loading in `Client.js`, Remote Client configuration/response, `windows-1252` path encoding (`docs/Encoding.md`), and filename case sensitivity on Linux/HTTP. |
| Packet / protocol errors | `[PACKETVER] Set packet version <date>` log, `PacketVersions.js`, `PacketLength.js` (`packetsYYYY_len_main.js`), `packetDump: true`, and server `packet_obfuscation` (must be disabled). |
| Broken / garbled text | Missing `userCharpage` or double decoding in `CodepageManager.js` (see `docs/Encoding.md`). |
| Rendering / blank canvas | WebGL context creation in `Renderer.js` (OpenGL ES 2.0 required), shader compile errors, or oversized sprite sheet exceeding WebGL max texture size. |
| UI element invisible / unclickable | Shadow DOM query scope (`this.getRoot()`), `:host` geometry vs inner root, `pointer-events: none` inheritance, or `WhenDrawn.js` deferred asset loading (see `src/UI/AGENTS.md`). |
| Build or test import failure | Path alias synchronization between `vite.config.js` and `applications/tools/builder-web.mjs`, and explicit `.js` extensions on imports. |
| Connection failure | `wsProxy` running and reachable for browser `socketProxy`, or `NodeSocket.js` / firewall for Electron; check `forceUseAddress: true` in container/NAT setups. |
| No console output | Check `development`, `enableConsole`, and `ConsoleManager.js` in browser or Electron DevTools. |

---

## 5. Glossary

- **AID** — Account ID; server identifier for the player's account (often used as the player's unit GID).
- **GID** — Global ID; unique runtime identifier for a game entity (player, monster, NPC, item, skill unit).
- **GRF** — Game Resource File (`.grf`); encrypted/compressed archive container for Ragnarok Online client assets.
- **kRO** — Korean Ragnarok Online; the reference official client whose build dates define `PACKETVER`.
- **PACKETVER** — Packet version (`YYYYMMDD`); selects the network protocol structures, lengths, and UI versions matching a kRO client build date.
- **Remote Client** — HTTP server that extracts and serves files from `.grf` archives on demand.
- **wsProxy** — Server-side proxy that bridges browser WebSocket connections to TCP game servers (Login, Char, Map).
