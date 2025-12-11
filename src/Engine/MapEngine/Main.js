/**
 * Engine/MapEngine/Main.js
 *
 * Manage Entity based on received packets from server
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
	var DB             = require('DB/DBManager');
	var StatusProperty = require('DB/Status/StatusProperty');
	var EffectConst       = require('DB/Effects/EffectConst');
	var Session        = require('Engine/SessionStorage');
	var Network        = require('Network/NetworkManager');
	var PACKET         = require('Network/PacketStructure');
	var PACKETVER	   = require('Network/PacketVerManager');
	var EntityManager  = require('Renderer/EntityManager');
	var SkillActionTable  = require('DB/Skills/SkillAction');
	var EffectManager  = require('Renderer/EffectManager');
	var Renderer       = require('Renderer/Renderer');
	var Damage         = require('Renderer/Effects/Damage');
	var Altitude       = require('Renderer/Map/Altitude');
	var ChatBox        = require('UI/Components/ChatBox/ChatBox');
	var ChatRoom       = require('UI/Components/ChatRoom/ChatRoom');
	var Announce       = require('UI/Components/Announce/Announce');
	var Equipment      = require('UI/Components/Equipment/Equipment');
	var ChangeCart     = require('UI/Components/ChangeCart/ChangeCart');
	var PartyUI        = require('UI/Components/PartyFriends/PartyFriends');
	var PetMessageConst    = require('DB/Pets/PetMessageConst');
	var uint32ToRGB    = require('Utils/colors');

	// Version Dependent UIs
	var BasicInfo = require('UI/Components/BasicInfo/BasicInfo');
	var SkillList = require('UI/Components/SkillList/SkillList');
	var WinStats  = require('UI/Components/WinStats/WinStats');



	/**
	 * Move main player to the position specify
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_PLAYERMOVE
	 */
	function onPlayerMove( pkt )
	{
		Session.Entity.walkTo(
			pkt.MoveData[0],
			pkt.MoveData[1],
			pkt.MoveData[2],
			pkt.MoveData[3],
			undefined,
			pkt.moveStartTime
		);
	}


	/**
	 * Our player just talk
	 *
	 * @param {object} pkt - PACKET_ZC_NOTIFY_PLAYERCHAT
	 */
	function onPlayerMessage( pkt )
	{
		if (ChatRoom.isOpen) {
			ChatRoom.message(pkt.msg);
			return;
		}

		ChatBox.addText( pkt.msg, ChatBox.TYPE.PUBLIC | ChatBox.TYPE.SELF, ChatBox.FILTER.PUBLIC_CHAT, null, false );

		if (Session.Entity) {
			pkt.msg = pkt.msg.replace(/<ITEMLINK>.*?<\/ITEMLINK>|<ITEML>.*?<\/ITEML>|<ITEM>.*?<\/ITEM>/gi, function(match) {
				return '<' + DB.getItemNameFromLink(match) + '>';
			});

			Session.Entity.dialog.set( pkt.msg );
		}
	}


	/**
	 * Target too far to attack it
	 *
	 * @param {object} pkt - PACKET.ZC.ATTACK_FAILURE_FOR_DISTANCE
	 */
	function onPlayerTooFarToAttack( pkt )
	{
		var entity = EntityManager.get(pkt.targetAID);
		if (entity) {
			entity.onFocus();
		}
	}


	/**
	 * Get player attack range
	 *
	 * @param {object} pkt - PACKET.ZC.ATTACK_RANGE
	 */
	function onAttackRangeUpdate( pkt )
	{
		Session.Entity.attack_range = pkt.currentAttRange;
	}


	/**
	 * Update status parameters
	 *
	 * @param {object} pkt - PACKET.ZC.STATUS
	 */
	function onStatusParameterChange( pkt )
	{
		WinStats.getUI().update('str',         pkt.str);
		WinStats.getUI().update('agi',         pkt.agi);
		WinStats.getUI().update('vit',         pkt.vit);
		WinStats.getUI().update('int',         pkt.Int);
		WinStats.getUI().update('dex',         pkt.dex);
		WinStats.getUI().update('luk',         pkt.luk);
		WinStats.getUI().update('str3',        pkt.standardStr);
		WinStats.getUI().update('agi3',        pkt.standardAgi);
		WinStats.getUI().update('vit3',        pkt.standardVit);
		WinStats.getUI().update('int3',        pkt.standardInt);
		WinStats.getUI().update('dex3',        pkt.standardDex);
		WinStats.getUI().update('luk3',        pkt.standardLuk);
		WinStats.getUI().update('aspd',        ( pkt.ASPD + pkt.plusASPD ) / 4);
		WinStats.getUI().update('atak',        pkt.attPower);
		WinStats.getUI().update('atak2',       pkt.refiningPower);
		WinStats.getUI().update('matak',       pkt.min_mattPower);
		WinStats.getUI().update('matak2',      pkt.max_mattPower);
		WinStats.getUI().update('flee',        pkt.avoidSuccessValue );
		WinStats.getUI().update('flee2',       pkt.plusAvoidSuccessValue );
		WinStats.getUI().update('critical',    pkt.criticalSuccessValue );
		WinStats.getUI().update('hit',         pkt.hitSuccessValue );
		WinStats.getUI().update('def',         pkt.itemdefPower );
		WinStats.getUI().update('def2',        pkt.plusdefPower );
		WinStats.getUI().update('mdef',        pkt.mdefPower );
		WinStats.getUI().update('mdef2',       pkt.plusmdefPower );
		WinStats.getUI().update('statuspoint', pkt.point );
	}


	/**
	 * Answer from server for updating parameter
	 *
	 * @param {object} pkt - PACKET.ZC.STATUS_CHANGE_ACK
	 */
	function onStatusParameterUpdateAnswer( pkt )
	{
		// Fail
		if (!pkt.result) {
			return;
		}

		switch (pkt.statusID) {
			case StatusProperty.STR:
				WinStats.getUI().update('str', pkt.value);
				break;

			case StatusProperty.AGI:
				WinStats.getUI().update('agi', pkt.value);
				break;

			case StatusProperty.VIT:
				WinStats.getUI().update('vit', pkt.value);
				break;

			case StatusProperty.INT:
				WinStats.getUI().update('int', pkt.value);
				break;

			case StatusProperty.DEX:
				WinStats.getUI().update('dex', pkt.value);
				break;

			case StatusProperty.LUK:
				WinStats.getUI().update('luk', pkt.value);
				break;

			case StatusProperty.VAR_SP_POW:
				WinStats.getUI().update('pow', pkt.value);
				break;

			case StatusProperty.VAR_SP_STA:
				WinStats.getUI().update('sta', pkt.value);
				break;

			case StatusProperty.VAR_SP_WIS:
				WinStats.getUI().update('wis', pkt.value);
				break;

			case StatusProperty.VAR_SP_SPL:
				WinStats.getUI().update('spl', pkt.value);
				break;

			case StatusProperty.VAR_SP_CON:
				WinStats.getUI().update('con', pkt.value);
				break;

			case StatusProperty.VAR_SP_CRT:
				WinStats.getUI().update('crt', pkt.value);
				break;
		}
	}


	/**
	 * Modify main players parameters
	 * Generic function
	 */
	function onParameterChange( pkt )
	{
		var amount = 0, type;

		if (pkt.hasOwnProperty('varID')) {
			type = pkt.varID;
		}
		else if (pkt.hasOwnProperty('statusType')) {
			type = pkt.statusType;
		}
		else if (pkt.hasOwnProperty('statusID')) {
			type = pkt.statusID;
		}
		else if (pkt.hasOwnProperty('type')) {
			type = pkt.type;
	  	}
		else {
			type = -1; // goto "default".
		}

		if (pkt.hasOwnProperty('amount')) {
			amount = pkt.amount;
		}
		else if (pkt.hasOwnProperty('count')) {
			amount = pkt.count;
		}
		else if (pkt.hasOwnProperty('value')) {
			amount = pkt.value;
		}

		switch (type) {

			case StatusProperty.SPEED:
				Session.Entity.walk.speed = amount;
				break;

			case StatusProperty.EXP:
				BasicInfo.getUI().base_exp = amount;
				if (BasicInfo.getUI().base_exp_next) {
					BasicInfo.getUI().update('bexp', BasicInfo.getUI().base_exp, BasicInfo.getUI().base_exp_next );
				}
				break;

			case StatusProperty.JOBEXP:
				BasicInfo.getUI().job_exp = amount;
				if (BasicInfo.getUI().job_exp_next) {
					BasicInfo.getUI().update('jexp', BasicInfo.getUI().job_exp, BasicInfo.getUI().job_exp_next );
				}
				break;

			// (not used ?)
			case StatusProperty.VIRTUE:
			case StatusProperty.HONOR:
				break;

			case StatusProperty.HP:
				Session.Entity.life.hp = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.hp_max > -1) {
					BasicInfo.getUI().update('hp', Session.Entity.life.hp, Session.Entity.life.hp_max);

					if (Session.hasParty) {
						PartyUI.updateMemberLife(Session.AID, Session.Entity.life.canvas, Session.Entity.life.hp, Session.Entity.life.hp_max);
					}
				}
				//Danger
				if(Session.Entity.life.hp <= (25/100*Session.Entity.life.hp_max)){
					//Pet Talk
					if(Session.pet.friendly > 900 && (Session.pet.lastTalk || 0) + 10000 < Date.now()){
						const hunger = DB.getPetHungryState(Session.pet.oldHungry);
						const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_DANGER, hunger);

						var pkt    = new PACKET.CZ.PET_ACT();
						pkt.data = talk;
						Network.sendPacket(pkt);
						Session.pet.lastTalk = Date.now();
					}
				}
				//Died
				if(Session.Entity.life.hp <= 1){
					//Pet Talk
					if(Session.pet.friendly > 900 ){
						const hunger = DB.getPetHungryState(Session.pet.oldHungry);
						const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_DEAD, hunger);

						var pkt    = new PACKET.CZ.PET_ACT();
						pkt.data = talk;
						Network.sendPacket(pkt);
						Session.pet.lastTalk = Date.now();
					}

				}
				break;

			case StatusProperty.MAXHP:
				Session.Entity.life.hp_max = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.hp > -1) {
					BasicInfo.getUI().update('hp', Session.Entity.life.hp, Session.Entity.life.hp_max);

					if (Session.hasParty) {
						PartyUI.updateMemberLife(Session.AID, Session.Entity.life.canvas, Session.Entity.life.hp, Session.Entity.life.hp_max);
					}
				}
				break;

			case StatusProperty.SP:
				Session.Entity.life.sp = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.sp_max > -1) {
					BasicInfo.getUI().update('sp', Session.Entity.life.sp, Session.Entity.life.sp_max);
				}
				break;

			case StatusProperty.MAXSP:
				Session.Entity.life.sp_max = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.sp > -1) {
					BasicInfo.getUI().update('sp', Session.Entity.life.sp, Session.Entity.life.sp_max);
				}
				break;

			case StatusProperty.POINT:
				WinStats.getUI().update('statuspoint', amount);
				break;

			case StatusProperty.CLEVEL:
				Session.Entity.clevel = amount;
				// load aura on levelup
				Session.Entity.aura.load( EffectManager );
				BasicInfo.getUI().update('blvl', amount);
				Equipment.getUI().onLevelUp();
				ChangeCart.onLevelUp(amount);

				//Pet Talk
				if(Session.pet.friendly > 900){
					const hunger = DB.getPetHungryState(Session.pet.oldHungry);
					const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_LEVELUP, hunger);

					var pkt    = new PACKET.CZ.PET_ACT();
					pkt.data = talk;
					Network.sendPacket(pkt);
					Session.pet.lastTalk = Date.now();
				}
				break;

			case StatusProperty.SKPOINT:
				SkillList.getUI().setPoints(amount);
				break;

			case StatusProperty.STR:
				WinStats.getUI().update('str',  pkt.defaultStatus);
				WinStats.getUI().update('str2', pkt.plusStatus);
				break;

			case StatusProperty.AGI:
				WinStats.getUI().update('agi',  pkt.defaultStatus);
				WinStats.getUI().update('agi2', pkt.plusStatus);
				break;

			case StatusProperty.VIT:
				WinStats.getUI().update('vit',  pkt.defaultStatus);
				WinStats.getUI().update('vit2', pkt.plusStatus);
				break;

			case StatusProperty.INT:
				WinStats.getUI().update('int',  pkt.defaultStatus);
				WinStats.getUI().update('int2', pkt.plusStatus);
				break;

			case StatusProperty.DEX:
				WinStats.getUI().update('dex',  pkt.defaultStatus);
				WinStats.getUI().update('dex2', pkt.plusStatus);
				break;

			case StatusProperty.LUK:
				WinStats.getUI().update('luk',  pkt.defaultStatus);
				WinStats.getUI().update('luk2', pkt.plusStatus);
				break;

			case StatusProperty.MONEY:
				BasicInfo.getUI().update('zeny', amount);
				break;

			case StatusProperty.MAXEXP:
				BasicInfo.getUI().base_exp_next = amount;
				if (BasicInfo.getUI().base_exp > -1) {
					BasicInfo.getUI().update('bexp', BasicInfo.getUI().base_exp, BasicInfo.getUI().base_exp_next );
				}
				break;

			case StatusProperty.MAXJOBEXP:
				BasicInfo.getUI().job_exp_next = amount;
				if (BasicInfo.getUI().job_exp > -1) {
					BasicInfo.getUI().update('jexp', BasicInfo.getUI().job_exp, BasicInfo.getUI().job_exp_next );
				}
				break;

			case StatusProperty.WEIGHT:
				Session.Character.weight = amount;	// Save weight in Session instead of UI
				if (BasicInfo.getUI().weight_max > -1) {
					BasicInfo.getUI().update('weight', Session.Character.weight, BasicInfo.getUI().weight_max );
				}
				break;

			case StatusProperty.MAXWEIGHT:
				Session.Character.max_weight = amount;	// Save max weight in Session instead of UI only
				BasicInfo.getUI().weight_max = amount;
				if (BasicInfo.getUI().weight > -1) {
					BasicInfo.getUI().update('weight', Session.Character.weight, BasicInfo.getUI().weight_max );
				}
				break;

			case StatusProperty.STANDARD_STR:
				WinStats.getUI().update('str3', amount);
				break;

			case StatusProperty.STANDARD_AGI:
				WinStats.getUI().update('agi3', amount);
				break;

			case StatusProperty.STANDARD_VIT:
				WinStats.getUI().update('vit3', amount);
				break;

			case StatusProperty.STANDARD_INT:
				WinStats.getUI().update('int3', amount);
				break;

			case StatusProperty.STANDARD_DEX:
				WinStats.getUI().update('dex3', amount);
				break;

			case StatusProperty.STANDARD_LUK:
				WinStats.getUI().update('luk3', amount);
				break;

			case StatusProperty.ATTPOWER:
				WinStats.getUI().update('atak', amount);
				break;

			case StatusProperty.REFININGPOWER:
				WinStats.getUI().update('atak2', amount);
				break;

			case StatusProperty.MAX_MATTPOWER:
				WinStats.getUI().update('matak', amount);
				break;

			case StatusProperty.MIN_MATTPOWER:
				WinStats.getUI().update('matak2', amount);
				break;

			case StatusProperty.ITEMDEFPOWER:
				WinStats.getUI().update('def', amount);
				break;

			case StatusProperty.PLUSDEFPOWER:
				WinStats.getUI().update('def2', amount);
				break;

			case StatusProperty.MDEFPOWER:
				WinStats.getUI().update('mdef', amount);
				break;

			case StatusProperty.PLUSMDEFPOWER:
				WinStats.getUI().update('mdef2', amount);
				break;

			case StatusProperty.HITSUCCESSVALUE:
				WinStats.getUI().update('hit', amount);
				break;

			case StatusProperty.AVOIDSUCCESSVALUE:
				WinStats.getUI().update('flee', amount);
				break;

			case StatusProperty.PLUSAVOIDSUCCESSVALUE:
				WinStats.getUI().update('flee2', amount);
				break;

			case StatusProperty.CRITICALSUCCESSVALUE:
				WinStats.getUI().update('critical', amount);
				break;

			case StatusProperty.ASPD:
				WinStats.getUI().update('aspd', amount);
				break;

			case StatusProperty.JOBLEVEL:
				BasicInfo.getUI().update('jlvl', amount);
				SkillList.getUI().onLevelUp();
				break;

			case StatusProperty.VAR_SP_POW:
				WinStats.getUI().update('pow', 	pkt.defaultStatus);
				WinStats.getUI().update('pow2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_STA:
				WinStats.getUI().update('sta', 	pkt.defaultStatus);
				WinStats.getUI().update('sta2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_WIS:
				WinStats.getUI().update('wis', 	pkt.defaultStatus);
				WinStats.getUI().update('wis2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_SPL:
				WinStats.getUI().update('spl', 	pkt.defaultStatus);
				WinStats.getUI().update('spl2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_CON:
				WinStats.getUI().update('con', 	pkt.defaultStatus);
				WinStats.getUI().update('con2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_CRT:
				WinStats.getUI().update('crt', 	pkt.defaultStatus);
				WinStats.getUI().update('crt2', pkt.plusStatus);
				break;

			case StatusProperty.VAR_SP_PATK:
				WinStats.getUI().update('patk', amount);
				break;

			case StatusProperty.VAR_SP_SMATK:
				WinStats.getUI().update('smatk', amount);
				break;

			case StatusProperty.VAR_SP_RES:
				WinStats.getUI().update('res', amount);
				break;

			case StatusProperty.VAR_SP_MRES:
				WinStats.getUI().update('mres', amount);
				break;

			case StatusProperty.VAR_SP_HPLUS:
				WinStats.getUI().update('hplus', amount);
				break;

			case StatusProperty.VAR_SP_CRATE:
				WinStats.getUI().update('crate', amount);
				break;

			case StatusProperty.VAR_SP_TRAITPOINT:
				WinStats.getUI().update('trait_point', amount);
				break;

			case StatusProperty.VAR_SP_AP:
				Session.Entity.life.ap = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.ap_max > -1) {
					BasicInfo.getUI().update('ap', Session.Entity.life.ap, Session.Entity.life.ap_max);
				}
				break;

			case StatusProperty.VAR_SP_MAXAP:
				Session.Entity.life.ap_max = amount;
				Session.Entity.life.update();

				if (Session.Entity.life.ap > -1) {
					BasicInfo.getUI().update('ap', Session.Entity.life.ap, Session.Entity.life.ap_max);
				}
				break;

			case StatusProperty.VAR_SP_UPOW:
				WinStats.getUI().update('pow3', amount);
				break;

			case StatusProperty.VAR_SP_USTA:
				WinStats.getUI().update('sta3', amount);
				break;

			case StatusProperty.VAR_SP_UWIS:
				WinStats.getUI().update('wis3', amount);
				break;

			case StatusProperty.VAR_SP_USPL:
				WinStats.getUI().update('spl3', amount);
				break;

			case StatusProperty.VAR_SP_UCON:
				WinStats.getUI().update('con3', amount);
				break;

			case StatusProperty.VAR_SP_UCRT:
				WinStats.getUI().update('crt3', amount);
				break;

			default:
				console.error( 'Main::onParameterChange() - Unsupported type', pkt);
		}
	}


	/**
	 * Received announce from server
	 *
	 * @param {object} pkt - PACKET.ZC.BROADCAST
	 */
	function onGlobalAnnounce( pkt )
	{
		var color;

		if (pkt.fontColor) {
			color = 'rgb(' + ([
				( pkt.fontColor & 0x00ff0000 ) >> 16,
				( pkt.fontColor & 0x0000ff00 ) >> 8,
				( pkt.fontColor & 0x000000ff )
			]).join(',') + ')';
		}
		else if (pkt.msg.match(/^blue/)) {
			color = '#00FFFF';
			pkt.msg = pkt.msg.substr(4);
		}
		else if (pkt.msg.match(/^ssss/)) {
			color = '#FFFF00';
			pkt.msg = pkt.msg.substr(4);
		}
		else {
			color = '#FFFF00';
		}

		ChatBox.addText( pkt.msg, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_CHAT, color );
		Announce.append();
		Announce.set( pkt.msg, color );
	}


	/**
	 * Receive player count in server
	 * @param {object} pkt - PACKET.ZC.USER_COUNT
	 */
	function onPlayerCountAnswer( pkt )
	{
		ChatBox.addText( DB.getMessage(178).replace('%d', pkt.count), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG );
	}


	/**
	 * Despite the name, it give information about item equipped
	 *
	 * @param {object} pkt - PACKET_ZC_ACTION_FAILURE
	 */
	function onActionFailure( pkt )
	{
		var entity = Session.Entity;
		var srcEntity = EntityManager.get(entity.GID);

		switch (pkt.errorCode) {
			case 0: // Please equip the proper amnution first
				ChatBox.addText( DB.getMessage(242), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
				break;

			case 1:  // You can't Attack or use Skills because your Weight Limit has been exceeded.
				ChatBox.addText( DB.getMessage(243), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
				break;

			case 2: // You can't use Skills because Weight Limit has been exceeded.
				ChatBox.addText( DB.getMessage(244), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
				break;

			case 3: // Ammunition has been equipped.
				// TODO: check the class - assassin: 1040 | gunslinger: 1175 | default: 245
				ChatBox.addText( DB.getMessage(245), ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM );
				break;
		}
	}


	/**
	 * Server message using msgstringtable
	 *
	 * @param {object} pkt - PACKET_ZC_MSG & PACKET_ZC_MSG_COLOR
	 */
	function onMessage( pkt )
	{
		if (pkt.color) {
			ChatBox.addText( DB.getMessage(pkt.msg), ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_LOG, uint32ToRGB(pkt.color) );
		} else {
			ChatBox.addText( DB.getMessage(pkt.msg), ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_LOG );
		}
	}


	/**
	 * Recovery of a status
	 *
	 * @param {object} pkt - PACKET.ZC.RECOVERY
	 */
	function onRecovery( pkt )
	{
		switch (pkt.varID) {

			case StatusProperty.HP:
				Damage.add( pkt.amount, Session.Entity, Renderer.tick, null, Damage.TYPE.HEAL );

				var EF_Init_Par = {
					effectId: EffectConst.EF_HPTIME,
					ownerAID: Session.Entity.GID,
				};

				EffectManager.spam(EF_Init_Par);

				Session.Entity.life.hp += pkt.amount;
				Session.Entity.life.update();

				if (Session.Entity.life.hp_max > -1) {
					BasicInfo.getUI().update('hp', Session.Entity.life.hp, Session.Entity.life.hp_max);
				}
				break;

			case StatusProperty.SP:
				Damage.add( pkt.amount, Session.Entity, Renderer.tick, null, Damage.TYPE.HEAL | Damage.TYPE.SP );
				var EF_Init_Par = {
					effectId: EffectConst.EF_SPTIME,
					ownerAID: Session.Entity.GID,
				};

				EffectManager.spam(EF_Init_Par);

				Session.Entity.life.sp += pkt.amount;
				Session.Entity.life.update();

				if (Session.Entity.life.sp_max > -1) {
					BasicInfo.getUI().update('sp', Session.Entity.life.sp, Session.Entity.life.sp_max);
				}
				break;
		}
	}


	function onRank(pkt){
		var message = '';

		//Header
		message += '=========== ';
		if(pkt instanceof PACKET.ZC.BLACKSMITH_RANK) { message += DB.getMessage(2386); } // "BlackSmith"
		else if(pkt instanceof PACKET.ZC.ALCHEMIST_RANK) { message += DB.getMessage(2387); } // "Alchemist"
		else if(pkt instanceof PACKET.ZC.TAEKWON_RANK) { message += DB.getMessage(2388); } // "Taekwon"
		//else if(pkt instanceof PACKET.ZC.KILLER_RANK) { message += DB.getMessage(2389); } //PK currently unsupported
		else { message += 'Unknown'; }
		message += ' ';
		message += DB.getMessage(2383);  // "Rank"
		message += ' ===========';
		ChatBox.addText( message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_LOG );

		//List
		for(var i = 0; i < 10; ++i){
			let name, point;
			name = pkt?.Name?.[i] ?? 'None';
			point = pkt?.Point?.[i] ?? 0;

			message = '[%rank%] %name% : %point% ' + DB.getMessage(2385); // [x] name : y Points
			message = message.replace('%rank%', i+1);
			message = message.replace('%name%', name);
			message = message.replace('%point%', point);
			ChatBox.addText( message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_LOG );
		}

	}

	function onUpdateMapInfo(pkt){
		Altitude.setCellType(pkt.xPos, pkt.yPos, pkt.type);
	}

	/**
	 * Received server rates information packet
	 * @param {object} pkt - PACKET.ZC.PERSONAL_INFORMATION|PACKET.ZC.PERSONAL_INFORMATION2
	 * Notes:
	 * DB.getMessage(3032) - used for newer clients (tested on PACKETVER > 20220406)
	 */
	function onRatesInfo(pkt) {
		const serverName = Session.ServerName || "Unknown Server";
    	let message = '';

		// Header
		ChatBox.addText("=====================================================================", ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG, '#ffb563');
		message += DB.getMessage(1933) + formatRate(DB.getMessage(3032), pkt.total_exp, pkt.info, 'exp', serverName) + '\n';
		message += DB.getMessage(1934) + formatRate(DB.getMessage(3032), pkt.total_drop, pkt.info, 'drop', serverName) + '\n';
		message += DB.getMessage(1935) + formatRate(DB.getMessage(3032), pkt.total_death, pkt.info, 'death', serverName) + '\n';
		ChatBox.addText(message, ChatBox.TYPE.SELF, ChatBox.FILTER.PUBLIC_LOG, '#ffb563' );
		ChatBox.addText("=====================================================================", ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG, '#ffb563');
		Session.ratesInfo = message;
	}

	/**
	 * Formats the rate values into a given string format.
	 *
	 * @param {string} format - The format string containing placeholders for rate values.
	 * @param {number} total - The total value used to calculate the total rate.
	 * @param {object} info - An object containing rate information for various sources.
	 * @param {string} key - The key used to access rate information from the info object.
	 * @param {string} serverName - The name of the server used in the formatted string.
	 * @returns {string} - The formatted string with rate values and server name.
	 */
	function formatRate(format, total, info, key, serverName) {
		const totalRate = (total / 1000).toFixed(1);
		const pcCafeRate = (info[0]?.[key] / 1000).toFixed(1) || "0.0";
		const tplusRate = (info[3]?.[key] / 1000).toFixed(1) || "0.0"; // TPLUS fallback
		const serverRate = (info[2]?.[key] / 1000).toFixed(1) || "0.0"; // Server fallback

		// Replace placeholders in the format string
		return format
			.replace('%.1f%%', `${totalRate}%`)
			.replace('%.1f%%', `${pcCafeRate}%`)
			.replace('%.1f%%', `${tplusRate}%`)
			.replace('%s', serverName)
			.replace('%.1f%%', `${serverRate}%`);
	}

	/**
	 * Initialize
	 */
	return function MainEngine()
	{
		Network.hookPacket( PACKET.ZC.NOTIFY_PLAYERMOVE,           onPlayerMove );
		Network.hookPacket( PACKET.ZC.PAR_CHANGE,                  onParameterChange );
		Network.hookPacket( PACKET.ZC.LONGPAR_CHANGE,              onParameterChange );
		Network.hookPacket( PACKET.ZC.LONGPAR_CHANGE2,             onParameterChange );
		Network.hookPacket( PACKET.ZC.STATUS_CHANGE,               onParameterChange );
		Network.hookPacket( PACKET.ZC.NOTIFY_CARTITEM_COUNTINFO,   onParameterChange );
		Network.hookPacket( PACKET.ZC.COUPLESTATUS,                onParameterChange );
		Network.hookPacket( PACKET.ZC.STATUS,                      onStatusParameterChange );
		Network.hookPacket( PACKET.ZC.STATUS_CHANGE_ACK,           onStatusParameterUpdateAnswer );
		Network.hookPacket( PACKET.ZC.ATTACK_RANGE,                onAttackRangeUpdate );
		Network.hookPacket( PACKET.ZC.BROADCAST,                   onGlobalAnnounce );
		Network.hookPacket( PACKET.ZC.BROADCAST2,                  onGlobalAnnounce );
		Network.hookPacket( PACKET.ZC.USER_COUNT,                  onPlayerCountAnswer );
		Network.hookPacket( PACKET.ZC.NOTIFY_PLAYERCHAT,           onPlayerMessage );
		Network.hookPacket( PACKET.ZC.ATTACK_FAILURE_FOR_DISTANCE, onPlayerTooFarToAttack );
		Network.hookPacket( PACKET.ZC.ACTION_FAILURE,              onActionFailure );
		Network.hookPacket( PACKET.ZC.MSG,                         onMessage );
		Network.hookPacket( PACKET.ZC.MSG_COLOR,                   onMessage );
		if (PACKETVER.value < 20141022) {
			Network.hookPacket( PACKET.ZC.RECOVERY,                    onRecovery );
		} else {
			Network.hookPacket( PACKET.ZC.RECOVERY2,                   onRecovery );
		}
		Network.hookPacket( PACKET.ZC.BLACKSMITH_RANK,             onRank );
		Network.hookPacket( PACKET.ZC.ALCHEMIST_RANK,              onRank );
		Network.hookPacket( PACKET.ZC.TAEKWON_RANK,                onRank );
		//Network.hookPacket( PACKET.ZC.KILLER_RANK,                 onRank ); //PK currently unsupported
		Network.hookPacket( PACKET.ZC.UPDATE_MAPINFO,				onUpdateMapInfo );
		Network.hookPacket( PACKET.ZC.PERSONAL_INFORMATION,			onRatesInfo);
		Network.hookPacket( PACKET.ZC.PERSONAL_INFORMATION2,		onRatesInfo);
	};
});
