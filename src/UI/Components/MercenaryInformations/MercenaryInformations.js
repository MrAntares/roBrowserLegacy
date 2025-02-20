/**
 * UI/Components/MercenaryInformations/MercenaryInformations.js
 *
 * Display mercenary information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

define(function(require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var Client            = require('Core/Client');
	var Preferences      = require('Core/Preferences');
	var Renderer         = require('Renderer/Renderer');
	var EntityManager    = require('Renderer/EntityManager');
	var Session          = require('Engine/SessionStorage');
	var UIManager        = require('UI/UIManager');
	var UIComponent      = require('UI/UIComponent');
    var SkillListMER     = require('UI/Components/SkillListMER/SkillListMER');
	var MercAI           = require('Core/MercAI');
	var htmlText         = require('text!./MercenaryInformations.html');
	var cssText          = require('text!./MercenaryInformations.css');

	/**
	 * Create Component
	 */
	var MercenaryInformations = new UIComponent( 'MercenaryInformations', htmlText, cssText );

	/**
	 * @var {Preferences}
	 */
	var _preferences = Preferences.get('MercenaryInformations', {
		x:        100,
		y:        100,
		show:     false,
		reduce:   false
	}, 1.0);

	/**
	 * @var {boolean} do we need to clean up?
	 */
	var _clean = false;

	/**
	 * @var {number} AI timer
	 */
	var _AITimer = null;

	/**
	 * @var {number} Follow timer
	 */
	var _followTimer = null;

	/**
	 * @var {Object} AI states
	 */
	var AIStates = {
		IDLE: 0,
		FOLLOW: 1,
		ATTACK: 2
	};

	/**
	 * @var {number} Current AI state
	 */
	var _currentState = AIStates.IDLE;

	/**
	 * Initialize UI
	 */
	MercenaryInformations.init = function init()
	{
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
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

        this.ui.find('.skill').mousedown(function () {
            SkillListMER.toggle();
        });

		// If no aggressive level defined, default to 1
		// otherwise toggle and untoggle to remain the same
		this.toggleAggressive();
		this.toggleAggressive();
	};

	/**
	 * Once append to body
	 */
	MercenaryInformations.onAppend = function onAppend()
	{
		// Set preferences
		if (!_preferences.show) {
			this.ui.hide();
		}

		if (!_clean) {
			_clean = true;
		}
	};

	/**
	 * Once remove from body
	 */
	MercenaryInformations.onRemove = function onRemove()
	{
		_preferences.show   = this.ui.is(':visible');
		_preferences.y      = parseInt(this.ui.css('top'), 10);
		_preferences.x      = parseInt(this.ui.css('left'), 10);
		_preferences.save();
		this.stopAI();
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	MercenaryInformations.onShortCut = function onShortCut(key)
	{
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
						SkillListMER.ui.hide();
					}
				} else {
					SkillListMER.ui.hide();
					this.ui.hide();
				}
				break;
			case 'AGGRESSIVE':
				this.toggleAggressive();
				break;
		}
	};

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event)
	{
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Closing window
	 */
	function onClose()
	{
		MercenaryInformations.ui.hide();
        SkillListMER.ui.hide();
	}

	/**
	 * Delete mercenary
	 */
	function onDelete()
	{
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

		var now = Date.now() / 1000;
		var remaining = Math.max(0, timestamp - now);

		var hours = Math.floor(remaining / 3600);
		var minutes = Math.floor((remaining % 3600) / 60);

		return hours + 'h ' + minutes + 'm';
	};

	/**
	 * Set time left bar and value
	 * @param {number} timestamp - Unix timestamp for expiration
	 */
	MercenaryInformations.setTimeLeft = function setTimeLeft(timestamp)
	{
		if (!timestamp) {
			this.ui.find('.block2 .timeleft').text('0');
			return;
		}

		var now = Date.now() / 1000;
		var remaining = Math.max(0, timestamp - now);
		var TOTAL_DURATION = 30 * 60; // 30 minutes in seconds
		var time_per = remaining / TOTAL_DURATION;

		// Update text
		this.ui.find('.block2 .timeleft').text(this.formatExpireDate(timestamp));

		// Update bar
		var canvas = this.ui.find('canvas.life.title_timeleft')[0];
		var ctx = canvas.getContext('2d');
		var width = 60, height = 5;

		// empty
		ctx.fillStyle = '#424242';
		ctx.fillRect(1, 1, width - 2, height - 2);

		ctx.fillStyle = (time_per < 0.25) ? '#ff1e00' : '#205cc3';
		ctx.fillRect(1, 1, Math.round((width - 2) * time_per), 3);
	};

	/**
	 * Set monster kills bar and value
	 * @param {number} kills - Number of monsters killed
	 */
	MercenaryInformations.setKills = function setKills(kills)
	{
		if (kills === undefined) {
			this.ui.find('.block2 .kills').text('0');
			return;
		}

		// Update text
		this.ui.find('.block2 .kills').text(kills);

		// Update bar
		var canvas = this.ui.find('canvas.life.title_kills')[0];
		var ctx = canvas.getContext('2d');
		var width = 60, height = 5;
		var kills_per = kills%50 / 50;

		// empty
		ctx.fillStyle = '#424242';
		ctx.fillRect(1, 1, width - 2, height - 2);

		ctx.fillStyle = '#205cc3';
		ctx.fillRect(1, 1, Math.round((width - 2) * kills_per), 3);
	};

	/**
	 * Initialize UI
	 */
	MercenaryInformations.setInformations = function setInformations(info)
	{
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

        SkillListMER.setPoints(info.SKPoint);
	};

	/**
	 * Set hp and sp bar
	 */
	MercenaryInformations.setHpSpBar = function setHpSpBar(type, val, val2)
	{
		var perc = Math.floor(val * 100 / val2);
		var color = perc < 25 ? 'red' : 'blue';

		this.ui.find('.' + type + '_bar_perc .'+type+'_value').text(val);
		this.ui.find('.' + type + '_bar_perc .'+type+'_max_value').text(val2);
		this.ui.find('.' + type + '2').text(val + ' / ' + val2);

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_left.bmp', function (url) {
			this.ui.find('.' + type + '_bar_left').css('backgroundImage', 'url(' + url + ')');
		}.bind(this));

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_mid.bmp', function (url) {
			this.ui.find('.' + type + '_bar_middle').css({
				backgroundImage: 'url(' + url + ')',
				width: Math.floor(Math.min(perc, 100) * 0.75) + 'px'
			});
		}.bind(this));

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/gze' + color + '_right.bmp', function (url) {
			this.ui.find('.' + type + '_bar_right').css({
				backgroundImage: 'url(' + url + ')',
				left: Math.floor(Math.min(perc, 100) * 1.27) + 'px'
			});
		}.bind(this));
	};

	/**
	 * Toggle Aggressive
	 */
	MercenaryInformations.toggleAggressive = function toggleAggressive()
	{
		let agr = localStorage.getItem('MER_AGGRESSIVE') == 0 ? 1 : 0;
		localStorage.setItem('MER_AGGRESSIVE', agr);
	};

	/**
	 * Start AI
	 */
	MercenaryInformations.startAI = function startAI()
	{
		this.stopAI();
		MercAI.reset();
		this.AILoop = setInterval(function () {
			if (Session.mercId) {
				MercAI.exec('AI(' + Session.mercId + ')')
			}
		}, 100);
	};

	/**
	 * Stop AI
	 */
	MercenaryInformations.stopAI = function stopAI()
	{
		if(this.AILoop){
			clearInterval(this.AILoop);
		}
	};

	/**
	 * Reset AI
	 */
	MercenaryInformations.resetAI = function resetAI()
	{
		this.stopAI();
		this.startAI();
	};

	/**
	 * Set target for mercenary to attack
	 */
	MercenaryInformations.setTarget = function setTarget(targetId)
	{
		var entity = EntityManager.get(Session.mercId);
		if (!entity) {
			return;
		}

		entity.targetId = targetId;
	};

	/**
	 * Set faith value
	 */
	MercenaryInformations.setFaith = function setFaith(faith)
	{
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
	return UIManager.addComponent(MercenaryInformations);
});
