/**
 * UI/UIManager.js
 *
 * Manage Interface
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import UIComponent from './UIComponent.js';
import UIVersionManager from './UIVersionManager.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import GameEngine from 'Engine/GameEngine.js';

/**
 * User Interface Manager
 */
const UIManager = {};

/**
 * Components cache
 * @var {array} Components List
 */
UIManager.components = {};

/**
 * Store a component in the manager
 *
 * @param {UIComponent} component object
 */
UIManager.addComponent = function addComponent(component) {
	if (!(component instanceof UIComponent)) {
		throw new Error('UIManager::addComponent() - Invalid type of component');
	}

	component.manager = this;
	this.components[component.name] = component;
	return component;
};

/**
 * Get component stored in manager
 *
 * @param {string} component name
 * @return {UIComponent} object
 */
UIManager.getComponent = function getComponent(name) {
	const versionAlias = UIVersionManager.getUIAlias(name);
	if (versionAlias) {
		name = versionAlias;
	}

	if (!(name in this.components)) {
		throw new Error('UIManager.getComponent() - Component "' + name + '" not found');
	}

	return this.components[name];
};

/**
 * Remove all components in screen
 */
UIManager.removeComponents = function removeComponents() {
	const keys = Object.keys(this.components);
	let i,
		count = keys.length;

	for (i = 0; i < count; ++i) {
		this.components[keys[i]].remove();
	}
};

/**
 * When resizing window, some components can be outside the screen size and
 * it sucks a lot. Try to correct the problem.
 *
 * @param {number} Game screen width
 * @param {number} Game screen height
 */
UIManager.fixResizeOverflow = function fixResizeOverflow(WIDTH, HEIGHT) {
	const keys = Object.keys(this.components);
	let i,
		count = keys.length;
	let ui;
	let x, y, width, height;

	for (i = 0; i < count; ++i) {
		const component = this.components[keys[i]];
		ui = component.ui;

		if (ui) {
			x = ui.offset().left;
			y = ui.offset().top;
			width = ui.width();
			height = ui.height();

			if (y + height > HEIGHT) {
				ui.css('top', HEIGHT - Math.min(height, HEIGHT));
			}

			if (x + width > WIDTH) {
				ui.css('left', WIDTH - Math.min(width, WIDTH));
			}

			//Magnet
			if (component.magnet.TOP) {
				//nothing to do
			}
			if (component.magnet.BOTTOM) {
				ui.css('top', HEIGHT - height);
			}
			if (component.magnet.LEFT) {
				//nothing to do
			}
			if (component.magnet.RIGHT) {
				ui.css('left', WIDTH - width);
			}

			// Call custom resize function if has one
			if (component.onResize) {
				component.onResize();
			}
		}
	}
};

/**
 * Display an error box component
 * Will reload the game once selected
 *
 * @param {string} error message
 */
UIManager.showErrorBox = function showErrorBox(text) {
	let WinError, overlay;

	// Create popup
	WinError = this.getComponent('WinPopup').clone('WinError');
	WinError.init = function Init() {
		this.ui.find('.text').text(text);
		this.ui.css({
			top: (Renderer.height - 120) / 1.5 - 120,
			left: (Renderer.width - 280) / 2.0,
			zIndex: 100
		});

		WinError.ui.find('.btns').append(
			jQuery('<button/>')
				.addClass('btn')
				.data('background', 'btn_ok.bmp')
				.data('hover', 'btn_ok_a.bmp')
				.data('down', 'btn_ok_b.bmp')
				.one('click', function () {
					overlay.remove();
					WinError.remove();
					GameEngine.reload();
				})
				.each(this.parseHTML)
		);
	};
	WinError.onKeyDown = function OnKeyDown(event) {
		event.stopImmediatePropagation();
		switch (event.which) {
			case KEYS.ENTER:
			case KEYS.ESCAPE:
				overlay.remove();
				this.remove();
				GameEngine.reload();
		}
	};

	// Add overlay (to block mouseover, click, etc.)
	overlay = jQuery('<div/>').addClass('win_popup_overlay');
	overlay.appendTo('body');

	// Push the event to the top, stopImmediatePropagation will block every key down event.
	WinError.onAppend = function () {
		const events = jQuery._data(window, 'events').keydown;
		events.unshift(events.pop());
	};

	WinError.append();

	return WinError;
};

/**
 * Show a message box to the user
 *
 * @param {string} message to show
 * @param {string} button name
 * @param {function} callback once the button is pressed
 */
UIManager.showMessageBox = function showMessageBox(text, btn_name, callback, keydown) {
	let WinMSG;

	// Create popup
	WinMSG = this.getComponent('WinPopup').clone('WinMSG');
	WinMSG.init = function Init() {
		this.draggable();
		this.ui.find('.text').text(text);
		this.ui.css({
			top: (Renderer.height - 120) / 1.5 - 120,
			left: (Renderer.width - 280) / 2.0,
			zIndex: 100
		});

		// Just button
		if (btn_name) {
			WinMSG.ui.find('.btns').append(
				jQuery('<button/>')
					.addClass('btn')
					.data('background', 'btn_' + btn_name + '.bmp')
					.data('hover', 'btn_' + btn_name + '_a.bmp')
					.data('down', 'btn_' + btn_name + '_b.bmp')
					.one('click', function () {
						WinMSG.remove();
						if (callback) {
							callback();
						}
					})
					.each(this.parseHTML)
			);
		}
	};

	// Just keydown
	if (keydown) {
		WinMSG.onKeyDown = function (event) {
			switch (event.which) {
				case KEYS.ENTER:
				case KEYS.ESCAPE:
					this.remove();
					if (callback) {
						callback();
					}
			}
			event.stopImmediatePropagation();
		};

		// Push the event to the top, stopImmediatePropagation will block every key down.
		WinMSG.onAppend = function () {
			const events = jQuery._data(window, 'events').keydown;
			events.unshift(events.pop());
		};
	}

	WinMSG.append();

	return WinMSG;
};

/**
 * Prompt a message to the user
 *
 * @param {string} message to show
 * @param {string} button ok
 * @param {string} button cancel
 * @param {function} callback when ok is pressed
 * @param {function} callback when cancel is pressed
 */
UIManager.showPromptBox = function showPromptBox(text, btn_yes, btn_no, onYes, onNo) {
	let WinPrompt;

	WinPrompt = this.getComponent('WinPopup').clone('WinPrompt');
	WinPrompt.init = function Init() {
		this.draggable();
		this.ui.find('.text').text(text);
		this.ui.css({
			top: (Renderer.height - 120) / 1.5 - 120,
			left: (Renderer.width - 280) / 2.0,
			zIndex: 100
		});
		this.ui.find('.btns').append(
			jQuery('<button/>')
				.addClass('btn')
				.data('background', 'btn_' + btn_yes + '.bmp')
				.data('hover', 'btn_' + btn_yes + '_a.bmp')
				.data('down', 'btn_' + btn_yes + '_b.bmp')
				.one('click', function () {
					WinPrompt.remove();
					if (onYes) {
						onYes();
					}
				})
				.each(this.parseHTML),

			jQuery('<button/>')
				.addClass('btn')
				.data('background', 'btn_' + btn_no + '.bmp')
				.data('hover', 'btn_' + btn_no + '_a.bmp')
				.data('down', 'btn_' + btn_no + '_b.bmp')
				.one('click', function () {
					WinPrompt.remove();
					if (onNo) {
						onNo();
					}
				})
				.each(this.parseHTML)
		);
	};

	WinPrompt.append();
	return WinPrompt;
};

/**
 * Export
 */
export default UIManager;
