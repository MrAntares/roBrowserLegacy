/**
 * UI/Components/JoystickUI/JoystickUI.js
 *
 * Joystick window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
'use strict';

import UIManager from 'UI/UIManager';
import UIComponent from 'UI/UIComponent';
import JoystickModule from './JoystickModule';
import JoystickSelectionUI from './JoystickSelectionUI';
import htmlText from './JoystickUI.html?raw';
import cssText from './JoystickUI.css?raw';
import JoystickUIRenderer from './JoystickUIRenderer';

const JoystickUI = new UIComponent('JoystickUI', htmlText, cssText);

	JoystickUI.onAppend = function () {
		JoystickUIRenderer.attach(this.ui);
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
export default UIManager.addComponent(JoystickUI);