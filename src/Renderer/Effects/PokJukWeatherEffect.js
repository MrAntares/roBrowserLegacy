/**
 * Renderer/Effects/PokJukWeatherEffect.js
 *
 * Fireworks Effect (PokJuk) adapted from C++ CEffectPrim::PrimPokJuk.
 * Logic:
 * 1. Ascent Phase: The projectile rises with negative gravity.
 * 2. Explosion Phase: Upon reaching the time limit, the particles expand 360 degrees.
 * 3. Tail: Maintains previous positions to draw the ascent trail.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var Renderer = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Session = require('Engine/SessionStorage');
	var Sound = require('Audio/SoundManager');
	var getModule = require;

	// SINGLETON STATE
	let _instance = null;
	let _mapName = '';
	let _whiteTexture = null;

	// Explosion height in game units
	var EXPLOSION_ALTITUDE = 8.0;
	var PARTICLE_SIZE = 6;

	var FIRE_LIFE_MS = 50;
	var EXPLOSION_LIFE_MS = 1000;

	function PokJukWeatherEffect(Params) {
		this.fireworks = [];
		this.init(Params);
	}

	PokJukWeatherEffect.isActive = function isActive() {
		return _instance;
	};

	PokJukWeatherEffect.prototype.createInternalTexture = function (gl) {
		if (_whiteTexture) return;

		var canvas = document.createElement('canvas');
		canvas.width = PARTICLE_SIZE;
		canvas.height = PARTICLE_SIZE;
		var ctx = canvas.getContext('2d');

		var center = PARTICLE_SIZE / 2;
		var radius = center - 1;

		ctx.clearRect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);

		var gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
		gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

		ctx.beginPath();
		ctx.arc(center, center, radius, 0, Math.PI * 2);
		ctx.fillStyle = gradient;
		ctx.fill();

		_whiteTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, _whiteTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	};

	PokJukWeatherEffect.prototype.init = function (Params) {
		if (!Session.Entity) return;
		var pPos = Session.Entity.position;

		// Spawn random number of fireworks (1 or 3)
		var numFireworks = Math.floor(Math.random() * 3) + 1;
		for (var ec = 0; ec < numFireworks; ec++) {
			var firework = this.createFirework(pPos);
			firework.process -= ec * 100;
			this.fireworks.push(firework);
		}
	};

	PokJukWeatherEffect.startOrRestart = function startOrRestart(Params) {
		var currentMap = getModule('Renderer/MapRenderer').currentMap;

		if (_mapName !== currentMap || !_instance) {
			_instance = new PokJukWeatherEffect(Params);
			_mapName = currentMap;
		}

		return _instance;
	};

	PokJukWeatherEffect.prototype.createFirework = function () {
		var pPos = Session.Entity.position;
		return {
			process: -(600 + Math.floor(Math.random() * 400)),
			// Start near player
			posNow: [pPos[0] + (Math.random() * 20 - 10), pPos[1] + (Math.random() * 20 - 10), pPos[2]],
			horizontalDrift: [Math.random() * 0.02 - 0.01, Math.random() * 0.02 - 0.01],
			startAlt: pPos[2],
			alpha: 0,
			colorType: Math.floor(Math.random() * 5),
			state: 0, // 0: Ascent, 1: Explosion
			particles: [],
			size: PARTICLE_SIZE,
			arcDirection: Math.random() > 0.5 ? 1 : -1, // 1 = right, -1 = left
			arcAmplitude: 3 + Math.random() * 2,
			arcPhase: 0,
			explosionTimer: 0,
			lastWaveTime: 0,
			isExploding: false
		};
	};

	PokJukWeatherEffect.renderAll = function renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) return;

		if (_mapName !== getModule('Renderer/MapRenderer').currentMap) {
			_instance = null;
			return;
		}

		// Ensure the internal texture exists before drawing
		_instance.createInternalTexture(gl);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending

		SpriteRenderer.runWithDepth(false, false, true, function () {
			_instance.render(gl, tick);
		});

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	PokJukWeatherEffect.prototype.render = function (gl, tick) {
		for (var i = 0; i < this.fireworks.length; i++) {
			var fw = this.fireworks[i];
			this.updateFirework(fw);
			this.drawFirework(fw);
		}
	};

	PokJukWeatherEffect.prototype.updateFirework = function (fw) {
		fw.process++;

		// Launch sound
		if (fw.process === 1) {
			Sound.play('effect/\xc6\xf8\xc1\xd7.wav');
		}

		if (fw.process > 0) {
			if (fw.state === 0) {
				// ASCENT PHASE
				fw.posNow[2] += 0.04;
				var ascentProgress = Math.max(0, Math.min(1, (fw.posNow[2] - fw.startAlt) / EXPLOSION_ALTITUDE));
				var arcProgress = Math.pow(Math.max(0, (ascentProgress - 0.3) / 0.7), 2);
				fw.posNow[0] += arcProgress * fw.arcAmplitude * fw.arcDirection * 0.02;
				fw.alpha = Math.floor(Math.min(ascentProgress * 255 * 2, 255));

				// Explode based on altitude relative to start position
				if (fw.posNow[2] - fw.startAlt > EXPLOSION_ALTITUDE) {
					fw.state = 1;
					fw.isExploding = true;
					fw.explosionTimer = 0;
					fw.lastWaveTime = -50;
					// Generate burst particles
					for (var p = 0; p < 30; p++) this.addParticleWave(fw, true);
				}
			} else if (fw.state === 1) {
				// EXPLOSION PHASE
				fw.explosionTimer += 16;
				if (fw.explosionTimer < EXPLOSION_LIFE_MS) {
					if (fw.explosionTimer - fw.lastWaveTime >= FIRE_LIFE_MS) {
						var colorType = Math.floor(Math.random() * 5);
						for (var i = 0; i < 15; i++) this.addParticleWave(fw, false, colorType);
						for (var i = 0; i < 60; i++) this.addParticleWave(fw, true, colorType);
						fw.lastWaveTime = fw.explosionTimer;
					}
				}
				var active = 0;
				for (var j = 0; j < fw.particles.length; j++) {
					var p = fw.particles[j];
					if (p.alpha <= 0) continue;

					p.pos[0] += p.vel[0];
					p.pos[1] += p.vel[1];
					p.pos[2] += p.vel[2];
					p.vel[2] -= 0.003; // Light gravity
					p.alpha -= p.fadeSpeed || 2; // Fade speed
					active++;
				}

				if (active === 0 && fw.explosionTimer > EXPLOSION_LIFE_MS) {
					Object.assign(fw, this.createFirework());
				}
			}
		}
	};

	PokJukWeatherEffect.prototype.addParticleWave = function (fw, isGunpowder, colorType) {
		var phi = Math.random() * Math.PI * 2;
		var theta = Math.random() * Math.PI;
		var speed = isGunpowder ? 0.02 + Math.random() * 0.04 : 0.08 + Math.random() * 0.07;

		var zOffset = isGunpowder ? 0.5 : 0;

		fw.particles.push({
			pos: [fw.posNow[0], fw.posNow[1], fw.posNow[2] + zOffset],
			vel: [
				Math.sin(theta) * Math.cos(phi) * speed,
				Math.sin(theta) * Math.sin(phi) * speed,
				Math.cos(theta) * speed
			],
			alpha: 255,
			size: isGunpowder ? fw.size * 0.4 : fw.size * (0.6 + Math.random() * 0.6),
			colorType: isGunpowder ? -1 : colorType,
			fadeSpeed: isGunpowder ? 6 : 3
		});
	};

	PokJukWeatherEffect.prototype.drawFirework = function (fw) {
		if (fw.process <= 0) return;

		if (fw.state === 0) {
			this.renderParticle(fw.posNow, fw.alpha, 255, 255, 255, fw.size);
		} else {
			for (var i = 0; i < fw.particles.length; i++) {
				var p = fw.particles[i];
				if (p.alpha > 0) {
					var r = 255,
						g = 255,
						b = 255;
					switch (p.colorType) {
						case 0:
							r = 100;
							g = 160;
							b = 255;
							break; // Blue
						case 1:
							r = 255;
							g = 100;
							b = 100;
							break; // Red
						case 2:
							r = 100;
							g = 255;
							b = 100;
							break; // Green
						case 3:
							r = 255;
							g = 255;
							b = 130;
							break; // Yellow
						case 4:
							r = 255;
							g = 130;
							b = 255;
							break; // Pink
						default:
							r = 255;
							g = 255;
							b = 255;
							break; // White (Gunpowder)
					}
					this.renderParticle(p.pos, p.alpha, r, g, b, fw.size);
				}
			}
		}
	};

	PokJukWeatherEffect.prototype.renderParticle = function (pos, alpha, r, g, b, size) {
		SpriteRenderer.position[0] = pos[0];
		SpriteRenderer.position[1] = pos[1];
		SpriteRenderer.position[2] = pos[2];

		SpriteRenderer.color.set([r / 255, g / 255, b / 255, alpha / 255]);
		SpriteRenderer.size[0] = size;
		SpriteRenderer.size[1] = size;

		// Use the procedurally generated texture
		SpriteRenderer.image.texture = _whiteTexture;
		SpriteRenderer.render(false);
	};

	PokJukWeatherEffect.stop = function stop() {
		_instance = null;
		_mapName = '';
	};

	return PokJukWeatherEffect;
});
