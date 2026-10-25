# AGENTS.md 
 
Global instructions for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite, a custom builder (`applications/tools/builder-web.mjs`), and WebGL (OpenGL ES 2.0). The project runs in web browsers, as a PWA, and as an Electron desktop application. 
 
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

## 1. Documentation Routing 
 
**Read the instructions and references relevant to the task before editing.** Mandatory references are prerequisites, not optional suggestions. Do not read unrelated subsystem documentation unless the investigation requires it. 
 
| Task / subsystem | Required documentation | 
|---|---| 
| UI components, Shadow DOM, Custom Elements, scrollbars | `src/UI/AGENTS.md`, `docs/CustomElements.md`, `docs/Scrollbar.md` | 
| Versioned UI deduplication (`*Common.js` factories) | `src/UI/AGENTS.md` → `docs/GUIComponent_Version_Dedup_Factory.md` | 
| Packets, opcodes, lengths, `PACKETVER`, sockets | `src/Network/AGENTS.md` | 
| WebGL renderer, `Entity` mixins, effects, shaders, GR2 | `src/Renderer/AGENTS.md` → `docs/reference/renderer/README.md` | 
| Game, Login, Char and Map engines; gameplay handlers | `src/Engine/AGENTS.md` → `docs/reference/README.md` | 
| Binary asset loaders (`.grf`, `.spr`, `.rsw`, `.gr2`, WASM) | `src/Loaders/AGENTS.md` → `docs/Encoding.md` | 
| Database tables, constants, item/skill/status lookups | `src/DB/AGENTS.md` → `docs/Encoding.md` | 
| VFS (`Client`/`FileManager`), `ROConfig`, Workers, Lua/AI | `src/Core/AGENTS.md` → `docs/LuaModuleResolution.md`, `docs/Encoding.md` | 
| Controls, Audio, Preferences, Plugins, Utils | `docs/Architecture.md` | 
| Original Windows client behavior (Guild, Chat, Pet, Mounts, etc.) | `docs/reference/README.md` → applicable behavior references | 
| Vitest files | `tests/AGENTS.md` | 
 
### Documentation discovery rules 
 
- When working inside `src/<Subsystem>/`, read the corresponding `src/<Subsystem>/AGENTS.md` first if the coding agent does not automatically load nested `AGENTS.md` files. 
- Follow the routing chain for the affected subsystem before editing. 
- Read behavior references and how-to guides when the task touches the behavior or workflow they document. 
- Treat implementation details as evidence to verify, not as a reason to ignore mandatory instructions. 
- If the relevant documentation is missing, contradictory, or stale, inspect the code and report the discrepancy rather than inventing a rule. 
- Do not expand the scope of investigation without a concrete dependency, regression risk, or unresolved question. 
 
--- 
 
## 2. Non-Negotiable Constraints 
 
Do not violate these constraints unless the user explicitly directs a change. 
 
### 2.1 Protected code and data 
 
- **Vendored dependencies:** Never modify `src/Vendors/`. These files are frozen and excluded from ESLint. 
- **Entity composition:** Never convert the `Entity` mixin/composition system to class inheritance. Its dynamic composition and prototype-based property whitelist are intentional. 
- **Packet version detection:** Do not change `src/Network/PacketVerManager.js` detection or block-size logic without explicit instruction. 
- **Database constants:** Do not change numeric IDs in `src/DB/*Const.js` tables unless intentionally matching an official kRO update. 
- **Generated configuration:** Do not hand-edit generated defaults in `Config.js` unless the task specifically requires changing the generator (`applications/tools/builder-web.mjs`) or the default configuration. 
- **Game assets:** Never commit proprietary game assets such as `.grf`, `.spr`, `.act`, `.bmp`, or `.mp3`. Tests must use synthetic in-memory buffers. 
 
### 2.2 Module resolution and globals 
 
- Use configured path aliases with explicit `.js` extensions for cross-directory imports. Example: `import Client from 'Core/Client.js';` 
- Keep aliases synchronized between `vite.config.js` and `applications/tools/builder-web.mjs`. 
- Existing aliases map `App`, `Audio`, `Controls`, `Core`, `DB`, `Engine`, `Loaders`, `Network`, `Plugins`, `Preferences`, `Renderer`, `UI`, `Utils`, and `Vendors` to their respective `src/` directories. 
- Do not remove existing global assignments (`ROConfig`, `ROBrowser`, `SEEK_CUR`, `SEEK_SET`, `SEEK_END`, `window._OBJ_DRAG_`) without auditing every consumer, including Web Workers and `applications/`. 
- Before removing a global, verify that every consumer has been migrated to the appropriate import or replacement. 


# AGENTS.md

Global entry point for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite, a custom builder, and WebGL (OpenGL ES 2.0). The project runs in web browsers, as a PWA, and as an Electron desktop application.

## 1. Project Overview

### Runtime environments

| Environment | Entry point / transport | Key dependency |
|---|---|---|
| Browser | `src/App/Online.js`; `src/Network/SocketHelpers/WebSocket.js` | `wsProxy` for TCP ↔ WebSocket translation |
| PWA | `applications/pwa/`; `npm run build:pwa` | Browser runtime and PWA assets |
| Electron | `applications/electron/main.js`; `src/Network/SocketHelpers/NodeSocket.js` | Direct TCP through preload `contextBridge` |
| Asset viewers | `src/App/` | Standalone applications for inspecting game assets |
| Preloader / Workers | `src/App/PreLoader.js`; `src/Core/ThreadEventHandler.js` | Shared loading and worker infrastructure |

### External dependencies

| Dependency | Role |
|---|---|
| `wsProxy` | TCP-to-WebSocket proxy for browser clients |
| Remote Client | PHP / JS / Rust services that extract and serve assets from GRF archives |
| Game server | rAthena or Hercules; packet compatibility depends on server configuration |
| kRO client files | GRFs, `DATA.INI`, `BGM/`, `System/`, `AI/`, and optionally the executable for `PACKETVER` detection |

### High-level runtime flow

1. Configuration and client initialization establish `ROConfig`, resources, workers, and packet-version settings.
2. Login and character selection communicate through `NetworkManager` and the configured socket transport.
3. Map entry connects map loading, gameplay handlers, entity management, UI controllers, and input controls.
4. During gameplay, input and UI actions trigger commands and outbound packets; inbound packets update session state, entities, effects, and UI; the renderer draws the scene.

Use this flow to locate the likely subsystem, not as a substitute for tracing the actual execution path of a specific feature.

## 2. Documentation Routing

Use this table to find the relevant subsystem map and supporting documentation. Read the scoped `AGENTS.md` and follow its references before editing that subsystem.

| Task / subsystem | Entry point |
|---|---|
| UI components, Shadow DOM, Custom Elements, scrollbars | `src/UI/AGENTS.md` → `docs/CustomElements.md`, `docs/Scrollbar.md` |
| Versioned UI and `*Common.js` factories | `src/UI/AGENTS.md` → `docs/GUIComponent_Version_Dedup_Factory.md` |
| Packets, opcodes, lengths, `PACKETVER`, sockets | `src/Network/AGENTS.md` |
| WebGL, entities, effects, shaders, GR2 | `src/Renderer/AGENTS.md` → `docs/reference/renderer/README.md` |
| Game, Login, Char, Map engines, gameplay handlers | `src/Engine/AGENTS.md` → `docs/reference/README.md` |
| Binary asset loading and encoding | `src/Loaders/AGENTS.md` → `docs/Encoding.md` |
| Database tables, constants, item/skill/status lookups | `src/DB/AGENTS.md` → `docs/Encoding.md` |
| VFS, `ROConfig`, Workers, Lua / AI | `src/Core/AGENTS.md` → `docs/LuaModuleResolution.md`, `docs/Encoding.md` |
| Controls, Audio, Preferences, Plugins, Utils | `docs/Architecture.md` |
| Tests and test infrastructure | `tests/AGENTS.md` |
| Original Windows client behavior | `docs/reference/README.md` → relevant behavior reference |
| UI component development | `docs/how-to/ui-component-development.md` |
| Packet development | `docs/how-to/network-packet-development.md` |
| Renderer effect development | `docs/how-to/renderer-effects.md` |
| Runtime diagnosis | `docs/how-to/troubleshooting-and-diagnostics.md` |

Behavior references and how-to guides are consulted on demand. Follow the route relevant to the task rather than reading unrelated documentation.

If documentation and implementation disagree, inspect the affected code and report the discrepancy. Do not infer undocumented behavior from the intended architecture alone.

## 3. Cross-Cutting Constraints

### Protected code and data

- **Vendored dependencies:** Never modify `src/Vendors/`.
- **Entity composition:** Preserve the existing mixin/composition model; do not convert it to class inheritance.
- **Packet version detection:** Do not change `src/Network/PacketVerManager.js` detection or block-size logic without explicit instruction. See `src/Network/AGENTS.md` for protocol-specific invariants.
- **Database constants:** Do not change numeric IDs in `src/DB/*Const.js` unless intentionally implementing an official kRO update.
- **Generated configuration:** Avoid editing generated `Config.js` output directly when the intended change belongs in its generator or default configuration.
- **Game assets:** Never commit proprietary assets such as `.grf`, `.spr`, `.act`, `.bmp`, or `.mp3`. Tests must use synthetic in-memory buffers.
- **TODO preservation:** Leave every `// TODO` in code unchanged and present during a task unless the user explicitly requests otherwise. A missing feature is a smaller bug than an invented one.

## 4. Module resolution and globals

- Use configured path aliases with explicit `.js` extensions for cross-directory imports.
- Keep aliases synchronized between `vite.config.js` and `applications/tools/builder-web.mjs`.
- Before removing or changing an existing global, audit all consumers, including Web Workers and `applications/`.
- Preserve compatibility across browser, PWA, Electron, worker, and tooling contexts when changing shared initialization or module interfaces.

| Cross-cutting interface | Relevant consideration |
|---|---|
| `ROConfig` | Runtime configuration consumed across the application |
| `ROBrowser` | Existing application global; audit consumers before changing initialization or removal |
| `SEEK_CUR`, `SEEK_SET`, `SEEK_END` | Binary reader constants; prefer imports from `Utils/BinaryReader.js` in new or migrated code |
| `window._OBJ_DRAG_` | Existing drag-related global; audit all consumers before changing it |
| Module aliases | Shared build configuration in Vite and the custom builder |
| `Config.js` | Generated configuration; change the intended source rather than blindly patching generated output |

Use these as starting points when a problem crosses subsystem boundaries. They identify common compatibility risks, not exhaustive explanations of subsystem behavior.

| Symptom / change | Check |
|---|---|
| Packet parsing or connection failures | Client/server `PACKETVER` compatibility, opcode definitions, packet schemas, lengths, and transport |
| Assets fail to load on Linux | GRF path casing and resource resolution |
| Large sprite sheets or textures fail | WebGL context and maximum texture dimensions |
| Behavior differs between browser and Electron | Transport implementation, runtime context, and environment-specific diagnostics |
| UI behavior regresses across client versions | Shared component factories and version-specific implementations |
| Entity textures leak or disappear | Composite texture lifecycle during entity removal, batch rendering, and WebGL context loss |
| Runtime logs appear missing | Browser DevTools, Electron DevTools, and `ConsoleManager` configuration |

## 5. Terminology

| Term | Meaning |
|---|---|
| GID | Global ID identifying a game entity |
| GRF | Game Resource File containing Ragnarok assets |
| `PACKETVER` | Client packet version, commonly associated with a kRO client date |
| `wsProxy` | Proxy translating between WebSocket and TCP |
| Entity | Game object such as a player, NPC, or monster |
| Effect | Visual effect managed by the renderer's effect infrastructure |
| kRO | Korean Ragnarok Online; reference client for packet versions |
