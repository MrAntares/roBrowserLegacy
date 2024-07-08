/**
 * Engine/MapEngine/Skill.js
 *
 * Manage skills
 *
 * @author Vincent Thibault
 */

define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var DB                    = require('DB/DBManager');
	var SkillId               = require('DB/Skills/SkillConst');
	var SkillInfo             = require('DB/Skills/SkillInfo');
	var SkillActionTable  	  = require('DB/Skills/SkillAction');
	var EffectConst           = require('DB/Effects/EffectConst');
	var PathFinding           = require('Utils/PathFinding');
	var Entity            	  = require('Renderer/Entity/Entity');
	var Session               = require('Engine/SessionStorage');
	var Network               = require('Network/NetworkManager');
	var PACKETVER             = require('Network/PacketVerManager');
	var PACKET                = require('Network/PacketStructure');
	var EntityManager         = require('Renderer/EntityManager');
	var EffectManager         = require('Renderer/EffectManager');
	var Altitude              = require('Renderer/Map/Altitude');
	var ShortCut              = require('UI/Components/ShortCut/ShortCut');
	var ChatBox               = require('UI/Components/ChatBox/ChatBox');
	var SkillTargetSelection  = require('UI/Components/SkillTargetSelection/SkillTargetSelection');
	var Guild                 = require('UI/Components/Guild/Guild');
	var SkillListMER          = require('UI/Components/SkillListMER/SkillListMER');
	var ItemSelection         = require('UI/Components/ItemSelection/ItemSelection');
	var MakeArrowSelection    = require('UI/Components/MakeArrowSelection/MakeArrowSelection');
	var MakeItemSelection     = require('UI/Components/MakeItemSelection/MakeItemSelection');
	var RefineWeaponSelection = require('UI/Components/RefineWeaponSelection/RefineWeaponSelection');
	var Inventory             = require('UI/Components/Inventory/Inventory');
	var NpcMenu               = require('UI/Components/NpcMenu/NpcMenu');
	var Sense                 = require('UI/Components/Sense/Sense');
	var Announce              = require('UI/Components/Announce/Announce');
	var Renderer              = require('Renderer/Renderer');
	var getModule             = require;

	// Version Dependent UIs
	var SkillWindow = require('UI/Components/SkillList/SkillList');


	/**
	 * Spam an effect
	 *
	 * 0 = base level up
	 * 1 = job level up
	 * 2 = refine failure
	 * 3 = refine success
	 * 4 = game over
	 * 5 = pharmacy success
	 * 6 = pharmacy failure
	 * 7 = base level up (super novice)
	 * 8 = job level up (super novice)
	 * 9 = base level up (taekwon)
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_EFFECT
	 */
	function onSpecialEffect( pkt )
	{
		var EnumEffect = [
			EffectConst.EF_ANGEL,
			EffectConst.EF_JOBLVUP,
			EffectConst.EF_REFINEFAIL,
			EffectConst.EF_REFINEOK,
			EffectConst.NONE,   // game over
			EffectConst.EF_PHARMACY_OK,
			EffectConst.EF_PHARMACY_FAIL,
			EffectConst.EF_ANGEL2,
			EffectConst.EF_JOBLVUP2,
			EffectConst.EF_ANGEL3
		];

		if (EnumEffect[pkt.effectID] > -1) {
			var EF_Init_Par = {
				effectId: EnumEffect[pkt.effectID],
				ownerAID: pkt.AID
			};

			EffectManager.spam( EF_Init_Par );
		}
	}


	/**
	 * Spam an effect
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_EFFECT2
	 */
	function onEffect( pkt )
	{
		var EF_Init_Par = {
			effectId: pkt.effectID,
			ownerAID: pkt.AID
		};

		EffectManager.spam( EF_Init_Par );
	}


	/**
	 * Display an effect to the scene
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_GROUNDSKILL
	 */
	function onSkillToGround( pkt )
	{
		var position = new Array(3);
		position[0]  = pkt.xPos;
		position[1]  = pkt.yPos;
		position[2]  = Altitude.getCellHeight(pkt.xPos, pkt.yPos);

		EffectManager.spamSkill(pkt.SKID, pkt.AID, position, null, pkt.AID);
	}



	/**
	 * Failed to cast a skill
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_TOUSESKILL
	 */
	function onSkillResult( pkt )
	{

		// Yeah success !
		if (pkt.result) {
			return;
		}

		var error = 0;
		var entity = Session.Entity;
		var srcEntity = EntityManager.get(entity.GID);
		if (pkt.NUM) {
			switch (pkt.SKID) {

				default:
					error = 204;
					break;

				case SkillId.NV_BASIC:
					error = pkt.NUM < 7 ? 159 + pkt.NUM : pkt.NUM == 7 ? 383 : 0;
					break;

				case SkillId.AL_WARP:
					error = 214;
					break;

				case SkillId.TF_STEAL:
					error = 205;
					break;

				case SkillId.TF_POISON:
					error = 207;
					break;

			}
		}

		if(pkt.SKID == SkillId.CG_TAROTCARD){
			error = 204;
		}

		else {
			switch (pkt.cause) {
				case 1:  error = 202; break;
				case 2:  error = 203; break;
				case 3:  error = 808; break;
				case 4:  error = 219; break;
				case 5:  error = 233; break;
				case 6:  error = 239; break;
				case 7:  error = 246; break;
				case 8:  error = 247; break;
				case 9:  error = 580; break;
				case 10: error = 285; break;
				case 13: error = 1398; break;
				case 83: error = 661; break;
			}
		}

		if (error) {
			ChatBox.addText( DB.getMessage(error), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL );
			srcEntity.setAction(SkillActionTable['DEFAULT']( srcEntity, Renderer.tick ));
		}
	}


	/**
	 * List of skills
	 *
	 * @param {object} pkt - PACKET_ZC_SKILLINFO_LIST
	 */
	function onSkillList( pkt )
	{
		SkillWindow.getUI().setSkills( pkt.skillList );
	}


	/**
	 * Update a specified skill
	 *
	 * @param {object} pkt - PACKET.ZC.SKILLINFO_UPDATE
	 */
	function onSkillUpdate( pkt )
	{
		SkillWindow.getUI().updateSkill( pkt );
	}


	/**
	 * List of skills/items in hotkey
	 *
	 * @param {object} pkt - PACKET_ZC_SHORTCUT_KEY_LIST_V2
	 */
	function onShortCutList( pkt )
	{
		if(pkt.tab && pkt.tab > 0) return; // not available yet
		ShortCut.setList( pkt.ShortCutKey );
	}


	/**
	 * Add new skill to the list
	 *
	 * @param {object} pkt - PACKET.ZC.ADD_SKILL
	 */
	function onSkillAdded( pkt)
	{
		SkillWindow.getUI().addSkill( pkt.data );
	}


	/**
	 * Server notify use that we need to cast a skill
	 *
	 * @param {object} pkt - PACKET.ZC.AUTORUN_SKILL
	 */
	function onAutoCastSkill( pkt )
	{
		SkillWindow.getUI().useSkill(pkt.data);
	}


	/**
	 * Get a list of item to identify
	 *
	 * @param {object} pkt - PACKET.ZC.ITEMIDENTIFY_LIST
	 */
	function onIdentifyList( pkt )
	{
		if (!pkt.ITIDList.length) {
			return;
		}

		ItemSelection.append();
		ItemSelection.setList(pkt.ITIDList);
		ItemSelection.setTitle(DB.getMessage(521));
		ItemSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.REQ_ITEMIDENTIFY();
				pkt.index = index;
				Network.sendPacket(pkt);
			}
		};
	}


	/**
	 * Get the result once item identified
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_ITEMIDENTIFY
	 */
	function onIdentifyResult( pkt )
	{
		// Self closed, no message.
		if (pkt.index < 0) {
			return;
		}

		switch (pkt.result) {
			case 0: // success
				ChatBox.addText( DB.getMessage(491), ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM);

				// Remove old item
				var item = Inventory.getUI().removeItem(pkt.index, 1);

				// Add new item updated
				if (item) {
					item.IsIdentified = true;
					Inventory.getUI().addItem(item);
				}
				break;

			case 1: // Fail
				ChatBox.addText( DB.getMessage(492), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM);
				break;
		}
	}


	/**
	 * Get a list of skills to use for auto-spell
	 *
	 * @param {object} pkt - PACKET.ZC.AUTOSPELLLIST
	 */
	function onAutoSpellList( pkt )
	{
		if (!pkt.SKID.length) {
			return;
		}

		ItemSelection.append();
		ItemSelection.setList(pkt.SKID, true);
		ItemSelection.setTitle(DB.getMessage(697));
		ItemSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.SELECTAUTOSPELL();
				pkt.SKID  = index;
				Network.sendPacket(pkt);
			}
		};
	}


	/**
	 * Get a list of skills to use for auto-spell
	 *
	 * @param {object} pkt - PACKET.ZC.SKILL_SELECT_REQUEST
	 */
	function onSelectSkillList( pkt )
	{
		if (!pkt.SKID.length) {
			return;
		}

		ItemSelection.append();
		ItemSelection.setList(pkt.SKID, true);
		ItemSelection.setTitle(DB.getMessage(697));
		ItemSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.SKILL_SELECT_RESPONSE();
				pkt.SKID  = index;
				pkt.why  = pkt.why;
				Network.sendPacket(pkt);
			}
		};
	}


	/**
	 * Manage menu to select zone to warp on
	 *
	 * @param {object} pkt - PACKET.ZC.WARPLIST
	 */
	function onTeleportList( pkt )
	{
		// Once selected
		NpcMenu.onSelectMenu = function(skillid, index) {
			NpcMenu.remove();

			var _pkt     = new PACKET.CZ.SELECT_WARPPOINT();
			_pkt.SKID    = skillid;
			_pkt.mapName = pkt.mapName[index-1] || 'cancel';
			Network.sendPacket(_pkt);
		};

		NpcMenu.onAppend = function() {
			var i, count;
			var mapNames = [];

			for (i = 0, count = pkt.mapName.length; i < count; ++i) {
				mapNames[i] = DB.getMapName(pkt.mapName[i], pkt.mapName[i]);
			}

			NpcMenu.setMenu(mapNames.join(':') + ':Cancel', pkt.SKID);
			NpcMenu.ui.find('.title').text(DB.getMessage(213));
		};

		NpcMenu.append();
	}


	/**
	 * Get error message from teleportation skill
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_MAPINFO
	 */
	function onTeleportResult( pkt )
	{
		switch (pkt.type) {
			case 0: //Unable to Teleport in this area
				ChatBox.addText( DB.getMessage(500), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				break;

			case 1: //Saved point cannot be memorized.
				ChatBox.addText( DB.getMessage(501), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				break;
		}
	}


	/**
	 * Result of /memo command
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_REMEMBER_WARPPOINT
	 */
	function onMemoResult( pkt )
	{
		switch (pkt.errorCode) {
			case 0: // Saved location as a Memo Point for Warp skill.
				ChatBox.addText( DB.getMessage(217), ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);
				break;

			case 1: // Skill Level is not high enough.
				ChatBox.addText( DB.getMessage(214), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				break;

			case 2: // You haven't learned Warp.
				ChatBox.addText( DB.getMessage(216), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				break;
		}
	}


	/**
	 * Get a list of arrows to create
	 *
	 * @param {object} pkt - PACKET.ZC.MAKINGARROW_LIST
	 */
	function onMakingarrowList( pkt )
	{
		if (!pkt.arrowList.length) {
			return;
		}

		MakeArrowSelection.append();
		MakeArrowSelection.setList(pkt.arrowList);
		//MakeArrowSelection.setTitle(DB.getMessage(658));
		MakeArrowSelection.setTitle('LIST');
		MakeArrowSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.REQ_MAKINGARROW();
				pkt.id = index;
				Network.sendPacket(pkt);
			}
		};
	}

	/**
	 * Get a list of items to refine
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_WEAPONITEMLIST
	 */
	function onRefineList( pkt )
	{
		if (!pkt.itemList.length) {
			return;
		}

		RefineWeaponSelection.append();
		RefineWeaponSelection.setList(pkt.itemList);
		RefineWeaponSelection.setTitle(DB.getMessage(910));
		RefineWeaponSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.REQ_WEAPONREFINE();
				pkt.Index = index;
				Network.sendPacket(pkt);
			}
		};
	}

	/**
	 * Get a list of items to repair
	 *
	 * @param {object} pkt - PACKET.ZC.REPAIRITEMLIST
	 */
	function onRepairList( pkt )
	{
		if (!pkt.itemList.length) {
			return;
		}

		RefineWeaponSelection.append();
		RefineWeaponSelection.setList(pkt.itemList);
		RefineWeaponSelection.setTitle(DB.getMessage(812));
		RefineWeaponSelection.onIndexSelected = function(index) {
			if (index >= -1) {
				const item = RefineWeaponSelection.getItemByIndex(index);

				var pkt   = new PACKET.CZ.REQ_ITEMREPAIR();
				pkt.index = index;
				pkt.itemId = item.ITID;
				pkt.RefiningLevel = item.RefiningLevel;
				pkt.slots = item.slot;
				Network.sendPacket(pkt);
			}
		};
	}

	/**
	 * Send back informations from server
	 * The user want to modify the shortcut
	 *
	 * @param {number} shortcut index
	 * @param {boolean|number} isSkill
	 * @param {number} ID
	 * @param {number} count / level
	 */
	ShortCut.onChange = function onChange( index, isSkill, ID, count )
	{
		var pkt;
		if(PACKETVER.value >= 20190522) {
			pkt = new PACKET.CZ.SHORTCUT_KEY_CHANGE2();
		} else {
			pkt = new PACKET.CZ.SHORTCUT_KEY_CHANGE1();
		}
		pkt.Index               = index;
		pkt.ShortCutKey.isSkill = isSkill ? 1 : 0;
		pkt.ShortCutKey.ID      = ID;
		pkt.ShortCutKey.count   = count;

		Network.sendPacket(pkt);
	};

	function onSetSkillDelay( pkt ){
		ShortCut.setSkillDelay(pkt.SKID, pkt.DelayTM);
	};


	/**
	 * User want to level up a skill
	 *
	 * @param {number} skill id
	 */
	function onIncreaseSkill( SKID )
	{
		var pkt  = new PACKET.CZ.UPGRADE_SKILLLEVEL();
		pkt.SKID = SKID;

		Network.sendPacket(pkt);
	};
	Guild.onIncreaseSkill = SkillListMER.onIncreaseSkill = onIncreaseSkill;


	/**
	 * Cast a skill on someone
	 *
	 * @param {number} skill id
	 * @param {number} level
	 * @param {optional|number} target game id
	 */
	function onUseSkill( id, level, targetID)
	{
		var entity, skill, target, pkt, out;
		var count, range;

		var isHomun = (id > 8000 && id < 8044);

		if (isHomun){
			entity = EntityManager.get(Session.homunId);
		} else {
			entity = Session.Entity;
			//Fixme: this check is needed, but not here, because flywing and other AUTORUN_SKILL then doesn't work
			/*if(entity.isOverWeight){
				ChatBox.addText( DB.getMessage(243), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				return true;
			}*/
		}

		// Client side minimum delay
		if (entity && entity.amotionTick > Renderer.tick){ // Can't spam skills faster than amotion
			return;
		}

		target = EntityManager.get(targetID) || entity;
		skill  = SkillWindow.getUI().getSkillById(id);
		out    = [];

		if (skill) {
			range = skill.attackRange + 1;
		}
		else if (SkillInfo[id]) {
			range = SkillInfo[id].AttackRange[level-1] + 1;
		}
		else {
			range = entity.attack_range;
		}

		count = PathFinding.search(
			entity.position[0] | 0, entity.position[1] | 0,
			target.position[0] | 0, target.position[1] | 0,
			range,
			out,
			Altitude.TYPE.WALKABLE
		);

		// Can't attack to this point
		if (!count) {
			return;
		}


    	if(id === SkillId.MC_CHANGECART)
        {
			if(Session.Entity.hasCart == true)
			{
				getModule('UI/Components/ChangeCart/ChangeCart').onChangeCartSkill();
			}
       	}

		if(PACKETVER.value >= 20180307) {
			pkt               = new PACKET.CZ.USE_SKILL2();
		} else {
			pkt               = new PACKET.CZ.USE_SKILL();
		}
        pkt.SKID          = id;
        pkt.selectedLevel = level;
        pkt.targetID      = targetID || Session.Entity.GID;

		// In range
		if (count < 2 || target === entity) {
			Network.sendPacket(pkt);
			return;
		}

		// Save the packet
		Session.moveAction = pkt;

		// Move to position
		if(isHomun){
			pkt         = new PACKET.CZ.REQUEST_MOVENPC();
			pkt.GID		= Session.homunId;
		} else {
			if(PACKETVER.value >= 20180307) {
				pkt         = new PACKET.CZ.REQUEST_MOVE2();
			} else {
				pkt         = new PACKET.CZ.REQUEST_MOVE();
			}
		}
		pkt.dest[0] = out[(count-1)*2 + 0];
		pkt.dest[1] = out[(count-1)*2 + 1];
		Network.sendPacket(pkt);
	};
	Guild.onUseSkill = SkillListMER.onUseSkill = SkillTargetSelection.onUseSkillToId  = onUseSkill;


	/**
	 * Cast a skill on the ground
	 *
	 * @param {number} skill id
	 * @param {number} level
	 * @param {number} position x
	 * @param {number} position y
	 */
	SkillTargetSelection.onUseSkillToPos = function onUseSkillToPos(id, level, x, y)
	{
		var pos, entity, pkt, out, skill;
		var count, range;

		var isHomun = (id > 8000 && id < 8044);

		if (isHomun){
			entity = EntityManager.get(Session.homunId);
		} else {
			entity = Session.Entity;
			if(entity.isOverWeight){
				ChatBox.addText( DB.getMessage(243), ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
				return true;
			}
		}

		// Client side minimum delay
		if (entity && entity.amotionTick > Renderer.tick){ // Can't spam skills faster than amotion
			return;
		}

		pos    = entity.position;
		skill  = SkillWindow.getUI().getSkillById(id);
		out    = [];

		if (skill) {
			range = skill.attackRange + 1;
		}
		else if (SkillInfo[id]) {
			range = SkillInfo[id].AttackRange[level-1] + 1;
		}
		else {
			range = entity.attack_range;
		}

		count = PathFinding.search(
			pos[0] | 0, pos[1] | 0,
			x      | 0, y      | 0,
			range,
			out,
			Altitude.TYPE.WALKABLE
		);

		// Can't attack to this point
		if (!count) {
			return;
		}

		if(PACKETVER.value >= 20190904) {
			pkt               = new PACKET.CZ.USE_SKILL_TOGROUND3();
		} else if(PACKETVER.value >= 20180307) {
			pkt               = new PACKET.CZ.USE_SKILL_TOGROUND2();
		} else {
			pkt               = new PACKET.CZ.USE_SKILL_TOGROUND();
		}
		pkt.SKID          = id;
		pkt.selectedLevel = level;
		pkt.xPos          = x;
		pkt.yPos          = y;

		//This is how the client knows the magic ring size for self..
		Session.Entity.lastSKID = id;
		Session.Entity.lastSkLvl = level;

		// In range
		if (count < 2) {
			Network.sendPacket(pkt);
			return;
		}

		// Save the packet
		Session.moveAction = pkt;

		// Move to the position
		if(isHomun){
			pkt         = new PACKET.CZ.REQUEST_MOVENPC();
			pkt.GID		= Session.homunId;
		} else {
			if(PACKETVER.value >= 20180307) {
				pkt         = new PACKET.CZ.REQUEST_MOVE2();
			} else {
				pkt         = new PACKET.CZ.REQUEST_MOVE();
			}
		}
		pkt.dest[0]        = out[(count-1)*2 + 0];
		pkt.dest[1]        = out[(count-1)*2 + 1];
		Network.sendPacket(pkt);
	};

	function onSpiritSphere(pkt){
		EffectManager.remove( null, pkt.AID,[ 228, 504, 629, 833]);

		if (pkt.num > 0){
			var entity = EntityManager.get(pkt.AID);
			if(entity){
				var isMonk = (entity._job && [15, 4016, 4038, 4070, 4077, 4106].includes(entity._job) ) //Monk classes
				var isGS = (entity._job && [24, 4215, 4216, 4228, 4229].includes(entity._job) ) //Gunslinger classes
				var isRG = (entity._job && [4066, 4082, 4083, 4102, 4110].includes(entity._job) ) //Royal Guard

				var EF_Init_Par = {
					effectId: EffectConst.EF_CHOOKGI,
					ownerAID: pkt.AID,
					spiritNum: pkt.num
				};

				if(isMonk){
					EF_Init_Par.effectId = EffectConst.EF_CHOOKGI2;
				} else if (isGS){
					EF_Init_Par.effectId = EffectConst.EF_CHOOKGI3;
				} else if (isRG){
					EF_Init_Par.effectId = EffectConst.EF_CHOOKGI_N;
				}

				EffectManager.spam( EF_Init_Par );
			}
		}
	}

	function onTaekwonMission(pkt){
		var total = 100;
		var message = DB.getMessage(927);
		var percent = Math.floor((pkt.star / total) * 100);
		var color = '#F8F8FF'; //GhostWhite

		message = message.replace('%s', pkt.monsterName);
		message = message.replace('%d%', percent);

		ChatBox.addText( message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_LOG, color );
		Announce.append();
		Announce.set(message, color);
	}

	function onMessageSkill(pkt){

		var message = DB.getMessage(pkt.MSGID);
		var color = '#B8BEEB';
		var name =  SkillInfo[ pkt.SKID ].SkillName;
		message = `[${name}] ${message}`;

		ChatBox.addText( message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_LOG, color );
	}

	function onSense(pkt){
		Sense.append();
		Sense.setWindow(pkt);
	}

	function hookSkillWindow(){
		SkillWindow.getUI().onIncreaseSkill = onIncreaseSkill;
		SkillWindow.getUI().onUseSkill = onUseSkill;
	}

	/**
	 * Initialize
	 */
	return function SkillEngine()
	{
		hookSkillWindow();

		Network.hookPacket( PACKET.ZC.SKILLINFO_LIST,         onSkillList );
		Network.hookPacket( PACKET.ZC.SKILLINFO_UPDATE,       onSkillUpdate );
		Network.hookPacket( PACKET.ZC.SKILLINFO_UPDATE2,      onSkillUpdate );
		Network.hookPacket( PACKET.ZC.ADD_SKILL,              onSkillAdded );
		Network.hookPacket( PACKET.ZC.SHORTCUT_KEY_LIST,      onShortCutList );
		Network.hookPacket( PACKET.ZC.SHORTCUT_KEY_LIST_V2,   onShortCutList );
		Network.hookPacket( PACKET.ZC.SHORTCUT_KEY_LIST_V3,   onShortCutList );
		Network.hookPacket( PACKET.ZC.SHORTCUT_KEY_LIST_V4,   onShortCutList );
		Network.hookPacket( PACKET.ZC.ACK_TOUSESKILL,         onSkillResult );
		Network.hookPacket( PACKET.ZC.NOTIFY_EFFECT,          onSpecialEffect );
		Network.hookPacket( PACKET.ZC.NOTIFY_EFFECT2,         onEffect );
		Network.hookPacket( PACKET.ZC.NOTIFY_EFFECT3,         onEffect );
		Network.hookPacket( PACKET.ZC.NOTIFY_GROUNDSKILL,     onSkillToGround );
		Network.hookPacket( PACKET.ZC.SKILL_SCALE,            onSkillToGround );
		Network.hookPacket( PACKET.ZC.AUTORUN_SKILL,          onAutoCastSkill );
		Network.hookPacket( PACKET.ZC.ITEMIDENTIFY_LIST,      onIdentifyList );
		Network.hookPacket( PACKET.ZC.ACK_ITEMIDENTIFY,       onIdentifyResult );
		Network.hookPacket( PACKET.ZC.AUTOSPELLLIST,          onAutoSpellList );
		Network.hookPacket( PACKET.ZC.SKILL_SELECT_REQUEST,   onSelectSkillList );
		Network.hookPacket( PACKET.ZC.WARPLIST,               onTeleportList );
		Network.hookPacket( PACKET.ZC.NOTIFY_MAPINFO,         onTeleportResult );
		Network.hookPacket( PACKET.ZC.ACK_REMEMBER_WARPPOINT, onMemoResult );
		Network.hookPacket( PACKET.ZC.MAKINGARROW_LIST,       onMakingarrowList );
		Network.hookPacket( PACKET.ZC.NOTIFY_WEAPONITEMLIST,  onRefineList );
		Network.hookPacket( PACKET.ZC.REPAIRITEMLIST,         onRepairList);
		Network.hookPacket( PACKET.ZC.REPAIRITEMLIST2,        onRepairList);
		Network.hookPacket( PACKET.ZC.SPIRITS,                onSpiritSphere );
		Network.hookPacket( PACKET.ZC.SPIRITS2,               onSpiritSphere );
		Network.hookPacket( PACKET.ZC.MILLENNIUMSHIELD,       onSpiritSphere );
		Network.hookPacket( PACKET.ZC.SKILL_POSTDELAY,        onSetSkillDelay );
		Network.hookPacket( PACKET.ZC.STARSKILL,              onTaekwonMission );
		Network.hookPacket( PACKET.ZC.MSG_SKILL,        	  onMessageSkill );
		Network.hookPacket( PACKET.ZC.MONSTER_INFO,           onSense );
	};
});
