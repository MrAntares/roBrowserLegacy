import { describe, it, expect, vi } from 'vitest';
import { createDBBootstrap } from 'DB/Bootstrap/DBBootstrap.js';
import {
	fillNaviTable,
	NaviMapTable,
	NaviMobTable,
	NaviNpcTable,
	NaviLinkTable,
	NaviLinkDistanceTable,
	NaviNpcDistanceTable,
	clearNavigationMobIndex
} from 'DB/Map/NavigationSystem.js';

describe('DB bootstrap', () => {
	it('clears navigation for the next client and retains the table references', () => {
		const tables = [NaviMapTable, NaviMobTable, NaviNpcTable, NaviLinkTable, NaviLinkDistanceTable, NaviNpcDistanceTable];
		const previous = tables.map(table => table.slice());
		const remove = vi.fn();
		const clearCache = vi.fn();
		const db = { getBodyPalPath: () => 'sentinel.pal', mapalias: {} };
		const bootstrap = createDBBootstrap(db, {
			Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove }, LuaModuleLoader: { clearCache },
			NaviMapTable, NaviMobTable, NaviNpcTable, NaviLinkTable, NaviLinkDistanceTable, NaviNpcDistanceTable,
			clearNavigationMobIndex, loadFontFromClient: () => {}, loadTable: () => {}, MapTable: {}, MsgStringTable: []
		});
		try {
			for (const table of tables) table.push(['old']);
			bootstrap.init();
			expect(tables.every(table => table.length === 0)).toBe(true);
			expect(clearCache).toHaveBeenCalledOnce();
			expect(remove).toHaveBeenCalledWith(null, 'sentinel.pal');
		} finally {
			tables.forEach((table, i) => fillNaviTable(table, previous[i]));
		}
	});
});

it('reports initial loading progress after the message CSV fallback finishes', () => {
	const pending = new Map();
	const progress = vi.fn();
	const ready = vi.fn();
	const db = { getBodyPalPath: () => 'sentinel.pal', mapalias: {}, onProgress: progress, onReady: ready };
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove: () => {} }, LuaModuleLoader: { clearCache: () => {} },
		NaviMapTable, NaviMobTable, NaviNpcTable, NaviLinkTable, NaviLinkDistanceTable, NaviNpcDistanceTable,
		clearNavigationMobIndex, loadFontFromClient: () => {}, MapTable: {}, MsgStringTable: [],
		loadTable: (path, _separator, _size, _each, onEnd) => pending.set(path, onEnd),
		loadCSV: (_path, _table, _key, _value, onEnd) => pending.set('csv', onEnd)
	});
	bootstrap.init();
	pending.get('data/mp3nametable.txt')();
	pending.get('data/mapnametable.txt')();
	pending.get('data/resnametable.txt')();
	pending.get('data/msgstringtable.txt')();
	expect(ready).not.toHaveBeenCalled();
	pending.get('csv')();
	expect(progress.mock.calls).toEqual([[1, 4], [2, 4], [3, 4], [4, 4]]);
	expect(ready).toHaveBeenCalledOnce();
});

it('waits until synchronous registration finishes and ignores duplicate completions', () => {
	let scheduled = 0;
	const ready = vi.fn(() => expect(scheduled).toBe(4));
	const db = { getBodyPalPath: () => 'sentinel', mapalias: {}, onReady: ready };
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove() {} }, LuaModuleLoader: { clearCache() {} },
		NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [], NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [],
		clearNavigationMobIndex() {}, loadFontFromClient() {}, MapTable: {}, MsgStringTable: [],
		loadTable(_path, _separator, _size, _row, done) { scheduled++; done(); done(); },
		loadCSV(_path, _table, _key, _value, done) { done(); done(); }
	});
	bootstrap.init();
	expect(ready).toHaveBeenCalledOnce();
});

it('ignores completion callbacks from a previous initialization', () => {
	const pending = [];
	const maps = {};
	const messages = [];
	const ready = vi.fn();
	const progress = vi.fn();
	const db = { getBodyPalPath: () => 'sentinel', mapalias: {}, onReady: ready, onProgress: progress };
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove() {} }, LuaModuleLoader: { clearCache() {} },
		NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [], NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [],
		clearNavigationMobIndex() {}, loadFontFromClient() {}, MapTable: maps, MsgStringTable: messages,
		loadTable(path, _separator, _size, row, done) { pending.push({ path, row, done }); },
		loadCSV(_path, _table, _key, _value, done) { done(); }
	});
	bootstrap.init();
	const old = pending.splice(0);
	bootstrap.init();
	old.find(request => request.path === 'data/mapnametable.txt').row(0, 'old.rsw', 'Old name');
	old.find(request => request.path === 'data/msgstringtable.txt').row(0, 'Old message');
	old.find(request => request.path === 'data/resnametable.txt').row(0, 'old', 'alias');
	old.forEach(request => request.done());
	expect(maps).toEqual({});
	expect(messages).toEqual([]);
	expect(db.mapalias).toEqual({});
	expect(progress).not.toHaveBeenCalled();
	expect(ready).not.toHaveBeenCalled();
	pending.forEach(request => request.done());
	expect(ready).toHaveBeenCalledOnce();
});

it('does not schedule a lazy load when another client replaces it during Lua startup', async () => {
	let resolveStart;
	const startLua = vi.fn(() => new Promise(resolve => { resolveStart = resolve; }));
	const invalidateLuaRuntime = vi.fn();
	const db = { getBodyPalPath: () => 'sentinel', mapalias: {} };
	const hookPacket = vi.fn();
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove() {} }, LuaModuleLoader: { clearCache() {} },
		NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [], NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [],
		clearNavigationMobIndex() {}, loadFontFromClient() {}, MapTable: {}, MsgStringTable: [], loadTable() {},
		startLua, invalidateLuaRuntime, Network: { hookPacket }
	});
	bootstrap.init();
	const oldLoad = bootstrap.lazyInit();
	bootstrap.init();
	resolveStart(true);
	await oldLoad;
	expect(invalidateLuaRuntime).toHaveBeenCalledTimes(2);
	expect(hookPacket).not.toHaveBeenCalled();
	expect(db.isLoaded).toBe(false);
});

it('ignores a superseded lazy startup within the same client', async () => {
	const starts = [];
	const startLua = vi.fn(() => new Promise(resolve => starts.push(resolve)));
	const hookPacket = vi.fn();
	const db = { getBodyPalPath: () => 'sentinel', mapalias: {} };
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove() {} }, LuaModuleLoader: { clearCache() {} },
		NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [], NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [],
		clearNavigationMobIndex() {}, loadFontFromClient() {}, MapTable: {}, MsgStringTable: [], loadTable() {},
		startLua, Network: { hookPacket }
	});
	bootstrap.init();
	const first = bootstrap.lazyInit();
	const second = bootstrap.lazyInit();
	starts[0](true);
	await first;
	expect(hookPacket).not.toHaveBeenCalled();
	starts[1](false);
	await second;
	expect(db.isLoaded).toBe(false);
});

it('resets parsed client data before starting the next initial load', () => {
	const resetClientData = vi.fn();
	const db = { getBodyPalPath: () => 'sentinel', mapalias: {} };
	const bootstrap = createDBBootstrap(db, {
		Client: {}, JobId: { PIG_CREATOR: 1 }, MemoryManager: { remove() {} }, LuaModuleLoader: { clearCache() {} },
		NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [], NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [],
		clearNavigationMobIndex() {}, resetClientData, loadFontFromClient() {}, MapTable: {}, MsgStringTable: [],
		loadTable() { expect(resetClientData).toHaveBeenCalledOnce(); }
	});
	bootstrap.init();
	expect(resetClientData).toHaveBeenCalledOnce();
});
