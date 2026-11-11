import JobId from 'DB/Jobs/JobConst.js';
import BabyTable from 'DB/Jobs/BabyTable.js';

export function isNPC(jobid) {
	return (
		(jobid > 45 && jobid < 130) ||
		(jobid >= 401 && jobid < 1000) ||
		(jobid >= 10001 && jobid < 19999) ||
		(jobid > 22300 && jobid < 22313) ||
		jobid == 32767 ||
		jobid == -1
	);
}

export function isMercenary(jobid) {
	return jobid >= 6017 && jobid <= 6046;
}

export function isHomunculus(jobid) {
	return (jobid >= 6001 && jobid <= 6016) || (jobid >= 6048 && jobid <= 6052);
}

export function isMonster(jobid) {
	return (
		(jobid >= 1001 && jobid <= 3999) ||
		(jobid >= 20000 && jobid < 20834) ||
		(jobid >= 20852 && jobid < 22301) ||
		(jobid > 22313 && jobid < 22322)
	); // 22322 = last monster released on EP21
}

export function isPlayer(jobid) {
	return (jobid >= 0 && jobid < 45) || (jobid >= 4001 && jobid <= 4361) || jobid == 4294967294;
}

export function isDoram(jobid) {
	return (jobid >= 4217 && jobid <= 4220) || jobid === 4308 || jobid === 4315;
}

export function isBaby(jobid) {
	return BabyTable.indexOf(jobid) > -1;
}

export function isAssassin(jobid) {
	return this.S_JOBS_ASSASSIN.has(jobid);
}

export function isHunter(jobid) {
	return this.S_JOBS_HUNTER.has(jobid);
}

export function isMonk(jobid) {
	return this.S_JOBS_MONK.has(jobid);
}

export function isSuperNovice(jobid) {
	return this.S_JOBS_SN.has(jobid);
}

export function isTaeKwon(jobid) {
	return this.S_JOBS_TAEKWON.has(jobid);
}

export function isGunslinger(jobid) {
	return this.S_JOBS_GS.has(jobid);
}

export function isRoyalGuard(jobid) {
	return this.S_JOBS_RG.has(jobid);
}

export function isMadogear(jobid) {
	return this.S_JOBS_MADO.has(jobid);
}

export function isElem(jobid) {
	return (jobid >= 2114 && jobid <= 2125) || (jobid >= 20816 && jobid <= 20820);
}

export function isAbr(jobid) {
	return jobid >= 20834 && jobid <= 20837;
}

export function isBionic(jobid) {
	return jobid >= 20848 && jobid <= 20851;
}

export function isWarp(jobid) {
	return jobid == 45 || jobid == 139;
}

export function getJobClass(job) {
	switch (job) {
		case JobId.NOVICE:
		case JobId.DO_SUMMONER:
		case JobId.DO_SUMMONER_B:
		case JobId.DO_CART_SUMMONER1:
			return 'Base_Class';

		case JobId.SWORDMAN:
		case JobId.MAGICIAN:
		case JobId.ARCHER:
		case JobId.ACOLYTE:
		case JobId.MERCHANT:
		case JobId.THIEF:
			return 'First_Class';

		case JobId.KNIGHT:
		case JobId.PRIEST:
		case JobId.WIZARD:
		case JobId.BLACKSMITH:
		case JobId.HUNTER:
		case JobId.ASSASSIN:
		case JobId.KNIGHT2:
		case JobId.CRUSADER:
		case JobId.MONK:
		case JobId.SAGE:
		case JobId.ROGUE:
		case JobId.ALCHEMIST:
		case JobId.BARD:
		case JobId.DANCER:
		case JobId.CRUSADER2:
		case JobId.SUPERNOVICE:
			return 'Second_Class';

		case JobId.GUNSLINGER:
		case JobId.NINJA:
		case JobId.TAEKWON:
			return 'Expanded_First_Class';

		case JobId.NOVICE_H:
			return 'Rebirth_Class';

		case JobId.SWORDMAN_H:
		case JobId.MAGICIAN_H:
		case JobId.ARCHER_H:
		case JobId.ACOLYTE_H:
		case JobId.MERCHANT_H:
		case JobId.THIEF_H:
			return 'Rebirth_First_Class';

		case JobId.KNIGHT_H:
		case JobId.PRIEST_H:
		case JobId.WIZARD_H:
		case JobId.BLACKSMITH_H:
		case JobId.HUNTER_H:
		case JobId.ASSASSIN_H:
		case JobId.KNIGHT2_H:
		case JobId.CRUSADER_H:
		case JobId.MONK_H:
		case JobId.SAGE_H:
		case JobId.ROGUE_H:
		case JobId.ALCHEMIST_H:
		case JobId.BARD_H:
		case JobId.DANCER_H:
		case JobId.CRUSADER2_H:
			return 'Rebirth_Second_Class';

		case JobId.STAR:
		case JobId.STAR2:
		case JobId.LINKER:
		case JobId.KAGEROU:
		case JobId.OBORO:
		case JobId.REBELLION:
			return 'Expanded_Second_Class';

		case JobId.RUNE_KNIGHT:
		case JobId.WARLOCK:
		case JobId.RANGER:
		case JobId.ARCHBISHOP:
		case JobId.MECHANIC:
		case JobId.ROYAL_GUARD:
		case JobId.SORCERER:
		case JobId.MINSTREL:
		case JobId.WANDERER:
		case JobId.SURA:
		case JobId.GENETIC:
		case JobId.SHADOW_CHASER:
		case JobId.RUNE_KNIGHT2:
		case JobId.ROYAL_GUARD2:
		case JobId.RANGER2:
		case JobId.MECHANIC2:
			return 'Normal_Third_Class';

		case JobId.RUNE_KNIGHT_H:
		case JobId.WARLOCK_H:
		case JobId.RANGER_H:
		case JobId.ARCHBISHOP_H:
		case JobId.MECHANIC_H:
		case JobId.GUILLOTINE_CROSS_H:
		case JobId.ROYAL_GUARD_H:
		case JobId.SORCERER_H:
		case JobId.MINSTREL_H:
		case JobId.WANDERER_H:
		case JobId.SURA_H:
		case JobId.GENETIC_H:
		case JobId.SHADOW_CHASER_H:
			return 'Rebirth_Third_Class';

		case JobId.EMPEROR:
		case JobId.REAPER:
		case JobId.EMPEROR2:
			return 'Expanded_Third_Class';

		case JobId.DRAGON_KNIGHT:
		case JobId.MEISTER:
		case JobId.SHADOW_CROSS:
		case JobId.ARCH_MAGE:
		case JobId.CARDINAL:
		case JobId.WINDHAWK:
		case JobId.IMPERIAL_GUARD:
		case JobId.BIOLO:
		case JobId.ABYSS_CHASER:
		case JobId.ELEMENTAL_MASTER:
		case JobId.INQUISITOR:
		case JobId.TROUBADOUR:
		case JobId.TROUVERE:
		case JobId.WINDHAWK2:
		case JobId.MEISTER2:
		case JobId.DRAGON_KNIGHT2:
		case JobId.IMPERIAL_GUARD2:
		case JobId.SKY_EMPEROR:
		case JobId.SOUL_ASCETIC:
		case JobId.SHINKIRO:
		case JobId.SHIRANUI:
		case JobId.NIGHT_WATCH:
		case JobId.HYPER_NOVICE:
		case JobId.SPIRIT_HANDLER:
		case JobId.SKY_EMPEROR2:
			return 'Fourth_Class';

		default:
			return 'Base_Class';
	}
}
