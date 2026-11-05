import { describe, expect, it } from 'vitest';
import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';
import WeaponType from 'DB/Items/WeaponType.js';

describe('DB weapon type validation', () => {
	it.each([NaN, Infinity, -1, 1.5])('rejects invalid weapon ID %s', id => {
		expect(DB.getWeaponType(id)).toBe(WeaponType.NONE);
		expect(DB.getWeaponViewID(id)).toBe(0);
	});

	it('keeps weapon type and view ID handling for numeric strings', () => {
		expect(DB.getWeaponType('1')).toBe(WeaponType.SHORTSWORD);
		expect(DB.getWeaponViewID('1')).toBe(WeaponType.SHORTSWORD);
	});
});

describe('DB dual weapon checks', () => {
	it('recognises two-handed swords for Knight-family jobs', () => {
		expect(DB.isDualWeapon(JobId.KNIGHT, 1, WeaponType.TWOHANDSWORD)).toBe(true);
		expect(DB.isDualWeapon(JobId.RUNE_KNIGHT, 1, WeaponType.TWOHANDSWORD)).toBe(true);
	});

	it('recognises combined Assassin types, and rejects invalid types', () => {
		expect(DB.isDualWeapon(JobId.ASSASSIN, 1, WeaponType.SWORD_AXE)).toBe(true);
		expect(DB.isDualWeapon(JobId.GUILLOTINE_CROSS_2ND, 1, WeaponType.KATAR)).toBe(true);
		expect(DB.isDualWeapon(JobId.ASSASSIN, 1, WeaponType.MACE)).toBe(false);
		expect(DB.isDualWeapon(JobId.KNIGHT, 1, WeaponType.MAX)).toBe(false);
		expect(DB.isDualWeapon(JobId.KNIGHT, 1, '3')).toBe(false);
	});

	it.each([
		[JobId.GUILLOTINE_CROSS_2ND, WeaponType.KATAR],
		[JobId.SHADOW_CROSS_RIDING, WeaponType.AXE_AXE],
		[JobId.DRAGON_KNIGHT_RIDING, WeaponType.TWOHANDSPEAR],
		[JobId.CARDINAL_RIDING, WeaponType.BOOK],
		[JobId.ARCH_BISHOP_2ND, WeaponType.BOOK],
		[JobId.ARCH_MAGE_RIDING, WeaponType.TWOHANDROD, 0],
		[JobId.MEISTER_RIDING, WeaponType.TWOHANDAXE],
		[JobId.WINDHAWK_RIDING, WeaponType.BOW],
		[JobId.ELEMENTAL_MASTER_RIDING, WeaponType.BOOK],
		[JobId.BIOLO_RIDING, WeaponType.AXE],
		[JobId.IMPERIAL_GUARD_RIDING, WeaponType.TWOHANDSPEAR],
		[JobId.INQUISITOR_RIDING, WeaponType.KNUKLE],
		[JobId.ABYSS_CHASER_RIDING, WeaponType.BOW],
		[JobId.TROUBADOUR_RIDING, WeaponType.BOW],
		[JobId.TROUVERE_RIDING, WeaponType.BOW],
		[JobId.NIGHT_WATCH, WeaponType.GUN_RIFLE],
		[JobId.SHINKIRO, WeaponType.SYURIKEN],
		[JobId.SHIRANUI, WeaponType.SYURIKEN],
		[JobId.HYPER_NOVICE, WeaponType.TWOHANDSWORD]
	])('applies weapon classification to advanced/riding job %s', (job, type, sex = 1) => {
		expect(DB.isDualWeapon(job, sex, type)).toBe(true);
	});

	it('applies Assassin Katar motion even when dual-weapon timing is enabled', () => {
		expect(DB.getPCAttackMotion(JobId.ASSASSIN, 1, WeaponType.KATAR, true)).toBe(3.0);
		expect(DB.getPCAttackMotion(JobId.GUILLOTINE_CROSS_2ND, 1, WeaponType.KATAR, true)).toBe(3.0);
	});

	it('inherits Assassin weapon actions for Guillotine Cross 2nd', () => {
		expect(DB.getWeaponAction(WeaponType.KATAR, JobId.GUILLOTINE_CROSS_2ND, 1)).toBe(
			DB.getWeaponAction(WeaponType.KATAR, JobId.ASSASSIN, 1)
		);
	});
});

describe('DB dual-wield combination mapping', () => {
	it.each([
		[WeaponType.SHORTSWORD, WeaponType.SHORTSWORD, WeaponType.SHORTSWORD_SHORTSWORD],
		[WeaponType.SHORTSWORD, WeaponType.SWORD, WeaponType.SHORTSWORD_SWORD],
		[WeaponType.SWORD, WeaponType.SHORTSWORD, WeaponType.SHORTSWORD_SWORD],
		[WeaponType.SWORD, WeaponType.SWORD, WeaponType.SWORD_SWORD],
		[WeaponType.SHORTSWORD, WeaponType.AXE, WeaponType.SHORTSWORD_AXE],
		[WeaponType.AXE, WeaponType.SHORTSWORD, WeaponType.SHORTSWORD_AXE],
		[WeaponType.SWORD, WeaponType.AXE, WeaponType.SWORD_AXE],
		[WeaponType.AXE, WeaponType.SWORD, WeaponType.SWORD_AXE],
		[WeaponType.AXE, WeaponType.AXE, WeaponType.AXE_AXE]
	])('maps weapon types %s and %s to combined type %s', (primary, offhand, combined) => {
		expect(DB.mountWeapon(primary, offhand)).toBe(combined);
	});

	it('does not classify unsupported hand combinations by colliding sums', () => {
		expect(DB.mountWeapon(WeaponType.TWOHANDSWORD, WeaponType.SHORTSWORD)).toBe(WeaponType.TWOHANDSWORD);
		expect(DB.mountWeapon(WeaponType.MACE, WeaponType.ROD)).toBe(WeaponType.MACE);
	});

	it.each([
		[1100, 1101, WeaponType.SWORD_SWORD],
		[1100, 1200, WeaponType.SHORTSWORD_SWORD],
		[1200, 1100, WeaponType.SHORTSWORD_SWORD],
		[1100, 1300, WeaponType.SWORD_AXE],
		[1200, 1300, WeaponType.SHORTSWORD_AXE],
		[1200, 1201, WeaponType.SHORTSWORD_SHORTSWORD],
		[1300, 1301, WeaponType.AXE_AXE],
		[500000, 509999, WeaponType.SWORD_SWORD],
		[510000, 519999, WeaponType.SHORTSWORD_SHORTSWORD],
		[520000, 529999, WeaponType.AXE_AXE]
	])('maps original item ID ranges %s + %s to %s', (first, second, combined) => {
		expect(DB.getDualWieldWeaponType(first, second)).toBe(combined);
	});

	it('returns the original single-weapon type when the second ID is outside the dual-wield ranges', () => {
		expect(DB.getDualWieldWeaponType(1100, 2101)).toBe(WeaponType.SWORD);
		expect(DB.getDualWieldWeaponType(1200, 1400)).toBe(WeaponType.SHORTSWORD);
		expect(DB.getDualWieldWeaponType(1150, 1200)).toBe(WeaponType.NONE);
	});
});

describe('DB class-specific weapon resource rules', () => {
	it('builds reference-compatible generic weapon effect paths', () => {
		const effectPath = DB.getWeaponEffectPath(WeaponType.SWORD, JobId.KNIGHT, 1);
		expect(effectPath).toContain('_\xb0\xcb_\xb0\xcb\xb1\xa4');
		expect(effectPath).toContain('data/sprite/');
		expect(DB.getWeaponEffectPath(-1, JobId.STAR, 1, 1)).toContain('_\xb9\xdf\xb1\xa4');
		expect(DB.getWeaponEffectPath(WeaponType.NONE, JobId.KNIGHT, 1)).toBeNull();
		expect(DB.getWeaponEffectPath(WeaponType.SWORD, JobId.KNIGHT, 2)).toBeNull();
		expect(DB.getWeaponPath(WeaponType.SWORD, JobId.DO_SUMMONER, 1)).toContain('\xb5\xb5\xb6\xf7\xc1\xb7');
	});

	it.each([JobId.DO_SUMMONER, JobId.DO_SUMMONER_B, JobId.DO_CART_SUMMONER1])(
		'classifies Doram job %s as a base class',
		job => {
			expect(DB.getJobClass(job)).toBe('Base_Class');
		}
	);

	it.each([
		JobId.PRIEST,
		JobId.PRIEST_H,
		JobId.PRIEST_B,
		JobId.ARCHBISHOP,
		JobId.ARCHBISHOP_H,
		JobId.ARCHBISHOP_B,
		JobId.ARCH_BISHOP_2ND,
		JobId.CARDINAL,
		JobId.CARDINAL_RIDING
	])('does not resolve a generic knuckle sprite for priest family job %s', job => {
		expect(DB.getWeaponPath(WeaponType.KNUKLE, job, 1)).toBeNull();
	});

	it('keeps knuckle paths for classes outside the Priest family', () => {
		expect(DB.getWeaponPath(WeaponType.KNUKLE, JobId.INQUISITOR, 1)).not.toBeNull();
		expect(DB.getWeaponPath(WeaponType.KNUKLE, JobId.MONK, 1)).not.toBeNull();
	});
});
