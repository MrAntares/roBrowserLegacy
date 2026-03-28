/**
 * UI/Components/MercenaryInformations/MercenaryInformations.js
 *
 * Display mercenary information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import EntityManager from 'Renderer/EntityManager.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Session from 'Engine/SessionStorage.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import SkillListMH from 'UI/Components/SkillListMH/SkillListMH.js';
import AIDriver from 'Core/AIDriver.js';
import htmlText from './MercenaryInformations.html?raw';
import cssText from './MercenaryInformations.css?raw';

/**
 * Create Component
 */
const MercenaryInformations = new UIComponent('MercenaryInformations', htmlText, cssText);

/**
 * @var {Preferences}
 */
const _preferences = Preferences.get(
	'MercenaryInformations',
	{
		x: 100,
		y: 100,
		show: false,
		reduce: false
	},
	1.0
);

/**
 * Initialize UI
 */
MercenaryInformations.init = function init() {
	this.draggable(this.ui.find('.content'));

	// Avoid drag drop problems
	this.ui.find('.content').mousedown(stopPropagation);
	this.ui.find('.content .base').mousedown(stopPropagation);
	this.ui.find('.close').click(onClose);
	this.ui.find('.dismiss').click(onDelete);

	if (!_preferences.show) {
		this.ui.hide();
	}

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	this.ui.find('.skill').mousedown(function () {
		SkillListMH.mercenary.toggle();
	});

	// If no aggressive level defined, default to 1
	// otherwise toggle and untoggle to remain the same
	this.toggleAggressive();
	this.toggleAggressive();
};

/**
 * Once append to body
 */
MercenaryInformations.onAppend = function onAppend() {
	// Set preferences
	if (!_preferences.show) {
		this.ui.hide();
	}
};

/**
 * Once remove from body
 */
MercenaryInformations.onRemove = function onRemove() {
	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
	this.stopAI();
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
MercenaryInformations.onShortCut = function onShortCut(key) {
	// Not in body
	if (!this.ui) {
		return;
	}

	switch (key.cmd) {
		case 'TOGGLE':
			if (Session.mercId) {
				this.ui.toggle();
				if (this.ui.is(':visible')) {
					this.focus();
				}
				if (!this.ui.is(':visible')) {
					SkillListMH.mercenary.ui.hide();
				}
			} else {
				SkillListMH.mercenary.ui.hide();
				this.ui.hide();
			}
			break;
		case 'AGGRESSIVE':
			this.toggleAggressive();
			break;
	}
};

/**
 * Process key down
 *
 * @param {object} event
 */
MercenaryInformations.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.ui.toggle();
	}
};

/**
 * Stop event propagation
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

/**
 * Closing window
 */
function onClose() {
	MercenaryInformations.ui.hide();
	SkillListMH.mercenary.ui.hide();
}

/**
 * Delete mercenary
 */
function onDelete() {
	MercenaryInformations.reqDeleteMercenary();
}

/**
 * Format expire date into readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time string
 */
MercenaryInformations.formatExpireDate = function formatExpireDate(timestamp) {
	if (!timestamp) {
		return '0';
	}

	const now = Date.now() / 1000;
	const remaining = Math.max(0, timestamp - now);

	const hours = Math.floor(remaining / 3600);
	const minutes = Math.floor((remaining % 3600) / 60);

	return hours + 'h ' + minutes + 'm';
};

/**
 * Set time left bar and value
 * @param {number} timestamp - Unix timestamp for expiration
 */
MercenaryInformations.setTimeLeft = function setTimeLeft(timestamp) {
	if (!timestamp) {
		this.ui.find('.block2 .timeleft').text('0');
		return;
	}

	const now = Date.now() / 1000;
	const remaining = Math.max(0, timestamp - now);
	const TOTAL_DURATION = 30 * 60; // 30 minutes in seconds
	const time_per = remaining / TOTAL_DURATION;

	// Update text
	this.ui.find('.block2 .timeleft').text(this.formatExpireDate(timestamp));

	// Update bar
	const canvas = this.ui.find('canvas.life.title_timeleft')[0];
	const ctx = canvas.getContext('2d');
	const width = 60,
		height = 5;

	// empty
	ctx.fillStyle = '#424242';
	ctx.fillRect(1, 1, width - 2, height - 2);

	ctx.fillStyle = time_per < 0.25 ? '#ff1e00' : '#205cc3';
	ctx.fillRect(1, 1, Math.round((width - 2) * time_per), 3);
};

/**
 * Set monster kills bar and value
 * @param {number} kills - Number of monsters killed
 */
MercenaryInformations.setKills = function setKills(kills) {
	if (kills === undefined) {
		this.ui.find('.block2 .kills').text('0');
		return;
	}

	// Update text
	this.ui.find('.block2 .kills').text(kills);

	// Update bar
	const canvas = this.ui.find('canvas.life.title_kills')[0];
	const ctx = canvas.getContext('2d');
	const width = 60,
		height = 5;
	const kills_per = (kills % 50) / 50;

	// empty
	ctx.fillStyle = '#424242';
	ctx.fillRect(1, 1, width - 2, height - 2);

	ctx.fillStyle = '#205cc3';
	ctx.fillRect(1, 1, Math.round((width - 2) * kills_per), 3);
};

/**
 * Initialize UI
 */
MercenaryInformations.setInformations = function setInformations(info) {
	this.ui.find('.name').text(info.name || '');
	this.ui.find('.level').text(info.level || '');

	// Stats
	this.ui.find('.stats .atk').text(info.atk || 0);
	this.ui.find('.stats .Matk').text(info.Matk || 0);
	this.ui.find('.stats .hit').text(info.hit || 0);
	this.ui.find('.stats .critical').text(info.critical || 0);
	this.ui.find('.stats .def').text(info.def || 0);
	this.ui.find('.stats .Mdef').text(info.Mdef || 0);
	this.ui.find('.stats .flee').text(info.flee || 0);
	this.ui.find('.stats .aspd').text(info.aspd || 0);

	// HP/SP
	this.setHpSpBar('hp', info.hp, info.maxHP);
	this.setHpSpBar('sp', info.sp, info.maxSP);

	// Additional Info
	this.setTimeLeft(info.ExpireDate);
	this.setKills(info.approval_monster_kill_counter || 0);
	this.setFaith(info.faith || 0);

	SkillListMH.mercenary.setPoints(info.SKPoint);
};

/**
 * Set hp and sp bar
 */
MercenaryInformations.setHpSpBar = function setHpSpBar(type, val, val2) {
	const perc = Math.floor((val * 100) / val2);
	const color = perc < 25 ? 'red' : 'blue';

	this.ui.find('.' + type + '_bar_perc .' + type + '_value').text(val);
	this.ui.find('.' + type + '_bar_perc .' + type + '_max_value').text(val2);
	this.ui.find('.' + type + '2').text(val + ' / ' + val2);

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
				width: Math.floor(Math.min(perc, 100) * 0.75) + 'px'
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
};

/**
 * Toggle Aggressive
 */
MercenaryInformations.toggleAggressive = function toggleAggressive() {
	const agr = localStorage.getItem('MER_AGGRESSIVE') == 0 ? 1 : 0;
	localStorage.setItem('MER_AGGRESSIVE', agr);
};

/**
 * Start AI
 */
MercenaryInformations.startAI = function startAI() {
	if (!this.AILoop) {
		AIDriver.reset();
		this.AILoop = setInterval(function () {
			if (Session.mercId) {
				const entity = EntityManager.get(Session.mercId);
				if (entity) {
					AIDriver.exec('AI(' + Session.mercId + ')', false);
				}
			}
		}, 100);
	}
};

/**
 * Stop AI
 */
MercenaryInformations.stopAI = function stopAI() {
	if (this.AILoop) {
		this.AILoop = clearInterval(this.AILoop);
	}
};

/**
 * Reset AI
 */
MercenaryInformations.resetAI = function resetAI() {
	this.stopAI();
	this.startAI();
};

/**
 * Set target for mercenary to attack
 */
MercenaryInformations.setTarget = function setTarget(targetId) {
	const entity = EntityManager.get(Session.mercId);
	if (!entity) {
		return;
	}

	entity.targetId = targetId;
};

/**
 * Set faith value
 */
MercenaryInformations.setFaith = function setFaith(faith) {
	this.ui.find('.block2 .faith').text(faith);
};

/**
 * Functions defined in Engine/MapEngine/Mercenary.js
 */
MercenaryInformations.reqDeleteMercenary = function reqDeleteMercenary() {};
MercenaryInformations.reqAttack = function reqAttack() {};
MercenaryInformations.reqMoveTo = function reqMoveTo() {};
MercenaryInformations.reqMoveToOwner = function reqMoveToOwner() {};

/**
 * Export
 */
export default UIManager.addComponent(MercenaryInformations);
