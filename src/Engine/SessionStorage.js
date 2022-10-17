/**
 * Engine/SessionStorage.js
 *
 * Session Storage
 * Manage session variables
 *
 * @author Vincent Thibault
 */

define(function()
{
	"use strict";

	return {
		
		isTouchDevice: false,

		AuthCode:    0,
		AID:         0,
		GID:         0,
		UserLevel:   0,
		Sex:         0,
		LangType:    0,

		Character:   null,
		Entity:      null,

		AdminList:   [],

		underAutoCounter: false,

		moveAction:  null,

		zeny:        0,

		petId:       0,

		hasParty:      false,
		isPartyLeader: false,

		hasGuild:      false,
		guildRight:    0,
		isGuildMaster: false,

		Playing: false,
		hasCart: false,
		CartNum: 0,
		
		homCustomAI: false,
		merCustomAI: false
	};
});
