/**
 * UI/Components/Storage/Storage.js
 *
 * Account Storage
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var ItemType = require('DB/Items/ItemType');
	var jQuery = require('Utils/jquery');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var Mouse = require('Controls/MouseEventHandler');
	var KEYS = require('Controls/KeyEventHandler');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var InputBox = require('UI/Components/InputBox/InputBox');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var StorageFilter = require('./StorageFilter');
	var htmlText = require('text!./Storage.html');
	var cssText = require('text!./Storage.css');
	var getModule = require;

	/**
	 * Create Component
	 */
	var Storage = new UIComponent('Storage', htmlText, cssText);
	var _baseOnRemove = Storage.onRemove;

	/**
	 * Tab constant
	 */
	Storage.TAB = {
		ITEM: 0,
		KAFRA: 1,
		ARMOR: 2,
		ARMS: 3,
		AMMO: 4,
		CARD: 5,
		ETC: 6
	};

	/**
	 * @var {Array} inventory items
	 */
	var _list = [];

	/**
	 * @var {Object} storage for open filter windows
	 */
	var _openFilters = {};

	/**
	 * @var {Preference} structure to save
	 */
	var _preferences = Preferences.get(
		'Storage',
		{
			x: 200,
			y: 500,
			height: 8,
			tab: Storage.TAB.ITEM
		},
		1.0
	);

	/**
	 * Initialize UI
	 */
	Storage.init = function Init() {
		// Bind buttons
		this.ui.find('.tabs button').mousedown(onSwitchTab);
		this.ui.find('.footer .extend').mousedown(onResize);
		this.ui.find('.footer .close').click(this.onClosePressed.bind(this));
		this.ui.find('.filter-buttons button').mousedown(onFilterWindowOpen);
		this.ui.find('.filter-buttons button').mouseover(onFilterWindowHover);
		this.ui.find('.filter-buttons button').mouseout(onFilterWindowHoverOut);
		this.ui.find('.search-button').mousedown(this.onSearch.bind(this));
		this.ui.find('.storage-order-by').change(requestFilter);

		// Load tabs
		Client.loadFile(
			DB.INTERFACE_PATH + 'basic_interface/tab_itm_ex_0' + (_preferences.tab + 1) + '.bmp',
			function (data) {
				Storage.ui.find('.tabs').css('backgroundImage', 'url("' + data + '")');
			}
		);

		// Resize, position
		resizeHeight(_preferences.height);
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		// drag, drop items
		this.ui
			.on('drop', onDrop)
			.on('dragover', stopPropagation)
			.find('.container .content')
			.on('mousewheel DOMMouseScroll', onScroll)
			.on('mouseover', '.item', onItemOver)
			.on('mouseout', '.item', onItemOut)
			.on('dragstart', '.item', onItemDragStart)
			.on('dragend', '.item', onItemDragEnd)
			.on('contextmenu', '.item', onItemInfo);

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * Remove Storage from window (and so clean up items)
	 */
	Storage.onRemove = function onRemove() {
		this.ui.find('.container .content').empty();
		_list.length = 0;

		// Save preferences
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.height = Math.floor((this.ui.height() - (31 + 19 - 30)) / 32);
		_preferences.save();

		// NEW: Close all open filter windows
		for (var tabId in _openFilters) {
			if (_openFilters.hasOwnProperty(tabId)) {
				_openFilters[tabId].remove();
			}
		}

		for (var tabId in _openFilters) {
			if (_openFilters.hasOwnProperty(tabId)) {
				_openFilters[tabId].remove();
			}
		}
		_openFilters = {};
		if (typeof _baseOnRemove === 'function') {
			_baseOnRemove.call(this);
		}

		// clear input text
		Storage.ui.find('#storage-search-input').val('');
	};

	/**
	 * Add items to the list
	 */
	Storage.setItems = function setItems(items) {
		var i, count;
		for (i = 0, count = items.length; i < count; ++i) {
			if (this.addItemSub(items[i])) {
				_list.push(items[i]);
			}
		}
	};

	/**
	 * Insert Item to Storage
	 */
	Storage.addItem = function addItem(item) {
		var i = getItemIndexById(item.index);

		// NEW: Check if a filter window for this item's type is open
		var itemTab;
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

		// Found, update quantity
		if (i > -1) {
			_list[i].count += item.count;
			this.ui.find('.item[data-index="' + item.index + '"] .count').text(_list[i].count);
			return;
		}

		if (this.addItemSub(item)) {
			_list.push(item);
		}
	};

	/**
	 * Add item to Storage
	 */
	Storage.addItemSub = function addItemSub(item) {
		var tab;
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
			var it = DB.getItemInfo(item.ITID);

			this.ui
				.find('.container .content')
				.append(
					'<div class="item" data-index="' +
						item.index +
						'" draggable="true">' +
						'<div class="icon"></div>' +
						'<div class="amount">' +
						(item.count ? '<span class="count">' + item.count + '</span>' + ' ' : '') +
						'</div>' +
						'<span class="name">' +
						jQuery.escape(DB.getItemName(item)) +
						'</span>' +
						'</div>'
				);

			Client.loadFile(
				DB.INTERFACE_PATH +
					'item/' +
					(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
					'.bmp',
				function (data) {
					this.ui
						.find('.item[data-index="' + item.index + '"] .icon')
						.css('backgroundImage', 'url(' + data + ')');
				}.bind(this)
			);
		}
		return true;
	};

	/**
	 * Remove item from Storage
	 */
	Storage.removeItem = function removeItem(index, count) {
		var i = getItemIndexById(index);
		var item;

		if (i < 0) {
			return null;
		} // Not found

		// NEW: Notify all open filter windows.
		// They will check internally if they have this item.
		for (var tabId in _openFilters) {
			if (_openFilters.hasOwnProperty(tabId)) {
				_openFilters[tabId].removeItem(index, count);
			}
		}

		if (_list[i].count) {
			_list[i].count -= count;
			if (_list[i].count > 0) {
				this.ui.find('.item[data-index="' + index + '"] .count').text(_list[i].count);
				return _list[i];
			}
		}
		item = _list[i];
		_list.splice(i, 1);
		this.ui.find('.item[data-index="' + index + '"]').remove();
		// hide .overlay
		this.ui.find('.overlay').hide();
		return item;
	};

	/**
	 * Update or set the current amount of items in storage in ui
	 */
	Storage.setItemInfo = function setItemInfo(current, limit) {
		this.ui.find('.footer .current').text(current);
		this.ui.find('.footer .limit').text(limit);
	};

	Storage.onKeyDown = function onKeyDown(event) {
		if (this.ui.is(':visible')) {
			// ESCAPE
			if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
				if (typeof Storage.onClosePressed === 'function') {
					Storage.onClosePressed();
				}
			}

			// ENTER
			if (event.which === KEYS.ENTER || event.key === 'Enter') {
				if (typeof Storage.onEnterPressed === 'function') {
					Storage.onEnterPressed();
				}
			}
		}
	};

	// Search item from storage
	Storage.onSearch = function onSearch() {
		var searchInput = Storage.ui.find('#storage-search-input');
		if (!searchInput) {
			return;
		}
		var searchTerm = searchInput.val().toLowerCase();

		// create new Storage Filter with filtered items
		var filteredItems = _list.filter(function (item) {
			return DB.getItemName(item).toLowerCase().indexOf(searchTerm) > -1;
		});

		if (!_openFilters[ItemType.SEARCH]) {
			let newFilter = new StorageFilter(ItemType.SEARCH);
			// Store it so we can track it
			_openFilters[ItemType.SEARCH] = newFilter;

			// Add a callback for when the window is closed (by 'X' button)
			newFilter.onCloseCallback = function () {
				if (_openFilters[ItemType.SEARCH]) {
					delete _openFilters[ItemType.SEARCH];
				}
			};

			newFilter.onTransferItemToOtherUI = function (item) {
				Storage.transferItemToOtherUI(item);
			};

			// Add to UI and populate with items
			newFilter.append();
			newFilter.setItems('Search', filteredItems, ItemType.SEARCH);
		} else {
			_openFilters[ItemType.SEARCH].setItems('Search', filteredItems, ItemType.SEARCH);
		}
	};

	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	function onResize() {
		var ui = Storage.ui;
		var top = ui.position().top;
		var lastHeight = 0;
		var _Interval;

		function resizing() {
			var extraY = 31 + 19 - 30;
			var h = Math.floor((Mouse.screen.y - top - extraY) / 32);
			h = Math.min(Math.max(h, 8), 17);
			if (h === lastHeight) {
				return;
			}
			resizeHeight(h);
			lastHeight = h;
		}
		_Interval = setInterval(resizing, 30);

		jQuery(window).on('mouseup.resize', function (event) {
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}

	function resizeHeight(height) {
		height = Math.min(Math.max(height, 8), 17);
		Storage.ui.find('.container .content').css('height', height * 32);
		Storage.ui.css('height', 31 + 19 + height * 32);
	}

	function onSwitchTab() {
		var idx = jQuery(this).index();
		_preferences.tab = idx;

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_ex_0' + (idx + 1) + '.bmp', function (data) {
			Storage.ui.find('.tabs').css('backgroundImage', 'url("' + data + '")');
			requestFilter();
		});
	}

	function onDrop(event) {
		var item, data;
		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		} catch (e) {}
		event.stopImmediatePropagation();
		if (!data || data.type !== 'item' || (data.from !== 'Inventory' && data.from !== 'CartItems')) {
			return false;
		}
		item = data.data;
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
		Storage.ui.find('.container .content').empty();
		var i, count;
		var list = _list;
		var orderBy = Storage.ui.find('.storage-order-by').val();

		if (orderBy === 'UPGRADE' || orderBy === 'DOWNGRADE') {
			list = _list.slice(0);
			list.sort(function (a, b) {
				var nameA = DB.getItemName(a);
				var nameB = DB.getItemName(b);
				return orderBy === 'UPGRADE' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
			});
		}

		for (i = 0, count = list.length; i < count; ++i) {
			Storage.addItemSub(list[i]);
		}
	}

	function getItemIndexById(index) {
		var i, count;
		for (i = 0, count = _list.length; i < count; ++i) {
			if (_list[i].index === index) {
				return i;
			}
		}
		return -1;
	}

	function onScroll(event) {
		var delta;
		if (event.originalEvent.wheelDelta) {
			delta = event.originalEvent.wheelDelta / 120;
			if (window.opera) {
				delta = -delta;
			}
		} else if (event.originalEvent.detail) {
			delta = -event.originalEvent.detail;
		}
		this.scrollTop = Math.floor(this.scrollTop / 32) * 32 - delta * 32;
		return false;
	}

	/**
	 * NEW: Toggles a filter window on/off
	 */
	function onFilterWindowOpen() {
		var $button = jQuery(this); // The button that was clicked
		var tabId = parseInt($button.attr('data-tab-id'), 10);
		var title = $button.attr('data-title') || 'Items';

		// add .active class to button, remove if is already set
		$button.toggleClass('active');

		// --- 1. Check if window is already open ---
		if (_openFilters[tabId]) {
			// It is open, so close it
			_openFilters[tabId].remove(); // This triggers onRemove -> onCloseCallback
			delete _openFilters[tabId];

			return; // Stop here
		}

		// --- 2. If not open, create a new one ---
		var i, count, tab;
		var filtered_list = [];

		// Build the list of items for this filter
		for (i = 0, count = _list.length; i < count; ++i) {
			var item = _list[i];
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

		// Create a new instance of our StorageFilter class
		var newFilter = new StorageFilter(tabId);

		// Store it so we can track it
		_openFilters[tabId] = newFilter;

		// Add a callback for when the window is closed (by 'X' button)
		newFilter.onCloseCallback = function () {
			// remove .active class from button
			$button.removeClass('active');

			if (_openFilters[tabId]) {
				delete _openFilters[tabId];
			}
		};

		newFilter.onTransferItemToOtherUI = function (item) {
			Storage.transferItemToOtherUI(item);
		};

		// Add to UI and populate with items
		newFilter.append();
		newFilter.setItems(title, filtered_list, tabId);
	}

	function onFilterWindowHover() {
		// move overlay to the current component location and set text get from data-title attribute
		var $button = jQuery(this);
		var title = $button.attr('data-title');
		Storage.ui.find('.overlay').text(title);
		// get Storage.ui height
		var height = Storage.ui.height();
		Storage.ui.find('.overlay').css({ top: height - 50, left: $button.position().left });
		Storage.ui.find('.overlay').show();
	}

	function onFilterWindowHoverOut() {
		Storage.ui.find('.overlay').hide();
	}

	function onItemOver() {
		var idx = parseInt(this.getAttribute('data-index'), 10);
		var i = getItemIndexById(idx);
		if (i < 0) {
			return;
		}
		var item = _list[i];
		var pos = jQuery(this).position();
		var overlay = Storage.ui.find('.overlay');
		overlay.show();
		overlay.css({ top: pos.top - 10, left: pos.left + 35 });
		overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');
		overlay.toggleClass('grey', !item.IsIdentified);
	}

	function onItemOut() {
		Storage.ui.find('.overlay').hide();
	}

	function onItemDragStart(event) {
		var index = parseInt(this.getAttribute('data-index'), 10);
		var i = getItemIndexById(index);
		if (i === -1) {
			return;
		}
		var img = new Image();
		var url = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
		url = url = url.replace(/^\"/, '').replace(/\"$/, '');
		img.src = url;
		event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
		event.originalEvent.dataTransfer.setData(
			'Text',
			JSON.stringify(
				(window._OBJ_DRAG_ = {
					type: 'item',
					from: 'Storage',
					data: _list[i]
				})
			)
		);
		onItemOut();
	}

	function onItemDragEnd() {
		delete window._OBJ_DRAG_;
	}

	function onItemInfo(event) {
		event.stopImmediatePropagation();
		var index = parseInt(this.getAttribute('data-index'), 10);
		var i = getItemIndexById(index);
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
		var CartItems = getModule('UI/Components/CartItems/CartItems');
		var Inventory = getModule('UI/Components/Inventory/Inventory');
		var isInventoryOpen = Inventory.getUI().ui ? Inventory.getUI().ui.is(':visible') : false;
		var isCartOpen = CartItems.ui ? CartItems.ui.is(':visible') : false;
		if (!item) {
			return false;
		}
		var count = item.count || 1;
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

	return UIManager.addComponent(Storage);
});
