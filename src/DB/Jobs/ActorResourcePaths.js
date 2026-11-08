import JobId from './JobConst.js';
import ClassTable from './JobNameTable.js';
import PaletteTable from './PalNameTable.js';
import HairIndexTable from './HairIndexTable.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import PetAction from 'DB/Pets/PetAction.js';
import PetIllustration from 'DB/Pets/PetIllustration.js';
import HatTable from 'DB/Items/HatTable.js';
import RobeTable from 'DB/Items/RobeTable.js';
import PACKETVER from 'Network/PacketVerManager.js';

export function createActorResourcePaths(DB, SexTable) {
	return class ActorResourcePaths {
		static getBodyPath(id, sex, alternative = -1, cashMountCostume = false) {
			// TODO: Warp STR file
			if (id === 45) {
				return null;
			}

			// Not visible sprite
			if (id === 111 || id === 139 || id == 2337) {
				return null;
			}

			// PC
			if (DB.isPlayer(id)) {
				// DORAM
				let result = DB.isDoram(id)
					? 'data/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xf6\xc5\xeb/'
					: 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/';
				result += SexTable[sex] + '/';

				if (PACKETVER.value > 20141022 && alternative > 0 && id !== alternative) {
					const use_costume =
						alternative > JobId.COSTUME_SECOND_JOB_START && alternative < JobId.COSTUME_SECOND_JOB_END;

					if (use_costume) {
						result += 'costume_1/';
					}

					result += (cashMountCostume ? ClassTable[id] : ClassTable[alternative]) || ClassTable[0];

					result += '_' + SexTable[sex];

					if (use_costume) {
						result += '_1';
					}
					return result;
				}

				result += ClassTable[id] || ClassTable[0];
				result += '_' + SexTable[sex];

				return result;
			}

			// NPC
			if (DB.isNPC(id)) {
				return 'data/sprite/npc/' + (MonsterTable[id] || MonsterTable[46]).toLowerCase();
			}

			// MERC
			if (DB.isMercenary(id)) {
				// archer - female path | lancer and swordman - male path
				// mercenary entry on monster table have sex path included
				return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + MonsterTable[id];
			}

			// HOMUN
			if (DB.isHomunculus(id)) {
				return 'data/sprite/homun/' + (MonsterTable[id] || MonsterTable[1002]).toLowerCase();
			}

			//
			// OTHER ACTORS
			//
			switch (id) {
				case '11_FALCON':
				case '4034_FALCON':
					// 2nd
					return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xc5';
				case '4012_FALCON':
					// rebirth
					return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xc5\x32';
				case '4056_FALCON':
				case '4062_FALCON':
				case '4098_FALCON':
					// 3rd
					return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/owl';
				case '4257_FALCON':
				case '4270_FALCON':
				case '4278_FALCON':
					// 4th
					return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/windhawk_hawk';
				case '4056_WUG':
				case '4062_WUG':
				case '4098_WUG':
					// 3rd
					return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/\xbf\xf6\xb1\xd7';
				case '4257_WUG':
					// 4th
					return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/windhawk_wolf';
				default:
					if (typeof id === 'string') {
						// default for gm or customs
						if (id.includes('_FALCON')) {
							return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xc5';
						} else if (id.includes('_WUG')) {
							return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/\xbf\xf6\xb1\xd7';
						} else if (id.startsWith('CART_')) {
							const cartNum = parseInt(id.slice(5), 10) || 0;
							return DB.getCartPath(cartNum);
						}
					}
					break;
			}

			// MONSTER
			return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/' + (MonsterTable[id] || MonsterTable[1001]).toLowerCase();
		}

		static getAdminPath(sex) {
			return (
				'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' +
				SexTable[sex] +
				'/\xbf\xee\xbf\xb5\xc0\xda_' +
				SexTable[sex]
			);
		}

		static getBodyPalPath(id, pal, sex) {
			if (id === 0 || !(id in PaletteTable)) {
				return null;
			}

			// A `costume_1` body's palettes carry the body's own `_1` after the
			// palette number: costume_1/<job>_<sex>_<pal>_1.pal.
			const costume = String(PaletteTable[id]).startsWith('costume_1/') ? '_1' : '';

			return 'data/palette/\xb8\xf6/' + PaletteTable[id] + '_' + SexTable[sex] + '_' + pal + costume + '.pal';
		}

		static getHeadPath(id, job, sex, orcish) {
			// ORC HEAD
			if (orcish) {
				return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/orcface';
			}

			// DORAM
			if (DB.isDoram(job)) {
				return (
					'data/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' +
					SexTable[sex] +
					'/' +
					(HairIndexTable[sex + 2][id] || id) +
					'_' +
					SexTable[sex]
				);
			}

			return (
				'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' +
				SexTable[sex] +
				'/' +
				(HairIndexTable[sex][id] || id) +
				'_' +
				SexTable[sex]
			);
		}

		static getHeadPalPath(id, pal, job, sex) {
			if (job === 4218 || job === 4220) {
				return (
					'data/palette/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' +
					(HairIndexTable[sex + 2][id] || id) +
					'_' +
					SexTable[sex] +
					'_' +
					pal +
					'.pal'
				);
			}

			return (
				'data/palette/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' +
				(HairIndexTable[sex][id] || id) +
				'_' +
				SexTable[sex] +
				'_' +
				pal +
				'.pal'
			);
		}

		static getHatPath(id, sex) {
			if (id === 0 || !(id in HatTable)) {
				return null;
			}

			return 'data/sprite/\xbe\xc7\xbc\xbc\xbb\xe7\xb8\xae/' + SexTable[sex] + '/' + SexTable[sex] + HatTable[id];
		}

		static getRobePath(id, job, sex) {
			if (id === 0 || !(id in RobeTable)) {
				return null;
			}

			return (
				'data/sprite/\xb7\xce\xba\xea/' +
				RobeTable[id] +
				'/' +
				SexTable[sex] +
				'/' +
				(ClassTable[job] || ClassTable[0]) +
				'_' +
				SexTable[sex]
			);
		}

		static getRobePathNoSex(id, job, sex) {
			if (id === 0 || !(id in RobeTable)) {
				return null;
			}
			return `data/sprite/\xb7\xce\xba\xea/${RobeTable[id]}/${RobeTable[id]}${DB.isDoram(job) ? '_doram' : ''}`;
		}

		static getPetEquipPath(id) {
			if (id === 0 || !(id in PetAction)) {
				return null;
			}

			return 'data/sprite/' + PetAction[id];
		}

		static getPetIllustPath(id) {
			return 'data/texture/' + (PetIllustration[id] || PetIllustration[1002]);
		}
	};
}
