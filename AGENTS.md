# AGENTS.md

Global entry point for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite, a custom builder, and WebGL (OpenGL ES 2.0). The project runs in web browsers, as a PWA, and as an Electron desktop application.

## 1. Project Overview

### Runtime environments

| Environment         | Entry point / transport                                                    | Key dependency                                     |
| ------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Browser             | `src/App/Online.js`; `src/Network/SocketHelpers/WebSocket.js`              | `wsProxy` for TCP ↔ WebSocket translation          |
| PWA                 | `applications/pwa/`; `npm run build:pwa`                                   | Browser runtime and PWA assets                     |
| Electron            | `applications/electron/main.js`; `src/Network/SocketHelpers/NodeSocket.js` | Direct TCP through preload `contextBridge`         |
| Asset viewers       | `src/App/`                                                                 | Standalone applications for inspecting game assets |
| Preloader / Workers | `src/App/PreLoader.js`; `src/Core/ThreadEventHandler.js`                   | Shared loading and worker infrastructure           |

### External dependencies

| Dependency       | Role                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `wsProxy`        | TCP-to-WebSocket proxy for browser clients                                                          |
| Remote Client    | PHP / JS / Rust services that extract and serve assets from GRF archives                            |
| Game server      | rAthena or Hercules; packet compatibility depends on server configuration                           |
| kRO client files | GRFs, `DATA.INI`, `BGM/`, `System/`, `AI/`, and optionally the executable for `PACKETVER` detection |

### High-level runtime flow

1. Configuration and client initialization establish `ROConfig`, resources, workers, and packet-version settings.
2. Login and character selection communicate through `NetworkManager` and the configured socket transport.
3. Map entry connects map loading, gameplay handlers, entity management, UI controllers, and input controls.
4. During gameplay, input and UI actions trigger commands and outbound packets; inbound packets update session state, entities, effects, and UI; the renderer draws the scene.

Use this flow to locate the likely subsystem, not as a substitute for tracing the actual execution path of a specific feature.

## 2. Documentation Routing

Use this table to find the relevant subsystem map and supporting documentation. Read the scoped `AGENTS.md` and follow its references before editing that subsystem.

| Task / subsystem                                       | Entry point                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| UI components, Shadow DOM, Custom Elements, scrollbars | `src/UI/AGENTS.md` → `docs/CustomElements.md`, `docs/Scrollbar.md`       |
| Versioned UI and `*Common.js` factories                | `src/UI/AGENTS.md` → `docs/GUIComponent_Version_Dedup_Factory.md`        |
| Packets, opcodes, lengths, `PACKETVER`, sockets        | `src/Network/AGENTS.md`                                                  |
| WebGL, entities, effects, shaders, GR2                 | `src/Renderer/AGENTS.md` → `docs/reference/renderer/README.md`           |
| Game, Login, Char, Map engines, gameplay handlers      | `src/Engine/AGENTS.md` → `docs/reference/README.md`                      |
| Binary asset loading and encoding                      | `src/Loaders/AGENTS.md` → `docs/Encoding.md`                             |
| Database tables, constants, item/skill/status lookups  | `src/DB/AGENTS.md` → `docs/Encoding.md`                                  |
| VFS, `ROConfig`, Workers, Lua / AI                     | `src/Core/AGENTS.md` → `docs/LuaModuleResolution.md`, `docs/Encoding.md` |
| Tests and test infrastructure                          | `tests/AGENTS.md`                                                        |
| Original Windows client behavior                       | `docs/reference/README.md` → relevant behavior reference                 |
| UI component development                               | `docs/how-to/ui-component-development.md`                                |
| Packet development                                     | `docs/how-to/network-packet-development.md`                              |
| Renderer effect development                            | `docs/how-to/renderer-effects.md`                                        |
| Runtime diagnosis                                      | `docs/how-to/troubleshooting-and-diagnostics.md`                         |

Behavior references and how-to guides are consulted on demand. Follow the route relevant to the task rather than reading unrelated documentation.

If documentation and implementation disagree, inspect the affected code and report the discrepancy. Do not infer undocumented behavior from the intended architecture alone.

## 2.1. Supporting Subsystems Without Dedicated `AGENTS.md`

Subsystems with scoped instructions are routed through their own `AGENTS.md`. For directories without one, use this index to locate likely entry points; inspect neighboring code when ownership is unclear.

| Directory          | Key entry points / responsibilities                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/Controls/`    | `EntityControl.js` (mixed into `Entity`), `MapControl.js`, `KeyEventHandler.js`, `MouseEventHandler.js`, `ProcessCommand.js` (chat commands and shortcuts), `BattleMode.js`, `ScreenShot.js`            |
| `src/Audio/`       | `BGM.js` (background music), `SoundManager.js` (spatial and UI `.wav` effects)                                                                                                                          |
| `src/Preferences/` | Persistent preference schemas: `Audio.js`, `Camera.js`, `Controls.js`, `Graphics.js`, `Map.js`, `ShortCutControls.js`, `UI.js`                                                                          |
| `src/Plugins/`     | `PluginManager.js`; loads and configures custom client plugins from `ROConfig.plugins`                                                                                                                  |
| `src/Utils/`       | Binary I/O, structures, compression, pathfinding, WebGL and texture helpers, executable parsing, CRC32, codepages, console, HTML helpers, queues, encoding/crypto utilities, colors, and `gl-matrix.js` |
| `src/Vendors/`     | Frozen third-party libraries; excluded from ESLint. **Never modify.**                                                                                                                                   |

## 3. Cross-Cutting Constraints

### Protected code and data

- **Vendored dependencies:** Never modify `src/Vendors/`.
- **Entity composition:** Preserve the existing mixin/composition model; do not convert it to class inheritance.
- **Packet version detection:** Do not change `src/Network/PacketVerManager.js` detection or block-size logic without explicit instruction. See `src/Network/AGENTS.md` for protocol-specific invariants.
- **Database constants:** Do not change numeric IDs in `src/DB/*Const.js` unless intentionally implementing an official kRO update.
- **Generated configuration:** Avoid editing generated `Config.js` output directly when the intended change belongs in its generator or default configuration.
- **Game assets:** Never commit proprietary assets such as `.grf`, `.spr`, `.act`, `.bmp`, or `.mp3`. Tests must use synthetic in-memory buffers.
- **TODO preservation:** Leave every `// TODO` in code unchanged and present during a task unless the user explicitly requests otherwise. A missing feature is a smaller bug than an invented one.

### Module resolution and globals

- Use configured path aliases with explicit `.js` extensions for cross-directory imports.
- Keep aliases synchronized between `vite.config.js` and `applications/tools/builder-web.mjs`.
- Before removing or changing an existing global, audit all consumers, including Web Workers and `applications/`.
- Preserve compatibility across browser, PWA, Electron, worker, and tooling contexts when changing shared initialization or module interfaces.

| Cross-cutting interface            | Relevant consideration                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ROConfig`                         | Runtime configuration consumed across the application                                             |
| `ROBrowser`                        | Existing application global; audit consumers before changing initialization or removal            |
| `SEEK_CUR`, `SEEK_SET`, `SEEK_END` | Binary reader constants; prefer imports from `Utils/BinaryReader.js` in new or migrated code      |
| `window._OBJ_DRAG_`                | Existing drag-related global; audit all consumers before changing it                              |
| Module aliases                     | Shared build configuration in Vite and the custom builder                                         |
| `Config.js`                        | Generated configuration; change the intended source rather than blindly patching generated output |

## 4. Investigation Notes

Use these as starting points when a problem crosses subsystem boundaries. They identify common compatibility risks, not exhaustive explanations of subsystem behavior.

| Symptom / change                              | Check                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Packet parsing or connection failures         | Client/server `PACKETVER` compatibility, opcode definitions, packet schemas, lengths, and transport |
| Assets fail to load on Linux                  | GRF path casing and resource resolution                                                             |
| Large sprite sheets or textures fail          | WebGL context and maximum texture dimensions                                                        |
| Behavior differs between browser and Electron | Transport implementation, runtime context, and environment-specific diagnostics                     |
| UI behavior regresses across client versions  | Shared component factories and version-specific implementations                                     |
| Entity textures leak or disappear             | Composite texture lifecycle during entity removal, batch rendering, and WebGL context loss          |
| Runtime logs appear missing                   | Browser DevTools, Electron DevTools, and `ConsoleManager` configuration                             |

For a specific subsystem, use its scoped map and references rather than duplicating its file inventory here.

## 5. Terminology

| Term        | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| GID         | Global ID identifying a game entity                               |
| GRF         | Game Resource File containing Ragnarok assets                     |
| `PACKETVER` | Client packet version, commonly associated with a kRO client date |
| `wsProxy`   | Proxy translating between WebSocket and TCP                       |
| Entity      | Game object such as a player, NPC, or monster                     |
| Effect      | Visual effect managed by the renderer's effect infrastructure     |
| kRO         | Korean Ragnarok Online; reference client for packet versions      |
