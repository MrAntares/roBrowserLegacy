/**
 * UI/Components/SkillListV0/SkillListV0.js
 *
 * Chararacter Skill Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import SkillTreeView from 'DB/Skills/SkillTreeView.js';
import Session from 'Engine/SessionStorage.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import SkillDescription from 'UI/Components/SkillDescription/SkillDescription.js';
import htmlText from './SkillListV0.html?raw';
import cssText from './SkillListV0.css?raw';

function _escapeHTML(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

function _isNumeric(val) {
	return !isNaN(parseFloat(val)) && isFinite(val);
}

const SkillListV0 = new GUIComponent('SkillListV0', cssText);
SkillListV0.render = () => htmlText;

const _preferences = Preferences.get(
	'SkillListV0',
	{
		x: 100,
		y: 200,
		width: 8,
		height: 8,
		show: false,
		mini: true,
		skillInfo: false
	},
	1.0
);

const _list = [];
let _btnIncSkill;
let _points = 0;
let totalCounter = 0;
let _btnLevelUp;
let _lArrow, _rArrow;
let skillPosition = [];
const skillDependencyTree = [];
let rememberChoice = [];
const hasSkills = [];
let _justDragged = false;

SkillListV0.init = function init() {
	const root = SkillListV0.getRoot();

	root.querySelector('.titlebar .base')?.addEventListener('mousedown', e => {
		e.stopImmediatePropagation();
	});
	root.querySelector('.footer .extend')?.addEventListener('mousedown', e => {
		onResize(e, this);
	});
	root.querySelector('.titlebar .close')?.addEventListener('click', () => {
		this.ui.hide();
	});
	root.querySelector('.titlebar .mini')?.addEventListener('click', () => {
		onMini(this);
	});
	root.querySelector('.view_skill_info')?.addEventListener('change', function () {
		_preferences.skillInfo = !!this.checked;
		_preferences.save();
	});
	root.querySelector('.reset')?.addEventListener('click', () => {
		onResetChoice(this);
	});
	root.querySelector('.apply')?.addEventListener('click', () => {
		onApplyChoice(this);
	});

	const levelupBtn = root.querySelector('.btn.levelup');
	if (levelupBtn) {
		_btnIncSkill = levelupBtn.cloneNode(true);
		levelupBtn.remove();
		_btnIncSkill.addEventListener('click', function () {
			const index = this.parentNode.parentNode.getAttribute('data-index');
			SkillListV0.onIncreaseSkill(parseInt(index, 10));
		});
	}

	const lvlupBtn = root.querySelector('#lvlup_job');
	if (lvlupBtn) {
		_btnLevelUp = lvlupBtn;
		_btnLevelUp.style.zIndex = '51';
		_btnLevelUp.style.position = 'absolute';
		_btnLevelUp.style.right = '0px';
		_btnLevelUp.style.bottom = '0px';
		_btnLevelUp.style.width = '43px';
		_btnLevelUp.style.height = '43px';
		_btnLevelUp.style.border = 'none';
		_btnLevelUp.style.backgroundColor = 'transparent';
		_btnLevelUp.style.backgroundRepeat = 'no-repeat';
		_btnLevelUp.remove();
		_btnLevelUp.addEventListener('click', () => {
			if (_btnLevelUp.parentNode) {
				_btnLevelUp.remove();
			}
			SkillListV0.ui.show();
		});
		_btnLevelUp.addEventListener('mousedown', e => {
			e.stopImmediatePropagation();
		});
	}

	const container = root.querySelector('#SkillListV0') || root;

	container.addEventListener('dblclick', e => {
		const target = e.target.closest('.skill .icon, .skill .name');
		if (target) {
			let main = target.parentElement;
			if (!main.classList.contains('skill')) {
				main = main.parentElement;
			}
			SkillListV0.useSkillID(parseInt(main.getAttribute('data-index'), 10));
		}
	});

	container.addEventListener('contextmenu', e => {
		const target = e.target.closest('.skill .icon, .skill .name');
		if (target) {
			const skillID = _resolveSkillID(target);
			if (SkillDescription.uid === skillID) {
				SkillDescription.remove();
				return;
			}
			SkillDescription.append();
			SkillDescription.setSkill(skillID);
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

	container.addEventListener('mouseover', e => {
		const target = e.target.closest('.skillCol .skill .icon, .skill .name');
		if (target) {
			if (_preferences.mini || _preferences.skillInfo) {
				const skillID = _resolveSkillID(target);
				if (SkillDescription.uid !== skillID) {
					SkillDescription.append();
					SkillDescription.setSkill(skillID);
				}
			}
			onNecessarySkills(target, root);
		}
	});

	container.addEventListener('mouseout', e => {
		const target = e.target.closest('.skillCol .skill .icon, .skill .name');
		if (target) {
			if (_preferences.mini || _preferences.skillInfo) {
				SkillDescription.remove();
			}
			root.querySelectorAll('.needleSkill').forEach(el => el.classList.remove('needleSkill'));
			root.querySelectorAll('.counterSkill').forEach(el => el.remove());
		}
	});

	container.addEventListener('click', e => {
		const target = e.target.closest('.skillCol .skill .icon, .skill .name');
		if (target) {
			onRememberChoice(target, root);
		}
	});

	container.addEventListener('dragstart', e => {
		const skillEl = e.target.closest('.skill');
		if (!skillEl) {
			return;
		}
		const index = parseInt(skillEl.getAttribute('data-index'), 10);
		const skill = getSkillById(index);

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
					from: 'SkillListV0',
					data: skill
				})
			)
		);
	});

	container.addEventListener('dragend', () => {
		delete window._OBJ_DRAG_;
		_justDragged = true;
		setTimeout(() => {
			_justDragged = false;
		}, 0);
	});

	this.draggable('.titlebar');

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_right.bmp`, data => {
		_rArrow = `url(${data})`;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/arw_left.bmp`, data => {
		_lArrow = `url(${data})`;
	});
};

SkillListV0.onAppend = function onAppend() {
	if (!_preferences.show) {
		this.ui.hide();
	}

	resize(this, _preferences.width, _preferences.height);
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 100)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - 100)}px`;

	const root = SkillListV0.getRoot();
	const cb = root.querySelector('.view_skill_info');
	if (cb) {
		cb.checked = _preferences.skillInfo;
	}
};

SkillListV0.onRemove = function onRemove() {
	if (_btnLevelUp && _btnLevelUp.parentNode) {
		_btnLevelUp.remove();
	}

	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this._host.style.top, 10) || 0;
	_preferences.x = parseInt(this._host.style.left, 10) || 0;

	const root = SkillListV0.getRoot();
	const content = root.querySelector('.content');
	if (content) {
		_preferences.width = Math.floor(parseInt(content.style.width, 10) / 32) || 8;
		_preferences.height = Math.floor(parseInt(content.style.height, 10) / 32) || 8;
	}
	_preferences.save();
};

SkillListV0.toggle = function toggle() {
	if (this.ui.is(':visible')) {
		this.ui.hide();
		if (_btnLevelUp && _btnLevelUp.parentNode) {
			_btnLevelUp.remove();
		}
	} else {
		this.ui.show();
		this.focus();
	}
};

SkillListV0.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
	onResetChoice(this);
};

SkillListV0.setSkills = function setSkills(skills) {
	const root = SkillListV0.getRoot();
	root.querySelectorAll('.upgradable').forEach(el => el.classList.remove('upgradable'));

	let skillJobId = Session.Character.job;
	const originalJobId = Session.Entity._job;
	if (originalJobId && originalJobId !== Session.Character.job) {
		skillJobId = originalJobId;
	}

	skillPosition = getSkillPosition(skillJobId);
	createSkillDependencyTree();

	for (let i = 0, count = _list.length; i < count; ++i) {
		this.onUpdateSkill(_list[i].SKID, 0);
	}

	_list.length = 0;
	const table = root.querySelector('.content table');
	if (table) {
		table.innerHTML = '';
	}
	root.querySelectorAll('.skillCol').forEach(el => {
		el.innerHTML = '';
	});

	for (let i = 0, count = skills.length; i < count; ++i) {
		this.addSkill(skills[i]);
		hasSkills[skills[i].SKID] = skills[i];
	}

	skillPosition.forEach((items, list) => {
		SkillListV0.prepareSkillTree(items, list);
	});

	onResetChoice(this);
};

function createSkillDependencyTree() {
	skillPosition.forEach(items => {
		Object.entries(items).forEach(([skid, pos]) => {
			if (!_isNumeric(skid)) {
				return;
			}

			const sk = SkillInfo[skid];

			skillDependencyTree[skid] = {
				dependency: [],
				position: pos,
				list: undefined,
				MaxLv: sk.MaxLv
			};

			if (sk?.['_NeedSkillListV0'] !== undefined) {
				sk['_NeedSkillListV0'].forEach(item => {
					skillDependencyTree[skid]['dependency'][item[0]] = item[1];
				});
			}
		});
	});
}

function specifyRequirements(skillId, count, root) {
	const showAll = true;
	const skdt = skillDependencyTree[skillId];

	if (skdt?.dependency || count != null) {
		skillPosition.forEach((items, list) => {
			if (items[skillId] !== undefined) {
				const skillbox = root.querySelector(`#positionSkills${list} .s${items[skillId]}`);
				if (skillbox) {
					const child = skillbox.querySelector('.disabled');
					if (child || showAll) {
						skillbox.classList.add('needleSkill');
						if (count !== null && count !== undefined) {
							const counterEl = document.createElement('div');
							counterEl.className = 'counterSkill';
							counterEl.textContent = count;
							skillbox.appendChild(counterEl);
						}
					}
				}
			}
		});
	}

	if (skdt?.dependency) {
		skdt.dependency.forEach((item, key) => {
			specifyRequirements(key, item, root);
		});
	}
}

function onRememberChoice(target, root) {
	if (_justDragged) {
		return;
	}
	let main = target.parentElement;
	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}
	const skillId = parseInt(main.getAttribute('data-index'), 10);

	rememberChoice = setRememberChoice(skillId);

	rememberChoice.forEach((item, skId) => {
		if (!rememberChoice[skId]['isQuest'] && totalCounter < _points) {
			const sk = skillDependencyTree[skId];
			if (!sk) {
				return;
			}
			const skillbox = root.querySelector(`#positionSkills${sk.list} .s${sk.position}`);
			if (skillbox) {
				const currentEl = skillbox.querySelector('.current');
				if (currentEl && currentEl.textContent !== String(sk.MaxLv)) {
					totalCounter += rememberChoice[skId]['count'];
					const disabledEl = skillbox.querySelector('.disabled');
					if (disabledEl) {
						disabledEl.classList.remove('disabled');
					}
					const levelEl = skillbox.querySelector('.level');
					if (levelEl) {
						levelEl.style.display = '';
					}
					if (currentEl) {
						currentEl.textContent = rememberChoice[skId]['count'];
					}
					const maxEl = skillbox.querySelector('.max');
					if (maxEl) {
						maxEl.textContent = rememberChoice[skId]['count'];
					}
				}
			}
		}
	});

	const skpointsEl = root.querySelector('.skpoints_count');
	if (skpointsEl) {
		skpointsEl.textContent = `${_points - totalCounter}/${_points}`;
	}
}

function setRememberChoice(skillId, count = null, isQuest = false) {
	const sk = SkillInfo[skillId];

	if (!isQuest && sk['Type'] === 'Quest') {
		const skill = getSkillById(skillId);
		isQuest = !skill?.level || skill?.level <= 0;
	}

	rememberChoice[skillId] = rememberChoice[skillId] ?? {
		count: hasSkills?.[skillId]?.level ?? 0,
		list: null,
		isQuest: isQuest
	};

	if (!isQuest) {
		if (count) {
			if (count > rememberChoice[skillId]['count']) {
				rememberChoice[skillId]['count'] = count;
			}
		} else {
			if (sk['MaxLv'] > rememberChoice[skillId]['count']) {
				rememberChoice[skillId]['count']++;
			}
		}
	}

	if (sk['_NeedSkillListV0'] !== undefined) {
		sk['_NeedSkillListV0'].forEach(item => {
			rememberChoice[skillId][item[0]] = setRememberChoice(item[0], item[1], isQuest)[item[0]];
		});

		Object.entries(rememberChoice[skillId]).forEach(([key, value]) => {
			if (_isNumeric(key) && value.isQuest) {
				rememberChoice[skillId]['isQuest'] = value.isQuest;
			}
		});
	}

	return rememberChoice;
}

function getSkillPosition(JobId) {
	const positions = [];
	positions[SkillTreeView[JobId]['list']] = SkillTreeView[JobId];

	if (SkillTreeView[JobId]['beforeJob'] !== null) {
		const beforeJob = SkillTreeView[JobId]['beforeJob'];
		getSkillPosition(beforeJob).forEach((items, list) => {
			positions[list] = positions[list] ? Object.assign(positions[list], items) : items;
		});
	}

	return positions;
}

SkillListV0.addSkill = function addSkill(skill) {
	if (!(skill.SKID in SkillInfo)) {
		return;
	}

	const root = SkillListV0.getRoot();
	if (root.querySelector(`.skill.id${skill.SKID}`)) {
		this.updateSkill(skill);
		return;
	}

	this.addSkillBig(skill);
	this.addSkillMini(skill);
};

SkillListV0.prepareSkillTree = function prepareSkillTree(items, list) {
	const root = SkillListV0.getRoot();
	Object.entries(items).forEach(([key, value]) => {
		const sk = SkillInfo[key];
		const className = 'disabled';
		if (sk !== undefined) {
			const element = document.createElement('div');
			element.className = `skill id${key} ${className}`;
			element.setAttribute('data-index', key);
			element.setAttribute('draggable', 'true');
			element.innerHTML =
				`<div class="name">${_escapeHTML(sk.SkillName).substr(0, 7)}...<br/></div>` +
				'<div class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></div>' +
				'<div class=selectable>' +
				'<span class="level" style="display: none">' +
				(sk.bSeperateLv
					? `<button class="currentDown"></button><span class="current">0</span> / <span class="max">0</span><button class="currentUp"></button>`
					: '<span class="current">0</span>') +
				'</span></div>';

			const upBtn = element.querySelector('.level .currentUp');
			if (upBtn) {
				if (_rArrow) {
					upBtn.style.backgroundImage = _rArrow;
				}
				upBtn.addEventListener('click', () => skillLevelSelectUp(0, root));
			}
			const downBtn = element.querySelector('.level .currentDown');
			if (downBtn) {
				if (_lArrow) {
					downBtn.style.backgroundImage = _lArrow;
				}
				downBtn.addEventListener('click', () => skillLevelSelectDown(0, root));
			}

			if (value !== undefined) {
				const box = root.querySelector(`#positionSkills${list} .s${value}`);
				if (box) {
					if (parseInt(key, 10) < 41) {
						box.parentElement.style.display = '';
					}
					if (!box.hasChildNodes()) {
						box.appendChild(element);
					}
				}
			}

			Client.loadFile(`${DB.INTERFACE_PATH}item/${sk.Name}.bmp`, data => {
				const img = element.querySelector('.icon img');
				if (img) {
					img.src = data;
				}
			});
		}
	});
};

SkillListV0.addSkillBig = function addSkillBig(skill) {
	const root = SkillListV0.getRoot();
	const sk = SkillInfo[skill.SKID];
	const className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';
	const element = document.createElement('div');
	element.className = `skill id${skill.SKID} ${className}`;
	element.setAttribute('data-index', skill.SKID);
	element.setAttribute('draggable', 'true');
	element.innerHTML =
		`<div class="name">${_escapeHTML(sk.SkillName).substr(0, 7)}...<br/></div>` +
		'<div class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></div>' +
		'<div class="levelupcontainer"></div>' +
		'<div class=selectable>' +
		'<span class="level">' +
		(sk.bSeperateLv
			? `<button class="currentDown"></button><span class="current">${skill.level}</span> / <span class="max">${skill.level}</span><button class="currentUp"></button>`
			: `<span class="current">${skill.level}</span>`) +
		'</span></div>';

	const upBtn = element.querySelector('.level .currentUp');
	if (upBtn) {
		if (_rArrow) {
			upBtn.style.backgroundImage = _rArrow;
		}
		upBtn.addEventListener('click', () => skillLevelSelectUp(skill, root));
	}
	const downBtn = element.querySelector('.level .currentDown');
	if (downBtn) {
		if (_lArrow) {
			downBtn.style.backgroundImage = _lArrow;
		}
		downBtn.addEventListener('click', () => skillLevelSelectDown(skill, root));
	}

	skillPosition.forEach((items, list) => {
		if (items[skill.SKID] !== undefined) {
			const box = root.querySelector(`#positionSkills${list} .s${items[skill.SKID]}`);
			if (box) {
				if (box.hasChildNodes()) {
					box.innerHTML = '';
				}
				box.appendChild(element);

				if (skill.upgradable) {
					box.classList.add('upgradable');
				}
			}
		}
	});

	Client.loadFile(`${DB.INTERFACE_PATH}item/${sk.Name}.bmp`, data => {
		const img = element.querySelector('.icon img');
		if (img) {
			img.src = data;
		}
	});
};

SkillListV0.addSkillMini = function addSkillMini(skill) {
	const root = SkillListV0.getRoot();
	const sk = SkillInfo[skill.SKID];
	const levelup = _btnIncSkill.cloneNode(true);
	levelup.addEventListener('click', function () {
		const index = this.parentNode.parentNode.getAttribute('data-index');
		SkillListV0.onIncreaseSkill(parseInt(index, 10));
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

	if (!skill.upgradable || !_points) {
		levelup.style.display = 'none';
	}

	tr.querySelector('.levelupcontainer').appendChild(levelup);

	const upBtn = tr.querySelector('.level .currentUp');
	if (upBtn) {
		if (_rArrow) {
			upBtn.style.backgroundImage = _rArrow;
		}
		upBtn.addEventListener('click', () => skillLevelSelectUp(skill, root));
	}
	const downBtn = tr.querySelector('.level .currentDown');
	if (downBtn) {
		if (_lArrow) {
			downBtn.style.backgroundImage = _lArrow;
		}
		downBtn.addEventListener('click', () => skillLevelSelectDown(skill, root));
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

	_list.push(skill);
	this.onUpdateSkill(skill.SKID, skill.level);
};

SkillListV0.removeSkill = function removeSkill() {};

SkillListV0.updateSkill = function updateSkill(skill) {
	const target = getSkillById(skill.SKID);

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

	const root = SkillListV0.getRoot();
	const elements = root.querySelectorAll(`.skill.id${skill.SKID}`);
	elements.forEach(element => {
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
			levelupEl.style.display = skill.upgradable && _points ? '' : 'none';
		}
	});

	this.onUpdateSkill(skill.SKID, skill.level);
};

SkillListV0.useSkillID = function useSkillID(id, level) {
	const skill = getSkillById(id);
	if (!skill || !skill.level || !skill.type) {
		return;
	}
	SkillListV0.useSkill(skill, level ? level : skill.selectedLevel);
};

SkillListV0.useSkill = function useSkill(skill, level) {
	if (skill.type & SkillTargetSelection.TYPE.SELF) {
		this.onUseSkill(skill.SKID, level ? level : skill.level);
	}

	skill.useLevel = level;

	if (skill.type & SkillTargetSelection.TYPE.TARGET) {
		SkillTargetSelection.append();
		SkillTargetSelection.set(skill, skill.type);
	}
};

SkillListV0.setPoints = function setPoints(amount) {
	const root = SkillListV0.getRoot();
	const el = root.querySelector('.skpoints_count');
	if (el) {
		el.textContent = amount;
	}

	if (!_points === !amount) {
		_points = amount;
		return;
	}

	_points = amount;
	const count = _list.length;

	for (let i = 0; i < count; ++i) {
		const levelups = root.querySelectorAll(`.skill.id${_list[i].SKID} .levelup`);
		levelups.forEach(lu => {
			lu.style.display = _list[i].upgradable && amount ? '' : 'none';
		});
	}
};

SkillListV0.onLevelUp = function onLevelUp() {
	if (_btnLevelUp) {
		document.body.appendChild(_btnLevelUp);
	}
};

function getSkillById(id) {
	const count = _list.length;
	for (let i = 0; i < count; ++i) {
		if (_list[i].SKID === id) {
			return _list[i];
		}
	}
	return null;
}

function onResize(e, comp) {
	e.stopImmediatePropagation();
	const top = parseInt(comp._host.style.top, 10) || 0;
	const left = parseInt(comp._host.style.left, 10) || 0;
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

		resize(comp, w, h);
		lastWidth = w;
		lastHeight = h;
	};

	const interval = setInterval(resizing, 30);

	const onMouseUp = event => {
		if (event.which === 1) {
			clearInterval(interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
	window.addEventListener('mouseup', onMouseUp);
}

function resize(comp, width, height) {
	const root = comp.getRoot();
	if (_preferences.mini) {
		width = Math.min(Math.max(width, 8), 8);
		height = Math.min(Math.max(height, 4), 10);
		const extend = root.querySelector('.extend');
		if (extend) {
			extend.style.display = '';
		}
		const content = root.querySelector('.content');
		if (content) {
			content.style.display = '';
			content.style.width = `${width * 32}px`;
			content.style.height = `${height * 32}px`;
		}
		const contentbig = root.querySelector('.contentbig');
		if (contentbig) {
			contentbig.style.display = 'none';
		}
		root.querySelectorAll('.footer .btn').forEach(el => {
			el.style.display = 'none';
		});
	} else {
		width = 17;
		height = 12;
		const extend = root.querySelector('.extend');
		if (extend) {
			extend.style.display = 'none';
		}
		const content = root.querySelector('.content');
		if (content) {
			content.style.display = 'none';
		}
		const contentbig = root.querySelector('.contentbig');
		if (contentbig) {
			contentbig.style.display = '';
			contentbig.style.width = `${width * 32}px`;
			contentbig.style.height = `${height * 32}px`;
		}
		root.querySelectorAll('.footer .btn').forEach(el => {
			el.style.display = 'block';
		});
	}
}

function onMini(comp) {
	_preferences.mini = !_preferences.mini;
	_preferences.save();
	resize(comp, _preferences.width, _preferences.height);
}

function onApplyChoice(comp) {
	const applyArr = [];
	rememberChoice.forEach((item, skillId) => {
		applyArr[skillId] = 0;
		const level = hasSkills?.[skillId]?.level ?? 0;

		if (item.count > level) {
			applyArr[skillId] = item.count - level;
		} else {
			applyArr[skillId] = item.count;
		}
	});

	applyArr.forEach((c, k) => {
		for (let i = 0; i < c; i++) {
			SkillListV0.onIncreaseSkill(parseInt(k, 10));
		}
	});

	totalCounter = 0;
	const root = comp.getRoot();
	const skpointsEl = root.querySelector('.skpoints_count');
	if (skpointsEl) {
		skpointsEl.textContent = `${_points - totalCounter}`;
	}
	rememberChoice = [];
}

function onResetChoice(comp) {
	const root = comp.getRoot();
	rememberChoice.forEach((_count, skillId) => {
		if (!skillDependencyTree[skillId]) {
			return;
		}
		const skillbox = root.querySelector(`.skillCol.s${skillDependencyTree[skillId].position}`);
		if (skillbox) {
			if (!hasSkills?.[skillId]?.level) {
				skillbox.querySelectorAll('.skill').forEach(el => el.classList.add('disabled'));
			}
			const selectable = skillbox.querySelector('.selectable');
			if (selectable) {
				selectable.style.display = '';
			}
			skillbox.querySelectorAll('.current').forEach(el => {
				el.textContent = hasSkills?.[skillId]?.level ?? 0;
			});
			skillbox.querySelectorAll('.max').forEach(el => {
				el.textContent = hasSkills?.[skillId]?.level ?? 0;
			});
		}
	});
	totalCounter = 0;
	const skpointsEl = root.querySelector('.skpoints_count');
	if (skpointsEl) {
		skpointsEl.textContent = _points;
	}
	rememberChoice = [];
}

function onNecessarySkills(target, root) {
	let main = target.parentElement;
	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}
	const skillId = parseInt(main.getAttribute('data-index'), 10);
	specifyRequirements(skillId, null, root);
}

function _resolveSkillID(el) {
	let main = el.parentElement;
	if (!main.classList.contains('skill')) {
		main = main.parentElement;
	}
	const id = parseInt(main.getAttribute('data-index'), 10);
	const skill = getSkillById(id);
	return skill?.SKID ?? id;
}

function skillLevelSelectUp(skill, root) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level < skill.level) {
		skill.selectedLevel = level + 1;
		const elements = root.querySelectorAll(`.skill.id${skill.SKID}`);
		elements.forEach(element => {
			const current = element.querySelector('.level .current');
			if (current) {
				current.textContent = skill.selectedLevel;
			}
		});
	}
}

function skillLevelSelectDown(skill, root) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level > 1) {
		skill.selectedLevel = level - 1;
		const elements = root.querySelectorAll(`.skill.id${skill.SKID}`);
		elements.forEach(element => {
			const current = element.querySelector('.level .current');
			if (current) {
				current.textContent = skill.selectedLevel;
			}
		});
	}
}

SkillListV0.onUseSkill = function onUseItem() {};
SkillListV0.onIncreaseSkill = function onIncreaseSkill() {};
SkillListV0.onUpdateSkill = function onUpdateSkill() {};
SkillListV0.getSkillById = getSkillById;

export default UIManager.addComponent(SkillListV0);
