/**
 * UI/Components/Equipment/EquipmentV2/EquipmentV2.js
 *
 * Chararacter Equipment window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import StatusConst from 'DB/Status/StatusState.js';
import EquipLocation from 'DB/Items/EquipmentLocation.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import ItemType from 'DB/Items/ItemType.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import Renderer from 'Renderer/Renderer.js';
import Camera from 'Renderer/Camera.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import UIVersionManager from 'UI/UIVersionManager.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import htmlText from './EquipmentV2.html?raw';
import cssText from './EquipmentV2.css?raw';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Entity from 'Renderer/Entity/Entity.js';

const EquipmentV2 = new GUIComponent('EquipmentV2', cssText);

EquipmentV2.render = () => htmlText;

const _preferences = Preferences.get(
	'EquipmentV2',
	{
		x: 480,
		y: 200,
		show: false,
		reduce: false,
		stats: true
	},
	1.0
);

let _list = {};
const _ctx = [];
let _showEquip = false;
let _btnLevelUp;

const tabLinks = {};
const contentDivs = {};
let currentTabId = 'general';

function _getRoot() {
	return EquipmentV2._shadow || EquipmentV2._host;
}

function escapeHTML(str) {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

EquipmentV2.init = function init() {
	const root = _getRoot();
	const canvases = root.querySelectorAll('canvas');
	if (canvases[0]) _ctx.push(canvases[0].getContext('2d'));
	if (canvases[1]) _ctx.push(canvases[1].getContext('2d'));

	const tabsEl = root.querySelector('#tabs');
	if (tabsEl) {
		const tabListItems = tabsEl.childNodes;
		for (let i = 0; i < tabListItems.length; i++) {
			if (tabListItems[i].nodeName === 'DIV') {
				const tabLink = getFirstChildWithTagName(tabListItems[i], 'A');
				if (tabLink) {
					const id = getHash(tabLink.getAttribute('href'));
					tabLinks[id] = tabLink;
					contentDivs[id] = root.querySelector(`#${id}`);
				}
			}
		}
	}

	let idx = 0;
	for (const id in tabLinks) {
		tabLinks[id].onclick = showTab;
		tabLinks[id].onfocus = function () {
			this.blur();
		};
		if (idx === 0) tabLinks[id].className = 'tab selected';
		idx++;
	}

	idx = 0;
	for (const id in contentDivs) {
		if (contentDivs[id]) {
			if (idx !== 0) contentDivs[id].classList.add('content', 'hide');
			idx++;
		}
	}

	if (UIVersionManager.getEquipmentVersion() > 0) {
		const lvlupEl = root.querySelector('#lvlup_base');
		if (lvlupEl) {
			_btnLevelUp = lvlupEl;
			lvlupEl.remove();
			_btnLevelUp.addEventListener('mousedown', e => e.stopImmediatePropagation());
			_btnLevelUp.addEventListener('click', () => {
				if (_btnLevelUp.parentNode) _btnLevelUp.remove();
				EquipmentV2._host.style.display = '';
				EquipmentV2._host.parentNode.appendChild(EquipmentV2._host);
				if (EquipmentV2._host.style.display !== 'none') {
					Renderer.render(renderCharacter);
				}
			});
		}
	} else {
		const footer = root.querySelector('#equipment_footer');
		if (footer) footer.remove();
		const rootEl = root.querySelector('#EquipmentV2');
		if (rootEl) rootEl.classList.add('equipmentV0');
		const lvlup = root.querySelector('#lvlup_base');
		if (lvlup) lvlup.remove();
	}

	const baseBtn = root.querySelector('.titlebar .base');
	if (baseBtn) baseBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());

	const miniBtn = root.querySelector('.titlebar .mini');
	if (miniBtn) {
		miniBtn.addEventListener('click', () => {
			const panel = root.querySelector('.panel');
			if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
		});
	}

	const closeBtn = root.querySelector('.titlebar .close');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			EquipmentV2._host.style.display = 'none';
			Renderer.stop(renderCharacter);
			hideStatus();
		});
	}

	const removeOptBtn = root.querySelector('.removeOption');
	if (removeOptBtn) removeOptBtn.addEventListener('mousedown', onRemoveOption);
	const viewStatusBtn = root.querySelector('.view_status');
	if (viewStatusBtn) viewStatusBtn.addEventListener('mousedown', toggleStatus);
	const showEquipBtn = root.querySelector('.show_equip');
	if (showEquipBtn) showEquipBtn.addEventListener('mousedown', toggleEquip);
	const cartBtn = root.querySelector('.cartitems');
	if (cartBtn) cartBtn.addEventListener('click', onCartItems);

	this._host.addEventListener('dragover', onDragOver);
	this._host.addEventListener('dragleave', onDragLeave);
	this._host.addEventListener('drop', onDrop);

	const content = root.querySelector('.content');
	if (content) {
		content.addEventListener('contextmenu', e => {
			const item = e.target.closest('.item');
			if (item) onEquipmentInfo.call(item, e);
		});
		content.addEventListener('dblclick', e => {
			const item = e.target.closest('.item');
			if (item) onEquipmentUnEquip.call(item, e);
		});
		content.addEventListener('mouseover', e => {
			const btn = e.target.closest('button');
			if (btn) onEquipmentOver.call(btn, e);
		});
		content.addEventListener('mouseout', e => {
			const btn = e.target.closest('button');
			if (btn) onEquipmentOut();
		});
	}

	this.draggable('.titlebar');
};

function showTab() {
	const selectedId = getHash(this.getAttribute('href'));

	for (const id in contentDivs) {
		if (id === selectedId) {
			tabLinks[id].className = 'tab selected';
			if (contentDivs[id]) contentDivs[id].className = 'content';
		} else {
			tabLinks[id].className = 'tab';
			if (contentDivs[id]) contentDivs[id].classList.add('content', 'hide');
		}
	}

	currentTabId = selectedId;
	return false;
}

function getFirstChildWithTagName(element, tagName) {
	for (let i = 0; i < element.childNodes.length; i++) {
		if (element.childNodes[i].nodeName === tagName.toUpperCase()) {
			return element.childNodes[i];
		}
	}
}

function getHash(url) {
	const hashPos = url.lastIndexOf('#');
	return url.substring(hashPos + 1);
}

EquipmentV2.getCurrentTabId = function () {
	return currentTabId;
};

function onCartItems() {
	if (Session.Entity.hasCart === false) return;
	if (CartItems._host) {
		CartItems._host.style.display = CartItems._host.style.display === 'none' ? '' : 'none';
	}
}

function onRemoveOption() {
	const pkt = new PACKET.CZ.REQ_CARTOFF();
	Network.sendPacket(pkt);
}

EquipmentV2.onAppend = function onAppend() {
	const hostRect = this._host.getBoundingClientRect();
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width)}px`;

	if (!_preferences.show) {
		this._host.style.display = 'none';
	}

	if (_preferences.reduce) {
		const root = _getRoot();
		const panel = root.querySelector('.panel');
		if (panel) panel.style.display = 'none';
	}

	if (UIVersionManager.getEquipmentVersion() > 0) {
		if (_preferences.stats && _preferences.show) {
			const winStats = WinStats.getUI();
			winStats.embed(EquipmentV2._host);
		} else {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/viewon.bmp', data => {
				const root = _getRoot();
				const btn = root.querySelector('.view_status');
				if (btn) btn.style.backgroundImage = `url(${data})`;
			});
		}
	}

	const root = _getRoot();
	const canvas = root.querySelector('canvas');
	if (canvas && this._host.style.display !== 'none') {
		Renderer.render(renderCharacter);
	}
};

EquipmentV2.onRemove = function onRemove() {
	if (UIVersionManager.getEquipmentVersion() > 0 && _btnLevelUp && _btnLevelUp.parentNode) {
		_btnLevelUp.remove();
	}

	Renderer.stop(renderCharacter);

	_list = {};
	const root = _getRoot();
	root.querySelectorAll('.col1, .col3, .ammo').forEach(el => {
		el.innerHTML = '';
	});

	_preferences.show = this._host.style.display !== 'none';
	const panel = root.querySelector('.panel');
	_preferences.reduce = panel ? panel.style.display === 'none' : false;
	const winStats = WinStats.getUI();
	_preferences.stats = winStats.isEmbedded();
	hideStatus();
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
};

EquipmentV2.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
		Renderer.render(renderCharacter);
		if (UIVersionManager.getEquipmentVersion() > 0) {
			if (_btnLevelUp && _btnLevelUp.parentNode) _btnLevelUp.remove();
			if (_preferences.stats) {
				WinStats.getUI().embed(EquipmentV2._host);
			}
		}
		this.focus();
	} else {
		this._host.style.display = 'none';
		Renderer.stop(renderCharacter);
		hideStatus();
	}
};

EquipmentV2.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

EquipmentV2.setEquipConfig = function setEquipConfig(on) {
	_showEquip = on;
	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', data => {
		const root = _getRoot();
		const btn = root.querySelector('.show_equip');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
};

EquipmentV2.setCostumeConfig = function setCostumeConfig(_on) {};

EquipmentV2.equip = function equip(item, location) {
	const it = DB.getItemInfo(item.ITID);
	item.equipped = location;
	_list[item.index] = item;

	function add3Dots(string, limit) {
		function stripHTML(str) {
			const div = document.createElement('div');
			div.innerHTML = str;
			return div.textContent || div.innerText || '';
		}
		const text = stripHTML(string);
		if (text.length > limit) return text.substring(0, limit) + '...';
		return text;
	}

	const root = _getRoot();
	const selector = getSelectorFromLocation(location);
	root.querySelectorAll(selector).forEach(cell => {
		cell.innerHTML =
			'<div class="item" data-index="' +
			item.index +
			'">' +
			'<button></button>' +
			'<span class="itemName">' +
			escapeHTML(
				add3Dots(
					DB.getItemName(item, { showItemGrade: false, showItemSlots: false, showItemOptions: false }),
					25
				)
			) +
			'</span>' +
			'</div>';
	});

	Client.loadFile(DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp', data => {
		const btn = root.querySelector(`.item[data-index="${item.index}"] button`);
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});

	if (!Inventory.getUI().equippedItems.includes(item.index)) {
		Inventory.getUI().equippedItems.push(item.index);
	}
};

EquipmentV2.unEquip = function unEquip(index, location) {
	const selector = getSelectorFromLocation(location);
	const root = _getRoot();
	const item = _list[index];
	item.equipped = 0;

	root.querySelectorAll(selector).forEach(el => {
		el.innerHTML = '';
	});
	delete _list[index];

	return item;
};

EquipmentV2.onLevelUp = function onLevelUp() {
	if (UIVersionManager.getEquipmentVersion() > 0 && _btnLevelUp) {
		document.body.appendChild(_btnLevelUp);
	}
};

EquipmentV2.checkEquipLoc = function checkEquipLoc(location) {
	for (const key in _list) {
		if (_list[key].equipped & location) {
			return _list[key].wItemSpriteNumber;
		}
	}
	return 0;
};

function hideStatus() {
	const winStats = WinStats.getUI();
	if (winStats.isEmbedded()) {
		winStats.unembed();
	}
}

function toggleStatus() {
	const root = _getRoot();
	const self = root.querySelector('.view_status');
	const winStats = WinStats.getUI();
	const isVisible = winStats.isEmbedded();
	const state = isVisible ? 'on' : 'off';

	if (isVisible) {
		winStats.unembed();
		_preferences.stats = false;
	} else {
		winStats.embed(EquipmentV2._host);
		_preferences.stats = true;
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', data => {
		if (self) self.style.backgroundImage = `url(${data})`;
	});
}

function toggleEquip() {
	EquipmentV2.onConfigUpdate(0, !_showEquip ? 1 : 0);
}

const renderCharacter = (function renderCharacterClosure() {
	let _lastState = 0;
	let _hasCart = 0;

	const _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
	const _savedColor = new Float32Array(4);
	const _animation = {
		tick: 0,
		frame: 0,
		repeat: true,
		play: true,
		next: false,
		delay: 0,
		save: false
	};

	const HasAttachmentState =
		StatusConst.EffectState.FALCON |
		StatusConst.EffectState.RIDING |
		StatusConst.EffectState.DRAGON1 |
		StatusConst.EffectState.DRAGON2 |
		StatusConst.EffectState.DRAGON3 |
		StatusConst.EffectState.DRAGON4 |
		StatusConst.EffectState.DRAGON5 |
		StatusConst.EffectState.MADOGEAR |
		StatusConst.EffectState.CART1 |
		StatusConst.EffectState.CART2 |
		StatusConst.EffectState.CART3 |
		StatusConst.EffectState.CART4 |
		StatusConst.EffectState.CART5;

	const HasCartState =
		StatusConst.EffectState.CART1 |
		StatusConst.EffectState.CART2 |
		StatusConst.EffectState.CART3 |
		StatusConst.EffectState.CART4 |
		StatusConst.EffectState.CART5;

	return function renderChar() {
		const equip_character = new Entity();
		equip_character.set({
			GID: Session.Entity.GID + '_EQUIP',
			objecttype: equip_character.constructor.TYPE_PC,
			job: Session.Entity.job,
			sex: Session.Entity.sex,
			name: '',
			hideShadow: true,
			head: Session.Entity.head,
			headpalette: Session.Entity.headpalette,
			bodypalette: Session.Entity.bodypalette
		});

		if (Session.Entity.effectState !== _lastState || _hasCart !== Session.Entity.hasCart) {
			_lastState = Session.Entity.effectState;
			_hasCart = Session.Entity.hasCart;

			const root = _getRoot();
			const removeOpt = root.querySelector('.removeOption');
			const cartBtn = root.querySelector('.cartitems');

			if (_lastState & HasAttachmentState || _hasCart) {
				if (removeOpt) removeOpt.style.display = '';
			} else {
				if (removeOpt) removeOpt.style.display = 'none';
			}

			if (_lastState & HasCartState || _hasCart) {
				if (cartBtn) cartBtn.style.display = '';
			} else {
				if (cartBtn) cartBtn.style.display = 'none';
			}
		}

		if (currentTabId === 'general') {
			equip_character.accessory = EquipmentV2.checkEquipLoc(EquipLocation.HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV2.checkEquipLoc(EquipLocation.HEAD_TOP);
			equip_character.accessory3 = EquipmentV2.checkEquipLoc(EquipLocation.HEAD_MID);
			equip_character.robe = EquipmentV2.checkEquipLoc(EquipLocation.GARMENT);
		} else if (currentTabId === 'costume') {
			equip_character.accessory = EquipmentV2.checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV2.checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
			equip_character.accessory3 = EquipmentV2.checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
			equip_character.robe = EquipmentV2.checkEquipLoc(EquipLocation.COSTUME_ROBE);
		}

		_savedColor.set(equip_character.effectColor);
		equip_character.effectColor.set(_cleanColor);

		Camera.direction = 0;
		equip_character.direction = 0;
		equip_character.headDir = 0;
		equip_character.action = equip_character.ACTION.IDLE;
		equip_character.animation = _animation;

		for (let i = 0; i < _ctx.length; i++) {
			const ctx = _ctx[i];
			SpriteRenderer.bind2DContext(ctx, 30, 130);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			equip_character.renderEntity(ctx);
		}
	};
})();

function getSelectorFromLocation(location) {
	const selector = [];
	if (location & EquipLocation.HEAD_TOP) selector.push('.head_top');
	if (location & EquipLocation.HEAD_MID) selector.push('.head_mid');
	if (location & EquipLocation.HEAD_BOTTOM) selector.push('.head_bottom');
	if (location & EquipLocation.ARMOR) selector.push('.armor');
	if (location & EquipLocation.WEAPON) selector.push('.weapon');
	if (location & EquipLocation.SHIELD) selector.push('.shield');
	if (location & EquipLocation.GARMENT) selector.push('.garment');
	if (location & EquipLocation.SHOES) selector.push('.shoes');
	if (location & EquipLocation.ACCESSORY1) selector.push('.accessory1');
	if (location & EquipLocation.ACCESSORY2) selector.push('.accessory2');
	if (location & EquipLocation.AMMO) selector.push('.ammo');
	if (location & EquipLocation.COSTUME_HEAD_TOP) selector.push('.costume_head_top');
	if (location & EquipLocation.COSTUME_HEAD_MID) selector.push('.costume_head_mid');
	if (location & EquipLocation.COSTUME_HEAD_BOTTOM) selector.push('.costume_head_bottom');
	if (location & EquipLocation.SHADOW_ARMOR) selector.push('.shadow_armor');
	if (location & EquipLocation.SHADOW_WEAPON) selector.push('.shadow_weapon');
	if (location & EquipLocation.SHADOW_SHIELD) selector.push('.shadow_shield');
	if (location & EquipLocation.COSTUME_ROBE) selector.push('.shadow_garment');
	if (location & EquipLocation.SHADOW_SHOES) selector.push('.shadow_shoes');
	if (location & EquipLocation.SHADOW_R_ACCESSORY_SHADOW) selector.push('.shadow_accessory1');
	if (location & EquipLocation.SHADOW_L_ACCESSORY_SHADOW) selector.push('.shadow_accessory2');
	return selector.join(', ');
}

function onDragOver(event) {
	if (window._OBJ_DRAG_) {
		const data = window._OBJ_DRAG_;
		if (data.type === 'item') {
			const item = data.data;
			if (
				(item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) &&
				item.IsIdentified &&
				!item.IsDamaged
			) {
				const selector = getSelectorFromLocation('location' in item ? item.location : item.WearLocation);
				const root = _getRoot();
				const cells = root.querySelectorAll(selector);
				Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/item_invert.bmp', _data => {
					cells.forEach(c => {
						c.style.backgroundImage = `url(${_data})`;
					});
				});
			}
		}
	}
	event.stopImmediatePropagation();
	return false;
}

function onDragLeave(event) {
	const root = _getRoot();
	root.querySelectorAll('td').forEach(td => {
		td.style.backgroundImage = 'none';
	});
	event.stopImmediatePropagation();
	return false;
}

function onDrop(event) {
	let item, data;
	event.stopImmediatePropagation();

	try {
		data = JSON.parse(event.dataTransfer.getData('Text'));
	} catch (_e) {
		return false;
	}

	if (data && data.type === 'item') {
		item = data.data;
		if (
			(item.type === ItemType.WEAPON ||
				item.type === ItemType.ARMOR ||
				item.type === ItemType.AMMO ||
				item.type === ItemType.SHADOWGEAR) &&
			item.IsIdentified &&
			!item.IsDamaged
		) {
			const root = _getRoot();
			root.querySelectorAll('td').forEach(td => {
				td.style.backgroundImage = 'none';
			});
			EquipmentV2.onEquipItem(item.index, 'location' in item ? item.location : item.WearState);
		}
	}

	return false;
}

function onEquipmentInfo(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = _list[index];

	if (item) {
		if (ItemInfo.uid === item.ITID) {
			ItemInfo.remove();
		} else {
			ItemInfo.append();
			ItemInfo.uid = item.ITID;
			ItemInfo.setItem(item);
		}
	}

	event.stopImmediatePropagation();
	return false;
}

function onEquipmentUnEquip() {
	const index = parseInt(this.getAttribute('data-index'), 10);
	EquipmentV2.onUnEquip(index);
	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';
}

function onEquipmentOver() {
	const idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
	const item = _list[idx];
	if (!item) return;

	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	const top = this.offsetTop;
	const left = this.offsetLeft;
	if (!top && !left) return;

	if (overlay) {
		overlay.style.display = 'block';
		overlay.style.top = `${top - 22}px`;
		overlay.style.left = `${left - 22}px`;
		overlay.textContent = DB.getItemName(item);
	}
}

function onEquipmentOut() {
	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';
}

EquipmentV2.onUpdateOwnerName = function () {
	const root = _getRoot();
	for (const index in _list) {
		const item = _list[index];
		if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1)) {
			const nameEl = root.querySelector(`.item[data-index="${index}"] .itemName`);
			if (nameEl) nameEl.textContent = DB.getItemName(item);
		}
	}
};

EquipmentV2.getNumber = function () {
	let num = 0;
	for (const key in _list) {
		if (_list[key].location && _list[key].location !== EquipLocation.AMMO) {
			num++;
		}
	}
	return num;
};

EquipmentV2.isInEquipList = function () {
	return 0;
};

EquipmentV2.onUnEquip = function onUnEquip(/* index */) {};
EquipmentV2.onConfigUpdate = function onConfigUpdate(/* type, value*/) {};
EquipmentV2.onEquipItem = function onEquipItem(/* index, location */) {};
EquipmentV2.onRemoveCart = function onRemoveCart() {};

export default UIManager.addComponent(EquipmentV2);
