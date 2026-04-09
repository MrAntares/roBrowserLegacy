/**
 * UI/Components/Storage/StorageFilter.js
 *
 * A simple window to show a filtered list of items from Storage.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIComponent from 'UI/UIComponent.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import htmlText from './StorageFilter.html?raw';
import cssText from './StorageFilter.css?raw';

/**
 * Create StorageFilter "class"
 * Inherit from UIComponent
 */
function StorageFilter(tabId) {
	const prefName = 'StorageFilter_' + tabId;
	UIComponent.call(this, prefName, htmlText, cssText);

	this.onRemove = function () {
		this.ui.find('.content').empty();
		this._list.length = 0;
		this._currentTabId = -1;

		this._preferences.y = parseInt(this.ui.css('top'), 10);
		this._preferences.x = parseInt(this.ui.css('left'), 10);
		this._preferences.height = Math.floor(this.ui.find('.content').height() / 32);
		this._preferences.save();

		if (typeof this.onCloseCallback === 'function') {
			this.onCloseCallback();
		}
	};

	this._list = [];
	this._currentTabId = -1;
	this._preferences = Preferences.get(
		prefName,
		{
			x: 300 + tabId * 20,
			y: 200 + tabId * 20,
			height: 4
		},
		1.0
	);
	this.onCloseCallback = null;
}

// Inherit
StorageFilter.prototype = Object.create(UIComponent.prototype);
StorageFilter.prototype.constructor = StorageFilter;

/**
 * Initialize the component
 */
StorageFilter.prototype.init = function Init() {
	const self = this; // Store 'this' for event handlers

	this.ui.find('.titlebar .right .close').click(function () {
		self.remove(); // .remove() is inherited from UIComponent
	});

	this.ui.find('.footer .extend').mousedown(this.onResize.bind(this));

	this.ui.css({
		top: Math.min(Math.max(0, this._preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, this._preferences.x), Renderer.width - this.ui.width())
	});

	this.resizeHeight(this._preferences.height);

	this.ui
		.find('.content')
		.on('mouseover', '.item', this.onItemOver.bind(this))
		.on('mouseout', '.item', this.onItemOut.bind(this))
		.on('contextmenu', '.item', this.onItemInfo.bind(this))
		.on('dragstart', '.item', this.onItemDragStart.bind(this))
		.on('dragend', '.item', this.onItemDragEnd.bind(this));

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Public method to set the items and title of this window
 */
StorageFilter.prototype.setItems = function SetItems(title, items, tabId) {
	this._list = items.slice(0); // Copy the list
	this._currentTabId = tabId;
	this.ui.find('.titlebar .text').text(title);
	this.ui.find('.content').empty();

	let i, count;
	for (i = 0, count = this._list.length; i < count; ++i) {
		this.renderItem(this._list[i]);
	}
};

/**
 * Renders a single item in the content area
 */
StorageFilter.prototype.renderItem = function RenderItem(item) {
	const it = DB.getItemInfo(item.ITID);
	const self = this; // for Client.loadFile callback

	this.ui
		.find('.content')
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
			// Use self.ui to avoid 'this' conflicts
			self.ui.find('.item[data-index="' + item.index + '"] .icon').css('backgroundImage', 'url(' + data + ')');
		}
	);
};

// --- Item Event Handlers ---

StorageFilter.prototype.getItemFromIndex = function getItemFromIndex(index) {
	return this._list.filter(function (item) {
		return item.index === index;
	})[0];
};

StorageFilter.prototype.onItemOver = function onItemOver(event) {
	const index = parseInt(event.currentTarget.getAttribute('data-index'), 10);
	const item = this.getItemFromIndex(index);
	if (!item) {
		return;
	}

	const pos = jQuery(event.currentTarget).position();
	const overlay = this.ui.find('.overlay');

	overlay.show();
	overlay.css({ top: pos.top - 10, left: pos.left + 35 });
	overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');
	overlay.toggleClass('grey', !item.IsIdentified);
};

StorageFilter.prototype.onItemOut = function onItemOut() {
	this.ui.find('.overlay').hide();
};

StorageFilter.prototype.onItemDragStart = function onItemDragStart(event) {
	const index = parseInt(event.currentTarget.getAttribute('data-index'), 10);
	const item = this.getItemFromIndex(index);
	if (!item) {
		return;
	}

	const img = new Image();
	const url = event.currentTarget.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1].replace(/\"/g, '');
	img.src = url;

	event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
	event.originalEvent.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Storage',
				data: item
			})
		)
	);
	this.onItemOut(); // Call instance method
};

StorageFilter.prototype.onItemDragEnd = function onItemDragEnd() {
	delete window._OBJ_DRAG_;
};

StorageFilter.prototype.onItemInfo = function onItemInfo(event) {
	event.stopImmediatePropagation();
	const index = parseInt(event.currentTarget.getAttribute('data-index'), 10);
	const item = this.getItemFromIndex(index);
	if (!item) {
		return false;
	}

	if (event.altKey && event.which === 3) {
		if (typeof this.onTransferItemToOtherUI === 'function') {
			this.onTransferItemToOtherUI(item);
		}
		return false;
	}

	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
	}

	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);
	return false;
};

// --- Resize Functions ---

StorageFilter.prototype.resizeHeight = function resizeHeight(height) {
	height = Math.min(Math.max(height, 4), 10);
	this.ui.find('.content').css('height', height * 32);
	this.ui.css('height', height * 32 + 17 + 19);
};

StorageFilter.prototype.onResize = function onResize() {
	const self = this;
	const ui = this.ui;
	const top = ui.position().top;
	let lastHeight = 0;
	const extraY = 17 + 19;

	function resizing() {
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);
		h = Math.min(Math.max(h, 4), 10);

		if (h === lastHeight) {
			return;
		}
		self.resizeHeight(h); // Use self to call instance method
		lastHeight = h;
	}

	const _Interval = setInterval(resizing, 30);

	jQuery(window).on('mouseup.resizeStorageFilter', function (event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			jQuery(window).off('mouseup.resizeStorageFilter');
		}
	});
};

// --- Public Sync Functions ---

StorageFilter.prototype.getCurrentTab = function GetCurrentTab() {
	return this._currentTabId;
};

StorageFilter.prototype.removeItem = function RemoveItem(index, count) {
	let i = -1;
	for (let j = 0, count_ = this._list.length; j < count_; ++j) {
		if (this._list[j].index === index) {
			i = j;
			break;
		}
	}
	if (i < 0) {
		return;
	}

	const item = this._list[i];
	if (item.count) {
		item.count -= count;
		if (item.count > 0) {
			this.ui.find('.item[data-index="' + index + '"] .count').text(item.count);
			return;
		}
	}
	this._list.splice(i, 1);
	this.ui.find('.item[data-index="' + index + '"]').remove();
	this.ui.find('.overlay').hide();
};

StorageFilter.prototype.addItem = function AddItem(item) {
	for (let j = 0, count_ = this._list.length; j < count_; ++j) {
		if (this._list[j].index === item.index) {
			this._list[j].count += item.count;
			this.ui.find('.item[data-index="' + item.index + '"] .count').text(this._list[j].count);
			return;
		}
	}
	this._list.push(JSON.parse(JSON.stringify(item)));
	this.renderItem(item); // Call instance method
};

// Return the constructor
export default StorageFilter;
