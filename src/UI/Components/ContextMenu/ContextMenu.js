/**
 * UI/Components/ContextMenu/ContextMenu.js
 *
 * Manage ContextMenu (right click on a target)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import jQuery from 'Utils/jquery.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import cssText from './ContextMenu.css?raw';

/**
 * Create Component
 */
const ContextMenu = new UIComponent('ContextMenu', '<div id="ContextMenu"><div class="menu"/></div>', cssText);

/**
 * Initialize event handler
 */
ContextMenu.init = function init() {
	this.ui.mousedown(function () {
		ContextMenu.remove();
	});

	this.ui.find('.menu').on('mousedown', 'div', function (event) {
		event.stopImmediatePropagation();
		return false;
	});
};

/**
 * Initialize UI
 */
ContextMenu.onAppend = function onAppend() {
	const menu = this.ui.find('.menu');
	const width = menu.width();
	const height = menu.height();
	let x = Mouse.screen.x;
	let y = Mouse.screen.y;

	if (Mouse.screen.x + width > Renderer.width) {
		x = Mouse.screen.x - width;
	}

	if (Mouse.screen.y + height > Renderer.height) {
		y = Mouse.screen.y - height;
	}

	menu.css({ top: y, left: x });
};

/**
 * Clean UP UI
 */
ContextMenu.onRemove = function onRemove() {
	this.ui.find('.menu').empty();
};

/**
 * Add a clickable node to the context menu
 *
 * @param {string} text
 * @param {function} callback once clicked
 */
ContextMenu.addElement = function addElement(text, callback) {
	this.ui.find('.menu').append(
		jQuery('<div/>')
			.text(text)
			.click(function () {
				ContextMenu.remove();
				callback();
			})
	);
};

/**
 * Add a delimiter to the links
 */
ContextMenu.nextGroup = function nextGroup() {
	this.ui.find('.menu').append('<hr/>');
};

// Prepare the context menu to avoid problem
ContextMenu.prepare();

/**
 * Create component and export it
 */
export default UIManager.addComponent(ContextMenu);
