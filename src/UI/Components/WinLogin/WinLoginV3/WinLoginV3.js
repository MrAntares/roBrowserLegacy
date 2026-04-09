import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Configs from 'Core/Configs.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from '../WinLoginV2/WinLoginV2.html?raw';
import cssText from '../WinLoginV2/WinLoginV2.css?raw';
import WinLoginV3Background from './WinLoginV3Background.js';

const WinLoginV3 = new UIComponent('WinLoginV3', htmlText, cssText);

WinLoginV3.needFocus = false;

const _preferences = Preferences.get(
	'WinLogin',
	{
		saveID: true,
		ID: ''
	},
	1.0
);

let _inputUsername;
let _inputPassword;
let _buttonSave;

WinLoginV3.init = function init() {
	WinLoginV3Background.init();

	this.draggable(WinLoginV3.ui.find('.win_login'));

	_inputUsername = WinLoginV3.ui.find('.user').mousedown(function (event) {
		this.focus();
		this.value = '';
		event.stopImmediatePropagation();
		return false;
	});
	_inputPassword = WinLoginV3.ui.find('.pass').mousedown(function (event) {
		this.focus();
		this.value = '';
		event.stopImmediatePropagation();
		return false;
	});
	_buttonSave = WinLoginV3.ui.find('.save').mousedown(toggleSaveButton);

	WinLoginV3.ui.find('.signup').click(signup);
	WinLoginV3.ui.find('.connect').click(connect);
	WinLoginV3.ui.find('.exit').click(exit);
};

WinLoginV3.onAppend = function onAppend() {
	WinLoginV3Background.append();

	_inputUsername.val(_preferences.saveID ? _preferences.ID : '');
	_inputPassword.val('');

	Client.loadFile(
		DB.INTERFACE_PATH + 'login_interface/chk_save' + (_preferences.saveID ? 'on' : 'off') + '.bmp',
		function (url) {
			_buttonSave.css('backgroundImage', 'url(' + url + ')');
		}
	);

	if (_preferences.ID.length) {
		_inputPassword.focus();
	} else {
		_inputUsername.focus();
	}
	WinLoginV3.placeOnTop();
};

WinLoginV3.onKeyDown = function onKeyDown(event) {
	if (!this.ui.is(':visible')) {
		return true;
	}
	switch (event.which) {
		case KEYS.ENTER:
			connect();
			event.stopImmediatePropagation();
			return false;

		case KEYS.ESCAPE:
			exit();
			event.stopImmediatePropagation();
			return false;

		case KEYS.TAB: {
			const button = document.activeElement === _inputUsername[0] ? _inputPassword : _inputUsername;
			button.focus().select();
			event.stopImmediatePropagation();
			return false;
		}
	}

	return true;
};

function toggleSaveButton(event) {
	_preferences.saveID = !_preferences.saveID;

	Client.loadFile(
		DB.INTERFACE_PATH + 'login_interface/chk_save' + (_preferences.saveID ? 'on' : 'off') + '.bmp',
		function (url) {
			_buttonSave.css('backgroundImage', 'url(' + url + ')');
		}
	);

	event.stopImmediatePropagation();
	return false;
}

function exit() {
	WinLoginV3.onExitRequest();
	return false;
}

function connect() {
	const user = _inputUsername.val();
	const pass = _inputPassword.val();

	if (_preferences.saveID) {
		_preferences.saveID = true;
		_preferences.ID = user;
	} else {
		_preferences.saveID = false;
		_preferences.ID = '';
	}

	_preferences.save();

	WinLoginV3.onConnectionRequest(user, pass);
	return false;
}

function signup() {
	const url = Configs.get('registrationweb');

	if (url) {
		UIManager.showPromptBox(
			DB.getMessage(662),
			'ok',
			'cancel',
			function () {
				window.open(url);
			},
			null
		);
	} else {
		UIManager.showPromptBox(
			'No registration URL was provided.\nIf this server uses simplified registration, then input your new:\n - Username followed by _M for Male and _F for Female account (Eg: MyUser_M)\n - Password.',
			'ok',
			'cancel',
			null,
			null
		);
	}
}

WinLoginV3.onConnectionRequest = function onConnectionRequest() {};

WinLoginV3.onExitRequest = function onExitRequest() {};

export default UIManager.addComponent(WinLoginV3);
