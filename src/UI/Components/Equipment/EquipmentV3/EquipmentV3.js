/**
 * UI/Components/Equipment/EquipmentV3/EquipmentV3.js
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
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import Renderer from 'Renderer/Renderer.js';
import Camera from 'Renderer/Camera.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import UIVersionManager from 'UI/UIVersionManager.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import SwitchEquip from 'UI/Components/SwitchEquip/SwitchEquip.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import htmlText from './EquipmentV3.html?raw';
import cssText from './EquipmentV3.css?raw';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Entity from 'Renderer/Entity/Entity.js';

/**
 * Create Component
 */
const EquipmentV3 = new UIComponent('EquipmentV3', htmlText, cssText);

/**
 * @var {Preference} window preferences
 */
const _preferences = Preferences.get(
	'EquipmentV3',
	{
		x: 480,
		y: 200,
		show: false,
		reduce: false,
		stats: true
	},
	1.0
);

/**
 * @var {Array} equipment list
 */
EquipmentV3._itemlist = {};

/**
 * @var {CanvasRenderingContext2D} canvas context
 */
const _ctx = [];

/**
 * @var {boolean} show equipment to other people ?
 */
let _showEquip = false;

/**
 * @var {jQuery} button that appeared when level up
 */
let _btnLevelUp;

/**
 * @var {jQuery} variable for UI tabs
 */
const tabLinks = new Array();
const contentDivs = new Array();
let currentTabId = 'general'; // Variable to store the current tab's ID

/**
 * @var {jQuery} variable for Switch Equip
 */
let switchappend;
let switchUIopen;

/**
 * @var {number} title id
 */
let _currentTitleId = 0;

/**
 * Initialize UI
 */
EquipmentV3.init = function init() {
	_ctx.push(this.ui.find('canvas')[0].getContext('2d'));
	_ctx.push(this.ui.find('canvas')[1].getContext('2d'));

	// Grab the tab links and content divs from the page
	const tabListItems = document.getElementById('tabs').childNodes;
	let i;
	for (i = 0; i < tabListItems.length; i++) {
		if (tabListItems[i].nodeName == 'DIV') {
			const tabLink = getFirstChildWithTagName(tabListItems[i], 'A');
			const id = getHash(tabLink.getAttribute('href'));
			tabLinks[id] = tabLink;
			contentDivs[id] = document.getElementById(id);
		}
	}

	// Assign onclick events to the tab links, and
	// highlight the first tab
	i = 0;

	for (const id in tabLinks) {
		tabLinks[id].onclick = showTab;
		tabLinks[id].onfocus = function () {
			this.blur();
		};
		if (i == 0) {
			tabLinks[id].className = 'tab selected';
		}
		i++;
	}

	// Hide all content divs except the first
	i = 0;

	for (const id in contentDivs) {
		if (contentDivs[id]) {
			if (i != 0) {
				contentDivs[id].classList.add('content', 'hide');
			}
			i++;
		}
	}

	if (UIVersionManager.getEquipmentVersion() > 0) {
		// Get button to open skill when level up
		_btnLevelUp = jQuery('#lvlup_base')
			.detach()
			.mousedown(stopPropagation)
			.click(() => {
				_btnLevelUp.detach();
				WinStats.getUI().ui.show();
			});
	} else {
		this.ui.find('#equipment_footer').remove();
		this.ui.addClass('equipmentV0');
		this.ui.find('#lvlup_base').remove();
	}
	// Don't activate drag drop when clicking on buttons
	this.ui.find('.titlebar .base').mousedown(stopPropagation);
	this.ui.find('.titlebar .mini').click(function () {
		EquipmentV3.ui.find('.panel').toggle();
	});
	this.ui.find('.titlebar .close').click(function () {
		EquipmentV3.ui.hide();
		Renderer.stop(renderCharacter);
	});

	this.ui.find('.removeOption').mousedown(onRemoveOption);
	this.ui.find('.view_status').mousedown(toggleStatus);
	this.ui.find('.show_equip').mousedown(toggleEquip);

	this.ui.find('.cartitems').click(onCartItems);

	this.ui.find('.switch_equip').click(onSwtichEquip);

	this.loadTitles();

	// drag, drop items
	this.ui.on('dragover', onDragOver);
	this.ui.on('dragleave', onDragLeave);
	this.ui.on('drop', onDrop);

	// Bind items
	this.ui
		.find('.content')
		.on('contextmenu', '.item', onEquipmentInfo)
		.on('dblclick', '.item', onEquipmentUnEquip)
		.on('mouseover', 'button', onEquipmentOver)
		.on('mouseout', 'button', onEquipmentOut);

	this.draggable(this.ui.find('.titlebar'));

	switchappend = this.ui.find('.footer');
};

/**
 * Function to show the selected tab and update the current tab ID.
 *
 * @return {boolean} false to stop the browser from following the link
 */
function showTab() {
	const selectedId = getHash(this.getAttribute('href'));

	// Highlight the selected tab, and dim all others.
	// Also show the selected content div, and hide all others.
	for (const id in contentDivs) {
		if (id == selectedId) {
			tabLinks[id].className = 'tab selected';
			contentDivs[id].className = 'content';
		} else {
			tabLinks[id].className = 'tab';
			contentDivs[id].classList.add('content', 'hide');
		}
	}

	// Update the current tab ID
	currentTabId = selectedId;

	if (SwitchEquip.ui) {
		SwitchEquip.showSwapTab(currentTabId);
	}

	if (currentTabId === 'title') {
		if (SwitchEquip.ui) {
			switchUIopen = SwitchEquip.ui.is(':visible');
			SwitchEquip.ui.hide();
		}
		EquipmentV3.ui.find('.switch_equip').hide();
	} else {
		if (SwitchEquip.ui && switchUIopen) {
			SwitchEquip.ui.show();
		}
		EquipmentV3.ui.find('.switch_equip').show();
	}

	// Stop the browser following the link
	return false;
}

/**
 * Returns the first child element of the given parent element with the specified tag name.
 *
 * @param {Element} element - The parent element.
 * @param {string} tagName - The tag name of the child element to find.
 */
function getFirstChildWithTagName(element, tagName) {
	for (let i = 0; i < element.childNodes.length; i++) {
		if (element.childNodes[i].nodeName == tagName.toUpperCase()) {
			return element.childNodes[i];
		}
	}
}

/**
 * Returns the hash part of a URL.
 *
 * @param {string} url - The URL from which to extract the hash.
 * @return {string} The hash part of the URL.
 */
function getHash(url) {
	const hashPos = url.lastIndexOf('#');
	return url.substring(hashPos + 1);
}

/**
 * Returns the current tab ID of the EquipmentV3 component.
 *
 * @return {string} The current tab ID.
 */
EquipmentV3.getCurrentTabId = function () {
	return currentTabId;
};

/**
 * Toggles the visibility of the CartItems UI if the Session.Entity has a cart.
 *
 * @return {void} This function does not return anything.
 */
function onCartItems() {
	if (Session.Entity.hasCart == false) {
		return;
	}
	CartItems.ui.toggle();
}

function onRemoveOption() {
	const pkt = new PACKET.CZ.REQ_CARTOFF();
	Network.sendPacket(pkt);
}

/**
 * Append to body
 */
EquipmentV3.onAppend = function onAppend() {
	// Apply preferences
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	// Hide window ?
	if (!_preferences.show) {
		this.ui.hide();
	}

	// Reduce window ?
	if (_preferences.reduce) {
		this.ui.find('.panel').hide();
	}

	// Show status window ?
	if (UIVersionManager.getEquipmentVersion() > 0) {
		if (!_preferences.stats) {
			this.ui.find('.status_component').hide();
			Client.loadFile(
				DB.INTERFACE_PATH + 'basic_interface/viewon.bmp',
				function (data) {
					this.ui.find('.view_status').css('backgroundImage', 'url(' + data + ')');
				}.bind(this)
			);
		}
	}

	if (this.ui.find('canvas').is(':visible')) {
		Renderer.render(renderCharacter);
	}

	SwitchEquip.append(switchappend);
	SwitchEquip.ui.hide();
};

/**
 * Remove Inventory from window (and so clean up items)
 */
EquipmentV3.onRemove = function onRemove() {
	if (UIVersionManager.getEquipmentVersion() > 0) {
		_btnLevelUp.detach();
	}

	// Stop rendering
	Renderer.stop(renderCharacter);

	// Clean equipments
	EquipmentV3._itemlist = {};
	this.ui.find('.col1, .col3, .ammo').empty();

	// Save preferences
	_preferences.show = this.ui.is(':visible');
	_preferences.reduce = this.ui.find('.panel').css('display') === 'none';
	_preferences.stats = this.ui.find('.status_component').css('display') !== 'none';
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
};

/**
 * Start/stop rendering character in UI
 */
EquipmentV3.toggle = function toggle() {
	this.ui.toggle();

	if (this.ui.is(':visible')) {
		Renderer.render(renderCharacter);
		if (UIVersionManager.getEquipmentVersion() > 0) {
			_btnLevelUp.detach();
		}
		this.focus();
	} else {
		Renderer.stop(renderCharacter);
	}
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
EquipmentV3.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

/**
 * Show or hide equipment
 *
 * @param {boolean} on
 */
EquipmentV3.setEquipConfig = function setEquipConfig(on) {
	_showEquip = on;

	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', function (data) {
		EquipmentV3.ui.find('.show_equip').css('backgroundImage', 'url(' + data + ')');
	});
};

/**
 * Show or hide equipment
 *
 * @param {boolean} on
 */
EquipmentV3.setCostumeConfig = function setCostumeConfig(on) {};

/**
 * Add an equipment to the window
 *
 * @param {Item} item
 */
EquipmentV3.equip = function equip(item, location) {
	const it = DB.getItemInfo(item.ITID);
	item.equipped = location;
	EquipmentV3._itemlist[item.index] = item;
	function add3Dots(string, limit) {
		// html color codes broken inventory strings lenght
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

	this.ui.find(getSelectorFromLocation(location)).html(
		'<div class="item" data-index="' +
			item.index +
			'">' +
			'<button><div class="grade"></div></button>' +
			'<span class="itemName">' +
			jQuery.escape(
				add3Dots(
					DB.getItemName(item, {
						showItemGrade: false,
						showItemSlots: false,
						showItemOptions: false
					}),
					25
				)
			) +
			'</span>' +
			'</div>'
	);

	Client.loadFile(
		DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp',
		function (data) {
			this.ui.find('.item[data-index="' + item.index + '"] button').css('backgroundImage', 'url(' + data + ')');
		}.bind(this)
	);

	if (item.enchantgrade) {
		Client.loadFile(
			DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + item.enchantgrade + '.bmp',
			function (data) {
				this.ui
					.find('.item[data-index="' + item.index + '"] .grade')
					.css('backgroundImage', 'url(' + data + ')');
			}.bind(this)
		);
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

/**
 * Remove equipment from window
 *
 * @param {number} item index
 * @param {number} item location
 */
EquipmentV3.unEquip = function unEquip(index, location) {
	const selector = getSelectorFromLocation(location);
	const item = EquipmentV3._itemlist[index];
	item.equipped = 0;

	this.ui.find(selector).empty();
	delete EquipmentV3._itemlist[index];

	return item;
};

/**
 * Add the button when leveling up
 */
EquipmentV3.onLevelUp = function onLevelUp() {
	if (UIVersionManager.getEquipmentVersion() > 0) {
		_btnLevelUp.appendTo('body');
	}
};

/**
 * Check equipment location for item
 * @param {number} location - The equipment location to check
 * @returns {item.wItemSpriteNumber} Object with { item }
 */
EquipmentV3.checkEquipLoc = function checkEquipLoc(location) {
	for (const key in EquipmentV3._itemlist) {
		if (EquipmentV3._itemlist[key].location & location) {
			return EquipmentV3._itemlist[key].wItemSpriteNumber;
		}
	}

	return 0;
};

/**
 * Stop an event to propagate
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Display or not status window
 */
function toggleStatus() {
	const self = EquipmentV3.ui.find('.view_status');
	const status = WinStats.getUI().ui;
	const state = status.is(':visible') ? 'on' : 'off';

	status.toggle();

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', function (data) {
		self.css('backgroundImage', 'url(' + data + ')');
	});
}

/**
 * Does player can see your equipment ?
 */
function toggleEquip() {
	EquipmentV3.onConfigUpdate(0, !_showEquip ? 1 : 0);
}

/**
 * Rendering character
 */
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

	// Current removable options
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

		// If state change, we have to check if the new option is removable.
		if (Session.Entity.effectState !== _lastState || _hasCart !== Session.Entity.hasCart) {
			_lastState = Session.Entity.effectState;
			_hasCart = Session.Entity.hasCart;

			if (_lastState & HasAttachmentState || _hasCart) {
				EquipmentV3.ui.find('.removeOption').show();
			} else {
				EquipmentV3.ui.find('.removeOption').hide();
			}

			if (_lastState & HasCartState || _hasCart) {
				EquipmentV3.ui.find('.cartitems').show();
			} else {
				EquipmentV3.ui.find('.cartitems').hide();
			}
		}

		// General Tab only shows normal headgears
		if (currentTabId === 'general') {
			equip_character.accessory = EquipmentV3.checkEquipLoc(EquipLocation.HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV3.checkEquipLoc(EquipLocation.HEAD_TOP);
			equip_character.accessory3 = EquipmentV3.checkEquipLoc(EquipLocation.HEAD_MID);
			equip_character.robe = EquipmentV3.checkEquipLoc(EquipLocation.GARMENT);
		}
		// Costume Tab only shows costume headgears
		else if (currentTabId === 'costume') {
			equip_character.accessory = EquipmentV3.checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
			equip_character.accessory2 = EquipmentV3.checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
			equip_character.accessory3 = EquipmentV3.checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
			equip_character.robe = EquipmentV3.checkEquipLoc(EquipLocation.COSTUME_ROBE);
		}

		_savedColor.set(equip_character.effectColor);
		equip_character.effectColor.set(_cleanColor);

		// Set action
		Camera.direction = 0;
		equip_character.direction = 0;
		equip_character.headDir = 0;
		equip_character.action = equip_character.ACTION.IDLE;
		equip_character.animation = _animation;

		// Rendering
		for (let i = 0; i < _ctx.length; i++) {
			const ctx = _ctx[i];
			SpriteRenderer.bind2DContext(ctx, 30, 130);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			equip_character.renderEntity(ctx);
		}
	};
})();

/**
 * Find elements in html base on item location
 *
 * @param {number} location
 * @returns {string} selector
 */
function getSelectorFromLocation(location) {
	const selector = [];

	if (location & EquipLocation.HEAD_TOP) {
		selector.push('.head_top');
	}
	if (location & EquipLocation.HEAD_MID) {
		selector.push('.head_mid');
	}
	if (location & EquipLocation.HEAD_BOTTOM) {
		selector.push('.head_bottom');
	}
	if (location & EquipLocation.ARMOR) {
		selector.push('.armor');
	}
	if (location & EquipLocation.WEAPON) {
		selector.push('.weapon');
	}
	if (location & EquipLocation.SHIELD) {
		selector.push('.shield');
	}
	if (location & EquipLocation.GARMENT) {
		selector.push('.garment');
	}
	if (location & EquipLocation.SHOES) {
		selector.push('.shoes');
	}
	if (location & EquipLocation.ACCESSORY1) {
		selector.push('.accessory1');
	}
	if (location & EquipLocation.ACCESSORY2) {
		selector.push('.accessory2');
	}
	if (location & EquipLocation.AMMO) {
		selector.push('.ammo');
	}

	// Costume Tab
	if (location & EquipLocation.COSTUME_HEAD_TOP) {
		selector.push('.costume_head_top');
	}
	if (location & EquipLocation.COSTUME_HEAD_MID) {
		selector.push('.costume_head_mid');
	}
	if (location & EquipLocation.COSTUME_HEAD_BOTTOM) {
		selector.push('.costume_head_bottom');
	}
	if (location & EquipLocation.SHADOW_ARMOR) {
		selector.push('.shadow_armor');
	}
	if (location & EquipLocation.SHADOW_WEAPON) {
		selector.push('.shadow_weapon');
	}
	if (location & EquipLocation.SHADOW_SHIELD) {
		selector.push('.shadow_shield');
	}
	if (location & EquipLocation.COSTUME_ROBE) {
		selector.push('.shadow_garment');
	}
	if (location & EquipLocation.SHADOW_SHOES) {
		selector.push('.shadow_shoes');
	}
	if (location & EquipLocation.SHADOW_R_ACCESSORY_SHADOW) {
		selector.push('.shadow_accessory1');
	}
	if (location & EquipLocation.SHADOW_L_ACCESSORY_SHADOW) {
		selector.push('.shadow_accessory2');
	}

	return selector.join(', ');
}

/**
 * Drag an item over the equipment, show where to place the item
 */
function onDragOver(event) {
	if (window._OBJ_DRAG_) {
		const data = window._OBJ_DRAG_;
		let item, selector, ui;

		// Just support items for now ?
		if (data.type === 'item') {
			item = data.data;

			if (
				(item.type === ItemType.WEAPON || item.type === ItemType.ARMOR || item.type === ItemType.SHADOWGEAR) &&
				item.IsIdentified &&
				!item.IsDamaged
			) {
				selector = getSelectorFromLocation('location' in item ? item.location : item.WearLocation);
				ui = EquipmentV3.ui.find(selector);

				Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/item_invert.bmp', function (_data) {
					ui.css('backgroundImage', 'url(' + _data + ')');
				});
			}
		}
	}

	event.stopImmediatePropagation();
	return false;
}

/**
 * Drag out the window
 */
function onDragLeave(event) {
	EquipmentV3.ui.find('td').css('backgroundImage', 'none');
	event.stopImmediatePropagation();
	return false;
}

/**
 * Drop an item in the equipment, equip it if possible
 */
function onDrop(event) {
	let item, data;

	try {
		data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
	} catch (_e) {
		// ignore
	}

	// Just support items for now ?
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
			EquipmentV3.ui.find('td').css('backgroundImage', 'none');
			EquipmentV3.onEquipItem(item.index, 'location' in item ? item.location : item.WearState);
		}
	}

	event.stopImmediatePropagation();
	return false;
}

/**
 * Right click on an item
 */
function onEquipmentInfo(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const item = EquipmentV3._itemlist[index];

	if (item) {
		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === item.ITID) {
			ItemInfo.remove();
		}

		// Add ui to window
		else {
			ItemInfo.append();
			ItemInfo.uid = item.ITID;
			ItemInfo.setItem(item);
		}
	}

	event.stopImmediatePropagation();
	return false;
}

/**
 * Double click on an equipment to remove it
 */
function onEquipmentUnEquip() {
	const index = parseInt(this.getAttribute('data-index'), 10);
	EquipmentV3.onUnEquip(index);
	EquipmentV3.ui.find('.overlay').hide();
}

/**
 * When mouse is over an equipment, display the item name
 */
function onEquipmentOver() {
	const idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
	const item = EquipmentV3._itemlist[idx];

	if (!item) {
		return;
	}

	// Get back data
	const overlay = EquipmentV3.ui.find('.overlay');
	const pos = jQuery(this).position();

	// Possible jquery error
	if (!pos.top && !pos.left) {
		return;
	}

	// Display box
	overlay.show();
	overlay.css({ top: pos.top - 22, left: pos.left - 22 });
	overlay.text(DB.getItemName(item));
}

/**
 * Remove the item name
 */
function onEquipmentOut() {
	EquipmentV3.ui.find('.overlay').hide();
}

/**
 * Updates the owner name of items in the Equipment window.
 */
EquipmentV3.onUpdateOwnerName = function () {
	for (const index in EquipmentV3._itemlist) {
		const item = EquipmentV3._itemlist[index];
		if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1)) {
			EquipmentV3.ui
				.find('.item[data-index="' + index + '"] .itemName')
				.text(jQuery.escape(DB.getItemName(item)));
		}
	}
};

/**
 * Returns the number of equipped items in the Equipment window, excluding ammo.
 *
 * @return {number} The number of equipped items.
 */
EquipmentV3.getNumber = function () {
	let num = 0;
	for (const key in EquipmentV3._itemlist) {
		if (EquipmentV3._itemlist[key].location && EquipmentV3._itemlist[key].location != EquipLocation.AMMO) {
			num++;
		}
	}
	return num;
};

/**
 * Toggles the SwitchEquip UI and positions it absolutely to overlap with the footer.
 */
function onSwtichEquip() {
	SwitchEquip.toggle();

	// Position SwitchEquip UI absolutely to overlap with the footer
	SwitchEquip.ui.css({
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 100 // Adjust zIndex as needed to control stacking order
	});
}

/**
 * Title Functions.
 */
EquipmentV3.loadTitles = function () {
	const titleList = this.ui.find('#title_list');
	titleList.empty();

	const removeTitleText = DB.getMessage(2686) || 'Remove Title';
	const removeSelectedClass = _currentTitleId === 0 ? ' selected' : '';
	const removeElement = jQuery(
		'<div class="title-option' + removeSelectedClass + '" data-title="0">' + removeTitleText + '</div>'
	);
	titleList.append(removeElement);

	const allTitles = DB.getAllTitles();
	for (const titleId in allTitles) {
		if (allTitles.hasOwnProperty(titleId)) {
			// TODO: Check if player finished achievment for title
			const titleName = allTitles[titleId];
			const selectedClass = parseInt(titleId) === _currentTitleId ? ' selected' : '';
			const titleElement = jQuery(
				'<div class="title-option' + selectedClass + '" data-title="' + titleId + '">' + titleName + '</div>'
			);
			titleList.append(titleElement);
		}
	}

	titleList.off('click', '.title-option');
	titleList.on('click', '.title-option', function (e) {
		e.preventDefault();
		e.stopPropagation();
		const titleId = parseInt(this.getAttribute('data-title'));
		EquipmentV3.selectTitle(titleId);
	});
};

EquipmentV3.selectTitle = function (titleId) {
	const pkt = new PACKET.CZ.REQ_CHANGE_TITLE();
	pkt.title_id = titleId;
	Network.sendPacket(pkt);
};

EquipmentV3.setTitle = function OnSetTitle(titleId) {
	_currentTitleId = titleId;
	EquipmentV3.loadTitles();
};

/**
 * Function to check if an item with a given location exists in the equip switch list
 *
 * @param {data} data - The data to be checked against
 * @return {Object} The item in the equip switch list if found, otherwise 0
 */
EquipmentV3.isInEquipList = function (data) {
	for (const key in EquipmentV3._itemlist) {
		if (EquipmentV3._itemlist[key].location & data) {
			return EquipmentV3._itemlist[key];
		}
	}

	return 0;
};

/**
 * Equips all items in _itemlist to SwitchEquip.
 */
EquipmentV3.equipItemsToSwitch = function () {
	const equipmentKeys = Object.keys(EquipmentV3._itemlist);

	for (let i = 0; i < equipmentKeys.length; i++) {
		const key = equipmentKeys[i];
		const equipmentItem = EquipmentV3._itemlist[key];

		// Check if the item's location is not in SwitchEquip._list
		if (equipmentItem.location) {
			// Equip the item to SwitchEquip
			SwitchEquip.equip(equipmentItem, equipmentItem.location, false);
		}
	}
};

/**
 * Method to define
 */
EquipmentV3.onUnEquip = function onUnEquip(/* index */) {};
EquipmentV3.onConfigUpdate = function onConfigUpdate(/* type, value*/) {};
EquipmentV3.onEquipItem = function onEquipItem(/* index, location */) {};
EquipmentV3.onRemoveCart = function onRemoveCart() {};

/**
 * Create component and export it
 */
export default UIManager.addComponent(EquipmentV3);
