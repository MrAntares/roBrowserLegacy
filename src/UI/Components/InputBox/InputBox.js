/**
 * UI/Components/InputBox/InputBox.js
 *
 * NPC input GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import Renderer from 'Renderer/Renderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import DB from 'DB/DBManager.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './InputBox.html?raw';
import cssText from './InputBox.css?raw';

/**
 * Create NpcBox component
 */
const InputBox = new UIComponent('InputBox', htmlText, cssText);

/**
 * Initialize GUI
 */
InputBox.init = function Init() {
	this.draggable();
	this.ui.css({ top: (Renderer.height - 120) / 1.5 - 49, left: (Renderer.width - 280) / 2 + 1 });
	this.ui.find('button').click(validate.bind(this));
	this.ui.find('input').mousedown(function (event) {
		event.stopImmediatePropagation();
	});

	this.overlay = jQuery('<div/>')
		.addClass('win_popup_overlay')
		.css('zIndex', 30)
		.click(
			function () {
				this.remove();
			}.bind(this)
		);
};

/**
 * Input Post-Render callback
 * Should append data, focus, select text, etc...
 */
InputBox.onAppend = function OnAppend() {
	const input = this.ui.find('input');
	if (input.length) {
		input.focus();
		if (input.val()) {
			input.select();
		}
	}
};

/**
 * Remove data from UI
 */
InputBox.onRemove = function OnRemove() {
	this.ui.find('input').val('');
	this.ui.find('.text').text('');
	this.ui.find('input').keydown(null);
	this.overlay.detach();
};

/**
 * Key Listener
 *
 * @param {object} event
 * @return {boolean}
 */
InputBox.onKeyDown = function OnKeyDown(event) {
	if (!this.isPersistent && event.which === KEYS.ENTER) {
		validate.call(this);
		event.stopImmediatePropagation();
		return false;
	}

	return true;
};

/**
 * Validate input
 *
 * @param {ClickEvent}
 */
function validate() {
	let text = this.ui.find('input').val();

	if (!this.isPersistent || text.length) {
		if (this.ui.hasClass('number')) {
			text = parseInt(text, 10) | 0;
		}

		this.onSubmitRequest(text);
	}
}

/**
 * Set input type
 *
 * @param {string} input type (number or text)
 * @param {boolean} is the popup persistent ? false : clicking in any part of the game will remove the input
 * @param {string|number} default value to show in the input
 */
InputBox.setType = function setType(type, isPersistent, defaultVal, itemId = null) {
	this.isPersistent = !!isPersistent;

	if (!this.isPersistent) {
		this.overlay.appendTo('body');
	}

	switch (type) {
		case 'number':
			this.ui.addClass('number');
			this.ui.find('.text').text(DB.getMessage(1259));
			this.ui.find('input').attr('type', 'text');
			defaultVal = defaultVal || 0;
			break;

		case 'price':
			this.ui.addClass('number');
			this.ui.find('.text').text('Input Price');
			this.ui.find('input').attr('type', 'text');
			defaultVal = defaultVal || 0;
			break;

		case 'text':
			this.ui.removeClass('number');
			this.ui.find('.text').text('');
			this.ui.find('input').attr('type', 'text');
			break;

		case 'shopname':
			this.ui.removeClass('number');
			this.ui.find('.text').text('Input your Shop Name');
			this.ui.find('input').attr('type', 'text');
			break;

		case 'pass':
			this.ui.removeClass('number');
			this.ui.find('.text').text('');
			this.ui.find('input').attr('type', 'password');
			break;

		case 'mail':
			this.ui.removeClass('number');
			this.ui.find('.text').text(DB.getMessage(300));
			this.ui.find('input').attr('type', 'password');
			break;

		case 'birthdate':
			this.ui.removeClass('number');
			this.ui.find('.text').text(DB.getMessage(1815));
			this.ui.find('input').attr('type', 'text');
			break;

		case 'item':
			this.ui.addClass('number');
			this.ui.find('.text').text(DB.getItemInfo(itemId).identifiedDisplayName);
			this.ui.find('input').attr('type', 'text');
			defaultVal = defaultVal || 0;
			break;
	}

	if (typeof defaultVal !== 'undefined') {
		this.ui.find('input').val(defaultVal).select();
	}
};

/**
 * Callback to define
 */
InputBox.onSubmitRequest = function OnSubmitRequest() {};

/**
 * Stored component and return it
 */
export default UIManager.addComponent(InputBox);
