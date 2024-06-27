/**
 * UI/Components/PlayerViewEquip/PlayerViewEquip.js
 *
 * Chararacter Basic information windows
 *
 * Note: For different versions, please use different Object names and main div IDs to avoid conflicts in settings and styles
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';

	var publicName = 'PlayerViewEquip';

	var PlayerViewEquipV0 = require('./PlayerViewEquipV0/PlayerViewEquipV0'); // equip
	var PlayerViewEquipV1 = require('./PlayerViewEquipV1/PlayerViewEquipV1'); // equip + costume
	var PlayerViewEquipV2 = require('./PlayerViewEquipV2/PlayerViewEquipV2'); // equip + costume + title (not implemented)

	var UIVersionManager = require('UI/UIVersionManager');
	var DB               = require('DB/DBManager');

	var versionInfo = {
		default: PlayerViewEquipV0,
		common: {
			20150225:	PlayerViewEquipV2,
			20101124:	PlayerViewEquipV1,
		},
		re: {

		},
		prere:{

		}
	};

	var PlayerViewEquipController = UIVersionManager.getUIController(publicName, versionInfo);
	
	var _selectUIVersion = PlayerViewEquipController.selectUIVersion;
	
	// Extend default UI selector
	PlayerViewEquipController.selectUIVersion = function(){
		
		_selectUIVersion();
		
		//Add selected UI to item owner name update queue
		DB.UpdateOwnerName.PlayerViewEquip = PlayerViewEquipController.getUI().onUpdateOwnerName;
	};

	return PlayerViewEquipController;
});
