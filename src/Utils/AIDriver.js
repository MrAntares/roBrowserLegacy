define(['Vendors/lua.vm', 'Renderer/EntityManager', 'Renderer/Renderer'], function (LUA_VM, EntityManager, Renderer) {
    'use strict';

    var Session = require('Engine/SessionStorage');
    var Network = require('Network/NetworkManager');
    var PACKET = require('Network/PacketStructure');

    // var HomunInformations    = require('UI/Components/HomunInformations/HomunInformations');
    // var Homun = require('Engine/MapEngine/Homun');
    // var Entity  = require('Renderer/Entity/Entity');

    function AIDriver() {
    }

    AIDriver.init = function init() {
        AIDriver.exec(`
            require "AI\\\\AI"

            function TraceAI (string) 
                return js.global:TraceAI(string)
            end
            function MoveToOwner (id) 
                return js.global:MoveToOwner(id)
            end
            function Move (id,x,y) 
                return js.global:Move(id,x,y)
            end
            function Attack (GID, targetGID) 
                return js.global:Attack(GID, targetGID)
            end
            function GetV (V_, id) 
                p = Split(js.global:GetV(V_, id), ",")
                if (V_ == V_MOTION or V_ == V_OWNER or V_ == V_HOMUNTYPE or V_ == V_TARGET or V_ == V_ATTACKRANGE) then
                    return tonumber(p[1])
                end
                if (V_ == V_HP or V_ == V_SP or V_ == V_MAXHP or V_ == V_MAXSP) then
                    return tonumber(p[1])
                end
                if (V_ == V_POSITION) then
                    return tonumber(p[1]), tonumber(p[2])
                end
                return tonumber(p[1]), tonumber(p[2]), tonumber(p[3]), tonumber(p[4])
            end
            function GetActors () 
                actors = js.global:GetActors()
                res = {}
                for i,v in ipairs(actors) do
                    res[i] = tonumber(v)
                end
                return res
            end
            function GetTick () 
                return js.global:GetTick()
            end
            function GetMsg (id) 
                --return js.global:GetMsg(id)
                return {0}
            end
            function GetResMsg (id)
                -- print('GetResMsg')
                -- print(id)
                return {0}
            end
            function SkillObject (id,level,skill,target) 
                print('SkillObject')
                print(id)
                print(level)
                print(skill)
                print(target)
            end
            function SkillGround (id,level,skill,x,y) 
                print('SkillGround')
                print(id)
                print(level)
                print(skill)
                print(x)
                print(y)
            end
            function IsMonster (id) 
                return js.global:IsMonster(id)
            end
            
            
            -----------------------------------------
            function Split(s, delimiter)
                result = {};
                for match in (s..delimiter):gmatch("(.-)"..delimiter) do
                    table.insert(result, match);
                end
                return result;
            end
        `)

    }

    var msgPull = [];

    AIDriver.setmsg = function setmsg(V_, id) {
        msgPull.push([V_, id])
    }

    window.GetMsg = function GetMsg(id) {
        return 0;
        // return msgPull.shift() ?? 0;
    }

    window.IsMonster = function IsMonster(id) {
        if (id < 1 || typeof (id) !== 'number') {
            return 0;
        }

        var entity = EntityManager.get(Number(id));

        if (entity.objecttype === entity.TYPE_MOB) {
            return 1;
        }
        return 0;
    }

    window.TraceAI = function TraceAI(str) {
        console.warn('TraceAI', str)
    }

    window.GetTick = function GetTick() {
        return Renderer.tick;
    }

    window.Move = function Move(id, x, y) {
        var pkt = new PACKET.CZ.REQUEST_MOVENPC();
        pkt.GID = id;
        pkt.dest[0] = x;
        pkt.dest[1] = y;
        Network.sendPacket(pkt);
    }

    window.Attack = function Attack(GID, targetGID) {
        var pkt = new PACKET.CZ.REQUEST_ACTNPC();
        pkt.GID = GID;
        pkt.targetGID = targetGID;
        pkt.action = 0;
        Network.sendPacket(pkt);
    }

    window.MoveToOwner = function MoveToOwner(gid) {
        var pkt = new PACKET.CZ.REQUEST_MOVETOOWNER();
        pkt.GID = gid;
        Network.sendPacket(pkt);
    }

    window.GetActors = function () {
        var res = [0]
        EntityManager.forEach((item) => {
            res.push(item.GID)
        });
        return res;
    }

    window.GetV = function GetV(V_, id) {
        var entity = EntityManager.get(Number(id))

        switch (V_) {
            case 0: // V_OWNER ok
                return Session.AID;

            case 1: // V_POSITION ok
                // console.warn('V_POSITION', id, entity)
                if (entity !== null) {
                    return entity.position[0] + ',' + entity.position[1];
                }
                return '-1,-1'

            case 2: // V_TYPE
                console.warn("V_TYPE ", id, entity);
                return 0;

            case 3: // V_MOTION ok
                if (id < 1000) {
                    var avtors = window.GetActors();
                    return EntityManager.get(Number(avtors[id])).action;
                }
                return entity.action;

            case 4: // V_ATTACKRANGE ok
                // Returns the attack range (Not implemented yet; temporarily set as 1 cell)
                return 1;

            case 5: // V_TARGET ok
                if (id < 1 || typeof (id) !== 'number') {
                    return 0;
                }
                return entity.targetGID;

            case 6: // V_SKILLATTACKRANGE
                // Returns the skill attack range (Not implemented yet)
                console.warn("V_SKILLATTACKRANGE ", id, entity)
                return 0;

            case 7: // V_HOMUNTYPE ok
                if (entity === null) {
                    return 0;
                }
                return Number((entity._job + '').substring(1));

            case 8: // V_HP
                return entity.life.hp;

            case 9: // V_SP
                return entity.life.sp;

            case 10: // V_MAXHP
                return entity.life.hp_max;

            case 11: // V_MAXSP
                return entity.life.sp_max;

            case 12: // V_MERTYPE
                console.warn("V_MERTYPE ", id, entity)
                return 0;

            default:
                console.error("unknown V_ ", V_, entity)
                return 0;
        }
    }

    AIDriver.exec = function exec(code) {

        if (!UrlExists('AI/AI.lua') || !UrlExists('AI/Util.lua') || !UrlExists('AI/Const.lua')) {
            return false;
        }

        try {
            L.execute(code);
        } catch (e) {
            console.error('AI_error: ', e.lua_stack);
        }
    }

    function UrlExists(url) {
        try {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return true;
        } catch (e) {
            return false;
        }
    }

    AIDriver.init();

    return AIDriver;
});
