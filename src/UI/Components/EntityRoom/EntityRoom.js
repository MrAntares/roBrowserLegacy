/**
 * UI/Components/EntityRoom/EntityRoom.js
 *
 * Entity room (chat room, shop room, ...)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './EntityRoom.html?raw';
import cssText from './EntityRoom.css?raw';

/**
 * Createcomponent
 */
const EntityRoom = new UIComponent('EntityRoom', htmlText, cssText);

/**
 * @var {boolean} do not focus this UI
 */
EntityRoom.needFocus = false;

/**
 * Once in HTML, focus the input
 */
EntityRoom.onAppend = function onAppend() {
	this.ui.find('button').dblclick(
		function () {
			if (this.onEnter) {
				this.onEnter();
			}
		}.bind(this)
	);

	// Avoid player to move to the cell
	this.ui.mousedown(function () {
		return false;
	});

	this.ui.css('zIndex', 45);
};

/**
 * Remove data from UI
 */
EntityRoom.onRemove = function onRemove() {
	this.ui.find('button').unbind();
};

/**
 * Define title and icons
 *
 * @param {string} title
 * @param {string} url - icon url
 */
EntityRoom.setTitle = function setTitle(title, url) {
	this.ui.find('button img').attr('src', url);
	this.ui.find('.title, .overlay').text(title);
};

/**
 * function to define
 */
EntityRoom.onEnter = function onEnter() {};

/**
 * Stored component and return it
 */
export default UIManager.addComponent(EntityRoom);
