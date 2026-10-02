import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => {
	if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
		const store = {};
		globalThis.localStorage = {
			getItem: (key) => (key in store ? store[key] : null),
			setItem: (key, val) => {
				store[key] = String(val);
			},
			removeItem: (key) => {
				delete store[key];
			},
			clear: () => {
				for (const k in store) delete store[k];
			}
		};
	}
});

import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';
import PalNameTable from 'DB/Jobs/PalNameTable.js';

// The client's own files name a costume_1 body's palettes with the body's `_1`
// after the palette number, e.g. costume_1/<rune dragon>_<sex>_3_1.pal.
describe('DB.getBodyPalPath', () => {
	it('names a costume_1 palette with the trailing _1', () => {
		for (const job of [JobId.RUNE_KNIGHT_2ND, JobId.RUNE_KNIGHT2_2ND]) {
			const path = DB.getBodyPalPath(job, 3, 1);
			expect(path).toContain('/' + PalNameTable[job] + '_');
			expect(path).toMatch(/_3_1\.pal$/);
		}
	});

	it('names any other palette without it', () => {
		const path = DB.getBodyPalPath(JobId.RUNE_KNIGHT2, 3, 1);
		expect(path).toContain('/' + PalNameTable[JobId.RUNE_KNIGHT2] + '_');
		expect(path).toMatch(/[^_]_3\.pal$/);
		expect(path).not.toContain('costume_1');
	});
});
