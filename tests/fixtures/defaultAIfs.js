export const defaultAiVfs = {
'AI/Const.lua': `
    V_OWNER = 0
    V_POSITION = 1
    FOLLOW_ST = 1
`,
'AI/Util.lua': `
    require "AI\\\\Const.lua"
    List = {}
    function List.new()
        return { first = 0, last = -1 }
    end
`,
'AI/ExtraTactics.lua': `
    return {
        getFollowState = function()
            return FOLLOW_ST
        end
    }
`,
'AI/AI.lua': `
    require "AI\\\\Const.lua"
    require "AI\\\\Util.lua"
    local tactics = require("ExtraTactics")
    pcall(function() dofile("AI/USER_AI/AggressiveRelogPath.lua") end)
    MyState = tactics.getFollowState()
    function AI(myid)
        MoveToOwner(myid)
    end
`,
'AI/AI_M.lua': `
    require "AI\\\\Const.lua"
    require "AI\\\\Util.lua"
    MyState = FOLLOW_ST
    function AI(myid)
        MoveToOwner(myid)
    end
`,
'AI/USER_AI/AI.lua': `
    -----------------------------
    -- Dr. Azzy's Homunculus AI
    -- Written by Dr. Azzy of iRO Loki
    -- Permission granted to distribute in unmodified form
    -- Please contact me via the iRO Forums if you wish to modify
    -- so that we can work together to extend and improve this AI.
    -----------------------------
    Version="Custom"
    ErrorCode=""
    ErrorInfo=""
    LastSavedDate=""
    TactLastSavedDate=""
    TypeString="H"

    dofile("./AI/USER_AI/Const_.lua")
    dofile("./AI/USER_AI/H_SkillList.lua") 
    dofile("./AI/USER_AI/Defaults.lua")
    dofile("./AI/USER_AI/AzzyUtil.lua")
    dofile("./AI/USER_AI/Stubs.lua")
    dofile("./AI/USER_AI/A_Friends.lua")
    dofile("./AI/USER_AI/H_Config.lua")
    dofile("./AI/USER_AI/H_Tactics.lua")
    dofile("./AI/USER_AI/AI_main.lua")
    dofile("./AI/USER_AI/H_PVP_Tact.lua")
    dofile("./AI/USER_AI/H_Avoid.lua")
    dofile("./AI/USER_AI/H_Extra.lua")

    function WriteStartupLog(Version,ErrorCode,ErrorInfo)
        local verspattern="%d.%d%d"
        if AUVersion==nil then
            AUVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.."AzzyUtil.lua no version found"
        end
        TestFile=io.open("./AI/USER_AI/data/test.txt","w")
        if TestFile~=nil then
            TestFile:close()
        else
            ErrorCode="cannot create files in data folder"
            ErrorInfo=ErrorInfo.." Data folder likely missing. Create folder named 'data' in USER_AI "
        end
        if CVersion==nil then
            CVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.."Const_.lua no version found"
        end
        if MainVersion==nil then
            MainVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.." AI_main.lua no version found"
        end
        --[[
        if fsize("./AI/USER_AI/AzzyUtil.lua")~=AULen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." AzzyUtil.lua has been modified or is corrupted"
        end
        if fsize("./AI/USER_AI/Const_.lua")~=ConstLen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." Const_.lua has been modified or is corrupted"
        end
        if fsize("./AI/USER_AI/AI_main.lua")~=MainLen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." AI_main.lua has been modified or corrupted"
        end
        --]]
        if fsize("./AI/USER_AI/H_Config.lua")==3898 then
            ConfigVers="Default: "..LastSavedDate
        else
            ConfigVers="Custom, edited "..LastSavedDate
        end
        if fsize("./AI/USER_AI/H_Tactics.lua")==5393 then
            TacticVers="Default: "..TactLastSavedDate
        else
            TacticVers="Custom, edited "..TactLastSavedDate
        end
        local OutString
        if ErrorCode=="" then
            OutString="AzzyAI (hom) version "..Version.."\\nMain version:"..MainVersion.."\\nAzzyUtil version:"..AUVersion.."\\nConstant version:"..CVersion.."\\nConfig: "..ConfigVers.."\\nTactics: "..TacticVers.." \\nTime: "..os.date("%c").."\\nLua Version:".._VERSION.."\\nstarted successfully. \\n This AI is installed properly"
        else
            OutString="AzzyAI (hom) version "..Version.."\\nMain version:"..MainVersion.."\\nAzzyUtil version:"..AUVersion.."\\nConstant version:"..CVersion.."\\nConfig: "..ConfigVers.."\\nTactics: "..TacticVers.." \\nTime: "..os.date("%c").."\\nLua Version".._VERSION.."\\nError: "..ErrorCode.." "..ErrorInfo
        end
        OutFile=io.open("AAIStartH.txt","w")
        if OutFile == nil then
            Error("No write permissions for RO folder, please fix permissions on the RO folder in order to use AzzyAI. Version Info: "..OutString)
        else
            OutFile:write(OutString)
            OutFile:close()
        end
    end

    function fsize(file)
        local f=io.open(file,"r")
        local size = f:seek("end")
        f:close()
        return size
    end

    WriteStartupLog(Version,ErrorCode,ErrorInfo)
    -------------------------------
    -- Add no code to this file
    ---------------------------------
                    `,
'AI/USER_AI/AI_M.lua': `
    -----------------------------
    -- Dr. Azzy's Mercenary AI
    -- Written by Dr. Azzy of iRO Loki
    -- Permission granted to distribute in unmodified form
    -- Please contact me via the iRO Forums if you wish to modify
    -- so that we can work together to extend and improve this AI.
    -----------------------------
    Version="Custom"
    ErrorCode=""
    ErrorInfo=""
    LastSavedDate=""
    TactLastSavedDate=""
    TypeString="M"
    dofile( "./AI/USER_AI/Const_.lua")
    dofile( "./AI/USER_AI/M_SkillList.lua" )
    dofile( "./AI/USER_AI/Defaults.lua")
    dofile( "./AI/USER_AI/AzzyUtil.lua")
    dofile( "./AI/USER_AI/Stubs.lua")
    dofile( "./AI/USER_AI/A_Friends.lua")
    dofile( "./AI/USER_AI/M_Config.lua")
    dofile( "./AI/USER_AI/M_Tactics.lua")
    pcall(function () dofile( "./AI/USER_AI/Mob_ID.lua") end)
    dofile( "./AI/USER_AI/AI_main.lua")
    dofile( "./AI/USER_AI/M_PVP_Tact.lua")
    dofile( "./AI/USER_AI/M_Extra.lua")


    function WriteStartupLog(Version,ErrorCode,ErrorInfo)
        local verspattern="%d.%d%d"
        OutFile=io.open("AAIStartM.txt","w")
        if AUVersion==nil then
            AUVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.."AzzyUtil.lua no version found"
        end
        TestFile=io.open("./AI/USER_AI/data/testM.txt","w") --different name since they'd be potentially running simulaneously if user logged in with homun and merc out
        if TestFile~=nil then
            TestFile:close()
        else
            ErrorCode="cannot create files in data folder"
            ErrorInfo=ErrorInfo.." Data folder likely missing. Create folder named 'data' in USER_AI "
        end
    if CVersion==nil then
            CVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.."Const_.lua no version found"
        end
        if MainVersion==nil then
            MainVersion="1.30b or earlier"
            ErrorCode="File version error"
            ErrorInfo=ErrorInfo.." AI_main.lua no version found"
        end
        --[[
        if fsize("./AI/USER_AI/AzzyUtil.lua")~=AULen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." AzzyUtil.lua has been modified or is corrupted"
        end
        if fsize("./AI/USER_AI/Const_.lua")~=ConstLen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." Const_.lua has been modified or is corrupted"
        end
        if fsize("./AI/USER_AI/AI_main.lua")~=MainLen then
            ErrorCode="Damaged File"
            ErrorInfo=ErrorInfo.." AI_main.lua has been modified or corrupted"
        end
        --]]
        if fsize("./AI/USER_AI/M_Config.lua")==3017 then
            ConfigVers="Default: "..LastSavedDate
        else
            ConfigVers="Custom, edited "..LastSavedDate
        end
        if fsize("./AI/USER_AI/M_Tactics.lua")==547 then
            TacticVers="Default: "..TactLastSavedDate
        else
            TacticVers="Custom, edited "..TactLastSavedDate
        end	
        if GetSkillInfo(ML_PIERCE,2,10) > 1 then
            ErrorCode=ErrorCode.."AI has been modified to use the ranged pierce exploit, this may be illegal on the RO you play, contact your game administrators if you are unsure."
        end
        local OutString
        if ErrorCode=="" then
            OutString="AzzyAI (hom) version "..Version.."\\nMain version:"..MainVersion.."\\nAzzyUtil version:"..AUVersion.."\\nConstant version:"..CVersion.."\\nConfig: "..ConfigVers.."\\nTactics: "..TacticVers.." \\nTime: "..os.date("%c").."\\nLua Version:".._VERSION.."\\nstarted successfully. \\n This AI is installed properly"
        else
            OutString="AzzyAI (hom) version "..Version.."\\nMain version:"..MainVersion.."\\nAzzyUtil version:"..AUVersion.."\\nConstant version:"..CVersion.."\\nConfig: "..ConfigVers.."\\nTactics: "..TacticVers.." \\nTime: "..os.date("%c").."\\nLua Version".._VERSION.."\\nError: "..ErrorCode.." "..ErrorInfo
        end
        if OutFile == nil then
            Error("No write permissions for RO folder, please fix permissions on the RO folder in order to use AzzyAI. Version Info: "..OutString)
        else
            OutFile:write(OutString)
            OutFile:close()
        end
    end

    function fsize(file)
        local f=io.open(file,"r")
        local size = f:seek("end")
        f:close()
        return size
    end

    WriteStartupLog(Version,ErrorCode,ErrorInfo)
    -------------------------------
    -- Add no code to this file
    -------------------------------
                    `,
'AI/USER_AI/AI_main.lua': `
    -----------------------------
    -- Dr. Azzy's Merc/Homun AI
    -- Written by Dr. Azzy of iRO Chaos
    -- This AI is intended for use on official servers only
    -- Permission granted to distribute in unmodified form.
    -- You may expand the AI freely through the M_Extra and H_Extra files
    MainVersion="Custom"

    ResCmdList			= List.new()
    -- As of dev 15, global variables are now in Const_.lua
    AutoSkillCooldown		= {}
    AutoSkillCooldown[HFLI_MOON]=0
    AutoSkillCooldown[HVAN_CAPRICE]=0
    AutoSkillCooldown[HVAN_CHAOTIC]=0
    AutoSkillCooldown[HLIF_HEAL]=0
    AutoSkillCooldown[MH_POISON_MIST]=0
    AutoSkillCooldown[MH_LAVA_SLIDE]=0
    AutoSkillCooldown[MH_STEINWAND]=0 	
    AutoSkillCooldown[MH_SUMMON_LEGION]=0
    -----------Config checking----------------

    function doInit(myid)
        if IsHomun(myid) == 0 then -- if the stupid devs made GetV(V_MERTYPE,id) work i wouldnt need this!
            MercType=GetMerType(myid)
        end
        if (UseAttackSkill==0 and UseSkillOnly==1) then
            UseSkillOnly = 0
        end
        if DanceMinSP < 0 then
            DanceMinSP=math.floor(GetV(V_MAXSP,MyID)*DanceMinSP/100)*-1
        end
        if ChaseSPPauseSP < 0 then
            ChaseSPPauseSP=math.floor(GetV(V_MAXSP,MyID)*ChaseSPPauseSP/100)*-1
        end
        MyMaxSP=GetV(V_MAXSP,MyID)
        MyLastSP=GetV(V_SP,MyID)
        local loadtimesuccess = pcall(loadtimeouts)
        if loadtimesuccess==false then
            logappend("AAI_ERROR","failed to load timeouts for owner "..GetV(V_OWNER,MyID).." if this is the first time you've used this account with AzzyAI, disregard this message")
        end
        if GetV(V_SKILLATTACKRANGE,myid,HVAN_CAPRICE) > 1 then -- it was a vani
            OldHomunType=VANILMIRTH
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_ERASER_CUTTER) == 1 then
            if UseEiraEraseCutter and GetV(V_HOMUNTYPE,myid)==EIRA  then
                UseEiraEraseCutter=0
            end
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_XENO_SLASHER) == 1 then 
            if UseEiraXenoSlasher and GetV(V_HOMUNTYPE,myid)==EIRA then
                UseEiraXenoSlasher=0
            end
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_STAHL_HORN) == 1 then 
            if UseEiraEraseCutter and GetV(V_HOMUNTYPE,myid)==EIRA then
                UseBayeriStahlHorn=0
            end
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_HEILIGE_STANGE) == 1 then
            if UseBayeriHailegeStar and GetV(V_HOMUNTYPE,myid)==BAYERI then
                UseBayeriHailegeStar=0
            end		
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_NEEDLE_OF_PARALYZE) == 1 then
            if UseSeraParalyze and GetV(V_HOMUNTYPE,myid)==SERA then
                UseSeraParalyze=0
            end
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_POISON_MIST) < 2 then 
            if UseSeraPoisonMist and GetV(V_HOMUNTYPE,myid)==SERA then
                UseSeraPoisonMist=0
            end
            if UseSeraPainkiller and GetV(V_HOMUNTYPE,myid)==SERA then
                UseSeraPainkiller=0
            end
        end
        if GetV(V_SKILLATTACKRANGE,myid,MH_LAVA_SLIDE) == 1 then
            if UseDieterLavaSlide and GetV(V_HOMUNTYPE,myid)==DIETER then
                UseDieterLavaSlide=0
            end
        end
        if LagReduction ==1 then 
            dofile('./AI/USER_AI/twRO.lua')
        end
        local mskill,mlevel=GetMobSkill(MyID)
        if mskill==0 and (GetV(V_HOMUNTYPE,MyID)==SERA and PoisonMistMode~=0) or (GetV(V_HOMUNTYPE,MyID)==DIETER and LavaSlideMode~=0) then
            mskill,mlevel=GetSightOrAoE(MyID)
        end
        if mskill~=0 and mlevel~=0 and AoEReserveSP==1 and AutoMobMode~=0 then
            ReserveSP=GetSkillInfo(mskill,3,mlevel)
        end

        OnInit()

        local SkillTimeouts = {
            "MagTimeout",
            "SOffensiveTimeout",
            "SDefensiveTimeout",
            "SOwnerBuffTimeout",
            "GuardTimeout",
            "QuickenTimeout",
            "OffensiveOwnerTimeout",
            "DefensiveOwnerTimeout",
            "OtherOwnerTimeout"
        }

        local timeoutAdjustment = AggressiveRelogTracking == 1 and LastAITime_ART - GetTick() or 500

        for _, TimeoutName in ipairs(SkillTimeouts) do
            _G[TimeoutName] = _G[TimeoutName] + timeoutAdjustment
        end

        AdjustCapriceLevel()
        UpdateTimeoutFile()
        DoneInit=1
    end
    function AdjustCapriceLevel()
        local msp = GetV(V_MAXSP, MyID)

        if msp < 30 and VanCapriceLevel == nil then
            VanCapriceLevel = math.max(1, math.floor((msp - 23) / 2))
        end
    end
    function loadtimeouts()
        if IsHomun(MyID)==1 then
            dofile("./AI/USER_AI/data/H_"..GetV(V_OWNER,MyID).."Timeouts.lua")
        else
            dofile("./AI/USER_AI/data/M_"..GetV(V_OWNER,MyID).."Timeouts.lua")
        end
        if AggressiveRelogTracking==1 then
            if IsHomun(MyID)==1 then
                dofile(AggressiveRelogPath.."H_"..GetV(V_OWNER,MyID).."Time.lua")
            else
                dofile(AggressiveRelogPath.."M_"..GetV(V_OWNER,MyID).."Time.lua")
            end
        end
    end

    --########################################
    --### Simplifyed Reseting Calls        ###
    --### by AoShinHo  		       ###
    --########################################

    function ResetMyEnemyVars()
        MyEnemy = 0
        EnemyPosX = {0,0,0,0,0,0,0,0,0,0}
        EnemyPosY = {0,0,0,0,0,0,0,0,0,0}
    end

    function SetIdleResetDest()
        MyState = IDLE_ST
        MyDestX = 0
        MyDestY = 0
    end

    --########################################
    --### Friend the merc/homun - old one  ###
    --### by Misch, new one by Dr. Azzy    ###
    --########################################

    if (AssumeHomun==1) then
        if (NewAutoFriend==0) then
            ff = {}
            Hactors = GetActors()
            Howner  = GetV(V_OWNER,Hactors[1])
            FX = 0
            FY = 0
            OX,OY = GetV(V_POSITION,Howner)
            for i,v in ipairs(Hactors) do
                if (v ~= Howner) then
                    if (IsMonster(v)==0) then
                        FX,FY = GetV(V_POSITION,v)
                        if (FX==OX and FY==OY and v<100000) then --is not a player
                            MyFriends[v]=2
                        end
                    end
                end
            end
        else
            NeedToDoAutoFriend=1
            TraceAI("Setting NeedToDoAutoFriend")
        end
    end
    --####################################
    --######## Command Processing ########
    --####################################

    function	OnMOVE_CMD (x,y)
        TraceAI ("OnMOVE_CMD")
        if GetDistanceAPR(GetV(V_OWNER,MyID),x,y) > IdleWalkDistance or x==0 or y==0 then -- Bogus move command
            local ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
            logappend("AAI_ERROR","move command to invalid location "..formatpos(x,y).." owner pos "..formatpos(ox,oy))
            TraceAI("OnMOVE_CMD - Command disregarded; invalid location logged")
            return
        end
        
        ResetCounters()
        if ( x == MyDestX and y == MyDestY and MOTION_MOVE == GetV(V_MOTION,MyID)) then
            return
        end

        local curX, curY = GetV (V_POSITION,MyID)
        if (math.abs(x-curX)+math.abs(y-curY) > IdleWalkDistance) then
            List.pushleft (ResCmdList,{MOVE_CMD,x,y})
            x = math.floor((x+curX)/2)
            y = math.floor((y+curY)/2)
        end

        MyMoveX,MyMoveY=x,y
        MyDestX,MyDestY=x,y
        Move (MyID,MyDestX,MyDestY)	
        MyState = MOVE_CMD_ST

        if (MirAIFriending==1) then --emulate MirAI's annoying friending process
            TraceAI("Starting Friend Routine")
            local actors = GetActors()
            for i,v in ipairs(actors) do
                if (IsMonster(v)~=1 and v~=GetV(V_OWNER,MyID) and v~=MyID) then
                    xx,yy=GetV(V_POSITION,v)
                    if (xx==x and (yy+1==y or yy-1==y)) then
                        
                        if (MyFriends[v]==nil) then
                            MyFriends[v] = 1
                            UpdateFriends()
                            MyState=FRIEND_CIRCLE_ST
                            TraceAI("Friend Addition")
                            NewFriendX,NewFriendY=GetV(V_POSITION,v)
                            return
                        elseif (MyFriends[v]~=nil) then
                            MyFriends[v] = nil
                            UpdateFriends()
                            MyState=FRIEND_CROSS_ST
                            TraceAI("Friend Removal")
                            NewFriendX,NewFriendY=GetV(V_POSITION,v)
                            return
                        end
                    end
                end
            end
        end
    end


    function	OnSTOP_CMD ()

        TraceAI ("OnSTOP_CMD")
        logappend("AAI_ERROR","STOP_CMD sent! This should NEVER HAPPEN!")
        if (GetV(V_MOTION,MyID) ~= MOTION_STAND) then
            Move (MyID,GetV(V_POSITION,MyID))
        end
        SetIdleResetDest()
        ResetMyEnemyVars()
        MySkill = 0

    end


    function	OnATTACK_OBJECT_CMD (id)
        TraceAI ("OnATTACK_OBJECT_CMD")
        ResetCounters()
        MySkill = 0
        MyEnemy = id
        BypassKSProtect=1
        if (UseBerserkAttack==1) then
            BerserkMode=1
        end
        MyState = CHASE_ST
        OnCHASE_ST()
    end


    function	OnATTACK_AREA_CMD (x,y)

        TraceAI ("OnATTACK_AREA_CMD")
        logappend("AAI_ERROR","ATTACK_AREA_CMD sent! This should NEVER HAPPEN!")
        if (x ~= MyDestX or y ~= MyDestY or MOTION_MOVE ~= GetV(V_MOTION,MyID)) then
            Move (MyID,x,y)	
        end
        MyDestX = x
        MyDestY = y
        ResetMyEnemyVars()
        MyState = ATTACK_AREA_CMD_ST
        
    end

    function	OnPATROL_CMD (x,y)

        TraceAI ("OnPATROL_CMD")
        logappend("AAI_ERROR","PATROL_CMD sent! This should NEVER HAPPEN!")
        MyPatrolX , MyPatrolY = GetV (V_POSITION,MyID)
        MyDestX = x
        MyDestY = y
        Move (MyID,x,y)
        MyState = PATROL_CMD_ST

    end


    function	OnHOLD_CMD ()

        TraceAI ("OnHOLD_CMD")
        logappend("AAI_ERROR","HOLD_CMD sent! This should NEVER HAPPEN!")
        MyDestX = 0
        MyDestY = 0
        ResetMyEnemyVars()
        MyState = HOLD_CMD_ST

    end


    function	OnSKILL_OBJECT_CMD (level,skill,id)

        TraceAI ("OnSKILL_OBJECT_CMD"..skill.." "..id.." "..level)
        ResetCounters()
        if skill==MH_PAIN_KILLER and IsPlayer(id)==1 and PainkillerFriends~=0 and id~=GetV(V_OWNER,MyID) then
            MyPState = MyState
            MyState = PROVOKE_ST
            MyPEnemy = id
            MyPSkill = skill
            MyPSkillLevel = level
            MyPMode = id
            if MyFriends[id]~=FRIEND then
                MyFriends[id]=PKFRIEND
                if PainkillerFriendsSave==1 then
                    UpdateFriends()
                end
            end
            return OnPROVOKE_ST()
        else
            MySkillLevel = level
            MySkill = skill
            MyEnemy = id
            if IsMonster(id)==1 and SuperPassive~=1 then
                BypassKSProtect=1
                if (UseBerserkSkill==1) then
                    BerserkMode=1
                end
                MyState = CHASE_ST
                OnCHASE_ST()
            else
                MyState = SKILL_OBJECT_CMD_ST
            end
        end
    end


    function	OnSKILL_AREA_CMD (level,skill,x,y)
        ResetCounters()
        TraceAI ("OnSKILL_AREA_CMD")
        targetx,targety=Closest(MyID,x,y,AttackRange(MyID,skill,level))
        Move (MyID,targetx,targety)
        MyDestX = x
        MyDestY = y
        MySkillLevel = level
        MySkill = skill
        MyState = SKILL_AREA_CMD_ST
        
    end

    function	OnFOLLOW_CMD ()
        ReturnToMoveHold = 0 
        if (MyState ~= FOLLOW_CMD_ST) then
            if StickyStandby > 0 then
                ShouldStandby=1
            end
            BetterMoveToOwner (MyID,FollowStayBack)
            MyState = FOLLOW_CMD_ST
            ResetMyEnemyVars()
            MySkill = 0
            TraceAI ("OnFOLLOW_CMD")
        else
            if StickyStandby > 0 then
                ShouldStandby=0
            end
            MyState = IDLE_ST
            ResetMyEnemyVars()
            MySkill = 0
            TraceAI ("FOLLOW_CMD_ST --> IDLE_ST")
        end

    end

    -- Define a table to map command types to handler functions
    local commandHandlers = {
        [MOVE_CMD] = function(msg) 
            TraceAI("MOVE_CMD")
            OnMOVE_CMD(msg[2], msg[3])
        end,
        [STOP_CMD] = function(msg)
            TraceAI("STOP_CMD")
            OnSTOP_CMD()
        end,
        [ATTACK_OBJECT_CMD] = function(msg)
            TraceAI("ATTACK_OBJECT_CMD")
            OnATTACK_OBJECT_CMD(msg[2])
        end,
        [ATTACK_AREA_CMD] = function(msg)
            TraceAI("ATTACK_AREA_CMD")
            OnATTACK_AREA_CMD(msg[2], msg[3])
        end,
        [PATROL_CMD] = function(msg)
            TraceAI("PATROL_CMD")
            OnPATROL_CMD(msg[2], msg[3])
        end,
        [HOLD_CMD] = function(msg)
            TraceAI("HOLD_CMD")
            OnHOLD_CMD()
        end,
        [SKILL_OBJECT_CMD] = function(msg)
            TraceAI("SKILL_OBJECT_CMD")
            OnSKILL_OBJECT_CMD(msg[2], msg[3], msg[4], msg[5])
        end,
        [SKILL_AREA_CMD] = function(msg)
            TraceAI("SKILL_AREA_CMD")
            OnSKILL_AREA_CMD(msg[2], msg[3], msg[4], msg[5])
        end,
        [FOLLOW_CMD] = function(msg)
            TraceAI("FOLLOW_CMD")
            OnFOLLOW_CMD()
        end
    }

    -- Main function to process commands
    function ProcessCommand(msg)
        local handler = commandHandlers[msg[1]]
        if handler then
            handler(msg)
        else
            TraceAI("Unknown command: " .. tostring(msg[1]))
            logappend("Unknown command: " .. tostring(msg[1]))
        end
    end

    function ResetCounters()
        MyPState			= 0
        MyPSkill			= 0
        MyPEnemy			= 0
        MyPSkillLevel			= 0
        MySkillUsedCount		= 0
        ChaseGiveUpCount		= 0
        AttackGiveUpCount		= 0
        ChaseDebuffUsed			= 0
        AttackDebuffUsed		= 0
        BypassKSProtect			= 0
        BerserkMode			= 0
        ReturnToState			= 0
        NewFriend			= 0
        FriendMotionTime		= 0
        FriendCircleIter		= 0
        FriendCircleTimeout		= 0
        AtkPosbugFixTimeout		= 0
        SkillObjectCMDTimeout		= 0
        FollowTryCount			= 0
        MyMoveX,MyMoveY			= 0,0
        if CastSkillMode < 0 then
            CastSkill		= 0
            CastSkillLevel		= 0
            CastSkillMode		= 0
        end
        return
    end

    --###############################
    --######## State Process ########
    --###############################

    function OnIDLE_ST ()
        -- Initial checks and resetting variables
        TraceAI("OnIDLE_ST")
        ResetCounters()
        MySkill, MyDestX, MyDestY, MyEnemy = 0, 0, 0, 0
        
        if DoIdleTasks() == nil then return end

        -- StickyStandby handling
        if ShouldStandby == 1 and StickyStandby > 0 then
            MyState = FOLLOW_CMD_ST
            return
        end

        -- Targeting logic
        if SuperPassive ~= 1 then
            local blocklist = SelectEnemy(GetFriendTargets())
            if blocklist ~= 0 then -- MYOWNER_ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI("IDLE_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
                if FastChangeCount < FastChangeLimit and FastChange_I2C == 1 then
                    OnCHASE_ST()
                end
                return
            end

            -- Aggro and attack conditions
            aggro = (HPPercent(MyID) > AggroHP and (SPPercent(MyID) > AggroSP or AggroSP == 0) and (ShouldStandby == 0 or StickyStandby == 0)) and 1 or 0
            blocklist = SelectEnemy(GetEnemyList(MyID, aggro))

            if blocklist ~= 0 then
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI("IDLE_ST -> CHASE_ST : ATTACKED_IN")
                if FastChangeCount < FastChangeLimit and FastChange_I2C == 1 then
                    return OnCHASE_ST()
                end
                return
            end

            -- Tank mode if aggro conditions are met
            if aggro == 1 and TankMonsterCount < TankMonsterLimit then
                blocklist = SelectEnemy(GetEnemyList(MyID, -1))
                if blocklist ~= 0 then
                    MyState = TANKCHASE_ST
                    MyEnemy = blocklist
                    TraceAI("IDLE_ST -> TANKCHASE_ST")
                    return
                end
            end
        end

        -- Following or moving to owner
        local distance
        if ReturnToMoveHold ~= 0 then
            distance = GetDistanceAP(MyID, StickyX, StickyY)
        else
            distance = GetDistanceFromOwner(MyID)
        end

        -- Idle walk or follow logic
        if UseIdleWalk ~= 0 and HPPercent(MyID) > AggroHP and SPPercent(MyID) > math.max(AggroSP, IdleWalkSP) then
            if distance > GetMoveBounds() or distance == -1 then
                MyState = FOLLOW_ST
                TraceAI("IDLE_ST -> FOLLOW_ST")
                return
            else
                TraceAI("IDLE_ST -> IDLEWALK_ST, idle walk mode ="..UseIdleWalk)
                MyState = IDLEWALK_ST
            end
        elseif distance > DiagonalDist(FollowStayBack + 1) and not (ChaseSPPause == 1 and GetV(V_SP, MyID) < ChaseSPPauseSP and GetTick() - math.max(LastMovedTime, LastSPTime) > (5000 - ChaseSPPauseTime)) or distance == -1 then
            MyState = FOLLOW_ST
            TraceAI("IDLE_ST -> FOLLOW_ST")
            return OnFOLLOW_ST()
        end

        -- Healing and buffs
        if UseAutoHeal == 3 and DoHealingTasks(MyID) == 1 then return end
        DoAutoBuffs(-2)

        -- Reevaluate Idle Walk
        if UseIdleWalk ~= 0 and HPPercent(MyID) > AggroHP and SPPercent(MyID) > math.max(AggroSP, IdleWalkSP) then
            TraceAI("IDLE_ST -> IDLEWALK_ST, idle walk mode ="..UseIdleWalk)
            MyState = IDLEWALK_ST
        end
    end


    function	OnFOLLOW_ST ()

        TraceAI ("OnFOLLOW_ST - follow try count: "..FollowTryCount.." ownerpos: "..formatpos(GetV(V_POSITION,GetV(V_OWNER,MyID))).." my pos history:"..formatmypos(10))
        local dist = GetDistanceFromOwner(MyID)
        if dist > GetMoveBounds() then 
            ReturnToMoveHold = 0
            StickyX,StickyY=0,0
        end
        if ReturnToMoveHold ~=0 then
            dist = GetDistanceAP(MyID,StickyX,StickyY)
        end
        if (dist <= DiagonalDist(FollowStayBack+1)) then		--  DESTINATION_ARRIVED_IN 
            FollowTryCount=0
            MyState = IDLE_ST
            TraceAI ("FOLLOW_ST -> IDLE_ST ownerpos: "..formatpos(GetV(V_POSITION,GetV(V_OWNER,MyID))).." my pos history:"..formatmypos(10))
            if (FastChangeCount < FastChangeLimit and FastChange_F2I==1) then
                FastChangeCount = FastChangeCount+1
                return OnIDLE_ST()
            end
        else
            if (FollowTryCount > FollowTryPanic and GetV(V_MOTION,MyID)~=MOTION_MOVE) then
                if FollowTryCount > 2*FollowTryPanic then
                    if FollowTryCount > 3*FollowTryPanic then 
                        TraceAI("FOLLOW_ST -> IDLE_ST - Can't follow even using panic'ed methods - Giving up")
                        MyState=IDLE_ST
                        if (FastChangeCount < FastChangeLimit and FastChange_F2I==1) then
                            FastChangeCount = FastChangeCount+1
                            return OnIDLE_ST()
                        end
                    else
                        if ReturnToMoveHold ==0 then
                            MoveToOwner(MyID)
                            FollowTryCount=FollowTryCount+1
                            TraceAI("Emergency follow - MoveToOwner() called")
                        else 
                            TraceAI("FOLLOW_ST -> IDLE_ST - Can't get to move sticky location even using panic'ed methods - Giving up")
                            MyState=IDLE_ST
                            if (FastChangeCount < FastChangeLimit and FastChange_F2I==1) then
                                FastChangeCount = FastChangeCount+1
                                return OnIDLE_ST()
                            end
                        end
                    end
                else
                    FollowTryCount=FollowTryCount+1
                    if ReturnToMoveHold==0 then
                        BetterMoveToOwner (MyID,1)
                    else
                        BetterMoveToLoc(MyID,1,StickyX,StickyY)
                    end
                end
            else
                local dx,dy
                if ReturnToMoveHold==0 then
                    dx,dy=BetterMoveToOwnerXY(MyID,FollowStayBack)
                else
                    dx,dy=BetterMoveToLocXY(MyID,FollowStayBack,StickyX,StickyY)
                end
                local mx,my=GetV(V_POSITION,MyID)
                --TraceAI("followobstacle dest"..formatpos(dx,dy).." pos "..formatpos(mx,my))
                if math.abs(my-dy) <=1 then
                    --TraceAI("math.abs(my-dy) <=1")
                    if math.abs(mx-dx) <=1 then --We could be in a bounce loop, better see if we are
                        --TraceAI("math.abs(my-dy) <=1")
                        if MyPosY[1]==my then
                            for v=2,5,1 do
                                if MyPosX[v]==dx then
                                    MoveToOwner(MyID)
                                    FollowTryCount=FollowTryCount+1
                                    TraceAI("Bounce loop detected, emergency measures taken")
                                    break
                                end
                                if v==5 then
                                    MyDestX,MyDestY=dx,dy
                                    Move(MyID,MyDestX,MyDestY)
                                end
                            end
                        else
                            MyDestX,MyDestY=dx,dy
                            Move(MyID,MyDestX,MyDestY)
                        end
                    else
                        --TraceAI("math.abs(mx-dx) > 1"..math.abs(mx-dx))
                        MyDestX,MyDestY=dx,dy
                        Move(MyID,MyDestX,MyDestY)
                    end
                else
                    --TraceAI("math.abs(my-dy) > 1"..math.abs(my-dy))
                    MyDestX,MyDestY=dx,dy
                    Move(MyID,MyDestX,MyDestY)
                end
                if (GetV(V_MOTION,MyID) ~= MOTION_MOVE) then
                    FollowTryCount=FollowTryCount+1
                else
                    FollowTryCount=0
                end
            end
            TraceAI ("FOLLOW_ST -> FOLLOW_ST ownerpos: "..formatpos(GetV(V_POSITION,GetV(V_OWNER,MyID))).."my pos history:"..formatmypos(10).."dest cell"..formatpos(MyDestX,MyDestY))
            return
        end
    end




    function	OnCHASE_ST ()
        MyAttackStanceX,MyAttackStanceY = 0,0
        TraceAI ("OnCHASE_ST")
        aggro = GetAggroCount()
        if(aggro > UseBerserkMobbed and UseBerserkMobbed > 0)then
            BerserkMode=1
        end	
        if DoAutoBuffs(-1) == 1 then
            DoAutoBuffs(2)
        end
        if (UseSkillOnly==1 and MySkill ~= 0) then
            skill,level=GetAtkSkill(MyID)
        else
            skill=nil
            level=nil
        end
        if true == IsOutOfSight(MyID,MyEnemy) then
            value="true "
        else
            value="false"
        end
        if(IsNotKS(MyID,MyEnemy)==0) then
            local reason=GetKSReason(MyID,MyEnemy)
            TraceAI("CHASE_ST -> IDLE_ST : Enemy is taken "..reason)
            SetIdleResetDest()
            ResetMyEnemyVars()
            ChaseGiveUpCount=0
            if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                FastChangeCount = FastChangeCount+1
                return OnIDLE_ST()
            end
        end
        if true == IsOutOfSight(MyID,MyEnemy) then	-- ENEMY_OUTSIGHT_IN	
            SetIdleResetDest()
            ResetMyEnemyVars()
            TraceAI ("CHASE_ST -> IDLE_ST : Enemy out of sight")
            ChaseGiveUpCount=0
            
            if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                FastChangeCount = FastChangeCount+1
                return OnIDLE_ST()
            else
                return
            end
        end
        if GetV(V_MOTION,MyID)~=MOTION_MOVE then
            if ChaseGiveUpCount > ChaseGiveUp then
                Unreachable[MyEnemy]=1
                if SelectEnemy(GetEnemyList(MyID,-2)) == MyEnemy then --Oh crap, 
                    TraceAI("CHASE_ST -> FOLLOW_ST : Target "..MyEnemy.." marked unreachable but is also rescue target! Trying follow state in hopes of a clean line of attack from owner")
                    MyState = FOLLOW_ST
                    ResetMyEnemyVars()
                    MyDestX,MyDestY=0,0
                    ChaseGiveUpCount=0
                    return OnFOLLOW_ST()
                else
                    SetIdleResetDest()
                    TraceAI ("CHASE_ST -> IDLE_ST : Marking target "..MyEnemy.." unreachable")
                    ChaseGiveUpCount=0
                    ResetMyEnemyVars()
                    if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                        FastChangeCount = FastChangeCount+1
                        return OnIDLE_ST()
                    else
                        return
                    end
                end
            end
            ChaseGiveUpCount=ChaseGiveUpCount+1
        elseif MyEnemies[3]==MyEnemy and GetDistanceAPR(MyEnemy,MyPosX[3],MyPosY[3]) <= GetDistanceAR(MyID,MyEnemy) then
            ChaseGiveUpCount=ChaseGiveUpCount+1
            TraceAI("CHASE_ST: We're not getting any closer - we were "..GetDistanceAPR(MyEnemy,MyPosX[3],MyPosY[3]).." cells away 2 cycles ago, now "..GetDistanceAR(MyID,MyEnemy).." Increment ChaseGiveUpCount")
        end
        OnChaseStart()
        if OpportunisticTargeting ==1 and MySkill==0 and SuperPassive~=1 then
            if (HPPercent(MyID) > AggroHP and (SPPercent(MyID) > AggroSP or AggroSP==0) and (ShouldStandby == 0 or StickyStandby ==0)) then
                aggro=1
            else
                aggro=0
            end
            blocklist=SelectEnemy(GetEnemyList(MyID,aggro),MyEnemy)
            if blocklist ~= 0 then
                TraceAI("Opportunistic target change - dropping target "..MyEnemy.." for target "..blocklist)
                MyEnemy=blocklist	
                EnemyPosX = {0,0,0,0,0,0,0,0,0,0}
                EnemyPosY = {0,0,0,0,0,0,0,0,0,0}
            end
        elseif ((MySkill==MH_TINDER_BREAKER or MySkill==MH_EQC or MySkill==MH_CBC) and EleanorMode==0) or ((MySkill==MH_SONIC_CRAW or MySkill==MH_SILVERVEIN_RUSH or MySkill==MH_MIDNIGHT_FRENZY) and EleanorMode==1) then
            if EleanorDoNotSwitchMode == 1 then 
                TraceAI("Was told to use "..FormatSkill(MySkill,MyLevel).." but am in wrong mode for it, and EleanorDoNotSwitchMode==1")
                logappend("AAI_ERROR","Was told to use "..FormatSkill(MySkill,MyLevel).." but am in wrong mode for it, and EleanorDoNotSwitchMode==1")
            else
                if AutoSkillTimeout < GetTick() then
                    DoSkill(MH_STYLE_CHANGE,1,MyID,8)
                end
            end
        end
        if (true == IsInAttackSight(MyID,MyEnemy,skill,level)) then  -- ENEMY_INATTACKSIGHT_IN
            MyState = ATTACK_ST
            AttackTimeout=GetTick()+AttackTimeLimit
            ExChaseGiveUpCount=ChaseGiveUpCount
            ChaseGiveUpCount=0
            MySkillUsedCount=0
            TraceAI ("CHASE_ST -> ATTACK_ST : ENEMY_INATTACKSIGHT_IN")
            if (FastChangeCount < FastChangeLimit and FastChange_C2A == 1) then
                FastChangeCount = FastChangeCount+1
                return OnATTACK_ST()
            else
                return
            end
        elseif UseSkillOnly == -1 and (GetTick() >= AutoSkillTimeout) then
            dist=GetDistanceA(MyID,MyEnemy)
            local tact_skill,tact_debuff,tact_sp,tact_skillclass=GetTact(TACT_SKILL,MyEnemy),GetTact(TACT_DEBUFF,MyEnemy),GetTact(TACT_SP,MyEnemy),GetTact(TACT_SKILLCLASS,MyEnemy)
            skilltouse={-1,0,0}
            local SkillList=GetTargetedSkills(MyID)
            local availsp = GetV(V_SP,MyID)
            if BerserkMode~=1 or Berserk_IgnoreMinSP ~=1 then
                availsp = availsp - tact_sp
            end
            TraceAI("Begin autoskill while chasing routine")
            if (tact_skill < 0) then		-- Negative value of TACT_SKILL -> 1 cast of skill
                skill_level=tact_skill*-1	-- with level = to the absolute value of the
                tact_skill=1			-- value of TACT_SKILL.
            else
                skill_level=11
            end
            for i,v in ipairs(SkillList) do

                skilltype=v[1]
                if v[2]~=0 then
                    if IsInAttackSight(MyID,MyEnemy,v[2],v[3])==true then
                        if (skilltype == MOB_ATK and UseHomunSSkillChase==1 and AutoMobMode~=0  and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1))) then
                            local mobskill_level=skill_level
                            if AOEFixedLevel == 1 then
                                mobskill_level=v[3]
                            end
                            local mobmode=0
                            if AutoMobMode==2 then
                                mobmode=1
                            end
                            mobskillcount=GetMobCount(v[2],math.min(v[3],mobskill_level),MyEnemy,mobmode)
                            --TraceAI("mobskillcount="..mobskillcount.."tact_skillclass="..tact_skillclass.."class_mob="..CLASS_MOB.."AutoMobCount="..AutoMobCount.." "..FormatSkill(v[2],math.min(v[3],mobskill_level)))
                            if (mobskillcount >= AutoMobCount or tact_skillclass == CLASS_MOB) then
                                if (availsp >= GetSkillInfo(v[2],3,math.min(v[3],mobskill_level)))then
                                    if (skilltouse[1] < 2) then
                                        skilltouse=v
                                    end
                                end
                            end
                        elseif (skilltype ==DEBUFF_ATK and ChaseDebuffUsed==0) then
                                if (tact_debuff*-1 == v[2] or (tact_debuff==-1 and BasicDebuffs[v[2]]~=nil)) then
                                    if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                        skilltouse=v
                                    end
                                end
                        elseif (skilltype==MAIN_ATK and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_S and tact_skillclass~=CLASS_MINION and tact_skillclass~=CLASS_MIN_S) then
                            if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                skilltouse=v
                            end
                        elseif (skilltype==S_ATK and UseHomunSSkillChase==1 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_OLD and tact_skillclass~=CLASS_MINION and tact_skillclass~=CLASS_MIN_OLD) then
                            if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                skilltouse=v
                            end
                        elseif (skilltype==COMBO_ATK and UseHomunSSkillChase==1 and (AutoComboMode==2 or (AutoComboMode==1 and (tact_skillclass == CLASS_COMBO_1 or tact_skillclass==CLASS_COMBO_2)) or Berserk_ComboAlways==1) and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (v[2] == MH_SILVERVEIN_RUSH or tact_skillclass~=CLASS_COMBO_1)) then
                            if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                skilltouse=v
                            end
                        elseif (skilltype==GRAPPLE_ATK and UseHomunSSkillChase==1 and (AutoComboMode==2 or (AutoComboMode==1 and tact_skillclass > 5) or Berserk_ComboAlways==1) and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (v[2] == MH_TINDER_BREAKER or (v[2]==MH_CBC and tact_skillclass~=CLASS_GRAPPLE) or tact_skillclass==CLASS_GRAPPLE_2 )) then
                            if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                skilltouse=v
                            end
                        elseif (skilltype==MINION_ATK and UseHomunSSkillChase==1 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (tact_skillclass==CLASS_MINION or tact_skillclass==CLASS_MIN_OLD or tact_skillclass==CLASS_MIN_S)) then
                            if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                skilltouse=v
                            end
                        end
                    end
                end
            end
            if skilltouse[2]~=0 then
                TraceAI("Using skill while chasing:"..skilltouse[2])
                local slvl=skilltouse[3]
                if skill_level~=11 then
                    slvl=skill_level
                end
                DoSkill(skilltouse[2],slvl,MyEnemy)
                if skilltouse[1] == DEBUFF_ATK then
                    ChaseDebuffUsed=1
                end
                MySkillUsedCount=1
            end
        else
            TraceAI("Not in range, and can't use chase skill")
        end
        if (GetTact(TACT_CHASE,MyEnemy)~=1) then
            local alt = 0
            if (ChaseGiveUpCount >= 4 and MyPosX[1] == MyPosX[3]  and MyPosY[1]==MyPosY[3]) then
                alt=math.random(2)
                TraceAI("Using alt movement"..alt)
            end
            ex,ey=GetV(V_POSITION,MyEnemy)
            TraceAI("State History: "..MyStates[1].." "..MyStates[2].." "..MyStates[3].." "..MyStates[4].." "..MyStates[5])
            TraceAI("Pos History: "..formatpos(MyPosX[1],MyPosY[1]).." "..formatpos(MyPosX[2],MyPosY[2]).." "..formatpos(MyPosX[3],MyPosY[3]).." "..formatpos(MyPosX[4],MyPosY[4]).." "..formatpos(MyPosX[5],MyPosY[5]))
            TraceAI("Enemy History: "..MyEnemies[1].." "..MyEnemies[2].." "..MyEnemies[3].." "..MyEnemies[4].." "..MyEnemies[5])
            TraceAI("Enemy Pos History: "..formatpos(EnemyPosX[1],EnemyPosY[1]).." "..formatpos(EnemyPosX[2],EnemyPosY[2]).." "..formatpos(EnemyPosX[3],EnemyPosY[3]).." "..formatpos(EnemyPosX[4],EnemyPosY[4]).." "..formatpos(EnemyPosX[5],EnemyPosY[5]))
            TraceAI("current enemy: "..MyEnemy.." "..formatpos(ex,ey))
            if MyStates[1]==CHASE_ST and MyStates[2]==ATTACK_ST and MyStates[3]==CHASE_ST and MyEnemy==MyEnemies[2] and IsPlayer(MyEnemy)~=1 and EnemyPosX[3]==ex and EnemyPosY[3]==ey then
                x,y=AdjustOpp(x,y,ex,ey)
                Unreachable[MyEnemy]=1
                TraceAI("CHASE_ST: We transitioned to attack state vs this target 2 cycles ago, now we're chasing it again, and it hasn't moved! Trying to do AdjustOpp, and deprioritizing monster to prevent loop.")
            elseif EnemyPosX[3]~=0 and EnemyPosY[3]~=0 and (ex~=EnemyPosX[3] or ey~=EnemyPosY[3]) and MyEnemy==MyEnemies[3] and alt==0 then
                dx,dy = ex-EnemyPosX[3],ey-EnemyPosY[3]
                r=AttackRange(MyID,MySkill,MySkillLevel)
                x,y = Closest(MyID,ex+dx,ey+dy,r,alt)
                x,y = AdjustStandPoint(x,y,ex,ey,r,alt)
            else
                x,y = GetStandPoint(MyID,MyEnemy,MySkill,MySkillLevel,alt)
                if x==-1 or y==-1 then
                    if AttackRange(MyID,MySkill,MySkillLevel) < 2 or alt > 0 then 
                        SetIdleResetDest()
                        Unreachable[MyEnemy]=1
                        ResetMyEnemyVars()
                        TraceAI ("CHASE_ST -> IDLE_ST : Cannot attack this target, GetStandPoint() reports that all cells around it are occupied.")
                        ChaseGiveUpCount=0
                        if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                            FastChangeCount = FastChangeCount+1
                            return OnIDLE_ST()
                        end
                    else
                        x,y = GetStandPoint(MyID,MyEnemy,MySkill,MySkillLevel,1)
                        if x==-1 or y==-1 then
                            SetIdleResetDest()
                            Unreachable[MyEnemy]=1
                            ResetMyEnemyVars()
                            TraceAI ("CHASE_ST -> IDLE_ST : Cannot attack this target, GetStandPoint() can't get an unoccupied cell")
                            ChaseGiveUpCount=0
                            if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                                FastChangeCount = FastChangeCount+1
                                return OnIDLE_ST()
                            end
                        end
                    end
                end
            end
            ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
            if GetDistanceAPR(GetV(V_OWNER,MyID),x,y) < GetMoveBounds() then
                if ((x~=MyDestX or y~=MyDestY) or GetV(V_MOTION,MyID)~=MOTION_MOVE)  then
                    MyDestX, MyDestY=x,y
                    Move (MyID,MyDestX,MyDestY)
                    TraceAI ("CHASE_ST -> CHASE_ST : DESTCHANGED_IN "..MyDestX..","..MyDestY.."mypos "..MyPosX[1]..","..MyPosY[1].."owner pos"..ox..","..oy.." enemypos "..ex..","..ey.." GetDistanceAPR="..GetDistanceAPR(GetV(V_OWNER,MyID),x,y))
                else
                    TraceAI("CHASE_ST -> CHASE_ST : Destination not changed "..MyDestX..","..MyDestY.."mypos "..MyPosX[1]..","..MyPosY[1].."owner pos"..ox..","..oy.." enemypos "..ex..","..ey.." GetDistanceAPR="..GetDistanceAPR(GetV(V_OWNER,MyID),x,y))
                end
            else --if ChaseGiveUpCount > 4 then
                SetIdleResetDest()
                Unreachable[MyEnemy]=1
                ResetMyEnemyVars()
                TraceAI ("CHASE_ST -> IDLE_ST : Following enemy would exceed move bounds."..x..","..y.."mypos "..MyPosX[1]..","..MyPosY[1].."owner pos"..ox..","..oy.." enemypos "..ex..","..ey.." GetDistanceAPR="..GetDistanceAPR(GetV(V_OWNER,MyID),x,y))
                ChaseGiveUpCount=0
                if (FastChangeCount < FastChangeLimit and FastChange_C2I == 1) then
                    FastChangeCount = FastChangeCount+1
                    
                    return OnIDLE_ST()
                end
            end
        end
        return
    end

    function OnATTACK_ST ()
        TraceAI ("OnATTACK_ST MyEnemy: "..MyEnemy.." MyPos "..formatpos(GetV(V_POSITION,MyID)).." ("..GetV(V_MOTION,MyID)..") enemypos "..formatpos(GetV(V_POSITION,MyEnemy)).." ("..GetV(V_MOTION,MyEnemy)..") MyTarget: "..GetV(V_TARGET,MyID))	
        if (true == IsOutOfSight(MyID,MyEnemy)) then -- first thing's first, if enemy is gone drop it. 
            MyState = IDLE_ST
            ResetMyEnemyVars()
            MySkillUseCount = 0
            TraceAI("ATTACK_ST -> IDLE_ST -- target gone")
            return OnIDLE_ST()
        end
        if (MOTION_DEAD == GetV(V_MOTION,MyEnemy)) then   -- Enemy dead? Okay we're done here - drop it. 
            MyState = IDLE_ST
            ResetMyEnemyVars()
            MySkillUseCount = 0
            TraceAI("ATTACK_ST -> IDLE_ST -- Enemy dead")
            return OnIDLE_ST()
        end
        local mytarg=GetV(V_TARGET,MyID)
        if mytarg~=MyEnemy and MyStates[1]==ATTACK_ST then
            AttackGiveUpCount=AttackGiveUpCount+1
            if AttackGiveUpCount > 2 then --MyEnemies[3]==MyEnemy and MyStates[3]==ATTACK_ST and MyStates[2]==ATTACK_ST then
                local tx,ty=GetV(V_POSITION,MyEnemy)
                local x,y=GetV(V_POSITION,MyID)
                if AttackGiveUpCount < 5 then
                    Move(MyID,tx,ty)
                    TraceAI("ATTACK_ST: We've been attacking for 3 cycles, but we still haven't attacked! Something is wrong - Moving to monster cell")
                elseif AttackGiveUpCount < AttackGiveUp then 
                    nx,ny=AdjustOpp(x,y,tx,ty)
                    Move(MyID,tx,ty)
                    TraceAI("ATTACK_ST: We've been attacking for 3 cycles, but we still haven't attacked! Something is wrong - Moving to adjust opposite")
                elseif AttackGiveUpCount > AttackGiveUp and MyEnemies[AttackGiveUp]==MyEnemy and MyStates[AttackGiveUp]==ATTACK_ST then
                    MyState = IDLE_ST
                    Unreachable[MyEnemy]=1
                    ResetMyEnemyVars()
                    MySkillUseCount = 0
                    TraceAI("ATTACK_ST -> IDLE_ST -- We've been attacking for 5 cycles, tried moving around, and still haven't attacked it. Marking unreachable")
                    return OnIDLE_ST()
                end
            end
        else --We have attacked it successfully
            if GetV(V_MOTION,MyEnemy)==MOTION_DAMAGE then
                local t=1
                for i,v in ipairs(GetActors()) do
                    if v~=MyID then
                        if GetV(V_TARGET,v)==MyEnemy then
                            t=0
                            break
                        end
                    end
                end
                if t==1 then
                    AttackTimeout=GetTick()+AttackTimeLimit
                    TraceAI("AttackTimeout Reset - we're clearly attacking successfully")
                end
            end
        end
        if (AttackTimeout < GetTick() and AttackTimeLimit > 0) then -- Attack time limit reached.
            MyState = FOLLOW_ST
            Unreachable[MyEnemy] = 1
            ResetMyEnemyVars()
            MySkillUseCount = 0
            TraceAI("ATTACK_ST -> FOLLOW_ST -- attack timeout reached, so we're probably posbugged. Dropping target and returning to owner in the hope that that sorts it out")
            return OnFOLLOW_ST()
        end
        
        local aggro = GetAggroCount()
        if(aggro > UseBerserkMobbed and UseBerserkMobbed > 0)then
            BerserkMode=1
        end	
        DoAutoBuffs(2)
        local skill,level
        if UseSkillOnly==1 then
            skill,level=GetAtkSkill(MyID)
        elseif MySkill~=0 then
            skill,level=MySkill,MySkillLevel
        else 
            skill,level=nil,nil
        end
        if (false == IsInAttackSight(MyID,MyEnemy,skill,level)) then  -- Check if we can attack enemy, if not back to chase 
            ResetCounters()
            MyState=CHASE_ST
            TraceAI ("ATTACK_ST -> CHASE_ST  : ENEMY_OUTATTACKSIGHT_IN MyEnemy: "..MyEnemy.." distance to "..GetDistanceA(MyID,MyEnemy))
            if (FastChangeCount < FastChangeLimit and FastChange_A2C == 1) then
                FastChangeCount = FastChangeCount+1
                return OnCHASE_ST()
            end
        end
        if (MyAttackStanceX==0) then
            x,y=GetV(V_POSITION,MyID)
            MyAttackStanceX,MyAttackStanceY=x,y
            logappend("AAI_DANCE","Attack Stance set to "..MyDestX..","..MyDestY.." current pos: "..x..","..y)
        end
        if (UseAutoPushback > 0) then
            if DoAutoPushback(MyID)  == nil then
                return
            end
        end
        OnAttackStart()
        local tact_skill,tact_debuff,tact_sp,tact_skillclass=GetTact(TACT_SKILL,MyEnemy),GetTact(TACT_DEBUFF,MyEnemy),GetTact(TACT_SP,MyEnemy),GetTact(TACT_SKILLCLASS,MyEnemy)
        local skill_level
        
        --logappend("AAI_ATK","tact_skill set "..tact_skill)
        --if AutoMobMode==1 then 
        --	mskill,mlevel=GetMobSkill(MyID)
        --	mobcount=GetMobCount(mskill,mlevel,MyEnemy,1)
        --	--TraceAI("mskill/level "..FormatSkill(mskill,mlevel).." mobcount "..mobcount)
        --elseif AutoMobMode==2 then
        --	mskill,mlevel=GetMobSkill(MyID)
        --	mobcount=GetMobCount(mskill,mlevel,MyEnemy,0)
        --else
        --	mobcount=0
        --end
        --Sniping routine
        if (IsHomun(MyID)==1 and SuperPassive~=1 and BerserkMode==0 and (GetTick() >= AutoSkillTimeout) and aggro <= AutoMobCount and GetTact(TACT_SNIPE,MyEnemy)==SNIPE_OK and (ShouldStandby == 0 or StickyStandby ==0)) then
            target=SelectEnemy(GetEnemyList(MyID,2)) -- This actually checks range - I know it's ugly to do it there, skill range checks need to be done at that point so we can pick a low priority target thats in range, instead of a high priority one out of range. 
            if target ~=0 then
                snipeskill=0
                local snipe_tact_skillclass=GetTact(TACT_SKILLCLASS,target)
                if snipe_tact_skillclass == CLASS_MINION then
                    snipeskill,snipelevel=GetMinionSkill(MyID)
                end
                if snipeskill==0 and (snipe_tact_skillclass == CLASS_S or snipe_tact_skillclass == CLASS_BOTH or snipe_tact_skillclass == CLASS_MIN_S) then
                    snipeskill,snipelevel=GetSAtkSkill(MyID)
                end
                if snipeskill==0 and (snipe_tact_skillclass == CLASS_OLD or snipe_tact_skillclass == CLASS_BOTH or snipe_tact_skillclass == CLASS_MIN_OLD) then
                    snipeskill,snipelevel=GetAtkSkill(MyID)
                end
                --TraceAI("snipe "..skill.." level"..level)
                if snipeskill ~=0 then
                    slevel = GetTact(TACT_SKILL,target)
                    if slevel < 0 then
                        slevel=-1*slevel
                        if slevel > snipelevel then
                            slevel = snipelevel
                        end
                        if ((GetV(V_SP,MyID)-ReserveSP >= GetTact(TACT_SP,target)+GetSkillInfo(snipeskill,3,slevel))) then
                            TraceAI("Snipe attack on "..target.." "..snipeskill.." "..slevel)
                            DoSkill(snipeskill,slevel,target)
                        end
                    end
                end
            end
        end
        
        
        -- Begin skill selection routine
        skilltouse = {-1,0,0}
        -- First digit (1): -1 = no skill, 0 single target, 1 debuff, 2 mob
        -- Second digit (2): skill id
        -- Third digit (3): skill level
        
        if (1==1) then --non paniced attack
            if (MySkill==0 and UseAttackSkill == 1 and GetTick() >= AutoSkillTimeout) then	
                if (tact_skill < 0) then		-- Negative value of TACT_SKILL -> 1 cast of skill
                    skill_level=tact_skill*-1	-- with level = to the absolute value of the
                    tact_skill=1			-- value of TACT_SKILL.
                else
                    skill_level=11
                end
                local SkillList=GetTargetedSkills(MyID)
                TraceAI("Begin autoskill routine")
                local availsp = GetV(V_SP,MyID)
                if BerserkMode~=1 or Berserk_IgnoreMinSP ~=1 then
                    availsp = availsp - tact_sp
                end
                for i,v in ipairs(SkillList) do
                    skilltype=v[1]
                    TraceAI("skilltype ".. skilltype.." MySkillUsedCount "..MySkillUsedCount.." tact_skill ".. tact_skill.." tact_skillclass"..tact_skillclass.."v"..v[1].." "..v[2].." "..v[3])		
                    if v[2]~=0 then
                        if IsInAttackSight(MyID,MyEnemy,v[2],v[3])==true then
                            if (skilltype == MOB_ATK and UseHomunSSkillAttack==1 and AutoMobMode~=0 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1))) then
                                local mobskill_level=skill_level
                                if AOEFixedLevel == 1 then
                                    mobskill_level=v[3]
                                end
                                local mobmode=0
                                if AutoMobMode==2 then
                                    mobmode=1
                                end
                                mobskillcount=GetMobCount(v[2],math.min(v[3],mobskill_level),MyEnemy,mobmode)
                                --TraceAI("mobskillcount="..mobskillcount.."tact_skillclass="..tact_skillclass.."class_mob="..CLASS_MOB.."AutoMobCount="..AutoMobCount.." "..FormatSkill(v[2],math.min(v[3],mobskill_level)))
                                if (mobskillcount >= AutoMobCount or tact_skillclass == CLASS_MOB) then
                                    if (availsp >= GetSkillInfo(v[2],3,math.min(v[3],mobskill_level)))then
                                        if (skilltouse[1] < 2) then
                                            skilltouse=v
                                        end
                                    end
                                end
                            elseif (skilltype ==DEBUFF_ATK and AttackDebuffUsed < AttackDebuffLimit and (IsFriendOrSelf(GetV(V_TARGET,MyEnemy))==1 or AttackDebuffWhenAttacked~=1)) then
                                if (tact_debuff == v[2] or (tact_debuff==1 and BasicDebuffs[v[2]]~=nil)) then
                                    if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                        skilltouse=v
                                    end
                                end
                            elseif (skilltype==MAIN_ATK and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_S and tact_skillclass~=CLASS_MINION and tact_skillclass~=CLASS_MIN_S) then
                                if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                    skilltouse=v
                                end
                            elseif (skilltype==S_ATK and UseHomunSSkillAttack==1 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_OLD and tact_skillclass~=CLASS_MINION and tact_skillclass~=CLASS_MIN_OLD) then
                                if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                    skilltouse=v
                                end
                            elseif (skilltype==COMBO_ATK and UseHomunSSkillAttack==1 and (AutoComboMode==2 or (AutoComboMode==1 and (tact_skillclass == CLASS_COMBO_1 or tact_skillclass==CLASS_COMBO_2)) or Berserk_ComboAlways==1) and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (v[2] == MH_SILVERVEIN_RUSH or tact_skillclass~=CLASS_COMBO_1)) then
                                if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                    skilltouse=v
                                end
                            elseif (skilltype==GRAPPLE_ATK and UseHomunSSkillAttack==1 and (AutoComboMode==2 or (AutoComboMode==1 and tact_skillclass > 5) or Berserk_ComboAlways==1) and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (v[2] == MH_TINDER_BREAKER or (v[2]==MH_CBC and tact_skillclass~=CLASS_GRAPPLE) or tact_skillclass==CLASS_GRAPPLE_2 )) then
                                if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                    skilltouse=v
                                end
                            elseif (skilltype==MINION_ATK and UseHomunSSkillAttack==1 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and (tact_skillclass==CLASS_MINION or tact_skillclass==CLASS_MIN_OLD or tact_skillclass==CLASS_MIN_S)) then
                                if (availsp-ReserveSP >= GetSkillInfo(v[2],3,math.min(v[3],skill_level))) then
                                    skilltouse=v
                                end
                            end
                        end
                    end
                    TraceAI("skill selected "..skilltouse[2])
                end
            end
            -- Now we finalize the selection
            if skilltouse[1]~= -1 then
                MySkill=skilltouse[2]
                if (IsHomun(MyID)==1 and skill_level~=11 and (skilltouse[1]~=MOB_ATK or AOEFixedLevel ~= 1)) then  	--no need to check what skill
                    MySkillLevel=skill_level			--Only homuns can use non-max level
                else							--and they dont have any mob/debuffs
                    MySkillLevel=skilltouse[3]
                end
                if (skilltouse[1] == DEBUFF_ATK) then
                    AttackDebuffUsed=AttackDebuffUsed+1
                else
                    MySkillUsedCount=MySkillUsedCount+1
                end
            end	
        end
        
        -- Now we resolve it
        
        --if (MySkill == 0) then
        if (UseSkillOnly ~= 1) then
            Attack (MyID,MyEnemy)
            TraceAI("Normal attack vs: "..MyEnemy)
            if GetV(V_HOMUNTYPE,MyID) == ELEANOR then
                if EleanorMode==0 then
                    MySpheres = math.max(math.min(10,MySpheres+1/SphereTrackFactor),0)
                    UpdateTimeoutFile()
                end
            end
        end
        -- else
        if (MySkill ~=0) then
            TraceAI("Skill Attack: "..MySkill.." target: "..MyEnemy.." level:"..MySkillLevel)
            SkillTarget=MyEnemy
            if (MySkill==MA_SHARPSHOOTING and AoEMaximizeTargets==1) then
                target,hitcount=GetBestFASTarget(MyID)
                TraceAI(target.." - "..hitcount)
                if hitcount > 0 and target~=-1 then
                    SkillTarget=target
                elseif hitcount== 0 then
                    MySkill=0
                end
                TraceAI("Skill Attack: "..MySkill.." (FAS) target: "..SkillTarget.." enemy: "..MyEnemy)			
            elseif (MySkill==ML_BRANDISH and AoEMaximizeTargets==1) then
                target=GetBestBrandishTarget(MyID)
                if target~=-1 then
                    SkillTarget=target
                end
                TraceAI("Skill Attack: "..MySkill.." (brandish) target: "..SkillTarget.." enemy: "..MyEnemy)
            elseif (MySkill==MH_HAILAGE_STAR or MySkill==MS_BOWLING_BASH) and AoEMaximizeTargets==1 then 
                target=GetBestAoETarget(MyID,MySkill,MySkillLevel)
                if target~=-1 then
                    SkillTarget=target
                end
                TraceAI("Skill Attack: "..MySkill.." (brandish) target: "..SkillTarget.." enemy: "..MyEnemy)
            elseif ((MySkill==MH_XENO_SLASHER or MySkill==MH_LAVA_SLIDE or MySkill==MA_SHOWER or MySkill==MH_POISON_MIST) and AoEMaximizeTargets==1) or (MySkill==MH_VOLCANIC_ASH and AshMaximizeTargets==1) then
                targx,targy=GetBestAoECoord(MyID,MySkill,MySkillLevel)
                if targx~=-1 then
                    SkillTargetX,SkillTargetY=targx,targy
                end
                TraceAI("Skill Attack: "..MySkill.." (brandish) target: "..SkillTarget.." enemy: "..MyEnemy)
            end
            if MySkill ~=0 then
                if GetV(V_HOMUNTYPE,MyID) == ELEANOR then
                    if EleanorMode==0 then
                        MySpheres = math.max(math.min(10,MySpheres+1/SphereTrackFactor),0)
                        UpdateTimeoutFile()
                    end
                end
                DoSkill(MySkill,MySkillLevel,SkillTarget,-1,SkillTargetX,SkillTargetY)
            end
        end
        if ((UseSkillOnly ~= 1 and UseDanceAttack==1 and GetV(V_SP,MyID) >= DanceMinSP) or (BerserkMode==1 and Berserk_Dance==1) or (panicmode==1 and Panic_UseDanceAttack==1 and HPPercent(MyID) > FleeHP)) and (IsHomun(MyID)==1 and MySkill==0) and GetDistanceRect(MyEnemy,GetV(V_OWNER,MyID)) < 13 then
            nx,ny=GetDanceCell(MyAttackStanceX,MyAttackStanceY,MyEnemy)
            if GetDistanceAPR(GetV(V_OWNER,MyID),nx,ny) >= GetMoveBounds() then
                logappend("AAI_DANCE","Dance attack canceled, too close to move bounds "..GetDistanceAPR(GetV(V_OWNER,MyID),nx,ny).." "..GetMoveBounds())
            else 
                logappend("AAI_DANCE","Dancing between "..MyAttackStanceX..","..MyAttackStanceY.." and "..nx..","..ny)
                Move(MyID,nx,ny)
                Attack(MyID,MyEnemy)
                Move(MyID,MyAttackStanceX,MyAttackStanceY)
            end
        end
        MySkill = 0
        MySkillLevel=0
    end


    -------------------
    -- TANK ROUTINES --
    -------------------

    function	OnTANKCHASE_ST ()
        if (UseSkillOnly==1) then
            skill,level=GetAtkSkill(MyID)
        elseif (UseSkillOnly==-1) then
            skill,level=GetAtkSkill(MyID)
            if (GetV(V_SP,MyID)-GetTact(TACT_SP,MyEnemy) < GetSkillInfo(skill,3,level)) then
                skill,level,sp=nil,nil,nil
            end
        else
            skill,level,sp=nil,nil,nil
        end
        TraceAI ("OnTANKCHASE_ST")
        if (true == IsOutOfSight(MyID,MyEnemy) or (ChaseGiveUpCount > ChaseGiveUp and GetV(V_MOTION,MyID)~=MOTION_MOVE)) then	-- ENEMY_OUTSIGHT_IN
            if (ChaseGiveUpCount>ChaseGiveUp) then
                Unreachable[MyEnemy]=1
            end
            
            SetIdleResetDest()
            ResetMyEnemyVars()
            TraceAI ("TANKCHASE_ST -> IDLE_ST : ENEMY_OUTSIGHT_IN")
            ChaseGiveUpCount=0
            
            return
        end
        if (true == IsInAttackSight(MyID,MyEnemy)) then  -- ENEMY_INATTACKSIGHT_IN
            ChaseGiveUpCount=0
            if(IsNotKS(MyID,MyEnemy)==1) then
                MyState = TANK_ST
                MySkillUsedCount=0
                TraceAI ("TANKCHASE_ST -> TANK_ST : ENEMY_INATTACKSIGHT_IN")
                return OnTANK_ST()
            else
                SetIdleResetDest()
                ResetMyEnemyVars()
                TraceAI ("TANKCHASE_ST -> IDLE_ST : Enemy is taken")
            end
            
            return
        end
        TraceAI("Tank chase: Can we skill while chasing?")
        if UseSkillOnly == -1 and (GetTick() >= AutoSkillTimeout) then
            dist=GetDistanceA(MyID,MyEnemy)
            tact_debuff,tact_skill,tact_sp,tact_skillclass=GetTact(TACT_DEBUFF,MyEnemy),GetTact(TACT_SKILL,MyEnemy),GetTact(TACT_SP,MyEnemy),GetTact(TACT_SKILLCLASS,MyEnemy)
            skilltouse={-1,0,0}
            local SkillList=GetTargetedSkills(MyID)
            TraceAI("Begin autoskill while tank chasing routine")
            if (tact_skill < 0) then		-- Negative value of TACT_SKILL -> 1 cast of skill
                skill_level=tact_skill*-1	-- with level = to the absolute value of the
                tact_skill=1			-- value of TACT_SKILL.
            else
                skill_level=11
            end
            for i,v in ipairs(SkillList) do

                skilltype=v[1]
                if v[2]~=0 then
                    --logappend("AAI_Chase","skilltype ".. skilltype.." MySkillUsedCount "..MySkillUsedCount.." tact_skill ".. tact_skill.." tact_skillclass ".. tact_skillclass.."v"..v[1].." "..v[2].." "..v[3])
                    if (GetV(V_SP,MyID) >= tact_sp+GetSkillInfo(v[2],3,math.min(v[3],skill_level)) and GetSkillInfo(v[2],2,math.min(v[3],skill_level)) >= dist) then 
                    --TraceAI("skilltype ".. skilltype.." MySkillUsedCount "..MySkillUsedCount.." tact_skill ".. tact_skill.."v"..v[1].." "..v[2].." "..v[3])
                        if (skilltype == MOB_ATK and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1))) then
                            if (tact_skillclass == CLASS_MOB) then
                                if (skilltouse[1] < 2) then
                                    skilltouse=v
                                end
                            end
                        elseif (skilltype ==DEBUFF_ATK and ChaseDebuffUsed==0) then
                            if (tact_debuff*-1 == v[2] or (tact_debuff==1 and BasicDebuffs[v[2]]~=nil)) then
                                skilltouse=v
                            end
                        elseif (skilltype==MAIN_ATK and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_S) then
                            skilltouse=v
                        elseif (skilltype==S_ATK and UseHomunSSkillChase==1 and (MySkillUsedCount < tact_skill or tact_skill==SKILL_ALWAYS or (BerserkMode==1 and Berserk_SkillAlways==1)) and tact_skillclass~=CLASS_OLD) then
                            skilltouse=v
                        end
                    end
                end
            end
            if skilltouse[2]~=0 then
                TraceAI("Using skill while tank chasing:"..skilltouse[2])
                local slvl=skilltouse[3]
                if skill_level~=11 then
                    slvl=skill_level
                end
                DoSkill(skilltouse[2],slvl,MyEnemy,-1)
                if skilltouse[1] == DEBUFF_ATK then
                    ChaseDebuffUsed=1
                end
                MySkillUsedCount=1
            end
        else
            TraceAI("Not in range, and can't use chase skill")
        end
        ChaseGiveUpCount=ChaseGiveUpCount+1
        MyDestX, MyDestY =  GetStandPoint(MyID,MyEnemy,MySkill,MySkillLevel,alt)
        if MyDestX==-1 or MyDestY==1 then
            Unreachable[MyEnemy]=1
            SetIdleResetDest()
            ResetMyEnemyVars()
            TraceAI ("TANKCHASE_ST -> IDLE_ST : target is surrounded so GetStandPoint can't find valid cell. Target dropped and deprioritized")
            ChaseGiveUpCount=0
        end
        if (GetTact(TACT_CHASE,MyEnemy)~=1) then
            Move (MyID,MyDestX,MyDestY)
            TraceAI ("TANKCHASE_ST -> TANKCHASE_ST : DESTCHANGED_IN"..MyDestX.." "..MyDestY)
        end
        return
    end 

    function OnTANK_ST()
        if (GetV(V_MOTION,MyEnemy)==MOTION_DEAD or IsOutOfSight(MyID,MyEnemy)) then
            MyState=IDLE_ST
            TraceAI("TANK_ST->IDLE_ST - Target dead or out of sight")
            return
        end
        if (GetV(V_TARGET,MyEnemy)~=MyID and (TankHitTimeout + 1500) < GetTick()) then
            TankHitTimeout = GetTick()
            if (IsInAttackSight(MyID,MyEnemy)==true) then
                Attack(MyID,MyEnemy)
            else
                MyState=TANKCHASE_ST
                TraceAI("TANK_ST->TANKCHASE_ST - Target out of range")
            end
            return
        end
        if GetV(V_TARGET,MyEnemy)==MyID then
            TraceAI("TANK_ST->IDLE_ST - Target is tanked successfully")
            MyState=IDLE_ST
        end
    end

    --------------------
    --- REST ROUTINE ---
    --------------------
    function	OnREST_ST ()
        TraceAI("OnREST_ST")
        if (DoIdleTasks()==nil) then
            return
        end
        if SuperPassive~=1 then
            local blocklist = SelectEnemy(GetFriendTargets())
            if (blocklist ~= 0) then		--Check for monsters attacking owner
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI ("REST_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
                return 
            end
            blocklist = SelectEnemy(GetEnemyList(MyID,0))	
            if (blocklist ~= 0) then
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI ("REST_ST -> CHASE_ST : ATTACKED_IN")
                return
            end
        end
        
        --If theres nothing else to do, return to the "rest station"
        
        x,y=GetV(V_POSITION,MyID)
        ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
        xoff=x-ox
        yoff=y-oy
        TraceAI(xoff.." "..ox.." "..x)
        if (GetV(V_MOTION,GetV(V_OWNER,MyID))~=MOTION_SIT) then
            MyState=IDLE_ST
            TraceAI("REST_ST -> IDLE_ST: Owner stood up")
        elseif (xoff~=RestXOff or yoff~=RestYOff) then
            MyDestX=ox+RestXOff
            MyDestY=oy+RestYOff
            TraceAI("REST_ST -> REST_ST: moving from "..formatpos(x,y).." to "..formatpos(MyDestX,MyDestY))
            Move(MyID,MyDestX,MyDestY)
        else
            TraceAI("REST_ST -> REST_ST: At rest station")
        end
    end

    -----------------------------
    ---Friend motion routines ---
    -----------------------------
    function	OnFRIEND_CIRCLE_ST()
        x,y = GetV(V_POSITION,MyID)
        dist = GetDistance(x,y,NewFriendX,NewFriendY)
        TraceAI("OnFRIEND_CIRCLE_ST"..x..","..y.." "..dist) 
        if FriendCircleIter == 0 then
            if dist > 2 then
                Move(MyID,NewFriendX,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout > 16 then
                    MyState=IDLE_ST
                    TraceAI("Dropping circle attempt, timeout exceeded")
                end
                return
            else
                FriendCircleIter=1
            end
        end
        if FriendCircleIter ==1 then
            if x==NewFriendX and y==NewFriendY-2 then
                FriendCircleIter=2
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX,NewFriendY-2)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=2
                    FriendCircleTimeout=0
                    TraceAI("giving up on circle step 1")	
                end
                return
            end
        end
        if FriendCircleIter ==2 then
            if x==NewFriendX-2 and y==NewFriendY then
                FriendCircleIter=3
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX-2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=3
                    FriendCircleTimeout=0
                    TraceAI("giving up on circle step 2")	
                end
                return
            end
        end
        if FriendCircleIter ==3 then
            if x==NewFriendX and y==NewFriendY+2 then
                FriendCircleIter=4
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX,NewFriendY+2)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=4
                    FriendCircleTimeout=0
                    TraceAI("giving up on circle step 3")	
                end
                return
            end
        end
        if FriendCircleIter ==4 then
            if x==NewFriendX+2 and y==NewFriendY then
                FriendCircleIter=5
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX+2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=5
                    FriendCircleTimeout=0
                    TraceAI("giving up on circle step 4")	
                end
                return
            end
        end
        if FriendCircleIter == 5 then
            if x==NewFriendX and y==NewFriendY-2 then
                FriendCircleIter=0
                FriendCircleTimeout=0
                MyState=IDLE_ST
                TraceAI("Circle completed")
                return
            else 
                Move(MyID,NewFriendX,NewFriendY-2)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=0
                    FriendCircleTimeout=0
                    MyState=IDLE_ST
                    TraceAI("giving up on circle step 5")	
                end
                return
            end
        end
    end

    function	OnFRIEND_CROSS_ST()
        x,y = GetV(V_POSITION,MyID)
        dist = GetDistance(x,y,NewFriendX,NewFriendY)
        TraceAI("OnFRIEND_CROSS_ST"..x..","..y.." "..dist) 
        if FriendCircleIter == 0 then
            if dist > 2 then
                Move(MyID,NewFriendX,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout > 16 then
                    MyState=IDLE_ST
                    TraceAI("Dropping cross attempt, timeout exceeded")
                end
                return
            else
                FriendCircleIter=1
            end
        end
        if FriendCircleIter ==1 then
            if x==NewFriendX-2 and y==NewFriendY then
                FriendCircleIter=2
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX-2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=2
                    FriendCircleTimeout=0
                    TraceAI("giving up on cross step 1")	
                end
                return
            end
        end
        if FriendCircleIter ==2 then
            if x==NewFriendX+2 and y==NewFriendY then
                FriendCircleIter=3
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX+2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=3
                    FriendCircleTimeout=0
                    TraceAI("giving up on cross step 2")	
                end
                return
            end
        end
        if FriendCircleIter ==3 then
            if x==NewFriendX-2 and y==NewFriendY then
                FriendCircleIter=4
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX-2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=4
                    FriendCircleTimeout=0
                    TraceAI("giving up on cross step 3")	
                end
                return
            end
        end
        if FriendCircleIter ==4 then
            if x==NewFriendX+2 and y==NewFriendY then
                FriendCircleIter=5
                FriendCircleTimeout=0
            else 
                Move(MyID,NewFriendX+2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=5
                    FriendCircleTimeout=0
                    TraceAI("giving up on cross step 4")	
                end
                return
            end
        end
        if FriendCircleIter == 5 then
            if x==NewFriendX-2 and y==NewFriendY then
                FriendCircleIter=0
                FriendCircleTimeout=0
                MyState=IDLE_ST
                TraceAI("Circle completed")
                return
            else 
                Move(MyID,NewFriendX-2,NewFriendY)
                FriendCircleTimeout=FriendCircleTimeout+1
                if FriendCircleTimeout>4 then
                    FriendCircleIter=0
                    FriendCircleTimeout=0
                    MyState=IDLE_ST
                    TraceAI("giving up on cross step 5")	
                end
                return
            end
        end
    end

    -------------------
    --Command State Process
    -------------------

    function	OnMOVE_CMD_ST ()

        TraceAI ("OnMOVE_CMD_ST")
        if GetDistanceAPR(GetV(V_OWNER,MyID),MyMoveX,MyMoveY) > IdleWalkDistance then
            TraceAI("OnMOVE_CMD_ST -> IDLE_ST: Attempt to move to location off screen")
            logappend("AAI_ERROR","We were in MOVE_CMD_ST trying to move to "..formatpos(MyMoveX,MyMoveY).." while owner standing at "..formatpos(GetV(V_POSITION,GetV(V_OWNER,MyID))))
            MyState=IDLE_ST
            return OnIDLE_ST()
        end
        local x, y = GetV (V_POSITION,MyID)
        if (x == MyMoveX and y == MyMoveY) then	
            StickyX,StickyY=0,0
            if (MoveSticky ~= 0) then
                if (ReturnToMoveHold==0) then
                    ReturnToMoveHold = 1
                    StickyX,StickyY=x,y
                else 
                    ReturnToMoveHold = 0
                end
            end
            TraceAI("OnMOVE_CMD_ST -> IDLE_ST: Arrived at Destination "..formatpos(x,y))
            MyState=IDLE_ST
            return OnIDLE_ST()
        elseif GetV(V_MOTION,MyID) == MOTION_STAND or MyDestX~=MyMoveX or MyDestY~=MyMoveY then
            MyDestX,MyDestY=MyMoveX,MyMoveY
            Move(MyID,MyDestX,MyDestY)
        end
    end

    function	OnMOVE_CMD_HOLD_ST ()
        
        TraceAI ("OnMOVE_CMD_HOLD_ST")
        MySkillUsedCount		= 0
        ChaseGiveUpCount		= 0
        AttackGiveUpCount		= 0
        ChaseDebuffUsed			= 0
        AttackDebuffUsed		= 0
        BypassKSProtect			= 0
        BerserkMode			= 0
        if (DoIdleTasks()==nil) then
            return
        end
        if (MoveStickyFight==1 and SuperPassive~=1 ) then
            local blocklist = SelectEnemy(GetFriendTargets())
            if (blocklist ~= 0) then							-- MYOWNER_ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI ("MOVE_CMD_HOLD_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    OnCHASE_ST()
                end
                return 
            end
            blocklist = SelectEnemy(GetEnemyList(MyID,0))
            if (blocklist ~= 0) then							-- ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = blocklist
                TraceAI ("MOVE_CMD_HOLD_ST -> CHASE_ST : ATTACKED_IN")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    OnCHASE_ST()
                end
                return
            end
            blocklist = SelectEnemy(GetEnemyList(MyID,-1))
            if (blocklist ~= 0) then
                MyState = TANKCHASE_ST
                MyEnemy = blocklist
                TraceAI ("MOVE_CMD_HOLD_ST -> TANKCHASE_ST")
                return
            end
        end
    end


    function OnSTOP_CMD_ST ()


    end




    function OnATTACK_OBJECT_CMD_ST ()

        

    end


    function OnATTACK_AREA_CMD_ST ()

        TraceAI ("OnATTACK_AREA_CMD_ST")

        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID) 
        end

        if (object ~= 0) then							-- MYOWNER_ATTACKED_IN or ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            return
        end

        local x , y = GetV (V_POSITION,MyID)
        if (x == MyDestX and y == MyDestY) then			-- DESTARRIVED_IN
                MyState = IDLE_ST
        end

    end




    function OnPATROL_CMD_ST ()

        TraceAI ("OnPATROL_CMD_ST")

        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID) 
        end

        if (object ~= 0) then							-- MYOWNER_ATTACKED_IN or ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            TraceAI ("PATROL_CMD_ST -> CHASE_ST : ATTACKED_IN")
            return
        end

        local x , y = GetV (V_POSITION,MyID)
        if (x == MyDestX and y == MyDestY) then			-- DESTARRIVED_IN
            MyDestX = MyPatrolX
            MyDestY = MyPatrolY
            MyPatrolX = x
            MyPatrolY = y
            Move (MyID,MyDestX,MyDestY)
        end

    end


    -----------------------------------------------------------------------
    --IF ANYONE READING MY CODE HAS A FUCK'S CLUE WHAT THE HOLD COMMAND IS
    --OR WHAT IN THE DEVIL IT'S PURPOSE IS, PLEASE ENLIGHTEN ME! -Azzy 
    ----------------------------------------------------------------------

    function OnHOLD_CMD_ST () 

        TraceAI ("OnHOLD_CMD_ST")
        logappend("AAI_ERROR","We're in HOLD_CMD_ST - where did hold cmd come from?")
        if (MyEnemy ~= 0) then
            local d = GetDistance(MyEnemy,MyID)
            if (d ~= -1 and d <= GetV(V_ATTACKRANGE,MyID)) then
                    Attack (MyID,MyEnemy)
            else
                ResetMyEnemyVars()
            end
            return
        end


        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID)
            if (object == 0) then						
                return
            end
        end

        MyEnemy = object

    end




    function OnSKILL_OBJECT_CMD_ST ()
        if IsInAttackSight(MyID,MyEnemy,MySkill,MySkillLevel) then
            DoSkill(MySkill,MySkillLevel,MyEnemy)
            TraceAI("SKILL_OBJECT_CMD_ST --> IDLE_ST - skill used")
            MyState=IDLE_ST
            MyDestX,MyDestY,MyEnemy,MySkill,MySkillLevel=0,0,0,0,0
            return
        elseif IsOutOfSight(MyID,MyEnemy) then
            TraceAI("SKILL_OBJECT_CMD_ST --> IDLE_ST - target off screen")
            MyState=IDLE_ST
            MyDestX,MyDestY,MyEnemy,MySkill,MySkillLevel=0,0,0,0,0
        elseif SkillObjectCMDTimeout>SkillObjectCMDLimit then
            TraceAI("SKILL_OBJECT_CMD_ST --> IDLE_ST - Couldn't get into range to use skill "..MySkill.." on "..MyEnemy)
            MyState=IDLE_ST
            MyDestX,MyDestY,MyEnemy,MySkill,MySkillLevel=0,0,0,0,0
            return OnIDLE_ST()
        else
            x,y= GetStandPoint(MyID,MyEnemy,MySkill,MySkillLevel,alt)
            if x < 10 and y < 10 then
                local ex,ey=GetV(V_POSITION,MyEnemy)
                local hx,hy=GetV(V_POSITION,MyID)
                local ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
                logappend("AAI_ERROR","Anomalous move in progress: h "..formatpos(hx,hy).." "..formatmotion(GetV(V_MOTION,MyID)).." e "..formatpos(ex,ey).." "..formatmotion(GetV(V_MOTION,MyEnemy)).." o "..formatpos(ox,oy).." "..formatmotion(GetV(V_MOTION,GetV(V_OWNER,MyID))).." dest "..formatpos(x,y))
            end
            Move(MyID,x,y)
            SkillObjectCMDTimeout=SkillObjectCMDTimeout+1
            return
        end
        
        
    end




    function OnSKILL_AREA_CMD_ST ()

        TraceAI ("OnSKILL_AREA_CMD_ST")

        local x , y = GetV (V_POSITION,MyID)
        if (GetDistance(x,y,MyDestX,MyDestY) <= AttackRange(MyID,MySkill,MySkillLevel)) then	-- DESTARRIVED_IN
            DoSkill(MySkill,MySkillLevel,0,nil,MyDestX,MyDestY)
            MyState = IDLE_ST
            MySkill = 0
        else
            targetx,targety=Closest(MyID,MyDestX,MyDestY,AttackRange(MyID,MySkill,MySkillLevel))
            TraceAI("Moving to "..formatpos(targetx,targety).." from "..formatpos(x,y))
            if GetDistanceAPR(GetV(V_OWNER,MyID),targetx,targety) > GetMoveBounds() then
                MyState = IDLE_ST
                MySkill = 0
                TraceAI("OnSKILL_AREA_CMD_ST -> IDLE_ST Target out of range")
            else
                Move (MyID,targetx,targety)
            end
        end

    end







    function OnFOLLOW_CMD_ST ()
        TraceAI ("OnFOLLOW_CMD_ST")
        local d = GetDistanceA (GetV(V_OWNER,MyID),MyID)
        if ( d > FollowStayBack) then
            BetterMoveToOwner (MyID,FollowStayBack)
            return
        end
        -- Start the friending process
        if (StandbyFriending == 1) then
            local actors = GetActors()
            for i,v in ipairs(actors) do
                if (IsMonster(v)~=1 and GetV(V_MOTION,GetV(V_OWNER,MyID))==MOTION_SIT) then
                    TraceAI("Friend list modification")
                    if (IsToRight(GetV(V_OWNER,MyID),v)==1) then
                        if (MyFriends[v]==nil) then
                            MyFriends[v] = 1
                            UpdateFriends()
                            MyState=FRIEND_CIRCLE_ST
                            ReturnToState=FOLLOW_CMD_ST
                            NewFriendX,NewFriendY=GetV(V_POSITION,v)
                        end
                    elseif (IsToRight(v,GetV(V_OWNER,MyID))==1) then
                        if (MyFriends[v]~=nil) then
                            MyFriends[v] = nil
                            UpdateFriends()
                            MyState=FRIEND_CROSS_ST
                            ReturnToState=FOLLOW_CMD_ST
                            NewFriendX,NewFriendY=GetV(V_POSITION,v)
                        end
                    end
                end
            end
        end
        -- Okay, that's done. 
        if (DefendStandby == 1 and SuperPassive~=1) then
            local	object = SelectEnemy(GetFriendTargets())
            if (object ~= 0) then							-- MYOWNER_ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = object
                TraceAI ("FOLLOW_CMD_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    OnCHASE_ST()
                end
                return 
            end
            object = SelectEnemy(GetEnemyList(MyID,0))
            if (object ~= 0) then							-- ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = object
                TraceAI ("FOLLOW_CMD_ST -> CHASE_ST : ATTACKED_IN ")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    OnCHASE_ST()
                end
                return
            end
        end
    end


    --#####################################
    --### Targeting Routines start here ###
    --#####################################
    --[[
    targets[actorid]=

    MotionClass
    -1 = Dead
    0  = Stand
    1  = Moving
    2  = Flinch
    3  = Attacking
    4  = Skilling
    5  = Casting
    6  = Other

    TargetClass
    -2  = Non-friend player
    -1  = Monster
    0  = None
    1  = Self
    2  = Friend/Owner
    ]]--]]

    function GetFriendTargets() -- returns list of targets of friends who are attacking
        local targets = {}
        for i,v in ipairs (GetActors()) do
            if (IsFriend(v) == 1) then
                motion=GetV(V_MOTION,v)
                target=GetV(V_TARGET,v)
                if (IsMonster(target)==1) then
                    tact=GetTact(TACT_BASIC,target)
                    if (FriendAttack[motion]==1 and tact > 0 and tact ~=9) then
                        targets[target]={MotionClassLU[GetV(V_MOTION,target)],GetTargetClass(target),GetTact(TACT_BASIC,target),GetTact(TACT_CAST,target)}
                        
                    end
                end
            end
        end
        return targets
    end
    -- aggro arguments
    -- 2 = snipe
    -- 1 = aggro
    -- 0 = nonaggro
    -- -1 = tank
    -- -2 = rescue


    function	GetEnemyList (myid,aggro)
        local owner  = GetV(V_OWNER,myid)
        local enemys = {}
        if aggro==2 then
            sskill,slevel=GetSAtkSkill(MyID)
            oskill,olevel=GetAtkSkill(MyID)
            mskill,mlevel=GetMinionSkill(MyID)
        end
        TraceAI("GetEnemyList with aggro "..aggro)
        for k,v in pairs(Targets) do
            tact = GetTact(TACT_BASIC,k)
            casttact=GetTact(TACT_CAST,k)
            if tact==TACT_TANKMOB then
                if GetAggroCount() > AutoMobCount then
                    tact = TACT_ATTACK_M
                else
                    tact = TACT_TANK
                end
            end
            --TraceAI("Target"..k.." tact:"..tact.." Motion"..v[1].." TClass"..v[2])
            if (0 < tact and (tact < 5 or tact >9) and aggro==1 and (DoNotAttackMoving ~=1 or v[1]~=1) and (tact ~= 14 or AttackLastFullSP==0 or SPPercent(MyID)==100)) or  (tact > 9 and tact < 13 and aggro == 2 and k~=MyEnemy) or  (v[2]>0 and tact>0 and (tact~=9 or v[2]==1) and (v[1]==3 or casttact >= CAST_REACT) and aggro~=2 and (aggro > -1 or (aggro==-2 and IsRescueTarget(k)==1))) or (tact == -1 and aggro==-1 and v[2]~=1) then
                --TraceAI("Tactics say to attack:"..k)
                if (IsNotKS(myid,k)==1 and v[1] > -1) then
                    --TraceAI("Is alive and not a KS")
                    if aggro == 0 or (aggro~=2 and v[2]>0) then 
                        if (GetMoveBounds() >= GetDistanceRect(owner,k)) then
                            --TraceAI("Adding to target list: "..k)
                            r={v[1],v[2],tact,casttact}
                            enemys[k] = r
                        --else 
                        --	tempx,tempy=GetV(V_POSITION,owner)
                        --	targx,targy=GetV(V_POSITION,k)
                        --	TraceAI("target ignored "..k.." mypos "..tempx..","..tempy.." enemy "..targx..","..targy.." bounds "..GetMoveBounds().."dist "..GetDistanceRect(owner,k))
                        end
                    elseif aggro~=2 then
                        if (GetAggroDist() >= GetDistanceA(owner,k)) then
                            TraceAI("Adding to target list: "..k)
                            r={v[1],v[2],tact,casttact}
                            enemys[k] = r
                        end
                    else -- Sniping - so we need to check range on skill, instead of aggrodist
                        dist = GetDistanceA(MyID,k)
                        tact_skill_class=(GetTact(TACT_SKILLCLASS,k))
                        if tact_skill_class==CLASS_MINION and mskill~=0 then
                            if dist <= GetSkillInfo(mskill,2,mlevel) then
                                r={v[1],v[2],tact,casttact}
                                enemys[k] = r
                            end
                        elseif sskill~=0 and tact_skill_class~=CLASS_OLD then
                            if dist <= GetSkillInfo(sskill,2,slevel) then
                                r={v[1],v[2],tact,casttact}
                                enemys[k] = r
                            end
                        elseif oskill~=0 and tact_skill_class~=CLASS_S then
                            if dist <= GetSkillInfo(oskill,2,olevel) then
                                r={v[1],v[2],tact,casttact}
                                enemys[k] = r
                            end
                        end
                    end
                end
            end
        end
        return enemys
    end

    -- format of return
    -- enemys[n][1] = Motion Class
    -- enemys[n][2] = Target Class
    -- enemys[n][3] = tact
    -- enemys[n][4] = casttact

    function SelectEnemy(enemys,current_enemy)
        local min_priority = -1
        local priority
        local min_distance = 100
        local distance
        local result = 0
        local max_reachable = 1

        if current_enemy ~= nil then -- Opportunistic attack
            local dist = GetDistanceA(MyID, current_enemy)
            local aggro_temp = 0
            if IsFriendOrSelf(GetV(V_TARGET, current_enemy)) == 1 then
                aggro_temp = 1
            end
            min_priority = convpriority(GetTact(TACT_BASIC, current_enemy), aggro_temp)
            if dist < 3 then 
                return 0
            else
                min_distance = dist - 3
            end
        end

        for id, enemy in pairs(enemys) do
            local base_priority = enemy[3] -- Tact
            local aggro = (enemy[2] > 0 and (enemy[1] == 3 or enemy[4] >= CAST_REACT)) and 1 or 0
            priority = convpriority(base_priority, aggro)
            
            distance = GetDistanceA(MyID, id)
            local unreachable = Unreachable[id] or 0
            
            if unreachable <= max_reachable then
                if (priority > min_priority or (priority == min_priority and distance < min_distance)) then
                    result = id
                    min_distance = distance
                    min_priority = priority
                    max_reachable = unreachable
                end
            end
        end
        return result
    end

    function convpriority(base, aggro)
        if base > 9 and base < 13 then -- Treat Snipe modes as attack
            base = base - 8
        end
        if base == 13 then
            base = (aggro == 1) and 7 or 2
        elseif base == 14 then
            base = 1
        end
        
        local priority = base
        if base > 6 and aggro == 1 then
            priority = base
        elseif base == 4 or base == 3 or base == IdleWalkDistance then
            priority = base + 1
            if aggro == 0 then 
                priority = priority - 2
            end
        elseif priority == 5 and aggro == 1 then 
            return 2
        elseif base == 2 then
            return 1
        else
            return 0
        end
        
        return priority
    end

    --####################################################
    --### DoIdleTasks - stuff done in any "idle" state ###
    --### like buffs and command processing            ###
    --####################################################

    function DoIdleTasks()
        local cmd = List.popleft(ResCmdList)
        if cmd ~= nil then
            ProcessCommand(cmd)
            return
        end

        if OnIdleTasks() == 1 or UseAutoHeal == 2 and DoHealingTasks(MyID) == 1 or DoAutoBuffs(1) ~= 1 then
            return
        end

        local tick = GetTick()

        if UseSacrificeOwner == 1 and SacrificeTimeout ~= -1 and tick > SacrificeTimeout then
            local skill, level = GetSacrificeSkill(MyID)
            if skill <= 0 then
                SacrificeTimeout = -1
            elseif GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                DoSkill(skill, level, GetV(V_OWNER, MyID), 7)
                SacrificeTimeout = tick + GetSkillInfo(skill, 8, level)
                return
            end
        end

        if GetV(V_MOTION, GetV(V_OWNER, MyID)) == MOTION_SIT and MyState ~= REST_ST and DoNotUseRest ~= 1 then
            MyState = REST_ST
            TraceAI("DoIdleTasks - Owner sitting, MyState -> REST_ST")
            return
        end

        return 1
    end

    function DoAutoBuffs(buffmode)
        if GetTick() < AutoSkillTimeout then
            return 1
        end

        if buffmode == 2 and BerserkMode ~= 1 then
            return 1
        end

        TraceAI("DoAutoBuffs " .. buffmode)

        local function tryApplyBuff(skill, level, mode, timeout, buffKey)
            if skill <= 0 or GetSkillInfo(skill, 3, level) > GetV(V_SP, MyID) then
                timeout = -1
                return
            end

            MyBuffSPCosts[buffKey] = GetSkillInfo(skill, 3, level)
            if MyASAPBuffs[3] == skill and buffmode == 3 then
                timeout = GetTick() + 20000
                logappend("AAI_ERROR", "ASAP buff attempt canceled, delaying 20 seconds " .. FormatSkill(skill, level))
            else
                MyPState = MyState
                MyState = PROVOKE_ST
                MyPEnemy = GetV(V_OWNER, MyID)
                MyPSkill = skill
                MyPSkillLevel = level
                MyPMode = mode
                return OnPROVOKE_ST()
            end
        end

        if UseProvokeOwner == buffmode and ProvokeOwnerTimeout ~= -1 then
            if GetTick() > ProvokeOwnerTimeout then
                local skill, level = GetProvokeSkill(MyID)
                tryApplyBuff(skill, level, 7, ProvokeOwnerTimeout, "ProvokeOwner")
            end
        end

        if OffensiveOwnerTimeout ~= -1 then
            if GetTick() > OffensiveOwnerTimeout then
                local skill, level, opt = GetOffensiveOwnerSkill(MyID)
                tryApplyBuff(skill, level, 11, OffensiveOwnerTimeout, "OffensiveOwner")
            end
        end

        if DefensiveOwnerTimeout ~= -1 then
            if GetTick() > DefensiveOwnerTimeout and (DefensiveBuffOwnerMobbed == 0 or 
                (DefensiveBuffOwnerMobbed <= GetAggroCount(GetV(V_OWNER, MyID)) and HPPercent(GetV(V_OWNER, MyID)) < DefensiveBuffOwnerHP)) then
                local skill, level, opt = GetDefensiveOwnerSkill(MyID)
                tryApplyBuff(skill, level, 12, DefensiveOwnerTimeout, "DefensiveOwner")
            end
        end

        if OtherOwnerTimeout ~= -1 then
            if GetTick() > OtherOwnerTimeout then
                local skill, level, opt = GetOtherOwnerSkill(MyID)
                tryApplyBuff(skill, level, 13, OtherOwnerTimeout, "OtherOwner")
            end
        end

        if UseProvokeSelf == buffmode and ProvokeSelfTimeout ~= -1 then
            if GetTick() > ProvokeSelfTimeout then
                local skill, level = GetProvokeSkill(MyID)
                if skill > 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    DoSkill(skill, level, MyID)
                    ProvokeSelfTimeout = GetTick() + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if UseOffensiveBuff == buffmode and QuickenTimeout ~= -1 then
            if GetTick() > QuickenTimeout then
                local skill, level = GetQuickenSkill(MyID)
                if skill > 0 and level ~= 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    DoSkill(skill, level, MyID, 2)
                    QuickenTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if UseDefensiveBuff == buffmode and GuardTimeout ~= -1 then
            if GetTick() > GuardTimeout then
                local skill, level = GetGuardSkill(MyID)
                if skill > 0 and (GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID)) then
                    DoSkill(skill, level, MyID, 1)
                    GuardTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if SOffensiveTimeout ~= -1 then
            if GetTick() > SOffensiveTimeout then
                local skill, level, opt = GetSOffensiveSkill(MyID)
                if skill > 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    MyBuffSPCosts["SOffensive"] = GetSkillInfo(skill, 3, level)
                    DoSkill(skill, level, MyID, 4)
                    SOffensiveTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if SDefensiveTimeout ~= -1 then
            if GetTick() > SDefensiveTimeout then
                local skill, level, opt = GetSDefensiveSkill(MyID)
                if skill > 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    MyBuffSPCosts["SDefensive"] = GetSkillInfo(skill, 3, level)
                    DoSkill(skill, level, MyID, 5)
                    SDefensiveTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if SOwnerBuffTimeout ~= -1 then
            if GetTick() > SOwnerBuffTimeout then
                local skill, level, opt = GetSOwnerBuffSkill(MyID)
                if skill > 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    MyBuffSPCosts["SOwnerBuff"] = GetSkillInfo(skill, 3, level)
                    DoSkill(skill, level, MyID, 6)
                    SOwnerBuffTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if UseBayeriSteinWand == buffmode and SteinWandTimeout ~= -1 then
            if GetTick() > SteinWandTimeout then
                if GetV(V_HOMUNTYPE, MyID) == BAYERI and 
                    (GetAggroCount(MyID) >= UseSteinWandSelfMob and UseSteinWandSelfMob ~= 0) or 
                    (GetAggroCount(GetV(V_OWNER, MyID)) >= UseSteinWandOwnerMob and UseSteinWandOwnerMob ~= 0) then
                    DoSkill(MH_STEINWAND, BayeriSteinWandLevel, MyID, 10)
                    SteinWandTimeout = AutoSkillCastTimeout + GetSkillInfo(MH_STEINWAND, 8, BayeriSteinWandLevel)
                    UpdateTimeoutFile()
                    return
                end
            end
        end

        if UseAutoMag == buffmode and MagTimeout ~= -1 then
            if GetTick() > MagTimeout then
                if GetV(V_MERTYPE, MyID) == 4 and GetV(V_LEVEL, MyID) >= 4 and
                    (GetAggroCount(MyID) >= UseMagSelfMob and UseMagSelfMob ~= 0) or 
                    (GetAggroCount(GetV(V_OWNER, MyID)) >= UseMagOwnerMob and UseMagOwnerMob ~= 0) then
                    local skill, level = GetMagSkill(MyID)
                    if skill > 0 and GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                        DoSkill(skill, level, MyID, 9)
                        MagTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                        UpdateTimeoutFile()
                        return
                    end
                end
            end
        end

        -- Handling SightTimeout
        if SightTimeout ~= -1 then
            TraceAI("tick:" .. GetTick() .. " SightTimeout " .. SightTimeout)
            if GetTick() > SightTimeout then
                local skill, level, opt = GetSightOrAoE(MyID)
                if skill <= 0 then
                    SightTimeout = -1
                elseif level == 0 or opt ~= buffmode then
                    -- skill in cooldown
                elseif GetSkillInfo(skill, 3, level) <= GetV(V_SP, MyID) then
                    MyBuffSPCosts["SightOrAoE"] = GetSkillInfo(skill, 3, level)
                    if IsHomun(MyID) == 1 then
                        if MyASAPBuffs[3] == skill and buffmode == 3 then
                            SightTimeout = GetTick() + 20000
                            logappend("AAI_ERROR", "ASAP buff attempt canceled, delaying 20 seconds " .. FormatSkill(skill, level))
                            UpdateTimeoutFile()
                        else
                            MyPState = MyState
                            MyState = PROVOKE_ST
                            MyPEnemy = GetV(V_OWNER, MyID)
                            MyPSkill = skill
                            MyPSkillLevel = level
                            MyPMode = 7
                            TraceAI("Using AoE skill as buff" .. MyPState .. " " .. MyState .. " " .. MyPEnemy .. " " .. MyPSkill .. " " .. MyPSkillLevel)
                            return OnPROVOKE_ST()
                        end
                    else
                        DoSkill(skill, level, MyID, 7)
                        SightTimeout = AutoSkillCastTimeout + GetSkillInfo(skill, 8, level)
                        UpdateTimeoutFile()
                        return
                    end
                end
            end
        end

        -- Handling PainkillerFriends
        if PainkillerFriends ~= 0 then
            local skill, level, opt = GetDefensiveOwnerSkill(MyID)
            opt = PainkillerFriends
            if skill <= 0 then
                PainkillerFriends = 0
            elseif level == 0 or opt ~= buffmode then
                -- skill in cooldown
            elseif GetSkillInfo(skill, 3, level) > GetV(V_SP, MyID) then
                -- no SP
            else
                TraceAI("Painkiller Friends check")
                for k, v in pairs(Players) do
                    if MyFriends[k] == FRIEND or MyFriends[k] == PKFRIEND then
                        if PKFriendsTimeout[k] ~= nil then
                            if PKFriendsTimeout[k] < GetTick() then
                                MyPState = MyState
                                MyState = PROVOKE_ST
                                MyPEnemy = k
                                MyPSkill = skill
                                MyPSkillLevel = level
                                MyPMode = k
                                return OnPROVOKE_ST()
                            end
                        else
                            MyPState = MyState
                            MyState = PROVOKE_ST
                            MyPEnemy = k
                            MyPSkill = skill
                            MyPSkillLevel = level
                            MyPMode = k
                            return OnPROVOKE_ST()
                        end
                    end
                end
            end
        end
        return OnAutoBuffs(buffmode)
    end

    function DoHealingTasks (myid) 
        rhp=HPPercent(myid)
        ohp=HPPercent(GetV(V_OWNER,myid))
        skill,level=GetHealingSkill(myid)
        if skill<=0 then 
            UseAutoHeal=0
            return
        elseif level==0 or GetTick() < AutoSkillTimeout then
            return --skill in cooldown
        end
        if rhp < HealSelfHP then
            if skill==HVAN_CHAOTIC then
                if GetV(V_SP,myid) > GetSkillInfo(skill,3,level) then
                    TraceAI("Using self Healing skill "..FormatSkill(skill,level))
                    if ohp < HealOwnerHP and MyState==IDLE_ST then
                        DoSkill(skill,5,myid) 
                    else
                        DoSkill(skill,4,myid)
                    end
                    return 1
                else
                    TraceAI("Can't use self healing skill, no SP")
                end
            end
        end
        if ohp < HealOwnerHP then
            if GetV(V_SP,myid) > GetSkillInfo(skill,3,level) then
                TraceAI("Using Healing skill "..FormatSkill(skill,level))
                DoSkill(skill,level,GetV(V_OWNER,myid))
                return 1
            else
                TraceAI("Can't use healing skill, no SP")
                return
            end
        end
    end

    function UpdateTimeoutFile()
        if StickyStandby==2 then
            ShouldStandbyx=ShouldStandby
        else
            ShouldStandbyx=0
        end
        if IsHomun(MyID)==1 then
            OutFile=io.open("./AI/USER_AI/data/H_"..GetV(V_OWNER,MyID).."Timeouts.lua","w")
        else
            OutFile=io.open("./AI/USER_AI/data/M_"..GetV(V_OWNER,MyID).."Timeouts.lua","w")
        end
        if OutFile~=nil then
            OutFile:write("MagTimeout="..TimeoutConv(MagTimeout).."\\nSOffensiveTimeout="..TimeoutConv(SOffensiveTimeout).."\\nSDefensiveTimeout="..TimeoutConv(SDefensiveTimeout).."\\nSOwnerBuffTimeout="..TimeoutConv(SOwnerBuffTimeout).."\\nGuardTimeout="..TimeoutConv(GuardTimeout).."\\nQuickenTimeout="..TimeoutConv(QuickenTimeout).."\\nOffensiveOwnerTimeout="..TimeoutConv(OffensiveOwnerTimeout).."\\nDefensiveOwnerTimeout="..TimeoutConv(DefensiveOwnerTimeout).."\\nOtherOwnerTimeout="..TimeoutConv(OtherOwnerTimeout).."\\nShouldStandby="..ShouldStandbyx.."\\nRegenTick[1]="..RegenTick[1].."\\nMySpheres="..MySpheres.."\\nEleanorMode="..EleanorMode)
            OutFile:close()
        else
            TraceAI("Failed to update timeout file")
            logappend("AAI_ERROR","Failed to update timeout file for owner "..GetV(V_OWNER,MyID))
        end
        return
    end

    function TimeoutConv(a)
        if a==-1 then
            return 0
        else
            return a
        end
    end

    function OnPROVOKE_ST()
        --local skill,level = GetProvokeSkill(MyID)
        if MyPSkillLevel==nil then
            logappend("AAI_ERROR","PSkillLevel is nil at start of OnPROVOKE_ST")
        end
        if MyPosX[1]==MyPosX[2] and MyPosY[1]==MyPosY[2] then
            SkillObjectCMDTimeout=SkillObjectCMDTimeout+1
        end
        if IsInAttackSight(MyID,MyPEnemy,MyPSkill,MyPSkillLevel) then
            
            if MyPMode == 7 then
                ProvokeOwnerTimeout = GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)
            elseif MyPMode== 9 then
                SightTimeout = GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)
            elseif MyPMode== 11 then
                OffensiveOwnerTimeout = GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)
            elseif MyPMode== 12 then
                DefensiveOwnerTimeout = GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)
            elseif MyPMode== 13 then
                OtherOwnerTimeout = GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)
            elseif IsPlayer(MyPMode) then -- to detect painkiller-friends, in which case PMode is the id of the friend
                PKFriendsTimeout[MyPMode]=GetTick()+GetSkillInfo(MyPSkill,8,MyPSkillLevel)	
            end
            UpdateTimeoutFile()
            DoSkill(MyPSkill,MyPSkillLevel,MyPEnemy,MyPMode)
            MyState=MyPState
            TraceAI("PROVOKE_ST -> IDLE_ST - Buff/AoE okay"..MyState)
            MyDestX,MyDestY,MyPEnemy,MyPSkill,MyPState,MyPSkillLevel,MyPMode=0,0,0,0,0,0,0
            return
        elseif SkillObjectCMDTimeout>SkillObjectCMDLimit then
            TraceAI("PROVOKE_ST -> IDLE_ST Couldn't get into range to provoke/AoE owner")
            if MyPState~=PROVOKE_ST then
                MyState=MyPState
            else
                MyState=0
            end
            SkillObjectCMDTimeout=0
            MyDestX,MyDestY,MyPEnemy,MyPSkill,MyPState,MyPSkillLevel,MyPMode=0,0,0,0,0,0,0
            return
        elseif SkillObjectCMDTimeout>(SkillObjectCMDLimit/2) then --We're having trouble getting to the place we want to in order to use this buff, so let's just try to move right to target
            range = AttackRange(MyID,MyPSkill,MyPSkillLevel)
            if range > 2 and MyPEnemy==GetV(V_OWNER,MyID) then
                MoveToOwner(MyID)
            else
                --local x,y=ClosestR(MyID,MyPEnemy,AttackRange(MyID,MyPSkill,MyPSkillLevel),math.random(2))
                local x,y=GetStandPoint(MyID,MyPEnemy,MyPSkill,MyPSkillLevel,0)
                Move(MyID,x,y)
            end
            return
        else
            local x,y=GetStandPoint(MyID,MyPEnemy,MyPSkill,MyPSkillLevel,0)
            Move(MyID,x,y)
            return
        end
    end

    function	OnIDLEWALK_ST ()
        TraceAI ("OnIDLEWALK_ST")
        ResetCounters()
        MyEnemy					= 0
        if SPPercent(MyID) < IdleWalkSP then
            MyState=IDLE_ST
            TraceAI ("IDLEWALK_ST -> IDLE_ST : SP is below IdleWalkSP - switching to idle mode to regen SP")
            return OnIDLE_ST()
        end
        if (DoIdleTasks()==nil) then
            return
        end
        --Targeting
        if SuperPassive~=1 then
            local	object = SelectEnemy(GetFriendTargets())
            if (object ~= 0) then							-- MYOWNER_ATTACKED_IN
                MyState = CHASE_ST
                MyEnemy = object
                TraceAI ("IDLEWALK_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    OnCHASE_ST()
                end
                return 
            end
            if (HPPercent(MyID) > AggroHP and (SPPercent(MyID) > AggroSP or AggroSP==0) and (ShouldStandby == 0 or StickyStandby ==0)) then
                aggro=1
            else
                aggro=0
            end
            object=SelectEnemy(GetEnemyList(MyID,aggro))
            if object~=0 then
                MyState = CHASE_ST
                MyEnemy = object
                TraceAI ("IDLEWALK_ST -> CHASE_ST : ATTACKED_IN")
                if (FastChangeCount < FastChangeLimit and FastChange_I2C ==1) then
                    return OnCHASE_ST()
                end
                return	
            end
            if (aggro==1 and TankMonsterCount < TankMonsterLimit) then
                object = SelectEnemy(GetEnemyList(MyID,-1))
                if (object ~= 0) then
                    MyState = TANKCHASE_ST
                    MyEnemy = object
                    TraceAI ("IDLEWALK_ST -> TANKCHASE_ST")
                    return
                end
            end
        end
        --Following
        local distance = GetDistanceAR(MyID,GetV(V_OWNER,MyID))
        if ( distance > GetMoveBounds()) then		-- MYOWNER_OUTSIGNT_IN
            MyState = FOLLOW_ST
            TraceAI ("IDLEWALK_ST -> FOLLOW_ST: Way too far away from owner "..distance)
            return
        end
        if UseAutoHeal==3 then
            if DoHealingTasks(MyID) == 1 then 
                return
            end
        end
        DoAutoBuffs(-2)
        -- end of the usual idle tasks - now we have to do the idle walk part of it, which sucks. 
        local x,y=GetV(V_POSITION,MyID)
        local ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
        local motion=GetV(V_MOTION,MyID)
        if (GetDistanceAPR(MyID,MyDestX,MyDestY)>=1) or IdleWalkTries > 6 or GetDistanceAPR(GetV(V_OWNER,MyID),MyDestX,MyDestY) > GetMoveBounds() then 
            if OldHomunType==AMISTR and UseCastleRoute==1 and (UseIdleWalk==5 or UseIdleWalk==6) and RelativeRoute==0 and GetDistanceP(x,y,ox,oy) > 2 then
                if GetTick() > AutoSkillTimeout then
                    DoSkill(HAMI_CASTLE,5,MyID)
                    TraceAI("Castle Route: Casting castling on self")
                else
                    TraceAI("Castle Route: Skill timeout not OK - can't cast castling")
                end
                return
            elseif UseCastleRoute==1 and OldHomunType==AMISTR and RelativeRoute==0 then
                TraceAI("We're set to use castling route, but can't, UseIdleWalk="..UseIdleWalk.." distance: "..GetDistanceP(x,y,ox,oy))
            end
            MyDestX,MyDestY=GetIdleWalkDest(MyID)
            if MyDestX==ox and MyDestY==oy then
                MyDestX,MyDestY=Closest(MyID,MyDestX,MyDestY,1,1)
            end
            IdleWalkTries=0 
            TraceAI("IDLEWALK_ST: New destination: "..MyDestX..","..MyDestY)
            return Move(MyID,MyDestX,MyDestY)
        elseif motion == MOTION_STAND then
            if IdleWalkTries == 4 then
                MyDestX,MyDestY=Closest(MyID,MyDestX,MyDestY,1,1)
                TraceAI("IDLEWALK_ST: Having a bit of trouble - adjust dest to: "..MyDestX..","..MyDestY)
            end
            TraceAI("IDLEWALK_ST: No move after "..IdleWalkTries.." trying again:"..MyDestX..","..MyDestY)
            IdleWalkTries=IdleWalkTries+1
            return Move(MyID,MyDestX,MyDestY)
        else
            --we're en route
            return
        end
    end

    function GetIdleWalkDest(MyID)
        local mx, my = GetV(V_POSITION, MyID)
        local ox, oy = GetV(V_POSITION, GetV(V_OWNER, MyID))
        local xoff, yoff = mx - ox, my - oy
        local stepsize, angle, step, destx, desty

        TraceAI("Idlewalk: " .. xoff .. "," .. yoff)

        if UseIdleWalk == 1 then -- Orbit
            stepsize = (IdleWalkDistance > 4) and 30 or 45
            angle = math.deg(math.atan2(xoff, yoff)) + stepsize / 2
            angle = (angle < 0) and angle + 360 or angle
            step = math.floor(angle / stepsize) + 1
            angle = math.rad(step * stepsize)
            destx = math.ceil(math.sin(angle) * IdleWalkDistance) + ox
            desty = math.ceil(math.cos(angle) * IdleWalkDistance) + oy
            TraceAI("Orbit Dest: " .. destx .. "," .. desty .. " owner: " .. ox .. "," .. oy .. " mypos: " .. mx .. "," .. my)
        
        elseif UseIdleWalk == 2 then -- Cross
            angle = math.deg(math.atan2(xoff, yoff)) + 45
            angle = (angle < 0) and angle + 360 or angle
            step = math.floor(angle / 90)
            TraceAI("Cross step " .. step)
            
            if step == 0 then
                destx, desty = ox, oy - IdleWalkDistance
            elseif step == 1 then
                destx, desty = ox, oy + IdleWalkDistance
            elseif step == 2 then
                destx, desty = ox - IdleWalkDistance, oy
            else -- step == 3
                destx, desty = ox + IdleWalkDistance, oy
            end

        elseif UseIdleWalk == 3 then -- Rectangle
            angle = math.deg(math.atan2(xoff, yoff)) + 22.5
            angle = (angle < 0) and angle + 360 or angle
            step = math.floor(angle / 45) + 1
            destx, desty = ox, oy
            
            if step > 0 and step < 4 then
                destx = ox + IdleWalkDistance
            elseif step > 4 and step < 8 then
                destx = ox - IdleWalkDistance
            end
            
            if step == 8 or step == 1 or step == 7 then
                desty = oy + IdleWalkDistance
            elseif step > 2 and step < 6 then
                desty = oy - IdleWalkDistance
            end
            
            TraceAI("Rectangle Dest: " .. destx .. "," .. desty .. " owner: " .. ox .. "," .. oy .. " mypos: " .. mx .. "," .. my .. " angle: " .. angle .. " step: " .. step)

        elseif UseIdleWalk == 4 then -- Random
            angle = math.random(0, 359)
            angle = math.rad(angle)
            destx = absceil(math.sin(angle) * IdleWalkDistance) + ox
            desty = absceil(math.cos(angle) * IdleWalkDistance) + oy
            TraceAI("Random Dest: " .. destx .. "," .. desty .. " owner: " .. ox .. "," .. oy .. " mypos: " .. mx .. "," .. my)
        
        elseif UseIdleWalk == 5 or UseIdleWalk == 6 then -- Route walk
            local routelen = #MyRoute
            local step, dist = nil, math.huge
            local posx, posy = (RelativeRoute == 1) and {xoff, yoff} or {mx, my}
            
            TraceAI((RelativeRoute == 1) and "Relative route " or "Absolute route " .. posx .. "," .. posy)
            
            for k, v in ipairs(MyRoute) do
                local distance = math.sqrt((v[1] - posx)^2 + (v[2] - posy)^2)
                if distance < dist then
                    dist = distance
                    step = k
                end
                TraceAI("Route Analysis: step " .. k .. " distance " .. distance .. " current step " .. step .. "/" .. dist)
            end
            
            local nextstep
            if RouteWalkDirection == 1 and step == routelen then
                nextstep = (UseIdleWalk == 5) and step - 1 or 1
                RouteWalkDirection = (UseIdleWalk == 5) and -1 or RouteWalkDirection
            elseif RouteWalkDirection == -1 and step == 1 then
                nextstep = (UseIdleWalk == 5) and 2 or routelen
                RouteWalkDirection = (UseIdleWalk == 5) and 1 or RouteWalkDirection
            else
                nextstep = step + RouteWalkDirection
            end
            
            TraceAI("Route Walk - nextstep " .. nextstep .. " from " .. step)
            
            if RelativeRoute == 1 then
                destx, desty = ox + MyRoute[nextstep][1], oy + MyRoute[nextstep][2]
            else
                destx, desty = MyRoute[nextstep][1], MyRoute[nextstep][2]
            end
            
            TraceAI("Route Dest: " .. destx .. "," .. desty .. " owner: " .. ox .. "," .. oy .. " mypos: " .. mx .. "," .. my .. " route step: " .. step .. " nextstep=" .. nextstep)
        
        else
            logappend("AAI_ERROR", "Invalid UseIdleWalk value in GetIdleWalkDest()")
            UseIdleWalk = 0
            return mx, my
        end
        
        return destx, desty
    end

    --######################
    --### DoAutoPushback ###
    --######################

    function DoAutoPushback(myid)
        local actors = GetActors()
        local x,y=GetV(V_POSITION,myid)
        for i,v in ipairs(actors) do
            if (IsMonster(v)==1) then
                local tact= GetTact(TACT_PUSHBACK,v)
                local target =GetV(V_TARGET,v)
                if (tact==2 or (tact==1 and IsFriendOrSelf(target)==1))then				
                    TraceAI("Pushback: "..GetDistanceA(target,v))
                    if (GetDistanceA(target,v) <= AutoPushbackThreshold and GetDistanceA(target,v)~=-1) then
                        TraceAI("Enemies close to me, using pushback")
                        local skill,level=GetPushbackSkill(MyID)
                        if (skill<=0) then
                            UseAutoPushback=0
                        elseif (GetV(V_SP,myid) >= GetSkillInfo(skill,3,level) and GetV(V_SKILLATTACKRANGE,MyID,skill) >= GetDistanceA(myid,v)) then
                            DoSkill(skill,level,v)
                            return
                        end
                        break
                    end
                end
            elseif (IsFriendOrSelf(id)==0 and PVPmode ~=0) then
                local tact= GetPVPTact(TACT_PUSHBACK,v)
                local target =GetV(V_TARGET,v)
                if (tact==2 or (tact==1 and IsFriendOrSelf(target)==1))then
                    if (GetDistanceA(target,v) <= AutoPushbackThreshold) then
                        TraceAI("Enemies close to me, using pushback")
                        local skill,level=GetPushbackSkill(MyID)
                        if (skill<=0) then
                            UseAutoPushback=0
                        elseif (GetV(V_SP,myid) >= GetSkillInfo(skill,3,level)) then
                            DoSkill(skill,level,v)
                            return
                        end
                        break
                    end
                end
            end
        end
        return 1
    end


    --####################
    --### DoKiteAdjust ###
    --####################

    function DoKiteAdjust(myid, enemy)
        local target = GetV(V_TARGET, enemy)
        local step = (IsFriend(target) == 1 or target == MyID) and KiteStep or KiteParanoidStep

        local x, y = GetV(V_POSITION, myid)
        local ox, oy = GetV(V_POSITION, GetV(V_OWNER, myid))
        local ex, ey = GetV(V_POSITION, enemy)

        -- Determine possible movement directions
        local xoptions = { [2] = 1, [0] = 1, [1] = 1 }
        local yoptions = { [2] = 1, [0] = 1, [1] = 1 }

        if x > ex then
            xoptions[2] = 0
        elseif x < ex then
            xoptions[1] = 0
        else
            yoptions[0] = 0
        end

        if y > ey then
            yoptions[2] = 0
        elseif y < ey then
            yoptions[1] = 0
        else
            xoptions[0] = 0
        end

        -- Determine x direction
        local xdirection
        if ox > x then
            xdirection = xoptions[1] and 1 or xoptions[0] and 0 or (xoptions[2] and (ox - x + step) <= KiteBounds) and -1 or (ey < y) and 0 or 1
        else
            xdirection = xoptions[2] and -1 or xoptions[0] and 0 or (xoptions[1] and (x - ox + step) <= KiteBounds) and 1 or (ey > y) and 0 or -1
        end

        -- Determine y direction
        local ydirection
        if oy > y then
            ydirection = yoptions[1] and 1 or (yoptions[0] and xdirection ~= 0) and 0 or (yoptions[2] and oy - y + step <= step) and -1 or (ex > x and xdirection ~= 0) and 0 or 1
        else
            ydirection = yoptions[2] and -1 or (yoptions[0] and xdirection ~= 0) and 0 or (yoptions[1] and y - oy + step <= KiteBounds) and 1 or (ex < x and xdirection ~= 0) and 0 or -1
        end

        TraceAI("Kiting in " .. xdirection .. "," .. ydirection .. " direction")
        MyDestX = x + step * xdirection
        MyDestY = y + step * ydirection
        Move(myid, MyDestX, MyDestY)
    end


    function FailSkillUse(mode)
        -- Determine the effective mode based on whether it's a player
        local effectiveMode = IsPlayer(mode) == 1 and 13 or mode

        -- Initialize skill fail count if not already set
        SkillFailCount[effectiveMode] = SkillFailCount[effectiveMode] or 0

        -- Check if retry limit has been reached
        if SkillFailCount[effectiveMode] < SkillRetryLimit[effectiveMode] then
            -- Set timeouts based on the mode
            local timeouts = {
                [-1] = function() MySkillUsedCount = math.max(0, MySkillUsedCount - 1) end,
                [1] = function() GuardTimeout = 1 end,
                [2] = function() QuickenTimeout = 1 end,
                [3] = function() MagTimeout = 1 end,
                [4] = function() SOffensiveTimeout = 1 end,
                [5] = function() SDefensiveTimeout = 1 end,
                [6] = function() SOwnerBuffTimeout = 1 end,
                [7] = function() SightTimeout = 1 end,
                [9] = function() ProvokeOwnerTimeout = 1 end,
                [10] = function() SteinWandTimeout = 1 end,
                [11] = function() OffensiveOwnerTimeout = 1 end,
                [12] = function() DefensiveOwnerTimeout = 1 end,
                [13] = function() OtherOwnerTimeout = 1 end
            }
            
            if timeouts[effectiveMode] then
                timeouts[effectiveMode]()
            elseif IsPlayer(mode) then
                PKFriendsTimeout[mode] = 1
            else
                OnFailUnknownMode(mode)
            end

            -- Log the failure and increment fail count
            local message = "Skill cast failed: Mode " .. mode .. ", fail count " .. SkillFailCount[effectiveMode] .. ", retrying"
            TraceAI(message)
            logappend("AAI_SKILLFAIL", message)
            SkillFailCount[effectiveMode] = SkillFailCount[effectiveMode] + 1
        else
            -- Log when retry limit is reached and reset fail count
            local message = "Skill cast failed, retry limit reached: Mode " .. mode .. ", fail count " .. SkillFailCount[effectiveMode]
            TraceAI(message)
            logappend("AAI_SKILLFAIL", message)
            SkillFailCount[effectiveMode] = 0
        end

        -- Reset auto skill related variables
        AutoSkillTimeout = 1
        AutoSkillCastTimeout = 1
        if AutoSkillCooldown[CastSkill] then
            AutoSkillCooldown[CastSkill] = 1
        end
        CastSkill = 0
        CastSkillLevel = 0
        CastSkillMode = 0
        CastSkillTime = 0
        CastSkillState = 0
    end

    --###STATE PROCESSES###
    --TraceAI("SP tracking: Time: "..GetTick().." last moved: "..LastMovedTime.." last sp time "..LastSPTime)
    function ProcessStateCommand(State)
        local commandHandlers = {
            [IDLE_ST] = OnIDLE_ST,
            [CHASE_ST] = OnCHASE_ST,
            [ATTACK_ST] = OnATTACK_ST,
            [FOLLOW_ST] = OnFOLLOW_ST,
            [MOVE_CMD_ST] = OnMOVE_CMD_ST,
            [STOP_CMD_ST] = OnSTOP_CMD_ST,
            [ATTACK_OBJECT_CMD_ST] = OnATTACK_OBJECT_CMD_ST,
            [ATTACK_AREA_CMD_ST] = OnATTACK_AREA_CMD_ST,
            [PATROL_CMD_ST] = OnPATROL_CMD_ST,
            [HOLD_CMD_ST] = OnHOLD_CMD_ST,
            [SKILL_OBJECT_CMD_ST] = OnSKILL_OBJECT_CMD_ST,
            [SKILL_AREA_CMD_ST] = OnSKILL_AREA_CMD_ST,
            [FOLLOW_CMD_ST] = OnFOLLOW_CMD_ST,
            [IDLEWALK_ST] = OnIDLEWALK_ST,
            [ORBITWALK_ST] = OnORBITWALK_ST,
            [REST_ST] = OnREST_ST,
            [TANKCHASE_ST] = OnTANKCHASE_ST,
            [TANK_ST] = OnTANK_ST,
            [PROVOKE_ST] = OnPROVOKE_ST,
            [MOVE_CMD_HOLD_ST] = OnMOVE_CMD_HOLD_ST,
            [FRIEND_CROSS_ST] = OnFRIEND_CROSS_ST,
            [FRIEND_CIRCLE_ST] = OnFRIEND_CIRCLE_ST,
        }

        local handler = commandHandlers[State]
        if handler then
            handler()
        else
            if NewState(State) == -1 then
                    -- Handle invalid states gracefully
                    TraceAI("Invalid State: "..MyState.." -> IDLE_ST")
                    logappend("AAI_ERROR", "MyState set to invalid state: "..MyState)
                    MyState = IDLE_ST
            end
        end
    end

    --########################
    --### Main AI Function ###
    --########################

    function AI(myid)
        MyID = myid
        if LastAITime==GetTick() then --prevent AI from running twice in the same tick. 
            TraceAI("double-AI() call detected, blocked")
            return
        else
            if LastAITime + 400 < GetTick() and LastAITime > 10 then
                TraceAI("Missed AI calls. Previous AI call was "..LastAITime-GetTick().." ms ago")
                logappend("AAI_SKILLFAIL", "Missed AI calls. Previous AI call was "..LastAITime-GetTick().." ms ago")
            end
            LastAIDelay=GetTick()-LastAITime
            LastAITime=GetTick()
            if MyEnemy ~= 0 then
                local ex,ey=GetV(V_POSITION,MyEnemy)
                for v=10,2,-1 do
                    EnemyPosX[v],EnemyPosY[v]=EnemyPosX[v-1],EnemyPosY[v-1]
                end
                EnemyPosX[1],EnemyPosY[1]=ex,ey,GetV(V_MOTION,MyID)
            end
        end
        if DoneInit== 0 then
            doInit(myid)
        end
        if AggressiveRelogTracking==1 then
            local OutFile
            if IsHomun(MyID)==1 then
                OutFile=io.open(AggressiveRelogPath.."H_"..GetV(V_OWNER,MyID).."Time.lua","w")
            else
                OutFile=io.open(AggressiveRelogPath.."M_"..GetV(V_OWNER,MyID).."Time.lua","w")
            end
            if OutFile~=nil then
                OutFile:write("LastAITime_ART="..LastAITime)
                OutFile:close()
            else
                TraceAI("Failed to update time file for Aggressive Relog Tracking")
                logappend("AAI_ERROR","Failed to update aggressive relog time tracking file for owner "..GetV(V_OWNER,MyID))
            end
        end
        OnAIstart()
        -- ###AUTOFRIEND###
        -- Save the ID to a file so counterpart can friend it
        -- Why is it here instead of at the start?
        -- Because the client wont tell us our ID until AI() is called :-(
        if (NeedToDoAutoFriend==1 and NewAutoFriend==1) then
            TraceAI("Now it's time to do the autofriend")
            local owner=GetV(V_OWNER,myid)
            local OutFile
            if (IsHomun(myid)==1) then
                OutFile=io.open("AI/USER_AI/data/H_"..owner..".txt","w")
            else
                OutFile=io.open("AI/USER_AI/data/M_"..owner..".txt","w")
            end
            if OutFile~=nil then
                OutFile:write (myid)
                OutFile:close()
            else
                TraceAI("Failed to create autofriending file.")
                logappend("AAI_ERROR","Failed to create autofriending file for owner "..GetV(V_OWNER,MyID))
            end
            NeedToDoAutoFriend=0
        end
        
        --###BOOKKEEPING###
        
        
        -- Hackjob to fix strange behavior, with the timeouts being set to hours, days, or weeks in the future (suspect due to GetTick() returning bad numbers). 

        if GuardTimeout-GetTick() > 350000 then
            logappend("AAI_ERROR","Guard timeout was "..GuardTimeout.." time is "..GetTick())
            GuardTimeout=1
        end
        if MagTimeout-GetTick() > 350000 then
            logappend("AAI_ERROR","Mag timeout was "..MagTimeout.." time is "..GetTick())
            MagTimeout=1
        end
        if QuickenTimeout-GetTick() > 1205000 then
            logappend("AAI_ERROR","Quicken timeout was "..QuickenTimeout.." time is "..GetTick())
            QuickenTimeout=1
        end
        if SOffensiveTimeout-GetTick() > 350000 then
            logappend("AAI_ERROR","Homun S offensive timeout was "..SOffensiveTimeout.." time is "..GetTick())
            SOffensiveTimeout=1
        end
        if SDefensiveTimeout-GetTick() > 350000 then
            logappend("AAI_ERROR","Homun S defensive timeout was "..SDefensiveTimeout.." time is "..GetTick())
            SDefensiveTimeout=1
        end
        if SOwnerBuffTimeout-GetTick() > 6000000 then
            logappend("AAI_ERROR","Homun S owner buff timeout was "..SOwnerBuffTimeout.." time is "..GetTick())
            SOwnerBuffTimeout=1
        end
        if OffensiveOwnerTimeout-GetTick() > 6000000 then
            logappend("AAI_ERROR","Offensive owner buff timeout was "..OffensiveOwnerTimeout.." time is "..GetTick())
            OffensiveOwnerTimeout=1
        end
        if DefensiveOwnerTimeout-GetTick() > 6000000 then
            logappend("AAI_ERROR","Defensive owner buff timeout was "..DefensiveOwnerTimeout.." time is "..GetTick())
            DefensiveOwnerTimeout=1
        end
        if OtherOwnerTimeout-GetTick() > 6000000 then
            logappend("AAI_ERROR","Other owner buff timeout was "..OtherOwnerTimeout.." time is "..GetTick())
            OtherOwnerTimeout=1
        end
        if MyMaxSP~=GetV(V_MAXSP,MyID) then
            AdjustCapriceLevel()
            MyMaxSP=GetV(V_MAXSP,MyID)
        end
        if AIInitTick==0 or AIInitTick==1 or AIInitTick==nil then
            AIInitTick=GetTick()
        end
        FastChangeCount = 0
        --###For UseSmartBulwark:
        if UseSmartBulwark==1 then
            MyBuffSPCost=0
            for k,v in pairs(MyBuffSPCosts) do
                MyBuffSPCost=MyBuffSPCost+v
            end
        end

        --###DATA GATHERING###
        for k,v in pairs(Unreachable) do
            if (IsOutOfSight(myid,k)==true or GetV(V_MOTION,k)==MOTION_DEAD or (IsFriendOrSelf(GetV(V_TARGET,k))==1) and GetV(V_MOTION,k)~=MOTION_STAND) then
                Unreachable[k]=nil
                TraceAI("Marking as reachable"..k)
            end
        end
        
        -- Position sensing
        local x,y=GetV(V_POSITION,MyID)
        local ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
        if MyEnemy ~= 0 then
            local ex,ey=GetV(V_POSITION,MyEnemy)
        else
            ex,ey=0,0
        end
        --myposlog=""
        for v=10,2,-1 do
            MyASAPBuffs[v],MyPosX[v],MyPosY[v],OwnerPosX[v],OwnerPosY[v],EnemyPosX[v],EnemyPosY[v],MyMotions[v],MyStates[v],MyEnemies[v]=MyASAPBuffs[v-1],MyPosX[v-1],MyPosY[v-1],OwnerPosX[v-1],OwnerPosY[v-1],EnemyPosX[v-1],EnemyPosY[v-1],MyMotions[v-1],MyStates[v-1],MyEnemies[v-1]
        end	
        MyPosX[1],MyPosY[1],OwnerPosX[1],OwnerPosY[1],EnemyPosX[1],EnemyPosY[1],MyMotions[1],MyStates[1],MyEnemies[1]=x,y,ox,oy,ex,ey,GetV(V_MOTION,MyID),MyState,MyEnemy
        if MyState==PROVOKE_ST then
            MyASAPBuffs[1]=MyASAPBuffs[2]
        else
            MyASAPBuffs[1]=0
        end
        --for v=1,10 do
        --	myposlog=myposlog.." "..MyPosX[v]..","..MyPosY[v]
        --end
        --TraceAI("MyPosLog "..myposlog.." x="..x.."y="..y)
        if x~=MyPosX[2] or y~=MyPosY[2] then
            --TraceAI("we moved")
            LastMovedTime=GetTick()
        end
        -- Actor list preprocessing
        local actors=GetActors()
        Actors={}
        OldPlayers=Players
        Players={}
        Monsters={}
        Summons={}
        Retainers={}
        Targets={}
        TakenCells={} --OccupiedCellDetection 
        tMobID=""
        TankMonsterCount=0
        local seralegionCount=0
        SeraLegionList=""
        local seralegionActive=0
        local seralegionBugged=0
        for i,v in ipairs(actors) do
            local x,y = GetV(V_POSITION,v)
            TakenCells[x.."_"..y]=1
            if AAIActors[v]~=1 then
                if IsHomun(myid)==1 then
                    logappend("AAI_ACTORS","Actor "..v.." type "..GetV(V_HOMUNTYPE,v).." at "..x..","..y.." Is M="..IsMonster(v))
                else
                    logappend("AAI_ACTORS","Actor "..v.." mertype "..GetV(V_MERTYPE,v).." at "..x..","..y.." Is M="..IsMonster(v))
                end
                AAIActors[v]=1
            end
            local x,y = GetV(V_POSITION,v)
            if GetV(V_HOMUNTYPE,v)==1102 and x==174 and 33==y and GetV(V_MOTION,v)==MOTION_STAND then
                -- This is the eden group bathory, ignore it. 
            else	
                if (false == IsOutOfSight(myid,v)) then
                    Actors[v]=1
                    --TraceAI(v.." of type "..GetV(V_HOMUNTYPE,v).." in sight")
                    if GetV(V_HOMUNTYPE,MyID)==SERA then
                        local actortype=GetV(V_HOMUNTYPE,v)
                        if (actortype > 2157 and actortype < 2161) then
                            seralegionCount=seralegionCount+1
                            SeraLegionList=SeraLegionList..v.." "
                            if GetV(V_MOTION,v)==MOTION_STAND and GetDistanceAR(MyID,v)>3 then
                                seralegionBugged=seralegionBugged+1
                            else 
                                seralegionActive=seralegionActive+1
                            end
                        end
                    end
                    if (v >= MagicNumber2 and v <= MagicNumber3) then
                        Players[v]=1
                        if MyFriends[v]==FRIEND and GetV(V_OWNER,MyID)~=v then --Newly appeared on screen
                            if OldPlayers[v]~=1 or AggressiveAutofriend then
                                local newfriendhidfile=io.open("./AI/USER_AI/data/H_"..v..".txt","r")
                                local newfriendmidfile=io.open("./AI/USER_AI/data/M_"..v..".txt","r")
                                TraceAI("new friend on screen, checking H_ID"..v)
                                if newfriendhidfile~=nil then
                                    TraceAI("h_id found"..v)
                                    local newfriendhid=newfriendhidfile:read("*line")
                                    if newfriendhid~=nil then
                                        TraceAI("h_id: "..newfriendhid)
                                        MyFriends[newfriendhid+1-1]=RETAINER --crude type conversion
                                    end
                                    newfriendhidfile:close()
                                end
                                if newfriendmidfile~=nil then
                                TraceAI("new friend on screen, checking M_ID"..v)
                                    local newfriendmid=newfriendmidfile:read("*line")
                                    TraceAI("m_id found"..v)
                                    if newfriendmid~=nil then
                                        TraceAI("m_id: "..newfriendmid)
                                        MyFriends[newfriendmid+1-1]=RETAINER
                                    end
                                    newfriendmidfile:close()
                                end
                            end	
                        end
                    elseif IsMonster(v)==1 then
                        --TraceAI(v.." of type "..GetV(V_HOMUNTYPE,v).." is a monster")
                        if LiveMobID == 1 and IsHomun(MyID)==1 then
                            tMobID=tMobID.."MobID["..v.."]="..GetV(V_HOMUNTYPE,v).."\\n"
                        end
                        Monsters[v]=1
                        if (v >= MagicNumber) then
                            Summons[v]=1
                        end
                        if (AutoDetectPlant==1 and IsActive[v]~=1 and IsHomun(myid)~=1) then
                            if (GetV(V_MOTION,v)==MOTION_STAND or GetV(V_MOTION,v)==MOTION_DAMAGE or GetV(V_MOTION,v)==MOTION_DEAD) then
                                IsActive[v]=0
                            else
                                IsActive[v]=1
                            end
                        end
                        if (GetTact(TACT_BASIC,v)==TACT_TANK and GetV(V_TARGET,v)==MyID) then
                            TankMonsterCount=TankMonsterCount+1
                        end
                        motionclass=MotionClassLU[GetV(V_MOTION,v)]
                        if motionclass==nil then 
                            motionclass=3 
                        end --CHANGE
                        --TraceAI(v.." of type "..GetV(V_HOMUNTYPE,v).." "..motionclass)
                        if (motionclass~=-1 and (IsActive[v]==1 or AutoDetectPlant~=1 or IsHomun(myid)==1)) then 
                            --TraceAI(v.." of type "..GetV(V_HOMUNTYPE,v).." target added")
                            Targets[v]={motionclass,GetTargetClass(GetV(V_TARGET,v))}
                        end
                    elseif (v >= MagicNumber) then		
                        Retainers[v]=1
                    end
                end
            end
        end
        if LiveMobID == 1 and IsHomun(MyID)==1 and tMobID ~="" then
            local midoutfile=io.open(AggressiveRelogPath.."MobID.lua","w")
            if midoutfile~=nil then
                midoutfile:write(tMobID)
                midoutfile:close()
            else
                TraceAI("Failed to update MobID - check permissions and/or AggressiveRelogPath.")
                logappend("AAI_ERROR","Failed to update aggressive relog time tracking file for owner "..GetV(V_OWNER,MyID))
            end
        end
        if LiveMobID == 1 and IsHomun(MyID)==0 then
            MobID={}
            if pcall(function () dofile(AggressiveRelogPath.."MobID.lua") end) then
                -- do nothing
            else
                logappend("AAI_ERROR", "Failed to load MobID from "..AggressiveRelogPath.."MobID.lua")
            end
        end
        if GetV(V_HOMUNTYPE,MyID)==SERA then
            for t=1,4 do
                SeraLegionTotalHist[t+1]=SeraLegionTotalHist[t]
                SeraLegionBugHist[t+1]=SeraLegionBugHist[t]
            end
            SeraLegionTotalHist[1]=seralegionCount
            SeraLegionBugHist[1]=seralegionBugged
            SeraLegionCount=math.max(SeraLegionTotalHist[1],SeraLegionTotalHist[2],SeraLegionTotalHist[3],SeraLegionTotalHist[4],SeraLegionTotalHist[5])
            SeraLegionBugged=math.min(SeraLegionBugHist[1],SeraLegionBugHist[2],SeraLegionBugHist[3],SeraLegionBugHist[4],SeraLegionBugHist[5])
            SeraLegionActive=SeraLegionCount-SeraLegionBugged
            if SeraLegionCount==0 and GetTick() > AutoSkillTimeout and GetTick() < AutoSkillCooldown[MH_SUMMON_LEGION] then
                --Why are we in cooldown when there are no bugs out? Cast must have failed, or something killed them. 
                AutoSkillCooldown[MH_SUMMON_LEGION]=1
                TraceAI("Sera Legion: Legion cooldown canceled, bugs not present")
            elseif SeraLegionBugged > 2 then
                AutoSkillCooldown[MH_SUMMON_LEGION]=1
                TraceAI("Sera Legion: Legion cooldown canceled, bugs bugged")
            end
            --logappend("AAI_Legion","Sera Legion - "..SeraLegionCount.." bugs out "..SeraLegionActive.." active and "..SeraLegionBugged.." bugged. "..SeraLegionList)
        end
        if PVPmode==1 then
            for k,v in pairs(Players) do
                --logappend("AAI_PVP",k.." ("..GetV(V_HOMUNTYPE,k)..") Motion: "..FormatMotion(GetV(V_MOTION,k)).."Is monster? "..IsMonster(k))
                if IsHomun(MyID)==1 then
                    TraceAI("PVP: Player "..k.." ("..GetV(V_HOMUNTYPE,k)..") Motion: "..FormatMotion(GetV(V_MOTION,k)).."Is monster? "..IsMonster(k))
                else
                    TraceAI("PVP: Player "..k.."  Motion: "..FormatMotion(GetV(V_MOTION,k)).."Is monster? "..IsMonster(k))
                end
                if IsMonster(k)==1 then
                    Targets[k] = {MotionClassLU[GetV(V_MOTION,k)],GetTargetClass(GetV(V_TARGET,k))}
                end
            end
        end
        
        --New autofriend routine
        if (NewAutoFriend==1 and AssumeHomun==1) then
            friendedOK=0
            retainercount=0
            for k,v in pairs(Retainers) do
                if (k~=MyID) then
                    retainercount=retainercount+1
                    if (MyFriends[k]==2) then
                        friendedOK=1
                    end
                end
            end	
            if (friendedOK==0) then
                local owner=GetV(V_OWNER,MyID)
                if (IsHomun(myid)==1) then
                    InFile=io.open("./AI/USER_AI/data/M_"..owner..".txt","r")
                else
                    InFile=io.open("./AI/USER_AI/data/H_"..owner..".txt","r")
                end
                if InFile~=nil then
                    retainerid=InFile:read("*a")
                    InFile:close()
                    retainerid=tonumber(retainerid)
                    if (retainerid ~=nil) then
                        MyFriends[retainerid]=2
                    end
                end
            end
        end
        --SP+Skillfail Watcher
        local clearcastskill=0  --There are a buncha globals that need to be zeroed when we're done watching for skill cast success or failure. However, after the initial round of skill failure checking, we still need to know what this skill was in order to check what the skill was. Also, we need to make sure we don't call FailSkillUse() if it looks like it failed, but the SP for it was used. So we set this to 1 if we see it successfully cast, 2 if failed, and then act appropriately afterwards.
        local sp = GetV(V_SP,MyID)
        if CastSkill~=0 then
            local castskillold = CastSkill
            local castskilloldlvl = CastSkillLevel -- remember these for the SP watcher down below. 
            local skillcastingtime = GetSkillInfo(CastSkill,4,CastSkillLevel)+GetSkillInfo(CastSkill,5,CastSkillLevel)*CastTimeRatio
            logappend("AAI_SKILLFAIL", "Skillfail Watcher active: "..FormatSkill(CastSkill,CastSkillLevel).."mode"..CastSkillMode.."delay "..LastAIDelay.." motion "..GetV(V_MOTION,MyID))
            if GetSkillInfo(CastSkill,4,CastSkillLevel)+GetSkillInfo(CastSkill,5,CastSkillLevel) == 0 then 
                if LastAIDelay > 500 then
                    --Skill cast successfully
                    TraceAI("Delay watcher: Skill use successful - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                    logappend("AAI_SKILLFAIL","successful skill use detected - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                    clearcastskill=1
                    LastASAPTargBuffTime	=0
                    LastASAPTargBuffTarg	=0
                    LastASAPTargBuffMode	=0
                elseif GetTick() - CastSkillTime > 1000 then
                    --Musta failed, we tried to use an instant cast skill 1 second ago and still no sign of it and no sign of delay.
                    TraceAI("Delay watcher: no sign of instacast skill casting 1 second later - failed. mode: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel))
                    logappend("AAI_SKILLFAIL", "no sign of instacast skill casting 1 second later - failed. mode: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel))
                    clearcastskill=2
                end
            else
                if GetV(V_MOTION,MyID)==MOTION_CASTING then
                    CastSkillState=1
                elseif CastSkillState>0 then
                    if LastAIDelay > 220 then
                        --Skill cast successfully
                        if CastSkillMode==8 and EleanorForceChange == 0 then
                            if EleanorMode==1 then
                                EleanorMode=0
                            else
                                EleanorMode=1
                            end
                            UpdateTimeoutFile()
                        end
                        TraceAI("Delay watcher: Skill use successful detected by delay - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                        logappend("AAI_SKILLFAIL","successful skill use detected by delay - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                        clearcastskill=1
                    else
                        CastSkillState=CastSkillState+1
                        if CastSkillState > 2 then
                            local flinch=0
                            for v=1,10,1 do
                                if MyMotions[v]==MOTION_DAMAGE then
                                    flinch=1
                                    break
                                end
                            end
                            -- Ground targeted skills aren't interruptible! 
                            if (flinch==1 and GetSkillInfo(CastSkill,7,CastSkillLevel)~=2) or skillcastingtime + AutoSkillTimeout + CastSkillTime < GetTick() then 
                                TraceAI("Delay watcher: Skill casting detected, but no delay - cast was broken: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." flinch: "..flinch.." expected cast completion: "..(skillcastingtime + CastSkillTime))
                                logappend("AAI_SKILLFAIL", "Skill casting detected, but no delay - cast was broken: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." flinch: "..flinch.." expected cast completion: "..(skillcastingtime + CastSkillTime))
                                clearcastskill=2
                            elseif skillcastingtime + CastSkillTime > GetTick() then
                                TraceAI("Delay watcher: Skill use successful - was seen casting, and no sign of interruption, no delay. mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                                logappend("AAI_SKILLFAIL","Skill use successful - was seen casting, and no sign of interruption, no delay. mode"..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                                clearcastskill=1
                            end
                        end
                    end
                else -- CastSkillState is 0, so the skill hasn't started casting, but just in case it slipped by:
                    if LastAIDelay > 220 then
                        --Skill cast successfully
                        if CastSkillMode==8 and EleanorForceChange == 0 then
                            if EleanorMode==1 then
                                EleanorMode=0
                            else
                                EleanorMode=1
                            end
                            UpdateTimeoutFile()
                        end
                        TraceAI("Delay watcher: Skill use successful - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                        logappend("AAI_SKILLFAIL","successful skill use detected - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                        clearcastskill=1
                    elseif GetTick() - CastSkillTime > 1000 then
                        TraceAI("Delay watcher: no sign of skill casting 1 second later - failed. mode: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel))
                        logappend("AAI_SKILLFAIL", "no sign of skill casting 1 second later - failed. mode: "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel))
                        clearcastskill=2
                    end
                end
            end
            -- sp watcher
            if sp-MyLastSP == RegenTick[1] - GetSkillInfo(castskillold,3,castskilloldlvl) or MyLastSP - sp == GetSkillInfo(castskillold,3,castskilloldlvl) then
                --if IsHomun(myid)==0 then
                    TraceAI("SP watcher: Skill use successful - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                    logappend("AAI_SKILLFAIL","successful skill use detected by SP use - mode "..CastSkillMode.." skill "..FormatSkill(CastSkill,CastSkillLevel).." LastAIDelay "..LastAIDelay)
                    clearcastskill=1
                --end
                if sp-MyLastSP == RegenTick[1] - GetSkillInfo(castskillold,3,castskilloldlvl) then
                    LastSPTime=GetTick()
                end
            elseif MyLastSP<= sp then
                if sp-MyLastSP==RegenTick[1] and RegenTick[1]~=0 then
                    LastSPTime=GetTick()
                end
            end
        else
            if sp-MyLastSP == RegenTick[1] and RegenTick[1]~=0 then 
                LastSPTime=GetTick()
            elseif sp-MyLastSP > 100 then
                -- do nothing, owner aid-potted it, ignore this
            elseif sp-MyLastSP > RegenTick[1] or (sp-MyLastSP < RegenTick[1] and sp-MyLastSP > 0)  then
                LastSPTime=GetTick()
                if sp-MyLastSP > math.floor(GetV(V_MAXSP,MyID)/100)+3 then -- this could be the correct tick to use
                    for v=3,2,-1 do
                        RegenTick[2][v]=RegenTick[2][v-1]
                    end
                    RegenTick[2][1]=sp-MyLastSP
                    local tickcount=0
                    for k,v in pairs(RegenTick[2]) do
                        if v~=sp-MyLastSP then
                            break
                        end
                        tickcount=k
                    end
                    if tickcount==3 then
                        RegenTick[1]=sp-MyLastSP
                        TraceAI("Watcher: New SP Regen tick set: "..RegenTick[1])
                        logappend("AAI_SKILLFAIL","New SP Regen tick set: "..RegenTick[1])
                        UpdateTimeoutFile()
                    end
                end
            end
        end

        if clearcastskill==1 then
            if (CastSkill==MH_CBC or CastSkill==MH_EQC or CastSkill==MH_TINDER_BREAKER) and EleanorForceChange == 0 then
                EleanorMode=0 --grappler
                UpdateTimeoutFile()
            elseif (CastSkill==MH_SONIC_CLAW or CastSkill==MH_SILVERVEIN_RUSH or CastSkill==MH_MIDNIGHT_FRENZY) and EleanorForceChange == 0 then
                EleanorMode=1
                UpdateTimeoutFile()
            end
            SkillFailCount[CastSkillMode]=0
            --LavaSlideMode=constant
            if (LavaSlideMode==4 and CastSkill==MH_LAVA_SLIDE) then
                SightTimeout=GetTick()+500
            end
            CastSkill=0
            CastSkillLevel=0
            CastSkillMode=0
            CastSkillTime=0
            CastSkillState=0	
        elseif clearcastskill==2 then
                FailSkillUse(CastSkillMode)
        end
        MyLastSP=sp
        --###COMMAND PROCESSING###
        local msg	= GetMsg (myid)			-- command
        local rmsg	= GetResMsg (myid)		-- reserved command
        
        if msg[1] == NONE_CMD then
            if rmsg[1] ~= NONE_CMD then
                if List.size(ResCmdList) < 10 then
                    List.pushright (ResCmdList,rmsg)
                end
            end
        else
            List.clear (ResCmdList)	-- »õ·Î¿î ¸í·ÉÀÌ ÀÔ·ÂµÇ¸é ¿¹¾à ¸í·ÉµéÀº »èÁ¦ÇÑ´Ù.  
            ProcessCommand (msg)	-- ¸í·É¾î Ã³¸® 
        end
        
        
        OnAImiddle()
        
        --###EMERGENCY HANDLING###
        
        -- Avoid Routine
        if (IsHomun(MyID)==1 and UseAvoid==1 and (GetTick()-AIInitTick) > 5000) then
            for i,v in ipairs(actors) do
                if MyAvoid[GetV(V_HOMUNTYPE,v)]==1 then
                    os.exit()
                end
            end
        end
        if UseAutoHeal==1 then
            if DoHealingTasks(MyID) == 1 then
                return
            end
        end
        
        -- Prevent from being left behind
        -- Used only in critical (merc out of MoveBounds) situations
        -- Otherwise, IDLE_ST handles it
        
        local dist2owner=GetDistanceRect(MyID,GetV(V_OWNER,MyID))
        if (MyState ~=FOLLOW_ST and dist2owner > GetMoveBounds()) then
            MyState=FOLLOW_ST
        end
        --Cancel all action during the spawn invulnerability
        if (GetTick() < (MyStart + SpawnDelay)) then
            return
        end
        if OldHomunType==AMISTR and UseCastleDefend ==1 then
            if GetTick() > AutoSkillTimeout then
                local mytargetweight =0
                local ownertargetweight =0
                for k,v in pairs(Targets) do 
                    if v[2]==1 then
                        mytargetweight=mytargetweight+GetTact(TACT_WEIGHT,k)
                    elseif v[2]==2 then
                        if GetV(V_TARGET,k)==GetV(V_OWNER,MyID) then
                            ownertargetweight=ownertargetweight+GetTact(TACT_WEIGHT,k)
                        end
                    end
                end
                if CastleDefendThreshold <= ownertargetweight and ownertargetweight > mytargetweight then
                    DoSkill(HAMI_CASTLE,5,MyID)
                end
            end
        end
        object = SelectEnemy(GetEnemyList(MyID,-2))
        if (object~=0 and object ~= MyEnemy and MyState~=FOLLOW_ST) then
            MyEnemy=object
            MyState=CHASE_ST
            TraceAI("RESCUE ACTIVATED - Targeting "..object)
        end
        -- New in 1.51 - specialized cast react tactics. 
        for k,v in pairs(Targets) do
            if v[2]==1 or v[2] == 2 then
                tactcast= GetTact(TACT_CAST,k)
                if tactcast > CAST_REACT then
                    local skill,level=0,0
                    if tactcast > 1000 then
                        for ii,vv in ipairs(GetTargetedSkills()) do
                            if vv[2]==tactcast and vv[3]~=0 and vv[3]~=nil then
                                skill=vv[2]
                                level=vv[3]
                                break
                            end
                        end
                    else -- generic skill response. 
                        for ii,vv in ipairs(GetTargetedSkills()) do
                            if tactcast==9 and vv[2]~=0 and vv[3]~=0 and vv[3] ~=nil then
                                skill=vv[2]
                                level=vv[3]
                                break
                            elseif
                                tactcast==vv[1]-10 and vv[2]~=0 and vv[3]~=0 and vv[3] ~=nil then
                                skill=vv[2]
                                level=vv[3]
                                break
                            end
                        end
                    end
                    if skill~=0 then
                        MySkill=skill
                        MySkillLevel=level
                        MyEnemy=k
                        MyState=OnSKILL_OBJECT_CMD_ST
                        TraceAI("CAST_REACT_(skill) being enabled against target"..k.." with tactic "..tactcast.." with "..FormatSkill(skill,level))
                        break
                    end
                elseif tactcast == CAST_REACT_STIEN then
                    if GetV(V_HOMUNTYPE,MyID)==BAYERI then
                        if AutoSkillTimeout < GetTick() and GetSkillInfo(MH_STEINWAND,3,5) < GetV(V_SP,MyID) then
                            DoSkill(MH_STEINWAND,5,MyID)
                            TraceAI("CAST_REACT_STIEN being enabled against target"..k.." with tactic "..tactcast)
                        
                            return
                        end
                    end
                elseif tactcast == CAST_REACT_CASTLE then
                    if (modulo(GetV(V_HOMUNTYPE,MyID),4)==AMISTR or OldHomunType==AMISTR) and v[2]==2 then
                        if AutoSkillTimeout < GetTick() and GetSkillInfo(HAMI_CASTLE,3,5) < GetV(V_SP,MyID) then
                            DoSkill(HAMI_CASTLE,5,MyID)
                            TraceAI("CAST_REACT_CASTLE being enabled against target"..k.." with tactic "..tactcast)
                            return
                        end
                    end
                end
            end
        end

        if MyState~=PROVOKE_ST then
            if DoAutoBuffs(3) ~= 1 then
                logappend("AAI_ASAP","ASAP BUFF "..MyState)
                if MyState==PROVOKE_ST then --if we're looking at a targeted buff, this means it's an ASAP poison mist, painkiller, or lava slide
                    MyASAPBuffs[1]=MyPSkill
                end
                return
            end
        end
        -- Check to see if mercenary should activate kiting routine
        if ((KiteMonsters==1 and (KiteOK(MyID)==1 or ForceKite == 1)) or HPPercent(MyID) < FleeHP) then
            local x,y=GetV(V_POSITION,MyID)
            if ((x==KiteDestX and y==KiteDestY) or (KiteDestX==0 and KiteDestY==0)) then
                local actors = GetActors()
                kitecalled=0
                for i,v in ipairs(actors) do
                    if (IsMonster(v)==1 and GetV(V_MOTION,v) ~= MOTION_DEAD) then
                        local target=GetV(V_TARGET,v)
                        local tact = GetTact(TACT_KITE,v)
                        if ((IsFriendOrSelf(target)==1 and tact==1) or tact==2) then
                            local threshold
                            if (IsFriend(target)==1 or target==MyID) then
                                threshold=KiteThreshold
                            else
                                threshold=KiteParanoidThreshold
                            end
                            if (GetDistanceA(MyID,v) <= threshold) then
                                TraceAI("Enemies close to me, start kite routine. ")
                                DoKiteAdjust(MyID,v)
                                kitecalled=1
                                break
                            end
                        end
                    end
                end
                if (kitecalled == 0) then
                    KiteDestX,KiteDestY=0,0
                end
            else
                Move(myid,KiteDestX,KiteDestY)
            end
        end 
        --Stienwand autocast on tele stuff
        if GetTick() < SteinWandPauseTime then
            return
        end
        if UseSteinWandTele ==1 and GetV(V_HOMUNTYPE,MyID)==BAYERI then
            if SteinWandPauseTime == 0 then
                DoSkill(MH_STEINWAND,BayeriSteinWandLevel,MyID)
                SteinWandTimeout=AutoSkillCastTimeout+GetSkillInfo(MH_STEINWAND,8,BayeriSteinWandLevel)
                SteinWandPauseTime=SteinWandTelePause+GetTick()
                return
            end
        end
        ProcessStateCommand(MyState)
        OnAIEnd()
    end

                    `,
'AI/USER_AI/A_Friends.lua': `
    --Friendlist for Azzy AI
    --Automatically generated by Azzy AI.
    --To add friends, put mercenary or homun into standby mode (ctl+T or alt+T as appropriate), and sit 1 cell to the west (to left in default view) of the person who you wish to friend
    --To remove friends, put merc/homun into standby mode, and sit 1 cell to the east (to right in default view) of the person you want to remove.
    --
    --To add KOS/Enemy/Etc lists, get the ID number from ROPD or by friending them, and make a line like
    --MyFriends{2322797}=KOS
    --Possible values are NEUTRAL, KOS (kill on sight), ENEMY (assume hostile, but don't attack), and ALLY (assume friendly).
    MyFriends={}
    MyFriends[2003516]=1 -- 
    MyFriends[110371312]=1 -- 
    MyFriends[1529417]=1 -- 
    MyFriends[2000028]=1 -- 
    MyFriends[111873449]=1 -- 
    MyFriends[110005661]=1 -- 

                    `,
'AI/USER_AI/AzzyUtil.lua': `
    -------------------------------
    -- This file is part of AzzyAI 1.54
    -- If you want to use these functions in your own AI
    -- it is reccomended that you use the seperately available
    -- version, which does not utilize AAI-specific systems. 
    -- Written by Dr. Azzy of iRO Chaos
    AUVersion="Custom"
    -------------------------------




    --[[
    USAGE NOTES


    HPPercent(id)
    SPPercent(id)
    Returns the current hp or sp of id as a percentage. This only works on things which the player can see the hp/sp of, obviously.

    Closer(id,x,y)
    Returns coordinants of a location 1 cell closer to actor (id) 

    ClosestR(id1,id2,range)
    Returns coordinants of the cell within <range> cells of <id2> that is closest to <id1>.
    Intended for targeting of ranged skills.

    BetterMoveToOwner(mercid,range)
    Moves to the closest sell withing range cells of the owner. 

    IsNotKS(id)
    Returns 1 if attacking monster (id) would be a KS, 0 otherwise. 

    IsFriend(id)
    Returns 1 if (id) is the owner or a friend. 

    @@@@@@@@@@@@@@@@@@@@@@@@@
    @@@ Monster Functions @@@
    @@@@@@@@@@@@@@@@@@@@@@@@@

    GetMobCount(id,range,[id2])
    Returns the number of monsters within range cells of the actor id, and the number of said monsters which are currently targeting id. If id2 is specified, monsters which are targeting id2 will also be included in the second value returned. 
    Useful for deciding whether to use anti-mob skills.
    ex:
    local mobcount,aggrocount = GetMobCount(MyID,1,GetV(V_OWNER,MyID))

    GetBestBrandishTarget(id)
    Returns the id of the best monster adjacent to the mercenary to use brandish spear on (that is, the target that will result in the most monsters being hit). 
    Assumes level 1 brandish area. 

    ex:
    SkillObject(MyID,MySkillLevel,ML_BRANDISH,GetBestBrandishTarget(MyID))


    @@@@@@@@@@@@@@@@@@@@@@@
    @@@ Skill Functions @@@
    @@@@@@@@@@@@@@@@@@@@@@@

    GetAtkSkill(id)
    Returns a list containing skill id, skill level of the mercenary's single target offencive skill. Crash is not returned in this list, because the damage output spamming crash is lower than the damage output from using normal attacks. 

    ex: 
    local skill,level= GetAtkSkill(MyID)

    GetMobSkill(merctype)
    As GetAtkSkill() only for antimob skills

    ex
    local skill,level = GetMobSkill(MyID)

    GetQuickenSkill(id)
    Returns a list containing the ID of the weapon quicken skill posessed by the mercenary and the skill level

    ex
    local skill,level = GetQuickenSkill(MyID)

    GetGuardSkill(id)
    As GetQuickenSkill() only returns the ID of the guard or parry skill posessed by the mercenary. 

    GetSacrificeSkill(id)
    As GetQuickenSkill() only returns the ID and other perameters for the Sacrifice (aka Devotion) skill posessed by the mercenary.

    GetProvokeSkill(id)
    As GetQuiceknSkill() only returns the ID and other perameters for the Provoke skill posessed by the mercenary. 

    GetPushbackSkill(id)
    As GetMobSkill() only returns the ID and other perameters for the pushback skill (arrow repel or skid trap) posessed by the mercenary

    --]]--


    --#########################
    --### Tactics Functions ###
    --######################### 

    function 	GetTact(t,m)
        local x
        if m==nil then
            TraceAI("GetTact: Error - nil target")
            logappend("AAI_ERROR","GetTact: Error - nil target")
        end
        if t==nil then
            TraceAI("GetTact: Error - nil tactic target:"..m)
            logappend("AAI_ERROR","request for tactic type nil target:"..m)
        end
        if (IsPlayer(m)==1) then
            if (PVPmode~=0) then
                TraceAI("GetTact: Returning pvp tactic")
                return GetPVPTact(t,m)
            else
                TraceAI("GetTact: not pvp mode returning 0")
                return 0
            end
        end
        local e = 0
        if (IsHomun(MyID)==0) then 
            if (MobID[m]==nil) then
                e=GetClass(m)
            else
                e=MobID[m]
            end
        else
            e=GetV(V_HOMUNTYPE,m)
        end
        temp=GetMyTact(e)
        if (temp==nil) then
            if (e >= 1324 and e <= 1363) or (e >= 1938 and e <=1946) then
                temp=GetMyTact(13)
                TraceAI("GetTact: No tactic "..t.." for "..e.."actor: "..m.." but it's a treasure chest.")
            end
            if temp==nil then
                temp=GetMyTact(0)
                --TraceAI("GetTact: No tactic "..t.." for "..e.."actor: "..m.." using default instead")
            end
        end
        if (temp[t]==nil) then
            temp=GetMyTact(0)
            TraceAI("GetTact: Undefined tactic "..t.." for "..e.."actor: "..m.." using default instead")
        end
        x=temp[t]
        if (x==nil) then
            logappend("AAI_ERROR","Default tactic "..t.." is undefined - Please review and correct tactics file or restore default tactics file")
            return 0
        else
            if t==TACT_SP and x==-1 then
                x = AttackSkillReserveSP
            elseif t==TACT_CHASE then
                --TraceAI("TactChase called"..GetV(V_SP,MyID).." "..ChaseSPPauseSP.." "..GetTick().." "..math.max(LastMovedTime,LastSPTime).." "..(5000-ChaseSPPauseTime))
                if GetV(V_SP,MyID) < ChaseSPPauseSP and (GetTick() - math.max(LastMovedTime,LastSPTime)) > (5000-ChaseSPPauseTime) then 
                    if ((ChaseSPPause==1 and x~=CHASE_ALWAYS) or x==CHASE_CLEVER) then
                        TraceAI("Cleverchase activated: "..m.." ("..e..") ".." LastTick "..math.max(LastMovedTime,LastSPTime))
                        return 1
                    end
                end
                if x==CHASE_ALWAYS then
                    return 0
                elseif x==CHASE_NEVER then
                    return 1
                else
                    return DoNotChase
                end
            end
            return x
        end
    end

    function GetMyTact(m)
        return MyTact[m]
    end

    function	GetPVPTact(t,m)
        local x
        local class
        local e = ENEMY
        if IsMonster(m)==0 then
            TraceAI("pvp tact lookup on ally")
            e= ALLY
        end
        if (MyPVPTact[m]~=nil) then
            e = m
        elseif (MyFriends[m]~=nil) then
            e = MyFriends[m]
        end
        if IsHomun(MyID)==1 then
            class=GetV(V_HOMUNTYPE,m)
        end
        if MyPVPTact[m]~=nil then
            x=MyPVPTact[m][t]
        elseif e~=ALLY and class~=nil then 
            if MyPVPTact[class] ~=nil then
                x=MyPVPTact[class][t]
            end
        elseif MyFriends[e]==nil then
            x=MyPVPTact[e][t]
        end
        if x==nil then
            x=MyPVPTact[0][t]
        end
        if (x==nil) then
            TraceAI("ERROR: Default PVP tactic "..t.." is undefined!")
            logappend("AAI_ERROR","Default PVP tactic "..t.." is undefined! Please correct your PVP tactics file")
            return 0
        else	
        TraceAI("pvp TL on P "..m.."IsMonster "..IsMonster(m).." type "..e.." for tactic "..t.." returning "..x)
            return x
        end
    end

    function	GetClass(m)
        if (m >= MagicNumber) then
            return 10
        elseif (IsActive[m]==0 and AutoDetectPlant==1) then
            return 11
        else
            return 0
        end
    end

    function IsRescueTarget(id)
        local tactrescue=GetTact(TACT_RESCUE,id)
        local target=GetV(V_TARGET,id)
        local owner=GetV(V_OWNER,MyID)
        if target==owner then
            local hp = HPPercent(owner)
            if RescueOwnerLowHP > hp then
                TraceAI("RescueOwnerLowHP -> rescue owner from "..id)
                return 1
            elseif RescueOwnerLowHP < 0 and -1*RescueOwnerLowHP < hp then
                TraceAI("RescueOwnerLowHP -> rescue of owner canceled "..id)
                return 0
            end
        end
        if tactrescue==RESCUE_NEVER then
            return 0
        else	
            TraceAI("tactrescue not never "..tactrescue.." id "..id)
            if tactrescue==RESCUE_RETAINER then
                if MyFriends[target]==2 then
                    return 1
                end
            elseif tactrescue==RESCUE_FRIEND then
                if MyFriends[target]==1 then
                    return 1
                end
            elseif tactrescue==RESCUE_ALL then
                if IsFriendOrSelf(target)==1 and target ~=MyID then
                    return 1
                end
            elseif tactrescue==RESCUE_OWNER then
                if target==GetV(V_OWNER,MyID) then
                    return 1
                end
            elseif tactrescue==RESCUE_SELF then
                if target==MyID then
                    return 1
                end
            end
        end
        return 0
    end

    function GetTargetClass(id)
    -- 0 = no target, 1 = self 2= friend, -1 = other monster -2 = other player
        if id == MyID then
            return 1
        elseif id == 0 then
            return 0
        elseif (id >= MagicNumber2 and id <= MagicNumber3) then
            if IsFriendOrSelf(id)==1 then
                return 2
            else
                return -2
            end
        elseif IsMonster(id)==1 then
            return -1
        else
            return 0
        end
    end

    --########################
    --### Friend Functions ###
    --########################


    function IsFriend(id)
        if (id==GetV(V_OWNER,MyID)) then
            return 1
        elseif (id~= MyID) then
            friendclass=MyFriends[id]
            if (friendclass==FRIEND or friendclass==RETAINER) then
                return 1
            end
        end
        return 0
    end

    function IsPVPFriend(id)
        if (id==GetV(V_OWNER,MyID)) then
            return 1
        elseif (id~= MyID) then
            friendclass=MyFriends[id]
            if (friendclass==FRIEND or friendclass==RETAINER or friendclass==NEUTRAL or friendclass==ALLY or friendclass==NEUTRAL) then
                return 1
            end
        end
        return 0
    end

    function IsFriendOrSelf(id)
        if (id==GetV(V_OWNER,MyID) or id == MyID) then
            return 1
        else
            if (MyFriends[id]~=nil) then
                return 1	
            end
        end
        return 0
    end

    function IsPlayer(id)
        if (id>=MagicNumber2 and id <= MagicNumber3) then
            return 1
        else
            return 0
        end
    end

    function UpdateFriends() 
        FriendsFile = io.open("AI/USER_AI/A_Friends.lua", "w")
        if FriendsFile~=nil then
            FriendsFile:write (STRING_A_FRIENDS_HEAD)
            for k,v in pairs(MyFriends) do
                if (v==FRIEND or (v==PKFRIEND and PainkillerFriendsSave == 1)) then
                    FriendsFile:write ("MyFriends["..k.."]="..v.." -- \\n")
                end
            end
            FriendsFile:close()
        else
            TraceAI("Failed to open A_Friends.lua for writing!")
            logappend("AAI_ERROR","Failed to open A_Friends.lua for writing!")
        end
    end

    --########################
    --### Monster functions###
    --########################


    function GetAggroCount(target)
        local aggrocount=0
        if target ==nil then
            for k,v in pairs(Targets) do
                if v[2] > 0 then -- it's aggressive
                    distance = GetDistanceA(GetV(V_OWNER,MyID),k)
                    if (distance <= GetMoveBounds()) then
                        aggrocount=aggrocount+1*GetTact(TACT_WEIGHT,k)
                    end
                end
            end
        else
            for k,v in pairs(Targets) do
                if GetV(V_TARGET,k)==target then
                    aggrocount=aggrocount+1*GetTact(TACT_WEIGHT,k)
                end
            end
        end
        return aggrocount
    end

    function GetMobCount(skill,level,target,aggro)
        local mobcount=0
        if skill==0 or level==0 then 
            return 0
        end
        local skillaoe=SkillAOEInfo[skill][1][level]
        local x,y=GetV(V_POSITION,MyID)
        if skillaoe==nil then
            if skill == ML_BRANDISH then
                for k,v in pairs (Targets) do
                    if GetV(V_MOTION,k)~=MOTION_DEAD then
                        if (GetDistanceA(myid,k)<=1 and GetDistanceA(target,k) <=1 and (v[2]>0 or aggro~=0)) then
                            mobcount=mobcount+1*GetTact(TACT_WEIGHT,k)
                        elseif (GetDistanceA(myid,k) ==2 and GetDistance3(myid,k) < 2.5 and GetDistance3(target,k) < 2.5 and (v[2]>0 or aggro~=0)) then -- sides, 2 cells to either side of target/merc
                            mobcount=mobcount+1*GetTact(TACT_WEIGHT,k)
                        end
                    end
                end
            elseif skill== MA_SHARPSHOOTING then
                mx,my=GetV(V_POSITION,target)
                dx=math.abs(x-mx)
                dy=math.abs(y-my)
                if ((dx==0) or (dx==1 and dy>1) or (dx==2 and dy>6) or (dx==3 and dy>9) or (dx==4 and dy>11)) then 
                    if my>y then
                        mobcount=GetFASTargetCount(MyID,0,1,aggro)
                    elseif my<y then
                        mobcount=GetFASTargetCount(MyID,0,-1,aggro)
                    end
                elseif ((dy==0) or (dy==1 and dx>1) or (dy==2 and dx>6) or (dy==3 and dx>9) or (dy==4 and dx>11)) then
                    if mx>x then
                        mobcount=GetFASTargetCount(MyID,1,0,aggro)
                    elseif mx<x then
                        mobcount=GetFASTargetCount(MyID,-1,0,aggro)
                    end
                -- diagonals
                elseif mx>x then
                    if my>y then
                        mobcount=GetFASTargetCount(MyID,1,1,aggro)
                    else
                        mobcount=GetFASTargetCount(MyID,-1,1,aggro)
                    end
                elseif my>y then
                    mobcount=GetFASTargetCount(MyID,1,-1,aggro)
                else
                    mobcount=GetFASTargetCount(MyID,-1,-1,aggro)
                end
            end
        else -- we have a wellbehaved skill
            if GetSkillInfo(skill,7)==0 then
                target=MyID
            end
            range=(skillaoe-1)/2
            local logstring=""
            for k,v in pairs(Targets) do
                local tbas=GetTact(TACT_BASIC,k)
                local dist = GetDistanceAR(target,k)
                logstring=logstring.."|"..k.."v[2]"..v[2].."t"..GetV(V_TARGET,k).."m"..GetV(V_MOTION,k).."aggro"..aggro
                if dist <= range and (v[2]>0 or aggro~=0) and tbas~=0 then
                    mobcount=mobcount+1*GetTact(TACT_WEIGHT,k)
                    logstring=logstring.."add:"..GetTact(TACT_WEIGHT,k).."new:"..mobcount
                end			
            end
            logappend("AAI_MOBCOUNT","Mobcount on well-behaved skill "..FormatSkill(skill,level).." range "..range.." logstring: "..logstring.." result: "..mobcount)
        end
        return mobcount
    end

    function GetBestAoETarget(myid,skill,level)
        local mcount=0
        local result=-1
        for k,v in pairs(Targets) do
            if mcount < GetMobCount(skill,level,k,1) then
                result=k
                mcount=GetMobCount(skill,level,k,1)
            end
        end
        return result
    end

    function GetBestAoECoord(myid,skill,level)
        local mcount =0
        local resultx = -1
        local resulty = -1
        local range=GetSkillInfo(skill,2,level)
        local aoesize=(SkillAOEInfo[skill][1][level]-1)/2
        local myx
        local myy
        myx,myy=GetV(V_POSITION,myid)
        local ox,oy=GetV(V_POSITION,GetV(V_OWNER,MyID))
        grid={}
        for xx=ox-20,ox+20 do
            grid[xx]={}
            --for xx=oy-20,oy+20 do
            --	grid[xx][yy]=0
            --end
        end
        for k,v in pairs(Targets) do
            local tbas = GetTact(TACT_BASIC,k)
            x,y=GetV(V_POSITION,k)
            if x < ox+20 and x > ox-20 and y < oy+20 and y > oy-20 and tbas~=0 then 
                if grid[x][y]==nil then
                    grid[x][y]=GetTact(TACT_WEIGHT,k)
                else
                    grid[x][y]=grid[x][y]+GetTact(TACT_WEIGHT,k)
                end
            end
        end
        for xx=myx-range,myx+range do
            for yy=myy-range,myy+range do
                local thiscount=0
                for xxx=xx-aoesize,xx+aoesize do
                    if grid[xxx]~=nil then
                        for yyy=yy-aoesize,yy+aoesize do
                            if grid[xxx][yyy] ~=nil then
                                thiscount=thiscount+grid[xxx][yyy]
                            end
                        end
                    end
                end
                if thiscount>mcount then
                    mcount=thiscount
                    resultx,resulty=xx,yy
                end
            end
        end
        return resultx,resulty
    end

    function GetBestBrandishTarget(myid)
        local mobs =0
        local maxmobs = 0
        local besttarget= -1
        for k,v in pairs(Targets) do
            if (GetDistanceA(myid,k) <=1) then --Is a target in range to brandish
                mobs = 0
                for kk,vv in pairs (Targets) do
                    local tbas=GetTact(TACT_BASIC,kk)
                    if tbas ~= 0 then
                        if (GetDistanceA(myid,kk)<=1 and GetDistanceA(k,kk) <=1) then
                            mobs=mobs+1
                        elseif (GetDistanceA(myid,kk) ==2 and GetDistance3(myid,kk) < 2.5 and GetDistance3(k,kk) < 2.5)then -- sides, 2 cells to either side of target/merc
                            mobs=mobs+1
                        end
                    end
                end
                if (mobs > maxmobs) then
                    maxmobs = mobs
                    besttarget = v
                end
            end
        end
        return besttarget
    end

    function GetBestFASTarget(myid)
        local options = GetFASOptions(myid)
        local mincount=0
        local target=-1
        for x,v in pairs(options) do
            for y,v2 in pairs(v) do
                --TraceAI("GetBestFAST "..x.." "..y.." "..v2)
                if v2~=0 then
                    count=GetFASTargetCount(myid,x,y)
                    if count > mincount then
                        mincount = count
                        target = v2
                    end
                end
            end
        end
        return target,mincount			
    end

    function GetFASDirection(myid,target)
        local x,y=GetV(V_POSITION,myid)
        if GetDistanceA(myid,target) < IdleWalkDistance then
            local mx,my=GetV(V_POSITION,target)
            local dx=math.abs(x-mx)
            local dy=math.abs(y-my)
            if ((dx==0) or (dx==1 and dy>1) or (dx==2 and dy>6) or (dx==3 and dy>9) or (dx==4 and dy>11)) then 
                if my>=y then
                    return 0,1 --n
                elseif my<y then
                    return 0,-1 --s
                end
            elseif ((dy==0) or (dy==1 and dx>1) or (dy==2 and dx>6) or (dy==3 and dx>9) or (dy==4 and dx>11)) then
                if mx>x then
                    return 1,0 --e
                elseif mx<x then
                    return-1,0 --w
                end
            -- diagonals
            elseif mx>x then
                if my>=y then
                    return 1,1 --ne
                else
                    return 1,-1 --se
                end
            elseif my>=y then
                return -1,1 --nw
            else
                return -1,-1 --sw
            end
        end
    end

    function GetFASOptions(myid)
        local x,y=GetV(V_POSITION,myid)
        noption=0
        eoption=0
        soption=0
        woption=0
        neoption=0
        nwoption=0
        seoption=0
        swoption=0
        for k,v in pairs(Monsters) do
            TraceAI("FAS loop id: "..k)
            if GetDistanceA(myid,k) < IdleWalkDistance then
                mx,my=GetV(V_POSITION,k)
                dx=math.abs(x-mx)
                dy=math.abs(y-my)
                if ((dx==0) or (dx==1 and dy>1) or (dx==2 and dy>6) or (dx==3 and dy>9) or (dx==4 and dy>11)) then 
                    if my>y then
                        noption=k
                    elseif my<y then
                        soption=k
                    end
                elseif ((dy==0) or (dy==1 and dx>1) or (dy==2 and dx>6) or (dy==3 and dx>9) or (dy==4 and dx>11)) then
                    if mx>x then
                        eoption=k
                    elseif mx<x then
                        woption=k
                    end
                -- diagonals
                elseif mx>x then
                    if my>=y then
                        neoption=k
                    else
                        seoption=k
                    end
                elseif my>=y then
                    nwoption=k
                else
                    swoption=k
                end
            end
            if (noption~=0 and soption~=0 and eoption~=0 and woption~=0 and neoption~=0 and seoption~=0 and swoption~=0 and nwoption~=0) then
                TraceAI("All Options Avail - break")
                break
            end
        end
        result={[-1]={[-1]=swoption,[0]=woption,[1]=nwoption},[0]={[-1]=soption,[0]=0,[1]=noption},[1]={[-1]=seoption,[0]=eoption,[1]=neoption}}
        TraceAI("Returning FAS Options: "..swoption.."-"..woption.."-"..nwoption.." "..soption.."--"..noption.." "..seoption.."-"..eoption.."-"..neoption)
        return result
    end

    function GetFASTargetCount(myid,directionx,directiony,aggro)
        local x,y=GetV(V_POSITION,myid)
        local s=directionx+directiony
        TraceAI("GFASTC: "..s)
        count=0
        if s==1 or s==-1 then -- straight
            if directiony==0 then --Horizontal
                ymin=y-1
                ymax=y+1
                if directionx==1 then --East
                    xmin=x
                    xmax=x+IdleWalkDistance
                else
                    xmin=x-IdleWalkDistance
                    xmax=x
                end
            else	--Vertical
                xmin=x-1
                xmax=x+1
                if directiony==1 then -- north
                    ymin=y
                    ymax=y+IdleWalkDistance
                else
                    ymin=y-IdleWalkDistance
                    ymax=y
                end
            end
            for k,v in pairs(Targets) do
                mx,my=GetV(V_POSITION,k)
                --logappend("AAI_mobcount","straight monster:"..xmin.."-"..xmax..","..ymin.."-"..ymax.." "..mx..","..my)
                if GetTact(TACT_BASIC,k)~=0 and mx>=xmin and xmax>=mx and my>=ymin and ymax>=my then
                    count=count+1
                end
            end
            --logappend("AAI_mobcount","straight:"..xmin.."-"..xmax..","..ymin.."-"..ymax.." count"..count)
            return count
        else	--Diagonal
            count = 0
            for k,v in pairs(Targets) do
                if GetTact(TACT_BASIC,k)~=0 and IsNotKS(MyID,k)==1 then
                    mx,my=GetV(V_POSITION,k)
                    if directionx==1 then --east
                        if (mx+1>=x and x+IdleWalkDistance>=mx) then -- has prayer of hitting
                            if mx==x-1 then
                                if my==y+directiony then
                                    count=count+1
                                end
                            elseif mx==x then
                                if (my==y or my==y+directiony or my==y+2*directiony) then
                                    count=count+1
                                end
                            elseif mx==x+IdleWalkDistance then
                                if my==y+(IdleWalkDistance-2)*directiony then
                                    count=count+1
                                end
                            elseif mx==x+13 then
                                if (my==y+(IdleWalkDistance-3)*directiony or my==y+(IdleWalkDistance-5)*directiony or my==y+(IdleWalkDistance-4)*directiony) then
                                    count=count+1
                                end
                            else	--not a special case
                                if directiony==1 then
                                    miny=y-2+(mx-x)
                                    maxy=miny+5
                                else
                                    maxy=y+2-(mx-x)
                                    miny=maxy-5
                                end
                                if my>=miny and maxy>=my then
                                    count=count+1
                                end
                            end
                        end
                    else --west
                        if mx-1<=x and x-IdleWalkDistance<=mx then -- has prayer of hitting
                            if mx==x+1 then
                                if my==y+directiony then
                                    count=count+1
                                end
                            elseif mx==x then
                                if (my==y or my==y+directiony or my==y+2*directiony) then
                                    count=count+1
                                end
                            elseif mx==x-IdleWalkDistance then
                                if my==y+(IdleWalkDistance-3)*directiony then
                                    count=count+1
                                end
                            elseif mx==x-(IdleWalkDistance-1) then
                                if (my==y+(IdleWalkDistance-3)*directiony or my==y+10*directiony or my==y+(IdleWalkDistance-4)*directiony) then
                                    count=count+1
                                end
                            else	--not a special case
                                if directiony==1 then
                                    miny=y-2+(x-mx)
                                    maxy=miny+5
                                else
                                    maxy=y+2-(x-mx)
                                    miny=maxy-5
                                end
                                if my>=miny and maxy>=my then
                                    count=count+1
                                end
                            end
                        end
                    end
                end
            end
            --logappend("AAI_mobcount","diagonal:"..count)
        end
        return count
    end

    function IsHiddenOnScreen(myid) --Currently disabled - assume there is never hidden on screen.
        return 1
    end

    function IsHomun(myid)
        if (GetV(V_HOMUNTYPE,myid)~=nil) then
            return 1
        end
        return 0

    end

    function GetMerType(myid)
        local merctype=GetV(V_MERTYPE,myid)
        TraceAI("Merc is homun?"..IsHomun(myid))
        if (merctype~=1) then
            return merctype
        elseif merctype > 30 then
            logappend("AAI_ERROR","Invalid merctype reported"..merctype)
            return merctype
        else
            mhp=GetV(V_MAXHP,myid)
            msp=GetV(V_MAXSP,myid)
            if (mhp > 250 and mhp < 333 and msp >= 200 and 250 >= msp ) then -- it's an archer 1
                return ARCHER01
            elseif (mhp == 7513 and msp == 201) then 
                TraceAI("Newly summoned Pengineer")
                return PENGINEER
            elseif (mhp >= 4000 and 5000 >= mhp and msp >= 50 and msp < 65 ) then -- looks like a kitty!
                TraceAI("Wild Rose")
                return WILDROSE
            elseif (mhp >= 7513 and 8500 >= mhp and msp >= 201 and msp < 250 ) then 
                TraceAI("Pengineer")
                return PENGINEER
            elseif (mhp >= 7200 and 7512 >= mhp and msp >= 200 and msp < 250 ) then -- looks like a dopple!
                TraceAI("Dopple Merc")
                return DOPPLEMERC
            elseif (mhp >= 10000 and 13000 >= mhp and msp >= 220 and msp < 300 ) then -- looks like alice!
                TraceAI("Alice")
                return ALICE
            elseif	(mhp >= 6100 and 7200 >= mhp and msp >= 180 and msp < 250 ) then -- looks like a mimic!
                TraceAI("Mimic")
                return MIMIC
            elseif (mhp >= 7500 and 9500 >= mhp and msp >= 180 and msp < 220 ) then -- looks like a disguise!
                TraceAI("Disguise")
                return DISGUISE
            elseif (mhp >= 7000 and 8500 >= mhp and msp >= 250 and msp < 320 ) then -- looks like a male GM mercenary!
                TraceAI("GM Mercenary")
                return GMMALE
            elseif (mhp > 12300 and 14500 >= mhp and msp >= 450 and msp < 600 ) then -- Nice stats, must be one of them overpowerd isis mercs
                TraceAI("ISIS Mercenary")
                return ISIS
            else
                TraceAI("Unknown merc type. Contact the developer ASAP.") 
                return UNKNOWNMER
            end
        end
    end

    function IsNotKS(myid,target)
        --TraceAI("Checking for KS:"..target)
        local targettarget=GetV(V_TARGET,target)
        local motion=GetV(V_MOTION,target)
        local tactks=GetTact(TACT_KS,target)
        if (target==MyEnemy and BypassKSProtect==1) then --If owner has told homun to attack explicity, let it.
            return 1
        end
        if target==nil then
            TraceAI("IsNotKS")
        end
        if (IsPlayer(target)==1) then
            --TraceAI("PVP - not KS")
            return 1
        elseif (IsFriend(targettarget)==1 or targettarget==myid) then
            --TraceAI("Not KS - "..target.." fighting friend: "..targettarget)
            return 1
        elseif ((tactks==KS_POLITE or DoNotAttackMoving ==1) and motion==MOTION_MOVE) then
            return 0
        elseif (tactks==KS_ALWAYS) then
            --TraceAI("It's an FFA monster, not a KS")
            return 1
        elseif targettarget > 0 and IsMonster(targettarget)~=1 and Actors[targettarget]==1 then
            --TraceAI("Is KS - "..target.." attacking player "..targettarget.." motion "..motion)
            return 0
        else
            --TraceAI("Not Targeted - seeing if anyone is targeting it")
            local actors = GetActors()
            for i,v in ipairs(actors) do
                if (IsMonster(v)~=1 and IsFriendOrSelf(v)==0) then
                    if (GetV(V_TARGET,v) == target and (v > 100000 or KSMercHomun ~=1)) then
                        --TraceAI("Is KS - "..target.." is targeted by "..v)
                        return 0
                    end
                end
            end
        --TraceAI("Not KS - "..target.." is not targeted by any other player.")
        return 1
        end
    end
    function GetKSReason(myid,target)
        --TraceAI("Checking for KS:"..target)
        local targettarget=GetV(V_TARGET,target)
        local motion=GetV(V_MOTION,target)
        local tactks=GetTact(TACT_KS,target)
        if (target==MyEnemy and BypassKSProtect==1) then --If owner has told homun to attack explicity, let it.
            return "KS Protect bypassed"
        end
        if target==nil then
            TraceAI("IsNotKS")
        end
        if (IsPlayer(target)==1) then
            --TraceAI("PVP - not KS")
            return "PVP, not KS"
        elseif ((tactks==KS_POLITE or DoNotAttackMoving ==1) and motion==MOTION_MOVE) then
            return "KS polite aka DoNotAttackMoving"
        elseif (IsFriend(targettarget)==1 or targettarget==myid) then
            --TraceAI("Not KS - "..target.." fighting friend: "..targettarget)
            return "Not KS - enemy attacking "..targettarget
        elseif (tactks==KS_ALWAYS) then
            --TraceAI("It's an FFA monster, not a KS")
            return "FFA monster"
        elseif targettarget > 0 and IsMonster(targettarget)~=1 and Actors[targettarget]==1 then
            --TraceAI("Is KS - "..target.." attacking player "..targettarget.." motion "..motion)
            if MyFriends[targettarget]~=nil then
                return "KS - enemy is attacking "..targettarget.." MyFriends: "..MyFriends[targettarget]
            else
                return "KS - enemy is attacking "..targettarget
            end
        else
            --TraceAI("Not Targeted - seeing if anyone is targeting it")
            local actors = GetActors()
            for i,v in ipairs(actors) do
                if (IsMonster(v)~=1 and IsFriendOrSelf(v)==0) then
                    if (GetV(V_TARGET,v) == target and (v > 100000 or KSMercHomun ~=1)) then
                        --TraceAI("Is KS - "..target.." is targeted by "..v)
                        if MyFriends[v]~=nil then
                            return "KS - enemy attacked by "..v.." MyFriends: "..MyFriends[v]
                        else
                            return "KS - enemy attacked by "..v
                        end
                    end
                end
            end
        --TraceAI("Not KS - "..target.." is not targeted by any other player.")
        return "not KS, not targeted by anything"
        end
    end
    --########################
    --### HP/SP % functions###
    --########################

    function HPPercent(id)
        return (100*GetV(V_HP,id)/GetV(V_MAXHP,id))
    end

    function SPPercent(id)
        return (100*GetV(V_SP,id)/GetV(V_MAXSP,id))
    end

    --########################
    --### Spacial functions###
    --########################
    OldMove=Move

    function Move(myid,x,y)
        local ox,oy = GetV(V_POSITION,myid)
        local dis = GetDistance(ox,oy,x,y)
        local dis2owner=GetDistanceAPR(GetV(V_OWNER,myid),x,y)
        local newx,newy=x,y
        if dis2owner > IdleWalkDistance then 
            logappend("AAI_ERROR","Attempt to move to location "..x..","..y.." which is "..dis2owner.." cells from owner, call disregarded")
            return 
        elseif dis > IdleWalkDistance then
            factor = IdleWalkDistance/dis
            local dx,dy = x-ox,y-oy
            if math.random(2)==1 then
                dx=math.ceil(factor*dx)
            else 
                dx=math.floor(factor*dx)
            end
            if math.random(2)==1 then
                dy=math.ceil(factor*dy)
            else 
                dy=math.floor(factor*dy)
            end
            if x==MyDestX and y==MyDestY then
                newx=ox+dx
                newy=oy+dy
                MyDestX,MyDestY=newx,newy
                TraceAI("MOVE: Attempt to move more than IdleWalkDistance cells, destination + MyDest adjusted: "..x..","..y.." "..dis.." "..factor.."new: "..newx..","..newy)
            else
                newx=ox+dx
                newy=oy+dy
                TraceAI("MOVE: Attempt to move more than IdleWalkDistance cells, destination adjusted: "..x..","..y..dis.." "..factor.."new: "..newx..","..newy)
            end
        end
        return OldMove(myid,newx,newy)
    end
    OldSkillObject=SkillObject
    function SkillObject(myid,lvl,skill,target)
        if skill==8041 or skill==8043 or skill==8020 or skill==8025 then
            logappend("AAI_ERROR","Attempted to use skill "..SkillInfo[skill][1].." improperly. Check for corrupt H_SkillInfo or badly behaved addon")
        else
            return OldSkillObject(myid,lvl,skill,target)
        end
    end

    OldAttack=Attack
    function Attack(myid,target)
        if SuperPassive==1 then
            TraceAI("Notice: Attack() called while in SuperPassive. MyEnemy "..MyEnemy.." MyState "..MyState)
        end
        OldAttack(myid,target)
    end

    function	GetDistance (x1,y1,x2,y2)
        return math.floor(math.sqrt((x1-x2)^2+(y1-y2)^2))
    end

    function	GetDistance2 (id1, id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return -1
        end
        return GetDistance (x1,y1,x2,y2)
    end


    function	GetDistanceA (id1, id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return GetDistance (x1,y1,x2,y2)
    end

    function	GetDistanceAP (id1, x2,y2)
        local x1, y1 = GetV (V_POSITION,id1)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return GetDistance (x1,y1,x2,y2)
    end

    function	GetDistanceAPR (id1, x2,y2)
        local x1, y1 = GetV (V_POSITION,id1)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        local x=x1-x2
        local y=y1-y2
        return math.max(math.abs(x),math.abs(y))
    end

    function GetDistanceRect(id1,id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        local x=x1-x2
        local y=y1-y2
        return math.max(math.abs(x),math.abs(y))
    end

    function GetDistance3(id1,id2) 
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return -1
        end
        return math.sqrt((x1-x2)^2+(y1-y2)^2)
    end

    function GetAggroDist()
        if OwnerPosX[10]==OwnerPosX[1] and OwnerPosY[10]==OwnerPosY[1] then
            return StationaryAggroDist
        else
            return MobileAggroDist
        end
    end

    function GetMoveBounds()
        if OwnerPosX[10]==OwnerPosX[1] and OwnerPosY[10]==OwnerPosY[1] then
            return StationaryMoveBounds
        else
            return MobileMoveBounds
        end
    end
    function IsToRight(id1,id2)
        local x1,y1=GetV(V_POSITION,id1)
        local x2,y2=GetV(V_POSITION,id2)
        if (x1+1==x2 and y1==y2) then
            return 1
        else
            return 0
        end
    end

    function	GetDistanceP (x1,y1,x2,y2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return math.floor(math.sqrt((x1-x2)^2+(y1-y2)^2))
    end

    function	GetDistanceA (id1, id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return GetDistance (x1,y1,x2,y2)
    end

    function	GetDistanceAP (id1, x2,y2)
        local x1, y1 = GetV (V_POSITION,id1)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return GetDistance (x1,y1,x2,y2)
    end

    function	GetDistancePR (x1,y1,x2,y2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return math.max(math.abs(x1-x2),math.abs(y1-y2))
    end

    function GetDistanceAR(id1,id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return math.max(math.abs(x1-x2),math.abs(y1-y2))
    end

    function	GetDistanceAPR (id1, x2,y2)
        local x1, y1 = GetV (V_POSITION,id1)
        if (x1 == -1 or x2 == -1) then
            return 999
        end
        return math.max(math.abs(x1-x2),math.abs(y1-y2))
    end

    function BetterMoveToOwner(myid, range)
        range = range or 1  -- Set default range to 1 if nil
        local x, y = GetV(V_POSITION, myid)
        local ox, oy = GetV(V_POSITION, GetV(V_OWNER, myid))

        -- Calculate destination coordinates using math functions for brevity
        MyDestX = math.max(ox - range, math.min(x, ox + range))
        MyDestY = math.max(oy - range, math.min(y, oy + range))

        -- Set destination and move
        Move(myid, MyDestX, MyDestY)
    end

    function BetterMoveToOwnerXY(myid, range)
        range = range or 1  -- Default range to 1 if nil
        local x, y = GetV(V_POSITION, myid)
        local ox, oy = GetV(V_POSITION, GetV(V_OWNER, myid))

        -- Calculate destination coordinates using math functions
        MyDestX = math.max(ox - range, math.min(x, ox + range))
        MyDestY = math.max(oy - range, math.min(y, oy + range))
        return MyDestX, MyDestY
    end

    function BetterMoveToLoc(myid, range, ox, oy)
        range = range or 1  -- Default range to 1 if nil
        local x, y = GetV(V_POSITION, myid)

        -- Calculate destination coordinates using math functions
        MyDestX = math.max(ox - range, math.min(x, ox + range))
        MyDestY = math.max(oy - range, math.min(y, oy + range))

        -- Move to the calculated destination
        Move(myid,MyDestX,MyDestY)
        return
    end

    function BetterMoveToLocXY(myid, range, ox, oy)
        range = range or 1  -- Set default range if nil
        local x, y = GetV(V_POSITION, myid)

        -- Use math logic to calculate destination coordinates
        MyDestX = math.max(ox - range, math.min(x, ox + range))
        MyDestY = math.max(oy - range, math.min(y, oy + range))

        return MyDestX, MyDestY
    end

    function	GetOwnerPosition (id)
        return GetV (V_POSITION,GetV(V_OWNER,id))
    end

    function	GetDistanceFromOwner (id)
        local x1, y1 = GetOwnerPosition (id)
        local x2, y2 = GetV (V_POSITION,id)
        if (x1 == -1 or x2 == -1) then
            return -1
        end
        return GetDistance (x1,y1,x2,y2)
    end

    function	IsOutOfSight (id1,id2)
        local x1,y1 = GetV (V_POSITION,id1)
        local x2,y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1 or id1==-1 or id2==-1) then
            return true
        end
        local d = GetDistancePR(x1,y1,x2,y2)
        if d > IdleWalkDistance then
            return true
        else
            return false
        end
    end


    function	IsInAttackSight (myid,target,skill,level)
        if (skill==nil) then
            skill=MySkill
            level=MySkillLevel
        elseif (level==nil) then
            logappend("AAI_ERROR","IsInAttackSight called with nil level but skill is not nil. State:"..MyState.." skill "..skill)
        end
        local x1,y1 = GetV (V_POSITION,myid)
        local x2,y2 = GetV (V_POSITION,target)
        if (x1 == -1 or x2 == -1) then
            return false
        end
        local d	= GetDistance (x1,y1,x2,y2)
        local a = AttackRange(myid,skill,level)
        if a >= d then
            return true;
        else
            return false;
        end
    end



    function AttackRange(myid,skill,level)
        if (skill==nil or level== nil) then
            if skill==nil or level==nil then
                logappend("AAI_ERROR","AttackRange called with invalid arguments State:"..MyState.." MySkill "..MySkill.." MySkillLevel"..MySkillLevel.." skill: "..formatval(skill).." level: "..formatval(level))
            end
            skill=MySkill
            level=MySkillLevel
        end
        local a     = 0
        if (skill == 0) then
            mertype=GetMerType(myid)
            if (mertype==nil) then
                mertype=-1
            end
            if (mertype == -1) then
                a     = 1
            elseif (mertype > 10 and mertype < 21) then
                a     = 2 --spear mercenary
            else
                a     = GetV(V_ATTACKRANGE,myid)
            end
        --elseif (skill==MS_BOWLINGBASH) then
        --	a	= 1
        else
            a = GetSkillInfo(skill,2,level)
            if a==nil then
                TraceAI("AttackRange() cannot get range for skill "..formatval(skill).." level "..formatval(level))
            end
        end
        if level == nil then
            logappend("AAI_ERROR","AttackRange called with nil level, skill = "..skill.." "..MyState)
        end
        TraceAI("Attack Sight - skill:"..skill.."level: "..level.." Range:"..a) 
        return a
    end

    function Closer(id, ox, oy)
        local x, y = GetV(V_POSITION, id)

        -- Determine new x and y positions in one line using math logic
        local newx = ox + (x < ox and -1 or (x > ox and 1 or 0))
        local newy = oy + (y < oy and -1 or (y > oy and 1 or 0))

        return newx, newy
    end

    function GetStandPoint(myid,target,skill,level,alt)
        local r=AttackRange(myid,skill,level)
        if GetDistanceA(myid,target) <= r then
            logappend("AAI_ERROR","GetStandPoint called while within range")
            return GetV(V_POSITION,MyID)
        end
        local tx,ty=GetV(V_POSITION,target)
        local x,y=-1,-1
        if _VERSION=="Lua 5.1" and myid==MyID and (alt==nil or alt==0) then
            x,y=GetV(V_POSITION_APPLY_SKILLATTACKRANGE,target,skill,level)
        end
        if skill==0 or skill==nil or (tx==x and ty==y) or (tx < 1 or ty < 1) or math.floor(GetDistanceAP(target,x,y)) > r then -- Use normal closest call, since V_POSITION_APPLY_SKILLATTACKRANGE doesn't work for non-skills, or has given us clearly bogus standpoint for skill.
            x,y=Closest(myid,tx,ty,r,alt)
        end
        return AdjustStandPoint(x,y,tx,ty,r,alt)
    end

    function AdjustStandPoint (x,y,tx,ty,r,alt)
        if _VERSION=="Lua 5.1" then
            -- Now we need to make sure x and y are not on occupied cells, because of the changes to the client
            local i=0
            while TakenCells[x.."_"..y] do
                i=i+1
                if range==1 then
                    if alt==nil or alt==0 then
                        x,y=AdjustCW(x,y,tx,ty)
                    elseif alt==1 then
                        x,y=AdjustCCW(x,y,tx,ty)
                    else --alt=2
                        x,y=AdjustOpp(x,y,tx,ty)
                        alt=0
                    end
                    if i > 7 then
                        x,y=-1,-1
                        break
                    end
                else
                    if alt==nil or alt==0 then
                        x,y=AdjustCWr(x,y,tx,ty,r)
                    elseif alt==1 then
                        x,y=AdjustCCWr(x,y,tx,ty,r)
                    else --alt=2
                        x,y=x*-1,y*-1
                        alt=0
                    end
                    if i > 7 then
                        x,y=-1,-1
                        break
                    end
                end
            end
        end
        return x,y
    end

    function Closest(myid,ox,oy,range,alt)
        local x,y=GetV(V_POSITION,myid)
        local dx,dy=ox-x,oy-y
        local newx,newy=0,0
        local logstring="x,y"..x..","..y.." ox,oy"..ox..","..oy
        if range > 1 then
            logstring=logstring.."range > 1 "
            dist=math.sqrt(dx^2+dy^2)
            if (dist < range) then
                newx,newy=x,y
                logstring=logstring.."dist < range new"..newx..","..newy.." "
            else
                factor=range/dist
                xoff=(dx-absceil(dx*factor))
                yoff=(dy-absceil(dy*factor))
                newx,newy=x+xoff,y+yoff
                logstring=logstring.."dist > range new" ..newx..","..newy.." factor:"..factor.." "
            end
            -- This routine tries to find an adjacent cell to the closest cell that will be close enough - to address unwalkable cells near where retainer wants to walk (think: pebbles in thors)
            
            if (alt ~= nil) then
                logstring=logstring.."alt not nil"..alt.." "
                if (alt==1) then
                    if (x > ox) then
                        newx=newx-1
                    elseif (x < ox) then
                        newx=newx+1
                    else
                        alt=2
                    end
                end
                if (alt==2) then
                    if (y > oy) then
                        newy=newy-1
                    elseif (y < oy) then
                        newy=newy+1
                    else
                        alt=3
                    end
                end
            
                --if (alt==4) then -- This seems to cause more problems than it solves, set to 4 to prevent from running
                --	if (x > ox) then
                --		newx=newx-1
                --		newy=newy+1
                --	elseif (x < ox) then
                --		newx=newx+1
                --		newy=newy+1
                --	elseif (y > oy) then
                --		newy=newy-1
                --		newx=newx+1
                --	else 	
                --		newy=newy+1
                --		newx=newx+1
                --	end
                --end
                logstring=logstring.."end of alt sequence new"..newx..","..newy.." alt "..alt.." "
            end
            --xxx,yyy=GetV(V_POSITION,target)
            --TraceAI("alt is: "..GetDistance(xxx,yyy,newx,newy).." "..xxx..","..yyy.." "..newx..","..newy.."MyPos: "..x..","..y) 	
        else -- simplified, better closest point for melee. 
            logstring=logstring.."range = 1 d"..dx..","..dy.." o"..ox..","..oy.." "
            if dx > 0 then
                newx=ox-1
            elseif dx < 0 then
                newx=ox+1
            else -- dx = 0
                newx=x
            end
            if dy > 0 then
                newy=oy-1
            elseif dy < 0 then
                newy=oy+1
            else -- dy = 0
                newy=y
            end
            logstring=logstring.."new"..newx..","..newy.." "
            if alt~=nil then
                if alt==1 then
                    newx,newy=AdjustCW(newx,newy,ox,oy)
                    logstring=logstring.."adjust cw"..newx..","..newy.." "
                else
                    newx,newy=AdjustCCW(newx,newy,ox,oy)
                    logstring=logstring.."adjust ccw"..newx..","..newy.." "
                end
            end
        end
        local logalt="nil"
        if alt~=nil then
            logalt=alt
        end
        if newx<=0 or newy<=0 then 
            logappend("AAI_ERROR","Closest() Failure!"..newx.." , "..newy.." alt ="..logalt.." logstring="..logstring)
        end
        logappend("AAI_CLOSEST","Closest() returned "..newx.." , "..newy.." alt ="..logalt.." logstring="..logstring)
        return newx,newy
    end

    function AdjustCW(x,y,ox,oy)
        local newx,newy,dy,dx
        if x==ox then
            if y==oy then --stacked!? Unstack!
                newx,newy=ox+1,oy
            else
                dy=y-oy
                newx=x+absunit(dy)
                newy=y
            end
        elseif y==oy then
            dx=x-ox
            newy=y-absunit(dx)
            newx=x
        elseif y>oy then
            if x>ox then
                newy=y-1
                newx=x
            else
                newy=y
                newx=x+1
            end
        else -- y<oy
            if x>ox then
                newx=x-1
                newy=y
            else
                newx=x
                newy=y+1
            end
        end
        return newx,newy
    end
    function AdjustCCW(x,y,ox,oy)
        local newx,newy,dx,dy
        if x==ox then
            if y==oy then --stacked!? Unstack!
                newx,newy=ox-1,oy
            else
                dy=y-oy
                newx=x-absunit(dy)
                newy=y
            end
        elseif y==oy then
            dx=x-ox
            newy=y+absunit(dx)
            newx=x
        elseif y>oy then
            if x>ox then
                newy=y
                newx=x-1
            else
                newy=y-1
                newx=x
            end
        else -- y<oy
            if x>ox then
                newx=x
                newy=y+1
            else
                newx=x+1
                newy=y
            end
        end
        return newx,newy
    end

    function AdjustCWr(x,y,ox,oy,r)
        if r==1 then
            return AdjustCW(x,y,ox,oy)
        end
        local newx,newy,dy,dx
        dx,dy=x-ox,y-oy
        if math.abs(dx) == math.abs(dy)  then --we're on a diagonal, this could be a problem, so let's get off it!
            if dx < 0 then
                if dy < 0 then
                    newx=x+1
                    newy=y
                else
                    newx=x
                    newy=y-1
                end
            elseif dx > 0 then
                if dy < 0 then
                    newy=y+1
                    newx=x
                else
                    newx=x-1
                    newy=y
                end
            else --stacked, which should NEVER HAPPEN but has somehow happened anyway
                newx=x+1
                newy=y+1
                logappend("AAI_ERROR","AdjustCWr called with x,y=ox,oy - this can't happen!")
            end
        else
            if math.abs(dx) < math.abs(dy) then --north or south quadrant
                if dy < 0 then -- south quadrant
                    newx=x+1
                    newy=y+1
                else --north
                    newx=x-1
                    newy=y-1
                end
            else --east or west quadrant
                if dx < 0 then --west
                    newy=y-1
                    newx=x+1
                else
                    newx=x-1
                    newy=y+1
                end
            end
        end

        if (newx-ox==0 and math.abs(newy-oy)==1) or (newy-oy==0 and math.abs(newx-ox)==1) then
            newx,newy=newx*2,newy*2
        end
        return newx,newy
    end

    function AdjustCCWr(x,y,ox,oy,r)
        if r==1 then
            return AdjustCCW(x,y,ox,oy)
        end
        local newx,newy,dy,dx
        dx,dy=x-ox,y-oy
        if math.abs(dx) == math.abs(dy)  then --we're on a diagonal, this could be a problem, so let's get off it!
            if dx < 0 then
                if dy < 0 then
                    newx=x
                    newy=y+1
                else
                    newx=x+1
                    newy=y
                end
            elseif dx > 0 then
                if dy < 0 then
                    newy=y
                    newx=x-1
                else
                    newx=x
                    newy=y-1
                end
            else --stacked, which should NEVER HAPPEN but has somehow happened anyway
                newx=x-1
                newy=y-1
                logappend("AAI_ERROR","AdjustCWr called with x,y=ox,oy - this can't happen!")
            end
        else
            if math.abs(dx) < math.abs(dy) then --north or south quadrant
                if dy < 0 then -- south quadrant
                    newx=x-1
                    newy=y+1
                else --north
                    newx=x+1
                    newy=y-1
                end
            else --east or west quadrant
                if dx < 0 then --west
                    newy=y+1
                    newx=x+1
                else
                    newx=x-1
                    newy=y-1
                end
            end
        end
        if (newx-ox==0 and math.abs(newy-oy)==1) or (newy-oy==0 and math.abs(newx-ox)==1) then
            newx,newy=newx*2,newy*2
        end
        return newx,newy
    end

    function AdjustOpp(x,y,ox,oy)
        dx=ox-x
        dy=oy-y
        return x+2*dx,y+2*dy
    end
    function ClosestR(myid,target,range,alt)
        local ox,oy=GetV(V_POSITION,target)
        return Closest(myid,ox,oy,range,alt)
    end

    --###############################   ##   ##
    --### LUA 5.1 feature support ###   ##   ##
    --###############################   ##   ##


    function DiagonalDist(distance)
        return math.floor(math.sqrt(distance*distance))
    end

    function GetDanceCell(x,y,enemy)
        local enemyx,enemyy=GetV(V_POSITION,enemy)
        if IsInAttackSight(MyID,enemy) == false then --Why is this being called?! 
            logappend("AAI_ERROR","GetDanceCell() called when enemy out of range!" )
            x,y=Closest(MyID,enemyx,enemyy,1)
            return x,y
        end
        t = math.random(2)
        if t == 1 then
            return AdjustCW(x,y,enemyx,enemyy)
        elseif t == 2 then
            return AdjustCCW(x,y,enemyx,enemyy)
        else 
            return AdjustOpp(x,y,enemyx,enemyy)
        end
    end

    --[[ --disabled for a simpler dance alog, because you can't dance any ranged attacks at the moment, so optimize for range=1

    function GetDanceCell(x,y,enemy)
        distance = GetDistance2(MyID,enemy)
        ex,ey=GetV(V_POSITION,enemy)
        s=(((math.random(2)-1)*2)-1)
        t=(((math.random(2)-1)*2)-1)
        if (GetDistance(x-s,y+t,ex,ey) == distance) then
            return x-s,y+t
        elseif (GetDistance(x,y+t,ex,ey) == distance) then
            return x,y+t
        elseif (GetDistance(x+s,y+t,ex,ey) == distance) then
            return x+s,y+t
        elseif (GetDistance(x-s,y,ex,ey) == distance) then
            return x-s,y
        elseif (GetDistance(x+s,y,ex,ey) == distance) then
            return x+s,y
        elseif (GetDistance(x-s,y-t,ex,ey) == distance) then
            return x-s,y-t
        elseif (GetDistance(x,y-t,ex,ey) == distance) then
            return x,y-t
        else
            return x+s,y-t
        end
        
    end
    ]]--]]
    --#########################
    --### GetSkill functions###
    --#########################

    function GetSAtkSkill(myid)
        local skill = 0
        local level = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype > 47 then -- it's a Homun S
                if htype == ELEANOR then
                    if ComboMFTimeout > GetTick() and ComboCBCTimeout < GetTick() and EleanorDoNotSwitchMode==0 then
                        DoSkill(MH_STYLE_CHANGE,1,MyID,8)
                        EleanorMode = EleanorMode == 0 and 1 or 0
                    end
                end
                if htype==EIRA and UseEiraEraseCutter==1 then
                    skill=MH_ERASER_CUTTER
                    if EiraEraseCutterLevel==nil then
                        level=SkillList[htype][skill]
                    else
                        level=EiraEraseCutterLevel
                    end
                elseif htype==BAYERI and UseBayeriStahlHorn==1 then
                    skill=MH_STAHL_HORN
                    if BayeriStahlHornLevel==nil then
                        level=SkillList[htype][skill]
                    else
                        level=BayeriStahlHornLevel
                    end
                elseif htype==SERA and UseSeraParalyze==1 then
                    skill=MH_NEEDLE_OF_PARALYZE
                    if SeraParalyzeLevel==nil then
                        level=SkillList[htype][skill]
                    else
                        level=SeraParalyzeLevel
                    end
                elseif htype==ELEANOR and UseEleanorSonicClaw==1 and EleanorMode == 0 and MySpheres > AutoComboSpheres and ComboSCTimeout < GetTick() then
                    skill=MH_SONIC_CRAW
                    if EleanorSonicClawLevel==nil then
                        level=5
                    else
                        level=EleanorSonicClawLevel
                    end
                elseif htype==ELEANOR and UseEleanorTinderBreaker==1 and EleanorMode == 1 and MySpheres > AutoComboSpheres and ComboTBTimeout < GetTick() then
                    skill=MH_TINDER_BREAKER
                    if EleanorTinderBreakerLevel==nil then
                        level=10
                    else
                        level=EleanorTinderBreakerLevel
                    end			
                elseif htype == ELEANOR and EleanorUseFighterRises ==1 and MySpheres < AutoComboSpheres and GetV(V_SP,MyID)-MyLastSP > 1000 then
                    MySpheres = 5
                    skill=MH_THE_ONE_FIGHTER_RISES
                    if EleanorFighterRisesLevel==nil then
                        level=10
                    else
                        level=EleanorFighterRisesLevel
                    end
                elseif htype == ELEANOR and EleanorUseBlazingFurious ==1 then
                    skill=MH_BLAZING_AND_FURIOUS
                    if EleanorBlazingFuriousLevel==nil then
                        level=10
                    else
                        level=EleanorBlazingFuriousLevel
                    end									
                end
            end
        end
        return skill,level
    end

    function GetComboSkill(myid)
        local skill = 0
        local level = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype==ELEANOR then
                if EleanorMode==0 or EleanorDoNotSwitchMode==1 and MySpheres > AutoComboSpheres then			
                    if ComboSCTimeout > GetTick() and ComboSVTimeout < GetTick() then
                        skill=MH_SILVERVEIN_RUSH
                        if EleanorSilverveinLevel==nil then
                            level=10
                        else
                            level=EleanorSilverveinLevel
                        end
                    elseif ComboSVTimeout > GetTick() and ComboMFTimeout < GetTick() then
                        skill=MH_MIDNIGHT_FRENZY
                        if EleanorMidnightLevel==nil then
                            level=10
                        else
                            level=EleanorMidnightLevel
                        end
                    end
                end
            end
        end
        return skill,level
    end

    function GetGrappleSkill(myid)
        local skill = 0
        local level = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype==ELEANOR and MySpheres > AutoComboSpheres then
                if EleanorMode==1 or EleanorDoNotSwitchMode==1 then
                    if ComboTBTimeout > GetTick() then
                            skill=MH_CBC
                            if EleanorCBCLevel==nil then
                                level=5
                            else
                                level=EleanorCBCLevel
                            end
                    elseif ComboCBCTimeout > GetTick() then
                            skill=MH_EQC
                            if EleanorEQCLevel==nil then
                                level=5
                            else
                                level=EleanorEQCLevel
                            end
                    end
                end
            end
        end
        return skill,level
    end

    function GetAtkSkill(myid)
        local skill = 0
        local level = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype < 17 then
                homuntype=modulo(GetV(V_HOMUNTYPE,myid),4)
            else
                homuntype=modulo(OldHomunType,4)
            end
            if (homuntype==0) then -- It's a vani!
                skill=HVAN_CAPRICE
                if GetTick() < AutoSkillCooldown[skill] then
                    level=0
                    skill=0
                elseif (VanCapriceLevel==nil) then
                    level=5
                else
                    level=VanCapriceLevel
                end
            elseif	(homuntype==3) then -- It's a filer!
                skill=HFLI_MOON
                if GetTick() < AutoSkillCooldown[skill] then
                    level=0
                    skill=0
                elseif (FilerMoonlightLevel==nil) then
                    level=5
                else
                    level=FilerMoonlightLevel
                end
            end		
            if level ~=0 then
                return skill,level
            end
        else
            for i,v in ipairs(AtkSkillList) do
                level = SkillList[MercType][v]
                if level ~= nil then
                    skill=v
                    return skill,level
                end
            end
        end
        return 0,0
    end

    function GetPushbackSkill(myid)
        if (IsHomun(myid)==1) then
            return 0,0
        else
            for i,v in ipairs(PushSkillList) do
                level = SkillList[MercType][v]
                if level ~= nil then
                    skill=v
                    return skill,level
                end
            end
        end
        return 0,0
    end


    function GetDebuffSkill(myid)
        if (IsHomun(myid)==1) then
            if GetV(V_HOMUNTYPE,MyID)==EIRA and UseEiraSilentBreeze==1 then
                skill=MH_SILENT_BREEZE
                if EiraSilentBreezeLevel==nil then
                    level=5
                else
                    level=EiraSilentBreezeLevel
                end
                return skill,level
            end
        else
            for i,v in ipairs(DebuffSkillList) do
                level = SkillList[MercType][v]
                if level ~= nil then
                    skill=v
                    return skill,level
                end
            end
        end
        return 0,0
    end

    function GetMinionSkill(myid)
        local level,skill=0,0
        if (IsHomun(myid)==1) then
            if GetV(V_HOMUNTYPE,MyID)==SERA and UseSeraCallLegion==1 then
                skill=MH_SUMMON_LEGION
                TraceAI("GetMinionSkill"..skill)
                if SeraCallLegionLevel == nil then
                    level=5
                elseif SeraCallLegionLevel < 1 then
                    skill,level=0,0
                elseif SeraCallLegionLevel > 5 then
                    level=5
                else
                    level=SeraCallLegionLevel
                end
                TraceAI("GetMinionSkill "..skill..level)
                if AutoSkillCooldown[skill]~=nil then
                    if GetTick() < AutoSkillCooldown[skill] then -- in cooldown
                        level=0
                        skill=0
                    end
                end
                return skill,level
            end
        end
        return 0,0
    end

    function GetProvokeSkill(myid)
        if (IsHomun(myid)==1) then
            return 0,0
        else
            level=SkillList[MercType][MER_PROVOKE]
            if level ~=nil then
                return MER_PROVOKE,level
            end
        end
        return 0,0
    end

    function GetSacrificeSkill(myid)
        level=SkillList[MercType][ML_DEVOTION]
        if level ~=nil then
            return ML_DEVOTION,level
        end
        return 0,0
    end

    function GetMobSkill(myid)
        local skill = 0
        local level = 0
        if (IsHomun(myid)==1) then
        
            htype=GetV(V_HOMUNTYPE,MyID)
            if htype <17 then
                skill=0
            else -- it's a homun s
                if htype==EIRA and UseEiraXenoSlasher==1 then
                    skill=MH_XENO_SLASHER
                    if EiraXenoSlasherLevel==nil then
                        level=10
                    else
                        level=EiraXenoSlasherLevel
                    end
                elseif htype==BAYERI and UseBayeriHailegeStar==1 then
                    skill=MH_HEILIGE_STANGE
                    if BayeriHailegeStarLevel==nil then
                        level=5
                    else
                        level=BayeriHailegeStarLevel
                    end
                elseif htype==SERA and UseSeraPoisonMist==1 and PoisonMistMode==0 then
                    skill=MH_POISON_MIST
                    if SeraPoisonMistLevel==nil then
                        level=5
                    else
                        level=SeraPoisonMistLevel
                    end
                elseif htype==DIETER and UseDieterLavaSlide==1 and LavaSlideMode==0 then
                    skill=MH_LAVA_SLIDE
                    if DieterLavaSlideLevel==nil then
                        level=5
                    else
                        level=DieterLavaSlideLevel
                    end
                end 
                if AutoSkillCooldown[skill]~=nil then
                    if GetTick() < AutoSkillCooldown[skill] then -- in cooldown
                        level=0
                        skill=0
                    end
                end
            end
            return skill,level
        else -- SO MUCH EASIER WHEN LEVEL ISN'T SELECTABLE!!!!
            for i,v in ipairs(MobSkillList) do
                level = SkillList[MercType][v]
                if level ~= nil then
                    skill=v
                    return skill,level
                end
            end
        end
        return 0,0
    end


    function	GetQuickenSkill(myid)
        local level = 0
        local skill = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype < 17 then
                homuntype=modulo(GetV(V_HOMUNTYPE,myid),4)
            else
                homuntype=modulo(OldHomunType,4)
            end
            if (homuntype==1) then -- It's a lif!
                skill=HLIF_CHANGE
                level=3
            elseif	(homuntype==3) then -- It's a filer!
                skill=HFLI_FLEET
                if (FilirFlitLevel==nil) then
                    level=5
                else
                    level=FilirFlitLevel
                end
            elseif  (homuntype==2) then --it's an amistr
                skill=HAMI_BLOODLUST
                level=3
            end
        else
            level=SkillList[MercType][MER_QUICKEN]
            if level ~=nil then
                skill=MER_QUICKEN
            end
        end
        if AutoSkillCooldown[skill]~=nil then
            if GetTick() < AutoSkillCooldown[skill] then -- in cooldown
                level=0
                skill=0
            end
        end
        return skill,level
    end

    function	GetSOffensiveSkill(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if (htype==BAYERI and UseBayeriAngriffModus~=0) then
                skill=MH_ANGRIFFS_MODUS
                level = 5
                skillopt=UseBayeriAngriffModus
            elseif	(htype==DIETER and UseDieterMagmaFlow~=0) then
                skill=MH_MAGMA_FLOW
                level = 5
                skillopt=UseDieterMagmaFlow
            end
            return skill,level,skillopt
        else
            level=SkillList[MercType][MER_BLESSING]
            if level~=nil then
                skill=MER_BLESSING
            else
                level=0
            end
            return skill,level,UseBlessingSelf
        end
    end

    function	GetSDefensiveSkill(myid)
        local level = 0
        local skill = 0
        local skillopt=0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if (htype==BAYERI and UseBayeriGoldenPherze~=0) then
                skill=MH_GOLDENE_FERSE
                level = 5
                skillopt=UseBayeriGoldenPherze
            elseif	(htype==DIETER and UseDieterGraniticArmor~=0) then
                skill=MH_GRANITIC_ARMOR
                level = 5
                skillopt=UseDieterGraniticArmor
            end
            return skill,level,skillopt
        else
            level=SkillList[MercType][MER_KYRIE]
            if level~=nil then
                skill=MER_KYRIE
            else
                level=0
            end
            return skill,level,UseKyrieSelf
        end
        return 0,0,0
    end

    function	GetSOwnerBuffSkill(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if (htype==EIRA and UseEiraOveredBoost~=0) then
                skill=MH_OVERED_BOOST
                level = 5
                skillopt=UseEiraOveredBoost
            elseif	(htype==DIETER and UseDieterPyroclastic~=0) then
                skill=MH_PYROCLASTIC
                level = 5
                skillopt=UseDieterPyroclastic
            end
            return skill,level,skillopt
        else
            level=SkillList[MercType][MER_INCAGI]
            if level~=nil then
                skill=MER_INCAGI
            else
                level=0
            end
            return skill,level,UseIncAgiSelf
        end
        return 0,0,0
    end

    function GetSightOrAoE(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if (htype==DIETER and UseDieterLavaSlide==1 and LavaSlideMode~=0) then
                skill=MH_LAVA_SLIDE
                level = 5
                skillopt=LavaSlideMode
            elseif (htype==SERA and PoisonMistMode~=0 and UseSeraPoisonMist==1) then
                skill=MH_POISON_MIST
                level = 5
                skillopt=PoisonMistMode
            end
        else
            if MercType==2 then
                skill=MER_SIGHT
                level=1
                skillopt=UseAutoSight
            end
        end
        if AutoSkillCooldown[skill]~=nil then
            if GetTick() < AutoSkillCooldown[skill] then -- in cooldown
                level=0
                skill=skill
            end
        end
        return skill,level,skillopt
    end
    function	GetGuardSkill(myid)
        local level = 0
        local skill = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype < 17 then
                homuntype=modulo(GetV(V_HOMUNTYPE,myid),4)
            else
                homuntype=modulo(OldHomunType,4)
            end
            if (homuntype==1) then -- It's a lif!
                skill=HLIF_AVOID
                if (LifEscapeLevel==nil) then
                    level=5
                else
                    level=LifEscapeLevel
                end
            elseif (homuntype==2) then -- It's an amistr!
                skill=HAMI_DEFENCE
                if (AmiBulwarkLevel==nil) then
                    level=5
                else
                    level=AmiBulwarkLevel
                end
            elseif (homuntype==3) then -- It's an filir!
                skill=HFLI_SPEED
                if (FilirAccelLevel==nil) then
                    level=5
                else
                    level=FilirAccelLevel
                end
            end
            return skill,level
        else
            for i,v in ipairs(GuardSkillList) do
                level = SkillList[MercType][v]
                if level ~= nil then
                    skill=v
                    return skill,level
                end
            end
        end
        return 0,0
    end

    function	GetOffensiveOwnerSkill(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            return 0,0,0
        else
            level=SkillList[MercType][MER_BLESSING]
            if level~=nil then
                skill=MER_BLESSING
            else
                level=0
            end
            return skill,level,UseBlessingOwner
        end
    end
    function	GetDefensiveOwnerSkill(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            if GetV(V_HOMUNTYPE,MyID)==SERA and UseSeraPainkiller~=0 then
                level=5
                return MH_PAIN_KILLER,level,UseSeraPainkiller
            else
                return 0,0,0
            end
        else
            level=SkillList[MercType][MER_KYRIE]
            if level~=nil then
                skill=MER_KYRIE
            else
                level=0
            end
            return skill,level,UseKyrieOwner
        end
    end
    function	GetOtherOwnerSkill(myid)
        local level = 0
        local skill = 0
        local skillopt = 0
        if (IsHomun(myid)==1) then
            return 0,0,0
        else
            level=SkillList[MercType][MER_INCAGI]
            if level~=nil then
                skill=MER_INCAGI
            else
                level=0
            end
            return skill,level,UseIncAgiOwner
        end
    end



    function GetHealingSkill(myid)
        local level = 0
        local skill = 0
        if (IsHomun(myid)==1) then
            htype=GetV(V_HOMUNTYPE,myid)
            if htype < 17 then --if it's not a homun S just run it through modulo. 
                homuntype=modulo(GetV(V_HOMUNTYPE,myid),4)
            else --If it's a homun S, get the OldHomunType
                if homuntype == EIRA and HealOwnerBreeze == 1 then --Handling for Eira silent breeze
                    skill=MH_SILENT_BREEZE
                    if GetTick() < AutoSkillCooldown[skill] then
                        level=0
                    else
                        level=5
                    end
                    return skill,level
                end
                homuntype=modulo(OldHomunType,4)
            end
            if (homuntype==1) then -- It's a lif
                skill=HLIF_HEAL
                if GetTick() < AutoSkillCooldown[skill] then
                    level=0
                elseif (LifHealLevel==nil) then
                    level=5
                else
                    level=LifHealLevel
                end
            elseif homuntype==0 then -- It's a vani
                skill=HVAN_CHAOTIC
                if GetTick() < AutoSkillCooldown[skill] then
                    level=0
                elseif (VaniChaoticLevel==nil) then
                    level=3
                else
                    level=VaniChaoticLevel
                end
            end
        else
            --currently no merc healing skills
        end
        return skill,level
    end

    function GetSnipeSkill(myid)
        return GetAtkSkill(myid)
    end

    function GetTargetedSkills(myid)
        s,l=GetAtkSkill(myid)
        Mainatk={MAIN_ATK,s,l}
        s,l=GetSAtkSkill(myid)
        Satk={S_ATK,s,l}
        s,l=GetComboSkill(myid)
        ComboAtk={COMBO_ATK,s,l}
        s,l=GetGrappleSkill(myid)
        GrappleAtk={GRAPPLE_ATK,s,l}
        s,l=GetMobSkill(myid)
        Mobatk={MOB_ATK,s,l}
        s,l=GetDebuffSkill(myid)
        Debuffatk={DEBUFF_ATK,s,l}
        s,l=GetMinionSkill(myid)
        Minionatk={MINION_ATK,s,l}
        result={Mainatk,Satk,ComboAtk,GrappleAtk,Mobatk,Debuffatk,Minionatk}
        return result
    end

    function GetSkillInfo(skill,info,level)
        if skill~=nil and info~=nil then
            if SkillInfo[skill]~=nil then
                local t=SkillInfo[skill][info]
                if t~=nil then
                    if level ==nil and type(t)=="table" then
                        logappend("AAI_ERROR","Attempted to call GetSkillInfo() with only 2 arguments "..skill.." "..info)
                        if type(t)~="table" and t~=nil then
                            return t
                        else
                            return -1
                        end
                    elseif type(t)~="table" then
                        return t
                    elseif SkillInfo[skill][info][level]~=nil then
                        return SkillInfo[skill][info][level]
                    else
                        logappend("AAI_ERROR","GetSkillInfo(): No skill info type "..info.." found for this level "..FormatSkill(skill,level))
                        if info==2 then
                            local r=0
                            if (_VERSION=="Lua 5.1") then
                                r=GetV(V_SKILLATTACKRANGE_LEVEL,MyID,skill,level)
                            else
                                r=GetV(V_SKILLATTACKRANGE,MyID,skill)
                            end
                            logappend("AAI_ERROR","GetSkillInfo(): Range for unknown skill requested, returning builtin value"..r.." "..skill)
                            return r
                        elseif SkillInfo[skill][info][1]~= nil then
                            return SkillInfo[skill][info][1]
                        else
                            return 0
                        end
                    end
                else
                    logappend("AAI_ERROR","GetSkillInfo(): No skill info type "..info.." found for this skill "..FormatSkill(skill,level).." called by ")
                    if info==2 then
                        logappend("AAI_ERROR","GetSkillInfo(): Range for unknown skill requested, returning builtin value"..GetV(V_SKILLATTACKRANGE,MyID,skill))
                        return GetV(V_SKILLATTACKRANGE,MyID,skill)
                    elseif info==7 then
                        return 1
                    else
                        return 0
                    end
                end
            else
                logappend("AAI_ERROR","GetSkillInfo(): No skill info found for this skill "..FormatSkill(skill,level).." info type requested "..info)
                if info==2 then
                    logappend("AAI_ERROR","GetSkillInfo(): Range for unknown skill requested, returning builtin value"..GetV(V_SKILLATTACKRANGE,MyID,skill))
                    return GetV(V_SKILLATTACKRANGE,MyID,skill)
                elseif info==7 then
                    return 1
                else
                    return 0
                end
            end
        else
            if skill==nil then
                skill="nil"
            end
            if level==nil then
                level="nil"
            end
            if info==nil then
                info="nil"
            end
            logappend("AAI_ERROR","GetSkillInfo(): Invalid arguments - skill="..skill.." level="..level.." info="..info)
            return 0
        end
    end
    --#######################
    --### Other Functions ###
    --#######################

    function KiteOK(myid)
        mertype=GetV(V_MERTYPE,myid)
        if (mertype==nil) then
            homuntype=modulo(GetV(V_HOMUNTYPE,myid),4)
            if ((homuntype==0 or homuntype==3 )and DoNotChase==1) then
                return 1
            else
                return 0
            end
        elseif (mertype < 11) then
            return 1
        else
            return 0
        end
    end

    function DoSkill(skill, level, target, mode, targx, targy)
        TraceAI("DoSkill called - skill:"..skill.." level:"..level.." target:"..target)

        if not skill or not level or skill == 0 or level == 0 then
            logappend("AAI_ERROR", "Invalid skill or level - skill:"..skill.." level:"..level.." target:"..target.." mode:"..mode.." state:"..MyState.." pstate:"..MyPState)
            return 0
        end

        local targetmode = GetSkillInfo(skill, 7)

        if skill == MH_SONIC_CRAW then
            ComboSCTimeout = GetTick() + 2000
            MySpheres = MySpheres - 1
        elseif skill == MH_SILVERVEIN_RUSH then
            ComboSVTimeout = GetTick() + 2000
            MySpheres = MySpheres - 1
        elseif skill == MH_MIDNIGHT_FRENZY then
            MySpheres = MySpheres - 2
            ComboMFTimeout = GetTick() + 2000
        elseif skill == MH_TINDER_BREAKER then
            MySpheres = MySpheres - 1
            ComboTBTimeout = GetTick() + 2000
        elseif skill == MH_EQC then
            ComboEQCTimeout = GetTick() + 2000	
            MySpheres = MySpheres - 2
        elseif skill == MH_CBC then
            ComboCBCTimeout = GetTick() + 2000		
            MySpheres = MySpheres - 2
        end

        if skill == HFLI_SBR44 and AllowSBR44 ~= 1 then
            logappend("AAI_ERROR", "Attempt to use SBR 44 blocked. Set AllowSBR44 = 1 in H_Extra to enable.")
        elseif targetmode == 0 then
            SkillObject(MyID, level, skill, MyID)
        elseif targetmode == 1 then
            SkillObject(MyID, level, skill, target)
        elseif targetmode == 2 then
            local x, y = targx~=0 and targx,targy or GetV(V_POSITION, target)
            SkillGround(MyID, level, skill, x, y)
        end

        if mode then
            if mode > 0 then
                CastSkillMode = mode
                CastSkill = skill
                CastSkillLevel = level
                CastSkillTime = GetTick()
                CastSkillState = 0
                if mode == 8 then
                    if EleanorMode == 0 then 
                EleanorMode = 1 
            else 
                EleanorMode = 0
                MySpheres = 0
            end
                end
            else
                DoSkillHandleMode(skill, level, target, mode, targx, targy)
            end
            logappend("AAI_SKILLFAIL", "Mode set "..mode.." skill:"..skill.." level:"..level)
        end

        local delay = AutoSkillDelay + GetSkillInfo(skill, 4, level) + GetSkillInfo(skill, 5, level) * CastTimeRatio
        AutoSkillCastTimeout = delay + GetTick()

        if AutoSkillCooldown[skill]~=nil then
        AutoSkillCooldown[skill]=GetTick()+GetSkillInfo(skill,9,level)+delay
        end

        delay = delay + GetSkillInfo(skill, 6, level)
        AutoSkillTimeout = GetTick() + delay

        TraceAI("DoSkill: "..skill.." level:"..level.." target:"..target.." mode:"..targetmode.." delay:"..delay)
        logappend("AAI_SKILLFAIL", "DoSkill: "..skill.." level:"..level.." target:"..target.." mode:"..targetmode.." delay:"..delay)
        UpdateTimeoutFile()
        return
    end

    -- I SHOULDNT HAVE TO CODE THIS!
    function modulo(a,b)
        return a-math.floor(a/b)*b
    end
    -- OR THIS!
    function len(listin)
        local length=0
        for k,v in pairs(listin) do
            length = length + 1
        end
        return length
    end

    function absceil(x)
        if x>0 then
            return math.ceil(x)
        else
            return math.floor(x)
        end
    end

    function absunit(x)
        if x==0 then
            return 0
        elseif x > 0 then
            return 1
        else -- x < 0
            return -1
        end
    end


    -- Logging functions:

    function 	FormatSkill(skill,level)
        if skill==nil then
            return "nil skill"
        end
        local output
        local name
        if SkillInfo[skill]==nil then
            name=skill
        elseif SkillInfo[skill][1]==nil then
            name=skill
        else
            name=SkillInfo[skill][1]
        end
        output = name.." ("..skill..")"
        if level == nil then
            return output
        else 
            return output.." level "..level
        end
    end

    function FormatMotion(motion)
        local motions = {
            [0] = "Standing",
            [1] = "Moving",
            [2] = "Attacking",
            [3] = "Dead",
            [4] = "Flinching",
            [5] = "Bending over",
            [6] = "Sitting",
            [7] = "Using skill",
            [8] = "Casting"
        }
        if motions[motion] then
            return motions[motion].." ("..motion..")"
        else
            return motion
        end
    end

    function formatval (val)
        if val == nil then
            return "nil"
        elseif type(val)=="string" then
            return "'"..val.."'"
        elseif type(val)=="function" then
            return "function"
        end
        return val
    end

    function logappend (filename,message)
        if LogEnable[filename]==1 then
            TraceAI("Logging "..filename.." - "..message)
            outfile = io.open("./"..filename..".log", "a")
            outfile:seek("end")
            if filename=="AAI_SKILLFAIL" then
                outfile:write(os.date("%c").." ("..GetTick()..") "..TypeString..MyState.."\\t"..message.."\\n")
            else
                outfile:write(os.date("%c").." "..TypeString..MyState.."\\t"..message.."\\n")
            end
            outfile:close()
        end
    end

    function formatmypos(steps)
        if steps>10 then
            logappend("AAI_ERROR","Invalid number of steps called for formatmypos() "..steps)
            steps=10
        elseif steps <1 then
            logappend("AAI_ERROR","Invalid number of steps called for formatmypos() "..steps)
            steps=1
        end
        local outstring=""
        for v=1,steps,1 do
            outstring=outstring.."("..MyPosX[v]..","..MyPosY[v]..")"
            if v~=step then
                outstring=outstring..","
            end
        end
        return outstring
    end

    function formatpos(x,y)
        return x..","..y
    end
    --------------------------------------------
    -- List utility
    --------------------------------------------
    List = {}

    function List.new ()
        return { first = 0, last = -1}
    end

    function List.pushleft (list, value)
        local first = list.first-1
        list.first  = first
        list[first] = value;
    end

    function List.pushright (list, value)
        local last = list.last + 1
        list.last = last
        list[last] = value
    end

    function List.popleft (list)
        local first = list.first
        if first > list.last then 
            return nil
        end
        local value = list[first]
        list[first] = nil         -- to allow garbage collection
        list.first = first+1
        return value
    end

    function List.popright (list)
        local last = list.last
        if list.first > last then
            return nil
        end
        local value = list[last]
        list[last] = nil
        list.last = last-1
        return value 
    end

    function List.clear (list)
        for i,v in ipairs(list) do
            list[i] = nil
        end
    --[[
        if List.size(list) == 0 then
            return
        end
        local first = list.first
        local last  = list.last
        for i=first, last do
            list[i] = nil
        end
    --]]
        list.first = 0
        list.last = -1
    end

    function List.size (list)
        local size = list.last - list.first + 1
        return size
    end
                    `,
'AI/USER_AI/Const.lua': `


    --  c function

    --[[
    function	TraceAI (string) end
    function	MoveToOwner (id) end
    function 	Move (id,x,y) end
    function	Attack (id,id) end
    function 	GetV (V_,id) end
    function	GetActors () end
    function	GetTick () end
    function	GetMsg (id) end
    function	GetResMsg (id) end
    function	SkillObject (id,level,skill,target) end
    function	SkillGround (id,level,skill,x,y) end
    function	IsMonster (id) end								-- id´Â ¸ó½ºÅÍÀÎ°¡? yes -> 1 no -> 0

    --]]





    -------------------------------------------------
    -- constants
    -------------------------------------------------


    --------------------------------
    V_OWNER				=	0		-- ÁÖÀÎÀÇ ID			
    V_POSITION			=	1		-- ¹°Ã¼ÀÇ À§Ä¡ 
    V_TYPE				=	2		-- ¹Ì±¸Çö 
    V_MOTION			=	3		-- µ¿ÀÛ 
    V_ATTACKRANGE		=	4		-- ¹°¸® °ø°Ý ¹üÀ§ 
    V_TARGET			=   5		-- °ø°Ý, ½ºÅ³ »ç¿ë ¸ñÇ¥¹° ID 
    V_SKILLATTACKRANGE	=	6		-- ½ºÅ³ »ç¿ë ¹üÀ§ 
    V_HOMUNTYPE			=   7		-- È£¹®Å¬·ç½º Á¾·ù
    V_HP				=	8		-- HP (È£¹®Å¬·ç½º¿Í ÁÖÀÎ¿¡°Ô¸¸ Àû¿ë)
    V_SP				=	9		-- SP (È£¹®Å¬·ç½º¿Í ÁÖÀÎ¿¡°Ô¸¸ Àû¿ë)
    V_MAXHP				=   10		-- ÃÖ´ë HP (È£¹®Å¬·ç½º¿Í ÁÖÀÎ¿¡°Ô¸¸ Àû¿ë)
    V_MAXSP				=   11		-- ÃÖ´ë SP (È£¹®Å¬·ç½º¿Í ÁÖÀÎ¿¡°Ô¸¸ Àû¿ë)
    V_MERTYPE		  =		12    -- ¿ëº´ Á¾·ù	
    V_POSITION_APPLY_SKILLATTACKRANGE = 13	-- SkillAttackange¸¦ Àû¿ëÇÑ À§Ä¡
    V_SKILLATTACKRANGE_LEVEL = 14	-- ·¹º§ º° SkillAttackange
    ---------------------------------	





    --------------------------------------------
    -- È£¹®Å¬·ç½º Á¾·ù 
    --------------------------------------------

    LIF				= 1
    AMISTR			= 2
    FILIR			= 3
    VANILMIRTH		= 4
    LIF2			= 5
    AMISTR2			= 6
    FILIR2			= 7
    VANILMIRTH2		= 8
    LIF_H			= 9
    AMISTR_H		= 10
    FILIR_H			= 11
    VANILMIRTH_H	= 12
    LIF_H2			= 13
    AMISTR_H2		= 14
    FILIR_H2		= 15
    VANILMIRTH_H2	= 16

    --------------------------------------------



    --------------------------------------------
    -- ¿ëº´ Á¾·ù 
    --------------------------------------------
    ARCHER01	= 1		
    ARCHER02	= 2			
    ARCHER03	= 3	
    ARCHER04	= 4
    ARCHER05	= 5
    ARCHER06	= 6
    ARCHER07	= 7
    ARCHER08	= 8
    ARCHER09	= 9
    ARCHER10	= 10
    LANCER01	= 11
    LANCER02	= 12
    LANCER03	= 13
    LANCER04	= 14
    LANCER05	= 15
    LANCER06	= 16
    LANCER07	= 17
    LANCER08	= 18
    LANCER09	= 19
    LANCER10	= 20
    SWORDMAN01	= 21		
    SWORDMAN02	= 22	
    SWORDMAN03	= 23
    SWORDMAN04	= 24
    SWORDMAN05	= 25
    SWORDMAN06	= 26
    SWORDMAN07	= 27
    SWORDMAN08	= 28
    SWORDMAN09	= 29
    SWORDMAN10	= 30
    --------------------------------------------



    --------------------------
    MOTION_STAND	= 0
    MOTION_MOVE		= 1
    MOTION_ATTACK	= 2
    MOTION_DEAD     = 3
    MOTION_ATTACK2	= 9 
    --------------------------




    --------------------------
    -- command  
    --------------------------
    NONE_CMD			= 0
    MOVE_CMD			= 1
    STOP_CMD			= 2
    ATTACK_OBJECT_CMD	= 3
    ATTACK_AREA_CMD		= 4
    PATROL_CMD			= 5
    HOLD_CMD			= 6
    SKILL_OBJECT_CMD	= 7
    SKILL_AREA_CMD		= 8
    FOLLOW_CMD			= 9
    --------------------------



    --[[ ¸í·É¾î ±¸Á¶ 

    MOVE_CMD
        {¸í·É¹øÈ£,XÁÂÇ¥,YÁÂÇ¥}
        
    STOP_CMD
        {¸í·É¹øÈ£}

    ATTACK_OBJECT_CMD
        {¸í·É¹øÈ£,¸ñÇ¥ID}

    ATTACK_AREA_CMD	
        {¸í·É¹øÈ£,XÁÂÇ¥,YÁÂÇ¥}

    PATROL_CMD	
        {¸í·É¹øÈ£,XÁÂÇ¥,YÁÂÇ¥}
        
    HOLD_CMD
        {¸í·É¹øÈ£}

    SKILL_OBJECT_CMD
        {¸í·É¹øÈ£,¼±ÅÃ·¹º§,Á¾·ù,¸ñÇ¥ID}

    SKILL_AREA_CMD
        {¸í·É¹øÈ£,¼±ÅÃ·¹º§,Á¾·ù,XÁÂÇ¥,YÁÂÇ¥}

    FOLLOW_CMD
        {¸í·É¹øÈ£}

    --]]


                    `,
'AI/USER_AI/Const_.lua': `
    -- AzzyAI Constant File
    CVersion="1.6"

    --[[
    function	TraceAI (string) end
    function	MoveToOwner (id) end
    function 	Move (id,x,y) end
    function	Attack (id,id) end
    function 	GetV (V_,id) end
    function	GetActors () end
    function	GetTick () end
    function	GetMsg (id) end
    function	GetResMsg (id) end
    function	SkillObject (id,level,skill,target) end
    function	SkillGround (id,level,skill,x,y) end
    function	IsMonster (id) end								-- id�� �����ΰ�? yes -> 1 no -> 0

    --]]
    --GetV() first argument--
    V_OWNER				=	0			
    V_POSITION			=	1 
    V_TYPE				=	2 
    V_MOTION			=	3 
    V_ATTACKRANGE			=	4 
    V_TARGET			=	5 
    V_SKILLATTACKRANGE		=	6 
    V_HOMUNTYPE			=	7
    V_HP				=	8
    V_SP				=	9
    V_MAXHP				=	10
    V_MAXSP				=	11
    V_MERTYPE		  	=	12	
    V_POSITION_APPLY_SKILLATTACKRANGE = 13	
    V_SKILLATTACKRANGE_LEVEL = 14	
    --Homun and merc type IDs--
    LIF			= 1
    AMISTR				= 2
    FILIR			= 3
    VANILMIRTH		= 4
    LIF2			= 5
    AMISTR2			= 6
    FILIR2			= 7
    VANILMIRTH2		= 8
    LIF_H			= 9
    AMISTR_H		= 10
    FILIR_H			= 11
    VANILMIRTH_H		= 12
    LIF_H2			= 13
    AMISTR_H2		= 14
    FILIR_H2		= 15
    VANILMIRTH_H2		= 16
    EIRA			= 48
    BAYERI			= 49  --because sources can't agree on correct spelling
    BEYERI			= 49
    SERA			= 50
    DIETER			= 51
    ELEANOR			= 52
    ARCHER01	= 1		
    ARCHER02	= 2			
    ARCHER03	= 3	
    ARCHER04	= 4
    ARCHER05	= 5
    ARCHER06	= 6
    ARCHER07	= 7
    ARCHER08	= 8
    ARCHER09	= 9
    ARCHER10	= 10
    LANCER01	= 11
    LANCER02	= 12
    LANCER03	= 13
    LANCER04	= 14
    LANCER05	= 15
    LANCER06	= 16
    LANCER07	= 17
    LANCER08	= 18
    LANCER09	= 19
    LANCER10	= 20
    SWORDMAN01	= 21		
    SWORDMAN02	= 22	
    SWORDMAN03	= 23
    SWORDMAN04	= 24
    SWORDMAN05	= 25
    SWORDMAN06	= 26
    SWORDMAN07	= 27
    SWORDMAN08	= 28
    SWORDMAN09	= 29
    SWORDMAN10	= 30
    UNKNOWNMER	= 100 -- Not official designation. Returned by internal GetMerType() function when it cant determine the merc type. 
    WILDROSE	= 101 -- These are like this because the GetV(V_MERTYPE,MyID) returns 1 for all monster mercs, as well as lvl 1 archer mercs, so we define our own numbers for these. 
    DOPPLEMERC	= 102 -- Dopple or Egnigem (indistinguishable to the AI)
    ALICE		= 103
    MIMIC		= 104
    DISGUISE	= 105
    GMMALE		= 106
    PENGINEER   = 107
    ISIS		= 108
    ------------------
    MOTION_STAND = 0 	-- Standing still
    MOTION_MOVE = 1 	-- Moving
    MOTION_ATTACK = 2 	-- Attacking
    MOTION_DEAD = 3 	-- Laying dead
    MOTION_DAMAGE = 4 	-- Taking damage
    MOTION_BENDDOWN = 5 -- Pick up item, set trap
    MOTION_SIT = 6 		-- Sitting down
    MOTION_SKILL = 7 	-- Used a skill
    MOTION_CASTING = 8 	-- Casting a skill
    MOTION_ATTACK2 = 9 	-- Attacking (other motion)
    MOTION_TOSS = 12	 -- Toss something (spear boomerang / aid potion)
    MOTION_COUNTER = 13 	-- Counter-attack
    MOTION_PERFORM = 17 	-- Performance
    MOTION_JUMP_UP = 19 	-- TaeKwon Kid Leap -- rising
    MOTION_JUMP_FALL= 20 	-- TaeKwon Kid Leap -- falling
    MOTION_SOULLINK = 23 	-- Soul linker using a link skill
    MOTION_TUMBLE = 25 	-- Tumbling / TK Kid Leap Landing
    MOTION_BIGTOSS = 28 	-- A heavier toss (slim potions / acid demonstration) 
    MOTION_DESPERADO = 38 	-- Desperado
    MOTION_XXXXXX = 39 	-- ??(????????/????)
    MOTION_FULLBLAST = 42 	-- Full Blast

    --MotionClass translation
    MotionClassLU={3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3} --fill it with 3's, in leiu of a proper solution
    MotionClassLU[0]=0 -- now set stuff thats known to proper values
    MotionClassLU[1]=1
    MotionClassLU[2]=3
    MotionClassLU[3]=-1
    MotionClassLU[4]=2
    MotionClassLU[5]=0
    MotionClassLU[6]=0
    MotionClassLU[7]=4
    MotionClassLU[8]=5
    MotionClassLU[9]=3
    MotionClassLU[12]=4
    MotionClassLU[13]=1
    MotionClassLU[17]=1
    MotionClassLU[19]=1
    MotionClassLU[20]=1
    MotionClassLU[23]=5
    MotionClassLU[25]=0
    MotionClassLU[28]=4
    MotionClassLU[38]=4
    MotionClassLU[39]=0
    MotionClassLU[42]=4

    -- Backward compatibility
    MOTION_PP = MOTION_TOSS
    MOTION_SLIMPP = MOTION_BIGTOSS
    MOTION_PICKUP = MOTION_BENDDOWN 
    --------------------------




    --------------------------
    -- command  
    --------------------------
    NONE_CMD			= 0
    MOVE_CMD			= 1
    STOP_CMD			= 2
    ATTACK_OBJECT_CMD		= 3
    ATTACK_AREA_CMD			= 4
    PATROL_CMD			= 5
    HOLD_CMD			= 6
    SKILL_OBJECT_CMD		= 7
    SKILL_AREA_CMD			= 8
    FOLLOW_CMD			= 9
    --------------------------

    --------------------------
    --Other stuff
    --------------------------

    S_ATK		= 1
    MAIN_ATK	= 0
    MOB_ATK		= 3
    DEBUFF_ATK	= 2
    COMBO_ATK	= 4
    MINION_ATK	= 5
    GRAPPLE_ATK = 6

    --------------------------
    --Strings
    --------------------------

    STRING_A_FRIENDS_HEAD = "--Friendlist for Azzy AI\\n--Automatically generated by Azzy AI.\\n--To add friends, put mercenary or homun into standby mode (ctl+T or alt+T as appropriate), and sit 1 cell to the west (to left in default view) of the person who you wish to friend\\n--To remove friends, put merc/homun into standby mode, and sit 1 cell to the east (to right in default view) of the person you want to remove.\\n--\\n--To add KOS/Enemy/Etc lists, get the ID number from ROPD or by friending them, and make a line like\\n--MyFriends{2322797}=KOS\\n--Possible values are NEUTRAL, KOS (kill on sight), ENEMY (assume hostile, but don't attack), and ALLY (assume friendly).\\nMyFriends={}\\n"


    ---------------------------
    --Constants (used in GetTact() calls)
    ---------------------------
    TACT_BASIC	= 1
    TACT_SKILL	= 2
    TACT_KITE	= 3
    TACT_CAST	= 4 --Assume casts are offencive?
    TACT_PUSHBACK	= 5
    TACT_DEBUFF	= 6
    TACT_SIZE	= 7
    TACT_SKILLCLASS = 7
    TACT_RESCUE	= 8
    TACT_SP		= 9
    TACT_SNIPE	= 10
    TACT_FFA	= 11
    TACT_KS		= 11
    TACT_WEIGHT = 12
    TACT_CHASE	= 13

    ---------------------------
    --Tactics (responce to monster)
    ---------------------------
    TACT_TANKMOB = -2
    TACT_TANK	= -1
    TACT_IGNORE	= 0	-- Do not attack the monster 
    TACT_ATTACK_L	= 2	----
    TACT_ATTACK_M	= 3	--Attack when HP > AggroHP
    TACT_ATTACK_H	= 4	----
    TACT_REACT_L	= 5	----
    TACT_REACT_M	= 7	--Defend when attacked only
    TACT_REACT_H	= 8	----
    TACT_REACT_SELF = 9	--React only when attacked, not when owner attacked.
    TACT_SNIPE_L	=10	-- sniping tactics
    TACT_SNIPE_M	=11	-- use skill once	
    TACT_SNIPE_H	=12	-- while attacking other monsters, otherwise as TACT_ATTACK
    TACT_ATK_L_REACT_M = 13
    TACT_ATTACK_LAST = 14
    TACT_ATTACK_TOP = 15


    ---------------------------
    --Tactics (skill use)
    --In tact lists, put another number in this field 
    --to specify the number of skills it will use.
    --if negative, will use skill of this LEVEL, only ONCE.
    ---------------------------

    SKILL_NEVER	=0
    SKILL_ALWAYS	=100

    ---------------------------
    --Tactics (Kiting)
    ---------------------------

    KITE_ALWAYS	= 2
    KITE_REACT	= 1
    KITE_NEVER	= 0

    ---------------------------
    --Tactics (Cast react)
    ---------------------------

    CAST_REACT_MAIN		= 10
    CAST_REACT_S		= 11
    CAST_REACT_MOB		= 12
    CAST_REACT_DEBUFF	= 13
    CAST_REACT_MINION	= 15
    CAST_REACT_ANY		= 9
    CAST_REACT_CRASH 	= 8225
    CAST_REACT_PROVOKE 	= 8232
    CAST_REACT_SANDMAN 	= 8211
    CAST_REACT_FREEZE 	= 8212
    CAST_REACT_DECAGI 	= 8234
    CAST_REACT_LEXDIV 	= 8236
    CAST_REACT_BREEZE	=8026
    CAST_REACT	= 1
    CAST_PASSIVE	= 0

    ---------------------------
    --Tactics (Pushback)
    ---------------------------

    PUSH_FRIEND	= 2
    PUSH_SELF	= 1
    PUSH_NEVER	= 0

    ---------------------------
    --Tactics (Debuffs)
    ---------------------------

    DEBUFF_NEVER 	=0 -- To use Debuff skill, use the skill as the debuff field of the tactlist.
    DEBUFF_NEVER = 0
    DEBUFF_ANY_C = -1
    DEBUFF_CRASH_C = -8225
    DEBUFF_PROVOKE_C = -8232
    DEBUFF_SANDMAN_C = -8211
    DEBUFF_FREEZE_C = -8212
    DEBUFF_DECAGI_C = -8234
    DEBUFF_LEXDIV_C = -8236
    DEBUFF_BREEZE_C=-8026
    DEBUFF_ASH_C=-8043
    DEBUFF_ANY_A = 1
    DEBUFF_CRASH_A = 8225
    DEBUFF_PROVOKE_A = 8232
    DEBUFF_SANDMAN_A = 8211
    DEBUFF_FREEZE_A = 8212
    DEBUFF_DECAGI_A = 8234
    DEBUFF_LEXDIV_A = 8236
    DEBUFF_BREEZE_A=8026
    DEBUFF_ASH_A=8043

    ---------------------------
    --Tactics (SKILL CLASS)
    ---------------------------

    CLASS_BOTH	=-1
    CLASS_OLD	=0
    CLASS_S		=1
    CLASS_MOB	=2
    CLASS_COMBO_1 =3
    CLASS_COMBO_2 =4
    CLASS_MINION	=5
    CLASS_GRAPPLE = 6
    CLASS_GRAPPLE_1 =7
    CLASS_GRAPPLE_2 =8
    CLASS_MIN_OLD = 9
    CLASS_MIN_S = 10
    ---------------------------
    --Tactics (RESCUE)
    ---------------------------
    RESCUE_NEVER =0
    RESCUE_FRIEND = 1
    RESCUE_RETAINER = 2
    RESCUE_SELF = 3
    RESCUE_OWNER = 4
    RESCUE_ALL = 5


    --

    KS_NEVER=0
    KS_ALWAYS=1
    KS_POLITE=-1

    -- Snipe
    SNIPE_OK = 1
    SNIPE_DISABLE = 0

    -- Chase
    CHASE_NORMAL = -1
    CHASE_ALWAYS = 0
    CHASE_NEVER  = 1
    CHASE_CLEVER = 2

    ---------------------------
    -- PVP/Friend Crap
    ---------------------------

    ALLY	= 13
    KOS	= 12
    ENEMY	= 11
    NEUTRAL	= 10
    RETAINER= 2
    FRIEND	= 1
    PKFRIEND = 3

    STRING_FRIENDNAMES={}
    STRING_FRIENDNAMES[ALLY]="ALLY"
    STRING_FRIENDNAMES[FRIEND]="FRIEND"
    STRING_FRIENDNAMES[RETAINER]="RETAINER"
    STRING_FRIENDNAMES[NEUTRAL]="NEUTRAL"
    STRING_FRIENDNAMES[ENEMY]="ENEMY"
    STRING_FRIENDNAMES[KOS]="KOS"


    -----------------------------
    -- state
    -----------------------------
    IDLE_ST					= 0
    FOLLOW_ST				= 1
    CHASE_ST				= 2
    ATTACK_ST				= 3
    MOVE_CMD_ST				= 4
    STOP_CMD_ST				= 5 -- Not used
    ATTACK_OBJECT_CMD_ST			= 6
    ATTACK_AREA_CMD_ST			= 7
    PATROL_CMD_ST				= 8 -- Not used
    HOLD_CMD_ST				= 9 -- Not used
    SKILL_OBJECT_CMD_ST			= 10
    SKILL_AREA_CMD_ST			= 11
    FOLLOW_CMD_ST				= 12
    IDLEWALK_ST				= 100
    ORBITWALK_ST				= 101
    REST_ST					= 102
    TANKCHASE_ST				= 103
    TANK_ST					= 104
    PROVOKE_ST				= 105
    FRIEND_CROSS_ST				= 106
    FRIEND_CIRCLE_ST			= 107	
    MOVE_CMD_HOLD_ST			= 108
    ----------------------------

    ------------------------------------------
    -- global variable
    ------------------------------------------
    LastAITime			= 0
    MyState				= IDLE_ST
    MyPState			= 0
    MyEnemy				= 0
    MyPEnemy			= 0
    MyDestX				= 0
    MyDestY				= 0
    MyMoveX				= 0
    MyMoveY				= 0
    MyPatrolX			= 0	--Not used
    MyPatrolY			= 0	--Not used
    MyID				= 0
    MySkill				= 0
    MySkillLevel			= 0
    MyPSkill				= 0
    MyPSkillLevel			= 0
    MyPMode				= 0
    MySpheres			= 0
    MyASAPBuffs			= {0,0,0,0,0,0,0,0,0,0}
    MyPosX				= {0,0,0,0,0,0,0,0,0,0}	-- list of positions
    MyPosY				= {0,0,0,0,0,0,0,0,0,0}	-- to better sense motion
    OwnerPosX			= {0,0,0,0,0,0,0,0,0,0}	-- list of owner positions
    OwnerPosY			= {0,0,0,0,0,0,0,0,0,0}	-- to better sense motion
    EnemyPosX			= {0,0,0,0,0,0,0,0,0,0}
    EnemyPosY			= {0,0,0,0,0,0,0,0,0,0}
    MyMotions			= {0,0,0,0,0,0,0,0,0,0} -- to better detect freezes
    MyStates			= {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1}
    MyEnemies			= {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1}
    SeraLegionBugHist	= {0,0,0,0,0}
    SeraLegionTotalHist	= {0,0,0,0,0}
    SkillFailCount={0,0,0,0,0,0,0,0,0}
    SkillFailCount[-1]=0
    PKFriendsTimeout={}
    RandomMoveTries			= 0
    AIInitTick=0
    --Autoskill timeout counters
    QuickenTimeout			= 0
    GuardTimeout			= 0
    MagTimeout			= 0
    SightTimeout			= 0
    SOffensiveTimeout		= 0
    SDefensiveTimeout		= 0
    SOwnerBuffTimeout		= 0
    SkillTimeout			= 0
    ProvokeOwnerTimeout		= 0
    ProvokeSelfTimeout		= 0
    SacrificeTimeout		= 0
    OffensiveOwnerTimeout	= 0
    DefensiveOwnerTimeout	= 0
    OtherOwnerTimeout		= 0
    SteinWandTimeout		= 0
    AutoSkillTimeout		= 0 --Cast time + delay timeout
    AttackTimeout			= 0 --for AttackTimeLimit
    AutoSkillCastTimeout	= 0 --Cast time timeout
    TankHitTimeout			= 0
    SkillObjectCMDTimeout   = 0
    AshTimeout 				= {0,0,0}
    --Advanced movement stuff
    --OrbitWalkStep			= 0
    IdleWalkTries			= 0
    RouteWalkStep			= nil
    RouteWalkDirection		= 1
    KiteDestX			= 0
    KiteDestY			= 0
    --Other stuff
    MyStart				= GetTick()
    MySkillUsedCount		= 0
    ChaseGiveUpCount		= 0
    AttackGiveUpCount		= 0
    ChaseDebuffUsed			= 0
    Unreachable			= {}
    FollowTryCount			= 0
    FastChangeCount			= 0
    MyAttackStanceX,MyAttackStanceY = 0,0
    AttackDebuffUsed		= 0
    NeedToDoAutoFriend		= 0
    ShouldStandby			= 0
    BypassKSProtect			= 0
    MercType				= 0
    BerzerkMode				= 0
    ReturnToMoveHold		= 0
    TankMonsterCount		= 0
    ReturnToState			= 0
    NewFriendX,NewFriendY	= 0,0
    FriendMotionTime		= 0
    FriendCircleIter		= 0
    FriendCircleTimeout		= 0
    DoneInit				= 0
    AtkPosbugFixTimeout		= 0
    EleanorMode				= 0
    LastAITime_ART			= 0
    StickyX,StickyY			= 0,0
    MyLastSP				= 0
    RegenTick				= {0,{0,0,0}}
    CastSkill				= 0
    CastSkillLevel			= 0
    CastSkillMode			= 0
    ReserveSP				= 0
    LastSPTime				= GetTick()
    LastMovedTime			= GetTick()
    SteinWandPauseTime		= 0
    LastAIDelay				= 0
    MyMaxSP					= 0
    MyBuffSPCosts			= {}
    MyBuffSPCost			= 0		
    ComboSCTimeout=0
    ComboSVTimeout=0
    ComboTBTimeout=0
    ComboMFTimeout=0
    ComboEQCTimeout=0
    ComboCBCTimeout=0

    modtwROMoveDid =0
    modtwROAttackDid=0
    modtwROSkillGroundLV,modtwROSkillGroundID,modtwROSkillGroundX,modtwROSkillGroundY,modtwROSkillObjectLV,modtwROSkillObjectID,modtwROSkillObjectTarg,modtwROAttackTarget=0,0,0,0,0,0,0,0
    modtwROAttackTarget,modtwROMoveX,modtwROMoveY=0,0,0
    LagReductionCD =0

    AllTargetUnreachable=0

    -- These need to be globals
    Actors				= {}
    Players				= {}
    Monsters			= {}
    Targets				= {}
    Summons				= {}
    Retainers			= {}
    IsActive			= {}
    Attackers			= {} 
    AAIActors			= {}
    MobID 				= {}
    TakenCells			= {}

                    `,
'AI/USER_AI/Defaults.lua': `
    ---------------------------
    --DO NOT MODIFY THIS FILE--
    ---------------------------
    --TO CHANGE AI BEHAVIOR  --
    --USE THE H_Config OR    --
    --OR M_Config FILES      --
    ---------------------------
    --THIS FILE PREVENTS     --
    --DAMAGED, CORRUPTED OR  --
    --MISSING CONFIG FILES   --
    --FROM CRASHING          --
    --THE CLIENT.		 --
    ---------------------------
    MyTact={}
    MyPVPTact={}

    -- Basic Options
    AggroHP                  = 60
    AggroSP                  = 0
    OldHomunType			= 3
    UseSkillOnly			=-1 
    UseAttackSkill			=1
    OpportunisticTargeting  =0
    DoNotChase				=0
    UseDanceAttack			=0
    SuperPassive			=0
    PVPMode					=0
    AttackLastHPSP			=80
    UseIdleWalk				=0
    IdleWalkDistance		=3
    UseCastleRoute			=0
    RelativeRoute			=1
    UseCastleDefend			=0
    CastleDefendThreshold	=4
    AutoDetectPlant			=1
    FleeHP					=0
    DanceMinSP				=0
    ChaseSPPause 			= 0
    ChaseSPPauseSP 			= -80
    ChaseSPPauseTime 		= 3000
    RescueOwnerLowHP		=0
    AOEFixedLevel		=1
    LiveMobID=0

    UseBlessingOwner		= 1
    UseBlessingSelf			= 0
    UseIncAgiSelf			= 0
    UseIncAgiOwner			= 1
    UseKyrieSelf			= 0
    UseKyrieOwner			= 0
    -- Attack skill options
    AttackSkillReserveSP  = 0 
    AutoMobMode			=1 
    AutoMobCount		=5
    AutoComboMode		=1
    AutoComboSkill		=0
    AutoComboSpheres	=10
    UseAutoPushback		=0
    AutoPushbackThreshold		=2
    UseHomunSSkillChase 		= 1
    UseHomunSSkillAttack 		= 1 
    AutoSkillDelay          	= 400 
    AoEMaximizeTargets					=  0
    CastTimeRatio				= .5
    UseEiraXenoSlasher			=0 
    EiraXenoSlasherLevel		=4 
    UseEiraEraseCutter			=1
    EiraEraseCutterLevel		=4 
    UseEiraSilentBreeze		= 0
    EiraSilentBreezeLevel	=5 
    UseBayeriStahlHorn			=1
    BayeriStahlHornLevel		=5
    UseBayeriHailegeStar		=1
    BayeriHailegeStarLevel		=5
    UseBayeriSteinWand			=0
    BayeriSteinWandLevel		=5
    UseSteinWandSelfMob			=2
    UseSteinWandOwnerMob		=2
    UseSteinWandTele			=0 
    StienWandTelePause 			=3000
    UseSeraParalyze				=1
    SeraParalyzeLevel			=10
    UseSeraPoisonMist			=1
    SeraPoisonMistLevel			=5
    UseSeraCallLegion			=1 
    SeraCallLegionLevel			=5
    UseEleanorSonicClaw			=1
    EleanorSonicClawLevel		=5
    EleanorSilverveinLevel		=5
    EleanorMidnightLevel		=5
    UseDieterLavaSlide			=1 
    DieterLavaSlideLevel		=5


    --Autobuff options

    UseDefensiveBuff		=1
    UseOffensiveBuff		=1 
    UseProvokeOwner     =0
    DefensiveBuffOwnerMobbed	=0
    DefensiveBuffOwnerHP		=80
    UseProvokeSelf		=0
    UseSacrificeOwner   =0
    UseAutoMag			=0
    UseAutoSight        =1
    LifEscapeLevel  =5
    FilirFlitLevel  =1
    FilirAccelLevel =1
    AmiBulwarkLevel =5
    UseSeraPainkiller = 0

    UseBayeriAngriffModus	=0
    UseBayeriGoldenPherze	=0
    UseDieterMagmaFlow	=0
    UseDieterGraniticArmor	=0
    UseDieterPyroclastic	=0
    UseEiraOveredBoost		=0

    --AutoHeal Options:
    HealSelfHP		= 50 
    HealOwnerHP              = 50 
    UseAutoHeal              = 0 

    FollowStayBack =1
    StationaryAggroDist 	=12
    MobileAggroDist			=7
    StationaryMoveBounds    =14
    MobileMoveBounds		=9
    DoNotUseRest =0
    RestXOff		=0
    RestYOff		=-2	
    AoEReserveSP=0

    MoveSticky               = 0
    MoveStickyFight          = 0

    --Kiting options:
    KiteMonsters 				=0
    KiteBounds               = 10 
    KiteStep                 = 5
    KiteParanoidStep         = 2
    KiteThreshold            = 3
    KiteParanoidThreshold    = 2
    KiteParanoid             = 0 

    --Standby Behavior:
    DefendStandby            = 0 
    StickyStandby            = 1 


    --Advanced Timing settings 
    SpawnDelay               = 1000
    AutoSkillDelay		= 400
    ChaseGiveUp              = 6
    AttackGiveUp		=7 
    AtkPosbugTimeoutLimit  = 3 
    FollowTryPanic		=3 
    SphereTrackFactor	=3 

    --Berzerk Settings:

    UseBerzerkMobbed         = 0 
    UseBerzerkSkill          = 0 
    UseBerzerkAttack         = 0 
    Berzerk_SkillAlways      = 0 
    Berzerk_Dance            = 0
    Berzerk_IgnoreMinSP      = 0 


    --Misc settings:
    StandbyFriending         = 1  
    MirAIFriending           = 1  
    UseAvoid		 = 0  
    TankMonsterLimit	= 4
    AttackTimeLimit		= 0
    AggressiveRelogTracking = 0
    AggressiveRelogPath = "./AI/USER_AI/"
    AttackLastFullSP = 0










    DoNotChase 		=0
    KSMercHomun		=0
    AssumeHomun		=1
    UseAutoPushback		=0
    AutoPushbackThreshold	=2
    NewAutoFriend		=1
    ProvokeOwnerTries	=5
    ProvokeOwnerDelay	=400
    SkillObjectCMDLimit = 12
    RouteWalkCircle		=1

    FastChange_C2I		=1
    FastChange_C2A		=1
    FastChange_A2C		=1
    FastChange_A2I		=0
    FastChange_I2C		=0
    FastChange_F2I		=0

    FastChangeLimit		=1

    AttackDebuffLimit	=1


    MagicNumber			=110000000
    MagicNumber2		=2000000
    MagicNumber3		=100000000



    -- Homun S stuff




    FriendAttack={}			--Set these to 1 to have homun attack 
                    --the target of a friend/owner when the friend is:
    FriendAttack[MOTION_ATTACK]=1	--Attacking normally
    FriendAttack[MOTION_ATTACK2]=1	--Attacking normally
    FriendAttack[MOTION_SKILL]=1	--Uses a skill (which has the normal skill animation)
    FriendAttack[MOTION_CASTING]=1	--Is casting a skill with a casting time
    FriendAttack[MOTION_TOSS]=0	--Uses SpearBoom/AidPot/other "throwing" things
    FriendAttack[MOTION_BIGTOSS]=1	--Uses Acid Bomb
    FriendAttack[MOTION_FULLBLAST]=1	--Uses Full Blast

    AtkSkillList={MA_DOUBLE,MA_SHARPSHOOTING,ML_PIERCE,ML_SPIRALPIERCE,MS_BASH}
    MobSkillList={MA_SHOWER,MA_SHARPSHOOTING,ML_BRANDISH,MS_MAGNUM,MS_BOWLINGBASH}
    GuardSkillList={ML_AUTOGUARD,MS_PARRYING,MS_REFLECTSHIELD} --,MS_DEFENDER}
    PushSkillList={MA_CHARGEARROW,MA_SKIDTRAP}
    DebuffSkillList={MER_CRASH,MER_PROVOKE,MER_DECAGI,MA_SANDMAN,MA_FREEZINGTRAP,MER_LEXDIVINA}

    BasicDebuffs={}
    BasicDebuffs[MER_CRASH]=	1
    BasicDebuffs[MER_LEXDIVINA]=	1
    BasicDebuffs[MER_DECAGI]=	1
    BasicDebuffs[MA_SANDMAN]=	1
    BasicDebuffs[MA_FREEZINGTRAP]=	1

    SkillRetryLimit={4,4,4,3,3,3,3,0,2,2,3,3,3} --Guard, Quicken, Mag, SOffensive, SDefensive, SOwnerBuff, Sight/under-owner-ground, style change, Provoke/Painkiller
    SkillRetryLimit[-1]=2 -- for atk skills

    LogEnable={}
    LogEnable["AAI_ERROR"]=1
    LogEnable["AAI_SKILLFAIL"]=0
    LogEnable["AAI_CLOSEST"]=0
                    `,
'AI/USER_AI/H_Avoid.lua': `
    MyAvoid={}
    MyAvoid[1511]=1 --Amon Ra
    MyAvoid[1785]=1 --Atroce
    MyAvoid[1039]=1 --Bapho
    MyAvoid[1272]=1 --Dark Lord
    MyAvoid[1719]=1 --Detard 
    MyAvoid[1046]=1 --Doppel 
    MyAvoid[1389]=1 --Dracula
    MyAvoid[1112]=1 --Drake  
    MyAvoid[1115]=1 --Eddga  
    MyAvoid[1658]=1 --Egnigem
    MyAvoid[1418]=1 --ESL    
    MyAvoid[1768]=1 --Gloom  
    MyAvoid[1086]=1 --GTB
    MyAvoid[1252]=1 --Hatii  
    MyAvoid[1832]=1 --Ifrit
    MyAvoid[1734]=1 --Keil   
    MyAvoid[1779]=1 --Ktul
    MyAvoid[1688]=1 --Tanee  
    MyAvoid[1373]=1 --LoD
    MyAvoid[1147]=1 --Maya   
    MyAvoid[1708]=1 --Thanatos
    MyAvoid[1059]=1 --Missy  
    MyAvoid[1150]=1 --Moonie
    MyAvoid[1087]=1 --Orc Hero
    MyAvoid[1190]=1 --Orc Lord
    MyAvoid[1038]=1 --Osiris 
    MyAvoid[1157]=1 --Pharaoh
    MyAvoid[1159]=1 --Phree  
    MyAvoid[1623]=1 --RSX
    MyAvoid[1492]=1 --Samarai Spectre
    MyAvoid[1251]=1 --Stormy
    MyAvoid[1583]=1 --Tao Gunka
    MyAvoid[1312]=1 --TG 
    MyAvoid[1751]=1 --Valk  
    MyAvoid[1685]=1 --Vesper
    MyAvoid[1630]=1 --White Lady 
    MyAvoid[1873]=1 --Bee 
    MyAvoid[1874]=1 --Bee
    MyAvoid[1871]=1 --Hibram

    -- Non MVPs that you still want to get the hell away from

    MyAvoid[1765]=1 --Valk Mini
    MyAvoid[1829]=1 --SwordGuardian
    MyAvoid[1831]=1 --Salamander
    MyAvoid[1704]=1 --Odium
    MyAvoid[1706]=1 --Maero
    MyAvoid[1705]=1 --Despero
    MyAvoid[1707]=1 --Dolor
    MyAvoid[1720]=1 --Hydro
    MyAvoid[1765]=1 --MayaP
    MyAvoid[1754]=1 --Skeg
    MyAvoid[1755]=1 --Skeg
    MyAvoid[1830]=1 --Bow guardian
    MyAvoid[1839]=1 --Byorgue
    MyAvoid[1700]=1 --Dame
    MyAvoid[1833]=1 --Kasa
    MyAvoid[1837]=1 --Imp
    MyAvoid[1635]=1 --SinX
    MyAvoid[1636]=1 --MS
    MyAvoid[1634]=1 --LK
    MyAvoid[1637]=1 --HP
    MyAvoid[1639]=1 --HWiz
    MyAvoid[1638]=1 --Sniper
                    `,
'AI/USER_AI/H_Config.lua': `
    AggroHP                  = 60
    AggroSP                  = 0
    OldHomunType             = 2
    UseSkillOnly             = 0 
    UseAttackSkill           = 1
    OpportunisticTargeting   = 1
    DoNotChase               = 0
    UseDanceAttack           = 1
    SuperPassive             = 0
    UseIdleWalk              = 4
    IdleWalkSP               = 10
    UseCastleRoute           = 0
    RelativeRoute            = 1
    UseCastleDefend          = 1
    CastleDefendThreshold    = 4
    IdleWalkDistance         = 14
    FleeHP                   = 20
    RescueOwnerLowHP         = 80
    LiveMobID                = 0

    AttackSkillReserveSP     = 80 
    AutoMobMode              = 2 
    AutoMobCount             = 5
    AutoComboMode            = 2
    AutoComboSkill		 = 1
    AutoComboSpheres         = 5
    UseHomunSSkillChase      = 1
    UseHomunSSkillAttack     = 1 
    AutoSkillDelay           = 50
    AoEMaximizeTargets       = 0
    CastTimeRatio		= .80
    UseEiraSilentBreeze      = 1
    EiraSilentBreezeLevel    = 5 
    UseBayeriStahlHorn       = 1
    BayeriStahlHornLevel     = 5
    UseBayeriHailegeStar     = 1
    BayeriHailegeStarLevel   = 5
    UseSeraParalyze          = 1
    SeraParalyzeLevel        = 10
    UseSeraPoisonMist        = 1 
    SeraPoisonMistLevel      = 5
    UseEleanorSonicClaw      = 1
    UseEleanorTinderBreaker  = 1
    EleanorSonicClawLevel    = 5
    EleanorTinderBreakerLevel= 5
    EleanorSilverveinLevel   = 10
    EleanorMidnightLevel     = 10
    UseDieterLavaSlide       = 1 
    DieterLavaSlideLevel     = 5
    UseDefensiveBuff         = 1
    UseOffensiveBuff         = 1 
    UseProvokeOwner          = 0
    ProvokeOwnerMobbed       = 3
    LifEscapeLevel           = 5
    FilirFlitLevel           = 1
    FilirAccelLevel          = 1
    AmiBulwarkLevel          = 5
    UseBayeriAngriffModus    = 1
    UseBayeriGoldenPherze    = 1
    UseDieterMagmaFlow       = 1
    UseDieterGraniticArmor   = 1
    UseDieterPyroclastic     = 1
    UseEiraOveredBoost       = 1
    HealSelfHP               = 80 
    HealOwnerHP              = 90 
    UseAutoHeal              = 3 
    FollowStayBack           = 2
    StationaryAggroDist      = 14
    MobileAggroDist          = 7
    StationaryMoveBounds     = 15
    MobileMoveBounds         = 3
    DoNotUseRest             = 1
    RestXOff                 = 6
    RestYOff                 = 0	
    MoveSticky               = 0
    MoveStickyFight          = 0
    KiteMonsters             = 0
    KiteBounds               = 3 
    KiteStep                 = 3
    KiteParanoidStep         = 3
    KiteThreshold            = 2
    KiteParanoidThreshold    = 2
    KiteParanoid             = 0 
    DefendStandby            = 1 
    StickyStandby            = 0 
    SpawnDelay               = 300
    AutoSkillDelay           = 50
    StandbyFriending         = 1  
    MirAIFriending           = 1  
    UseAvoid                 = 0  
    TankMonsterLimit         = 5
    LavaSlideMode            = 0
    PoisonMistMode           = 1
    AoEReserveSP             = 0

    ChaseSPPause             = 0
    ChaseSPPauseSP 			= -60
    ChaseSPPauseTime         = 2000
    AttackTimeLimit          = 10000

    UseBayeriSteinWand       = 1
    BayeriSteinWandLevel     = 5
    UseSteinWandSelfMob      = 2
    UseSteinWandOwnerMob     = 2
    UseSteinWandTele         = 0 
    StienWandTelePause       = 3000
    AssumeHomun              = 0
    AttackLastFullSP         = 0
    DanceMinSP               = 1
    AutoSkillLimit           = 100
    UseAutoPushback          = 0
    AutoPushbackThreshold    = 2
    AoEFixedLevel            = 1
    UseSeraCallLegion        = 1
    SeraCallLegionLevel      = 5
    ForceKite                = 0
    UseBerserkMobbed         = 3
    UseBerserkSkill          = 1
    UseBerserkAttack         = 1
    Berserk_SkillAlways      = 1
    Berserk_Dance            = 1
    Berserk_IgnoreMinSP      = 0
    Berserk_ComboAlways      = 1
    PVPmode                  = 0
    UseSeraPainkiller        = 0
    DefensiveBuffOwnerMobbed = 0
    PainkillerFriends        = 1
    PainkillerFriendsSave    = 1
    EleanorDoNotSwitchMode   = 0
    LastSavedDate            = "20/09/2024 01:06:02"
    UseEiraXenoSlasher       = 1
    EiraXenoSlasherLevel     = 10
    UseEiraEraseCutter       = 1
    EiraEraseCutterLevel     = 10
    LagReduction             = 0
    HealOwnerBreeze          = 0
    SteinWandTelePause       = 0
    DoNotAttackMoving        = 0
    UseDieterVolcanicAsh     = 1
    UseSmartBulwark          = 1
    DieterPyroclasticLevel   = 0

    --Eleanor New Skills
    EleanorUseBlazingFurious        = 1
    EleanorBlazingFuriousLevel      = 10
    EleanorUseFighterRises          = 0
    EleanorFighterRisesLevel        = 10
                    `,
'AI/USER_AI/H_Extra.lua': `
    -- This is the Extra Options file
    -- NewAutoFriend = 0 -- uncomment this if you're not using AzzyAI for your mercenary.
    -- AggressiveRelogTracking = 1               -- see documentation
    -- AggressiveRelogPath = "./AI/USER_AI/data" -- do not uncomment without reading applicable documentation
    -- AggressiveAutofriend = 1 				-- see documentation

    MyRoute={{0,0}}


    FriendAttack={}			--Set these to 1 to have homun attack 
                    --the target of a friend/owner when the friend is:
    FriendAttack[MOTION_ATTACK]=1	--Attacking normally
    FriendAttack[MOTION_ATTACK2]=1	--Attacking normally
    FriendAttack[MOTION_SKILL]=1	--Uses a skill (which has the normal skill animation)
    FriendAttack[MOTION_CASTING]=1	--Is casting a skill with a casting time
    FriendAttack[MOTION_TOSS]=0	--Uses SpearBoom/AidPot/other "throwing" things
    FriendAttack[MOTION_BIGTOSS]=1	--Uses Acid Bomb
    FriendAttack[MOTION_FULLBLAST]=1	--Uses Full Blast


    BasicDebuffs={}
    BasicDebuffs[MER_CRASH]=	1
    BasicDebuffs[MER_LEXDIVINA]=	1
    BasicDebuffs[MER_DECAGI]=	1
    BasicDebuffs[MA_SANDMAN]=	1
    BasicDebuffs[MA_FREEZINGTRAP]=	1

    --[[
    Tactics switching:
    You may desire to switch your tactics based on conditions. The can be accomplished by making a second tactics file, and including a require "./AI/USER_AI/(your tactics file name)", and uncommenting the lines below
    Replace the "1==1" test with a test of your choice (you can test if a player of a specific ID is on screen with Players[player id]~=nil (this will be true if the player is on the screen)) and so on. 
    This feature is not guaranteed and may not function as intended.
    Dr. Azzy takes no responsibility for your lua programming; I barely take responsibility or my own. 
    ]]--
    --function GetMyTact(e)
    --	if (1==1) then 
    --		return MyTact[e]
    --	else if MyAltTact[e]~= nil then
    --		return MyAltTact[e]
    --	end
    --end


    --Uncomment the lines below to enable expanded logging. See documentation. 
    --LogEnable["AAI_SKILLFAIL"]=1 
    --LogEnable["AAI_CLOSEST"]=1
    --LogEnable["AAI_DANCE"]=1
    --LogEnable["AAI_ACTORS"]=1

    --Uncomment this line to suppress AAI_ERROR logging. This should only be done as a stop-gap measure; if your AAI_ERROR log is filling up with messages, please report this to the developer. 
    --LogEnable["AAI_ERROR"]=1
                    `,
'AI/USER_AI/H_PVP_Tact.lua': `
    MyPVPTact={}
    MyPVPTact[0]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[KOS]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[ENEMY]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[NEUTRAL]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[FRIEND]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[ALLY]={TACT_SNIPE_H,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[RETAINER]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}

                    `,
'AI/USER_AI/H_SkillList.lua': `
    -- H_SkillList.lua	v1.50.1
    -- Converted to Lua by Dr. Azzy from
    -- Mercenary skill list posted by Neo Saro -and-
    -- Homun S skill list ganked from some pserver site.
    -- All skill list and skill info values laboriously hand entered by Dr. Azzy
    -- This may be distributed and used in AIs freely

    MS_BASH			= 8201
    MS_MAGNUM		= 8202
    MS_BOWLINGBASH		= 8203
    MS_PARRYING		= 8204
    MS_REFLECTSHIELD	= 8205
    MS_BERSERK		= 8206
    MA_DOUBLE		= 8207
    MA_SHOWER		= 8208
    MA_SKIDTRAP		= 8209
    MA_LANDMINE		= 8210
    MA_SANDMAN		= 8211
    MA_FREEZINGTRAP		= 8212
    MA_REMOVETRAP		= 8213
    MA_CHARGEARROW		= 8214
    MA_SHARPSHOOTING	= 8215
    ML_PIERCE		= 8216
    ML_BRANDISH		= 8217
    ML_SPIRALPIERCE		= 8218
    ML_DEFENDER		= 8219
    ML_AUTOGUARD		= 8220
    ML_DEVOTION		= 8221
    MER_MAGNIFICAT		= 8222
    MER_QUICKEN		= 8223
    MER_SIGHT		= 8224
    MER_CRASH		= 8225
    MER_REGAIN		= 8226
    MER_TENDER		= 8227
    MER_BENEDICTION		= 8228
    MER_RECUPERATE		= 8229
    MER_MENTALCURE		= 8230
    MER_COMPRESS		= 8231
    MER_PROVOKE		= 8232
    MER_AUTOBERSERK		= 8233
    MER_DECAGI		= 8234
    MER_SCAPEGOAT		= 8235
    MER_LEXDIVINA		= 8236
    MER_ESTIMATION		= 8237

    -- Homunculus Skills
    HLIF_HEAL		= 8001
    HLIF_AVOID		= 8002
    HLIF_CHANGE		= 8004
    HAMI_CASTLE		= 8005
    HAMI_DEFENCE		= 8006
    HAMI_BLOODLUST		= 8008
    HFLI_MOON		= 8009
    HFLI_FLEET		= 8010
    HFLI_SPEED		= 8011
    HFLI_SBR44		= 8012
    HVAN_CAPRICE		= 8013
    HVAN_CHAOTIC		= 8014
    HVAN_SELFDESTRUCT	= 8016

    --Homun S Skills
    MUTATION_BASEJOB 	= 8017
    MH_SUMMON_LEGION 	= 8018
    MH_NEEDLE_OF_PARALYZE 	= 8019
    MH_POISON_MIST 		= 8020
    MH_PAIN_KILLER 		= 8021
    MH_LIGHT_OF_REGENE 	= 8022
    MH_OVERED_BOOST		= 8023
    MH_ERASER_CUTTER 	= 8024
    MH_XENO_SLASHER 	= 8025
    MH_SILENT_BREEZE 	= 8026
    MH_STYLE_CHANGE 	= 8027
    MH_SONIC_CRAW 		= 8028
    MH_SILVERVEIN_RUSH 	= 8029
    MH_MIDNIGHT_FRENZY 	= 8030
    MH_STAHL_HORN 		= 8031
    MH_GOLDENE_FERSE 	= 8032
    MH_STEINWAND		= 8033
    MH_HEILIGE_STANGE 	= 8034
    MH_ANGRIFFS_MODUS 	= 8035
    MH_TINDER_BREAKER 	= 8036
    MH_CBC 			= 8037
    MH_EQC 			= 8038
    MH_MAGMA_FLOW 		= 8039
    MH_GRANITIC_ARMOR 	= 8040
    MH_LAVA_SLIDE 		= 8041
    MH_PYROCLASTIC 		= 8042
    MH_VOLCANIC_ASH 	= 8043
    MH_BLAST_FORGE          = 8044
    MH_TEMPERING            = 8045
    MH_CLASSY_FLUTTER       = 8046
    MH_TWISTER_CUTTER       = 8047
    MH_ABSOLUTE_ZEPHYR      = 8048
    MH_BRUSHUP_CLAW         = 8049
    MH_BLAZING_AND_FURIOUS  = 8050
    MH_THE_ONE_FIGHTER_RISES= 8051
    MH_POLISHING_NEEDLE     = 8052
    MH_TOXIN_OF_MANDARA     = 8053
    MH_NEEDLE_STINGER       = 8054
    MH_LICHT_GEHORN         = 8055
    MH_GLANZEN_SPIES        = 8056
    MH_HEILIGE_PFERD        = 8057
    MH_GOLDENE_TONE         = 8058
    MH_BLAZING_LAVA         = 8059


    --HomTypeMap[moduledtype]=HomType
    HomTypeMap={}
    HomTypeMap[0]=VANILMIRTH
    HomTypeMap[1]=LIF
    HomTypeMap[2]=AMISTR
    HomTypeMap[3]=FILIR


    --SkillList[homuntype][skillid]=level
    SkillList={}
    SkillList[LIF]={}
    SkillList[LIF][HLIF_HEAL]=5
    SkillList[LIF][HLIF_AVOID]=5
    SkillList[LIF][HLIF_CHANGE]=3
    SkillList[AMISTR]={}
    SkillList[AMISTR][HAMI_CASTLE]=5
    SkillList[AMISTR][HAMI_DEFENCE]=5
    SkillList[AMISTR][HAMI_BLOODLUST]=3
    SkillList[FILIR]={}
    SkillList[FILIR][HFLI_MOON]=5
    SkillList[FILIR][HFLI_FLEET]=5
    SkillList[FILIR][HFLI_SPEED]=5
    SkillList[FILIR][HFLI_SBR44]=3
    SkillList[VANILMIRTH]={}
    SkillList[VANILMIRTH][HVAN_CAPRICE]=5
    SkillList[VANILMIRTH][HVAN_CHAOTIC]=5
    SkillList[VANILMIRTH][HVAN_SELFDESTRUCT]=3
    SkillList[SERA]={}
    SkillList[SERA][MH_SUMMON_LEGION]=5
    SkillList[SERA][MH_NEEDLE_OF_PARALYZE]=10
    SkillList[SERA][MH_POISON_MIST]=5
    SkillList[SERA][MH_PAIN_KILLER]=10
    SkillList[SERA][MH_POLISHING_NEEDLE]=10
    SkillList[SERA][MH_TOXIN_OF_MANDARA]=10
    SkillList[SERA][MH_NEEDLE_STINGER]=10
    SkillList[EIRA]={}
    SkillList[EIRA][MH_LIGHT_OF_REGENE]=5
    SkillList[EIRA][MH_OVERED_BOOST]=5
    SkillList[EIRA][MH_ERASER_CUTTER]=10
    SkillList[EIRA][MH_XENO_SLASHER]=10
    SkillList[EIRA][MH_SILENT_BREEZE]=5
    SkillList[EIRA][MH_ABSOLUTE_ZEPHYR]=10
    SkillList[ELEANOR]={}
    SkillList[ELEANOR][MH_STYLE_CHANGE]=1
    SkillList[ELEANOR][MH_SONIC_CRAW]=5
    SkillList[ELEANOR][MH_SILVERVEIN_RUSH]=10
    SkillList[ELEANOR][MH_MIDNIGHT_FRENZY]=10
    SkillList[ELEANOR][MH_TINDER_BREAKER]=5
    SkillList[ELEANOR][MH_CBC]=5
    SkillList[ELEANOR][MH_EQC]=5
    SkillList[ELEANOR][MH_BRUSHUP_CLAW]=10
    SkillList[ELEANOR][MH_BLAZING_AND_FURIOUS]=10
    SkillList[ELEANOR][MH_THE_ONE_FIGHTER_RISES]=10
    SkillList[BAYERI]={}
    SkillList[BAYERI][MH_STAHL_HORN]=10
    SkillList[BAYERI][MH_GOLDENE_FERSE]=5
    SkillList[BAYERI][MH_STEINWAND]=5
    SkillList[BAYERI][MH_HEILIGE_STANGE]=10
    SkillList[BAYERI][MH_ANGRIFFS_MODUS]=5
    SkillList[BAYERI][MH_LICHT_GEHORN]=10
    SkillList[BAYERI][MH_GLANZEN_SPIES]=10
    SkillList[BAYERI][MH_HEILIGE_PFERD]=10
    SkillList[BAYERI][MH_GOLDENE_TONE]=10
    SkillList[DIETER]={}
    SkillList[DIETER][MH_MAGMA_FLOW]=5
    SkillList[DIETER][MH_GRANITIC_ARMOR]=5
    SkillList[DIETER][MH_LAVA_SLIDE]=10
    SkillList[DIETER][MH_PYROCLASTIC]=10
    SkillList[DIETER][MH_VOLCANIC_ASH]=5
    SkillList[DIETER][MH_BLAST_FORGE]=10
    SkillList[DIETER][MH_TEMPERING]=10
    SkillList[DIETER][MH_BLAZING_LAVA]=10

    --SkillListM[mertype][skillid]=level

    --SkillInfo Tables
    --SkillInfo[id][1]=name
    --SkillInfo[id][2]=range
    --SkillInfo[id][3]=sp cost
    --SkillInfo[id][4]=Fixed cast (ms)
    --SkillInfo[id][5]=Variable cast (ms)
    --SkillInfo[id][6]=Delay (ms)
    --SkillInfo[id][7]=target mode (0 = self targeted, 1 = enemy targeted, 2 = ground targeted) 
    --SkillInfo[id][8]=Duration (ms)
    --SkillInfo[id][9]=Reuse Delay (ms)
    --SkillInfo[id]={name,range,SP cost,Cast Time (fixed),Cast Time (variable),Delay,TargetType,Duration1,Cooldown)
    SkillInfo={}
    SkillInfo[0]={"No Skill",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0}}
    SkillInfo[HLIF_HEAL]={"Healing Hands",{0,0,0,0,0},{13,16,19,22,25},{0,0,0,0,0},{0,0,0,0,0},{20000,20000,20000,20000,20000},0,{0,0,0,0,0},{5000,5000,5000,5000,5000}}
    SkillInfo[HLIF_AVOID]={"Urgent Escape",{0,0,0,0,0},{20,25,30,35,40},{0,0,0,0,0},{0,0,0,0,0},{1000,1000,1000,1000,1000},0,{40000,35000,35000,35000,35000}}
    SkillInfo[HLIF_CHANGE]={"Mental Charge",{0,0,0},{100,100,100},{0,0,0},{0,0,0},{2000,2000,2000},0,{370000,790000,1210000}}
    SkillInfo[HAMI_CASTLE]={"Castling",{0,0,0,0,0},{10,10,10,10,10},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},0}
    SkillInfo[HAMI_DEFENCE]={"Amistr Bulwark",{0,0,0,0,0},{20,25,30,35,40},{0,0,0,0,0},{0,0,0,0,0},{1000,1000,1000,1000,1000},0,{40000,35000,30000,30000,30000},{40000,35000,30000,30000,30000}}
    SkillInfo[HAMI_BLOODLUST]={"Bloodlust",{0,0,0},{120,120,120},{0,0,0},{0,0,0},{2000,2000,2000},0,{310000,610000,910000}}
    SkillInfo[HFLI_MOON]={"Moonlight",1,{4,8,12,16,20},0,0,0,1,0,2000}
    SkillInfo[HFLI_FLEET]={"Flitting",{0,0,0,0,0},{30,40,50,60,70},{0,0,0,0,0},{0,0,0,0,0},{1000,1000,1000,1000,1000},0,{60000,70000,80000,90000,120000}}
    SkillInfo[HFLI_SPEED]={"Accellerated Flight",{0,0,0,0,0},{30,40,50,60,70},{0,0,0,0,0},{0,0,0,0,0},{1000,1000,1000,1000,1000},0,{60000,70000,80000,90000,120000}}
    SkillInfo[HFLI_SBR44]={"SBR 44",{1,1,1},{1,1,1},{0,0,0},{0,0,0},{0,0,0},1}
    SkillInfo[HVAN_CAPRICE]={"Caprice",{9,9,9,9,9},{22,24,26,28,30},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},1,{0,0,0,0,0},{2000,2200,2400,2600,2800}}
    SkillInfo[HVAN_CHAOTIC]={"Chaotic Blessing",{0,0,0,0,0},{40,40,40,40,40},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},0,{0,0,0,0,0},{3500,3500,3500,3500,3500}}
    SkillInfo[HVAN_SELFDESTRUCT]={"Self Destruct",{0,0,0},{15,15,15},{0,0,0},{0,0,0},{0,0,0},0}
    SkillInfo[MH_SUMMON_LEGION]={"Summon Legion",{9,9,9,9,9},{60,80,100,120,140},{400,600,800,1000,1200},{1600,1400,1200,1000,800},{2000,2000,2000,2000,2000},1,{20000,30000,40000,50000,60000},{20000,30000,40000,50000,60000}}
    SkillInfo[MH_NEEDLE_OF_PARALYZE]={"Needle of Paralysis",{5,5,5,5,5,5,5,5,5,5},{42,48,54,60,66,72,78,84,90,96},{500,500,500,400,400,400,300,300,300,200},{1000,1000,1000,1100,1100,1100,1200,1200,1200,1300},{2000,2000,2000,2000,2000,2000,2000,2000,2000,2000},1,{12000,12000,12000,14000,14000,14000,16000,16000,16000,18000},{12000,12000,12000,14000,14000,14000,16000,16000,16000,18000}}
    SkillInfo[MH_POISON_MIST]={"Poison Mist",{5,5,5,5,5},{65,75,85,95,105},{500,500,500,500,500},{500,700,900,1100,1300},{0,0,0,0,0},2,{12000,14000,16000,18000,20000},{12500,14500,16500,18500,20500}}
    SkillInfo[MH_PAIN_KILLER]={"Painkiller",{5,5,5,5,5,5,5,5,5,5},{48,52,56,60,64,68,72,76,80,84},{1000,900,800,700,600,500,400,300,200,100},{1000,1100,1200,1300,1400,1500,1600,1700,1800,1900},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},1,{29000,39000,49000,59000,69000,79000,89000,99000,109000,119000}}
    SkillInfo[MH_LIGHT_OF_REGENE]={"Ray of Regeneration",{0,0,0,0,0},{50,50,60,70,80},{1600,1400,1200,1000,800},{0,0,0,0,0},{0,0,0,0,0},0,{360000,420000,480000,540000,600000}}
    SkillInfo[MH_OVERED_BOOST]={"Overed Boost",{0,0,0,0,0},{70,90,110,130,150},{200,300,400,500,600},{800,700,600,500,400},{500,500,500,500,500},0,{30000,45000,60000,75000,90000}}
    SkillInfo[MH_ERASER_CUTTER]={"Erased Cutter",{7,7,7,7,7,7,7,7,7,7},{25,30,35,40,45,50,55,60,65,70},{0,0,0,0,0,0,0,0,0,0},{1500,1500,1500,2000,2000,2000,2500,2500,2500,3000},{2000,2000,2000,2000,2000,2000,2000,2000,2000,2000},1}
    SkillInfo[MH_XENO_SLASHER]={"Xenoslasher",{7,7,7,7,7,7,7,7,7,7},{85,90,95,100,105,110,115,120,125,130},{500,500,500,500,500,500,500,500,500,500},{1700,1900,2100,2300,2500,2700,2900,3100,3300,3500},{0,0,0,0,0,0,0,0,0,0},2}
    SkillInfo[MH_SILENT_BREEZE]={"Silent Breeze",{5,5,7,7,9},{45,54,63,72,81},{1000,800,600,400,200},{1000,1200,1400,1600,1800},{2000,2000,2000,2000,2000},1}
    SkillInfo[MH_STYLE_CHANGE]={"Style Change",3,35,0,0,0,0,0,0}
    SkillInfo[MH_SONIC_CRAW]={"Sonic Claw",1,{20,25,30,35,40},0,0,0,1,0,1000}
    SkillInfo[MH_SILVERVEIN_RUSH]={"Silvervein Rush",1,{17,19,21,23,25,27,29,31,33,35},0,0,0,0,5000,1500}
    SkillInfo[MH_MIDNIGHT_FRENZY]={"Midnight Frenzy",1,{18,21,24,27,30,33,36,39,42,45},0,0,0,0,10000,1500}
    SkillInfo[MH_STAHL_HORN]={"Stahl Horn",{5,6,7,8,9,10,11,12,13,14},{40,45,50,55,60,65,70,75,80,85},{200,400,600,800,1000,1200,1400,1600,1800,2000},{800,600,400,200,0,0,0,0,0,0},{3000,3000,3000,3000,3000,3000,3000,3000,3000,3000},1}
    SkillInfo[MH_GOLDENE_FERSE]={"Golden Pherze",{0,0,0,0,0},{60,65,70,75,80},{0,0,0,0,0},{1000,1200,1400,1600,1800},{500,500,500,500,500},0,{30000,45000,60000,75000,90000}}
    SkillInfo[MH_STEINWAND]={"Steinbent",{0,0,0,0,0},{80,90,100,110,120},{0,0,0,0,0},{1000,1000,1000,1000,1000},{500,500,500,500,500},0,{30000,45000,60000,75000,90000},{30000,45000,60000,75000,90000},{30000,45000,60000,75000,90000}}
    SkillInfo[MH_HEILIGE_STANGE]={"Hailege Star",{9,9,9,9,9,9,9,9,9,9},{60,68,76,84,100,108,116,124,130,138},{1800,1600,1400,1200,1000,1000,1000,1000,1000,1000},{200,400,600,800,1000,1000,1000,1000,1000,1000},{5000,5000,5000,5000,5000,5000,5000,5000,5000,5000},1}
    SkillInfo[MH_ANGRIFFS_MODUS]={"Angriff Modus",{0,0,0,0,0},{60,65,70,75,80},{0,0,0,0,0},{200,400,600,800,1000},{500,500,500,500,500},0,{30000,45000,60000,75000,90000}}
    SkillInfo[MH_TINDER_BREAKER]={"Tinder Breaker",{3,4,5,6,7},{20,25,30,35,40},0,0,0,1,0,0}
    SkillInfo[MH_CBC]={"CBC",3,{10,20,30,40,50},0,0,0,0,0,0}
    SkillInfo[MH_EQC]={"EQC",3,{24,28,32,36,40},0,0,0,0,0,0}
    SkillInfo[MH_MAGMA_FLOW]={"Magma Flow",{0,0,0,0,0},{34,38,42,46,50},{2000,1500,1000,500,0},{2000,2500,3000,3500,4000},{500,500,500,500,500},0,{30000,45000,60000,75000,90000}}
    SkillInfo[MH_GRANITIC_ARMOR]={"Granitic Armor",{0,0,0,0,0},{54,58,62,66,70},{1000,1000,1000,1000,1000},{5000,4500,4000,3500,3000},{500,500,500,500,500},0,{60000,60000,60000,60000,60000}}
    SkillInfo[MH_LAVA_SLIDE]={"Lava Slide",{7,7,7,7,7,7,7,7,7,7},{40,45,50,55,60,65,70,75,80,85},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},{5000,5000,5000,4500,4500,4500,4000,4000,4000,3500},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},2,{8000,10000,12000,14000,16000,18000,20000,22000,24000,26000},{5000,5000,5000,5000,5000,5000,5000,5000,5000,5000}}
    SkillInfo[MH_PYROCLASTIC]={"Pyroclastic",{0,0,0,0,0,0,0,0,0,0},{20,28,36,44,52,60,68,76,84,92},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},{5000,4500,4000,3500,3000,2500,2000,1500,1000,500},{500,500,500,500,500,500,500,500,500,500},0,{60000,90000,120000,150000,180000,180000,180000,180000,180000,180000}}
    SkillInfo[MH_VOLCANIC_ASH]={"Volcanic Ash",{7,7,7,7,7},{60,65,70,75,80},{1000,1000,1000,1000,1000},{4000,3500,3000,2500,2000},{700,700,700,700,700},2,{12000,14000,16000,18000,20000}}
    SkillInfo[MH_BLAST_FORGE]={"Blast Forge",{1,1,1,1,1,1,1,1,1,1},{60,68,76,84,100,108,116,124,130,138},{1800,1600,1400,1200,1000,1000,1000,1000,1000,1000},2,{5000,5000,5000,5000,5000,5000,5000,5000,5000,5000},1}
    SkillInfo[MH_TEMPERING]={"Tempering",{0,0,0,0,0,0,0,0,0,0},{83,91,99,107,115,123,131,139,147,155},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},0,{45000,60000,75000,90000,105000,120000,135000,150000,165000,180000}}
    SkillInfo[MH_CLASSY_FLUTTER]={"Classy Flutter",{0,0,0,0,0,0,0,0,0,0},{83,91,99,107,115,123,131,139,147,155},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},0,{45000,60000,75000,90000,105000,120000,135000,150000,165000,180000}}
    SkillInfo[MH_TWISTER_CUTTER]={"Twister Cutter",{7,7,7,7,7,7,7,7,7,7},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_ABSOLUTE_ZEPHYR]={"Absolute Zephyr",{7,7,7,7,7,7,7,7,7,7},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_BRUSHUP_CLAW]={"Brushup Claw",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_BLAZING_AND_FURIOUS]={"Blazing And Furious",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_THE_ONE_FIGHTER_RISES]={"The One Fighter Rises",{7,7,7,7,7,7,7,7,7,7},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_POLISHING_NEEDLE]={"Polishing Needle",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_TOXIN_OF_MANDARA]={"Toxin Of Mandara",{1,1,1,1,1,1,1,1,1,1},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_NEEDLE_STINGER]={"Needle Stinger",{7,7,7,7,7,7,7,7,7,7},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_LICHT_GEHORN]={"Licht Gehorn",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_GLANZEN_SPIES]={"Glanzen Spies",{3,3,3,3,3,3,3,3,3,3},{10,15,20,25,30,35,40,45,50,55},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_HEILIGE_PFERD]={"Heilige Pferd",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_GOLDENE_TONE]={"Goldene Tone",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}
    SkillInfo[MH_BLAZING_LAVA]={"Blazing Lava",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},0}

    --SkillAOEInfo[skill]={AoE size (size on a side of the AoE - by level),Target Type (0=centered on enemy, 1=centered on caster, skill-id=special - handled in GetAOECount)), other fields for future use}
    SkillAOEInfo={}
    SkillAOEInfo[0]={{0,0,0,0,0},0}
    SkillAOEInfo[MH_VOLCANIC_ASH]={{3,3,3,3,3},0}
    SkillAOEInfo[MH_POISON_MIST]={{7,7,7,7,7},0}
    SkillAOEInfo[MH_LAVA_SLIDE]={{3,3,5,5,7},0}
    SkillAOEInfo[MH_XENO_SLASHER]={{3,3,3,5,5,5,7,7,7,9},0}
    SkillAOEInfo[MH_HEILIGE_STANGE]={{3,3,3,3,5,5,5,5,5,5},0}
    SkillAOEInfo[HVAN_SELFDESTRUCT]={{9,9,9},1}
    SkillAOEInfo[MH_BLAST_FORGE]={{3,3,3,3,5,5,5,5,5,5},0}
    SkillAOEInfo[MH_HEILIGE_PFERD]={{1,1,1,1,2,2,2,3,3},0}
                    `,
'AI/USER_AI/H_Tactics.lua': `
    MyTact={}
    MyTact[0]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_SELF,60,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Default
    MyTact[13]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Treasure Box
    MyTact[1005]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.5,CHASE_NORMAL} --Familiar
    MyTact[1038]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Osiris
    MyTact[1039]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Bafomé
    MyTact[1042]={TACT_ATTACK_L,-1,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_OLD,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Steel Chonchon
    MyTact[1046]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Doppel
    MyTact[1059]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Misstress
    MyTact[1078]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Red Plant
    MyTact[1079]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Blue Plant
    MyTact[1080]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Green Plant
    MyTact[1081]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Yellow Plant
    MyTact[1082]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --White Plant
    MyTact[1083]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Shining Plant
    MyTact[1084]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Red Mushroom
    MyTact[1085]={TACT_ATTACK_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Black Mushroom
    MyTact[1086]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --GTB
    MyTact[1087]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --OrcHero
    MyTact[1112]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Drake
    MyTact[1115]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Eddga
    MyTact[1147]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Maya
    MyTact[1150]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Moonlight
    MyTact[1152]={TACT_SNIPE_M,-3,KITE_ALWAYS,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Orc Skeleton
    MyTact[1153]={TACT_ATTACK_H,SKILL_NEVER,KITE_ALWAYS,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Orc Zombie
    MyTact[1157]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Faraó
    MyTact[1159]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Freooni
    MyTact[1177]={TACT_SNIPE_H,-4,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Zenorc
    MyTact[1189]={TACT_REACT_H,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,2,CHASE_ALWAYS} --Orc Archer
    MyTact[1190]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Orclord
    MyTact[1312]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --GT
    MyTact[1373]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --SenhorDosMortos
    MyTact[1389]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Drácula
    MyTact[1511]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --AmonRá
    MyTact[1555]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Parasite Summon
    MyTact[1575]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.6,CHASE_NORMAL} --Flora Summon
    MyTact[1579]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.3,CHASE_NORMAL} --Hydra Summon
    MyTact[1583]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --TaoGunka
    MyTact[1589]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.1,CHASE_NORMAL} --Mandragora Summon
    MyTact[1590]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Geographer Summon
    MyTact[1623]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --RSX
    MyTact[1688]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --LadyTanee
    MyTact[2158]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0.5,CHASE_NORMAL} --Sera Legion (Hornet)
    MyTact[2159]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Sera Legion (Giant)
    MyTact[2160]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,2,CHASE_NORMAL} --Sera Legion (Vespa)
    MyTact[2194]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Polvo
    MyTact[2202]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Kraken
    MyTact[2218]={TACT_IGNORE,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Giant Octopus
    MyTact[2219]={TACT_IGNORE,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Octopus Leg
    MyTact[2308]={TACT_REACT_L,SKILL_NEVER,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Kag/Obo Clones
    MyTact[2379]={TACT_ATTACK_L,100,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_OWNER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Stupid event monsters
    MyTact[2380]={TACT_ATTACK_L,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_OWNER,-1,SNIPE_OK,KS_NEVER,0,CHASE_NORMAL} --Stupid event monsters
    TactLastSavedDate        = "20/09/2024 01:06:03"
                    `,
'AI/USER_AI/M_Config.lua': `

    AggroHP                  = 60
    AggroSP                  = 0
    OldHomunType			= 3
    UseSkillOnly             = -1 
    UseAttackSkill           = 1
    OpportunisticTargeting   = 1
    DoNotChase               = 0
    UseDanceAttack           = 0
    SuperPassive             = 0
    AttackLastHPSP			=80
    UseIdleWalk              = 2
    IdleWalkSP               = 80
    IdleWalkDistance         = 4
    RelativeRoute            = 1
    AutoDetectPlants		=1
    FleeHP                   = 0

    -- Attack skill options
    AttackSkillReserveSP     = 0 
    AutoMobMode              = 2 
    AutoMobCount             = 2
    AutoComboMode		=1
    AutoComboSkill		=0
    AutoComboSpheres	=10
    UseAutoPushback          = 0
    AutoPushbackThreshold    = 2
    UseHomunSSkillChase = 1
    UseHomunSSkillAttack = 1 
    AutoSkillDelay           = 100 
    AoEMaximizeTargets       = 0
    CastTimeRatio		= .80


    --Autobuff options

    UseDefensiveBuff         = 1
    UseOffensiveBuff         = 1 
    UseProvokeOwner          = 1
    UseProvokeSelf		=0
    UseSacrificeOwner        = 0
    UseAutoMag               = 0
    UseAutoSight             = 1
    DefensiveBuffOwnerHP     = 0
    UseBlessingOwner         = 1
    UseBlessingSelf          = 0
    UseIncAgiSelf            = 0
    UseIncAgiOwner           = 1
    UseKyrieSelf             = 0
    UseKyrieOwner            = 0


    FollowStayBack           = 2
    StationaryAggroDist      = 15
    MobileAggroDist          = 15
    StationaryMoveBounds     = 14
    MobileMoveBounds         = 9
    DoNotUseRest             = 0
    RestXOff                 = -2
    RestYOff                 = 0	

    MoveSticky               = 0
    MoveStickyFight          = 0

    --Kiting options:
    KiteMonsters             = 1
    KiteBounds               = 10 
    KiteStep                 = 5
    KiteParanoidStep         = 2
    KiteThreshold            = 3
    KiteParanoidThreshold    = 2
    KiteParanoid             = 0 

    --Standby Behavior:
    DefendStandby            = 0 
    StickyStandby            = 1 


    --Advanced Timing settings 
    SpawnDelay               = 1000
    AutoSkillDelay           = 100
    AttackTimeLimit          = 10000
    --Berzerk Settings:

    UseBerzerkMobbed         = 0 
    UseBerzerkSkill          = 0 
    UseBerzerkAttack         = 0 
    Berzerk_SkillAlways      = 0 
    Berzerk_Dance            = 0
    Berzerk_IgnoreMinSP      = 0 


    --Misc settings:
    StandbyFriending         = 1  
    MirAIFriending           = 1  
    TankMonsterLimit         = 4

    AssumeHomun              = 1
    AutoDetectPlant          = 0
    RescueOwnerLowHP         = 0
    AttackLastFullSP         = 0
    AutoSkillLimit           = 100
    AoEReserveSP             = 0
    AoEFixedLevel            = 1
    ChaseSPPause             = 0
    ChaseSPPauseSP           = 0
    ChaseSPPauseTime         = 0
    DefensiveBuffOwnerMobbed = 0
    ForceKite                = 0
    UseBerserkMobbed         = 0
    UseBerserkSkill          = 0
    UseBerserkAttack         = 0
    Berserk_SkillAlways      = 0
    Berserk_Dance            = 0
    Berserk_IgnoreMinSP      = 0
    PVPmode                  = 0
    ProvokeOwnerMobbed       = 0
    LastSavedDate            = "20/09/2024 01:06:02"
    LagReduction             = 1
    LiveMobID                = 0
    DoNotAttackMoving        = 0
                    `,
'AI/USER_AI/M_Extra.lua': `
    -- This is the Extra Options file
    -- NewAutoFriend = 0 -- uncomment this if you're not using AzzyAI for your homun.
    -- AggressiveRelogTracking = 1               -- see documentation
    -- AggressiveRelogPath = "./AI/USER_AI/data" -- do not uncomment without reading applicable documentation
    -- AggressiveAutofriend = 1 				-- see documentation


    MyRoute={{0,0}}

    FriendAttack={}			--Set these to 1 to have homun attack 
                    --the target of a friend/owner when the friend is:
    FriendAttack[MOTION_ATTACK]=1	--Attacking normally
    FriendAttack[MOTION_ATTACK2]=1	--Attacking normally
    FriendAttack[MOTION_SKILL]=1	--Uses a skill (which has the normal skill animation)
    FriendAttack[MOTION_CASTING]=1	--Is casting a skill with a casting time
    FriendAttack[MOTION_TOSS]=0	--Uses SpearBoom/AidPot/other "throwing" things
    FriendAttack[MOTION_BIGTOSS]=1	--Uses Acid Bomb
    FriendAttack[MOTION_FULLBLAST]=1	--Uses Full Blast


    BasicDebuffs={}
    BasicDebuffs[MER_CRASH]=	1
    BasicDebuffs[MER_LEXDIVINA]=	1
    BasicDebuffs[MER_DECAGI]=	1
    BasicDebuffs[MA_SANDMAN]=	1
    BasicDebuffs[MA_FREEZINGTRAP]=	1


    --Uncomment the lines below to enable logging of skill failure detection and Closest() (respectively)
    --LogEnable["AAI_SKILLFAIL"]=1 
    --LogEnable["AAI_CLOSEST"]=1
    --LogEnable["AAI_DANCE"]=1
    --LogEnable["AAI_ACTORS"]=1
    --LogEnable["AAI_LAG"]=1

    --Uncomment this line to suppress AAI_ERROR logging. This should only be done as a stop-gap measure; if your AAI_ERROR log is filling up with messages, please report this to the developer. 
    --LogEnable["AAI_ERROR"]=0
                    `,
'AI/USER_AI/M_PVP_Tact.lua': `
    MyPVPTact={}
    MyPVPTact[0]={TACT_REACT_L,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_S,RESCUE_NEVER}
    MyPVPTact[KOS]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[ENEMY]={TACT_REACT_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[NEUTRAL]={TACT_REACT_M,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[FRIEND]={TACT_IGNORE,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[ALLY]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}
    MyPVPTact[RETAINER]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER}

                    `,
'AI/USER_AI/M_SkillList.lua': `
    -- M_SkillList.lua	v1.50
    -- The skill lists are separated because the idiots used the same numbers for homun and merc types!
    -- Converted to Lua by Dr. Azzy from
    -- Mercenary skill list posted by Neo Saro -and-
    -- Homun S skill list ganked from some pserver site.
    -- All skill list and skill info values laboriously hand entered by Dr. Azzy
    -- This may be distributed and used in AIs freely

    HEAL			= 28
    MS_BASH			= 8201
    MS_MAGNUM		= 8202
    MS_BOWLINGBASH		= 8203
    MS_PARRYING		= 8204
    MS_REFLECTSHIELD	= 8205
    MS_BERSERK		= 8206
    MA_DOUBLE		= 8207
    MA_SHOWER		= 8208
    MA_SKIDTRAP		= 8209
    MA_LANDMINE		= 8210
    MA_SANDMAN		= 8211
    MA_FREEZINGTRAP		= 8212
    MA_REMOVETRAP		= 8213
    MA_CHARGEARROW		= 8214
    MA_SHARPSHOOTING	= 8215
    ML_PIERCE		= 8216
    ML_BRANDISH		= 8217
    ML_SPIRALPIERCE		= 8218
    ML_DEFENDER		= 8219
    ML_AUTOGUARD		= 8220
    ML_DEVOTION		= 8221
    MER_MAGNIFICAT		= 8222
    MER_QUICKEN		= 8223
    MER_SIGHT		= 8224
    MER_CRASH		= 8225
    MER_REGAIN		= 8226
    MER_TENDER		= 8227
    MER_BENEDICTION		= 8228
    MER_RECUPERATE		= 8229
    MER_MENTALCURE		= 8230
    MER_COMPRESS		= 8231
    MER_PROVOKE		= 8232
    MER_AUTOBERSERK		= 8233
    MER_DECAGI		= 8234
    MER_SCAPEGOAT		= 8235
    MER_LEXDIVINA		= 8236
    MER_ESTIMATION		= 8237
    MER_KYRIE			= 8238
    MER_BLESSING		= 8239
    MER_INCAGI			= 8240

    -- Homunculus Skills
    HLIF_HEAL		= 8001
    HLIF_AVOID		= 8002
    HLIF_CHANGE		= 8004
    HAMI_CASTLE		= 8005
    HAMI_DEFENCE		= 8006
    HAMI_BLOODLUST		= 8008
    HFLI_MOON		= 8009
    HFLI_FLEET		= 8010
    HFLI_SPEED		= 8011
    HFLI_SBR44		= 8012
    HVAN_CAPRICE		= 8013
    HVAN_CHAOTIC		= 8014
    HVAN_SELFDESTRUCT	= 8016

    --Homun S Skills
    MUTATION_BASEJOB 	= 8017
    MH_SUMMON_LEGION 	= 8018
    MH_NEEDLE_OF_PARALYZE 	= 8019
    MH_POISON_MIST 		= 8020
    MH_PAIN_KILLER 		= 8021
    MH_LIGHT_OF_REGENE 	= 8022
    MH_OVERED_BOOST		= 8023
    MH_ERASER_CUTTER 	= 8024
    MH_XENO_SLASHER 	= 8025
    MH_SILENT_BREEZE 	= 8026
    MH_STYLE_CHANGE 	= 8027
    MH_SONIC_CRAW 		= 8028
    MH_SILVERVEIN_RUSH 	= 8029
    MH_MIDNIGHT_FRENZY 	= 8030
    MH_STAHL_HORN 		= 8031
    MH_GOLDENE_FERSE 	= 8032
    MH_STEINWAND		= 8033
    MH_HEILIGE_STANGE 	= 8034
    MH_ANGRIFFS_MODUS 	= 8035
    MH_TINDER_BREAKER 	= 8036
    MH_CBC 			= 8037
    MH_EQC 			= 8038
    MH_MAGMA_FLOW 		= 8039
    MH_GRANITIC_ARMOR 	= 8040
    MH_LAVA_SLIDE 		= 8041
    MH_PYROCLASTIC 		= 8042
    MH_VOLCANIC_ASH 	= 8043
    MH_BLAST_FORGE          = 8044
    MH_TEMPERING            = 8045
    MH_CLASSY_FLUTTER       = 8046
    MH_TWISTER_CUTTER       = 8047
    MH_ABSOLUTE_ZEPHYR      = 8048
    MH_BRUSHUP_CLAW         = 8049
    MH_BLAZING_AND_FURIOUS  = 8050
    MH_THE_ONE_FIGHTER_RISES= 8051
    MH_POLISHING_NEEDLE     = 8052
    MH_TOXIN_OF_MANDARA     = 8053
    MH_NEEDLE_STINGER       = 8054
    MH_LICHT_GEHORN         = 8055
    MH_GLANZEN_SPIES        = 8056
    MH_HEILIGE_PFERD        = 8057
    MH_GOLDENE_TONE         = 8058
    MH_BLAZING_LAVA         = 8059

    SkillList={}
    SkillList[ARCHER01]={}
    SkillList[ARCHER02]={}
    SkillList[ARCHER03]={}
    SkillList[ARCHER04]={}
    SkillList[ARCHER05]={}
    SkillList[ARCHER06]={}
    SkillList[ARCHER07]={}
    SkillList[ARCHER08]={}
    SkillList[ARCHER09]={}
    SkillList[ARCHER10]={}
    SkillList[LANCER01]={}
    SkillList[LANCER02]={}
    SkillList[LANCER03]={}
    SkillList[LANCER04]={}
    SkillList[LANCER05]={}
    SkillList[LANCER06]={}
    SkillList[LANCER07]={}
    SkillList[LANCER08]={}
    SkillList[LANCER09]={}
    SkillList[LANCER10]={}
    SkillList[SWORDMAN01]={}
    SkillList[SWORDMAN02]={}
    SkillList[SWORDMAN03]={}
    SkillList[SWORDMAN04]={}
    SkillList[SWORDMAN05]={}
    SkillList[SWORDMAN06]={}
    SkillList[SWORDMAN07]={}
    SkillList[SWORDMAN08]={}
    SkillList[SWORDMAN09]={}
    SkillList[SWORDMAN10]={}
    SkillList[UNKNOWNMER]={}
    SkillList[WILDROSE]={}
    SkillList[DOPPLEMERC]={}
    SkillList[ALICE]={}
    SkillList[MIMIC]={}
    SkillList[DISGUISE]={}
    SkillList[GMMALE]={}
    SkillList[PENGINEER]={}
    SkillList[ISIS]={}

    SkillList[SWORDMAN01][MS_BASH]=1
    SkillList[SWORDMAN05][MS_BASH]=5
    SkillList[SWORDMAN07][MS_BASH]=10
    SkillList[SWORDMAN10][MS_BASH]=10
    SkillList[WILDROSE][MS_BASH]=5
    SkillList[DOPPLEMERC][MS_BASH]=5
    SkillList[MIMIC][MS_BASH]=5
    SkillList[LANCER01][ML_PIERCE]=1
    SkillList[LANCER03][ML_PIERCE]=2
    SkillList[LANCER05][ML_PIERCE]=5
    SkillList[LANCER08][ML_PIERCE]=10
    SkillList[LANCER10][ML_SPIRALPIERCE]=5
    SkillList[ARCHER01][MA_DOUBLE]=2
    SkillList[ARCHER05][MA_DOUBLE]=5
    SkillList[ARCHER06][MA_DOUBLE]=7
    SkillList[ARCHER09][MA_DOUBLE]=10
    SkillList[ARCHER10][MA_SHARPSHOOTING]=5
    SkillList[ARCHER03][MA_CHARGEARROW]=1
    SkillList[ARCHER06][MA_SKIDTRAP]=3
    SkillList[ARCHER09][MA_CHARGEARROW]=1
    SkillList[ARCHER10][MA_CHARGEARROW]=1
    SkillList[ARCHER05][MER_PROVOKE]=1
    SkillList[ARCHER06][MER_DECAGI]=1
    SkillList[ARCHER07][MA_FREEZINGTRAP]=2
    SkillList[ARCHER08][MA_SANDMAN]=3
    SkillList[SWORDMAN01][MER_DECAGI]=1
    SkillList[SWORDMAN02][MER_PROVOKE]=5
    SkillList[SWORDMAN04][MER_CRASH]=1
    SkillList[SWORDMAN05][MER_CRASH]=4
    SkillList[SWORDMAN06][MER_DECAGI]=3
    SkillList[SWORDMAN09][MER_CRASH]=3
    SkillList[LANCER02][MER_LEXDIVINA]=1
    SkillList[LANCER04][MER_CRASH]=1
    SkillList[LANCER08][MER_PROVOKE]=5
    SkillList[DISGUISE][MER_LEXDIVINA]=3
    SkillList[ALICE][MER_PROVOKE]=5
    SkillList[LANCER03][ML_DEVOTION]=1
    SkillList[LANCER07][ML_DEVOTION]=1
    SkillList[LANCER10][ML_DEVOTION]=3
    SkillList[DOPPLEMERC][ML_DEVOTION]=3
    SkillList[ARCHER02][MA_SHOWER]=2
    SkillList[ARCHER07][MA_SHOWER]=10
    SkillList[LANCER02][ML_BRANDISH]=2
    SkillList[LANCER06][ML_BRANDISH]=5
    SkillList[LANCER09][ML_BRANDISH]=10
    SkillList[SWORDMAN02][MS_MAGNUM]=3
    SkillList[SWORDMAN04][MS_MAGNUM]=5
    SkillList[SWORDMAN08][MS_BOWLINGBASH]=5
    SkillList[SWORDMAN09][MS_BOWLINGBASH]=8
    SkillList[SWORDMAN10][MS_BOWLINGBASH]=10
    SkillList[ALICE][ML_BRANDISH]=5
    SkillList[ARCHER03][MER_QUICKEN]=1
    SkillList[ARCHER08][MER_QUICKEN]=2
    SkillList[ARCHER10][MER_QUICKEN]=5
    SkillList[SWORDMAN03][MER_QUICKEN]=1
    SkillList[SWORDMAN06][MER_QUICKEN]=5
    SkillList[SWORDMAN08][MER_QUICKEN]=10
    SkillList[SWORDMAN10][MER_QUICKEN]=10
    SkillList[LANCER06][MER_QUICKEN]=2
    SkillList[LANCER10][MER_QUICKEN]=5
    SkillList[DOPPLEMERC][MER_QUICKEN]=5
    SkillList[DISGUISE][MER_QUICKEN]=2
    SkillList[LANCER05][ML_AUTOGUARD]=3
    SkillList[LANCER09][ML_AUTOGUARD]=7
    SkillList[LANCER10][ML_AUTOGUARD]=10
    SkillList[MIMIC][ML_AUTOGUARD]=5
    SkillList[SWORDMAN08][MS_PARRYING]=4
    SkillList[GMMALE][MER_KYRIE]=5
    SkillList[GMMALE][MER_BLESSING]=5
    SkillList[GMMALE][MER_INCAGI]=5
    SkillList[PENGINEER][MER_BLESSING]=5
    SkillList[ISIS][MS_BASH]=10
        

    --SkillInfo[id]={name,range,SP cost,Cast Time (fixed),Cast Time (variable),Delay,targetmode,Duration,reuse delay)
    --SkillInfo[id][1]=name
    --SkillInfo[id][2]=range
    --SkillInfo[id][3]=sp cost
    --SkillInfo[id][4]=Fixed cast
    --SkillInfo[id][5]=Variable cast
    --SkillInfo[id][6]=Delay
    --SkillInfo[id][7]=target mode
    --SkillInfo[id][8]=Duration
    --SkillInfo[id][9]=Reuse Delay

    SkillInfo={}
    SkillInfo[0]={"No Skill",{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0}}
    SkillInfo[MS_BASH]={"Bash",{1,1,1,1,1,1,1,1,1,1},{8,8,8,8,8,15,15,15,15,15},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},1}
    SkillInfo[MS_MAGNUM]={"Magnum Break",{0,0,0,0,0,0,0,0,0,0},{30,30,30,30,30,30,30,30,30,30},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{2000,2000,2000,2000,2000,2000,2000,2000,2000,2000},0}
    SkillInfo[MS_BOWLINGBASH]={"Bowling Bash",{1,1,1,1,1,1,1,1,1,1},{13,14,15,16,17,18,19,20,21,22},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},{500,500,500,500,500,500,500,500,500,500},1}
    SkillInfo[MS_PARRYING]={"Parrying",{0,0,0,0,0},{-1,-1,-1,50,0},{0,0,0,0,0},{0,0,0,0,0},{1000,1000,1000,1000,1000},0,{15000,20000,25000,30000,35000,40000,45000,50000,55000,60000}}
    SkillInfo[MS_REFLECTSHIELD]={"Shield Reflect",{0,0,0,0,0,0,0,0,0,0},{35,40,45,50,55,60,65,70,75,80},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},0,{300000,300000,300000,300000,300000,300000,300000,300000,300000,300000}}
    SkillInfo[MS_BERSERK]={"Frenzy",{0},{200},{0},{0},{0},0}
    SkillInfo[MA_DOUBLE]={"Double Strafe",{9,9,9,9,9,9,9,9,9,9},{12,12,12,12,12,12,12,12,12,12},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{200,200,200,200,200,200,200,200,200,200},1}
    SkillInfo[MA_SHOWER]={"Arrow Shower",{9,9,9,9,9,9,9,9,9,9},{15,15,15,15,15,15,15,15,15,15},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},2}
    SkillInfo[MA_SKIDTRAP]={"Skid Trap",{3,3,3,3,3},{10,10,10,10,10},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},2}
    SkillInfo[MA_LANDMINE]={"Land Mine",{3,3,3,3,3},{10,10,10,10,10},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},2}
    SkillInfo[MA_SANDMAN]={"Sandman",{3,3,3,3,3},{12,12,12,12,12},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},2}
    SkillInfo[MA_FREEZINGTRAP]={"Freeze Trap",{3,3,3,3,3},{6,9,12,15,18},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},2}
    SkillInfo[MA_REMOVETRAP]={"Remove Trap",{2},{5},{0},{0},{0},2}
    SkillInfo[MA_CHARGEARROW]={"Arrow Repel",{9},{15},{1500},{0},{0},1}
    SkillInfo[MA_SHARPSHOOTING]={"Focused Arrow Strike",{9,9,9,9,9},{18,21,24,27,30},{1000,1000,1000,1000,1000},{1000,1000,1000,1000,1000},{2000,2000,2000,2000,2000},1}
    SkillInfo[ML_PIERCE]={"Pierce",{2,2,2,2,2,2,2,2,2,2},{7,7,7,7,7,7,7,7,7,7},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{500,500,500,500,500,500,500,500,500,500},1}
    SkillInfo[ML_BRANDISH]={"Brandish",{2,2,2,2,2,2,2,2,2,2},{12,12,12,12,12,12,12,12,12,12},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},{500,500,500,500,500,500,500,500,500,500},1}
    SkillInfo[ML_SPIRALPIERCE]={"Clashing Spiral",{5,5,5,5,5},{18,21,24,27,30},{300,500,700,900,1000},{0,0,0,0,0},{1200,1400,1600,1800,2000},1}
    SkillInfo[ML_DEFENDER]={"Defending Aura",{0,0,0,0,0},{30,30,30,30,30},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},0,{180000,180000,180000,180000,180000}}
    SkillInfo[ML_AUTOGUARD]={"Guard",{0,0,0,0,0,0,0,0,0,0},{12,14,16,18,20,22,24,26,28,30},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},0,{300000,300000,300000,300000,300000,300000,300000,300000,300000,300000}}
    SkillInfo[ML_DEVOTION]={"Sacrifice",{7,8,9,10,11},{25,25,25,25,25},{0,0,0,0,0},{3000,3000,3000,3000,3000},{3000,3000,3000,3000,3000},1,{30000,45000,60000,75000,90000}}
    SkillInfo[MER_MAGNIFICAT]={"Magnificat",{0,0,0,0,0},{40,40,40,40,40},{0,0,0,0,0},{3000,3000,3000,3000,3000},{1000,1000,1000,1000,1000},0}
    SkillInfo[MER_QUICKEN]={"Weapon Quicken",{0,0,0,0,0,0,0,0,0,0},{14,18,22,26,30,34,38,42,46,50},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},0,{30000,60000,90000,120000,150000,180000,210000,240000,270000,300000}}
    SkillInfo[MER_SIGHT]={"Sight",{0},{10},{0},{0},{0},0}
    SkillInfo[MER_CRASH]={"Crash",{1,1,1,1,1},{10,10,10,10,10},{1000,1000,1000,1000,1000},{0,0,0,0,0},{2000,2000,2000,2000,2000},1}
    SkillInfo[MER_REGAIN]={"Regain",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_TENDER]={"Tender",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_BENEDICTION]={"Benediction",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_RECUPERATE]={"Recuperate",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_MENTALCURE]={"Mental Cure",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_COMPRESS]={"Compress",{9},{10},{0},{0},{0},1}
    SkillInfo[MER_PROVOKE]={"Provoke",{7,7,7,7,7},{4,5,6,7,8},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},1,{10000,10000,10000,10000,10000}}
    SkillInfo[MER_AUTOBERSERK]={"Autoberserk",{0},{1},{0},{0},{0},0}
    SkillInfo[MER_DECAGI]={"Decrease Agi",{9,9,9,9,9,9,9,9,9,9},{15,17,19,21,23,25,27,29,31,33},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},{0,0,0,0,0,0,0,0,0,0},{1000,1000,1000,1000,1000,1000,1000,1000,1000,1000},1}
    SkillInfo[MER_SCAPEGOAT]={"Scapegoat",{0},{5},{3000},{0},{0},0}
    SkillInfo[MER_LEXDIVINA]={"Lex Divina",{5,5,5,5,5,5,5,5,5,5},{20,20,20,20,20,18,16,14,12,10},{0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0},{3000,3000,3000,3000,3000,3000,3000,3000,3000,3000},1,{30000,35000,40000,45000,50000,60000,60000,60000,60000,60000}}
    SkillInfo[MER_ESTIMATION]={"Sense",{7},{10},{0},{0},{0},1}
    SkillInfo[MER_KYRIE]={"Kyrie Eleison",{9,9,9,9,9},{20,20,20,25,25},{0,0,0,0,0},{0,0,0,0,0},{2000,2000,2000,2000,2000},1,{120000,120000,120000,120000,120000}}
    SkillInfo[MER_BLESSING]={"Blessing",{9,9,9,9,9},{28,32,36,40,44},{0,0,0,0,0},{0,0,0,0,0},{2000,2000,2000,2000,2000},1,{60000,80000,100000,120000,140000}}
    SkillInfo[MER_INCAGI]={"Increase Agi",{9,9,9,9,9},{18,21,24,27,30},{0,0,0,0,0},{0,0,0,0,0},{2000,2000,2000,2000,2000},1,{60000,80000,100000,120000,140000}}



    --SkillAOEInfo[skill]={AoE size (size on a side of the AoE - by level),Target Type (0=centered on enemy, 1=centered on caster, skill-id=special - handled in GetAOECount)), other fields for future use}

    SkillAOEInfo={}
    SkillAOEInfo[0]={{1,1,1,1,1,1,1,1,1,1},0}
    SkillAOEInfo[MS_BOWLINGBASH]={{3,3,3,3,3,3,3,3,3,3},0}
    SkillAOEInfo[MA_SHOWER]={{3,3,3,3,3,5,5,5,5,5},0}
    SkillAOEInfo[MS_MAGNUM]={{5,5,5,5,5,5,5,5,5,5},1}
    SkillAOEInfo[ML_BRANDISH]={{3,3,3,3,3,3,3,3,3,5},0}
    SkillAOEInfo[MA_SHARPSHOOTING]={{1,1,1,1,1},MA_SHARPSHOOTING}
                    `,
'AI/USER_AI/M_Tactics.lua': `
    MyTact={}
    MyTact[0]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_ANY_A,CLASS_BOTH,RESCUE_RETAINER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Default
    MyTact[10]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_RETAINER,-1,SNIPE_OK,KS_NEVER,1,CHASE_NORMAL} --Default Summon
    MyTact[11]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_NEVER,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Autodetect Plant 
    MyTact[3010]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_REACT,CAST_REACT,PUSH_NEVER,DEBUFF_NEVER,CLASS_BOTH,RESCUE_SELF,-1,SNIPE_OK,KS_NEVER,1,CHASE_ALWAYS} --Goldring
    TactLastSavedDate        = "20/09/2024 01:06:03"
                    `,
'AI/USER_AI/MobID.lua': `
    MobID[111223151]=1097

                    `,
'AI/USER_AI/Mob_ID.lua': `
    MobID={} 
                    `,
'AI/USER_AI/PVP_Tact.lua': `
    MyPVPTact={}
    MyPVPTact[0]={TACT_REACT_L,SKILL_ALWAYS,KITE_NEVER,CAST_REACT,PUSH_SELF,DEBUFF_NEVER,SIZE_UNDEFINED,RESCUE_NEVER}
    MyPVPTact[KOS]={TACT_ATTACK_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,SIZE_MEDIUM,RESCUE_NEVER}
    MyPVPTact[ENEMY]={TACT_REACT_H,SKILL_ALWAYS,KITE_ALWAYS,CAST_REACT,PUSH_SELF,1,SIZE_MEDIUM,RESCUE_NEVER}
    MyPVPTact[NEUTRAL]={TACT_REACT_M,SKILL_ALWAYS,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,SIZE_MEDIUM,RESCUE_NEVER}
    MyPVPTact[FRIEND]={TACT_IGNORE,AutoSkillLimit,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,SIZE_UNDEFINED,RESCUE_NEVER}
    MyPVPTact[ALLY]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,SIZE_MEDIUM,RESCUE_NEVER}
    MyPVPTact[RETAINER]={TACT_IGNORE,SKILL_NEVER,KITE_NEVER,CAST_PASSIVE,PUSH_NEVER,DEBUFF_NEVER,SIZE_MEDIUM,RESCUE_NEVER}

                    `,
'AI/USER_AI/Stubs.lua': `
    function NewState(state)
        if state==0 then --replace with the name of your new state, and specify variable for it in extras.lua
            return OnIDLE_ST() --replace this with your new state function. 
        else
            return -1 --signifying an invalid state
        end
    end
    function OnInit()
        return
    end
    function OnAImiddle() --called after info gathering, but before emergency processing
        return
    end
    function OnAIstart() --called at the start of AI()
        return
    end
    function OnAIEnd() --called at the end of AI() after everything else.
        return
    end
    function OnIdleTasks() --called when AI is in IDLE_ST. 
        return 0 --return 1 to skip the rest of OnIdleSt()
    end
    function OnAttackStart() -- Called in attack state, after checking whether to leave attack, and after checking for 
        return 0
    end
    function OnChaseStart() -- Called in chase state, after checking whether to leave chase, but before taking any actions to do chasing. 
        return 0
    end
    function OnAutoBuffs(buffmode) --called at the end of calling autobuff routine. Buffmode is the buff mode (ie, 1=idle etc). Return nil if your code did something and the current AI() function should return as well, otherwise YOU MUST RETURN 1!!!
        return 1
    end
    function DoSkillHandleMode(skill,level,target,mode,targx,targy)
        return 0
    end
    function OnFailUnknownMode(mode)
        return
    end
                    `,
'AI/USER_AI/Util.lua': `

    require "AI\\\\Const"

    --------------------------------------------
    -- List utility
    --------------------------------------------
    List = {}

    function List.new ()
        return { first = 0, last = -1}
    end

    function List.pushleft (list, value)
        local first = list.first-1
        list.first  = first
        list[first] = value
    end

    function List.pushright (list, value)
        local last = list.last + 1
        list.last = last
        list[last] = value
    end

    function List.popleft (list)
        local first = list.first
        if first > list.last then 
            return nil
        end
        local value = list[first]
        list[first] = nil         -- to allow garbage collection
        list.first = first+1
        return value
    end

    function List.popright (list)
        local last = list.last
        if list.first > last then
            return nil
        end
        local value = list[last]
        list[last] = nil
        list.last = last-1
        return value 
    end

    function List.clear (list)
        for i,v in ipairs(list) do
            list[i] = nil
        end
    --[[
        if List.size(list) == 0 then
            return
        end
        local first = list.first
        local last  = list.last
        for i=first, last do
            list[i] = nil
        end
    --]]
        list.first = 0
        list.last = -1
    end

    function List.size (list)
        local size = list.last - list.first + 1
        return size
    end

    -------------------------------------------------







    function	GetDistance (x1,y1,x2,y2)
        return math.floor(math.sqrt((x1-x2)^2+(y1-y2)^2))
    end




    function	GetDistance2 (id1, id2)
        local x1, y1 = GetV (V_POSITION,id1)
        local x2, y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return -1
        end
        return GetDistance (x1,y1,x2,y2)
    end




    function	GetOwnerPosition (id)
        return GetV (V_POSITION,GetV(V_OWNER,id))
    end





    function	GetDistanceFromOwner (id)
        local x1, y1 = GetOwnerPosition (id)
        local x2, y2 = GetV (V_POSITION,id)
        if (x1 == -1 or x2 == -1) then
            return -1
        end
        return GetDistance (x1,y1,x2,y2)
    end




    function	IsOutOfSight (id1,id2)
        local x1,y1 = GetV (V_POSITION,id1)
        local x2,y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return true
        end
        local d = GetDistance (x1,y1,x2,y2)
        if d > 20 then
            return true
        else
            return false
        end
    end





    function	IsInAttackSight (id1,id2)
        local x1,y1 = GetV (V_POSITION,id1)
        local x2,y2 = GetV (V_POSITION,id2)
        if (x1 == -1 or x2 == -1) then
            return false
        end
        local d		= GetDistance (x1,y1,x2,y2)
        local a     = 0
        if (MySkill == 0) then
            a     = GetV (V_ATTACKRANGE,id1)
        else
            a     = GetV (V_SKILLATTACKRANGE_LEVEL, id1, MySkill, MySkillLevel)
        end

        if a >= d then
            return true
        else
            return false
        end
    end
                    `,
'AI/USER_AI/__AI_M.lua': `

    require "./AI/Const.lua"
    require "./AI/Util.lua"					

    -----------------------------
    -- state
    -----------------------------
    IDLE_ST					= 0
    FOLLOW_ST				= 1
    CHASE_ST				= 2
    ATTACK_ST				= 3
    MOVE_CMD_ST				= 4
    STOP_CMD_ST				= 5
    ATTACK_OBJECT_CMD_ST			= 6
    ATTACK_AREA_CMD_ST			= 7
    PATROL_CMD_ST				= 8
    HOLD_CMD_ST				= 9
    SKILL_OBJECT_CMD_ST			= 10
    SKILL_AREA_CMD_ST			= 11
    FOLLOW_CMD_ST				= 12
    ----------------------------



    ------------------------------------------
    -- global variable
    ------------------------------------------
    MyState				= IDLE_ST	-- ÃÖÃÊÀÇ »óÅÂ´Â ÈÞ½Ä
    MyEnemy				= 0		-- Àû id
    MyDestX				= 0		-- ¸ñÀûÁö x
    MyDestY				= 0		-- ¸ñÀûÁö y
    MyPatrolX			= 0		-- Á¤Âû ¸ñÀûÁö x
    MyPatrolY			= 0		-- Á¤Âû ¸ñÀûÁö y
    ResCmdList			= List.new()	-- ¿¹¾à ¸í·É¾î ¸®½ºÆ® 
    MyID				= 0		-- ¿ëº´ id
    MySkill				= 0		-- ¿ëº´ÀÇ ½ºÅ³
    MySkillLevel			= 0		-- ¿ëº´ÀÇ ½ºÅ³ ·¹º§
    ------------------------------------------










    ------------- command process  ---------------------

    function	OnMOVE_CMD (x,y)
        
        TraceAI ("OnMOVE_CMD")

        if ( x == MyDestX and y == MyDestY and MOTION_MOVE == GetV(V_MOTION,MyID)) then
            return		-- ÇöÀç ÀÌµ¿ÁßÀÎ ¸ñÀûÁö¿Í °°Àº °÷ÀÌ¸é Ã³¸®ÇÏÁö ¾Ê´Â´Ù. 
        end

        local curX, curY = GetV (V_POSITION,MyID)
        if (math.abs(x-curX)+math.abs(y-curY) > 15) then		-- ¸ñÀûÁö°¡ ÀÏÁ¤ °Å¸® ÀÌ»óÀÌ¸é (¼­¹ö¿¡¼­ ¸Õ°Å¸®´Â Ã³¸®ÇÏÁö ¾Ê±â ¶§¹®¿¡)
            List.pushleft (ResCmdList,{MOVE_CMD,x,y})			-- ¿ø·¡ ¸ñÀûÁö·ÎÀÇ ÀÌµ¿À» ¿¹¾àÇÑ´Ù. 	
            x = math.floor((x+curX)/2)							-- Áß°£ÁöÁ¡À¸·Î ¸ÕÀú ÀÌµ¿ÇÑ´Ù.  
            y = math.floor((y+curY)/2)							-- 
        end

        Move (MyID,x,y)	
        
        MyState = MOVE_CMD_ST
        MyDestX = x
        MyDestY = y
        MyEnemy = 0
        MySkill = 0

    end




    function	OnSTOP_CMD ()

        TraceAI ("OnSTOP_CMD")

        if (GetV(V_MOTION,MyID) ~= MOTION_STAND) then
            Move (MyID,GetV(V_POSITION,MyID))
        end
        MyState = IDLE_ST
        MyDestX = 0
        MyDestY = 0
        MyEnemy = 0
        MySkill = 0

    end




    function	OnATTACK_OBJECT_CMD (id)

        TraceAI ("OnATTACK_OBJECT_CMD")

        MySkill = 0
        MyEnemy = id
        MyState = CHASE_ST

    end




    function	OnATTACK_AREA_CMD (x,y)

        TraceAI ("OnATTACK_AREA_CMD")

        if (x ~= MyDestX or y ~= MyDestY or MOTION_MOVE ~= GetV(V_MOTION,MyID)) then
            Move (MyID,x,y)	
        end
        MyDestX = x
        MyDestY = y
        MyEnemy = 0
        MyState = ATTACK_AREA_CMD_ST
        
    end



    function	OnPATROL_CMD (x,y)

        TraceAI ("OnPATROL_CMD")

        MyPatrolX , MyPatrolY = GetV (V_POSITION,MyID)
        MyDestX = x
        MyDestY = y
        Move (MyID,x,y)
        MyState = PATROL_CMD_ST

    end




    function	OnHOLD_CMD ()

        TraceAI ("OnHOLD_CMD")

        MyDestX = 0
        MyDestY = 0
        MyEnemy = 0
        MyState = HOLD_CMD_ST

    end




    function	OnSKILL_OBJECT_CMD (level,skill,id)

        TraceAI ("OnSKILL_OBJECT_CMD")

        MySkillLevel = level
        MySkill = skill
        MyEnemy = id
        MyState = CHASE_ST

    end




    function	OnSKILL_AREA_CMD (level,skill,x,y)

        TraceAI ("OnSKILL_AREA_CMD")

        Move (MyID,x,y)
        MyDestX = x
        MyDestY = y
        MySkillLevel = level
        MySkill = skill
        MyState = SKILL_AREA_CMD_ST
        
    end




    function	OnFOLLOW_CMD ()

        -- ´ë±â¸í·ÉÀº ´ë±â»óÅÂ¿Í ÈÞ½Ä»óÅÂ¸¦ ¼­·Î ÀüÈ¯½ÃÅ²´Ù. 
        if (MyState ~= FOLLOW_CMD_ST) then
            MoveToOwner (MyID)
            MyState = FOLLOW_CMD_ST
            MyDestX, MyDestY = GetV (V_POSITION,GetV(V_OWNER,MyID))
            MyEnemy = 0 
            MySkill = 0
            TraceAI ("OnFOLLOW_CMD")
        else
            MyState = IDLE_ST
            MyEnemy = 0 
            MySkill = 0
            TraceAI ("FOLLOW_CMD_ST --> IDLE_ST")
        end

    end




    function	ProcessCommand (msg)

        if		(msg[1] == MOVE_CMD) then
            OnMOVE_CMD (msg[2],msg[3])
            TraceAI ("MOVE_CMD")
        elseif	(msg[1] == STOP_CMD) then
            OnSTOP_CMD ()
            TraceAI ("STOP_CMD")
        elseif	(msg[1] == ATTACK_OBJECT_CMD) then
            OnATTACK_OBJECT_CMD (msg[2])
            TraceAI ("ATTACK_OBJECT_CMD")
        elseif	(msg[1] == ATTACK_AREA_CMD) then
            OnATTACK_AREA_CMD (msg[2],msg[3])
            TraceAI ("ATTACK_AREA_CMD")
        elseif	(msg[1] == PATROL_CMD) then
            OnPATROL_CMD (msg[2],msg[3])
            TraceAI ("PATROL_CMD")
        elseif	(msg[1] == HOLD_CMD) then
            OnHOLD_CMD ()
            TraceAI ("HOLD_CMD")
        elseif	(msg[1] == SKILL_OBJECT_CMD) then
            OnSKILL_OBJECT_CMD (msg[2],msg[3],msg[4],msg[5])
            TraceAI ("SKILL_OBJECT_CMD")
        elseif	(msg[1] == SKILL_AREA_CMD) then
            OnSKILL_AREA_CMD (msg[2],msg[3],msg[4],msg[5])
            TraceAI ("SKILL_AREA_CMD")
        elseif	(msg[1] == FOLLOW_CMD) then
            OnFOLLOW_CMD ()
            TraceAI ("FOLLOW_CMD")
        end
    end




    -------------- state process  --------------------


    function	OnIDLE_ST ()
        
        TraceAI ("OnIDLE_ST")

        local cmd = List.popleft(ResCmdList)
        if (cmd ~= nil) then		
            ProcessCommand (cmd)	-- ¿¹¾à ¸í·É¾î Ã³¸® 
            return 
        end

        local	object = GetOwnerEnemy (MyID)
        if (object ~= 0) then							-- MYOWNER_ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            TraceAI ("IDLE_ST -> CHASE_ST : MYOWNER_ATTACKED_IN")
            return 
        end

        object = GetMyEnemy (MyID)
        if (object ~= 0) then							-- ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            TraceAI ("IDLE_ST -> CHASE_ST : ATTACKED_IN")
            return
        end

        local distance = GetDistanceFromOwner(MyID)
        if ( distance > 3 or distance == -1) then		-- MYOWNER_OUTSIGNT_IN
            MyState = FOLLOW_ST
            TraceAI ("IDLE_ST -> FOLLOW_ST")
            return;
        end

    end




    function	OnFOLLOW_ST ()

        TraceAI ("OnFOLLOW_ST")

        if (GetDistanceFromOwner(MyID) <= 3) then		--  DESTINATION_ARRIVED_IN 
            MyState = IDLE_ST
            TraceAI ("FOLLOW_ST -> IDLW_ST")
            return;
        elseif (GetV(V_MOTION,MyID) == MOTION_STAND) then
            MoveToOwner (MyID)
            TraceAI ("FOLLOW_ST -> FOLLOW_ST")
            return;
        end

    end




    function	OnCHASE_ST ()

        TraceAI ("OnCHASE_ST")

        if (true == IsOutOfSight(MyID,MyEnemy)) then	-- ENEMY_OUTSIGHT_IN
            MyState = IDLE_ST
            MyEnemy = 0
            MyDestX, MyDestY = 0,0
            TraceAI ("CHASE_ST -> IDLE_ST : ENEMY_OUTSIGHT_IN")
            return
        end
        if (true == IsInAttackSight(MyID,MyEnemy)) then  -- ENEMY_INATTACKSIGHT_IN
            MyState = ATTACK_ST
            TraceAI ("CHASE_ST -> ATTACK_ST : ENEMY_INATTACKSIGHT_IN")
            return
        end

        local x, y = GetV (V_POSITION,MyEnemy)
        if (MyDestX ~= x or MyDestY ~= y) then			-- DESTCHANGED_IN
            MyDestX, MyDestY = GetV (V_POSITION,MyEnemy);
            Move (MyID,MyDestX,MyDestY)
            TraceAI ("CHASE_ST -> CHASE_ST : DESTCHANGED_IN")
            return
        end

    end




    function	OnATTACK_ST ()

        TraceAI ("OnATTACK_ST")
        
        if (true == IsOutOfSight(MyID,MyEnemy)) then	-- ENEMY_OUTSIGHT_IN
            MyState = IDLE_ST
            TraceAI ("ATTACK_ST -> IDLE_ST")
            return 
        end

        if (MOTION_DEAD == GetV(V_MOTION,MyEnemy)) then   -- ENEMY_DEAD_IN
            MyState = IDLE_ST
            TraceAI ("ATTACK_ST -> IDLE_ST")
            return
        end
            
        if (false == IsInAttackSight(MyID,MyEnemy)) then  -- ENEMY_OUTATTACKSIGHT_IN
            MyState = CHASE_ST
            MyDestX, MyDestY = GetV (V_POSITION,MyEnemy);
            Move (MyID,MyDestX,MyDestY)
            TraceAI ("ATTACK_ST -> CHASE_ST  : ENEMY_OUTATTACKSIGHT_IN")
            return
        end
        
        if (MySkill == 0) then
            Attack (MyID,MyEnemy)
        else
            if (1 == SkillObject(MyID,MySkillLevel,MySkill,MyEnemy)) then
                MyEnemy = 0
            end
            MySkill = 0
        end
        TraceAI ("ATTACK_ST -> ATTACK_ST  : ENERGY_RECHARGED_IN")
        return


    end




    function	OnMOVE_CMD_ST ()

        TraceAI ("OnMOVE_CMD_ST")

        local x, y = GetV (V_POSITION,MyID)
        if (x == MyDestX and y == MyDestY) then				-- DESTINATION_ARRIVED_IN
            MyState = IDLE_ST
        end
    end




    function OnSTOP_CMD_ST ()


    end




    function OnATTACK_OBJECT_CMD_ST ()

        

    end




    function OnATTACK_AREA_CMD_ST ()

        TraceAI ("OnATTACK_AREA_CMD_ST")

        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID) 
        end

        if (object ~= 0) then							-- MYOWNER_ATTACKED_IN or ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            return
        end

        local x , y = GetV (V_POSITION,MyID)
        if (x == MyDestX and y == MyDestY) then			-- DESTARRIVED_IN
                MyState = IDLE_ST
        end

    end




    function OnPATROL_CMD_ST ()

        TraceAI ("OnPATROL_CMD_ST")

        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID) 
        end

        if (object ~= 0) then							-- MYOWNER_ATTACKED_IN or ATTACKED_IN
            MyState = CHASE_ST
            MyEnemy = object
            TraceAI ("PATROL_CMD_ST -> CHASE_ST : ATTACKED_IN")
            return
        end

        local x , y = GetV (V_POSITION,MyID)
        if (x == MyDestX and y == MyDestY) then			-- DESTARRIVED_IN
            MyDestX = MyPatrolX
            MyDestY = MyPatrolY
            MyPatrolX = x
            MyPatrolY = y
            Move (MyID,MyDestX,MyDestY)
        end

    end




    function OnHOLD_CMD_ST ()

        TraceAI ("OnHOLD_CMD_ST")
        
        if (MyEnemy ~= 0) then
            local d = GetDistance(MyEnemy,MyID)
            if (d ~= -1 and d <= GetV(V_ATTACKRANGE,MyID)) then
                    Attack (MyID,MyEnemy)
            else
                MyEnemy = 0;
            end
            return
        end


        local	object = GetOwnerEnemy (MyID)
        if (object == 0) then							
            object = GetMyEnemy (MyID)
            if (object == 0) then						
                return
            end
        end

        MyEnemy = object

    end




    function OnSKILL_OBJECT_CMD_ST ()
        
    end




    function OnSKILL_AREA_CMD_ST ()

        TraceAI ("OnSKILL_AREA_CMD_ST")

        local x , y = GetV (V_POSITION,MyID)
        if (GetDistance(x,y,MyDestX,MyDestY) <= GetV(V_SKILLATTACKRANGE,MyID,MySkill)) then	-- DESTARRIVED_IN
            SkillGround (MyID,MySkillLevel,MySkill,MyDestX,MyDestY)
            MyState = IDLE_ST
            MySkill = 0
        end

    end







    function OnFOLLOW_CMD_ST ()

        TraceAI ("OnFOLLOW_CMD_ST")

        local ownerX, ownerY, myX, myY
        ownerX, ownerY = GetV (V_POSITION,GetV(V_OWNER,MyID)) -- ÁÖÀÎ
        myX, myY = GetV (V_POSITION,MyID)					  -- ³ª 
        
        local d = GetDistance (ownerX,ownerY,myX,myY)

        if ( d <= 3) then									  -- 3¼¿ ÀÌÇÏ °Å¸®¸é 
            return 
        end

        local motion = GetV (V_MOTION,MyID)
        if (motion == MOTION_MOVE) then                       -- ÀÌµ¿Áß
            d = GetDistance (ownerX, ownerY, MyDestX, MyDestY)
            if ( d > 3) then                                  -- ¸ñÀûÁö º¯°æ ?
                MoveToOwner (MyID)
                MyDestX = ownerX
                MyDestY = ownerY
                return
            end
        else                                                  -- ´Ù¸¥ µ¿ÀÛ 
            MoveToOwner (MyID)
            MyDestX = ownerX
            MyDestY = ownerY
            return
        end
        
    end








    function	GetOwnerEnemy (myid)
        local result = 0
        local owner  = GetV (V_OWNER,myid)
        local actors = GetActors ()
        local enemys = {}
        local index = 1
        local target
        for i,v in ipairs(actors) do
            if (v ~= owner and v ~= myid) then
                target = GetV (V_TARGET,v)
                if (target == owner) then
                    if (IsMonster(v) == 1) then
                        enemys[index] = v
                        index = index+1
                    else
                        local motion = GetV(V_MOTION,i)
                        if (motion == MOTION_ATTACK or motion == MOTION_ATTACK2) then
                            enemys[index] = v
                            index = index+1
                        end
                    end
                end
            end
        end

        local min_dis = 100
        local dis
        for i,v in ipairs(enemys) do
            dis = GetDistance2 (myid,v)
            if (dis < min_dis) then
                result = v
                min_dis = dis
            end
        end
        
        return result
    end




    function	GetMyEnemy (myid)
        local result = 0

        local type = GetV (V_MERTYPE,myid)
        if (type >= ARCHER01 and type <= SWORDMAN10) then
            result = GetMyEnemyA (myid)
        else
            result = GetMyEnemyB (myid)
        end
        return result
    end




    -------------------------------------------
    --  ºñ¼±°øÇü GetMyEnemy
    -------------------------------------------
    function	GetMyEnemyA (myid)
        local result = 0
        local owner  = GetV (V_OWNER,myid)
        local actors = GetActors ()
        local enemys = {}
        local index = 1
        local target
        for i,v in ipairs(actors) do
            if (v ~= owner and v ~= myid) then
                target = GetV (V_TARGET,v)
                if (target == myid) then	
                    enemys[index] = v
                    index = index+1
                end
            end
        end

        local min_dis = 100
        local dis
        for i,v in ipairs(enemys) do
            dis = GetDistance2 (myid,v)
            if (dis < min_dis) then
                result = v
                min_dis = dis
            end
        end

        return result
    end






    -------------------------------------------
    --  ¼±°øÇü GetMyEnemy
    -------------------------------------------
    function	GetMyEnemyB (myid)
        local result = 0
        local owner  = GetV (V_OWNER,myid)
        local actors = GetActors ()
        local enemys = {}
        local index = 1
        local type
        for i,v in ipairs(actors) do
            if (v ~= owner and v ~= myid) then
                if (1 == IsMonster(v))	then
                    enemys[index] = v
                    index = index+1
                end
            end
        end

        local min_dis = 100
        local dis
        for i,v in ipairs(enemys) do
            dis = GetDistance2 (myid,v)
            if (dis < min_dis) then
                result = v
                min_dis = dis
            end
        end

        return result
    end






    function AI(myid)

        MyID = myid
        local msg	= GetMsg (myid)			-- command
        local rmsg	= GetResMsg (myid)		-- reserved command

        
        if msg[1] == NONE_CMD then
            if rmsg[1] ~= NONE_CMD then
                if List.size(ResCmdList) < 10 then
                    List.pushright (ResCmdList,rmsg) -- ¿¹¾à ¸í·É ÀúÀå
                end
            end
        else
            List.clear (ResCmdList)	-- »õ·Î¿î ¸í·ÉÀÌ ÀÔ·ÂµÇ¸é ¿¹¾à ¸í·ÉµéÀº »èÁ¦ÇÑ´Ù.  
            ProcessCommand (msg)	-- ¸í·É¾î Ã³¸® 
        end

            
        -- »óÅÂ Ã³¸® 
        if (MyState == IDLE_ST) then
            OnIDLE_ST ()
        elseif (MyState == CHASE_ST) then					
            OnCHASE_ST ()
        elseif (MyState == ATTACK_ST) then
            OnATTACK_ST ()
        elseif (MyState == FOLLOW_ST) then
            OnFOLLOW_ST ()
        elseif (MyState == MOVE_CMD_ST) then
            OnMOVE_CMD_ST ()
        elseif (MyState == STOP_CMD_ST) then
            OnSTOP_CMD_ST ()
        elseif (MyState == ATTACK_OBJECT_CMD_ST) then
            OnATTACK_OBJECT_CMD_ST ()
        elseif (MyState == ATTACK_AREA_CMD_ST) then
            OnATTACK_AREA_CMD_ST ()
        elseif (MyState == PATROL_CMD_ST) then
            OnPATROL_CMD_ST ()
        elseif (MyState == HOLD_CMD_ST) then
            OnHOLD_CMD_ST ()
        elseif (MyState == SKILL_OBJECT_CMD_ST) then
            OnSKILL_OBJECT_CMD_ST ()
        elseif (MyState == SKILL_AREA_CMD_ST) then
            OnSKILL_AREA_CMD_ST ()
        elseif (MyState == FOLLOW_CMD_ST) then
            OnFOLLOW_CMD_ST ()
        end

    end

                    `,
'AI/USER_AI/twRO.lua': `
    --twRO lag fix mod for non-AzzyAI AI's. 
    --to install, place in USER_AI, and add dofile("./AI/USER_AI/twRO.lua") to the end of AI.lua (or in another location where it will execute after the function definition for AI())
    --This chops 1 level off of the stack. 

    LogEnable["AAI_Lag"]=0

    modtwROMoveDid =0
    modtwROAttackDid=0
    modtwROSkillGroundLV,modtwROSkillGroundID,modtwROSkillGroundX,modtwROSkillGroundY,modtwROSkillObjectLV,modtwROSkillObjectID,modtwROSkillObjectTarg,modtwROAttackTarget=0,0,0,0,0,0,0,0
    modtwROAttackTarget,modtwROMoveX,modtwROMoveY=0,0,0

    modtwROExMove=Move

    function Move(myid,x,y)
        logappend("AAI_Lag","Move called by AI proper"..formatpos(x,y))
        modtwROMoveX=x
        modtwROMoveY=y
    end

    modtwROExSkillObject=SkillObject
    function SkillObject(myid,lvl,skill,target)
        logappend("AAI_Lag","SkillObject called by AI proper"..FormatSkill(skill,level))
        modtwROSkillObjectID=skill
        modtwROSkillObjectLV=lvl
        modtwROSkillObjectTarg=target
    end

    modtwROExSkillGround=SkillGround
    function SkillGround(myid,lvl,skill,x,y)
        logappend("AAI_Lag","SkillGround called by AI proper "..FormatSkill(skill,level).." "..formatpos(x,y))
        modtwROSkillGroundX=x
        modtwROSkillGroundY=y
        modtwROSkillGroundID=skill
        modtwROSkillGroundLV=lvl
    end

    modtwROExAttack=Attack
    function Attack(myid,target)
        logappend("AAI_Lag","Attack called by AI proper "..target)
        modtwROAttackTarget=target
    end

    modtwROExAI=AI
    function AI(myid)
        modtwROExAI(myid)
        if modtwROSkillGroundID~=0 then
            logappend("AAI_Lag","Calling skillground function")
            modtwROExSkillGround(MyID,modtwROSkillGroundLV,modtwROSkillGroundID,modtwROSkillGroundX,modtwROSkillGroundY)
        elseif modtwROSkillObjectID~=0 then
            logappend("AAI_Lag","Calling SkillObject function")
            modtwROExSkillObject(MyID,modtwROSkillObjectLV,modtwROSkillObjectID,modtwROSkillObjectTarg)
        else
            if modtwRODidMove==0 then
                if modtwROMoveX~=0 then
                    logappend("AAI_Lag","Calling Move function, didmove=0")
                    modtwROExMove(MyID,modtwROMoveX,modtwROMoveY)
                    modtwRODidMove=1
                    modtwRODidAttack=0
                end
            else
                modtwRODidMove=0
            end
            if modtwRODidAttack==0 then
                if modtwROAttackTarget~=0 then
                    logappend("AAI_Lag","Calling attack function, didattack=0")
                    modtwROExAttack(MyID,modtwROAttackTarget)
                    modtwRODidAttack=1
                end
            else
                modtwRODidAttack=0
            end
        end
        modtwROSkillGroundLV,modtwROSkillGroundID,modtwROSkillGroundX,modtwROSkillGroundY,modtwROSkillObjectLV,modtwROSkillObjectID,modtwROSkillObjectTarg,modtwROAttackTarget=0,0,0,0,0,0,0,0
        modtwROAttackTarget,modtwROMoveX,modtwROMoveY=0,0,0
    end
`
};