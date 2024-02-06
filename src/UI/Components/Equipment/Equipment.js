/**
 * UI/Components/Equipment/Equipment.js
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

	var publicName = 'Equipment';

	var EquipmentV0 = require('./EquipmentV0/Equipment'); // equip
	var EquipmentV1 = require('./EquipmentV1/Equipment'); // equip + costume
	var EquipmentV2 = require('./EquipmentV2/Equipment'); // equip + costume + title (not implemented)

	var UIVersionManager = require('UI/UIVersionManager');

	var versionInfo = {
		default: EquipmentV0,
		common: {
			20150225:	EquipmentV2,
			20101124:	EquipmentV1,
		},
		re: {

		},
		prere:{

		}
	};

	var EquipmentController = UIVersionManager.getUIController(publicName, versionInfo);

	return EquipmentController;
});
