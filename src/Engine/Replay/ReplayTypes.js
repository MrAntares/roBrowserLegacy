/**
 * Engine/Replay/ReplayTypes.js
 *
 * Ragnarok Online Replay Format (.rrf) Types & Constants
 * Specification derived from adsonpleal/rrfparser reference implementation.
 */

import Configs from 'Core/Configs.js';

/**
 * Informational replay logging, only emitted in development builds.
 * Warnings and errors are reported unconditionally.
 *
 * @param {...*} args
 */
export function replayLog(...args) {
	if (Configs.get('development', false)) {
		console.log(...args);
	}
}

export const ContainerType = {
	None: 0,
	PacketStream: 1,
	ReplayData: 2,
	Session: 3,
	Status: 4,
	Quests: 6,
	GroupAndFriends: 7,
	Items: 8,
	Companions: 9,
	MemorialDungeon: 10,
	Unused11: 11,
	EntryQueue: 12,
	Hotkeys: 13,
	InitialPackets: 14,
	InitialEntities: 15,
	InitialFloorItems: 16,
	SkillGroundUnits: 17,
	EfstList: 18,
	OpenWindows: 19,
	WindowDragAll: 20,
	EntitiesInfo: 21,
	ActorNames: 22,
	QuestFlag: 23,
	Navigation: 24
};

/**
 * Sub-opcodes for Synthetic Replay Event Packets (Opcode 2222 / 0x08AE).
 * Handled in CGameMode::ProcessReplayEventPacket (0xC4A5D0).
 */
export const ReplayEventSubOpCode = {
	WINDOW_MOVE: 900, // 0x384: Resize/move window (UIWindow::SendMsg 6)
	ITEM_DESC: 901, // 0x385: Item description event (ITEM_DESC)
	WINDOW_MSG: 902, // 0x386: Generic window message
	SET_TARGET: 903, // 0x387: CGameMode::m_selectedTargetId / cursor target
	SET_MAP_INFO: 904, // 0x388: Map coords and title strings in CGameMode
	MAP_TRANSITION: 905, // 0x389: Map transition / mode change (CGameMode::virt24)
	SET_BGM_AMBIENT: 906, // 0x38A: Map BGM and ambient sound
	SET_SESSION_TEXT: 907, // 0x38B: Chat / session speech dialogs
	NAVIGATION_MSG: 908, // 0x38C: Navigation window message
	MAKE_WINDOW: 909, // 0x38D: Open UI window (UIWindowMgr::MakeWindow)
	NAVI_PATH: 910, // 0x38E: Navigation route path (CNavigationMgr)
	NAVI_WAYPOINT: 911, // 0x38F: Navigation waypoint update
	NAVI_TARGET: 912, // 0x390: Navigation destination coordinates
	NAVIGATION_PATH: 910, // 0x38E: Navigation route path (alias)
	NAVIGATION_ARROW: 911, // 0x38F: Navigation waypoint update (alias)
	NAVIGATION_ACTIVE: 912, // 0x390: Navigation destination coordinates (alias)
	WINDOW_ACTION: 913, // 0x391: UI window action / click (UIWindow::SendMsg)
	CLOSE_WINDOW: 914 // 0x392: Close UI window (UIWindowMgr::DeleteWindow)
};

export const ReplaySpeedRate = [0.25, 0.5, 1.0, 2.0, 4.0];

export const ContainerTypeNames = {};

for (const [name, code] of Object.entries(ContainerType)) {
	ContainerTypeNames[code] = name;
}

export const ItemChunkKind = {
	INVENTORY: 4510,
	CART: 4516,
	CART_MIRROR: 4518,
	EQUIPPED: 4601,
	EQUIPPED_COSTUME: 4603,
	STORAGE: 4701,
	GUILD_STORAGE: 4702
};

export const ItemRecordTag = {
	START_CHAIN: 281,
	END_CHAIN: 282,
	POS: 285,
	WEAR_STATE: 286,
	QTY: 287,
	CARDS: 290,
	NAMEID: 291,
	REFINE: 295,
	SPRITE: 298,
	GRADE: 299,
	OPTIONS_COUNT: 300,
	OPTIONS: 0x012d // 301
};

export const ReplayOpCodes = {
	// --- Container 15: Initial Entities (Spawn Packets) ---
	ZC_ROOM_NEWENTRY: 201,
	ZC_STORE_ENTRY: 202,
	ZC_PROGRESS: 203,
	ZC_BUYING_STORE_ENTRY: 204,
	ZC_SKILL_POST_ENTRY: 205,
	ZC_SKILL_GROUND_UNIT: 206,
	ZC_ITEM_ENTRY: 207,
	ZC_NOTIFY_MOVEENTRY8: 208,
	ZC_NOTIFY_STANDENTRY7: 210,
	ZC_NOTIFY_NEWENTRY5: 212,
	ZC_NOTIFY_ACTENTRY: 213,
	ZC_NOTIFY_MOVEENTRY11: 214,
	ZC_NOTIFY_STANDENTRY10: 215,
	ZC_NOTIFY_MOVEENTRY10: 216,
	ZC_NOTIFY_STANDENTRY11: 217,
	ZC_NOTIFY_MOVEENTRY: 218,
	ZC_NPC_CHAT: 401,

	// --- Container 2: Replay Metadata (950..973) ---
	Begin_950: 950,
	End_950: 951,
	TailMagic: 960,
	Region: 961,
	Service: 962,
	ServerType: 963,
	Sex: 963, // legacy alias
	Charactername: 964,
	Mapname: 965,
	Maptype: 966,
	PosX: 967,
	PosY: 968,
	Direction: 969,
	TotalTimeMs: 970,
	Length: 970, // legacy alias
	PacketCount: 971,
	EndFileOffset: 972,
	SaveUiOptions: 973,

	// --- Container 3: Session Data (1000..1089) ---
	Begin_1000: 1000,
	End_1000: 1001,
	Aid: 1010,
	Gid: 1011,
	Job: 1014,
	Exp: 1015,
	Level: 1016,
	JobPoint: 1017,
	NextExp: 1018,
	JobLevel: 1019,
	SkillPoint: 1020,
	Str: 1024,
	Agi: 1025,
	Vit: 1026,
	Int: 1027,
	Dex: 1028,
	Luk: 1029,
	PlusStr: 1030,
	PlusAgi: 1031,
	PlusVit: 1032,
	PlusInt: 1033,
	PlusDex: 1034,
	PlusLuk: 1035,
	ASPD: 1036,
	AttackPower: 1037,
	MDefPower: 1038,
	PlusASPD: 1039,
	ItemDefPower: 1040,
	PlusDefPower: 1041,
	RefiningPower: 1042,
	MaxMattPower: 1043,
	MinMattPower: 1044,
	PlusMDefPower: 1045,
	HitSuccessValue: 1046,
	AvoidSuccessValue: 1047,
	CriticalSuccessValue: 1048,
	PlusAvoidSuccessValue: 1049,
	EquipArrowIndex: 1050,
	Money: 1051,
	Speed: 1052,
	Honor: 1053,
	NextJobExp: 1054,
	JobExp: 1055,
	Virtue: 1056,
	Head: 1060,
	Weapon: 1061,
	Shield: 1062,
	BodyPalette: 1063,
	HeadPalette: 1064,
	Accessory: 1065,
	Accessory2: 1066,
	Accessory3: 1067,
	EffectState: 1070,
	RobePalette: 1071,
	CartCurCount: 1086,
	CartMaxCount: 1087,
	CartCurWeight: 1088,
	CartMaxWeight: 1089,

	// --- Container 4: Status / Stats (2000..2032) ---
	Begin_2000: 2000,
	End_2000: 2001,
	BonusStr: 2010,
	BonusAgi: 2011,
	BonusVit: 2012,
	BonusInt: 2013,
	BonusDex: 2014,
	BonusLuk: 2015,
	CurWeight: 2017,
	MaxWeight: 2018,
	Hp: 2029,
	MaxHp: 2030,
	Sp: 2031,
	MaxSp: 2032,

	// --- Container 6: Quests (3500..3510) ---
	Begin_3500: 3500,
	End_3500: 3501,
	QuestInfo: 3510,

	// --- Container 7: Group & Friends (4000..4016) ---
	Begin_4000: 4000,
	End_4000: 4001,
	GroupName: 4014,
	GroupInfo: 4015,
	FriendInfo: 4016,

	// --- Container 8: Items & Inventory (4500..4703) ---
	Begin_4500: 4500,
	End_4500: 4501,
	InventoryItems: 4510,
	CartItems: 4516,
	CartMirrorItems: 4518,
	EquippedItems: 4601,
	EquippedShadowItems: 4603,
	StorageItems: 4701,
	GuildStorageItems: 4702,

	// --- Container 9: Companions (5000..5405) ---
	Begin_5000: 5000,
	End_5000: 5001,

	// Homunculus (5101..5134)
	HomunGid: 5101,
	HomunName: 5102,
	HomunJob: 5103,
	HomunLevel: 5104,
	HomunFullness: 5105,
	HomunRelation: 5106,
	HomunHp: 5107,
	HomunMaxHp: 5108,
	HomunSp: 5109,
	HomunMaxSp: 5110,
	HomunAtk: 5111,
	HomunMatk: 5112,
	HomunHit: 5113,
	HomunCritical: 5114,
	HomunDef: 5115,
	HomunMdef: 5116,
	HomunFlee: 5117,
	HomunAspd: 5118,
	HomunExp: 5119,
	HomunNextExp: 5120,
	HomunSkillPoint: 5121,
	HomunOldFullness: 5122,
	HomunOldRelation: 5123,
	HomunIsModified: 5124,
	HomunIsModifiedName: 5125,
	HomunState: 5126,
	HomunAtkRange: 5127,
	HomunClass: 5128,
	HomunEvolution: 5129,
	HomunEvolutionCost: 5130,
	HomunBaseLevel: 5131,
	HomunMaxLevel: 5132,
	HomunAutoFeed: 5133,
	HomunFoodId: 5134,

	// Mercenary (5201..5229)
	MercenaryGid: 5201,
	MercenaryName: 5202,
	MercenaryJob: 5203,
	MercenaryLevel: 5204,
	MercenaryHp: 5205,
	MercenaryMaxHp: 5206,
	MercenarySp: 5207,
	MercenaryMaxSp: 5208,
	MercenaryAtk: 5209,
	MercenaryMatk: 5210,
	MercenaryHit: 5211,
	MercenaryCritical: 5212,
	MercenaryDef: 5213,
	MercenaryMdef: 5214,
	MercenaryFlee: 5215,
	MercenaryAspd: 5216,
	MercenaryRemainTime: 5217,
	MercenaryCalls: 5218,
	MercenaryKillCount: 5219,
	MercenaryState: 5220,
	MercenaryAtkRange: 5221,
	MercenaryClass: 5222,
	MercenaryType: 5223,
	MercenaryEndurance: 5224,
	MercenarySkillPoint: 5225,
	MercenaryContractTime: 5226,
	MercenaryProperty: 5227,
	MercenaryPropertyLevel: 5228,
	MercenaryOldFullness: 5229,

	// Pet (5300..5310)
	Begin_5300: 5300,
	PetGid: 5301,
	PetIsNameModified: 5302,
	PetName: 5303,
	PetAccessory: 5304,
	PetJob: 5305,
	PetLevel: 5306,
	PetFullness: 5307,
	PetRelation: 5308,
	PetEggIndex: 5309,
	PetOldFullness: 5310,

	// Elemental (5401..5405)
	ElementalGid: 5401,
	ElementalName: 5402,
	ElementalJob: 5403,
	ElementalLevel: 5404,
	ElementalRemainTime: 5405,

	// --- Container 10: Memorial Dungeon (5500..5518) ---
	Begin_5500: 5500,
	End_5500: 5501,
	MemorialDungeonIsOpen: 5510,
	MemorialDungeonWndX: 5511,
	MemorialDungeonWndY: 5512,
	MemorialDungeonFactor: 5513,
	MemorialDungeonEnterTime: 5514,
	MemorialDungeonName: 5515,
	MemorialDungeonDestroyTime: 5516,
	MemorialDungeonReEnterTime: 5517,
	MemorialDungeonState: 5518,

	// --- Container 12: Entry Queue / Battleground (6500..6518) ---
	Begin_6500: 6500,
	End_6500: 6501,
	EntryQueueSelected: 6511,
	EntryQueueState: 6512,
	EntryQueueInfo: 6513,
	EntryQueueApply: 6514,
	EntryQueueWnd: 6515,
	EntryQueueStandByWnd: 6516,
	EntryQueueParam1: 6517,
	EntryQueueParam2: 6518,

	// --- Container 13: Hotkeys (7000..7101) ---
	Begin_7000: 7000,
	End_7000: 7001,
	HotkeyBar1: 7100,
	HotkeyBar2: 7101,

	// --- Container 14: Skill List (7500..7505) ---
	Begin_7500: 7500,
	End_7500: 7501,
	SkillNameEntry: 7502,
	SkillItem: 7504,
	SkillTreeItem: 7505,

	// --- Container 24: Navigation System (8000..8023) ---
	Begin_8000: 8000,
	End_8000: 8001,
	NaviAutoSearch: 8002,
	NaviFindDistance: 8003,
	NaviShowDistance: 8004,
	NaviDrawNpcIcon: 8005,
	NaviRoutePath: 8006,
	NaviStartNode: 8007,
	NaviEndNode: 8008,
	NaviStartX: 8009,
	NaviStartY: 8010,
	NaviEndX: 8011,
	NaviEndY: 8012,
	NaviTargetGid: 8013,
	NaviTargetType: 8014,
	NaviStartMap: 8015,
	NaviDestMap: 8016,
	NaviRouteCost: 8017,
	NaviScrollState: 8018,
	NaviActiveTab: 8019,
	NaviFilterState: 8020,
	NaviWorldInfo: 8021,
	NaviWaypointList: 8022,
	NaviIsPathActive: 8023,

	// --- Container 15: Initial Entities (10000..10001) ---
	Begin_10000: 10000,
	End_10000: 10001,

	// --- Container 22: Actor Names Cache (13000..13005) ---
	Begin_13000: 13000,
	End_13000: 13001,
	ActorNameList: 13002,
	GuildNameList: 13003,
	GuildEmblemId: 13004,
	GuildEmblemData: 13005,

	// --- Container 23: Quest Flag (14000..14011) ---
	Begin_14000: 14000,
	End_14000: 14001,
	IsOnQuest: 14011,

	// --- Container 16: Floor Items (15000..15001) ---
	Begin_15000: 15000,
	End_15000: 15001,

	// --- Container 17: Skill Ground Units (17000..17001) ---
	Begin_17000: 17000,
	End_17000: 17001,

	// --- Container 18: EFST List (19000..19011) ---
	Begin_19000: 19000,
	End_19000: 19001,
	EfstInfo: 19011,

	// --- Container 19: Open Windows (20000..20499) ---
	Begin_20000: 20000,
	End_20000: 20001,
	OpenWindow_Base: 20100,

	// --- Container 20: Window Drag All (25000..25010) ---
	Begin_25000: 25000,
	End_25000: 25001,
	IsDragAll: 25010,

	// --- Container 21: Unused (26000..26001) ---
	Begin_26000: 26000,
	End_26000: 26001
};

export const ReplayOpCodeName = {};

for (const [name, code] of Object.entries(ReplayOpCodes)) {
	ReplayOpCodeName[code] = name;
}

/**
 * States of the Replay playback state machine.
 */
export const ReplayState = {
	IDLE: 'IDLE',
	LOADING_REPLAY: 'LOADING_REPLAY',
	APPLYING_SESSION: 'APPLYING_SESSION',
	LOADING_MAP: 'LOADING_MAP',
	PLAYING_INITIAL_DATA: 'PLAYING_INITIAL_DATA',
	INITIAL_DATA_COMPLETE: 'INITIAL_DATA_COMPLETE',
	PLAYING_PACKET_STREAM: 'PLAYING_PACKET_STREAM',
	REPLAY_FINISHED: 'REPLAY_FINISHED'
};

/**
 * Mapping from client UIWindow ID to GUIComponent name.
 */
export const WindowIdToComponent = {
	0: 'BasicInfo',
	1: 'ItemInfo',
	2: 'ItemSelection',
	3: 'Inventory',
	4: 'Equipment',
	5: 'WinStats',
	6: 'SkillList',
	7: 'ChatBox',
	8: 'ChatRoom',
	9: 'MiniMap',
	10: 'PartyFriends',
	11: 'Guild',
	12: 'Emoticons',
	13: 'ShortCut',
	14: 'GraphicsOption',
	15: 'Escape',
	16: 'Quest',
	17: 'NpcStore',
	18: 'PetInformations',
	19: 'HomunInformations',
	20: 'MercenaryInformations',
	21: 'CartItems',
	22: 'Storage',
	23: 'WorldMap',
	24: 'Navigation'
};
