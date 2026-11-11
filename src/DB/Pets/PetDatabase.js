import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import PetEmotionTable from 'DB/Pets/PetEmotionTable.js';
import PetHungryState from 'DB/Pets/PetHungryState.js';
import PetFriendlyState from 'DB/Pets/PetFriendlyState.js';
import PetMessageConst from 'DB/Pets/PetMessageConst.js';

const userStringDecoder = TextEncoding;
let PetTalkTable = {};
let PetDBTable = {};
let EggIDToJobID = {};

export function setPetTalkTable(table) {
	PetTalkTable = table;
}

export function loadPetInfo(filename, callback, onEnd) {
	const { lua, loadFile, guard } = createDBLoadContext();
	callback = guard(callback);
	onEnd = guard(onEnd);

	loadFile(
		filename,
		async function (file) {
			try {
				console.log('Loading file "' + filename + '"...');

				// check if file is ArrayBuffer and convert to Uint8Array if necessary
				const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

				lua.mountFile(filename, buffer);
				await lua.doFile(filename);

				// Read Lua table
				const readLuaTable = tableName => {
					const result = {};
					const ctx = lua.ctx;

					ctx.__push_kv = (k, v) => {
						const key = k instanceof Uint8Array ? userStringDecoder.decode(k) : k;
						const val = v instanceof Uint8Array ? userStringDecoder.decode(v) : v;
						result[key] = val;
						return 1;
					};

					lua.doStringSync(`
							for k, v in pairs(${tableName}) do
								__push_kv(k, v)
							end
						`);

					return result;
				};

				// Read all pet tables
				const eggMap = readLuaTable('PetEggItemID_PetJobID');
				const petNames = readLuaTable('PetNameTable');
				const petStrings = readLuaTable('PetStringTable');
				const petIllusts = readLuaTable('PetIllustNameTable_Eng');
				const petAccIDs = readLuaTable('PetAccIDs');
				const petAccNames = readLuaTable('PetAccActNameTable');

				PetDBTable = {};

				for (const eggId in eggMap) {
					const jobId = Number(eggMap[eggId]);
					const petName = petNames[jobId] || null;
					const accKey = petName ? `ACC_${petName.toUpperCase()}` : null;
					const accId = accKey ? petAccIDs[accKey] || null : null;

					PetDBTable[jobId] = {
						PetJobID: jobId,
						PetEggID: Number(eggId),
						PetName: petName,
						PetString: petStrings[jobId] || null,
						PetIllust: petIllusts[jobId] || null,
						PetAcc_ID: accId,
						PetAcc_Name: accId ? petAccNames[accId] || null : null
					};
				}

				EggIDToJobID = {};

				for (const jobID in PetDBTable) {
					const pet = PetDBTable[jobID];
					EggIDToJobID[pet.PetEggID] = Number(jobID);
				}
			} catch (error) {
				console.error('[loadPetInfo] Error: ', error);
			} finally {
				// release file from memmory
				lua.unmountFile(filename);
				// call onEnd
				onEnd();
			}
		},
		onEnd
	);
}

export function loadPetEvolution(filename, callback, onEnd) {
	const { lua, loadFile, guard } = createDBLoadContext();
	callback = guard(callback);
	onEnd = guard(onEnd);

	const loadPromise = new Promise((resolve, reject) => {
		loadFile(filename, resolve, reject);
	});

	loadPromise
		.then(async file => {
			let wasSuccessful = false;
			try {
				console.log('Loading file "' + filename + '"...');
				const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
				lua.mountFile(filename, buffer);

				const ctx = lua.ctx;

				// InsertEvolutionRecipeLGU(BaseEggID, TargetEggID, MaterialID, Amount)
				ctx.InsertEvolutionRecipeLGU = (baseEggID, targetEggID, matID, amt) => {
					const baseJobID = EggIDToJobID[baseEggID];
					if (!baseJobID || !PetDBTable[baseJobID]) {
						console.warn(`[PetEvolution] Unknown base EggID ${baseEggID}`);
						return 1;
					}

					const pet = PetDBTable[baseJobID];

					if (!pet.Evolution) {
						pet.Evolution = {};
					}
					if (!pet.Evolution[targetEggID]) {
						pet.Evolution[targetEggID] = [];
					}

					pet.Evolution[targetEggID].push({
						MaterialID: Number(matID),
						Amount: Number(amt)
					});

					return 1;
				};

				// InsertPetAutoFeeding(PetID)
				ctx.InsertPetAutoFeeding = eggID => {
					const jobID = EggIDToJobID[eggID];

					if (!jobID || !PetDBTable[jobID]) {
						console.warn(`[PetAutoFeeding] Unknown EggID ${eggID}`);
						return 1;
					}

					PetDBTable[jobID].AutoFeeding = true;
					return 1;
				};

				// Execute Lua
				await lua.doFile(filename);
				lua.doStringSync('main()');
				wasSuccessful = true;
			} catch (error) {
				console.error('[loadPetEvolutionFile] Error: ', error);
			} finally {
				// release file from memmory
				lua.unmountFile(filename);
				// call onEnd
				onEnd(wasSuccessful);
			}
		})
		.catch(error => {
			if (typeof onEnd === 'function') {
				onEnd(false);
			}
		});
}

export function createPetDatabase(DB) {
	return class PetDatabase {
		static getPetTalk(data) {
			// Structure:
			// Examaple: 1013010
			// 1013  |      01     |     0
			// mobID | hungryState | actionState
			const mobId = parseInt(data.toString().substring(0, 4)) || 1001;
			const hungryState = parseInt(data.toString().substring(4, 6)) || 0;
			const actionState = parseInt(data.toString().substring(6, 7)) || 0;

			if (
				hungryState >= Object.keys(PetHungryState).length ||
				actionState >= Object.keys(PetMessageConst).length
			) {
				return false;
			}

			let mobName, hungryText, actionText;
			if (mobId && mobId >= 1000 && mobId < 4000) {
				mobName = (MonsterTable[mobId] || MonsterTable[1001]).toLowerCase();
			}
			if (hungryState !== null && hungryState !== undefined) {
				hungryText = DB.getPetHungryText(parseInt(hungryState));
			}

			if (actionState !== null && actionState !== undefined) {
				actionText = DB.getPetActText(parseInt(actionState));
			}

			if (!mobName || !hungryText || !actionText) {
				return false;
			}

			if (
				PetTalkTable &&
				PetTalkTable[mobName] &&
				PetTalkTable[mobName][hungryText] &&
				PetTalkTable[mobName][hungryText][actionText]
			) {
				let rnd = 0;
				if (PetTalkTable[mobName][hungryText][actionText] instanceof Array) {
					rnd = parseInt((Math.random() * 100) % PetTalkTable[mobName][hungryText][actionText].length);
					return TextEncoding.decodeString(PetTalkTable[mobName][hungryText][actionText][rnd]);
				}
				return TextEncoding.decodeString(PetTalkTable[mobName][hungryText][actionText]);
			}

			return false;
		}

		static getPetHungryState(hunger) {
			if (!hunger) {
				return 0;
			}
			if (hunger > 90 && hunger <= 100) {
				return PetHungryState.PET_FULL;
			} else if (hunger > 75 && hunger <= 90) {
				return PetHungryState.PET_ENOUGH;
			} else if (hunger > 25 && hunger <= 75) {
				return PetHungryState.PET_SATISFIED;
			} else if (hunger > 10 && hunger <= 25) {
				return PetHungryState.PET_HUNGRY;
			} else if (hunger >= 0 && hunger <= 10) {
				return PetHungryState.PET_HUNGER;
			}
			return 0;
		}

		static getPetFriendlyState(friendly) {
			if (!friendly) {
				return 0;
			}
			if (friendly > 900 && friendly <= 1000) {
				return PetFriendlyState.PET_FAMILIAR;
			} else if (friendly > 750 && friendly <= 900) {
				return PetFriendlyState.PET_FRIENDLY;
			} else if (friendly > 250 && friendly <= 750) {
				return PetFriendlyState.PET_NORMAL;
			} else if (friendly > 100 && friendly <= 250) {
				return PetFriendlyState.PET_AWKWARD;
			} else if (friendly >= 0 && friendly <= 100) {
				return PetFriendlyState.PET_ASHAMED;
			}
			return 0;
		}

		static getPetActText(action) {
			switch (action) {
				case PetMessageConst.PM_FEEDING:
					return 'feeding';
				case PetMessageConst.PM_HUNTING:
					return 'hunting';
				case PetMessageConst.PM_DANGER:
					return 'danger';
				case PetMessageConst.PM_DEAD:
					return 'dead';
				case PetMessageConst.PM_NORMAL:
					return 'stand';
				case PetMessageConst.PM_CONNENCT:
					return 'connect';
				case PetMessageConst.PM_LEVELUP:
					return 'levelup';
				case PetMessageConst.PM_PERFORMANCE1:
					return 'perfor_1';
				case PetMessageConst.PM_PERFORMANCE2:
					return 'perfor_2';
				case PetMessageConst.PM_PERFORMANCE3:
					return 'perfor_3';
				case PetMessageConst.PM_PERFORMANCE_S:
					return 'perfor_s';
			}

			return 'stand';
		}

		static getPetHungryText(state) {
			switch (state) {
				case PetHungryState.PET_HUNGER:
					return 'hungry';
				case PetHungryState.PET_HUNGRY:
					return 'bit_hungry';
				case PetHungryState.PET_SATISFIED:
					return 'noting';
				case PetHungryState.PET_ENOUGH:
					return 'full';
				case PetHungryState.PET_FULL:
					return 'so_full';
			}
			return 'hungry';
		}

		static getPetEmotion(hunger, friendly, act) {
			if (PetEmotionTable[hunger][friendly][act]) {
				return PetEmotionTable[hunger][friendly][act];
			}

			return false;
		}

		static getPetTalkNumber(job, act, hungry) {
			return parseInt(job.toString() + ('0' + hungry).slice(-2) + act.toString());
		}

		static getPetByJobID(jobID) {
			return PetDBTable[jobID] || null;
		}

		static getPetEvolutionByJob(jobID) {
			const pet = PetDBTable[jobID];
			return pet && pet.Evolution ? pet.Evolution : null;
		}

		static getPetByEggID(eggID) {
			for (const jobID in PetDBTable) {
				const pet = PetDBTable[jobID];
				if (pet.PetEggID === Number(eggID)) {
					return pet;
				}
			}
			return null;
		}
	};
}
