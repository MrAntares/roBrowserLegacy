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

	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');

	// Emoticons-style rendering stack
	var Client = require('Core/Client');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Entity = require('Renderer/Entity/Entity');

	var html = require('text!./PvPTimer.html');
	var css = require('text!./PvPTimer.css');

	var PvPTimer = new UIComponent('PvPTimer', html, css);

	/* ================= CONFIG (OG values) ================= */

	// var DIGIT_STEP = 24; // UNUSED

	var TIMER_W = 300, TIMER_H = 110;
	var TA_W = 360, TA_H = 128; // Match CSS

	// OG font baselines
	var TIMER_Y = 60;
	var TA_Y = 80;

	/* ================= CANVASES ================= */

	var _timerCanvas, _timerCtx;
	var _taCanvas, _taCtx;

	/* ================= ACT / SPR ================= */

	var _timefontAct, _timefontSpr;
	var _timeAtkAct, _timeAtkSpr;

	/* ================= TIMER ================= */

	var _timerInterval = null;
	var _startTs = 0;

	var _layerEntity = new Entity();

	var _taHideTimer = null;

	// time attack is played once u get first place on first time
	var isFirstTime = true;

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
			_timeAtkAct = aAct; _timeAtkSpr = aSpr;
		});

		_timerCanvas = PvPTimer.ui.find('.pvp-timer-canvas')[0];
		_taCanvas = PvPTimer.ui.find('.pvp-timeattack-canvas')[0];

		if (!_timerCanvas || !_taCanvas) return;

		_timerCanvas.width = TIMER_W;
		_timerCanvas.height = TIMER_H;
		_taCanvas.width = TA_W;
		_taCanvas.height = TA_H;

		_timerCtx = _timerCanvas.getContext('2d');
		_taCtx = _taCanvas.getContext('2d');

	}

	/**
	 * Append UI
	 */
	PvPTimer.onAppend = function onAppend() {
		this.ui.hide();
	}

	/**
	 * Remove UI
	 */
	PvPTimer.onRemove = function onRemove() {
		isFirstTime = true;
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
		stopTimer();
	}

	PvPTimer.show = function show() {
		this.ui.show();
		startTimer();
		if (isFirstTime == true) {
			playTimeAttackBanner();
			isFirstTime = false;
		}
	}

	/**
	 * Pick layers from act
	 * @param {Object} act 
	 * @param {number} actionId 
	 * @returns {Object[]}
	 */
	function pickLayers(act, actionId, frameId) {
		var a = act.actions[actionId];
		if (!a || !a.animations || !a.animations.length) return null;

		var idx = frameId !== undefined ? frameId : ((a.animations.length / 2) | 0);
		if (idx >= a.animations.length) return null;

		return a.animations[idx].layers;
	}

	function drawActionToCanvas(ctx, act, spr, actionId, x, y, frameId) {
		var layers = pickLayers(act, actionId, frameId);
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

		var text = (m == 0) ? String(s).padStart(2, '0') : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

		var digitWidth = 50;
		var totalWidth = (m == 0) ? (2 * digitWidth) : (5 * digitWidth);

		var x = (TIMER_W - totalWidth) >> 1;

		for (var i = 0; i < text.length; i++) {
			var a = timerCharToAction(text[i]);

			if (!isNaN(a)) {
				// Center '1' or narrow digits?
				// For now, simple fixed step to avoid jitter is best.
				// But we might want to center the glyph inside the 'step' slot if it's narrow.
				// However, standard drawing draws from left (x).
				// If we want monospace look, we just draw at x.
				// But visual centering for '1' might be needed if it's 28px vs 50px slot.
				// Let's stick to simple left-aligned in slot for now, standard behavior.
				drawActionToCanvas(_timerCtx, _timefontAct, _timefontSpr, a, x, TIMER_Y);
				x += digitWidth;
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

		if (_taHideTimer) {
			clearTimeout(_taHideTimer);
			_taHideTimer = null;
		}

		_taCtx.clearRect(0, 0, TA_W, TA_H);

		var action = _timeAtkAct.actions[0];
		if (!action || !action.animations) return;

		var frame = 0;
		var count = action.animations.length;

		function run() {
			_taCtx.clearRect(0, 0, TA_W, TA_H);
			drawActionToCanvas(_taCtx, _timeAtkAct, _timeAtkSpr, 0, (TA_W >> 1) - 100, TA_Y, frame);

			frame++;

			if (frame < count) {
				_taHideTimer = setTimeout(run, 100);
			} else {
				_taHideTimer = setTimeout(function () {
					_taCtx.clearRect(0, 0, TA_W, TA_H);
				}, 300);
			}
		}

		run();
	}


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PvPTimer);
});
