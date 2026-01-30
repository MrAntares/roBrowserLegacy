/**
 * UI/Components/JoystickUI/JoystickUI.js
 *
 * Joystick window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var JoystickModule = require('./JoystickModule');
	var JoystickSelectionUI = require('./JoystickSelectionUI');
	var htmlText = require('text!./JoystickUI.html');
	var cssText = require('text!./JoystickUI.css');

	var JoystickUI = new UIComponent('JoystickUI', htmlText, cssText);

	JoystickUI.onAppend = function () {
		require('./JoystickUIRenderer').attach(this.ui);
		this.ui.hide();
		JoystickSelectionUI.append();
	};

	JoystickUI.onRemove = function () {
		JoystickModule.dispose();
	};

	JoystickUI.onRestore = function () {
		JoystickModule.prepare();
	};

	JoystickUI.show = function () {
		this.ui.show();
	};

	JoystickUI.hide = function () {
		this.ui.hide();
	};

	return UIManager.addComponent(JoystickUI);
});
