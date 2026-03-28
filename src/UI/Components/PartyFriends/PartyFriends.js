/**
 * UI/Components/PartyFriends/PartyFriends.js
 *
 * Manage interface for parties and friends - Version Router
 *
 */
'use strict';

import PartyFriendsV0 from './PartyFriendsV0/PartyFriendsV0';
import PartyFriendsV1 from './PartyFriendsV1/PartyFriendsV1';

import UIVersionManager from 'UI/UIVersionManager';

var publicName = 'PartyFriends';

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

	/**
	 * Proxy for onOpenChat1to1
	 */
	controller.onOpenChat1to1 = function onOpenChat1to1(name) {
		var ui = controller.getUI();
		if (ui && ui.onOpenChat1to1) {
			ui.onOpenChat1to1(name);
		}
	};

	/**
	 * Proxy for toggle
	 */
	controller.toggle = function toggle() {
		var ui = controller.getUI();
		if (ui && ui.toggle) ui.toggle();
	};

export default controller;
