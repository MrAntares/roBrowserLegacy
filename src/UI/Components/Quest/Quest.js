/**
 * UI/Components/Quest/Quest.js
 *
 * Quest Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import Quest from './Quest/Quest';
import QuestV1 from './QuestV1/QuestV1';
import UIVersionManager from 'UI/UIVersionManager';
import KEYS from 'Controls/KeyEventHandler';

let publicName = 'Quest';
	let versionInfo = {
		default: QuestV1,
		common: {
			20180307: Quest
		},
		re: {},
		prere: {}
	};

	let Controller = UIVersionManager.getUIController(publicName, versionInfo);
	let _selectUIVersion = Controller.selectUIVersion;

	// Extend default UI selector
	Controller.selectUIVersion = function () {
		_selectUIVersion();

		let component = Controller.getUI();

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e) {
			if ((e.which === KEYS.ESCAPE || e.key === 'Escape') && component.ui.is(':visible')) {
				if (typeof component.toggle === 'function') {
					component.toggle();
				}
			}
		};
	};
export default Controller;