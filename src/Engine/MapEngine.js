/**
 * Engine/MapEngine.js
 *
 * Map Engine
 * Manage Map server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var jQuery           = require('Utils/jquery');
	var DB               = require('DB/DBManager');
	var Configs          = require('Core/Configs');
	var SoundManager     = require('Audio/SoundManager');
	var BGM              = require('Audio/BGM');
	var Events           = require('Core/Events');
	var Session          = require('Engine/SessionStorage');
	var Network          = require('Network/NetworkManager');
	var PACKETVER        = require('Network/PacketVerManager');
	var PACKET           = require('Network/PacketStructure');
	var Renderer         = require('Renderer/Renderer');
	var Camera           = require('Renderer/Camera');
	var MapRenderer      = require('Renderer/MapRenderer');
	var EntityManager    = require('Renderer/EntityManager');
	var Entity           = require('Renderer/Entity/Entity');
	var Altitude         = require('Renderer/Map/Altitude');
	var MapControl       = require('Controls/MapControl');
	var Mouse            = require('Controls/MouseEventHandler');
	var KEYS             = require('Controls/KeyEventHandler');
	var UIManager        = require('UI/UIManager');
	var EffectManager    = require('Renderer/EffectManager');
	var Background       = require('UI/Background');
	var Escape           = require('UI/Components/Escape/Escape');
	var ChatBox          = require('UI/Components/ChatBox/ChatBox');
	var ChatBoxSettings  = require('UI/Components/ChatBoxSettings/ChatBoxSettings');
	var StatusConst      = require('DB/Status/StatusState');
	var CheckAttendance  = require('UI/Components/CheckAttendance/CheckAttendance');
	var WinStats         = require('UI/Components/WinStats/WinStats');
	var Inventory        = require('UI/Components/Inventory/Inventory');
	var Storage          = require('UI/Components/Storage/Storage');
	var CartItems        = require('UI/Components/CartItems/CartItems');
	var Vending          = require('UI/Components/Vending/Vending');
	var VendingReport    = require('UI/Components/VendingReport/VendingReport');
	var ChangeCart       = require('UI/Components/ChangeCart/ChangeCart');
	var ShortCut         = require('UI/Components/ShortCut/ShortCut');
	var Equipment        = require('UI/Components/Equipment/Equipment');
	var SwitchEquip      = require('UI/Components/SwitchEquip/SwitchEquip');
	var ShortCuts        = require('UI/Components/ShortCuts/ShortCuts');
	var StatusIcons      = require('UI/Components/StatusIcons/StatusIcons');
	var ChatRoomCreate   = require('UI/Components/ChatRoomCreate/ChatRoomCreate');
	var Emoticons        = require('UI/Components/Emoticons/Emoticons');
	var FPS              = require('UI/Components/FPS/FPS');
	var PartyFriends     = require('UI/Components/PartyFriends/PartyFriends');
	var Guild            = require('UI/Components/Guild/Guild');
	var WorldMap         = require('UI/Components/WorldMap/WorldMap');
	var SkillListMH      = require('UI/Components/SkillListMH/SkillListMH');
	var MobileUI         = require('UI/Components/MobileUI/MobileUI');
	var CashShop         = require('UI/Components/CashShop/CashShop');
	var Bank             = require('UI/Components/Bank/Bank');
	var ItemReform		 = require('UI/Components/ItemReform/ItemReform');
	var LaphineSys		 = require('UI/Components/LaphineSys/LaphineSys');
	var LaphineUpg		 = require('UI/Components/LaphineUpg/LaphineUpg');
	var Rodex            = require('UI/Components/Rodex/Rodex');
	var RodexIcon        = require('UI/Components/Rodex/RodexIcon');
	var Roulette         = require('UI/Components/Roulette/Roulette');
	var PCGoldTimer      = require('UI/Components/PCGoldTimer/PCGoldTimer');
	var Refine           = require('UI/Components/Refine/Refine');
	var Reputation       = require('UI/Components/Reputation/Reputation');
	var PetInformations  = require('UI/Components/PetInformations/PetInformations');
	var HomunInformations = require('UI/Components/HomunInformations/HomunInformations');
	var MapName          = require('UI/Components/MapName/MapName');
	var Announce         = require('UI/Components/Announce/Announce');
	var Navigation         = require('UI/Components/Navigation/Navigation');
	var CaptchaUpload    = require('UI/Components/Captcha/CaptchaUpload');
	var CaptchaSelector  = require('UI/Components/Captcha/CaptchaSelector');
	var CaptchaAnswer    = require('UI/Components/Captcha/CaptchaAnswer');
	var CaptchaPreview   = require('UI/Components/Captcha/CaptchaPreview');
	var Clan             = require('UI/Components/Clan/Clan');
	var PluginManager    = require('Plugins/PluginManager');
	var SignboardManager = require('Renderer/SignboardManager');
	var PvPTimer         = require('UI/Components/PvPTimer/PvPTimer');
	var PvPCount         = require('UI/Components/PvPCount/PvPCount');
	var PACKETVER        = require('Network/PacketVerManager');
	var ShortCut         = require('UI/Components/ShortCut/ShortCut');  
	var UIVersionManager      = require('UI/UIVersionManager');
	// Version Dependent UIs
	var BasicInfo = require('UI/Components/BasicInfo/BasicInfo');
	var MiniMap   = require('UI/Components/MiniMap/MiniMap');
	var SkillList = require('UI/Components/SkillList/SkillList');
	var Quest     = require('UI/Components/Quest/Quest');
	var PlayerViewEquip     = require('UI/Components/PlayerViewEquip/PlayerViewEquip');
	var JoystickUI = require('UI/Components/JoystickUI/JoystickUI');

	/**
	 * @var {string mapname}
	 */
	var _mapName = '';


	/**
	 * @var {boolean} is initialized
	 */
	var _isInitialised = false;


	/**
	 * @namespace MapEngine
	 */
	var MapEngine = {};

	var snCounter = 0;
	var chatLines = 0;


	/**
	 * @var {boolean} do we need to update UI versions?
	 */
	MapEngine.needsUIVerUpdate = false;


	/**
	 * Connect to Map Server
	 *
	 * @param {number} IP
	 * @param {number} port
	 * @param {string} mapName
	 */
	MapEngine.init = function init( ip, port, mapName )
	{
		_mapName = mapName;

		// Connect to char server
		var forceAddress = Configs.get('forceUseAddress');
		var server_info = Configs.getServer();
		var current_ip = forceAddress ? server_info.address : Network.utils.longToIP( ip );
		Network.connect( current_ip, port, function onconnect( success ) {

			// Force reloading map
			MapRenderer.currentMap = '';

			// Fail to connect...
			if (!success) {
				UIManager.showErrorBox( DB.getMessage(1) );
				return;
			}

			// Success, try to login.
			var pkt;
			if(PACKETVER.value >= 20180307) {
				pkt        = new PACKET.CZ.ENTER2();
			} else {
				pkt        = new PACKET.CZ.ENTER();
			}
			pkt.AID        = Session.AID;
			pkt.GID        = Session.GID;
			pkt.AuthCode   = Session.AuthCode;
			pkt.clientTime = Date.now();
			pkt.Sex        = Session.Sex;
			Network.sendPacket(pkt);

			// Server send back AID
			Network.read(function(fp){
				// if PACKETVER < 20070521, client send GID...
				if (fp.length === 4) {
					Session.Character.GID = fp.readLong();
				}
			});

			var hbt = new PACKET.CZ.HBT();
			var is_sec_hbt = Configs.get('sec_HBT', null);

			// Ping
			var ping, SP;
			SP = Session.ping;

			if(PACKETVER.value >= 20180307) {
				ping = new PACKET.CZ.REQUEST_TIME2();
			} else {
				ping = new PACKET.CZ.REQUEST_TIME();
			}
			var startTick = Date.now();
			Network.setPing(function(){
				if(is_sec_hbt) { Network.sendPacket(hbt); }

				ping.clientTime = Date.now() - startTick;
				
				if(!SP.returned && SP.pingTime)	{ console.warn('[Network] The server did not answer the previous PING!'); }
				SP.pingTime = ping.clientTime;
				SP.returned = false;

				Network.sendPacket(ping);
			});

			Session.Playing = true;
		}, true);


		// Select UI version when needed
		if(MapEngine.needsUIVerUpdate || !_isInitialised){
			if(PACKETVER.value < 20200520) {
				BasicInfo.selectUIVersion();
			}
			MiniMap.selectUIVersion();
			SkillList.selectUIVersion();
			Quest.selectUIVersion();
			Equipment.selectUIVersion();
			PlayerViewEquip.selectUIVersion();
			WinStats.selectUIVersion();
			Inventory.selectUIVersion();
			Storage.selectUIVersion();
		}

		// Do not hook multiple time
		if (!_isInitialised) {
			_isInitialised = true;

			MapControl.init();
			MapControl.onRequestWalk     = onRequestWalk;
			MapControl.onRequestStopWalk = onRequestStopWalk;
			MapControl.onRequestDropItem = onDropItem;

			// Hook packets
			Network.hookPacket( PACKET.ZC.AID,                 onReceiveAccountID );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER,        onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER2,       onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER3,       onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.NPCACK_MAPMOVE,      onMapChange );
			Network.hookPacket( PACKET.ZC.NPCACK_SERVERMOVE,   onServerChange );
			Network.hookPacket( PACKET.ZC.ACCEPT_QUIT,         onExitSuccess );
			Network.hookPacket( PACKET.ZC.REFUSE_QUIT,         onExitFail );
			Network.hookPacket( PACKET.ZC.RESTART_ACK,         onRestartAnswer );
			Network.hookPacket( PACKET.ZC.ACK_REQ_DISCONNECT,  onDisconnectAnswer );
			Network.hookPacket( PACKET.ZC.NOTIFY_TIME,         onPong );
			Network.hookPacket( PACKET.ZC.PING_LIVE,           onPingLive );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY,       onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY2,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY3,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY4,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG,              onConfig );

			// Extend controller
			require('./MapEngine/Main').call();
			require('./MapEngine/MapState').call();
			require('./MapEngine/NPC').call();
			require('./MapEngine/Entity').call();
			require('./MapEngine/Item').call();
			require('./MapEngine/Mail').call();
			require('./MapEngine/PrivateMessage').call();
			require('./MapEngine/Storage').call();
			require('./MapEngine/Group').init();
			require('./MapEngine/Guild').init();
			require('./MapEngine/Skill').call();
			require('./MapEngine/ChatRoom').call();
			require('./MapEngine/Pet').call();
			require('./MapEngine/Homun').call();
			require('./MapEngine/Mercenary').call();
			require('./MapEngine/Store').call();
			require('./MapEngine/Trade').call();
			require('./MapEngine/Friends').init();
			require('./MapEngine/UIOpen').call();
			require('./MapEngine/Quest').call();
			require('./MapEngine/Rodex').call();
			require('./MapEngine/Roulette').call();
			require('./MapEngine/PCGoldTimer').call();
			require('./MapEngine/Captcha').call();
			require('./MapEngine/Clan').call();
			if(Configs.get('enableCashShop')){
				require('./MapEngine/CashShop').call();
			}

			if(Configs.get('enableBank')) {
				require('./MapEngine/Bank').init();
			}

			// Prepare UI
			Escape.prepare();
			PvPTimer.prepare();
			PvPCount.prepare();
			Inventory.getUI().prepare();
			CartItems.prepare();
			Vending.prepare();
			ChangeCart.prepare();
			Equipment.getUI().prepare();
			ShortCuts.prepare();
			ShortCut.prepare();
			ChatRoomCreate.prepare();
			Emoticons.prepare();
			FPS.prepare();
			PartyFriends.prepare();
			StatusIcons.prepare();
			ChatBox.prepare();
			ChatBoxSettings.prepare();
			Guild.prepare();
			WorldMap.prepare();
			SkillListMH.homunculus.prepare();
			SkillListMH.mercenary.prepare();
			Rodex.prepare();
			RodexIcon.prepare();
			Roulette.prepare();
			PCGoldTimer.prepare();
			Navigation.prepare();
			CaptchaUpload.prepare();
			CaptchaSelector.prepare();
			CaptchaAnswer.prepare();
			CaptchaPreview.prepare();
			Clan.prepare();

			if(Configs.get('enableMapName')){
				MapName.prepare();
			}

			if(Configs.get('enableCashShop')){
				CashShop.prepare();
			}

			if(Configs.get('enableBank')) {
				Bank.prepare();
			}

			if(PACKETVER.value >= 20141016) {
				VendingReport.prepare();
			}

			if(PACKETVER.value >= 20160601) {
				LaphineSys.prepare();
			}

			if(PACKETVER.value >= 20170726) {
				LaphineUpg.prepare();
			}

			if(Configs.get('enableRefineUI') && PACKETVER.value >= 20161012) {
				Refine.prepare();
			}

			if (PACKETVER.value >= 20170208) {
				SwitchEquip.prepare();
				SwitchEquip.onAddSwitchEquip	= onAddSwitchEquip;
				SwitchEquip.onRemoveSwitchEquip	= onRemoveSwitchEquip;
			}

			if(Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				CheckAttendance.prepare();
			}

			if (PACKETVER.value >= 20200916) {
				ItemReform.prepare();
			}

			if (PACKETVER.value >= 20220330) {
				Reputation.prepare();
			}

			// Bind UI
			PetInformations.onConfigUpdate          = onConfigUpdate;
			HomunInformations.onConfigUpdate        = onConfigUpdate;
			Escape.onExitRequest            = onExitRequest;
			Escape.onCharSelectionRequest   = onRestartRequest;
			Escape.onReturnSavePointRequest = onReturnSavePointRequest;
			Escape.onResurectionRequest     = onResurectionRequest;
			ChatBox.onRequestTalk           = onRequestTalk;

		}

		// Init selected UIs when needed
		if(MapEngine.needsUIVerUpdate || !_isInitialised){
			// Prepare UIs
			MiniMap.getUI().prepare();
			SkillList.getUI().prepare();
			if(PACKETVER.value < 20200520) {
				BasicInfo.getUI().prepare();
			}
			Equipment.getUI().prepare();
			Quest.getUI().prepare();
			WinStats.getUI().prepare();

			// Bind UIs
			WinStats.getUI().onRequestUpdate        = onRequestStatUpdate;
			Equipment.getUI().onUnEquip             = onUnEquip;
			Equipment.getUI().onConfigUpdate        = onConfigUpdate;
			Equipment.getUI().onEquipItem           = onEquipItem;
			Equipment.getUI().onRemoveOption        = onRemoveOption;
			Inventory.getUI().onUseItem             = onUseItem;
			Inventory.getUI().onEquipItem           = onEquipItem;

			// Avoid zone server change init
			MapEngine.needsUIVerUpdate = false;
		}
	};


	/**
	 * Pong from server
	 * TODO: check the time ?
	 */
	function onPong( pkt )
	{
		var SP = Session.ping;
		
		SP.returned = true;
		SP.pongTime = 0;
		SP.value = SP.pongTime - SP.pingTime;
		
		Session.serverTick = pkt.time + (SP.value/2); // Adjust with half ping
	}


	/**
	 * Ping from server?
	 */
	function onPingLive( pkt )
	{
		var pong_pkt = new PACKET.CZ.PING_LIVE();
		Network.sendPacket(pong_pkt);
	}

	/**
	 * Receive user config from server
	 *
	 * @param {object} pkt - PACKET_ZC_CONFIG
	 */
	function onConfig( pkt )
	{
		switch(pkt.Config) {
			case 0:
				Equipment.getUI().setEquipConfig( pkt.Value );
				ChatBox.addText(
					DB.getMessage(1358 + (pkt.Value ? 1 : 0) ),
					ChatBox.TYPE.INFO,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 1:
				Session.Entity.call_flag = pkt.Value;
				ChatBox.addText(
					DB.getMessage(2978 + (pkt.Value ? 0 : 1) ),
					ChatBox.TYPE.INFO,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 2:
				PetInformations.setFeedConfig( pkt.Value );
				ChatBox.addText(
					DB.getMessage(2579 + (pkt.Value ? 0 : 1) ),
					ChatBox.TYPE.INFO,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 3:
				HomunInformations.setFeedConfig( pkt.Value );
				ChatBox.addText(
					DB.getMessage(3282 + (pkt.Value ? 0 : 1) ),
					ChatBox.TYPE.INFO,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 5:
				Equipment.getUI().setCostumeConfig( pkt.Value );
				break;
			default:
				console.error('[PACKET_ZC_CONFIG] Unknown Config Type %d (value:%d)', pkt.Config, pkt.Value);
		}
	}

	/**
	 * Show some system configs
	 *
	 * @param {object} pkt - PACKET_ZC_CONFIG_NOTIFY
	 */
	function onConfigNotify( pkt )
	{
		if (typeof pkt.show_eq_flag !== 'undefined') {
			Equipment.getUI().setEquipConfig( pkt.show_eq_flag );
			ChatBox.addText(
				DB.getMessage(1358 + (pkt.show_eq_flag ? 1 : 0) ),
				ChatBox.TYPE.INFO,
				ChatBox.FILTER.PUBLIC_LOG
			);
		}
		if (typeof pkt.pet_autofeeding_flag !== 'undefined') {
			PetInformations.setFeedConfig( pkt.pet_autofeeding_flag );
			ChatBox.addText(
				DB.getMessage(2579 + (pkt.pet_autofeeding_flag ? 0 : 1) ),
				ChatBox.TYPE.INFO,
				ChatBox.FILTER.PUBLIC_LOG
			);
		}
		if (typeof pkt.call_flag !== 'undefined') {
			Session.Entity.call_flag = pkt.call_flag;
			ChatBox.addText(
				DB.getMessage(2978 + (pkt.call_flag ? 0 : 1) ),
				ChatBox.TYPE.INFO,
				ChatBox.FILTER.PUBLIC_LOG
			);
		}
		if (typeof pkt.homunculus_autofeeding_flag !== 'undefined') {
			HomunInformations.setFeedConfig( pkt.homunculus_autofeeding_flag );
			ChatBox.addText(
				DB.getMessage(3282 + (pkt.homunculus_autofeeding_flag ? 0 : 1) ),
				ChatBox.TYPE.INFO,
				ChatBox.FILTER.PUBLIC_LOG
			);
		}
	}


	/**
	 * Server update our account id
	 *
	 * @param {object} pkt - PACKET.ZC.AID
	 */
	function onReceiveAccountID( pkt )
	{
		Session.Character.GID = pkt.AID;
	}


	/**
	 * Map accept us to enter the map
	 *
	 * @param {object} pkt - PACKET.ZC.ACCEPT_ENTER
	 */
	function onConnectionAccepted( pkt )
	{
		Session.Entity = new Entity( Session.Character );
		Session.Entity.onWalkEnd = onWalkEnd;

		if ('sex' in pkt && pkt.sex < 2) {
			Session.Entity.sex = pkt.sex;
		}

		// Reset
		Session.petId         =     0;
		Session.hasParty      = false;
		Session.isPartyLeader = false;
		Session.hasGuild      = false;
		Session.guildRight    =     0;

		Session.homunId       =     0;

		Session.Entity.clevel = Session.Character.level;

		Session.mapState =  {
			property        : 0,
			type            : 0,
			flag            : 0,
			isPVPZone       : false,
			isAgitZone      : false,
			isPVP           : false,
			isGVG           : false,
			isSiege         : false,
			isNoLockOn      : false,
			showPVPCounter  : false,
			showBFCounter   : false,
			isBattleField   : false,
		};

		if(PACKETVER.value >= 20200520) {
			BasicInfo.selectUIVersionWithJob(DB.getJobClass(Session.Character.job));
			BasicInfo.getUI().prepare();
		}

		BasicInfo.getUI().update('blvl', Session.Character.level );
		BasicInfo.getUI().update('jlvl', Session.Character.joblevel );
		BasicInfo.getUI().update('zeny', Session.Character.money );
		BasicInfo.getUI().update('name', Session.Character.name );
		BasicInfo.getUI().update('job',  Session.Character.job );

		// Fix http://forum.robrowser.com/?topic=32177.0
		onMapChange({
			xPos:    pkt.PosDir[0],
			yPos:    pkt.PosDir[1],
			mapName: _mapName
		});
	}


	/**
	 * Changing map, loading new map
	 *
	 * @param {object} pkt - PACKET.ZC.NPCACK_MAPMOVE
	 * @param {bool} force reload map renderer teleporting to same map
	 */
	function onMapChange( pkt , force = false )
	{
		jQuery(window).off('keydown.map');

		MapRenderer.onLoad = function(){

			Session.Entity.set({
				PosDir: [ pkt.xPos, pkt.yPos, 0 ],
				GID: Session.Character.GID
			});
			EntityManager.add( Session.Entity );
			if(Session.Entity.effectState & StatusConst.EffectState.FALCON) {
				if(!Session.Entity.falcon)
					Session.Entity.falcon = new Entity();
				
				Session.Entity.falcon.set({
					objecttype: Session.Entity.falcon.constructor.TYPE_FALCON,
					GID: Session.Entity.GID + '_FALCON',
					PosDir: [Session.Entity.position[0], Session.Entity.position[1], 0],
					job: Session.Entity.job + '_FALCON',
					speed: 200,
					name: "",
					hp: -1,
					maxhp: -1,
					hideShadow: true,
				});
				EntityManager.add(Session.Entity.falcon);
			} else if(Session.Entity.effectState & StatusConst.EffectState.WUG) {
				if(!Session.Entity.wug)
					Session.Entity.wug = new Entity();

				Session.Entity.wug.set({
					objecttype: Session.Entity.wug.constructor.TYPE_WUG,
					GID: Session.Entity.GID + '_WUG',
					PosDir: [Session.Entity.position[0], Session.Entity.position[1], 0],
					job: 'WUG',
					speed: Session.Entity.walk.speed,
					name: "",
					hp: -1,
					maxhp: -1,
				});
				EntityManager.add(Session.Entity.wug);
			}
			// free and load aura so it loads in new map
			Session.Entity.aura.free();
			Session.Entity.aura.load(EffectManager);

			// Spawn all signboards for the current map  
			const mapName = MapRenderer.currentMap.replace('.gat', '').toLowerCase();  
			const signboards = DB.getAllSignboardsForMap(mapName);  
			
			if (signboards) {  
				for (let x in signboards) {  
					for (let y in signboards[x]) {  
						const signboardData = signboards[x][y];  
						SignboardManager.add(parseInt(x), parseInt(y), signboardData);  
					}  
				}  
			}

			// Initialize camera
			Camera.setTarget( Session.Entity );
			Camera.init();

			// Add Game UI
			MiniMap.getUI().append();
			MiniMap.getUI().setMap( MapRenderer.currentMap );
			if(Configs.get('enableMapName')){
				MapName.setMap( MapRenderer.currentMap );
				MapName.append();
			}
			ChatBox.append();
			ChatBoxSettings.append();
			BasicInfo.getUI().append();
			Escape.append();
			Inventory.getUI().append();
			CartItems.append();
			Vending.append();
			ChangeCart.append();
			Equipment.getUI().append();
			ShortCuts.append();
			StatusIcons.append();
			ShortCut.append();
			ChatRoomCreate.append();
			Emoticons.append();
			SkillList.getUI().append();
			FPS.append();
			PartyFriends.append();
			Guild.append();
			WorldMap.append();
			SkillListMH.homunculus.append();
			SkillListMH.mercenary.append();
			MobileUI.append();
			JoystickUI.append();
			Navigation.append();

			if (PACKETVER.value >= 20090617 && PACKETVER.value < 20140521) {
				WinStats.getUI().append(Equipment.getUI().ui.find('.status_component'));
			} else {
				WinStats.getUI().append();
			}

			Quest.getUI().append();

			if(Configs.get('enableCashShop')){
				CashShop.append();
			}

			if(Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				CheckAttendance.append();
			}

			// Reload plugins
			PluginManager.init();

			// Map loaded
			Network.sendPacket(
				new PACKET.CZ.NOTIFY_ACTORINIT()
			);

			// Rates Info
			if (Session.ratesInfo) {
				Announce.append();
        		Announce.set(Session.ratesInfo, '#FFFF00', true);
			}
		};

		MapRenderer.setMap( pkt.mapName, force );
	}


	/**
	 * Change zone server
	 *
	 * @param {object} pkt - PACKET.ZC.NPCACK_SERVERMOVE
	 */
	function onServerChange( pkt )
	{
		jQuery(window).off('keydown.map');
		MapEngine.init( pkt.addr.ip, pkt.addr.port, pkt.mapName );
	}


	/**
	 * Ask the server to disconnect
	 */
	function onExitRequest()
	{
		var pkt = new PACKET.CZ.REQUEST_QUIT();
		Network.sendPacket(pkt);

		// Wait a second, if no answer from the server, then close it.
		Events.setTimeout(function(){
			onExitSuccess();
		}, 1000);
	}


	/**
	 * Server don't want us to disconnect yet
	 *
	 * @param {object} pkt - PACKET.ZC.REFUSE_QUIT
	 */
	function onExitFail( pkt )
	{
		ChatBox.addText( DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
	}


	/**
	 * Server accept to disconnect us
	 *
	 * @param {object} pkt - PACKET.ZC.REFUSE_QUIT
	 */
	function onExitSuccess()
	{
		if (PACKETVER.value >= 20170315 && Session.WebToken)
			ShortCut.saveToServer();  

		UIManager.removeComponents();
		Network.close();
		Renderer.stop();
		MapRenderer.free();
		SoundManager.stop();
		BGM.stop();
		if (PACKETVER.value < 20181114){
			Background.remove();
			Background.setImage('bgi_temp.bmp', function(){
				require('Engine/GameEngine').reload();
			});
		}
		else
			require('Engine/GameEngine').reload();

	}


	/**
	 * Try to return to char-server
	 */
	function onRestartRequest()
	{
		var pkt = new PACKET.CZ.RESTART();
		pkt.type = 1;
		Network.sendPacket(pkt);
	}


	/**
	 * Go back to save point request
	 */
	function onReturnSavePointRequest()
	{
		var pkt = new PACKET.CZ.RESTART();
		pkt.type = 0;
		Network.sendPacket(pkt);
	}


	/**
	 * Resurection feature
	 */
	function onResurectionRequest()
	{
		var pkt = new PACKET.CZ.STANDING_RESURRECTION();
		Network.sendPacket(pkt);
	}


	/**
	 * Does the server want you to return to char-server ?
	 *
	 * @param {object} pkt - PACKET.ZC.RESTART_ACK
	 */
	function onRestartAnswer( pkt )
	{
		if (!pkt.type) {
			// Have to wait 10sec
			ChatBox.addText( DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
		}
		else {
			require('Engine/MapEngine/Guild').guild_id = 0;
			BasicInfo.getUI().remove();
			PlayerViewEquip.getUI().remove();
			StatusIcons.clean();
			ChatBox.clean();
			ShortCut.clean();
			Quest.getUI().clean();
			PartyFriends.clean();
			MapRenderer.free();
			Renderer.stop();
			onRestart();
		}
	}


	/**
	 * Response from server to disconnect
	 * @param pkt - {object}
	 */
	function onDisconnectAnswer( pkt )
	{
		switch (pkt.result) {
			// Disconnect
			case 0:
				BasicInfo.getUI().remove();
				PlayerViewEquip.getUI().remove();
				StatusIcons.clean();
				ChatBox.clean();
				ShortCut.clean();
				Quest.getUI().clean();
				PartyFriends.clean();
				Renderer.stop();
				onExitSuccess();
				break;

			case 1:
				// Have to wait 10 sec
				ChatBox.addText( DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
				break;

			default:
		}
	}


	/**
	 * ChatBox talk
	 *
	 * @param {string} user
	 * @param {string} text
	 * @param {number} target
	 */
	function onRequestTalk( user, text, target )
	{
		var pkt;
		var flag_party = text[0] === '%' || KEYS.CTRL;
		var flag_guild = text[0] === '$' || (KEYS.ALT && !(KEYS[0] || KEYS[1] || KEYS[2] || KEYS[3] || KEYS[4] || KEYS[5] || KEYS[6] || KEYS[7] || KEYS[8] || KEYS[9]));

		text = text.replace(/^(\$|\%)/, '');

		// Private messages
		if (user.length) {
			pkt          = new PACKET.CZ.WHISPER();
			pkt.receiver = user;
			pkt.msg      = text;
			Network.sendPacket(pkt);
			return;
		}

		// Set off/on flags
		if (flag_party) {
			target = (target & ~ChatBox.TYPE.PARTY) | (~target & ChatBox.TYPE.PARTY);
		}

		if (flag_guild) {
			target = (target & ~ChatBox.TYPE.GUILD) | (~target & ChatBox.TYPE.GUILD);
		}

		// Get packet
		if (target & ChatBox.TYPE.PARTY) {
			pkt = new PACKET.CZ.REQUEST_CHAT_PARTY();
		}
		else if (target & ChatBox.TYPE.GUILD) {
			pkt = new PACKET.CZ.GUILD_CHAT();
		} else if (target & ChatBox.TYPE.CLAN) {
			pkt = new PACKET.CZ.CLAN_CHAT();
		} else {
			pkt = new PACKET.CZ.REQUEST_CHAT();
			chatLines++;
		}

		// send packet
		pkt.msg = Session.Entity.display.name + ' : ' + text;
		Network.sendPacket(pkt);

		//Super Novice Chant
		if(chatLines > 7 && ([ 23, 4045, 4128, 4172, 4190, 4191, 4192, 4193]).includes(Session.Entity._job)){
			if(Math.floor((BasicInfo.getUI().base_exp / BasicInfo.getUI().base_exp_next) * 1000.0) % 100 == 0){
				if(text == DB.getMessage(790)){
					snCounter = 1;
				} else if(snCounter == 1 && text == (DB.getMessage(791) + ' ' + Session.Entity.display.name + ' ' +DB.getMessage(792))){
					snCounter = 2;
				} else if(snCounter == 2 && text == DB.getMessage(793)){
					snCounter = 3;
				} else if (snCounter == 3){
					snCounter = 0;
					pkt = new PACKET.CZ.CHOPOKGI();
					Network.sendPacket(pkt);
				}else {
					snCounter = 0;
				}
			}
		}
	}


	/**
	 * Remove cart/peco/falcon
	 */
	function onRemoveOption()
	{
		var pkt = new PACKET.CZ.REQ_CARTOFF();
		Network.sendPacket(pkt);
	}


	/**
	 * @var {number} walk timer
	 */
	var _walkTimer = null;


	/**
	 * @var {number} Last delay to walk
	 */
	var _walkLastTick = 0;


	/**
	 * Ask to move
	 */
	function onRequestWalk()
	{
		Events.clearTimeout(_walkTimer);

		// If siting, update direction
		if (Session.Entity.action === Session.Entity.ACTION.SIT || KEYS.SHIFT) {
			Session.Entity.lookTo( Mouse.world.x, Mouse.world.y );

			var pkt;
			if(PACKETVER.value >= 20180307) {
				pkt = new PACKET.CZ.CHANGE_DIRECTION2();
			} else {
				pkt = new PACKET.CZ.CHANGE_DIRECTION();
			}
			pkt.headDir = Session.Entity.headDir;
			pkt.dir     = Session.Entity.direction;
			Network.sendPacket(pkt);
			return;
		}

		walkIntervalProcess();
	}


	/**
	 * Stop moving
	 */
	function onRequestStopWalk()
	{
		Events.clearTimeout(_walkTimer);
	}


	/**
	 * Moving function
	 */
	function walkIntervalProcess()
	{
		// setTimeout isn't accurate, so reduce the value
		// to avoid possible errors.
		if (_walkLastTick + 200 > Renderer.tick) {
			return;
		}

		var isWalkable   = (Mouse.world.x > -1 && Mouse.world.y > -1);
		var isCurrentPos = (Math.round(Session.Entity.position[0]) === Mouse.world.x &&
		                    Math.round(Session.Entity.position[1]) === Mouse.world.y);

		if (isWalkable && !isCurrentPos) {
			var pkt;
			if(PACKETVER.value >= 20180307) {
				pkt         = new PACKET.CZ.REQUEST_MOVE2();
			} else {
				pkt         = new PACKET.CZ.REQUEST_MOVE();
			}
			if (!checkFreeCell(Mouse.world.x, Mouse.world.y, 9, pkt.dest)) {
				pkt.dest[0] = Mouse.world.x;
				pkt.dest[1] = Mouse.world.y;
			}

			Network.sendPacket(pkt);
		}

		Events.clearTimeout(_walkTimer);
		_walkTimer    =  Events.setTimeout( walkIntervalProcess, 500);
		_walkLastTick = +Renderer.tick;
	}


	/**
	 * Search free cells around a position
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} range
	 * @param {array} out
	 */
	function checkFreeCell(x, y, range, out)
	{
		var _x, _y, r;
		var d_x = Session.Entity.position[0] < x ? -1 : 1;
		var d_y = Session.Entity.position[1] < y ? -1 : 1;

		// Search possible positions
		for (r = 0; r <= range; ++r) {
			for (_x = -r; _x <= r; ++_x) {
				for (_y = -r; _y <= r; ++_y) {
					if (isFreeCell(x + _x * d_x, y + _y * d_y)) {
						out[0] = x + _x * d_x;
						out[1] = y + _y * d_y;
						return true;
					}
				}
			}
		}

		return false;
	}


	/**
	 * Does a cell is free (walkable, and no entity on)
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {returns} is free
	 */
	function isFreeCell(x, y)
	{
		if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
			return false;
		}

		var free = true;

		EntityManager.forEach(function(entity){
			if (entity.objecttype != entity.constructor.TYPE_EFFECT &&
				entity.objecttype != entity.constructor.TYPE_UNIT &&
				entity.objecttype != entity.constructor.TYPE_TRAP &&
				Math.round(entity.position[0]) === x &&
				Math.round(entity.position[1]) === y) {
				free = false;
				return false;
			}

			return true;
		});

		return free;
	}


	/**
	 * If the character moved to attack, once it finished to move ask to attack
	 */
	function onWalkEnd()
	{
		// No action to do ?
		if (Session.moveAction) {
			// Not sure why, but there is a synchronization error with the
			// server when moving to attack (wrong position).
			// So wait 50ms to be sure we are at the correct position before
			// performing an action
			Events.setTimeout(function(){
				if (Session.moveAction) {
					Network.sendPacket(Session.moveAction);
					Session.moveAction = null;
				}
			}, 50);
		}
	}


	/**
	 * Ask server to update status
	 *
	 * @param {number} id
	 * @param {number} amount
	 */
	function onRequestStatUpdate(id, amount)
	{
		var pkt          = new PACKET.CZ.STATUS_CHANGE();
		pkt.statusID     = id;
		pkt.changeAmount = amount;

		Network.sendPacket(pkt);
	}


	/**
	 * Drop item to the floor
	 *
	 * @param {number} index in inventory
	 * @param {number} count to drop
	 */
	function onDropItem( index, count )
	{
		if (count) {
			if(PACKETVER.value >= 20180307) {
				var pkt   = new PACKET.CZ.ITEM_THROW2();
			} else {
				var pkt   = new PACKET.CZ.ITEM_THROW();
			}
			pkt.Index = index;
			pkt.count = count;
			Network.sendPacket(pkt);
		}
	}


	/**
	 * Use an item
	 *
	 * @param {number} item's index
	 */
	function onUseItem( index )
	{
		// Items are not usable when Laphine Synthesis, Upgrade, ItemReform UI is open (if they are available at all)
		if ((LaphineSys.__loaded && LaphineSys.__active && LaphineSys.ui.is(':visible')) || 
			(LaphineUpg.__loaded && LaphineUpg.__active && LaphineUpg.ui.is(':visible')) || 
			(ItemReform.__loaded && ItemReform.__active && ItemReform.ui.is(':visible'))) {
			return false;
		}

		var pkt;
		if(PACKETVER.value >= 20180307) { // not sure - this date is when the shuffle packets stoped
			pkt = new PACKET.CZ.USE_ITEM2();
		} else {
			pkt = new PACKET.CZ.USE_ITEM();
		}
		pkt.index = index;
		pkt.AID   = Session.Entity.GID;
		Network.sendPacket(pkt);
	}


	/**
	 * Equip item
	 *
	 * @param {number} item's index
	 * @param {number} where to equip
	 */
	function onEquipItem( index, location )
	{
		var pkt          = new PACKET.CZ.REQ_WEAR_EQUIP();
		pkt.index        = index;
		pkt.wearLocation = location;
		Network.sendPacket(pkt);
	}


	/**
	 * Take off an equip
	 *
	 * @param {number} index to unequip
	 */
	function onUnEquip( index )
	{
		var pkt   = new PACKET.CZ.REQ_TAKEOFF_EQUIP();
		pkt.index = index;
		Network.sendPacket(pkt);
	}


	/**
	 * Add Switch Equip
	 */
	function onAddSwitchEquip( index, location )
	{
		var pkt          = new PACKET.CZ.REQ_WEAR_SWITCHEQUIP_ADD();
		pkt.index		 = index;
		pkt.wearLocation = location;
		Network.sendPacket(pkt);
	}


	/**
	 * Remove Switch Equip
	 */
	function onRemoveSwitchEquip( index )
	{
		var pkt          = new PACKET.CZ.REQ_WEAR_SWITCHEQUIP_REMOVE();
		pkt.index		 = index;
		Network.sendPacket(pkt);
	}


	/**
	 * Update config
	 *
	 * @param {number} config id (only type:0 is supported - equip)
	 * @param {number} val
	 */
	function onConfigUpdate( type, val )
	{
		var pkt    = new PACKET.CZ.CONFIG();
		pkt.Config = type;
		pkt.Value  = val;
		Network.sendPacket(pkt);
	}


	/**
	 * Go back from map-server to char-server
	 */
	function onRestart()
	{
		require('Engine/CharEngine').reload();
	}


	/**
	 * Export
	 */
	MapEngine.onMapChange = onMapChange;

	return MapEngine;
});
