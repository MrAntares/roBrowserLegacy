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
'use strict';

import WinStats from './WinStats/WinStats';
import WinStatsV1 from './WinStatsV1/WinStatsV1';
import WinStatsV2 from './WinStatsV2/WinStatsV2';
import WinStatsV3 from './WinStatsV3/WinStatsV3';
import UIVersionManager from 'UI/UIVersionManager';
import KEYS from 'Controls/KeyEventHandler';

let publicName = 'WinStats';
	let versionInfo = {
		default: WinStats,
		common: {
			20200520: WinStatsV3,
			20140521: WinStatsV2,
			20090617: WinStatsV1
		},
		re: {},
		prere: {}
	};

	let WinStatsController = UIVersionManager.getUIController(publicName, versionInfo);
	let _selectUIVersion = WinStatsController.selectUIVersion;

	// Extend default UI selector
	WinStatsController.selectUIVersion = function () {
		_selectUIVersion();

		let component = WinStatsController.getUI();

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e) {
			if ((e.which === KEYS.ESCAPE || e.key === 'Escape') && component.ui.is(':visible')) {
				if (typeof component.toggle === 'function') {
					component.toggle();
				}
			}
		};
	};
export default WinStatsController;