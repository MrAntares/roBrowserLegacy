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
	var EffectConst         = require('DB/Effects/EffectConst');
	var Renderer            = require('Renderer/Renderer');
	var WeatherTable        = require('DB/Effects/WeatherEffect');
	var SnowWeather         = require('Renderer/Effects/SnowWeather');
	var RainWeather         = require('Renderer/Effects/RainWeather');
	var SakuraWeatherEffect = require('Renderer/Effects/SakuraWeatherEffect');
	var PokJukWeatherEffect = require('Renderer/Effects/PokJukWeatherEffect');
	var Poison              = require('Renderer/Effects/PoisonEffect');
	var Blind               = require('Renderer/Effects/BlindEffect');
	var VerticalFlip        = require('Renderer/Effects/Shaders/VerticalFlip');
	var EFST                = require('DB/Status/StatusConst');
	var Session             = require('Engine/SessionStorage');
	var getModule           = require;
	
	var isMapflagEffect = false;

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
	 * @param {object} gl context
	 * @param {string} mapname
	 */
	ScreenEffectManager.init = function init( gl, mapname )
	{
		// weather effects
		if (WeatherTable.effects && WeatherTable.effects[mapname]) {
			isMapflagEffect = true;
		} 
	}

	ScreenEffectManager.startMapflagEffect = function startMapflagEffect( mapname )
	{
		if(!isMapflagEffect)
			return;

		isMapflagEffect = false;
		var Params = {  
			Inst: {
				startTick: Renderer.tick,  
				endTick: -1
			},  
			Init: {  
				ownerAID: -1,  
				position: null
			}  
		};

		var weather = WeatherTable.effects[mapname].weather;  
		if (weather === 'snow') {  
			Params.Inst.effectId = EffectConst.EF_SNOW;
			SnowWeather.startOrRestart(Params);
		}
		else if(weather === 'rain'){
			Params.Inst.effectId = EffectConst.EF_RAIN;
			RainWeather.startOrRestart(Params);
		}
		else if(weather === 'fireworks'){
			Params.Inst.effectId = EffectConst.EF_POKJUK;
			PokJukWeatherEffect.startOrRestart(Params);
		}
		else if(weather === 'leaves'){
			Params.Inst.effectId = EffectConst.EF_MAPLE;
			SakuraWeatherEffect.startOrRestart(Params);
		}
		else if(weather === 'sakura'){
			Params.Inst.effectId = EffectConst.EF_SAKURA;
			SakuraWeatherEffect.startOrRestart(Params);
		}
	}

	ScreenEffectManager.renderStatusEffects = function renderStatusEffects(gl, modelView, projection, fog)
	{
		if(!Session.Entity) return;

		if(Poison.isActive())
			Poison.render(gl, modelView, projection, fog);
		if(Blind.isActive())
			Blind.render(gl, modelView, projection, fog);
		//if(VerticalFlip.isActive())
		//	VerticalFlip.render(gl, modelView, projection, fog);
	}

	ScreenEffectManager.parseStatus = function parseStatus( efstConst )
	{
		if(!Session.Entity) return;

		if( efstConst == EFST.HEALTHSTATE_POISON )
			Poison.setActive(true);
		if( efstConst == EFST.HEALTHSTATE_BLIND )
			Blind.setActive(true);
		if( efstConst == EFST.ILLUSION )
			VerticalFlip.setActive(true);
	}

	ScreenEffectManager.cleanStatusEffect = function cleanStatusEffect( efstConst )
	{
		if(!Session.Entity) return;

		if( efstConst == EFST.HEALTHSTATE_POISON )
			Poison.setActive(false);
		if( efstConst == EFST.HEALTHSTATE_BLIND )
			Blind.setActive(false);
		if( efstConst == EFST.ILLUSION )
			VerticalFlip.setActive(false);
	}

	ScreenEffectManager.clean = function clean()
	{
		Poison.setActive(false);
		Blind.setActive(false);
		VerticalFlip.setActive(false);
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
		SakuraWeatherEffect.renderAll(gl, modelView, projection, fog, tick);
		PokJukWeatherEffect.renderAll(gl, modelView, projection, fog, tick);

		// Screen Efst status based
		ScreenEffectManager.renderStatusEffects(gl, modelView, projection, fog);
	}

	/**
	 * Set night mode by changing the diffuse color
	 * This effect is the same as SC_SKE
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

			light.env[0] = 1 - (1 - diffuse[0]) * (1 - light.ambient[0]);
			light.env[1] = 1 - (1 - diffuse[1]) * (1 - light.ambient[1]);
			light.env[2] = 1 - (1 - diffuse[2]) * (1 - light.ambient[2]);

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
