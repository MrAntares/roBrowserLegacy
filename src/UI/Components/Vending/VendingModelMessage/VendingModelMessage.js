/**
 * UI/Components/Vending/VendingModelMessage/VendingModelMessage.js
 *
 * VendingModelMessage windows
 *
 * @author Francisco Wallison
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./VendingModelMessage.html');
	var cssText = require('text!./VendingModelMessage.css');

	/**
	 * Create VendingModelMessage namespace
	 */
	var VendingModelMessage = new UIComponent('VendingModelMessage', htmlText, cssText);

	/**
	 * Initialize UI
	 */
	VendingModelMessage.init = function init() {
		// Show at center.
		this.ui.css({
			top: (Renderer.height - 200) / 2,
			left: (Renderer.width - 200) / 2
		});

		this.ui.find('.ok').click(function (e) {
			e.stopImmediatePropagation();
			VendingModelMessage.onRemove();
		});
		this.draggable(this.ui.find('.titlebar'));
	};

	VendingModelMessage.setInit = function setInit(numMessage) {
		VendingModelMessage.append();
		VendingModelMessage.ui.show();
		let messageText = DB.getMessage(numMessage);
		VendingModelMessage.ui.find('.message').text(messageText);
	};

	VendingModelMessage.onRemove = function onRemove() {
		if (this.ui == undefined) return;

		this.ui.hide();
	};

	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(VendingModelMessage);
});
