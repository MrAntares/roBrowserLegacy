# Agent Instructions for roBrowser Legacy

PROHIBITED — Scope Discipline (read before anything else)

Before searching broad filenames or reading `.js` files line by line, read the relevant subsystem `AGENTS.md` and the docs it points to. Do not start by searching the codebase to "understand" a component; start with the local topology and the targeted documentation for that folder. This is the guardrail for working in the repo and prevents accidental scope drift.

## Topological map of the repository

| Folder             | What lives there                                                | Read first                                                     | Why                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/Core/`        | runtime config, VFS, workers, memory cache, Lua loader, AI      | `src/Core/AGENTS.md` + `docs/LuaModuleResolution.md`           | Read this file before modifying config, VFS, worker message flow, memory cache or Lua loading. This folder is the runtime backbone of the client: it owns file access, ROConfig, worker execution, AI hooks and startup wiring. Any change here can affect browser, PWA, Electron and asset loading in multiple subsystems at once.                                                             |
| `src/Network/`     | packets, opcodes, PACKETVER, sockets                            | `src/Network/AGENTS.md` + `docs/Encoding.md`                   | Read this file before touching any packet, socket, opcode or `PACKETVER` logic. This folder is the protocol boundary between client and server; it defines packet layouts, version branching, and transport contracts. Do not start from a random packet handler or a search hit—read the local topology and version rules first.                                                               |
| `src/Engine/`      | login/char/map engines, gameplay systems and map subsystems     | `src/Engine/AGENTS.md` + `docs/reference/README.md`            | Read this file before changing `GameEngine`, `LoginEngine`, `CharEngine`, `MapEngine` or any gameplay subsystem. This folder is the game-state orchestration layer: packet routing, session state, map lifecycle and gameplay handlers. Do not patch a handler by reading it in isolation before checking the engine route and relevant docs.                                                   |
| `src/Renderer/`    | WebGL, entities, effects, map rendering, GR2                    | `src/Renderer/AGENTS.md` + `docs/reference/renderer/README.md` | Read this file before touching the renderer, entity visuals, map draw code or effect logic. This folder is the visual execution path of the client: WebGL state, entity composition, batched sprites, map rendering and the effect system. Start here, then read the specific effect/entity file involved.                                                                                      |
| `src/UI/`          | GUIComponent-based UI, custom elements, components and managers | `src/UI/AGENTS.md` + `docs/UIComponent_to_GUIComponent.md`     | Read this file before touching `src/UI/` or a UI component. This folder is the architectural map for the entire client UI: `GUIComponent`, Shadow DOM, Custom Elements, managed versioned families, and the 100+ component tree. If a task touches a UI screen, window, widget or manager, read the relevant component docs here first and only then inspect the concrete `.js` implementation. |
| `src/Loaders/`     | binary asset loaders, GRF, SPR, STR, TGA, WASM                  | `src/Loaders/AGENTS.md` + `docs/Encoding.md`                   | Read this file before changing any asset loader or binary parser. This folder sits between the client VFS and the renderer/UI; it defines how GRF, SPR, ACT, STR, GND, GAT, RSW and TGA data are decoded. Avoid a direct patch in a format parser without checking the loader contract and the encoding rules first.                                                                            |
| `src/DB/`          | item/skill/status tables and constants                          | `src/DB/AGENTS.md` + `docs/Encoding.md`                        | Read this file before editing a table, constant, skill map or status mapping. This folder is the data contract for the client: IDs, item metadata, skill rules, texture and map lookups, plus Lua-backed tables. Changes here affect engine, renderer and UI behavior across the project.                                                                                                       |
| `src/Controls/`    | keyboard/mouse/map/input and command processing                 | `src/Controls/AGENTS.md`                                       | Read this file before changing keyboard, mouse, entity or command input behavior. This folder is the interaction surface between the user and the gameplay loop: input normalization, command dispatch and map/entity actions. A patch here often sends packets or changes renderer state indirectly, so read the folder map first.                                                             |
| `src/Audio/`       | BGM and Web Audio effects                                       | `src/Audio/AGENTS.md`                                          | Read this file before modifying BGM or sound effects. This folder is the playback layer for music and effect audio; it bridges asset loading and browser audio APIs, and changes here must preserve preference-driven behavior across browser and Electron runtimes.                                                                                                                            |
| `src/Preferences/` | persistent settings schemas                                     | `src/Preferences/AGENTS.md`                                    | Read this file before changing a persisted setting or schema. This folder defines the long-lived user configuration that feeds controls, audio, rendering, map display and UI flows, so a small schema change can ripple across many subsystems.                                                                                                                                                |
| `src/Plugins/`     | plugin loader and config-driven init                            | `src/Plugins/AGENTS.md`                                        | Read this file before modifying plugin loading or lifecycle behavior. This folder is the dynamic extension layer of the client: config-driven module loading and initialization. It can touch global state and runtime startup, so its contract should be understood before patching the loader.                                                                                                |
| `src/Utils/`       | shared binary, encoding, rendering and helper code              | `src/Utils/AGENTS.md`                                          | Read this file before changing a shared utility or binary primitive. This folder is the lowest-level support layer for encoding, binary IO, rendering helpers and shared math; bugs here frequently break loaders, network code, renderer code and file parsing everywhere else.                                                                                                                |
| `tests/`           | subsystem tests and fixture coverage                            | `tests/AGENTS.md`                                              | Read this file before changing or adding tests. This folder is the regression map for the whole client: UI, engine, network, loaders, renderer and database behavior. Use it to choose the closest subsystem suite before modifying code or introducing fixture changes.                                                                                                                        |
| `docs/`            | behavioral references, migration notes and subsystem docs       | relevant `docs/*.md` before touching a component               | Other AGENTS.md have instructions when you will need to read this docs                                                                                                                                                                                                                                                                                                                          |

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

| Task / subsystem                                                                   | Entry point                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| UI components, Shadow DOM, Custom Elements, scrollbars                             | `src/UI/AGENTS.md` → `docs/CustomElements.md`, `docs/Scrollbar.md`       |
| Versioned UI and `*Common.js` factories                                            | `src/UI/AGENTS.md` → `docs/GUIComponent_Version_Dedup_Factory.md`        |
| Packets, opcodes, lengths, `PACKETVER`, sockets                                    | `src/Network/AGENTS.md`                                                  |
| WebGL, entities, effects, shaders, GR2                                             | `src/Renderer/AGENTS.md` → `docs/reference/renderer/README.md`           |
| Game, Login, Char, Map engines, gameplay handlers                                  | `src/Engine/AGENTS.md` → `docs/reference/README.md`                      |
| Binary asset loading and encoding                                                  | `src/Loaders/AGENTS.md` → `docs/Encoding.md`                             |
| Database tables, constants, item/skill/status lookups                              | `src/DB/AGENTS.md` → `docs/Encoding.md`                                  |
| VFS, `ROConfig`, Workers, Lua / AI                                                 | `src/Core/AGENTS.md` → `docs/LuaModuleResolution.md`, `docs/Encoding.md` |
| Input and gameplay actions; entity mixin, map controls, commands, and screenshots. | `src/Controls/AGENTS.md`                                                 |
| Background music and Web Audio sound effects.                                      | `src/Audio/AGENTS.md`                                                    |
| Persistent settings schemas consumed across client subsystems.                     | `src/Preferences/AGENTS.md`                                              |
| Configuration-driven dynamic plugin loading and initialization.                    | `src/Plugins/AGENTS.md`                                                  |
| Shared binary, encoding, rendering, and general-purpose helpers.                   | `src/Utils/AGENTS.md`                                                    |
| Runtime diagnosis                                                                  | `docs/how-to/troubleshooting-and-diagnostics.md`                         |
| Original Windows client behavior                                                   | `docs/reference/README.md` → relevant behavior reference                 |
| UI component development                                                           | `docs/how-to/ui-component-development.md`                                |
| Packet development                                                                 | `docs/how-to/network-packet-development.md`                              |
| Renderer effect development                                                        | `docs/how-to/renderer-effects.md`                                        |
| Tests and test infrastructure                                                      | `tests/AGENTS.md`                                                        |
| Frozen third-party libraries; excluded from ESLint. **Never modify.**              | `src/Vendors/`                                                           |

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
