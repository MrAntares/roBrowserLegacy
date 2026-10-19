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

	it('treats view id 1 as a shield for a job that cannot dual wield', () => {
		expect(DB.isShield(1, JobId.SWORDMAN)).toBe(true);
		expect(DB.isShield(1)).toBe(true);
	});

	it('treats view id 1 as an offhand weapon for an assassin', () => {
		expect(DB.isShield(1, JobId.ASSASSIN)).toBe(false);
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
