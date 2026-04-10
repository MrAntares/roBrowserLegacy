/**
 * UI/Components/Storage/Storage.js
 *
 * Account Storage
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import htmlText from './Storage.html?raw';
import cssText from './Storage.css?raw';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';

/**
 * Create Component
 */
const Storage = new UIComponent('Storage', htmlText, cssText);

/**
 * Tab constant
 */
Storage.TAB = {
	ITEM: 0,
	KAFRA: 1,
	ARMOR: 2,
	ARMS: 3,
	AMMO: 4,
	CARD: 5,
	ETC: 6
};

/**
 * @var {Array} inventory items
 */
const _list = [];

/**
 * @var {Preference} structure to save
 */
const _preferences = Preferences.get(
	'Storage',
	{
		x: 200,
		y: 500,
		height: 8,
		tab: Storage.TAB.ITEM
	},
	1.0
);

/**
 * Initialize UI
 */
Storage.init = function Init() {
	// Bind buttons
	this.ui.find('.tabs button').mousedown(onSwitchTab);
	this.ui.find('.footer .extend').mousedown(onResize);
	this.ui.find('.footer .close').click(this.onClosePressed.bind(this));

	// Load tabs
	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/tab_itm_ex_0' + (_preferences.tab + 1) + '.bmp',
		function (data) {
			Storage.ui.find('.tabs').css('backgroundImage', 'url("' + data + '")');
		}
	);

	// Resize, position
	resizeHeight(_preferences.height);
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	// drag, drop items
	this.ui
		.on('drop', onDrop)
		.on('dragover', stopPropagation)

		.find('.container .content')
		.on('mousewheel DOMMouseScroll', onScroll)
		.on('mouseover', '.item', onItemOver)
		.on('mouseout', '.item', onItemOut)
		.on('dragstart', '.item', onItemDragStart)
		.on('dragend', '.item', onItemDragEnd)
		.on('contextmenu', '.item', onItemInfo);

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Remove Storage from window (and so clean up items)
 */
Storage.onRemove = function onRemove() {
	this.ui.find('.container .content').empty();
	_list.length = 0;

	// Save preferences
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.height = Math.floor((this.ui.height() - (31 + 19 - 30)) / 32);
	_preferences.save();
};

/**
 * Add items to the list
 *
 * @param {Array} item list
 */
Storage.setItems = function setItems(items) {
	let i, count;

	for (i = 0, count = items.length; i < count; ++i) {
		if (this.addItemSub(items[i])) {
			_list.push(items[i]);
		}
	}
};

/**
 * Insert Item to Storage
 *
 * @param {object} Item
 */
Storage.addItem = function addItem(item) {
	const i = getItemIndexById(item.index);

	// Found, update quantity
	if (i > -1) {
		_list[i].count += item.count;
		this.ui.find('.item[data-index="' + item.index + '"] .count').text(_list[i].count);
		return;
	}

	if (this.addItemSub(item)) {
		_list.push(item);
	}
};

/**
 * Add item to Storage
 *
 * @param {object} Item
 */
Storage.addItemSub = function addItemSub(item) {
	let tab;

	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.DELAYCONSUME:
			tab = Storage.TAB.ITEM;
			break;

		case ItemType.CASH:
			tab = Storage.TAB.KAFRA;
			break;

		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETEGG:
			tab = Storage.TAB.ARMOR;
			break;

		case ItemType.WEAPON:
		case ItemType.PETARMOR:
			tab = Storage.TAB.ARMS;
			break;

		case ItemType.AMMO:
			tab = Storage.TAB.AMMO;
			break;

		case ItemType.CARD:
			tab = Storage.TAB.CARD;
			break;

		default:
		case ItemType.ETC:
			tab = Storage.TAB.ETC;
			break;
	}

	if (tab === _preferences.tab) {
		const it = DB.getItemInfo(item.ITID);

		this.ui
			.find('.container .content')
			.append(
				'<div class="item" data-index="' +
					item.index +
					'" draggable="true">' +
					'<div class="icon"></div>' +
					'<div class="amount">' +
					(item.count ? '<span class="count">' + item.count + '</span>' + ' ' : '') +
					'</div>' +
					'<span class="name">' +
					jQuery.escape(DB.getItemName(item)) +
					'</span>' +
					'</div>'
			);

		Client.loadFile(
			DB.INTERFACE_PATH +
				'item/' +
				(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
				'.bmp',
			function (data) {
				this.ui
					.find('.item[data-index="' + item.index + '"] .icon')
					.css('backgroundImage', 'url(' + data + ')');
			}.bind(this)
		);
	}

	return true;
};

/**
 * Remove item from Storage
 *
 * @param {number} index in Storage
 */
Storage.removeItem = function removeItem(index, count) {
	const i = getItemIndexById(index);

	// Not found
	if (i < 0) {
		return null;
	}

	if (_list[i].count) {
		_list[i].count -= count;

		if (_list[i].count > 0) {
			this.ui.find('.item[data-index="' + index + '"] .count').text(_list[i].count);
			return _list[i];
		}
	}

	// Remove item
	const item = _list[i];
	_list.splice(i, 1);
	this.ui.find('.item[data-index="' + index + '"]').remove();

	return item;
};

/**
 * Update or set the current amount of items in storage in ui
 */
Storage.setItemInfo = function setItemInfo(current, limit) {
	this.ui.find('.footer .current').text(current);
	this.ui.find('.footer .limit').text(limit);
};

Storage.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		if (typeof Storage.onClosePressed === 'function') {
			Storage.onClosePressed();
		}
	}
};

/**
 * Stop event propagation
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Extend Storage window size
 */
function onResize() {
	const ui = Storage.ui;
	const top = ui.position().top;
	let lastHeight = 0;

	function resizing() {
		const extraY = 31 + 19 - 30;
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		// Maximum and minimum window size
		h = Math.min(Math.max(h, 8), 17);

		if (h === lastHeight) {
			return;
		}

		resizeHeight(h);
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	jQuery(window).on('mouseup.resize', function (event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			jQuery(window).off('mouseup.resize');
		}
	});
}

/**
 * Extend Storage window size
 */
function resizeHeight(height) {
	height = Math.min(Math.max(height, 8), 17);

	Storage.ui.find('.container .content').css('height', height * 32);
	Storage.ui.css('height', 31 + 19 + height * 32);
}

/**
 * Modify tab, filter display entries
 */
function onSwitchTab() {
	const idx = jQuery(this).index();
	_preferences.tab = idx;

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_ex_0' + (idx + 1) + '.bmp', function (data) {
		Storage.ui.find('.tabs').css('backgroundImage', 'url("' + data + '")');
		requestFilter();
	});
}

/**
 * Drop from inventory to storage
 */
function onDrop(event) {
	let data;

	try {
		data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
	} catch (e) {
		// Ignore parsing error
	}

	event.stopImmediatePropagation();

	// Just support items for now ?
	if (!data || data.type !== 'item' || (data.from !== 'Inventory' && data.from !== 'CartItems')) {
		return false;
	}

	const item = data.data;

	// Have to specify how much
	if (item.count > 1) {
		InputBox.append();
		InputBox.setType('number', false, item.count);
		InputBox.onSubmitRequest = function OnSubmitRequest(count) {
			InputBox.remove();

			if (data.from === 'CartItems') {
				Storage.reqAddItemFromCart(item.index, parseInt(count, 10));
			} else {
				Storage.reqAddItem(item.index, parseInt(count, 10));
			}
		};

		return false;
	}

	if (data.from === 'CartItems') {
		Storage.reqAddItemFromCart(item.index, 1);
	} else {
		Storage.reqAddItem(item.index, 1);
	}

	return false;
}

/**
 * Change tab,
 * Update its content
 */
function requestFilter() {
	Storage.ui.find('.container .content').empty();
	let i, count;

	for (i = 0, count = _list.length; i < count; ++i) {
		Storage.addItemSub(_list[i]);
	}
}

/**
 * Get item index in list base on it's ID
 *
 * @param {number} item id
 */
function getItemIndexById(index) {
	let i, count;

	for (i = 0, count = _list.length; i < count; ++i) {
		if (_list[i].index === index) {
			return i;
		}
	}

	return -1;
}

/**
 * Update scroll by block (32px)
 */
function onScroll(event) {
	let delta;

	if (event.originalEvent.wheelDelta) {
		delta = event.originalEvent.wheelDelta / 120;
		if (window.opera) {
			delta = -delta;
		}
	} else if (event.originalEvent.detail) {
		delta = -event.originalEvent.detail;
	}

	this.scrollTop = Math.floor(this.scrollTop / 32) * 32 - delta * 32;
	return false;
}

/**
 * Mouse over item, display name and informations
 */
function onItemOver() {
	const idx = parseInt(this.getAttribute('data-index'), 10);
	const i = getItemIndexById(idx);

	// Not found
	if (i < 0) {
		return;
	}

	// Get back data
	const item = _list[i];
	const pos = jQuery(this).position();
	const overlay = Storage.ui.find('.overlay');

	// Display box
	overlay.show();
	overlay.css({ top: pos.top - 10, left: pos.left + 35 });
	overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');

	if (item.IsIdentified) {
		overlay.removeClass('grey');
	} else {
		overlay.addClass('grey');
	}
}

/**
 * Mouse mouve out of an item, hide title description
 */
function onItemOut() {
	Storage.ui.find('.overlay').hide();
}

/**
 * Start dragging an item
 */
function onItemDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const i = getItemIndexById(index);

	if (i === -1) {
		return;
	}

	// Set image to the drag drop element
	const img = new Image();
	let url = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
	url = url = url.replace(/^\"/, '').replace(/\"$/, ''); // Firefox bug
	img.decoding = 'async';
	img.src = url;

	event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
	event.originalEvent.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Storage',
				data: _list[i]
			})
		)
	);

	onItemOut();
}

/**
 * Stop the drag/drop on an item
 */
function onItemDragEnd() {
	delete window._OBJ_DRAG_;
}

/**
 * Display item description
 *
 */
function onItemInfo(event) {
	event.stopImmediatePropagation();

	const index = parseInt(this.getAttribute('data-index'), 10);
	const i = getItemIndexById(index);

	if (i === -1) {
		return false;
	}

	// If right click w/ alt (Request Transfer Item)
	if (event.altKey && event.which === 3) {
		event.stopImmediatePropagation();
		transferItemToOtherUI(_list[i]);
		return false;
	}

	// Don't add the same UI twice, remove it
	if (ItemInfo.uid === _list[i].ITID) {
		ItemInfo.remove();
	}

	// Add ui to window
	ItemInfo.append();
	ItemInfo.uid = _list[i].ITID;
	ItemInfo.setItem(_list[i]);

	return false;
}

/**
 * Alt Right Click Request Transfer
 */
function transferItemToOtherUI(item) {
	const isInventoryOpen = Inventory.getUI().ui ? Inventory.getUI().ui.is(':visible') : false;
	const isCartOpen = CartItems.ui ? CartItems.ui.is(':visible') : false;

	if (!item) {
		return false;
	}

	const count = item.count || 1;

	if (isInventoryOpen) {
		Storage.reqRemoveItem(item.index, count);
	} else if (isCartOpen) {
		Storage.reqMoveItemToCart(item.index, count);
	}

	return true;
}

/**
 * Callbacks
 */
Storage.onClosePressed = function onClosedPressed() {};
Storage.reqAddItem = function reqAddItem() {};
Storage.reqAddItemFromCart = function reqAddItemFromCart() {};
Storage.reqRemoveItem = function reqRemoveItem() {};
Storage.reqMoveItemToCart = function reqMoveItemToCart() {};

/**
 * Create component and export it
 */
export default UIManager.addComponent(Storage);
