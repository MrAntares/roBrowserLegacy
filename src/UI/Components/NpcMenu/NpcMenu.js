/**
 * UI/Components/NpcMenu/NpcMenu.js
 *
 * Display npc menu
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './NpcMenu.html?raw';
import cssText from './NpcMenu.css?raw';

/**
 * Create NPC Menu component
 */
const NpcMenu = new UIComponent('NpcMenu', htmlText, cssText);

/**
 * @var {number} index selected in menu
 */
let _index = 0;

/**
 * @var {number} NPC ID
 */
let _ownerID = 0;

/**
 * Initialize component
 */
NpcMenu.init = function init() {
	this.ui.find('.ok').click(validate.bind(this));
	this.ui.find('.cancel').click(cancel.bind(this));

	this.ui.css({
		top: Math.max(376, Renderer.height / 2 + 76),
		left: Math.max(Renderer.width / 3, 20)
	});

	this.draggable();

	const self = this;
	this.ui
		.find('.content')

		// Manage indexes
		.on('mousedown', 'div', function (event) {
			selectIndex.call(self, jQuery(this));
		})

		// Select index
		.on('dblclick', 'div', validate.bind(this))

		// Stop drag drop
		.mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});
};

/**
 * Clean up events
 */
NpcMenu.onRemove = function onRemove() {
	this.ui.find('.content').empty();
};

/**
 * Bind KeyDown event
 */
NpcMenu.onKeyDown = function onKeyDown(event) {
	let count, top;
	let content;
	if (!this.ui.is(':visible')) {
		return true;
	}
	switch (event.which) {
		case KEYS.SPACE: // Same as Enter
		case KEYS.ENTER:
			validate.call(this);
			break;

		case KEYS.ESCAPE:
			cancel.call(this);
			break;

		case KEYS.UP:
			count = this.ui.find('.content div').length;
			_index = Math.max(_index - 1, 0);

			this.ui.find('.content div').removeClass('selected');
			this.ui.find('.content div:eq(' + _index + ')').addClass('selected');

			content = this.ui.find('.content')[0];
			top = _index * 20;

			if (top < content.scrollTop) {
				content.scrollTop = top;
			}
			break;

		case KEYS.DOWN:
			count = this.ui.find('.content div').length;
			_index = Math.min(_index + 1, count - 1);

			this.ui.find('.content div').removeClass('selected');
			this.ui.find('.content div:eq(' + _index + ')').addClass('selected');

			content = this.ui.find('.content')[0];
			top = _index * 20;

			if (top >= content.scrollTop + 80) {
				content.scrollTop = top - 60;
			}
			break;

		default:
			return true;
	}

	event.stopImmediatePropagation();
	return false;
};

/**
 * Initialize menu
 *
 * @param {string} menu
 * @param {number} gid - npc id
 */
NpcMenu.setMenu = function SetMenu(menu, gid) {
	const content = this.ui.find('.content');
	const list = menu.split(':');
	let i, j, count;

	_ownerID = gid;
	_index = 0;

	content.empty();

	for (i = 0, j = 0, count = list.length; i < count; ++i) {
		// Don't display empty menu
		if (list[i].length) {
			jQuery('<div/>').text(list[i]).data('index', j++).appendTo(content);
		}
	}

	content.find('div:first').addClass('selected');
};

/**
 * Submit an index
 */
function validate() {
	this.onSelectMenu(_ownerID, _index + 1);
}

/**
 * Pressed cancel, client send "255" as value
 */
function cancel() {
	this.onSelectMenu(_ownerID, 255);
}

/**
 * Select an index, change background color
 */
function selectIndex($this) {
	this.ui.find('.content div').removeClass('selected');
	$this.addClass('selected');

	_index = parseInt($this.data('index'), 10);
}

/**
 * Abstract callback to define
 */
NpcMenu.onSelectMenu = function OnSelectMenu(/*gid, index*/) {};

/**
 * Create componentand export it
 */
export default UIManager.addComponent(NpcMenu);
