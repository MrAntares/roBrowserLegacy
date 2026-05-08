/**
 * UI/Components/Storage/Storage.js
 *
 * Account Storage
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import StorageFilter from './StorageFilter.js';
import htmlText from './Storage.html?raw';
import cssText from './Storage.css?raw';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';

const Storage = new GUIComponent('Storage', cssText);

Storage.render = () => htmlText;

Storage.TAB = {
	ITEM: 0,
	KAFRA: 1,
	ARMOR: 2,
	ARMS: 3,
	AMMO: 4,
	CARD: 5,
	ETC: 6
};

const _list = [];

let _openFilters = {};

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

Storage.init = function init() {
	const root = this._shadow || this._host;

	const tabButtons = root.querySelectorAll('.tabs button');
	tabButtons.forEach((btn, idx) => {
		btn.addEventListener('mousedown', () => onSwitchTab(idx));
	});

	const extendBtn = root.querySelector('.footer .extend');
	if (extendBtn) {
		extendBtn.addEventListener('mousedown', () => onResize());
	}

	const closeBtn = root.querySelector('.footer .close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => {
			if (typeof Storage.onClosePressed === 'function') {
				Storage.onClosePressed();
			}
		});
	}

	const filterButtons = root.querySelectorAll('.filter-buttons button');
	filterButtons.forEach(btn => {
		btn.addEventListener('mousedown', () => onFilterWindowOpen(btn));
		btn.addEventListener('mouseover', () => onFilterWindowHover(btn, root));
		btn.addEventListener('mouseout', () => onFilterWindowHoverOut(root));
	});

	const searchBtn = root.querySelector('.search-button');
	if (searchBtn) {
		searchBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		searchBtn.addEventListener('click', () => Storage.onSearch());
	}

	const orderBySelect = root.querySelector('.storage-order-by');
	if (orderBySelect) {
		orderBySelect.addEventListener('change', () => requestFilter());
	}

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/tab_itm_ex_0${_preferences.tab + 1}.bmp`, data => {
		const tabs = root.querySelector('.tabs');
		if (tabs) {
			tabs.style.backgroundImage = `url("${data}")`;
		}
	});

	resizeHeight(_preferences.height);

	const content = root.querySelector('.container .content');
	if (content) {
		content.addEventListener('wheel', e => onScroll(e, content));
		content.addEventListener('mouseover', e => {
			const itemEl = e.target.closest('.item');
			if (itemEl) {
				onItemOver(itemEl, root);
			}
		});
		content.addEventListener('mouseout', e => {
			const itemEl = e.target.closest('.item');
			if (itemEl) {
				onItemOut(root);
			}
		});
		content.addEventListener('dragstart', e => {
			const itemEl = e.target.closest('.item');
			if (itemEl) {
				onItemDragStart(e, itemEl);
				onItemOut(root);
			}
		});
		content.addEventListener('dragend', e => {
			const itemEl = e.target.closest('.item');
			if (itemEl) {
				onItemDragEnd();
			}
		});
		content.addEventListener('contextmenu', e => {
			const itemEl = e.target.closest('.item');
			if (itemEl) {
				e.preventDefault();
				onItemInfo(e, itemEl);
			}
		});
	}

	this._host.addEventListener('drop', e => onDrop(e));
	this._host.addEventListener('dragover', e => {
		e.stopImmediatePropagation();
		e.preventDefault();
	});

	this.draggable('.titlebar');
	this.ui.hide();
};

Storage.onAppend = function onAppend() {
	this.ui.show();
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - this._host.getBoundingClientRect().width)}px`;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - this._host.getBoundingClientRect().height)}px`;
};

Storage.onRemove = function onRemove() {
	const root = this._shadow || this._host;
	const content = root.querySelector('.container .content');
	if (content) {
		content.innerHTML = '';
	}
	_list.length = 0;

	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.height = Math.floor((this._host.getBoundingClientRect().height - (31 + 19 - 30)) / 32);
	_preferences.save();

	for (const tabId in _openFilters) {
		if (_openFilters.hasOwnProperty(tabId)) {
			_openFilters[tabId].remove();
		}
	}
	_openFilters = {};

	const searchInput = root.querySelector('#storage-search-input');
	if (searchInput) {
		searchInput.value = '';
	}
};

Storage.setItems = function setItems(items) {
	for (let i = 0, count = items.length; i < count; ++i) {
		if (this.addItemSub(items[i])) {
			_list.push(items[i]);
		}
	}
};

Storage.addItem = function addItem(item) {
	const i = getItemIndexById(item.index);

	let itemTab;
	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.DELAYCONSUME:
			itemTab = Storage.TAB.ITEM;
			break;
		case ItemType.CASH:
			itemTab = Storage.TAB.KAFRA;
			break;
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETEGG:
			itemTab = Storage.TAB.ARMOR;
			break;
		case ItemType.WEAPON:
		case ItemType.PETARMOR:
			itemTab = Storage.TAB.ARMS;
			break;
		case ItemType.AMMO:
			itemTab = Storage.TAB.AMMO;
			break;
		case ItemType.CARD:
			itemTab = Storage.TAB.CARD;
			break;
		default:
		case ItemType.ETC:
			itemTab = Storage.TAB.ETC;
			break;
	}

	if (_openFilters[itemTab]) {
		_openFilters[itemTab].addItem(item);
	}

	if (i > -1) {
		_list[i].count += item.count;
		const root = this._shadow || this._host;
		const countEl = root.querySelector(`.item[data-index="${item.index}"] .count`);
		if (countEl) {
			countEl.textContent = _list[i].count;
		}
		return;
	}

	if (this.addItemSub(item)) {
		_list.push(item);
	}
};

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
		const root = this._shadow || this._host;
		const content = root.querySelector('.container .content');

		const itemEl = document.createElement('div');
		itemEl.className = 'item';
		itemEl.setAttribute('data-index', item.index);
		itemEl.setAttribute('draggable', 'true');

		const iconDiv = document.createElement('div');
		iconDiv.className = 'icon';
		itemEl.appendChild(iconDiv);

		const amountDiv = document.createElement('div');
		amountDiv.className = 'amount';
		if (item.count) {
			const countSpan = document.createElement('span');
			countSpan.className = 'count';
			countSpan.textContent = item.count;
			amountDiv.appendChild(countSpan);
			amountDiv.appendChild(document.createTextNode(' '));
		}
		itemEl.appendChild(amountDiv);

		const nameSpan = document.createElement('span');
		nameSpan.className = 'name';
		nameSpan.innerHTML = DB.getItemName(item);
		itemEl.appendChild(nameSpan);

		if (content) {
			content.appendChild(itemEl);
		}

		Client.loadFile(
			`${DB.INTERFACE_PATH}item/${item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName}.bmp`,
			data => {
				const icon = root.querySelector(`.item[data-index="${item.index}"] .icon`);
				if (icon) {
					icon.style.backgroundImage = `url(${data})`;
				}
			}
		);
	}
	return true;
};

Storage.removeItem = function removeItem(index, count) {
	const i = getItemIndexById(index);

	if (i < 0) {
		return null;
	}

	for (const tabId in _openFilters) {
		if (_openFilters.hasOwnProperty(tabId)) {
			_openFilters[tabId].removeItem(index, count);
		}
	}

	if (_list[i].count) {
		_list[i].count -= count;
		if (_list[i].count > 0) {
			const root = this._shadow || this._host;
			const countEl = root.querySelector(`.item[data-index="${index}"] .count`);
			if (countEl) {
				countEl.textContent = _list[i].count;
			}
			return _list[i];
		}
	}
	const item = _list[i];
	_list.splice(i, 1);
	const root = this._shadow || this._host;
	const el = root.querySelector(`.item[data-index="${index}"]`);
	if (el) {
		el.remove();
	}
	const overlay = root.querySelector('.overlay');
	if (overlay) {
		overlay.style.display = 'none';
	}
	return item;
};

Storage.setItemInfo = function setItemInfo(current, limit) {
	const root = this._shadow || this._host;
	const currentEl = root.querySelector('.footer .current');
	const limitEl = root.querySelector('.footer .limit');
	if (currentEl) {
		currentEl.textContent = current;
	}
	if (limitEl) {
		limitEl.textContent = limit;
	}
};

Storage.onKeyDown = function onKeyDown(event) {
	if (this._host.style.display !== 'none') {
		if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
			if (typeof Storage.onClosePressed === 'function') {
				Storage.onClosePressed();
			}
		}

		if (event.which === KEYS.ENTER || event.key === 'Enter') {
			if (typeof Storage.onEnterPressed === 'function') {
				Storage.onEnterPressed();
			}
		}
	}
};

Storage.onSearch = function onSearch() {
	const root = this._shadow || this._host;
	const searchInput = root.querySelector('#storage-search-input');
	if (!searchInput) {
		return;
	}
	const searchTerm = searchInput.value.toLowerCase();

	const filteredItems = _list.filter(item => {
		return DB.getItemName(item).toLowerCase().indexOf(searchTerm) > -1;
	});

	if (!_openFilters[ItemType.SEARCH]) {
		const newFilter = new StorageFilter(ItemType.SEARCH);
		_openFilters[ItemType.SEARCH] = newFilter;

		newFilter.onCloseCallback = function () {
			if (_openFilters[ItemType.SEARCH]) {
				delete _openFilters[ItemType.SEARCH];
			}
		};

		newFilter.onTransferItemToOtherUI = function (item) {
			Storage.transferItemToOtherUI(item);
		};

		newFilter.append();
		newFilter.setItems('Search', filteredItems, ItemType.SEARCH);
	} else {
		_openFilters[ItemType.SEARCH].setItems('Search', filteredItems, ItemType.SEARCH);
	}
};

function onResize() {
	const top = Storage._host.offsetTop;
	let lastHeight = 0;

	function resizing() {
		const extraY = 31 + 19 - 30;
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);
		h = Math.min(Math.max(h, 8), 17);
		if (h === lastHeight) {
			return;
		}
		resizeHeight(h);
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

function resizeHeight(height) {
	height = Math.min(Math.max(height, 8), 17);

	const root = Storage._shadow || Storage._host;
	const content = root.querySelector('.container .content');
	if (content) {
		content.style.height = `${height * 32}px`;
	}
	Storage._host.style.height = `${31 + 19 + height * 32}px`;
}

function onSwitchTab(idx) {
	_preferences.tab = idx;

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/tab_itm_ex_0${idx + 1}.bmp`, data => {
		const root = Storage._shadow || Storage._host;
		const tabs = root.querySelector('.tabs');
		if (tabs) {
			tabs.style.backgroundImage = `url("${data}")`;
		}
		requestFilter();
	});
}

function onDrop(event) {
	let data;
	try {
		data = JSON.parse(event.dataTransfer.getData('Text'));
	} catch (e) {
		// Ignore parsing error
	}
	event.stopImmediatePropagation();
	if (!data || data.type !== 'item' || (data.from !== 'Inventory' && data.from !== 'CartItems')) {
		return false;
	}
	const item = data.data;
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

function requestFilter() {
	const root = Storage._shadow || Storage._host;
	const content = root.querySelector('.container .content');
	if (content) {
		content.innerHTML = '';
	}

	let list = _list;
	const orderBySelect = root.querySelector('.storage-order-by');
	const orderBy = orderBySelect ? orderBySelect.value : 'BASE';

	if (orderBy === 'UPGRADE' || orderBy === 'DOWNGRADE') {
		list = _list.slice(0);
		list.sort((a, b) => {
			const nameA = DB.getItemName(a);
			const nameB = DB.getItemName(b);
			return orderBy === 'UPGRADE' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
		});
	}

	for (let i = 0, count = list.length; i < count; ++i) {
		Storage.addItemSub(list[i]);
	}
}

function getItemIndexById(index) {
	for (let i = 0, count = _list.length; i < count; ++i) {
		if (_list[i].index === index) {
			return i;
		}
	}
	return -1;
}

function onScroll(event, contentEl) {
	let delta;

	if (event.wheelDelta) {
		delta = event.wheelDelta / 120;
	} else if (event.detail) {
		delta = -event.detail;
	} else if (event.deltaY) {
		delta = -event.deltaY / 100;
	}

	contentEl.scrollTop = Math.floor(contentEl.scrollTop / 32) * 32 - delta * 32;
	event.preventDefault();
}

function onFilterWindowOpen(button) {
	const tabId = parseInt(button.getAttribute('data-tab-id'), 10);
	const title = button.getAttribute('data-title') || 'Items';

	button.classList.toggle('active');

	if (_openFilters[tabId]) {
		_openFilters[tabId].remove();
		delete _openFilters[tabId];
		return;
	}

	const filtered_list = [];
	for (let i = 0, count = _list.length; i < count; ++i) {
		const item = _list[i];
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
		if (tab === tabId) {
			filtered_list.push(item);
		}
	}

	const newFilter = new StorageFilter(tabId);
	_openFilters[tabId] = newFilter;

	newFilter.onCloseCallback = function () {
		button.classList.remove('active');

		if (_openFilters[tabId]) {
			delete _openFilters[tabId];
		}
	};

	newFilter.onTransferItemToOtherUI = function (item) {
		Storage.transferItemToOtherUI(item);
	};

	newFilter.append();
	newFilter.setItems(title, filtered_list, tabId);
}

function onFilterWindowHover(button, root) {
	const title = button.getAttribute('data-title');
	const overlay = root.querySelector('.overlay');
	if (overlay) {
		overlay.textContent = title;
		const height = Storage._host.getBoundingClientRect().height;
		overlay.style.top = `${height - 50}px`;
		overlay.style.left = `${button.offsetLeft}px`;
		overlay.style.display = '';
	}
}

function onFilterWindowHoverOut(root) {
	const overlay = root.querySelector('.overlay');
	if (overlay) {
		overlay.style.display = 'none';
	}
}

function onItemOver(itemEl, root) {
	const idx = parseInt(itemEl.getAttribute('data-index'), 10);
	const i = getItemIndexById(idx);
	if (i < 0) {
		return;
	}
	const item = _list[i];
	const overlay = root.querySelector('.overlay');
	if (overlay) {
		overlay.style.display = '';
		overlay.style.top = `${itemEl.offsetTop - 10}px`;
		overlay.style.left = `${itemEl.offsetLeft + 35}px`;
		overlay.innerHTML = `${DB.getItemName(item)} ${item.count || 1} ea`;

		if (item.IsIdentified) {
			overlay.classList.remove('grey');
		} else {
			overlay.classList.add('grey');
		}
	}
}

function onItemOut(root) {
	const overlay = root.querySelector('.overlay');
	if (overlay) {
		overlay.style.display = 'none';
	}
}

function onItemDragStart(event, itemEl) {
	const index = parseInt(itemEl.getAttribute('data-index'), 10);
	const i = getItemIndexById(index);
	if (i === -1) {
		return;
	}
	const img = new Image();
	let url = itemEl.firstChild.style.backgroundImage.match(/\(([^)]+)/)[1];
	url = url.replace(/^"/, '').replace(/"$/, '');
	img.src = url;
	event.dataTransfer.setDragImage(img, 12, 12);
	event.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Storage',
				data: _list[i]
			})
		)
	);
}

function onItemDragEnd() {
	delete window._OBJ_DRAG_;
}

function onItemInfo(event, itemEl) {
	event.stopImmediatePropagation();
	const index = parseInt(itemEl.getAttribute('data-index'), 10);
	const i = getItemIndexById(index);
	if (i === -1) {
		return false;
	}
	if (event.altKey && event.which === 3) {
		event.stopImmediatePropagation();
		Storage.transferItemToOtherUI(_list[i]);
		return false;
	}
	if (ItemInfo.uid === _list[i].ITID) {
		ItemInfo.remove();
	}
	ItemInfo.append();
	ItemInfo.uid = _list[i].ITID;
	ItemInfo.setItem(_list[i]);
	return false;
}

Storage.transferItemToOtherUI = function transferItemToOtherUI(item) {
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
};

Storage.onClosePressed = function onClosedPressed() {};
Storage.reqAddItem = function reqAddItem() {};
Storage.reqAddItemFromCart = function reqAddItemFromCart() {};
Storage.reqRemoveItem = function reqRemoveItem() {};
Storage.reqMoveItemToCart = function reqMoveItemToCart() {};

Storage.mouseMode = GUIComponent.MouseMode.STOP;

export default UIManager.addComponent(Storage);
