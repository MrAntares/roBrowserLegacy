/**
 * UI/Components/Inventory/InventoryV2/InventoryV2.js
 *
 * Chararacter Inventory Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * In some cases the client will send packet twice.eg NORMAL_ITEMLIST4; fixit [skybook888]
 *
 */

import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import ItemCompare from 'UI/Components/ItemCompare/ItemCompare.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import Storage from 'UI/Components/Storage/Storage.js';
import SwitchEquip from 'UI/Components/SwitchEquip/SwitchEquip.js';
import UIVersionManager from 'UI/UIVersionManager.js';
import htmlText from './InventoryV2.html?raw';
import cssText from './InventoryV2.css?raw';
import BasicInfo from 'UI/Components/BasicInfo/BasicInfo.js';
import Mail from 'UI/Components/Mail/Mail.js';
import WriteRodex from 'UI/Components/Rodex/WriteRodex.js';

const InventoryV2 = new GUIComponent('InventoryV2', cssText);

InventoryV2.render = () => htmlText;

InventoryV2.TAB = {
	USABLE: 0,
	EQUIP: 1,
	ETC: 2,
	FAV: 3
};

InventoryV2.list = [];
InventoryV2.equipswitchlist = [];
InventoryV2.newItems = [];
InventoryV2.equippedItems = [];

let _realSize = 0;

const _preferences = Preferences.get(
	'InventoryV2',
	{
		x: 0,
		y: UIVersionManager.getInventoryVersion() > 0 ? 172 : 120,
		width: 7,
		height: 193,
		show: false,
		reduce: false,
		tab: InventoryV2.TAB.USABLE,
		itemlock: false,
		itemcomp: true,
		npcsalelock: false,
		magnet_top: false,
		magnet_bottom: false,
		magnet_left: true,
		magnet_right: false
	},
	1.0
);

InventoryV2.itemlock = _preferences.itemlock;
InventoryV2.itemcomp = _preferences.itemcomp;
InventoryV2.npcsalelock = _preferences.npcsalelock;
let lockOverlayTimeout;

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

function _getBasicInfoRoot(ui) {
	return ui._shadow || ui._host || document;
}

InventoryV2.init = function Init() {
	const root = InventoryV2.getRoot();

	const baseBtn = root.querySelector('.titlebar .base');
	if (baseBtn) baseBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());

	const miniBtn = root.querySelector('.titlebar .mini');
	if (miniBtn) miniBtn.addEventListener('click', onToggleReduction);

	const tabButtons = root.querySelectorAll('.tabs button');
	tabButtons.forEach(btn => {
		btn.addEventListener('mousedown', onSwitchTab);
		btn.addEventListener('dragover', e => e.stopImmediatePropagation());
		btn.addEventListener('drop', onTabDrop);
	});

	const extendBtn = root.querySelector('.footer .extend');
	if (extendBtn) extendBtn.addEventListener('mousedown', onResize);

	const closeBtn = root.querySelector('.titlebar .close');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			InventoryV2._host.style.display = 'none';
		});
	}

	this._host.addEventListener('drop', onDrop);
	this._host.addEventListener('dragover', e => e.stopImmediatePropagation());

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
	if (ncnt) ncnt.textContent = '0 / ';
	const mcnt = root.querySelector('.mcnt');
	if (mcnt) mcnt.textContent = '100';

	this.draggable('.titlebar');

	root.querySelectorAll('.tabs button').forEach(b => b.classList.remove('selected'));
	const allTabs = root.querySelectorAll('.tabs button');
	if (allTabs[_preferences.tab]) allTabs[_preferences.tab].classList.add('selected');

	const lockImg = _preferences.itemlock ? 'inventory/item_drop_lock_on.bmp' : 'inventory/item_drop_lock_off.bmp';
	Client.loadFile(DB.INTERFACE_PATH + lockImg, data => {
		const btn = root.querySelector('.item_drop_lock');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});

	const compImg = _preferences.itemcomp ? 'inventory/item_compare_on.bmp' : 'inventory/item_compare_off.bmp';
	Client.loadFile(DB.INTERFACE_PATH + compImg, data => {
		const btn = root.querySelector('.item_compare');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});

	const lockSale = _preferences.npcsalelock
		? root.querySelector('.deallock_on')
		: root.querySelector('.deallock_off');
	if (_preferences.tab !== InventoryV2.TAB.FAV) {
		if (lockSale) lockSale.style.display = 'none';
		const sortEl = root.querySelector('.sort');
		if (sortEl) sortEl.style.display = 'none';
	} else {
		if (lockSale) lockSale.style.display = '';
		const sortEl = root.querySelector('.sort');
		if (sortEl) sortEl.style.display = '';
	}

	const itemDropLock = root.querySelector('.item_drop_lock');
	if (itemDropLock) itemDropLock.addEventListener('click', onItemLock);
	const itemCompare = root.querySelector('.item_compare');
	if (itemCompare) itemCompare.addEventListener('click', onItemCompare);
	root.querySelectorAll('.deal_lock').forEach(btn => btn.addEventListener('click', onNPCLock));
	const overlayClose = root.querySelector('.lockoverlayclose');
	if (overlayClose) {
		overlayClose.addEventListener('click', () => {
			const msg = root.querySelector('.lockoverlaymsg');
			if (msg) msg.style.display = 'none';
			clearTimeout(lockOverlayTimeout);
		});
	}
	const sortBtn = root.querySelector('.sort');
	if (sortBtn) sortBtn.addEventListener('click', () => requestFilter());
};

InventoryV2.onAppend = function OnAppend() {
	if (!_preferences.show) {
		this._host.style.display = 'none';
	}

	this.resize(_preferences.width, _preferences.height);

	const hostRect = this._host.getBoundingClientRect();
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width)}px`;

	this.magnet.TOP = _preferences.magnet_top;
	this.magnet.BOTTOM = _preferences.magnet_bottom;
	this.magnet.LEFT = _preferences.magnet_left;
	this.magnet.RIGHT = _preferences.magnet_right;

	_realSize = _preferences.reduce ? 0 : this._host.getBoundingClientRect().height;
	const root = InventoryV2.getRoot();
	const miniBtnAppend = root.querySelector('.titlebar .mini');
	if (miniBtnAppend) miniBtnAppend.dispatchEvent(new Event('mousedown'));
};

InventoryV2.onRemove = function OnRemove() {
	const root = InventoryV2.getRoot();
	const content = root.querySelector('.container .content');
	if (content) content.innerHTML = '';
	this.list.length = 0;
	this.equipswitchlist.length = 0;
	InventoryV2.newItems.length = 0;
	document.querySelectorAll('.ItemInfo').forEach(el => el.remove());

	_preferences.show = this._host.style.display !== 'none';
	_preferences.reduce = !!_realSize;
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	const hostRect = this._host.getBoundingClientRect();
	_preferences.width = Math.floor((hostRect.width - (23 + 16 + 16 - 30)) / 32);
	_preferences.magnet_top = this.magnet.TOP;
	_preferences.magnet_bottom = this.magnet.BOTTOM;
	_preferences.magnet_left = this.magnet.LEFT;
	_preferences.magnet_right = this.magnet.RIGHT;
	_preferences.save();
};

InventoryV2.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			if (this._host.style.display === 'none') {
				this._host.style.display = '';
				this.focus();
			} else {
				this._host.dispatchEvent(new Event('mouseleave'));
				this.clearNewItems();
				const root = InventoryV2.getRoot();
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
		if (changeUI) changeUI.style.display = 'none';
	}
};

InventoryV2.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
		this.focus();
	} else {
		this._host.dispatchEvent(new Event('mouseleave'));
		this.clearNewItems();
		const root = InventoryV2.getRoot();
		root.querySelectorAll('.new_item').forEach(el => {
			el.style.backgroundImage = '';
		});
		this._host.style.display = 'none';
	}

	const basicInfoUI = BasicInfo.getUI();
	if (basicInfoUI._host) {
		const changeUI = _getBasicInfoRoot(basicInfoUI).querySelector('#item .btn_overlay');
		if (changeUI) changeUI.style.display = 'none';
	}
};

InventoryV2.clearNewItems = function clearNewItems() {
	this.newItems = [];
};

InventoryV2.resize = function Resize(width) {
	width = Math.min(Math.max(width, 6), 8);

	const root = InventoryV2.getRoot();
	const content = root.querySelector('.container .content');
	if (content) content.style.width = `${width * 32}px`;

	this._host.style.width = `${23 + 16 + 16 + width * 32}px`;

	this.updateScroll();
};

InventoryV2.updateScroll = function updateScroll() {
	const root = InventoryV2.getRoot();
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
		if (hostEl.scrollTop > maxScroll) hostEl.scrollTop = maxScroll;
		if (hostEl._roScrollbarRestart) hostEl._roScrollbarRestart();
		if (ticker++ < 20) requestAnimationFrame(clamp);
	};
	clamp();
};

InventoryV2.getItemById = function GetItemById(id) {
	const list = InventoryV2.list;
	for (let i = 0, count = list.length; i < count; ++i) {
		if (list[i].ITID === id) return list[i];
	}
	return null;
};

InventoryV2.getItemByIndex = function getItemByIndex(index) {
	const list = InventoryV2.list;
	for (let i = 0, count = list.length; i < count; ++i) {
		if (list[i].index === index) return list[i];
	}
	return null;
};

InventoryV2.setItems = function SetItems(items) {
	const root = InventoryV2.getRoot();
	for (let i = 0, count = items.length; i < count; ++i) {
		const object = this.getItemByIndex(items[i].index);
		if (object) this.removeItem(object.index, object.count);
		if (this.addItemSub(items[i])) {
			this.list.push(items[i]);
			const ncnt = root.querySelector('.ncnt');
			if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber() + ' / ';
			this.onUpdateItem(items[i].ITID, items[i].count ? items[i].count : 1);
		}
	}
};

function getItemTab(item) {
	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.DELAYCONSUME:
		case ItemType.CASH:
			return InventoryV2.TAB.USABLE;
		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETEGG:
		case ItemType.PETARMOR:
			return InventoryV2.TAB.EQUIP;
		default:
		case ItemType.ETC:
		case ItemType.CARD:
		case ItemType.AMMO:
			return InventoryV2.TAB.ETC;
	}
}

InventoryV2.addItem = function AddItem(item) {
	let object = this.getItemByIndex(item.index);
	const root = InventoryV2.getRoot();

	const equippedIndex = InventoryV2.equippedItems.indexOf(item.index);
	if (equippedIndex !== -1) {
		InventoryV2.equippedItems.splice(equippedIndex, 1);
	} else {
		InventoryV2.newItems.push(item.index);
		const basicInfoUI = BasicInfo.getUI();
		if (basicInfoUI._host) {
			const changeUI = _getBasicInfoRoot(basicInfoUI).querySelector('#item .btn_overlay');
			if (changeUI) changeUI.style.display = 'block';
		}
	}

	if (object) {
		if (isNaN(object.count)) object.count = 1;
		if (isNaN(item.count)) item.count = 1;
		object.count += item.count;
		const countEl = root.querySelector(`.item[data-index="${item.index}"] .count`);
		if (countEl) countEl.textContent = object.count;
		this.onUpdateItem(object.ITID, object.count);
		if (InventoryV2.newItems.indexOf(item.index) === -1) {
			InventoryV2.newItems.push(item.index);
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
		if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber() + ' / ';
		this.onUpdateItem(object.ITID, object.count);
	}
};

InventoryV2.isNewItem = function isNewItem(index) {
	return InventoryV2.newItems.includes(index);
};

InventoryV2.addItemSub = function AddItemSub(item) {
	let tab = getItemTab(item);

	if (item.PlaceETCTab) {
		tab = InventoryV2.TAB.FAV;
	}

	if (item.WearState && item.type !== ItemType.AMMO && item.type !== ItemType.CARD) {
		Equipment.getUI().equip(item, item.WearState);
		return false;
	}

	const isInSwitchList = InventoryV2.equipswitchlist.some(equipItem => equipItem.index === item.index);

	if (isInSwitchList) {
		SwitchEquip.equip(item, item.location, true);
	}

	if (tab === _preferences.tab) {
		const it = DB.getItemInfo(item.ITID);
		const root = InventoryV2.getRoot();
		const content = root.querySelector('.container .content');
		if (!content) return true;

		content.insertAdjacentHTML(
			'beforeend',
			`<div class="item" data-index="${item.index}" draggable="true">` +
				'<div class="new_item"></div>' +
				'<div class="icon"></div>' +
				'<div class="switch1"></div>' +
				'<div class="switch2"></div>' +
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

		if (InventoryV2.isNewItem(item.index)) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/new_item.bmp', data => {
				const el = root.querySelector(`.item[data-index="${item.index}"] .new_item`);
				if (el) el.style.backgroundImage = `url(${data})`;
			});
		} else {
			const el = root.querySelector(`.item[data-index="${item.index}"] .new_item`);
			if (el) el.style.backgroundImage = '';
		}

		if (isInSwitchList) {
			Client.loadFile(DB.INTERFACE_PATH + 'swap_equipment/bg_change.bmp', data => {
				const el = root.querySelector(`.item[data-index="${item.index}"] .switch1`);
				if (el) el.style.backgroundImage = `url(${data})`;
			});
			Client.loadFile(DB.INTERFACE_PATH + 'swap_equipment/ico_change.bmp', data => {
				const el = root.querySelector(`.item[data-index="${item.index}"] .switch2`);
				if (el) el.style.backgroundImage = `url(${data})`;
			});
		}
	}

	return true;
};

InventoryV2.isInEquipSwitchList = function (location) {
	return this.equipswitchlist.some(existingItem => (existingItem.location & location) !== 0);
};

InventoryV2.removeItem = function RemoveItem(index, count) {
	const item = this.getItemByIndex(index);
	const root = InventoryV2.getRoot();

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
	if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber() + ' / ';
	this.onUpdateItem(item.ITID, 0);

	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';

	return item;
};

InventoryV2.updateItem = function UpdateItem(index, count) {
	const item = this.getItemByIndex(index);
	if (!item) return;

	item.count = count;
	const root = InventoryV2.getRoot();

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
	if (ncnt) ncnt.textContent = this.list.length + Equipment.getUI().getNumber() + ' / ';
	this.onUpdateItem(item.ITID, 0);

	this.updateScroll();
};

InventoryV2.useItem = function UseItem(item) {
	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.CASH:
			InventoryV2.onUseItem(item.index);
			break;
		case ItemType.CARD:
			InventoryV2.onUseCard(item.index);
			break;
		case ItemType.DELAYCONSUME:
			break;
		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETARMOR:
		case ItemType.AMMO:
			if (item.IsIdentified && !item.IsDamaged) {
				InventoryV2.onEquipItem(item.index, item.location);
			}
			break;
	}
};

function onResize() {
	const left = InventoryV2._host.offsetLeft;
	let lastWidth = 0;

	function resizing() {
		const extraX = 23 + 16 + 16 - 30;
		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		w = Math.min(Math.max(w, 6), 9);
		if (w === lastWidth) return;
		InventoryV2.resize(w);
		lastWidth = w;
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

function onSwitchTab() {
	const root = InventoryV2.getRoot();
	const buttons = root.querySelectorAll('.tabs button');
	const idx = Array.from(buttons).indexOf(this);
	_preferences.tab = parseInt(idx, 10);
	requestFilter();

	buttons.forEach(b => b.classList.remove('selected'));
	this.classList.add('selected');

	if (_preferences.tab !== InventoryV2.TAB.FAV) {
		const dealOn = root.querySelector('.deallock_on');
		if (dealOn) dealOn.style.display = 'none';
		const dealOff = root.querySelector('.deallock_off');
		if (dealOff) dealOff.style.display = 'none';
		const lockOverlay = root.querySelector('.lockoverlay');
		if (lockOverlay) lockOverlay.style.display = 'none';
		const lockMsg = root.querySelector('.lockoverlaymsg');
		if (lockMsg) lockMsg.style.display = 'none';
		const sort = root.querySelector('.sort');
		if (sort) sort.style.display = 'none';
	} else {
		if (_preferences.npcsalelock) {
			const dealOn = root.querySelector('.deallock_on');
			if (dealOn) dealOn.style.display = '';
			const lockOverlay = root.querySelector('.lockoverlay');
			if (lockOverlay) lockOverlay.style.display = '';
			const dealOff = root.querySelector('.deallock_off');
			if (dealOff) dealOff.style.display = 'none';
		} else {
			const dealOn = root.querySelector('.deallock_on');
			if (dealOn) dealOn.style.display = 'none';
			const lockOverlay = root.querySelector('.lockoverlay');
			if (lockOverlay) lockOverlay.style.display = 'none';
			const lockMsg = root.querySelector('.lockoverlaymsg');
			if (lockMsg) lockMsg.style.display = 'none';
			const dealOff = root.querySelector('.deallock_off');
			if (dealOff) dealOff.style.display = '';
		}
		const sort = root.querySelector('.sort');
		if (sort) sort.style.display = '';
	}
}

function onToggleReduction() {
	const root = InventoryV2.getRoot();
	const panel = root.querySelector('.panel');

	if (_realSize) {
		if (panel) panel.style.display = 'flex';
		InventoryV2._host.style.height = `${_realSize}px`;
		_realSize = 0;
	} else {
		_realSize = InventoryV2._host.getBoundingClientRect().height;
		InventoryV2._host.style.height = '17px';
		if (panel) panel.style.display = 'none';
	}
}

function requestFilter() {
	const root = InventoryV2.getRoot();
	const host = root.querySelector('.scroll-host');
	if (host) host.scrollTop = 0;

	const content = root.querySelector('.container .content');
	if (content) content.innerHTML = '';

	const list = InventoryV2.list;
	for (let i = 0, count = list.length; i < count; ++i) {
		InventoryV2.addItemSub(list[i]);
	}

	InventoryV2.updateScroll();
}

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

function onItemOver(_e) {
	const idx = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV2.getItemByIndex(idx);
	if (!item) return;

	let quantity = ' ea';
	if (
		item.Options &&
		(item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) &&
		item.Options.filter(Option => Option.index !== 0).length > 0
	) {
		quantity = ' Quantity';
	}

	const root = InventoryV2.getRoot();
	const overlay = root.querySelector('.overlay');
	const rootEl = root.querySelector('#InventoryV2') || root;
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

function onItemOut() {
	const root = InventoryV2.getRoot();
	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';
}

function onItemDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV2.getItemByIndex(index);
	if (!item) return;

	const img = new Image();
	const iconEl = this.querySelector('.icon');
	const url = iconEl ? iconEl.style.backgroundImage.match(/\((.*?)\)/)?.[1]?.replace(/('|")/g, '') : '';
	img.decoding = 'async';
	img.src = url || '';

	event.dataTransfer.setDragImage(img, 12, 12);
	event.dataTransfer.setData(
		'Text',
		JSON.stringify((window._OBJ_DRAG_ = { type: 'item', from: 'Inventory', data: item }))
	);

	onItemOut();
}

function onItemDragEnd() {
	delete window._OBJ_DRAG_;
}

function onItemInfo(event) {
	event.stopImmediatePropagation();

	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV2.getItemByIndex(index);
	if (!item) return false;

	if (event.altKey && event.which === 3) {
		event.stopImmediatePropagation();
		transferItemToOtherUI(item);
		return false;
	}

	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
		if (ItemCompare.ui) ItemCompare.remove();
		return false;
	}

	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);

	if (ItemCompare.ui) ItemCompare.remove();

	const compareItem = Equipment.getUI().isInEquipList(item.location);
	if (compareItem && InventoryV2.itemcomp) {
		ItemCompare.prepare();
		ItemCompare.append();
		ItemCompare.uid = compareItem.ITID;
		ItemCompare.setItem(compareItem);
	}

	return false;
}

function transferItemToOtherUI(item) {
	const storageUI = Storage.getUI();
	const isStorageOpen = storageUI._host ? storageUI._host.style.display !== 'none' : false;
	const isCartOpen = CartItems._host ? CartItems._host.style.display !== 'none' : false;

	if (!item) return false;
	const count = item.count || 1;

	if (isStorageOpen) {
		Storage.reqAddItem(item.index, count);
	} else if (isCartOpen) {
		InventoryV2.reqMoveItemToCart(item.index, count);
	}

	return true;
}

function onItemUsed(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = InventoryV2.getItemByIndex(index);
	if (item) {
		InventoryV2.useItem(item);
		onItemOut();
	}
	event.stopImmediatePropagation();
	event.preventDefault();
}

function onItemClick(event) {
	if (event.shiftKey && event.which === 1) {
		const idx = parseInt(this.getAttribute('data-index'), 10);
		const item = InventoryV2.getItemByIndex(idx);
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

function onTabDrop(event) {
	let item, data;
	event.stopImmediatePropagation();

	try {
		data = JSON.parse(event.dataTransfer.getData('Text'));
		item = data.data;
	} catch (_e) {
		return false;
	}

	if (data.type !== 'item') return false;
	if (!item) return false;

	const targetTab = event.target.getAttribute('data-tab');
	const itemfav = targetTab === 'fav' ? 0 : 1;

	const pkt = new PACKET.CZ.INVENTORY_TAB();
	pkt.item_index = item.index;
	pkt.favorite = itemfav;
	Network.sendPacket(pkt);
}

InventoryV2.updatePlaceETCTab = function (itemIndex, newValue) {
	const item = InventoryV2.getItemByIndex(itemIndex);
	if (!item) return;

	if (newValue) {
		let favoriteval;
		switch (item.type) {
			case ItemType.HEALING:
			case ItemType.USABLE:
			case ItemType.DELAYCONSUME:
			case ItemType.CASH:
			case ItemType.ETC:
			case ItemType.CARD:
			case ItemType.AMMO:
				favoriteval = 2;
				break;
			case ItemType.WEAPON:
			case ItemType.ARMOR:
			case ItemType.SHADOWGEAR:
			case ItemType.PETEGG:
			case ItemType.PETARMOR:
				favoriteval = 4;
				break;
			default:
				break;
		}
		item.PlaceETCTab = favoriteval;
	} else {
		item.PlaceETCTab = newValue;
	}

	requestFilter();
};

function onItemLock() {
	_preferences.itemlock = !_preferences.itemlock;
	InventoryV2.itemlock = _preferences.itemlock;
	const lockImg = _preferences.itemlock ? 'inventory/item_drop_lock_on.bmp' : 'inventory/item_drop_lock_off.bmp';
	Client.loadFile(DB.INTERFACE_PATH + lockImg, data => {
		const root = InventoryV2.getRoot();
		const btn = root.querySelector('.item_drop_lock');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
}

function onItemCompare() {
	_preferences.itemcomp = !_preferences.itemcomp;
	InventoryV2.itemcomp = _preferences.itemcomp;
	const compImg = _preferences.itemcomp ? 'inventory/item_compare_on.bmp' : 'inventory/item_compare_off.bmp';
	Client.loadFile(DB.INTERFACE_PATH + compImg, data => {
		const root = InventoryV2.getRoot();
		const btn = root.querySelector('.item_compare');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
}

function onNPCLock() {
	_preferences.npcsalelock = !_preferences.npcsalelock;
	InventoryV2.npcsalelock = _preferences.npcsalelock;
	const root = InventoryV2.getRoot();

	if (_preferences.npcsalelock) {
		const dealOn = root.querySelector('.deallock_on');
		if (dealOn) dealOn.style.display = '';
		const lockOverlay = root.querySelector('.lockoverlay');
		if (lockOverlay) lockOverlay.style.display = '';
		const lockMsg = root.querySelector('.lockoverlaymsg');
		if (lockMsg) lockMsg.style.display = '';
		const dealOff = root.querySelector('.deallock_off');
		if (dealOff) dealOff.style.display = 'none';

		lockOverlayTimeout = setTimeout(() => {
			const msg = root.querySelector('.lockoverlaymsg');
			if (msg) msg.style.display = 'none';
		}, 3000);
	} else {
		const dealOn = root.querySelector('.deallock_on');
		if (dealOn) dealOn.style.display = 'none';
		const lockOverlay = root.querySelector('.lockoverlay');
		if (lockOverlay) lockOverlay.style.display = 'none';
		const lockMsg = root.querySelector('.lockoverlaymsg');
		if (lockMsg) lockMsg.style.display = 'none';
		const dealOff = root.querySelector('.deallock_off');
		if (dealOff) dealOff.style.display = '';
	}
}

InventoryV2.addItemtoSwitch = function (index) {
	const item = this.getItemByIndex(index);
	if (!item) {
		console.warn(`Item with index ${index} not found in inventory.`);
		return;
	}

	const existingItemIndex = this.equipswitchlist.findIndex(existingItem => existingItem.location === item.location);

	if (existingItemIndex > -1) {
		const existingItem = this.equipswitchlist[existingItemIndex];
		SwitchEquip.unEquip(existingItem.index, existingItem.location);
		this.equipswitchlist.splice(existingItemIndex, 1);
	}

	this.equipswitchlist.push(item);

	const root = InventoryV2.getRoot();
	Client.loadFile(DB.INTERFACE_PATH + 'swap_equipment/bg_change.bmp', data => {
		const el = root.querySelector(`.item[data-index="${item.index}"] .switch1`);
		if (el) el.style.backgroundImage = `url(${data})`;
	});
	Client.loadFile(DB.INTERFACE_PATH + 'swap_equipment/ico_change.bmp', data => {
		const el = root.querySelector(`.item[data-index="${item.index}"] .switch2`);
		if (el) el.style.backgroundImage = `url(${data})`;
	});

	SwitchEquip.equip(item, item.location, true);
	ChatBox.addText(DB.getItemName(item) + ' ' + DB.getMessage(3143), ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM);
};

InventoryV2.removeItemFromSwitch = function (index) {
	const item = this.getItemByIndex(index);
	if (!item) {
		console.warn(`Item with index ${index} not found in inventory.`);
		return;
	}

	const existingItemIndex = this.equipswitchlist.findIndex(existingItem => existingItem.index === item.index);

	if (existingItemIndex > -1) {
		const root = InventoryV2.getRoot();
		const sw1 = root.querySelector(`.item[data-index="${item.index}"] .switch1`);
		if (sw1) sw1.style.backgroundImage = 'none';
		const sw2 = root.querySelector(`.item[data-index="${item.index}"] .switch2`);
		if (sw2) sw2.style.backgroundImage = 'none';

		SwitchEquip.unEquip(item.index, item.location);
		this.equipswitchlist.splice(existingItemIndex, 1);

		ChatBox.addText(DB.getItemName(item) + ' ' + DB.getMessage(3144), ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM);

		Equipment.getUI().equipItemsToSwitch();
		InventoryV2.equipAllFromSwitchList();
	}
};

InventoryV2.equipAllFromSwitchList = function equipAllFromSwitchList() {
	const equipSwitchList = InventoryV2.equipswitchlist;
	for (let i = 0; i < equipSwitchList.length; i++) {
		const item = equipSwitchList[i];
		if (item) {
			SwitchEquip.equip(item, item.location, true);
		}
	}
};

InventoryV2.onUseItem = function OnUseItem(/* index */) {};
InventoryV2.onUseCard = function onUseCard(/* index */) {};
InventoryV2.onEquipItem = function OnEquipItem(/* index, location */) {};
InventoryV2.onUpdateItem = function OnUpdateItem(/* index, amount */) {};
InventoryV2.reqMoveItemToCart = function reqMoveItemToCart(/* index, amount */) {};

export default UIManager.addComponent(InventoryV2);
