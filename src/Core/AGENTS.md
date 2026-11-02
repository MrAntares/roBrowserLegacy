# AGENTS.md — Core Subsystem (`src/Core/`)

Instructions for working on client file access, runtime configuration, Web Worker threading, memory caching, homunculus/mercenary AI, Lua module loading, and performance probing.

## Mandatory Prerequisites

- **Lua / Wasmoon VM & `LuaModuleLoader`:** Read [`docs/LuaModuleResolution.md`](../../docs/LuaModuleResolution.md) before modifying `LuaModuleLoader.js`, `AIDriver.js`, or any Lua/`.lub` execution paths.
- **Character encoding & raw bytes contract:** Read [`docs/Encoding.md`](../../docs/Encoding.md). `FileManager.js` and `Client.loadFile` must return raw bytes (`Uint8Array` / `ArrayBuffer`) for binary/text files without assuming a global string encoding.

---

## Core Invariants

1. **Configuration & Globals (`Configs.js`, `Config.js`, `ROConfig`):**
    - `Config.js` (generated in `dist/Web/Config.js` by `applications/tools/builder-web.mjs` and present in `applications/pwa/Config.js`) contains default settings (`window.ROConfigBase`). Do not hand-edit generated `Config.js` files unless specifically changing the builder generator or defaults.
    - `Config.local.js` (`window.ROConfigLocal`) provides optional local overrides and is gitignored. Avoid leaking local server configuration into committed files.
    - `window.ROConfig` is the merged runtime configuration object consumed by `Configs.js`.
    - Important `ROConfig` options include `servers` (`address`, `port`, `version`, `langtype`, `packetver`, `renewal`, `socketProxy`, `remoteClient`, `adminList`), `packetver`, `packetDump`, `skipIntro`, `skipServerList`, `remoteClient`, `plugins`, `aura`, `autoLogin`, `development`, `enableConsole`, `disableConsole`, `perfProbe`, `loadLua`, `customItemInfo`, `luaSearchPaths`, `luaRemoteBaseUrl`, and `webserverAddress` (Electron).
    - When adding or modifying a configuration option, verify where it is defined, merged, read via `Configs.get(...)`, and exposed across Browser, PWA, and Electron targets.
2. **Web Worker & Global Consumers (`Thread.js`, `ThreadEventHandler.js`):**
    - `src/Core/ThreadEventHandler.js` is the Web Worker entry point (built via `npm run build:threadhandler` or `npm run build`).
    - Do not remove existing global assignments (such as `SEEK_CUR`, `SEEK_SET`, `SEEK_END` from `Utils/BinaryReader.js`, `ROConfig`, or `ROBrowser`) until every consumer—including Web Worker code and `applications/api/api.js`—has been audited.
3. **VFS Raw Bytes Pipeline (`Client.js`, `FileManager.js`, `MemoryManager.js`):**
    - `FileManager` loads raw bytes from GRFs or Remote Client HTTP endpoints. Never decode text inside `FileManager`; consumers (`DBManager`, loaders, `LuaModuleLoader`) determine the encoding context.
4. **Lua Module Loader Cache Generations (`LuaModuleLoader.js`):**
    - `LuaModuleLoader` tracks VFS and remote HTTP request generations independently so replacing `Client.loadFile` or calling `LuaModuleLoader.clearCache()` invalidates stale in-flight requests without poisoning negative lookup caches. Preserve generation tracking when editing `LuaModuleLoader.js`.

---

## Subsystem Inventory (`src/Core/`)

- `Client.js` — High-level interface to the virtual filesystem (communicates with `ThreadEventHandler` worker or main-thread `FileManager` and caches parsed assets via `MemoryManager`).
- `FileManager.js` — Low-level GRF extraction, `DATA.INI` ordering, and Remote Client HTTP fetching.
- `FileSystem.js` — Local browser FileSystem / IndexedDB storage for saving extracted/cached client files.
- `MemoryManager.js` & `MemoryItem.js` — LRU/TTL in-memory asset cache and reference tracking.
- `Thread.js` & `ThreadEventHandler.js` — Web Worker message bridge and worker entry point for background GRF loading and asset parsing.
- `Configs.js` — Runtime configuration store initialized from `ROConfig` and server definitions.
- `Context.js` — Environment detection (Browser, Popup/Frame, Electron, Mobile).
- `Events.js` — Frame-synchronized timeout/interval scheduler (`Events.setTimeout`, `Events.clearTimeout`) tied to the render tick.
- `Preferences.js` — Persistent user preferences storage (`localStorage` / Electron storage).
- `Mobile.js` — Touch/mobile device detection and fullscreen/orientation helpers.
- `AIDriver.js` — Wasmoon Lua 5.1 VM runner for Homunculus and Mercenary AI scripts (`AI/AI.lua`, `AI/USER_AI/AI.lua`).
- `LuaModuleLoader.js` — Bridges Lua `require`, `package.loaders`, `loadfile`, and `dofile` with VFS (`Client.loadFile` / `MemoryManager`), remote URLs, and Emscripten `MEMFS` (see [`docs/LuaModuleResolution.md`](../../docs/LuaModuleResolution.md)).
- `PerfProbe.js` — Opt-in performance telemetry (`perfProbe: true` in `ROConfig`; inspect in-game via `/perf`) measuring frame times, draw calls, map loads, and startup.
