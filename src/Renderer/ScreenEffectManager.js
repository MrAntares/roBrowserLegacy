/**
 * @module Renderer/ScreenEffectManager
 *
 * Manage ScreenEffects
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	// Load dependencies
	var SnowWeather    = require('Renderer/Effects/SnowWeather');
	var RainWeather    = require('Renderer/Effects/RainWeather');

	/**
	 * ScreenEffectManager Namespace
	 */
	function ScreenEffectManager()
	{
	}

	/**
	 * @param {object} gl - WebGL context
	 */
	ScreenEffectManager.init = function init( gl )
	{
	}

	/**
	 * Rendering self screen effects
	 *
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog structure
	 * @param {number} tick - game tick
	 */
	ScreenEffectManager.render = function render( gl, modelView, projection, fog, tick )
	{
		// Weather Effects
		SnowWeather.renderAll(gl, modelView, projection, fog, tick);
		RainWeather.renderAll(gl, modelView, projection, fog, tick);
	}

	/**
	 * Export
	 */
	return ScreenEffectManager;
});
