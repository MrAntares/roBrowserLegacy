/**  
 * Renderer/Effects/CloudWeatherEffect.js  
 *  
 * Weather clouds effect
 *  
 * This file is part of ROBrowser, (http://www.robrowser.com/).  
 *  
 * @author Vincent Thibault(original), adapted by AoShinHo
 */
define(function (require) {
	'use strict';

	var WebGL = require('Utils/WebGL');
	var Client = require('Core/Client');
	var Session = require('Engine/SessionStorage');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Renderer = require('Renderer/Renderer');
	var vec3 = require('Utils/gl-matrix').vec3;
	var getModule = require;

	var FADEOUT_TAIL_MS = 2000;

	// SINGLETON STATE  
	var _instance = null;
	var _mapName = '';
	var _isStopping = false;

	var PROFILE_MAP = {
		229: { maxClouds: 40, overlay: true,  speed: 0.05,  area: 35, zindex: -125, cloudColor: [1.0, 1.0, 1.0, 0.58] }, // EF_CLOUD
		230: { maxClouds: 60, overlay: false, speed: 0.05,  area: 35, zindex: 40, cloudColor: [1.0, 1.0, 1.0, 0.58] }, // EF_CLOUD2
		233: { maxClouds: 40, overlay: true,  speed: 0.015, area: 45, zindex: 1, cloudColor: [0.47, 0.43, 0.39, 0.78] }, // EF_CLOUD3
		515: { maxClouds: 80, overlay: false, speed: 0.05,  area: 35, zindex: -125, cloudColor: [1.0, 1.0, 1.0, 0.58] }, // EF_CLOUD4
		516: { maxClouds: 80, overlay: false, speed: 0.20,  area: 50, zindex: 40, cloudColor: [0.88, 0.83, 0.76, 0.70] }, // EF_CLOUD5
		592: { maxClouds: 80, overlay: false, speed: 0.035, area: 35, zindex: 40, cloudColor: [1.0, 1.0, 1.0, 0.58] }, // EF_CLOUD6
		697: { maxClouds: 80, overlay: false, speed: 0.05,  area: 35, zindex: 40, cloudColor: [0.20, 0.31, 0.63, 0.55] }, // EF_CLOUD7
		698: { maxClouds: 80, overlay: false, speed: 0.05,  area: 35, zindex: 40, cloudColor: [1.0, 0.55, 0.20, 0.62] }  // EF_CLOUD8
	};

	function CloudWeatherEffect(Params) {
		this.effectID = Params.Inst.effectID;
		this.ownerAID = Params.Init.ownerAID;
		this.startTick = Params.Inst.startTick;
		this.endTick = Params.Inst.endTick;
		this._profile = PROFILE_MAP[this.effectID] || PROFILE_MAP[229];
		this._clouds = new Array(this._profile.maxClouds);
		this._textures = [];
		this._color = null;
		this._display = true;
		this.needCleanUp = false;
	}

	CloudWeatherEffect.beforeRender = function beforeRender(gl, modelView, projection, fog) {
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.depth = 0;
		SpriteRenderer.zIndex = 0;
	};

	CloudWeatherEffect.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		SpriteRenderer.unbind(gl);
	};

	CloudWeatherEffect.startOrRestart = function startOrRestart(Params) {
		var now = Params.Inst.startTick || Renderer.tick;
		var currentMap = getModule("Renderer/MapRenderer").currentMap;

		if (_mapName !== currentMap) {
			_instance = null;
			_mapName = currentMap;
		}
		_isStopping = false;
		if (_instance && !_instance.needCleanUp) {
			if (_instance.endTick > 0) {
				_instance.endTick = -1;
			}
			return _instance;
		}

		_instance = new CloudWeatherEffect(Params);
		_mapName = currentMap;
		_instance.init(now);
		return _instance;
	};

	CloudWeatherEffect.renderAll = function renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) return;

		if (_mapName !== getModule("Renderer/MapRenderer").currentMap) {
			_instance = null;
			return;
		}

		this.beforeRender(gl, modelView, projection, fog);
		_instance.render(gl, tick);
		if (_instance.needCleanUp) {
			_instance.free();
			_instance = null;
		}
		this.afterRender(gl);
	};

	CloudWeatherEffect.stop = function stop(ownerAID, tick) {
		if (!_instance) return;
		var now = tick || Renderer.tick;
		if (_instance.endTick === -1) {
			_isStopping = true;
			_instance.endTick = now + FADEOUT_TAIL_MS;
		}
	};

	CloudWeatherEffect.prototype.init = function init(now) {
		var gl = Renderer.getContext();
		this._display = true;
		this._color = this._profile.cloudColor;

		if (!this._textures.length && this._display) {
			var files = (this.effectID === 233) 
				? ['fog1', 'fog2', 'fog3'] 
				: ['cloud4', 'cloud1', 'cloud2'];

			this._textures.length = files.length;
			for (var i = 0; i < files.length; i++) {
				this.loadCloudTexture(gl, i, files[i]);
			}
		}
		this.setUpCloudData(now);
	};
	
	CloudWeatherEffect.prototype.loadCloudTexture = function loadCloudTexture(gl, i, fileName) {
		var self = this;
		Client.loadFile('data/texture/effect/' + fileName + '.tga', function (buffer) {
			WebGL.texture(gl, buffer, function (texture) {
				self._textures[i] = texture;
			});
		});
	};

	CloudWeatherEffect.prototype.setUpCloudData = function setUpCloudData(now) {
		for (var i = 0; i < this._profile.maxClouds; i++) {
			if (!this._clouds[i]) {
				this._clouds[i] = {
					position: vec3.create(),
					direction: vec3.create(),
					born_tick: 0,
					death_tick: 0
				};
			}
			this.cloudInit(this._clouds[i], now);
			this._clouds[i].sprite = (Math.random() * (this._textures.length - 1)) | 0;
			this._clouds[i].death_tick = this._clouds[i].born_tick + Math.random() * 8000;
			this._clouds[i].born_tick -= 2000;
		}

		this._clouds.sort(function (a, b) {
			return a.sprite - b.sprite;
		});
	};

	CloudWeatherEffect.prototype.cloudInit = function cloudInit(cloud, now) {
		var pos = Session.Entity.position;
		var area = this._profile.area;
		var speed = this._profile.speed;

		cloud.position[0] = pos[0] + (Math.random() * area | 0) * (Math.random() > 0.5 ? 1 : -1);
		cloud.position[1] = pos[1] + (Math.random() * area | 0) * (Math.random() > 0.5 ? 1 : -1);
		cloud.position[2] = -10;

		cloud.direction[0] = (Math.random() * 2 - 1) * speed;
		cloud.direction[1] = (Math.random() * 2 - 1) * speed;
		cloud.direction[2] = (Math.random() * 0.1 - 0.05) * speed;

		cloud.born_tick = cloud.death_tick ? cloud.death_tick + 2000 : now;
		cloud.death_tick = cloud.born_tick + 6000;
	};


	CloudWeatherEffect.prototype.render = function render(gl, tick) {
		if (!this._display) return;

		if (this.endTick > 0 && tick >= this.endTick) {
			this.needCleanUp = true;
			return;
		}

		SpriteRenderer.color.set(this._color);
		SpriteRenderer.shadow = 1.0;
		SpriteRenderer.angle = 0;
		SpriteRenderer.size[0] = 1000;
		SpriteRenderer.size[1] = 1000;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.depth = 0;

		var max = this._profile.maxClouds;
		var overlay = this._profile.overlay;
		var zindex = this._profile.zindex;

		for (var i = 0; i < max; i++) {
			var cloud = this._clouds[i];
			var opacity;

			// Appear  
			if (cloud.born_tick + 1000 > tick) {
				opacity = Math.min((tick - cloud.born_tick) / 1000, this._color[3]);
			}
			// Remove  
			else if (cloud.death_tick + 2000 < tick) {
				this.cloudInit(cloud, tick);
				opacity = 0.0;
			}
			// Disappear  
			else if (cloud.death_tick < tick) {
				opacity = this._color[3] - (tick - cloud.death_tick) / 2000;
			}
			// Default  
			else {
				opacity = this._color[3];
			}

			SpriteRenderer.zIndex = zindex;
			SpriteRenderer.color[3] = opacity;
			SpriteRenderer.image.texture = this._textures[cloud.sprite];

			vec3.add(cloud.position, cloud.position, cloud.direction);
			SpriteRenderer.position.set(cloud.position);

			SpriteRenderer.setDepth(!overlay, false, !overlay, function () {
				SpriteRenderer.render();
			});
		}
	};

	/**  
	 * Cleanup  
	 */
	CloudWeatherEffect.prototype.free = function free() {
		this._clouds = null;
		this._textures = null;
		this._color = null;
	};

	return CloudWeatherEffect;
});
