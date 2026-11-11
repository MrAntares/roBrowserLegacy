import { describe, it, expect, vi } from 'vitest';
import DB from 'DB/DBManager.js';
import { createOwnerNameResolver } from 'DB/System/OwnerNameResolver.js';
import { fillNaviTable, NaviMobTable } from 'DB/Map/NavigationSystem.js';
import { getSkillAttackSlice } from 'DB/Items/WeaponQueries.js';
import { getEffectJoke, getEffectScream } from 'DB/System/SystemDatabase.js';

describe('DB facade shared state', () => {
	it('uses reassigned public maps as the single state', () => {
		const previousNames = DB.CNameTable;
		const previousAliases = DB.mapalias;
		const previousUpdate = DB.UpdateOwnerName[42];
		try {
			const names = {};
			const aliases = { test: 'other' };
			DB.CNameTable = names;
			DB.mapalias = aliases;
			createOwnerNameResolver(DB).onUpdateOwnerName({ GID: 42, CName: 'Test' });
			expect(names[42]).toBe('Test');
			expect(DB.mapalias).toBe(aliases);
		} finally {
			DB.CNameTable = previousNames;
			DB.mapalias = previousAliases;
			if (previousUpdate === undefined) delete DB.UpdateOwnerName[42];
			else DB.UpdateOwnerName[42] = previousUpdate;
		}
	});

	it('preserves data property descriptors for the original public static fields', () => {
		for (const name of ['mapalias', 'CNameTable', 'UpdateOwnerName', '_nameCallbacks', '_nameCallbackTimers', 'S_JOBS_ASSASSIN', 'S_JOBS_HUNTER', 'S_JOBS_MONK', 'S_JOBS_SN', 'S_JOBS_TAEKWON', 'S_JOBS_GS', 'S_JOBS_RG', 'S_JOBS_MADO']) {
			expect(Object.getOwnPropertyDescriptor(DB, name)).toEqual({ value: DB[name], writable: true, enumerable: true, configurable: true });
		}
	});

	it('preserves the async public lazyInit method', () => {
		expect(DB.lazyInit.constructor.name).toBe('AsyncFunction');
	});

	it('uses a reassigned job group for subsequent classification', () => {
		const previous = DB.S_JOBS_ASSASSIN;
		try {
			DB.S_JOBS_ASSASSIN = new Set([999991]);
			expect(DB.isAssassin(999991)).toBe(true);
		} finally {
			DB.S_JOBS_ASSASSIN = previous;
		}
	});

	it('preserves overrides used by skills and effects without importing the facade', () => {
		const slice = vi.spyOn(DB, 'getAttackSlice').mockReturnValue({ frame: 1, length: 2 });
		const joke = vi.spyOn(DB, 'getRandomJoke').mockReturnValue('joke');
		const scream = vi.spyOn(DB, 'getRandomScream').mockReturnValue('scream');
		try {
			expect(getSkillAttackSlice(1, 2)).toEqual({ frame: 1, length: 2 });
			expect(slice).toHaveBeenCalledWith(1, 2);
			expect(getEffectJoke()).toBe('joke');
			expect(getEffectScream()).toBe('scream');
		} finally {
			slice.mockRestore();
			joke.mockRestore();
			scream.mockRestore();
		}
	});

	it('rebuilds navigation lookup when monster rows are replaced', () => {
		const previous = NaviMobTable.slice();
		try {
			fillNaviTable(NaviMobTable, [['prontera', 1, 0, 1002, 'Poring', '', 1, 0]]);
			expect(DB.getNavigationMapMonsters('prontera')[0].name).toBe('Poring');
			fillNaviTable(NaviMobTable, [['geffen', 2, 0, 1003, 'Fabre', '', 1, 0]]);
			expect(DB.getNavigationMapMonsters('prontera')).toEqual([]);
			expect(DB.getNavigationMapMonsters('geffen')[0].name).toBe('Fabre');
		} finally {
			fillNaviTable(NaviMobTable, previous);
		}
	});
});
