/**
 * UI/Components/PvPTimer/PvPTimer.js
 *
 * PvP timer GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import html from './PvPTimer.html?raw';
import css from './PvPTimer.css?raw';

// Emoticons-style rendering stack
const PvPTimer = new UIComponent('PvPTimer', html, css);

/* ================= CONFIG (OG values) ================= */

// var DIGIT_STEP = 24; // UNUSED

const TIMER_W = 300,
	TIMER_H = 110;
const TA_W = 360,
	TA_H = 128; // Match CSS

// OG font baselines
const TIMER_Y = 60;
const TA_Y = 80;

/* ================= CANVASES ================= */

let _timerCanvas, _timerCtx;
let _taCanvas, _taCtx;

/* ================= ACT / SPR ================= */

let _timefontAct, _timefontSpr;
let _timeAtkAct, _timeAtkSpr;

/* ================= TIMER ================= */

let _timerInterval = null;
let _startTs = 0;

const _layerEntity = new Entity();

let _taHideTimer = null;

// time attack is played once u get first place on first time
let isFirstTime = true;

/**
 * Initialize UI
 */
PvPTimer.init = function init() {
	Client.loadFiles(
		[
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timefont.act',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timefont.spr',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timeattack.act',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/timeattack.spr'
		],
		function (tAct, tSpr, aAct, aSpr) {
			_timefontAct = tAct;
			_timefontSpr = tSpr;
			_timeAtkAct = aAct;
			_timeAtkSpr = aSpr;
		}
	);

	_timerCanvas = PvPTimer.ui.find('.pvp-timer-canvas')[0];
	_taCanvas = PvPTimer.ui.find('.pvp-timeattack-canvas')[0];

	if (!_timerCanvas || !_taCanvas) {
		return;
	}

	_timerCanvas.width = TIMER_W;
	_timerCanvas.height = TIMER_H;
	_taCanvas.width = TA_W;
	_taCanvas.height = TA_H;

	_timerCtx = _timerCanvas.getContext('2d');
	_taCtx = _taCanvas.getContext('2d');
};

/**
 * Append UI
 */
PvPTimer.onAppend = function onAppend() {
	this.ui.hide();
};

/**
 * Remove UI
 */
PvPTimer.onRemove = function onRemove() {
	isFirstTime = true;
	stopTimer();
};

/**
 * Set data
 * @param {Object} data
 */
PvPTimer.setData = function setData(data) {};

PvPTimer.hide = function hide() {
	this.ui.hide();
	stopTimer();
};

PvPTimer.show = function show() {
	this.ui.show();
	startTimer();
	if (isFirstTime == true) {
		playTimeAttackBanner();
		isFirstTime = false;
	}
};

/**
 * Pick layers from act
 * @param {Object} act
 * @param {number} actionId
 * @returns {Object[]}
 */
function pickLayers(act, actionId, frameId) {
	const a = act.actions[actionId];
	if (!a || !a.animations || !a.animations.length) {
		return null;
	}

	const idx = frameId !== undefined ? frameId : (a.animations.length / 2) | 0;
	if (idx >= a.animations.length) {
		return null;
	}

	return a.animations[idx].layers;
}

function drawActionToCanvas(ctx, act, spr, actionId, x, y, frameId) {
	const layers = pickLayers(act, actionId, frameId);
	if (!layers) {
		return;
	}

	// Gravity fonts: no anchor correction
	SpriteRenderer.bind2DContext(ctx, x, y);

	for (let i = 0; i < layers.length; i++) {
		_layerEntity.renderLayer(layers[i], spr, spr, 1.0, [0, 0], false);
	}
}

function timerCharToAction(ch) {
	if (ch === ':') {
		return 10;
	}
	return parseInt(ch, 10);
}

function renderTimer(seconds) {
	if (!_timerCtx || !_timefontAct) {
		return;
	}

	_timerCtx.clearRect(0, 0, TIMER_W, TIMER_H);

	const m = Math.floor(seconds / 60);
	const s = seconds % 60;

	const text = m == 0 ? String(s).padStart(2, '0') : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

	const digitWidth = 50;
	const totalWidth = m == 0 ? 2 * digitWidth : 5 * digitWidth;

	let x = (TIMER_W - totalWidth) >> 1;

	for (let i = 0; i < text.length; i++) {
		const a = timerCharToAction(text[i]);

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
	if (_timerInterval) {
		return;
	}
	_startTs = (Date.now() / 1000) | 0;
	renderTimer(0);
	_timerInterval = setInterval(function () {
		renderTimer(((Date.now() / 1000) | 0) - _startTs);
	}, 1000);
}

function stopTimer() {
	if (_timerInterval) {
		clearInterval(_timerInterval);
	}
	_timerInterval = null;
	if (_timerCtx) {
		_timerCtx.clearRect(0, 0, TIMER_W, TIMER_H);
	}
}

/* ================= TIME ATTACK ================= */

function playTimeAttackBanner() {
	if (!_taCtx || !_timeAtkAct) {
		return;
	}

	if (_taHideTimer) {
		clearTimeout(_taHideTimer);
		_taHideTimer = null;
	}

	_taCtx.clearRect(0, 0, TA_W, TA_H);

	const action = _timeAtkAct.actions[0];
	if (!action || !action.animations) {
		return;
	}

	let frame = 0;
	const count = action.animations.length;

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
export default UIManager.addComponent(PvPTimer);
