/**
 * UI/Components/WinStats/WinStatsV2.js
 *
 * Chararacter Statistiques Informations
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
	var UIComponent        = require('UI/UIComponent');
	var UIManager          = require('UI/UIManager');
	var Session            = require('Engine/SessionStorage');
	var Preferences        = require('Core/Preferences');
	var Renderer           = require('Renderer/Renderer');

	var htmlText           = require('text!./WinStatsV2.html');
	var cssText            = require('text!./WinStatsV2.css');

	/**
	 * Create component
	 */
	var WinStatsV2 = new UIComponent( 'WinStatsV2', htmlText, cssText );


	/**
	 * @var {Preferences} structure
	 */
		var _preferences = Preferences.get('WinStatsV2', {
			x:        0,
			y:        233,
			show:     false,
			reduce:   false,
	}, 1.0);

	/**
	 * Initialize UI
	 */
	WinStatsV2.init = function init()
	{
		this.statuspoint = 0;

		this.ui.find('.up button').mousedown(function(){
			switch (this.className) {
				case 'str': WinStatsV2.onRequestUpdate( 13, 1 ); break;
				case 'agi': WinStatsV2.onRequestUpdate( 14, 1 ); break;
				case 'vit': WinStatsV2.onRequestUpdate( 15, 1 ); break;
				case 'int': WinStatsV2.onRequestUpdate( 16, 1 ); break;
				case 'dex': WinStatsV2.onRequestUpdate( 17, 1 ); break;
				case 'luk': WinStatsV2.onRequestUpdate( 18, 1 ); break;
			}
		});

		this.ui.find('.titlebar .mini').click(function(){ WinStatsV2.ui.find('.panel').toggle(); });
		this.ui.find('.titlebar .close').click(function(){ WinStatsV2.ui.hide(); });
		this.draggable(this.ui.find('.titlebar'));

	};

	/**
	 * Stack to store things if the UI is not in html
	 */
	WinStatsV2.stack = [];


	/**
	 * Execute elements in memory
	 */
	WinStatsV2.onAppend = function onAppend()
	{
		var i, count;

		for (i = 0, count = this.stack.length; i < count; ++i) {
			this.update.apply( this, this.stack[i]);
		}

		this.stack.length = 0;

		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		if (!_preferences.show) {
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
	WinStatsV2.update = function update( type, val )
	{
		var str;

		if (!this.__loaded) {
			this.stack.push(arguments);
			return;
		}

		switch (type) {
			case 'statuspoint':
				this.statuspoint = val;
				this.ui.find('.requirements div').each(function(){
					WinStatsV2.ui.find('.up .'+ this.className)
					.css({
						'opacity': parseInt(this.textContent, 10) <= val ? 1 : 0,
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
				this.ui.find('.' + type).text(val);
				break;

			case 'aspd':
				this.ui.find('.' + type).text( Math.floor(200-val/10) );
				break;

			case 'matak2':
				if(!Session.isRenewal){
					this.ui.find('.' + type).text('~ '+val);
					break;
				}
			case 'atak2':
			case 'def2':
			case 'mdef2':
			case 'flee2':
				str = val < 0 ? '- ' + (-val) : '+ ' + val;
				this.ui.find('.' + type).text(str);
				break;

			case 'str':
			case 'agi':
			case 'vit':
			case 'int':
			case 'dex':
			case 'luk':
				this.ui.find('.stats .'+ type).text(val);
				break;

			case 'str2':
			case 'agi2':
			case 'vit2':
			case 'int2':
			case 'dex2':
			case 'luk2':
				str = val < 0 ? '- ' + (-val) : val > 0 ? '+' + val : '';
				this.ui.find('.bonus .'+ type.replace('2','')).text( str );
				break;

			case 'str3':
			case 'agi3':
			case 'vit3':
			case 'int3':
			case 'dex3':
			case 'luk3':
				this.ui.find('.requirements .'+ type.replace('3','')).text(val);
				this.ui.find('.up .'+ type.replace('3','')).css({
					'opacity': val <= this.statuspoint ? 1 : 0,
					'pointer-events': val <= this.statuspoint ? 'initial' : 'none'
				});
				break;
		}
	};

	/**
	 * Start/stop rendering character in UI
	 */
	WinStatsV2.toggle = function toggle()
	{
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
		}
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	WinStatsV2.onShortCut = function onShurtCut( key )
	{
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				break;
		}
	};

	/**
	 * Remove WinStats window
	 */
	WinStatsV2.onRemove = function onRemove()
	{
		// Save preferences
		if (_preferences) {
			_preferences.show   =  this.ui.is(':visible');
			_preferences.reduce =  this.ui.find('.panel').css('display') === 'none';
			_preferences.y      =  parseInt(this.ui.css('top'), 10);
			_preferences.x      =  parseInt(this.ui.css('left'), 10);
			_preferences.save();
		}
	}

	/**
	 * Abstract method to define
	 */
	WinStatsV2.onRequestUpdate = function onRequestUpdate(/*id, amount*/){};


	return UIManager.addComponent(WinStatsV2);
});
