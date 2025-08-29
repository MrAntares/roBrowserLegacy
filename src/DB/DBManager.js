/**
 * DB/DBManager.js
 *
 * Manage and load DB files
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function (require) {
	'use strict';


	/**
	 * Dependencies
	 */
	var Client = require('Core/Client');
	var Configs = require('Core/Configs');
	var TextEncoding = require('Vendors/text-encoding');
	var CLua = require('Vendors/wasmoon-lua5.1');
	var JobId = require('./Jobs/JobConst');
	var ClassTable = require('./Jobs/JobNameTable');
	var PaletteTable = require('./Jobs/PalNameTable');
	var WeaponAction = require('./Jobs/WeaponAction');
	var WeaponJobTable = require('./Jobs/WeaponJobTable');
	var BabyTable = require('./Jobs/BabyTable');
	var HairIndexTable = require('./Jobs/HairIndexTable');
	var MonsterTable = require('./Monsters/MonsterTable');
	var MonsterNameTable = require('./Monsters/MonsterNameTable');
	var PetIllustration = require('./Pets/PetIllustration');
	var PetAction = require('./Pets/PetAction');
	var ItemTable = require('./Items/ItemTable');
	var HatTable = require('./Items/HatTable');
	var ShieldTable = require('./Items/ShieldTable');
	var WeaponTable = require('./Items/WeaponTable');
	var WeaponType = require('./Items/WeaponType');
	var WeaponSoundTable = require('./Items/WeaponSoundTable');
	var WeaponHitSoundTable = require('./Items/WeaponHitSoundTable');
	var RobeTable = require('./Items/RobeTable');
	var RandomOption = require('DB/Items/ItemRandomOptionTable');
	var SKID = require('./Skills/SkillConst');
	var SkillDescription = require('./Skills/SkillDescription');
	var JobHitSoundTable = require('./Jobs/JobHitSoundTable');
	var WeaponTrailTable = require('./Items/WeaponTrailTable');
	var TownInfo = require('./TownInfo');
	var XmlParse = require('Vendors/xmlparse');

	//Pet
	var PetEmotionTable = require('./Pets/PetEmotionTable')
	var PetHungryState = require('./Pets/PetHungryState')
	var PetFriendlyState = require('./Pets/PetFriendlyState')
	var PetMessageConst = require('./Pets/PetMessageConst')

	//MapName
	var MapInfo = require('./Map/MapTable')

	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');

	/**
	 * DB NameSpace
	 */
	var DB = {};

	/**
	 * @var {Object} lua instance
	 */
	var lua;
	startLua();

	/**
	 * @var {Array} message string
	 */
	var MsgStringTable = [];

	/**
	 * @var {Array} message string
	 */
	var JokeTable = [];

	/**
 * @var {Array} message string
 */
	var ScreamTable = [];

	/**
	 * @var {Array} map table
	 * struct { string name; string mp3; object fog }
	 */
	var MapTable = {};

	/**
	 * @var {Array} ASCII sex
	 */
	var SexTable = ['\xbf\xa9', '\xb3\xb2'];


	/**
	 * @var {Array} file alias list
	 */
	DB.mapalias = {};

	/**
	 * @var {Array} CharName by GID list
	 */
	DB.CNameTable = {};

	/**
	 * @var {string} interface path
	 */
	DB.INTERFACE_PATH = 'data/texture/\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/';

	/**
	 * @var {string} lua path
	 */
	DB.LUA_PATH = 'data/luafiles514/lua files/';

	/**
	 * @var Pet Talk
	 * json object
	 */
	var PetTalkTable = {};

	/**
	 * @var {Object} CheckAttendanceTable Attendance config
	 */
	var CheckAttendanceTable = { Config: {}, Rewards: [] };

	/**
	 * @var {Array }buyingStoreItemList Table
	 */
	var buyingStoreItemList = new Array();

	/**
	 * @var {Array} LaphineSysTable Table
	 */
	var LaphineSysTable = [];

	/**
	 * @var {Array} LaphineUpgTable Table
	 */
	var LaphineUpgTable = [];

	/**
	 * @var ItemDBName Table
	 * json object
	 */
	var ItemDBNameTbl = {};

	/**
	 * @var ItemReform Table
	 * json object
	 */
	var ItemReformTable = { ReformInfo: {}, ReformItemList: {} };

	/**
	 * @var SignBoardTranslated Table
	 */
	var SignBoardTranslatedTable = {};

	/**
	 * @var SignBoard Table
	 */
	var SignBoardTable = {};

	/**
	 * @var NaviMap Table
	 */
	var NaviMapTable = {};

	/**
	 * @var NaviMob Table
	 */
	var NaviMobTable = {};

	/**
	 * @var NaviNpc Table
	 */
	var NaviNpcTable = {};

	/**
	 * @var NaviLink Table
	*/
	var NaviLinkTable = {};

	/**
	 * @var NaviLinkDistance Table
	*/
	var NaviLinkDistanceTable = {};

	/**
	 * @var NaviNpcDistance Table
	 */
	var NaviNpcDistanceTable = {};
	
	/**
	 * @var QuestInfo Table
	 */
	var QuestInfo = {};

	/**
	 * Initialize DB
	 */
	DB.init = function init() {
		// Callback
		var index = 0, count = 0;
		function onLoad() {
			count++;
			return function OnLoadClosure() {
				index++;

				if (DB.onProgress) {
					DB.onProgress(index, count);
				}

				if (index === count && DB.onReady) {
					DB.onReady();
				}
			};
		}

		console.log('Loading DB files...');

		// Loading TXT Tables
		loadTable('data/mp3nametable.txt', '#', 2, function (index, key, val) { (MapTable[key] || (MapTable[key] = {})).mp3 = val; }, onLoad());
		loadTable('data/mapnametable.txt', '#', 2, function (index, key, val) { (MapTable[key] || (MapTable[key] = {})).name = val; }, onLoad());
		loadTable('data/msgstringtable.txt', '#', 1, function (index, val) { MsgStringTable[index] = val; }, onLoad());
		loadTable('data/resnametable.txt', '#', 2, function (index, key, val) { DB.mapalias[key] = val; }, onLoad());

		// TODO: load these load files by PACKETVER
		if (Configs.get('loadLua')) {
			// Item
			loadItemInfo('System/itemInfo.lub', null, onLoad()); // 2012-04-10
			loadLuaTable([DB.LUA_PATH + 'datainfo/accessoryid.lub', DB.LUA_PATH + 'datainfo/accname.lub'], 'AccNameTable', function (json) { HatTable = json; }, onLoad());
			loadLuaTable([DB.LUA_PATH + 'datainfo/spriterobeid.lub', DB.LUA_PATH + 'datainfo/spriterobename.lub'], 'RobeNameTable', function (json) { RobeTable = json; }, onLoad());
			loadLuaTable([DB.LUA_PATH + 'datainfo/npcidentity.lub', DB.LUA_PATH + 'datainfo/jobname.lub'], 'JobNameTable', function (json) { MonsterTable = json; }, onLoad());
			loadLuaTable([DB.LUA_PATH + 'datainfo/enumvar.lub', DB.LUA_PATH + 'datainfo/addrandomoptionnametable.lub'], 'NameTable_VAR', function (json) { RandomOption = json; }, onLoad());
			loadItemDBTable(DB.LUA_PATH + 'ItemDBNameTbl.lub', null, onLoad());
			
			// Skill
			loadLuaTable([DB.LUA_PATH + 'skillinfoz/skillid.lub', DB.LUA_PATH + 'skillinfoz/skilldescript.lub'], 'SKILL_DESCRIPT', function (json) { SkillDescription = json; }, onLoad());
	
			// Legacy Navigation
			if(PACKETVER.value >= 20111010){
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_map_krpri.lub', 'Navi_Map', function (json) { NaviMapTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_mob_krpri.lub', 'Navi_Mob', function (json) { NaviMobTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_npc_krpri.lub', 'Navi_Npc', function (json) { NaviNpcTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_link_krpri.lub', 'Navi_Link', function (json) { NaviLinkTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_linkdistance_krpri.lub', 'Navi_Distance', function (json) { NaviLinkDistanceTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_npcdistance_krpri.lub', 'Navi_NpcDistance', function (json) { NaviNpcDistanceTable = json; }, onLoad());
			}
			
			// LahineSys
			if(PACKETVER.value >= 20160601){
				loadLaphineSysFile(DB.LUA_PATH + 'datainfo/lapineddukddakbox.lub', null, onLoad());
			}
			
			// LaphineUpg
			if(PACKETVER.value >= 20170726){
				loadLaphineUpgFile(DB.LUA_PATH + 'datainfo/lapineupgradebox.lub', null, onLoad());
			}
			
			// ItemReform
			if(PACKETVER.value >= 20200916){
				loadItemReformFile(DB.LUA_PATH + 'ItemReform/ItemReformSystem.lub', null, onLoad());
			}
			
			// MapName
			if( Configs.get('enableMapName')  /*PACKETVER.value >= 20190605*/){ // We allow this feature to be enabled on any version due to popular demand
				loadMapTbl('System/mapInfo.lub', function (json) { for (const key in json) { if (json.hasOwnProperty(key)) { MapInfo[key] = json[key]; } } updateMapTable(); }, onLoad());
			}
			
			// EntitySignBoard
			loadSignBoardData('System/Sign_Data.lub', null, onLoad()); // this is not official, its a translation file
			loadSignBoardList(DB.LUA_PATH + 'SignBoardList.lub', null, onLoad());
			
			// CheckAttendance
			if(Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				loadAttendanceFile('System/CheckAttendance.lub', null, onLoad());
			}
			
			// Quest
			loadQuestInfo('System/OngoingQuestInfoList.lub', null, onLoad());
		} else {
			// Item
			loadTable('data/num2itemdisplaynametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).unidentifiedDisplayName = val.replace(/_/g, " "); }, onLoad());
			loadTable('data/num2itemresnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).unidentifiedResourceName = val; }, onLoad());
			loadTable('data/num2itemdesctable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).unidentifiedDescriptionName = val.split("\n"); }, onLoad());
			loadTable('data/idnum2itemdisplaynametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).identifiedDisplayName = val.replace(/_/g, " "); }, onLoad());
			loadTable('data/idnum2itemresnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).identifiedResourceName = val; }, onLoad());
			loadTable('data/idnum2itemdesctable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).identifiedDescriptionName = val.split("\n"); }, onLoad());
			loadTable('data/itemslotcounttable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).slotCount = val; }, onLoad());
			
			// Skill
			loadTable('data/skilldesctable.txt', '#', 2, function (index, key, val) { SkillDescription[SKID[key]] = val.replace("\r\n", "\n"); }, onLoad());
			
			// Quest
			loadTable('data/questid2display.txt', '#', 6, parseQuestEntry, onLoad());
		}

		loadTable('data/metalprocessitemlist.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).processitemlist = val.split("\n"); }, onLoad());
		loadTable('data/num2cardillustnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).illustResourcesName = val; }, onLoad());
		loadTable('data/cardprefixnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).prefixName = val; }, onLoad());
		loadTable('data/cardpostfixnametable.txt', '#', 1, function (index, key) { (ItemTable[key] || (ItemTable[key] = {})).isPostfix = true; }, onLoad());
		loadTable('data/fogparametertable.txt', '#', 5, parseFogEntry, onLoad());
		loadTable('data/indoorrswtable.txt', '#', 1, parseIndoorEntry, onLoad());
		
		// Frost/Scream
		loadTable('data/ba_frostjoke.txt', '\t', 1, function (index, val) { JokeTable[index] = val; }, onLoad());
		loadTable('data/dc_scream.txt', '\t', 1, function (index, val) { ScreamTable[index] = val; }, onLoad());

		loadXMLFile('data/pettalktable.xml', function (json) { PetTalkTable = json["monster_talk_table"]; }, onLoad());

		if (PACKETVER.value >= 20100427) {
			loadTable('data/buyingstoreitemlist.txt', '#', 1, function (index, key) { buyingStoreItemList.push(parseInt(key, 10)); }, onLoad());
		}

		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID, onUpdateOwnerName);
		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID2, onUpdateOwnerName);
	};

	async function startLua() {
		lua = await CLua.Lua.create();
	}

	/**
	 * Load TXT table
	 *
	 * @param {string} filename to load
	 * @param {string} item separator character
	 * @param {number} size of each group
	 * @param {function} callback to call for each group
	 * @param {function} onEnd to run once the file is loaded
	 */
	function loadTable(filename, separator, size, callback, onEnd) {
		Client.loadFile(filename, function (data) {
			console.log('Loading file "' + filename + '"...');

			// Remove commented lines
			var content = ('\n' + data).replace(/\n(\/\/[^\n]+)/g, '');
			var elements = content.split(separator);
			var i, count = elements.length;
			var args = new Array(size + 1);

			for (i = 0; i < count; i++) {
				if (i % size === 0) {
					if (i) {
						callback.apply(null, args);
					}
					args[i % size] = i;
				}

				args[(i % size) + 1] = elements[i].replace(/^\s+|\s+$/g, ''); // trim
			}

			onEnd();
		}, onEnd);
	}


	/**
	  * LoadXML to json object
	*
	* @param {string} filename to load
	* @param {function} onEnd to run once the file is loaded
	*
	* @author MrUnzO
	*/
	function loadXMLFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (xml) {
				console.log('Loading file "' + filename + '"...');
				xml = xml.replace(/^.*<\?xml/, '<?xml');
				var parser = new DOMParser();
				var parsedXML = parser.parseFromString(xml, 'application/xml');
				var json = XmlParse.xml2json(parsedXML);
				callback.call(null, json);
				onEnd();
			},
			onEnd
		);
	}

	/**
	* Load CheckAttendance file to object
	*
	* @param {string} filename to load
	* @param {function} onEnd to run once the file is loaded
	*
	* @author alisonrag
	*/
	function loadAttendanceFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					let buffer = new Uint8Array(file);
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					// create CheckAttendance required functions in context
					ctx.InsertCheckAttendanceConfig = (EvendOnOff, StartDate, EndDate) => {
						CheckAttendanceTable.Config.StartDate = StartDate;
						CheckAttendanceTable.Config.EndDate = EndDate;
						return 1;
					};
					ctx.InsertCheckAttendanceReward = (day, item_id, quantity) => {
						CheckAttendanceTable.Rewards[day - 1] = { day: day, item_id: item_id, quantity: quantity };
						return 1
					};
					// mount file
					lua.mountFile('CheckAttendance.lub', buffer);
					// execute file
					await lua.doFile('CheckAttendance.lub');
					// execute main lua function
					lua.doStringSync(`main()`);
				} catch (error) {
					console.error('[loadAttendanceFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('CheckAttendance.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadQuestInfo(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				console.log('Loading file "' + filename + '"...');

				try {
				// check if file is ArrayBuffer and convert to Uint8Array if necessary
				let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

				// create decoders
				let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');
				let userStringDecoder = new TextEncoding.TextDecoder('euc-kr'); // TODO: Add keys to config

				// get context, a proxy. It will be used to interact with lua conveniently
				const ctx = lua.ctx;

				// create required functions in context

				// add quest info
				ctx.AddQuestInfo = (QuestID, Title, Summary, IconName, NpcSpr, NpcNavi, NpcPosX, NpcPosY, RewardItemList, RewardEXP, RewardJEXP) => {
					
					QuestInfo[QuestID] = { 
						"Title": userStringDecoder.decode(Title),
						"Summary": userStringDecoder.decode(Summary),
						"IconName": userStringDecoder.decode(IconName),
						"Description": [],
						"NpcSpr": NpcSpr,
						"NpcNavi": NpcNavi,
						"NpcPosX": NpcPosX,
						"NpcPosY": NpcPosY,
						"RewardItemList": RewardItemList,
						"RewardEXP": RewardEXP,
						"RewardJEXP": RewardJEXP
					};

					
					return 1;
				};

				// add quest description
				ctx.AddQuestDescription = (QuestID, QuestDescription) => {
					QuestInfo[QuestID].Description.push(userStringDecoder.decode(QuestDescription));
					return 1;
				};

				// mount file
				lua.mountFile('OngoingQuestInfoList.lub', buffer);
				// execute file
				await lua.doFile('OngoingQuestInfoList.lub');

				// create and execute our own main function
				lua.doStringSync(`
					function main_quest()
					-- Check if QuestInfoList is a table and not nil
					if type(QuestInfoList) ~= "table" or QuestInfoList == nil then
						return false, "Error: Quest table is nil or not a table"
					end

					for QuestID, DESC in pairs(QuestInfoList) do
						-- Ensure DESC is a table, use empty table if nil
						DESC = type(DESC) == "table" and DESC or {}

						-- Provide default values for DESC fields if they are nil
						local questData = {
							Title = DESC.Title or "Unknown Quest",
							Summary = DESC.Summary or "Unknown Quest",
							IconName = DESC.IconName or "",
							NpcSpr = DESC.NpcSpr or null,
							NpcNavi = DESC.NpcNavi or null,
							NpcPosX = DESC.NpcPosX or 0,
							NpcPosY = DESC.NpcPosY or 0,
							RewardItemList = DESC.RewardItemList or null,
							RewardEXP = DESC.RewardEXP or 0,
							RewardJEXP = DESC.RewardJEXP or 0,

							Description = type(DESC.Description) == "table" and DESC.Description or {}
						}

						result, msg = AddQuestInfo(QuestID, questData.Title, questData.Summary, questData.IconName, 
												questData.NpcSpr, questData.NpcNavi, questData.NpcPosX, 
												questData.NpcPosY, questData.RewardItemList, questData.RewardEXP, 
												questData.RewardJEXP)
						if not result then
							return false, msg
						end

						-- Iterate over Description table, use empty table if nil
						for k, v in pairs(questData.Description) do
							result, msg = AddQuestDescription(QuestID, v or "No description available")
							if not result then
								return false, msg
							end
						end
					end
					return true, "good"
				end

				main_quest()
					`);
				} catch (error) {
					console.error('[loadQuestInfo] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('OngoingQuestInfoList.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/* Load ItemInfo file to object
	*
	* @param {string} filename to load
	* @param {function} onEnd to run once the file is loaded
	*
	* @author alisonrag
	*/
	function loadItemInfo(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');
					let userStringDecoder = new TextEncoding.TextDecoder('euc-kr'); // TODO: Add keys to config
					// create itemInfo required functions in context
					ctx.AddItem = (ItemID, unidentifiedDisplayName, unidentifiedResourceName, identifiedDisplayName, identifiedResourceName, slotCount, ClassNum) => {
						ItemTable[ItemID] = {
							...typeof ItemTable[ItemID] === "object" && ItemTable[ItemID],
							unidentifiedDisplayName: userStringDecoder.decode(unidentifiedDisplayName),
							unidentifiedResourceName: iso88591Decoder.decode(unidentifiedResourceName),
							identifiedDisplayName: userStringDecoder.decode(identifiedDisplayName),
							identifiedResourceName: iso88591Decoder.decode(identifiedResourceName),
							unidentifiedDescriptionName: [],
							identifiedDescriptionName: [],
							EffectID: null,
							costume: null,
							PackageID: null,
							slotCount: slotCount,
							ClassNum: ClassNum
						};

						return 1;
					};
					ctx.AddItemUnidentifiedDesc = (ItemID, v) => {
						ItemTable[ItemID].unidentifiedDescriptionName.push(userStringDecoder.decode(v));
						return 1;
					};
					ctx.AddItemIdentifiedDesc = (ItemID, v) => {
						ItemTable[ItemID].identifiedDescriptionName.push(userStringDecoder.decode(v));
						return 1;
					};
					ctx.AddItemEffectInfo = (ItemID, EffectID) => {
						ItemTable[ItemID].EffectID = EffectID;
						return 1;
					};
					ctx.AddItemIsCostume = (ItemID, costume) => {
						ItemTable[ItemID].costume = costume;
						return 1;
					};
					ctx.AddItemPackageID = (ItemID, PackageID) => {
						ItemTable[ItemID].PackageID = PackageID;
						return 1;
					};
					// mount file
					lua.mountFile('iteminfo.lub', buffer);
					// execute file
					await lua.doFile('iteminfo.lub');
					// create and execute our own main function
					// this is necessary because some servers has main function on itemInfo.lub and others load it from itemInfo_f.lub
					// doing this way we avoid to have to load the other file
					// on my tests dont care if the main() is on itemInfo.lub or itemInfo_f.lub the content is always the same
					lua.doStringSync(`
						function main_item()
							for ItemID, DESC in pairs(tbl) do
								result, msg = AddItem(ItemID, DESC.unidentifiedDisplayName, DESC.unidentifiedResourceName, DESC.identifiedDisplayName, DESC.identifiedResourceName, DESC.slotCount, DESC.ClassNum)
								if not result then
								return false, msg
								end
								for k, v in pairs(DESC.unidentifiedDescriptionName) do
								result, msg = AddItemUnidentifiedDesc(ItemID, v)
								if not result then
									return false, msg
								end
								end
								for k, v in pairs(DESC.identifiedDescriptionName) do
								result, msg = AddItemIdentifiedDesc(ItemID, v)
								if not result then
									return false, msg
								end
								end
								if nil ~= DESC.EffectID then
								result, msg = AddItemEffectInfo(ItemID, DESC.EffectID)
								if not result then
									return false, msg
								end
								end
								if nil ~= DESC.costume then
								result, msg = AddItemIsCostume(ItemID, DESC.costume)
								if not result then
									return false, msg
								end
								end
								if nil ~= DESC.PackageID then
								result, msg = AddItemPackageID(ItemID, DESC.PackageID)
								if not result then
									return false, msg
								end
								end
							end
							return true, "good"
							end
						main_item()
						`);
				} catch (error) {
					console.error('[loadItemInfo] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('iteminfo.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * load lapineddukddakbox.lub to array
	 *
	 * @param {string} filename to load
	 * @param {function} callback to run once the file is loaded
	 * @param {function} onEnd to run after the callback
	 *
	 */
	function loadLaphineSysFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');
					let userStringDecoder = new TextEncoding.TextDecoder('euc-kr'); // TODO: Add keys to config

					// create required functions in context
					ctx.AddLaphineSysItem = (key, ItemID, NeedCount, NeedRefineMin, NeedRefineMax, NeedSource_String) => {
						let decoded_key = key && key.length > 1 ? iso88591Decoder.decode(key) : null;
						let decoded_NeedSource_String = NeedSource_String && NeedSource_String.length > 1 ? userStringDecoder.decode(NeedSource_String) : "";
						LaphineSysTable[decoded_key] = {
							ItemID: ItemID,
							NeedCount: NeedCount,
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							SourceItems: new Array(),
							NeedSource_String: decoded_NeedSource_String
						};
						return 1;
					};

					ctx.AddLaphineSysSourceItem = (key, name, count, ItemID) => {
						let decoded_key = key && key.length > 1 ? iso88591Decoder.decode(key) : null;
						let decoded_name = name && name.length > 1 ? iso88591Decoder.decode(name) : "";
						LaphineSysTable[decoded_key].SourceItems.push(
							{
								name: decoded_name,
								count: count,
								id: ItemID
							}
						);
						return 1;
					};

					// mount file
					lua.mountFile('lapineddukddakbox.lub', buffer);

					// execute file
					await lua.doFile('lapineddukddakbox.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_laphynesys()
                            for key, value in pairs(tblLapineDdukddakBox.sources) do
                                result, msg = AddLaphineSysItem(key, value.ItemID, value.NeedCount, value.NeedRefineMin, value.NeedRefineMax, value.NeedSource_String)
                                if not result then
                                    return false, msg
                                end
                                for _, item in ipairs(value.SourceItems) do
                                    result, msg = AddLaphineSysSourceItem(key, item[1], item[2], item[3])
                                    if not result then
                                        return false, msg
                                    end

                                end
                            end
                        end
                        main_laphynesys()
					`);

				} catch (error) {
					console.error('[loadLaphineSysFile] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('lapineddukddakbox.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	};

	/**
	 *  load LapineUpgradeBox.lub to json object
	 *
	 * @param {string} filename to load
	 * @param {function} callback to run once the file is loaded
	 * @param {function} onEnd to run after the callback
	 *
	 */
	function loadLaphineUpgFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');
					let userStringDecoder = new TextEncoding.TextDecoder('euc-kr'); // TODO: Add keys to config

					// create required functions in context
					ctx.AddLaphineUpgradeItem = (key, ItemID, NeedCount, NeedRefineMin, NeedRefineMax, NeedSource_String, NeedOptionNumMin, NotSocketEnchantItem) => {
						let decoded_key = key && key.length > 1 ? iso88591Decoder.decode(key) : null;
						let decoded_NeedSource_String = NeedSource_String && NeedSource_String.length > 1 ? userStringDecoder.decode(NeedSource_String) : "";

						LaphineUpgTable[decoded_key] = {
							ItemID: ItemID,
							NeedCount: NeedCount,
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							NeedOptionNumMin: NeedOptionNumMin,
							NotSocketEnchantItem: NotSocketEnchantItem,
							TargetItems: new Array(),
							NeedSource_String: decoded_NeedSource_String
						};
						return 1;
					};

					ctx.AddLaphineUpgradeTargetItem = (key, name, ItemID) => {
						let decoded_key = key && key.length > 1 ? iso88591Decoder.decode(key) : null;
						let decoded_name = name && name.length > 1 ? iso88591Decoder.decode(name) : "";
						LaphineUpgTable[decoded_key].TargetItems.push(
							{
								name: decoded_name,
								id: ItemID
							}
						);
						return 1;
					};

					// mount file
					lua.mountFile('lapineupgradebox.lub', buffer);

					// execute file
					await lua.doFile('lapineupgradebox.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_laphyneupg()
                            for key, value in pairs(tblLapineUpgradeBox.targets) do
                                result, msg = AddLaphineUpgradeItem(key, value.ItemID, value.NeedCount, value.NeedRefineMin, value.NeedRefineMax, value.NeedSource_String, value.NeedOptionNumMin, value.NotSocketEnchantItem)
                                if not result then
                                    return false, msg
                                end
                                for _, item in ipairs(value.TargetItems) do
                                    result, msg = AddLaphineUpgradeTargetItem(key, item[1], item[2])
                                    if not result then
                                        return false, msg
                                    end

                                end
                            end
                        end
                        main_laphyneupg()
					`);

				} catch (error) {
					console.error('[loadLaphineUpgFile] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('lapineupgradebox.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Loads ItemDBNameTbl.lub which is used in newer UI System (holds ItemDBName and ItemID)
	 *
	 * @param {string} filename - The name of the file to load.
	 * @param {function} callback - The function to invoke with the loaded data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 * @return {void}
	 */
	function loadItemDBTable(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

					// create required functions in context
					ctx.AddDBItemName = (baseItem, itemID) => {
						let decoded_baseItem = baseItem && baseItem.length > 1 ? iso88591Decoder.decode(baseItem) : null;
						ItemDBNameTbl[decoded_baseItem] = itemID;
						return 1;
					};

					// mount file
					lua.mountFile('ItemDBNameTbl.lub', buffer);

					// execute file
					await lua.doFile('ItemDBNameTbl.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_itemDBTable()
                            for key, value in pairs(ItemDBNameTbl) do
                                result, msg = AddDBItemName(key, value)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_itemDBTable()
					`);

				} catch (error) {
					console.error('[loadItemDBTable] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('ItemDBNameTbl.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Loads ItemReformSystem.lub file into json content.
	 *
	 * @param {string} filename - The name of the file to load.
	 * @param {function} callback - The function to call with the processed data.
	 * @param {function} onEnd - The function to call when the loading is complete.
	 * @return {void}
	 */
	function loadItemReformFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

					// create required functions in context
					ctx.AddReformInfo = (key, BaseItem, ResultItem, NeedRefineMin, NeedRefineMax, NeedOptionNumMin, IsEmptySocket, ChangeRefineValue, RandomOptionCode, PreserveSocketItem, PreserveGrade) => {
						let decoded_BaseItem = BaseItem && BaseItem.length > 1 ? iso88591Decoder.decode(BaseItem) : null;
						let decoded_ResultItem = ResultItem && ResultItem.length > 1 ? iso88591Decoder.decode(ResultItem) : null;
						let decoded_RandomOptionCode = RandomOptionCode && RandomOptionCode.length > 1 ? iso88591Decoder.decode(RandomOptionCode) : null;

						ItemReformTable.ReformInfo[key] = {
							BaseItem: decoded_BaseItem,
							BaseItemId: DB.getItemIdfromBase(decoded_BaseItem),
							ResultItem: decoded_ResultItem,
							ResultItemId: DB.getItemIdfromBase(decoded_ResultItem),
							NeedRefineMin: NeedRefineMin,
							NeedRefineMax: NeedRefineMax,
							NeedOptionNumMin: NeedOptionNumMin,
							IsEmptySocket: IsEmptySocket,
							ChangeRefineValue: ChangeRefineValue,
							RandomOptionCode: decoded_RandomOptionCode,
							PreserveSocketItem: PreserveSocketItem,
							PreserveGrade: PreserveGrade,
							Materials: [],
							InformationString: [],
						};
						return 1;
					};

					ctx.ReformInfoAddInformationString = (key, string) => {
						let decoded_string = string && string.length > 1 ? iso88591Decoder.decode(string) : null;
						ItemReformTable.ReformInfo[key].InformationString.push(decoded_string);
						return 1;
					}

					ctx.ReformInfoAddMaterial = (key, Material, Amount) => {
						let decoded_Material = Material && Material.length > 1 ? iso88591Decoder.decode(Material) : null;
						ItemReformTable.ReformInfo[key].Materials.push(
							{
								Material: decoded_Material,
								Amount: Amount,
								MaterialItemID: DB.getItemIdfromBase(decoded_Material)
							}
						);
						return 1;
					}

					ctx.AddReformItem = (baseItem, itemID) => {
						let decoded_baseItem = baseItem && baseItem.length > 1 ? iso88591Decoder.decode(baseItem) : null;
						if (!ItemReformTable.ReformItemList[decoded_baseItem])
							ItemReformTable.ReformItemList[decoded_baseItem] = [];
						ItemReformTable.ReformItemList[decoded_baseItem].push(itemID);
						return 1;
					};

					// mount file
					lua.mountFile('ItemReformSystem.lub', buffer);

					// execute file
					await lua.doFile('ItemReformSystem.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_itemReform()
							for key, value in pairs(ReformInfo) do
								result, msg = AddReformInfo(key, value.BaseItem, value.ResultItem, value.NeedRefineMin, value.NeedRefineMax, value.NeedOptionNumMin, value.IsEmptySocket, value.ChangeRefineValue, value.RandomOptionCode, value.PreserveSocketItem, value.PreserveGrade)
								if not result then
									return false, msg
								end
								if type(value.InformationString) == "table" then
									for _, info in pairs(value.InformationString) do
										result, msg = ReformInfoAddInformationString(key, info)
										if not result then
											return false, msg
										end
									end
								end
								if type(value.Material) == "table" then
									for material, quantity in pairs(value.Material) do
										result, msg = ReformInfoAddMaterial(key, material, quantity)
										if not result then
											return false, msg
										end
									end
								end
							end
							for key, itemList in pairs(ReformItemList) do
								for index, value in ipairs(itemList) do
									result, msg = AddReformItem(key, value)
									if not result then
										return false, msg
									end
								end
							end
						end
                        main_itemReform()
					`);
				} catch (error) {
					console.error('[loadItemReformFile] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('ItemReformSystem.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Loads the System/Sign_Data_EN.lub to json object.
	 *
	 * @param {string} filename - The name of the Lua file to load.
	 * @param {function} callback - The function to invoke with the loaded data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 * @return {void}
	 */
	function loadSignBoardData(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

					// create required functions in context
					ctx.AddSignBoardData = (key, translation) => {
						let decoded_key = key && key.length > 1 ? iso88591Decoder.decode(key) : null;
						let decoded_translation = translation && translation.length > 1 ? iso88591Decoder.decode(translation) : null;
						SignBoardTranslatedTable[decoded_key] = decoded_translation;
						return 1;
					};

					// mount file
					lua.mountFile('Sign_Data.lub', buffer);

					// execute file
					await lua.doFile('Sign_Data.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_SignBoardData()
                            for key, value in pairs(SignBoardData) do
                                result, msg = AddSignBoardData(key, value)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_SignBoardData()
					`);

				} catch (error) {
					console.error('[loadSignBoardData] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('Sign_Data.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Load SignBoardList.lub to JSON object
	 *
	 * @param {string} filename - The name of the Lua file to load.
	 * @param {function} callback - The function to invoke with the loaded data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 * @return {void}
	 */
	function loadSignBoardList(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// create signboard list
					let signBoardList = [];

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

					// create required functions in context
					ctx.AddSignBoard = (mapname, x, y, height, type, icon_location, description, color) => {
						let decoded_mapname = mapname && mapname.length > 1 ? iso88591Decoder.decode(mapname) : null;
						let decoded_icon_location = icon_location && icon_location.length > 1 ? iso88591Decoder.decode(icon_location) : null;
						let decoded_description = description && description.length > 1 ? iso88591Decoder.decode(description) : null;
						let decoded_color = color && color.length > 1 ? iso88591Decoder.decode(color) : null;

						signBoardList.push({
							mapname: decoded_mapname,
							x: x,
							y: y,
							height: height,
							type: type,
							icon_location: decoded_icon_location,
							description: DB.getTranslatedSignBoard(decoded_description),
							color: decoded_color
						});

						return 1;
					};

					// mount file
					lua.mountFile('SignBoardList.lub', buffer);

					// execute file
					await lua.doFile('SignBoardList.lub');

					// create and execute our own main function
					lua.doStringSync(`
						function main_SignBoardList()
                            for key, value in pairs(SignBoardList) do
								local description = "";
								local color = "";
								if value[7] ~= nil then
									description = value[7];
								end
								if value[8] ~= nil then
									color = value[8];
								end
                                result, msg = AddSignBoard(value[1], value[2], value[3], value[4], value[5], value[6], description, color)
                                if not result then
                                    return false, msg
                                end
                        	end
						end
                        main_SignBoardList()
					`);

					SignBoardTable = preprocessSignboardData(signBoardList);

				} catch (error) {
					console.error('[loadSignBoardList] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile('SignBoardList.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	/**
	 * Preprocesses an array of signboard objects and organizes them into a nested dictionary.
	 *
	 * @param {Array} signboardArray - The array of signboard objects.
	 * @return {Object} The nested dictionary containing the preprocessed signboard data.
	 */
	function preprocessSignboardData(signboardArray) {
		const signboardDict = {};

		for (let signboard of signboardArray) {
			const { mapname, x, y } = signboard;
			if (!signboardDict[mapname]) {
				signboardDict[mapname] = {};
			}
			if (!signboardDict[mapname][x]) {
				signboardDict[mapname][x] = {};
			}
			signboardDict[mapname][x][y] = signboard;
		}

		return signboardDict;
	};

	/**
	 * Remove LUA comments
	 *
	 * @param {string} content
	 * @param {string} new content
	 */
	function lua_remove_comments(content) {
		// Block comment
		var start = 0, end;
		while ((start = content.indexOf('--[[')) !== -1) {
			end = content.indexOf('--]]');
			if (end === -1) {
				end = content.length;
			}

			content = content.substring(0, start) + content.substring(end + 4, end.length);
		}

		// temp replace in quote...
		content = content.replace(/"([^"]+)?--[^"]+/g, function (a) {
			return a.replace(/-/g, '\\\\x2d');
		});

		// Remove inline comment
		content = content.replace(/--[^\n]+/g, '');

		// Get back --
		content = content.replace(/\\\\x2d/g, '-');

		content = content.replace(/^\s*([\/-][\/-][^\n]+)/gm, '');

		return content;
	}

	/**
	 * Difficult lua loader
	 *
	 * @param {string} content
	 */
	function lua_parse_glob(content) {
		// Fix possible missing spaces after an array assignment.
		content = content.replace(/^(\s+)(\w+)\s+?={/mg, '$1$2 = {');

		// Remove comments
		content = lua_remove_comments(content);

		// Some failed escaped string on lua
		content = content.replace(/\\\\\\/g, '\\');

		// Remove variable container
		content = content.replace(/^([^\{]+)\{/, '');
		// Replace trailing semicolon with comma
		content = content.replace(/";\s?$/gm, "\",");

		// Convert lua array
		content = content.replace(/\{(\s+?"[^\}]+)\}/g, '[$1]');

		content = content.replace(/"\s+\]/g, '",\n]');
		content = content.replace(/\\'/g, '\'');

		// Restore key index
		content = content.replace(/\[(\w+)]\s+?=\s+?\{/g, '$1: {');

		// Convert parameters
		content = content.replace(/(\s+)(\w+)\s+?=\s+?/g, '$1"$2": ');

		// Remove un-needed coma
		content = content.replace(/,(\s+(\]|\}))/g, '$1').replace(/,(\s+)?$/, '');

		// Removed from the first regex
		content = '{' + content;

		// some functions code
		content = (content + '\0').replace(/\n\}[^\0]+\0/, '');

		// Fix curly brace
		var open = content.split('{').length;
		var close = content.split('}').length;
		if (open > close) {
			content += '}';
		}
		content = content.replace(/^\s*(\w+)\s*:/gm, '"$1":');
		content = content.replace(/(?=[^\\"])\s--.*/gm, '');
		// Remove null characters
		content = content.replace(/\0/g, '');
		content = content.replace(/\}\}$/, '}');


		return content;
	}

	/* Load Lua File to json object
	*
	* @param {string} filename to load
	* @param {function} onEnd to run once the file is loaded
	*
	* @author Raiken
	*/
	function loadLuaFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (data) {
				let json = {};
				console.log('Loading file "' + filename + '"...');
				try {
					if (data instanceof ArrayBuffer) {
						data = new TextDecoder('iso-8859-1').decode(data);
					}
					let output = lua_parse_glob(data);
					json = JSON.parse(output);
				}
				catch (hException) {
					console.error(`(${filename}) error: `, hException);
				}

				callback.call(null, json);
				onEnd();
			},
			onEnd
		);
	}

	/* Load Ragnarok Lua table to object
	* A lot of ragnarok lua tables are splited in 2 files ( 1 - ID table, 2 - Table of values )
	* @param {Array} list of files to be load (must be 2 files)
	* @param {String} name of table in lua file
	* @param {function} callback to run once the file is loaded
	* @param {function} onEnd to run once the file is loaded
	*
	* @author alisonrag
	*/
	function loadLuaTable(file_list, table_name, callback, onEnd) {
		let id_filename = file_list[0];
		let value_table_filename = file_list[1];

		try {
			console.log('Loading file "' + id_filename + '"...');
			Client.loadFile(id_filename,
				async function (file) {
					try {
						// check if file is ArrayBuffer and convert to Uint8Array if necessary
						let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
						// mount file
						lua.mountFile(id_filename, buffer);
						// execute file
						await lua.doFile(id_filename);
						loadValueTable();
					} catch (hException) {
						console.error(`(${id_filename}) error: `, hException);
					}
				}
			);

			function loadValueTable() {
				console.log('Loading file "' + value_table_filename + '"...');
				Client.loadFile(value_table_filename,
					async function (file) {
						try {
							// check if file is ArrayBuffer and convert to Uint8Array if necessary
							let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
							// mount file
							lua.mountFile(value_table_filename, buffer);
							// execute file
							await lua.doFile(value_table_filename);
							parseTable();
						} catch (hException) {
							console.error(`(${value_table_filename}) error: `, hException);
						}
					},
				);
			}

			function parseTable() {
				// declare the table object
				let table = {};

				// get context
				const ctx = lua.ctx;

				// create a decoder for iso-8859-1
				let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

				// create context function
				ctx.addKeyAndValueToTable = (key, value) => {
					table[key] = iso88591Decoder.decode(value);
					return 1;
				}

				// used in some specific cases like skilldescript.lub
				ctx.addKeyAndMoreValuesToTable = (key, value) => {
					if (!table[key])
						table[key] = "";
					table[key] += iso88591Decoder.decode(value) + "\n";
					return 1;
				}

				// create and execute a wrapper lua code
				// this way we let webassembly handle the code and still can get the table data
				lua.doStringSync(`
						function main_table()
							for key, value in pairs(${table_name}) do
								if type(value) == "table" then
									for k, v in pairs(value) do
										result, msg = addKeyAndMoreValuesToTable(key, v)
									end
								else
									result, msg = addKeyAndValueToTable(key, value)
								end
								if not result then
									return false, msg
								end
							end
							return true, "good"
						end
						main_table()
					`);

				// unmount files
				lua.unmountFile(value_table_filename);
				lua.unmountFile(id_filename);

				// return table
				callback.call(null, table);
			}
		} catch (e) {
			console.error('error: ', e);
		} finally {
			onEnd.call();
		}
	}

	/**
	* Extracts a variable from a Lua file and converts it to a JavaScript value
	* @param {String} file_path - Path to the Lua file
	* @param {String} variable_name - Name of the variable to extract
	* @param {function} callback - Function to run with the extracted value
	* @param {function} onEnd - Function to run once the process is complete
	*
	* @author guicaulada
	*/
	function loadLuaValue(file_path, variable_name, callback, onEnd) {
		try {
			console.log('Loading file "' + file_path + '"...');
			Client.loadFile(file_path,
				async function (file) {
					try {
						// Check if file is ArrayBuffer and convert to Uint8Array if necessary
						let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

						// Mount file
						lua.mountFile(file_path, buffer);

						// Execute file
						await lua.doFile(file_path);

						// Get context
						const ctx = lua.ctx;

						// Create a decoder for iso-8859-1
						let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');

						// Initialize result variable
						let result = null;

						// Add key-value pairs to objects at any nesting level
						ctx.extractValue = (value) => {
							result = JSON.parse(iso88591Decoder.decode(value));
						};

						// Create and execute a wrapper Lua code to extract the variable
						lua.doStringSync(String.raw`
							local function escape_str(str)
								return str:gsub("\\", "\\\\"):gsub("\"", "\\\"")
							end

							local function to_json(value)
								if type(value) == "boolean" then
									return tostring(value)
								elseif type(value) == "number" then
									return value
								elseif type(value) == "string" then
									return "\"" .. escape_str(value) .. "\""
								elseif type(value) == "table" then
									local is_array = true
									local index = 1
									for k, _ in pairs(value) do
										if type(k) ~= "number" or k ~= index then
											is_array = false
											break
										end
										index = index + 1
									end

									local result = {}
									if is_array then
										for _, v in ipairs(value) do
											table.insert(result, to_json(v))
										end
										return "[" .. table.concat(result, ",") .. "]"
									else
										for k, v in pairs(value) do
											if type(k) == "string" then
												table.insert(result, "\"" .. escape_str(k) .. "\":" .. to_json(v))
											end
										end
										return "{" .. table.concat(result, ",") .. "}"
									end
								else
									return "null"
								end
							end
						` + `
							extractValue(to_json(${variable_name}))
						`);

						// Unmount file
						lua.unmountFile(file_path);

						// Return the extracted value
						callback.call(null, result);
					} catch (hException) {
						console.error(`(${file_path}) error: `, hException);
						callback.call(null, null);
					} finally {
						if (onEnd) {
							onEnd.call();
						}
					}
				}
			);
		} catch (e) {
			console.error('error: ', e);
			if (onEnd) {
				onEnd.call();
			}
		}
	}

	/**
	 * Loads System/mapInfo.lub
	 *
	 * @param {string} filename - The name of the file to load.
	 * @param {function} callback - The function to invoke with the parsed data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 */
	function loadMapTbl(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let iso88591Decoder = new TextEncoding.TextDecoder('iso-8859-1');
					let userStringDecoder = new TextEncoding.TextDecoder('euc-kr'); // TODO: Add keys to config

					// create mapInfo required functions in context
					ctx.AddMapDisplayName = (name, displayName, notify_enter) => {
						let decoded_name = iso88591Decoder.decode(name);
						MapInfo[decoded_name] = {
							displayName: userStringDecoder.decode(displayName),
							notifyEnter: notify_enter,
							signName: {
								subTitle: null,
								mainTitle: null
							},
							backgroundBmp: null
						};

						return 1;
					};

					ctx.AddMapSignName = (name, subTitle, mainTitle) => {
						let decoded_name = iso88591Decoder.decode(name);
						let decoded_subTitle = subTitle && subTitle.length > 1 ? iso88591Decoder.decode(subTitle) : null;
						let decoded_mainTitle = mainTitle && mainTitle.length > 1 ? iso88591Decoder.decode(mainTitle) : null;
						MapInfo[decoded_name].signName = {
							subTitle: decoded_subTitle,
							mainTitle: decoded_mainTitle
						};
						return 1;
					};

					ctx.AddMapBackgroundBmp = (name, backgroundBmp) => {
						let decoded_name = iso88591Decoder.decode(name);
						MapInfo[decoded_name].backgroundBmp = backgroundBmp ? iso88591Decoder.decode(backgroundBmp) : "field";
						return 1;
					};

					// mount file
					lua.mountFile('mapInfo.lub', buffer);

					// execute file
					await lua.doFile('mapInfo.lub');

					// execute main function
					lua.doStringSync(`main()`);
				} catch (error) {
					console.error('[loadMapTbl] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile('mapInfo.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	};

	/**
	 * Fog entry parser
	 *
	 * @param {number} index
	 * @param {mixed} key
	 * @param {string} near
	 * @param {string} far
	 * @param {string} color
	 * @param {string} factor
	 */
	function parseFogEntry(index, key, near, far, color, factor) {
		var int_color = parseInt(color, 16);
		var map = (MapTable[key] || (MapTable[key] = {}));

		map.fog = {
			near: parseFloat(near),
			far: parseFloat(far),
			color: [
				(255 & (int_color >> 16)) / 255.0,
				(255 & (int_color >> 8)) / 255.0,
				(255 & (int_color >> 0)) / 255.0
			],
			factor: parseFloat(factor)
		};
	}

	/**
	 * Indoor entry parser
	 *
	 * @param {number} index
	 * @param {mixed} key
	 */
	function parseIndoorEntry(index, key) {
		var key = key.replace('.gat', '.rsw');
		var map = MapTable[key] || (MapTable[key] = {});
		map.indoor = true;
	}
	
	/**
	 * Actor Type checks
	 *
	 * @param {number} jobid
	 */
	function isNPC(jobid) {
		return (jobid >= 45 && jobid < 1000) || (jobid >= 10001 && jobid < 19999);
	}

	function isMercenary(jobid) {
		return (jobid >= 6017 && jobid <= 6046);
	}

	function isHomunculus(jobid) {
		return (jobid >= 6001 && jobid <= 6016) || (jobid >= 6048 && jobid <= 6052);
	}

	function isMonster(jobid) {
		return (jobid >= 1001 && jobid <= 3999) || jobid >= 20000;
	}

	function isPlayer(jobid) {
		return jobid < 45 || (jobid >= 4001 && jobid <= 4317) || jobid == 4294967294;
	}

	function isDoram(jobid) {
		return (jobid >= 4217 && jobid <= 4220) || jobid === 4308 || jobid === 4315;
	}

	function isBaby(jobid) {
		if ((jobid >= 4023 && jobid <= 4045) || (jobid >= 4096 && jobid <= 4112) ||
			(jobid >= 4158 && jobid <= 4182) || jobid == 4191 || jobid == 4193 ||
			jobid == 4195 || jobid == 4196 || (jobid >= 4205 && jobid <= 4210) ||
			(jobid >= 4220 && jobid <= 4238) || jobid == 4241 || jobid == 4242 ||
			jobid == 4244 || jobid == 4247 || jobid == 4248) {
			return true;
		}
		return false;
	}

	function isMadogear(jobid) {
		return jobid == 4086 || jobid == 4087 || jobid == 4112 || jobid == 4279;
	}

	/**
	 * @return {string} path to body sprite/action
	 * @param {number} id entity
	 * @param {boolean} alternative sprite
	 * @param {boolean} sex
	 * @return {string}
	 */
	DB.getBodyPath = function getBodyPath(id, sex, alternative) {
		// TODO: Warp STR file
		if (id === 45) {
			return null;
		}

		// Not visible sprite
		if (id === 111 || id === 139 || id == 2337) {
			return null;
		}

		// PC
		if (isPlayer(id)) {
			// DORAM
			if (isDoram(id)) {
				return 'data/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (ClassTable[id] || ClassTable[0]) + '_' + SexTable[sex];
			}

			// TODO: check for alternative 3rd and MADO alternative sprites
			return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (ClassTable[id] || ClassTable[0]) + '_' + SexTable[sex];
		}

		// NPC
		if (isNPC(id)) {
			return 'data/sprite/npc/' + (MonsterTable[id] || MonsterTable[46]).toLowerCase();
		}

		// MERC
		if (isMercenary(id)) {
			// archer - female path | lancer and swordman - male path
			// mercenary entry on monster table have sex path included
			return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + MonsterTable[id];
		}

		// HOMUN
		if (isHomunculus(id)) {
			return 'data/sprite/homun/' + (MonsterTable[id] || MonsterTable[1002]).toLowerCase();
		}

		//
		// OTHER ACTORS
		//
		if (id == '11_FALCON' || id == '4034_FALCON') { // 2nd
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xc5';
		}

		if (id == '4012_FALCON') { // rebirth
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xc5\x32';
		}

		if (id == '4056_FALCON' || id == '4062_FALCON' || id == '4098_FALCON') { // 3rd
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/owl';
		}

		if (id == '4257_FALCON') { // 4th
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/owl';
		}

		if (id == 'WUG') {
			return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/\xbf\xf6\xb1\xd7';
		}

		// MONSTER
		return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/' + (MonsterTable[id] || MonsterTable[1001]).toLowerCase();
	};


	/**
	 * @return {string} path of admin clothes
	 * @param {boolean} sex
	 */
	DB.getAdminPath = function getAdminPath(sex) {
		return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/\xbf\xee\xbf\xb5\xc0\xda_' + SexTable[sex];
	};


	/**
	 * @return {string} path to body palette
	 * @param {number} id entity
	 * @param {number} pal
	 * @param {boolean} sex
	 */
	DB.getBodyPalPath = function getBodyPalettePath(id, pal, sex) {
		if (id === 0 || !(id in PaletteTable)) {
			return null;
		}

		return 'data/palette/\xb8\xf6/' + PaletteTable[id] + '_' + SexTable[sex] + '_' + pal + '.pal';
	};


	/**
	 * @return {string} path to head sprite/action
	 * @param {number} id hair style
	 * @param {number} job job id
	 * @param {boolean} sex
	 * @param {boolean} orcish
	 */
	DB.getHeadPath = function getHeadPath(id, job, sex, orcish) {
		// ORC HEAD
		if (orcish) {
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/orcface';
		}

		// DORAM
		if (isDoram(job)) {
			return 'data/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex + 2][id] || id) + '_' + SexTable[sex];
		}

		return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex][id] || id) + '_' + SexTable[sex];
	};


	/**
	 * @return {string} path to head palette
	 * @param {number} id hair style
	 * @param {number} pal id
	 * @param {number} job job id
	 * @param {boolean} sex
	 */
	DB.getHeadPalPath = function getHeadPalPath(id, pal, job, sex) {
		if (job === 4218 || job === 4220) {
			return 'data/palette/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex + 2][id] || id) + '_' + SexTable[sex] + '_' + pal + '.pal';
		}

		return 'data/palette/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex][id] || id) + '_' + SexTable[sex] + '_' + pal + '.pal';
	};


	/**
	 * @return {string} path to hat
	 * @param {number} id hair style
	 * @param {boolean} sex
	 */
	DB.getHatPath = function getHatPath(id, sex) {
		if (id === 0 || !(id in HatTable)) {
			return null;
		}

		return 'data/sprite/\xbe\xc7\xbc\xbc\xbb\xe7\xb8\xae/' + SexTable[sex] + '/' + SexTable[sex] + HatTable[id];
	};

	/**
	 * @return {string} path to Robe
	 * @param {number} id robe id
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	DB.getRobePath = function getRobePath(id, job, sex) {
		if (id === 0 || !(id in RobeTable)) {
			return null;
		}

		return 'data/sprite/\xb7\xce\xba\xea/' + RobeTable[id] + '/' + SexTable[sex] + '/' + (ClassTable[job] || ClassTable[0]) + '_' + SexTable[sex];
	};


	/**
	 * @return {string} Path to pets equipements
	 * @param {number} id (pets)
	 */
	DB.getPetEquipPath = function getPetEquipPath(id) {
		if (id === 0 || !(id in PetAction)) {
			return null;
		}

		return 'data/sprite/' + PetAction[id];
	};


	/**
	 * @return {string} Path to pets equipements
	 * @param {number} id (pets)
	 */
	DB.getPetIllustPath = function getPetIllustPath(id) {
		return 'data/texture/' + (PetIllustration[id] || PetIllustration[1002]);
	};

	/**
	 * is shield checking
	 *
	 * @param {integer} id
	 * @return {boolean} is shield?
	 *
	 * @author MrUnzO
	 */
	DB.isShield = function isShield(id) {
		// Dual weapon (based on range id)
		if (id > 500 && (id < 2100 || id > 2200)) {
			return false;
		}
		return true;
	};

	DB.getPCAttackMotion = function getPCAttackMotion(job, sex, weapon, isDualWeapon) {

		if (isDualWeapon) {
			switch (job) {
				case JobId.THIEF:
				case JobId.THIEF_H:
					return 5.75;
					break;
				case JobId.MERCHANT:
				case JobId.MERCHANT_H:
					return 5.85;
					break;
			}
		} else {
			switch (job) {
				case JobId.NOVICE:
				case JobId.NOVICE_H:
				case JobId.NOVICE_B:
				case JobId.SUPERNOVICE:
				case JobId.SUPERNOVICE_B:
				case JobId.SUPERNOVICE2:
				case JobId.SUPERNOVICE2_B:
				case JobId.HYPER_NOVICE:
					switch (sex) {
						case 1:
							return 5.85;
							break;
					}
					break;
				case JobId.ASSASSIN:
				case JobId.ASSASSIN_H:
				case JobId.ASSASSIN_B:
				case JobId.GUILLOTINE_CROSS:
				case JobId.GUILLOTINE_CROSS_H:
				case JobId.GUILLOTINE_CROSS_B:
				case JobId.SHADOW_CROSS:
					switch (DB.getWeaponType(weapon)) {
						case WeaponType.KATAR:
						case WeaponType.SHORTSWORD_SHORTSWORD:
						case WeaponType.SWORD_SWORD:
						case WeaponType.AXE_AXE:
						case WeaponType.SHORTSWORD_SWORD:
						case WeaponType.SHORTSWORD_AXE:
						case WeaponType.SWORD_AXE:
							return 3.0;
					}
					break;
			}
		}
		return 6;
	}

	DB.isDualWeapon = function isDualWeapon(job, sex, weapon) {

		let isDualWeapon = false;

		switch (job) {
			case JobId.GUNSLINGER:
			case JobId.GUNSLINGER_B:
			case JobId.REBELLION:
			case JobId.REBELLION_B:
			case JobId.NIGHT_WATCH:
				{
					switch (weapon) {
						case WeaponType.GUN_RIFLE:
						case WeaponType.GUN_GATLING:
						case WeaponType.GUN_SHOTGUN:
						case WeaponType.GUN_GRANADE:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.NINJA:
			case JobId.NINJA_B:
			case JobId.KAGEROU:
			case JobId.KAGEROU_B:
			case JobId.SHINKIRO:
			case JobId.OBORO:
			case JobId.OBORO_B:
			case JobId.SHIRANUI:
				{
					switch (weapon) {
						case WeaponType.SYURIKEN:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.GANGSI:
			case JobId.DEATHKNIGHT:
			case JobId.COLLECTOR:
				{
					// �ӽ�
					break;
				}
			case JobId.TAEKWON:
			case JobId.TAEKWON_B:
			case JobId.STAR:
			case JobId.STAR_B:
			case JobId.STAR2:
			case JobId.STAR2_B:
			case JobId.EMPEROR:
			case JobId.EMPEROR_B:
			case JobId.EMPEROR2:
			case JobId.EMPEROR2_B:
			case JobId.SKY_EMPEROR:
			case JobId.SKY_EMPEROR2:
				{
					break;
				}
			case JobId.LINKER:
			case JobId.LINKER_B:
			case JobId.REAPER:
			case JobId.REAPER_B:
			case JobId.SOUL_ASCETIC:
				//case JobId.SOUL_ASCETIC2:??
				{
					switch (weapon) {
						case WeaponType.SHORTSWORD:
							if (sex == 1) isDualWeapon = true; // male
							break;
						case WeaponType.ROD:
						case WeaponType.TWOHANDROD:
							if (sex == 0) isDualWeapon = true; // Female
							break;
					}
					break;
				}
			case JobId.SWORDMAN:
			case JobId.SWORDMAN_H:
			case JobId.SWORDMAN_B:
				{
					switch (weapon) {
						case WeaponType.TWOHANDSWORD:
						case WeaponType.TWOHANDSPEAR:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.ARCHER:
			case JobId.ARCHER_H:
			case JobId.ARCHER_B:
				{
					switch (weapon) {
						case WeaponType.BOW:
							break;
						default:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.THIEF:
			case JobId.THIEF_H:
			case JobId.THIEF_B:
				{
					switch (weapon) {
						case WeaponType.BOW:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.MAGICIAN:
			case JobId.MAGICIAN_H:
			case JobId.MAGICIAN_B:
				{
					switch (weapon) {
						case WeaponType.TWOHANDROD:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.MERCHANT:
			case JobId.MERCHANT_H:
			case JobId.MERCHANT_B:
				{
					switch (weapon) {
						case WeaponType.TWOHANDAXE:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.ACOLYTE:
			case JobId.ACOLYTE_H:
			case JobId.ACOLYTE_B:
				{
					break;
				}
			case JobId.NOVICE:
			case JobId.NOVICE_H:
			case JobId.NOVICE_B:
			case JobId.SUPERNOVICE:
			case JobId.SUPERNOVICE_B:
			case JobId.SUPERNOVICE2:
			case JobId.SUPERNOVICE2_B:
			case JobId.HYPER_NOVICE:
				{
					switch (sex) {
						case 0:
							switch (weapon) {
								case WeaponType.TWOHANDSWORD:
								case WeaponType.TWOHANDAXE:
								case WeaponType.TWOHANDROD:
								case WeaponType.TWOHANDMACE:
									break;
								case WeaponType.SHORTSWORD:
									isDualWeapon = true;
									break;
							}
							break;
						case 1:
							switch (weapon) {
								case WeaponType.TWOHANDSWORD:
								case WeaponType.TWOHANDAXE:
								case WeaponType.TWOHANDROD:
								case WeaponType.TWOHANDMACE:
									isDualWeapon = true;
									break;
								case WeaponType.SHORTSWORD:
									break;
							}
							break;
					}
					break;
				}
			case JobId.KNIGHT:
			case JobId.KNIGHT2:
			case JobId.CHICKEN:
			case JobId.KNIGHT_H:
			case JobId.CHICKEN_H:
			case JobId.KNIGHT_B:
			case JobId.CHICKEN_B:
			case JobId.KNIGHT2_H:
			case JobId.KNIGHT2_B:
			case JobId.RUNE_KNIGHT:
			case JobId.RUNE_KNIGHT_H:
			case JobId.RUNE_KNIGHT_B:
			case JobId.RUNE_KNIGHT2:
			case JobId.RUNE_KNIGHT2_H:
			case JobId.RUNE_KNIGHT2_B:
			case JobId.RUNE_KNIGHT2_H:
			case JobId.DRAGON_KNIGHT:
			case JobId.DRAGON_KNIGHT2:
				{
					switch (weapon) {
						case WeaponType.TWOHANDSPEAR:
						case WeaponAction.TWOHANDSWORD:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.PRIEST:
			case JobId.PRIEST_H:
			case JobId.PRIEST_B:
			case JobId.ARCHBISHOP:
			case JobId.ARCHBISHOP_H:
			case JobId.ARCHBISHOP_B:
			case JobId.CARDINAL:
				{
					switch (weapon) {
						case WeaponType.BOOK:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.WIZARD:
			case JobId.WIZARD_H:
			case JobId.WIZARD_B:
			case JobId.WARLOCK:
			case JobId.WARLOCK_H:
			case JobId.WARLOCK_B:
			case JobId.ARCH_MAGE:
				{
					switch (weapon) {
						case WeaponType.SHORTSWORD:
							if (sex == 1) isDualWeapon = true;
							break;
						case WeaponType.ROD:
						case WeaponType.TWOHANDROD:
							if (sex == 0) isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.BLACKSMITH:
			case JobId.BLACKSMITH_H:
			case JobId.BLACKSMITH_B:
			case JobId.MECHANIC:
			case JobId.MECHANIC_H:
			case JobId.MECHANIC_B:
			case JobId.MECHANIC2:
			case JobId.MECHANIC2_H:
			case JobId.MECHANIC2_B:
			case JobId.MEISTER:
			case JobId.MEISTER2:
				{
					switch (weapon) {
						case WeaponType.SWORD:
						case WeaponType.AXE:
						case WeaponType.TWOHANDAXE:
						case WeaponType.MACE:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.ASSASSIN:
			case JobId.ASSASSIN_H:
			case JobId.ASSASSIN_B:
			case JobId.GUILLOTINE_CROSS:
			case JobId.GUILLOTINE_CROSS_H:
			case JobId.GUILLOTINE_CROSS_B:
			case JobId.SHADOW_CROSS:
				{
					switch (weapon) {
						case WeaponType.KATAR:
						case WeaponType.SHORTSWORD_SHORTSWORD:
						case WeaponType.SHORTSWORD_SWORD:
						case WeaponType.SHORTSWORD_AXE:
						case WeaponType.SWORD_SWORD:
						case WeaponType.SWORD_AXE:
						case WeaponType.AXE_AXE:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.HUNTER:
			case JobId.HUNTER_H:
			case JobId.HUNTER_B:
			case JobId.RANGER:
			case JobId.RANGER_H:
			case JobId.RANGER_B:
			case JobId.RANGER2:
			case JobId.RANGER2_H:
			case JobId.RANGER2_B:
			case JobId.WINDHAWK:
			case JobId.WINDHAWK2:
				{
					switch (weapon) {
						case WeaponType.BOW:
							isDualWeapon = true;
							break;
					}
					break;
				}
			case JobId.SAGE:
			case JobId.SAGE_H:
			case JobId.SAGE_B:
			case JobId.SORCERER:
			case JobId.SORCERER_H:
			case JobId.SORCERER_B:
			case JobId.ELEMENTAL_MASTER:
				{
					switch (weapon) {
						case WeaponType.BOOK:
						case WeaponType.ROD:
						case WeaponType.TWOHANDROD:
						case WeaponType.TWOHANDSPEAR:	// ��ս������� ���� ���̵� ����� �����Ǹ� �����.
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.ALCHEMIST:
			case JobId.ALCHEMIST_H:
			case JobId.ALCHEMIST_B:
			case JobId.GENETIC:
			case JobId.GENETIC_H:
			case JobId.GENETIC_B:
			case JobId.BIOLO:
				{
					switch (weapon) {
						case WeaponType.SWORD:
						case WeaponType.AXE:
						case WeaponType.TWOHANDAXE:
						case WeaponType.MACE:
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.CRUSADER:
			case JobId.CRUSADER_H:
			case JobId.CRUSADER_B:
			case JobId.CHICKEN2:
			case JobId.CHICKEN2_H:
			case JobId.CHICKEN2_B:
			case JobId.CRUSADER2:
			case JobId.CRUSADER2_H:
			case JobId.CRUSADER2_B:
			case JobId.ROYAL_GUARD:
			case JobId.ROYAL_GUARD_H:
			case JobId.ROYAL_GUARD_B:
			case JobId.ROYAL_GUARD2:
			case JobId.ROYAL_GUARD2_H:
			case JobId.ROYAL_GUARD2_B:
			case JobId.IMPERIAL_GUARD:
			case JobId.IMPERIAL_GUARD2:
				{
					switch (weapon) {
						case WeaponType.SPEAR:
						case WeaponType.TWOHANDSPEAR:
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.MONK:
			case JobId.MONK_H:
			case JobId.MONK_B:
			case JobId.SURA:
			case JobId.SURA_H:
			case JobId.SURA_B:
			case JobId.INQUISITOR:
				{
					switch (weapon) {
						case WeaponType.KNUKLE:
						case WeaponType.NONE:
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.ROGUE:
			case JobId.ROGUE_H:
			case JobId.ROGUE_B:
			case JobId.SHADOW_CHASER:
			case JobId.SHADOW_CHASER_H:
			case JobId.SHADOW_CHASER_B:
			case JobId.ABYSS_CHASER:
				{
					switch (weapon) {
						case WeaponType.BOW:
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.BARD:
			case JobId.BARD_H:
			case JobId.BARD_B:
			case JobId.MINSTREL:
			case JobId.MINSTREL_H:
			case JobId.MINSTREL_B:
			case JobId.TROUBADOUR:
			case JobId.DANCER:
			case JobId.DANCER_H:
			case JobId.DANCER_B:
			case JobId.WANDERER:
			case JobId.WANDERER_H:
			case JobId.WANDERER_B:
			case JobId.TROUVERE:
				{
					switch (weapon) {
						case WeaponType.BOW:
							isDualWeapon = true;
							break;
					}
				}
				break;
			case JobId.DO_SUMMONER1:
			case JobId.DO_SUMMONER_B1:
			case JobId.SPIRIT_HANDLER:
				break;
		}
		return isDualWeapon;
	}

	DB.getWeaponType = function getWeaponType(itemID) {
		if (itemID == 0) {
			return WeaponType.NONE;
		} else if (itemID >= 1100 && itemID <= 1199) {
			return WeaponType.SWORD;
		} else if (itemID >= 1901 && itemID < 1999) {
			return WeaponType.INSTRUMENT;
		} else if (itemID >= 1201 && itemID <= 1249) {
			return WeaponType.SHORTSWORD;
		} else if (itemID >= 1250 && itemID <= 1299) {
			return WeaponType.KATAR;
		} else if (itemID >= 1350 && itemID <= 1399) {
			return WeaponType.AXE;
		} else if (itemID >= 1301 && itemID <= 1349) {
			return WeaponType.TWOHANDAXE;//˫�ָ�
		} else if (itemID >= 1450 && itemID <= 1499) {
			return WeaponType.SPEAR;
		} else if (itemID >= 1401 && itemID <= 1449) {
			return WeaponType.TWOHANDSPEAR;
		} else if (itemID >= 1501 && itemID <= 1599) {
			return WeaponType.MACE;
		} else if (itemID >= 1601 && itemID <= 1699) {
			return WeaponType.ROD;
		} else if (itemID >= 1701 && itemID <= 1749) {
			return WeaponType.BOW;
		} else if (itemID >= 1801 && itemID <= 1899) {
			return WeaponType.KNUKLE;
		} else if (itemID >= 2001 && itemID <= 2099) {
			return WeaponType.TWOHANDSWORD;
		}
		/* else if (itemID >= 1800 && itemID < 1900) {
		 return WeaponType.KNUKLE;
		 } else if (itemID >= 1900 && itemID < 1950) {
		 return WeaponType.INSTRUMENT;
		 } else if (itemID >= 1950 && itemID < 2000) {
		 return WeaponType.WHIP;
		 } else if (itemID >= 2000 && itemID < 2100) {
		 return WeaponType.TWOHANDROD;
		 } else if (itemID >= 13150 && itemID < 13200) {
		 return WeaponType.GUN_RIFLE;
		 } else if (itemID >= 13000 && itemID < 13100) {
		 return WeaponType.SHORTSWORD;
		 } else if (itemID >= 13100 && itemID < 13150) {
		 return WeaponType.GUN_HANDGUN;
		 } else if (itemID >= 13300 && itemID < 13400) {
		 return WeaponType.SYURIKEN;
		 }*/

		return -1;
	}

	DB.makeWeaponType = function makeWeaponType(left, right) {
		let type = 0;
		if (!left && right) {
			left = right;
			right = 0;
		}

		if ((left >= 1101 && left <= 1199)) {			// �Ѽհ�
			type = WeaponType.SWORD;
			if (right >= 1101 && right <= 1199)	// �Ѽհ�
				return WeaponType.SWORD_SWORD;

			if (right >= 1201 && right <= 1299)	// �ܰ�
				return WeaponType.SHORTSWORD_SWORD;
			//if (right >= 13400 && right < 13500)	// �Ѽհ�
			//	return WeaponType.SWORD_SWORD;

			if (right >= 1301 && right <= 1399)	// �Ѽյ���
				return WeaponType.SWORD_AXE;
		}
		else if (left >= 1201 && left <= 1299) {	// �ܰ�
			type = WeaponType.SHORTSWORD;
			if (right >= 1201 && right <= 1299)	// �ܰ�
				return WeaponType.SHORTSWORD_SHORTSWORD;

			//if (right >= 13000 && right < 13100)	// �ܰ�
			//	return WeaponType.SHORTSWORD_SHORTSWORD;

			if (right >= 1101 && right <= 1199)	// �Ѽհ�
				return WeaponType.SHORTSWORD_SWORD;

			//if (right >= 13400 && right < 13500)	// �Ѽհ�
			//	return WeaponType.SHORTSWORD_SWORD;

			if (right >= 1301 && right <= 1399)	// �Ѽյ���
				return WeaponType.SHORTSWORD_AXE;
		}
		else if (left >= 1301 && left <= 1399) {	// �Ѽյ���
			type = WeaponType.AXE;
			if (right >= 1101 && right <= 1199)	// �Ѽհ�
				return WeaponType.SWORD_AXE;

			if (right >= 1201 && right <= 1299)	// �ܰ�
				return WeaponType.SHORTSWORD_AXE;

			if (right >= 1301 && right <= 1399)	// �Ѽյ���
				return WeaponType.AXE_AXE;
		} else if (left >= 2801 && left <= 2899) {
			return WeaponType.KATAR;
		} else if (right >= 2801 && right <= 2899) {
			return WeaponType.KATAR;
		}
		//else if (left >= 13000 && left < 13100)
		//{	// �ܰ�
		//	type = WeaponType.SHORTSWORD;
		//	if (right >= 1201 && right < 1299)	// �ܰ�
		//		return WeaponType.SHORTSWORD_SHORTSWORD;

		//	if (right >= 13000 && right < 13100)	// �ܰ�
		//		return WeaponType.SHORTSWORD_SHORTSWORD;

		//	if (right >= 1100 && right < 1150)	// �Ѽհ�
		//		return WeaponType.SHORTSWORD_SWORD;

		//	if (right >= 13400 && right < 13500)	// �Ѽհ�
		//		return WeaponType.SHORTSWORD_SWORD;

		//	if (right >= 1300 && right < 1350)	// �Ѽյ���
		//		return WeaponType.SHORTSWORD_AXE;
		//}

		return type;
	}

	/**
	 * @return {string} Path to shield
	 * @param {number} id shield
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	DB.getShieldPath = function getShieldPath(id, job, sex) {
		if (id === 0) {
			return null;
		}

		// Dual weapon (based on range id)
		if (id > 500 && (id < 2100 || id > 2200)) {
			return DB.getWeaponPath(id, job, sex);
		}

		var baseClass = WeaponJobTable[job] || WeaponJobTable[0];

		// ItemID to View Id
		if ((id in ItemTable) && ('ClassNum' in ItemTable[id])) {
			id = ItemTable[id].ClassNum;
		}

		return 'data/sprite/\xb9\xe6\xc6\xd0/' + baseClass + '/' + baseClass + '_' + SexTable[sex] + '_' + (ShieldTable[id] || ShieldTable[1]);
	};


	/**
	 * @return {string} Path to weapon
	 * @param {number} id weapon
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	DB.getWeaponPath = function getWeaponPath(id, job, sex, leftid = false) {
		if (id === 0) {
			return null;
		}

		var baseClass = WeaponJobTable[job] || WeaponJobTable[0];

		// ItemID to View Id
		if ((id in ItemTable) && ('ClassNum' in ItemTable[id])) {
			id = ItemTable[id].ClassNum;
		}

		if (leftid) {
			if ((leftid in ItemTable) && ('ClassNum' in ItemTable[leftid])) {
				leftid = ItemTable[leftid].ClassNum;
			}

			// Create dualhand Id
			var right = Object.keys(WeaponType).find(key => WeaponType[key] === id);
			var left = Object.keys(WeaponType).find(key => WeaponType[key] === leftid);
			if (right && left) {
				id = WeaponType[right + '_' + left];
			}
		}

		return 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/' + baseClass + '/' + baseClass + '_' + SexTable[sex] + (WeaponTable[id] || ('_' + id));
	};

	/**
	 * @return {string} Path to weapon trail
	 * @param {number} id weapon
	 * @param {number} job class
	 * @param {boolean} sex
	 */
	DB.getWeaponTrail = function getWeaponTrail(id, job, sex) {
		if (id === 0) {
			return null;
		}

		const baseClass = WeaponJobTable[job] || WeaponJobTable[0];

		// ItemID to View Id
		if (id in ItemTable && 'ClassNum' in ItemTable[id]) {
			id = ItemTable[id].ClassNum;
		}

		return (
			'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/' +
			baseClass +
			'/' +
			baseClass +
			'_' +
			SexTable[sex] +
			WeaponTrailTable[id]
		);
	};

	/**
	 * @param {number} cart id
	 */
	DB.getCartPath = function getCartPath(num) {
		var id = Math.max(Math.min(num, 9), 0); //cap 0-9
		return [
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbd\xb4\xb3\xeb\xbc\xd5\xbc\xf6\xb7\xb9',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb9',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb91',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb92',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb93',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb94',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb95',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb96',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb97',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb98'
		][id];
	};


	/**
	 * @return {string} Path to eapon sound
	 * @param {number} weapon id
	 */
	DB.getWeaponSound = function getWeaponSound(id) {
		var type = DB.getWeaponViewID(id);
		return WeaponSoundTable[type];
	};


	/**
	 * @return {string} Path to eapon sound
	 * @param {number} weapon id
	 */
	DB.getWeaponHitSound = function getWeaponHitSound(id) {
		var type = DB.getWeaponViewID(id);

		if (type === WeaponType.NONE) {
			return [WeaponHitSoundTable[type][Math.floor(Math.random() * 4)]];
		}

		return WeaponHitSoundTable[type];
	};

	/**
	 * @return {string} Path to eapon sound [MrUnzO]
	 * @param {number} weapon id
	 */
	DB.getJobHitSound = function getJobHitSound(job_id) {
		if (!job_id) {
			return JobHitSoundTable[0];
		}

		return JobHitSoundTable[job_id] || JobHitSoundTable[0];
	};


	/**
	 * @return {number} weapon viewid
	 * @param {number} id weapon
	 */
	DB.getWeaponViewID = function getWeaponViewIdClosure() {
		var gunGatling = [13157, 13158, 13159, 13172, 13177];
		var gunShotGun = [13154, 13155, 13156, 13167, 13168, 13169, 13173, 13178];
		var gunGranade = [13160, 13161, 13162, 13174, 13179];

		return function getWeaponViewID(id) {
			// Already weapon type.
			if (id < WeaponType.MAX) {
				return id;
			}

			// Based on view id
			if (id in ItemTable) {
				if (ItemTable[id].ClassNum) {
					return ItemTable[id].ClassNum;
				}
			}

			// Weapon ID starting at 1100
			if (id < 1100) {
				return WeaponType.NONE;
			}

			// Specific weapon range inside other range (wtf gravity ?)
			if (id >= 1116 && id <= 1118) return WeaponType.TWOHANDSWORD;
			if (id >= 1314 && id <= 1315) return WeaponType.TWOHANDAXE;
			if (id >= 1410 && id <= 1412) return WeaponType.TWOHANDSPEAR;
			if (id >= 1472 && id <= 1473) return WeaponType.ROD;
			if (id === 1599) return WeaponType.MACE;
			if (gunGatling.indexOf(id) > -1) return WeaponType.GUN_GATLING;
			if (gunShotGun.indexOf(id) > -1) return WeaponType.GUN_SHOTGUN;
			if (gunGranade.indexOf(id) > -1) return WeaponType.GUN_GRANADE;

			// Ranges
			return (
				id < 1150 ? WeaponType.SWORD :
					id < 1200 ? WeaponType.TWOHANDSWORD :
						id < 1250 ? WeaponType.SHORTSWORD :
							id < 1300 ? WeaponType.KATAR :
								id < 1350 ? WeaponType.AXE :
									id < 1400 ? WeaponType.TWOHANDAXE :
										id < 1450 ? WeaponType.SPEAR :
											id < 1500 ? WeaponType.TWOHANDSPEAR :
												id < 1550 ? WeaponType.MACE :
													id < 1600 ? WeaponType.BOOK :
														id < 1650 ? WeaponType.ROD :
															id < 1700 ? WeaponType.NONE :
																id < 1750 ? WeaponType.BOW :
																	id < 1800 ? WeaponType.NONE :
																		id < 1850 ? WeaponType.KNUKLE :
																			id < 1900 ? WeaponType.NONE :
																				id < 1950 ? WeaponType.INSTRUMENT :
																					id < 2000 ? WeaponType.WHIP :
																						id < 2050 ? WeaponType.TWOHANDROD :
																							id < 13000 ? WeaponType.NONE :
																								id < 13050 ? WeaponType.SHORTSWORD :
																									id < 13100 ? WeaponType.NONE :
																										id < 13150 ? WeaponType.GUN_HANDGUN :
																											id < 13200 ? WeaponType.GUN_RIFLE :
																												id < 13300 ? WeaponType.NONE :
																													id < 13350 ? WeaponType.SYURIKEN :
																														id < 13400 ? WeaponType.NONE :
																															id < 13450 ? WeaponType.SWORD :
																																id < 18100 ? WeaponType.NONE :
																																	id < 18150 ? WeaponType.BOW :
																																		WeaponType.NONE
			);
		};
	}();


	/**
	 * @return {number} weapon action frame
	 * @param {number} id weapon
	 * @param {number} job
	 * @param {number} sex
	 */
	DB.getWeaponAction = function getWeaponAction(id, job, sex) {
		var type = DB.getWeaponViewID(id);

		if (job in WeaponAction) {
			if (WeaponAction[job] instanceof Array) {
				if (type in WeaponAction[job][sex]) {
					return WeaponAction[job][sex][type];
				}
			}
			else if (type in WeaponAction[job]) {
				return WeaponAction[job][type];
			}
		}

		return 0;
	};


	/**
	 * Get back informations from id
	 *
	 * @param {number} item id
	 * @return {object} item
	 */
	DB.getItemInfo = function getItemInfoClosure() {
		var unknownItem = {
			unidentifiedDisplayName: 'Unknown Item',
			unidentifiedResourceName: '\xbb\xe7\xb0\xfa',
			unidentifiedDescriptionName: [
				'...',
			],
			identifiedDisplayName: 'Unknown Item',
			identifiedResourceName: '\xbb\xe7\xb0\xfa',
			identifiedDescriptionName: [
				'...',
			],
			slotCount: 0,
			ClassNum: 0
		};

		return function getItemInfo(itemid) {
			var item = ItemTable[itemid] || unknownItem;

			if (!item._decoded) {
				item.identifiedDescriptionName = (item.identifiedDescriptionName && item.identifiedDescriptionName instanceof Array) ? TextEncoding.decodeString(item.identifiedDescriptionName.join('\n')) : '';
				item.unidentifiedDescriptionName = (item.unidentifiedDescriptionName && item.unidentifiedDescriptionName instanceof Array) ? TextEncoding.decodeString(item.unidentifiedDescriptionName.join('\n')) : '';
				item.identifiedDisplayName = TextEncoding.decodeString(item.identifiedDisplayName);
				item.unidentifiedDisplayName = TextEncoding.decodeString(item.unidentifiedDisplayName);
				item.prefixName = TextEncoding.decodeString(item.prefixName || '');
				item.isPostfix = (item.isPostfix || false);
				item.processitemlist = (item.processitemlist && item.processitemlist instanceof Array) ? TextEncoding.decodeString(item.processitemlist.join('\n')) : '';
				item._decoded = true;
			}

			return item;
		};
	}();


	/**
	 * Get back item path
	 *
	 * @param {number} item id
	 * @param {boolean} is identify
	 * @return {string} path
	 */
	DB.getItemPath = function getItemPath(itemid, identify) {
		var it = DB.getItemInfo(itemid);
		return 'data/sprite/\xbe\xc6\xc0\xcc\xc5\xdb/' + (identify ? it.identifiedResourceName : it.unidentifiedResourceName);
	};


	/**
	  * Get full item name
	  *
	  * @param {object} item - The item object containing details about the item.
	  * @param {object} [options] - Optional parameters to customize the output.
	  * @param {boolean} [options.showItemRefine=true] - Whether to show the refining level of the item.
	  * @param {boolean} [options.showItemGrade=true] - Whether to show the grade of the item.
	  * @param {boolean} [options.showItemSlots=true] - Whether to show the number of slots on the item.
	  * @param {boolean} [options.showItemPrefix=true] - Whether to show the prefix of the item.
	  * @param {boolean} [options.showItemPostfix=true] - Whether to show the postfix of the item.
	  * @param {boolean} [options.showItemOptions=true] - Whether to show the number of options on the item.
	  * @return {string} - The full name of the item with all applicable details.
	  */
	DB.getItemName = function getItemName(item, options = {}) {
		const {
			showItemRefine = true,
			showItemGrade = true,
			showItemSlots = true,
			showItemPrefix = true,
			showItemPostfix = true,
			showItemOptions = true,
		} = options;

		var it = DB.getItemInfo(item.ITID);
		var str = '';
		var prefix = '';
		var postfix = '';
		var showprefix = false;
		var showpostfix = false;

		if (!item.IsIdentified) {
			return it.unidentifiedDisplayName;
		}

		if (item.RefiningLevel && showItemRefine) {
			str = '+' + item.RefiningLevel + ' ';
		}

		if (item.enchantgrade && showItemGrade) {
			let list = ['', 'D', 'C', 'B', 'A'];
			str += '[' + list[item.enchantgrade] + '] ';
		}

		//Hide slots for forged weapons
		var showslots = true;
		if (item.slot) {

			var very = '';
			var name = '';
			var elem = '';

			switch (item.slot.card1) {
				case 0x00FF: // FORGE
					showslots = false;
					if (item.slot.card2 >= 3840) {
						very = MsgStringTable[461]; //Very Very Very Strong
					} else if (item.slot.card2 >= 2560) {
						very = MsgStringTable[460]; //Very Very Strong
					} else if (item.slot.card2 >= 1024) {
						very = MsgStringTable[459]; //Very Strong
					}
					switch (Math.abs(item.slot.card2 % 10)) {
						case 1: elem = MsgStringTable[452]; break; // 's Ice
						case 2: elem = MsgStringTable[454]; break; // 's Earth
						case 3: elem = MsgStringTable[451]; break; // 's Fire
						case 4: elem = MsgStringTable[453]; break; // 's Wind
						default: elem = MsgStringTable[450]; break; // 's
					}

					var GID = (item.slot.card4 << 16) + item.slot.card3;
					name = '<font color="red" class="owner-' + GID + '">Unknown</font>';
					if (DB.CNameTable[GID] && DB.CNameTable[GID] !== 'Unknown') {
						name = '<font color="#87cefa" class="owner-' + GID + '">' + DB.CNameTable[GID] + '</font>';
					} else {
						DB.UpdateOwnerName[GID] = function onUpdateOwnerName(pkt) {
							delete DB.UpdateOwnerName[pkt.GID];
							setTimeout(() => {
								let elements = document.querySelectorAll('.owner-' + pkt.GID);
								for (let i = 0; i < elements.length; i++) {
									elements[i].innerText = pkt.CName;
									elements[i].style.color = "blue";
								}
							}, 1000);
						};
						DB.getNameByGID(GID);
					}

					str += very + ' ' + name + elem + ' ';
					break;
				case 0x00FE: // CREATE
					elem = MsgStringTable[450];
					break;
				case 0xFF00: // PET
					break;
				// Show card prefix
				default:
					var list = ['', 'Double ', 'Triple ', 'Quadruple '];
					var cards = {};
					var cardList = [];
					var i;

					for (i = 1; i <= 4; ++i) {
						var card = item.slot['card' + i];

						if (card) {
							//store order
							if (!(cardList.includes(card))) {
								cardList.push(card);
							}
	
							//store details
							if (cards[card]) {
								cards[card].count++;
							} else {
								cards[card] = {};
								cards[card].isPostfix = DB.getItemInfo(card).isPostfix;
								cards[card].prefixName = DB.getItemInfo(card).prefixName;
								cards[card].count = 0;
							}
						}
					}

					//create prefixes and postfixes in order
					cardList.forEach(card => {
						if (cards[card].isPostfix) {
							postfix += ' ' + list[cards[card].count] + cards[card].prefixName;
							showpostfix = true;
						} else {
							prefix += list[cards[card].count] + cards[card].prefixName + ' ';
							showprefix = true;
						}
					});
			}
			switch (item.slot.card4) {
				case 0x1: //BELOVED PET
					showslots = false;
					str = DB.getMessage(756) + ' ' + str;
					break;
			}
		}

		if (showprefix && showItemPrefix) {
			str += prefix;
		}

		str += it.identifiedDisplayName;

		if (showpostfix && showItemPostfix) {
			str += postfix;
		}

		if (it.slotCount > 0 && showslots && showItemSlots) {
			str += ' [' + it.slotCount + ']';
		}

		if (item.Options && showItemOptions) {
			let numOfOptions = item.Options.filter(Option => Option.index !== 0).length;
			if (numOfOptions) {
				str += ' [' + numOfOptions + ' Option]'
			}
		}

		return str;
	};

	/**
	 * Get random option name
	 *
	 * @param {integer} id
	 * @return {string} item full name
	 */
	DB.getOptionName = function getOptionName(id) {
		if (!(id in RandomOption)) {
			return "UNKNOWN RANDOM OPTION";
		}
		return RandomOption[id];
	}
	/**
	 * Get a message from msgstringtable
	 *
	 * @param {number} message id
	 * @param {string} optional string to show if the text isn't defined
	 * @return {string} message
	 */
	DB.getMessage = function getMessage(id, defaultText) {
		if (!(id in MsgStringTable)) {
			return defaultText !== undefined ? defaultText : 'NO MSG ' + id;
		}

		return TextEncoding.decodeString(MsgStringTable[id]);
	};

	/**
	 * Get Skill Description from DB
	 *
	 * @param {number} skill id
	 */
	DB.getSkillDescription = function getSkillDescription(id) {
		return SkillDescription[id] || '...';
	}

	/**
	 * @param {string} filename
	 * @return {object}
	 */
	DB.getMap = function getMap(mapname) {
		var map = mapname.replace('.gat', '.rsw');

		return MapTable[map] || null;
	};


	/**
	 * Get a message from msgstringtable
	 *
	 * @param {string} mapname
	 * @param {string} default name if not found
	 * @return {string} map location
	 */
	DB.getMapName = function getMapName(mapname, defaultName) {
		var map = mapname.replace('.gat', '.rsw');

		if (!(map in MapTable) || !MapTable[map].name) {
			return (typeof defaultName === 'undefined' ? DB.getMessage(187) : defaultName);
		}

		return TextEncoding.decodeString(MapTable[map].name);
	};

	/**
	 * Get monster name
	 *
	 * @param {number} job id
	 */
	DB.getMonsterName = function getMonsterName(job) {
		return MonsterNameTable[job] ?? 'Unknown';
	}

	/**
	 * Get back town information by mapname
	 * @param {number} efst id
	 */
	DB.getTownInfo = function GetTownInfo(mapname) {
		return TownInfo[mapname] || null;
	};

	/**
	 * Get back map information by mapname
	 * @param {number} efst id
	 */
	DB.getMapInfo = function GetMapInfo(mapname) {
		return MapInfo[mapname] || null;
	};

	/**
	 * Get the whole Laphine Synthesis Table
	 * @returns LaphineSysTable
	 */
	DB.getLaphineSysList = function getLaphineSysList() {
		return LaphineSysTable;
	};

	/**
	 * Get Laphine Synthesis information by itemId
	 * @param {number} itemId
	 * @returns LaphineSysTable[key] if itemId found
	 */
	DB.getLaphineSysInfoById = function getLaphineSysInfoById(itemId) {
		for (let key in LaphineSysTable) {
			if (LaphineSysTable[key].ItemID === itemId) {
				return LaphineSysTable[key];
			}
		}
		return null;
	};

	/**
	 * Retrieves the Laphine Upgrade Table.
	 *
	 * @return {Object} The Laphine Upgrade Table.
	 */
	DB.getLaphineUpgList = function getLaphineUpgList() {
		return LaphineUpgTable;
	};

	/**
	 * Retrieves the Laphine Upgrade information by the given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {Object|null} The Laphine Upgrade information if found, or null if not found.
	 */
	DB.getLaphineUpgInfoById = function getLaphineUpgInfoById(itemId) {
		for (let key in LaphineUpgTable) {
			if (LaphineUpgTable[key].ItemID === itemId) {
				return LaphineUpgTable[key];
			}
		}
		return null;
	};

	/**
	 * Returns the item ID associated with a given base item.
	 *
	 * @param {string} baseItem - The base item to get the ID for.
	 * @return {number} The item ID associated with the base item.
	 */
	DB.getItemIdfromBase = function getItemIdfromBase(baseItem) {
		return ItemDBNameTbl[baseItem];
	};

	/**
	 * Retrieves the base item associated with a given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {string|null} The base item associated with the item ID, or null if not found.
	 */
	DB.getBasefromItemID = function getBasefromItemID(itemId) {
		for (let key in ItemDBNameTbl) {
			if (ItemDBNameTbl[key] === itemId) {
				return key;
			}
		}
		return null; // Return null if not found
	};

	/**
	 * Finds the reform list associated with a given item ID.
	 *
	 * @param {number} itemId - The ID of the item to search for.
	 * @return {Object|null} The reform list associated with the item ID, or null if not found.
	 */
	DB.findReformListByItemID = function findReformListByItemID(itemId) {
		// First, get the base item from the item ID
		const baseItem = DB.getBasefromItemID(itemId);

		// Check if the base item was found and if it exists as a key in ReformItemList
		if (baseItem && ItemReformTable.ReformItemList.hasOwnProperty(baseItem)) {
			return ItemReformTable.ReformItemList[baseItem];
		} else {
			return null; // Return null if not found
		}
	};

	/**
	 * Retrieves the reform information for a given reform ID.
	 *
	 * @param {string} reformId - The ID of the reform to retrieve information for.
	 * @return {Object|null} The reform information object if found, or null if not found.
	 */
	DB.getReformInfo = function getReformInfo(reformId) {
		// Check if the reformId exists in the ReformInfo
		if (ItemReformTable.ReformInfo[reformId]) {
			return ItemReformTable.ReformInfo[reformId];
		} else {
			return null; // Return null if the reform ID is not found
		}
	};

	/**
	 * Retrieves information for all reform IDs in the provided array.
	 *
	 * @param {Array} reformIds - An array of reform IDs to retrieve information for.
	 * @return {Array} An array of reform information objects.
	 */
	DB.getAllReformInfos = function getAllReformInfos(reformIds) {
		let reformInfos = [];

		for (let i = 0; i < reformIds.length; i++) {
			const reformId = reformIds[i];
			const reformInfo = DB.getReformInfo(reformId);

			if (reformInfo) {
				reformInfos.push(reformInfo);
			} else {
				console.log('Reform Info not found for reform ID:', reformId);
			}
		}

		return reformInfos;
	};

	/**
	 * Finds a signboard in the given map based on the provided coordinates.
	 *
	 * @param {string} mapname - The name of the map to search in.
	 * @param {number} x - The x-coordinate of the signboard.
	 * @param {number} y - The y-coordinate of the signboard.
	 * @param {number} [tolerance=1] - The tolerance value for matching coordinates.
	 * @return {Object|null} The signboard object if found, or null if not found.
	 */
	DB.findSignboard = function findSignboard(mapname, x, y, tolerance = 1) {
		const mapData = SignBoardTable[mapname];
		if (mapData) {
			for (let xKey in mapData) {
				if (Math.abs(x - xKey) <= tolerance) {
					const yData = mapData[xKey];
					for (let yKey in yData) {
						if (Math.abs(y - yKey) <= tolerance) {
							return yData[yKey];
						}
					}
				}
			}
		}
		return null;
	};

	/**
	 * Retrieves the translated signboard description based on the provided description.
	 *
	 * @param {string} description - The description of the signboard.
	 * @return {string} The translated signboard description if found, otherwise the original description.
	 */
	DB.getTranslatedSignBoard = function getTranslatedSignBoard(description) {
		return SignBoardTranslatedTable[description] || description;
	};

	/**
	 * Is character id a baby ?
	 *
	 * @param {number} job id
	 * @return {boolean} is baby
	 */
	DB.isBaby = function isBaby(jobid) {
		return BabyTable.indexOf(jobid) > -1;
	};

	DB.getRandomJoke = function getRandomJoke() {
		return JokeTable[Math.round(Math.random() * (JokeTable.length - 1))];
	};

	DB.getRandomScream = function getRandomScream() {
		return ScreamTable[Math.round(Math.random() * (ScreamTable.length - 1))];
	};

	DB.getNameByGID = function getNameByGID(GID) {
		if (DB.CNameTable[GID] && DB.CNameTable[GID] === 'Unknown') // already requested
			return;
		var pkt;
		if (PACKETVER.value >= 20180307) {
			pkt = new PACKET.CZ.REQNAME_BYGID2();
		} else {
			pkt = new PACKET.CZ.REQNAME_BYGID();
		}
		pkt.GID = GID;
		Network.sendPacket(pkt);
		DB.CNameTable[pkt.GID] = 'Unknown';
	}

	/**
	 * Get Pet talk message
	 *
	 * @param {integer} message data combined with mob id, hungryState, actionState
	 * @return {string} pet telk sentence
	 *
	 * @author MrUnzO
	 */
	DB.getPetTalk = function getPetTalk(data) {

		// Structure:
		// Examaple: 1013010
		// 1013  |      01     |     0
		// mobID | hungryState | actionState
		const mobId = parseInt(data.toString().substring(0, 4)) || 1001;
		const hungryState = parseInt(data.toString().substring(4, 6)) || 0;
		const actionState = parseInt(data.toString().substring(6, 7)) || 0;

		if (hungryState >= Object.keys(PetHungryState).length || actionState >= Object.keys(PetMessageConst).length) {
			return false;
		}

		let mobName, hungryText, actionText;
		if (mobId && mobId >= 1000 && mobId < 4000) {
			mobName = (MonsterTable[mobId] || MonsterTable[1001]).toLowerCase();
		}
		if (hungryState !== null && hungryState !== undefined) {
			hungryText = DB.getPetHungryText(parseInt(hungryState));
		}

		if (actionState !== null && actionState !== undefined) {
			actionText = DB.getPetActText(parseInt(actionState));
		}

		if (!mobName || !hungryText || !actionText) {
			return false;
		}

		if (PetTalkTable && PetTalkTable[mobName] && PetTalkTable[mobName][hungryText] && PetTalkTable[mobName][hungryText][actionText]) {
			let rnd = 0;
			if (PetTalkTable[mobName][hungryText][actionText] instanceof Array) {
				rnd = parseInt((Math.random() * 100) % PetTalkTable[mobName][hungryText][actionText].length);
				return TextEncoding.decodeString(PetTalkTable[mobName][hungryText][actionText][rnd]);
			}
			return TextEncoding.decodeString(PetTalkTable[mobName][hungryText][actionText]);
		}

		return false;
	}

	/**
	 * Get Pet Hungry state
	 *
	 * @param {integer} hunger
	 * @return {integer} hunger state
	 *
	 * @author MrUnzO
	 */
	DB.getPetHungryState = function getPetHungryState(hunger) {
		if (!hunger) {
			return 0;
		}
		if (hunger > 90 && hunger <= 100)
			return PetHungryState.PET_FULL;
		else if (hunger > 75 && hunger <= 90)
			return PetHungryState.PET_ENOUGH;
		else if (hunger > 25 && hunger <= 75)
			return PetHungryState.PET_SATISFIED;
		else if (hunger > 10 && hunger <= 25)
			return PetHungryState.PET_HUNGRY;
		else if (hunger >= 0 && hunger <= 10)
			return PetHungryState.PET_HUNGER;
		return 0;
	}

	/**
	 * Get Pet Friendly state
	 *
	 * @param {integer} friendly
	 * @return {integer} friendly state
	 *
	 * @author MrUnzO
	 */
	DB.getPetFriendlyState = function getPetFriendlyState(friendly) {
		if (!friendly) {
			return 0;
		}
		if (friendly > 900 && friendly <= 1000)
			return PetFriendlyState.PET_FAMILIAR;
		else if (friendly > 750 && friendly <= 900)
			return PetFriendlyState.PET_FRIENDLY;
		else if (friendly > 250 && friendly <= 750)
			return PetFriendlyState.PET_NORMAL;
		else if (friendly > 100 && friendly <= 250)
			return PetFriendlyState.PET_AWKWARD;
		else if (friendly >= 0 && friendly <= 100)
			return PetFriendlyState.PET_ASHAMED;
		return 0;
	}

	/**
	 * Get Pet Action text
	 *
	 * @param {integer} action
	 * @return {string} action string
	 *
	 * @author MrUnzO
	 */
	DB.getPetActText = function getPetActText(action) {
		switch (action) {
			case PetMessageConst.PM_FEEDING:
				return "feeding";
			case PetMessageConst.PM_HUNTING:
				return "hunting";
			case PetMessageConst.PM_DANGER:
				return "danger";
			case PetMessageConst.PM_DEAD:
				return "dead";
			case PetMessageConst.PM_NORMAL:
				return "stand";
			case PetMessageConst.PM_CONNENCT:
				return "connect";
			case PetMessageConst.PM_LEVELUP:
				return "levelup";
			case PetMessageConst.PM_PERFORMANCE1:
				return "perfor_1";
			case PetMessageConst.PM_PERFORMANCE2:
				return "perfor_2";
			case PetMessageConst.PM_PERFORMANCE3:
				return "perfor_3";
			case PetMessageConst.PM_PERFORMANCE_S:
				return "perfor_s";
		}

		return "stand";
	}

	/**
	 * Get Pet Hungry state text
	 *
	 * @param {integer} hungry state
	 * @return {String} hungry state text
	 *
	 * @author MrUnzO
	 */
	DB.getPetHungryText = function getPetHungryText(state) {
		switch (state) {
			case PetHungryState.PET_HUNGER:
				return "hungry";
			case PetHungryState.PET_HUNGRY:
				return "bit_hungry";
			case PetHungryState.PET_SATISFIED:
				return "noting";
			case PetHungryState.PET_ENOUGH:
				return "full";
			case PetHungryState.PET_FULL:
				return "so_full";
		}
		return "hungry";

	}

	/**
	 * Get Pet Emotion ID
	 *
	 * @param {integer} hungry state
	 * @param {integer} friendly state
	 * @param {integer} action
	 * @return {integer} emotion id
	 *
	 * @author MrUnzO
	 */
	DB.getPetEmotion = function getPetEmotion(hunger, friendly, act) {
		if (PetEmotionTable[hunger][friendly][act])
			return PetEmotionTable[hunger][friendly][act];

		return false;
	}

	/**
	 * Get Pet talk number message (for send to server to distribute)
	 *
	 * @param {integer} job (mob id)
	 * @param {integer} action
	 * @param {integer} hungry state
	 * @return {integer} message data
	 *
	 * @author MrUnzO
	 */
	DB.getPetTalkNumber = function getPetTalkNumber(job, act, hungry) {
		return parseInt(((job).toString() + (("0" + hungry).slice(-2)) + act.toString()));
	}

	function onUpdateOwnerName(pkt) {
		DB.CNameTable[pkt.GID] = pkt.CName;
		DB.UpdateOwnerName[pkt.GID] = (pkt);
	}

	/**
	 * Indoor checking
	 *
	 * @param {string} map name
	 * @return {boolean} is indoor?
	 *
	 * @author MrUnzO
	 */
	DB.isIndoor = function isIndoor(mapname) {
		if (mapname === undefined) return -1;
		let map;
		if (mapname.substring(mapname.length - 4, mapname.length) == '.gat') {
			map = mapname.replace('.gat', '.rsw');
		} else {
			map = mapname;
		}
		if (MapTable[map] === undefined) {
			return false;
		}
		return MapTable[map].indoor || false;
	};

	DB.UpdateOwnerName = {};

	/**
	 * Get Quest Info by ID
	 *
	 * @param {integer} questID (quest id)
	 *
	 * @author alisonrag
	 */
	DB.getQuestInfo = function getQuestInfo(questID) {
		return QuestInfo[questID] || { "Title": "Unknown Quest", "Description": "Uknown Quest", "Summary": "Uknown Quest", "IconName": "", "NpcSpr": null, "NpcNavi": null, "NpcPosX": null, "NpcPosY": null, "RewardItemList": null, "RewardEXP": 0, "RewardJEXP": 0 };
	};

	DB.getCheckAttendanceInfo = function getCheckAttendanceInfo() {
		return CheckAttendanceTable;
	};

	DB.getBuyingStoreItemList = function getBuyingStoreItemList() {
		return buyingStoreItemList;
	};

	DB.isBuyable = function isBuyable(id) {
		return buyingStoreItemList.includes(id);
	};

	/**
	 * Is item id a pet egg?
	 *
	 * Used for older versions,
	 * because item type PETEGG didn't exist back then
	 * and type ARMOR was used with equip location 0,
	 * but this is not usable in vending since location
	 * is not received with packet...
	 *
	 * @param {integer} id
	 * @returns {boolean}
	 */
	DB.isPetEgg = function isPetEgg(id) {
		return (id >= 9000 && id <= 9150);
	};

	/**
	 * Get Job Class Category
	 *
	 * @param {integer} JobId
	 *
	 */
	DB.getJobClass = function getJobClass(job) {

		switch (job) {
			case JobId.NOVICE:
			case JobId.DO_SUMMONER1:
				return "Base_Class";
				break;

			case JobId.SWORDMAN:
			case JobId.MAGICIAN:
			case JobId.ARCHER:
			case JobId.ACOLYTE:
			case JobId.MERCHANT:
			case JobId.THIEF:
				return "First_Class";
				break;

			case JobId.KNIGHT:
			case JobId.PRIEST:
			case JobId.WIZARD:
			case JobId.BLACKSMITH:
			case JobId.HUNTER:
			case JobId.ASSASSIN:
			case JobId.KNIGHT2:
			case JobId.CRUSADER:
			case JobId.MONK:
			case JobId.SAGE:
			case JobId.ROGUE:
			case JobId.ALCHEMIST:
			case JobId.BARD:
			case JobId.DANCER:
			case JobId.CRUSADER2:
			case JobId.SUPERNOVICE:
				return "Second_Class";
				break;

			case JobId.GUNSLINGER:
			case JobId.NINJA:
			case JobId.TAEKWON:
				return "Expanded_First_Class";
				break;

			case JobId.NOVICE_H:
				return "Rebirth_Class";
				break;

			case JobId.SWORDMAN_H:
			case JobId.MAGICIAN_H:
			case JobId.ARCHER_H:
			case JobId.ACOLYTE_H:
			case JobId.MERCHANT_H:
			case JobId.THIEF_H:
				return "Rebirth_First_Class";
				break;

			case JobId.KNIGHT_H:
			case JobId.PRIEST_H:
			case JobId.WIZARD_H:
			case JobId.BLACKSMITH_H:
			case JobId.HUNTER_H:
			case JobId.ASSASSIN_H:
			case JobId.KNIGHT2_H:
			case JobId.CRUSADER_H:
			case JobId.MONK_H:
			case JobId.SAGE_H:
			case JobId.ROGUE_H:
			case JobId.ALCHEMIST_H:
			case JobId.BARD_H:
			case JobId.DANCER_H:
			case JobId.CRUSADER2_H:
				return "Rebirth_Second_Class";
				break;

			case JobId.STAR:
			case JobId.STAR2:
			case JobId.LINKER:
			case JobId.KAGEROU:
			case JobId.OBORO:
			case JobId.REBELLION:
				return "Expanded_Second_Class";
				break;

			case JobId.RUNE_KNIGHT:
			case JobId.WARLOCK:
			case JobId.RANGER:
			case JobId.ARCHBISHOP:
			case JobId.MECHANIC:
			case JobId.ROYAL_GUARD:
			case JobId.SORCERER:
			case JobId.MINSTREL:
			case JobId.WANDERER:
			case JobId.SURA:
			case JobId.GENETIC:
			case JobId.SHADOW_CHASER:
			case JobId.RUNE_KNIGHT2:
			case JobId.ROYAL_GUARD2:
			case JobId.RANGER2:
			case JobId.MECHANIC2:
				return "Normal_Third_Class";
				break;

			case JobId.RUNE_KNIGHT_H:
			case JobId.WARLOCK_H:
			case JobId.RANGER_H:
			case JobId.ARCHBISHOP_H:
			case JobId.MECHANIC_H:
			case JobId.GUILLOTINE_CROSS_H:
			case JobId.ROYAL_GUARD_H:
			case JobId.SORCERER_H:
			case JobId.MINSTREL_H:
			case JobId.WANDERER_H:
			case JobId.SURA_H:
			case JobId.GENETIC_H:
			case JobId.SHADOW_CHASER_H:
				return "Rebirth_Third_Class";
				break;

			case JobId.EMPEROR:
			case JobId.REAPER:
			case JobId.EMPEROR2:
				return "Expanded_Third_Class";
				break;

			case JobId.DRAGON_KNIGHT:
			case JobId.MEISTER:
			case JobId.SHADOW_CROSS:
			case JobId.ARCH_MAGE:
			case JobId.CARDINAL:
			case JobId.WINDHAWK:
			case JobId.IMPERIAL_GUARD:
			case JobId.BIOLO:
			case JobId.ABYSS_CHASER:
			case JobId.ELEMENTAL_MASTER:
			case JobId.INQUISITOR:
			case JobId.TROUBADOUR:
			case JobId.TROUVERE:
			case JobId.WINDHAWK2:
			case JobId.MEISTER2:
			case JobId.DRAGON_KNIGHT2:
			case JobId.IMPERIAL_GUARD2:
			case JobId.SKY_EMPEROR:
			case JobId.SOUL_ASCETIC:
			case JobId.SHINKIRO:
			case JobId.SHIRANUI:
			case JobId.NIGHT_WATCH:
			case JobId.HYPER_NOVICE:
			case JobId.SPIRIT_HANDLER:
			case JobId.SKY_EMPEROR2:
				return "Fourth_Class";
				break;

			default:
				return "Base_Class";
				break;
		}
	};

	/**
	 * Function to update MapTable with MapInfo values
	 */
	function updateMapTable() {
		for (const key in MapInfo) {
			if (MapInfo.hasOwnProperty(key)) {
				if (MapTable[key]) {
					MapTable[key].name = MapInfo[key].displayName;
				} else {
					MapTable[key] = { name: MapInfo[key].displayName };
				}
			}
		}
	};

	/**
	* Load Group Emblem file
	* Icons for group reads from texture/유저인터페이스/group/...
	*
	* @param {integer} groupId
	* @param {function} callback to run once the file is loaded
	*
	* @author alisonrag
	*/
	DB.loadGroupEmblem = function loadGroupEmblem(groupId, callback) {
		let extension = [22,23,24,25].includes(groupId) ? 'gif' : 'bmp'; // for some reason 22 ~ 25 group emblem has .gif extension

		Client.loadFile( DB.INTERFACE_PATH + "group/group_" + groupId + "." + extension, function(dataURI) {
			let img = new Image();
			img.src = dataURI; // String Base64

			// wait image load to call the callback
			img.onload = function() {
				callback(img);
			};
		});
	}

	/**
	 * Search for NPCs or MOBs in the navigation tables
	 *
	 * @param {string} query - The search query
	 * @param {string} type - The type of search (ALL, NPC, MOB)
	 * @returns {Array} Array of search results
	 */
	DB.searchNavigation = function searchNavigation(query, type) {
		if (!query || query.length < 2) {
			return [];
		}

		query = query.toLowerCase();
		var results = [];

		// Search NPCs if type is ALL or NPC
		if (type === 'ALL' || type === 'NPC') {
			// NaviNpcTable structure: [["map_name", npc_id, npc_type, class_id, "npc_name", "", x, y], ...]
			for (var i = 0; i < NaviNpcTable.length; i++) {
				var npc = NaviNpcTable[i];
				var mapName = npc[0];
				var npcId = npc[1];
				var npcName = npc[4] || '';

				// Skip if no name
				if (!npcName) {
					continue;
				}

				// Check if the NPC name contains the query
				if (npcName.toLowerCase().indexOf(query) !== -1) {
					results.push({
						type: 'NPC',
						id: npcId,
						name: npcName,
						mapName: mapName,
						x: npc[6],
						y: npc[7]
					});
				}
			}
		}

		// Search MOBs if type is ALL or MOB
		if (type === 'ALL' || type === 'MOB') {
			// NaviMobTable structure: [["map_name", spawn_id, mob_type, mob_class, "mob_name", "sprite_name", level, mob_info], ...]
			for (var i = 0; i < NaviMobTable.length; i++) {
				var mob = NaviMobTable[i];
				var mapName = mob[0];
				var mobId = mob[3]; // Using mob_class as the ID
				var mobName = mob[4] || '';

				// Skip if no name
				if (!mobName) {
					continue;
				}

				// Check if the MOB name contains the query
				if (mobName.toLowerCase().indexOf(query) !== -1) {
					// Note: mob_info might contain position data, but structure is unclear
					// For now, we're not including x/y coordinates for mobs
					results.push({
						type: 'MOB',
						id: mobId,
						name: mobName,
						mapName: mapName,
						x: null,
						y: null
					});
				}
			}
		}

		// Sort results by name
		results.sort(function(a, b) {
			return a.name.localeCompare(b.name);
		});

		// Limit to 50 results to avoid performance issues
		return results.slice(0, 50);
	};

	/**
	 * Get the NaviLinkTable
	 *
	 * @returns {Array} The NaviLinkTable
	 */
	DB.getNaviLinkTable = function getNaviLinkTable() {
		return NaviLinkTable;
	};

	/**
	 * Get the NaviLinkDistanceTable
	 *
	 * @returns {Array} The NaviLinkDistanceTable
	 */
	DB.getNaviLinkDistanceTable = function getNaviLinkDistanceTable() {
		return NaviLinkDistanceTable;
	};

	/**
	 * Get the NaviNpcDistanceTable
	 *
	 * @returns {Array} The NaviNpcDistanceTable
	 */
	DB.getNaviNpcDistanceTable = function getNaviNpcDistanceTable() {
		return NaviNpcDistanceTable;
	};

	/**
	 * Export
	 */
	return DB;
});
