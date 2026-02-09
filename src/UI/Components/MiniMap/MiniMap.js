/**
 * UI/Components/MiniMap/MiniMap.js
 *
 * MiniMap windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require) {
	'use strict';

	var publicName = 'MiniMap';

	var MiniMap = require('./MiniMap/MiniMap');
	var MiniMapV2 = require('./MiniMapV2/MiniMapV2');

	var UIVersionManager = require('UI/UIVersionManager');

	var versionInfo = {
		default: MiniMap,
		common: {
			20180124: MiniMapV2
		},
		re: {},
		prere: {}
	};

	var Controller = UIVersionManager.getUIController(publicName, versionInfo);

	return Controller;
});
