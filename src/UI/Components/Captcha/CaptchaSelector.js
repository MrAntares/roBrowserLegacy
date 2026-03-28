/**
 * UI/Components/Captcha/CaptchaSelector.js
 *
 * Captcha Target Selector Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './CaptchaSelector.html?raw';
import cssText from './CaptchaSelector.css?raw';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import EntityManager from 'Renderer/EntityManager.js';
import Session from 'Engine/SessionStorage.js';
import DB from 'DB/DBManager.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';

/**
 * Create Component
 */
const CaptchaSelector = new UIComponent('CaptchaSelector', htmlText, cssText);

/**
 * Preferences
 */
const _preferences = Preferences.get(
	'CaptchaSelector',
	{
		x: 230,
		y: 295
	},
	2.0
);

/**
 * AID list
 */
let _aidList = [];

/**
 * AID information
 */
let _aidInformation = [];

/**
 * Range
 */
let _range = 1;

/**
 * Active
 */
let _active = false;

/**
 * Initialize GUI
 */
CaptchaSelector.init = function Init() {
	this.draggable('.titlebar');
	this.ui.find('.close').click(this.remove.bind(this));

	const self = this;

	// Active Button
	this.ui.find('.btn_active').click(function () {
		_active = !_active;

		if (_active) {
			const type = self.ui.find('input[name="target_type"]:checked').val();
			_range = parseInt(self.ui.find('.range_val').val(), 10) || 1;
			_range = Math.min(Math.max(1, _range), 9);

			if (type === 'character') {
				// set Session.captchaGetIdOnEntityClick
				Session.captchaGetIdOnEntityClick = true;
				Session.captchaGetIdOnFloorClick = false;
			} else if (type === 'range') {
				// set Session.captchaGetIdOnFloorClick
				Session.captchaGetIdOnFloorClick = true;
				Session.captchaGetIdOnFloorRange = _range;
				Session.captchaGetIdOnEntityClick = false;
			}
		} else {
			Session.captchaGetIdOnEntityClick = false;
			Session.captchaGetIdOnFloorClick = false;
		}
	});

	// OK Button
	this.ui.find('.ok').click(function () {
		if (_aidList.length > 0) {
			UIManager.showPromptBox(
				DB.getMessage(2876).replace('%d', _aidList.length),
				'ok',
				'cancel',
				function () {
					CaptchaSelector.sendCaptchaToPlayers();
				},
				function () {}
			);
		}
	});

	// Close Character Button
	this.ui.find('.close-character').click(function () {
		self.ui.find('.character_info').hide();
	});

	// Character Info
	this.ui.find('.character_info').hide();
};

/**
 * Append to DOM
 */
CaptchaSelector.onAppend = function OnAppend() {
	// Apply preferences
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Remove data from UI
 */
CaptchaSelector.onRemove = function OnRemove() {
	// save preferences
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();

	// hide character info
	this.ui.find('.character_info').hide();

	// reset UI list
	this.cleanUIList();

	// reset AID list
	_aidList = [];

	// reset AID information
	_aidInformation = [];

	// reset range
	_range = 1;

	// reset active
	_active = false;

	// reset Session.captchaGetIdOnEntityClick
	Session.captchaGetIdOnEntityClick = false;

	// reset Session.captchaGetIdOnFloorClick
	Session.captchaGetIdOnFloorClick = false;

	// reset Session.captchaGetIdOnFloorRange
	Session.captchaGetIdOnFloorRange = 1;
};

/**
 * Set player list
 * @param {Array} players - List of player AIDs
 */
CaptchaSelector.setPlayers = function SetPlayers(players) {
	this.cleanUIList();
	_aidInformation = [];

	const li_list = this.ui.find('.player_list li');

	// remove Session.Entity from players list
	players = players.filter(function (aid) {
		return Session.Entity.GID !== aid;
	});

	for (let i = 0; i < players.length; i++) {
		const li = li_list.eq(i);
		const entity = EntityManager.get(players[i]);
		const name = entity?.display?.name ?? 'Unknown';
		const aid = players[i];

		li.addClass('player').data('aid', aid).html(`
					<button class="base remove"
                data-background="basic_interface/sys_close_off.bmp"
                data-hover="basic_interface/sys_close_on.bmp"
					data-aid="${aid}">
            </button> 
            <span><a data-aid="${aid}">${name}</a></span>`);

		_aidInformation.push({
			aid: aid,
			name: name,
			job: MonsterTable[entity?._job ?? 0] ?? 'Unknown'
		});
	}

	// add remove button click event
	this.ui.find('.player_list li .remove').click(function () {
		const aid = jQuery(this).data('aid');
		_aidList = _aidList.filter(function (item) {
			return item !== aid;
		});
		CaptchaSelector.setPlayers(_aidList);
	});

	// set character info on click <a>
	this.ui
		.find('.player_list li')
		.find('a')
		.click(function () {
			const aid = jQuery(this).data('aid');
			const entity = EntityManager.get(aid);
			const name = entity?.display?.name ?? 'Unknown';
			const job = MonsterTable[entity?._job ?? 0] ?? 'Unknown';
			CaptchaSelector.ui.find('.character_info').find('.character-name').text(name);
			CaptchaSelector.ui.find('.character_info').find('.character-job').text(job);

			// move to component position
			CaptchaSelector.ui.find('.character_info').css({
				top: jQuery(this).position().top,
				left: 0
			});

			CaptchaSelector.ui.find('.character_info').show();
		});

	this.ui.each(this.parseHTML).find('*').each(this.parseHTML);

	// save AID list
	_aidList = players;
};

CaptchaSelector.cleanUIList = function cleanList() {
	this.ui.find('.player_list li').each(function () {
		jQuery(this).html('');
	});
};

CaptchaSelector.addPlayer = function addPlayer(aid) {
	if (_aidList.includes(aid)) {
		return;
	}
	_aidList.push(aid);
	CaptchaSelector.setPlayers(_aidList);
};

CaptchaSelector.requestPlayersIds = function requestPlayersIds(xPos, yPos) {
	if (CaptchaSelector.requestPlayersIdsInRange) {
		CaptchaSelector.requestPlayersIdsInRange(xPos, yPos, _range);
	}
};

CaptchaSelector.sendCaptchaToPlayers = function sendCaptchaToPlayers() {
	_aidList.forEach(function (aid) {
		if (CaptchaSelector.sendCaptchaToPlayer) {
			CaptchaSelector.sendCaptchaToPlayer(aid);
		}
	});
	this.cleanUIList();
	_aidList = [];
};

/**
 * Callbacks
 */
CaptchaSelector.requestPlayersIdsInRange = null;
CaptchaSelector.sendCaptchaToPlayer = null;

/**
 * Stored component and return it
 */
export default UIManager.addComponent(CaptchaSelector);
