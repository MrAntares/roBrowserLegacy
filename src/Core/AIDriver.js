define(function (require) {
	'use strict';

	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var SkillInfo = require('DB/Skills/SkillInfo');
	var EntityManager = require('Renderer/EntityManager');
	var Client = require('./Client');
	var Configs = require('./Configs');

	var getModule = require;

	function AIDriver() {}

	AIDriver.init = async function init() {};

	var msg = {};
	var resMsg = {};

	AIDriver.setmsg = function setmsg(homId, str) {
		if (!msg[homId]) {
			msg[homId] = str;
		} else {
			resMsg[homId] = str;
		}
	};

	AIDriver.addCTX = function addAIctx() {
		const scriptStartTime = Date.now();

		// Prevents circular dependancy
		var Homun = getModule('UI/Components/HomunInformations/HomunInformations');
		var Mercenary = getModule('UI/Components/MercenaryInformations/MercenaryInformations');

		function addCTX(lua, isHoAI = true) {
			var ctx = lua.ctx;

			// Initialize AzzyAI timeouts variables and GetV adapter
			lua.doStringSync(`
				UseSacrificeOwner=0
				BerserkMode=0
				SteinWandPauseTime=0
				MagTimeout=0
				SOffensiveTimeout=0
				SDefensiveTimeout=0
				SOwnerBuffTimeout=0
				GuardTimeout=0
				QuickenTimeout=0
				OffensiveOwnerTimeout=0
				DefensiveOwnerTimeout=0
				OtherOwnerTimeout=0
				ShouldStandby=0
				MySpheres=0
				EleanorMode=0
				RegenTick = {}

				function GetV(V_, id)
					local res = GetVJS(V_, id)
					if(V_ == 1 or V_ == 13) then
						return res[1], res[2]
					end
					return res
				end	
			`);

			// Hooks default lua logging
			ctx.log = logMessage => {
				if (Configs.get('debugAI', false)) {
					let decoder = new TextDecoder();
					console.log(
						typeof logMessage === 'object' && logMessage.buffer ? decoder.decode(logMessage) : logMessage
					);
				}
			};

			// AI context functions mentioned on (AI/호문클루스 인공지능 스크립트 설명서.htm)

			ctx.MoveToOwner = function MoveToOwner(id) {
				if (isHoAI) {
					Homun.reqMoveToOwner(id);
				} else {
					Mercenary.reqMoveToOwner(id);
				}
			};

			ctx.Move = function Move(id, x, y) {
				if (isHoAI) {
					Homun.reqMoveTo(id, x, y);
				} else {
					Mercenary.reqMoveTo(id, x, y);
				}
			};

			ctx.Attack = function Attack(id, targetGID) {
				if (isHoAI) {
					Homun.reqAttack(id, targetGID);
				} else {
					Mercenary.reqAttack(id, targetGID);
				}
			};

			ctx.GetVJS = function (V_, id) {
				var entity = EntityManager.get(Number(id));

				switch (V_) {
					case 0: // V_OWNER
						return Session.AID;

					case 1: // V_POSITION
					case 13: // V_POSITION_APPLY_SKILLATTACKRANGE
						var posX = -1,
							posY = -1;
						if (entity && entity.position) {
							posX = parseInt(entity.position[0]);
							posY = parseInt(entity.position[1]);
						}
						// For position values we return an array in the format [V_, posX, posY].
						//
						// This is intentional. When Wasmoon converts a JS array to a Lua table it
						// preserves the original JS indexing (0-based), resulting in:
						//
						//   t[0] = V_
						//   t[1] = posX
						//   t[2] = posY
						//
						// In Lua, arrays are typically 1-based, so using index 0 would normally feel
						// unusual. We take advantage of this by storing V_ at index 0 and shifting the
						// actual coordinates to indices 1 and 2.
						//
						// The Lua wrapper (GetV) then extracts the coordinates with:
						//
						//   return t[1], t[2]
						//
						// This keeps the AI scripts compatible with the original Ragnarok AI,
						// which expects:
						//
						//   local x, y = GetV(V_POSITION, id)
						//
						// without exposing the internal 0-based index to the Lua scripts.
						//
						// This workaround was also necessary because returning a TypedArray or a
						// simple JS array directly did not behave correctly with the AI scripts.
						// Lua would receive the array object itself as the first return value:
						//
						//   local x, y = GetV(...)
						//
						// resulting in:
						//   x = <array object>
						//   y = nil
						//
						// By returning [V_, posX, posY] and extracting the values in Lua, we ensure
						// the AI receives two proper numeric return values (x, y).
						return [V_, posX, posY];
					case 2: // V_TYPE
						//UNUSED
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
						return entity ? entity.job % 6000 : -1; // 6000 is the base job id for homunculus

					case 8: // V_HP
						return entity.life.hp || -1;

					case 9: // V_SP
						return entity.life.sp || -1;

					case 10: // V_MAXHP
						return entity.life.hp_max || -1;

					case 11: // V_MAXSP
						return entity.life.sp_max || -1;
					case 12: // V_MERTYPE
						if (entity === null) {
							return 0;
						}
						return Number((entity.job + '').substring(1));
					case 14: // V_SKILLATTACKRANGE_LEVEL
						// Returns the skill attack range for the skill level (Not implemented yet)
						if (Configs.get('debugAI', false)) {
							console.log('V_SKILLATTACKRANGE_LEVEL' + id);
						}
						if (entity !== null) {
							return entity.attack_range || 1;
						}
						return 1;
					default:
						if (Configs.get('debugAI', false)) {
							console.error('unknown V_ ', V_, entity);
						}
						return 0;
				}
			};

			function distance(x1, y1, x2, y2) {
				const dx = x2 - x1;
				const dy = y2 - y1;
				return dx * dx + dy * dy;
			}

			ctx.GetActors = function () {
				AIDriver.exec('status = MyState', isHoAI);
				var res = [0];
				EntityManager.forEach(item => {
					res.push(item.GID);
				});
				// aggressive logic
				if (res.length > 3) {
					if (localStorage.getItem('AGGRESSIVE') == 1) {
						var closest = 0;
						var lastDist = 1000;
						var thisentity = EntityManager.get(isHoAI ? Session.homunId : Session.mercId);
						for (const item in res) {
							if (
								item !== 0 &&
								item !== Session.AID &&
								item !== Session.homunId &&
								item !== Session.mercId
							) {
								var entity = EntityManager.get(Number(item));
								if (
									entity &&
									(entity.objecttype === Session.Entity.constructor.TYPE_MOB ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_ABR ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_BIONIC) &&
									!entity.isDead() &&
									entity.action !== entity.ACTION.DIE &&
									entity.isVisible()
								) {
									var dist = distance(
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
							AIDriver.setmsg(isHoAI ? Session.homunId : Session.mercId, '3,' + closest);
						}
					} else {
						if (ctx.status !== null) {
							AIDriver.setmsg(isHoAI ? Session.homunId : Session.mercId, ctx.status.toString());
						} else {
							AIDriver.setmsg(isHoAI ? Session.homunId : Session.mercId, '0');
						}
					}
				}
				return res;
			};

			ctx.GetTick = function GetTick() {
				return Date.now() - scriptStartTime;
			};

			ctx.GetMsg = function GetMsgJS(id) {
				if (id in msg) {
					let res = msg[id];
					delete msg[id];
					return res;
				}
				return '0';
			};

			ctx.GetResMsg = function GetResMsg(id) {
				if (id in resMsg) {
					let res = resMsg[id];
					delete resMsg[id];
					return res;
				}
				return '0';
			};

			ctx.SkillObject = function SkillObject(homunId, level, skillId, targetID) {
				if (Configs.get('debugAI', false)) {
					console.log('SkillObject', homunId, level, skillId, targetID);
				}
				// check if is our homunculus
				if (homunId === (isHoAI ? Session.homunId : Session.mercId)) {
					let homun = EntityManager.get(Number(homunId));
					let target = EntityManager.get(Number(targetID));

					if (!homun || !target) {
						return 0;
					}

					// check range
					let range = SkillInfo[skillId].AttackRange[level - 1] + 1 || homun.attack_range || 1;

					if (
						homun.position[0] > 0 &&
						homun.position[1] > 0 &&
						target.position[0] > 0 &&
						target.position[1] > 0
					) {
						let dist = distance(
							homun.position[0],
							homun.position[1],
							target.position[0],
							target.position[1]
						);
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

			ctx.SkillGround = function (homunId, level, skillId, x, y) {
				if (Configs.get('debugAI', false)) {
					console.log('SkillGround', homunId, level, skillId, x, y);
				}
				// check if is our homunculus
				if (homunId === (isHoAI ? Session.homunId : Session.mercId)) {
					// check if homun is in a valid state to cast skill
					let homun = EntityManager.get(Number(homunId));
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

			ctx.IsMonster = function IsMonster(id) {
				// -1 is commonly called by AzzyAI
				if (typeof id !== 'number' || id <= 0) {
					if (typeof id !== 'number' && Configs.get('debugAI', false)) {
						console.warn('IsMonster - Invalid type');
					}
					return 0;
				}
				var entity = EntityManager.get(Number(id));

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

			ctx.TraceAI = function TraceAI(str) {
				if (Configs.get('debugAI', false)) {
					let decoder = new TextDecoder();
					console.log('TraceAI - ', typeof str === 'object' && str.buffer ? decoder.decode(str) : str);
				}
			};

			ctx.status = null;

			// Unknow/unused functions
			// it exist on client but not mentioned on gvt dev guide (AI/호문클루스 인공지능 스크립트 설명서.htm)
			ctx.Trace = logMessage => {
				if (Configs.get('debugAI', false)) {
					let decoder = new TextDecoder();
					console.debug(
						typeof logMessage === 'object' && logMessage.buffer ? decoder.decode(logMessage) : logMessage
					);
				}
			};

			ctx.TraceValue = val => {
				return val.toString();
			};
		}

		addCTX(this.default_HO_AI, true);
		addCTX(this.HO_AI, true);
		addCTX(this.default_MER_AI, false);
		addCTX(this.MER_AI, false);
	};

	AIDriver.initAI = async function prepareAIFiles(onEnd) {
		var loadedFiles = {};
		var loadPromises = [];
		this.ready = false;
		function preloadFiles(fileList, lua) {
			var ctx = lua.ctx;

			function customRequire(modulePath, isJS = false) {
				const promise = new Promise((resolve, reject) => {
					let text;
					if (!isJS) {
						text = new TextDecoder('iso-8859-1').decode(modulePath);
					} else {
						text = modulePath;
					}

					text = text
						.replaceAll('\\\\', '/')
						.replaceAll('\\', '/')
						.replace('./', '')
						.replace('pcall', '')
						.replace('function', '')
						.replace('.lua', '')
						.trim();
					if (text.endsWith('end')) {
						text = text.replace('end', '').trim();
					}
					text = text + '.lua';

					// Timeouts and Agressive Relog are execution time file, it need to be created on demandtly, so we ignore them here
					if (text.includes('Timeouts') || text.includes('AggressiveRelogPath') || text.startsWith('--')) {
						resolve();
						return;
					}

					if (loadedFiles[text]) {
						resolve();
						return;
					}
					loadedFiles[text] = text;

					Client.loadFile(
						text,
						function (file) {
							try {
								if (Configs.get('debugAI', false)) {
									console.log(`Loading file "${text}"...`);
								}

								var f = file instanceof ArrayBuffer ? new TextDecoder('iso-8859-1').decode(file) : file;

								const nestedPromises = [];
								for (const line of f.split('\n')) {
									if (line.includes('dofile')) {
										var loadFile = line
											.replace('dofile', '')
											.replaceAll('(', '')
											.replaceAll(')', '')
											.replace(/['"]/g, '')
											.trim();
										const nestedPromise = customRequire(loadFile, true);
										nestedPromises.push(nestedPromise);
									}
								}

								Promise.all(nestedPromises)
									.then(() => {
										let buffer = new TextEncoder().encode(f);
										lua.mountFile('./' + text, buffer);
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
				return promise;
			}

			ctx.require = customRequire;

			// Preload AI files to ensure they are cached before execution
			for (const filename of fileList) {
				if (!loadedFiles[filename]) {
					loadedFiles[filename] = filename;
					const promise = new Promise((resolve, reject) => {
						Client.loadFile(
							filename,
							function (file) {
								try {
									if (Configs.get('debugAI', false)) {
										console.log('Loading file "' + filename + '"...');
									}

									let text =
										file instanceof ArrayBuffer ? new TextDecoder('iso-8859-1').decode(file) : file;

									const nestedPromises = [];
									for (const line of text.split('\n')) {
										if (line.includes('dofile')) {
											var loadFile = line
												.replace('dofile', '')
												.replaceAll('(', '')
												.replaceAll(')', '')
												.replace(/['"]/g, '')
												.trim();
											const nestedPromise = customRequire(loadFile, true);
											nestedPromises.push(nestedPromise);
										}
									}

									Promise.all(nestedPromises)
										.then(() => {
											let buffer = new TextEncoder().encode(text);
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
		}

		async function doFiles(fileList, lua) {
			await Promise.all(loadPromises);
			for (const key in fileList) {
				await lua.doFileSync(fileList[key]);
			}
		}

		try {
			this.HO_AI = DB.getHOAI_VM();
			this.MER_AI = DB.getMERAI_VM();
			this.default_HO_AI = DB.getDefaultHOAI_VM();
			this.default_MER_AI = DB.getDefaultMERAI_VM();
			AIDriver.addCTX();

			console.log('Loading Default HOAI...');
			let files = ['AI/Util.lua', 'AI/Const.lua', 'AI/AI.lua'];
			var AI_M = 'AI/AI_M.lua';
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
	};

	AIDriver.exec = function exec(code, homunculus = true) {
		try {
			//console.log('exec', code);
			if (!this.ready) {
				return;
			}

			var lua;
			if (homunculus) {
				if (Session.homCustomAI) {
					lua = this.HO_AI;
				} else {
					lua = this.default_HO_AI;
				}
			} else {
				if (Session.merCustomAI) {
					lua = this.MER_AI;
				} else {
					lua = this.default_MER_AI;
				}
			}
			lua.doStringSync(code);
		} catch (e) {
			console.error('%c[AI] %cAI Error: ', 'color:#DD0078', 'color:inherit', e);
		}
	};

	AIDriver.reset = function reset() {};

	return AIDriver;
});
