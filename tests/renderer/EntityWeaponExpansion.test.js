import { describe, expect, it, vi } from 'vitest';

import JobId from 'DB/Jobs/JobConst.js';

// A weapon with an expansion look (the Paradise Dagger is ClassNum 31, Main
// Gauche) is drawn from a sprite named after that look. The Druid line has only
// the base-type sprites, so it has to fall back to the base weapon type.
const MAIN_GAUCHE = 31;
const SHORTSWORD = 1;
const files = new Set();

vi.mock('DB/DBManager.js', async () => {
	const DB = {
		getBodyPath: (id, sex) => `body${id}_${sex}`,
		getWeaponPath: (id, job) => `weapon${id}_${job}`,
		getWeaponViewID: id => id,
		getWeaponType: (id, realType) => (realType && id === MAIN_GAUCHE ? SHORTSWORD : id)
	};
	// Anything else the view asks for is not under test.
	return { default: new Proxy(DB, { get: (t, k) => (k in t ? t[k] : () => null) }) };
});
// Loads at once; a file that isn't there calls the error callback.
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile: vi.fn((path, onLoad, onError) => (files.has(path) ? onLoad && onLoad() : onError && onError()))
	}
}));
vi.mock('DB/Monsters/ShadowTable.js', () => ({ default: {} }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20221005 } }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/EntityAction.js', () => ({ default: vi.fn() }));

const { default: EntityViewInit } = await import('Renderer/Entity/EntityView.js');

function wielder(job) {
	const e = { _job: job, _sex: 0, _bodypalette: 0, costume: 0, sound: {} };
	EntityViewInit.call(e);
	e.job = job;
	return e;
}

describe('EntityView weapon with an expansion look', () => {
	it('draws the look sprite for a class that has it', () => {
		files.clear();
		files.add(`weapon${MAIN_GAUCHE}_${JobId.KNIGHT}.spr`);
		const e = wielder(JobId.KNIGHT);
		e.weapon = MAIN_GAUCHE;
		expect(e.files.weapon.spr).toBe(`weapon${MAIN_GAUCHE}_${JobId.KNIGHT}.spr`);
	});

	it('draws the base weapon type for a class without the look sprite', () => {
		files.clear();
		files.add(`weapon${SHORTSWORD}_${JobId.DRUID}.spr`);
		const e = wielder(JobId.DRUID);
		e.weapon = MAIN_GAUCHE;
		expect(e.files.weapon.spr).toBe(`weapon${SHORTSWORD}_${JobId.DRUID}.spr`);
	});

	it('draws the look again after a change to a class that has it', () => {
		files.clear();
		files.add(`weapon${SHORTSWORD}_${JobId.DRUID}.spr`);
		files.add(`weapon${MAIN_GAUCHE}_${JobId.KNIGHT}.spr`);
		// The body loads, then the view puts the weapon back on
		files.add(`body${JobId.KNIGHT}_0.spr`);
		const e = wielder(JobId.DRUID);
		e.weapon = MAIN_GAUCHE;
		expect(e.weapon).toBe(MAIN_GAUCHE);

		e.job = JobId.KNIGHT;
		expect(e.files.weapon.spr).toBe(`weapon${MAIN_GAUCHE}_${JobId.KNIGHT}.spr`);
	});
});
