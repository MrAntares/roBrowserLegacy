import { describe, it, expect } from 'vitest';
import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';

describe('DB.isShield', () => {
	it('recognises shield item ids regardless of job', () => {
		expect(DB.isShield(2101)).toBe(true);
		expect(DB.isShield(28901, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(460001, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(460500, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(469999, JobId.ASSASSIN)).toBe(true);
	});

	it('treats other item ids as offhand weapons', () => {
		expect(DB.isShield(1201)).toBe(false);
		expect(DB.isShield(1201, JobId.ASSASSIN)).toBe(false);
	});

	it('treats view id 1 as a shield for non-dual-wield jobs or when no job is given', () => {
		expect(DB.isShield(1, JobId.SWORDMAN)).toBe(true);
		expect(DB.isShield(1)).toBe(true);
	});

	it('preserves ambiguous view id as shield for an assassin when offhand is unknown', () => {
		expect(DB.isShield(1, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(1, JobId.ASSASSIN, undefined)).toBe(true);
		expect(DB.isShield(2, JobId.ASSASSIN)).toBe(true);
	});

	it('recognises shield view id 3 and 4 as shields even for assassins (cannot dual-wield 2h swords/spears)', () => {
		expect(DB.isShield(3, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(4, JobId.ASSASSIN)).toBe(true);
	});

	it('treats view id 1 as a shield for an assassin when explicitly flagged as not an offhand weapon', () => {
		expect(DB.isShield(1, JobId.ASSASSIN, false)).toBe(true);
		expect(DB.isShield(1, JobId.SWORDMAN, false)).toBe(true);
	});

	it('treats view id 1 as an offhand weapon when explicitly flagged as offhand weapon', () => {
		expect(DB.isShield(1, JobId.ASSASSIN, true)).toBe(false);
		expect(DB.isShield(1, JobId.SWORDMAN, true)).toBe(false);
	});

	it('distinguishes assassin shield view ID from weapon item ID and explicit offhand dagger', () => {
		// Guard view ID (1) when explicitly a shield (not offhand weapon)
		expect(DB.isShield(1, JobId.ASSASSIN, false)).toBe(true);
		// Dagger item ID (1201) is recognized as weapon, not shield
		expect(DB.isShield(1201, JobId.ASSASSIN)).toBe(false);
		// Dagger view ID (1: SHORTSWORD) when offhand weapon is flagged
		expect(DB.isShield(1, JobId.ASSASSIN, true)).toBe(false);
		// Guard view ID (1) when offhand weapon is unknown (preserves ambiguous view as shield)
		expect(DB.isShield(1, JobId.ASSASSIN)).toBe(true);
	});

	it('never treats 0 or invalid inputs as a shield', () => {
		expect(DB.isShield(0)).toBe(false);
		expect(DB.isShield(0, JobId.SWORDMAN)).toBe(false);
		expect(DB.isShield(null)).toBe(false);
		expect(DB.isShield(undefined)).toBe(false);
		expect(DB.isShield(-1)).toBe(false);
		expect(DB.isShield(1.5)).toBe(false);
	});

	it('keeps item and view detection separate and validates full item ranges', () => {
		expect(DB.isShieldItem(1)).toBe(false);
		expect(DB.isShieldItem(2101)).toBe(true);
		expect(DB.isShieldItem(28950)).toBe(true);
		expect(DB.isShieldItem(460500)).toBe(true);
		expect(DB.isShieldItem(469999)).toBe(true);
		expect(DB.isShieldItem(470000)).toBe(false);
		expect(DB.isShieldItem(2101.5)).toBe(false);
	});
});

describe('DB.getShieldPath', () => {
	it('returns null for 0 or non-existent shields', () => {
		expect(DB.getShieldPath(0, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getShieldPath(null, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getShieldPath(undefined, JobId.SWORDMAN, 1)).toBeNull();
	});

	it('returns correct sprite path for classic shields (viewId 1..4)', () => {
		const path = DB.getShieldPath(1, JobId.SWORDMAN, 1);
		expect(path).toContain('data/sprite/\xb9\xe6\xc6\xd0');
		expect(path).toContain('\xb0\xa1\xb5\xe5'); // Guard in Korean
	});

	it('returns an item-specific sprite path before the generic shield-view fallback', () => {
		const path = DB.getShieldPath(2101, JobId.SWORDMAN, 1);
		expect(path).toContain('_2101_\xb9\xe6\xc6\xd0');
		expect(DB.getShieldViewID(2101)).toBe(1);
		expect(DB.getShieldPath(DB.getShieldViewID(2101), JobId.SWORDMAN, 1)).toContain('\xb0\xa1\xb5\xe5');
	});

	it('only returns generic views supported by the job sprite', () => {
		expect(DB.getShieldPath(1, JobId.WIZARD, 1)).toBeTruthy();
		expect(DB.getShieldPath(2, JobId.WIZARD, 1)).toBeNull();
		expect(DB.getShieldPath(3, JobId.DRUID, 1)).toBeNull();
		expect(DB.getShieldPath(4, JobId.DRUID, 1)).toBeTruthy();
		expect(DB.getShieldPath(1, JobId.INQUISITOR, 1)).toBeNull();
		expect(DB.getShieldPath(5, JobId.SWORDMAN, 1)).toBeNull();
	});

	it('suppresses shields for mounted entities and shield-incompatible mount sprites', () => {
		expect(DB.getShieldPath(1, JobId.SWORDMAN, 1, true)).toBeNull();
		expect(DB.getShieldPath(2101, JobId.RANGER2, 1)).toBeNull();
	});

	it('uses weapon resources when the shield field carries a weapon item ID', () => {
		expect(DB.getShieldPath(1201, JobId.ASSASSIN, 1)).toBe(DB.getWeaponPath(1201, JobId.ASSASSIN, 1));
	});

	it('rejects fractional IDs and invalid sex values instead of building malformed paths', () => {
		expect(DB.getShieldPath(1.5, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getShieldPath(1, JobId.SWORDMAN, 2)).toBeNull();
		expect(DB.getWeaponPath(1.5, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getWeaponPath(1, JobId.SWORDMAN, -1)).toBeNull();
		expect(DB.getWeaponTrail(0, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getWeaponTrail(1.5, JobId.SWORDMAN, 1)).toBeNull();
		expect(DB.getWeaponTrail(999999, JobId.DO_SUMMONER, 1)).toBeNull();
	});
});
