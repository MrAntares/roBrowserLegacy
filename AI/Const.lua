

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
function	IsMonster (id) end								-- id는 몬스터인가? yes -> 1 no -> 0

--]]





-------------------------------------------------
-- constants
-------------------------------------------------


--------------------------------
V_OWNER				=	0		-- 주인의 ID
V_POSITION			=	1		-- 물체의 위치
V_TYPE				=	2		-- 미구현
V_MOTION			=	3		-- 동작
V_ATTACKRANGE		=	4		-- 물리 공격 범위
V_TARGET			=   5		-- 공격, 스킬 사용 목표물 ID
V_SKILLATTACKRANGE	=	6		-- 스킬 사용 범위
V_HOMUNTYPE			=   7		-- 호문클루스 종류
V_HP				=	8		-- HP (호문클루스와 주인에게만 적용)
V_SP				=	9		-- SP (호문클루스와 주인에게만 적용)
V_MAXHP				=   10		-- 최대 HP (호문클루스와 주인에게만 적용)
V_MAXSP				=   11		-- 최대 SP (호문클루스와 주인에게만 적용)
V_MERTYPE		  =		12    -- 용병 종류
---------------------------------





--------------------------------------------
-- 호문클루스 종류 
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
-- 용병 종류 
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



--[[ 명령어 구조 

MOVE_CMD
	{명령번호,X좌표,Y좌표}
	  
STOP_CMD
	{명령번호}

ATTACK_OBJECT_CMD
	{명령번호,목표ID}

ATTACK_AREA_CMD	
	{명령번호,X좌표,Y좌표}

PATROL_CMD	
	{명령번호,X좌표,Y좌표}
	
HOLD_CMD
	{명령번호}

SKILL_OBJECT_CMD
	{명령번호,선택레벨,종류,목표ID}

SKILL_AREA_CMD
	{명령번호,선택레벨,종류,X좌표,Y좌표}

FOLLOW_CMD
	{명령번호}

--]]

