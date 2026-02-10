/**
 * UI/Components/Quest/Quest.js
 *
 * Quest Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require) {
	'use strict';

	var publicName = 'Quest';

	var Quest = require('./Quest/Quest');
	var QuestV1 = require('./QuestV1/QuestV1');

	var UIVersionManager = require('UI/UIVersionManager');
	var KEYS = require('Controls/KeyEventHandler');

	var versionInfo = {
		default: QuestV1,
		common: {
			20180307: Quest
		},
		re: {},
		prere: {}
	};

	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	var _selectUIVersion = Controller.selectUIVersion;

	// Extend default UI selector
	Controller.selectUIVersion = function () {
		_selectUIVersion();

		var component = Controller.getUI();

		// Escape to close the UI
		component.onKeyDown = function onKeyDown(e) {
			if ((e.which === KEYS.ESCAPE || e.key === 'Escape') && component.ui.is(':visible')) {
				if (typeof component.toggle === 'function') {
					component.toggle();
				}
			}
		};
	};

	return Controller;
});
