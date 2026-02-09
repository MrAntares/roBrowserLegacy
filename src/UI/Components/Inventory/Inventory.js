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

	var InventoryV0 = require('./InventoryV0/InventoryV0'); // Basic Inventory
	var InventoryV1 = require('./InventoryV1/InventoryV1'); // Favorite Tab
	var InventoryV2 = require('./InventoryV2/InventoryV2'); // Equipment Switch
	var InventoryV3 = require('./InventoryV3/InventoryV3'); // Inventory Expansion

	var UIVersionManager = require('UI/UIVersionManager');
	var DB = require('DB/DBManager');
	var KEYS = require('Controls/KeyEventHandler');

	var versionInfo = {
		default: InventoryV0, // Basic Inventory
		common: {
			20181219: InventoryV3, // Inventory Expansion
			20170208: InventoryV2, // Equipment Switch
			20111207: InventoryV1 // Favorite Tab
		},
		re: {},
		prere: {}
	};

	var InventoryController = UIVersionManager.getUIController(publicName, versionInfo);

	var _selectUIVersion = InventoryController.selectUIVersion;

	// Extend default UI selector
	InventoryController.selectUIVersion = function ()
	{
		_selectUIVersion();

		//Add selected UI to item owner name update queue
		var component = InventoryController.getUI();
		DB.UpdateOwnerName.Inventory = component.onUpdateOwnerName;

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e)
		{
			if ((e.which === KEYS.ESCAPE || e.key === 'Escape') && component.ui.is(':visible'))
			{
				if (typeof component.toggle === 'function') {component.toggle();}
			}
		};
	};

	return InventoryController;
});
