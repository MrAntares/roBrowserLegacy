/**
 * UI/Components/BasicInfoV4/BasicInfoV4.js
 *
 * Chararacter Basic information windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Configs from 'Core/Configs.js';
import PACKETVER from 'Network/PacketVerManager.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import PartyFriends from 'UI/Components/PartyFriends/PartyFriends.js';
import Guild from 'UI/Components/Guild/Guild.js';
import Bank from 'UI/Components/Bank/Bank.js';
import Escape from 'UI/Components/Escape/Escape.js';
import WorldMap from 'UI/Components/WorldMap/WorldMap.js';
import CheckAttendance from 'UI/Components/CheckAttendance/CheckAttendance.js';
import Rodex from 'UI/Components/Rodex/Rodex.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import SkillList from 'UI/Components/SkillList/SkillList.js';
import Quest from 'UI/Components/Quest/Quest.js';
import Achievement from 'UI/Components/Achievement/Achievement.js';
import htmlText from './BasicInfoV4.html?raw';
import cssText from './BasicInfoV4.css?raw';

// Version Dependent UIs
/**
 * Create Basic Info component
 */
const BasicInfoV4 = new UIComponent('BasicInfoV4', htmlText, cssText);

/**
 * Stored data
 */
BasicInfoV4.base_exp = 0;
BasicInfoV4.base_exp_next = 1;
BasicInfoV4.job_exp = 0;
BasicInfoV4.job_exp_next = -1;
BasicInfoV4.weight = 0;
BasicInfoV4.weight_max = 1;

/**
 * @let {Preferences} structure
 */
const _preferences = Preferences.get(
	'BasicInfoV4',
	{
		x: 0,
		y: 0,
		reduce: true,
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
BasicInfoV4.init = function init() {
	// Don't activate drag drop when clicking on buttons
	this.ui.find('.topbar div').mousedown(function (event) {
		event.stopImmediatePropagation();
	});

	this.ui.find('.topbar').dblclick(BasicInfoV4.toggleMode.bind(this));
	this.ui.find('.topbar .right').click(BasicInfoV4.toggleMode.bind(this));
	this.ui.find('.toggle_btns').click(BasicInfoV4.toggleButtons.bind(this));

	this.ui.find('.buttons button').click(function () {
		switch (this.id) {
			case 'item':
				Inventory.getUI().toggle();
				break;

			case 'info':
				WinStats.getUI().toggle();
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
				PartyFriends.getUI().toggle();
				break;

			case 'guild':
				Guild.toggle();
				break;

			case 'quest':
				Quest.getUI().toggle();
				break;

			case 'map':
				WorldMap.toggle();
				break;

			case 'bank':
				Bank.toggle();
				break;

			case 'attendance':
				if (Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
					CheckAttendance.toggle();
				}
				break;
			case 'mail':
				Rodex.toggle();
				break;
			case 'navigation':
				Navigation.toggle();
				break;
			case 'achievment':
				if (Configs.get('enableAchievements') && PACKETVER.value >= 20150513) {
					Achievement.toggle();
				}
				break;
		}
	});

	this.draggable();
};

/**
 * When append the element to html
 * Execute elements in memory
 */
BasicInfoV4.onAppend = function onAppend() {
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
	} else {
		this.ui.addClass('large');
	}

	if (_preferences.buttons) {
		this.ui.find('.buttons').show();
		this.ui.find('.btn_open').hide();
		this.ui.find('.btn_close').show();
	} else {
		this.ui.find('.buttons').hide();
		this.ui.find('.btn_open').show();
		this.ui.find('.btn_close').hide();
	}

	this.ui.find('#battle').hide();
	this.ui.find('#replay').hide();
	this.ui.find('#tipbox').hide();
	this.ui.find('#shortcut').hide();
	this.ui.find('#agency').hide();
};

/**
 * Once remove, save preferences
 */
BasicInfoV4.onRemove = function onRemove() {
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
BasicInfoV4.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'EXTEND':
			this.toggleMode();
			break;
	}
};

/**
 * Switch window size
 */
BasicInfoV4.toggleMode = function toggleMode() {
	this.ui.toggleClass('small large');

	if (_preferences.buttons) {
		this.ui.find('.buttons').show();
		this.ui.find('#btn_open').hide();
		this.ui.find('.btn_close').show();
	} else {
		this.ui.find('.buttons').hide();
		this.ui.find('.btn_open').show();
		this.ui.find('.btn_close').hide();
	}
};

/**
 * Toggle the list of buttons
 */
BasicInfoV4.toggleButtons = function toggleButtons(event) {
	const $buttons = this.ui.find('.buttons');

	_preferences.buttons = !$buttons.is(':visible');

	if (_preferences.buttons) {
		this.ui.find('.buttons').show();
		this.ui.find('#btn_open').hide();
		this.ui.find('.btn_close').show();
	} else {
		this.ui.find('.buttons').hide();
		this.ui.find('.btn_open').show();
		this.ui.find('.btn_close').hide();
	}

	event.stopImmediatePropagation();
};

/**
 * Update UI elements
 *
 * @param {string} type identifier
 * @param {number} val1
 * @param {number} val2 (optional)
 */
BasicInfoV4.update = function update(type, val1, val2) {
	let perc = 100,
		color = 'blue',
		list,
		i,
		count,
		str;
	switch (type) {
		case 'name':
		case 'blvl':
		case 'jlvl':
			this.ui.find('.' + type + '_value').text(val1);
			break;

		case 'zeny': {
			Session.zeny = val1;

			list = val1.toString().split('');
			count = list.length;
			str = '';

			for (i = 0; i < count; i++) {
				str = list[count - i - 1] + (i && i % 3 === 0 ? ',' : '') + str;
			}

			this.ui.find('.' + type + '_value').text(str);
			break;
		}
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
		case 'sp': {
			perc = Math.floor((val1 * 100) / val2);
			color = perc < 25 ? 'red' : 'blue';
			this.ui.find('.' + type + '_value').text(val1);
			this.ui.find('.' + type + '_max_value').text(val2);
			this.ui.find('.' + type + '_perc').text(perc + '%');

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
						width: Math.floor(Math.min(perc, 100) * 1.27) + 'px'
					});
				}.bind(this)
			);

			Client.loadFile(
				DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_right.bmp',
				function (url) {
					this.ui.find('.' + type + '_bar_right').css({
						backgroundImage: 'url(' + url + ')',
						left: Math.floor(Math.min(perc, 100) * 1.27) + 'px'
					});
				}.bind(this)
			);
			break;
		}
	}
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(BasicInfoV4);
