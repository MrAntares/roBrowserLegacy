/**
 * UI/Components/BasicInfoV5/BasicInfoV5.js
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
import GUIComponent from 'UI/GUIComponent.js';
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
import Reputation from 'UI/Components/Reputation/Reputation.js';
import htmlText from './BasicInfoV5.html?raw';
import cssText from './BasicInfoV5.css?raw';

// Version Dependent UIs
/**
 * Create Basic Info component
 */
const BasicInfoV5 = new GUIComponent('BasicInfoV5', cssText);

/**
 * Stored data
 */
BasicInfoV5.base_exp = 0;
BasicInfoV5.base_exp_next = 1;
BasicInfoV5.job_exp = 0;
BasicInfoV5.job_exp_next = -1;
BasicInfoV5.weight = 0;
BasicInfoV5.weight_max = 1;

BasicInfoV5.render = () => htmlText;

/**
 * @let {Preferences} structure
 */
const _preferences = Preferences.get(
	'BasicInfoV5',
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
BasicInfoV5.init = function init() {
	const root = this.getRoot();

	root.querySelectorAll('.topbar div').forEach(el => {
		el.addEventListener('mousedown', e => e.stopImmediatePropagation());
	});

	const topbar = root.querySelector('.topbar');
	if (topbar) {
		topbar.addEventListener('dblclick', () => BasicInfoV5.toggleMode());
	}

	const rightBtn = root.querySelector('.topbar .right');
	if (rightBtn) {
		rightBtn.addEventListener('click', () => BasicInfoV5.toggleMode());
	}

	root.querySelectorAll('.toggle_btns').forEach(btn => {
		btn.addEventListener('click', e => BasicInfoV5.toggleButtons(e));
	});

	root.querySelectorAll('.buttons > div[id]').forEach(btn => {
		btn.addEventListener('click', () => {
			switch (btn.id) {
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
				case 'repute':
					Reputation.toggle();
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
BasicInfoV5.onAppend = function onAppend() {
	const root = this.getRoot();
	const hostRect = this._host.getBoundingClientRect();

	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width)}px`;

	this.magnet.TOP = _preferences.magnet_top;
	this.magnet.BOTTOM = _preferences.magnet_bottom;
	this.magnet.LEFT = _preferences.magnet_left;
	this.magnet.RIGHT = _preferences.magnet_right;

	const inner = root.querySelector('#BasicInfoV5');
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

	const hideIds = ['battle', 'replay', 'tipbox', 'shortcut', 'agency'];
	hideIds.forEach(id => {
		const el = root.querySelector(`#${id}`);
		if (el) el.style.display = 'none';
	});
};

/**
 * Once remove, save preferences
 */
BasicInfoV5.onRemove = function onRemove() {
	const root = this.getRoot();
	const inner = root.querySelector('#BasicInfoV5');
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
BasicInfoV5.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'EXTEND':
			this.toggleMode();
			break;
	}
};

/**
 * Switch window size
 */
BasicInfoV5.toggleMode = function toggleMode() {
	const root = this.getRoot();
	const inner = root.querySelector('#BasicInfoV5');
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
BasicInfoV5.toggleButtons = function toggleButtons(event) {
	const root = this.getRoot();
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
BasicInfoV5.update = function update(type, val1, val2) {
	const root = this.getRoot();
	if (!root) return;

	let perc = 100;
	let color = 'blue';
	let ap_perc = 100;
	let ap_color = 'blue';

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
		case 'ap': {
			ap_perc = Math.floor((val1 * 100) / val2);
			ap_color = ap_perc === 100 ? 'red' : 'blue';
			root.querySelectorAll(`.${type}_value`).forEach(el => {
				el.textContent = val1;
			});
			root.querySelectorAll(`.${type}_max_value`).forEach(el => {
				el.textContent = val2;
			});
			root.querySelectorAll(`.${type}_perc`).forEach(el => {
				el.textContent = `${ap_perc}%`;
			});
			if (ap_perc <= 0) {
				root.querySelectorAll(`.${type}_bar div`).forEach(el => {
					el.style.backgroundImage = 'none';
				});
				break;
			}

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${ap_color}_left.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_left`);
				if (el) el.style.backgroundImage = `url(${url})`;
			});

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${ap_color}_mid.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_middle`);
				if (el) {
					el.style.backgroundImage = `url(${url})`;
					el.style.width = `${Math.floor(Math.min(ap_perc, 100) * 1.27)}px`;
				}
			});

			Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/gze${ap_color}_right.bmp`, url => {
				const el = root.querySelector(`.${type}_bar_right`);
				if (el) {
					el.style.backgroundImage = `url(${url})`;
					el.style.left = `${Math.floor(Math.min(ap_perc, 100) * 1.27)}px`;
				}
			});
			break;
		}
	}
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(BasicInfoV5);
