/**
 * UI/Components/BasicInfoV3/BasicInfoV3.js
 *
 * Chararacter Basic information windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Configs from 'Core/Configs.js';
import PACKETVER from 'Network/PacketVerManager.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import PartyFriends from 'UI/Components/PartyFriends/PartyFriends.js';
import Guild from 'UI/Components/Guild/Guild.js';
import Bank from 'UI/Components/Bank/Bank.js';
import Escape from 'UI/Components/Escape/Escape.js';
import WorldMap from 'UI/Components/WorldMap/WorldMap.js';
import Rodex from 'UI/Components/Rodex/Rodex.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import SkillList from 'UI/Components/SkillList/SkillList.js';
import Quest from 'UI/Components/Quest/Quest.js';
import Achievement from 'UI/Components/Achievement/Achievement.js';
import htmlText from './BasicInfoV3.html?raw';
import cssText from './BasicInfoV3.css?raw';

// Version Dependent UIs
/**
 * Create Basic Info component
 */
const BasicInfoV3 = new GUIComponent('BasicInfoV3', cssText);

/**
 * Stored data
 */
BasicInfoV3.base_exp = 0;
BasicInfoV3.base_exp_next = 1;
BasicInfoV3.job_exp = 0;
BasicInfoV3.job_exp_next = -1;
BasicInfoV3.weight = 0;
BasicInfoV3.weight_max = 1;

BasicInfoV3.render = () => htmlText;

/**
 * @let {Preferences} structure
 */
const _preferences = Preferences.get(
	'BasicInfoV3',
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

function _getRoot() {
	return BasicInfoV3._shadow || BasicInfoV3._host;
}

/**
 * Initialize UI
 */
BasicInfoV3.init = function init() {
	const root = _getRoot();

	root.querySelectorAll('.topbar div').forEach(el => {
		el.addEventListener('mousedown', e => e.stopImmediatePropagation());
	});

	const rightBtn = root.querySelector('.topbar .right');
	if (rightBtn) {
		rightBtn.addEventListener('click', () => BasicInfoV3.toggleMode());
	}

	root.querySelectorAll('.toggle_btns').forEach(btn => {
		btn.addEventListener('mousedown', e => BasicInfoV3.toggleButtons(e));
	});

	root.querySelectorAll('.buttons div').forEach(el => {
		el.addEventListener('mousedown', () => {
			switch (el.id) {
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
					PartyFriends.toggle();
					break;
				case 'guild':
					Guild.toggle();
					break;
				case 'map':
					WorldMap.toggle();
					break;
				case 'bank':
					Bank.toggle();
					break;
				case 'quest':
					Quest.getUI().toggle();
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
	});

	this.draggable();
};

/**
 * When append the element to html
 * Execute elements in memory
 */
BasicInfoV3.onAppend = function onAppend() {
	const root = _getRoot();
	const hostRect = this._host.getBoundingClientRect();

	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width)}px`;

	this.magnet.TOP = _preferences.magnet_top;
	this.magnet.BOTTOM = _preferences.magnet_bottom;
	this.magnet.LEFT = _preferences.magnet_left;
	this.magnet.RIGHT = _preferences.magnet_right;

	const inner = root.querySelector('#BasicInfoV3');
	if (inner) {
		inner.classList.remove('small', 'large');
		if (_preferences.reduce) {
			inner.classList.add('small');
		} else {
			inner.classList.add('large');
		}
	}

	const buttons = root.querySelector('.buttons');
	const btnOpen = root.querySelector('.btn_open');
	const btnClose = root.querySelector('.btn_close');

	if (_preferences.buttons) {
		if (buttons) buttons.style.display = '';
		if (btnOpen) btnOpen.style.display = 'none';
		if (btnClose) btnClose.style.display = '';
	} else {
		if (buttons) buttons.style.display = 'none';
		if (btnOpen) btnOpen.style.display = '';
		if (btnClose) btnClose.style.display = 'none';
	}

	const battle = root.querySelector('#battle');
	const replay = root.querySelector('#replay');
	if (battle) battle.style.display = 'none';
	if (replay) replay.style.display = 'none';
};

/**
 * Once remove, save preferences
 */
BasicInfoV3.onRemove = function onRemove() {
	const root = _getRoot();
	const inner = root.querySelector('#BasicInfoV3');
	const buttons = root.querySelector('.buttons');

	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.reduce = inner ? inner.classList.contains('small') : _preferences.reduce;
	_preferences.buttons = buttons ? buttons.style.display !== 'none' : _preferences.buttons;
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
BasicInfoV3.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'EXTEND':
			this.toggleMode();
			break;
	}
};

/**
 * Switch window size
 */
BasicInfoV3.toggleMode = function toggleMode() {
	const root = _getRoot();
	const inner = root.querySelector('#BasicInfoV3');
	if (!inner) return;

	inner.classList.toggle('small');
	inner.classList.toggle('large');

	const buttons = root.querySelector('.buttons');
	const btnOpen = root.querySelector('.btn_open');
	const btnClose = root.querySelector('.btn_close');

	if (_preferences.buttons) {
		if (buttons) buttons.style.display = '';
		if (btnOpen) btnOpen.style.display = 'none';
		if (btnClose) btnClose.style.display = '';
	} else {
		if (buttons) buttons.style.display = 'none';
		if (btnOpen) btnOpen.style.display = '';
		if (btnClose) btnClose.style.display = 'none';
	}
};

/**
 * Toggle the list of buttons
 */
BasicInfoV3.toggleButtons = function toggleButtons(event) {
	const root = _getRoot();
	const buttons = root.querySelector('.buttons');
	if (!buttons) return;

	_preferences.buttons = buttons.style.display === 'none';

	const btnOpen = root.querySelector('.btn_open');
	const btnClose = root.querySelector('.btn_close');

	if (_preferences.buttons) {
		buttons.style.display = '';
		if (btnOpen) btnOpen.style.display = 'none';
		if (btnClose) btnClose.style.display = '';
	} else {
		buttons.style.display = 'none';
		if (btnOpen) btnOpen.style.display = '';
		if (btnClose) btnClose.style.display = 'none';
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
BasicInfoV3.update = function update(type, val1, val2) {
	const root = _getRoot();
	if (!root) return;

	let perc = 100;
	let color = 'blue';

	switch (type) {
		case 'name':
		case 'blvl':
		case 'jlvl':
			root.querySelectorAll(`.${type}_value`).forEach(el => {
				el.textContent = val1;
			});
			break;

		case 'zeny': {
			Session.zeny = val1;
			const list = val1.toString().split('');
			const count = list.length;
			let str = '';
			for (let i = 0; i < count; i++) {
				str = list[count - i - 1] + (i && i % 3 === 0 ? ',' : '') + str;
			}
			root.querySelectorAll(`.${type}_value`).forEach(el => {
				el.textContent = str;
			});
			break;
		}
		case 'job':
			Session.Character.job = val1;
			root.querySelectorAll('.job_value').forEach(el => {
				el.textContent = MonsterTable[val1];
			});
			break;

		case 'bexp':
		case 'jexp': {
			const expEl = root.querySelector(`.${type}`);
			if (!val2) {
				if (expEl) expEl.style.display = 'none';
				break;
			}
			if (expEl) {
				expEl.style.display = '';
				const bar = expEl.querySelector('div');
				if (bar) {
					bar.style.width = `${Math.min(100, Math.floor((val1 * 100) / val2))}%`;
				}
				expEl.title = `${((val1 / val2) * 100).toFixed(1)}%`;
			}
			root.querySelectorAll(`.${type}_value`).forEach(el => {
				el.textContent = `${Math.min(100, (Math.floor((val1 * 1000) / val2) * 0.1).toFixed(1))}%`;
			});
			break;
		}

		case 'weight':
			root.querySelectorAll('.weight_value').forEach(el => {
				el.textContent = (val1 / 10) | 0;
			});
			root.querySelectorAll('.weight_total').forEach(el => {
				el.textContent = (val2 / 10) | 0;
			});
			root.querySelectorAll('.weight').forEach(el => {
				el.style.color = val1 < val2 / 2 ? '' : 'red';
				el.title = `${((val1 / val2) * 100).toFixed(1)}%`;
			});
			break;

		case 'hp':
		case 'sp': {
			perc = Math.floor((val1 * 100) / val2);
			color = perc < 25 ? 'red' : 'blue';
			root.querySelectorAll(`.${type}_value`).forEach(el => {
				el.textContent = val1;
			});
			root.querySelectorAll(`.${type}_max_value`).forEach(el => {
				el.textContent = val2;
			});
			root.querySelectorAll(`.${type}_perc`).forEach(el => {
				el.textContent = `${perc}%`;
			});

			if (perc <= 0) {
				root.querySelectorAll(`.${type}_bar div`).forEach(el => {
					el.style.backgroundImage = 'none';
				});
				break;
			}

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${color}_left.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_left`);
				if (el) el.style.backgroundImage = `url(${url})`;
			});

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${color}_mid.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_middle`);
				if (el) {
					el.style.backgroundImage = `url(${url})`;
					el.style.width = `${Math.floor(Math.min(perc, 100) * 1.27)}px`;
				}
			});

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${color}_right.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_right`);
				if (el) {
					el.style.backgroundImage = `url(${url})`;
					el.style.left = `${Math.floor(Math.min(perc, 100) * 1.27)}px`;
				}
			});
			break;
		}
	}
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(BasicInfoV3);
