/**
 * UI/Components/InventoryV0/InventoryV0.js
 *
 * Chararacter Inventory
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * In some cases the client will send packet twice.eg NORMAL_ITEMLIST4; fixit [skybook888]
 *
 */

import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import Storage from 'UI/Components/Storage/Storage.js';
import UIVersionManager from 'UI/UIVersionManager.js';
import htmlText from './InventoryV0.html?raw';
import cssText from './InventoryV0.css?raw';
import BasicInfo from 'UI/Components/BasicInfo/BasicInfo.js';
import Mail from 'UI/Components/Mail/Mail.js';
import WriteRodex from 'UI/Components/Rodex/WriteRodex.js';

/**
 * Create Component
 */
const InventoryV0 = new UIComponent('InventoryV0', htmlText, cssText);

/**
 * Tab constant
 */
InventoryV0.TAB = {
	USABLE: 0,
	EQUIP: 1,
	ETC: 2
};

/**
 * Store inventory items
 */
InventoryV0.list = [];

/**
 * Store new items
 */
InventoryV0.newItems = [];
InventoryV0.equippedItems = [];

/**
 * @var {number} used to remember the window height
 */
let _realSize = 0;

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'InventoryV0',
	{
		x: 0,
		y: UIVersionManager.getInventoryVersion() > 0 ? 172 : 120,
		width: 7,
		height: 2,
		show: false,
		reduce: false,
		tab: InventoryV0.TAB.USABLE,
		magnet_top: false,
		magnet_bottom: false,
		magnet_left: true,
		magnet_right: false
	},
	1.0
);

/**
 * Initialize UI
 */
InventoryV0.init = function Init() {
	// Bind buttons
	this.ui.find('.titlebar .base').mousedown(stopPropagation);
	this.ui.find('.titlebar .mini').click(onToggleReduction);
	this.ui.find('.tabs button').mousedown(onSwitchTab);
	this.ui.find('.footer .extend').mousedown(onResize);
	this.ui.find('.titlebar .close').click(function () {
		InventoryV0.ui.hide();
	});

	// on drop item
	this.ui
		.on('drop', onDrop)
		.on('dragover', stopPropagation)

		// Items event
		.find('.container .content')
		.on('mouseover', '.item', onItemOver)
		.on('mouseout', '.item', onItemOut)
		.on('dragstart', '.item', onItemDragStart)
		.on('dragend', '.item', onItemDragEnd)
		.on('contextmenu', '.item', onItemInfo)
		.on('dblclick', '.item', onItemUsed)
		.on('click', '.item', onItemClick);

	this.ui.find('.ncnt').text(0);
	this.ui.find('.mcnt').text(100);

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Apply preferences once append to body
 */
InventoryV0.onAppend = function OnAppend() {
	// Apply preferences
	if (!_preferences.show) {
		this.ui.hide();
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0' + (_preferences.tab + 1) + '.bmp', function (data) {
		InventoryV0.ui.find('.tab-sprite').css('backgroundImage', 'url("' + data + '")');
	});

	this.resize(_preferences.width, _preferences.height);

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	this.magnet.TOP = _preferences.magnet_top;
	this.magnet.BOTTOM = _preferences.magnet_bottom;
	this.magnet.LEFT = _preferences.magnet_left;
	this.magnet.RIGHT = _preferences.magnet_right;

	_realSize = _preferences.reduce ? 0 : this.ui.height();
	this.ui.find('.titlebar .mini').trigger('mousedown');
};

/**
 * Remove Inventory from window (and so clean up items)
 */
InventoryV0.onRemove = function OnRemove() {
	this.ui.find('.container .content').empty();
	this.list.length = 0;
	InventoryV0.newItems.length = 0; // Clear the new items array
	jQuery('.ItemInfo').remove();

	// Save preferences
	_preferences.show = this.ui.is(':visible');
	_preferences.reduce = !!_realSize;
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.width = Math.floor((this.ui.width() - (23 + 16 + 16 - 30)) / 32);
	_preferences.height = Math.floor((this.ui.height() - (31 + 19 - 30)) / 32);
	_preferences.magnet_top = this.magnet.TOP;
	_preferences.magnet_bottom = this.magnet.BOTTOM;
	_preferences.magnet_left = this.magnet.LEFT;
	_preferences.magnet_right = this.magnet.RIGHT;
	_preferences.save();
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
InventoryV0.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.ui.toggle();
			if (this.ui.is(':visible')) {
				this.focus();
			} else {
				// Chrome bug
				// when clicking double clicking an a weapon to equip
				// the item disapear, if you don't move the mouse and
				// triggered ALT+E then, the window disapear and you
				// can't trigger the scene anymore
				this.ui.trigger('mouseleave');
				this.clearNewItems(); // Clear new items
				this.ui.find('.new_item').css('backgroundImage', '');
			}
			break;
	}

	const changeUI = BasicInfo.getUI().ui.find('#item .btn_overlay');
	if (changeUI) {
		// Only applicable to BasicInfoV4 and BasicInfoV5
		changeUI.hide();
	}
};

/**
 * Show/Hide UI
 */
InventoryV0.toggle = function toggle() {
	this.ui.toggle();
	if (this.ui.is(':visible')) {
		this.focus();
	} else {
		this.ui.trigger('mouseleave');
		this.clearNewItems(); // Clear new items
		this.ui.find('.new_item').css('backgroundImage', '');
	}

	const changeUI = BasicInfo.getUI().ui.find('#item .btn_overlay');
	if (changeUI) {
		// Only applicable to BasicInfoV4 and BasicInfoV5
		changeUI.hide();
	}
};

/**
 * Clear newItems array
 */
InventoryV0.clearNewItems = function clearNewItems() {
	this.newItems = [];
};

/**
 * Extend inventory window size
 *
 * @param {number} width
 * @param {number} height
 */
InventoryV0.resize = function Resize(width, height) {
	width = Math.min(Math.max(width, 6), 8);
	height = Math.min(Math.max(height, 2), 5);

	this.ui.find('.container .content').css({
		width: width * 32
	});

	this.ui.css({
		width: 27 + 16 + 16 + width * 32,
		height: 31 + 4 + 27 + height * 32
	});

	this.updateScroll();
};

/**
 * Force scroll clamping
 */
InventoryV0.updateScroll = function updateScroll() {
	const host = this.ui.find('.scroll-host');
	if (host.length) {
		const node = host[0];
		const content = host.find('.content');
		let ticker = 0;

		const clamp = function () {
			const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);

			// If we have items and the last item is not reaching the bottom of the host
			// and we are scrolled down, pull the list down.
			const lastItem = content.find('.item:last');
			if (lastItem.length) {
				const itemRect = lastItem[0].getBoundingClientRect();
				const hostRect = node.getBoundingClientRect();

				// If the bottom of the list is above the bottom of the host, but we can scroll up...
				if (itemRect.bottom < hostRect.bottom && node.scrollTop > 0) {
					node.scrollTop = Math.max(0, node.scrollTop - (hostRect.bottom - itemRect.bottom));
				}
			}

			// Final safety clamp
			if (node.scrollTop > maxScroll) {
				node.scrollTop = maxScroll;
			}

			// Trigger custom scrollbar update if available
			if (node._roScrollbarRestart) {
				node._roScrollbarRestart();
			}

			if (ticker++ < 20) {
				requestAnimationFrame(clamp);
			}
		};
		clamp();
	}
};

/**
 * Get item object
 *
 * @param {number} id
 * @returns {Item}
 */
InventoryV0.getItemById = function GetItemById(id) {
	let i, count;
	const list = InventoryV0.list;

	for (i = 0, count = list.length; i < count; ++i) {
		if (list[i].ITID === id) {
			return list[i];
		}
	}

	return null;
};

/**
 * Search in a list for an item by its index
 *
 * @param {number} index
 * @returns {Item}
 */
InventoryV0.getItemByIndex = function getItemByIndex(index) {
	let i, count;
	const list = InventoryV0.list;

	for (i = 0, count = list.length; i < count; ++i) {
		if (list[i].index === index) {
			return list[i];
		}
	}

	return null;
};

/**
 * Add items to the list
 * if the item index is exist you should clear it;[skybook888]
 */
InventoryV0.setItems = function SetItems(items) {
	let i, count;

	for (i = 0, count = items.length; i < count; ++i) {
		const object = this.getItemByIndex(items[i].index);
		if (object) {
			this.removeItem(object.index, object.count);
		}
		if (this.addItemSub(items[i])) {
			this.list.push(items[i]);
			this.ui.find('.ncnt').text(this.list.length + Equipment.getUI().getNumber());
			this.onUpdateItem(items[i].ITID, items[i].count ? items[i].count : 1);
		}
	}
};

/**
 * Get the TAB constant for a given item based on its type.
 *
 * @param {object} item
 * @returns {number} TAB constant
 */
function getItemTab(item) {
	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.DELAYCONSUME:
		case ItemType.CASH:
			return InventoryV0.TAB.USABLE;

		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.PETEGG:
		case ItemType.PETARMOR:
		case ItemType.SHADOWGEAR:
			return InventoryV0.TAB.EQUIP;

		default:
		case ItemType.ETC:
		case ItemType.CARD:
		case ItemType.AMMO:
			return InventoryV0.TAB.ETC;
	}
}

/**
 * Insert Item to inventory
 *
 * @param {object} Item
 */
InventoryV0.addItem = function AddItem(item) {
	let object = this.getItemByIndex(item.index);

	// Check if the item was equipped
	const equippedIndex = InventoryV0.equippedItems.indexOf(item.index);
	if (equippedIndex !== -1) {
		InventoryV0.equippedItems.splice(equippedIndex, 1);
	} else {
		// Mark as new item
		InventoryV0.newItems.push(item.index);

		const changeUI = BasicInfo.getUI().ui.find('#item .btn_overlay');
		if (changeUI) {
			// Only applicable to BasicInfoV4 and BasicInfoV5
			changeUI.show();
		}
	}

	if (object) {
		// Handle NaN values (equips)
		if (isNaN(object.count)) {
			object.count = 1;
		}
		if (isNaN(item.count)) {
			item.count = 1;
		}
		object.count += item.count;
		this.ui.find('.item[data-index="' + item.index + '"] .count').text(object.count);
		this.onUpdateItem(object.ITID, object.count);
		// Keep item marked as new
		if (InventoryV0.newItems.indexOf(item.index) === -1) {
			InventoryV0.newItems.push(item.index);
		}
		// Show new_item indicator if on the correct tab
		if (getItemTab(item) === _preferences.tab) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/new_item.bmp', function (data) {
				InventoryV0.ui
					.find('.item[data-index="' + item.index + '"] .new_item')
					.css('backgroundImage', 'url(' + data + ')');
			});
		}
		return;
	}

	object = jQuery.extend({}, item);
	if (this.addItemSub(object)) {
		this.list.push(object);
		this.ui.find('.ncnt').text(this.list.length + Equipment.getUI().getNumber());
		this.onUpdateItem(object.ITID, object.count);
	}
};

/**
 * Check if item index is in newItems list
 *
 * @param {number} index - Item index to check
 * @returns {boolean} - True if item index is in newItems list, false otherwise
 */
InventoryV0.isNewItem = function isNewItem(index) {
	return InventoryV0.newItems.includes(index);
};

/**
 * Add item to inventory
 *
 * @param {object} Item
 */
InventoryV0.addItemSub = function AddItemSub(item) {
	const tab = getItemTab(item);

	// Equip item (if not arrow)
	if (item.WearState && item.type !== ItemType.AMMO && item.type !== ItemType.CARD) {
		Equipment.getUI().equip(item, item.WearState);
		return false;
	}

	if (tab === _preferences.tab) {
		const it = DB.getItemInfo(item.ITID);
		const content = this.ui.find('.container .content');

		content.append(
			'<div class="item" data-index="' +
				item.index +
				'" draggable="true">' +
				'<div class="new_item"></div>' +
				'<div class="icon"></div>' +
				'<div class="amount"><span class="count">' +
				(item.count || 1) +
				'</span></div>' +
				'</div>'
		);

		Client.loadFile(
			DB.INTERFACE_PATH +
				'item/' +
				(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
				'.bmp',
			function (data) {
				content
					.find('.item[data-index="' + item.index + '"] .icon')
					.css('backgroundImage', 'url(' + data + ')');
			}
		);

		if (InventoryV0.isNewItem(item.index)) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/new_item.bmp', function (data) {
				content
					.find('.item[data-index="' + item.index + '"] .new_item')
					.css('backgroundImage', 'url(' + data + ')');
			});
		} else {
			content.find('.item[data-index="' + item.index + '"] .new_item').css('backgroundImage', '');
		}
	}

	return true;
};

/**
 * Remove item from inventory
 *
 * @param {number} index in inventory
 * @param {number} count
 */
InventoryV0.removeItem = function RemoveItem(index, count) {
	const item = this.getItemByIndex(index);

	// Emulator failed to complete the operation
	// do not remove item from inventory
	if (!item || count <= 0) {
		return null;
	}

	if (item.count) {
		item.count -= count;

		if (item.count > 0) {
			this.ui.find('.item[data-index="' + item.index + '"] .count').text(item.count);
			this.onUpdateItem(item.ITID, item.count);
			return item;
		}
	}

	this.list.splice(this.list.indexOf(item), 1);
	this.ui.find('.item[data-index="' + item.index + '"]').remove();
	this.ui.find('.ncnt').text(this.list.length + Equipment.getUI().getNumber());
	this.onUpdateItem(item.ITID, 0);

	InventoryV0.ui.find('.overlay').hide();

	return item;
};

/**
 * Remove item from inventory
 *
 * @param {number} index in inventory
 * @param {number} count
 */
InventoryV0.updateItem = function UpdateItem(index, count) {
	const item = this.getItemByIndex(index);

	if (!item) {
		return;
	}

	item.count = count;

	// Update quantity
	if (item.count > 0) {
		this.ui.find('.item[data-index="' + item.index + '"] .count').text(item.count);
		this.onUpdateItem(item.ITID, item.count);
		return;
	}

	// no quantity, remove
	this.list.splice(this.list.indexOf(item), 1);
	this.ui.find('.item[data-index="' + item.index + '"]').remove();
	this.ui.find('.ncnt').text(this.list.length + Equipment.getUI().getNumber());
	this.onUpdateItem(item.ITID, 0);

	this.updateScroll();
};

/**
 * Use an item
 *
 * @param {Item} item
 */
InventoryV0.useItem = function UseItem(item) {
	switch (item.type) {
		// Usable item
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.CASH:
			InventoryV0.onUseItem(item.index);
			break;

		// Use card
		case ItemType.CARD:
			InventoryV0.onUseCard(item.index);
			break;

		case ItemType.DELAYCONSUME:
			break;

		// Equip item
		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETARMOR:
		case ItemType.AMMO:
			if (item.IsIdentified && !item.IsDamaged) {
				InventoryV0.onEquipItem(item.index, item.location);
			}
			break;
	}

	return;
};

/**
 * Stop event propagation
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Extend inventory window size
 */
function onResize() {
	const ui = InventoryV0.ui;
	const top = ui.position().top;
	const left = ui.position().left;
	let lastWidth = 0;
	let lastHeight = 0;
	let _Interval;

	function resizing() {
		const extraX = 23 + 16 + 16 - 30;
		const extraY = 31 + 19 - 30;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		// Maximum and minimum window size
		w = Math.min(Math.max(w, 6), 8);
		h = Math.min(Math.max(h, 2), 5);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		InventoryV0.resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	// Start resizing
	_Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	jQuery(window).on('mouseup.resize', function (event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			jQuery(window).off('mouseup.resize');
		}
	});
}

/**
 * Modify tab, filter display entries
 */
function onSwitchTab() {
	const idx = jQuery(this).index();
	_preferences.tab = parseInt(idx, 10);

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0' + (idx + 1) + '.bmp', function (data) {
		InventoryV0.ui.find('.tab-sprite').css('backgroundImage', 'url(' + data + ')');
		requestFilter();
	});
}

/**
 * Hide/show inventory's content
 */
function onToggleReduction() {
	const ui = InventoryV0.ui;

	if (_realSize) {
		ui.find('.panel').show();
		ui.height(_realSize);
		_realSize = 0;
	} else {
		_realSize = ui.height();
		ui.height(17);
		ui.find('.panel').hide();
	}
}

/**
 * Update tab, reset inventory content
 */
function requestFilter() {
	const host = InventoryV0.ui.find('.scroll-host');
	host.scrollTop(0);

	InventoryV0.ui.find('.container .content').empty();

	const list = InventoryV0.list;
	let i, count;

	for (i = 0, count = list.length; i < count; ++i) {
		InventoryV0.addItemSub(list[i]);
	}

	InventoryV0.updateScroll();
}

/**
 * Drop an item from storage to inventory
 *
 * @param {event}
 */
function onDrop(event) {
	let item, data;
	event.stopImmediatePropagation();

	try {
		data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		item = data.data;
	} catch (e) {
		return false;
	}

	// Just allow item from storage
	if (
		data.type !== 'item' ||
		(data.from !== 'Storage' && data.from !== 'CartItems' && data.from !== 'Mail' && data.from !== 'WriteRodex')
	) {
		return false;
	}

	// Have to specify how much
	if (item.count > 1) {
		InputBox.append();
		InputBox.setType('number', false, item.count);

		InputBox.onSubmitRequest = function OnSubmitRequest(count) {
			InputBox.remove();

			switch (data.from) {
				case 'Storage':
					Storage.reqRemoveItem(item.index, parseInt(count, 10));
					break;

				case 'CartItems':
					CartItems.reqRemoveItem(item.index, parseInt(count, 10));
					break;

				case 'Mail':
					Mail.reqRemoveItem(item.index, parseInt(count, 10));
					break;

				case 'WriteRodex':
					WriteRodex.requestRemoveItemRodex(item.index, parseInt(count, 10));
					break;
			}
		};
		return false;
	}

	switch (data.from) {
		case 'Storage':
			Storage.reqRemoveItem(item.index, 1);
			break;

		case 'CartItems':
			CartItems.reqRemoveItem(item.index, 1);
			break;

		case 'Mail':
			Mail.reqRemoveItem(item.index, 1);
			break;

		case 'WriteRodex':
			WriteRodex.requestRemoveItemRodex(item.index, 1);
			break;
	}

	return false;
}

/**
 * Show item name when mouse is over
 */
function onItemOver() {
	const idx = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(idx);

	if (!item) {
		return;
	}

	let quantity = ' ea';
	if (
		item.Options &&
		(item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) &&
		item.Options.filter(Option => Option.index !== 0).length > 0
	) {
		quantity = ' Quantity';
	}

	// Get back data
	const pos = jQuery(this).position();
	const overlay = InventoryV0.ui.find('.overlay');

	// Display box
	overlay.show();
	overlay.css({ top: pos.top, left: pos.left + 35 });
	overlay.text(DB.getItemName(item) + ': ' + (item.count || 1) + quantity);

	if (item.IsIdentified) {
		overlay.removeClass('grey');
	} else {
		overlay.addClass('grey');
	}
}

/**
 * Hide the item name
 */
function onItemOut() {
	InventoryV0.ui.find('.overlay').hide();
}

/**
 * Start dragging an item
 */
function onItemDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(index);

	if (!item) {
		return;
	}

	// Set image to the drag drop element
	const img = new Image();
	const url = this.querySelector('.icon')
		.style.backgroundImage.match(/\((.*?)\)/)[1]
		.replace(/('|")/g, '');
	img.decoding = 'async';
	img.src = url.replace(/^\"/, '').replace(/\"$/, '');

	event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
	event.originalEvent.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Inventory',
				data: item
			})
		)
	);

	onItemOut();
}

/**
 * Stop dragging an item
 *
 */
function onItemDragEnd() {
	delete window._OBJ_DRAG_;
}

/**
 * Get item info (open description window)
 */
function onItemInfo(event) {
	event.stopImmediatePropagation();

	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(index);

	if (!item) {
		return false;
	}

	// If right click w/ alt (Request Transfer Item)
	if (event.altKey && event.which === 3) {
		event.stopImmediatePropagation();
		transferItemToOtherUI(item);
		return false;
	}

	// Don't add the same UI twice, remove it
	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
		return false;
	}

	// Add ui to window
	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);

	return false;
}

/**
 * Alt Right Click Request Transfer
 */
function transferItemToOtherUI(item) {
	const isStorageOpen = Storage.getUI().ui ? Storage.getUI().ui.is(':visible') : false;
	const isCartOpen = CartItems.ui ? CartItems.ui.is(':visible') : false;

	if (!item) {
		return false;
	}

	const count = item.count || 1;

	if (isStorageOpen) {
		Storage.reqAddItem(item.index, count);
	} else if (isCartOpen) {
		InventoryV0.reqMoveItemToCart(item.index, count);
	}

	return true;
}

/**
 * Ask to use an item
 */
function onItemUsed(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(index);

	if (item) {
		InventoryV0.useItem(item);
		onItemOut();
	}

	event.stopImmediatePropagation();
	return false;
}

/**
 * Handle click event on an item
 */
function onItemClick(event) {
	// Shift + LEFT CLICK → insert <ItemName> in chat
	if (event.shiftKey && event.which === 1) {
		const idx = parseInt(jQuery(this).attr('data-index'), 10);
		const item = InventoryV0.getItemByIndex(idx);
		if (!item) {
			return false;
		}

		item.name = DB.getItemName(item);
		const link =
			'<span data-item="' +
			DB.createItemLink(item) +
			'" class="item-link" style="color:#A9B95F;">&lt;' +
			item.name +
			'&gt;</span>';

		const msgBox = ChatBox.ui.find('.input-chatbox')[0];
		if (msgBox) {
			msgBox.innerHTML += link + ' ';
			msgBox.focus();
		}

		event.stopImmediatePropagation();
	}

	return false;
}

/**
 * functions to define
 */
InventoryV0.onUseItem = function OnUseItem(/* index */) {};
InventoryV0.onUseCard = function onUseCard(/* index */) {};
InventoryV0.onEquipItem = function OnEquipItem(/* index, location */) {};
InventoryV0.onUpdateItem = function OnUpdateItem(/* index, amount */) {};
InventoryV0.reqMoveItemToCart = function reqMoveItemToCart(/* index, amount */) {};

/**
 * Create component and export it
 */
export default UIManager.addComponent(InventoryV0);
