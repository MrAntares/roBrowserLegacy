/**
 * UI/Components/JoystickUI/JoystickUI.js
 *
 * Joystick window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import JoystickModule from './JoystickModule.js';
import JoystickSelectionUI from './JoystickSelectionUI.js';
import htmlText from './JoystickUI.html?raw';
import cssText from './JoystickUI.css?raw';
import JoystickUIRenderer from './JoystickUIRenderer.js';

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
