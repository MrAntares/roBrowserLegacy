# Lua Module Resolution in roBrowserLegacy (`LuaModuleLoader`)

## Overview

`roBrowserLegacy` uses [Wasmoon](https://github.com/ceifa/wasmoon) (`src/Vendors/wasmoon-lua5.1.js`, compiling standard C Lua 5.1 to WebAssembly) to execute Lua source scripts (`.lua`) and compiled Lua 5.1 binary bytecode files (`.lub`) in the browser.

Because WebAssembly runs in an isolated sandbox without native OS filesystem access, Wasmoon's built-in C `require()` / `package.loaders[2]` (`loader_Lua`) only searches Emscripten's isolated in-memory filesystem (`MEMFS`) using default Unix paths (`./?.lua;/usr/local/share/lua/5.1/?.lua;...`).

`src/Core/LuaModuleLoader.js` bridges Lua's module and file-loading mechanisms (`require`, `package.loaders`, `package.searchers`, `package.path`, `package.preload`, `package.loaded`, `loadfile`, and `dofile`) with `roBrowserLegacy`'s virtual file system (`Client.loadFile` / `MemoryManager`), remote HTTP(S) URLs, and Emscripten's `MEMFS`.

---

## Resolution Pipeline

When `require(modname)` is invoked in a configured Lua VM:

1. **Loaded Cache (`package.loaded[modname]`)**
   - If `package.loaded[modname]` is already populated, the cached value is returned immediately without re-fetching or re-executing the module.
   - If `package.loaded[modname]` holds the internal loading sentinel (an uncooperative circular dependency is in progress), Lua raises `loop or previous error loading module '<modname>'`.
   - Cooperative circular dependencies (where a module assigns `package.loaded[modname] = M` before requiring a dependent module) return the in-progress table `M`.

2. **Preload Registry (`package.loaders[1]` / `package.preload[modname]`)**
   - Checks `package.preload[modname]`. If a loader function is registered, it is invoked with `modname`.

3. **VFS / Cache / Remote Searcher (`package.loaders[2]`)**
   - Translates `modname` and the VM's active `package.path` into an ordered, deduplicated list of candidate paths/URLs via `LuaModuleLoader.resolveCandidates(modname, package.path)`:
     - Dotted module names (`require("module.submodule")`) expand to `module/submodule.lua`, `module/submodule.lub`, `module/submodule/init.lua`, etc.
     - Ragnarok Online backslash paths and explicit extensions (`require("AI\\Const.lua")`, `require("System/itemInfo.lub")`) normalize backslashes to `/` and preserve the explicit `.lua` / `.lub` extension instead of treating `.lua` as a nested directory.
     - Direct HTTP(S) URLs (`require("https://example.com/scripts/mod.lua")`) and URL templates in `package.path` (`https://example.com/lua/?.lua`) resolve as remote URL candidates.
     - Setting `package.path = ""` disables template-based path resolution.
   - Evaluates candidates strictly in `package.path` order. For each candidate:
     1. **VM `MEMFS`**: Checks if the candidate is already mounted in the Lua VM's Emscripten `MEMFS`.
     2. **Shared Buffer Cache (`LuaModuleLoader`)**: Checks if the raw `Uint8Array` buffer was already loaded in the current client archive generation and mounts it into the current VM's `MEMFS`.
     3. **`MemoryManager`**: Checks if the VFS asset is already cached in `MemoryManager` (`MemoryManager.exist(candidate)`) and mounts it synchronously.
     4. **Async VFS (`Client.loadFile`) / Remote HTTP(S) (`fetch`)**: When running inside an async Wasmoon coroutine (`await lua.doString(...)`, `await lua.doFile(...)`, `LuaModuleLoader.requireAsync(...)`, or `LuaModuleLoader.doFileAsync(...)`), yields a JS `Promise` to fetch an unchecked candidate from `Client.loadFile` (for VFS paths) or `fetch` (for remote URLs) before falling back to any lower-priority candidate in `package.path`. Known-missing VFS candidates are recorded in a negative lookup cache for the current archive generation and skipped immediately during preloading and runtime to avoid redundant searches. Remote HTTP(S) URLs allow retries so recovered network modules become available after temporary server failures without manual cache clearing. VFS and remote request generations are tracked independently so updating one loader does not cross-invalidate in-flight requests or cache entries of the other type. Replacing `Client.loadFile` or calling `LuaModuleLoader.clearCache()` increments generation counters and evicts stale in-flight requests, ensuring that late responses from an older loader cannot poison negative cache entries or block replacement loaders.
   - Compiles the mounted file from `MEMFS` via `_raw_loadfile(memfsPath)`, preserving raw binary bytes for both `.lua` source files (including EUC-KR / Windows-1252 strings and stripping 3-byte UTF-8 BOMs) and `.lub` compiled Lua 5.1 bytecode (`\x1bLuaQ...`).

4. **Custom Searchers (`package.loaders[3+]` / `package.searchers[3+]`)**
   - Any additional custom searchers appended to `package.loaders` or `package.searchers` are evaluated in order.

---

## Configuring Search Paths

### 1. Via `ROConfig` / `Configs`

Configure custom search path templates or a fallback remote base URL in `ROConfig`:

```javascript
Configs.set('luaSearchPaths', [
	'./?.lua',
	'./?.lub',
	'CustomScripts/?.lua',
	'AI/USER_AI/?.lua',
	'AI/?.lua'
]);

// Optional remote HTTP(S) fallback base URL
Configs.set('luaRemoteBaseUrl', 'https://assets.example.com/lua');
```

### 2. Via `LuaModuleLoader.configure()` or `LuaModuleLoader.setup(lua, options)`

```javascript
import LuaModuleLoader from 'Core/LuaModuleLoader.js';

// Global configuration
LuaModuleLoader.configure({
	prependSearchPaths: ['Mods/?.lua', 'Mods/?.lub'],
	appendSearchPaths: ['https://cdn.example.com/lua/?.lua']
});

// Per-VM configuration
LuaModuleLoader.setup(luaVM, {
	searchPaths: [
		'./?.lua',
		'./?.lub',
		'AI/USER_AI/?.lua',
		'AI/?.lua'
	]
});
```

### 3. Dynamically Inside Lua (`package.path`)

Scripts can modify `package.path` at runtime using standard Lua syntax:

```lua
package.path = "CustomAI/?.lua;CustomAI/?.lub;" .. package.path
local tactics = require("combat.tactics")
```

---

## Synchronous vs. Asynchronous Execution

- **Asynchronous Coroutine Execution (`await lua.doString(code)`, `await lua.doFile(path)`, `await LuaModuleLoader.requireAsync(lua, modname)`, `await LuaModuleLoader.doFileAsync(lua, path)`)**:
  Supports on-demand asynchronous loading from `Client.loadFile` (VFS) and `fetch` (remote URLs) directly inside `require()`, `dofile()`, `loadfile()`, and `pcall(require, ...)`.
- **Synchronous Main-Thread Execution (`lua.doStringSync(code)`, `lua.doFileSync(path)`, `AIDriver.exec(code)`)**:
  Resolves synchronously from `package.loaded`, `package.preload`, `MEMFS`, `LuaModuleLoader`'s buffer cache, and `MemoryManager`. To pre-populate VFS/remote dependencies before calling `doStringSync` or `doFileSync`, call `await LuaModuleLoader.preload(lua, targets)` or `await LuaModuleLoader.preloadFromCode(lua, code)`.
