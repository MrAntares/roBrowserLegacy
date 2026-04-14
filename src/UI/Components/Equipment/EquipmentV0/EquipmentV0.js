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
import WinStats from 'UI/Components/WinStats/WinStats.js';
import htmlText from './EquipmentV0.html?raw';
import cssText from './EquipmentV0.css?raw';
import Inventory from 'UI/Components/Inventory/Inventory.js';

/**
 * Create Component
 */
const EquipmentV0 = new UIComponent('EquipmentV0', htmlText, cssText);

/**
 * @var {Preference} window preferences
 */
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

/**
 * @var {Array} equipment list
 */
let _list = {};

/**
 * @var {CanvasRenderingContext2D} canvas context
 */
let _ctx;

/**
 * @var {boolean} show equipment to other people ?
 */
let _showEquip = false;

/**
 * @var {jQuery} button that appeared when level up
 */
let _btnLevelUp;

/**
 * Initialize UI
 */
EquipmentV0.init = function init() {
	_ctx = this.ui.find('canvas')[0].getContext('2d');
	if (UIVersionManager.getEquipmentVersion() > 0) {
		// Get button to open skill when level up
		_btnLevelUp = jQuery('#lvlup_base')
			.detach()
			.mousedown(stopPropagation)
			.click(function () {
				_btnLevelUp.detach();
				EquipmentV0.ui.show();
				EquipmentV0.ui.parent().append(EquipmentV0.ui);

				if (EquipmentV0.ui.is(':visible')) {
					Renderer.render(renderCharacter);
				}
			});
	} else {
		this.ui.find('#equipment_footer').remove();
		this.ui.addClass('equipmentV0');
		this.ui.find('#lvlup_base').remove();
	}
	// Don't activate drag drop when clicking on buttons
	this.ui.find('.titlebar .base').mousedown(stopPropagation);
	this.ui.find('.titlebar .mini').click(function () {
		EquipmentV0.ui.find('.panel').toggle();
	});
	this.ui.find('.titlebar .close').click(function () {
		EquipmentV0.ui.hide();
		Renderer.stop(renderCharacter);
		hideStatus();
	});

	this.ui.find('.removeOption').mousedown(onRemoveOption);
	this.ui.find('.view_status').mousedown(toggleStatus);
	this.ui.find('.show_equip').mousedown(toggleEquip);

	this.ui.find('.cartitems').click(onCartItems);

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
};

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
EquipmentV0.onAppend = function onAppend() {
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
		if (_preferences.stats && _preferences.show) {
			const winStats = WinStats.getUI();
			winStats.embed(EquipmentV0.ui[0]);
		} else {
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
};

/**
 * Remove Inventory from window (and so clean up items)
 */
EquipmentV0.onRemove = function onRemove() {
	if (UIVersionManager.getEquipmentVersion() > 0) {
		_btnLevelUp.detach();
	}

	// Stop rendering
	Renderer.stop(renderCharacter);

	// Clean equipments
	_list = {};
	this.ui.find('.col1, .col3, .ammo').empty();

	// Save preferences
	_preferences.show = this.ui.is(':visible');
	_preferences.reduce = this.ui.find('.panel').css('display') === 'none';
	const winStats = WinStats.getUI();
	_preferences.stats = winStats.isEmbedded();
	hideStatus();
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
};

/**
 * Start/stop rendering character in UI
 */
EquipmentV0.toggle = function toggle() {
	this.ui.toggle();

	if (this.ui.is(':visible')) {
		Renderer.render(renderCharacter);
		if (UIVersionManager.getEquipmentVersion() > 0) {
			_btnLevelUp.detach();
			if (_preferences.stats) {
				WinStats.getUI().embed(EquipmentV0.ui[0]);
			}
		}
		this.focus();
	} else {
		Renderer.stop(renderCharacter);
		hideStatus();
	}
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
EquipmentV0.onShortCut = function onShurtCut(key) {
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
EquipmentV0.setEquipConfig = function setEquipConfig(on) {
	_showEquip = on;

	Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', function (data) {
		EquipmentV0.ui.find('.show_equip').css('backgroundImage', 'url(' + data + ')');
	});
};

/**
 * Show or hide equipment
 *
 * @param {boolean} on
 */
EquipmentV0.setCostumeConfig = function setCostumeConfig(on) {};

/**
 * Add an equipment to the window
 *
 * @param {Item} item
 */
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
			'<button></button>' +
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

	if (!Inventory.getUI().equippedItems.includes(item.index)) {
		Inventory.getUI().equippedItems.push(item.index);
	}
};

/**
 * Remove equipment from window
 *
 * @param {number} item index
 * @param {number} item location
 */
EquipmentV0.unEquip = function unEquip(index, location) {
	const selector = getSelectorFromLocation(location);
	const item = _list[index];

	this.ui.find(selector).empty();
	delete _list[index];

	return item;
};

/**
 * Add the button when leveling up
 */
EquipmentV0.onLevelUp = function onLevelUp() {
	if (UIVersionManager.getEquipmentVersion() > 0) {
		_btnLevelUp.appendTo('body');
	}
};

/**
 * Stop an event to propagate
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Hide status window
 */
function hideStatus() {
	const winStats = WinStats.getUI();
	if (winStats.isEmbedded()) {
		winStats.unembed();
	}
}

/**
 * Display or not status window
 */
function toggleStatus() {
	const self = EquipmentV0.ui.find('.view_status');
	const winStats = WinStats.getUI();
	const isVisible = winStats.isEmbedded();
	const state = isVisible ? 'on' : 'off';

	if (isVisible) {
		winStats.unembed();
		_preferences.stats = false;
	} else {
		// Pass Equipment's host (or jQuery element[0]) as anchor
		winStats.embed(EquipmentV0.ui[0]);
		_preferences.stats = true;
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', function (data) {
		self.css('backgroundImage', 'url(' + data + ')');
	});
}

/**
 * Does player can see your equipment ?
 */
function toggleEquip() {
	EquipmentV0.onConfigUpdate(0, !_showEquip ? 1 : 0);
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
		const character = Session.Entity;
		const direction = character.direction;
		const headDir = character.headDir;
		const action = character.action;
		const animation = character.animation;

		// If state change, we have to check if the new option is removable.
		if (character.effectState !== _lastState || _hasCart !== character.hasCart) {
			_lastState = character.effectState;
			_hasCart = character.hasCart;

			if (_lastState & HasAttachmentState || _hasCart) {
				EquipmentV0.ui.find('.removeOption').show();
			} else {
				EquipmentV0.ui.find('.removeOption').hide();
			}

			if (_lastState & HasCartState || _hasCart) {
				EquipmentV0.ui.find('.cartitems').show();
			} else {
				EquipmentV0.ui.find('.cartitems').hide();
			}
		}

		// Set action
		Camera.direction = 4;
		character.direction = 4;
		character.headDir = 0;
		character.action = character.ACTION.IDLE;
		character.animation = _animation;

		_savedColor.set(character.effectColor);
		character.effectColor.set(_cleanColor);

		// Rendering
		SpriteRenderer.bind2DContext(_ctx, 30, 130);
		_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
		character.renderEntity();

		// Revert changes
		character.direction = direction;
		character.headDir = headDir;
		character.action = action;
		character.animation = animation;
		character.effectColor.set(_savedColor);
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
				ui = EquipmentV0.ui.find(selector);

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
	EquipmentV0.ui.find('td').css('backgroundImage', 'none');
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
			EquipmentV0.ui.find('td').css('backgroundImage', 'none');
			EquipmentV0.onEquipItem(item.index, 'location' in item ? item.location : item.WearState);
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
	const item = _list[index];

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
	EquipmentV0.onUnEquip(index);
	EquipmentV0.ui.find('.overlay').hide();
}

/**
 * When mouse is over an equipment, display the item name
 */
function onEquipmentOver() {
	const idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
	const item = _list[idx];

	if (!item) {
		return;
	}

	// Get back data
	const overlay = EquipmentV0.ui.find('.overlay');
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
	EquipmentV0.ui.find('.overlay').hide();
}

EquipmentV0.onUpdateOwnerName = function () {
	for (const index in _list) {
		const item = _list[index];
		if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1)) {
			EquipmentV0.ui
				.find('.item[data-index="' + index + '"] .itemName')
				.text(jQuery.escape(DB.getItemName(item)));
		}
	}
};

EquipmentV0.getNumber = function () {
	let num = 0;
	for (const key in _list) {
		if (_list[key].location && _list[key].location != EquipLocation.AMMO) {
			num++;
		}
	}
	return num;
};

EquipmentV0.checkEquipLoc = function checkEquipLoc(location) {
	return 0;
};

/**
 * Returns the current tab ID of the EquipmentV0 component.
 *
 * @return {string} The current tab ID.
 */
EquipmentV0.getCurrentTabId = function () {
	return 'general'; // v0 has only equipment tab
};

/**
 * Method to define
 */
EquipmentV0.onUnEquip = function onUnEquip(/* index */) {};
EquipmentV0.onConfigUpdate = function onConfigUpdate(/* type, value*/) {};
EquipmentV0.onEquipItem = function onEquipItem(/* index, location */) {};
EquipmentV0.onRemoveCart = function onRemoveCart() {};

/**
 * Create component and export it
 */
export default UIManager.addComponent(EquipmentV0);
