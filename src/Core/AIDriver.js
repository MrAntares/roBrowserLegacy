define(function (require) {
	'use strict';

	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var SkillInfo = require('DB/Skills/SkillInfo');
	var EntityManager = require('Renderer/EntityManager');
	var Renderer = require('Renderer/Renderer');
	var Client = require('./Client');

	function AIDriver() {}

	//110033787

	AIDriver.init = async function init() {};

	var msg = {};

	AIDriver.setmsg = function setmsg(homId, str) {
		msg[homId] = str;
	};

	AIDriver.addCTX = function addAIctx() {
		const scriptStartTime = Date.now();
		function addCTX(lua, homunculus = true) {
			var ctx = lua.ctx;
			// Initialize AI variables
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
				local t = GetVJS(V_, id)
				if(V_ == 1 or V_ == 13) then
					return t[1], t[2]
				end
				return t
			end`);

			ctx.log = logMessage => {
				let decoder = new TextDecoder();
				//console.log(typeof logMessage === 'object' && logMessage.buffer ? decoder.decode(logMessage) : logMessage);
			};

			ctx.MoveToOwner = function MoveToOwner(gid) {
				var pkt = new PACKET.CZ.REQUEST_MOVETOOWNER();
				pkt.GID = gid;
				Network.sendPacket(pkt);
			};

			ctx.Move = function Move(id, x, y) {
				var pkt = new PACKET.CZ.REQUEST_MOVENPC();
				pkt.GID = id;
				pkt.dest[0] = x;
				pkt.dest[1] = y;
				Network.sendPacket(pkt);
			};

			ctx.Attack = function Attack(GID, targetGID) {
				var pkt = new PACKET.CZ.REQUEST_ACTNPC();
				pkt.GID = GID;
				pkt.targetGID = targetGID;
				pkt.action = 0;
				Network.sendPacket(pkt);
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
						if (entity !== null) {
							return entity.attack_range || 1;
						}
						return 1;
					default:
						console.error('unknown V_ ', V_, entity);
						return 0;
				}
			};

			ctx.GetActors = function () {
				AIDriver.exec('status = MyState', homunculus);
				var res = [0];
				EntityManager.forEach(item => {
					res.push(item.GID);
				});

				// aggressive logic
				if (res.length > 3) {
					if (localStorage.getItem('AGGRESSIVE') == 1) {
						res.forEach(item => {
							if (item != 0 && item != Session.AID && item != Session.homunId) {
								var entity = EntityManager.get(Number(item));
								if (
									entity &&
									(entity.objecttype === Session.Entity.constructor.TYPE_MOB ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_ABR ||
										entity.objecttype === Session.Entity.constructor.TYPE_NPC_BIONIC)
								) {
									if (ctx.status == 0) {
										//idle = 0
										// attak
										AIDriver.setmsg(Session.homunId, '3,' + item);
									}
								}
							}
						});
					} else {
						if (ctx.status !== null) {
							AIDriver.setmsg(Session.homunId, ctx.status.toString());
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
				return '';
			};

			ctx.GetResMsg = function GetResMsg(id) {
				//console.log('GetResMsg', id);
				return '';
			};

			ctx.SkillObject = function SkillObject(homunId, level, skillId, targetID) {
				console.log('SkillObject', homunId, level, skillId, targetID);
				// check if is our homunculus
				if (homunId === Session.homunId) {
					let homun = EntityManager.get(Number(homunId));
					let target = EntityManager.get(Number(targetID));
					// check range
					let range = SkillInfo[skillId].AttackRange[level - 1] + 1 || homun.attack_range || 1;

					if (
						homun?.position[0] > 0 &&
						homun?.position[1] > 0 &&
						target?.position[0] > 0 &&
						target?.position[1] > 0
					) {
						let distance = Math.sqrt(
							Math.pow(homun?.position[0] - target?.position[0], 2) +
								Math.pow(homun?.position[1] - target?.position[1], 2)
						);
						console.log('SkillObject - RANGE AND DISTANCE', range, distance);
						if (range >= distance) {
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
							console.log('SkillObject - NOT IN RANGE', homunId, level, skillId, targetID);
						}
					} else {
						console.log('SkillObject - SOME POSITION NOT VALID', homunId, level, skillId, targetID);
					}
				}

				return 0;
			};

			ctx.SkillGround = function (homunId, level, skillId, x, y) {
				console.log('SkillGround', homunId, level, skillId, x, y);
				// check if is our homunculus
				if (homunId === Session.homunId) {
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
				if (typeof id !== 'number' || id <= 0) {
					return 0;
				}
				var entity = EntityManager.get(Number(id));

				if (
					entity &&
					(entity.objecttype === Session.Entity.constructor.TYPE_MOB ||
						entity.objecttype === Session.Entity.constructor.TYPE_NPC_ABR ||
						entity.objecttype === Session.Entity.constructor.TYPE_NPC_BIONIC)
				) {
					return 1;
				}
				return 0;
			};

			ctx.TraceAI = function TraceAI(str) {
				let decoder = new TextDecoder();
				console.log('TraceAI - ', typeof str === 'object' && str.buffer ? decoder.decode(str) : str);
			};

			ctx.status = null;
		}
		addCTX(this.HO_AI, true);
		addCTX(this.MER_AI, false);
	};

	AIDriver.initAI = async function prepareAIFiles() {
		var loadedFiles = {};
		var loadPromises = [];

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
						.replace('.lua', '')
						.trim();
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
								console.log(`Loading file "${text}"...`);
								var f = file instanceof ArrayBuffer ? new TextDecoder('iso-8859-1').decode(file) : file;

								const nestedPromises = [];
								for (const line of f.split('\n')) {
									if (line.includes('dofile')) {
										var loadFile = line
											.replace('dofile', '')
											.replace('(', '')
											.replace(')', '')
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
									console.log('Loading file "' + filename + '"...');
									let text =
										file instanceof ArrayBuffer ? new TextDecoder('iso-8859-1').decode(file) : file;

									const nestedPromises = [];
									for (const line of text.split('\n')) {
										if (line.includes('dofile')) {
											var loadFile = line
												.replace('dofile', '')
												.replace('(', '')
												.replace(')', '')
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
			try {
				await Promise.all(loadPromises);
				for (const key in fileList) {
					await lua.doFileSync(fileList[key]);
				}
			} catch (error) {
				console.error('Error loading AI files:', error);
			}
		}

		this.HO_AI = DB.getHOAI_VM();
		this.MER_AI = DB.getMERAI_VM();
		let files = ['AI/USER_AI/Util.lua', 'AI/USER_AI/Const.lua', 'AI/USER_AI/AI.lua'];
		var AI_M = 'AI/USER_AI/AI_M.lua';
		AIDriver.addCTX();
		preloadFiles(files, this.HO_AI);
		await doFiles(files, this.HO_AI);
		loadedFiles = {};
		loadPromises = [];
		files.pop();
		files.push(AI_M);
		preloadFiles(files, this.MER_AI);
		await doFiles(files, this.MER_AI);
	};

	AIDriver.exec = function exec(code, homunculus = true) {
		try {
			//console.log('exec', code);
			if (homunculus) {
				this.HO_AI.doStringSync(code);
			} else {
				this.MER_AI.doStringSync(code);
			}
		} catch (e) {
			console.error('%c[AI] %cAI Error: ', 'color:#DD0078', 'color:inherit', e);
		}
	};

	AIDriver.reset = function reset() {
		//this.init();
	};

	return AIDriver;
});

