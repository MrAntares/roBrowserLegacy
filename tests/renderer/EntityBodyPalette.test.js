import { describe, expect, it, vi } from 'vitest';

import JobId from 'DB/Jobs/JobConst.js';
import PalNameTable from 'DB/Jobs/PalNameTable.js';
import MountTable from 'DB/Jobs/MountTable.js';
import AllMountTable from 'DB/Jobs/AllMountTable.js';

// Stands in for DB.getBodyPalPath: the part under test is which job
// EntityView asks for, so the stub only needs to name the table entry.
vi.mock('DB/DBManager.js', async () => {
	const Pal = (await import('DB/Jobs/PalNameTable.js')).default;
	return {
		default: {
			getCartPath: id => `cart${id}`,
			getBodyPalPath: (id, pal, sex) => (id in Pal ? `${Pal[id]}_${sex}_${pal}.pal` : null)
		}
	};
});
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('DB/Monsters/ShadowTable.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20221005 } }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/EntityAction.js', () => ({ default: vi.fn() }));

const { default: EntityViewInit } = await import('Renderer/Entity/EntityView.js');

function entity(job, costume) {
	const e = { _job: job, _sex: 1, _bodypalette: 0, costume };
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
});
