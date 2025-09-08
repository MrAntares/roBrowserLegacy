/**
 * UI/Components/WinLoginV2/WinLoginV2.js
 *
 * WinLoginV2 windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB          = require('DB/DBManager');
	var Client      = require('Core/Client');
	var Configs     = require('Core/Configs');
	var Preferences = require('Core/Preferences');
	var KEYS        = require('Controls/KeyEventHandler');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText    = require('text!./WinLoginV2.html');
	var cssText     = require('text!./WinLoginV2.css');
	var WinLoginV2Background = require('./WinLoginV2Background');

	/**
	 * Create WinLogin namespace
	 */
	var WinLoginV2 = new UIComponent( 'WinLoginV2', htmlText, cssText );

	/**
	 * @var {boolean} focus element zIndex ?
	 */
	WinLoginV2.needFocus = false;

	/**
	 * @var {Preferences}
	 */
	var _preferences = Preferences.get('WinLogin', {
		saveID: true,
		ID:     ''
	}, 1.0);


	/**
	 * @var {jQuery} username input
	 */
	var _inputUsername;


	/**
	 * @var {jQuery} userpass input
	 */
	var _inputPassword;


	/**
	 * @var {jQuery} save login ?
	 */
	var _buttonSave;


	/**
	 * Initialize win_login UI - Inherit from UIComponent
	 */
	WinLoginV2.init = function init()
	{

		WinLoginV2Background.init();

		this.draggable(WinLoginV2.ui.find('.win_login'));

		// Save Elements
		_inputUsername = WinLoginV2.ui.find('.user').mousedown(function(event){ this.focus(); this.value = ''; event.stopImmediatePropagation(); return false; });
		_inputPassword = WinLoginV2.ui.find('.pass').mousedown(function(event){ this.focus(); this.value = ''; event.stopImmediatePropagation(); return false; });
		_buttonSave    = WinLoginV2.ui.find('.save').mousedown(toggleSaveButton);

		// Connect / Exit

		WinLoginV2.ui.find('.signup').click(signup);
		WinLoginV2.ui.find('.connect').click(connect);
		WinLoginV2.ui.find('.exit').click(exit);
	};


	/**
	 * Once the component is on html - InHerit from UIComponent
	 */
	WinLoginV2.onAppend = function onAppend()
	{
		WinLoginV2Background.append();
		// Complete element
		_inputUsername.val(_preferences.saveID ? _preferences.ID : '');
		_inputPassword.val('');

		// Display save button
		Client.loadFile( DB.INTERFACE_PATH + 'login_interface/chk_save' + ( _preferences.saveID ? 'on' : 'off' ) + '.bmp', function(url) {
			_buttonSave.css('backgroundImage', 'url(' + url + ')');
		});

		if (_preferences.ID.length) {
			_inputPassword.focus();
		}
		else {
			_inputUsername.focus();
		}
		WinLoginV2.placeOnTop();
	};


	/**
	 * When player press key - InHerit from UIComponent
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	WinLoginV2.onKeyDown = function onKeyDown( event )
	{
		if (!this.ui.is(':visible')) return true;
		switch (event.which)
		{
			case KEYS.ENTER:
				connect();
				event.stopImmediatePropagation();
				return false;

			case KEYS.ESCAPE:
				exit();
				event.stopImmediatePropagation();
				return false;

			case KEYS.TAB:
				var button = document.activeElement === _inputUsername[0] ? _inputPassword : _inputUsername;
				button.focus().select();
				event.stopImmediatePropagation();
				return false;
		}

		return true;
	};


	/**
	 * Switch the save button
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	function toggleSaveButton( event )
	{
		_preferences.saveID = !_preferences.saveID;

		Client.loadFile( DB.INTERFACE_PATH + 'login_interface/chk_save' + ( _preferences.saveID ? 'on' : 'off' ) + '.bmp', function(url) {
			_buttonSave.css('backgroundImage', 'url(' + url + ')');
		});

		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * When the user click on Exit, or pressed "Escape"
	 */
	function exit()
	{
		WinLoginV2.onExitRequest();
		return false;
	}


	/**
	 * When user click on the button "connect", or press "enter".
	 *
	 * @return {boolean} false
	 */
	function connect()
	{
		var user = _inputUsername.val();
		var pass = _inputPassword.val();

		// Store variable in localStorage
		if (_preferences.saveID) {
			_preferences.saveID = true;
			_preferences.ID     = user;
		}
		else {
			_preferences.saveID = false;
			_preferences.ID     = '';
		}

		_preferences.save();

		// Connect
		WinLoginV2.onConnectionRequest( user, pass );
		return false;
	}

	/**
	 * Signup button func that takes the player to the <registrationweb>
	 */
	function signup(){
		var url = Configs.get('registrationweb');

		if(url){
			UIManager.showPromptBox( DB.getMessage(662), 'ok', 'cancel', function(){
				window.open(url);
			}, null);

		} else {
			UIManager.showPromptBox( "No registration URL was provided.\nIf this server uses simplified registration, then input your new:\n - Username followed by _M for Male and _F for Female account (Eg: MyUser_M)\n - Password.", 'ok', 'cancel', null, null);
		}

	}


	/**
	 * Abstract function once user want to connect
	 */
	WinLoginV2.onConnectionRequest = function onConnectionRequest(/* user, pass */){};


	/**
	 * Abstract function when user want to exit
	 */
	WinLoginV2.onExitRequest = function onExitRequest(){};


	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(WinLoginV2);
});
