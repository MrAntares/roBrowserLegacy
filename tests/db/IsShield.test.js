import { describe, it, expect } from 'vitest';
import DB from 'DB/DBManager.js';
import JobId from 'DB/Jobs/JobConst.js';

describe('DB.isShield', () => {
	it('recognises shield item ids regardless of job', () => {
		expect(DB.isShield(2101)).toBe(true);
		expect(DB.isShield(28901, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(460001, JobId.ASSASSIN)).toBe(true);
	});

	it('treats other item ids as offhand weapons', () => {
		expect(DB.isShield(1201)).toBe(false);
		expect(DB.isShield(1201, JobId.ASSASSIN)).toBe(false);
	});

	it('treats view id 1 as a shield for both swordman and assassin', () => {
		expect(DB.isShield(1, JobId.SWORDMAN)).toBe(true);
		expect(DB.isShield(1, JobId.ASSASSIN)).toBe(true);
		expect(DB.isShield(1)).toBe(true);
	});

	it('treats view id 1 as an offhand weapon when explicitly flagged as offhand weapon', () => {
		expect(DB.isShield(1, JobId.ASSASSIN, true)).toBe(false);
		expect(DB.isShield(1, JobId.SWORDMAN, true)).toBe(false);
	});

	it('distinguishes assassin shield view ID from weapon item ID and explicit offhand dagger', () => {
		// Guard view ID (1) is recognized as shield
		expect(DB.isShield(1, JobId.ASSASSIN)).toBe(true);
		// Dagger item ID (1201) is recognized as weapon, not shield
		expect(DB.isShield(1201, JobId.ASSASSIN)).toBe(false);
		// Dagger view ID (1: SHORTSWORD) when offhand weapon is flagged
		expect(DB.isShield(1, JobId.ASSASSIN, true)).toBe(false);
	});

	it('never treats 0 as a shield', () => {
		expect(DB.isShield(0)).toBe(false);
		expect(DB.isShield(0, JobId.SWORDMAN)).toBe(false);
	});

	it('keeps item and view detection separate', () => {
		expect(DB.isShieldItem(1)).toBe(false);
		expect(DB.isShieldItem(2101)).toBe(true);
	});
});
