/**
 * Core/LuaModuleLoader.js
 *
 * Browser-compatible Lua module resolution and asset-loading bridge for Wasmoon (Lua 5.1).
 *
 * Bridges Lua's synchronous `require()`, `package.loaders` / `package.searchers`,
 * `package.path`, `package.preload`, `package.loaded`, `loadfile()`, and `dofile()`
 * with roBrowserLegacy's virtual file system (`Client.loadFile` / `MemoryManager`),
 * remote HTTP(S) URLs, and Emscripten's in-memory filesystem (`MEMFS`).
 *
 * Supports both `.lua` source scripts and compiled `.lub` Lua 5.1 bytecode.
 */

import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';
import MemoryManager from 'Core/MemoryManager.js';
import TextEncoding from 'Utils/CodepageManager.js';

/**
 * Default module search path templates used to populate Lua's `package.path`.
 * Supports standard Lua modules, Ragnarok Online AI scripts, and System/data Lua/LUB files.
 *
 * @type {ReadonlyArray<string>}
 */
const DEFAULT_SEARCH_PATHS = Object.freeze([
	'./?.lua',
	'./?.lub',
	'./?/init.lua',
	'./?/init.lub',
	'AI/?.lua',
	'AI/?.lub',
	'AI/USER_AI/?.lua',
	'AI/USER_AI/?.lub',
	'System/?.lub',
	'System/?.lua',
	'SystemEN/?.lub',
	'SystemEN/?.lua',
	'data/luafiles514/lua files/?.lub',
	'data/luafiles514/lua files/?.lua'
]);

/**
 * Runtime-generated AI state files that may not exist in the static GRF/VFS
 * and should not cause preloading warnings when absent.
 *
 * @type {ReadonlyArray<string>}
 */
const OPTIONAL_RUNTIME_PATTERNS = Object.freeze(['Timeouts', 'AggressiveRelogPath']);

/**
 * Shared binary buffer cache keyed by canonical candidate path/URL.
 * Maps canonical path -> Uint8Array.
 *
 * @type {Map<string, Uint8Array>}
 */
const _bufferCache = new Map();

/**
 * In-flight asynchronous fetch/load promises keyed by canonical candidate path/URL.
 * Prevents duplicate concurrent requests for the same resource.
 *
 * @type {Map<string, Promise<Uint8Array>>}
 */
const _inflight = new Map();

/**
 * Negative lookup diagnostics keyed by canonical candidate path/URL.
 * Records the most recent failure message for error reporting and avoids
 * redundant VFS/network requests for known-missing candidates within the same archive generation.
 *
 * @type {Map<string, string>}
 */
const _failureReasons = new Map();

/**
 * Monotonically increasing cache generation counter for VFS requests.
 * Incremented on `clearCache()` or when `Client.loadFile` / `vfsLoader` changes so
 * in-flight requests from a previous client archive or loader cannot repopulate the cache.
 *
 * @type {number}
 */
let _vfsGeneration = 0;

/**
 * Monotonically increasing cache generation counter for remote URL requests.
 * Incremented on `clearCache()` or when `urlFetcher` / `remoteBaseUrl` changes so
 * in-flight requests from a previous remote configuration cannot repopulate the cache.
 *
 * @type {number}
 */
let _remoteGeneration = 0;

/**
 * Tracks the last seen `Client.loadFile` function reference so negative cache entries
 * are invalidated automatically if `Client.loadFile` is replaced in tests or runtime.
 *
 * @type {Function}
 */
let _lastClientLoadFile = Client.loadFile;

/**
 * Per-Lua-VM metadata store.
 *
 * @type {WeakMap<object, object>}
 */
const _vmState = new WeakMap();

/**
 * Global loader configuration state.
 */
const _config = {
	searchPaths: [...DEFAULT_SEARCH_PATHS],
	vfsLoader: null,
	urlFetcher: null,
	remoteBaseUrl: ''
};

/**
 * Pure-Lua bootstrap script installed into each configured Wasmoon Lua 5.1 VM.
 *
 * Key design features:
 * 1. Preserves standard Lua 5.1 `package.loaded`, `package.preload`, `package.path`,
 *    and `package.loaders` (and aliases `package.searchers = package.loaders`).
 * 2. Implements `require()`, `loadfile()`, and `dofile()` in pure Lua so that when
 *    executed inside an async Wasmoon coroutine (`lua.doString` / `lua.doFile`),
 *    missing unmounted modules can yield a JS Promise across `coroutine.yield`
 *    without hitting Lua 5.1's `attempt to yield across metamethod/C-call boundary`.
 * 3. Provides a coroutine-transparent `pcall` / `xpcall` wrapper when running inside
 *    a coroutine so `pcall(require, ...)` and `pcall(dofile, ...)` can also yield
 *    transparently during async module loading.
 * 4. Detects circular `require()` chains using a unique sentinel table and supports
 *    cooperative circular modules that assign `package.loaded[modname]` before
 *    requiring a dependent module.
 */
const LUA_BOOTSTRAP_SCRIPT = `
do
	local _raw_loadfile = _G.__ro_orig_loadfile or loadfile
	local _raw_dofile = _G.__ro_orig_dofile or dofile
	local _raw_pcall = _G.__ro_orig_pcall or pcall
	local _raw_xpcall = _G.__ro_orig_xpcall or xpcall

	_G.__ro_orig_loadfile = _raw_loadfile
	_G.__ro_orig_dofile = _raw_dofile
	_G.__ro_orig_pcall = _raw_pcall
	_G.__ro_orig_xpcall = _raw_xpcall

	package = package or {}
	package.loaded = package.loaded or {}
	package.preload = package.preload or {}
	package.loaders = package.loaders or {}
	package.searchers = package.loaders

	local _sentinel = {}

	local function pack_vararg(...)
		return { n = select('#', ...), ... }
	end

	-- Coroutine-safe pcall so yielding a JS Promise inside an async thread works across pcall
	pcall = function(fn, ...)
		if coroutine.running() == nil then
			return _raw_pcall(fn, ...)
		end
		if type(fn) ~= 'function' then
			local mt = getmetatable(fn)
			if not (mt and mt.__call) then
				return _raw_pcall(fn, ...)
			end
			local callable = fn
			fn = function(...)
				return callable(...)
			end
		end
		local co = coroutine.create(fn)
		local args = pack_vararg(...)
		while true do
			local res = pack_vararg(coroutine.resume(co, unpack(args, 1, args.n)))
			if not res[1] then
				return false, res[2]
			end
			if coroutine.status(co) == 'dead' then
				return unpack(res, 1, res.n)
			end
			args = pack_vararg(coroutine.yield(unpack(res, 2, res.n)))
		end
	end

	xpcall = function(fn, errhandler)
		if coroutine.running() == nil then
			return _raw_xpcall(fn, errhandler)
		end
		local res = pack_vararg(pcall(fn))
		if res[1] then
			return unpack(res, 1, res.n)
		end
		if type(errhandler) == 'function' then
			local ok, transformed = pcall(errhandler, res[2])
			if ok then
				return false, transformed
			end
			return false, transformed
		end
		return false, res[2]
	end

	-- Searcher 1: package.preload
	local function preload_searcher(modname)
		if type(package.preload) ~= 'table' then
			return "\\n\\t'package.preload' must be a table"
		end
		local loader = package.preload[modname]
		if loader == nil then
			return "\\n\\tno field package.preload['" .. tostring(modname) .. "']"
		end
		return loader
	end

	-- Searcher 2: roBrowserLegacy VFS / MemoryManager / Remote URL / MEMFS searcher
	local function vfs_searcher(modname)
		local is_async = coroutine.running() ~= nil
		local search_path = type(package.path) == 'string' and package.path or ''
		local resolved = __ro_resolve_module(modname, search_path, is_async)
		if (not resolved or not resolved.found) and is_async and (not resolved or resolved.needsAsync ~= false) then
			local promise = __ro_fetch_module_async(modname, search_path)
			if promise ~= nil then
				coroutine.yield(promise)
			end
			resolved = __ro_resolve_module(modname, search_path, false)
		end

		if not resolved or not resolved.found then
			if resolved and type(resolved.triedMessage) == 'string' and resolved.triedMessage ~= '' then
				return resolved.triedMessage
			end
			return "\\n\\tno file '" .. tostring(modname) .. "'"
		end

		local chunk, load_err = _raw_loadfile(resolved.memfsPath)
		if not chunk then
			error(
				"error loading module '" ..
					tostring(modname) ..
					"' from file '" ..
					tostring(resolved.candidate or resolved.memfsPath) ..
					"':\\n\\t" ..
					tostring(load_err),
				3
			)
		end
		return chunk
	end

	-- Install searchers (replacing native filesystem .lua and .so/.dll C loaders on first init)
	local existing_custom = {}
	if _G.__ro_loaders_initialized then
		for i = 3, #package.loaders do
			if type(package.loaders[i]) == 'function' then
				table.insert(existing_custom, package.loaders[i])
			end
		end
	end
	_G.__ro_loaders_initialized = true
	for i = #package.loaders, 1, -1 do
		package.loaders[i] = nil
	end
	package.loaders[1] = preload_searcher
	package.loaders[2] = vfs_searcher
	for i = 1, #existing_custom do
		package.loaders[i + 2] = existing_custom[i]
	end
	package.searchers = package.loaders

	-- Standard Lua 5.1 require() with circular-dependency detection and VFS/async support
	require = function(modname)
		if type(modname) ~= 'string' and type(modname) ~= 'number' then
			error("bad argument #1 to 'require' (string expected, got " .. type(modname) .. ")", 2)
		end
		modname = tostring(modname)

		local current = package.loaded[modname]
		if current == _sentinel then
			error("loop or previous error loading module '" .. modname .. "'", 2)
		end
		if current ~= nil and current ~= false then
			return current
		end

		local searchers = package.loaders or package.searchers
		if type(searchers) ~= 'table' then
			error("'package.loaders' must be a table", 2)
		end

		local errors = {}
		local loader = nil
		for i = 1, #searchers do
			local searcher = searchers[i]
			if type(searcher) == 'function' then
				local res = searcher(modname)
				if type(res) == 'function' then
					loader = res
					break
				elseif type(res) == 'string' then
					table.insert(errors, res)
				end
			end
		end

		if loader == nil then
			error("module '" .. modname .. "' not found:" .. table.concat(errors), 2)
		end

		package.loaded[modname] = _sentinel
		local ok, result = pcall(loader, modname)
		if not ok then
			if package.loaded[modname] == _sentinel then
				package.loaded[modname] = nil
			end
			error(result, 2)
		end

		if result ~= nil then
			package.loaded[modname] = result
		elseif package.loaded[modname] == nil or package.loaded[modname] == _sentinel then
			package.loaded[modname] = true
		end

		return package.loaded[modname]
	end

	-- VFS-aware loadfile()
	loadfile = function(filename)
		if filename == nil then
			return _raw_loadfile()
		end
		filename = tostring(filename)
		local is_async = coroutine.running() ~= nil
		local search_path = type(package.path) == 'string' and package.path or ''
		local resolved = __ro_resolve_file(filename, search_path, is_async)
		if (not resolved or not resolved.found) and is_async and (not resolved or resolved.needsAsync ~= false) then
			local promise = __ro_fetch_file_async(filename, search_path)
			if promise ~= nil then
				coroutine.yield(promise)
			end
			resolved = __ro_resolve_file(filename, search_path, false)
		end
		if resolved and resolved.found then
			return _raw_loadfile(resolved.memfsPath)
		end
		return _raw_loadfile(filename)
	end

	-- VFS-aware dofile()
	dofile = function(filename)
		local chunk, err = loadfile(filename)
		if not chunk then
			error(err, 2)
		end
		return chunk()
	end
end
`;

class LuaModuleLoader {
	/**
	 * Default search path templates.
	 *
	 * @type {ReadonlyArray<string>}
	 */
	static DEFAULT_SEARCH_PATHS = DEFAULT_SEARCH_PATHS;

	/**
	 * Configure global module resolution behavior.
	 *
	 * @param {object} [options={}]
	 * @param {string|string[]} [options.searchPaths] - Replace global search paths
	 * @param {string|string[]} [options.prependSearchPaths] - Prepend search paths to existing list
	 * @param {string|string[]} [options.appendSearchPaths] - Append search paths to existing list
	 * @param {Function|null} [options.vfsLoader] - Custom VFS loader `(filename) => Promise<Uint8Array|ArrayBuffer|string>`
	 * @param {Function|null} [options.urlFetcher] - Custom URL fetcher `(url) => Promise<Uint8Array|ArrayBuffer|string>`
	 * @param {string} [options.remoteBaseUrl] - Optional remote base URL for fallback HTTP resolution
	 */
	static configure(options = {}) {
		if (options.searchPaths !== undefined) {
			_config.searchPaths = LuaModuleLoader.parseSearchPathsInput(options.searchPaths);
		}
		if (options.prependSearchPaths !== undefined) {
			const prepended = LuaModuleLoader.parseSearchPathsInput(options.prependSearchPaths);
			_config.searchPaths = LuaModuleLoader.dedupeArray([...prepended, ..._config.searchPaths]);
		}
		if (options.appendSearchPaths !== undefined) {
			const appended = LuaModuleLoader.parseSearchPathsInput(options.appendSearchPaths);
			_config.searchPaths = LuaModuleLoader.dedupeArray([..._config.searchPaths, ...appended]);
		}
		if (options.vfsLoader !== undefined) {
			_config.vfsLoader = options.vfsLoader;
			_vfsGeneration++;
			for (const key of _failureReasons.keys()) {
				if (!LuaModuleLoader.isRemoteUrl(key)) {
					_failureReasons.delete(key);
				}
			}
			for (const key of _inflight.keys()) {
				if (!LuaModuleLoader.isRemoteUrl(key)) {
					_inflight.delete(key);
				}
			}
		}
		if (options.urlFetcher !== undefined) {
			_config.urlFetcher = options.urlFetcher;
			_remoteGeneration++;
			for (const key of _failureReasons.keys()) {
				if (LuaModuleLoader.isRemoteUrl(key)) {
					_failureReasons.delete(key);
				}
			}
			for (const key of _inflight.keys()) {
				if (LuaModuleLoader.isRemoteUrl(key)) {
					_inflight.delete(key);
				}
			}
		}
		if (options.remoteBaseUrl !== undefined) {
			_config.remoteBaseUrl = options.remoteBaseUrl || '';
			_remoteGeneration++;
			for (const key of _failureReasons.keys()) {
				if (LuaModuleLoader.isRemoteUrl(key)) {
					_failureReasons.delete(key);
				}
			}
		}
	}

	/**
	 * Reset global configuration to defaults.
	 */
	static resetConfig() {
		_config.searchPaths = [...DEFAULT_SEARCH_PATHS];
		_config.vfsLoader = null;
		_config.urlFetcher = null;
		_config.remoteBaseUrl = '';
		_vfsGeneration++;
		_remoteGeneration++;
		_inflight.clear();
		_failureReasons.clear();
	}

	/**
	 * Clear internal module buffer, in-flight, and negative-lookup caches.
	 * Increments the VFS and remote cache generation tokens so any pending in-flight requests
	 * from a previous client/archive or remote session cannot repopulate the cache.
	 */
	static clearCache() {
		_vfsGeneration++;
		_remoteGeneration++;
		_bufferCache.clear();
		_inflight.clear();
		_failureReasons.clear();
		_lastClientLoadFile = Client.loadFile;
	}

	/**
	 * Invalidate negative lookup cache and drop stale in-flight VFS requests
	 * if `Client.loadFile` reference has changed. Increments `_vfsGeneration` so
	 * an older in-flight VFS request's late failure cannot repopulate negative cache entries.
	 */
	static syncClientLoaderState() {
		if (Client.loadFile !== _lastClientLoadFile) {
			_lastClientLoadFile = Client.loadFile;
			_vfsGeneration++;
			for (const key of _failureReasons.keys()) {
				if (!LuaModuleLoader.isRemoteUrl(key)) {
					_failureReasons.delete(key);
				}
			}
			for (const key of _inflight.keys()) {
				if (!LuaModuleLoader.isRemoteUrl(key)) {
					_inflight.delete(key);
				}
			}
		}
	}

	static toLocalUint8Array(input) {
		if (input instanceof Uint8Array) {
			return input;
		}
		if (ArrayBuffer.isView(input)) {
			const view = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
			const copy = new Uint8Array(view.length);
			copy.set(view);
			return copy;
		}
		if (
			input instanceof ArrayBuffer ||
			Object.prototype.toString.call(input) === '[object ArrayBuffer]' ||
			(input &&
				typeof input === 'object' &&
				typeof input.byteLength === 'number' &&
				typeof input.slice === 'function')
		) {
			const view = new Uint8Array(input);
			const copy = new Uint8Array(view.length);
			copy.set(view);
			return copy;
		}
		return null;
	}

	/**
	 * Decode a string value passed from Wasmoon Lua into JavaScript.
	 * In roBrowserLegacy's custom Wasmoon build, non-empty Lua strings arrive in JS callbacks
	 * as `Uint8Array` views into Wasm memory (`HEAPU8`).
	 *
	 * @param {Uint8Array|ArrayBuffer|string|number|null|undefined} value
	 * @returns {string}
	 */
	static decodeLuaString(value) {
		if (typeof value === 'string') {
			return value;
		}
		if (value === null || value === undefined) {
			return '';
		}
		const bytes = LuaModuleLoader.toLocalUint8Array(value);
		if (bytes) {
			return TextEncoding.decode(bytes, 'utf-8');
		}
		return String(value);
	}

	/**
	 * Convert raw file content (`Uint8Array`, `ArrayBuffer`, view, or `string`) to a `Uint8Array`.
	 * Strips a 3-byte UTF-8 BOM (`0xEF 0xBB 0xBF`) if present on text scripts while preserving
	 * binary `.lub` bytecode (`\x1bLua...`) and non-UTF-8 (EUC-KR / Windows-1252) byte sequences.
	 *
	 * @param {Uint8Array|ArrayBuffer|ArrayBufferView|string} data
	 * @returns {Uint8Array}
	 */
	static normalizeBuffer(data) {
		let bytes = LuaModuleLoader.toLocalUint8Array(data);
		if (bytes) {
			bytes = new Uint8Array(bytes);
		} else if (typeof data === 'string') {
			bytes = TextEncoding.encode(data, 'utf-8');
		} else {
			throw new Error(`Unsupported Lua module data type: ${typeof data}`);
		}

		// Strip 3-byte UTF-8 BOM (EF BB BF) if present; never strip Lua bytecode header (1B 4C 75 61)
		if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
			return bytes.subarray(3);
		}

		return bytes;
	}

	/**
	 * Check whether a buffer contains compiled Lua 5.1 binary bytecode (`\x1bLua`).
	 *
	 * @param {Uint8Array} bytes
	 * @returns {boolean}
	 */
	static isBinaryLub(bytes) {
		const buf = LuaModuleLoader.toLocalUint8Array(bytes);
		return Boolean(
			buf && buf.length >= 4 && buf[0] === 0x1b && buf[1] === 0x4c && buf[2] === 0x75 && buf[3] === 0x61
		);
	}

	/**
	 * Check if a target string is an HTTP(S) URL.
	 *
	 * @param {string} target
	 * @returns {boolean}
	 */
	static isRemoteUrl(target) {
		return typeof target === 'string' && /^https?:\/\//i.test(target.trim());
	}

	/**
	 * Deduplicate an array while preserving order.
	 *
	 * @template T
	 * @param {T[]} items
	 * @returns {T[]}
	 */
	static dedupeArray(items) {
		const seen = new Set();
		const out = [];
		for (const item of items) {
			if (item && !seen.has(item)) {
				seen.add(item);
				out.push(item);
			}
		}
		return out;
	}

	/**
	 * Parse search paths from a semicolon-delimited string or string array.
	 *
	 * @param {string|string[]} input
	 * @returns {string[]}
	 */
	static parseSearchPathsInput(input) {
		if (!input) {
			return [];
		}
		if (Array.isArray(input)) {
			const expanded = [];
			for (const entry of input) {
				if (typeof entry === 'string') {
					for (const part of entry.split(';')) {
						const trimmed = part.trim();
						if (trimmed) {
							expanded.push(trimmed);
						}
					}
				}
			}
			return LuaModuleLoader.dedupeArray(expanded);
		}
		if (typeof input === 'string') {
			return LuaModuleLoader.dedupeArray(
				input
					.split(';')
					.map(part => part.trim())
					.filter(Boolean)
			);
		}
		return [];
	}

	/**
	 * Format an array of search path templates into a Lua `package.path` string.
	 *
	 * @param {string[]} searchPaths
	 * @returns {string}
	 */
	static formatPackagePath(searchPaths) {
		return LuaModuleLoader.parseSearchPathsInput(searchPaths).join(';');
	}

	/**
	 * Resolve effective search paths for a Lua VM.
	 * Distinguishes an omitted `overrideSearchPaths` (`undefined`/`null`) from an
	 * explicitly empty path (`''` or `[]`), which returns `[]` to disable path-template lookups.
	 *
	 * @param {object} [lua] - Wasmoon Lua instance
	 * @param {string|string[]|null} [overrideSearchPaths] - Explicit search paths override
	 * @returns {string[]}
	 */
	static getSearchPaths(lua = null, overrideSearchPaths = undefined) {
		if (overrideSearchPaths !== undefined && overrideSearchPaths !== null) {
			return LuaModuleLoader.parseSearchPathsInput(overrideSearchPaths);
		}

		const configPaths = Configs.get('luaSearchPaths', null);
		const fromConfigs = configPaths ? LuaModuleLoader.parseSearchPathsInput(configPaths) : [];

		if (lua && _vmState.has(lua)) {
			const state = _vmState.get(lua);
			if (state && Array.isArray(state.searchPaths)) {
				return LuaModuleLoader.dedupeArray([...fromConfigs, ...state.searchPaths]);
			}
		}

		if (fromConfigs.length > 0) {
			return LuaModuleLoader.dedupeArray([...fromConfigs, ..._config.searchPaths]);
		}

		return [..._config.searchPaths];
	}

	/**
	 * Read the live `package.path` from a Lua VM (or format an explicit override if provided).
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string|string[]} [overrideSearchPaths]
	 * @returns {string}
	 */
	static getCurrentPackagePath(lua, overrideSearchPaths = undefined) {
		if (overrideSearchPaths !== undefined && overrideSearchPaths !== null) {
			return LuaModuleLoader.formatPackagePath(overrideSearchPaths);
		}
		if (lua && typeof lua.doStringSync === 'function') {
			const raw = lua.doStringSync(
				'return (type(package) == "table" and type(package.path) == "string") and package.path or ""'
			);
			return LuaModuleLoader.decodeLuaString(raw);
		}
		return LuaModuleLoader.formatPackagePath(LuaModuleLoader.getSearchPaths(lua));
	}

	/**
	 * Normalize a VFS path (converting backslashes to forward slashes, collapsing duplicate
	 * slashes, and stripping leading `./` or `/`).
	 *
	 * @param {string} rawPath
	 * @returns {string}
	 */
	static normalizeVfsPath(rawPath) {
		if (typeof rawPath !== 'string') {
			return '';
		}
		const trimmed = rawPath.trim();
		if (!trimmed) {
			return '';
		}
		if (LuaModuleLoader.isRemoteUrl(trimmed)) {
			return trimmed;
		}
		return trimmed
			.replace(/\\/g, '/')
			.replace(/\/+/g, '/')
			.replace(/^(?:\.\/)+/, '')
			.replace(/^\/+/, '');
	}

	/**
	 * Convert a canonical candidate path or remote URL into an Emscripten `MEMFS` path.
	 * Always returns an absolute POSIX path starting with `/`.
	 *
	 * @param {string} candidate
	 * @returns {string}
	 */
	static toMemfsPath(candidate) {
		if (LuaModuleLoader.isRemoteUrl(candidate)) {
			const sanitized = candidate
				.trim()
				.replace(/^https?:\/\//i, match => `${match.slice(0, -3).toLowerCase()}/`)
				.replace(/[?#*:<>|"\\]/g, '_')
				.replace(/\/+/g, '/');
			return `/__remote__/${sanitized}`;
		}
		const clean = LuaModuleLoader.normalizeVfsPath(candidate);
		return `/${clean}`;
	}

	/**
	 * Translate a Lua module identifier (e.g., `"module.submodule"`, `"AI\\Const.lua"`,
	 * `"./AI/Util"`, or `"https://example.com/script.lua"`) into an ordered list of
	 * candidate VFS paths and/or remote URLs according to configured search paths.
	 *
	 * @param {string} modname - Module name passed to `require()`
	 * @param {string|string[]} [searchPaths] - Search path templates (`package.path`)
	 * @param {object} [lua] - Optional Lua VM instance for VM-scoped default search paths
	 * @returns {string[]} Ordered list of unique candidate paths/URLs
	 */
	static resolveCandidates(modname, searchPaths = undefined, lua = null) {
		const raw = LuaModuleLoader.decodeLuaString(modname).trim();
		if (!raw) {
			return [];
		}

		const candidates = [];

		// 1. Direct remote URL: require("https://example.com/mod.lua")
		if (LuaModuleLoader.isRemoteUrl(raw)) {
			candidates.push(raw);
			const withoutQuery = raw.split(/[?#]/)[0];
			if (!/\.(lua|lub)$/i.test(withoutQuery) && raw === withoutQuery) {
				candidates.push(`${raw}.lua`);
				candidates.push(`${raw}.lub`);
			}
			return LuaModuleLoader.dedupeArray(candidates);
		}

		const templates = LuaModuleLoader.getSearchPaths(lua, searchPaths);
		if (templates.length === 0) {
			return [];
		}

		const normalized = LuaModuleLoader.normalizeVfsPath(raw);
		if (!normalized) {
			return [];
		}

		const extMatch = normalized.match(/\.(lua|lub)$/i);
		const hasExplicitExt = Boolean(extMatch);
		const explicitExt = hasExplicitExt ? extMatch[0].toLowerCase() : null;
		const baseWithoutExt = hasExplicitExt ? normalized.slice(0, -extMatch[0].length) : normalized;
		const dottedAsSlash = baseWithoutExt.replace(/\./g, '/').replace(/\/+/g, '/');

		// 2. If the caller explicitly provided `.lua` or `.lub` (e.g., `require("AI\\Const.lua")`),
		// prioritize the exact normalized path first.
		if (hasExplicitExt) {
			candidates.push(normalized);
			if (dottedAsSlash !== baseWithoutExt) {
				candidates.push(`${dottedAsSlash}${explicitExt}`);
			}

			// Also expand search path templates matching the explicit extension first
			for (const tpl of templates) {
				if (tpl.toLowerCase().endsWith(explicitExt)) {
					candidates.push(LuaModuleLoader.applyTemplate(tpl, baseWithoutExt));
					if (dottedAsSlash !== baseWithoutExt) {
						candidates.push(LuaModuleLoader.applyTemplate(tpl, dottedAsSlash));
					}
				}
			}
		}

		// 3. Expand all search path templates using dotted-to-slash module path
		for (const tpl of templates) {
			candidates.push(LuaModuleLoader.applyTemplate(tpl, dottedAsSlash));
			if (baseWithoutExt !== dottedAsSlash && baseWithoutExt.includes('/')) {
				candidates.push(LuaModuleLoader.applyTemplate(tpl, baseWithoutExt));
			}
		}

		// 4. If `remoteBaseUrl` is configured globally or in Configs, append remote URL fallbacks
		const remoteBase = _config.remoteBaseUrl || Configs.get('luaRemoteBaseUrl', '');
		if (remoteBase && LuaModuleLoader.isRemoteUrl(remoteBase)) {
			const baseClean = remoteBase.replace(/\/+$/, '');
			if (hasExplicitExt) {
				candidates.push(`${baseClean}/${normalized}`);
			} else {
				candidates.push(`${baseClean}/${dottedAsSlash}.lua`);
				candidates.push(`${baseClean}/${dottedAsSlash}.lub`);
			}
		}

		return LuaModuleLoader.dedupeArray(candidates);
	}

	/**
	 * Resolve candidate paths for direct file operations (`loadfile` / `dofile`).
	 * Prioritizes the exact normalized file path before falling back to search paths.
	 *
	 * @param {string} filename
	 * @param {string|string[]} [searchPaths]
	 * @param {object} [lua]
	 * @returns {string[]}
	 */
	static resolveFileCandidates(filename, searchPaths = undefined, lua = null) {
		const raw = LuaModuleLoader.decodeLuaString(filename).trim();
		if (!raw) {
			return [];
		}
		if (LuaModuleLoader.isRemoteUrl(raw)) {
			return [raw];
		}

		const normalized = LuaModuleLoader.normalizeVfsPath(raw);
		const candidates = [normalized];
		if (!/\.(lua|lub)$/i.test(normalized)) {
			candidates.push(`${normalized}.lua`);
			candidates.push(`${normalized}.lub`);
		}

		const moduleCandidates = LuaModuleLoader.resolveCandidates(normalized, searchPaths, lua);
		return LuaModuleLoader.dedupeArray([...candidates, ...moduleCandidates]);
	}

	/**
	 * Apply a single Lua `package.path` template (e.g. `"AI/?.lua"` or `"https://host/?.lua"`)
	 * to a normalized module path.
	 *
	 * @param {string} template
	 * @param {string} modPath
	 * @returns {string}
	 */
	static applyTemplate(template, modPath) {
		const replaced = template.replace(/\?/g, modPath);
		if (LuaModuleLoader.isRemoteUrl(replaced)) {
			return replaced.replace(/^(https?:\/\/)(.*)$/i, (_, proto, rest) => `${proto}${rest.replace(/\/+/g, '/')}`);
		}
		return LuaModuleLoader.normalizeVfsPath(replaced);
	}

	/**
	 * Check if a file exists at `memfsPath` inside a Wasmoon Lua VM's Emscripten `MEMFS`.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} memfsPath
	 * @returns {boolean}
	 */
	static hasMemfsFile(lua, memfsPath) {
		const fs = lua && lua.luaApi && lua.luaApi.module && lua.luaApi.module.FS;
		if (!fs || !memfsPath) {
			return false;
		}
		try {
			const stat = fs.stat(memfsPath);
			return Boolean(stat && fs.isFile(stat.mode));
		} catch (_err) {
			return false;
		}
	}

	/**
	 * Mount a `Uint8Array` buffer into a Wasmoon Lua VM's Emscripten `MEMFS`,
	 * creating parent directories as needed.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} memfsPath - Target path in MEMFS
	 * @param {Uint8Array|ArrayBuffer|string} data - Raw file content
	 * @returns {string} Normalized MEMFS path
	 */
	static mountBuffer(lua, memfsPath, data) {
		const fs = lua && lua.luaApi && lua.luaApi.module && lua.luaApi.module.FS;
		if (!fs) {
			throw new Error('Invalid Wasmoon Lua instance: missing Emscripten FS');
		}

		const bytes = LuaModuleLoader.normalizeBuffer(data);
		const cleanPath =
			'/' +
			memfsPath
				.replace(/\\/g, '/')
				.replace(/^(?:\.\/)+/, '')
				.replace(/^\/+/, '');
		const lastSlash = cleanPath.lastIndexOf('/');
		if (lastSlash > 0) {
			const dirSegments = cleanPath.slice(1, lastSlash).split('/').filter(Boolean);
			let currentDir = '';
			for (const segment of dirSegments) {
				currentDir += `/${segment}`;
				try {
					fs.mkdir(currentDir);
				} catch (_err) {
					// Directory already exists
				}
			}
		}

		fs.writeFile(cleanPath, bytes);
		const normalizedCandidate = LuaModuleLoader.normalizeVfsPath(cleanPath);
		if (normalizedCandidate) {
			_failureReasons.delete(normalizedCandidate);
		}
		return cleanPath;
	}

	/**
	 * Register a module/file buffer directly in the shared cache (and optionally mount into a VM).
	 *
	 * @param {string} candidatePath - VFS path or URL
	 * @param {Uint8Array|ArrayBuffer|string} data - Module content (`.lua` source or `.lub` bytecode)
	 * @param {object} [lua] - Optional Lua VM to immediately mount into
	 * @returns {Uint8Array}
	 */
	static registerModuleBuffer(candidatePath, data, lua = null) {
		const canonical = LuaModuleLoader.isRemoteUrl(candidatePath)
			? candidatePath.trim()
			: LuaModuleLoader.normalizeVfsPath(candidatePath);
		const bytes = LuaModuleLoader.normalizeBuffer(data);
		_bufferCache.set(canonical, bytes);
		_failureReasons.delete(canonical);
		if (lua) {
			const memfsPath = LuaModuleLoader.toMemfsPath(canonical);
			LuaModuleLoader.mountBuffer(lua, memfsPath, bytes);
		}
		return bytes;
	}

	/**
	 * Check whether a candidate has already been probed and confirmed missing
	 * in the current archive generation.
	 *
	 * @param {object|null} lua - Wasmoon Lua instance
	 * @param {string} candidate - Canonical candidate path or URL
	 * @returns {boolean}
	 */
	static isKnownMissing(lua, candidate) {
		LuaModuleLoader.syncClientLoaderState();
		if (LuaModuleLoader.isRemoteUrl(candidate)) {
			return false;
		}
		if (!_failureReasons.has(candidate)) {
			return false;
		}
		const memfsPath = LuaModuleLoader.toMemfsPath(candidate);
		if ((lua && LuaModuleLoader.hasMemfsFile(lua, memfsPath)) || _bufferCache.has(candidate)) {
			_failureReasons.delete(candidate);
			return false;
		}
		if (
			MemoryManager.exist(candidate) &&
			MemoryManager.get(candidate) !== null &&
			MemoryManager.get(candidate) !== undefined
		) {
			_failureReasons.delete(candidate);
			return false;
		}
		return true;
	}

	/**
	 * Attempt to resolve a single candidate synchronously from:
	 * 1. The Lua VM's Emscripten `MEMFS`
	 * 2. `LuaModuleLoader`'s shared `_bufferCache`
	 * 3. `MemoryManager` (if already loaded into roBrowserLegacy's asset memory cache)
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} candidate - Candidate VFS path or remote URL
	 * @returns {{ found: boolean, memfsPath?: string, candidate: string, source?: string }}
	 */
	static resolveCandidateSync(lua, candidate) {
		const memfsPath = LuaModuleLoader.toMemfsPath(candidate);

		// 1. Check VM's Emscripten MEMFS directly
		if (LuaModuleLoader.hasMemfsFile(lua, memfsPath)) {
			return { found: true, memfsPath, candidate, source: 'memfs' };
		}
		if (!LuaModuleLoader.isRemoteUrl(candidate)) {
			const relDotPath = `./${candidate}`;
			if (LuaModuleLoader.hasMemfsFile(lua, relDotPath)) {
				return { found: true, memfsPath: relDotPath, candidate, source: 'memfs' };
			}
		}

		// 2. Check LuaModuleLoader's shared binary buffer cache
		if (_bufferCache.has(candidate)) {
			const cachedBytes = _bufferCache.get(candidate);
			const mountedPath = LuaModuleLoader.mountBuffer(lua, memfsPath, cachedBytes);
			return { found: true, memfsPath: mountedPath, candidate, source: 'cache' };
		}

		// 3. Check roBrowserLegacy's MemoryManager cache (for VFS paths)
		if (!LuaModuleLoader.isRemoteUrl(candidate) && MemoryManager.exist(candidate)) {
			const memData = MemoryManager.get(candidate);
			if (memData !== null && memData !== undefined) {
				const bytes = LuaModuleLoader.normalizeBuffer(memData);
				_bufferCache.set(candidate, bytes);
				_failureReasons.delete(candidate);
				const mountedPath = LuaModuleLoader.mountBuffer(lua, memfsPath, bytes);
				return { found: true, memfsPath: mountedPath, candidate, source: 'memory' };
			}
		}

		return { found: false, candidate };
	}

	/**
	 * Format a standard Lua `package.loaders` diagnostic message for a list of tried candidates.
	 *
	 * @param {string[]} candidates
	 * @returns {string}
	 */
	static formatTriedMessage(candidates) {
		if (!candidates || candidates.length === 0) {
			return "\n\tno file ''";
		}
		return candidates
			.map(candidate => {
				const reason = _failureReasons.get(candidate);
				if (reason && LuaModuleLoader.isRemoteUrl(candidate)) {
					return `\n\tno file '${candidate}' (${reason})`;
				}
				return `\n\tno file '${candidate}'`;
			})
			.join('');
	}

	/**
	 * Synchronously resolve a module name across all configured candidate paths.
	 * When `options.asyncMode` is `true`, stops at the first uncached candidate that
	 * has not yet been checked asynchronously so a lower-priority cached candidate
	 * never overrides a higher-priority uncached `package.path` entry.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string|Uint8Array} modname - Module name
	 * @param {string|Uint8Array} [searchPathStr] - Current `package.path` from Lua
	 * @param {object} [options={}]
	 * @param {boolean} [options.asyncMode=false] - Whether caller can yield to fetch unchecked candidates
	 * @returns {{ found: boolean, needsAsync?: boolean, memfsPath?: string, candidate?: string, source?: string, candidates: string[], triedMessage?: string }}
	 */
	static resolveModuleSync(lua, modname, searchPathStr = undefined, options = {}) {
		const decodedMod = LuaModuleLoader.decodeLuaString(modname);
		const decodedSearch =
			searchPathStr === undefined || searchPathStr === null
				? undefined
				: LuaModuleLoader.decodeLuaString(searchPathStr);
		const candidates = LuaModuleLoader.resolveCandidates(decodedMod, decodedSearch, lua);
		const asyncMode = Boolean(options && options.asyncMode);

		for (const candidate of candidates) {
			const res = LuaModuleLoader.resolveCandidateSync(lua, candidate);
			if (res.found) {
				return {
					found: true,
					needsAsync: false,
					memfsPath: res.memfsPath,
					candidate: res.candidate,
					source: res.source,
					candidates
				};
			}
			if (asyncMode && !LuaModuleLoader.isKnownMissing(lua, candidate)) {
				return {
					found: false,
					needsAsync: true,
					candidates,
					triedMessage: LuaModuleLoader.formatTriedMessage(candidates)
				};
			}
		}

		return {
			found: false,
			needsAsync: false,
			candidates,
			triedMessage: LuaModuleLoader.formatTriedMessage(candidates)
		};
	}

	/**
	 * Synchronously resolve a direct file path (`loadfile` / `dofile`).
	 * When `options.asyncMode` is `true`, stops at the first uncached candidate that
	 * has not yet been checked asynchronously.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string|Uint8Array} filename - File path or URL
	 * @param {string|Uint8Array} [searchPathStr] - Current `package.path` from Lua
	 * @param {object} [options={}]
	 * @param {boolean} [options.asyncMode=false] - Whether caller can yield to fetch unchecked candidates
	 * @returns {{ found: boolean, needsAsync?: boolean, memfsPath?: string, candidate?: string, source?: string, candidates: string[], triedMessage?: string }}
	 */
	static resolveFileSync(lua, filename, searchPathStr = undefined, options = {}) {
		const decodedFile = LuaModuleLoader.decodeLuaString(filename);
		const decodedSearch =
			searchPathStr === undefined || searchPathStr === null
				? undefined
				: LuaModuleLoader.decodeLuaString(searchPathStr);
		const candidates = LuaModuleLoader.resolveFileCandidates(decodedFile, decodedSearch, lua);
		const asyncMode = Boolean(options && options.asyncMode);

		for (const candidate of candidates) {
			const res = LuaModuleLoader.resolveCandidateSync(lua, candidate);
			if (res.found) {
				return {
					found: true,
					needsAsync: false,
					memfsPath: res.memfsPath,
					candidate: res.candidate,
					source: res.source,
					candidates
				};
			}
			if (asyncMode && !LuaModuleLoader.isKnownMissing(lua, candidate)) {
				return {
					found: false,
					needsAsync: true,
					candidates,
					triedMessage: LuaModuleLoader.formatTriedMessage(candidates)
				};
			}
		}

		return {
			found: false,
			needsAsync: false,
			candidates,
			triedMessage: LuaModuleLoader.formatTriedMessage(candidates)
		};
	}

	/**
	 * Load a VFS candidate asynchronously through `Client.loadFile` (or configured `vfsLoader`).
	 *
	 * @param {string} candidate - Normalized VFS path
	 * @param {object} [options={}]
	 * @returns {Promise<Uint8Array>}
	 */
	static loadVfsCandidate(candidate, options = {}) {
		LuaModuleLoader.syncClientLoaderState();
		if (_bufferCache.has(candidate)) {
			return Promise.resolve(_bufferCache.get(candidate));
		}
		if (_inflight.has(candidate)) {
			return _inflight.get(candidate);
		}
		if (!options.vfsLoader && LuaModuleLoader.isKnownMissing(null, candidate)) {
			return Promise.reject(new Error(_failureReasons.get(candidate)));
		}

		const vfsLoader = options.vfsLoader || _config.vfsLoader;
		const generation = _vfsGeneration;

		const promise = new Promise((resolve, reject) => {
			if (typeof vfsLoader === 'function') {
				Promise.resolve()
					.then(() => vfsLoader(candidate))
					.then(data => {
						if (data === null || data === undefined) {
							throw new Error(`VFS file not found: ${candidate}`);
						}
						const bytes = LuaModuleLoader.normalizeBuffer(data);
						if (_vfsGeneration === generation) {
							_bufferCache.set(candidate, bytes);
							_failureReasons.delete(candidate);
						}
						resolve(bytes);
					})
					.catch(err => {
						const msg = (err && err.message) || String(err || 'VFS load failed');
						if (_vfsGeneration === generation) {
							_failureReasons.set(candidate, msg);
						}
						reject(new Error(msg));
					});
				return;
			}

			// If already cached in MemoryManager with valid data, resolve immediately
			if (MemoryManager.exist(candidate)) {
				const existing = MemoryManager.get(candidate);
				if (existing !== null && existing !== undefined) {
					const bytes = LuaModuleLoader.normalizeBuffer(existing);
					if (_vfsGeneration === generation) {
						_bufferCache.set(candidate, bytes);
						_failureReasons.delete(candidate);
					}
					resolve(bytes);
					return;
				}
			}

			let settled = false;
			const onSuccess = data => {
				if (settled) {
					return;
				}
				settled = true;
				try {
					if (_vfsGeneration !== generation) {
						MemoryManager.remove(null, candidate);
					}
					if (data === null || data === undefined) {
						const msg = `Empty VFS response for "${candidate}"`;
						if (_vfsGeneration === generation) {
							_failureReasons.set(candidate, msg);
						}
						reject(new Error(msg));
						return;
					}
					const bytes = LuaModuleLoader.normalizeBuffer(data);
					if (_vfsGeneration === generation) {
						_bufferCache.set(candidate, bytes);
						_failureReasons.delete(candidate);
					}
					resolve(bytes);
				} catch (err) {
					const msg = (err && err.message) || String(err);
					if (_vfsGeneration === generation) {
						_failureReasons.set(candidate, msg);
					}
					reject(err);
				}
			};

			const onError = err => {
				if (settled) {
					return;
				}
				settled = true;
				const msg = (err && err.message) || String(err || `File not found in VFS: ${candidate}`);
				if (_vfsGeneration === generation) {
					_failureReasons.set(candidate, msg);
				}
				reject(new Error(msg));
			};

			try {
				Client.loadFile(candidate, onSuccess, onError);
			} catch (err) {
				onError(err);
			}
		}).finally(() => {
			if (_inflight.get(candidate) === promise) {
				_inflight.delete(candidate);
			}
		});

		_inflight.set(candidate, promise);
		return promise;
	}

	/**
	 * Fetch a remote HTTP(S) URL candidate asynchronously using `fetch` (or configured `urlFetcher`).
	 * Validates HTTP status and rejects HTML error pages (e.g. SPA fallback index.html).
	 *
	 * @param {string} url - Remote HTTP(S) URL
	 * @param {object} [options={}]
	 * @returns {Promise<Uint8Array>}
	 */
	static fetchUrlCandidate(url, options = {}) {
		if (_bufferCache.has(url)) {
			return Promise.resolve(_bufferCache.get(url));
		}
		if (_inflight.has(url)) {
			return _inflight.get(url);
		}

		const urlFetcher = options.urlFetcher || _config.urlFetcher;
		const generation = _remoteGeneration;

		const promise = Promise.resolve()
			.then(async () => {
				let rawData;
				if (typeof urlFetcher === 'function') {
					rawData = await urlFetcher(url);
					if (rawData === null || rawData === undefined) {
						throw new Error(`Empty response from URL: ${url}`);
					}
				} else {
					if (typeof fetch !== 'function') {
						throw new Error(`Global fetch is not available to load URL: ${url}`);
					}
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							Accept: 'application/octet-stream, text/plain, */*'
						}
					});
					if (!response || !response.ok) {
						const status = response ? `${response.status} ${response.statusText}`.trim() : 'Network error';
						throw new Error(`HTTP ${status}`);
					}
					rawData = await response.arrayBuffer();
				}

				const bytes = LuaModuleLoader.normalizeBuffer(rawData);

				// Guard against servers returning an HTML 404/index fallback page with HTTP 200
				if (!LuaModuleLoader.isBinaryLub(bytes) && bytes.length > 0) {
					const preview = TextEncoding.decode(bytes.subarray(0, Math.min(bytes.length, 256)), 'utf-8')
						.trimStart()
						.toLowerCase();
					if (preview.startsWith('<!doctype html') || preview.startsWith('<html')) {
						throw new Error('Server returned HTML page instead of Lua/LUB module');
					}
				}

				if (_remoteGeneration === generation) {
					_bufferCache.set(url, bytes);
					_failureReasons.delete(url);
				}
				return bytes;
			})
			.catch(err => {
				const msg = (err && err.message) || String(err || 'Remote fetch failed');
				if (_remoteGeneration === generation) {
					_failureReasons.set(url, msg);
				}
				throw new Error(msg);
			})
			.finally(() => {
				if (_inflight.get(url) === promise) {
					_inflight.delete(url);
				}
			});

		_inflight.set(url, promise);
		return promise;
	}

	/**
	 * Load a single candidate from either a remote URL or VFS.
	 *
	 * @param {string} candidate
	 * @param {object} [options={}]
	 * @returns {Promise<Uint8Array>}
	 */
	static loadCandidateData(candidate, options = {}) {
		if (LuaModuleLoader.isRemoteUrl(candidate)) {
			return LuaModuleLoader.fetchUrlCandidate(candidate, options);
		}
		return LuaModuleLoader.loadVfsCandidate(candidate, options);
	}

	/**
	 * Asynchronously resolve and mount a module (or direct file) across its candidate list
	 * in strict search-path order (checking each candidate synchronously first, then asynchronously
	 * before advancing to the next candidate), and recursively preload any static dependencies
	 * discovered in `.lua` source text.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string|Uint8Array} target - Module name or file path
	 * @param {string|Uint8Array} [searchPathStr] - Lua `package.path` string
	 * @param {object} [options={}]
	 * @param {boolean} [options.isFile=false] - Whether `target` is a direct file (`loadfile`/`dofile`)
	 * @param {boolean} [options.preloadNested=true] - Whether to recursively preload static dependencies
	 * @param {Set<string>} [options.visited] - Internal cycle-prevention set for nested preloading
	 * @returns {Promise<{ found: boolean, memfsPath?: string, candidate?: string, source?: string, candidates: string[], triedMessage?: string }>}
	 */
	static async fetchModuleAsync(lua, target, searchPathStr = undefined, options = {}) {
		const decodedTarget = LuaModuleLoader.decodeLuaString(target);
		const decodedSearch =
			searchPathStr === undefined || searchPathStr === null
				? undefined
				: LuaModuleLoader.decodeLuaString(searchPathStr);
		const isFile = Boolean(options.isFile);
		const preloadNested = options.preloadNested !== false;
		const visited = options.visited || new Set();

		const candidates = isFile
			? LuaModuleLoader.resolveFileCandidates(decodedTarget, decodedSearch, lua)
			: LuaModuleLoader.resolveCandidates(decodedTarget, decodedSearch, lua);

		for (const candidate of candidates) {
			// 1. Check if this candidate is already available synchronously (MEMFS, cache, MemoryManager)
			const syncRes = LuaModuleLoader.resolveCandidateSync(lua, candidate);
			if (syncRes.found) {
				if (preloadNested && !visited.has(candidate)) {
					visited.add(candidate);
					let cachedBytes = _bufferCache.get(candidate);
					if (!cachedBytes && lua?.luaApi?.module?.FS && syncRes.memfsPath) {
						try {
							cachedBytes = lua.luaApi.module.FS.readFile(syncRes.memfsPath);
						} catch (_err) {
							cachedBytes = null;
						}
					}
					if (cachedBytes && !LuaModuleLoader.isBinaryLub(cachedBytes)) {
						await LuaModuleLoader.preloadDependenciesFromBuffer(lua, cachedBytes, decodedSearch, {
							...options,
							visited
						});
					}
				}
				return {
					found: true,
					memfsPath: syncRes.memfsPath,
					candidate: syncRes.candidate,
					source: syncRes.source,
					candidates
				};
			}

			// 2. Skip known-missing VFS candidates immediately to avoid repeated VFS lookups
			if (
				!options.vfsLoader &&
				!LuaModuleLoader.isRemoteUrl(candidate) &&
				LuaModuleLoader.isKnownMissing(lua, candidate)
			) {
				continue;
			}

			// 3. Otherwise attempt to fetch this candidate asynchronously before moving to the next
			try {
				const bytes = await LuaModuleLoader.loadCandidateData(candidate, options);
				const memfsPath = LuaModuleLoader.toMemfsPath(candidate);
				const mountedPath = LuaModuleLoader.mountBuffer(lua, memfsPath, bytes);

				if (Configs.get('debugAI', false)) {
					console.log(`[LuaModuleLoader] Loaded "${candidate}" -> "${mountedPath}"`);
				}

				if (preloadNested && !visited.has(candidate)) {
					visited.add(candidate);
					if (!LuaModuleLoader.isBinaryLub(bytes)) {
						await LuaModuleLoader.preloadDependenciesFromBuffer(lua, bytes, decodedSearch, {
							...options,
							visited
						});
					}
				}

				return {
					found: true,
					memfsPath: mountedPath,
					candidate,
					source: LuaModuleLoader.isRemoteUrl(candidate) ? 'remote' : 'vfs',
					candidates
				};
			} catch (_err) {
				// Candidate not found or failed; continue to next candidate in search path order
			}
		}

		return {
			found: false,
			candidates,
			triedMessage: LuaModuleLoader.formatTriedMessage(candidates)
		};
	}

	/**
	 * Strip Lua block and single-line comments and extract static `require`, `dofile`,
	 * and `loadfile` string targets from Lua source code.
	 *
	 * @param {string} sourceText - Lua source code
	 * @returns {Array<{ type: 'require'|'dofile'|'loadfile', target: string }>}
	 */
	static extractDependencies(sourceText) {
		if (typeof sourceText !== 'string' || !sourceText) {
			return [];
		}

		// Strip block comments `--[[ ... ]]` / `--[=[ ... ]=]` and single-line comments `--...`
		const withoutComments = sourceText.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, '').replace(/--[^\r\n]*/g, '');

		const dependencies = [];
		const seen = new Set();

		const addDep = (fnType, rawTarget) => {
			const target = (rawTarget || '').trim();
			if (!target) {
				return;
			}
			if (OPTIONAL_RUNTIME_PATTERNS.some(opt => target.includes(opt))) {
				return;
			}
			const key = `${fnType}:${target}`;
			if (!seen.has(key)) {
				seen.add(key);
				dependencies.push({ type: fnType, target });
			}
		};

		const directPattern =
			/\b(require|dofile|loadfile)\s*(?:\(\s*(['"])([^'"\r\n]+)\2\s*\)|(['"])([^'"\r\n]+)\4|\(\s*\[\[([^\]]+)\]\s*\]\s*\)|\[\[([^\]]+)\]\])/g;

		let match;
		while ((match = directPattern.exec(withoutComments)) !== null) {
			const fnType = match[1];
			const target = match[3] || match[5] || match[6] || match[7];
			addDep(fnType, target);
		}

		const pcallPattern = /\bpcall\s*\(\s*(require|dofile|loadfile)\s*,\s*(['"])([^'"\r\n]+)\2\s*\)/g;
		while ((match = pcallPattern.exec(withoutComments)) !== null) {
			const fnType = match[1];
			const target = match[3];
			addDep(fnType, target);
		}

		return dependencies;
	}

	/**
	 * Recursively preload static dependencies discovered inside a `.lua` buffer.
	 * Missing optional/conditional dependencies do not reject preloading so that
	 * runtime `pcall(require, ...)` or conditional branches behave identically to standard Lua.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {Uint8Array} bytes - Raw `.lua` file buffer
	 * @param {string} [searchPathStr] - Lua `package.path` string
	 * @param {object} [options={}]
	 * @returns {Promise<void>}
	 */
	static async preloadDependenciesFromBuffer(lua, bytes, searchPathStr = undefined, options = {}) {
		if (!bytes || LuaModuleLoader.isBinaryLub(bytes)) {
			return;
		}
		const sourceText = TextEncoding.decode(bytes, 'utf-8');
		const deps = LuaModuleLoader.extractDependencies(sourceText);
		if (deps.length === 0) {
			return;
		}

		await Promise.all(
			deps.map(dep =>
				LuaModuleLoader.fetchModuleAsync(lua, dep.target, searchPathStr, {
					...options,
					isFile: dep.type === 'dofile' || dep.type === 'loadfile',
					preloadNested: true
				}).catch(() => null)
			)
		);
	}

	/**
	 * Preload all static `require`, `dofile`, and `loadfile` dependencies referenced in a Lua script string.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} luaCode - Lua source code string
	 * @param {object} [options={}]
	 * @returns {Promise<void>}
	 */
	static async preloadFromCode(lua, luaCode, options = {}) {
		LuaModuleLoader.ensureSetup(lua, options);
		const searchPathStr = LuaModuleLoader.getCurrentPackagePath(lua, options.searchPaths);
		const bytes = LuaModuleLoader.normalizeBuffer(luaCode);
		await LuaModuleLoader.preloadDependenciesFromBuffer(lua, bytes, searchPathStr, {
			...options,
			visited: new Set()
		});
	}

	/**
	 * Preload one or more module names or file paths (and their nested dependencies) into a Lua VM.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string|string[]} targets - Module name(s) or file path(s)
	 * @param {object} [options={}]
	 * @param {boolean} [options.isFile=false] - Treat targets as file paths
	 * @param {boolean} [options.strict=false] - Throw if any top-level target cannot be resolved
	 * @returns {Promise<Array<object>>}
	 */
	static async preload(lua, targets, options = {}) {
		LuaModuleLoader.ensureSetup(lua, options);
		const list = Array.isArray(targets) ? targets : [targets];
		const searchPathStr = LuaModuleLoader.getCurrentPackagePath(lua, options.searchPaths);
		const visited = new Set();

		const results = [];
		for (const target of list) {
			const res = await LuaModuleLoader.fetchModuleAsync(lua, target, searchPathStr, {
				...options,
				visited
			});
			if (!res.found && options.strict) {
				const err = new Error(`Failed to preload Lua resource "${target}":${res.triedMessage || ''}`);
				err.code = 'LUA_FILE_NOT_FOUND';
				throw err;
			}
			results.push(res);
		}
		return results;
	}

	/**
	 * Set up a Wasmoon `Lua` instance with `LuaModuleLoader`'s `require()`, `package.loaders`,
	 * `package.searchers`, `package.path`, `loadfile()`, and `dofile()` pipeline.
	 *
	 * Safe and idempotent to call multiple times on the same VM (updates search paths if provided).
	 *
	 * @param {object} lua - Wasmoon `Lua` instance
	 * @param {object} [options={}]
	 * @param {string|string[]} [options.searchPaths] - VM-specific search paths
	 * @returns {object} The configured `lua` instance
	 */
	static setup(lua, options = {}) {
		if (!lua || !lua.ctx || typeof lua.doStringSync !== 'function') {
			throw new Error('LuaModuleLoader.setup() requires a valid Wasmoon Lua instance');
		}

		const existingState = _vmState.get(lua);
		const hasExplicitSearchPaths = options.searchPaths !== undefined && options.searchPaths !== null;
		const searchPaths = hasExplicitSearchPaths
			? LuaModuleLoader.parseSearchPathsInput(options.searchPaths)
			: existingState && Array.isArray(existingState.searchPaths)
				? existingState.searchPaths
				: LuaModuleLoader.getSearchPaths();
		const configuredPackagePath = LuaModuleLoader.formatPackagePath(searchPaths);

		_vmState.set(lua, {
			initialized: true,
			searchPaths,
			configuredPackagePath,
			options
		});

		const ctx = lua.ctx;

		// Install JS bridge helpers into Lua global context
		ctx.__ro_resolve_module = (modname, searchPath, isAsync) => {
			return LuaModuleLoader.resolveModuleSync(lua, modname, searchPath, {
				asyncMode: Boolean(isAsync)
			});
		};

		ctx.__ro_fetch_module_async = (modname, searchPath) => {
			const syncCheck = LuaModuleLoader.resolveModuleSync(lua, modname, searchPath, {
				asyncMode: true
			});
			if (syncCheck.found || syncCheck.needsAsync === false) {
				return null;
			}
			return LuaModuleLoader.fetchModuleAsync(lua, modname, searchPath, options).then(() => true);
		};

		ctx.__ro_resolve_file = (filename, searchPath, isAsync) => {
			return LuaModuleLoader.resolveFileSync(lua, filename, searchPath, {
				asyncMode: Boolean(isAsync)
			});
		};

		ctx.__ro_fetch_file_async = (filename, searchPath) => {
			const syncCheck = LuaModuleLoader.resolveFileSync(lua, filename, searchPath, {
				asyncMode: true
			});
			if (syncCheck.found || syncCheck.needsAsync === false) {
				return null;
			}
			return LuaModuleLoader.fetchModuleAsync(lua, filename, searchPath, {
				...options,
				isFile: true
			}).then(() => true);
		};

		// Set `package.path` on first init or when explicit searchPaths are provided to setup()
		if (!existingState || !existingState.initialized || hasExplicitSearchPaths) {
			ctx.__ro_initial_package_path = configuredPackagePath;

			lua.doStringSync(`
				package = package or {}
				package.path = __ro_initial_package_path
				__ro_initial_package_path = nil
			`);
		}

		if (!existingState || !existingState.initialized) {
			lua.doStringSync(LUA_BOOTSTRAP_SCRIPT);
		}

		return lua;
	}

	/**
	 * Ensure `LuaModuleLoader.setup(lua)` has been called on the given VM without overwriting
	 * any runtime changes a Lua script may have made to `package.path`.
	 *
	 * @param {object} lua
	 * @param {object} [options={}]
	 */
	static ensureSetup(lua, options = {}) {
		const existingState = _vmState.get(lua);
		if (!existingState || !existingState.initialized) {
			LuaModuleLoader.setup(lua, options);
			return;
		}
		if (options.searchPaths !== undefined && options.searchPaths !== null) {
			const requestedPath = LuaModuleLoader.formatPackagePath(options.searchPaths);
			if (existingState.configuredPackagePath !== requestedPath) {
				LuaModuleLoader.setup(lua, options);
			}
		}
	}

	/**
	 * Asynchronously preload and `require(modname)` in a Lua VM, returning the module export.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} modname - Module name to require
	 * @param {object} [options={}]
	 * @returns {Promise<any>}
	 */
	static async requireAsync(lua, modname, options = {}) {
		LuaModuleLoader.ensureSetup(lua, options);
		const currentPackagePath = LuaModuleLoader.getCurrentPackagePath(lua);
		await LuaModuleLoader.fetchModuleAsync(lua, modname, currentPackagePath, options);
		lua.ctx.__ro_req_target = modname;
		try {
			return await lua.doString('local m = __ro_req_target; __ro_req_target = nil; return require(m)');
		} finally {
			lua.ctx.__ro_req_target = undefined;
		}
	}

	/**
	 * Asynchronously preload a file (and its dependencies) from VFS or URL and execute it in a Lua VM.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string} filename - File path or URL
	 * @param {object} [options={}]
	 * @returns {Promise<any>}
	 */
	static async doFileAsync(lua, filename, options = {}) {
		LuaModuleLoader.ensureSetup(lua, options);
		const currentPackagePath = LuaModuleLoader.getCurrentPackagePath(lua);
		const resolved = await LuaModuleLoader.fetchModuleAsync(lua, filename, currentPackagePath, {
			...options,
			isFile: true,
			preloadNested: true
		});
		if (!resolved.found) {
			const err = new Error(`Cannot open file '${filename}':${resolved.triedMessage || ' file not found'}`);
			err.code = 'LUA_FILE_NOT_FOUND';
			throw err;
		}
		lua.ctx.__ro_dofile_target = resolved.memfsPath;
		try {
			return await lua.doString('local f = __ro_dofile_target; __ro_dofile_target = nil; return dofile(f)');
		} finally {
			lua.ctx.__ro_dofile_target = undefined;
		}
	}

	/**
	 * Preload a list of files (and all nested `require`/`dofile`/`loadfile` dependencies)
	 * and execute them sequentially in the given Lua VM.
	 * Preserves any runtime modifications made to `package.path` by earlier files in `fileList`.
	 *
	 * @param {object} lua - Wasmoon Lua instance
	 * @param {string[]} fileList - Ordered list of files to preload and execute
	 * @param {object} [options={}]
	 * @returns {Promise<void>}
	 */
	static async loadAndExecuteFiles(lua, fileList, options = {}) {
		LuaModuleLoader.ensureSetup(lua, options);
		const runtimeOptions = { ...options };
		delete runtimeOptions.searchPaths;

		await LuaModuleLoader.preload(lua, fileList, {
			...runtimeOptions,
			isFile: true,
			strict: true
		});
		for (const file of fileList) {
			await LuaModuleLoader.doFileAsync(lua, file, runtimeOptions);
		}
	}
}

export default LuaModuleLoader;
