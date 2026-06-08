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
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
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
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';

/**
 * Create Component
 */
const InventoryV0 = new GUIComponent('InventoryV0', cssText);

InventoryV0.render = () => htmlText;

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

function _getRoot() {
	return InventoryV0._shadow || InventoryV0._host;
}

function _sanitizeHtml(str) {
	const whitelist = ['font', 'i', 'b'];
	const div = document.createElement('div');
	div.innerHTML = str;
	div.querySelectorAll('*').forEach(el => {
		if (!whitelist.includes(el.tagName.toLowerCase())) {
			el.replaceWith(...el.childNodes);
		}
	});
	return div.innerHTML;
}

/**
 * Initialize UI
 */
InventoryV0.init = function Init() {
	const root = _getRoot();

	// Bind buttons
	const baseBtn = root.querySelector('.titlebar .base');
	if (baseBtn) {
		baseBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
	}

	const miniBtn = root.querySelector('.titlebar .mini');
	if (miniBtn) {
		miniBtn.addEventListener('click', onToggleReduction);
	}

	const tabButtons = root.querySelectorAll('.tabs button');
	tabButtons.forEach(btn => {
		btn.addEventListener('mousedown', onSwitchTab);
	});

	const extendBtn = root.querySelector('.footer .extend');
	if (extendBtn) {
		extendBtn.addEventListener('mousedown', onResize);
	}

	const closeBtn = root.querySelector('.titlebar .close');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			InventoryV0._host.style.display = 'none';
		});
	}

	// on drop item
	this._host.addEventListener('drop', onDrop);
	this._host.addEventListener('dragover', e => e.stopImmediatePropagation());

	// Items event (delegation)
	const content = root.querySelector('.container .content');
	if (content) {
		content.addEventListener('mouseover', e => {
			const item = e.target.closest('.item');
			if (item) onItemOver.call(item, e);
		});
		content.addEventListener('mouseout', e => {
			const item = e.target.closest('.item');
			if (item) onItemOut();
		});
		content.addEventListener('dragstart', e => {
			const item = e.target.closest('.item');
			if (item) onItemDragStart.call(item, e);
		});
		content.addEventListener('dragend', e => {
			const item = e.target.closest('.item');
			if (item) onItemDragEnd();
		});
		content.addEventListener('contextmenu', e => {
			e.preventDefault();
			const item = e.target.closest('.item');
			if (item) onItemInfo.call(item, e);
		});
		content.addEventListener('dblclick', e => {
			const item = e.target.closest('.item');
			if (item) onItemUsed.call(item, e);
		});
		content.addEventListener('click', e => {
			const item = e.target.closest('.item');
			if (item) onItemClick.call(item, e);
		});
	}

	const ncnt = root.querySelector('.ncnt');
	if (ncnt) ncnt.textContent = '0';
	const mcnt = root.querySelector('.mcnt');
	if (mcnt) mcnt.textContent = '100';

	this.draggable('.titlebar');
};

/**
 * Apply preferences once append to body
 */
InventoryV0.onAppend = function OnAppend() {
	const root = _getRoot();

	// Apply preferences
	if (!_preferences.show) {
		this._host.style.display = 'none';
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0' + (_preferences.tab + 1) + '.bmp', data => {
		const tabSprite = root.querySelector('.tab-sprite');
		if (tabSprite) {
			tabSprite.style.backgroundImage = `url("${data}")`;
		}
	});

	this.resize(_preferences.width, _preferences.height);

	const hostRect = this._host.getBoundingClientRect();
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width)}px`;

	this.magnet.TOP = _preferences.magnet_top;
	this.magnet.BOTTOM = _preferences.magnet_bottom;
	this.magnet.LEFT = _preferences.magnet_left;
	this.magnet.RIGHT = _preferences.magnet_right;

	_realSize = _preferences.reduce ? 0 : this._host.getBoundingClientRect().height;
	const miniBtnAppend = root.querySelector('.titlebar .mini');
	if (miniBtnAppend) {
		miniBtnAppend.dispatchEvent(new Event('mousedown'));
	}
};

/**
 * Remove Inventory from window (and so clean up items)
 */
InventoryV0.onRemove = function OnRemove() {
	const root = _getRoot();
	const content = root.querySelector('.container .content');
	if (content) content.innerHTML = '';
	this.list.length = 0;
	InventoryV0.newItems.length = 0;
	document.querySelectorAll('.ItemInfo').forEach(el => el.remove());

	// Save preferences
	_preferences.show = this._host.style.display !== 'none';
	_preferences.reduce = !!_realSize;
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	const hostRect = this._host.getBoundingClientRect();
	_preferences.width = Math.floor((hostRect.width - (23 + 16 + 16 - 30)) / 32);
	_preferences.height = Math.floor((hostRect.height - (31 + 19 - 30)) / 32);
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
			if (this._host.style.display === 'none') {
				this._host.style.display = '';
				this.focus();
			} else {
				this._host.dispatchEvent(new Event('mouseleave'));
				this.clearNewItems();
				const root = _getRoot();
				root.querySelectorAll('.new_item').forEach(el => {
					el.style.backgroundImage = '';
				});
				this._host.style.display = 'none';
			}
			break;
	}

	const basicInfoUI = BasicInfo.getUI();
	if (basicInfoUI._host) {
		const changeUI = _getBasicInfoRoot(basicInfoUI).querySelector('#item .btn_overlay');
		if (changeUI) {
			changeUI.style.display = 'none';
		}
	}
};

function _getBasicInfoRoot(ui) {
	return ui._shadow || ui._host || document;
}

/**
 * Show/Hide UI
 */
InventoryV0.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
		this.focus();
	} else {
		this._host.dispatchEvent(new Event('mouseleave'));
		this.clearNewItems();
		const root = _getRoot();
		root.querySelectorAll('.new_item').forEach(el => {
			el.style.backgroundImage = '';
		});
		this._host.style.display = 'none';
	}

	const basicInfoUI = BasicInfo.getUI();
	if (basicInfoUI._host) {
		const changeUI = _getBasicInfoRoot(basicInfoUI).querySelector('#item .btn_overlay');
		if (changeUI) {
			changeUI.style.display = 'none';
		}
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

	const root = _getRoot();
	const content = root.querySelector('.container .content');
	if (content) {
		content.style.width = `${width * 32}px`;
	}

	this._host.style.width = `${27 + 16 + 16 + width * 32}px`;
	this._host.style.height = `${31 + 4 + 27 + height * 32}px`;

	this.updateScroll();
};

/**
 * Force scroll clamping
 */
InventoryV0.updateScroll = function updateScroll() {
	const root = _getRoot();
	const hostEl = root.querySelector('.scroll-host');
	if (!hostEl) return;

	const contentEl = root.querySelector('.content');
	let ticker = 0;

	const clamp = () => {
		const maxScroll = Math.max(0, hostEl.scrollHeight - hostEl.clientHeight);

		const lastItem = contentEl ? contentEl.querySelector('.item:last-child') : null;
		if (lastItem) {
			const itemRect = lastItem.getBoundingClientRect();
			const hostRect = hostEl.getBoundingClientRect();

			if (itemRect.bottom < hostRect.bottom && hostEl.scrollTop > 0) {
				hostEl.scrollTop = Math.max(0, hostEl.scrollTop - (hostRect.bottom - itemRect.bottom));
			}
		}

		if (hostEl.scrollTop > maxScroll) {
			hostEl.scrollTop = maxScroll;
		}

		if (hostEl._roScrollbarRestart) {
			hostEl._roScrollbarRestart();
		}

		if (ticker++ < 20) {
			requestAnimationFrame(clamp);
		}
	};
	clamp();
};

/**
 * Get item object
 *
 * @param {number} id
 * @returns {Item}
 */
InventoryV0.getItemById = function GetItemById(id) {
	const list = InventoryV0.list;
	for (let i = 0, count = list.length; i < count; ++i) {
		if (list[i].ITID === id) return list[i];
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
	const list = InventoryV0.list;
	for (let i = 0, count = list.length; i < count; ++i) {
		if (list[i].index === index) return list[i];
	}
	return null;
};

/**
 * Add items to the list
 * if the item index is exist you should clear it;[skybook888]
 */
InventoryV0.setItems = function SetItems(items) {
	const root = _getRoot();
	for (let i = 0, count = items.length; i < count; ++i) {
		const object = this.getItemByIndex(items[i].index);
		if (object) {
			this.removeItem(object.index, object.count);
		}
		if (this.addItemSub(items[i])) {
			this.list.push(items[i]);
			const ncnt = root.querySelector('.ncnt');
			if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber();
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
	const root = _getRoot();

	// Check if the item was equipped
	const equippedIndex = InventoryV0.equippedItems.indexOf(item.index);
	if (equippedIndex !== -1) {
		InventoryV0.equippedItems.splice(equippedIndex, 1);
	} else {
		// Mark as new item
		InventoryV0.newItems.push(item.index);

		const basicInfoUI = BasicInfo.getUI();
		if (basicInfoUI._host) {
			const changeUI = _getBasicInfoRoot(basicInfoUI).querySelector('#item .btn_overlay');
			if (changeUI) {
				changeUI.style.display = 'block';
			}
		}
	}

	if (object) {
		if (isNaN(object.count)) object.count = 1;
		if (isNaN(item.count)) item.count = 1;
		object.count += item.count;
		const countEl = root.querySelector(`.item[data-index="${item.index}"] .count`);
		if (countEl) countEl.textContent = object.count;
		this.onUpdateItem(object.ITID, object.count);
		if (InventoryV0.newItems.indexOf(item.index) === -1) {
			InventoryV0.newItems.push(item.index);
		}
		if (getItemTab(item) === _preferences.tab) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/new_item.bmp', data => {
				const newItemEl = root.querySelector(`.item[data-index="${item.index}"] .new_item`);
				if (newItemEl) newItemEl.style.backgroundImage = `url(${data})`;
			});
		}
		return;
	}

	object = Object.assign({}, item);
	if (this.addItemSub(object)) {
		this.list.push(object);
		const ncnt = root.querySelector('.ncnt');
		if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber();
		this.onUpdateItem(object.ITID, object.count);
	}
};

/**
 * Check if item index is in newItems list
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

	if (item.WearState && item.type !== ItemType.AMMO && item.type !== ItemType.CARD) {
		Equipment.getUI().equip(item, item.WearState);
		return false;
	}

	if (tab === _preferences.tab) {
		const it = DB.getItemInfo(item.ITID);
		const root = _getRoot();
		const content = root.querySelector('.container .content');
		if (!content) return true;

		content.insertAdjacentHTML(
			'beforeend',
			`<div class="item" data-index="${item.index}" draggable="true">` +
				'<div class="new_item"></div>' +
				'<div class="icon"></div>' +
				`<div class="amount"><span class="count">${item.count || 1}</span></div>` +
				'</div>'
		);

		Client.loadFile(
			DB.INTERFACE_PATH +
				'item/' +
				(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
				'.bmp',
			data => {
				const icon = root.querySelector(`.item[data-index="${item.index}"] .icon`);
				if (icon) icon.style.backgroundImage = `url(${data})`;
			}
		);

		if (InventoryV0.isNewItem(item.index)) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/new_item.bmp', data => {
				const newItemEl = root.querySelector(`.item[data-index="${item.index}"] .new_item`);
				if (newItemEl) newItemEl.style.backgroundImage = `url(${data})`;
			});
		} else {
			const newItemEl = root.querySelector(`.item[data-index="${item.index}"] .new_item`);
			if (newItemEl) newItemEl.style.backgroundImage = '';
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
	const root = _getRoot();

	if (!item || count <= 0) return null;

	if (item.count) {
		item.count -= count;
		if (item.count > 0) {
			const countEl = root.querySelector(`.item[data-index="${item.index}"] .count`);
			if (countEl) countEl.textContent = item.count;
			this.onUpdateItem(item.ITID, item.count);
			return item;
		}
	}

	this.list.splice(this.list.indexOf(item), 1);
	const el = root.querySelector(`.item[data-index="${item.index}"]`);
	if (el) el.remove();
	const ncnt = root.querySelector('.ncnt');
	if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber();
	this.onUpdateItem(item.ITID, 0);

	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';

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
	if (!item) return;

	item.count = count;
	const root = _getRoot();

	if (item.count > 0) {
		const countEl = root.querySelector(`.item[data-index="${item.index}"] .count`);
		if (countEl) countEl.textContent = item.count;
		this.onUpdateItem(item.ITID, item.count);
		return;
	}

	this.list.splice(this.list.indexOf(item), 1);
	const el = root.querySelector(`.item[data-index="${item.index}"]`);
	if (el) el.remove();
	const ncnt = root.querySelector('.ncnt');
	if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber();
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
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.CASH:
			InventoryV0.onUseItem(item.index);
			break;
		case ItemType.CARD:
			InventoryV0.onUseCard(item.index);
			break;
		case ItemType.DELAYCONSUME:
			break;
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
};

/**
 * Extend inventory window size
 */
function onResize() {
	const top = InventoryV0._host.offsetTop;
	const left = InventoryV0._host.offsetLeft;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizing() {
		const extraX = 23 + 16 + 16 - 30;
		const extraY = 31 + 19 - 30;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		w = Math.min(Math.max(w, 6), 8);
		h = Math.min(Math.max(h, 2), 5);

		if (w === lastWidth && h === lastHeight) return;

		InventoryV0.resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	const _Interval = setInterval(resizing, 30);

	const onMouseUp = event => {
		if (event.which === 1) {
			clearInterval(_Interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
	window.addEventListener('mouseup', onMouseUp);
}

/**
 * Modify tab, filter display entries
 */
function onSwitchTab() {
	const root = _getRoot();
	const buttons = root.querySelectorAll('.tabs button');
	const idx = Array.from(buttons).indexOf(this);
	_preferences.tab = parseInt(idx, 10);

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0' + (idx + 1) + '.bmp', data => {
		const tabSprite = root.querySelector('.tab-sprite');
		if (tabSprite) tabSprite.style.backgroundImage = `url(${data})`;
		requestFilter();
	});
}

/**
 * Hide/show inventory's content
 */
function onToggleReduction() {
	const root = _getRoot();
	const panel = root.querySelector('.panel');

	if (_realSize) {
		if (panel) panel.style.display = 'flex';
		InventoryV0._host.style.height = `${_realSize}px`;
		_realSize = 0;
	} else {
		_realSize = InventoryV0._host.getBoundingClientRect().height;
		InventoryV0._host.style.height = '17px';
		if (panel) panel.style.display = 'none';
	}
}

/**
 * Update tab, reset inventory content
 */
function requestFilter() {
	const root = _getRoot();
	const host = root.querySelector('.scroll-host');
	if (host) host.scrollTop = 0;

	const content = root.querySelector('.container .content');
	if (content) content.innerHTML = '';

	const list = InventoryV0.list;
	for (let i = 0, count = list.length; i < count; ++i) {
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
		data = JSON.parse(event.dataTransfer.getData('Text'));
		item = data.data;
	} catch (_e) {
		return false;
	}

	if (
		data.type !== 'item' ||
		(data.from !== 'Storage' && data.from !== 'CartItems' && data.from !== 'Mail' && data.from !== 'WriteRodex')
	) {
		return false;
	}

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
function onItemOver(_e) {
	const idx = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(idx);

	if (!item) return;

	let quantity = ' ea';
	if (
		item.Options &&
		(item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) &&
		item.Options.filter(Option => Option.index !== 0).length > 0
	) {
		quantity = ' Quantity';
	}

	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	const rootEl = root.querySelector('#InventoryV0') || root;
	const itemRect = this.getBoundingClientRect();
	const rootRect = rootEl.getBoundingClientRect();

	if (overlay) {
		overlay.style.display = 'block';
		overlay.style.top = `${itemRect.top - rootRect.top}px`;
		overlay.style.left = `${itemRect.left - rootRect.left + 35}px`;
		overlay.innerHTML = _sanitizeHtml(`${DB.getItemName(item)}: ${item.count || 1}${quantity}`);

		if (item.IsIdentified) {
			overlay.classList.remove('grey');
		} else {
			overlay.classList.add('grey');
		}
	}
}

/**
 * Hide the item name
 */
function onItemOut() {
	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';
}

/**
 * Start dragging an item
 */
function onItemDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV0.getItemByIndex(index);

	if (!item) return;

	const img = new Image();
	const iconEl = this.querySelector('.icon');
	const url = iconEl ? iconEl.style.backgroundImage.match(/\((.*?)\)/)?.[1]?.replace(/('|")/g, '') : '';
	img.decoding = 'async';
	img.src = url || '';

	event.dataTransfer.setDragImage(img, 12, 12);
	event.dataTransfer.setData(
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

	if (!item) return false;

	if (event.altKey && event.which === 3) {
		event.stopImmediatePropagation();
		transferItemToOtherUI(item);
		return false;
	}

	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
		return false;
	}

	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);

	return false;
}

/**
 * Alt Right Click Request Transfer
 */
function transferItemToOtherUI(item) {
	const storageUI = Storage.getUI();
	const isStorageOpen = storageUI._host ? storageUI._host.style.display !== 'none' : false;
	const isCartOpen = CartItems._host ? CartItems._host.style.display !== 'none' : false;

	if (!item) return false;

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
	event.preventDefault();
}

/**
 * Handle click event on an item
 */
function onItemClick(event) {
	if (event.shiftKey && event.which === 1) {
		const idx = parseInt(this.getAttribute('data-index'), 10);
		const item = InventoryV0.getItemByIndex(idx);
		if (!item) return false;

		item.name = DB.getItemName(item);
		const link =
			'<span data-item="' +
			DB.createItemLink(item) +
			'" class="item-link" style="color:#A9B95F;">&lt;' +
			item.name +
			'&gt;</span>';

		const chatRoot = ChatBox._shadow || ChatBox._host || document;
		const msgBox = chatRoot.querySelector('.input-chatbox');
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
