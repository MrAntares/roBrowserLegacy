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
		getWeaponType: (id, realType) => (realType && id === MAIN_GAUCHE ? SHORTSWORD : id),
		getWeaponEffectPath: (id, job) => (id === -1 ? `class-effect${job}` : null),
		getShieldPath: (id, job, sex, isMounted) =>
			isMounted ? null : id === 2101 ? `shield-item${job}` : id === 1 ? `shield-generic${job}` : null,
		getShieldViewID: id => (id === 2101 ? 1 : id)
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
const { default: Client } = await import('Core/Client.js');

function loadAvailableFile(path, onLoad, onError) {
	return files.has(path) ? onLoad && onLoad() : onError && onError();
}

function wielder(job) {
	const e = { _job: job, _sex: 0, _bodypalette: 0, costume: 0, sound: {} };
	EntityViewInit.call(e);
	e.job = job;
	return e;
}

describe('EntityView weapon with an expansion look', () => {
	it('loads class equipment effects independently of a weapon', () => {
		files.clear();
		files.add(`class-effect${JobId.STAR}.spr`);
		const e = wielder(JobId.STAR);
		e.weapon = 0;
		expect(e.files.weapon_effect.spr).toBe(`class-effect${JobId.STAR}.spr`);
		expect(e.files.weapon_effect.act).toBe(`class-effect${JobId.STAR}.act`);
	});

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

	it('does not let an older weapon load replace a newer equipment choice', () => {
		files.clear();
		const e = wielder(JobId.KNIGHT);
		const pending = [];
		Client.loadFile.mockImplementation((path, onLoad, onError) => {
			pending.push({ path, onLoad, onError });
		});

		e.weapon = MAIN_GAUCHE;
		e.weapon = SHORTSWORD;
		pending.find(load => load.path === `weapon${MAIN_GAUCHE}_${JobId.KNIGHT}.spr`).onLoad();
		expect(e.files.weapon.spr).toBeNull();

		pending.find(load => load.path === `weapon${SHORTSWORD}_${JobId.KNIGHT}.spr`).onLoad();
		expect(e.files.weapon.spr).toBe(`weapon${SHORTSWORD}_${JobId.KNIGHT}.spr`);
		Client.loadFile.mockImplementation(loadAvailableFile);
	});

	it('clears weapon trail resources when the weapon is removed', () => {
		files.clear();
		const e = wielder(JobId.KNIGHT);
		e.files.weapon_trail.spr = 'old-trail.spr';
		e.files.weapon_trail.act = 'old-trail.act';
		e.weapon = 0;
		expect(e.files.weapon_trail.spr).toBeNull();
		expect(e.files.weapon_trail.act).toBeNull();
	});
});

describe('EntityView shield resource fallback', () => {
	it('loads a generic shield view if the item-specific ACT or SPR is missing', () => {
		files.clear();
		files.add(`shield-generic${JobId.KNIGHT}.act`);
		files.add(`shield-generic${JobId.KNIGHT}.spr`);
		const e = wielder(JobId.KNIGHT);
		e.shield = 2101;
		expect(e.files.shield.act).toBe(`shield-generic${JobId.KNIGHT}.act`);
		expect(e.files.shield.spr).toBe(`shield-generic${JobId.KNIGHT}.spr`);
	});

	it('keeps an available item-specific shield sprite', () => {
		files.clear();
		files.add(`shield-item${JobId.KNIGHT}.act`);
		files.add(`shield-item${JobId.KNIGHT}.spr`);
		const e = wielder(JobId.KNIGHT);
		e.shield = 2101;
		expect(e.files.shield.act).toBe(`shield-item${JobId.KNIGHT}.act`);
		expect(e.files.shield.spr).toBe(`shield-item${JobId.KNIGHT}.spr`);
	});

	it('does not load a shield while the entity uses a mounted sprite', () => {
		files.clear();
		files.add(`shield-item${JobId.KNIGHT}.act`);
		files.add(`shield-item${JobId.KNIGHT}.spr`);
		files.add(`shield-generic${JobId.KNIGHT}.act`);
		files.add(`shield-generic${JobId.KNIGHT}.spr`);
		const e = wielder(JobId.KNIGHT);
		e.costume = JobId.KNIGHT2;
		e.shield = 2101;
		expect(e.files.shield.act).toBeNull();
		expect(e.files.shield.spr).toBeNull();
	});
});
