/**
 * UI/Components/Captcha/CaptchaSelector.js
 *
 * Captcha Target Selector Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var jQuery = require('Utils/jquery');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./CaptchaSelector.html');
	var cssText = require('text!./CaptchaSelector.css');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var EntityManager = require('Renderer/EntityManager');
	var Session = require('Engine/SessionStorage');
	var DB = require('DB/DBManager');
	var MonsterTable = require('DB/Monsters/MonsterTable');

	/**
	 * Create Component
	 */
	var CaptchaSelector = new UIComponent('CaptchaSelector', htmlText, cssText);

	/**
	 * Preferences
	 */
	var _preferences = Preferences.get(
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
	var _aidList = [];

	/**
	 * AID information
	 */
	var _aidInformation = [];

	/**
	 * Range
	 */
	var _range = 1;

	/**
	 * Active
	 */
	var _active = false;

	/**
	 * Initialize GUI
	 */
	CaptchaSelector.init = function Init() {
		this.draggable('.titlebar');
		this.ui.find('.close').click(this.remove.bind(this));

		var self = this;

		// Active Button
		this.ui.find('.btn_active').click(function () {
			_active = !_active;

			if (_active) {
				var type = self.ui.find('input[name="target_type"]:checked').val();
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

		let li_list = this.ui.find('.player_list li');

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
			let aid = jQuery(this).data('aid');
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
				let aid = jQuery(this).data('aid');
				let entity = EntityManager.get(aid);
				let name = entity?.display?.name ?? 'Unknown';
				let job = MonsterTable[entity?._job ?? 0] ?? 'Unknown';
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
	return UIManager.addComponent(CaptchaSelector);
});
