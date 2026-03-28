/**
 * UI/Components/SkillList/SkillList.js
 *
 * SkillWindow
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import SkillList from './SkillList/SkillList';
import SkillListV0 from './SkillListV0/SkillListV0';
import UIVersionManager from 'UI/UIVersionManager';
import KEYS from 'Controls/KeyEventHandler';

const publicName = 'SkillList';
	const versionInfo = {
		default: SkillListV0,
		common: {
			20090601: SkillList
		},
		re: {},
		prere: {}
	};

	const Controller = UIVersionManager.getUIController(publicName, versionInfo);
	const _selectUIVersion = Controller.selectUIVersion;

	// Extend default UI selector
	Controller.selectUIVersion = function () {
		_selectUIVersion();

		const component = Controller.getUI();

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