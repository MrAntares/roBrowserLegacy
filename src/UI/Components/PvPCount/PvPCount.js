/**
 * UI/Components/PvpCount/PvpCount.js
 *
 * PvP count GUI
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
	var Sound = require('Audio/SoundManager');

	var html = require('text!./PvPCount.html');
	var css = require('text!./PvPCount.css');

	var PvPCount = new UIComponent('PvPCount', html, css);

	/* ================= CONFIG (OG values) ================= */

	//var DIGIT_STEP = 45; // UNUSED
	var RANK_W = 240,
		RANK_H = 96;
	var RANK_Y = 52;

	/* ================= CANVASES ================= */

	var _rankCanvas, _rankCtx;

	/* ================= ACT / SPR ================= */

	var _rankfontAct, _rankfontSpr;

	var _layerEntity = new Entity();

	var ranking = 0;
	var total = 0;

	/**
	 * Initialize UI
	 */
	PvPCount.init = function init() {
		Client.loadFiles(
			['data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/rankfont.act', 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/rankfont.spr'],
			function (rAct, rSpr) {
				_rankfontAct = rAct;
				_rankfontSpr = rSpr;
			}
		);

		_rankCanvas = PvPCount.ui.find('.pvp-rank-canvas')[0];

		if (!_rankCanvas) {
			return;
		}

		_rankCanvas.width = RANK_W;
		_rankCanvas.height = RANK_H;

		_rankCtx = _rankCanvas.getContext('2d');
	};

	/**
	 * Append UI
	 */
	PvPCount.onAppend = function onAppend() {};

	/**
	 * Remove UI
	 */
	PvPCount.onRemove = function onRemove() {
		ranking = 0;
		total = 0;
		clearRank();
	};

	/**
	 * Set data
	 * @param {Object} data
	 */
	PvPCount.setData = function setData(data) {
		if (data.ranking == ranking && data.total == total) {
			return;
		}

		renderRankText(data.ranking + '/' + data.total);

		// if total increase play the effect
		if (data.total > total) {
			Sound.play('effect/number_change.wav');
		}

		ranking = data.ranking;
		total = data.total;
	};

	/**
	 * Pick layers from act
	 * @param {Object} act
	 * @param {number} actionId
	 * @returns {Object[]}
	 */
	function pickLayers(act, actionId) {
		var a = act.actions[actionId];
		if (!a || !a.animations || !a.animations.length) {
			return null;
		}
		return a.animations[(a.animations.length / 2) | 0].layers;
	}

	function drawActionToCanvas(ctx, act, spr, actionId, x, y) {
		var layers = pickLayers(act, actionId);
		if (!layers) {
			return;
		}

		// Gravity fonts: no anchor correction
		SpriteRenderer.bind2DContext(ctx, x, y);

		for (var i = 0; i < layers.length; i++) {
			_layerEntity.renderLayer(layers[i], spr, spr, 1.0, [0, 0], false);
		}
	}

	function rankCharToAction(ch) {
		if (ch === '/') {
			return 10;
		}
		return parseInt(ch, 10);
	}

	function renderRankText(text) {
		if (!_rankCtx || !_rankfontAct) {
			return;
		}

		_rankCtx.clearRect(0, 0, RANK_W, RANK_H);

		var parts = text.split('/');
		var ranking = parts[0];
		var total = parts[1];
		var step = 28; // Compact spacing
		var slashStep = 28;

		// Calculate total width to center it
		var totalWidth = ranking.length * step + slashStep + total.length * step;
		var x = (RANK_W - totalWidth) >> 1;

		// 1. Render Ranking (Higher)
		var i, a;
		for (i = 0; i < ranking.length; i++) {
			a = rankCharToAction(ranking[i]);
			if (!isNaN(a)) {
				drawActionToCanvas(_rankCtx, _rankfontAct, _rankfontSpr, a, x, RANK_Y - 6);
				x += step;
			}
		}

		// 2. Render Slash (Middle)
		a = rankCharToAction('/');
		drawActionToCanvas(_rankCtx, _rankfontAct, _rankfontSpr, a, x, RANK_Y);
		x += slashStep;

		// 3. Render Total (Lower)
		for (i = 0; i < total.length; i++) {
			a = rankCharToAction(total[i]);
			if (!isNaN(a)) {
				drawActionToCanvas(_rankCtx, _rankfontAct, _rankfontSpr, a, x, RANK_Y + 6);
				x += step;
			}
		}
	}

	function clearRank() {
		if (_rankCtx) {
			_rankCtx.clearRect(0, 0, RANK_W, RANK_H);
		}
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PvPCount);
});
