/**
 * UI/Components/ChatBoxSettings/ChatBoxSettings.js
 *
 * Chat Box Settings
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

import DB from 'DB/DBManager.js';
import Preferences from 'Core/Preferences.js';
import jQuery from 'Utils/jquery.js';
import Renderer from 'Renderer/Renderer.js';
import Client from 'Core/Client.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './ChatBoxSettings.html?raw';
import cssText from './ChatBoxSettings.css?raw';
/**
 * Create Component
 */
const ChatBoxSettings = new UIComponent('ChatBoxSettings', htmlText, cssText);

/**
 * @var {boolean} is ChatBoxSettings open ? (Temporary fix)
 */
ChatBoxSettings.isOpen = false;

ChatBoxSettings.tabOption = [];

ChatBoxSettings.activeTab = 0;

/**
 * @var {Preference} structure to save
 */
const _preferences = Preferences.get(
	'ChatBoxSettings',
	{
		x: 480,
		y: 200,
		width: 7,
		height: 4
	},
	1.0
);

/**
 * Initialize UI
 */
ChatBoxSettings.init = function init() {
	// Bindings
	this.ui.find('.extend').mousedown(onResize);
	this.ui.find('.close').click(function () {
		ChatBoxSettings.ui.hide();
	});

	this.ui.find('.listoption');

	this.ui.on('click', '.content .listoption button', onClickOption);
	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Initialize UI
 */
ChatBoxSettings.onAppend = function onAppend() {
	//resize( _preferences.width, _preferences.height );

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Key Event Handler
 *
 * @param {object} event - KeyEventHandler
 * @return {boolean}
 */
ChatBoxSettings.onKeyDown = function onKeyDown(event) {};

function onClickOption(evt) {
	const _elem = jQuery(evt.currentTarget);
	const _dataId = _elem.data('id');
	let isOn = false;

	if (!_elem) {
		return;
	}

	isOn = _elem.hasClass('on');

	if (isOn) {
		_elem.removeClass('on');
		isOn = false;
	} else {
		_elem.addClass('on');
		isOn = true;
	}

	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/grp_' + (isOn ? 'online' : 'offline') + '.bmp',
		function (data) {
			_elem.css('backgroundImage', 'url(' + data + ')');
		}
	);

	if (!isNaN(_dataId)) {
		const idsIndex = ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].indexOf(_dataId);

		if (idsIndex > -1) {
			ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].splice(idsIndex, 1);
		} else {
			ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].push(_dataId);
		}
	}
}

/**
 * Resize ChatBoxSettings
 */
function onResize() {
	const ui = ChatBoxSettings.ui;
	const top = ui.position().top;
	const left = ui.position().left;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizeProcess() {
		const extraX = 23 + 16 + 16 - 30;
		const extraY = 31 + 19 - 30;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		// Maximum and minimum window size
		w = Math.min(Math.max(w, 7), 14);
		h = Math.min(Math.max(h, 3), 8);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizeProcess, 30);

	// Stop resizing
	jQuery(window).one('mouseup', function (event) {
		// Only on left click
		if (event.which === 1) {
			clearInterval(_Interval);
		}
	});
}

ChatBoxSettings.toggle = function toggle() {
	if (this.ui.is(':visible')) {
		this.ui.hide();
	} else {
		this.ui.show();
	}
};

ChatBoxSettings.updateTab = function updateTab(tabID, tabName) {
	const optList = ChatBoxSettings.tabOption[tabID];
	const elems = this.ui.find('.content .listoption button');

	this.activeTab = tabID;

	this.ui.find('.tabname').html(tabName);

	elems.removeClass('on');
	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_offline.bmp', function (data) {
		elems.css('backgroundImage', 'url(' + data + ')');
	});

	this.ui.find('.content .listoption button').each(function () {
		const _elem = jQuery(this);
		const id = _elem.data('id');

		if (optList.includes(id)) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_online.bmp', function (data) {
				_elem.css('backgroundImage', 'url(' + data + ')');
			});
			_elem.addClass('on');
		}
	});
};

/**
 * Extend inventory window size
 */
function resize(width, height) {
	width = Math.min(Math.max(width, 7), 14);
	height = Math.min(Math.max(height, 3), 8);

	ChatBoxSettings.ui.css('width', 23 + 16 + 16 + width * 32);
	ChatBoxSettings.ui.find('.resize').css('height', height * 32);
}

/**
 * Create component and export it
 */
export default UIManager.addComponent(ChatBoxSettings);
