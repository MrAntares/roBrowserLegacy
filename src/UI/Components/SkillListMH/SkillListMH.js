/**
 * UI/Components/SkillListMH/SkillListMH.js
 *
 * Character Skill Window for Mercenary and Homunculus
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import SkillDescription from 'UI/Components/SkillDescription/SkillDescription.js';
import htmlText from './SkillListMH.html?raw';
import cssText from './SkillListMH.css?raw';

/**
 * Create Component base class
 */
function SkillListMH(type) {
	// Create component
	const name = 'SkillList' + (type === 'homunculus' ? 'HOM' : 'MER');
	UIComponent.call(this, name, htmlText, cssText);

	// Initialize variables
	this.type = type;
	this.list = [];
	this._rowCount = Math.min(4, Math.floor(this.list.length / 9));
	this.points = 0;

	// Load preferences
	this._preferences = Preferences.get(
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
}

// Inherit UIComponent
SkillListMH.prototype = Object.create(UIComponent.prototype);
SkillListMH.prototype.constructor = SkillListMH;

/**
 * Initialize UI
 */
SkillListMH.prototype.init = function init() {
	const self = this;

	this.ui.find('.titlebar .text').text(this.type === 'homunculus' ? 'Homunculus Skills' : 'Mercenary Skills');

	this.ui.find('.titlebar .base').mousedown(function (event) {
		event.stopImmediatePropagation();
		return false;
	});

	this.ui.find('.footer .extend').mousedown(function (event) {
		event.stopImmediatePropagation();
		const ui = self.ui;
		const top = ui.position().top;
		const left = ui.position().left;
		let lastWidth = 0;
		let lastHeight = 0;
		let _Interval;

		function resizing() {
			const extraX = -6;
			const extraY = 32;

			let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
			let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

			// Maximum and minimum window size
			w = Math.min(Math.max(w, 8), 8);
			h = Math.min(Math.max(h, 4), 10);

			if (w === lastWidth && h === lastHeight) {
				return;
			}

			self.ui.find('.content').css({
				width: w * 32,
				height: h * 32
			});
			lastWidth = w;
			lastHeight = h;
		}

		_Interval = setInterval(resizing, 30);

		jQuery(window).on('mouseup.resize', function (event) {
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	});

	this.ui.find('.titlebar .close').click(function () {
		self.ui.hide();
	});

	// Get level up button
	this.btnIncSkill = this.ui.find('.btn.levelup').detach();
	this.btnIncSkill.click(function () {
		const index = this.parentNode.parentNode.getAttribute('data-index');
		self.onIncreaseSkill(parseInt(index, 10));
	});

	// Get button to open skill when level up
	this.btnLevelUp = jQuery('#lvlup_job').detach();
	this.btnLevelUp
		.click(function () {
			self.btnLevelUp.detach();
			self.ui.show();
			self.ui.parent().append(self.ui);
		})
		.mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

	// Bind skills
	this.ui
		.on('dblclick', '.skill .icon, .skill .name', function () {
			let main = jQuery(this).parent();
			if (!main.hasClass('skill')) {
				main = main.parent();
			}
			self.useSkillID(parseInt(main.data('index'), 10));
		})
		.on('contextmenu', '.skill .icon, .skill .name', function () {
			let main = jQuery(this).parent();
			let skill;

			if (!main.hasClass('skill')) {
				main = main.parent();
			}

			skill = self.getSkillById(parseInt(main.data('index'), 10));

			// Don't add the same UI twice, remove it
			if (SkillDescription.uid === skill.SKID) {
				SkillDescription.remove();
				return false;
			}

			// Add ui to window
			SkillDescription.append();
			SkillDescription.setSkill(skill.SKID);

			return false;
		})
		.on('mousedown', '.selectable', function () {
			let main = jQuery(this).parent();

			if (!main.hasClass('skill')) {
				main = main.parent();
			}

			self.ui.find('.skill').removeClass('selected');
			main.addClass('selected');
		})
		.on('dragstart', '.skill', function (event) {
			const index = parseInt(this.getAttribute('data-index'), 10);
			const skill = self.getSkillById(index);

			// Can't drag a passive skill (or disabled)
			if (!skill || !skill.level || !skill.type) {
				event.stopImmediatePropagation();
				return false;
			}

			const img = new Image();
			img.decoding = 'async';
			img.src = this.firstChild.firstChild.src;

			event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
			event.originalEvent.dataTransfer.setData(
				'Text',
				JSON.stringify(
					(window._OBJ_DRAG_ = {
						type: 'skill',
						from: 'SkillListMH',
						data: skill
					})
				)
			);
		})
		.on('dragend', '.skill', function () {
			delete window._OBJ_DRAG_;
			this.classList.remove('hide');
		});

	this.draggable(this.ui.find('.titlebar'));

	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/arw_right.bmp',
		function (data) {
			this.rArrow = 'url(' + data + ')';
		}.bind(this)
	);

	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/arw_left.bmp',
		function (data) {
			this.lArrow = 'url(' + data + ')';
		}.bind(this)
	);
};

/**
 * Apply preferences once append to body
 */
SkillListMH.prototype.onAppend = function onAppend() {
	// Apply preferences
	if (!this._preferences.show) {
		this.ui.hide();
	}

	this.setSize(this._preferences.width, this._preferences.height);
	this.ui.css({
		top: Math.min(Math.max(0, this._preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, this._preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Extend window size
 */
SkillListMH.prototype.setSize = function setSize(width, height) {
	width = Math.min(Math.max(width, 8), 8);
	height = Math.min(Math.max(height, 4), 10);

	this.ui.find('.content').css({
		width: width * 32,
		height: height * 32
	});
};

/**
 * Remove Skill window from DOM
 */
SkillListMH.prototype.onRemove = function onRemove() {
	this.btnLevelUp.detach();

	// Save preferences
	this._preferences.show = this.ui.is(':visible');
	this._preferences.y = parseInt(this.ui.css('top'), 10);
	this._preferences.x = parseInt(this.ui.css('left'), 10);
	this._preferences.width = Math.floor(this.ui.find('.content').width() / 32);
	this._preferences.height = Math.floor(this.ui.find('.content').height() / 32);
	this._preferences.save();
};

/**
 * Show/Hide UI
 */
SkillListMH.prototype.toggle = function toggle() {
	this.ui.toggle();

	if (this.ui.is(':visible')) {
		this.focus();
		this.btnLevelUp.detach();
	}
};

SkillListMH.prototype.onKeyDown = function onKeyDown(event) {
	// Event.which is deprecated
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.toggle();
	}
};

/**
 * Add skills to the list
 */
SkillListMH.prototype.setSkills = function setSkills(skills) {
	let i, count;

	for (i = 0, count = this.list.length; i < count; ++i) {
		this.onUpdateSkill(this.list[i].SKID, 0);
	}

	this.list.length = 0;
	this.ui.find('.content table').empty();

	for (i = 0, count = skills.length; i < count; ++i) {
		this.addSkill(skills[i]);
	}
};

/**
 * Insert skill to list
 */
SkillListMH.prototype.addSkill = function addSkill(skill) {
	// Custom skill ?
	if (!(skill.SKID in SkillInfo)) {
		return;
	}

	// Already in list, update it instead of duplicating it
	if (this.ui.find('.skill.id' + skill.SKID + ':first').length) {
		this.updateSkill(skill);
		return;
	}

	const sk = SkillInfo[skill.SKID];
	const levelup = this.btnIncSkill.clone(true);
	const className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';
	const element = jQuery(
		'<tr class="skill id' +
			skill.SKID +
			' ' +
			className +
			'" data-index="' +
			skill.SKID +
			'" draggable="true">' +
			'<td class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></td>' +
			'<td class="levelupcontainer"></td>' +
			'<td class=selectable>' +
			'<div class="name">' +
			jQuery.escape(sk.SkillName) +
			'<br/>' +
			'<span class="level">' +
			(sk.bSeperateLv
				? '<button class="currentDown"></button>Lv : <span class="current">' +
					skill.level +
					'</span> / <span class="max">' +
					skill.level +
					'</span><button class="currentUp"></button>'
				: 'Lv : <span class="current">' + skill.level + '</span>') +
			'</span>' +
			'</div>' +
			'</td>' +
			'<td class="selectable type">' +
			'<div class="consume">' +
			(skill.type ? 'Sp : <span class="spcost">' + skill.spcost + '</span>' : 'Passive') +
			'</div>' +
			'</td>' +
			'</tr>'
	);

	if (!skill.upgradable || !this.points) {
		levelup.hide();
	}

	element.find('.levelupcontainer').append(levelup);

	if (this.rArrow) {
		element.find('.level .currentUp').css('background-image', this.rArrow);
	}
	if (this.lArrow) {
		element.find('.level .currentDown').css('background-image', this.lArrow);
	}

	element.find('.level .currentUp').click(() => {
		this.skillLevelSelectUp(skill);
	});
	element.find('.level .currentDown').click(() => {
		this.skillLevelSelectDown(skill);
	});
	this.ui.find('.content table').append(element);

	Client.loadFile(DB.INTERFACE_PATH + 'item/' + sk.Name + '.bmp', function (data) {
		element.find('.icon img').attr('src', data);
	});

	this.list.push(skill);
	this.onUpdateSkill(skill.SKID, skill.level);
};

/**
 * Remove skill from list
 */
SkillListMH.prototype.removeSkill = function removeSkill() {
	// Not implemented by gravity ? server have to send the whole list again ?
};

/**
 * Update skill
 */
SkillListMH.prototype.updateSkill = function updateSkill(skill) {
	const target = this.getSkillById(skill.SKID);
	let element;

	if (!target) {
		return;
	}

	// Update Memory
	target.level = skill.level;
	target.spcost = skill.spcost;
	target.attackRange = skill.attackRange;
	target.upgradable = skill.upgradable;
	if (Number.isInteger(skill.type)) {
		target.type = skill.type;
	}

	// Update UI
	element = this.ui.find('.skill.id' + skill.SKID + ':first');
	element.find('.level .current, .level .max').text(skill.level);
	if (skill.selectedLevel) {
		element.find('.level .current').text(skill.selectedLevel);
	}
	element.find('.spcost').text(skill.spcost);

	element.removeClass('active passive disabled');
	element.addClass(!skill.level ? 'disabled' : skill.type ? 'active' : 'passive');

	if (skill.upgradable && this.points) {
		element.find('.levelup').show();
	} else {
		element.find('.levelup').hide();
	}

	this.onUpdateSkill(skill.SKID, skill.level);
};

/**
 * Use a skill by its id
 */
SkillListMH.prototype.useSkillID = function useSkillID(id, level) {
	const skill = this.getSkillById(id);

	if (!skill || !skill.level || !skill.type) {
		return;
	}

	this.useSkill(skill, level ? level : skill.selectedLevel);
};

/**
 * Use a skill
 */
SkillListMH.prototype.useSkill = function useSkill(skill, level) {
	// Self
	if (skill.type & SkillTargetSelection.TYPE.SELF) {
		this.onUseSkill(skill.SKID, level ? level : skill.level);
	}

	skill.useLevel = level;

	// no elseif intended (see flying kick).
	if (skill.type & SkillTargetSelection.TYPE.TARGET) {
		SkillTargetSelection.append();
		SkillTargetSelection.set(skill, skill.type);
	}
};

/**
 * Set skill points amount
 */
SkillListMH.prototype.setPoints = function setPoints(amount) {
	let i, count;
	this.ui.find('.skpoints_count').text(amount);

	// Do not need to update the UI
	if (!this.points === !amount) {
		this.points = amount;
		return;
	}

	this.points = amount;
	count = this.list.length;

	for (i = 0; i < count; ++i) {
		if (this.list[i].upgradable && amount) {
			this.ui.find('.skill.id' + this.list[i].SKID + ' .levelup').show();
		} else {
			this.ui.find('.skill.id' + this.list[i].SKID + ' .levelup').hide();
		}
	}
};

/**
 * Add the button when leveling up
 */
SkillListMH.prototype.onLevelUp = function onLevelUp() {
	this.btnLevelUp.appendTo('body');
};

/**
 * Find a skill by it's id
 */
SkillListMH.prototype.getSkillById = function getSkillById(id) {
	let i,
		count = this.list.length;

	for (i = 0; i < count; ++i) {
		if (this.list[i].SKID === id) {
			return this.list[i];
		}
	}

	return null;
};

/**
 * Closing window
 */
SkillListMH.prototype.onClose = function onClose() {
	this.ui.hide();
};

/**
 * Request to upgrade a skill
 */
SkillListMH.prototype.onRequestSkillUp = function onRequestSkillUp() {
	const index = this.parentNode.parentNode.getAttribute('data-index');
	this.onIncreaseSkill(parseInt(index, 10));
};

/**
 * Request to use a skill
 */
SkillListMH.prototype.onRequestUseSkill = function onRequestUseSkill() {
	let main = jQuery(this).parent();

	if (!main.hasClass('skill')) {
		main = main.parent();
	}

	this.useSkillID(parseInt(main.data('index'), 10));
};

/**
 * Request to get skill info
 */
SkillListMH.prototype.onRequestSkillInfo = function onRequestSkillInfo() {
	let main = jQuery(this).parent();
	let skill;

	if (!main.hasClass('skill')) {
		main = main.parent();
	}

	skill = this.getSkillById(parseInt(main.data('index'), 10));

	// Don't add the same UI twice, remove it
	if (SkillDescription.uid === skill.SKID) {
		SkillDescription.remove();
		return;
	}

	// Add ui to window
	SkillDescription.append();
	SkillDescription.setSkill(skill.SKID);
};

/**
 * Focus a skill
 */
SkillListMH.prototype.onSkillFocus = function onSkillFocus() {
	let main = jQuery(this).parent();

	if (!main.hasClass('skill')) {
		main = main.parent();
	}

	this.ui.find('.skill').removeClass('selected');
	main.addClass('selected');
};

/**
 * Start to drag a skill
 */
SkillListMH.prototype.onSkillDragStart = function onSkillDragStart(event) {
	const index = parseInt(this.getAttribute('data-index'), 10);
	const skill = this.getSkillById(index);

	// Can't drag a passive skill (or disabled)
	if (!skill || !skill.level || !skill.type) {
		return stopPropagation(event);
	}

	const img = new Image();
	img.decoding = 'async';
	img.src = this.firstChild.firstChild.src;

	event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
	event.originalEvent.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'skill',
				from: 'SkillListMH',
				data: skill
			})
		)
	);
};

/**
 * Stop the drag drop action
 */
SkillListMH.prototype.onSkillDragEnd = function onSkillDragEnd() {
	delete window._OBJ_DRAG_;
};

SkillListMH.prototype.skillLevelSelectUp = function skillLevelSelectUp(skill) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level < skill.level) {
		skill.selectedLevel = level + 1;
		const element = this.ui.find('.skill.id' + skill.SKID + ':first');
		element.find('.level .current').text(skill.selectedLevel);
	}
};

SkillListMH.prototype.skillLevelSelectDown = function skillLevelSelectDown(skill) {
	const level = skill.selectedLevel ? skill.selectedLevel : skill.level;
	if (level > 1) {
		skill.selectedLevel = level - 1;
		const element = this.ui.find('.skill.id' + skill.SKID + ':first');
		element.find('.level .current').text(skill.selectedLevel);
	}
};

/**
 * Abstract function to define
 */
SkillListMH.prototype.onUseSkill = function onUseItem() {};
SkillListMH.prototype.onIncreaseSkill = function onIncreaseSkill() {};
SkillListMH.prototype.onUpdateSkill = function onUpdateSkill() {};

/**
 * Create instances
 */
const homSkills = new SkillListMH('homunculus');
const merSkills = new SkillListMH('mercenary');

// Register both instances with UIManager and export it
export default {
	homunculus: UIManager.addComponent(homSkills),
	mercenary: UIManager.addComponent(merSkills)
};
