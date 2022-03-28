define(['Vendors/lua.vm'], function (LUA_VM) {
    'use strict';

    var Session = require('Engine/SessionStorage');

    function AIDriver() {
    }

    AIDriver.init = function init() {
        AIDriver.exec(`
            require "AI\\\\AI"

            function TraceAI (string) 
                print('TraceAI: ', string)
            end
            function MoveToOwner (id) 
                print('MoveToOwner')
                print(id)
            end
            function Move (id,x,y) 
                print('Move')
                print(id)
                print(x)
                print(y)
            end
            function Attack (id,id) 
                print('Attack')
                print(id)
                print(id)
            end
            function GetV (V_, id) 
                t = Split(js.global:GetV(V_, id), ",")
                return t[1], t[2], t[3], t[4]
            end
            function GetActors () 
                print('GetActors')
                return {0}
            end
            function GetTick () 
                print('GetTick')
            end
            function GetMsg (id) 
                -- print('GetMsg')
                -- print(id)
                return {0}
            end
            function GetResMsg (id)
                --print('GetResMsg')
                --print(id)
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
                print('IsMonster')
                print(id)
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

    window.GetV = function GetV(V_, id) {
        switch (V_) {
            case 0: // V_OWNER
                console.warn("V_OWNER ", Session)
                return Session.GID;
            case 1: // V_POSITION
                console.warn("V_POSITION ", id)
                return '3,4';
            case 2: // V_TYPE
                console.warn("V_TYPE ", id)
                return 0;
            case 3: // V_MOTION
                console.warn("V_MOTION ", id)
                return 0;
            case 4: // V_ATTACKRANGE
                console.warn("V_ATTACKRANGE ", id)
                return 0;
            case 5: // V_TARGET
                console.warn("V_TARGET ", id)
                return 0;
            case 6: // V_SKILLATTACKRANGE
                console.warn("V_SKILLATTACKRANGE ", id)
                return 0;
            case 7: // V_HOMUNTYPE
                console.warn("V_HOMUNTYPE ", id)
                return 0;
            case 8: // V_HP
                console.warn("V_HP ", id)
                return 0;
            case 9: // V_SP
                console.warn("V_SP ", id)
                return 0;
            case 10: // V_MAXHP
                console.warn("V_MAXHP ", id)
                return 0;
            case 11: // V_MAXSP
                console.warn("V_MAXSP ", id)
                return 0;
            case 12: // V_MERTYPE
                console.warn("V_MERTYPE ", id)
                return 0;
            default:
                return 0;
        }
    }

    AIDriver.exec = function exec(code) {
        try {
            L.execute(code);
        } catch (e) {
            console.error('AI_error: ', e.lua_stack);
        }
    }

    AIDriver.init();

    return AIDriver;
});
