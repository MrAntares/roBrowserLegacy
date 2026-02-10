/**
 * UI/Components/Equipment/EquipmentV3/EquipmentV3.js
 *
 * Chararacter Equipment window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var StatusConst = require('DB/Status/StatusState');
	var EquipLocation = require('DB/Items/EquipmentLocation');
	var Network = require('Network/NetworkManager');
	var PACKETVER = require('Network/PacketVerManager');
	var PACKET = require('Network/PacketStructure');
	var ItemType = require('DB/Items/ItemType');
	var jQuery = require('Utils/jquery');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Session = require('Engine/SessionStorage');
	var Renderer = require('Renderer/Renderer');
	var Camera = require('Renderer/Camera');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var UIVersionManager = require('UI/UIVersionManager');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var CartItems = require('UI/Components/CartItems/CartItems');
	var SwitchEquip = require('UI/Components/SwitchEquip/SwitchEquip');
	var WinStats = require('UI/Components/WinStats/WinStats');
	var htmlText = require('text!./EquipmentV3.html');
	var cssText = require('text!./EquipmentV3.css');
	var getModule = require;

	/**
	 * Create Component
	 */
	var EquipmentV3 = new UIComponent('EquipmentV3', htmlText, cssText);

	/**
	 * @var {Preference} window preferences
	 */
	var _preferences = Preferences.get(
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
	var _ctx = [];

	/**
	 * @var {boolean} show equipment to other people ?
	 */
	var _showEquip = false;

	/**
	 * @var {jQuery} button that appeared when level up
	 */
	var _btnLevelUp;

	/**
	 * @var {jQuery} variable for UI tabs
	 */
	var tabLinks = new Array();
	var contentDivs = new Array();
	var currentTabId = 'general'; // Variable to store the current tab's ID

	/**
	 * @var {jQuery} variable for Switch Equip
	 */
	var switchappend;
	var switchUIopen;

	/**
	 * @var {number} title id
	 */
	var _currentTitleId = 0;

	/**
	 * Initialize UI
	 */
	EquipmentV3.init = function init() {
		_ctx.push(this.ui.find('canvas')[0].getContext('2d'));
		_ctx.push(this.ui.find('canvas')[1].getContext('2d'));

		// Grab the tab links and content divs from the page
		var tabListItems = document.getElementById('tabs').childNodes;
		for (var i = 0; i < tabListItems.length; i++) {
			if (tabListItems[i].nodeName == 'DIV') {
				var tabLink = getFirstChildWithTagName(tabListItems[i], 'A');
				var id = getHash(tabLink.getAttribute('href'));
				tabLinks[id] = tabLink;
				contentDivs[id] = document.getElementById(id);
			}
		}

		// Assign onclick events to the tab links, and
		// highlight the first tab
		var i = 0;

		for (var id in tabLinks) {
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
		var i = 0;

		for (var id in contentDivs) {
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
				.click(function () {
					_btnLevelUp.detach();
					EquipmentV3.ui.show();
					EquipmentV3.ui.parent().append(EquipmentV3.ui);

					if (EquipmentV3.ui.is(':visible')) {
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
		var selectedId = getHash(this.getAttribute('href'));

		// Highlight the selected tab, and dim all others.
		// Also show the selected content div, and hide all others.
		for (var id in contentDivs) {
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
		for (var i = 0; i < element.childNodes.length; i++) {
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
		var hashPos = url.lastIndexOf('#');
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
		var pkt = new PACKET.CZ.REQ_CARTOFF();
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
	 * Add an equipment to the window
	 *
	 * @param {Item} item
	 */
	EquipmentV3.equip = function equip(item, location) {
		var it = DB.getItemInfo(item.ITID);
		item.equipped = location;
		EquipmentV3._itemlist[item.index] = item;
		function add3Dots(string, limit) {
			var dots = '...';
			if (string.length > limit) {
				string = string.substring(0, limit) + dots;
			}

			return string;
		}

		this.ui
			.find(getSelectorFromLocation(location))
			.html(
				'<div class="item" data-index="' +
					item.index +
					'">' +
					'<button><div class="grade"></div></button>' +
					'<span class="itemName">' +
					add3Dots(
						jQuery.escape(
							DB.getItemName(item, { showItemGrade: false, showItemSlots: false, showItemOptions: false })
						),
						19
					) +
					'</span>' +
					'</div>'
			);

		Client.loadFile(
			DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp',
			function (data) {
				this.ui
					.find('.item[data-index="' + item.index + '"] button')
					.css('backgroundImage', 'url(' + data + ')');
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

		var Inventory = getModule('UI/Components/Inventory/Inventory');

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
		var selector = getSelectorFromLocation(location);
		var item = EquipmentV3._itemlist[index];
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
		for (var key in EquipmentV3._itemlist) {
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
		var self = EquipmentV3.ui.find('.view_status');
		var status = WinStats.getUI().ui;
		var state = status.is(':visible') ? 'on' : 'off';

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
	var renderCharacter = (function renderCharacterClosure() {
		var _lastState = 0;
		var _hasCart = 0;

		var _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
		var _savedColor = new Float32Array(4);
		var _animation = {
			tick: 0,
			frame: 0,
			repeat: true,
			play: true,
			next: false,
			delay: 0,
			save: false
		};

		// Current removable options
		var HasAttachmentState =
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

		var HasCartState =
			StatusConst.EffectState.CART1 |
			StatusConst.EffectState.CART2 |
			StatusConst.EffectState.CART3 |
			StatusConst.EffectState.CART4 |
			StatusConst.EffectState.CART5;

		return function renderCharacter() {
			var Entity = getModule('Renderer/Entity/Entity');
			var equip_character = new Entity();
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
			for (var i = 0; i < _ctx.length; i++) {
				var ctx = _ctx[i];
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
		var selector = [];

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
			var data = window._OBJ_DRAG_;
			var item, selector, ui;

			// Just support items for now ?
			if (data.type === 'item') {
				item = data.data;

				if (
					(item.type === ItemType.WEAPON ||
						item.type === ItemType.ARMOR ||
						item.type === ItemType.SHADOWGEAR) &&
					item.IsIdentified &&
					!item.IsDamaged
				) {
					selector = getSelectorFromLocation('location' in item ? item.location : item.WearLocation);
					ui = EquipmentV3.ui.find(selector);

					Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/item_invert.bmp', function (data) {
						ui.css('backgroundImage', 'url(' + data + ')');
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
		var item, data;

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		} catch (e) {}

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
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = EquipmentV3._itemlist[index];

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
		var index = parseInt(this.getAttribute('data-index'), 10);
		EquipmentV3.onUnEquip(index);
		EquipmentV3.ui.find('.overlay').hide();
	}

	/**
	 * When mouse is over an equipment, display the item name
	 */
	function onEquipmentOver() {
		var idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
		var item = EquipmentV3._itemlist[idx];

		if (!item) {
			return;
		}

		// Get back data
		var overlay = EquipmentV3.ui.find('.overlay');
		var pos = jQuery(this).position();

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
		for (var index in EquipmentV3._itemlist) {
			var item = EquipmentV3._itemlist[index];
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
		var num = 0;
		for (var key in EquipmentV3._itemlist) {
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
		var titleList = this.ui.find('#title_list');
		titleList.empty();

		var removeTitleText = DB.getMessage(2686) || 'Remove Title';
		var removeSelectedClass = _currentTitleId === 0 ? ' selected' : '';
		var removeElement = jQuery(
			'<div class="title-option' + removeSelectedClass + '" data-title="0">' + removeTitleText + '</div>'
		);
		titleList.append(removeElement);

		var allTitles = DB.getAllTitles();
		for (var titleId in allTitles) {
			if (allTitles.hasOwnProperty(titleId)) {
				// TODO: Check if player finished achievment for title
				var titleName = allTitles[titleId];
				var selectedClass = parseInt(titleId) === _currentTitleId ? ' selected' : '';
				var titleElement = jQuery(
					'<div class="title-option' +
						selectedClass +
						'" data-title="' +
						titleId +
						'">' +
						titleName +
						'</div>'
				);
				titleList.append(titleElement);
			}
		}

		titleList.off('click', '.title-option');
		titleList.on('click', '.title-option', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var titleId = parseInt(this.getAttribute('data-title'));
			EquipmentV3.selectTitle(titleId);
		});
	};

	EquipmentV3.selectTitle = function (titleId) {
		var pkt = new PACKET.CZ.REQ_CHANGE_TITLE();
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
		for (var key in EquipmentV3._itemlist) {
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
		var equipmentKeys = Object.keys(EquipmentV3._itemlist);

		for (var i = 0; i < equipmentKeys.length; i++) {
			var key = equipmentKeys[i];
			var equipmentItem = EquipmentV3._itemlist[key];

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
	return UIManager.addComponent(EquipmentV3);
});
