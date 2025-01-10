define(['Renderer/EntityManager', 'Renderer/Renderer', 'Renderer/Entity/Entity'], function (EntityManager, Renderer, Entity) {
	'use strict';

	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var SkillInfo = require('DB/Skills/SkillInfo');

	function AIDriver() {
	}

	//110033787 

	AIDriver.init = async function init() {
		var ai_path = Session.homCustomAI ? "AI/USER_AI/AI" : "AI/AI";

		this.lua = DB.getAILua();
		AIDriver.initFunctions();
		this.lua.doStringSync(`
			require("${ai_path}")
			function GetV (V_, id, MySkill, MySkillLevel) 
				local result = GetVJS(V_, id, MySkill, MySkillLevel)
                p = Split(result, ",")
                if (V_ == V_MOTION or V_ == V_OWNER or V_ == V_HOMUNTYPE or V_ == V_TARGET or V_ == V_ATTACKRANGE or V_ == V_SKILLATTACKRANGE_LEVEL) then
                    return tonumber(p[1])
                end
                if (V_ == V_HP or V_ == V_SP or V_ == V_MAXHP or V_ == V_MAXSP) then
                    return tonumber(p[1])
                end
                if (V_ == V_POSITION or V_ == V_POSITION_APPLY_SKILLATTACKRANGE) then
                    return tonumber(p[1]), tonumber(p[2])
                end
                return tonumber(p[1]), tonumber(p[2]), tonumber(p[3]), tonumber(p[4])
            end
            function GetActors () 
                actors = GetActorsJS()
                res = {}
                for i,v in ipairs(actors) do
					if v ~= nil then
                    	res[i] = tonumber(v)
					end
                end
                return res
            end
			function GetMsg (id) 
                res = {}
                for i,v in ipairs(Split(GetMsgJS(id), ",")) do
                    res[i] = tonumber(v)
                end
                return res
            end
			 function Split(s, delimiter)
                result = {};
                for match in (s..delimiter):gmatch("(.-)"..delimiter) do
                    table.insert(result, match);
                end
                return result;
            end
			`);
	}

	var msg = {};

	AIDriver.setmsg = function setmsg(homId, str) {
		msg[homId] = str;
	}


	AIDriver.initFunctions = function initFunctions() {
		const ctx = this.lua.ctx;

		ctx.log = (logMessage) => {
			let decoder = new TextDecoder();
			console.log(typeof logMessage === 'object' && logMessage.buffer ? decoder.decode(logMessage) : logMessage);
		}

		ctx.GetMsgJS = function GetMsgJS(id) {
			if (id in msg) {
				let res = msg[id];
				delete msg[id];
				return res;
			}
			return '';
		}

		ctx.GetResMsg = function GetResMsg(id) {

			//console.log('GetResMsg', id);
			return '';
		}

		ctx.SkillObject = function SkillObject(homunId, level, skillId, targetID) {
			console.log('SkillObject', homunId, level, skillId, targetID);
			// check if is our homunculus
			if (homunId === Session.homunId) {
				// check if skillId is valid - checked on rAthena 20250109
				if (skillId > 8000 && skillId < 8060) {
					let homun = EntityManager.get(Number(homunId));
					let target = EntityManager.get(Number(targetID));
					// check range
					let range = SkillInfo[skillId].AttackRange[level - 1] + 1 || homun.attack_range || 1;

					if (homun?.position[0] > 0 && homun?.position[1] > 0 && target?.position[0] > 0 && target?.position[1] > 0) {
						let distance = Math.sqrt(Math.pow((homun?.position[0] - target?.position[0]), 2) + Math.pow((homun?.position[1] - target?.position[1]), 2));
						console.log('SkillObject - RANGE AND DISTANCE', range, distance);
						if (range >= distance) {
							// check if homun is in a valid state to cast skill
							if (homun && ([0, 1, 4].includes(homun.action))) {
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
				} else {
					console.log('SkillObject - SKILLID NOT VALID', homunId, level, skillId, targetID);
				}
			}

			return 0;
		}

		ctx.SkillGround = function (homunId, level, skillId, x, y) {
			console.log('SkillGround', homunId, level, skillId, x, y);
			// check if is our homunculus
			if (homunId === Session.homunId) {
				// check if skillId is valid - checked on rAthena 20250109
				if (skillId > 8000 && skillId < 8060) {
					// check if homun is in a valid state to cast skill
					let homun = EntityManager.get(Number(homunId));
					if (homun && ([0, 1, 4].includes(homun.action))) {
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
			}

			return 0;
		}

		ctx.IsMonster = function IsMonster(id) {
			console.log('isMonster: ', id);
			if (id < 1 || typeof (id) !== 'number') {
				return 0;
			}

			var entity = EntityManager.get(Number(id));

			if (entity && DB.isMonster(entity._job)) {
				return 1;
			}
			return 0;
		}

		ctx.Trace = function Trace(str) {
			let decoder = new TextDecoder();
			console.log('Trace - ', typeof str === 'object' && str.buffer ? decoder.decode(str) : str)
		}

		ctx.TraceAI = function TraceAI(str) {
			let decoder = new TextDecoder();
			console.log('TraceAI - ', typeof str === 'object' && str.buffer ? decoder.decode(str) : str)
		}

		ctx.GetTick = function GetTick() {
			return Renderer.tick;
		}

		ctx.Move = function Move(id, x, y) {
			var pkt = new PACKET.CZ.REQUEST_MOVENPC();
			pkt.GID = id;
			pkt.dest[0] = x;
			pkt.dest[1] = y;
			Network.sendPacket(pkt);
		}

		ctx.Attack = function Attack(GID, targetGID) {
			var pkt = new PACKET.CZ.REQUEST_ACTNPC();
			pkt.GID = GID;
			pkt.targetGID = targetGID;
			pkt.action = 0;
			Network.sendPacket(pkt);
		}

		ctx.MoveToOwner = function MoveToOwner(gid) {
			var pkt = new PACKET.CZ.REQUEST_MOVETOOWNER();
			pkt.GID = gid;
			Network.sendPacket(pkt);
		}

		ctx.status = null;

		ctx.GetActorsJS = function () {
			AIDriver.exec('status = MyState')
			var res = [0]
			EntityManager.forEach((item) => {
				res.push(item.GID)
			});

			// aggressive logic
			if (res.length > 3) {
				if (localStorage.getItem('AGGRESSIVE') == 1) {
					res.forEach((item) => {
						if (item != 0 && item != Session.AID && item != Session.homunId) {
							var entity = EntityManager.get(Number(item))
							if (entity && (entity.objecttype === Entity.TYPE_MOB || entity.objecttype === Entity.TYPE_NPC_ABR || entity.objecttype === Entity.TYPE_NPC_BIONIC)) {
								if (ctx.status == 0) { //idle = 0
									// attak
									AIDriver.setmsg(Session.homunId, '3,' + item);
								}
							}
						}
					})
				} else {
					AIDriver.setmsg(Session.homunId, ctx.status.toString());
				}
			}
			return res;
		}

		ctx.GetVJS = function (V_, id, skillId, skilLevel) {
			var entity = EntityManager.get(Number(id));
			let range;
			switch (V_) {
				case 0: // V_OWNER ok
					return Session.AID;

				case 1: // V_POSITION ok
					return entity ? entity.position[0].toFixed(2) + ',' + entity.position[1].toFixed(2) : '-1,-1';

				case 2: // V_TYPE
					//console.warn("V_TYPE ", id, entity);
					return 1;

				case 3: // V_MOTION ok
					return entity ? entity.action : 0;

				case 4: // V_ATTACKRANGE ok
					return entity ? entity.attack_range : 1;

				case 5: // V_TARGET ok
					return entity && entity.targetGID && entity.targetGID > 0 ? entity.targetGID : -1;

				case 6: // V_SKILLATTACKRANGE
					return entity ? entity.attack_range : 1;

				case 7: // V_HOMUNTYPE ok
					return entity._job % 6000; // 6000 is the base job id for homunculus

				case 8: // V_HP
					return entity.life.hp || -1;

				case 9: // V_SP
					return entity.life.sp || -1;

				case 10: // V_MAXHP
					return entity.life.hp_max || -1;

				case 11: // V_MAXSP
					return entity.life.sp_max || -1;

				case 12: // V_MERTYPE
					console.warn("V_MERTYPE ", id, entity)
					return 1;
				case 13: // V_POSITION_APPLY_SKILLATTACKRANGE - seems to return best position (x,y) to cast skill
					//GetV (V_POSITION_APPLY_SKILLATTACKRANGE, MyEnemy, MySkill, MySkillLevel)
					console.log("V_POSITION_APPLY_SKILLATTACKRANGE", id, skillId, skilLevel);
					if (skillId && skilLevel) {
						range = SkillInfo[skillId].AttackRange[skilLevel - 1] + 1 || homun.attack_range || 1;
						let homun = EntityManager.get(Session.homunId);
						if (homun?.position[0] > 0 && homun?.position[1] > 0 && entity?.position[0] > 0 && entity?.position[1] > 0) {
							let distance = Math.sqrt(Math.pow((homun?.position[0] - entity?.position[0]), 2) + Math.pow((homun?.position[1] - entity?.position[1]), 2));

							if (range >= distance) {
								console.log("in range");
								return homun.position[0].toFixed(2) + ',' + homun.position[1].toFixed(2);
							}
						} else {
							console.log("position not set", homun?.position, entity?.position);
						}
						console.log("NOT in range");
					} else {
						console.log("NO VALID SKILL");
					}
					return entity.position[0].toFixed(2) + ',' + entity.position[1].toFixed(2);
				case 14: // V_SKILLATTACKRANGE_LEVEL
					console.log("V_SKILLATTACKRANGE_LEVEL", id, skillId, skilLevel);
					range = SkillInfo[id].AttackRange[level - 1] + 1 || homun.attack_range || 1;
					return range;
				default:
					console.error("unknown V_ ", V_, entity)
					return 0;
			}
		}
	}

	AIDriver.exec = function exec(code) {
		try {
			//console.log('exec', code);
			this.lua.doStringSync(code);
		} catch (e) {
			console.error('%c[AI] %cAI Error: ', "color:#DD0078", "color:inherit", e);
		}
	}

	AIDriver.reset = function reset() {
		this.init();
	}

	return AIDriver;
});
