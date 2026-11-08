import JobId from 'DB/Jobs/JobConst.js';
import WeaponType from './WeaponType.js';
import WeaponTypeExpansion from './WeaponTypeExpansion.js';
import ItemTable from './ItemTable.js';

let skillAttackSliceResolver;

export function setSkillAttackSliceResolver(resolver) {
	skillAttackSliceResolver = resolver;
}

export function getSkillAttackSlice(job, weapon) {
	return skillAttackSliceResolver ? skillAttackSliceResolver(job, weapon) : getAttackSlice(job, weapon);
}

export function getWeaponType(itemID, realType = false, considerDualHandIds = false) {
	const id = Number(itemID);

	if (!Number.isInteger(id) || id < 0) {
		return WeaponType.NONE;
	}

	if (realType && id in WeaponTypeExpansion) {
		return WeaponTypeExpansion[id];
	}

	if (considerDualHandIds && id <= WeaponType.SWORD_AXE) {
		return id;
	}

	// if itemID is lesser then WeaponType.MAX, return the itemID
	if (id < WeaponType.MAX) {
		return id;
	}

	// look for classnum in ItemTable
	if (id in ItemTable && 'ClassNum' in ItemTable[id]) {
		const classNum = ItemTable[id].ClassNum;

		// look for classNum in WeaponTypeExpansion
		if (classNum in WeaponTypeExpansion) {
			return WeaponTypeExpansion[classNum];
		}

		// ClassNUm is the real weapon type
		return classNum;
	} else {
		// if itemID is not in ItemTable, try to find the corresponding weapon type based on the range id
		const ranges = [
			{ min: 1100, max: 1149, type: WeaponType.SWORD },
			{ min: 1150, max: 1199, type: WeaponType.TWOHANDSWORD },
			{ min: 1200, max: 1249, type: WeaponType.SHORTSWORD },
			{ min: 1250, max: 1299, type: WeaponType.KATAR },
			{ min: 1300, max: 1349, type: WeaponType.AXE },
			{ min: 1350, max: 1399, type: WeaponType.TWOHANDAXE },
			{ min: 1400, max: 1449, type: WeaponType.SPEAR },
			{ min: 1450, max: 1499, type: WeaponType.TWOHANDSPEAR },
			{ min: 1500, max: 1549, type: WeaponType.MACE },
			{ min: 1550, max: 1599, type: WeaponType.BOOK },
			{ min: 1600, max: 1699, type: WeaponType.ROD },
			{ min: 1700, max: 1749, type: WeaponType.BOW },
			{ min: 1750, max: 1799, type: WeaponType.NONE },
			{ min: 1800, max: 1849, type: WeaponType.KNUKLE },
			{ min: 1900, max: 1949, type: WeaponType.INSTRUMENT },
			{ min: 1950, max: 1999, type: WeaponType.WHIP },
			{ min: 20000, max: 20999, type: WeaponType.TWOHANDROD },
			{ min: 13000, max: 13099, type: WeaponType.SHORTSWORD },
			{ min: 13100, max: 13149, type: WeaponType.GUN_HANDGUN },
			{ min: 13150, max: 13199, type: WeaponType.GUN_RIFLE },
			{ min: 13300, max: 13399, type: WeaponType.SYURIKEN },
			{ min: 13400, max: 13499, type: WeaponType.SWORD },
			{ min: 18100, max: 18499, type: WeaponType.BOW },
			{ min: 21000, max: 21999, type: WeaponType.TWOHANDSWORD }
		];

		// These firearm subtypes lie inside the broader rifle item-ID range,
		// so classify them before that range returns the generic rifle type.
		const gunGatling = [13157, 13158, 13159, 13172, 13177];
		if (gunGatling.includes(id)) {
			return WeaponType.GUN_GATLING;
		}

		const gunShotGun = [13154, 13155, 13156, 13167, 13168, 13169, 13173, 13178];
		if (gunShotGun.includes(id)) {
			return WeaponType.GUN_SHOTGUN;
		}

		const gunGranade = [13160, 13161, 13162, 13174, 13179];
		if (gunGranade.includes(id)) {
			return WeaponType.GUN_GRANADE;
		}

		// Find the corresponding range
		for (const range of ranges) {
			if (id >= range.min && id <= range.max) {
				return range.type;
			}
		}
	}

	// if itemID is not in any range, return NONE
	return WeaponType.NONE;
}

export function getAttackSlice(job, weapon, resolveWeaponType = getWeaponType) {
	const type = resolveWeaponType(weapon, true);
	switch (job) {
		case JobId.MONK:
		case JobId.MONK_H:
		case JobId.MONK_B:
		case JobId.SURA:
		case JobId.SURA_H:
		case JobId.SURA_B:
		case JobId.SURA_2ND:
		case JobId.INQUISITOR:
		case JobId.INQUISITOR_RIDING:
			if (type === WeaponType.KNUKLE || type === WeaponType.NONE) {
				return { frame: 0, length: 5 };
			}
			break;
		case JobId.DO_SUMMONER:
		case JobId.DO_SUMMONER_B:
		case JobId.SPIRIT_HANDLER:
		case JobId.SPIRIT_HANDLER_RIDING1:
			// The bare-paw ATTACK1 only; a rod or foxtail plays the whole ATTACK2
			if (type === WeaponType.NONE) {
				return { frame: 0, length: 4 };
			}
			break;
	}
	return null;
}
