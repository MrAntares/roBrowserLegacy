/**
 * UI/Components/Equipment/EquipmentV0/EquipmentV0.js
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
import htmlText from './EquipmentV0.html?raw';
import cssText from './EquipmentV0.css?raw';
import Inventory from 'UI/Components/Inventory/Inventory.js';

const EquipmentV0 = new GUIComponent('EquipmentV0', cssText);

EquipmentV0.render = () => htmlText;

const _preferences = Preferences.get(
	'EquipmentV0',
	{
		x: 480,
		y: 200,
		show: false,
		reduce: false,
		stats: false
	},
	1.0
);

let _list = {};
let _ctx;
let _showEquip = false;
let _btnLevelUp;

function _getRoot() {
	return EquipmentV0._shadow || EquipmentV0._host;
}

function escapeHTML(str) {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

EquipmentV0.init = function init() {
	const root = _getRoot();
	const canvas = root.querySelector('canvas');
	if (canvas) _ctx = canvas.getContext('2d');

	if (UIVersionManager.getEquipmentVersion() > 0) {
		const lvlupEl = root.querySelector('#lvlup_base');
		if (lvlupEl) {
			_btnLevelUp = lvlupEl;
			lvlupEl.remove();
			_btnLevelUp.addEventListener('mousedown', e => e.stopImmediatePropagation());
			_btnLevelUp.addEventListener('click', () => {
				if (_btnLevelUp.parentNode) _btnLevelUp.remove();
				EquipmentV0._host.style.display = '';
				EquipmentV0._host.parentNode.appendChild(EquipmentV0._host);

				if (EquipmentV0._host.style.display !== 'none') {
					Renderer.render(renderCharacter);
				}
			});
		}
	} else {
		const footer = root.querySelector('#equipment_footer');
		if (footer) footer.remove();
		const rootEl = root.querySelector('#EquipmentV0');
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
			EquipmentV0._host.style.display = 'none';
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
			e.preventDefault();
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

EquipmentV0.onAppend = function onAppend() {
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
			winStats.embed(EquipmentV0._host);
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

EquipmentV0.onRemove = function onRemove() {
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

EquipmentV0.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
		Renderer.render(renderCharacter);
		if (UIVersionManager.getEquipmentVersion() > 0) {
			if (_btnLevelUp && _btnLevelUp.parentNode) _btnLevelUp.remove();
			if (_preferences.stats) {
				WinStats.getUI().embed(EquipmentV0._host);
			}
		}
		this.focus();
	} else {
		this._host.style.display = 'none';
		Renderer.stop(renderCharacter);
		hideStatus();
	}
};

EquipmentV0.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

EquipmentV0.setEquipConfig = function setEquipConfig(on) {
	_showEquip = on;
	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', data => {
		const root = _getRoot();
		const btn = root.querySelector('.show_equip');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
};

EquipmentV0.setCostumeConfig = function setCostumeConfig(_on) {};

EquipmentV0.equip = function equip(item, location) {
	const it = DB.getItemInfo(item.ITID);
	_list[item.index] = item;

	if (arguments.length === 1) {
		if ('WearState' in item) {
			location = item.WearState;
		} else if ('location' in item) {
			location = item.location;
		}
	}

	function add3Dots(string, limit) {
		function stripHTML(str) {
			const div = document.createElement('div');
			div.innerHTML = str;
			return div.textContent || div.innerText || '';
		}
		const text = stripHTML(string);
		if (text.length > limit) {
			return text.substring(0, limit) + '...';
		}
		return text;
	}

	const root = _getRoot();
	const selector = getSelectorFromLocation(location);
	const cells = root.querySelectorAll(selector);
	cells.forEach(cell => {
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

EquipmentV0.unEquip = function unEquip(index, location) {
	const selector = getSelectorFromLocation(location);
	const root = _getRoot();
	const item = _list[index];

	root.querySelectorAll(selector).forEach(el => {
		el.innerHTML = '';
	});
	delete _list[index];

	return item;
};

EquipmentV0.onLevelUp = function onLevelUp() {
	if (UIVersionManager.getEquipmentVersion() > 0 && _btnLevelUp) {
		document.body.appendChild(_btnLevelUp);
	}
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
		winStats.embed(EquipmentV0._host);
		_preferences.stats = true;
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', data => {
		if (self) self.style.backgroundImage = `url(${data})`;
	});
}

function toggleEquip() {
	EquipmentV0.onConfigUpdate(0, !_showEquip ? 1 : 0);
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
		const character = Session.Entity;
		const direction = character.direction;
		const headDir = character.headDir;
		const action = character.action;
		const animation = character.animation;

		if (character.effectState !== _lastState || _hasCart !== character.hasCart) {
			_lastState = character.effectState;
			_hasCart = character.hasCart;

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

		Camera.direction = 4;
		character.direction = 4;
		character.headDir = 0;
		character.action = character.ACTION.IDLE;
		character.animation = _animation;

		_savedColor.set(character.effectColor);
		character.effectColor.set(_cleanColor);

		SpriteRenderer.bind2DContext(_ctx, 30, 130);
		_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
		character.renderEntity();

		character.direction = direction;
		character.headDir = headDir;
		character.action = action;
		character.animation = animation;
		character.effectColor.set(_savedColor);
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
			EquipmentV0.onEquipItem(item.index, 'location' in item ? item.location : item.WearState);
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
	EquipmentV0.onUnEquip(index);
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

EquipmentV0.onUpdateOwnerName = function () {
	const root = _getRoot();
	for (const index in _list) {
		const item = _list[index];
		if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1)) {
			const nameEl = root.querySelector(`.item[data-index="${index}"] .itemName`);
			if (nameEl) nameEl.textContent = DB.getItemName(item);
		}
	}
};

EquipmentV0.getNumber = function () {
	let num = 0;
	for (const key in _list) {
		if (_list[key].location && _list[key].location !== EquipLocation.AMMO) {
			num++;
		}
	}
	return num;
};

EquipmentV0.checkEquipLoc = function checkEquipLoc(_location) {
	return 0;
};

EquipmentV0.getCurrentTabId = function () {
	return 'general';
};

EquipmentV0.onUnEquip = function onUnEquip(/* index */) {};
EquipmentV0.onConfigUpdate = function onConfigUpdate(/* type, value*/) {};
EquipmentV0.onEquipItem = function onEquipItem(/* index, location */) {};
EquipmentV0.onRemoveCart = function onRemoveCart() {};

export default UIManager.addComponent(EquipmentV0);
