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
	var Network              = require('Network/NetworkManager');
	var PACKET               = require('Network/PacketStructure');
	var Session              = require('Engine/SessionStorage');
	var EntityManager        = require('Renderer/EntityManager');
	var UIManager            = require('UI/UIManager');
	var ChatBox              = require('UI/Components/ChatBox/ChatBox');
	var HomunInformations    = require('UI/Components/HomunInformations/HomunInformations');
	var SkillListMH          = require('UI/Components/SkillListMH/SkillListMH');
	var Mouse                = require('Controls/MouseEventHandler');

	/**
	 * Get own homunculus information from server
	 *
	 * @param {object} pkt - PACKET.ZC.PROPERTY_HOMUN2
	 */
	function onHomunInformation( pkt )
	{
		var entity = EntityManager.get(Session.homunId);
		if (Session.homunId) {
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

		if (entity && entity.life.display) {
			pkt.life = entity.life;
		}

		HomunInformations.append();
		HomunInformations.setInformations( pkt );
		HomunInformations.startAI();

		SkillListMH.homunculus.setPoints( pkt.SKPoint );
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
	 * Update homun information
	 *
	 * @param {object} pkt - PACKET.ZC.CHANGESTATE_HOMUN
	 */
	function onHomunInformationUpdate( pkt )
	{
		var entity = EntityManager.get(pkt.GID);

		if (!entity) {
			return;
		}

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
		SkillListMH.homunculus.setSkills( pkt.skillList );
	}


	/**
	 * Update a specified skill
	 *
	 * @param {object} pkt - PACKET.ZC.SKILLINFO_UPDATE
	 */
	function onSkillUpdate( pkt )
	{
		SkillListMH.homunculus.updateSkill( pkt );
	}

	/**
	 * Update homunculus parameters e.g. hp/sp recovery
	 * 
	 * @param {object} pkt - PACKET.ZC.HO_PAR_CHANGE
	 */
	function onParamsUpdate( pkt )
	{
		if (!Session.homunId) {
			return;
		}

		var entity = EntityManager.get(Session.homunId);

		if (!entity) {
			return;
		}

		switch (pkt.param) {
			case 1: // EXP = value
				// TODO update homunculus current EXP value.
				// How go get expMax, whene is't only in onHomunInformation callback?
				// HomunInformations.setExp(exp, expMax);
				break;

			case 5: // HP = value
				entity.life.hp = pkt.value;
				entity.life.update();
				break;

			case 7: // SP = value
				// HomunInformations.setHP(pkt.value);
				entity.life.sp = pkt.value;
				entity.life.update();
				break;

			default: break;
		}
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
		Network.hookPacket( PACKET.ZC.FEED_MER,               onFeedResult);
		Network.hookPacket( PACKET.ZC.MER_SKILLINFO_LIST,     onSkillList);
		Network.hookPacket( PACKET.ZC.MER_SKILLINFO_UPDATE,   onSkillUpdate);
		Network.hookPacket( PACKET.ZC.HO_PAR_CHANGE,          onParamsUpdate );

		// Network.hookPacket( PACKET.ZC.MER_INIT,     testing);
		// Network.hookPacket( PACKET.ZC.MER_PROPERTY,     testing);
		// Network.hookPacket( PACKET.ZC.MER_PAR_CHANGE,     testing);
		// Network.hookPacket( PACKET.ZC.HOMUN_ACT,            onHomunAction);
	};
});
