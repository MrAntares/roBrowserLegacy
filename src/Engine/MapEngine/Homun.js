/**
 * Engine/MapEngine/Homun.js
 *
 * Manage homunculus
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author IssID
 */

define(function( require )
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var DB                   = require('DB/DBManager');
	var StatusProperty       = require('DB/Status/StatusProperty');
	var Network              = require('Network/NetworkManager');
	var PACKET               = require('Network/PacketStructure');
	var Session              = require('Engine/SessionStorage');
	var EntityManager        = require('Renderer/EntityManager');
	var UIManager            = require('UI/UIManager');
	var ChatBox              = require('UI/Components/ChatBox/ChatBox');
	var HomunInformations    = require('UI/Components/HomunInformations/HomunInformations');
	var SkillListMER         = require('UI/Components/SkillListMER/SkillListMER');
	var Mouse                = require('Controls/MouseEventHandler');

	/**
	 * Get own homunculus information from server
	 *
	 * @param {object} pkt - PACKET.ZC.PROPERTY_HOMUN2
	 */
	function onHomunInformation( pkt )
	{
		if (Session.homunId) {
			var entity = EntityManager.get(Session.homunId);
			if (entity) {
				entity.attack_range        = pkt.ATKRange;
				entity.life.hp             = pkt.hp;
				entity.life.hp_max         = pkt.maxHP;
				entity.life.sp             = pkt.sp;
				entity.life.sp_max         = pkt.maxSP;
				entity.life.hunger         = pkt.nFullness;
				entity.life.hunger_max     = 100;
				entity.life.update();
			}
		}

		SkillListMER.setPoints( pkt.SKPoint );

		HomunInformations.append();
		HomunInformations.setInformations( pkt );
		if(entity)
			HomunInformations.startAI();
	}


	/**
	 * Result from feeding your homun
	 *
	 * @param {object} pkt - PACKET.ZC.FEED_HOMUN
	 */
	function onFeedResult( pkt )
	{
		// Fail to feed
		if (!pkt.cRet) {
			ChatBox.addText( DB.getMessage(591).replace('%s', DB.getItemInfo(pkt.ITID).identifiedDisplayName), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		// success, what to do ? Action feed ? or is it sent by server ?
	}

	
	/**
	 * Update homun parameter
	 *
	 * @param {object} pkt - PACKET.ZC.HO_PAR_CHANGE
	 */
	function onHomunParameterChange ( pkt )
	{
		var entity = EntityManager.get(Session.homunId);

		switch(pkt.param) {
			case StatusProperty.SPEED:
				entity.walk.speed = pkt.value;
				break;

			case StatusProperty.EXP:
				HomunInformations.base_exp = pkt.value;
				HomunInformations.setExp(HomunInformations.base_exp, HomunInformations.base_exp_next);
				break;
			
			case StatusProperty.HP:
				entity.life.hp = pkt.value;
				entity.life.update();
				HomunInformations.setHpSpBar('hp', entity.life.hp, entity.life.hp_max);
				break;

			case StatusProperty.MAXHP:
				entity.life.hp_max = pkt.value;
				entity.life.update();
				HomunInformations.setHpSpBar('hp', entity.life.hp, entity.life.hp_max);
				break;

			case StatusProperty.SP:
				entity.life.sp = pkt.value;
				entity.life.update();
				HomunInformations.setHpSpBar('sp', entity.life.sp, entity.life.sp_max);
				break;

			case StatusProperty.MAXSP:
				entity.life.sp_max = pkt.value;
				entity.life.update();
				HomunInformations.setHpSpBar('sp', entity.life.sp, entity.life.sp_max);
				break;

			case StatusProperty.CLEVEL:
				entity.clevel = pkt.value;
				break;

			case StatusProperty.MAXEXP:
				HomunInformations.base_exp_next = pkt.value;
				HomunInformations.setExp(HomunInformations.base_exp, HomunInformations.base_exp_next);
				break;

			default:
				console.log( 'Homun::onHomunParameterChange() - Unsupported type', pkt);
		}
	}

	/**
	 * Update homun information
	 *
	 * @param {object} pkt - PACKET.ZC.CHANGESTATE_HOMUN
	 */
	function onHomunInformationUpdate( pkt )
	{
		var entity = EntityManager.get(pkt.GID);

		if (entity) {
			switch (pkt.state) {
				case 0:
					Session.homunId = pkt.GID;
					break;

				case 1:
					HomunInformations.setIntimacy(pkt.data);
					break;

				case 2:
					HomunInformations.setHunger(pkt.data);
					entity.life.hunger    = pkt.data;
					entity.life.hunger_max = 100;
					entity.life.update();
					break;
			}
		}
	}


	/**
	 * Client request to feed QHomun.
	 */
	HomunInformations.reqHomunFeed = function reqHomunFeed()
	{
		// Are you sure you want to feed your homunculus ?
		UIManager.showPromptBox(DB.getMessage(601), 'ok', 'cancel', function(){
			var pkt  = new PACKET.CZ.COMMAND_MER();
			pkt.type = 0x22f;
			pkt.command = 1;
			Network.sendPacket(pkt);
		});
	};

	HomunInformations.reqDeleteHomun = function reqDeleteHomun()
	{
		// Are you sure that you want to delete?
		UIManager.showPromptBox(DB.getMessage(356), 'ok', 'cancel', function(){
			var pkt  = new PACKET.CZ.COMMAND_MER();
			pkt.type = 0x22f;
			pkt.command = 2;
			Network.sendPacket(pkt);
		});
	};

	/**
	 * Client request to do a performance
	 * type:
	 *     always 0
	 * command:
	 *     0 = homunculus information
	 *     1 = feed
	 *     2 = delete
	 */
	HomunInformations.reqHomunAction = function reqHomunAction()
	{
		var pkt  = new PACKET.CZ.COMMAND_MER(cmd);
		pkt.type = 0;
		pkt.command = cmd;
		Network.sendPacket(pkt);
	};


	/**
	 * @param gid
	 */
	HomunInformations.reqMoveToOwner = function reqMoveToOwner(gid)
	{
		var pkt  = new PACKET.CZ.REQUEST_MOVETOOWNER();
		pkt.GID = gid;
		Network.sendPacket(pkt);
	};


	/**
	 * @param GID
	 * @param targetGID
	 */
	HomunInformations.reqAttack = function reqAttack(GID, targetGID)
	{
		var pkt  = new PACKET.CZ.REQUEST_ACTNPC();
		pkt.GID = GID;
		pkt.targetGID = targetGID;
		pkt.action = 0;
		Network.sendPacket(pkt);
	};


	/**
	 * @param GID
	 */
	HomunInformations.reqMoveTo = function reqMoveTo(GID)
	{
		var pkt  = new PACKET.CZ.REQUEST_MOVENPC();
		pkt.GID = GID;
		pkt.dest[0] = Mouse.world.x;
		pkt.dest[1] = Mouse.world.y;
		Network.sendPacket(pkt);
	};


	/**
	 * Rename QHomunculus
	 *
	 * @param {string} new homunculus name
	 */
	HomunInformations.reqNameEdit   = function reqNameEdit(name)
	{
		//msg 2904(2903)
		var pkt    = new PACKET.CZ.RENAME_MER();
		pkt.name = name;
		Network.sendPacket(pkt);
	};


	/**
	 * List of skills
	 *
	 * @param {object} pkt - PACKET.ZC.MER_SKILLINFO_LIST
	 */
	function onSkillList( pkt )
	{
		SkillListMER.setSkills( pkt.skillList );
	}


	/**
	 * Update a specified skill
	 *
	 * @param {object} pkt - PACKET.ZC.SKILLINFO_UPDATE
	 */
	function onSkillUpdate( pkt )
	{
		SkillListMER.updateSkill( pkt );
	}


	// function testing( pkt )
	// {
	// 	console.warn(pkt)
	// }


	/**
	 * Initialize
	 */
	return function NPCEngine()
	{
		Network.hookPacket( PACKET.ZC.PROPERTY_HOMUN,         onHomunInformation);
		Network.hookPacket( PACKET.ZC.PROPERTY_HOMUN2,        onHomunInformation);
		Network.hookPacket( PACKET.ZC.PROPERTY_HOMUN3,        onHomunInformation);
		Network.hookPacket( PACKET.ZC.PROPERTY_HOMUN4,        onHomunInformation);
		Network.hookPacket( PACKET.ZC.PROPERTY_HOMUN5,        onHomunInformation);
		Network.hookPacket( PACKET.ZC.CHANGESTATE_MER,        onHomunInformationUpdate);
		Network.hookPacket( PACKET.ZC.HO_PAR_CHANGE,          onHomunParameterChange);
		Network.hookPacket( PACKET.ZC.HO_PAR_CHANGE2,         onHomunParameterChange);
		Network.hookPacket( PACKET.ZC.FEED_MER,               onFeedResult);
		Network.hookPacket( PACKET.ZC.MER_SKILLINFO_LIST,     onSkillList);
		Network.hookPacket( PACKET.ZC.MER_SKILLINFO_UPDATE,   onSkillUpdate);

		// Network.hookPacket( PACKET.ZC.MER_INIT,     testing);
		// Network.hookPacket( PACKET.ZC.MER_PROPERTY,     testing);
		// Network.hookPacket( PACKET.ZC.MER_PAR_CHANGE,     testing);
		// Network.hookPacket( PACKET.ZC.HOMUN_ACT,            onHomunAction);
	};
});
