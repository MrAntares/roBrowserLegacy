import { beforeEach, describe, expect, it, vi } from 'vitest';

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
// The archive answers the mount-palette sentinel through `archive.hasMountPalettes`;
// with `archive.later` set, the answer waits in `archive.pending` until `answer()`.
const archive = vi.hoisted(() => ({ hasMountPalettes: true, later: false, pending: [] }));
const Client = vi.hoisted(() => ({
	loadFile: vi.fn((path, onLoad, onError) => {
		if (!path.includes('_1.pal')) {
			return onLoad && onLoad();
		}
		if (archive.later) {
			archive.pending.push([onLoad, onError]);
			return;
		}
		return archive.hasMountPalettes ? onLoad && onLoad() : onError && onError();
	})
}));
vi.mock('Core/Client.js', () => ({ default: Client }));
vi.mock('DB/Monsters/ShadowTable.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20221005 } }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/EntityAction.js', () => ({ default: vi.fn() }));

// EntityView keeps the archive's answer for the session: each test starts a new one.
let EntityViewInit;
let Configs;
beforeEach(async () => {
	vi.resetModules();
	Configs = (await import('Core/Configs.js')).default;
	archive.hasMountPalettes = true;
	archive.later = false;
	archive.pending = [];
	Client.loadFile.mockClear();
	EntityViewInit = (await import('Renderer/Entity/EntityView.js')).default;
});

function answer() {
	const pending = archive.pending;
	archive.later = false;
	archive.pending = [];
	for (const [onLoad, onError] of pending) {
		if (archive.hasMountPalettes) {
			onLoad && onLoad();
		} else {
			onError && onError();
		}
	}
}

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

	it("dyes a halter-lead mount with the mount's own palette when the archive ships it", () => {
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.PIG_CREATOR]}_1_2.pal`);
		expect(PalNameTable[JobId.PIG_CREATOR]).not.toBe(PalNameTable[JobId.ALCHEMIST_H]);
	});

	it("dyes a halter-lead mount with the rider's palette when the archive has none for it", () => {
		archive.hasMountPalettes = false;
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.ALCHEMIST_H]}_1_2.pal`);
	});

	it('keeps the dye the mount still has when the archive answers late', () => {
		archive.hasMountPalettes = false;
		archive.later = true;
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		creator.bodypalette = 3;
		answer();
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.ALCHEMIST_H]}_1_3.pal`);
	});

	it('dyes the rider the mount has now when the archive answers late', () => {
		archive.hasMountPalettes = false;
		archive.later = true;
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		creator.sex = 0;
		answer();
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.ALCHEMIST_H]}_0_2.pal`);
	});

	it('asks the archive once, however often the file cache forgets the answer', () => {
		archive.hasMountPalettes = false;
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]).bodypalette = 3;
		creator.bodypalette = 4;
		const asked = Client.loadFile.mock.calls.filter(([path]) => path.includes('_1.pal'));
		expect(asked).toHaveLength(1);
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.ALCHEMIST_H]}_1_4.pal`);
	});

	it('asks again when the server serves another archive', () => {
		Configs.setServer({ remoteClient: 'https://old.example/' });
		archive.hasMountPalettes = false;
		entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]).bodypalette = 2;
		Configs.setServer({ remoteClient: 'https://new.example/' });
		archive.hasMountPalettes = true;
		const creator = entity(JobId.ALCHEMIST_H, AllMountTable[JobId.ALCHEMIST_H]);
		creator.bodypalette = 2;
		expect(creator.files.body.pal).toBe(`${PalNameTable[JobId.PIG_CREATOR]}_1_2.pal`);
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
