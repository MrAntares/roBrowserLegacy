import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ setup: vi.fn(value => value), clearCache: vi.fn() }));
vi.mock('Core/LuaModuleLoader.js', () => ({ default: { setup: mocks.setup, clearCache: mocks.clearCache, DEFAULT_SEARCH_PATHS: [] } }));
import * as runtime from 'DB/Loaders/LuaRuntime.js';

describe('Lua runtime generation', () => {
	it('does not replace a newer VM with an older startup result', async () => {
		const pending = [];
		const createVMs = () => new Promise(resolve => pending.push(resolve));
		const first = runtime.startLua(createVMs);
		const second = runtime.startLua(createVMs);
		pending[1](Array.from({ length: 5 }, (_, id) => ({ id: id + 5 })));
		expect(await second).toBe(true);
		const selected = runtime.lua;
		pending[0](Array.from({ length: 5 }, (_, id) => ({ id })));
		expect(await first).toBe(false);
		expect(runtime.lua).toBe(selected);
		expect(mocks.setup).toHaveBeenCalledTimes(5);
	});

	it('discards a startup invalidated before its VMs are ready', async () => {
		let resolve;
		const current = runtime.lua;
		const pending = runtime.startLua(() => new Promise(done => { resolve = done; }));
		runtime.invalidateLuaRuntime();
		resolve(Array.from({ length: 5 }, (_, id) => ({ id })));
		expect(await pending).toBe(false);
		expect(runtime.lua).toBe(current);
	});
});
