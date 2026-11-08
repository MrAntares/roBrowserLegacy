import JobId from 'DB/Jobs/JobConst.js';
import WeaponType from 'DB/Items/WeaponType.js';
import { getWeaponType, getAttackSlice } from './WeaponQueries.js';
import ItemTable from 'DB/Items/ItemTable.js';
import ShieldTable from 'DB/Items/ShieldTable.js';
import WeaponTable from 'DB/Items/WeaponTable.js';
import WeaponJobTable from 'DB/Jobs/WeaponJobTable.js';
import WeaponAction from 'DB/Jobs/WeaponAction.js';
import WeaponTrailTable from 'DB/Items/WeaponTrailTable.js';
import WeaponSoundTable from 'DB/Items/WeaponSoundTable.js';
import WeaponHitSoundTable from 'DB/Items/WeaponHitSoundTable.js';
import JobHitSoundTable from 'DB/Jobs/JobHitSoundTable.js';

const ASSASSIN_DUAL_WEAPON_TYPES = new Set([
	WeaponType.KATAR,
	WeaponType.SHORTSWORD_SHORTSWORD,
	WeaponType.SHORTSWORD_SWORD,
	WeaponType.SHORTSWORD_AXE,
	WeaponType.SWORD_SWORD,
	WeaponType.SWORD_AXE,
	WeaponType.AXE_AXE
]);

const PRIEST_KNUCKLE_INCOMPATIBLE_JOBS = new Set([
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

const SHIELD_VIEW_1_JOBS = new Set([
	JobId.NOVICE,
	JobId.MAGICIAN,
	JobId.ARCHER,
	JobId.WIZARD,
	JobId.HUNTER,
	JobId.SAGE,
	JobId.BARD,
	JobId.DANCER,
	JobId.SUPERNOVICE,
	JobId.NOVICE_H,
	JobId.MAGICIAN_H,
	JobId.ARCHER_H,
	JobId.WIZARD_H,
	JobId.HUNTER_H,
	JobId.SAGE_H,
	JobId.BARD_H,
	JobId.DANCER_H,
	JobId.NOVICE_B,
	JobId.MAGICIAN_B,
	JobId.ARCHER_B,
	JobId.WIZARD_B,
	JobId.HUNTER_B,
	JobId.SAGE_B,
	JobId.BARD_B,
	JobId.DANCER_B,
	JobId.SUPERNOVICE_B,
	JobId.WARLOCK,
	JobId.RANGER,
	JobId.WARLOCK_H,
	JobId.RANGER_H,
	JobId.SORCERER,
	JobId.MINSTREL,
	JobId.WANDERER,
	JobId.SORCERER_H,
	JobId.MINSTREL_H,
	JobId.WANDERER_H,
	JobId.WARLOCK_B,
	JobId.RANGER_B,
	JobId.SORCERER_B,
	JobId.MINSTREL_B,
	JobId.WANDERER_B,
	JobId.SUPERNOVICE2,
	JobId.SUPERNOVICE2_B,
	JobId.ARCH_MAGE,
	JobId.WINDHAWK,
	JobId.ELEMENTAL_MASTER,
	JobId.TROUBADOUR,
	JobId.TROUVERE,
	JobId.HYPER_NOVICE
]);

const SHIELD_VIEW_1_2_JOBS = new Set([
	JobId.ACOLYTE,
	JobId.MERCHANT,
	JobId.THIEF,
	JobId.PRIEST,
	JobId.BLACKSMITH,
	JobId.ASSASSIN,
	JobId.ROGUE,
	JobId.ALCHEMIST,
	JobId.ACOLYTE_H,
	JobId.MERCHANT_H,
	JobId.THIEF_H,
	JobId.PRIEST_H,
	JobId.BLACKSMITH_H,
	JobId.ASSASSIN_H,
	JobId.ROGUE_H,
	JobId.ALCHEMIST_H,
	JobId.ACOLYTE_B,
	JobId.MERCHANT_B,
	JobId.THIEF_B,
	JobId.PRIEST_B,
	JobId.BLACKSMITH_B,
	JobId.ASSASSIN_B,
	JobId.ROGUE_B,
	JobId.ALCHEMIST_B,
	JobId.ARCHBISHOP,
	JobId.MECHANIC,
	JobId.GUILLOTINE_CROSS,
	JobId.ARCHBISHOP_H,
	JobId.MECHANIC_H,
	JobId.GUILLOTINE_CROSS_H,
	JobId.GENETIC,
	JobId.SHADOW_CHASER,
	JobId.GENETIC_H,
	JobId.SHADOW_CHASER_H,
	JobId.ARCHBISHOP_B,
	JobId.MECHANIC_B,
	JobId.GUILLOTINE_CROSS_B,
	JobId.GENETIC_B,
	JobId.SHADOW_CHASER_B,
	JobId.MEISTER,
	JobId.SHADOW_CROSS,
	JobId.CARDINAL,
	JobId.BIOLO,
	JobId.ABYSS_CHASER
]);

const SHIELD_VIEW_1_4_JOBS = new Set([
	JobId.SWORDMAN,
	JobId.KNIGHT,
	JobId.CRUSADER,
	JobId.SWORDMAN_H,
	JobId.KNIGHT_H,
	JobId.CRUSADER_H,
	JobId.SWORDMAN_B,
	JobId.KNIGHT_B,
	JobId.CRUSADER_B,
	JobId.RUNE_KNIGHT,
	JobId.RUNE_KNIGHT_H,
	JobId.ROYAL_GUARD,
	JobId.ROYAL_GUARD_H,
	JobId.RUNE_KNIGHT_B,
	JobId.ROYAL_GUARD_B,
	JobId.DO_SUMMONER,
	JobId.DO_SUMMONER_B,
	JobId.DRAGON_KNIGHT,
	JobId.IMPERIAL_GUARD,
	JobId.DRAGON_KNIGHT_RIDING,
	JobId.IMPERIAL_GUARD_RIDING,
	JobId.SPIRIT_HANDLER
]);

const SHIELD_VIEW_1_2_4_JOBS = new Set([JobId.DRUID, JobId.DRUID_B, JobId.KARNOS, JobId.KARNOS_B, JobId.ALITEA]);

const SHIELD_ITEM_UNSUPPORTED_JOBS = new Set([
	JobId.MARRIED,
	JobId.XMAS,
	JobId.SUMMER,
	JobId.HANBOK,
	JobId.OKTOBERFEST,
	JobId.SUMMER2,
	JobId.GANGSI,
	JobId.DEATHKNIGHT,
	JobId.COLLECTOR,
	JobId.KNIGHT2,
	JobId.KNIGHT2_H,
	JobId.KNIGHT2_B,
	JobId.CRUSADER2,
	JobId.CRUSADER2_H,
	JobId.CRUSADER2_B,
	JobId.RUNE_KNIGHT2,
	JobId.RUNE_KNIGHT2_H,
	JobId.RUNE_KNIGHT2_B,
	JobId.RUNE_CHICKEN2,
	JobId.RUNE_CHICKEN2_H,
	JobId.RUNE_CHICKEN3,
	JobId.RUNE_CHICKEN3_H,
	JobId.RUNE_CHICKEN4,
	JobId.RUNE_CHICKEN4_H,
	JobId.RUNE_CHICKEN5,
	JobId.RUNE_CHICKEN5_H,
	JobId.ROYAL_GUARD2,
	JobId.ROYAL_GUARD2_H,
	JobId.ROYAL_GUARD2_B,
	JobId.RANGER2,
	JobId.RANGER2_H,
	JobId.RANGER2_B,
	JobId.MECHANIC2,
	JobId.MECHANIC2_H,
	JobId.MECHANIC2_B,
	JobId.DO_CART_SUMMONER1,
	JobId.MEISTER_RIDING
]);

export function createEquipmentRules(DB, SexTable) {
	return class EquipmentRules {
		static isShieldItem(id) {
			const num = Number(id);
			if (!Number.isInteger(num) || num <= 0) {
				return false;
			}
			// Shield item ID ranges from official client (CSession_sub_D6EAC0):
			// 2101 - 2199 (Classic shields)
			// 28901 - 28998 (Shadow / specialized shields)
			// 460000 - 469999 (Modern / renewal shields)
			return (num >= 2100 && num <= 2199) || (num >= 28900 && num <= 28999) || (num >= 460000 && num <= 469999);
		}

		static isShield(id, job, isOffhandWeapon) {
			const num = Number(id);
			if (!Number.isInteger(num) || num <= 0) {
				return false;
			}

			if (isOffhandWeapon === true) {
				return false;
			}

			if (isOffhandWeapon === false) {
				return true;
			}

			if (DB.isShieldItem(num)) {
				return true;
			}

			// Any other item ID (> 500) is not a shield (reliable offhand weapon evidence)
			if (num > 500) {
				return false;
			}

			// View ID (1-500):
			// Ambiguous offhand view IDs default to shields unless explicitly classified
			// as an offhand weapon from a reliable source.
			return true;
		}

		static hasJobShieldSprite(job, shieldView) {
			const shield = Number(shieldView);
			if (!Number.isInteger(shield) || shield <= 0) {
				return false;
			}

			if (shield > 2000) {
				return !SHIELD_ITEM_UNSUPPORTED_JOBS.has(job);
			}

			switch (shield) {
				case 1:
					return (
						SHIELD_VIEW_1_JOBS.has(job) ||
						SHIELD_VIEW_1_2_JOBS.has(job) ||
						SHIELD_VIEW_1_4_JOBS.has(job) ||
						SHIELD_VIEW_1_2_4_JOBS.has(job)
					);
				case 2:
					return (
						SHIELD_VIEW_1_2_JOBS.has(job) ||
						SHIELD_VIEW_1_4_JOBS.has(job) ||
						SHIELD_VIEW_1_2_4_JOBS.has(job)
					);
				case 3:
					return SHIELD_VIEW_1_4_JOBS.has(job);
				case 4:
					return SHIELD_VIEW_1_4_JOBS.has(job) || SHIELD_VIEW_1_2_4_JOBS.has(job);
				default:
					return false;
			}
		}

		static getPCAttackMotion(job, sex, itemID, isDualWeapon) {
			if (DB.isAssassin(job) && ASSASSIN_DUAL_WEAPON_TYPES.has(DB.getWeaponType(itemID))) {
				return 3.0;
			}

			if (isDualWeapon) {
				switch (job) {
					case JobId.THIEF:
					case JobId.THIEF_H:
						return 5.75;
					case JobId.MERCHANT:
					case JobId.MERCHANT_H:
						return 5.85;
				}
			} else {
				switch (job) {
					case JobId.NOVICE:
					case JobId.NOVICE_H:
					case JobId.NOVICE_B:
					case JobId.SUPERNOVICE:
					case JobId.SUPERNOVICE_B:
					case JobId.SUPERNOVICE2:
					case JobId.SUPERNOVICE2_B:
					case JobId.HYPER_NOVICE:
						switch (sex) {
							case 1:
								return 5.85;
						}
						break;
				}
			}
			return 6;
		}

		static isDualWeapon(job, sex, weaponType) {
			let dualWeapon = false;
			if (!Number.isInteger(weaponType) || weaponType < 0 || weaponType >= WeaponType.MAX) {
				return false;
			}
			if (DB.isAssassin(job) && ASSASSIN_DUAL_WEAPON_TYPES.has(weaponType)) {
				return true;
			}

			switch (job) {
				case JobId.GUNSLINGER:
				case JobId.GUNSLINGER_B:
				case JobId.REBELLION:
				case JobId.REBELLION_B:
				case JobId.NIGHT_WATCH: {
					switch (weaponType) {
						case WeaponType.GUN_RIFLE:
						case WeaponType.GUN_GATLING:
						case WeaponType.GUN_SHOTGUN:
						case WeaponType.GUN_GRANADE:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.NINJA:
				case JobId.NINJA_B:
				case JobId.KAGEROU:
				case JobId.KAGEROU_B:
				case JobId.SHINKIRO:
				case JobId.OBORO:
				case JobId.OBORO_B:
				case JobId.SHIRANUI: {
					switch (weaponType) {
						case WeaponType.SYURIKEN:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.GANGSI:
				case JobId.DEATHKNIGHT:
				case JobId.COLLECTOR: {
					// �ӽ�
					break;
				}
				case JobId.TAEKWON:
				case JobId.TAEKWON_B:
				case JobId.STAR:
				case JobId.STAR_B:
				case JobId.STAR2:
				case JobId.STAR2_B:
				case JobId.EMPEROR:
				case JobId.EMPEROR_B:
				case JobId.EMPEROR2:
				case JobId.EMPEROR2_B:
				case JobId.SKY_EMPEROR:
				case JobId.SKY_EMPEROR2: {
					break;
				}
				case JobId.LINKER:
				case JobId.LINKER_B:
				case JobId.REAPER:
				case JobId.REAPER_B:
				case JobId.SOUL_ASCETIC: {
					//case JobId.SOUL_ASCETIC2:??
					switch (weaponType) {
						case WeaponType.SHORTSWORD:
							if (sex == 1) {
								dualWeapon = true;
							} // male
							break;
						case WeaponType.ROD:
						case WeaponType.TWOHANDROD:
							if (sex == 0) {
								dualWeapon = true;
							} // Female
							break;
					}
					break;
				}
				case JobId.SWORDMAN:
				case JobId.SWORDMAN_H:
				case JobId.SWORDMAN_B: {
					switch (weaponType) {
						case WeaponType.TWOHANDSWORD:
						case WeaponType.TWOHANDSPEAR:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.ARCHER:
				case JobId.ARCHER_H:
				case JobId.ARCHER_B: {
					switch (weaponType) {
						case WeaponType.BOW:
							break;
						default:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.THIEF:
				case JobId.THIEF_H:
				case JobId.THIEF_B: {
					switch (weaponType) {
						case WeaponType.BOW:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.MAGICIAN:
				case JobId.MAGICIAN_H:
				case JobId.MAGICIAN_B: {
					switch (weaponType) {
						case WeaponType.TWOHANDROD:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.MERCHANT:
				case JobId.MERCHANT_H:
				case JobId.MERCHANT_B: {
					switch (weaponType) {
						case WeaponType.TWOHANDAXE:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.ACOLYTE:
				case JobId.ACOLYTE_H:
				case JobId.ACOLYTE_B: {
					break;
				}
				case JobId.NOVICE:
				case JobId.NOVICE_H:
				case JobId.NOVICE_B:
				case JobId.SUPERNOVICE:
				case JobId.SUPERNOVICE_B:
				case JobId.SUPERNOVICE2:
				case JobId.SUPERNOVICE2_B:
				case JobId.HYPER_NOVICE: {
					switch (sex) {
						case 0:
							switch (weaponType) {
								case WeaponType.TWOHANDSWORD:
								case WeaponType.TWOHANDAXE:
								case WeaponType.TWOHANDROD:
								case WeaponType.TWOHANDMACE:
									break;
								case WeaponType.SHORTSWORD:
									dualWeapon = true;
									break;
							}
							break;
						case 1:
							switch (weaponType) {
								case WeaponType.TWOHANDSWORD:
								case WeaponType.TWOHANDAXE:
								case WeaponType.TWOHANDROD:
								case WeaponType.TWOHANDMACE:
									dualWeapon = true;
									break;
								case WeaponType.SHORTSWORD:
									break;
							}
							break;
					}
					break;
				}
				case JobId.KNIGHT:
				case JobId.KNIGHT2:
				case JobId.CHICKEN:
				case JobId.KNIGHT_H:
				case JobId.CHICKEN_H:
				case JobId.KNIGHT_B:
				case JobId.CHICKEN_B:
				case JobId.KNIGHT2_H:
				case JobId.KNIGHT2_B:
				case JobId.RUNE_KNIGHT:
				case JobId.RUNE_KNIGHT_H:
				case JobId.RUNE_KNIGHT_B:
				case JobId.RUNE_KNIGHT2:
				case JobId.RUNE_KNIGHT2_H:
				case JobId.RUNE_KNIGHT2_B:
				case JobId.DRAGON_KNIGHT:
				case JobId.DRAGON_KNIGHT2:
				case JobId.DRAGON_KNIGHT_RIDING: {
					switch (weaponType) {
						case WeaponType.TWOHANDSPEAR:
						case WeaponType.TWOHANDSWORD:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.PRIEST:
				case JobId.PRIEST_H:
				case JobId.PRIEST_B:
				case JobId.ARCHBISHOP:
				case JobId.ARCHBISHOP_H:
				case JobId.ARCHBISHOP_B:
				case JobId.CARDINAL:
				case JobId.ARCH_BISHOP_2ND:
				case JobId.CARDINAL_RIDING: {
					switch (weaponType) {
						case WeaponType.BOOK:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.WIZARD:
				case JobId.WIZARD_H:
				case JobId.WIZARD_B:
				case JobId.WARLOCK:
				case JobId.WARLOCK_H:
				case JobId.WARLOCK_B:
				case JobId.ARCH_MAGE:
				case JobId.WARLOCK_2ND:
				case JobId.ARCH_MAGE_RIDING: {
					switch (weaponType) {
						case WeaponType.SHORTSWORD:
							if (sex == 1) {
								dualWeapon = true;
							}
							break;
						case WeaponType.ROD:
						case WeaponType.TWOHANDROD:
							if (sex == 0) {
								dualWeapon = true;
							}
							break;
					}
					break;
				}
				case JobId.BLACKSMITH:
				case JobId.BLACKSMITH_H:
				case JobId.BLACKSMITH_B:
				case JobId.MECHANIC:
				case JobId.MECHANIC_H:
				case JobId.MECHANIC_B:
				case JobId.MECHANIC2:
				case JobId.MECHANIC2_H:
				case JobId.MECHANIC2_B:
				case JobId.MEISTER:
				case JobId.MEISTER2:
				case JobId.MECHANIC_2ND:
				case JobId.MECHANIC2_2ND:
				case JobId.MEISTER_RIDING: {
					switch (weaponType) {
						case WeaponType.SWORD:
						case WeaponType.AXE:
						case WeaponType.TWOHANDAXE:
						case WeaponType.MACE:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.HUNTER:
				case JobId.HUNTER_H:
				case JobId.HUNTER_B:
				case JobId.RANGER:
				case JobId.RANGER_H:
				case JobId.RANGER_B:
				case JobId.RANGER2:
				case JobId.RANGER2_H:
				case JobId.RANGER2_B:
				case JobId.WINDHAWK:
				case JobId.WINDHAWK2:
				case JobId.RANGER_2ND:
				case JobId.RANGER2_2ND:
				case JobId.WINDHAWK_RIDING: {
					switch (weaponType) {
						case WeaponType.BOW:
							dualWeapon = true;
							break;
					}
					break;
				}
				case JobId.SAGE:
				case JobId.SAGE_H:
				case JobId.SAGE_B:
				case JobId.SORCERER:
				case JobId.SORCERER_H:
				case JobId.SORCERER_B:
				case JobId.ELEMENTAL_MASTER:
				case JobId.ELEMENTAL_MASTER_RIDING:
				case JobId.SORCERER_2ND:
					{
						switch (weaponType) {
							case WeaponType.BOOK:
							case WeaponType.ROD:
							case WeaponType.TWOHANDROD:
							case WeaponType.TWOHANDSPEAR: // ��ս������� ���� ���̵� ����� �����Ǹ� �����.
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.ALCHEMIST:
				case JobId.ALCHEMIST_H:
				case JobId.ALCHEMIST_B:
				case JobId.GENETIC:
				case JobId.GENETIC_H:
				case JobId.GENETIC_B:
				case JobId.BIOLO:
				case JobId.BIOLO_RIDING:
				case JobId.GENETIC_2ND:
					{
						switch (weaponType) {
							case WeaponType.SWORD:
							case WeaponType.AXE:
							case WeaponType.TWOHANDAXE:
							case WeaponType.MACE:
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.CRUSADER:
				case JobId.CRUSADER_H:
				case JobId.CRUSADER_B:
				case JobId.CHICKEN2:
				case JobId.CHICKEN2_H:
				case JobId.CHICKEN2_B:
				case JobId.CRUSADER2:
				case JobId.CRUSADER2_H:
				case JobId.CRUSADER2_B:
				case JobId.ROYAL_GUARD:
				case JobId.ROYAL_GUARD_H:
				case JobId.ROYAL_GUARD_B:
				case JobId.ROYAL_GUARD2:
				case JobId.ROYAL_GUARD2_H:
				case JobId.ROYAL_GUARD2_B:
				case JobId.IMPERIAL_GUARD:
				case JobId.IMPERIAL_GUARD2:
				case JobId.IMPERIAL_GUARD_RIDING:
				case JobId.ROYAL_GUARD_2ND:
				case JobId.ROYAL_GUARD2_2ND:
					{
						switch (weaponType) {
							case WeaponType.SPEAR:
							case WeaponType.TWOHANDSPEAR:
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.MONK:
				case JobId.MONK_H:
				case JobId.MONK_B:
				case JobId.SURA:
				case JobId.SURA_H:
				case JobId.SURA_B:
				case JobId.INQUISITOR:
				case JobId.INQUISITOR_RIDING:
				case JobId.SURA_2ND:
					{
						switch (weaponType) {
							case WeaponType.KNUKLE:
							case WeaponType.NONE:
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.ROGUE:
				case JobId.ROGUE_H:
				case JobId.ROGUE_B:
				case JobId.SHADOW_CHASER:
				case JobId.SHADOW_CHASER_H:
				case JobId.SHADOW_CHASER_B:
				case JobId.ABYSS_CHASER:
				case JobId.ABYSS_CHASER_RIDING:
				case JobId.SHADOW_CHASER_2ND:
					{
						switch (weaponType) {
							case WeaponType.BOW:
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.BARD:
				case JobId.BARD_H:
				case JobId.BARD_B:
				case JobId.MINSTREL:
				case JobId.MINSTREL_H:
				case JobId.MINSTREL_B:
				case JobId.TROUBADOUR:
				case JobId.DANCER:
				case JobId.DANCER_H:
				case JobId.DANCER_B:
				case JobId.WANDERER:
				case JobId.WANDERER_H:
				case JobId.WANDERER_B:
				case JobId.TROUVERE:
				case JobId.TROUBADOUR_RIDING:
				case JobId.TROUVERE_RIDING:
				case JobId.MINSTREL_2ND:
				case JobId.WANDERER_2ND:
					{
						switch (weaponType) {
							case WeaponType.BOW:
								dualWeapon = true;
								break;
						}
					}
					break;
				case JobId.DO_SUMMONER:
				case JobId.DO_SUMMONER_B:
				case JobId.DO_CART_SUMMONER1:
				case JobId.SPIRIT_HANDLER:
				case JobId.SPIRIT_HANDLER_RIDING1:
					break;
			}
			return dualWeapon;
		}

		static getWeaponType(itemID, realType = false, considerDualHandIds = false) {
			return getWeaponType(...arguments);
		}

		static getShieldPath(id, job, sex, isMounted = false) {
			const shieldId = Number(id);
			const gender = SexTable[sex];
			if (!Number.isInteger(shieldId) || shieldId <= 0 || !gender) {
				return null;
			}
			id = shieldId;

			// The second packet field can contain an offhand weapon item ID, not a shield ID.
			if (!DB.isShield(id, job)) {
				return DB.getWeaponPath(id, job, sex);
			}
			if (isMounted) {
				return null;
			}

			const baseClass = WeaponJobTable[job] || WeaponJobTable[0];
			const viewId = DB.getShieldViewID(id);

			// The original client first tries an item-specific sprite when that job
			// has one, then falls back to its generic view (usually 1-4).
			if (id > 2000 && DB.hasJobShieldSprite(job, id)) {
				return (
					'data/sprite/\xb9\xe6\xc6\xd0/' +
					baseClass +
					'/' +
					baseClass +
					'_' +
					SexTable[sex] +
					'_' +
					id +
					'_\xb9\xe6\xc6\xd0'
				);
			}

			if (!DB.hasJobShieldSprite(job, viewId) || !(viewId in ShieldTable)) {
				return null;
			}

			return (
				'data/sprite/\xb9\xe6\xc6\xd0/' +
				baseClass +
				'/' +
				baseClass +
				'_' +
				SexTable[sex] +
				'_' +
				ShieldTable[viewId]
			);
		}

		static getShieldViewID(id) {
			const num = Number(id);
			if (!Number.isInteger(num) || num <= 0) {
				return 0;
			}

			if (num <= 500) {
				return num;
			}

			const item = ItemTable[num];
			return item && Number.isInteger(item.ClassNum) ? item.ClassNum : 0;
		}

		static getWeaponPath(id, job, sex, leftid = false) {
			const weaponId = Number(id);
			const gender = SexTable[sex];
			if (!Number.isInteger(weaponId) || weaponId <= 0 || !gender) {
				return null;
			}
			id = weaponId;

			const baseClass = WeaponJobTable[job] || WeaponJobTable[0];

			id = DB.getWeaponType(id);
			if (DB.getWeaponType(id, true) === WeaponType.KNUKLE && PRIEST_KNUCKLE_INCOMPATIBLE_JOBS.has(job)) {
				return null;
			}

			// TODO: CHECK IF THIS IS CORRECT
			if (leftid) {
				if (leftid in ItemTable && 'ClassNum' in ItemTable[leftid]) {
					leftid = ItemTable[leftid].ClassNum;
				}

				// Create dualhand Id
				const right = Object.keys(WeaponType).find(key => WeaponType[key] === id);
				const left = Object.keys(WeaponType).find(key => WeaponType[key] === leftid);
				if (right && left) {
					id = WeaponType[right + '_' + left];
				}
			}

			return (
				'data/sprite/' +
				(DB.isDoram(job) ? '\xb5\xb5\xb6\xf7\xc1\xb7' : '\xc0\xce\xb0\xa3\xc1\xb7') +
				'/' +
				baseClass +
				'/' +
				baseClass +
				'_' +
				gender +
				(WeaponTable[id] || '_' + id)
			);
		}

		static getWeaponTrail(id, job, sex) {
			const weaponId = Number(id);
			const gender = SexTable[sex];
			if (!Number.isInteger(weaponId) || weaponId <= 0 || !gender) {
				return null;
			}

			const baseClass = WeaponJobTable[job] || WeaponJobTable[0];

			const realId = DB.getWeaponType(weaponId, true, true);
			const trail = WeaponTrailTable[realId];
			if (!trail) {
				return null;
			}

			return (
				'data/sprite/' +
				(DB.isDoram(job) ? '\xb5\xb5\xb6\xf7\xc1\xb7' : '\xc0\xce\xb0\xa3\xc1\xb7') +
				'/' +
				baseClass +
				'/' +
				baseClass +
				'_' +
				gender +
				trail
			);
		}

		static getWeaponEffectPath(id, job, sex, effect = 0) {
			const weaponId = Number(id);
			const gender = SexTable[sex];
			if (!Number.isInteger(weaponId) || weaponId < -1 || !gender || (effect !== 0 && effect !== 1)) {
				return null;
			}

			const baseClass = WeaponJobTable[job] || WeaponJobTable[0];
			let weaponName = '';
			if (weaponId >= 0) {
				const weaponType = DB.getWeaponType(weaponId);
				if (weaponType === WeaponType.NONE || !WeaponTable[weaponType]) {
					return null;
				}
				weaponName = WeaponTable[weaponType];
			}

			const effectSuffix = effect === 1 ? '_\xb9\xdf\xb1\xa4' : '_\xb0\xcb\xb1\xa4';
			return (
				'data/sprite/' +
				(DB.isDoram(job) ? '\xb5\xb5\xb6\xf7\xc1\xb7' : '\xc0\xce\xb0\xa3\xc1\xb7') +
				'/' +
				baseClass +
				'/' +
				baseClass +
				'_' +
				gender +
				weaponName +
				effectSuffix
			);
		}

		static getCartPath(num) {
			const id = Math.max(Math.min(num, 13), 0); //cap 0-13
			return [
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbd\xb4\xb3\xeb\xbc\xd5\xbc\xf6\xb7\xb9',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb9',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb91',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb92',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb93',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb94',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb95',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb96',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb97',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb98',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xb1\xb9\xb0\xbb\xf3\xc0\xda\xc4\xab\xc6\xae',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xc6\xf7\xb8\xb5\xbd\xc6\xc0\xba\xc4\xab\xc6\xae',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xc6\xf7\xb8\xb5\xc4\xab\xc6\xae',
				'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xb6\xb5\xb5\xc4\xab\xc6\xae'
			][id];
		}

		static getWeaponSound(id) {
			const type = DB.getWeaponType(id, true);
			return WeaponSoundTable[type];
		}

		static getWeaponHitSound(id) {
			const type = DB.getWeaponType(id, true, true);

			const hitSound = WeaponHitSoundTable[type];

			// if array return random item
			if (Array.isArray(hitSound)) {
				return hitSound[Math.floor(Math.random() * hitSound.length)];
			}

			return hitSound;
		}

		static getJobHitSound(job_id) {
			if (!job_id) {
				return JobHitSoundTable[0];
			}

			return JobHitSoundTable[job_id] || JobHitSoundTable[0];
		}

		static getWeaponViewID(id) {
			const num = Number(id);
			if (!Number.isInteger(num) || num < 0) {
				return 0;
			}

			// if id is 0, return 0
			if (num === 0) {
				return 0;
			}

			// if less then weapon type.MAX, return the id
			if (num < WeaponType.MAX) {
				return num;
			}

			// try to get view from classnum in ItemTable
			if (num in ItemTable && 'ClassNum' in ItemTable[num]) {
				return ItemTable[num].ClassNum;
			}

			// all cases failed, return weapon type to use base sprite
			return DB.getWeaponType(num);
		}

		static getWeaponAction(id, job, sex) {
			const type = DB.getWeaponType(id, true);
			if (!Number.isInteger(sex) || (sex !== 0 && sex !== 1)) {
				return 0;
			}

			if (job in WeaponAction) {
				if (WeaponAction[job] instanceof Array) {
					if (type in WeaponAction[job][sex]) {
						return WeaponAction[job][sex][type];
					}
				} else if (type in WeaponAction[job]) {
					return WeaponAction[job][type];
				}
			}

			return 0;
		}

		static getAttackSlice(job, weapon) {
			return getAttackSlice(job, weapon, (...args) => DB.getWeaponType(...args));
		}

		static getDualWieldWeaponType(firstItemId, secondItemId) {
			let first = Number(firstItemId) || 0;
			let second = Number(secondItemId) || 0;
			if (!Number.isInteger(first) || !Number.isInteger(second) || first < 0 || second < 0) {
				return WeaponType.NONE;
			}

			if (first === 0) {
				if (second === 0) {
					return WeaponType.NONE;
				}
				first = second;
				second = 0;
			}

			const isSword = id =>
				(id >= 1100 && id < 1150) || (id >= 13400 && id < 13500) || (id >= 500000 && id < 510000);
			const isDagger = id =>
				(id >= 1200 && id < 1250) ||
				(id >= 13000 && id < 13100) ||
				(id >= 28700 && id < 28900) ||
				(id >= 510000 && id < 520000);
			const isAxe = id => (id >= 1300 && id < 1350) || (id >= 520000 && id < 530000);

			if (isSword(first)) {
				if (isSword(second)) return WeaponType.SWORD_SWORD;
				if (isDagger(second)) return WeaponType.SHORTSWORD_SWORD;
				if (isAxe(second)) return WeaponType.SWORD_AXE;
				return WeaponType.SWORD;
			}
			if (isDagger(first)) {
				if (isSword(second)) return WeaponType.SHORTSWORD_SWORD;
				if (isDagger(second)) return WeaponType.SHORTSWORD_SHORTSWORD;
				if (isAxe(second)) return WeaponType.SHORTSWORD_AXE;
				return WeaponType.SHORTSWORD;
			}
			if (isAxe(first)) {
				if (isAxe(second)) return WeaponType.AXE_AXE;
				if (isDagger(second)) return WeaponType.SHORTSWORD_AXE;
				if (isSword(second)) return WeaponType.SWORD_AXE;
				return WeaponType.AXE;
			}

			return WeaponType.NONE;
		}

		static mountWeapon(weaponID, shieldID) {
			const _weapon = DB.getWeaponType(weaponID, true);
			const _shield = DB.getWeaponType(shieldID, true);
			if (_weapon === WeaponType.SHORTSWORD && _shield === WeaponType.SHORTSWORD) {
				return WeaponType.SHORTSWORD_SHORTSWORD;
			}
			if (_weapon === WeaponType.SWORD && _shield === WeaponType.SWORD) {
				return WeaponType.SWORD_SWORD;
			}
			if (_weapon === WeaponType.AXE && _shield === WeaponType.AXE) {
				return WeaponType.AXE_AXE;
			}
			if (
				(_weapon === WeaponType.SHORTSWORD && _shield === WeaponType.SWORD) ||
				(_weapon === WeaponType.SWORD && _shield === WeaponType.SHORTSWORD)
			) {
				return WeaponType.SHORTSWORD_SWORD;
			}
			if (
				(_weapon === WeaponType.SHORTSWORD && _shield === WeaponType.AXE) ||
				(_weapon === WeaponType.AXE && _shield === WeaponType.SHORTSWORD)
			) {
				return WeaponType.SHORTSWORD_AXE;
			}
			if (
				(_weapon === WeaponType.SWORD && _shield === WeaponType.AXE) ||
				(_weapon === WeaponType.AXE && _shield === WeaponType.SWORD)
			) {
				return WeaponType.SWORD_AXE;
			}

			// Unknown combinations keep the primary hand's type instead of producing an unrelated type by addition.
			return _weapon;
		}

		static isBow(weaponType) {
			return (
				weaponType == WeaponType.BOW ||
				weaponType == WeaponType.CrossBow ||
				weaponType == WeaponType.Arbalest ||
				weaponType == WeaponType.Kakkung ||
				weaponType == WeaponType.Hunter_Bow ||
				weaponType == WeaponType.Bow_Of_Rudra
			);
		}

		static isKatar(weaponType) {
			return weaponType == WeaponType.KATAR;
		}
	};
}
