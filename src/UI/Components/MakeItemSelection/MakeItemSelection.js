/**
 * UI/Components/MakeItemSelection/MakeItemSelection.js
 *
 * MakeItemSelection windows
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
import Inventory from 'UI/Components/Inventory/Inventory.js';
import htmlText from './MakeItemSelection.html?raw';
import cssText from './MakeItemSelection.css?raw';

/**
 * Create MakeItemSelection namespace
 */
const MakeItemSelection = new UIComponent('MakeItemSelection', htmlText, cssText);

const validMultipleMaterials = [
	1000 //star crumb
];

const validSingleMaterials = [
	997, //great nature
	996, //rough wind
	995, //mystic frozen
	994 //flame heart
];

/**
 * Initialize UI
 */
MakeItemSelection.init = function init() {
	// Show at center.
	this.ui.css({
		top: (Renderer.height - 200) / 2,
		left: (Renderer.width - 200) / 2
	});

	this.list = this.ui.find('.list:first');
	this.index = 0;
	this.mkType = 0;
	this.material = [];

	this.draggable(this.ui.find('.head'));

	// Click Events
	this.ui.find('.cancel').click(
		function () {
			this.index = -1;
			this.selectIndex();
		}.bind(this)
	);

	// Bind events
	this.ui.on('mousedown', '.item', function () {
		MakeItemSelection.setIndex(Math.floor(this.getAttribute('data-index')));
	});

	// on drop item
	this.ui.find('.materials').on('drop', onDrop).on('dragover', stopPropagation);

	this.ui.find('.item').remove();
	this.ui.find('.materials').hide();
};

/**
 * Add elements to the list
 *
 * @param {Array} list object to display
 */
MakeItemSelection.setList = function setList(list) {
	let i, count;
	let item, it, file, name, showMaterials;

	MakeItemSelection.list.empty();
	this.ui.find('.list').css('backgroundColor', '#f7f7f7');
	this.ui.find('.materials').hide();
	this.ui.find('.item').remove();

	showMaterials = true;
	this.mkType = 0;
	this.material = [];

	for (i = 0, count = list.length; i < count; ++i) {
		item = list[i];
		it = DB.getItemInfo(item.ITID);
		file = it.identifiedResourceName;
		name = it.identifiedDisplayName;

		if (it.processitemlist === '') {
			showMaterials = false;
		}

		addElement(DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i].ITID, name);
	}

	this.setIndex(list[0].ITID);

	bindSelectEvents(showMaterials);
};

/**
 * Add elements to the list
 *
 * @param {Array} list object to display
 */
MakeItemSelection.setCookingList = function setCookingList(list, mkType) {
	let i, count;
	let item, it, file, name;

	MakeItemSelection.list.empty();
	this.ui.find('.list').css('backgroundColor', '#f7f7f7');
	this.ui.find('.materials').hide();
	this.ui.find('.item').remove();

	this.mkType = mkType; // add mk type

	for (i = 0, count = list.length; i < count; ++i) {
		item = list[i];
		it = DB.getItemInfo(item);
		file = it.identifiedResourceName;
		name = it.identifiedDisplayName;

		addElement(DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i], name);
	}

	this.setIndex(list[0].ITID);

	bindSelectEvents(false);
};

/**
 * Add an element to the list
 *
 * @param {string} image url
 * @param {index} index in list
 * @param {string} element name
 */
function addElement(url, index, name) {
	MakeItemSelection.list.append(
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
		MakeItemSelection.list.find('div[data-index=' + index + '] .icon').css('backgroundImage', 'url(' + data + ')');
	});
}

/**
 * Advances to the next screen of the item creation
 *
 * @param {number} index in list
 */
MakeItemSelection.advance = function advance() {
	MakeItemSelection.list.empty();
	const it = DB.getItemInfo(this.index);
	const title = it.identifiedDisplayName + ' ' + DB.getMessage(426);
	const metal = it.processitemlist;
	MakeItemSelection.setTitle(title);

	this.ui.find('.ok').unbind('click');
	this.ui.find('.ok').click(this.selectIndex.bind(this));
	this.ui.find('.list').css('backgroundColor', '#ffffff');

	// Rune craft passa direto
	this.ui
		.find('.list')
		.append(`<pre>${it.identifiedDisplayName} - ${DB.getMessage(427)}` + '\n' + `${metal}` + '</pre>');
	this.ui.find('.materials').show();
};

/**
 * Change selection
 *
 * @param {number} id in list
 */
MakeItemSelection.setIndex = function setIndex(id) {
	id = id === 0 ? this.index : id;
	this.list.find('div[data-index=' + this.index + ']').removeClass('select');
	this.list.find('div[data-index=' + id + ']').addClass('select');
	this.index = id;
};

/**
 * Select a server, callback
 */
MakeItemSelection.selectIndex = function selectIndex() {
	this.onIndexSelected(this.index, this.material, this.mkType);
	if (this.index == -1) {
		this.material.forEach(item => Inventory.getUI().addItem(item));
	}
	this.remove();
};

/**
 * Free variables once removed from HTML
 */
MakeItemSelection.onRemove = function onRemove() {
	this.index = 0;
};

MakeItemSelection.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.remove();
	}
};

/**
 * Set new window name
 *
 * @param {string} title
 */
MakeItemSelection.setTitle = function setTitle(title) {
	this.ui.find('.head .text').text(title);
};

/**
 * Functions to define
 */
MakeItemSelection.onIndexSelected = function onIndexSelected() {};

/**
 * Insert material to creation
 *
 * @param {object} Item
 */
MakeItemSelection.addMaterial = function AddMaterial(item, from) {
	let singleMatUsed = false;
	this.material.forEach(it => {
		if (validSingleMaterials.includes(it.ITID)) {
			singleMatUsed = true;
		}
	});

	if (
		this.material.length < 3 &&
		(validMultipleMaterials.includes(item.ITID) || (validSingleMaterials.includes(item.ITID) && !singleMatUsed))
	) {
		if (this.addItemSub(item)) {
			switch (from) {
				case 'Inventory':
					Inventory.getUI().removeItem(item.index, 1);
					break;
			}
			this.material.push(item);
		}
	}
};

/**
 * Add item to inventory
 *
 * @param {object} Item
 */
MakeItemSelection.addItemSub = function AddItemSub(item) {
	const it = DB.getItemInfo(item.ITID);
	const content = this.ui.find('.materials');

	content.append(
		'<div class="item" data-index="' + item.index + '" draggable="false">' + '<div class="icon"></div>' + '</div>'
	);

	if (content.height() < content[0].scrollHeight) {
		this.ui.find('.hide').hide();
	} else {
		this.ui.find('.hide').show();
	}

	Client.loadFile(
		DB.INTERFACE_PATH +
			'item/' +
			(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
			'.bmp',
		function (data) {
			content.find('.item[data-index="' + item.index + '"] .icon').css('backgroundImage', 'url(' + data + ')');
		}
	);

	return true;
};

/**
 * Drop an item from storage to inventory
 *
 * @param {event}
 */
function onDrop(event) {
	let data;

	try {
		data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
	} catch (e) {
		// Ignore invalid JSON data
	}

	event.stopImmediatePropagation();

	// Just support items for now ?
	if (!data || data.type !== 'item' || data.from !== 'Inventory') {
		return false;
	}

	const item = data.data;
	item.count = 1;

	MakeItemSelection.addMaterial(item, data.from);
	return false;
}

/**
 * Stop event propagation
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

function bindSelectEvents(showMaterials) {
	if (showMaterials) {
		MakeItemSelection.ui.find('.ok').unbind('click');
		MakeItemSelection.ui.find('.ok').click(MakeItemSelection.advance.bind(MakeItemSelection));

		MakeItemSelection.ui.off('dblclick', '.item');
		MakeItemSelection.ui.on('dblclick', '.item', MakeItemSelection.advance.bind(MakeItemSelection));
	} else {
		MakeItemSelection.ui.find('.ok').unbind('click');
		MakeItemSelection.ui.find('.ok').click(MakeItemSelection.selectIndex.bind(MakeItemSelection));

		MakeItemSelection.ui.off('dblclick', '.item');
		MakeItemSelection.ui.on('dblclick', '.item', MakeItemSelection.selectIndex.bind(MakeItemSelection));
	}
}

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(MakeItemSelection);
