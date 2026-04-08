/**
 * UI/Components/WinPopup/Winpopup.js
 *
 * Popup windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './WinPopup.html?raw';
import cssText from './WinPopup.css?raw';

/**
 * Create Component
 */
const WinPopup = new UIComponent('WinPopup', htmlText, cssText);

/**
 * Initialize popup
 */
WinPopup.init = function init() {
	Object.assign(this.ui[0].style, {
		top: `${(Renderer.height - 120) / 1.5 - 120}px`,
		left: `${(Renderer.width - 280) / 2.0}px`,
		zIndex: '100'
	});
};

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(WinPopup);
