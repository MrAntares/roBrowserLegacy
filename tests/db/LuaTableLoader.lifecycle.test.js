import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
	const lua = { ctx: {}, mountFile: vi.fn(), unmountFile: vi.fn(), doFile: vi.fn(), doStringSync: vi.fn() };
	return { lua, loadFile: vi.fn(), generation: 0 };
});
vi.mock('Core/Client.js', () => ({ default: { loadFile: mocks.loadFile } }));
vi.mock('DB/Loaders/LuaRuntime.js', () => ({ lua: mocks.lua, getLuaGeneration: () => mocks.generation, getClientGeneration: () => mocks.generation }));
import { createLuaTableLoaders } from 'DB/Loaders/LuaTableLoader.js';

describe('Lua table loading lifecycle', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.generation = 0;
		mocks.lua.ctx = {};
		mocks.lua.doFile.mockResolvedValue(undefined);
	});

	it('completes only after both files have executed and the table is extracted', async () => {
		const requests = [];
		mocks.loadFile.mockImplementation((name, success, failure) => requests.push({ name, success, failure }));
		mocks.lua.doStringSync.mockImplementation(() => mocks.lua.ctx.addKeyAndValueToTable(7, new Uint8Array([65])));
		const callback = vi.fn();
		const done = vi.fn();
		const { loadLuaTable } = createLuaTableLoaders('windows-1252', 'windows-1252');
		loadLuaTable(['ids.lub', 'values.lub'], 'Example', callback, done);
		expect(done).not.toHaveBeenCalled();
		requests[0].success(new Uint8Array([1]));
		await vi.waitFor(() => expect(requests).toHaveLength(2));
		expect(done).not.toHaveBeenCalled();
		requests[1].success(new Uint8Array([2]));
		await vi.waitFor(() => expect(done).toHaveBeenCalledOnce());
		expect(callback).toHaveBeenCalledWith({ 7: 'A' });
		expect(done).toHaveBeenCalledWith(true);
		expect(mocks.lua.unmountFile.mock.calls.map(call => call[0])).toEqual(['values.lub', 'ids.lub']);
	});

	it('finishes once on a missing file and releases mounted files', async () => {
		const requests = [];
		mocks.loadFile.mockImplementation((name, success, failure) => requests.push({ name, success, failure }));
		const done = vi.fn();
		const { loadLuaTable } = createLuaTableLoaders('windows-1252', 'windows-1252');
		loadLuaTable(['ids.lub', 'values.lub'], 'Example', vi.fn(), done);
		requests[0].success(new Uint8Array([1]));
		await vi.waitFor(() => expect(requests).toHaveLength(2));
		requests[1].failure();
		requests[1].failure();
		expect(done).toHaveBeenCalledOnce();
		expect(done).toHaveBeenCalledWith(false);
		expect(mocks.lua.unmountFile).toHaveBeenCalledWith('ids.lub');
	});

	it('discards a response that belongs to a previous Lua runtime', () => {
		let receive;
		mocks.loadFile.mockImplementation((_name, success) => { receive = success; });
		const callback = vi.fn();
		const done = vi.fn();
		createLuaTableLoaders('windows-1252', 'windows-1252').loadLuaTable(
			['ids.lub', 'values.lub'], 'Example', callback, done
		);
		mocks.generation++;
		receive(new Uint8Array([1]));
		expect(mocks.lua.mountFile).not.toHaveBeenCalled();
		expect(callback).not.toHaveBeenCalled();
		expect(done).not.toHaveBeenCalled();
	});

	it('does not publish a stale Lua value', () => {
		let receive;
		mocks.loadFile.mockImplementation((_name, success) => { receive = success; });
		const callback = vi.fn();
		const done = vi.fn();
		createLuaTableLoaders('windows-1252', 'windows-1252').loadLuaValue('old.lub', 'Old', callback, done);
		mocks.generation++;
		receive(new Uint8Array([1]));
		expect(mocks.lua.mountFile).not.toHaveBeenCalled();
		expect(callback).not.toHaveBeenCalled();
		expect(done).toHaveBeenCalledOnce();
	});

	it('reports a missing Lua value so dependent loads can continue', () => {
		mocks.loadFile.mockImplementation((_name, _success, failure) => failure());
		const callback = vi.fn();
		const done = vi.fn();
		createLuaTableLoaders('windows-1252', 'windows-1252').loadLuaValue('missing.lub', 'Missing', callback, done);
		expect(callback).toHaveBeenCalledWith(null);
		expect(done).toHaveBeenCalledOnce();
	});
});

it('uses mapInfo as the authoritative display name and updates the map view', async () => {
	const { createMapDatabase, MapTable } = await import('DB/Map/MapDatabase.js');
	const { default: MapInfo } = await import('DB/Map/MapTable.js');
	const name = 'codex_test_map.rsw';
	const previousMap = MapTable[name];
	const previousInfo = MapInfo[name];
	mocks.loadFile.mockImplementation((_path, success) => success(new Uint8Array([1])));
	mocks.lua.doFile.mockResolvedValue(undefined);
	mocks.lua.doStringSync.mockImplementation(() => {
		mocks.lua.ctx.AddMapDisplayName(Uint8Array.from(name, c => c.charCodeAt(0)), Uint8Array.from('New name', c => c.charCodeAt(0)), false);
	});
	const done = vi.fn();
	try {
		MapTable[name] = { name: 'Old name', mp3: 'test.mp3' };
		const map = createMapDatabase({ getMessage: () => 'Unknown' }, 'windows-1252');
		map.loadMapTbl('mapInfo.lub', null, done);
		await vi.waitFor(() => expect(done).toHaveBeenCalledWith(true));
		expect(map.MapDatabase.getMapName(name)).toBe('New name');
		const view = map.MapDatabase.getMap(name);
		expect(view).toEqual({ name: 'New name', mp3: 'test.mp3' });
		MapInfo[name].displayName = 'Updated name';
		expect(view.name).toBe('Updated name');
		expect(map.MapDatabase.getMapName(name)).toBe('Updated name');
	} finally {
		if (previousMap === undefined) delete MapTable[name]; else MapTable[name] = previousMap;
		if (previousInfo === undefined) delete MapInfo[name]; else MapInfo[name] = previousInfo;
	}
});

it('ignores mapInfo data arriving after a client switch', async () => {
	const { createMapDatabase, MapTable } = await import('DB/Map/MapDatabase.js');
	const name = 'stale_map.rsw';
	let receive;
	mocks.generation = 0;
	mocks.loadFile.mockImplementation((_path, success) => { receive = success; });
	mocks.lua.doStringSync.mockClear();
	const done = vi.fn();
	const map = createMapDatabase({ getMessage: () => 'Unknown' }, 'windows-1252');
	map.loadMapTbl('old.lub', null, done);
	mocks.generation++;
	receive(new Uint8Array([1]));
	await Promise.resolve();
	expect(MapTable[name]).toBeUndefined();
	expect(mocks.lua.doStringSync).not.toHaveBeenCalled();
	expect(done).not.toHaveBeenCalled();
});

it('discards item data returned by an earlier client', async () => {
	const { createItemDatabase } = await import('DB/Items/ItemDatabase.js');
	let receive;
	mocks.generation = 0;
	mocks.lua.mountFile.mockClear();
	mocks.loadFile.mockImplementation((_path, success) => { receive = success; });
	const done = vi.fn();
	const items = createItemDatabase({}, 'windows-1252', []);
	items.loadItemInfo('old-item.lub', null, done);
	mocks.generation++;
	receive(new Uint8Array([1]));
	await Promise.resolve();
	expect(mocks.lua.mountFile).not.toHaveBeenCalled();
	expect(done).not.toHaveBeenCalled();
});

it('guards a load already executing in the old Lua VM', async () => {
	const { createDBLoadContext } = await import('DB/Loaders/DBLoadContext.js');
	let complete;
	mocks.generation = 0;
	mocks.lua.ctx = {};
	mocks.lua.doFile.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
	const context = createDBLoadContext();
	const mutate = vi.fn();
	context.lua.ctx.AddRow = mutate;
	const executing = context.lua.doFile('old.lub');
	mocks.generation++;
	expect(mocks.lua.ctx.AddRow('old')).toBe(1);
	expect(mutate).not.toHaveBeenCalled();
	complete();
	await expect(executing).rejects.toThrow('previous client');
});

it('does not apply item callbacks after a running Lua load is superseded', async () => {
	const { createItemDatabase } = await import('DB/Items/ItemDatabase.js');
	const { default: ItemTable } = await import('DB/Items/ItemTable.js');
	const itemId = 900001;
	const previous = ItemTable[itemId];
	let finishLua;
	mocks.generation = 0;
	mocks.lua.ctx = {};
	mocks.lua.doFile.mockImplementation(() => new Promise(resolve => { finishLua = resolve; }));
	mocks.loadFile.mockImplementation((_path, success) => success(new Uint8Array([1])));
	const error = vi.spyOn(console, 'error').mockImplementation(() => {});
	const done = vi.fn();
	try {
		createItemDatabase({}, 'windows-1252', []).loadItemInfo('item.lub', null, done);
		await vi.waitFor(() => expect(finishLua).toBeTypeOf('function'));
		mocks.generation++;
		expect(mocks.lua.ctx.AddItem(itemId, null, null, null, null, 0, 0)).toBe(1);
		finishLua();
		await vi.waitFor(() => expect(mocks.lua.unmountFile).toHaveBeenCalled());
		expect(ItemTable[itemId]).toBe(previous);
		expect(done).not.toHaveBeenCalled();
	} finally {
		error.mockRestore();
		if (previous === undefined) delete ItemTable[itemId]; else ItemTable[itemId] = previous;
	}
});

it('prefers localized legacy map names until the client supplies a Lua override', async () => {
	const { createMapDatabase, MapTable, setLegacyMapName, resetLoadedMapNames } = await import('DB/Map/MapDatabase.js');
	const { default: MapInfo } = await import('DB/Map/MapTable.js');
	const name = '1@gol1.rsw';
	const previousMap = MapTable[name];
	const previousInfo = MapInfo[name] && { ...MapInfo[name] };
	mocks.generation = 0;
	mocks.lua.ctx = {};
	mocks.loadFile.mockImplementation((_path, success) => success(new Uint8Array([1])));
	mocks.lua.doFile.mockResolvedValue(undefined);
	mocks.lua.doStringSync.mockImplementation(() => {
		mocks.lua.ctx.AddMapDisplayName(Uint8Array.from(name, c => c.charCodeAt(0)), Uint8Array.from('Lua name', c => c.charCodeAt(0)), false);
	});
	try {
		resetLoadedMapNames();
		setLegacyMapName(0, name, 'Nome traduzido');
		const map = createMapDatabase({ getMessage: () => 'Unknown' }, 'windows-1252');
		const view = map.MapDatabase.getMap(name);
		expect(map.MapDatabase.getMapName(name)).toBe('Nome traduzido');
		expect(view.name).toBe('Nome traduzido');
		const done = vi.fn();
		map.loadMapTbl('mapInfo.lub', null, done);
		await vi.waitFor(() => expect(done).toHaveBeenCalledWith(true));
		expect(map.MapDatabase.getMapName(name)).toBe('Lua name');
		expect(view.name).toBe('Lua name');
	} finally {
		resetLoadedMapNames();
		if (previousMap === undefined) delete MapTable[name]; else MapTable[name] = previousMap;
		if (previousInfo === undefined) delete MapInfo[name]; else MapInfo[name] = previousInfo;
	}
});

it('does not let a stale airship load erase the new client routes', async () => {
	const { createMapLoaders } = await import('DB/Map/MapLoaders.js');
	const { default: PrivateAirship } = await import('DB/Map/PrivateAirship.js');
	let finish;
	mocks.generation = 0;
	mocks.lua.ctx = {};
	mocks.loadFile.mockImplementation((_path, success) => success(new Uint8Array([1])));
	mocks.lua.doFile.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
	const error = vi.spyOn(console, 'error').mockImplementation(() => {});
	const done = vi.fn();
	try {
		createMapLoaders('windows-1252').loadPrivateAirship('old.lub', null, done);
		await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
		mocks.generation++;
		PrivateAirship.reset();
		PrivateAirship.addStartableMap('new');
		PrivateAirship.addNeedItem(1234);
		finish();
		await vi.waitFor(() => expect(error).toHaveBeenCalled());
		expect(PrivateAirship.isLoaded()).toBe(true);
		expect(PrivateAirship.isStartableMap('new')).toBe(true);
		expect(PrivateAirship.isStartableMap('old')).toBe(false);
		expect(PrivateAirship.getNeedItems()).toEqual([1234]);
		expect(done).not.toHaveBeenCalled();
	} finally {
		PrivateAirship.reset();
		error.mockRestore();
	}
});
