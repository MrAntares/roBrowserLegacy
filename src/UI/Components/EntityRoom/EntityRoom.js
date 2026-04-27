/**
 * UI/Components/EntityRoom/EntityRoom.js
 *
 * Entity room (chat room, shop room, ...)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault, AoShinHo
 */

import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './EntityRoom.html?raw';
import cssText from './EntityRoom.css?raw';

/**
 * Create component
 */
const EntityRoom = new GUIComponent('EntityRoom', cssText);

/**
 * Render HTML
 */
EntityRoom.render = () => htmlText;

/**
 * @var {boolean} do not focus this UI
 */
EntityRoom.needFocus = false;

/**
 * Initialize events
 */
EntityRoom.init = function init() {};

/**
 * Once in HTML
 */
EntityRoom.onAppend = function onAppend() {
	// event listeners registered here because src/Renderer/Entity/EntityRoom.js:99 overrides init (this.node = EntityRoom.clone('EntityRoom', true); this.node.init = init;)
	const root = this._shadow || this._host;
	const btn = root.querySelector('button');

	// Save reference for cleanup on onRemove
	this._dblclickHandler = () => {
		if (this.onEnter) {
			this.onEnter();
		}
	};

	if (btn) {
		btn.addEventListener('dblclick', this._dblclickHandler);
		btn.addEventListener('mousedown', e => {
			e.stopImmediatePropagation();
			e.preventDefault();
		});
	}

	this._host.style.zIndex = '45';
};

/**
 * Remove data from UI
 */
EntityRoom.onRemove = function onRemove() {
	const root = this._shadow || this._host;
	const btn = root.querySelector('button');

	// Remove the handler to avoid stacking when re-append
	if (btn && this._dblclickHandler) {
		btn.removeEventListener('dblclick', this._dblclickHandler);
		this._dblclickHandler = null;
	}
};

/**
 * Define title and icons
 *
 * @param {string} title
 * @param {string} url - icon url
 */
EntityRoom.setTitle = function setTitle(title, url) {
	const root = this._shadow || this._host;
	root.querySelector('button img').src = url;
	root.querySelectorAll('.title, .overlay').forEach(el => {
		el.textContent = title;
	});
};

/**
 * function to be hooked
 */
EntityRoom.onEnter = function onEnter() {};

EntityRoom.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Stored component and return it
 */
export default UIManager.addComponent(EntityRoom);
