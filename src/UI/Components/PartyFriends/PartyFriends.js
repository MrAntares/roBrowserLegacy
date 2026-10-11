/**
 * UI/Components/PartyFriends/PartyFriends.js
 *
 * Manage interface for parties and friends - Version Router
 *
 */

import PartyFriendsV0 from './PartyFriendsV0/PartyFriendsV0.js';
import PartyFriendsV1 from './PartyFriendsV1/PartyFriendsV1.js';

import UIVersionManager from 'UI/UIVersionManager.js';

const publicName = 'PartyFriends';

const versionInfo = {
	default: PartyFriendsV0,
	common: {
		20170524: PartyFriendsV1
	},
	re: {},
	prere: {}
};

// The Proxy in UIVersionManager.getUIController transparently delegates
// isGroupMember, onOpenChat1to1 and toggle to the active UI version.
const controller = UIVersionManager.getUIController(publicName, versionInfo);

export default controller;
