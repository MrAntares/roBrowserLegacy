/**
 * UI/Components/BasicInfoV0/BasicInfoV0.js
 *
 * Chararacter Basic information windows
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
	var MonsterTable = require('DB/Monsters/MonsterTable');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var Session = require('Engine/SessionStorage');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Inventory = require('UI/Components/Inventory/Inventory');
	var Equipment = require('UI/Components/Equipment/Equipment');
	var PartyFriends = require('UI/Components/PartyFriends/PartyFriends');
	var Guild = require('UI/Components/Guild/Guild');
	var ChatRoomCreate = require('UI/Components/ChatRoomCreate/ChatRoomCreate');
	var Escape = require('UI/Components/Escape/Escape');
	var WorldMap = require('UI/Components/WorldMap/WorldMap');
	var WinStats = require('UI/Components/WinStats/WinStats');

	// Version Dependent UIs
	var SkillList = require('UI/Components/SkillList/SkillList');
	var Quest = require('UI/Components/Quest/Quest');

	var htmlText = require('text!./BasicInfoV0.html');
	var cssText = require('text!./BasicInfoV0.css');
	/**
	 * Create Basic Info component
	 */
	var BasicInfoV0 = new UIComponent('BasicInfoV0', htmlText, cssText);

	/**
	 * Stored data
	 */
	BasicInfoV0.base_exp = 0;
	BasicInfoV0.base_exp_next = 1;
	BasicInfoV0.job_exp = 0;
	BasicInfoV0.job_exp_next = -1;
	BasicInfoV0.weight = 0;
	BasicInfoV0.weight_max = 1;

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'BasicInfoV0',
		{
			x: 0,
			y: 0,
			reduce: false,
			buttons: true,
			magnet_top: true,
			magnet_bottom: false,
			magnet_left: true,
			magnet_right: false
		},
		1.0
	);

	/**
	 * Initialize UI
	 */
	BasicInfoV0.init = function init() {
		// Don't activate drag drop when clicking on buttons
		this.ui.find('.topbar button').mousedown(function (event) {
			event.stopImmediatePropagation();
		});

		this.ui.find('.topbar .right').click(BasicInfoV0.toggleMode.bind(this));
		this.ui.find('.toggle_btns').mousedown(BasicInfoV0.toggleButtons.bind(this));

		this.ui.find('.buttons button').mousedown(function () {
			switch (this.className) {
				case 'item':
					Inventory.getUI().toggle();
					break;

				case 'info':
					WinStats.getUI().toggle(); // split stats
					break;

				case 'equip':
					Equipment.getUI().toggle();
					break;

				case 'skill':
					SkillList.getUI().toggle();
					break;

				case 'option':
					Escape.ui.toggle();
					break;

				case 'party':
					PartyFriends.toggle();
					break;

				case 'guild':
					Guild.toggle();
					break;

				case 'chat':
					ChatRoomCreate.toggle();
					break;

				case 'map':
					WorldMap.toggle();
					break;

				case 'quest':
					Quest.getUI().toggle();
					break;
			}
		});

		this.draggable();
	};

	/**
	 * When append the element to html
	 * Execute elements in memory
	 */
	BasicInfoV0.onAppend = function onAppend() {
		// Apply preferences
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		this.magnet.TOP = _preferences.magnet_top;
		this.magnet.BOTTOM = _preferences.magnet_bottom;
		this.magnet.LEFT = _preferences.magnet_left;
		this.magnet.RIGHT = _preferences.magnet_right;

		// large/small window
		this.ui.removeClass('small large');
		if (_preferences.reduce) {
			this.ui.addClass('small');
			this.ui.find('.buttons').hide();
			Client.loadFile(
				DB.INTERFACE_PATH + this.ui.data('mini-background'),
				function (url) {
					this.ui.css('backgroundImage', 'url(' + url + ')');
				}.bind(this)
			);
		} else {
			this.ui.addClass('large');
			this.ui.find('.buttons').show();
		}
	};

	/**
	 * Once remove, save preferences
	 */
	BasicInfoV0.onRemove = function onRemove() {
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.reduce = this.ui.hasClass('small');
		_preferences.buttons = this.ui.find('.buttons').is(':visible');
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
	BasicInfoV0.onShortCut = function onShortCut(key) {
		switch (key.cmd) {
			case 'EXTEND':
				this.toggleMode();
				break;
		}
	};

	/**
	 * Switch window size
	 */
	BasicInfoV0.toggleMode = function toggleMode() {
		var type;

		this.ui.toggleClass('small large');

		if (this.ui.hasClass('large')) {
			this.ui.find('.buttons').show();
			Client.loadFile(
				DB.INTERFACE_PATH + this.ui.data('background'),
				function (url) {
					this.ui.css('backgroundImage', 'url(' + url + ')');
				}.bind(this)
			);
			return;
		}

		Client.loadFile(
			DB.INTERFACE_PATH + this.ui.data('mini-background'),
			function (url) {
				this.ui.css('backgroundImage', 'url(' + url + ')');
			}.bind(this)
		);
		this.ui.find('.buttons').hide();

		Client.loadFile(
			DB.INTERFACE_PATH + 'basic_interface/view' + type + '.bmp',
			function (url) {
				this.ui.find('.toggle_btns').css('backgroundImage', 'url(' + url + ')');
			}.bind(this)
		);
	};

	/**
	 * Toggle the list of buttons
	 */
	BasicInfoV0.toggleButtons = function toggleButtons(event) {
		var type;
		var $buttons = this.ui.find('.buttons');

		_preferences.buttons = !$buttons.is(':visible');

		if (_preferences.buttons) {
			$buttons.show();
			type = 'off';
		} else {
			$buttons.hide();
			type = 'on';
		}

		Client.loadFile(
			DB.INTERFACE_PATH + 'basic_interface/view' + type + '.bmp',
			function (url) {
				this.ui.find('.toggle_btns').css('backgroundImage', 'url(' + url + ')');
			}.bind(this)
		);

		event.stopImmediatePropagation();
	};

	/**
	 * Update UI elements
	 *
	 * @param {string} type identifier
	 * @param {number} val1
	 * @param {number} val2 (optional)
	 */
	BasicInfoV0.update = function update(type, val1, val2) {
		switch (type) {
			case 'name':
			case 'blvl':
			case 'jlvl':
				this.ui.find('.' + type + '_value').text(val1);
				break;

			case 'zeny':
				Session.zeny = val1;

				var list = val1.toString().split('');
				var i,
					count = list.length;
				var str = '';

				for (i = 0; i < count; i++) {
					str = list[count - i - 1] + (i && i % 3 === 0 ? ',' : '') + str;
				}

				this.ui.find('.' + type + '_value').text(str);
				break;

			case 'job':
				Session.Character.job = val1;

				this.ui.find('.job_value').text(MonsterTable[val1]);
				break;

			case 'bexp':
			case 'jexp':
				if (!val2) {
					this.ui.find('.' + type).hide();
					break;
				}

				this.ui.find('.' + type).show();
				this.ui.find('.' + type + ' div').css('width', Math.min(100, Math.floor((val1 * 100) / val2)) + '%');
				this.ui.find('.' + type).attr('title', ((val1 / val2) * 100).toFixed(1) + '%');
				this.ui
					.find('.' + type + '_value')
					.text(Math.min(100, (Math.floor((val1 * 1000) / val2) * 0.1).toFixed(1)) + '%');
				break;

			case 'weight':
				this.ui.find('.weight_value').text((val1 / 10) | 0);
				this.ui.find('.weight_total').text((val2 / 10) | 0);
				this.ui.find('.weight').css('color', val1 < val2 / 2 ? '' : 'red');
				this.ui.find('.weight').attr('title', ((val1 / val2) * 100).toFixed(1) + '%');
				break;

			case 'hp':
			case 'sp':
				var perc = Math.floor((val1 * 100) / val2);
				var color = perc < 25 ? 'red' : 'blue';
				this.ui.find('.' + type + '_value').text(val1);
				this.ui.find('.' + type + '_max_value').text(val2);

				if (perc <= 0) {
					this.ui.find('.' + type + '_bar div').css('backgroundImage', 'none');
					break;
				}

				Client.loadFile(
					DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_left.bmp',
					function (url) {
						this.ui.find('.' + type + '_bar_left').css('backgroundImage', 'url(' + url + ')');
					}.bind(this)
				);

				Client.loadFile(
					DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_mid.bmp',
					function (url) {
						this.ui.find('.' + type + '_bar_middle').css({
							backgroundImage: 'url(' + url + ')',
							width: Math.floor(Math.min(perc, 100) * 0.77) + 'px'
						});
					}.bind(this)
				);

				Client.loadFile(
					DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_right.bmp',
					function (url) {
						this.ui.find('.' + type + '_bar_right').css({
							backgroundImage: 'url(' + url + ')',
							left: Math.floor(Math.min(perc, 100) * 0.77) + 'px'
						});
					}.bind(this)
				);
				break;
		}
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(BasicInfoV0);
});
