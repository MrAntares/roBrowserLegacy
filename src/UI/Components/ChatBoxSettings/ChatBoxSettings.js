/**
 * UI/Components/ChatBoxSettings/ChatBoxSettings.js
 *
 * Chat Box Settings
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Client from 'Core/Client.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './ChatBoxSettings.html?raw';
import cssText from './ChatBoxSettings.css?raw';

/**
 * Create Component
 */
const ChatBoxSettings = new GUIComponent('ChatBoxSettings', cssText);

/**
 * Render HTML
 */
ChatBoxSettings.render = () => htmlText;

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
	const root = this._shadow || this._host;

	const extendBtn = root.querySelector('.extend');
	if (extendBtn) {
		extendBtn.addEventListener('mousedown', onResize);
	}

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			this._host.style.display = 'none';
		});
	}

	// Event delegation for option buttons
	const listOption = root.querySelector('.listoption');
	if (listOption) {
		listOption.addEventListener('click', event => {
			const btn = event.target.closest('button');
			if (btn) {
				onClickOption(btn);
			}
		});
	}

	this.draggable('.titlebar');
};

/**
 * Once in HTML
 */
ChatBoxSettings.onAppend = function onAppend() {
	const rect = this._host.getBoundingClientRect();
	this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - rect.height) + 'px';
	this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - rect.width) + 'px';
	this._host.style.display = 'none';

	resize(_preferences.width, _preferences.height);
};

/**
 * Key Event Handler
 */
ChatBoxSettings.onKeyDown = function onKeyDown(event) {};

/**
 * Handle option button click
 */
function onClickOption(btn) {
	const dataId = parseInt(btn.getAttribute('data-id'), 10);
	let isOn = btn.classList.contains('on');

	if (isOn) {
		btn.classList.remove('on');
		isOn = false;
	} else {
		btn.classList.add('on');
		isOn = true;
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_' + (isOn ? 'online' : 'offline') + '.bmp', data => {
		btn.style.backgroundImage = 'url(' + data + ')';
	});

	if (!isNaN(dataId)) {
		const idsIndex = ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].indexOf(dataId);

		if (idsIndex > -1) {
			ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].splice(idsIndex, 1);
		} else {
			ChatBoxSettings.tabOption[ChatBoxSettings.activeTab].push(dataId);
		}
	}
}

/**
 * Resize ChatBoxSettings
 */
function onResize() {
	const rect = ChatBoxSettings._host.getBoundingClientRect();
	const top = rect.top;
	const left = rect.left;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizeProcess() {
		const extraX = 23 + 16 + 16 - 30;
		const extraY = 31 + 19 - 30;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		w = Math.min(Math.max(w, 7), 14);
		h = Math.min(Math.max(h, 3), 8);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	const interval = setInterval(resizeProcess, 30);

	const onMouseUp = event => {
		if (event.which === 1) {
			clearInterval(interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
	window.addEventListener('mouseup', onMouseUp);
}

ChatBoxSettings.toggle = function toggle() {
	if (this._host.style.display === 'none') {
		this._host.style.display = '';
	} else {
		this._host.style.display = 'none';
	}
};

ChatBoxSettings.updateTab = function updateTab(tabID, tabName) {
	const root = this._shadow || this._host;
	const optList = ChatBoxSettings.tabOption[tabID];
	const buttons = root.querySelectorAll('.content .listoption button');

	this.activeTab = tabID;

	root.querySelector('.tabname').textContent = tabName;

	buttons.forEach(btn => {
		btn.classList.remove('on');
		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_offline.bmp', data => {
			btn.style.backgroundImage = 'url(' + data + ')';
		});
	});

	buttons.forEach(btn => {
		const id = parseInt(btn.getAttribute('data-id'), 10);

		if (optList && optList.includes(id)) {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_online.bmp', data => {
				btn.style.backgroundImage = 'url(' + data + ')';
			});
			btn.classList.add('on');
		}
	});
};

/**
 * Extend window size
 */
function resize(width, height) {
	width = Math.min(Math.max(width, 7), 14);
	height = Math.min(Math.max(height, 3), 8);

	const root = ChatBoxSettings._shadow || ChatBoxSettings._host;
	ChatBoxSettings._host.style.width = 23 + 16 + 16 + width * 32 + 'px';

	const content = root.querySelector('.content');
	if (content) {
		content.style.height = height * 32 + 'px';
	}

	const list = root.querySelector('.listoption');
	if (list) {
		list.style.height = height * 32 - 31 + 'px';
	}

	_preferences.width = width;
	_preferences.height = height;
	_preferences.save();
}

ChatBoxSettings.onRemove = function onRemove() {
	_preferences.y = parseInt(this._host.style.top, 10) || 0;
	_preferences.x = parseInt(this._host.style.left, 10) || 0;
	_preferences.save();
};

ChatBoxSettings.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Create component and export it
 */
export default UIManager.addComponent(ChatBoxSettings);
