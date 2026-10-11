import { describe, expect, it, vi } from 'vitest';

import JobId from 'DB/Jobs/JobConst.js';
import PalNameTable from 'DB/Jobs/PalNameTable.js';
import MountTable from 'DB/Jobs/MountTable.js';
import AllMountTable from 'DB/Jobs/AllMountTable.js';

// Stands in for DB.getBodyPalPath: the part under test is which job
// EntityView asks for, so the stub only needs to name the table entry.
vi.mock('DB/DBManager.js', async () => {
	const Pal = (await import('DB/Jobs/PalNameTable.js')).default;
	const DB = {
		getBodyPath: (id, sex, alt) => `body${id}_${alt}`,
		getBodyPalPath: (id, pal, sex) => (id in Pal ? `${Pal[id]}_${sex}_${pal}.pal` : null)
	};
	// Anything else the view asks for is not under test.
	return { default: new Proxy(DB, { get: (t, k) => (k in t ? t[k] : () => null) }) };
});
// Answers every load at once, so a body that loads sets its dye again as it does in game.
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn((path, onLoad) => onLoad && onLoad()) } }));
vi.mock('DB/Monsters/ShadowTable.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20221005 } }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/EntityAction.js', () => ({ default: vi.fn() }));

const { default: EntityViewInit } = await import('Renderer/Entity/EntityView.js');

function entity(job, costume) {
	const e = { _job: job, _sex: 1, _bodypalette: 0, costume, sound: {} };
	EntityViewInit.call(e);
	return e;
}

describe('EntityView body palette', () => {
	it('uses the base job palette on foot', () => {
		const knight = entity(JobId.KNIGHT, 0);
		knight.bodypalette = 3;
		expect(knight.files.body.pal).toBe(`${PalNameTable[JobId.KNIGHT]}_1_3.pal`);
	});

	it("uses the mount's palette on a mount, not the base job's", () => {
		const knight = entity(JobId.KNIGHT, JobId.KNIGHT2);
		knight.bodypalette = 3;
		expect(knight.files.body.pal).toBe(`${PalNameTable[JobId.KNIGHT2]}_1_3.pal`);
		expect(PalNameTable[JobId.KNIGHT2]).not.toBe(PalNameTable[JobId.KNIGHT]);
	});

	it('keeps the internal palette for palette 0', () => {
		const knight = entity(JobId.KNIGHT, JobId.KNIGHT2);
		knight.bodypalette = 0;
		expect(knight.files.body.pal).toBeNull();
	});

	it('names a palette for every mount of a job that has one', () => {
		const missing = [];
		for (const table of [MountTable, AllMountTable]) {
			for (const [base, mount] of Object.entries(table)) {
				if (base in PalNameTable && !(mount in PalNameTable)) {
					missing.push(`${base} -> ${mount}`);
				}
			}
		}
		expect(missing).toEqual([]);
	});

	// PACKETVER is 20221005 here, so a body style value is read through
	// getBodyVal: a Rune Knight's style draws the RUNE_KNIGHT_2ND costume body.
	// Once that body loads, UpdateBodyStyle sets the dye again.
	function styled(e, look) {
		vi.useFakeTimers();
		e.body = look;
		vi.advanceTimersByTime(50);
		vi.useRealTimers();
		return e;
	}

	it("uses the costume body's palette for a body style on foot", () => {
		const rk = entity(JobId.RUNE_KNIGHT, 0);
		rk.bodypalette = 3;
		styled(rk, 1);
		expect(rk.files.body.pal).toBe(`${PalNameTable[JobId.RUNE_KNIGHT_2ND]}_1_3.pal`);
	});

	it("uses the costume mount's palette for a body style on a mount", () => {
		const rk = entity(JobId.RUNE_KNIGHT, JobId.RUNE_KNIGHT2);
		rk.bodypalette = 3;
		styled(rk, 1);
		expect(MountTable[JobId.RUNE_KNIGHT_2ND]).toBe(JobId.RUNE_KNIGHT2_2ND);
		expect(rk.files.body.pal).toBe(`${PalNameTable[JobId.RUNE_KNIGHT2_2ND]}_1_3.pal`);
	});

	it("goes back to the mount's own palette when the body style is removed", () => {
		const rk = styled(entity(JobId.RUNE_KNIGHT, JobId.RUNE_KNIGHT2), 1);
		rk.bodypalette = 3;
		styled(rk, 0);
		expect(rk.files.body.pal).toBe(`${PalNameTable[JobId.RUNE_KNIGHT2]}_1_3.pal`);
	});

	it("keeps an admin's palette when a body style leaves the admin sprite as it is", () => {
		const rk = entity(JobId.RUNE_KNIGHT, 0);
		rk.isAdmin = true;
		rk.bodypalette = 3;
		styled(rk, 1);
		expect(rk.files.body.pal).toBe(`${PalNameTable[JobId.RUNE_KNIGHT]}_1_3.pal`);
	});
});
