/**
 * UI/Components/Inventory/Inventory.js
 *
 * Character Inventory Window
 *
 * Note: For different versions, please use different Object names and main div IDs to avoid conflicts in settings and styles
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';

	var publicName = 'Inventory';

	var InventoryV0 = require('./InventoryV0/InventoryV0');
	//var InventoryV1 = require('./InventoryV1/InventoryV1');	// Favorite Tab
	//var InventoryV2 = require('./InventoryV2/InventoryV2');     // Equipment Switch
	//var InventoryV3 = require('./InventoryV3/InventoryV3');   // Inventory Expansion

	var UIVersionManager = require('UI/UIVersionManager');
	var DB               = require('DB/DBManager');

	var versionInfo = {
		default: InventoryV0,
		common: {
			//20181219:	InventoryV3,    // Inventory Expansion
			//20170621:	InventoryV2,    // Equipment Switch
			//20111207:	InventoryV1,    // Favorite Tab
		},
		re: {

		},
		prere:{

		}
	};

	var InventoryController = UIVersionManager.getUIController(publicName, versionInfo);
	
	var _selectUIVersion = InventoryController.selectUIVersion;
	
	// Extend default UI selector
	InventoryController.selectUIVersion = function(){
		
		_selectUIVersion();
		
		//Add selected UI to item owner name update queue
		DB.UpdateOwnerName.Inventory = InventoryController.getUI().onUpdateOwnerName;
	};

	return InventoryController;
});
