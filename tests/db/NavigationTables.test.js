import { describe, it, expect, vi, afterEach } from 'vitest';

vi.hoisted(() => {
	if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
		const store = {};
		globalThis.localStorage = {
			getItem: key => (key in store ? store[key] : null),
			setItem: (key, val) => {
				store[key] = String(val);
			},
			removeItem: key => {
				delete store[key];
			},
			clear: () => {
				for (const k in store) delete store[k];
			}
		};
	}
});

// DB.init() asks for every client file; none needs to arrive here.
vi.mock('Core/Client.js', () => ({ default: { loadFile: () => {}, loadFiles: () => {}, getFile: () => {} } }));

import DB from 'DB/DBManager.js';
import MapPathFinder from 'UI/Components/Navigation/MapPathFinder.js';
import PACKETVER from 'Network/PacketVerManager.js';

// The navigation tables come from Lua arrays and are read with .length. They
// were plain objects, so copying a loaded array into one dropped its length,
// and every route to another map, NPC search and monster search found nothing.
describe('navigation tables', () => {
	const tables = [
		DB.getNaviLinkTable(),
		DB.getNaviLinkDistanceTable(),
		DB.getNaviNpcDistanceTable()
	];

	afterEach(() => {
		for (const table of tables) {
			table.length = 0;
		}
	});

	it('are arrays, so a loaded table keeps its length', () => {
		for (const table of tables) {
			expect(Array.isArray(table)).toBe(true);
		}
		Object.assign(DB.getNaviLinkTable(), [['a'], ['b']]);
		expect(DB.getNaviLinkTable().length).toBe(2);
	});

	it('route between maps over the loaded portals', () => {
		Object.assign(DB.getNaviLinkTable(), [
			['prontera', 1, 200, 45, '', '', 156, 22, 'prt_fild08', 170, 375],
			['prt_fild08', 2, 200, 45, '', '', 170, 378, 'prontera', 156, 26]
		]);

		expect(MapPathFinder.findPathBetweenMaps('prontera', 150, 150, 'prt_fild08', 170, 300)).toEqual([
			{ map: 'prontera', x: 156, y: 22, warpId: 1 },
			{ map: 'prt_fild08', x: 170, y: 300, warpId: null }
		]);
	});

	it('are emptied when an older client, which loads none, is loaded after a server switch', () => {
		Object.assign(DB.getNaviLinkTable(), [['prontera', 1, 200, 45, '', '', 156, 22, 'prt_fild08', 170, 375]]);
		const packetver = PACKETVER.value;
		PACKETVER.value = 20100101;
		try {
			DB.init();
		} finally {
			PACKETVER.value = packetver;
		}

		expect(DB.getNaviLinkTable().length).toBe(0);
	});
});
