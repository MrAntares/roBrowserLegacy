/**
 * Renderer/Effects/RainWeather.js
 *
 * Weather rain effect (EF_RAIN).
 * Procedural multi‑layer rain designed for aesthetic depth:
 * - Looping emitter pinned to the owning entity (usually local player).
 * - Coherent, slowly‑varying wind so streaks slant consistently.
 * - Three depth layers (far/mid/near) with different speeds, sizes, and opacity.
 * - Alpha fades by fall progress (not raw time) to avoid popping.
* - Added procedural audio system for Rain and Thunder (Web Audio API).
* - Added lightning visual effect using the existing overlay system.
 */
define(function(require) {
	'use strict';

	var Renderer       = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Altitude       = require('Renderer/Map/Altitude');
	var Camera         = require('Renderer/Camera');
	var Preferences    = require('Preferences/Audio');
	var Session        = require('Engine/SessionStorage');
	var getModule = require;

	var RAG_TICK_MS = 25;
	var FADEOUT_TAIL_MS = 100 * RAG_TICK_MS;

	// Emission control.
	var EMIT_PER_TICK = 10;
	var EMIT_STOP_BEFORE_END_MS = 160 * RAG_TICK_MS;
	var MAX_DROPS = 1100;

	// Spawn volume around player (in map cells). Large enough to cover the view.
	var SCATTER_RADIUS_CELLS = 70;
	var SPAWN_HEIGHT_MIN_CELLS = 22;
	var SPAWN_HEIGHT_MAX_CELLS = 42;

	// Base wind, slowly varying over time (cells per rag tick).
	var WIND_STRENGTH_BASE = 0.14;
	var WIND_STRENGTH_VAR = 0.06;
	var WIND_ANGLE_MAX_RAD = 0.55; // ~31deg sideways

	// Thunderstorm
	var THUNDER_MIN_INTERVAL = 5000;
	var THUNDER_MAX_INTERVAL = 60000;
	var FLASH_FADE_IN = 50;
	var FLASH_FADE_OUT = 300;
	var RAIN_VOLUME = 0.03;

	// Depth layers: far/mid/near.
	// Each layer defines relative look and speed.
	var LAYERS = [
		{
			weight: 0.55,
			speedTick: [0.35, 0.55],
			widthPx: [1.0, 1.8],
			lengthPx: [22, 36],
			alphaScale: 0.12,
			brightness: [0.45, 0.65]
		},
		{
			weight: 0.30,
			speedTick: [0.55, 0.85],
			widthPx: [1.6, 2.6],
			lengthPx: [36, 55],
			alphaScale: 0.22,
			brightness: [0.65, 0.85]
		},
		{
			weight: 0.15,
			speedTick: [0.85, 1.25],
			widthPx: [2.3, 3.4],
			lengthPx: [55, 78],
			alphaScale: 0.35,
			brightness: [0.80, 1.00]
		}
	];

	// Precompute CDF for layer picking.
	var _layerCDF = (function() {
		var out = [];
		var acc = 0;
		for (var i = 0; i < LAYERS.length; i++) {
			acc += LAYERS[i].weight;
			out.push(acc);
		}
		return out;
	})();

	// Procedural raindrop sprite (1x16 alpha‑gradient texture stretched into streaks).
	var _dropFrame = null;
	// Full-screen grey filter (1x1 texture).
	var _filterFrame = null;
	// Ground splash texture (16x16 soft disc).
	var _splashFrame = null;
	var SPLASH_LIFE_MS = 220;
	var SPLASH_SIZE_PX = [10, 18];
	var SPLASH_ALPHA = 0.45;

	// SINGLETON STATE
	let _instance = null;
	let _mapName = '';

	function ensureDropFrame(gl) {
		if (_dropFrame && _dropFrame.texture && gl.isTexture(_dropFrame.texture)) {
			return;
		}

		_dropFrame = null;
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);

		// Build a 1x16 vertical gradient (top transparent → bright core → soft tail).
		var h = 16;
		var data = new Uint8Array(h * 4);
		for (var i = 0; i < h; i++) {
			var t = i / (h - 1);
			// Ramp up to full alpha, then taper slightly.
			var a = Math.min(1, t / 0.7);
			if (t > 0.7) {
				a *= 1 - (t - 0.7) / 0.3 * 0.35;
			}
			var alphaByte = Math.max(0, Math.min(255, Math.floor(a * 255)));
			var idx = i * 4;
			data[idx + 0] = 255;
			data[idx + 1] = 255;
			data[idx + 2] = 255;
			data[idx + 3] = alphaByte;
		}

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			h,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			data
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		_dropFrame = { texture: tex, width: 1, height: h, type: 1 };
	}

	function ensureFilterFrame(gl) {
		if (_filterFrame && _filterFrame.texture && gl.isTexture(_filterFrame.texture)) {
			return;
		}
		_filterFrame = null;

		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255, 255])
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		_filterFrame = { texture: tex, width: 1, height: 1, type: 1 };
	}

	function ensureSplashFrame(gl) {
		if (_splashFrame && _splashFrame.texture && gl.isTexture(_splashFrame.texture)) {
			return;
		}
		_splashFrame = null;

		var w = 16, h = 16;
		var data = new Uint8Array(w * h * 4);
		var cx = (w - 1) / 2;
		var cy = (h - 1) / 2;
		var maxR = Math.min(cx, cy);

		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var dx = x - cx;
				var dy = y - cy;
				var r = Math.sqrt(dx * dx + dy * dy) / maxR;
				var a = 0;
				if (r <= 1) {
					// Soft disc with slight ring emphasis.
					a = Math.exp(-r * r * 2.8);
					var ring = Math.exp(-Math.pow((r - 0.65) / 0.12, 2));
					a = Math.max(a, ring * 0.9);
				}
				var alphaByte = Math.max(0, Math.min(255, Math.floor(a * 255)));
				var idx = (y * w + x) * 4;
				data[idx + 0] = 255;
				data[idx + 1] = 255;
				data[idx + 2] = 255;
				data[idx + 3] = alphaByte;
			}
		}

		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		_splashFrame = { texture: tex, width: w, height: h, type: 1 };
	}

	function randRange(min, max) {
		return min + Math.random() * (max - min);
	}

	function pickLayerIndex() {
		var r = Math.random() * _layerCDF[_layerCDF.length - 1];
		for (var i = 0; i < _layerCDF.length; i++) {
			if (r <= _layerCDF[i]) {
				return i;
			}
		}
		return _layerCDF.length - 1;
	}

	function computeGlobalWind(tick) {
		// Slow oscillation: changes over ~10s.
		var t = tick * 0.00012;
		var strengthTick = WIND_STRENGTH_BASE + WIND_STRENGTH_VAR * Math.sin(t * 2.3);
		var angleCam = Math.sin(t * 1.1) * WIND_ANGLE_MAX_RAD;
		var camXTick = Math.cos(angleCam) * strengthTick;
		var camYTick = Math.sin(angleCam) * strengthTick * 0.35;

		// Convert camera‑space wind to world‑space so on‑screen direction stays consistent
		// even when the camera rotates.
		var yawRad = (Camera.angle && Camera.angle[1] || 0) * Math.PI / 180;
		var cosYaw = Math.cos(yawRad);
		var sinYaw = Math.sin(yawRad);
		var xTick = camXTick * cosYaw + camYTick * sinYaw;
		var yTick = -camXTick * sinYaw + camYTick * cosYaw;
		return {
			camXTick: camXTick,
			camYTick: camYTick,
			xTick: xTick,
			yTick: yTick,
			xMs: xTick / RAG_TICK_MS,
			yMs: yTick / RAG_TICK_MS
		};
	}

	/**
	 * Compute the on‑screen tilt for a raindrop so the streak aligns with its
	 * projected movement direction under the current camera pitch/yaw.
	 *
	 * We transform the drop velocity into the same "map coords" used by the
	 * SpriteRenderer Project() helper (x, -z, y), then into view space via
	 * Camera.modelView. The streak axis is SpriteRenderer +Y, so the angle is
	 * atan2(vx_view, vy_view).
	 */
	function computeDropTilt(vx, vy, speedMs) {
		// Velocity in world coords (cells/ms). Falling decreases world Z.
		var vz = -speedMs;

		// Convert to map coords expected by Camera.modelView / Project().
		var mx = vx;
		var my = -vz; // = speedMs, positive when falling down.
		var mz = vy;

		var m = Camera.modelView;
		if (!m) {
			return 0;
		}

		// View‑space velocity (w=0 ignores translation).
		var vxView = m[0] * mx + m[4] * my + m[8]  * mz;
		var vyView = m[1] * mx + m[5] * my + m[9]  * mz;

		if (Math.abs(vxView) < 0.000001 && Math.abs(vyView) < 0.000001) {
			return 0;
		}

		return Math.atan2(vxView, vyView) * 180 / Math.PI;
	}

	function RainWeatherEffect(Params) {
		this.effectID = Params.Inst.effectID;
		this.ownerAID = Params.Init.ownerAID;
		this.startTick = Params.Inst.startTick;
		this.endTick = Params.Inst.endTick; // -1 for infinite

		this.lastEmitTick = this.startTick;
		this.drops = [];
		this.splashes = [];

		this._wind = { xTick: 0, yTick: 0, xMs: 0, yMs: 0 };

		// --- Thunderstorm ---
		this.nextLightningTime = Date.now() + randRange(THUNDER_MIN_INTERVAL, THUNDER_MAX_INTERVAL);
		this.isFlashing = false;
		this.flashStartTime = 0;
		this.flashMultiCount = 1; // Double thunders
		this.audioCtx = null;
		this.rainNode = null;
		this.audioResumed = false;

		// Try start audio feature
		try {
			var AudioContext = window.AudioContext || window.webkitAudioContext;
			if (AudioContext) {
				this.audioCtx = new AudioContext();
				this.initRainSound();
			}
		} catch (e) {
			console.warn("RainWeather: Web Audio API is not supported", e);
		}

		this.ready = true;
		this.needCleanUp = false;
	}

	RainWeatherEffect.prototype.initRainSound = function () {
		if (!this.audioCtx) return;

		if (!Preferences.Sound.play) return;

		var ctx = this.audioCtx;
		var bufferSize = 2 * ctx.sampleRate;
		var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		var output = buffer.getChannelData(0);

		// Generate white noise
		for (var i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
		}

		var whiteNoise = ctx.createBufferSource();
		whiteNoise.buffer = buffer;
		whiteNoise.loop = true;

		// Low pass filter
		var rainFilter = ctx.createBiquadFilter();
		rainFilter.type = 'lowpass';
		rainFilter.frequency.value = 400; 

		var gainNode = ctx.createGain();
		gainNode.gain.value = RAIN_VOLUME * Preferences.Sound.volume;  

		whiteNoise.connect(rainFilter);
		rainFilter.connect(gainNode);
		gainNode.connect(ctx.destination);

		whiteNoise.start(0);
		this.rainNode = whiteNoise;
	};

	RainWeatherEffect.prototype.triggerRainDropSound = function () {
		if (!this.audioCtx) return;

		if (!Preferences.Sound.play) return;

		const ctx = this.audioCtx;

		if (ctx.state === 'suspended') {
			ctx.resume();
		}

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const now = ctx.currentTime;

		osc.frequency.value = randRange(1000, 1200); // Plink Frequency
		osc.type = 'sine';

		osc.connect(gain);
		gain.connect(ctx.destination);

		const duration = 0.01; // Plink duration
		const peakVolume = randRange(0.1, RAIN_VOLUME) * Preferences.Sound.volume; 

		gain.gain.setValueAtTime(0, now);
		// Fast attach
		gain.gain.linearRampToValueAtTime(peakVolume, now + 0.001);
		gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

		// Start and End
		osc.start(now);
		osc.stop(now + duration + 0.01);
		
		//clean afteruse
		setTimeout(() => {
			try {
				osc.disconnect();
				gain.disconnect();
			} catch (e) { /* Ignore */ }
		}, duration * 1000 + 50);
	};

	RainWeatherEffect.prototype.triggerThunderSound = function () {
		if (!this.audioCtx) return;

		if (!Preferences.Sound.play) return;

		// Browser can block audio interactions, try to resume it.
		if (this.audioCtx.state === 'suspended') {
			this.audioCtx.resume();
		}

		var ctx = this.audioCtx;
		var bufferSize = ctx.sampleRate * 2;
		var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		var data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize);
		}

		var source = ctx.createBufferSource();
		source.buffer = buffer;

		var filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 300;

		// add gain to thunderstorm
		var thunderGain = ctx.createGain();
		thunderGain.gain.setValueAtTime(0.8 * Preferences.Sound.volume, ctx.currentTime);
		thunderGain.gain.exponentialRampToValueAtTime(0.01 * Preferences.Sound.volume, ctx.currentTime + 1.5);

		source.connect(filter);
		filter.connect(thunderGain);
		thunderGain.connect(ctx.destination);

		source.start();
	};

	RainWeatherEffect.ready = true;
	RainWeatherEffect.renderBeforeEntities = false;

	RainWeatherEffect.beforeRender = function beforeRender(gl, modelView, projection, fog) {
		gl.disable(gl.DEPTH_TEST);
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);
		SpriteRenderer.disableDepthCorrection = true;
		SpriteRenderer.setDepthMask(false);
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.depth = 0;
		SpriteRenderer.zIndex = 0;
	};

	RainWeatherEffect.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		SpriteRenderer.setDepthMask(true);
		gl.enable(gl.DEPTH_TEST);
		SpriteRenderer.disableDepthCorrection = false;
		SpriteRenderer.unbind(gl);
	};

	RainWeatherEffect.startOrRestart = function startOrRestart(Params) {
		var ownerAID = Params.Init.ownerAID;
		var now = Params.Inst.startTick || Renderer.tick;

		if (_mapName !== currentMap) {
			_instance = null;
			_mapName = currentMap;
		}

		if (_instance && !_instance.needCleanUp) {
			if (_instance.endTick > 0) {
				_instance.endTick = -1;
				_instance.lastEmitTick = now;
			}
			return _instance;
		}

		_instance = new RainWeatherEffect(Params);
		_mapName = currentMap;
		return _instance;
	};

	RainWeatherEffect.renderAll = function renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) return;

		// Clean up if map changed
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

	RainWeatherEffect.stop = function stop(ownerAID, tick) {
		if (!_instance) return;

		var now = tick || Renderer.tick;
		if (_instance.endTick === -1) {
			_instance.endTick = now + FADEOUT_TAIL_MS;
		}
	};

	RainWeatherEffect.prototype.spawnDrop = function spawnDrop(spawnTick) {
		if (!Session.Entity) {
			return;
		}

		var layerIndex = pickLayerIndex();
		var layer = LAYERS[layerIndex];

		var px = Session.Entity.position[0];
		var py = Session.Entity.position[1];

		var theta = Math.random() * Math.PI * 2;
		var radius = Math.random() * SCATTER_RADIUS_CELLS;
		var ox = Math.cos(theta) * radius;
		var oy = Math.sin(theta) * radius;

		// Shift spawn slightly upwind so streaks drift through view.
		var spawnHeight = randRange(SPAWN_HEIGHT_MIN_CELLS, SPAWN_HEIGHT_MAX_CELLS);
		var upwindX = -this._wind.xTick * spawnHeight * 0.6;
		var upwindY = -this._wind.yTick * spawnHeight * 0.6;

		var x = px + ox + upwindX;
		var y = py + oy + upwindY;

		var groundZ = Altitude.getCellHeight(x, y);
		var z = groundZ + spawnHeight;

		// Per-drop speed / size.
		var speedTick = randRange(layer.speedTick[0], layer.speedTick[1]);
		var speedMs = speedTick / RAG_TICK_MS;
		var widthPx = randRange(layer.widthPx[0], layer.widthPx[1]);
		var lengthPx = randRange(layer.lengthPx[0], layer.lengthPx[1]);

		// Small per-drop wind jitter around global wind.
		var windJitterXMs = (Math.random() - 0.5) * 0.002;
		var windJitterYMs = (Math.random() - 0.5) * 0.002;

		// Per-drop tilt jitter (base tilt computed each frame for camera correctness).
		var tiltJitter = randRange(-4, 4);

		this.drops.push({
			spawnTick: spawnTick,
			x: x,
			y: y,
			z: z,
			spawnZ: z,
			groundZ: groundZ,
			speedMs: speedMs,
			windJitterXMs: windJitterXMs,
			windJitterYMs: windJitterYMs,
			tiltJitter: tiltJitter,
			widthPx: widthPx,
			lengthPx: lengthPx,
			alphaScale: layer.alphaScale,
			brightness: randRange(layer.brightness[0], layer.brightness[1]),
			flicker: Math.random() * 1000
		});

		if (this.drops.length > MAX_DROPS) {
			this.drops.splice(0, this.drops.length - MAX_DROPS);
		}
	};

	RainWeatherEffect.prototype.render = function render(gl, tick) {
		if (!Session.Entity) return;

		ensureDropFrame(gl);
		ensureFilterFrame(gl);
		ensureSplashFrame(gl);
		if (!_dropFrame) {
			return;
		}

		// Update global wind for this frame.
		this._wind = computeGlobalWind(tick);

		// --- ThunderStorm system (Visual and Sound) ---
		var now = Date.now();

		// check if need to flash on thunderstorm
		if (!this.isFlashing && now >= this.nextLightningTime) {
			this.triggerThunderSound();
			this.isFlashing = true;
			this.flashStartTime = now;
			// 40% chance of double storm
			this.flashMultiCount = Math.random() > 0.6 ? 2 : 1;
			this.nextLightningTime = now + randRange(THUNDER_MIN_INTERVAL, THUNDER_MAX_INTERVAL);
		}

		// common grey filter
		var overlayR = 0.65;
		var overlayG = 0.67;
		var overlayB = 0.70;
		var overlayA = 0.14;

		// flash filter
		if (this.isFlashing) {
			var elapsed = now - this.flashStartTime;
			var flashAlpha = 0;

			if (this.flashMultiCount === 2) {
				// --- Double Flash (Strobe) ---
				// 0-80ms: First flash is faster
				if (elapsed < 80) {
					flashAlpha = 0.6 * (1 - (elapsed / 80));
				}
				// 80-160ms: darker (dramatic pause)
				else if (elapsed < 160) {
					flashAlpha = 0;
				}
				// 160ms+: Another Flash (Main)
				else {
					var elapsed2 = elapsed - 160;
					if (elapsed2 < FLASH_FADE_IN) {
						flashAlpha = (elapsed2 / FLASH_FADE_IN) * 0.8;
					} else if (elapsed2 < (FLASH_FADE_IN + FLASH_FADE_OUT)) {
						var p = (elapsed2 - FLASH_FADE_IN) / FLASH_FADE_OUT;
						flashAlpha = 0.8 * (1 - p);
					} else {
						this.isFlashing = false;
					}
				}
			} else {
				// --- FLASH (Default) ---
				if (elapsed < FLASH_FADE_IN) {
					// Fade In
					flashAlpha = (elapsed / FLASH_FADE_IN) * 0.8;
				} else if (elapsed < (FLASH_FADE_IN + FLASH_FADE_OUT)) {
					// Fade Out
					var p = (elapsed - FLASH_FADE_IN) / FLASH_FADE_OUT;
					flashAlpha = 0.8 * (1 - p);
				} else {
					// end
					this.isFlashing = false;
				}
			}

			if (this.isFlashing) {
				// Thunder collor white blue
				overlayR = 0.90;
				overlayG = 0.95;
				overlayB = 1.00;
				overlayA = flashAlpha;
			}
		}

		// Renderize filter (Thunderstorm)
		if (_filterFrame) {
			// skip rain fade out to visual storm 
			if (this.endTick > 0 && !this.isFlashing) {
				var tail = Math.max(0, Math.min(1, (this.endTick - tick) / FADEOUT_TAIL_MS));
				overlayA *= tail;
			}

			SpriteRenderer.image.palette = null;
			SpriteRenderer.sprite = _filterFrame;
			SpriteRenderer.image.texture = _filterFrame.texture;
			SpriteRenderer.position[0] = Session.Entity.position[0];
			SpriteRenderer.position[1] = Session.Entity.position[1];
			SpriteRenderer.position[2] = Session.Entity.position[2];
			SpriteRenderer.zIndex = -1000;

			SpriteRenderer.color[0] = overlayR;
			SpriteRenderer.color[1] = overlayG;
			SpriteRenderer.color[2] = overlayB;
			SpriteRenderer.color[3] = overlayA;

			SpriteRenderer.angle = 0;
			SpriteRenderer.size[0] = 6000;
			SpriteRenderer.size[1] = 6000;
			SpriteRenderer.offset[0] = 0;
			SpriteRenderer.offset[1] = 0;
			SpriteRenderer.render(false);
		}

		// Effect lifetime / emission gating.
		var remaining = Infinity;
		if (this.endTick > 0) {
			remaining = this.endTick - tick;
			if (remaining <= 0) {
				this.needCleanUp = true;
				return;
			}
		}

		var allowEmit = remaining > EMIT_STOP_BEFORE_END_MS;
		if (allowEmit) {
			var ticksToEmit = Math.floor((tick - this.lastEmitTick) / RAG_TICK_MS);
			if (ticksToEmit > 0) {
				for (var i = 0; i < ticksToEmit; i++) {
					var emitTick = this.lastEmitTick + i * RAG_TICK_MS;
					for (var e = 0; e < EMIT_PER_TICK; e++) {
						this.spawnDrop(emitTick);
					}
				}
				this.lastEmitTick += ticksToEmit * RAG_TICK_MS;
			}
		}

		for (var d = this.drops.length - 1; d >= 0; d--) {
			var drop = this.drops[d];
			var age = tick - drop.spawnTick;

			// Ended or hit ground.
			if (drop.z <= drop.groundZ + 0.05) {
				// Spawn a small splash on impact (biased toward nearer layers).
				if (_splashFrame && Math.random() < drop.alphaScale * 0.6) {
					this.splashes.push({
						x: drop.x,
						y: drop.y,
						z: drop.groundZ + 0.02,
						startTick: tick,
						lifeMs: SPLASH_LIFE_MS,
						maxSizePx: randRange(SPLASH_SIZE_PX[0], SPLASH_SIZE_PX[1]),
						angle: drop.angle * 0.2
					});
					if (this.splashes.length > 300) {
						this.splashes.splice(0, this.splashes.length - 300);
					}
					this.triggerRainDropSound();  // call water sound
				}
				this.drops.splice(d, 1);
				continue;
			}

			var dt = tick - (drop._lastTick || drop.spawnTick);
			drop._lastTick = tick;

			// Update fall + coherent wind drift. Drift is recomputed from the current
			// global wind so on-screen slant stays stable under camera rotation.
			var windXMs = this._wind.xMs + (drop.windJitterXMs || 0);
			var windYMs = this._wind.yMs + (drop.windJitterYMs || 0);

			drop.z -= drop.speedMs * dt;
			drop.x += windXMs * dt;
			drop.y += windYMs * dt;

			// Progress through fall (0..1).
			var denom = (drop.spawnZ - drop.groundZ);
			var progress = denom > 0.0001 ? (drop.spawnZ - drop.z) / denom : 0;
			if (progress < 0) progress = 0;
			if (progress > 1) progress = 1;

			// Fade by progress to avoid popping.
			var alpha = drop.alphaScale;
			if (progress < 0.08) {
				alpha *= progress / 0.08;
			} else if (progress > 0.85) {
				alpha *= (1 - progress) / 0.15;
			}

			// Gentle shimmer for life.
			alpha *= 0.9 + 0.1 * Math.sin((tick + drop.flicker) * 0.015);

			SpriteRenderer.position[0] = drop.x;
			SpriteRenderer.position[1] = drop.y;
			SpriteRenderer.position[2] = drop.z;
			SpriteRenderer.zIndex = 0;

			SpriteRenderer.image.palette = null;
			SpriteRenderer.sprite = _dropFrame;
			SpriteRenderer.image.texture = _dropFrame.texture;
			SpriteRenderer.color[0] = 0.60 * drop.brightness;
			SpriteRenderer.color[1] = 0.72 * drop.brightness;
			SpriteRenderer.color[2] = 1.00 * drop.brightness;
			SpriteRenderer.color[3] = alpha;
			SpriteRenderer.angle = computeDropTilt(windXMs, windYMs, drop.speedMs) + (drop.tiltJitter || 0);
			SpriteRenderer.size[0] = drop.widthPx;
			SpriteRenderer.size[1] = drop.lengthPx;
			SpriteRenderer.offset[0] = 0;
			SpriteRenderer.offset[1] = 0;

			SpriteRenderer.render(false);
		}

		// Render splashes after drops so they sit on top of the ground.
		if (_splashFrame && this.splashes.length) {
			for (var s = this.splashes.length - 1; s >= 0; s--) {
				var splash = this.splashes[s];
				var splashAge = tick - splash.startTick;
				if (splashAge >= splash.lifeMs) {
					this.splashes.splice(s, 1);
					continue;
				}

				var sp = splashAge / splash.lifeMs;
				var splashAlpha = SPLASH_ALPHA * (1 - sp);
				var splashSize = splash.maxSizePx * (0.6 + sp * 0.8);

				SpriteRenderer.image.palette = null;
				SpriteRenderer.sprite = _splashFrame;
				SpriteRenderer.image.texture = _splashFrame.texture;
				SpriteRenderer.position[0] = splash.x;
				SpriteRenderer.position[1] = splash.y;
				SpriteRenderer.position[2] = splash.z;
				SpriteRenderer.zIndex = 0;
				SpriteRenderer.color[0] = 0.75;
				SpriteRenderer.color[1] = 0.80;
				SpriteRenderer.color[2] = 0.90;
				SpriteRenderer.color[3] = splashAlpha;
				SpriteRenderer.angle = splash.angle;
				SpriteRenderer.size[0] = splashSize;
				SpriteRenderer.size[1] = splashSize;
				SpriteRenderer.offset[0] = 0;
				SpriteRenderer.offset[1] = 0;
				SpriteRenderer.render(false);
			}
		}
	};

	RainWeatherEffect.prototype.free = function free() {
		// Clean thunder audio
		if (this.audioCtx) {
			try {
				if (this.rainNode) {
					this.rainNode.stop();
					this.rainNode = null;
				}
				this.audioCtx.close();
				this.audioCtx = null;
			} catch (e) { console.log(e); }
		}

		this.ready = false;
	};

	return RainWeatherEffect;
});
