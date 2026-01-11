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
	var getModule = require;

	/**
	 * @var {number} _nightInterval
	 */
	ScreenEffectManager._nightInterval = null;

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
	 * Callback to execute once the ScreenEffectManager is loaded
	 */
	ScreenEffectManager.onLoad = function onLoad()
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
	 * Set night mode by changing the diffuse color
	 * This effect is the same as SC_SKE
	 * @param {object} mapRenderer
	 * @param {boolean} night - true for night mode, false for day mode
	 */
	ScreenEffectManager.setNight = function(night) {

		if (ScreenEffectManager._nightInterval) {
			clearInterval(ScreenEffectManager._nightInterval);
			ScreenEffectManager._nightInterval = null;
		}
		var mapRenderer = getModule("Renderer/MapRenderer");
		ScreenEffectManager._nightInterval = setInterval(function() {
			var diffuse = mapRenderer.diffuse;
			var light   = mapRenderer.light;
			var step    = 0.005;

			if (night) {
				if (diffuse[0] > 0.5) diffuse[0] -= step;
				if (diffuse[1] > 0.5) diffuse[1] -= step;
			} else {
				if (diffuse[0] < light.diffuse[0]) diffuse[0] += step;
				if (diffuse[1] < light.diffuse[1]) diffuse[1] += step;
			}

			// Atualiza o ambiente global do mapa
			light.env[0] = 1 - (1 - diffuse[0]) * (1 - light.ambient[0]);
			light.env[1] = 1 - (1 - diffuse[1]) * (1 - light.ambient[1]);
			light.env[2] = 1 - (1 - diffuse[2]) * (1 - light.ambient[2]);

			// Verifica se chegou no objetivo para parar o Interval
			var done = night ? 
				(diffuse[0] <= 0.5 && diffuse[1] <= 0.5) :
				(diffuse[0] >= light.diffuse[0] && diffuse[1] >= light.diffuse[1]);

			if (done) {
				clearInterval(ScreenEffectManager._nightInterval);
				ScreenEffectManager._nightInterval = null;
			}
		}, 8);
	}	

	/**
	 * Export
	 */
	return ScreenEffectManager;
});
