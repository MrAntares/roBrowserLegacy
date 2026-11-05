import { describe, expect, it } from 'vitest';
import JobId from 'DB/Jobs/JobConst.js';
import JobNameTable from 'DB/Jobs/JobNameTable.js';
import WeaponAction from 'DB/Jobs/WeaponAction.js';
import WeaponJobTable from 'DB/Jobs/WeaponJobTable.js';

describe('WeaponJobTable job coverage', () => {
	it('provides a weapon sprite job for every named job', () => {
		const missing = Object.keys(JobNameTable).filter(job => !WeaponJobTable[job]);
		expect(missing).toEqual([]);
		const actionJobsMissingSprite = Object.keys(WeaponAction).filter(job => !WeaponJobTable[job]);
		expect(actionJobsMissingSprite).toEqual([]);
	});

	it('uses sprite inheritance where WeaponJobTable explicitly defines it', () => {
		const inheritedJobs = [
			[JobId.DRAGON_KNIGHT, JobId.RUNE_KNIGHT],
			[JobId.MEISTER, JobId.MECHANIC],
			[JobId.SHADOW_CROSS, JobId.GUILLOTINE_CROSS],
			[JobId.ARCH_MAGE, JobId.WARLOCK],
			[JobId.CARDINAL, JobId.ARCHBISHOP],
			[JobId.WINDHAWK, JobId.RANGER],
			[JobId.IMPERIAL_GUARD, JobId.ROYAL_GUARD],
			[JobId.BIOLO, JobId.GENETIC],
			[JobId.ABYSS_CHASER, JobId.SHADOW_CHASER],
			[JobId.ELEMENTAL_MASTER, JobId.SORCERER],
			[JobId.INQUISITOR, JobId.SURA],
			[JobId.TROUBADOUR, JobId.MINSTREL],
			[JobId.TROUVERE, JobId.WANDERER],
			[JobId.SPIRIT_HANDLER_RIDING1, JobId.SPIRIT_HANDLER]
		];

		for (const [job, inheritedJob] of inheritedJobs) {
			expect(WeaponJobTable[job], `job ${job} should inherit ${inheritedJob}`).toBe(WeaponJobTable[inheritedJob]);
		}
	});
});
