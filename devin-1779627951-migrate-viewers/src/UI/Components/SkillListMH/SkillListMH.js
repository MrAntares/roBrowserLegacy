/**
 * UI/Components/SkillListMH/SkillListMH.js
 *
 * Character Skill Window for Mercenary and Homunculus
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import SkillDescription from 'UI/Components/SkillDescription/SkillDescription.js';
import htmlText from './SkillListMH.html?raw';
import cssText from './SkillListMH.css?raw';

/**
 * Helper: query inside shadow root
 */
function _root(comp) {
	return comp._shadow || comp._host;
}

/**
 * Helper: escape HTML
 */
function _escapeHTML(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Factory to create a SkillListMH GUIComponent instance
 */
function createSkillListMH(type) {
	const name = `SkillList${type === 'homunculus' ? 'HOM' : 'MER'}`;
	const comp = new GUIComponent(name, cssText);

	comp.render = () => htmlText;

	const _preferences = Preferences.get(
		name,
		{
			x: 100,
			y: 200,
			width: 8,
			height: 5,
			show: false
		},
		1.0
	);

	comp._skillType = type;
	comp.list = [];
	comp._rowCount = 0;
	comp.points = 0;
	comp._btnIncSkill = null;
	comp._btnLevelUp = null;
	comp._lArrow = null;
	comp._rArrow = null;

	comp.init = function init() {
		const root = _root(this);

		root.querySelector('.titlebar .text').textContent =
			this._skillType === 'homunculus' ? 'Homunculus Skills' : 'Mercenary Skills';

		const baseBtn = root.querySelector('.titlebar .base');
		if (baseBtn) {
			baseBtn.addEventListener('mousedown', e => {
				e.stopImmediatePropagation();
			});
		}

		// Resize
		const extendBtn = root.querySelector('.footer .extend');
		if (extendBtn) {
			extendBtn.addEventListener('mousedown', e => {
				e.stopImmediatePropagation();
				const hostStyle = this._host.style;
				const top = parseInt(hostStyle.top, 10) || 0;
				const left = parseInt(hostStyle.left, 10) || 0;
				let lastWidth = 0;
				let lastHeight = 0;

				const resizing = () => {
					const extraX = -6;
					const extraY = 32;

					let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
					let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

					w = Math.min(Math.max(w, 8), 8);
					h = Math.min(Math.max(h, 4), 10);

					if (w === lastWidth && h === lastHeight) {
						return;
					}

					const content = root.querySelector('.content');
					if (content) {
						content.style.width = `${w * 32}px`;
						content.style.height = `${h * 32}px`;
					}
					lastWidth = w;
					lastHeight = h;
				};

				const interval = setInterval(resizing, 30);

				const onMouseUp = _event => {
					if (_event.which === 1) {
						clearInterval(interval);
						window.removeEventListener('mouseup', onMouseUp);
					}
				};

				window.addEventListener('mouseup', onMouseUp);
			});
		}

		// Close
		const closeBtn = root.querySelector('.titlebar .close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				this.ui.hide();
			});
		}

		// Get level up button
		const levelupBtn = root.querySelector('.btn.levelup');
		if (levelupBtn) {
			this._btnIncSkill = levelupBtn.cloneNode(true);
			levelupBtn.remove();
			this._btnIncSkill.addEventListener('click', function () {
				const index = this.parentNode.parentNode.getAttribute('data-index');
				comp.onIncreaseSkill(parseInt(index, 10));
			});
		}

		// Get button to open skill when level up
		const lvlupBtn = root.querySelector('#lvlup_job');
		if (lvlupBtn) {
			this._btnLevelUp = lvlupBtn;
			this._btnLevelUp.remove();
			this._btnLevelUp.addEventListener('click', () => {
				if (this._btnLevelUp.parentNode) {
					this._btnLevelUp.remove();
				}
				this.ui.show();
			});
			this._btnLevelUp.addEventListener('mousedown', e => {
				e.stopImmediatePropagation();
			});
		}

		// Bind skill events (delegated)
		const container = root.querySelector('.SkillListMH') || root;
		container.addEventListener('dblclick', e => {
			const target = e.target.closest('.skill .icon, .skill .name');
			if (target) {
				let main = target.parentElement;
				if (!main.classList.contains('skill')) {
					main = main.parentElement;
				}
				this.useSkillID(parseInt(main.getAttribute('data-index'), 10));
			}
		});

		container.addEventListener('contextmenu', e => {
			const target = e.target.closest('.skill .icon, .skill .name');
			if (target) {
				let main = target.parentElement;
				if (!main.classList.contains('skill')) {
					main = main.parentElement;
				}

				const skill = this.getSkillById(parseInt(main.getAttribute('data-index'), 10));

				if (SkillDescription.uid === skill.SKID) {
					SkillDescription.remove();
					return;
				}

				SkillDescription.append();
				SkillDescription.setSkill(skill.SKID);
			}
		});

		container.addEventListener('mousedown', e => {
			const target = e.target.closest('.selectable');
			if (target) {
				let main = target.parentElement;
				if (!main.classList.contains('skill')) {
					main = main.parentElement;
				}
				for (const el of root.querySelectorAll('.skill')) {
					el.classList.remove('selected');
				}
				main.classList.add('selected');
			}
		});

		container.addEventListener('dragstart', e => {
			const skillEl = e.target.closest('.skill');
			if (!skillEl) {
				return;
			}
			const index = parseInt(skillEl.getAttribute('data-index'), 10);
			const skill = this.getSkillById(index);

			if (!skill || !skill.level || !skill.type) {
				e.stopImmediatePropagation();
				e.preventDefault();
				return;
			}

			const img = new Image();
			img.decoding = 'async';
			img.src = skillEl.querySelector('.icon img')?.src || '';

			e.dataTransfer.setDragImage(img, 12, 12);
			e.dataTransfer.setData(
				'Text',
				JSON.stringify(
					(window._OBJ_DRAG_ = {
						type: 'skill',
						from: 'SkillListMH',
						data: skill
					})
				)
			);
		});

		container.addEventListener('dragend', e => {
			const skillEl = e.target.closest('.skill');
			if (skillEl) {
				delete window._OBJ_DRAG_;
				skillEl.classList.remove('hide');
			}
		});

		this.draggable('.titlebar');

		Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_right.bmp`, data => {
			this._rArrow = `url(${data})`;
		});

		Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_left.bmp`, data => {
			this._lArrow = `url(${data})`;
		});
	};

	comp.onAppend = function onAppend() {
		if (!_preferences.show) {
			this.ui.hide();
		}

		this.setSize(_preferences.width, _preferences.height);
		this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 100)}px`;
		this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - 100)}px`;
	};

	comp.setSize = function setSize(width, height) {
		width = Math.min(Math.max(width, 8), 8);
		height = Math.min(Math.max(height, 4), 10);

		const root = _root(this);
		const content = root.querySelector('.content');
		if (content) {
			content.style.width = `${width * 32}px`;
			content.style.height = `${height * 32}px`;
		}
	};

	comp.onRemove = function onRemove() {
		if (this._btnLevelUp && this._btnLevelUp.parentNode) {
			this._btnLevelUp.remove();
		}

		_preferences.show = this.ui.is(':visible');
		_preferences.y = parseInt(this._host.style.top, 10) || 0;
		_preferences.x = parseInt(this._host.style.left, 10) || 0;

		const root = _root(this);
		const content = root.querySelector('.content');
		if (content) {
			_preferences.width = Math.floor(parseInt(content.style.width, 10) / 32) || 8;
			_preferences.height = Math.floor(parseInt(content.style.height, 10) / 32) || 5;
		}
		_preferences.save();
	};

	comp.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			this.ui.hide();
			if (this._btnLevelUp && this._btnLevelUp.parentNode) {
				this._btnLevelUp.remove();
			}
		} else {
			this.ui.show();
			this.focus();
		}
	};

	comp.onKeyDown = function onKeyDown(event) {
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
			this.toggle();
		}
	};

	comp.setSkills = function setSkills(skills) {
		for (let i = 0, count = this.list.length; i < count; ++i) {
			this.onUpdateSkill(this.list[i].SKID, 0);
		}

		this.list.length = 0;
		const root = _root(this);
		const table = root.querySelector('.content table');
		if (table) {
			table.innerHTML = '';
		}

		for (let i = 0, count = skills.length; i < count; ++i) {
			this.addSkill(skills[i]);
		}
	};

	comp.addSkill = function addSkill(skill) {
		if (!(skill.SKID in SkillInfo)) {
			return;
		}

		const root = _root(this);
		const existing = root.querySelector(`.skill.id${skill.SKID}`);
		if (existing) {
			this.updateSkill(skill);
			return;
		}

		const sk = SkillInfo[skill.SKID];
		const levelup = this._btnIncSkill.cloneNode(true);
		levelup.addEventListener('click', function () {
			const index = this.parentNode.parentNode.getAttribute('data-index');
			comp.onIncreaseSkill(parseInt(index, 10));
		});

		const className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';

		const tr = document.createElement('tr');
		tr.className = `skill id${skill.SKID} ${className}`;
		tr.setAttribute('data-index', skill.SKID);
		tr.setAttribute('draggable', 'true');
		tr.innerHTML =
			'<td class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></td>' +
			'<td class="levelupcontainer"></td>' +
			'<td class=selectable>' +
			`<div class="name">${_escapeHTML(sk.SkillName)}<br/>` +
			'<span class="level">' +
			(sk.bSeperateLv
				? `<button class="currentDown"></button>Lv : <span class="current">${skill.level}</span> / <span class="max">${skill.level}</span><button class="currentUp"></button>`
				: `Lv : <span class="current">${skill.level}</span>`) +
			'</span></div></td>' +
			'<td class="selectable type">' +
			`<div class="consume">${skill.type ? `Sp : <span class="spcost">${skill.spcost}</span>` : 'Passive'}</div>` +
			'</td>';

		if (!skill.upgradable || !this.points) {
			levelup.style.display = 'none';
		}

		tr.querySelector('.levelupcontainer').appendChild(levelup);

		const currentUp = tr.querySelector('.level .currentUp');
		if (currentUp) {
			if (this._rArrow) {
				currentUp.style.backgroundImage = this._rArrow;
			}
			currentUp.addEventListener('click', () => {
				this.skillLevelSelectUp(skill);
			});
		}
		const currentDown = tr.querySelector('.level .currentDown');
		if (currentDown) {
			if (this._lArrow) {
				currentDown.style.backgroundImage = this._lArrow;
			}
			currentDown.addEventListener('click', () => {
				this.skillLevelSelectDown(skill);
			});
		}

		const table = root.querySelector('.content table');
		if (table) {
			table.appendChild(tr);
		}

		this.parseHTML.call(levelup);

		Client.loadFile(`${DB.INTERFACE_PATH}item/${sk.Name}.bmp`, data => {
			const img = tr.querySelector('.icon img');
			if (img) {
				img.src = data;
			}
		});

		this.list.push(skill);
		this.onUpdateSkill(skill.SKID, skill.level);
	};

	comp.removeSkill = function removeSkill() {
		// Not implemented by gravity
	};

	comp.updateSkill = function updateSkill(skill) {
		const target = this.getSkillById(skill.SKID);

		if (!target) {
			return;
		}

		target.level = skill.level;
		target.spcost = skill.spcost;
		target.attackRange = skill.attackRange;
		target.upgradable = skill.upgradable;
		if (Number.isInteger(skill.type)) {
			target.type = skill.type;
		}

		const root = _root(this);
		const element = root.querySelector(`.skill.id${skill.SKID}`);
		if (!element) {
			return;
		}

		for (const el of element.querySelectorAll('.level .current, .level .max')) {
			el.textContent = skill.level;
		}
		if (skill.selectedLevel) {
			const current = element.querySelector('.level .current');
			if (current) {
				current.textContent = skill.selectedLevel;
			}
		}
		const spcost = element.querySelector('.spcost');
		if (spcost) {
			spcost.textContent = skill.spcost;
		}

		element.classList.remove('active', 'passive', 'disabled');
		element.classList.add(!skill.level ? 'disabled' : skill.type ? 'active' : 'passive');

		const levelupEl = element.querySelector('.levelup');
		if (levelupEl) {
			levelupEl.style.display = skill.upgradable && this.points ? '' : 'none';
		}

		this.onUpdateSkill(skill.SKID, skill.level);
	};

	comp.useSkillID = function useSkillID(id, level) {
		const skill = this.getSkillById(id);
		if (!skill || !skill.level || !skill.type) {
			return;
		}
		this.useSkill(skill, level ? level : skill.selectedLevel);
	};

	comp.useSkill = function useSkill(skill, level) {
		if (skill.type & SkillTargetSelection.TYPE.SELF) {
			this.onUseSkill(skill.SKID, level ? level : skill.level);
		}

		skill.useLevel = level;

		if (skill.type & SkillTargetSelection.TYPE.TARGET) {
			SkillTargetSelection.append();
			SkillTargetSelection.set(skill, skill.type);
		}
	};

	comp.setPoints = function setPoints(amount) {
		const root = _root(this);
		const el = root.querySelector('.skpoints_count');
		if (el) {
			el.textContent = amount;
		}

		if (!this.points === !amount) {
			this.points = amount;
			return;
		}

		this.points = amount;
		const count = this.list.length;

		for (let i = 0; i < count; ++i) {
			const levelupEl = root.querySelector(`.skill.id${this.list[i].SKID} .levelup`);
			if (levelupEl) {
				levelupEl.style.display = this.list[i].upgradable && amount ? '' : 'none';
			}
		}
	};

	comp.onLevelUp = function onLevelUp() {
		if (this._btnLevelUp) {
			document.body.appendChild(this._btnLevelUp);
		}
	};

	comp.getSkillById = function getSkillById(id) {
		const count = this.list.length;
		for (let i = 0; i < count; ++i) {
			if (this.list[i].SKID === id) {
				return this.list[i];
			}
		}
		return null;
	};

	comp.skillLevelSelectUp = function skillLevelSelectUp(skill) {
		const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
		if (level < skill.level) {
			skill.selectedLevel = level + 1;
			const root = _root(this);
			const element = root.querySelector(`.skill.id${skill.SKID}`);
			if (element) {
				const current = element.querySelector('.level .current');
				if (current) {
					current.textContent = skill.selectedLevel;
				}
			}
		}
	};

	comp.skillLevelSelectDown = function skillLevelSelectDown(skill) {
		const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
		if (level > 1) {
			skill.selectedLevel = level - 1;
			const root = _root(this);
			const element = root.querySelector(`.skill.id${skill.SKID}`);
			if (element) {
				const current = element.querySelector('.level .current');
				if (current) {
					current.textContent = skill.selectedLevel;
				}
			}
		}
	};

	comp.onUseSkill = function onUseItem() {};
	comp.onIncreaseSkill = function onIncreaseSkill() {};
	comp.onUpdateSkill = function onUpdateSkill() {};

	return comp;
}

/**
 * Create instances
 */
const homSkills = createSkillListMH('homunculus');
const merSkills = createSkillListMH('mercenary');

export default {
	homunculus: UIManager.addComponent(homSkills),
	mercenary: UIManager.addComponent(merSkills)
};
