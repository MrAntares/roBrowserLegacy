/**
 * UI/Components/WinStats/WinStats.js
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

	var publicName = 'WinStats';

	var WinStats = require('./WinStats/WinStats');
	var WinStatsV1 = require('./WinStatsV1/WinStatsV1');
	var WinStatsV2 = require('./WinStatsV2/WinStatsV2');
	var WinStatsV3 = require('./WinStatsV3/WinStatsV3');

	var UIVersionManager = require('UI/UIVersionManager');
	var KEYS = require('Controls/KeyEventHandler');

	var versionInfo = {
		default: WinStats,
		common: {
			20200520:	WinStatsV3,
			20140521:	WinStatsV2,
			20090617:	WinStatsV1,
		},
		re: {

		},
		prere:{
			20211103:	WinStatsV2,
		}
	};

	var WinStatsController = UIVersionManager.getUIController(publicName, versionInfo);
	var _selectUIVersion = WinStatsController.selectUIVersion;

	// Extend default UI selector
	WinStatsController.selectUIVersion = function () {
		_selectUIVersion();

		var component = WinStatsController.getUI();

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e) {
			if ((e.which === KEYS.ESCAPE || e.key === "Escape") && component.ui.is(':visible')) {
				if (typeof component.toggle === 'function') component.toggle();
			}
		}
	};

	return WinStatsController;
});
