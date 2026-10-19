import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('Renderer/EntityManager.js', () => ({
	default: {
		get: vi.fn(() => null),
		forEach: vi.fn()
	}
}));

vi.mock('UI/UIManager.js', () => ({
	default: {
		getComponent: vi.fn(() => ({
			reqMoveToOwner: vi.fn(),
			reqMoveTo: vi.fn(),
			reqAttack: vi.fn()
		}))
	}
}));

vi.mock('DB/DBManager.js', () => ({
	default: {
		getHOAI_VM: vi.fn(),
		getMERAI_VM: vi.fn(),
		getDefaultHOAI_VM: vi.fn(),
		getDefaultMERAI_VM: vi.fn()
	}
}));

import CLua from 'Vendors/wasmoon-lua5.1.js';
import LuaModuleLoader from 'Core/LuaModuleLoader.js';
import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';
import MemoryManager from 'Core/MemoryManager.js';
import AIDriver from 'Core/AIDriver.js';
import DB from 'DB/DBManager.js';
import UIManager from 'UI/UIManager.js';

const wasmBytes = fs.readFileSync(path.resolve(process.cwd(), 'src/Vendors/liblua5.1.wasm'));
const wasmDataUri = `data:application/octet-stream;base64,${wasmBytes.toString('base64')}`;

async function createLuaVM(options = {}) {
	const lua = await CLua.Lua.create({ customWasmUri: wasmDataUri });
	return LuaModuleLoader.setup(lua, options);
}

describe('LuaModuleLoader', () => {
	let lua;

	beforeEach(async () => {
		LuaModuleLoader.resetConfig();
		LuaModuleLoader.clearCache();
		Configs.set('luaSearchPaths', null);
		Configs.set('luaRemoteBaseUrl', '');
		lua = await createLuaVM();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		if (lua && !lua.global.isClosed()) {
			lua.global.close();
		}
	});

	describe('Module name translation and search path configuration', () => {
		it('translates dotted module names into candidate paths across configured search paths', () => {
			const candidates = LuaModuleLoader.resolveCandidates('module.submodule', [
				'./?.lua',
				'./?.lub',
				'./?/init.lua',
				'AI/?.lua'
			]);

			expect(candidates).toEqual([
				'module/submodule.lua',
				'module/submodule.lub',
				'module/submodule/init.lua',
				'AI/module/submodule.lua'
			]);
		});

		it('handles Ragnarok Online backslash paths and explicit .lua/.lub extensions', () => {
			const luaCandidates = LuaModuleLoader.resolveCandidates('AI\\USER_AI\\Const.lua', [
				'./?.lua',
				'AI/USER_AI/?.lua'
			]);
			expect(luaCandidates[0]).toBe('AI/USER_AI/Const.lua');
			expect(luaCandidates).not.toContain('AI/USER_AI/Const/lua.lua');

			const lubCandidates = LuaModuleLoader.resolveCandidates('System\\itemInfo.lub', [
				'./?.lub',
				'System/?.lub'
			]);
			expect(lubCandidates[0]).toBe('System/itemInfo.lub');
		});

		it('respects dynamic changes to package.path inside Lua', async () => {
			const vfsFiles = {
				'custom_dir/deep/feature.lua': 'return { answer = 42 }'
			};
			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path in vfsFiles) {
						return vfsFiles[path];
					}
					throw new Error(`Not found: ${path}`);
				}
			});

			const result = await lua.doString(`
				package.path = "custom_dir/?.lua;" .. package.path
				local mod = require("deep.feature")
				return mod.answer
			`);

			expect(result).toBe(42);
		});

		it('extracts static require, dofile, and loadfile dependencies while ignoring comments', () => {
			const source = `
				-- require("commented.single")
				--[[
					require("commented.block")
					dofile("commented/file.lua")
				]]
				local a = require("pkg.alpha")
				require 'AI\\\\Const.lua'
				dofile("./AI/Util.lua")
				local chunk = loadfile("System/config.lub")
				pcall(function() dofile(AggressiveRelogPath) end)
			`;

			const deps = LuaModuleLoader.extractDependencies(source);
			expect(deps).toEqual([
				{ type: 'require', target: 'pkg.alpha' },
				{ type: 'require', target: 'AI\\\\Const.lua' },
				{ type: 'dofile', target: './AI/Util.lua' },
				{ type: 'loadfile', target: 'System/config.lub' }
			]);
		});
	});

	describe('Virtual File System (Client.loadFile & MemoryManager) integration', () => {
		it('loads a module from Client.loadFile VFS via require()', async () => {
			const loadFileSpy = vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename === 'AI/math_helper.lua') {
					onload(new TextEncoder().encode('return { add = function(a, b) return a + b end }'));
				} else {
					onerror(new Error(`File not found: ${filename}`));
				}
			});

			const sum = await lua.doString(`
				local helper = require("math_helper")
				return helper.add(19, 23)
			`);

			expect(sum).toBe(42);
			expect(loadFileSpy).toHaveBeenCalled();
		});

		it('resolves synchronously from MemoryManager without async network calls when already cached', () => {
			MemoryManager.set('System/sync_cached_mod.lua', 'SYNC_GLOBAL = 99; return { ok = true }');

			const res = lua.doStringSync(`
				local m = require("sync_cached_mod")
				return m.ok and SYNC_GLOBAL
			`);

			expect(res).toBe(99);
		});

		it('handles UTF-8 BOM and raw non-UTF-8 byte sequences in .lua modules', async () => {
			// Prepend UTF-8 BOM (0xEF, 0xBB, 0xBF)
			const body = new TextEncoder().encode('return { greeting = "hello_bom" }');
			const withBom = new Uint8Array(body.length + 3);
			withBom.set([0xef, 0xbb, 0xbf], 0);
			withBom.set(body, 3);

			LuaModuleLoader.registerModuleBuffer('bom_mod.lua', withBom, lua);

			const greetingBytes = lua.doStringSync(`
				local m = require("bom_mod")
				return m.greeting
			`);

			expect(LuaModuleLoader.decodeLuaString(greetingBytes)).toBe('hello_bom');
		});

		it('loads compiled .lub Lua 5.1 binary bytecode through the same resolution pipeline', async () => {
			// Generate genuine Lua 5.1 binary bytecode (.lub) using Lua's own string.dump + io.open
			lua.doStringSync(`
				local chunk = assert(loadstring([[
					local modname = ...
					LUB_LOADED_NAME = modname
					return {
						compute = function(x) return x * 7 end,
						tag = "compiled_lub"
					}
				]]))
				local f = assert(io.open("/__tmp_compiled.lub", "wb"))
				f:write(string.dump(chunk))
				f:close()
			`);
			const bytecodeBytes = lua.luaApi.module.FS.readFile('/__tmp_compiled.lub');
			lua.luaApi.module.FS.unlink('/__tmp_compiled.lub');

			expect(LuaModuleLoader.isBinaryLub(bytecodeBytes)).toBe(true);

			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename === 'System/compiled_test.lub') {
					onload(bytecodeBytes);
				} else {
					onerror(new Error(`Missing ${filename}`));
				}
			});

			const result = await lua.doString(`
				local m = require("compiled_test")
				return m.compute(6)
			`);

			expect(result).toBe(42);
			const loadedName = LuaModuleLoader.decodeLuaString(lua.doStringSync('return LUB_LOADED_NAME'));
			expect(loadedName).toBe('compiled_test');
		});
	});

	describe('Remote URL module resolution', () => {
		it('loads a module directly from a remote URL and caches it across require() calls', async () => {
			const fetchMock = vi.fn().mockImplementation(async url => {
				if (url === 'https://cdn.example.org/ro/scripts/remote_mod.lua') {
					const bytes = new TextEncoder().encode(`
						REMOTE_EXEC_COUNT = (REMOTE_EXEC_COUNT or 0) + 1
						return { version = "2.5.0", count = REMOTE_EXEC_COUNT }
					`);
					return {
						ok: true,
						status: 200,
						statusText: 'OK',
						arrayBuffer: async () => bytes.buffer
					};
				}
				return {
					ok: false,
					status: 404,
					statusText: 'Not Found'
				};
			});
			vi.stubGlobal('fetch', fetchMock);

			const count = await lua.doString(`
				local first = require("https://cdn.example.org/ro/scripts/remote_mod.lua")
				local second = require("https://cdn.example.org/ro/scripts/remote_mod.lua")
				assert(first == second, "Expected cached module table")
				return second.count
			`);

			expect(count).toBe(1);
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it('resolves dotted module names against remote URL search path templates', async () => {
			const fetchMock = vi.fn().mockImplementation(async url => {
				if (url === 'https://assets.example.org/lua/net/protocol.lua') {
					const bytes = new TextEncoder().encode('return { port = 6900 }');
					return {
						ok: true,
						status: 200,
						statusText: 'OK',
						arrayBuffer: async () => bytes.buffer
					};
				}
				return { ok: false, status: 404, statusText: 'Not Found' };
			});
			vi.stubGlobal('fetch', fetchMock);

			const port = await lua.doString(`
				package.path = "https://assets.example.org/lua/?.lua"
				local proto = require("net.protocol")
				return proto.port
			`);

			expect(port).toBe(6900);
		});

		it('rejects HTML error pages returned by remote servers with HTTP 200', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					status: 200,
					statusText: 'OK',
					arrayBuffer: async () => new TextEncoder().encode('<!DOCTYPE html><html><body>404</body></html>').buffer
				})
			);

			const caught = await lua.doString(`
				local ok, err = pcall(require, "https://assets.example.org/lua/missing.lua")
				assert(not ok, "Expected require to fail on HTML response")
				return tostring(err)
			`);

			expect(LuaModuleLoader.decodeLuaString(caught)).toContain('Server returned HTML page');
		});
	});

	describe('Standard Lua require() semantics, caching, and return values', () => {
		it('loads and executes a module only once when required multiple times', async () => {
			let vfsFetchCount = 0;
			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path === 'counter_mod.lua') {
						vfsFetchCount++;
						return `
							EXEC_COUNTER = (EXEC_COUNTER or 0) + 1
							return { runs = EXEC_COUNTER }
						`;
					}
					throw new Error('Not found');
				}
			});

			const runs = await lua.doString(`
				local a = require("counter_mod")
				local b = require("counter_mod")
				local c = require("counter_mod")
				assert(a == b and b == c)
				return c.runs
			`);

			expect(runs).toBe(1);
			expect(vfsFetchCount).toBe(1);
		});

		it('preserves module return values (tables, functions, primitives, nil -> true) and global state', async () => {
			LuaModuleLoader.configure({
				vfsLoader: path => {
					switch (path) {
						case 'ret_table.lua':
							return 'return { key = 123 }';
						case 'ret_func.lua':
							return 'return function(x) return x * 2 end';
						case 'ret_nil.lua':
							return 'GLOBAL_FROM_NIL_MOD = 777';
						default:
							throw new Error('Not found');
					}
				}
			});

			const result = await lua.doString(`
				local tbl = require("ret_table")
				local fn = require("ret_func")
				local nil_res = require("ret_nil")
				assert(tbl.key == 123)
				assert(fn(10) == 20)
				assert(nil_res == true)
				assert(package.loaded["ret_nil"] == true)
				return GLOBAL_FROM_NIL_MOD
			`);

			expect(result).toBe(777);
		});

		it('supports package.preload and custom searchers in package.loaders / package.searchers', () => {
			const res = lua.doStringSync(`
				assert(package.loaders == package.searchers, "package.searchers should alias package.loaders")
				package.preload["preloaded.mod"] = function(name)
					return { loadedFrom = "preload:" .. name }
				end

				table.insert(package.searchers, function(name)
					if name == "custom.dynamic" then
						return function()
							return { value = 314 }
						end
					end
					return "\\n\\tno custom module '" .. name .. "'"
				end)

				local p = require("preloaded.mod")
				local c = require("custom.dynamic")
				assert(p.loadedFrom == "preload:preloaded.mod")
				return c.value
			`);

			expect(res).toBe(314);
		});
	});

	describe('Missing modules, syntax errors, nested imports, and circular dependencies', () => {
		it('reports missing modules with standard Lua error messages and allows catching via pcall', async () => {
			LuaModuleLoader.configure({
				vfsLoader: () => {
					throw new Error('File does not exist');
				}
			});

			const errMsgBytes = await lua.doString(`
				local ok, err = pcall(require, "nonexistent.pkg")
				assert(ok == false)
				return err
			`);

			const errMsg = LuaModuleLoader.decodeLuaString(errMsgBytes);
			expect(errMsg).toContain("module 'nonexistent.pkg' not found:");
			expect(errMsg).toContain("no file 'nonexistent/pkg.lua'");
			expect(errMsg).toContain("no file 'nonexistent/pkg.lub'");
		});

		it('surfaces Lua syntax errors in loaded modules instead of masking them as missing', async () => {
			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path === 'broken_syntax.lua') {
						return 'local x = === invalid syntax !!!';
					}
					throw new Error('Not found');
				}
			});

			const errMsgBytes = await lua.doString(`
				local ok, err = pcall(require, "broken_syntax")
				assert(ok == false)
				return err
			`);

			const errMsg = LuaModuleLoader.decodeLuaString(errMsgBytes);
			expect(errMsg).toContain("error loading module 'broken_syntax' from file 'broken_syntax.lua'");
		});

		it('resolves deeply nested require() and dofile() module graphs', async () => {
			const files = {
				'pkg/root.lua': `
					local mid = require("pkg.middle")
					local extra = dofile("pkg/extra.lua")
					return { total = mid.value + extra }
				`,
				'pkg/middle.lua': `
					local leaf = require("pkg.leaf")
					return { value = leaf.base * 3 }
				`,
				'pkg/leaf.lua': `
					return { base = 10 }
				`,
				'pkg/extra.lua': `
					return 12
				`
			};

			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path in files) {
						return files[path];
					}
					throw new Error(`Missing ${path}`);
				}
			});

			const total = await lua.doString(`
				local root = require("pkg.root")
				return root.total
			`);

			expect(total).toBe(42);
		});

		it('detects uncooperative circular dependencies and raises a loop error', async () => {
			const files = {
				'cycle_a.lua': 'return require("cycle_b")',
				'cycle_b.lua': 'return require("cycle_a")'
			};

			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path in files) {
						return files[path];
					}
					throw new Error(`Missing ${path}`);
				}
			});

			const errMsgBytes = await lua.doString(`
				local ok, err = pcall(require, "cycle_a")
				assert(ok == false)
				return err
			`);

			const errMsg = LuaModuleLoader.decodeLuaString(errMsgBytes);
			expect(errMsg).toContain("loop or previous error loading module 'cycle_a'");
		});

		it('supports cooperative circular dependencies where package.loaded[modname] is pre-populated', async () => {
			const files = {
				'coop_a.lua': `
					local A = { name = "A" }
					package.loaded["coop_a"] = A
					local B = require("coop_b")
					A.partner = B.name
					return A
				`,
				'coop_b.lua': `
					local B = { name = "B" }
					package.loaded["coop_b"] = B
					local A = require("coop_a")
					B.partner = A.name
					return B
				`
			};

			LuaModuleLoader.configure({
				vfsLoader: path => {
					if (path in files) {
						return files[path];
					}
					throw new Error(`Missing ${path}`);
				}
			});

			const combinedBytes = await lua.doString(`
				local a = require("coop_a")
				local b = require("coop_b")
				return a.name .. "->" .. a.partner .. "," .. b.name .. "->" .. b.partner
			`);

			expect(LuaModuleLoader.decodeLuaString(combinedBytes)).toBe('A->B,B->A');
		});
	});

	describe('AIDriver compatibility with Ragnarok Online AI scripts', () => {
		it('initializes AIDriver and executes AI scripts that use require("AI\\\\Const.lua") and nested modules', async () => {
			const aiVfs = {
				'AI/Const.lua': `
					V_OWNER = 0
					V_POSITION = 1
					FOLLOW_ST = 1
				`,
				'AI/Util.lua': `
					require "AI\\\\Const.lua"
					List = {}
					function List.new()
						return { first = 0, last = -1 }
					end
				`,
				'AI/ExtraTactics.lua': `
					return {
						getFollowState = function()
							return FOLLOW_ST
						end
					}
				`,
				'AI/AI.lua': `
					require "AI\\\\Const.lua"
					require "AI\\\\Util.lua"
					local tactics = require("ExtraTactics")
					pcall(function() dofile("AI/USER_AI/AggressiveRelogPath.lua") end)
					MyState = tactics.getFollowState()
					function AI(myid)
						MoveToOwner(myid)
					end
				`,
				'AI/AI_M.lua': `
					require "AI\\\\Const.lua"
					require "AI\\\\Util.lua"
					MyState = FOLLOW_ST
					function AI(myid)
						MoveToOwner(myid)
					end
				`
			};

			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename in aiVfs) {
					onload(new TextEncoder().encode(aiVfs[filename]));
				} else {
					onerror(new Error(`Missing AI file: ${filename}`));
				}
			});

			const vms = await Promise.all([
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri })
			]);

			vi.spyOn(DB, 'getHOAI_VM').mockReturnValue(vms[0]);
			vi.spyOn(DB, 'getMERAI_VM').mockReturnValue(vms[1]);
			vi.spyOn(DB, 'getDefaultHOAI_VM').mockReturnValue(vms[2]);
			vi.spyOn(DB, 'getDefaultMERAI_VM').mockReturnValue(vms[3]);

			const reqMoveToOwner = vi.fn();
			vi.spyOn(UIManager, 'getComponent').mockReturnValue({
				reqMoveToOwner,
				reqMoveTo: vi.fn(),
				reqAttack: vi.fn()
			});

			try {
				let ended = false;
				await AIDriver.initAI(() => {
					ended = true;
				});

				expect(ended).toBe(true);
				expect(AIDriver.ready).toBe(true);

				AIDriver.exec('AI(1001)', true);
				expect(reqMoveToOwner).toHaveBeenCalledWith(1001);
			} finally {
				for (const vm of vms) {
					if (!vm.global.isClosed()) {
						vm.global.close();
					}
				}
			}
		});

		it('keeps custom Homunculus AI active when custom Mercenary AI files are missing, and distinguishes missing files from script errors', async () => {
			const aiVfs = {
				'AI/Const.lua': 'FOLLOW_ST = 1',
				'AI/Util.lua': 'List = {}',
				'AI/AI.lua': 'HO_SOURCE = "default"',
				'AI/AI_M.lua': 'MER_SOURCE = "default"',
				'AI/USER_AI/Const.lua': 'FOLLOW_ST = 2',
				'AI/USER_AI/Util.lua': 'List = {}',
				'AI/USER_AI/AI.lua': 'HO_SOURCE = "custom"'
				// Note: 'AI/USER_AI/AI_M.lua' is intentionally absent
			};

			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename in aiVfs) {
					onload(new TextEncoder().encode(aiVfs[filename]));
				} else {
					onerror(new Error(`Missing AI file: ${filename}`));
				}
			});

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const vms = await Promise.all([
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri }),
				CLua.Lua.create({ customWasmUri: wasmDataUri })
			]);

			vi.spyOn(DB, 'getHOAI_VM').mockReturnValue(vms[0]);
			vi.spyOn(DB, 'getMERAI_VM').mockReturnValue(vms[1]);
			vi.spyOn(DB, 'getDefaultHOAI_VM').mockReturnValue(vms[2]);
			vi.spyOn(DB, 'getDefaultMERAI_VM').mockReturnValue(vms[3]);

			try {
				await AIDriver.initAI();

				// Custom HO_AI succeeded and must NOT be replaced by default_HO_AI
				expect(AIDriver.HO_AI === vms[0]).toBe(true);
				expect(AIDriver.HO_AI !== AIDriver.default_HO_AI).toBe(true);
				// Custom MER_AI was missing and fell back to default_MER_AI
				expect(AIDriver.MER_AI === AIDriver.default_MER_AI).toBe(true);

				const hoSource = LuaModuleLoader.decodeLuaString(AIDriver.HO_AI.doStringSync('return HO_SOURCE'));
				expect(hoSource).toBe('custom');

				expect(warnSpy).toHaveBeenCalledWith(
					expect.stringContaining('[AIDriver] Custom MER USER_AI files not available'),
					expect.any(String)
				);
				expect(errorSpy).not.toHaveBeenCalled();

				// Now test when custom MER_AI exists but has a syntax/runtime error
				LuaModuleLoader.clearCache();
				aiVfs['AI/USER_AI/AI_M.lua'] = 'error("custom mercenary runtime failure")';
				await AIDriver.initAI();

				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('[AIDriver] Custom MER USER_AI failed to initialize'),
					expect.any(String)
				);
			} finally {
				for (const vm of vms) {
					if (!vm.global.isClosed()) {
						vm.global.close();
					}
				}
			}
		});
	});

	describe('Edge cases: search path ordering, empty package.path, script-modified paths, negative caching, and client switches', () => {
		it('prefers an earlier uncached search-path candidate over a later cached fallback candidate', async () => {
			// Pre-populate the fallback candidate in the shared buffer cache (e.g., from default AI)
			LuaModuleLoader.registerModuleBuffer('AI/Const.lua', 'return { source = "default_cached" }');

			// The preferred candidate exists in VFS but is not yet cached
			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename === 'AI/USER_AI/Const.lua') {
					onload(new TextEncoder().encode('return { source = "custom_vfs" }'));
				} else {
					onerror(new Error(`Missing: ${filename}`));
				}
			});

			const customVM = await createLuaVM({
				searchPaths: ['AI/USER_AI/?.lua', 'AI/?.lua']
			});

			try {
				const sourceBytes = await customVM.doString(`
					local c = require("Const")
					return c.source
				`);
				expect(LuaModuleLoader.decodeLuaString(sourceBytes)).toBe('custom_vfs');
			} finally {
				if (!customVM.global.isClosed()) {
					customVM.global.close();
				}
			}
		});

		it('disables path-template resolution when Lua sets package.path to an empty string', async () => {
			LuaModuleLoader.registerModuleBuffer('AI/Const.lua', 'return { ok = true }');

			const errBytes = await lua.doString(`
				package.path = ""
				local ok, err = pcall(require, "Const")
				assert(ok == false, "Expected require to fail when package.path is empty")
				return tostring(err)
			`);

			expect(LuaModuleLoader.decodeLuaString(errBytes)).toContain("module 'Const' not found");
		});

		it('preserves package.path modifications made by earlier files during loadAndExecuteFiles', async () => {
			const vfsFiles = {
				'AI/Util.lua': 'package.path = "Mods/?.lua;" .. package.path',
				'AI/Const.lua': 'CONST_READY = true',
				'AI/AI.lua': 'local tactics = require("tactics"); TACTIC_NAME = tactics.name',
				'Mods/tactics.lua': 'return { name = "aggressive_kite" }'
			};

			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename in vfsFiles) {
					onload(new TextEncoder().encode(vfsFiles[filename]));
				} else {
					onerror(new Error(`Missing: ${filename}`));
				}
			});

			await LuaModuleLoader.loadAndExecuteFiles(lua, ['AI/Util.lua', 'AI/Const.lua', 'AI/AI.lua'], {
				searchPaths: ['./?.lua', 'AI/?.lua']
			});

			const tacticName = LuaModuleLoader.decodeLuaString(lua.doStringSync('return TACTIC_NAME'));
			expect(tacticName).toBe('aggressive_kite');
		});

		it('does not repeat VFS scans for known-missing optional dependencies after preloading', async () => {
			const vfsFiles = {
				'AI/MainScript.lua': `
					local ok, _ = pcall(require, "AbsentOptionalMod")
					OPT_OK = ok
				`
			};

			const loadSpy = vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename in vfsFiles) {
					onload(new TextEncoder().encode(vfsFiles[filename]));
				} else {
					onerror(new Error(`Missing: ${filename}`));
				}
			});

			await LuaModuleLoader.doFileAsync(lua, 'AI/MainScript.lua');
			const callsAfterFirstRun = loadSpy.mock.calls.filter(c => c[0].includes('AbsentOptionalMod')).length;
			expect(callsAfterFirstRun).toBeGreaterThan(0);

			// A subsequent runtime pcall(require, "AbsentOptionalMod") should hit the negative cache without rescanning VFS
			await lua.doString('local ok, _ = pcall(require, "AbsentOptionalMod"); return ok');
			const callsAfterSecondRun = loadSpy.mock.calls.filter(c => c[0].includes('AbsentOptionalMod')).length;
			expect(callsAfterSecondRun).toBe(callsAfterFirstRun);
		});

		it('discards stale in-flight requests from a previous client archive after clearCache()', async () => {
			let pendingArchiveACallback = null;

			vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload) => {
				if (!pendingArchiveACallback) {
					// First archive request stays in-flight across client switch
					pendingArchiveACallback = () => {
						onload(new TextEncoder().encode('return { archive = "A" }'));
					};
				} else {
					onload(new TextEncoder().encode('return { archive = "B" }'));
				}
			});

			// Start loading from Client A (remains in-flight)
			const inflightPromiseA = LuaModuleLoader.loadVfsCandidate('AI/AI.lua');

			// Switch client archive -> clears cache and increments generation
			LuaModuleLoader.clearCache();

			// Client A's late response arrives after clearCache()
			pendingArchiveACallback();
			await inflightPromiseA;

			// Now load in a new VM for Client B: must fetch Client B's version, not Client A's stale bytes
			const vmB = await createLuaVM();
			try {
				const archiveBytes = await vmB.doString('return require("AI").archive');
				expect(LuaModuleLoader.decodeLuaString(archiveBytes)).toBe('B');
			} finally {
				if (!vmB.global.isClosed()) {
					vmB.global.close();
				}
			}
		});

		it('retries remote URL after a temporary network failure and loads the module once the server recovers without clearing cache', async () => {
			let failCount = 0;
			const remoteUrl = 'https://remote.example.com/lua/service.lua';

			LuaModuleLoader.configure({
				urlFetcher: async url => {
					if (url === remoteUrl) {
						if (failCount === 0) {
							failCount++;
							throw new Error('HTTP 503 Service Unavailable');
						}
						return new TextEncoder().encode('return { status = "recovered" }');
					}
					throw new Error(`Unexpected URL: ${url}`);
				}
			});

			// First attempt fails due to temporary 503
			await expect(
				lua.doString(`
					package.path = "https://remote.example.com/lua/?.lua"
					return require("service")
				`)
			).rejects.toThrow();

			// Second attempt after server recovers succeeds without calling clearCache()
			const resBytes = await lua.doString(`
				package.path = "https://remote.example.com/lua/?.lua"
				local svc = require("service")
				return svc.status
			`);
			expect(LuaModuleLoader.decodeLuaString(resBytes)).toBe('recovered');
		});

		it('replaces Client.loadFile without allowing an old in-flight request late failure to poison negative cache or block the new loader', async () => {
			let triggerOldLoaderFailure = null;

			// Initial loader starts request and stays in-flight
			const oldLoader = vi.fn((filename, onload, onerror) => {
				triggerOldLoaderFailure = () => onerror(new Error(`Old loader missing: ${filename}`));
			});
			Client.loadFile = oldLoader;

			const targetFile = 'AI/USER_AI/LateFailureMod.lua';
			const oldPromise = LuaModuleLoader.loadVfsCandidate(targetFile).catch(err => err);

			// Client.loadFile is replaced with a new loader before the old request completes
			const newLoader = vi.fn((filename, onload) => {
				onload(new TextEncoder().encode('return { activeLoader = "new" }'));
			});
			Client.loadFile = newLoader;

			// Old request fails late
			expect(typeof triggerOldLoaderFailure).toBe('function');
			triggerOldLoaderFailure();
			await oldPromise;

			// The replacement loader should not be blocked by the old loader's late failure
			const customVM = await createLuaVM({ searchPaths: ['AI/USER_AI/?.lua'] });
			try {
				const resBytes = await customVM.doString('return require("LateFailureMod").activeLoader');
				expect(LuaModuleLoader.decodeLuaString(resBytes)).toBe('new');
				expect(newLoader).toHaveBeenCalled();
			} finally {
				if (!customVM.global.isClosed()) {
					customVM.global.close();
				}
			}
		});

		it('skips known-missing VFS candidate paths without re-invoking Client.loadFile during preloading and runtime', async () => {
			const vfsFiles = {
				'AI/ScriptA.lua': 'local ok, _ = pcall(require, "AbsentSharedMod")',
				'AI/ScriptB.lua': 'local ok, _ = pcall(require, "AbsentSharedMod")'
			};

			const loadSpy = vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload, onerror) => {
				if (filename in vfsFiles) {
					onload(new TextEncoder().encode(vfsFiles[filename]));
				} else {
					onerror(new Error(`Missing: ${filename}`));
				}
			});

			// Preload ScriptA: probes candidates for AbsentSharedMod
			await LuaModuleLoader.preload(lua, 'AI/ScriptA.lua', { isFile: true });
			const callsAfterScriptA = loadSpy.mock.calls.filter(c => c[0].includes('AbsentSharedMod')).length;
			expect(callsAfterScriptA).toBeGreaterThan(0);

			// Preload ScriptB: should skip known-missing VFS candidates without adding new Client.loadFile calls
			await LuaModuleLoader.preload(lua, 'AI/ScriptB.lua', { isFile: true });
			const callsAfterScriptB = loadSpy.mock.calls.filter(c => c[0].includes('AbsentSharedMod')).length;
			expect(callsAfterScriptB).toBe(callsAfterScriptA);

			// Runtime execution of ScriptA and ScriptB should also not repeat VFS scans
			await LuaModuleLoader.doFileAsync(lua, 'AI/ScriptA.lua');
			await LuaModuleLoader.doFileAsync(lua, 'AI/ScriptB.lua');
			const callsAfterExec = loadSpy.mock.calls.filter(c => c[0].includes('AbsentSharedMod')).length;
			expect(callsAfterExec).toBe(callsAfterScriptA);
		});

		it('does not cross-invalidate in-flight VFS requests when configuring a new remote urlFetcher', async () => {
			let completeVfsLoad = null;

			const loadSpy = vi.spyOn(Client, 'loadFile').mockImplementation((filename, onload) => {
				completeVfsLoad = () => {
					MemoryManager.set(filename, new TextEncoder().encode('return { fromVfs = true }'));
					onload(new TextEncoder().encode('return { fromVfs = true }'));
				};
			});
			loadSpy.mockClear();

			// Start loading AI/Const.lua through Client.loadFile (stays in-flight)
			const vfsPromise = LuaModuleLoader.loadVfsCandidate('AI/Const.lua');

			// Configure a new URL fetcher before the VFS callback runs
			LuaModuleLoader.configure({
				urlFetcher: async () => new TextEncoder().encode('return { url = true }')
			});

			// The VFS callback returns valid bytes
			expect(typeof completeVfsLoad).toBe('function');
			completeVfsLoad();
			const bytes = await vfsPromise;
			expect(bytes).toBeDefined();

			// MemoryManager should still retain the file and buffer cache must have it
			expect(MemoryManager.exist('AI/Const.lua')).toBe(true);

			const newVM = await createLuaVM();
			try {
				const fromVfs = await newVM.doString('return require("AI/Const.lua").fromVfs');
				expect(fromVfs).toBe(true);
				expect(loadSpy).toHaveBeenCalledTimes(1);
			} finally {
				if (!newVM.global.isClosed()) {
					newVM.global.close();
				}
			}
		});

		it('does not cross-invalidate in-flight remote requests when replacing Client.loadFile or configuring vfsLoader', async () => {
			let completeRemoteFetch = null;
			let remoteCalls = 0;
			const remoteUrl = 'https://remote.example.com/lua/async_mod.lua';

			LuaModuleLoader.configure({
				urlFetcher: async url => {
					remoteCalls++;
					if (url === remoteUrl) {
						return new Promise(resolve => {
							completeRemoteFetch = () => resolve(new TextEncoder().encode('return { fromRemote = true }'));
						});
					}
					throw new Error(`Unexpected URL: ${url}`);
				}
			});

			// Start loading remote URL (stays in-flight)
			const remotePromise = LuaModuleLoader.fetchUrlCandidate(remoteUrl);
			await Promise.resolve();

			// Client.loadFile is replaced while remote request is in-flight
			Client.loadFile = vi.fn();

			// Remote fetch completes
			expect(typeof completeRemoteFetch).toBe('function');
			completeRemoteFetch();
			const bytes = await remotePromise;
			expect(bytes).toBeDefined();

			// Second attempt to require remote module resolves from cache without re-fetching
			const newVM = await createLuaVM();
			try {
				const fromRemote = await newVM.doString(`
					package.path = "https://remote.example.com/lua/?.lua"
					return require("async_mod").fromRemote
				`);
				expect(fromRemote).toBe(true);
				expect(remoteCalls).toBe(1);
			} finally {
				if (!newVM.global.isClosed()) {
					newVM.global.close();
				}
			}
		});
	});
});
