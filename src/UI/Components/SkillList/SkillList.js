/**
 * UI/Components/SkillList/SkillList.js
 *
 * SkillWindow
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';

	var publicName = 'SkillList';

	var SkillList = require('./SkillList/SkillList');
	var SkillListV0 = require('./SkillListV0/SkillListV0');

	var UIVersionManager = require('UI/UIVersionManager');
	var KEYS = require('Controls/KeyEventHandler');

	var versionInfo = {
		default: SkillListV0,
		common: {
			20090601:	SkillList
		},
		re: {

		},
		prere:{

		}
	};

	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	var _selectUIVersion = Controller.selectUIVersion;

	// Extend default UI selector
	Controller.selectUIVersion = function () {
		_selectUIVersion();

		var component = Controller.getUI();

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e) {
			if ((e.which === KEYS.ESCAPE || e.key === "Escape") && component.ui.is(':visible')) {
				if (typeof component.toggle === 'function') component.toggle();
			}
		}
	};

	return Controller;
});
