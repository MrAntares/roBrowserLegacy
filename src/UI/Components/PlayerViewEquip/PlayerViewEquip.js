/**
 * UI/Components/PlayerViewEquip/PlayerViewEquip.js
 *
 * Show a player equip when allowed
 *
 * Note: For different versions, please use different Object names and main div IDs to avoid conflicts in settings and styles
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import PlayerViewEquipV0 from './PlayerViewEquipV0/PlayerViewEquipV0'; // equip
import PlayerViewEquipV1 from './PlayerViewEquipV1/PlayerViewEquipV1'; // equip + costume (headgears + robe)
import PlayerViewEquipV2 from './PlayerViewEquipV2/PlayerViewEquipV2'; // equip + costume (full)

import UIVersionManager from 'UI/UIVersionManager';
import DB from 'DB/DBManager';
import KEYS from 'Controls/KeyEventHandler';

const publicName = 'PlayerViewEquip';

const versionInfo = {
	default: PlayerViewEquipV0,
	common: {
		20150225: PlayerViewEquipV2,
		20101124: PlayerViewEquipV1
	},
	re: {},
	prere: {}
};

const PlayerViewEquipController = UIVersionManager.getUIController(publicName, versionInfo);

const _selectUIVersion = PlayerViewEquipController.selectUIVersion;

// Extend default UI selector
PlayerViewEquipController.selectUIVersion = function () {
	_selectUIVersion();

	//Add selected UI to item owner name update queue
	const component = PlayerViewEquipController.getUI();
	DB.UpdateOwnerName.PlayerViewEquip = component.onUpdateOwnerName;

	// Escape to close the UI
	component.onKeyDown = function onKeyDown(e) {
		if ((e.which === KEYS.ESCAPE || e.key === 'Escape') && component.ui.is(':visible')) {
			if (typeof component.remove === 'function') {
				component.remove();
			}
		}
	};
};

export default PlayerViewEquipController;
