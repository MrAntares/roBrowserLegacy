/**
 * UI/Components/PartyFriends/PartyFriends.js
 *
 * Manage interface for parties and friends - Version Router
 *
 */
define(function (require) {
	'use strict';

	var publicName = 'PartyFriends';

	var PartyFriendsV0 = require('./PartyFriendsV0/PartyFriendsV0');
	var PartyFriendsV1 = require('./PartyFriendsV1/PartyFriendsV1');

	var UIVersionManager = require('UI/UIVersionManager');

	var versionInfo = {
		default: PartyFriendsV0,
		common: {
			20170524: PartyFriendsV1
		},
		re: {},
		prere: {}
	};

	var controller = UIVersionManager.getUIController(publicName, versionInfo);

	/**
	 * Proxy for isGroupMember
	 */
	controller.isGroupMember = function isGroupMember(name) {
		var ui = controller.getUI();
		return ui && ui.isGroupMember && ui.isGroupMember(name);
	};

	return controller;
});
