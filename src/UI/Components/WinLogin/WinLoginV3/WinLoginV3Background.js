import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './WinLoginV3Background.html?raw';
import cssText from './WinLoginV3Background.css?raw';

const WinLoginV3Background = new UIComponent('WinLoginV3Background', htmlText, cssText);

WinLoginV3Background.init = function init() {};

WinLoginV3Background.onAppend = function onAppend() {
	this.ui.off('click mousedown mouseup');
};

export default UIManager.addComponent(WinLoginV3Background);
