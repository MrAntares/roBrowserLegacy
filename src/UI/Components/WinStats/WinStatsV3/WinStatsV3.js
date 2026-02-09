/**
 * UI/Components/WinStats/WinStatsV3.js
 *
 * Chararacter Statistiques Informations
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var UIComponent = require('UI/UIComponent');
	var UIManager = require('UI/UIManager');
	var Session = require('Engine/SessionStorage');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');

	var htmlText = require('text!./WinStatsV3.html');
	var cssText = require('text!./WinStatsV3.css');

	/**
	 * Create component
	 */
	var WinStatsV3 = new UIComponent('WinStatsV3', htmlText, cssText);

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'WinStatsV3',
		{
			x: 0,
			y: 233,
			show: false,
			reduce: false
		},
		2.0
	);

	/**
	 * Initialize UI
	 */
	WinStatsV3.init = function init()
	{
		this.statuspoint = 0;
		this.t_statuspoint = 0;

		this.ui.find('.up button').mousedown(function ()
		{
			switch (this.className)
			{
				case 'str':
					WinStatsV3.onRequestUpdate(13, 1);
					break;
				case 'agi':
					WinStatsV3.onRequestUpdate(14, 1);
					break;
				case 'vit':
					WinStatsV3.onRequestUpdate(15, 1);
					break;
				case 'int':
					WinStatsV3.onRequestUpdate(16, 1);
					break;
				case 'dex':
					WinStatsV3.onRequestUpdate(17, 1);
					break;
				case 'luk':
					WinStatsV3.onRequestUpdate(18, 1);
					break;
			}
		});

		this.ui.find('.t_up button').mousedown(function ()
		{
			switch (this.className)
			{
				case 'pow':
					WinStatsV3.onRequestUpdate(219, 1);
					break;
				case 'sta':
					WinStatsV3.onRequestUpdate(220, 1);
					break;
				case 'wis':
					WinStatsV3.onRequestUpdate(221, 1);
					break;
				case 'spl':
					WinStatsV3.onRequestUpdate(222, 1);
					break;
				case 'con':
					WinStatsV3.onRequestUpdate(223, 1);
					break;
				case 'crt':
					WinStatsV3.onRequestUpdate(224, 1);
					break;
			}
		});

		this.ui.find('.titlebar .mini').click(function ()
		{
			WinStatsV3.ui.find('.panel').toggle();
		});
		this.ui.find('.titlebar .close').click(function ()
		{
			WinStatsV3.ui.hide();
		});
		this.draggable(this.ui.find('.titlebar'));

		this.ui.find('.view_traits').mousedown(toggleTraits);
	};

	/**
	 * Stack to store things if the UI is not in html
	 */
	WinStatsV3.stack = [];

	/**
	 * Execute elements in memory
	 */
	WinStatsV3.onAppend = function onAppend()
	{
		var i, count;

		for (i = 0, count = this.stack.length; i < count; ++i)
		{
			this.update.apply(this, this.stack[i]);
		}

		this.stack.length = 0;

		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		if (!_preferences.show)
		{
			this.ui.hide();
		}
	};

	/**
	 * Update UI elements
	 *
	 * @param {string} type identifier
	 * @param {number} val1
	 * @param {number} val2 (optional)
	 */
	WinStatsV3.update = function update(type, val)
	{
		var str;

		if (!this.__loaded)
		{
			this.stack.push(arguments);
			return;
		}

		switch (type)
		{
			case 'statuspoint':
				this.statuspoint = val;
				this.ui.find('.requirements div').each(function ()
				{
					WinStatsV3.ui.find('.up .' + this.className).css({
						opacity: parseInt(this.textContent, 10) <= val ? 1 : 0,
						'pointer-events': parseInt(this.textContent, 10) <= val ? 'initial' : 'none'
					});
				});
				this.ui.find('.' + type).text(val);
				break;

			case 'trait_point':
				this.t_statuspoint = val;
				this.ui.find('.t_requirements div').each(function ()
				{
					WinStatsV3.ui.find('.t_up .' + this.className).css({
						opacity: parseInt(this.textContent, 10) <= val ? 1 : 0,
						'pointer-events': parseInt(this.textContent, 10) <= val ? 'initial' : 'none'
					});
				});
				this.ui.find('.' + type).text(val);
				break;

			case 'guildname':
			case 'atak':
			case 'matak':
			case 'def':
			case 'mdef':
			case 'hit':
			case 'flee':
			case 'critical':
			case 'patk':
			case 'smatk':
			case 'hplus':
			case 'crate':
			case 'res':
			case 'mres':
				this.ui.find('.' + type).text(val);
				break;

			case 'aspd':
				this.ui.find('.' + type).text(Math.floor(200 - val / 10));
				break;

			case 'matak2':
				if (!Session.isRenewal)
				{
					this.ui.find('.' + type).text('~ ' + val);
					break;
				}
			case 'atak2':
			case 'def2':
			case 'mdef2':
			case 'flee2':
				str = val < 0 ? '- ' + -val : '+ ' + val;
				this.ui.find('.' + type).text(str);
				break;

			case 'str':
			case 'agi':
			case 'vit':
			case 'int':
			case 'dex':
			case 'luk':
			case 'pow':
			case 'sta':
			case 'wis':
			case 'spl':
			case 'con':
			case 'crt':
				this.ui.find('.stats .' + type).text(val);
				break;

			case 'str2':
			case 'agi2':
			case 'vit2':
			case 'int2':
			case 'dex2':
			case 'luk2':
			case 'pow2':
			case 'sta2':
			case 'wis2':
			case 'spl2':
			case 'con2':
			case 'crt2':
				str = val < 0 ? '- ' + -val : val > 0 ? '+' + val : '';
				this.ui.find('.bonus .' + type.replace('2', '')).text(str);
				break;

			case 'str3':
			case 'agi3':
			case 'vit3':
			case 'int3':
			case 'dex3':
			case 'luk3':
				this.ui.find('.requirements .' + type.replace('3', '')).text(val);
				this.ui.find('.up .' + type.replace('3', '')).css({
					opacity: val <= this.statuspoint ? 1 : 0,
					'pointer-events': val <= this.statuspoint ? 'initial' : 'none'
				});
				break;

			case 'pow3':
			case 'sta3':
			case 'wis3':
			case 'spl3':
			case 'con3':
			case 'crt3':
				this.ui.find('.t_requirements .' + type.replace('3', '')).text(val);
				this.ui.find('.t_up .' + type.replace('3', '')).css({
					opacity: val && this.t_statuspoint > 1 ? 1 : 0,
					'pointer-events': val && this.t_statuspoint > 1 ? 'initial' : 'none'
				});
				break;
		}
	};

	/**
	 * Display or not status window
	 */
	function toggleTraits()
	{
		var status = WinStatsV3.ui.find('.traits_component');
		var self = WinStatsV3.ui.find('.view_traits');
		var state = status.is(':visible') ? 'on' : 'off';

		status.toggle();

		Client.loadFile(DB.INTERFACE_PATH + 'statuswnd/expand_' + state + '_normal.bmp', function (data)
		{
			self.css('backgroundImage', 'url(' + data + ')');
		});
	}

	/**
	 * Start/stop rendering character in UI
	 */
	WinStatsV3.toggle = function toggle()
	{
		this.ui.toggle();

		if (this.ui.is(':visible'))
		{
			this.focus();
		}
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	WinStatsV3.onShortCut = function onShurtCut(key)
	{
		switch (key.cmd)
		{
			case 'TOGGLE':
				this.ui.toggle();
				break;
		}
	};

	/**
	 * Remove WinStats window
	 */
	WinStatsV3.onRemove = function onRemove()
	{
		// Save preferences
		if (_preferences)
		{
			_preferences.show = this.ui.is(':visible');
			_preferences.reduce = this.ui.find('.panel').css('display') === 'none';
			_preferences.y = parseInt(this.ui.css('top'), 10);
			_preferences.x = parseInt(this.ui.css('left'), 10);
			_preferences.save();
		}
	};

	/**
	 * Abstract method to define
	 */
	WinStatsV3.onRequestUpdate = function onRequestUpdate(/*id, amount*/) {};

	return UIManager.addComponent(WinStatsV3);
});
