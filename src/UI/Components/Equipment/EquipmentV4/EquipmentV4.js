/**
 * UI/Components/Equipment/EquipmentV4/EquipmentV4.js
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
import PACKETVER from 'Network/PacketVerManager.js';
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
import SwitchEquip from 'UI/Components/SwitchEquip/SwitchEquip.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import GraphicsSettings from 'Preferences/GraphicsSettings.js';
import htmlText from './EquipmentV4.html?raw';
import cssText from './EquipmentV4.css?raw';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Entity from 'Renderer/Entity/Entity.js';

const EquipmentV4 = new GUIComponent('EquipmentV4', cssText);

EquipmentV4.render = () => htmlText;

const _preferences = Preferences.get(
	'EquipmentV4',
	{
		x: 480,
		y: 200,
		show: false,
		reduce: false,
		stats: true
	},
	1.0
);

EquipmentV4._itemlist = {};
const _ctx = [];
let _showEquip = false;
let _hideCostume = false;
let _currentTitleId = 0;
let _btnLevelUp;

const tabLinks = {};
const contentDivs = {};
let currentTabId = 'general';

let switchappend;
let switchUIopen;

function _getRoot() {
	return EquipmentV4._shadow || EquipmentV4._host;
}

function escapeHTML(str) {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

EquipmentV4.init = function init() {
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
				const winStatsUI = WinStats.getUI();
				if (winStatsUI._host) winStatsUI._host.style.display = '';
			});
		}
	} else {
		const footer = root.querySelector('#equipment_footer');
		if (footer) footer.remove();
		const rootEl = root.querySelector('#EquipmentV4');
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
			EquipmentV4._host.style.display = 'none';
			Renderer.stop(renderCharacter);
		});
	}

	const removeOptBtn = root.querySelector('.removeOption');
	if (removeOptBtn) removeOptBtn.addEventListener('mousedown', onRemoveOption);
	const viewStatusBtn = root.querySelector('.view_status');
	if (viewStatusBtn) viewStatusBtn.addEventListener('mousedown', toggleStatus);
	const showEquipBtn = root.querySelector('.show_equip');
	if (showEquipBtn) showEquipBtn.addEventListener('mousedown', toggleEquip);
	const showCostumeBtn = root.querySelector('.show_costume');
	if (showCostumeBtn) showCostumeBtn.addEventListener('mousedown', toggleCostume);
	const cartBtn = root.querySelector('.cartitems');
	if (cartBtn) cartBtn.addEventListener('click', onCartItems);
	const switchEquipBtn = root.querySelector('.switch_equip');
	if (switchEquipBtn) switchEquipBtn.addEventListener('click', onSwtichEquip);

	this.loadTitles();

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

	switchappend = root.querySelector('.footer');

	const costumeBtn2 = root.querySelector('.show_costume');
	if (costumeBtn2) costumeBtn2.style.display = 'none';
	const costumeSpan = costumeBtn2 ? costumeBtn2.nextElementSibling : null;
	if (costumeSpan && costumeSpan.tagName === 'SPAN') costumeSpan.style.display = 'none';

	// Damage Skin Settings
	const skinButtons = root.querySelectorAll('#damageskin .skin-option');
	skinButtons.forEach(btn => {
		btn.setAttribute('data-background', 'showdamage/btn_damage.bmp');
		btn.setAttribute('data-hover', 'showdamage/btn_damage_press.bmp');
		btn.setAttribute('data-down', 'showdamage/btn_damage_pick.bmp');
	});
	if (this.parseHTML) {
		skinButtons.forEach(btn => {
			this.parseHTML.call(btn);
		});
	}
	skinButtons.forEach(btn => {
		btn.addEventListener('mousedown', function () {
			const skinId = parseInt(this.getAttribute('data-skin'), 10);
			EquipmentV4.setDamageSkin(skinId);
		});
	});
	let savedSkin = GraphicsSettings.damageSkin;
	savedSkin = savedSkin !== undefined && savedSkin !== null ? savedSkin : 0;
	EquipmentV4.setDamageSkin(savedSkin);

	// Damage Motion Settings
	const motionChecks = root.querySelectorAll('.motion-check');
	if (this.parseHTML) {
		motionChecks.forEach(btn => {
			this.parseHTML.call(btn);
		});
	}
	motionChecks.forEach(btn => {
		btn.addEventListener('mousedown', function () {
			const motionId = parseInt(this.getAttribute('data-motion'), 10);
			EquipmentV4.setDamageMotion(motionId);
		});
	});
	let savedMotion = GraphicsSettings.damageMotion;
	savedMotion = savedMotion !== undefined && savedMotion !== null ? savedMotion : 0;
	EquipmentV4.setDamageMotion(savedMotion);
};

EquipmentV4.loadTitles = function () {
	const root = _getRoot();
	const titleList = root.querySelector('#title_list');
	if (!titleList) return;
	titleList.innerHTML = '';

	const removeTitleText = DB.getMessage(2686) || 'Remove Title';
	const removeSelectedClass = _currentTitleId === 0 ? ' selected' : '';
	const removeEl = document.createElement('div');
	removeEl.className = `title-option${removeSelectedClass}`;
	removeEl.setAttribute('data-title', '0');
	removeEl.textContent = removeTitleText;
	titleList.appendChild(removeEl);

	const allTitles = DB.getAllTitles();
	for (const titleId in allTitles) {
		if (allTitles.hasOwnProperty(titleId)) {
			const titleName = allTitles[titleId];
			const selectedClass = parseInt(titleId) === _currentTitleId ? ' selected' : '';
			const titleEl = document.createElement('div');
			titleEl.className = `title-option${selectedClass}`;
			titleEl.setAttribute('data-title', titleId);
			titleEl.textContent = titleName;
			titleList.appendChild(titleEl);
		}
	}

	titleList.addEventListener('click', e => {
		const option = e.target.closest('.title-option');
		if (option) {
			e.preventDefault();
			e.stopPropagation();
			const titleId = parseInt(option.getAttribute('data-title'));
			EquipmentV4.selectTitle(titleId);
		}
	});
};

EquipmentV4.selectTitle = function (titleId) {
	const pkt = new PACKET.CZ.REQ_CHANGE_TITLE();
	pkt.title_id = titleId;
	Network.sendPacket(pkt);
};

EquipmentV4.setTitle = function OnSetTitle(titleId) {
	_currentTitleId = titleId;
	EquipmentV4.loadTitles();
};

function showTab() {
	const selectedId = getHash(this.getAttribute('href'));
	const root = _getRoot();

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

	if (SwitchEquip.ui) {
		SwitchEquip.showSwapTab(currentTabId);
	}

	if (currentTabId !== 'general') {
		if (SwitchEquip.ui) {
			const switchHost = SwitchEquip._host || SwitchEquip.ui;
			switchUIopen = switchHost.style ? switchHost.style.display !== 'none' : false;
			if (switchHost.style) switchHost.style.display = 'none';
		}
		const switchBtn = root.querySelector('.switch_equip');
		if (switchBtn) switchBtn.style.display = 'none';

		const showEquipEl = root.querySelector('.show_equip');
		if (showEquipEl) showEquipEl.style.display = 'none';
		const showEquipSpan = showEquipEl ? showEquipEl.nextElementSibling : null;
		if (showEquipSpan && showEquipSpan.tagName === 'SPAN') showEquipSpan.style.display = 'none';

		if (currentTabId === 'costume') {
			const costumeEl = root.querySelector('.show_costume');
			if (costumeEl) costumeEl.style.display = '';
			const costumeSpan = costumeEl ? costumeEl.nextElementSibling : null;
			if (costumeSpan && costumeSpan.tagName === 'SPAN') costumeSpan.style.display = '';
		} else {
			const costumeEl = root.querySelector('.show_costume');
			if (costumeEl) costumeEl.style.display = 'none';
			const costumeSpan = costumeEl ? costumeEl.nextElementSibling : null;
			if (costumeSpan && costumeSpan.tagName === 'SPAN') costumeSpan.style.display = 'none';
		}
	} else {
		const showEquipEl = root.querySelector('.show_equip');
		if (showEquipEl) showEquipEl.style.display = '';
		const showEquipSpan = showEquipEl ? showEquipEl.nextElementSibling : null;
		if (showEquipSpan && showEquipSpan.tagName === 'SPAN') showEquipSpan.style.display = '';

		const costumeEl = root.querySelector('.show_costume');
		if (costumeEl) costumeEl.style.display = 'none';
		const costumeSpan = costumeEl ? costumeEl.nextElementSibling : null;
		if (costumeSpan && costumeSpan.tagName === 'SPAN') costumeSpan.style.display = 'none';

		if (SwitchEquip.ui && switchUIopen) {
			const switchHost = SwitchEquip._host || SwitchEquip.ui;
			if (switchHost.style) switchHost.style.display = '';
		}
		const switchBtn = root.querySelector('.switch_equip');
		if (switchBtn) switchBtn.style.display = '';
	}

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

EquipmentV4.getCurrentTabId = function () {
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

EquipmentV4.onAppend = function onAppend() {
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
		if (!_preferences.stats) {
			const root = _getRoot();
			const statusComp = root.querySelector('.status_component');
			if (statusComp) statusComp.style.display = 'none';
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/viewon.bmp', data => {
				const r = _getRoot();
				const btn = r.querySelector('.view_status');
				if (btn) btn.style.backgroundImage = `url(${data})`;
			});
		}
	}

	const root = _getRoot();
	const canvas = root.querySelector('canvas');
	if (canvas && this._host.style.display !== 'none') {
		Renderer.render(renderCharacter);
	}

	SwitchEquip.append(switchappend);
	if (SwitchEquip.ui) {
		const switchHost = SwitchEquip._host || SwitchEquip.ui;
		if (switchHost.style) switchHost.style.display = 'none';
	}
};

EquipmentV4.onRemove = function onRemove() {
	if (UIVersionManager.getEquipmentVersion() > 0 && _btnLevelUp && _btnLevelUp.parentNode) {
		_btnLevelUp.remove();
	}

	Renderer.stop(renderCharacter);

	EquipmentV4._itemlist = {};
	const root = _getRoot();
	root.querySelectorAll('.col1, .col3, .ammo').forEach(el => {
		el.innerHTML = '';
	});

	_preferences.show = this._host.style.display !== 'none';
	const panel = root.querySelector('.panel');
	_preferences.reduce = panel ? panel.style.display === 'none' : false;
	const statusComp = root.querySelector('.status_component');
	_preferences.stats = statusComp ? statusComp.style.display !== 'none' : false;
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
};

EquipmentV4.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
		Renderer.render(renderCharacter);
		if (UIVersionManager.getEquipmentVersion() > 0) {
			if (_btnLevelUp && _btnLevelUp.parentNode) _btnLevelUp.remove();
		}
		this.focus();
	} else {
		this._host.style.display = 'none';
		Renderer.stop(renderCharacter);
	}
};

EquipmentV4.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

EquipmentV4.setEquipConfig = function setEquipConfig(on) {
	_showEquip = on;
	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', data => {
		const root = _getRoot();
		const btn = root.querySelector('.show_equip');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
};

EquipmentV4.setCostumeConfig = function setCostumeConfig(on) {
	_hideCostume = on;
	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '0' : '1') + '.bmp', data => {
		const root = _getRoot();
		const btn = root.querySelector('.show_costume');
		if (btn) btn.style.backgroundImage = `url(${data})`;
	});
};

EquipmentV4.equip = function equip(item, location) {
	const it = DB.getItemInfo(item.ITID);
	item.equipped = location;
	EquipmentV4._itemlist[item.index] = item;

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
			'<button><div class="grade"></div></button>' +
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

	if (item.enchantgrade) {
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + item.enchantgrade + '.bmp', data => {
			const el = root.querySelector(`.item[data-index="${item.index}"] .grade`);
			if (el) el.style.backgroundImage = `url(${data})`;
		});
	}

	if (!Inventory.getUI().equippedItems.includes(item.index)) {
		Inventory.getUI().equippedItems.push(item.index);
	}

	if (PACKETVER.value >= 20170621) {
		if (!Inventory.getUI().isInEquipSwitchList(location)) {
			SwitchEquip.equip(item, location, false);
		}
	}
};

EquipmentV4.unEquip = function unEquip(index, location) {
	const selector = getSelectorFromLocation(location);
	const root = _getRoot();
	const item = EquipmentV4._itemlist[index];
	item.equipped = 0;

	root.querySelectorAll(selector).forEach(el => {
		el.innerHTML = '';
	});
	delete EquipmentV4._itemlist[index];

	return item;
};

EquipmentV4.onLevelUp = function onLevelUp() {
	if (UIVersionManager.getEquipmentVersion() > 0 && _btnLevelUp) {
		document.body.appendChild(_btnLevelUp);
	}
};

EquipmentV4.checkEquipLoc = function checkEquipLoc(location) {
	for (const key in EquipmentV4._itemlist) {
		if (EquipmentV4._itemlist[key].location & location) {
			return EquipmentV4._itemlist[key].wItemSpriteNumber;
		}
	}
	return 0;
};

function toggleStatus() {
	const root = _getRoot();
	const self = root.querySelector('.view_status');
	const winStatsUI = WinStats.getUI();
	const statusHost = winStatsUI._host || winStatsUI.ui;
	const isVisible = statusHost ? (statusHost.style ? statusHost.style.display !== 'none' : true) : false;
	const state = isVisible ? 'on' : 'off';

	if (statusHost && statusHost.style) {
		statusHost.style.display = isVisible ? 'none' : '';
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', data => {
		if (self) self.style.backgroundImage = `url(${data})`;
	});
}

function toggleEquip() {
	EquipmentV4.onConfigUpdate(0, !_showEquip ? 1 : 0);
}

function toggleCostume() {
	EquipmentV4.onConfigUpdate(5, !_hideCostume ? 1 : 0);
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
			equip_character.accessory = EquipmentV4.checkEquipLoc(EquipLocation.HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV4.checkEquipLoc(EquipLocation.HEAD_TOP);
			equip_character.accessory3 = EquipmentV4.checkEquipLoc(EquipLocation.HEAD_MID);
			equip_character.robe = EquipmentV4.checkEquipLoc(EquipLocation.GARMENT);
		} else if (currentTabId === 'costume') {
			equip_character.accessory = EquipmentV4.checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV4.checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
			equip_character.accessory3 = EquipmentV4.checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
			equip_character.robe = EquipmentV4.checkEquipLoc(EquipLocation.COSTUME_ROBE);
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
			EquipmentV4.onEquipItem(item.index, 'location' in item ? item.location : item.WearState);
		}
	}

	return false;
}

function onEquipmentInfo(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = EquipmentV4._itemlist[index];

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
	EquipmentV4.onUnEquip(index);
	const root = _getRoot();
	const overlay = root.querySelector('.overlay');
	if (overlay) overlay.style.display = 'none';
}

function onEquipmentOver() {
	const idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
	const item = EquipmentV4._itemlist[idx];
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

EquipmentV4.onUpdateOwnerName = function () {
	const root = _getRoot();
	for (const index in EquipmentV4._itemlist) {
		const item = EquipmentV4._itemlist[index];
		if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1)) {
			const nameEl = root.querySelector(`.item[data-index="${index}"] .itemName`);
			if (nameEl) nameEl.textContent = DB.getItemName(item);
		}
	}
};

EquipmentV4.getNumber = function () {
	let num = 0;
	for (const key in EquipmentV4._itemlist) {
		if (EquipmentV4._itemlist[key].location && EquipmentV4._itemlist[key].location !== EquipLocation.AMMO) {
			num++;
		}
	}
	return num;
};

function onSwtichEquip() {
	SwitchEquip.toggle();

	if (SwitchEquip.ui) {
		const switchHost = SwitchEquip._host || SwitchEquip.ui;
		if (switchHost.style) {
			switchHost.style.position = 'absolute';
			switchHost.style.top = '0';
			switchHost.style.left = '0';
			switchHost.style.zIndex = '100';
		}
	}
}

EquipmentV4.setDamageSkin = function setDamageSkin(skinId) {
	const root = _getRoot();
	const buttons = root.querySelectorAll('#damageskin .skin-option');
	const buttonSelected = root.querySelector(`#damageskin .skin-option[data-skin="${skinId}"]`);

	GraphicsSettings.damageSkin = skinId;
	GraphicsSettings.save();

	buttons.forEach(btn => {
		btn.setAttribute('data-background', 'showdamage/btn_damage.bmp');
		btn.setAttribute('data-hover', 'showdamage/btn_damage_press.bmp');
		btn.setAttribute('data-down', 'showdamage/btn_damage_pick.bmp');
	});
	if (this.parseHTML) {
		buttons.forEach(btn => {
			this.parseHTML.call(btn);
		});
	}

	Client.loadFile(DB.INTERFACE_PATH + 'showdamage/btn_damage.bmp', data => {
		buttons.forEach(btn => {
			btn.style.backgroundImage = `url(${data})`;
		});
	});

	if (buttonSelected) {
		Client.loadFile(DB.INTERFACE_PATH + 'showdamage/btn_damage_pick.bmp', data => {
			buttonSelected.style.backgroundImage = `url(${data})`;
		});

		buttonSelected.onmouseover = null;
		buttonSelected.onmouseout = null;
	}
};

EquipmentV4.setDamageMotion = function setDamageMotion(motionId) {
	GraphicsSettings.damageMotion = motionId;
	GraphicsSettings.save();

	const root = _getRoot();
	const checkboxes = root.querySelectorAll('.motion-check');

	checkboxes.forEach(btn => {
		const btnId = parseInt(btn.getAttribute('data-motion'), 10);
		const bgImage = btnId === motionId ? 'checkbox_1.bmp' : 'checkbox_0.bmp';
		Client.loadFile(DB.INTERFACE_PATH + bgImage, data => {
			btn.style.backgroundImage = `url(${data})`;
		});
	});
};

EquipmentV4.isInEquipList = function (data) {
	for (const key in EquipmentV4._itemlist) {
		if (EquipmentV4._itemlist[key].location & data) {
			return EquipmentV4._itemlist[key];
		}
	}
	return 0;
};

EquipmentV4.equipItemsToSwitch = function () {
	const equipmentKeys = Object.keys(EquipmentV4._itemlist);
	for (let i = 0; i < equipmentKeys.length; i++) {
		const key = equipmentKeys[i];
		const equipmentItem = EquipmentV4._itemlist[key];
		if (equipmentItem.location) {
			SwitchEquip.equip(equipmentItem, equipmentItem.location, false);
		}
	}
};

EquipmentV4.onUnEquip = function onUnEquip(/* index */) {};
EquipmentV4.onConfigUpdate = function onConfigUpdate(/* type, value*/) {};
EquipmentV4.onEquipItem = function onEquipItem(/* index, location */) {};
EquipmentV4.onRemoveCart = function onRemoveCart() {};

export default UIManager.addComponent(EquipmentV4);
