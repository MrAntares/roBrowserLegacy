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
	var WeaponTypeExpansion = require('./Items/WeaponTypeExpansion');
	var WeaponSoundTable = require('./Items/WeaponSoundTable');
	var WeaponHitSoundTable = require('./Items/WeaponHitSoundTable');
	var RobeTable = require('./Items/RobeTable');
	var RandomOption = require('DB/Items/ItemRandomOptionTable');
	var WorldMap = require('./Map/WorldMap');
	var SKID = require('./Skills/SkillConst');
	var SkillInfo = require('./Skills/SkillInfo');	
	var SkillTreeView = require('./Skills/SkillTreeView');
	var JobHitSoundTable = require('./Jobs/JobHitSoundTable');
	var WeaponTrailTable = require('./Items/WeaponTrailTable');
	var TownInfo = require('./TownInfo');
	var StatusInfo = require('./Status/StatusInfo');
	var SC = require('./Status/StatusConst');
	var XmlParse = require('Vendors/xmlparse');
	var Base62 = require('Utils/Base62');
	var BSON = require('Vendors/bson');

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

	var SkillDescription = {};

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
	 * @var EnchantList Table
	 * json object
	 */
	var EnchantListTable = {};

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
	 * @var Title Table
	 */
	var TitleTable = {};  
	
	/**
	 * @var User charpage init
	 */
	var servers = Configs.get('servers', []);
	var langType = (servers[0] && servers[0].langtype) ? parseInt(servers[0].langtype, 10) : 1;
	var userCharpage = TextEncoding.detectEncodingByLangtype(langType, Configs.get('disableKorean'));

	/**
	 * @var {Object} PetDBTable
	 */
	var PetDBTable = {};
	var EggIDToJobID = {};

	/**
	 * @var {Object} Reputation Table
	 */
	var ReputeGroup = {};
	var ReputeInfo = {};

	/**
	 * @var {Object} CSV Tables
	 */
	var MsgStringTableCSV = {};
	var MsgEmotionCSV     = {};

	/**
	 * @var {Object} Hat Effect Tables
	 */
	var HatEffectID = {};
	var HatEffectInfo = {};
	var FootPrintEffectInfo = {};

	/**
	 * @var {Array} CashShopBanner Table
	 */
	var CashShopBannerTable = [];

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

		loadFontFromClient('System/Font/');

		console.log('Loading DB files...');

		// Loading TXT Tables
		loadTable('data/mp3nametable.txt', '#', 2, function (index, key, val) { (MapTable[key] || (MapTable[key] = {})).mp3 = val; }, onLoad());
		loadTable('data/mapnametable.txt', '#', 2, function (index, key, val) { (MapTable[key] || (MapTable[key] = {})).name = val; }, onLoad());
		loadTable('data/msgstringtable.txt', '#', 1, function (index, val) { MsgStringTable[index] = val; }, onLoad());
		loadTable('data/resnametable.txt', '#', 2, function (index, key, val) { DB.mapalias[key] = val; }, onLoad());

		// TODO: load these load files by PACKETVER
		if (Configs.get('loadLua')) {
			// Item
			var iteminfoNames = [];
			var customII = Configs.get('customItemInfo',[]);

			if( Array.isArray(customII) && customII.length > 0 ){ // add custom client info table
				iteminfoNames = iteminfoNames.concat(customII);
				tryLoadLuaAliases(loadItemInfo, iteminfoNames, null, onLoad(), true);
			} else { 
				iteminfoNames = iteminfoNames.concat(getSystemAliases('System/itemInfo.lub'));
				tryLoadLuaAliases(loadItemInfo, iteminfoNames, null, onLoad());
			}
			
			loadLuaTable([DB.LUA_PATH + 'datainfo/accessoryid.lub', DB.LUA_PATH + 'datainfo/accname.lub'], 'AccNameTable', function (json) { HatTable = json; }, onLoad());
			loadLuaTable([DB.LUA_PATH + 'datainfo/spriterobeid.lub', DB.LUA_PATH + 'datainfo/spriterobename.lub'], 'RobeNameTable', function (json) { RobeTable = json; }, onLoad());

			if (PACKETVER.value >= 20141008) {
				loadLuaTable([DB.LUA_PATH + 'datainfo/npcidentity.lub', DB.LUA_PATH + 'datainfo/jobname.lub'], 'JobNameTable', function (json) { MonsterTable = json; }, onLoad(), 
					function () {  
						loadPetInfo(DB.LUA_PATH + 'datainfo/petinfo.lub', null, function () {  
							tryLoadLuaAliases(loadPetEvolution, getSystemAliases('System/PetEvolutionCln.lub'), null, onLoad());  
						});  
				});
			} else 
				loadLuaTable([DB.LUA_PATH + 'datainfo/npcidentity.lub', DB.LUA_PATH + 'datainfo/jobname.lub'], 'JobNameTable', function (json) { MonsterTable = json; }, onLoad());  

			loadLuaTable([DB.LUA_PATH + 'datainfo/enumvar.lub', DB.LUA_PATH + 'datainfo/addrandomoptionnametable.lub'], 'NameTable_VAR', function (json) { RandomOption = json; }, onLoad());
			loadItemDBTable(DB.LUA_PATH + 'ItemDBNameTbl.lub', null, onLoad());

			// Weapon tables  
			loadWeaponTable(DB.LUA_PATH + 'datainfo/weapontable.lub', null, onLoad());

			// Title tables
			if(PACKETVER.value >= 20170208){
				loadTitleTable(DB.LUA_PATH + 'datainfo/titletable.lub', null, onLoad());
			}

			// Skill
			loadLuaTable(
				[DB.LUA_PATH + 'skillinfoz/skillid.lub', DB.LUA_PATH + 'skillinfoz/skilldescript.lub'],
				'SKILL_DESCRIPT',
				function (json) {
					SkillDescription = json;
				},
				function () {
					// Calls after skillids and descs been populated
					loadSkillInfoList(
						DB.LUA_PATH + 'skillinfoz/skillinfolist.lub',
						null,
						function () {
							loadSkillTreeView(
								DB.LUA_PATH + 'skillinfoz/skilltreeview.lub',
								null,
								onLoad()
							);
						}
					);
				}
			);

			// Status
			loadStateIconInfo(DB.LUA_PATH + 'stateicon/', null, onLoad());

			// Legacy Navigation
			if(PACKETVER.value >= 20111010){
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_map_krpri.lub', 'Navi_Map', function (json) { NaviMapTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_mob_krpri.lub', 'Navi_Mob', function (json) { NaviMobTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_npc_krpri.lub', 'Navi_Npc', function (json) { NaviNpcTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_link_krpri.lub', 'Navi_Link', function (json) { NaviLinkTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_linkdistance_krpri.lub', 'Navi_Distance', function (json) { NaviLinkDistanceTable = json; }, onLoad());
				loadLuaValue(DB.LUA_PATH + 'navigation/navi_npcdistance_krpri.lub', 'Navi_NpcDistance', function (json) { NaviNpcDistanceTable = json; }, onLoad());
			}

			// HatEffect
			if (PACKETVER.value >= 20150507) {
				loadHatEffectInfo();
			}

			// LaphineSys
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

			// EnchantList
			if (PACKETVER.value >= 20211103) {
				loadEnchantListFile(DB.LUA_PATH + 'Enchant/EnchantList', null, onLoad());
			}
			
			// MapName
			if( Configs.get('enableMapName')  /*PACKETVER.value >= 20190605*/){ // We allow this feature to be enabled on any version due to popular demand
				tryLoadLuaAliases(loadMapTbl, getSystemAliases('System/mapInfo.lub'), function (json) { 
					for (const key in json) { if (json.hasOwnProperty(key)) { MapInfo[key] = json[key]; } } 
					updateMapTable(); 
				}, onLoad());
			}
			
			// EntitySignBoard
			loadSignBoardData('System/Sign_Data.lub', null, onLoad()); // this is not official, its a translation file
			loadSignBoardList(DB.LUA_PATH + 'SignBoardList.lub', null, onLoad());
			
			// CheckAttendance
			if(Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				loadAttendanceFile('System/CheckAttendance.lub', null, onLoad());
			}
			
			// Quest
			tryLoadLuaAliases(loadQuestInfo, getSystemAliases('System/OngoingQuestInfoList.lub'), null, onLoad());
			// TODO: System/RecommendedQuests.lub
			
			// WoldMap
			loadWorldMapInfo(DB.LUA_PATH + 'worldviewdata/', onLoad());
			
			// Achievements
			// TODO: System/achievements.lub
			
			// Town Info
			loadTownInfoFile('System/Towninfo.lub', null, onLoad());

			// Cash Shop Banner - implemented early 2018
			if(Configs.get('enableCashShop') && PACKETVER.value >= 20180000) {
				loadCashShopBanner(DB.LUA_PATH + 'datainfo/tb_cashshop_banner.lub', null, onLoad());
			}
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
			// TODO: data/skillnametable.txt	- ?
			// TODO: data/skilltreeview.txt	- Replaces DB/Skills/SkillTreeView.js
			// TODO: data/leveluseskillspamount.txt	- Replaces DB/Skills/SkillInfo.js -> SkillInfo.SpAmount
			
			// Quest
			loadTable('data/questid2display.txt', '#', 6, parseQuestEntry, onLoad());
		}

		// Load ItemMoveInfo and attach to ItemTable
		if (PACKETVER.value >= 20150422) {
			loadMoveInfoTable(onLoad());
		}

		// Forging/Creation
		loadTable('data/metalprocessitemlist.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).processitemlist = val.split("\n"); }, onLoad());

		// Card
		loadTable('data/num2cardillustnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).illustResourcesName = val; }, onLoad());
		loadTable('data/cardprefixnametable.txt', '#', 2, function (index, key, val) { (ItemTable[key] || (ItemTable[key] = {})).prefixName = val; }, onLoad());
		loadTable('data/cardpostfixnametable.txt', '#', 1, function (index, key) { (ItemTable[key] || (ItemTable[key] = {})).isPostfix = true; }, onLoad());

		// EtcMapData
		loadTable('data/fogparametertable.txt', '#', 5, parseFogEntry, onLoad());
		loadTable('data/indoorrswtable.txt', '#', 1, parseIndoorEntry, onLoad());
		
		// Frost/Scream
		loadTable('data/ba_frostjoke.txt', '\t', 1, function (index, val) { JokeTable[index] = val; }, onLoad());
		loadTable('data/dc_scream.txt', '\t', 1, function (index, val) { ScreamTable[index] = val; }, onLoad());
		
		// Tips
		// TODO: /tipoftheday.txt
		// TODO: /GuildTip.txt

		loadXMLFile('data/pettalktable.xml', function (json) { PetTalkTable = json["monster_talk_table"]; }, onLoad());

		if (PACKETVER.value >= 20100427) {
			loadTable('data/buyingstoreitemlist.txt', '#', 1, function (index, key) { buyingStoreItemList.push(parseInt(key, 10)); }, onLoad());
		}

		// Reputation
		if (PACKETVER.value >= 20220330) {
			loadBSONFile('data/contentdata/repute/reputegroupdata.bson', ReputeGroup, function () {});
			loadBSONFile('data/contentdata/repute/reputeinfodata.bson', ReputeInfo, function () {});
		}

		// CSV Tables - Client Date is not sure since when they were added
		if (PACKETVER.value >= 20230302) {
			loadCSV('data/msgstringtable.csv', MsgStringTableCSV, 0, 1, onLoad());
			loadCSV('data/simplemsg/msg_emotion.csv', MsgEmotionCSV, 0, 2, onLoad());
		}

		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID, onUpdateOwnerName);
		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID2, onUpdateOwnerName);
	};

	async function startLua() {
		lua = await CLua.Lua.create();
	}

	function loadFontFromClient(fontPath) {    

	Client.loadFile(fontPath+'SCDream4.otf', function(fontData4) {	
		const base64_4 = arrayBufferToBase64(fontData4);	
		const fontUrl4 = 'data:font/opentype;base64,' + base64_4;  

		Client.loadFile(fontPath+'SCDream6.otf', function(fontData6) {  
			const base64_6 = arrayBufferToBase64(fontData6);	
			const fontUrl6 = 'data:font/opentype;base64,' + base64_6;  
			  
			const style = document.createElement('style');	
			style.textContent = `  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl6}') format('opentype');  
					font-weight: 100; /* Thin */  
					font-style: normal;  
				}  
				  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl6}') format('opentype');  
					font-weight: 200; /* Extra Light */  
					font-style: normal;  
				}  
				  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl6}') format('opentype');  
					font-weight: 300; /* Light */  
					font-style: normal;  
				}  
				  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl6}') format('opentype');  
					font-weight: 400; /* Normal */  
					font-style: normal;  
				}  
				  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl4}') format('opentype');  
					font-weight: 700; /* Bold */  
					font-style: normal;  
				}  
				  
				@font-face {  
					font-family: 'SCDream';  
					src: url('${fontUrl4}') format('opentype');  
					font-weight: 900; /* Black/Bolder */  
					font-style: normal;  
				}  
			`;	
			document.head.appendChild(style);  
			document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';  
			  
		}, function(error) {  
			console.warn('[loadFontFromClient] - Failed loading client font:', fontPath, '- Using Arial'); 
			document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
			document.body.style.fontSize = '10px'; 
		});  
		  
	}, function(error) {	
		console.warn('[loadFontFromClient] - Failed loading client font:', fontPath, '- Using Arial');	
			document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';	
			document.body.style.fontSize = '10px'; 
		});	
	}
  
	// Helper function to convert ArrayBuffer to base64  
	function arrayBufferToBase64(buffer) {  
		let binary = '';  
		const bytes = new Uint8Array(buffer);  
		const len = bytes.byteLength;  
		for (let i = 0; i < len; i++) {  
			binary += String.fromCharCode(bytes[i]);  
		}  
		return btoa(binary);  
	}  

	/**
	 * get System folder variants
	 */
	function getSystemAliases(basePath) {
		basePath = basePath.replace(/\.(lub|lua)$/i, ''); // Prevents extension been passed

		var suffixes = ['', '_true', '_sak', '_Sakray' ]; // Priority order
		var extensions = ['.lub', '.lua'];
		var fileList = [];

		for (var s = 0; s < suffixes.length; s++) {
			for (var e = 0; e < extensions.length; e++) {
				fileList.push(basePath + suffixes[s] + extensions[e]);
			}
		}
		return fileList;
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
	 * Load CSV table with Base64-encoded columns
	 * Can pick which columns to use for key/value
	 * @param {string} filename - path to CSV
	 * @param {object} targetTable - object to populate
	 * @param {number} keyIndex - 0-based index of column to use as key
	 * @param {number} valueIndex - 0-based index of column to use as value
	 * @param {function} onEnd - callback when done
	 */
	function loadCSV(filename, targetTable, keyIndex, valueIndex, onEnd) {
		Client.loadFile(filename, function (data) {
			console.log('Loading file "' + filename + '"...');

			// Convert to UTF-8 string
			var text;
			if (typeof data === 'string') {
				text = data;
			} else if (data instanceof Uint8Array) {
				text = new TextDecoder('utf-8').decode(data);
			} else if (data instanceof ArrayBuffer) {
				text = new TextDecoder('utf-8').decode(new Uint8Array(data));
			} else {
				text = String(data);
			}

			// Split lines
			var lines = text.split(/\r?\n/);

			for (var i = 0; i < lines.length; i++) {
				var line = lines[i].trim();
				if (!line || line.startsWith('//')) continue;

				var parts = line.split(',');
				if (parts.length <= Math.max(keyIndex, valueIndex)) continue;

				try {
					var key   = base64DecodeUtf8(parts[keyIndex].trim());
					var value = base64DecodeUtf8(parts[valueIndex].trim());

					targetTable[key] = value;
				} catch (e) {
					console.warn('Base64 decode failed on line', i + 1, ':', line);
				}
			}

			onEnd && onEnd();
		}, onEnd);
	};

	/**
	 * Decode a Base64 string as UTF-8
	 * @param {string} str - Base64 encoded string
	 * @returns {string} decoded UTF-8 string
	 */
	function base64DecodeUtf8(str) {
		try {
			// atob() decodes Base64 to binary string
			var binary = atob(str);
			var len = binary.length;
		
			// convert binary string to Uint8Array
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary.charCodeAt(i);
			}
		
			// decode bytes as UTF-8
			return new TextDecoder('utf-8').decode(bytes);
		} catch (e) {
			console.warn('Base64 UTF-8 decode failed:', str, e);
			return str; // fallback to original if decoding fails
		}
	};

	/**
	 * Load ItemMoveInfoV5.txt and attach move info to ItemTable
	 *
	 * @param {function} onEnd
	 */
	function loadMoveInfoTable(onEnd) {
		Client.loadFile('data/ItemMoveInfoV5.txt', function (data) {
			console.log('Loading file "ItemMoveInfoV5.txt"...');

			const lines = data.split(/\r?\n/);
			let count = 0;

			for (let line of lines) {
				line = line.trim();
				if (!line || line.startsWith('//')) continue;

				// Remove inline comments
				const commentIndex = line.indexOf('//');
				if (commentIndex !== -1) {
					line = line.slice(0, commentIndex).trim();
				}

				const cols = line.split(/\s+/);
				if (cols.length < 9) {
					console.warn('Invalid ItemMoveInfo line:', line);
					continue;
				}

				const [
					key,
					drop,
					exchange,
					storage,
					cart,
					npcSale,
					mail,
					auction,
					guildStorage
				] = cols;

				const item = ItemTable[key] || (ItemTable[key] = {});

				item.moveInfo = {
					Drop: drop === '1',
					Exchange: exchange === '1',
					Storage: storage === '1',
					Cart: cart === '1',
					NPCSale: npcSale === '1',
					Mail: mail === '1',
					Auction: auction === '1',
					GuildStorage: guildStorage === '1'
				};

				count++;
			}

			onEnd();
		}, onEnd);
	};

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
	 * Load BSON to JS object / table
	 *
	 * @param {string} filename  File to load
	 * @param {object|array} targetTable
	 * @param {function} onEnd    Called when finished (success or error)
	 *
	 */
	function loadBSONFile(filename, targetTable, onEnd) {
	  Client.loadFile(
	    filename,
	    function (arrayBuffer) {
	      try {
	        console.log('Loading file "' + filename + '"...');

	        var bytes = new Uint8Array(arrayBuffer);
	        var offset = 0;

	        var docs = [];

        	while (offset < bytes.length) {
        	  var size =
        	    bytes[offset] |
        	    (bytes[offset + 1] << 8) |
        	    (bytes[offset + 2] << 16) |
        	    (bytes[offset + 3] << 24);

        	  var slice = bytes.slice(offset, offset + size);
        	  docs.push(BSON.deserialize(slice));

        	  offset += size;
        	}

        	// ---- AS-IS TABLE HANDLING ----

        	var data;
        	if (docs.length === 1) {
        	  data = docs[0];        // single root document
        	} else {
        	  data = docs;           // true multi-doc BSON
        	}

        	// Clear target table
        	for (var k in targetTable) delete targetTable[k];

        	// If root has exactly ONE key, unwrap it
        	if (
        	  typeof data === "object" &&
        	  !Array.isArray(data) &&
        	  Object.keys(data).length === 1
        	) {
        	  var rootKey = Object.keys(data)[0];
        	  data = data[rootKey];
        	}

        	// Copy AS-IS
        	Object.assign(targetTable, data);
	      } catch (e) {
	        console.error("BSON parse error:", e);
	      } finally {
	        if (onEnd) onEnd();
	      }
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


	/**
	 * Loads WorldMap data from Lua files (Language, List, and Table)
	 * Replaces DB/Map/WorldMap.js
	 *
	 * @param {string} basePath - Path to the directory containing worldviewdata files
	 * @param {function} onEnd - Function to run when done
	 */
	function loadWorldMapInfo(basePath, onEnd) {
		const files = [
			'worldviewdata_language.lub',
			'worldviewdata_list.lub',
			'worldviewdata_table.lub'
		];

		const dirPath = basePath.endsWith('/') ? basePath : basePath + '/';
		let loadedBuffers = [];

		// Recursive loader to ensure sequential loading
		function loadNext(index) {
			if (index >= files.length) {
				processWorldMapLua();
				return;
			}

			let fullPath = dirPath + files[index];
			console.log('Loading file "' + fullPath + '"...');

			Client.loadFile(fullPath, function(data) {
				loadedBuffers.push({ name: files[index], data: data });
				loadNext(index + 1);
			}, function() {
				console.error('[loadWorldMapInfo] - Failed to load ' + fullPath);
				// If a file fails, we might not be able to generate the map, but we continue to avoid hanging
				if (onEnd) onEnd();
			});
		}

		async function processWorldMapLua() {
			try {
				const ctx = lua.ctx;
				const userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

				// Function to add a World Category (e.g., Midgard)
				ctx.AddWorldMapCategory = (id, name, tableKey) => {
					let decodedName = userStringDecoder.decode(name);
					let decodedId = userStringDecoder.decode(id);
					let decodedTableKey = userStringDecoder.decode(tableKey);

					WorldMap.push({
						id: decodedId || decodedTableKey, // fallback to table name if id missing
						ep_from: 0,
						ep_to: 99,
						name: decodedName,
						maps: [],
						_tableKey: decodedTableKey // Internal use for mapping maps to this world
					});
					return 1;
				};

				// Function to add a Map to a specific World
				ctx.AddMapToWorld = (dgIndex, worldTableKey, rswName, left, top, right, bottom, nameDisplay, level, mapType) => {
					let decodedTableKey = userStringDecoder.decode(worldTableKey);
					let decodedRsw = userStringDecoder.decode(rswName);
					let decodedName = userStringDecoder.decode(nameDisplay);
					let decodedLevel = level ? userStringDecoder.decode(level) : "";

					// Find the world this map belongs to
					let world = WorldMap.find(w => w._tableKey === decodedTableKey);

					if(mapType === 1){
						let originalMap = world.maps.find(m => m.index === dgIndex && m.type === 0);
						if (originalMap) 
							decodedRsw = originalMap.id; // Copy rsw name
					}

					if (world) {
						// clean .rsw extension for ID
						let mapId = decodedRsw.toLowerCase().replace('.rsw', '').replace('.gat', '');
						
						world.maps.push({
							index: dgIndex,
							id: mapId,
							ep_from: 0,
							ep_to: 99,
							name: decodedName,
							top: top,
							left: left,
							width: right - left, // Calculate width
							height: bottom - top, // Calculate height
							moblevel: decodedLevel,
							type: mapType
						});
					}
					return 1;
				};

				// Mount and execute all files
				for (let i = 0; i < loadedBuffers.length; i++) {
					let f = loadedBuffers[i];
					let buffer = (f.data instanceof ArrayBuffer) ? new Uint8Array(f.data) : f.data;
					lua.mountFile(f.name, buffer);
					await lua.doFile(f.name);
				}

				// Clean Hardcoded DB Safely
				WorldMap.splice(0, WorldMap.length);

				// Execute the processing script
				// Logic: Iterate over World_List -> Get Table Name -> Iterate over that Table -> Extract Data
				lua.doStringSync(`
					function main_worldmap_process()
						if World_List == nil then return end

						for _, worldData in ipairs(World_List) do
							-- worldData structure: { Name, MainTableName, DungeonTableName, BgImage }
							local worldName = worldData[1]
							local mainTableStr = worldData[2]
							local dgTableStr = worldData[3]
							local resourceStr = worldData[4]

							-- Add the world category
							AddWorldMapCategory(resourceStr, worldName, mainTableStr)

							-- Fetch the actual table using the string name (global variable)
							local mapTable = _G[mainTableStr]

							if mapTable ~= nil then
								for _, mapEntry in ipairs(mapTable) do
									-- mapEntry structure: { Index, "map.rsw", left, top, right, bottom, LocalizedName, ... }
									local index = mapEntry[1]
									local rswName = mapEntry[2]
									local left = mapEntry[3]
									local top = mapEntry[4]
									local right = mapEntry[5]
									local bottom = mapEntry[6]
									local nameDisplay = mapEntry[7] or "" -- This is resolved from WORLD_MSGID by Lua automatically
									local level = mapEntry[8] or 0

									AddMapToWorld(index, mainTableStr, rswName, left, top, right, bottom, nameDisplay, level, 0)
								end
							end

							mapTable = _G[dgTableStr]

							if mapTable ~= nil then
								for _, mapEntry in ipairs(mapTable) do
									local index = mapEntry[1]
									local left = mapEntry[2]
									local top = mapEntry[3]
									local right = mapEntry[4]
									local bottom = mapEntry[5]
									local nameDisplay = mapEntry[6] or ""
									local level = mapEntry[7] or 0

									AddMapToWorld(index, mainTableStr, "", left, top, right, bottom, nameDisplay, level, 1)
								end
							end

						end
					end
					main_worldmap_process()
				`);

				// Clean up internal keys
				WorldMap.forEach(w => delete w._tableKey);

			} catch (e) {
				console.error("[loadWorldMapInfo] Lua Error:", e);
			} finally {
				// Unmount files
				loadedBuffers.forEach(f => lua.unmountFile(f.name));
				if (onEnd) onEnd();
			}
		}

		// Start the chain
		loadNext(0);
	}

	function loadTitleTable(filename, callback, onEnd) {  
		Client.loadFile(filename,  
			async function (file) {  
				try {  
					console.log('Loading file "' + filename + '"...');  
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;  
                  
					const ctx = lua.ctx;  
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);  

					ctx.AddTitle = function(titleID, titleName) {  
						TitleTable[titleID] = userStringDecoder.decode(titleName);  
						return 1;  
					};  

					lua.mountFile(filename, buffer);  
					await lua.doFile(filename);  

					lua.doStringSync(`  
						function main_title()  
							if title_tbl then  
								for titleID, titleName in pairs(title_tbl) do  
									result, msg = AddTitle(titleID, titleName)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
						return true, "success"  
						end
						main_title()  
					`);  
                  
				} catch (error) {  
					console.error('[loadTitleTable] Error: ', error);  
				} finally {  
					lua.unmountFile(filename);  
					onEnd();  
				}  
			},  
			onEnd  
		);  
	}

	DB.getAllTitles = function() {  
		return TitleTable;  
	};

	DB.getTitleString = function(titleID) {  
		return TitleTable[titleID] || "";  
	};

	/**
	* Load Town Info file
	*
	* @param {string} filename - relative file path (e.g., 'System/Towninfo.lub')
	* @param {function} callback - (Unused/Legacy)
	* @param {function} onEnd - Function to run when done
	*/
	function loadTownInfoFile(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				console.log('Loading file "' + filename + '"...');
				try {
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					// create decoders
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);
					
					// create AddTownInfo required functions in context
					ctx.AddTownInfo = function AddTownInfo(mapName, name, X, Y, TYPE) {
						mapName = userStringDecoder.decode(mapName);
						TownInfo[mapName] = [];
						TownInfo[mapName].push({
							Name: userStringDecoder.decode(name), 
							X: X,
							Y: Y,
							Type: TYPE
						});
    					};
					// mount file
					lua.mountFile(filename, buffer);
					// execute file
					await lua.doFile(filename);
					// execute main lua function
					lua.doStringSync(`main()`);
				} catch (error) {
					console.error('[loadTownInfoFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadQuestInfo(filename, callback, onEnd) {
		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});
		
		loadPromise.then(async (file) => {
				console.log('Loading file "' + filename + '"...');

			try {
				// check if file is ArrayBuffer and convert to Uint8Array if necessary
				let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

				// create decoders
				let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

				// get context, a proxy. It will be used to interact with lua conveniently
				const ctx = lua.ctx;

				// create required functions in context

				// add quest info
				ctx.AddQuestInfo = (QuestID, Title, Summary, IconName, NpcSpr, NpcNavi, NpcPosX, NpcPosY, RewardEXP, RewardJEXP) => {

					QuestInfo[QuestID] = { 
						"Title": userStringDecoder.decode(Title),
						"Summary": userStringDecoder.decode(Summary),
						"IconName": userStringDecoder.decode(IconName),
						"Description": [],
						"NpcSpr": (NpcSpr instanceof Uint8Array) ? userStringDecoder.decode(NpcSpr) : null,
						"NpcNavi": (NpcNavi instanceof Uint8Array) ? userStringDecoder.decode(NpcNavi) : null,
						"NpcPosX": NpcPosX,
						"NpcPosY": NpcPosY,
						"RewardItemList": [],
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

				// add quest reward item
				ctx.AddQuestRewardItem = (QuestID, ItemID, ItemNum) => {
					QuestInfo[QuestID].RewardItemList.push({ItemID: ItemID, ItemNum: ItemNum});
					return 1;
				};

				// mount file
				lua.mountFile(filename, buffer);
				// execute file
				await lua.doFile(filename);

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
							NpcSpr = DESC.NpcSpr or "",
							NpcNavi = DESC.NpcNavi or "",
							NpcPosX = DESC.NpcPosX or 0,
							NpcPosY = DESC.NpcPosY or 0,
							RewardItemList = DESC.RewardItemList or {},
							RewardEXP = tonumber(DESC.RewardEXP) or 0,
							RewardJEXP = tonumber(DESC.RewardJEXP) or 0,

							Description = type(DESC.Description) == "table" and DESC.Description or {}
						}

						result, msg = AddQuestInfo(QuestID, questData.Title, questData.Summary, questData.IconName, 
												questData.NpcSpr, questData.NpcNavi, questData.NpcPosX, 
												questData.NpcPosY, questData.RewardEXP, 
												questData.RewardJEXP)
						if not result then
							return false, msg
						end

						-- Iterate over RewardItemList table, use empty table if nil
						for k, v in pairs(questData.RewardItemList) do
							result, msg = AddQuestRewardItem(QuestID, v.ItemID, v.ItemNum)
							if not result then
								return false, msg
							end
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
				lua.unmountFile(filename);
				// call onEnd
				onEnd(true);
			}
		}).catch((error) => {
			if (typeof onEnd === 'function') {
				onEnd(false);
			}
		});
	}

	/**
	* Attempt to load files sequentially (Recursive - Fallback).
	* Stop immediately on the first success.
	*
	* @param {Function} loaderFunc
	* @param {Array<String>} file name aliases array.
	* @param {Function} dataCallback - Callback to process the loaded data (the original `callback`, e.g., the one that receives the `json` from mapInfo).
	* @param {Function} onEnd - Called when the entire process finishes (success or total failure).
	* @param {Bool} try load all aliases
	 */
	function tryLoadLuaAliases(rFunc, files, callBack, onEnd, loadAll = false) {

		const totalFiles = files.length;
		if (totalFiles === 0) {
			if (typeof onEnd === 'function') {
				onEnd();
			}
			return;
		}

		let finishedCount = 0;
		let failedCount = 0;
		const trackedOnEnd = (isSuccess) => {
			finishedCount++;
			if (!isSuccess) {
				failedCount++;
			}

			if (finishedCount === totalFiles || isSuccess && !loadAll) {
				if (failedCount === totalFiles) {
					console.error(`[tryLoadLuaAliases] ERROR: All ${totalFiles} tryes to find ${files[0]} failed. Verify your ${files[0]} filename.`);
				}
				if (typeof onEnd === 'function') {
					onEnd();
				}
			}
		};
		
		function tryNext(index) {
			if (index >= totalFiles) {
				return;
			}

			if (files[index].indexOf('System/') !== 0 && files[index].indexOf('System\\') !== 0)   
				files[index] = 'System/' + files[index];  
			
			rFunc(files[index], callBack, (isSuccess) => {
				trackedOnEnd(isSuccess); //await last lua parsing
				if((isSuccess && loadAll) || !isSuccess)
					tryNext(index + 1);
			}); 
		}
		tryNext(0);
	}

	/* Load ItemInfo file to object
	*
	* @param {string} filename to load
	* @param {function} onEnd to run once the file is loaded
	*
	* @author alisonrag
	*/
	function loadItemInfo(filename, callback, onEnd) {

		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});
		
		loadPromise.then(async (file) => {
				let wasSuccessful = false;
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;
					// create decoders
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);
					// create itemInfo required functions in context
					ctx.AddItem = (ItemID, unidentifiedDisplayName, unidentifiedResourceName, identifiedDisplayName, identifiedResourceName, slotCount, ClassNum) => {
						ItemTable[ItemID] = {
							...typeof ItemTable[ItemID] === "object" && ItemTable[ItemID],
							unidentifiedDisplayName: userStringDecoder.decode(unidentifiedDisplayName),
							unidentifiedResourceName: userStringDecoder.decode(unidentifiedResourceName),
							identifiedDisplayName: userStringDecoder.decode(identifiedDisplayName),
							identifiedResourceName: userStringDecoder.decode(identifiedResourceName),
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
					lua.mountFile(filename, buffer);
					// execute file
					await lua.doFile(filename);
					// create and execute our own main function
					// this is necessary because some servers has main function on itemInfo.lub and others load it from itemInfo_f.lub
					// doing this way we avoid to have to load the other file
					// on my tests dont care if the main() is on itemInfo.lub or itemInfo_f.lub the content is always the same
					lua.doStringSync(`
						function main_item()
							_processedItems = _processedItems or {} 
							for ItemID, DESC in pairs(tbl) do
								if not _processedItems[ItemID] and #DESC.identifiedDescriptionName > 0 then
									_processedItems[ItemID] = true 
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
							end
							return true, "good"
							end
						main_item()
						`);
					wasSuccessful = true; 
				} catch (error) {
					console.error('[loadItemInfo] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd(wasSuccessful);
				}
		}).catch((error) => {
			if (typeof onEnd === 'function') {
				onEnd(false);
			}

		});
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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddLaphineSysItem = (key, ItemID, NeedCount, NeedRefineMin, NeedRefineMax, NeedSource_String) => {
						let decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
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
						let decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						let decoded_name = name && name.length > 1 ? userStringDecoder.decode(name) : "";
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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddLaphineUpgradeItem = (key, ItemID, NeedCount, NeedRefineMin, NeedRefineMax, NeedSource_String, NeedOptionNumMin, NotSocketEnchantItem) => {
						let decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
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
						let decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						let decoded_name = name && name.length > 1 ? userStringDecoder.decode(name) : "";
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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddDBItemName = (baseItem, itemID) => {
						let decoded_baseItem = baseItem && baseItem.length > 1 ? userStringDecoder.decode(baseItem) : null;
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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddReformInfo = (key, BaseItem, ResultItem, NeedRefineMin, NeedRefineMax, NeedOptionNumMin, IsEmptySocket, ChangeRefineValue, RandomOptionCode, PreserveSocketItem, PreserveGrade) => {
						let decoded_BaseItem = BaseItem && BaseItem.length > 1 ? userStringDecoder.decode(BaseItem) : null;
						let decoded_ResultItem = ResultItem && ResultItem.length > 1 ? userStringDecoder.decode(ResultItem) : null;
						let decoded_RandomOptionCode = RandomOptionCode && RandomOptionCode.length > 1 ? userStringDecoder.decode(RandomOptionCode) : null;

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
						let decoded_string = string && string.length > 1 ? userStringDecoder.decode(string) : null;
						ItemReformTable.ReformInfo[key].InformationString.push(decoded_string);
						return 1;
					}

					ctx.ReformInfoAddMaterial = (key, Material, Amount) => {
						let decoded_Material = Material && Material.length > 1 ? userStringDecoder.decode(Material) : null;
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
						let decoded_baseItem = baseItem && baseItem.length > 1 ? userStringDecoder.decode(baseItem) : null;
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
	 * Loads Enchant/EnchantList(_f).lub and parses it into EnchantListTable.
	 *
	 * @param {string} basePath - Base path without suffix (e.g., '.../Enchant/EnchantList')
	 * @param {function} callback - Optional callback after load
	 * @param {function} onEnd - The function to call when the loading is complete.
	 * @return {void}
	 */
	function loadEnchantListFile(basePath, callback, onEnd) {
		const normalizedBase = basePath.replace(/\.(lub|lua)$/i, '');
		const defFile = normalizedBase + '_f.lub';
		const listFile = normalizedBase + '.lub';

		Client.loadFile(defFile,
			async function (file) {
				try {
					console.log('Loading file "' + defFile + '"...');

					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;
					const ctx = lua.ctx;
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					EnchantListTable = {};

					const decodeLuaString = (value) => {
						if (value == null) {
							return null;
						}
						if (typeof value === 'string') {
							return value;
						}
						if (value instanceof Uint8Array) {
							return userStringDecoder.decode(value);
						}
						if (value instanceof ArrayBuffer) {
							return userStringDecoder.decode(new Uint8Array(value));
						}
						return String(value);
					};

					const resolveItem = (baseName) => ({
						base: baseName,
						id: DB.getItemIdfromBase(baseName) || 0
					});

					const ensureGroup = (id) => {
						const key = Number(id);
						if (!EnchantListTable[key]) {
							EnchantListTable[key] = {
								id: key,
								slotOrder: [],
								targetItems: [],
								condition: { minRefine: 0, minGrade: 0 },
								allowRandomOption: true,
								reset: { enabled: false, rate: 0, zeny: 0, materials: [] },
								caution: '',
								slots: {}
							};
						}
						return EnchantListTable[key];
					};

					const ensureSlot = (group, slotNum) => {
						const key = Number(slotNum);
						if (!group.slots[key]) {
							group.slots[key] = {
								slot: key,
								require: { zeny: 0, materials: [] },
								successRate: 0,
								gradeBonus: {},
								random: {},
								perfect: {},
								upgrade: {}
							};
						}
						return group.slots[key];
					};

					ctx.MessageBox = (message) => {
						console.error('[loadEnchantListFile] ' + decodeLuaString(message));
						return 1;
					};

					ctx.C_GetSlotCount = (itemDb) => {
						const baseName = decodeLuaString(itemDb);
						const itemId = DB.getItemIdfromBase(baseName);
						const item = itemId ? ItemTable[itemId] : null;
						return item && item.slotCount ? Number(item.slotCount) : 0;
					};

					ctx.MAX_SLOT_NUM = 4;
					ctx.MAX_MATERIAL_NUM = 10;
					ctx.MAX_REFINE_LEVEL = 20;
					ctx.MAX_GRADE_LEVEL = 4;
					ctx.IS_CLIENT = true;

					ctx.AddEnchantGroup = (enchantId) => {
						ensureGroup(enchantId);
						return 1;
					};
					ctx.AddEnchantSlotOrder = (enchantId, slotNum) => {
						const group = ensureGroup(enchantId);
						group.slotOrder.push(Number(slotNum));
						return 1;
					};
					ctx.AddEnchantTargetItem = (enchantId, itemDb) => {
						const group = ensureGroup(enchantId);
						const baseName = decodeLuaString(itemDb);
						group.targetItems.push(resolveItem(baseName));
						return 1;
					};
					ctx.SetEnchantCondition = (enchantId, minRefine, minGrade) => {
						const group = ensureGroup(enchantId);
						group.condition = { minRefine: minRefine, minGrade: minGrade };
						return 1;
					};
					ctx.SetEnchantRandomOption = (enchantId, allow) => {
						const group = ensureGroup(enchantId);
						group.allowRandomOption = !!allow;
						return 1;
					};
					ctx.SetEnchantReset = (enchantId, enabled, rate, zeny) => {
						const group = ensureGroup(enchantId);
						group.reset = { enabled: !!enabled, rate: rate, zeny: zeny, materials: [] };
						return 1;
					};
					ctx.SetEnchantCaution = (enchantId, message) => {
						const group = ensureGroup(enchantId);
						group.caution = decodeLuaString(message);
						return 1;
					};
					ctx.AddEnchantResetMaterial = (enchantId, itemDb, count) => {
						const group = ensureGroup(enchantId);
						const baseName = decodeLuaString(itemDb);
						if (!group.reset) {
							group.reset = { enabled: false, rate: 0, zeny: 0, materials: [] };
						}
						group.reset.materials.push({ ...resolveItem(baseName), count: count });
						return 1;
					};
					ctx.AddEnchantSlot = (enchantId, slotNum) => {
						const group = ensureGroup(enchantId);
						ensureSlot(group, slotNum);
						return 1;
					};
					ctx.SetEnchantRequire = (enchantId, slotNum, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.require = { zeny: zeny, materials: [] };
						return 1;
					};
					ctx.AddEnchantRequireMaterial = (enchantId, slotNum, itemDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						slot.require.materials.push({ ...resolveItem(baseName), count: count });
						return 1;
					};
					ctx.SetEnchantSuccessRate = (enchantId, slotNum, rate) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.successRate = rate;
						return 1;
					};
					ctx.AddEnchantGradeBonus = (enchantId, slotNum, grade, bonus) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						slot.gradeBonus[grade] = bonus;
						return 1;
					};
					ctx.AddEnchantRate = (enchantId, slotNum, grade, itemDb, rate) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						if (!slot.random[grade]) {
							slot.random[grade] = [];
						}
						slot.random[grade].push({ ...resolveItem(baseName), rate: rate });
						return 1;
					};
					ctx.AddPerfectEnchant = (enchantId, slotNum, itemDb, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						slot.perfect[baseName] = { ...resolveItem(baseName), zeny: zeny, materials: [] };
						return 1;
					};
					ctx.AddPerfectEnchantMaterial = (enchantId, slotNum, itemDb, matDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const matName = decodeLuaString(matDb);
						if (!slot.perfect[baseName]) {
							slot.perfect[baseName] = { ...resolveItem(baseName), zeny: 0, materials: [] };
						}
						slot.perfect[baseName].materials.push({ ...resolveItem(matName), count: count });
						return 1;
					};
					ctx.AddUpgradeEnchant = (enchantId, slotNum, itemDb, resultDb, zeny) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const resultName = decodeLuaString(resultDb);
						slot.upgrade[baseName] = {
							...resolveItem(baseName),
							result: resolveItem(resultName),
							zeny: zeny,
							materials: []
						};
						return 1;
					};
					ctx.AddUpgradeEnchantMaterial = (enchantId, slotNum, itemDb, matDb, count) => {
						const group = ensureGroup(enchantId);
						const slot = ensureSlot(group, slotNum);
						const baseName = decodeLuaString(itemDb);
						const matName = decodeLuaString(matDb);
						if (!slot.upgrade[baseName]) {
							slot.upgrade[baseName] = {
								...resolveItem(baseName),
								result: resolveItem(baseName),
								zeny: 0,
								materials: []
							};
						}
						slot.upgrade[baseName].materials.push({ ...resolveItem(matName), count: count });
						return 1;
					};

					lua.mountFile('EnchantList_f.lub', buffer);
					await lua.doFile('EnchantList_f.lub');

					Client.loadFile(listFile,
						async function (fileList) {
							try {
								console.log('Loading file "' + listFile + '"...');

								let listBuffer = (fileList instanceof ArrayBuffer) ? new Uint8Array(fileList) : fileList;
								lua.mountFile('EnchantList.lub', listBuffer);
								await lua.doFile('EnchantList.lub');

								lua.doStringSync(`
									function main_enchantlist()
										for enchantNum, info in pairs(Table) do
											AddEnchantGroup(enchantNum)
											if info.SlotOrder ~= nil then
												for _, slotNum in ipairs(info.SlotOrder) do
													AddEnchantSlotOrder(enchantNum, slotNum)
												end
											end
											if info.TargetItemTbl ~= nil then
												for _, itemDb in ipairs(info.TargetItemTbl) do
													AddEnchantTargetItem(enchantNum, itemDb)
												end
											end
											if info.Condition ~= nil then
												SetEnchantCondition(enchantNum, info.Condition.MinRefine, info.Condition.MinGrade)
											end
											if info.bApproveRandomOpt ~= nil then
												SetEnchantRandomOption(enchantNum, info.bApproveRandomOpt)
											end
											if info.Reset ~= nil then
												SetEnchantReset(enchantNum, info.Reset.bReset, info.Reset.Rate, info.Reset.Zeny)
												if info.Reset.MatTbl ~= nil then
													for matItem, matCount in pairs(info.Reset.MatTbl) do
														AddEnchantResetMaterial(enchantNum, matItem, matCount)
													end
												end
											end
											if info.CautionMsg ~= nil then
												SetEnchantCaution(enchantNum, info.CautionMsg)
											end
											if info.Slot ~= nil then
												for slotNum, slotInfo in pairs(info.Slot) do
													AddEnchantSlot(enchantNum, slotNum)
													if slotInfo.RequireTbl ~= nil then
														SetEnchantRequire(enchantNum, slotNum, slotInfo.RequireTbl.Zeny)
														if slotInfo.RequireTbl.MatTbl ~= nil then
															for matItem, matCount in pairs(slotInfo.RequireTbl.MatTbl) do
																AddEnchantRequireMaterial(enchantNum, slotNum, matItem, matCount)
															end
														end
													end
													if slotInfo.SuccessRate ~= nil then
														SetEnchantSuccessRate(enchantNum, slotNum, slotInfo.SuccessRate)
													end
													if slotInfo.GradeBonusTbl ~= nil then
														for grade, bonus in pairs(slotInfo.GradeBonusTbl) do
															AddEnchantGradeBonus(enchantNum, slotNum, grade, bonus)
														end
													end
													if slotInfo.EnchantRateTbl ~= nil then
														for grade, rateTbl in pairs(slotInfo.EnchantRateTbl) do
															for itemDb, rate in pairs(rateTbl) do
																AddEnchantRate(enchantNum, slotNum, grade, itemDb, rate)
															end
														end
													end
													if slotInfo.PerfectECTbl ~= nil then
														for itemDb, perfect in pairs(slotInfo.PerfectECTbl) do
															AddPerfectEnchant(enchantNum, slotNum, itemDb, perfect.Zeny)
															if perfect.MatTbl ~= nil then
																for matItem, matCount in pairs(perfect.MatTbl) do
																	AddPerfectEnchantMaterial(enchantNum, slotNum, itemDb, matItem, matCount)
																end
															end
														end
													end
													if slotInfo.UpgradeECTbl ~= nil then
														for itemDb, upgrade in pairs(slotInfo.UpgradeECTbl) do
															AddUpgradeEnchant(enchantNum, slotNum, itemDb, upgrade.ResultItemDB, upgrade.Zeny)
															if upgrade.MatTbl ~= nil then
																for matItem, matCount in pairs(upgrade.MatTbl) do
																	AddUpgradeEnchantMaterial(enchantNum, slotNum, itemDb, matItem, matCount)
																end
															end
														end
													end
												end
											end
										end
									end
									main_enchantlist()
								`);

								if (typeof callback === 'function') {
									callback(EnchantListTable);
								}
							} catch (error) {
								console.error('[loadEnchantListFile] Error: ', error);
							} finally {
								lua.unmountFile('EnchantList.lub');
								lua.unmountFile('EnchantList_f.lub');
								onEnd();
							}
						},
						function () {
							console.error('[loadEnchantListFile] Missing file: ' + listFile);
							lua.unmountFile('EnchantList_f.lub');
							onEnd();
						}
					);
				} catch (error) {
					console.error('[loadEnchantListFile] Error: ', error);
					lua.unmountFile('EnchantList_f.lub');
					onEnd();
				}
			},
			function () {
				console.error('[loadEnchantListFile] Missing file: ' + defFile);
				onEnd();
			}
		);
	}

	/**
	 * Loads lub files for Hateffects & Footprints
	 */
	function loadHatEffectInfo(onEnd) {
		const basePath = DB.LUA_PATH + 'hateffectinfo/';
		const idFile   = basePath + 'hateffectids.lub';
		const infoFile = basePath + 'hateffectinfo.lub';

		Client.loadFile(idFile, async function (idBuf) {
			const ctx = lua.ctx;

			ctx.MessageBox = function (msg) {
				console.warn('[HatEffect] ' + msg);
				return 1;
			};

			const decoder = new TextEncoding.TextDecoder(userCharpage);

			function decodeLuaString(v) {
				if (v == null) return null;
				if (typeof v === 'string') return v;
				if (v instanceof Uint8Array) return decoder.decode(v);
				if (v instanceof ArrayBuffer) return decoder.decode(new Uint8Array(v));
				return String(v);
			}

			ctx.__js_hat_effect_id = function (key, value) {
				HatEffectID[decodeLuaString(key)] = Number(value);
				return 1;
			};

			ctx.__js_hat_effect_info = function (id, info) {
				id = Number(id);

				HatEffectInfo[id] = {
					resourceFileName: info.resourceFileName
						? decodeLuaString(info.resourceFileName)
						: null,

					hatEffectID: info.hatEffectID ? Number(info.hatEffectID) : 0,
					hatEffectPos: info.hatEffectPos || 0,
					hatEffectPosX: info.hatEffectPosX || 0,

					isAttachedHead: !!info.isAttachedHead,
					isIgnoreRiding: !!info.isIgnoreRiding,
					isRenderBeforeCharacter: !!info.isRenderBeforeCharacter,

					isAdjustPositionWhenShrinkState: !!info.isAdjustPositionWhenShrinkState,
					isAdjustSizeWhenShrinkState: !!info.isAdjustSizeWhenShrinkState,

					footprint: !!info.footprint
				};
				return 1;
			};

			ctx.__js_footprint_effect_info = function (id, info) {
				id = Number(id);

				FootPrintEffectInfo[id] = {
					type: info.Type || 0,

					pngLeft: info.PngFile_Left
						? decodeLuaString(info.PngFile_Left)
						: null,
					pngRight: info.PngFile_Right
						? decodeLuaString(info.PngFile_Right)
						: null,

					strBottomLeft: info.StrFile_Bottom_Left
						? decodeLuaString(info.StrFile_Bottom_Left)
						: null,
					strBottomRight: info.StrFile_Bottom_Right
						? decodeLuaString(info.StrFile_Bottom_Right)
						: null,

					strTopLeft: info.StrFile_Top_Left
						? decodeLuaString(info.StrFile_Top_Left)
						: null,
					strTopRight: info.StrFile_Top_Right
						? decodeLuaString(info.StrFile_Top_Right)
						: null,

					scaleBottom: info.Scale_Bottom ?? 0,
					scaleTop: info.Scale_Top ?? 0,
					heightTop: info.Height_Top ?? 0,

					stride: info.Stride ?? 50,
					gap: info.Gap ?? 2,
					isAdjustAngle: !!info.IsAdjustAngle
				};

				return 1;
			};

			try {
				lua.mountFile('hateffectids.lub',
					idBuf instanceof ArrayBuffer ? new Uint8Array(idBuf) : idBuf
				);
				await lua.doFile('hateffectids.lub');

				lua.doStringSync(`
					if HatEFID ~= nil then
						for k, v in pairs(HatEFID) do
							__js_hat_effect_id(k, v)
						end
					end
				`);

			} catch (e) {
				console.error('[HatEffect] ID load error', e);
				return;
			} finally {
				lua.unmountFile('hateffectids.lub');
			}

			// Load INFO file (AFTER IDs)
			await new Promise((resolve) => {
				Client.loadFile(infoFile, async function (infoBuf) {
					try {
						lua.mountFile('hateffectinfo.lub',
							infoBuf instanceof ArrayBuffer ? new Uint8Array(infoBuf) : infoBuf
						);
						await lua.doFile('hateffectinfo.lub');

						lua.doStringSync(`
							if hatEffectTable ~= nil then
								for id, info in pairs(hatEffectTable) do
									__js_hat_effect_info(id, info)
								end
							end
						`);

					} catch (e) {
						console.error('[HatEffect] Info load error', e);
					} finally {
						lua.unmountFile('hateffectinfo.lub');
						resolve();
					}
				});
			});

			// Load FOOTPRINT file (AFTER Info)
			await new Promise((resolve) => {
				Client.loadFile(basePath + 'footprinteffectinfo.lub', async function (buf) {
					try {
						lua.mountFile(
							'footprinteffectinfo.lub',
							buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
						);

						await lua.doFile('footprinteffectinfo.lub');

						lua.doStringSync(`
							if FootPrintEffectTable ~= nil then
								for id, info in pairs(FootPrintEffectTable) do
									__js_footprint_effect_info(id, info)
								end
							end
						`);

					} catch (e) {
						console.error('[FootPrintEffect] load error', e);
					} finally {
						lua.unmountFile('footprinteffectinfo.lub');
						resolve();
					}
				});
			});

			// All files loaded
			onEnd && onEnd();
		});
	};

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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddSignBoardData = (key, translation) => {
						let decoded_key = key && key.length > 1 ? userStringDecoder.decode(key) : null;
						let decoded_translation = translation && translation.length > 1 ? userStringDecoder.decode(translation) : null;
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
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context
					ctx.AddSignBoard = (mapname, x, y, height, type, icon_location, description, color) => {
						let decoded_mapname = mapname && mapname.length > 1 ? userStringDecoder.decode(mapname) : null;
						let decoded_icon_location = icon_location && icon_location.length > 1 ? userStringDecoder.decode(icon_location) : null;
						let decoded_description = description && description.length > 1 ? userStringDecoder.decode(description) : null;
						let decoded_color = color && color.length > 1 ? userStringDecoder.decode(color) : null;

						signBoardList.push({
							mapname: decoded_mapname,
							x: x,
							y: y,
							height: height,
							type: type,
							icon_location: decoded_icon_location,
							description: decoded_description,
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
	 * Load weapontable.lub to WeaponTable and WeaponHitSoundTable  
	 *  
	 * @param {string} filename to load  
	 * @param {function} callback to run once the file is loaded  
	 * @param {function} onEnd to run after the callback  
	 */  
	function loadWeaponTable(filename, callback, onEnd) {  
		Client.loadFile(filename,  
			async function (file) {  
				try {  
					console.log('Loading file "' + filename + '"...');  
	
					// check if file is ArrayBuffer and convert to Uint8Array if necessary  
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;  
	
					// get context, a proxy. It will be used to interact with lua conveniently  
					const ctx = lua.ctx;  
	
					// create decoders  
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);  
	
					// create required functions in context  
					ctx.AddWeaponName = (weaponID, weaponName) => {  
						let decoded_weaponName = weaponName && weaponName.length > 0 ? userStringDecoder.decode(weaponName) : "";  
						WeaponTable[weaponID] = decoded_weaponName;  
						return 1;  
					};  
	
					ctx.AddWeaponHitSound = (weaponID, soundFile) => {  
						let decoded_soundFile = soundFile && soundFile.length > 0 ? userStringDecoder.decode(soundFile) : "";  
						WeaponHitSoundTable[weaponID] = decoded_soundFile;  
						return 1;  
					};  

					ctx.AddExpansionWeapon = (weaponID, expansionWeaponID) => {
						WeaponTypeExpansion[weaponID] = expansionWeaponID;
						return 1;
					};
	
					// mount file  
					lua.mountFile('weapontable.lub', buffer);  
	
					// execute file  
					await lua.doFile('weapontable.lub');  
	
					// create and execute our own main function  
					lua.doStringSync(`  
						function main_weapontable()  
							-- Process WeaponNameTable  
							if type(WeaponNameTable) == "table" then  
								for weaponID, weaponName in pairs(WeaponNameTable) do  
									result, msg = AddWeaponName(weaponID, weaponName)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
							
							-- Process WeaponHitWaveNameTable  (seems like gravity is still using the hardcoded sound files)
							-- uncomment this if you want to use the custom sound files
							--if type(WeaponHitWaveNameTable) == "table" then  
							--	for weaponID, soundFile in pairs(WeaponHitWaveNameTable) do  
							--		result, msg = AddWeaponHitSound(weaponID, soundFile)  
							--		if not result then  
							--			return false, msg  
							--		end  
							--	end  
							--end  

							-- Process WeaponTypeExpansionTable
							if type(Expansion_Weapon_IDs) == "table" then  
								for weaponID, expansionWeaponID in pairs(Expansion_Weapon_IDs) do  
									result, msg = AddExpansionWeapon(weaponID, expansionWeaponID)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
							
							return true, "success"  
						end  
						main_weapontable()  
					`);  
	
				} catch (error) {  
					console.error('[loadWeaponTable] Error: ', error);  
	
				} finally {  
					// release file from memory  
					lua.unmountFile('weapontable.lub');  

					// call onEnd  
					onEnd();  
				}  
			},  
			onEnd  
		);  
	}

	/**  
	 * Loads skillinfolist.lub which replaces part of DB/Skills/SkillInfo.js  
	 *  
	 * @param {string} filename - The name of the file to load.  
	 * @param {function} callback - The function to invoke with the loaded data.  
	 * @param {function} onEnd - The function to invoke when loading is complete.  
	 * @return {void}  
	 */
	function loadSkillInfoList(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary  
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently  
					const ctx = lua.ctx;

					// Create automatic JT_ mappings  
					const jobIdWithJT = { ...JobId };  
					for (const [key, value] of Object.entries(JobId)) {  
						jobIdWithJT[`JT_${key}`] = value;  
					}  
					ctx.JOBID = jobIdWithJT; 

					// create decoders  
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create required functions in context  
					ctx.AddSkillInfo = (skillId, resName, skillName, maxLv, spAmount, bSeperateLv, attackRange, skillScale, _NeedSkillListJson) => {
						// Convert to format expected by SkillInfo.js  
						SkillInfo[skillId] = {
							Name: userStringDecoder.decode(resName),
							SkillName: userStringDecoder.decode(skillName),
							MaxLv: maxLv,
							SpAmount: spAmount,
							bSeperateLv: bSeperateLv,
							AttackRange: attackRange,
							SkillScale: skillScale
						};

						// Add _NeedSkillList
						if (_NeedSkillListJson) {
						  try {
						    const jsonString =
						      _NeedSkillListJson instanceof Uint8Array
						        ? userStringDecoder.decode(_NeedSkillListJson)
						        : _NeedSkillListJson;

						    const arr = JSON.parse(jsonString);
						    if (Array.isArray(arr) && arr.length) {
						      SkillInfo[skillId]._NeedSkillList = arr;
						    }
						  } catch (_) {}
						}

						return 1;
					};
					ctx.SKID = SKID;

					if (!ctx.__HAS_CONVERT_TO_JSON__) {
					  await lua.doString(`
					    function ConvertToJson(luaTable)
						  if type(luaTable) ~= 'table' then return nil end

						  local t = {}

						  for _, v in ipairs(luaTable) do
						    if type(v) == 'table' then
						      local id = tonumber(v[1])
						      local lv = tonumber(v[2])

						      if id and lv then
						        t[#t + 1] = "[" .. id .. "," .. lv .. "]"
						      end
						    end
						  end

						  if #t == 0 then return nil end
						  return "[" .. table.concat(t, ",") .. "]"
						end

					  `);
					  ctx.__HAS_CONVERT_TO_JSON__ = true;
					}

					await lua.doString(`
						if SKID then
							__SKID_ORIGINAL = SKID 

							SKID = setmetatable({}, {
								__index = function(t, k)
								local id = __SKID_ORIGINAL[k]
								return id ~= nil and id or 0 
								end
							})
						end
					`);

					// mount file  
					lua.mountFile('skillinfolist.lub', buffer);

					// execute file  
					await lua.doFile('skillinfolist.lub');

					// create and execute our own main function  
					await lua.doString(`  
					function main_skillInfoList()  
						if not SKILL_INFO_LIST then  
							return false, "Error: SKILL_INFO_LIST is nil or not a table"  
						end  
					
						for skillId, skillData in pairs(SKILL_INFO_LIST) do 
							local resName = skillData[1] or "" 
							local skillName = skillData.SkillName or ""  
							local maxLv = skillData.MaxLv or 1  
							local spAmount = skillData.SpAmount or {}  
							local bSeperateLv = skillData.bSeperateLv or false  
							local attackRange = skillData.AttackRange or {}  
							local skillScale = skillData.SkillScale or {}  
							local _NeedSkillListJson = ConvertToJson(skillData._NeedSkillList)

							result, msg = AddSkillInfo(skillId, resName, skillName, maxLv, spAmount, bSeperateLv, attackRange, skillScale, _NeedSkillListJson)  
							if not result then  
								return false, msg  
							end  
						end  
						return true, "good"  
						end
					main_skillInfoList()  
					`);  

				} catch (error) {
					console.error('[loadSkillInfoList] Error: ', error);
				} finally {
					// release file from memory  
					lua.unmountFile('skillinfolist.lub');
					// call onEnd  
					onEnd();
				}
			},
			onEnd
		);
	}
	
	/**  
	* Loads jobinheritlist.lub and skilltreeview.lub which replaces DB/Skills/SkillTreeView.js  
	*  
	* @param {string} filename - The name of the file to load.  
	* @param {function} callback - The function to invoke with the loaded data.  
	* @param {function} onEnd - The function to invoke when loading is complete.  
	* @return {void}  
	*/  
	function loadSkillTreeView(filename, callback, onEnd) {  
		// First load jobinheritlist.lub  
		Client.loadFile(DB.LUA_PATH + 'skillinfoz/jobinheritlist.lub',  
			async function (file) {  
				try {  
					console.log(`Loading file ${DB.LUA_PATH}skillinfoz/jobinheritlist.lub...`);  
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;  
					const ctx = lua.ctx;  
					
					// Mount and execute jobinheritlist.lub  
					lua.mountFile('jobinheritlist.lub', buffer);  
					await lua.doFile('jobinheritlist.lub');  
					
					// Now load skilltreeview.lub  
					loadSkillTreeViewData(filename, callback, onEnd);  
					
				} catch (error) {  
					console.error('[loadSkillTreeView - jobinheritlist] Error: ', error);  
					onEnd();  
				}  
			},  
			onEnd  
		);  
	}  
	
	function loadSkillTreeViewData(filename, callback, onEnd) {  
		Client.loadFile(filename,  
			async function (file) {  
				try {  
					console.log('Loading file "' + filename + '"...');  
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;  
					const ctx = lua.ctx;  
					// Create automatic JT_ mappings  
					const jobIdWithJT = { ...JobId };  
					for (const [key, value] of Object.entries(JobId)) {  
						jobIdWithJT[`JT_${key}`] = value;  
					}  
					ctx.JOBID = jobIdWithJT; 
					
					// Function to add skill tree data using job hierarchy from jobinheritlist.lub  
					ctx.AddSkillTreeView = function (jobId, beforeJob) {  
						// Calculate list and beforeJob from inheritance chain  
						let list = 1;						
						// TODO: Find another way to do that
						if (jobId === JobId.NOVICE) {  
							list = 1;  
						} else if (jobId < JobId.KNIGHT || jobId === JobId.TAEKWON || (jobId >= JobId.SUPERNOVICE && jobId <= JobId.NINJA) || jobId == JobId.DO_SUMMONER ) {  
							list = 1;  
						} else if (jobId < JobId.NOVICE_H || jobId == JobId.STAR || jobId == JobId.LINKER || (jobId >= JobId.KAGEROU && jobId <= JobId.REBELLION) || jobId == JobId.SUPERNOVICE2 || jobId == JobId.SPIRIT_HANDLER ) {  
							list = 2;  
						} else if ((jobId <= JobId.THIEF_H && jobId >= JobId.NOVICE_H) || (jobId >= JobId.NOVICE_B && jobId <= JobId.THIEF_B) || jobId == JobId.DO_SUMMONER_B || jobId == JobId.NINJA_B || jobId == JobId.TAEKWON_B || jobId == JobId.GUNSLINGER_B) {  
							list = 1;  
						} else if (jobId < JobId.RUNE_KNIGHT || (jobId >= JobId.KNIGHT_B && jobId <= JobId.DANCER_B) || (jobId >= JobId.KAGEROU_B && jobId <= JobId.REBELLION_B) ) {  
							list = 2;  
						} else if (jobId < JobId.DRAGON_KNIGHT || jobId == JobId.STAR_EMPEROR || jobId == JobId.SOUL_REAPER || (jobId >= JobId.RUNE_KNIGHT_B && jobId <= JobId.SHADOW_CHASER_B) || jobId === JobId.EMPEROR_B || jobId === JobId.REAPER_B ) {  
							list = 3;  
						} else if (jobId <= JobId.TROUVERE || ( jobId >= JobId.SKY_EMPEROR && jobId <= JobId.HYPER_NOVICE) ) {  
							list = 4;  
						} else {  
							list = 1;
							console.error(`[loadSkillTreeViewData] Failed to find inherith list job: (${jobId})`);
						}
						// Create the skill tree entry  
						const entry = {  
							list: list,  
							beforeJob: beforeJob  
						};  
						
						SkillTreeView[jobId] = entry;  
						return 1;  
					};  
					
					ctx.AddSkillToJob = function (jobId, pos, skillId) {  
						if (SkillTreeView[jobId]) {  
							SkillTreeView[jobId][skillId] = Number(pos);  
						}  
						return 1;  
					};
	
					lua.doStringSync(`
						JobSkillTab = {}
					
						function JobSkillTab.ChangeSkillTabName(in_job, in_1sttab, in_2ndtab, in_3rdtab, in_4thtab)
							local tbl = {
								job = in_job,
								TabName1st = in_1sttab,
								TabName2nd = in_2ndtab,
								TabName3rd = in_3rdtab,
								TabName4th = in_4thtab
							}
							JobSkillTab[#JobSkillTab + 1] = tbl
							return true
						end
					`);

					ctx.SKID = SKID;
					await lua.doString(`
						if SKID then
							__SKID_ORIGINAL = SKID 

							SKID = setmetatable({}, {
								__index = function(t, k)
								local id = __SKID_ORIGINAL[k]
								return id ~= nil and id or 0 
								end
							})
						end
					`);

					lua.mountFile('skilltreeview.lub', buffer);  
					await lua.doFile('skilltreeview.lub');  
	
					lua.doStringSync(`    
						function main_skillTreeView()    
							if not SKILL_TREEVIEW_FOR_JOB then    
								return false, "Error: SKILL_TREEVIEW_FOR_JOB is nil or not a table"    
							end    
					
							for jobId, skillData in pairs(SKILL_TREEVIEW_FOR_JOB) do      
								local beforeJob = JOB_INHERIT_LIST[jobId] or nil  
								result, msg = AddSkillTreeView(jobId, beforeJob)      
								if not result then      
									return false, msg      
								end   
								
								for pos, skillId in pairs(skillData) do    
									result, msg = AddSkillToJob(jobId, pos, skillId)    
									if not result then    
										return false, msg    
									end    
								end  
							end    
							return true, "good"    
						end    
						
						main_skillTreeView()    
					`);
	
				} catch (error) {  
					console.error('[loadSkillTreeView] Error: ', error);  
				} finally {  
					lua.unmountFile('skilltreeview.lub');  
					lua.unmountFile('jobinheritlist.lub');  
					onEnd();  
				}  
			},  
			onEnd  
		);  
	}

	/**
	* Load State Icon Info (StatusInfo) from Lua files
	* Loads efstids.lub, stateiconimginfo.lub, and stateiconinfo.lub sequentially,
	* synchronizing EFST_IDs with StatusConst and populating the StatusInfo table.
	*
	* @param {string} basePath - Directory path (e.g., DB.LUA_PATH + 'stateicon/')
	* @param {function} callback - (Unused/Legacy)
	* @param {function} onEnd - Function to run when done
	*/
	function loadStateIconInfo(basePath, callback, onEnd) {
		const files = [
			'efstids.lub',
			'stateiconimginfo.lub',
			'stateiconinfo.lub'
		];

		let loadedBuffers = [];

		const dirPath = basePath.endsWith('/') ? basePath : basePath + '/';

		function loadNext(index) {
			if (index >= files.length) {
				processLuaData();
				return;
			}

			let fullPath = dirPath + files[index];
			console.log('Loading file "' + fullPath + '"...');

			Client.loadFile(fullPath, function(data) {
				loadedBuffers.push({ name: files[index], data: data });
				loadNext(index + 1);
			}, function() {
				console.error('[loadStateIconInfo] - Failed to load ' + fullPath);
				if (onEnd) onEnd();
			});
		}
	
		async function processLuaData() {
			try {
				const ctx = lua.ctx;
				const userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

				ctx.SetStatusConstants = (sourceTable) => {
					if (typeof sourceTable === 'object' && sourceTable !== null) {
						// Populate SC with constants from the Lua table (e.g., EFST_PROVOKE -> SC.PROVOKE)
						for (const key in sourceTable) {
							if (key.startsWith('EFST_')) {
								const jsKey = key.replace('EFST_', ''); 
								SC[jsKey] = sourceTable[key];
							}
						}
						// Add BLANK back if it was cleared and not defined in LUB
						if (!SC.BLANK) {
							SC.BLANK = -1;
						}
					} else {
						console.error('[loadStateIconInfo]: EFST_IDs table not received from Lua. Cannot synchronize StatusConst.');
					}
					return 1;
				}

				ctx.SetStatusInfo = (id, haveTimeLimit, posTimeLimitStr) => {
					if (!StatusInfo[id]) StatusInfo[id] = {};
					StatusInfo[id].haveTimeLimit = haveTimeLimit;
					StatusInfo[id].posTimeLimitStr = posTimeLimitStr;
					StatusInfo[id].descript = [];
					return 1;
				};

				ctx.AddStatusDesc = (id, desc, r, g, b) => {
					if (!StatusInfo[id]) return 0;
					let text = userStringDecoder.decode(desc);
					let color = null;
					if (r >= 0 && g >= 0 && b >= 0) {
						color = `rgb(${r}, ${g}, ${b})`;
					}
					StatusInfo[id].descript.push([text, color]);
					return 1;
				};

				ctx.SetStatusIcon = (id, iconName) => {
					let icon = userStringDecoder.decode(iconName);
					if (!StatusInfo[id]) StatusInfo[id] = { descript: [] }; 
					StatusInfo[id].icon = icon;
					return 1;
				};

				for (let i = 0; i < loadedBuffers.length; i++) {
					let f = loadedBuffers[i];
					let buffer = (f.data instanceof ArrayBuffer) ? new Uint8Array(f.data) : f.data;
					lua.mountFile(f.name, buffer);
					await lua.doFile(f.name);

					// This prevents the 'table index is nil' crash in stateiconimginfo.lub.
					// return SC.BLANK on nil
					if (f.name === 'efstids.lub') {
						await lua.doString(`
							if EFST_IDs then
								__EFST_IDS_ORIGINAL = EFST_IDs 

								EFST_IDs = setmetatable({}, {
									__index = function(t, k)
										local id = __EFST_IDS_ORIGINAL[k]
										return id ~= nil and id or -1
									end
								})
							end
						`);
					}
				}

				lua.doStringSync(`
					function extract_status_info()
						-- Sync StatusConst (SC) with the full list of EFST_IDs from the original table
						if type(__EFST_IDS_ORIGINAL) == "table" then
							SetStatusConstants(__EFST_IDS_ORIGINAL)
						end

						-- Process Basic Info & Descriptions
						if StateIconList ~= nil then
							for id, info in pairs(StateIconList) do
								SetStatusInfo(id, info.haveTimeLimit, info.posTimeLimitStr)

								if info.descript ~= nil then
									for _, descLine in ipairs(info.descript) do
										local text = descLine[1]
										local colorData = descLine[2]
										local r, g, b = -1, -1, -1

										if type(colorData) == "table" and #colorData >= 3 then
											r = colorData[1]
											g = colorData[2]
											b = colorData[3]
										end

										AddStatusDesc(id, text, r, g, b)
									end
								end
							end
						end

						-- Process Icons 
						if StateIconImgList ~= nil then
							for priorityId, list in pairs(StateIconImgList) do 
								if type(list) == "table" then
									for id, iconName in pairs(list) do
										SetStatusIcon(id, iconName)
									end
								end
							end
						end
					end

					extract_status_info()
				`);
	
			} catch (e) {
				console.error("[loadStateIconInfo] Lua Error:", e);
			} finally {
				loadedBuffers.forEach(f => lua.unmountFile(f.name));
				if (onEnd) onEnd();
			}
		}
	
		loadNext(0);
	}
	
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
						data = new TextDecoder(userCharpage).decode(data);
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
	* @param {function?} contextFunc - Function to execute after parsing but before unmounting  
	*
	* @author alisonrag
	*/
	function loadLuaTable(file_list, table_name, callback, onEnd, contextFunc) {
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

				// create a decoder
				let userDecoder = new TextEncoding.TextDecoder(userCharpage);

				// create context function
				ctx.addKeyAndValueToTable = (key, value) => {
					table[key] = userDecoder.decode(value);
					return 1;
				}

				// used in some specific cases like skilldescript.lub
				ctx.addKeyAndMoreValuesToTable = (key, value) => {
					if (!table[key])
						table[key] = "";
					table[key] += userDecoder.decode(value) + "\n";
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

				if (typeof contextFunc === 'function') {
					contextFunc();
				}

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

						// Create a decoder
						let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

						// Initialize result variable
						let result = null;

						// Add key-value pairs to objects at any nesting level
						ctx.extractValue = (value) => {
							result = JSON.parse(userStringDecoder.decode(value));
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
		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});
		
		loadPromise.then(async (file) => {
				try {
					console.log('Loading file "' + filename + '"...');
					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// create mapInfo required functions in context
					ctx.AddMapDisplayName = (name, displayName, notify_enter) => {
						let decoded_name = userStringDecoder.decode(name);
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
						let decoded_name = userStringDecoder.decode(name);
						let decoded_subTitle = subTitle && subTitle.length > 1 ? userStringDecoder.decode(subTitle) : null;
						let decoded_mainTitle = mainTitle && mainTitle.length > 1 ? userStringDecoder.decode(mainTitle) : null;
						MapInfo[decoded_name].signName = {
							subTitle: decoded_subTitle,
							mainTitle: decoded_mainTitle
						};
						return 1;
					};

					ctx.AddMapBackgroundBmp = (name, backgroundBmp) => {
						let decoded_name = userStringDecoder.decode(name);
						MapInfo[decoded_name].backgroundBmp = backgroundBmp ? userStringDecoder.decode(backgroundBmp) : "field";
						return 1;
					};

					// mount file
					lua.mountFile(filename, buffer);

					// execute file
					await lua.doFile(filename);

					// execute main function
					lua.doStringSync(`main()`);
				} catch (error) {
					console.error('[loadMapTbl] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd(true);
				}
		}).catch((error) => {
			onEnd(false);
		});
	}

	/**
	 * Loads datainfo/petInfo.lub and populate PetDBTable
	 *
	 * @param {string} filename - The name of the file to load.
	 * @param {function} callback - The function to invoke with the loaded data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 * @return {void}
	 */
	function loadPetInfo(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// create decoders
					let decoder = new TextEncoding.TextDecoder(userCharpage);

					lua.mountFile(filename, buffer);
					await lua.doFile(filename);

					// Read Lua table
					const readLuaTable = (tableName) => {
						const result = {};
						const ctx = lua.ctx;
					
					ctx.__push_kv = (k, v) => {
							const key = (k instanceof Uint8Array) ? decoder.decode(k) : k;
							const val = (v instanceof Uint8Array) ? decoder.decode(v) : v;
							result[key] = val;
							return 1;
						};

						lua.doStringSync(`
							for k, v in pairs(${tableName}) do
								__push_kv(k, v)
							end
						`);
						
						return result;
					};

					// Read all pet tables
					const eggMap      = readLuaTable("PetEggItemID_PetJobID");
					const petNames    = readLuaTable("PetNameTable");
					const petStrings  = readLuaTable("PetStringTable");
					const petIllusts  = readLuaTable("PetIllustNameTable_Eng");
					const petAccIDs   = readLuaTable("PetAccIDs");
					const petAccNames = readLuaTable("PetAccActNameTable");

					PetDBTable = {};

					for (const eggId in eggMap) {
						const jobId = Number(eggMap[eggId]);
						const petName = petNames[jobId] || null;
						const accKey  = petName ? `ACC_${petName.toUpperCase()}` : null;
						const accId   = accKey ? petAccIDs[accKey] || null : null;

						PetDBTable[jobId] = {
							PetJobID: jobId,
							PetEggID: Number(eggId),
							PetName: petName,
							PetString: petStrings[jobId] || null,
							PetIllust: petIllusts[jobId] || null,
							PetAcc_ID: accId,
							PetAcc_Name: accId ? petAccNames[accId] || null : null
						};
					}

					EggIDToJobID = {};

					for (const jobID in PetDBTable) {
						const pet = PetDBTable[jobID];
						EggIDToJobID[pet.PetEggID] = Number(jobID);
					}

				} catch (error) {
					console.error('[loadPetInfo] Error: ', error);

				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	};
	
	/**
	 * Loads System/PetEvolutionCLN_true.lub and attach to PetDBTable
	 *
	 * @param {string} filename - The name of the file to load.
	 * @param {function} callback - The function to invoke with the loaded data.
	 * @param {function} onEnd - The function to invoke when loading is complete.
	 * @return {void}
	 */
	function loadPetEvolution(filename, callback, onEnd) {
		const loadPromise = new Promise((resolve, reject) => {
			Client.loadFile(filename, resolve, reject);
		});
		
		loadPromise.then(async (file) => {
				let wasSuccessful = false;
				try {
					console.log('Loading file "' + filename + '"...');
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					lua.mountFile(filename, buffer);

					const ctx = lua.ctx;

					// InsertEvolutionRecipeLGU(BaseEggID, TargetEggID, MaterialID, Amount)
					ctx.InsertEvolutionRecipeLGU = (baseEggID, targetEggID, matID, amt) => {
						const baseJobID = EggIDToJobID[baseEggID];
						if (!baseJobID || !PetDBTable[baseJobID]) {
							console.warn(`[PetEvolution] Unknown base EggID ${baseEggID}`);
							return 1;
						}

						const pet = PetDBTable[baseJobID];

						if (!pet.Evolution) pet.Evolution = {};
						if (!pet.Evolution[targetEggID]) pet.Evolution[targetEggID] = [];
	
						pet.Evolution[targetEggID].push({
							MaterialID: Number(matID),
							Amount: Number(amt)
						});

						return 1;
					};
	
					// InsertPetAutoFeeding(PetID)
					ctx.InsertPetAutoFeeding = (eggID) => {
						const jobID = EggIDToJobID[eggID];
	
						if (!jobID || !PetDBTable[jobID]) {
							console.warn(`[PetAutoFeeding] Unknown EggID ${eggID}`);
							return 1;
						}
	
						PetDBTable[jobID].AutoFeeding = true;
						return 1;
					};
	
					// Execute Lua
					await lua.doFile(filename);
					lua.doStringSync(`main()`);
					wasSuccessful = true; 
				} catch (error) {
					console.error('[loadPetEvolutionFile] Error: ', error);
				} finally {
					// release file from memmory
					lua.unmountFile(filename);
					// call onEnd
					onEnd(wasSuccessful);
				}
		}).catch((error) => {
			if (typeof onEnd === 'function') {
				onEnd(false);
			}

		});
	}
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
	 * Quest entry parser
	 *
	 * @param {number} index
	 * @param {string} title
	 * @param {string} group
	 * @param {string} image
	 * @param {string} description
	 * @param {string} summary
	 */
	function parseQuestEntry(index, key, title, group, image, description, summary) {
		var quest = (QuestInfo[key] || (QuestInfo[key] = {}));

		quest.Title = title;
		quest.Group = group;
		quest.Image = image;
		quest.Description = description;
		quest.Summary = summary;
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
		return jobid < 45 || (jobid >= 4001 && jobid <= 4350) || jobid == 4294967294;
	}

	DB.isDoram = function (jobid) {
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
	 * @param {boolean} sex
	 * @param {number} alternative sprite
	 * @return {string}
	 */
	DB.getBodyPath = function getBodyPath(id, sex, alternative = -1) {
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
			var isDoram = DB.isDoram(id);
			var result = isDoram ? 'data/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xf6\xc5\xeb/' : 'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/';
			result += SexTable[sex] + '/';

			if(PACKETVER.value > 20141022){
				if(alternative > 0){
					if((PACKETVER.value > 20231220 && alternative > JobId.COSTUME_SECOND_JOB_START && alternative < JobId.COSTUME_SECOND_JOB_END) || alternative === 1)
						result += 'costume_1/';

					result += (ClassTable[id] || ClassTable[0]);
					result += '_' + SexTable[sex];

					if((PACKETVER.value > 20231220 && alternative > JobId.COSTUME_SECOND_JOB_START && alternative < JobId.COSTUME_SECOND_JOB_END) || alternative === 1)
						result += '_1';
					return result;
				}
			}

			result += (ClassTable[id] || ClassTable[0]);
			result += '_' + SexTable[sex];

			return result;
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

		if (id == '4056_WUG' || id == '4062_WUG' || id == '4098_WUG') { // 3rd
			return 'data/sprite/\xb8\xf3\xbd\xba\xc5\xcd/\xbf\xf6\xb1\xd7';
		}

		if (id == '4257_FALCON' || id == '4270_FALCON' || id == '4278_FALCON') { // 4th
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/windhawk_hawk';
		}

		if (id == '4257_WUG') { // 4th
			return 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/windhawk_wolf';
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
		if (DB.isDoram(job)) {
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
		// shields has the following ranges:
		// 2100 - 2199
		// 28900 - 28999
		// 460000 - 460099
		if ((id >= 2100 && id <= 2199) || (id >= 28900 && id <= 28999) || (id >= 460000 && id <= 460099)) {
			return true;
		}
		return false;
	};


	DB.getPCAttackMotion = function getPCAttackMotion(job, sex, itemID, isDualWeapon) {

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
					}
					break;
				case JobId.ASSASSIN:
				case JobId.ASSASSIN_H:
				case JobId.ASSASSIN_B:
				case JobId.GUILLOTINE_CROSS:
				case JobId.GUILLOTINE_CROSS_H:
				case JobId.GUILLOTINE_CROSS_B:
				case JobId.SHADOW_CROSS:
					switch (DB.getWeaponType(itemID)) {
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

	DB.isDualWeapon = function isDualWeapon(job, sex, weaponType) {

		let isDualWeapon = false;

		switch (job) {
			case JobId.GUNSLINGER:
			case JobId.GUNSLINGER_B:
			case JobId.REBELLION:
			case JobId.REBELLION_B:
			case JobId.NIGHT_WATCH:
				{
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
							switch (weaponType) {
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
							switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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
					switch (weaponType) {
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

	DB.getWeaponType = function getWeaponType(itemID, realType = false, considerDualHandIds = false) {

		const id = Number(itemID);

		if (isNaN(id) || id < 0) {
			return WeaponType.NONE;
		}

		if (realType && id in WeaponTypeExpansion) {
			return WeaponTypeExpansion[id];
		}

		if (considerDualHandIds && id <= WeaponType.SWORD_AXE) {
			return id;
		}

		// if itemID is lesser then WeaponType.MAX, return the itemID
		if (id < WeaponType.MAX) {
			return id;
		}

		// look for classnum in ItemTable
		if (id in ItemTable && 'ClassNum' in ItemTable[id]) {
			let classNum = ItemTable[id].ClassNum;

			// look for classNum in WeaponTypeExpansion
			if (classNum in WeaponTypeExpansion) {
				return WeaponTypeExpansion[classNum];
			}

			// ClassNUm is the real weapon type
			return classNum;
		} else {
			// if itemID is not in ItemTable, try to find the corresponding weapon type based on the range id
			const ranges = [
				{ min: 1100, max: 1149, type: WeaponType.SWORD },
				{ min: 1150, max: 1199, type: WeaponType.TWOHANDSWORD },
				{ min: 1200, max: 1249, type: WeaponType.SHORTSWORD },
				{ min: 1250, max: 1299, type: WeaponType.KATAR },
				{ min: 1300, max: 1349, type: WeaponType.AXE },
				{ min: 1350, max: 1399, type: WeaponType.TWOHANDAXE },
				{ min: 1400, max: 1449, type: WeaponType.SPEAR },
				{ min: 1450, max: 1499, type: WeaponType.TWOHANDSPEAR },
				{ min: 1500, max: 1549, type: WeaponType.MACE },
				{ min: 1550, max: 1599, type: WeaponType.BOOK },
				{ min: 1600, max: 1699, type: WeaponType.ROD },
				{ min: 1700, max: 1749, type: WeaponType.BOW },
				{ min: 1750, max: 1799, type: WeaponType.NONE },
				{ min: 1800, max: 1849, type: WeaponType.KNUKLE },
				{ min: 1900, max: 1949, type: WeaponType.INSTRUMENT },
				{ min: 1950, max: 1999, type: WeaponType.WHIP },
				{ min: 20000, max: 20999, type: WeaponType.TWOHANDROD },
				{ min: 13000, max: 13099, type: WeaponType.SHORTSWORD },
				{ min: 13100, max: 13149, type: WeaponType.GUN_HANDGUN },
				{ min: 13150, max: 13199, type: WeaponType.GUN_RIFLE },
				{ min: 13300, max: 13399, type: WeaponType.SYURIKEN },
				{ min: 13400, max: 13499, type: WeaponType.SWORD },
				{ min: 18100, max: 18499, type: WeaponType.BOW },
				{ min: 21000, max: 21999, type: WeaponType.TWOHANDSWORD },
			];
		
			// Find the corresponding range
			for (const range of ranges) {
				if (id >= range.min && id <= range.max) {
					return range.type;
				}
			}

			const gunGatling = [13157, 13158, 13159, 13172, 13177];
			if (gunGatling.indexOf(id) > -1) {
				return WeaponType.GUN_GATLING;
			}

			const gunShotGun = [13154, 13155, 13156, 13167, 13168, 13169, 13173, 13178];
			if (gunShotGun.indexOf(id) > -1) {
				return WeaponType.GUN_SHOTGUN;
			}

			const gunGranade = [13160, 13161, 13162, 13174, 13179];
			if (gunGranade.indexOf(id) > -1) {
				return WeaponType.GUN_GRANADE;
			}
		}
		
		// if itemID is not in any range, return NONE
		return WeaponType.NONE;
	};

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
		if (!DB.isShield(id)) {
			return DB.getWeaponPath(id, job, sex);
		}

		const baseClass = WeaponJobTable[job] || WeaponJobTable[0];

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

		id = DB.getWeaponType(id);

		// TODO: CHECK IF THIS IS CORRECT
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

		let realId = DB.getWeaponType(id, true, true);

		return (
			'data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/' +
			baseClass +
			'/' +
			baseClass +
			'_' +
			SexTable[sex] +
			WeaponTrailTable[realId]
		);
	};

	/**
	 * @param {number} cart id
	 */
	DB.getCartPath = function getCartPath(num) {
		var id = Math.max(Math.min(num, 13), 0); //cap 0-13
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
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xd5\xbc\xf6\xb7\xb98',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xb1\xb9\xb0\xbb\xf3\xc0\xda\xc4\xab\xc6\xae',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xc6\xf7\xb8\xb5\xbd\xc6\xc0\xba\xc4\xab\xc6\xae',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xc6\xf7\xb8\xb5\xc4\xab\xc6\xae',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb8\xb6\xb5\xb5\xc4\xab\xc6\xae'
		][id];
	};


	/**
	 * @return {string} Path to weapon sound
	 * @param {number} weapon id
	 */
	DB.getWeaponSound = function getWeaponSound(id) {
		var type = DB.getWeaponType(id, true);
		return WeaponSoundTable[type];
	};


	/**
	 * @return {string} Path to eapon sound
	 * @param {number} weapon id
	 */
	DB.getWeaponHitSound = function getWeaponHitSound(id) {
		var type = DB.getWeaponType(id, true, true);

		let hitSound = WeaponHitSoundTable[type];

		// if array return random item
		if (Array.isArray(hitSound)) {
			return hitSound[Math.floor(Math.random() * hitSound.length)];
		}

		return hitSound;
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
	DB.getWeaponViewID = function getWeaponViewID(id) {

		// validate if is number
		if (isNaN(id)) {
			return 0;
		}

		// if id is 0, return 0
		if (id === 0) {
			return 0;
		}

		// if less then weapon type.MAX, return the id
		if (id < WeaponType.MAX) {
			return id;
		}

		// try to get view from classnum in ItemTable
		if (id in ItemTable && 'ClassNum' in ItemTable[id]) {
			return ItemTable[id].ClassNum;
		}

		// all cases failed, return weapon type to use base sprite
		return DB.getWeaponType(id);
	};

	/**
	 * @return {number} weapon action frame
	 * @param {number} id weapon
	 * @param {number} job
	 * @param {number} sex
	 */
	DB.getWeaponAction = function getWeaponAction(id, job, sex) {
		var type = DB.getWeaponType(id, true);

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

	DB.mountWeapon = function mountWeapon(weaponID, shieldID) {
		let _weapon = DB.getWeaponType(weaponID, true);
		let _shield = DB.getWeaponType(shieldID, true);

		let weapon;

		const viewId = _weapon + _shield;

		switch (viewId) {
			case 2:
				weapon = WeaponType.SHORTSWORD_SHORTSWORD;
				break;
			case 3:
				weapon = WeaponType.SHORTSWORD_SWORD;
				break;
			case 4:
				weapon = WeaponType.SWORD_SWORD;
				break;
			case 7:
				weapon = WeaponType.SHORTSWORD_AXE;
				break;
			case 8:
				weapon = WeaponType.SWORD_AXE;
				break;
			case 12:
				weapon = WeaponType.AXE_AXE;
				break;
			default:
				weapon = viewId;
				break;
		}

		return weapon;
	}

	DB.isBow = function isBow(weaponType) {
		return weaponType == WeaponType.BOW || weaponType == WeaponType.CrossBow || weaponType == WeaponType.Arbalest || weaponType == WeaponType.Kakkung || weaponType == WeaponType.Hunter_Bow || weaponType == WeaponType.Bow_Of_Rudra;
	}

	DB.isKatar = function isKatar(weaponType) {
		return weaponType == WeaponType.KATAR;
	}

	DB.isAssassin = function isAssassin(jobID) {
		return jobID == JobId.ASSASSIN ||
				jobID == JobId.ASSASSIN_H ||
				jobID == JobId.ASSASSIN_B ||
				jobID == JobId.GUILLOTINE_CROSS ||
				jobID == JobId.GUILLOTINE_CROSS_H ||
				jobID == JobId.GUILLOTINE_CROSS_B ||
				jobID == JobId.SHADOW_CROSS;
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
				var servers = Configs.get('servers', []);
				var langType = (servers[0] && servers[0].langtype) ? parseInt(servers[0].langtype, 10) : 1;
				var autoEncoding = TextEncoding.detectEncodingByLangtype(langType, Configs.get('disableKorean'));
				TextEncoding.setCharset(autoEncoding);
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
			let numOfOptions = item.Options.filter(Option => Option?.index && Option?.index !== 0).length;
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
	 * Get a message string from the MsgStringTableCSV
	 *
	 * @param {string} keyorIndex - The key or id to search for
	 * @return {string|null} - The value associated with the given key, or null if not found.
	 */
	DB.getMessageCSV = function getMsgStringCSV(keyOrIndex) {
		if (typeof keyOrIndex === 'number') {
			// Get keys as array just for this lookup
			let keys = Object.keys(MsgStringTableCSV);
			let key = keys[keyOrIndex];
			return key ? MsgStringTableCSV[key] : null;
		}
		// string key lookup
		return MsgStringTableCSV[keyOrIndex] ?? null;
	};

	/**
	 * Get a message string from the MsgEmotionCSV
	 *
	 * @param {string} key - The key to search for
	 * @return {string|null} - The value associated with the given key, or null if not found.
	 */
	DB.getMessageEmotionCSV = function getMsgEmotionCSV(keyOrIndex) {
		if (typeof keyOrIndex === 'number') {
			// Get keys as array just for this lookup
			let keys = Object.keys(MsgEmotionCSV);
			let key = keys[keyOrIndex];
			return key ? MsgEmotionCSV[key] : null;
		}
		// string key lookup
		return MsgEmotionCSV[keyOrIndex] ?? null;
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
		if (!mapname) {
			return (typeof defaultName === 'undefined' ? DB.getMessage(187) : defaultName);
		}
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
	 * Retrieves the Enchant group info by the given group ID.
	 *
	 * @param {number} groupId - The Enchant group ID.
	 * @return {Object|null} The Enchant group info if found, or null.
	 */
	DB.getEnchantGroup = function getEnchantGroup(groupId) {
		return EnchantListTable[groupId] || null;
	};

	/**
	 * Retrieves all Enchant groups.
	 *
	 * @return {Object} Enchant group table.
	 */
	DB.getEnchantGroups = function getEnchantGroups() {
		return EnchantListTable;
	};

	/**
	 * Retrieves Enchant slot info by group and slot.
	 *
	 * @param {number} groupId - The Enchant group ID.
	 * @param {number} slotNum - Slot index.
	 * @return {Object|null} Enchant slot info if found.
	 */
	DB.getEnchantSlot = function getEnchantSlot(groupId, slotNum) {
		const group = EnchantListTable[groupId];
		if (!group || !group.slots) {
			return null;
		}
		return group.slots[slotNum] || null;
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
				console.error('Reform Info not found for reform ID:', reformId);
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
	 * Get all signboards for a specific map  
	 * @param {string} mapname - Map name  
	 * @return {Object} Signboard data for the map  
	 */  
	DB.getAllSignboardsForMap = function getAllSignboardsForMap(mapname) {  
		return SignBoardTable[mapname] || null;  
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
		return QuestInfo[questID] || { "Title": "Unknown Quest", "Description": [], "Summary": "Uknown Quest", "IconName": "", "NpcSpr": null, "NpcNavi": null, "NpcPosX": null, "NpcPosY": null, "RewardItemList": [], "RewardEXP": 0, "RewardJEXP": 0 };
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
	* Load Clan Emblem file
	* Icons for group reads from texture/유저인터페이스/clan_system/...
	*
	* @param {integer} clanId
	* @param {function} callback to run once the file is loaded
	*
	* @author alisonrag
	*/
	DB.loadClanEmblem = function loadClanEmblem(clanId, callback) {
		Client.loadFile( DB.INTERFACE_PATH + "clan_system/clan_emblem" + clanId.toString().padStart(2, '0') + ".bmp", function(dataURI) {
			let img = new Image();
			img.decoding = 'async';
			img.src = dataURI; // String Base64

			// wait image load to call the callback
			img.onload = function() {
				callback(img);
			};
		});
	}

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
			img.decoding = 'async';
			img.src = dataURI; // String Base64

			// wait image load to call the callback
			img.onload = function() {
				callback(img);
			};
		});
	}

	/**
	* Load Mob Type file
	* Icons for Miniboss and MVP from texture/À¯ÀúÀÎÅÍÆäÀÌ½º/montype_...bmp
	*
	* @param {integer} mobType
	* @param {function} callback to run once the file is loaded
	*
	*/
	DB.loadMobEmblem = function loadMobEmblem(mobType, callback) {
		let monType = '';

		switch (mobType) {
			case 1:
				monType = 'montype_boss.bmp';
				break;
			case 2:
				monType = 'montype_mvp.bmp';
				break;
			default:
				console.error('Unknown mob type:', mobType);
				return;
		}

		Client.loadFile( DB.INTERFACE_PATH + monType, function(dataURI) {
			let img = new Image();
			img.decoding = 'async';
			img.src = dataURI; // String Base64

			// wait image load to call the callback
			img.onload = function() {
				callback(img);
			};
		});
	}

	/**
	 * Load CashShopBanner file
	 *
	 * @param {string} filename to load
	 * @param {function} callback - (Unused)
	 * @param {function} onEnd to run once the file is loaded
	 */
	function loadCashShopBanner(filename, callback, onEnd) {
		Client.loadFile(filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					let buffer = (file instanceof ArrayBuffer) ? new Uint8Array(file) : file;

					// get context
					const ctx = lua.ctx;
					let userStringDecoder = new TextEncoding.TextDecoder(userCharpage);

					// Define the function that Lua will call
					// add_cashshop_banner( bitmap_name, url )
					ctx.add_cashshop_banner = function (bitmap_name, url) {
						let decoded_bmp = userStringDecoder.decode(bitmap_name);
						let decoded_url = userStringDecoder.decode(url);

						CashShopBannerTable.push({
							bmp: decoded_bmp,
							url: decoded_url
						});
						return 1;
					};

					// mount file
					lua.mountFile(filename, buffer);

					// execute file to load the table and function definition
					await lua.doFile(filename);

					// execute the main function: set_cashshop_banner()
					lua.doStringSync(`
						if set_cashshop_banner then
							set_cashshop_banner()
						end
					`);

				} catch (error) {
					console.error('[loadCashShopBanner] Error: ', error);
				} finally {
					lua.unmountFile(filename);
					onEnd(true);
				}
			},
			// onError for Client.loadFile
			function () {
				if (onEnd) onEnd(false);
			}
		);
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

	DB.createItemLink = function createItemLink(item) {
		if (!item) {
		  return null;
		}
	  
		// Handle legacy formats (ITEMLINK and ITEM)
		if (PACKETVER.value < 20151104) {
		  return `<ITEMLINK>${item.name}<INFO>${item.ITID}</INFO></ITEMLINK>`;
		}
	  
		if (PACKETVER.value < 20160113) {
		  return `<ITEM>${item.name}<INFO>${item.ITID}</INFO></ITEM>`;
		}
	  
		// Handle ITEML format (newest, most complex)
		let data = "";
	  
		// Encode equipment location (5 chars)
		data += Base62.encode(item.location || 0).padStart(5, "0");
	  
		// Encode is equipment flag (1 char)
		const isEquip = item.type === 5 ? "1" : "0";
		data += isEquip;
	  
		// Encode item ID (variable length)
		data += Base62.encode(item.ITID || 512);
	  
		// Encode refine level (optional, starts with %)
		if (item.RefiningLevel > 0) {
		  data += "%";
		  data += Base62.encode(item.RefiningLevel).padStart(2, "0");
		}
	  
		// Encode item sprite number (optional, starts with &)
		if (PACKETVER.value >= 20161116) {
		  data += "&";
		  let spriteNumber = item.wItemSpriteNumber ? item.wItemSpriteNumber : 0;
		  data += Base62.encode(spriteNumber).padStart(2, "0");
		}
	  
		// Encode enchant grade (optional, starts with ')
		if (PACKETVER.value >= 20200724 && item.enchantgrade > 0) {
		  data += "'";
		  data += Base62.encode(item.enchantgrade).padStart(2, "0");
		}
	  
		// Determine separators based on packet version
		let card_sep, optid_sep, optpar_sep, optval_sep;
		if (PACKETVER.value >= 20200724) {
		  card_sep = ")";
		  optid_sep = "+";
		  optpar_sep = ",";
		  optval_sep = "-";
		} else if (PACKETVER.value >= 20161116) {
		  card_sep = "(";
		  optid_sep = "*";
		  optpar_sep = "+";
		  optval_sep = ",";
		} else {
		  card_sep = "'";
		  optid_sep = ")";
		  optpar_sep = "*";
		  optval_sep = "+";
		}
	  
		// Encode cards (4 cards)
		const cardKeys = ["card1", "card2", "card3", "card4"];
		for (let i = 0; i < 4; i++) {
		  const cardValue = item.slot?.[cardKeys[i]] || 0;
		  if (cardValue > 0) {
			data += card_sep;
			data += Base62.encode(cardValue).padStart(2, "0");
		  }
		}
	  
		// Encode random options (up to 5)
		if (item.Options) {
			item.Options.forEach(option => {
				if (option.index > 0) {
					data += optid_sep;
					data += Base62.encode(option.index).padStart(2, "0");
					data += optpar_sep;
					data += Base62.encode(option.param).padStart(2, "0");
					data += optval_sep;
					data += Base62.encode(option.value).padStart(2, "0");
				}
			});
		}

		return `<ITEML>${data}</ITEML>`;
	  };
	  
	  // <ITEMLINK> (Oldest format)
	  // Used for NPC message item links in clients from 2010-01-01 to before 2015-11-04.
	  // example: <ITEMLINK>Display Name<INFO>Item ID</INFO></ITEMLINK>
	  // <ITEM> (Middle format)
	  // Used for NPC message item links in clients from 2015-11-04 onwards, replacing <ITEMLINK>.
	  // example: <ITEM>Display Name<INFO>Item ID</INFO></ITEM>
	  // <ITEML> (Newest format)
	  // Used for player-generated item links (like Shift+Click from inventory) in clients from 2016-01-13 onwards.
	  // example: <ITEML>encoded_item_data</ITEML>
	  DB.parseItemLink = function parseItemLink(itemLink) {
		if (!itemLink) {
		  return null;
		}
	  
		let item = {
		  ITID: 512,
		  name: "Unknown Item",
		  type: 1,
		  location: 0,
		  slot: {
			card1: 0,
			card2: 0,
			card3: 0,
			card4: 0,
		  },
		  nRandomOptionCnt: 0,
		  Options: [{ index: 0, value: 0, param: 0 }],
		  RefiningLevel: 0,
		  enchantgrade: 0,
		  IsIdentified: 1,
		  IsDamaged: 0,
		  wItemSpriteNumber: 0,
		};
	  
		let content = null;
	  
		// parse ITEMLINK and ITEM format
		if (itemLink.includes("<ITEMLINK>") || itemLink.includes("<ITEM>")) {
		  content =
			itemLink.match(/<ITEMLINK>(.*?)<INFO>(.*?)<\/INFO><\/ITEMLINK>/) ||
			itemLink.match(/<ITEM>(.*?)<INFO>(.*?)<\/INFO><\/ITEM>/);
		  if (content) {
			item.ITID = content[2];
			item.name = content[1];
			return item;
		  }
	  
		  // return unknown item
		  return item;
		}
	  
		if (itemLink.includes("<ITEML>")) {
		  content = itemLink.match(/<ITEML>(.*?)<\/ITEML>/);
		} else {
		  return item;
		}
	  
		const data = content[1];
		let pos = 0;
	  
		try {
		  // Parse equipment location (5 chars)
		  item.location = Base62.decode(data.substr(pos, 5));
		  pos += 5;
	  
		  // Parse is equipment flag (1 char)
		  const isEquip = data[pos] === "1";
	  
		  // TODO: add equipment type
		  item.type = isEquip ? 5 : 0; // Default to armor type if equipment
		  pos += 1;
	  
		  // Parse item ID (variable length until special char)
		  let itemIdStr = "";
		  while (pos < data.length && !"%&')(*+,-".includes(data[pos])) {
			itemIdStr += data[pos];
			pos++;
		  }
		  item.ITID = Base62.decode(itemIdStr);
	  
		  // Parse refine level (optional, starts with %)
		  if (pos < data.length && data[pos] === "%") {
			pos++; // Skip %
			item.RefiningLevel = Base62.decode(data.substr(pos, 2));
			pos += 2;
		  }
	  
		  if (PACKETVER.value >= 20161116 && pos < data.length && data[pos] === "&") {
			pos++; // Skip &
			item.wItemSpriteNumber = Base62.decode(data.substr(pos, 2));
			pos += 2;
		  }
	  
		  if (PACKETVER.value >= 20200724 && pos < data.length && data[pos] === "'") {
			pos++; // Skip '
			item.enchantgrade = Base62.decode(data.substr(pos, 2));
			pos += 2;
		  }
	  
		  // Determine separators based on detected packet version
		  let card_sep, optid_sep, optpar_sep, optval_sep;
		  if (PACKETVER.value >= 20200724) {
			card_sep = ")";
			optid_sep = "+";
			optpar_sep = ",";
			optval_sep = "-";
		  } else if (PACKETVER.value >= 20161116) {
			card_sep = "(";
			optid_sep = "*";
			optpar_sep = "+";
			optval_sep = ",";
		  } else {
			card_sep = "'";
			optid_sep = ")";
			optpar_sep = "*";
			optval_sep = "+";
		  }
	  
		  // Parse cards
		  const cardKeys = ["card1", "card2", "card3", "card4"];
		  let cardIndex = 0;
	  
		  while (cardIndex < 4 && pos < data.length) {
			if (data[pos] !== card_sep) break; // não tem mais carta
	  
			pos++; // skip
	  
			// take all characters that are not card separators or random option separators
			let cardStr = "";
			while (pos < data.length) {
			  const c = data[pos];
			  // stop if next separator is a card separator or random option separator
			  if (c === card_sep || c === optid_sep) {
				break;
			  }
			  // stop if next separator is a future separator (security)
			  if ("%&'()*+,-".includes(c)) {
				break;
			  }
			  cardStr += c;
			  pos++;
			}
	  
			// if nothing was taken, it's an empty card (0)
			if (cardStr === "" || cardStr === "00") {
			  item.slot[cardKeys[cardIndex]] = 0;
			} else {
			  item.slot[cardKeys[cardIndex]] = Base62.decode(cardStr);
			}
	  
			cardIndex++;
		  }
	  
		  // fill the cards that didn't exist with 0
		  while (cardIndex < 4) {
			item.slot[cardKeys[cardIndex]] = 0;
			cardIndex++;
		  }
	  
		  // Parse random options (variable count)
		  let optionIdx = 0;
		  while (pos < data.length && data[pos] === optid_sep && optionIdx < 5) {
			pos++; // Skip option ID separator
			const optId = Base62.decode(data.substr(pos, 2));
			pos += 2;
	  
			if (pos >= data.length || data[pos] !== optpar_sep) break;
			pos++; // Skip param separator
			const optParam = Base62.decode(data.substr(pos, 2));
			pos += 2;
	  
			if (pos >= data.length || data[pos] !== optval_sep) break;
			pos++; // Skip value separator
			const optValue = Base62.decode(data.substr(pos, 2));
			pos += 2;
	  
			item.Options.push({
			  index: optId,
			  value: optValue,
			  param: optParam,
			});
			optionIdx++;
		  }
	  
		  // Fill remaining option slots with zeros
		  while (item.Options.length < 5 + 1) {
			item.Options.push({ index: 0, value: 0, param: 0 });
		  }
	  
		  item.nRandomOptionCnt = optionIdx;
	  
		  item.name = DB.getItemName(item);
	  
		  return item;
		} catch (error) {
		  console.error("Error parsing item link:", error);
		  return null;
		}
	  };
	  
	  DB.getItemNameFromLink = function getItemNameFromLink(itemLink) {
		if (!itemLink) {
		  return null;
		}
	  
		let item = DB.parseItemLink(itemLink);
		return item.name;
	  };
	  
	  /**
	  * Format a Unix timestamp (seconds) into MM/DD HH:mm
	  *
	  * @param {number} unixTimestamp - Unix time in seconds
	  * @returns {string} Formatted date string (MM/DD HH:mm)
	  */
	  DB.formatUnixDate = function formatUnixDate(unixTimestamp) {
		const d = new Date(unixTimestamp * 1000);

		return (
			String(d.getMonth() + 1).padStart(2, '0') + '/' +
			String(d.getDate()).padStart(2, '0') + ' ' +
			String(d.getHours()).padStart(2, '0') + ':' +
			String(d.getMinutes()).padStart(2, '0')
		);
	  };

	  /**
	  * Convert RO color codes (^RRGGBB) to HTML spans
	  * 
	  * @param {string} msg - Message with RO color codes
	  * @returns {string} Message formatted to HTML
	  */
	  DB.formatMsgToHtml = function MsgToHtml(msg) {
		let hasOpenSpan = false;

		msg = msg.replace(/\^([0-9a-fA-F]{6})/g, (_, color) => {
			const close = hasOpenSpan ? '</span>' : '';
			hasOpenSpan = true;
			return close + `<span style="color:#${color}">`;
		});

		if (hasOpenSpan) msg += '</span>';
		return msg;
	  };

	  /**
	  * Get pet data by job ID
	  *
	  * @param {number} jobID - Job ID
	  * @returns {?Object} Pet data or null if not found
	  */
	  DB.getPetByJobID = function (jobID) {
	  	return PetDBTable[jobID] || null;
	  };

	  /**
	   * Get pet evolution data by job ID
	   *
	   * @param {number} jobID - Job ID
	   * @returns {?Object} Pet evolution data or null if not found
	   */
	  DB.getPetEvolutionByJob = function (jobID) {
	  	const pet = PetDBTable[jobID];
	  	return pet && pet.Evolution ? pet.Evolution : null;
	  };

	  /**
	   * Get pet data by pet egg ID
	   *
	   * @param {number|string} eggID - Pet egg ID
	   * @returns {?Object} Pet data or null if not found
	   */
	  DB.getPetByEggID = function (eggID) {
	    for (const jobID in PetDBTable) {
	      const pet = PetDBTable[jobID];
	      if (pet.PetEggID === Number(eggID)) return pet;
	    }
	    return null;
	  };

	  /**
	   * Get the entire reputation group list
	   *
	   * @returns {Object} Reputation group list
	   */
	  DB.getReputeGroup = function getReputeGroup() {
	    return ReputeGroup;
	  };

	  /**
	   * Get the reputation group list for a given group id
	   * 
	   * @param {string} repute_group - Reputation group id
	   * @returns {?Object} Reputation group list or null if not found
	   */
	  DB.getReputeGroupList = function getReputeList(repute_group) {
	    return ReputeGroup[repute_group].ReputeList || null;
	  };

	  /**
	   * Get the entire reputation information list
	   *
	   * @returns {Object} Reputation information list
	   */
	  DB.getReputeInfo = function getReputeInfo() {
		  return ReputeInfo;
	  };

	  /**
	   * Get the reputation data for a given reputation ID
	   *
	   * @param {number|string} repute_id - Reputation ID
	   * @returns {?Object} Reputation data or null if not found
	   */
	  DB.getReputeData = function getReputeData(repute_id) {
	    return ReputeInfo[repute_id] || null;
	  };

	  /**
	   * Get a Hateffect Info by ID
	   * @param {number} id - Hateffect ID
	   * @returns {Object|null} Hateffect info or null if not found
	   */
	  DB.getHatResource = function getHatResource(id) {
		return HatEffectInfo[id] || null;
	  };

	  /**
	   * Get the CashShopBannerTable
	   *
	   * @returns {Array} CashShopBannerTable
	   */
	  DB.getCashShopBannerTable = function getCashShopBannerTable() {
	    return CashShopBannerTable;
	  };

	/**
	 * Export
	 */
	return DB;
});
