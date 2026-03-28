/**
 * UI/Components/MakeArrowSelection/MakeArrowSelection.js
 *
 * MakeArrowSelection windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './MakeArrowSelection.html?raw';
import cssText from './MakeArrowSelection.css?raw';

/**
 * Create MakeArrowSelection namespace
 */
const MakeArrowSelection = new UIComponent('MakeArrowSelection', htmlText, cssText);

/**
 * Initialize UI
 */
MakeArrowSelection.init = function init() {
	// Show at center.
	this.ui.css({
		top: (Renderer.height - 200) / 2,
		left: (Renderer.width - 200) / 2
	});

	this.list = this.ui.find('.list:first');
	this.index = 0;

	this.draggable(this.ui.find('.head'));

	// Click Events
	this.ui.find('.ok').click(this.selectIndex.bind(this));
	this.ui.find('.cancel').click(
		function () {
			this.index = -1;
			this.selectIndex();
		}.bind(this)
	);

	// Bind events
	this.ui.on('dblclick', '.item', this.selectIndex.bind(this)).on('mousedown', '.item', function () {
		MakeArrowSelection.setIndex(Math.floor(this.getAttribute('data-index')));
	});
};

/**
 * Add elements to the list
 *
 * @param {Array} list object to display
 */
MakeArrowSelection.setList = function setList(list) {
	let i, count;
	let item, it, file, name;

	MakeArrowSelection.list.empty();

	for (i = 0, count = list.length; i < count; ++i) {
		item = list[i];
		it = DB.getItemInfo(item.index);
		file = it.identifiedResourceName;
		name = it.identifiedDisplayName;

		addElement(DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i].index, name);
	}

	this.setIndex(list[0].index);
};

/**
 * Add an element to the list
 *
 * @param {string} image url
 * @param {index} index in list
 * @param {string} element name
 */
function addElement(url, index, name) {
	MakeArrowSelection.list.append(
		'<div class="item" data-index="' +
			index +
			'">' +
			'<div class="icon"></div>' +
			'<span class="name">' +
			jQuery.escape(name) +
			'</span>' +
			'</div>'
	);

	Client.loadFile(url, function (data) {
		MakeArrowSelection.list.find('div[data-index=' + index + '] .icon').css('backgroundImage', 'url(' + data + ')');
	});
}

/**
 * Change selection
 *
 * @param {number} id in list
 */
MakeArrowSelection.setIndex = function setIndex(id) {
	this.list.find('div[data-index=' + this.index + ']').css('backgroundColor', 'transparent');
	this.list.find('div[data-index=' + id + ']').css('backgroundColor', '#cde0ff');
	this.index = id;
};

/**
 * Select a server, callback
 */
MakeArrowSelection.selectIndex = function selectIndex() {
	this.onIndexSelected(this.index);
	this.remove();
};

/**
 * Free variables once removed from HTML
 */
MakeArrowSelection.onRemove = function onRemove() {
	this.index = 0;
};

/**
 * Set new window name
 *
 * @param {string} title
 */
MakeArrowSelection.setTitle = function setTitle(title) {
	this.ui.find('.head .text').text(title);
};

/**
 * Functions to define
 */
MakeArrowSelection.onIndexSelected = function onIndexSelected() {};

MakeArrowSelection.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.remove();
	}
};

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(MakeArrowSelection);
