import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import EntityManager from 'Renderer/EntityManager.js';
import Client from './Client.js';
import Configs from './Configs.js';
import UIManager from 'UI/UIManager.js';
import TextEncoding from 'Utils/CodepageManager.js';

/**
 * @class AIDriver
 * @description Manages the Lua VM for Homunculus and Mercenary AI systems.
 */
class AIDriver {
	static HOM_AGGRESSIVE = false;
	static MER_AGGRESSIVE = false;
	static ready = false;

	static #msg = {};
	static #resMsg = {};

	static HO_AI = null;
	static MER_AI = null;
	static default_HO_AI = null;
	static default_MER_AI = null;

	/**
	 * Initialize AIDriver
	 */
	static async init() {
		// Implementation for init if needed in the future
	}

	/**
	 * Set a message for the AI
	 * @param {number} homId
	 * @param {string} str
	 */
	static setmsg(homId, str) {
		if (!this.#msg[homId]) {
			this.#msg[homId] = str;
		} else {
			this.#resMsg[homId] = str;
		}
	}

	/**
	 * Add context functions to Lua VMs
	 */
	static addCTX() {
		const scriptStartTime = Date.now();

		// Prevents circular dependency
		const Homun = UIManager.getComponent('HomunInformations');
		const Mercenary = UIManager.getComponent('MercenaryInformations');

		const addCTXToVM = (lua, isHoAI = true) => {
			const ctx = lua.ctx;

			// Initialize GetV, GetMsg and GetResMsg adapter
			lua.doStringSync(`
				function GetV(V_, id)
					local res = GetVJS(V_, id)
					if(V_ == 1 or V_ == 13) then
						return res[1], res[2]
					end
					return res
				end	
				function GetMsg(id)  
					local res = GetMsgJS(id)  
					local result = {}  
					local i = 0  
					while res[i] ~= nil do  
						result[i + 1] = res[i]  
						i = i + 1  
					end  
					return result  
				end  
				function GetResMsg(id)  
					local res = GetResMsgJS(id)  
					local result = {}  
					local i = 0  
					while res[i] ~= nil do  
						result[i + 1] = res[i]  
						i = i + 1  
					end  
					return result  
				end
			`);

			// Hooks default lua logging
			ctx.log = logMessage => {
				if (Configs.get('debugAI', false)) {
					console.log(
						typeof logMessage === 'object' && logMessage.buffer ? TextEncoding.decode(logMessage) : logMessage
					);
				}
			};

			// AI context functions mentioned on (AI/호문클루스 인공지능 스크립트 설명서.htm)

			ctx.MoveToOwner = (id) => {
				if (isHoAI) {
					Homun.reqMoveToOwner(id);
				} else {
					Mercenary.reqMoveToOwner(id);
				}
			};

			ctx.Move = (id, x, y) => {
				if (isHoAI) {
					Homun.reqMoveTo(id, x, y);
				} else {
					Mercenary.reqMoveTo(id, x, y);
				}
			};

			ctx.Attack = (id, targetGID) => {
				if (isHoAI) {
					Homun.reqAttack(id, targetGID);
				} else {
					Mercenary.reqAttack(id, targetGID);
				}
			};

			ctx.GetVJS = (V_, id) => {
				const entity = EntityManager.get(Number(id));

				switch (V_) {
					case 0: // V_OWNER
						return Session.AID;

					case 1: // V_POSITION
					case 13: { // V_POSITION_APPLY_SKILLATTACKRANGE
						let posX = -1, posY = -1;
						if (entity && entity.position) {
							posX = parseInt(entity.position[0]);
							posY = parseInt(entity.position[1]);
						}
						// Workaround for position: return an array [V_, posX, posY]
						return [V_, posX, posY];
					}
					case 2: // V_TYPE
						return 1;

					case 3: // V_MOTION
						return entity ? entity.action : 0;

					case 4: // V_ATTACKRANGE
						return entity ? entity.attack_range : 1;

					case 5: // V_TARGET
						return entity && entity.targetGID && entity.targetGID > 0 ? entity.targetGID : -1;

					case 6: // V_SKILLATTACKRANGE
						return entity ? entity.attack_range : 1;

					case 7: // V_HOMUNTYPE
						return entity ? entity.job % 6000 : -1;

					case 8: // V_HP
						return entity?.life.hp ?? -1;

					case 9: // V_SP
						return entity?.life.sp ?? -1;

					case 10: // V_MAXHP
						return entity?.life.hp_max ?? -1;

					case 11: // V_MAXSP
						return entity?.life.sp_max ?? -1;

					case 12: // V_MERTYPE
						if (entity === null) {
							return 0;
						}
						return Number((entity.job + '').substring(1));

					case 14: // V_SKILLATTACKRANGE_LEVEL
						if (Configs.get('debugAI', false)) {
							console.log('V_SKILLATTACKRANGE_LEVEL' + id);
						}
						return entity?.attack_range ?? 1;

					default:
						if (Configs.get('debugAI', false)) {
							console.error('unknown V_ ', V_, entity);
						}
						return 0;
				}
			};

			const distance = (x1, y1, x2, y2) => {
				const dx = x2 - x1;
				const dy = y2 - y1;
				return dx * dx + dy * dy;
			};

			ctx.GetActors = () => {
				this.exec('status = MyState', isHoAI);
				const res = [0];
				EntityManager.forEach(item => {
					res.push(item.GID);
				});

				// aggressive logic
				if (res.length > 3) {
					if (isHoAI ? this.HOM_AGGRESSIVE : this.MER_AGGRESSIVE) {
						let closest = 0;
						let lastDist = 1000;
						const thisentity = EntityManager.get(isHoAI ? Session.homunId : Session.mercId);
						for (const item of res) {
							if (item !== 0 && item !== Session.AID && item !== Session.homunId && item !== Session.mercId) {
								const entity = EntityManager.get(item);
								if (
									entity &&
									(entity.objecttype === Session.Entity.constructor.TYPE_MOB ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_ABR ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_BIONIC) &&
									!entity.isDead() &&
									entity.action !== entity.ACTION.DIE &&
									entity.isVisible()
								) {
									const dist = distance(
										thisentity.position[0],
										thisentity.position[1],
										entity.position[0],
										entity.position[1]
									);
									if (dist < lastDist) {
										closest = item;
										lastDist = dist;
									}
								}
							}
						}
						if (closest > 0) {
							this.setmsg(isHoAI ? Session.homunId : Session.mercId, '3,' + closest);
						}
					}
				}
				return res;
			};

			ctx.GetTick = () => {
				return Date.now() - scriptStartTime;
			};

			ctx.GetMsgJS = (id) => {
				let raw = '0';
				if (id in this.#msg) {
					raw = this.#msg[id];
					delete this.#msg[id];
				}
				return raw.split(',').map(Number);
			};

			ctx.GetResMsgJS = (id) => {
				let raw = '0';
				if (id in this.#resMsg) {
					raw = this.#resMsg[id];
					delete this.#resMsg[id];
				}
				return raw.split(',').map(Number);
			};

			ctx.SkillObject = (homunId, level, skillId, targetID) => {
				if (Configs.get('debugAI', false)) {
					console.log('SkillObject', homunId, level, skillId, targetID);
				}
				// check if is our homunculus
				if (homunId === (isHoAI ? Session.homunId : Session.mercId)) {
					const homun = EntityManager.get(Number(homunId));
					const target = EntityManager.get(Number(targetID));

					if (!homun || !target) {
						return 0;
					}

					// check range
					const range = SkillInfo[skillId]?.AttackRange[level - 1] + 1 || homun.attack_range || 1;

					if (
						homun.position[0] > 0 &&
						homun.position[1] > 0 &&
						target.position[0] > 0 &&
						target.position[1] > 0
					) {
						const dist = distance(homun.position[0], homun.position[1], target.position[0], target.position[1]);
						if (Configs.get('debugAI', false)) {
							console.log('SkillObject - RANGE AND DISTANCE', range, dist);
						}

						if (range >= dist) {
							// check if homun is in a valid state to cast skill
							if (homun && [0, 1, 4].includes(homun.action)) {
								let pkt;
								if (PACKETVER.value >= 20180307) {
									pkt = new PACKET.CZ.USE_SKILL2();
								} else {
									pkt = new PACKET.CZ.USE_SKILL();
								}
								pkt.SKID = skillId;
								pkt.selectedLevel = level;
								pkt.targetID = targetID || Session.Entity.GID;
								Network.sendPacket(pkt);
							}
						} else {
							if (Configs.get('debugAI', false)) {
								console.log('SkillObject - NOT IN RANGE', homunId, level, skillId, targetID);
							}
						}
					} else {
						if (Configs.get('debugAI', false)) {
							console.log('SkillObject - SOME POSITION NOT VALID', homunId, level, skillId, targetID);
						}
					}
				}

				return 0;
			};

			ctx.SkillGround = (homunId, level, skillId, x, y) => {
				if (Configs.get('debugAI', false)) {
					console.log('SkillGround', homunId, level, skillId, x, y);
				}
				// check if is our homunculus
				if (homunId === (isHoAI ? Session.homunId : Session.mercId)) {
					// check if homun is in a valid state to cast skill
					const homun = EntityManager.get(Number(homunId));
					if (homun && [0, 1, 4].includes(homun.action)) {
						let pkt;
						if (PACKETVER.value >= 20190904) {
							pkt = new PACKET.CZ.USE_SKILL_TOGROUND3();
						} else if (PACKETVER.value >= 20180307) {
							pkt = new PACKET.CZ.USE_SKILL_TOGROUND2();
						} else {
							pkt = new PACKET.CZ.USE_SKILL_TOGROUND();
						}
						pkt.SKID = skillId;
						pkt.selectedLevel = level;
						pkt.xPos = x;
						pkt.yPos = y;
					}
				}

				return 0;
			};

			ctx.IsMonster = (id) => {
				// -1 is commonly called by AzzyAI
				if (typeof id !== 'number' || id <= 0) {
					if (typeof id !== 'number' && Configs.get('debugAI', false)) {
						console.warn('IsMonster - Invalid type');
					}
					return 0;
				}
				const entity = EntityManager.get(Number(id));

				if (
					entity &&
					(entity.objecttype === Session.Entity.constructor.TYPE_MOB ||
						entity.objecttype === Session.Entity.constructor.TYPE_NPC_ABR ||
						entity.objecttype === Session.Entity.constructor.TYPE_NPC_BIONIC) &&
					!entity.isDead() &&
					entity.action !== entity.ACTION.DIE &&
					entity.isVisible()
				) {
					return 1;
				}
				return 0;
			};

			ctx.TraceAI = (str) => {
				if (Configs.get('debugAI', false)) {
					console.log('TraceAI - ', typeof str === 'object' && str.buffer ? TextEncoding.decode(str) : str);
				}
			};

			ctx.status = null;

			// Unknown/unused functions
			ctx.Trace = logMessage => {
				if (Configs.get('debugAI', false)) {
					console.debug(
						typeof logMessage === 'object' && logMessage.buffer ? TextEncoding.decode(logMessage) : logMessage
					);
				}
			};

			ctx.TraceValue = val => {
				return val.toString();
			};
		};

		addCTXToVM(this.default_HO_AI, true);
		addCTXToVM(this.HO_AI, true);
		addCTXToVM(this.default_MER_AI, false);
		addCTXToVM(this.MER_AI, false);
	}

	/**
	 * Prepare AI files and VMs
	 * @param {Function} onEnd
	 */
	static async initAI(onEnd) {
		let loadedFiles = {};
		let loadPromises = [];
		this.ready = false;

		const preloadFiles = (fileList, lua) => {
			const ctx = lua.ctx;

			const customRequire = (modulePath, isJS = false) => {
				return new Promise((resolve, reject) => {
					let filename;
					if (!isJS) {
						filename = TextEncoding.decode(modulePath);
					} else {
						filename = modulePath;
					}

					filename = filename
						.replaceAll('\\\\', '/')
						.replaceAll('\\', '/')
						.replace('./', '')
						.replace('pcall', '')
						.replace('function', '')
						.replace('.lua', '')
						.trim();

					if (filename.endsWith('end')) {
						filename = filename.replace('end', '').trim();
					}
					filename = filename + '.lua';

					// Timeouts and Aggressive Relog are execution time file, it need to be created on demand
					if (
						filename.includes('Timeouts') ||
						filename.includes('AggressiveRelogPath') ||
						filename.startsWith('--')
					) {
						resolve();
						return;
					}

					if (loadedFiles[filename]) {
						resolve();
						return;
					}
					loadedFiles[filename] = filename;

					Client.loadFile(
						filename,
						(file) => {
							try {
								if (Configs.get('debugAI', false)) {
									console.log(`Loading file "${filename}"...`);
								}
								const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
								const str = TextEncoding.decode(buffer);

								const nestedPromises = [];
								for (const line of str.split('\n')) {
									if (line.includes('dofile')) {
										const loadFile = line
											.replace('dofile', '')
											.replaceAll('(', '')
											.replaceAll(')', '')
											.replace(/['"]/g, '')
											.trim();
										nestedPromises.push(customRequire(loadFile, true));
									}
								}

								Promise.all(nestedPromises)
									.then(() => {
										lua.mountFile('./' + filename, buffer);
										resolve();
									})
									.catch(reject);
							} catch (error) {
								console.error('[require] : ', error);
								reject(error);
							}
						},
						reject
					);
				});
			};

			ctx.require = customRequire;

			// Preload AI files to ensure they are cached before execution
			for (const filename of fileList) {
				if (!loadedFiles[filename]) {
					loadedFiles[filename] = filename;
					const promise = new Promise((resolve, reject) => {
						Client.loadFile(
							filename,
							(file) => {
								try {
									if (Configs.get('debugAI', false)) {
										console.log('Loading file "' + filename + '"...');
									}
									const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
									const text = TextEncoding.decode(buffer);

									const nestedPromises = [];
									for (const line of text.split('\n')) {
										if (line.includes('dofile')) {
											const loadFile = line
												.replace('dofile', '')
												.replaceAll('(', '')
												.replaceAll(')', '')
												.replace(/['"]/g, '')
												.trim();
											nestedPromises.push(customRequire(loadFile, true));
										}
									}

									Promise.all(nestedPromises)
										.then(() => {
											lua.mountFile('./' + filename, buffer);
											resolve();
										})
										.catch(reject);
								} catch (error) {
									console.error('[prepareAIFiles] : ', error);
									reject(error);
								}
							},
							reject
						);
					});
					loadPromises.push(promise);
				}
			}
		};

		const doFiles = async (fileList, lua) => {
			await Promise.all(loadPromises);
			for (const key in fileList) {
				await lua.doFileSync(fileList[key]);
			}
		};

		try {
			this.HO_AI = DB.getHOAI_VM();
			this.MER_AI = DB.getMERAI_VM();
			this.default_HO_AI = DB.getDefaultHOAI_VM();
			this.default_MER_AI = DB.getDefaultMERAI_VM();
			this.addCTX();

			console.log('Loading Default HOAI...');
			let files = ['AI/Util.lua', 'AI/Const.lua', 'AI/AI.lua'];
			let AI_M = 'AI/AI_M.lua';
			preloadFiles(files, this.default_HO_AI);
			await doFiles(files, this.default_HO_AI);

			console.log('Loading Default MERAI...');
			loadedFiles = {};
			loadPromises = [];
			files.pop();
			files.push(AI_M);
			preloadFiles(files, this.default_MER_AI);
			await doFiles(files, this.default_MER_AI);

			files = ['AI/USER_AI/Util.lua', 'AI/USER_AI/Const.lua', 'AI/USER_AI/AI.lua'];
			AI_M = 'AI/USER_AI/AI_M.lua';
			console.log('Loading Custom HOAI...');
			preloadFiles(files, this.HO_AI);
			await doFiles(files, this.HO_AI);

			console.log('Loading Custom MERAI...');
			loadedFiles = {};
			loadPromises = [];
			files.pop();
			files.push(AI_M);
			preloadFiles(files, this.MER_AI);
			await doFiles(files, this.MER_AI);
		} catch (error) {
			console.error('Error loading AI files:', error);
			if (typeof onEnd === 'function') {
				onEnd();
			}
			return;
		}

		this.ready = true;

		if (typeof onEnd === 'function') {
			onEnd();
		}
	}

	/**
	 * Execute code in the AI VM
	 * @param {string} code
	 * @param {boolean} homunculus
	 */
	static exec(code, homunculus = true) {
		try {
			if (!this.ready) {
				return;
			}

			let lua;
			if (homunculus) {
				lua = Session.homCustomAI ? this.HO_AI : this.default_HO_AI;
			} else {
				lua = Session.merCustomAI ? this.MER_AI : this.default_MER_AI;
			}
			lua.doStringSync(code);
		} catch (e) {
			console.error('%c[AI] %cAI Error: ', 'color:#DD0078', 'color:inherit', e);
		}
	}

	/**
	 * Reset AIDriver state
	 */
	static reset() {}
}

export default AIDriver;
