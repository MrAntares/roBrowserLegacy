/**
 * UI/Components/WinLoginV2/WinLoginV2Background.js
 *
 * WinLoginV2Background windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */

	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./WinLoginV2Background.html');
	var cssText = require('text!./WinLoginV2Background.css');

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
	return UIManager.addComponent(WinLoginV2Background);
});
