/**
 * UI/Components/Escape/Escape.js
 *
 * Game Escape window, manage options
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import SoundOption from 'UI/Components/SoundOption/SoundOption.js';
import GraphicsOption from 'UI/Components/GraphicsOption/GraphicsOption.js';
import ShortCutOption from 'UI/Components/ShortCutOption/ShortCutOption.js';
import htmlText from './Escape.html?raw';
import cssText from './Escape.css?raw';

/**
 * Create Escape window component
 */
const Escape = new UIComponent('Escape', htmlText, cssText);

/**
 * Initialize UI
 */
Escape.init = function init() {
	this.ui.css({
		top: (Renderer.height - this.ui.height()) * 0.75,
		left: (Renderer.width - this.ui.width()) * 0.5
	});
	this.draggable();

	this.ui.find('.node').mousedown(function (event) {
		event.stopImmediatePropagation();
		return false;
	});

	// Only used in specific case
	this.ui.find('button').show();
	this.ui.find('.resurection, .savepoint').hide();

	this.ui.find('.sound').click(onToggleSoundUI);
	this.ui.find('.graphics').click(onToggleGraphicUI);
	this.ui.find('.resurection').click(function () {
		Escape.onResurectionRequest();
	});
	this.ui.find('.savepoint').click(function () {
		Escape.onReturnSavePointRequest();
	});
	this.ui.find('.charselect').click(function () {
		Escape.onCharSelectionRequest();
	});
	this.ui.find('.hotkey').click(onToggleShortcutUI);
	this.ui.find('.exit').click(function () {
		Escape.onExitRequest();
	});
	this.ui.find('.cancel').click(function () {
		Escape.ui.hide();
	});
};

/**
 * Window must not be visible once append
 * but need to be here to manage key event
 */
Escape.onAppend = function onAppend() {
	this.ui.hide();
};

/**
 * Reset buttons once UI is removed
 */
Escape.onRemove = function onRemove() {
	this.ui.hide();
	this.ui.find('.resurection, .savepoint').hide();
	this.ui.find('.graphics, .sound, .hotkey').show();
};

/**
 * Key Listener
 *
 * @param {object} event
 * @return {boolean}
 */
Escape.onKeyDown = function onKeyDown(event) {
	if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
		}
	}
};

/**
 * Click on Sound button, toggle the UI
 */
function onToggleSoundUI() {
	if (!SoundOption.ui || !SoundOption.ui[0].parentNode) {
		SoundOption.append();
	} else {
		SoundOption.remove();
	}
}

/**
 * Click on Graphic button, toggle the UI
 */
function onToggleGraphicUI() {
	if (!GraphicsOption.ui || !GraphicsOption.ui[0].parentNode) {
		GraphicsOption.append();
	} else {
		GraphicsOption.remove();
	}
}

/**
 * Click on Shortcut button, toggle the UI
 */
function onToggleShortcutUI() {
	if (!ShortCutOption.ui || !ShortCutOption.ui[0].parentNode) {
		ShortCutOption.append();
	} else {
		ShortCutOption.remove();
	}
}

/**
 * @var {function} callback when player want to resuret using Token of Siegfried
 */
Escape.onResurectionRequest = function onResurectionRequest() {};

/**
 * @var {function} callback to define to disconnect from game
 */
Escape.onExitRequest = function onExitRequest() {};

/**
 * @var {function} callback when player want to resurect using Token of Siegfried
 */
Escape.onReturnSavePointRequest = function onReturnSavePointRequest() {};

/**
 * @var {function} callback when player want to return to char selection
 */
Escape.onCharSelectionRequest = function onCharSelectionRequest() {};

/**
 * Create component and export it
 */
export default UIManager.addComponent(Escape);
