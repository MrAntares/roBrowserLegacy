/**
 * UI/Components/WinLoginV2/WinLoginV2Background.js
 *
 * WinLoginV2Background windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

'use strict';

/**
 * Dependencies
 */
import UIManager from 'UI/UIManager';
import UIComponent from 'UI/UIComponent';
import htmlText from './WinLoginV2Background.html?raw';
import cssText from './WinLoginV2Background.css?raw';

/**
 * Create WinLogin namespace
 */
var WinLoginV2Background = new UIComponent('WinLoginV2Background', htmlText, cssText);

/**
 * Initialize win_login UI - Inherit from UIComponent
 */
WinLoginV2Background.init = function init() {};

/**
 * Once the component is on html - InHerit from UIComponent
 */
WinLoginV2Background.onAppend = function onAppend() {
	this.ui.off('click mousedown mouseup');
};

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(WinLoginV2Background);

