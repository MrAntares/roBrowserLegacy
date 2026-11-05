import { describe, expect, it } from 'vitest';

import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';
import WeaponAction from 'DB/Jobs/WeaponAction.js';
import WeaponJobTable from 'DB/Jobs/WeaponJobTable.js';
import WeaponTable from 'DB/Items/WeaponTable.js';
import WeaponType from 'DB/Items/WeaponType.js';
import WeaponTypeExpansion from 'DB/Items/WeaponTypeExpansion.js';

const BASE_TYPES = Array.from({ length: WeaponType.TWOHANDROD }, (_, index) => index + 1);
const ACTION_JOBS = Object.keys(WeaponAction).map(Number).filter(Number.isInteger);
const PRIEST_KNUCKLE_EXCEPTION_JOBS = new Set([
	JobId.PRIEST,
	JobId.PRIEST_H,
	JobId.PRIEST_B,
	JobId.ARCHBISHOP,
	JobId.ARCHBISHOP_H,
	JobId.ARCHBISHOP_B,
	JobId.ARCH_BISHOP_2ND,
	JobId.CARDINAL,
	JobId.CARDINAL_RIDING
]);

describe('weapon resource matrix across classes and visual types', () => {
	it('resolves generic weapon paths for every action job and base weapon type', () => {
		for (const job of ACTION_JOBS) {
			const spriteJob = WeaponJobTable[job];
			expect(spriteJob, `job ${job} has a sprite-job alias`).toBeTruthy();

			for (const type of BASE_TYPES) {
				if (type === WeaponType.KNUKLE && PRIEST_KNUCKLE_EXCEPTION_JOBS.has(job)) {
					continue;
				}
				const path = DB.getWeaponPath(type, job, 1);
				expect(path, `job ${job}, weapon type ${type}`).toContain(`/${spriteJob}/`);
				expect(path).toContain(WeaponTable[type] || `_${type}`);
				expect(Number.isFinite(DB.getWeaponAction(type, job, 1))).toBe(true);
			}
		}
	});

	it('maps every expansion view to its base category and fallback path', () => {
		for (const [view, baseType] of Object.entries(WeaponTypeExpansion)) {
			const viewId = Number(view);
			expect(DB.getWeaponType(viewId, true), `view ${viewId}`).toBe(baseType);
			expect(DB.getWeaponPath(baseType, JobId.KNIGHT, 1), `fallback for view ${viewId}`).toBeTruthy();
			expect(DB.getWeaponAction(viewId, JobId.KNIGHT, 1)).toBe(DB.getWeaponAction(baseType, JobId.KNIGHT, 1));
		}
	});

	it('keeps two-handed, ranged, Huuma/shuriken, and Fox Tail types distinct', () => {
		const checks = [
			[1150, WeaponType.TWOHANDSWORD],
			[1450, WeaponType.TWOHANDSPEAR],
			[1350, WeaponType.TWOHANDAXE],
			[20000, WeaponType.TWOHANDROD],
			[1700, WeaponType.BOW],
			[13100, WeaponType.GUN_HANDGUN],
			[13150, WeaponType.GUN_RIFLE],
			[13157, WeaponType.GUN_GATLING],
			[13154, WeaponType.GUN_SHOTGUN],
			[13160, WeaponType.GUN_GRANADE],
			[13300, WeaponType.SYURIKEN]
		];
		for (const [itemId, expectedType] of checks) {
			expect(DB.getWeaponType(itemId), `item ${itemId}`).toBe(expectedType);
		}

		expect(DB.getWeaponType(WeaponType.FOXTAIL_METAL, true)).toBe(WeaponType.ROD);
		expect(DB.getWeaponType(WeaponType.Staff_Of_Soul, true)).toBe(WeaponType.TWOHANDROD);
		expect(DB.getWeaponType(WeaponType.Wizardy_Staff, true)).toBe(WeaponType.TWOHANDROD);
		expect(DB.getWeaponAction(WeaponType.SYURIKEN, JobId.NINJA, 1)).toBeGreaterThan(0);
		expect(DB.getWeaponAction(WeaponType.BOW, JobId.HUNTER, 1)).toBeGreaterThan(0);
		expect(DB.getWeaponAction(WeaponType.GUN_RIFLE, JobId.GUNSLINGER, 1)).toBeGreaterThan(0);
		for (const type of [WeaponType.GUN_GATLING, WeaponType.GUN_SHOTGUN, WeaponType.GUN_GRANADE]) {
			expect(DB.getWeaponAction(type, JobId.GUNSLINGER, 1)).toBeGreaterThan(0);
			expect(DB.isDualWeapon(JobId.GUNSLINGER, 1, type)).toBe(true);
		}
		expect(DB.isDualWeapon(JobId.NINJA, 1, WeaponType.SYURIKEN)).toBe(true);
	});

	it('retains supported weapon-specific fallbacks for the Priest family exception', () => {
		expect(DB.getWeaponPath(WeaponType.KNUKLE, JobId.PRIEST, 1)).toBeNull();
		expect(DB.getWeaponPath(WeaponType.KNUKLE, JobId.MONK, 1)).toBeTruthy();
		expect(DB.getWeaponPath(WeaponType.KNUKLE, JobId.INQUISITOR, 1)).toBeTruthy();
	});
});
