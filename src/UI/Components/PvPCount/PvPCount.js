define(function (require) {
	'use strict';

	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');

	// Emoticons-style rendering stack
	var Client         = require('Core/Client');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Entity         = require('Renderer/Entity/Entity');

	var html = require('text!./PvPCount.html');
	var css  = require('text!./PvPCount.css');

	var PvPCount = new UIComponent('PvPCount', html, css);

	/* ================= CONFIG (Gravity values) ================= */

	var DIGIT_STEP = 45;
	var RANK_W  = 300, RANK_H  = 80;
	var RANK_Y  = 52;

	/* ================= CANVASES ================= */

	var _rankCanvas,  _rankCtx;

	/* ================= ACT / SPR ================= */

	var _rankfontAct, _rankfontSpr;

	var _layerEntity = new Entity();


	/**
	 * Initialize UI
	 */
	PvPCount.init = function init() {
		Client.loadFiles([
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/rankfont.act',
			'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/rankfont.spr',
		], function (rAct, rSpr) {
			_rankfontAct = rAct; _rankfontSpr = rSpr;
		});

		_rankCanvas  = PvPCount.ui.find('.pvp-rank-canvas')[0];

		if (!_rankCanvas) return;

		_rankCtx  = _rankCanvas.getContext('2d');

	}

	/**
	 * Append UI
	 */
	PvPCount.onAppend = function onAppend() {
	}

	/**
	 * Remove UI
	 */
	PvPCount.onRemove = function onRemove() {
		clearRank();
	}

	/**
	 * Set data
	 * @param {Object} data 
	 */
	PvPCount.setData = function setData(data) {
		renderRankText(data.ranking + '/' + data.total);
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

	function rankCharToAction(ch) {
		if (ch === '/') return 10;
		return parseInt(ch, 10);
	}

	function renderRankText(text) {
		if (!_rankCtx || !_rankfontAct) return;

		_rankCtx.clearRect(0, 0, RANK_W, RANK_H);
		var x = (RANK_W - text.length * DIGIT_STEP) >> 1;

		for (var i = 0; i < text.length; i++) {
			var a = rankCharToAction(text[i]);
			if (!isNaN(a)) {
				drawActionToCanvas(_rankCtx, _rankfontAct, _rankfontSpr, a, x, RANK_Y);
				x += DIGIT_STEP;
			}
		}
	}

	function clearRank() {
		if (_rankCtx) _rankCtx.clearRect(0, 0, RANK_W, RANK_H);
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PvPCount);
});
