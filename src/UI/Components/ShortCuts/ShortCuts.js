/**
 * UI/Components/ShortCuts/ShortCuts.js
 *
 * Chararacter ShortCuts
 *
 * @author Francisco Wallison
 *
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var jQuery = require('Utils/jquery');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var Mouse = require('Controls/MouseEventHandler');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Emoticons = require('UI/Components/Emoticons/Emoticons');
	var htmlText = require('text!./ShortCuts.html');
	var cssText = require('text!./ShortCuts.css');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var getModule = require;

	/**
	 * Create Component
	 */
	var ShortCuts = new UIComponent('ShortCuts', htmlText, cssText);

	/**
	 * @var {Preferences} structure
	 */
	var _MACRO_INIT = Preferences.get(
		'_MACRO_CMD',
		{
			Num_1: '/hide',
			Num_2: '/?',
			Num_3: '/ho',
			Num_4: '/lv',
			Num_5: '/swt',
			Num_6: '/ic',
			Num_7: '/an',
			Num_8: '/ag',
			Num_9: '/$',
			Num_0: '/...'
		},
		1.0
	);

	// Fixed, can't change them
	var _FLAG_INIT = {
		Num_1: 13, //ET_FLAG
		Num_2: 35, //ET_INDONESIA_FLAG
		Num_3: 48, // ET_PH_FLAG
		Num_4: 49, //ET_MY_FLAG
		Num_5: 50, //ET_SI_FLAG
		Num_6: 51, //ET_BR_FLAG
		Num_7: 64, //ET_INDIA_FLAG
		Num_8: 66, //ET_FLAG8
		Num_9: 67 //ET_FLAG9
	};

	/**
	 * Store ShortCuts items
	 */
	ShortCuts.list = [];

	/**
	 * @var {number} used to remember the window height
	 */
	var _realSize = 0;

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'ShortCuts',
		{
			x: 0,
			y: 172,
			width: 7,
			height: 4,
			show: false,
			reduce: false,
			magnet_top: false,
			magnet_bottom: false,
			magnet_left: true,
			magnet_right: false
		},
		1.0
	);

	/**
	 * Initialize UI
	 */
	ShortCuts.init = function Init() {
		this.ui.find('.footer button').mousedown(function () {
			if (this.className == 'emoticons') {
				Emoticons.onShortCut({ cmd: 'TOGGLE' });
			}
		});

		this.ui.find('.close').click(onClose);
		this.ui.find('.macro input').mousedown(function () {
			// this.focus();
			jQuery('.macro_').removeClass('input_macro_focus');
			jQuery(this).addClass('input_macro_focus');

			jQuery(this).select();
		});

		this.ui.find('input[type=text]').on('drop', onDropText).on('dragover', stopPropagation);

		addValuesAlt(this);
		loadValuesAlt();

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * Apply preferences once append to body
	 */
	ShortCuts.onAppend = function OnAppend() {
		if (!_preferences.show) {
			this.ui.hide();
		}

		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});
	};

	/**
	 * Remove ShortCuts from window (and so clean up items)
	 */
	ShortCuts.onRemove = function OnRemove() {
		this.ui.find('.container .content').empty();
		this.list.length = 0;
		jQuery('.ItemInfo').remove();

		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.reduce = !!_realSize;
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.width = Math.floor((this.ui.width() - (23 + 16 + 16 - 30)) / 32);
		_preferences.height = Math.floor((this.ui.height() - (31 + 19 - 30)) / 32);
		_preferences.magnet_top = this.magnet.TOP;
		_preferences.magnet_bottom = this.magnet.BOTTOM;
		_preferences.magnet_left = this.magnet.LEFT;
		_preferences.magnet_right = this.magnet.RIGHT;
		_preferences.save();
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	ShortCuts.onShortCut = function onShurtCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				// Remove input focus
				jQuery('.macro_').removeClass('input_macro_focus');
				if (this.ui.is(':visible')) {
					this.focus();
				}
				break;
			// Macros
			case 'EXECUTE_MACRO_1':
				executeCmd(1);
				break;
			case 'EXECUTE_MACRO_2':
				executeCmd(2);
				break;
			case 'EXECUTE_MACRO_3':
				executeCmd(3);
				break;
			case 'EXECUTE_MACRO_4':
				executeCmd(4);
				break;
			case 'EXECUTE_MACRO_5':
				executeCmd(5);
				break;
			case 'EXECUTE_MACRO_6':
				executeCmd(6);
				break;
			case 'EXECUTE_MACRO_7':
				executeCmd(7);
				break;
			case 'EXECUTE_MACRO_8':
				executeCmd(8);
				break;
			case 'EXECUTE_MACRO_9':
				executeCmd(9);
				break;
			case 'EXECUTE_MACRO_0':
				executeCmd(0);
				break;

			// Flags
			case 'EXECUTE_FLAG_1':
				executeFlag(1);
				break;
			case 'EXECUTE_FLAG_2':
				executeFlag(2);
				break;
			case 'EXECUTE_FLAG_3':
				executeFlag(3);
				break;
			case 'EXECUTE_FLAG_4':
				executeFlag(4);
				break;
			case 'EXECUTE_FLAG_5':
				executeFlag(5);
				break;
			case 'EXECUTE_FLAG_6':
				executeFlag(6);
				break;
			case 'EXECUTE_FLAG_7':
				executeFlag(7);
				break;
			case 'EXECUTE_FLAG_8':
				executeFlag(8);
				break;
			case 'EXECUTE_FLAG_9':
				executeFlag(9);
				break;
		}
	};

	/**
	 * Extend ShortCuts window size
	 *
	 * @param {number} width
	 * @param {number} height
	 */
	ShortCuts.resize = function Resize(width, height) {
		width = Math.min(Math.max(width, 6), 9);
		height = Math.min(Math.max(height, 2), 6);

		this.ui.find('.container .content').css({
			width: width * 32 + 13, // 13 = scrollbar
			height: height * 32
		});

		this.ui.css({
			width: 23 + 16 + 16 + width * 32,
			height: 31 + 19 + height * 32
		});
	};

	/**
	 * Exit window
	 */
	function onClose() {
		ShortCuts.ui.hide();
	}

	/**
	 * Extend ShortCuts window size
	 */
	function onResize() {
		var ui = ShortCuts.ui;
		var content = ui.find('.container .content');
		var hide = ui.find('.hide');
		var top = ui.position().top;
		var left = ui.position().left;
		var lastWidth = 0;
		var lastHeight = 0;
		var _Interval;

		function resizing() {
			var extraX = 23 + 16 + 16 - 30;
			var extraY = 31 + 19 - 30;

			var w = Math.floor((Mouse.screen.x - left - extraX) / 32);
			var h = Math.floor((Mouse.screen.y - top - extraY) / 32);

			// Maximum and minimum window size
			w = Math.min(Math.max(w, 6), 9);
			h = Math.min(Math.max(h, 2), 6);

			if (w === lastWidth && h === lastHeight) {
				return;
			}

			ShortCuts.resize(w, h);
			lastWidth = w;
			lastHeight = h;

			//Show or hide scrollbar
			if (content.height() === content[0].scrollHeight) {
				hide.show();
			} else {
				hide.hide();
			}
		}

		// Start resizing
		_Interval = setInterval(resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function (event) {
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}

	function executeCmd(value) {
		var command = _MACRO_INIT[`Num_${value}`];

		// Nothing to submit
		if (command.length < 1 || command == '/hide') {
			return;
		}

		// Process commands
		if (command[0] == '/') {
			getModule('Controls/ProcessCommand').processCommand.call(ChatBox, command.substr(1));
			return;
		}

		ChatBox.onRequestTalk('', command, ChatBox.sendTo);
	}

	function executeFlag(value) {
		var command = _FLAG_INIT[`Num_${value}`];

		// Nothing to submit
		if (command.length < 1) {
			return;
		}

		var pkt = (pkt = new PACKET.CZ.REQ_EMOTION());
		pkt.type = command;
		Network.sendPacket(pkt);
		return;
	}

	function loadValuesAlt() {
		var length = Object.keys(_MACRO_INIT).length - 3;
		for (let index = 0; index < length; index++) {
			var element = _MACRO_INIT[`Num_${index}`];
			jQuery(`#macro_${index}`).val(element);
		}
	}

	function addValuesAlt(element) {
		element.ui.find('.macro input').blur(function () {
			var index = jQuery(this).attr('id').split('macro_')[1];
			_MACRO_INIT[`Num_${index}`] = this.value;
			_MACRO_INIT.save();
		});
	}

	/**
	 * Validate the type of information being dropped into the text field
	 */
	function onDropText(event) {
		event.stopImmediatePropagation();
		var data;
		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		} catch (e) {
			return false;
		}

		// Valid if the message type
		if (data.type == 'item') {
			return false;
		}

		jQuery(event.currentTarget).val(data);
		return false;
	}

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ShortCuts);
});
