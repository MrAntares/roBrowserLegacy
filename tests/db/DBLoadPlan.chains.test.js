import { describe, it, expect, vi } from 'vitest';
import { createDBBootstrap } from 'DB/Bootstrap/DBBootstrap.js';
import * as legacyItemRows from 'DB/Items/LegacyItemRows.js';
vi.mock('Core/AIDriver.js', () => ({ default: { initAI(done) { done(); } } }));

describe('lazy DB dependency chains', () => {
	it('waits for pet evolution and the complete skill chain before marking DB loaded', async () => {
		const pending = {};
		const onProgress = vi.fn();
		const forceClean = vi.fn();
		const db = { LUA_PATH: 'lua/', mapalias: {}, getBodyPalPath: () => 'sentinel', onProgress };
		const finish = (...args) => { const done = args.findLast(arg => typeof arg === 'function'); if (done) done(); };
		const loadPetEvolution = vi.fn();
		const context = {
			Client: {}, JobId: { PIG_CREATOR: 1 }, LuaModuleLoader: { clearCache() {} }, MemoryManager: { remove() {}, forceClean },
			startLua: async () => true, clearNavigationMobIndex() {}, NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [],
			NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [], MapTable: {}, MsgStringTable: [],
			loadFontFromClient() {}, loadTable(_path, _sep, _size, _row, done) { done(); },
			loadCSV(_path, _target, _key, _value, done) { done(); },
			Configs: { get(key, fallback) { return key === 'loadLua' ? true : fallback; } },
			PACKETVER: { value: 20141008 }, HatTable: {}, RobeTable: {}, MonsterTable: {}, RandomOption: {}, SKID: {}, legacyItemRows, mergeAccessoryNames() {}, mergeRobeNames() {}, mergeRandomOptions() {}, mergeMonsterNames() {}, mergeSkillIds() {},
			getSystemAliases: path => [path],
			tryLoadLuaAliases(loader, _files, _callback, done) { if (loader === loadPetEvolution) pending.evolution = done; else done(); },
			loadItemInfo() {}, loadQuestInfo: finish, loadItemDBTable: finish, loadWeaponTable: finish, loadStateIconInfo: finish,
			loadLuaTable(files, _table, callback, done) {
				if (files[0].includes('npcidentity')) pending.monsters = () => { callback({}); done(true); };
				else if (files[0].includes('skillid')) pending.description = () => { callback({}); done(true); };
				else { callback({}); done(true); }
			},
			loadLuaValue(file, _name, callback, done) {
				if (file.includes('skillid')) pending.skillId = () => callback({});
				else { callback(null); done(); }
			},
			loadPetInfo(_file, _callback, done) { pending.pet = done; }, loadPetEvolution,
			loadSkillInfoList(_file, _callback, done) { pending.skillInfo = done; },
			loadSkillTreeView(_file, _callback, done) { pending.skillTree = done; },
			setSkillDescription() {}, fillNaviTable() {},
			loadWorldMapInfo(_path, done) { done(); }, PrivateAirship: { reset() {} },
			loadTownInfoFile(_path, _callback, done) { done(); }, loadXMLFile(_path, _callback, done) { done(); },
			loadSignBoardList(_file, _callback, done) { done(); }, loadSignBoardData(_file, _callback, done) { done(); },
			parseFogEntry() {}, parseIndoorEntry() {}, JokeTable: [], ScreamTable: [],
			PACKET: { ZC: { ACK_REQNAME_BYGID: {}, ACK_REQNAME_BYGID2: {} } }, Network: { hookPacket() {} },
			ownerNames: { onUpdateOwnerName() {} }
		};
		const bootstrap = createDBBootstrap(db, context);
		bootstrap.init();
		await bootstrap.lazyInit();
		expect(db.isLoaded).toBe(false);
		pending.monsters();
		pending.pet();
		pending.evolution();
		pending.skillId();
		pending.description();
		pending.skillInfo();
		expect(db.isLoaded).toBe(false);
		pending.skillTree();
		await vi.waitFor(() => expect(db.isLoaded).toBe(true));
		expect(forceClean).toHaveBeenCalledOnce();
	});
});

it('ignores legacy item rows that arrive after a client switch', async () => {
	const { default: ItemTable } = await import('DB/Items/ItemTable.js');
	const id = 999991;
	const previous = ItemTable[id];
	let oldRow;
	const db = { LUA_PATH: 'lua/', mapalias: {}, getBodyPalPath: () => 'sentinel' };
	const context = {
		Client: {}, JobId: { PIG_CREATOR: 1 }, LuaModuleLoader: { clearCache() {} }, MemoryManager: { remove() {}, forceClean() {} },
		startLua: async () => true, clearNavigationMobIndex() {}, NaviMapTable: [], NaviMobTable: [], NaviNpcTable: [],
		NaviLinkTable: [], NaviLinkDistanceTable: [], NaviNpcDistanceTable: [], MsgStringTable: [], legacyItemRows,
		loadFontFromClient() {}, loadCSV(_file, _target, _key, _value, done) { done(); },
		loadTable(file, _sep, _size, row, done) { if (file === 'data/num2itemdisplaynametable.txt') oldRow = row; else done(); },
		Configs: { get(_key, fallback) { return fallback; } }, PACKETVER: { value: 0 },
		loadWorldMapInfo(_path, done) { done(); }, PrivateAirship: { reset() {} },
		loadTownInfoFile(_path, _callback, done) { done(); }, loadXMLFile(_path, _callback, done) { done(); },
		parseFogEntry() {}, parseIndoorEntry() {}, parseQuestEntry() {}, parseLegacySkillDescription() {},
		setJokeRow() {}, setScreamRow() {}, setMessageRow() {}, setLegacyMapName() {}, setLegacyMapMusic() {},
		PACKET: { ZC: { ACK_REQNAME_BYGID: {}, ACK_REQNAME_BYGID2: {} } }, Network: { hookPacket() {} },
		ownerNames: { onUpdateOwnerName() {} }
	};
	try {
		const bootstrap = createDBBootstrap(db, context);
		bootstrap.init();
		await bootstrap.lazyInit();
		expect(oldRow).toBeTypeOf('function');
		bootstrap.init();
		oldRow(0, id, 'old_item');
		expect(ItemTable[id]).toBe(previous);
	} finally {
		if (previous === undefined) delete ItemTable[id]; else ItemTable[id] = previous;
	}
});
