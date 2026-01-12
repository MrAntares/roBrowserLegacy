/**
 * UI/Components/PvPTimer/PvPTimer.js
 *
 * PvP timer GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require) {
	'use strict';

	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');

	// Emoticons-style rendering stack
	var Client         = require('Core/Client');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Entity         = require('Renderer/Entity/Entity');

	var html = require('text!./PvPTimer.html');
	var css  = require('text!./PvPTimer.css');

	var PvPTimer = new UIComponent('PvPTimer', html, css);

	/* ================= CONFIG (Gravity values) ================= */

	var DIGIT_STEP = 45;

	var TIMER_W = 300, TIMER_H = 110;
	var TA_W    = 350, TA_H    = 150;

	// Gravity font baselines
	var TIMER_Y = 60;
	var TA_Y    = 80;

	/* ================= CANVASES ================= */

	var _timerCanvas, _timerCtx;
	var _taCanvas,    _taCtx;

	/* ================= ACT / SPR ================= */

	var _timefontAct, _timefontSpr;
	var _timeAtkAct,  _timeAtkSpr;

	/* ================= TIMER ================= */

	var _timerInterval = null;
	var _startTs = 0;

	var _layerEntity = new Entity();

	var _taHideTimer = null;

	/**
	 * Initialize UI
	 */
	PvPTimer.init = function init() {
		Client.loadFiles([
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timefont.act',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timefont.spr',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timeattack.act',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timeattack.spr'
		], function (tAct, tSpr, aAct, aSpr) {
			_timefontAct = tAct; _timefontSpr = tSpr;
			_timeAtkAct  = aAct; _timeAtkSpr  = aSpr;
		});

		_timerCanvas = PvPTimer.ui.find('.pvp-timer-canvas')[0];
		_taCanvas    = PvPTimer.ui.find('.pvp-timeattack-canvas')[0];

		if (!_timerCanvas || !_taCanvas) return;

		_timerCtx = _timerCanvas.getContext('2d');
		_taCtx    = _taCanvas.getContext('2d');

	}

	/**
	 * Append UI
	 */
	PvPTimer.onAppend = function onAppend() {
		playTimeAttackBanner();
		startTimer();
	}

	/**
	 * Remove UI
	 */
	PvPTimer.onRemove = function onRemove() {
		stopTimer();
	}

	/**
	 * Set data
	 * @param {Object} data 
	 */
	PvPTimer.setData = function setData(data) {
	}

	PvPTimer.hide = function hide() {
		this.ui.hide();
	}

	PvPTimer.show = function show() {
		this.ui.show();
	}

	/**
	 * Pick layers from act
	 * @param {Object} act 
	 * @param {number} actionId 
	 * @returns {Object[]}
	 */
	function pickLayers(act, actionId) {
		var a = act.actions[actionId];
		if (!a || !a.animations || !a.animations.length) return null;
		return a.animations[(a.animations.length / 2) | 0].layers;
	}

	function drawActionToCanvas(ctx, act, spr, actionId, x, y) {
		var layers = pickLayers(act, actionId);
		if (!layers) return;

		// Gravity fonts: no anchor correction
		SpriteRenderer.bind2DContext(ctx, x, y);

		for (var i = 0; i < layers.length; i++) {
			_layerEntity.renderLayer(
				layers[i],
				spr,
				spr,
				1.0,
				[0, 0],
				false
			);
		}
	}

	function timerCharToAction(ch) {
		if (ch === ':') return 10;
		return parseInt(ch, 10);
	}

	function renderTimer(seconds) {
		if (!_timerCtx || !_timefontAct) return;

		_timerCtx.clearRect(0, 0, TIMER_W, TIMER_H);

		var m = Math.floor(seconds / 60);
		var s = seconds % 60;

		var text = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
		var x = (TIMER_W - text.length * DIGIT_STEP) >> 1;

		for (var i = 0; i < text.length; i++) {
			var a = timerCharToAction(text[i]);
			if (!isNaN(a)) {
				drawActionToCanvas(_timerCtx, _timefontAct, _timefontSpr, a, x, TIMER_Y);
				x += DIGIT_STEP;
			}
		}
	}

	function startTimer() {
		if (_timerInterval) return;
		_startTs = (Date.now() / 1000) | 0;
		renderTimer(0);
		_timerInterval = setInterval(function () {
			renderTimer(((Date.now() / 1000) | 0) - _startTs);
		}, 1000);
	}

	function stopTimer() {
		if (_timerInterval) clearInterval(_timerInterval);
		_timerInterval = null;
		if (_timerCtx) _timerCtx.clearRect(0, 0, TIMER_W, TIMER_H);
	}

	/* ================= TIME ATTACK ================= */

	function playTimeAttackBanner() {
		if (!_taCtx || !_timeAtkAct) return;

		_taCtx.clearRect(0, 0, TA_W, TA_H);

		drawActionToCanvas(_taCtx, _timeAtkAct, _timeAtkSpr, 0, (TA_W >> 1) - 100, TA_Y);

		if (_taHideTimer) clearTimeout(_taHideTimer);
		_taHideTimer = setTimeout(function () {
			_taCtx.clearRect(0, 0, TA_W, TA_H);
		}, 1200);
	}


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PvPTimer);
});
