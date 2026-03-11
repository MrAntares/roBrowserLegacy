define(['Renderer/EntityManager', 'Renderer/Renderer', 'Renderer/Entity/Entity'], function (
	EntityManager,
	Renderer,
	Entity
) {
	'use strict';

	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var SkillInfo = require('DB/Skills/SkillInfo');

	function AIDriver() {}

	//110033787

	AIDriver.init = async function init() {
		var ai_path = Session.homCustomAI ? 'AI/USER_AI/AI' : 'AI/AI';

		this.lua = DB.getLua();
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
	};

	var msg = {};

	AIDriver.setmsg = function setmsg(homId, str) {
		msg[homId] = str;
	};

	AIDriver.initFunctions = function initFunctions() {
		const ctx = this.lua.ctx;
	};

	AIDriver.exec = function exec(code) {
		try {
			//console.log('exec', code);
			this.lua.doStringSync(code);
		} catch (e) {
			console.error('%c[AI] %cAI Error: ', 'color:#DD0078', 'color:inherit', e);
		}
	};

	AIDriver.reset = function reset() {
		this.init();
	};

	return AIDriver;
});

