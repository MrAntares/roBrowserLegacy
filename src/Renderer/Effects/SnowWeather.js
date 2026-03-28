/**
 * Renderer/Effects/SnowWeather.js
 *
 * Weather snow effect (EF_SNOW) adapted from the original RO client.
 * - Spawns a looping emitter on the owning entity (usually the local player).
 * - Emits 2 flakes per 25ms tick until the last 160 ticks of its lifetime.
 * - Each flake is a no-master particle that falls straight down and fades in/out.
 */
'use strict';

import Client from 'Core/Client';
import Renderer from 'Renderer/Renderer';

let MapRenderer;
import('Renderer/MapRenderer').then(m => MapRenderer = m.default);
import SpriteRenderer from 'Renderer/SpriteRenderer';
import Altitude from 'Renderer/Map/Altitude';
import Session from 'Engine/SessionStorage';

// The official client uses 25ms rag ticks for weather effects.
	let RAG_TICK_MS = 25;
	// Stop() shortens remaining time to ~1000 ticks.
	let FADEOUT_TAIL_MS = 1000 * RAG_TICK_MS;

	// Emitter behavior
	let EMIT_PER_TICK = 2;
	let EMIT_STOP_BEFORE_END_MS = 160 * RAG_TICK_MS;

	// Flake behavior
	let FLAKE_LIFE_MS = 320 * RAG_TICK_MS;
	let FLAKE_FADEIN_MS = 10 * RAG_TICK_MS;
	let FLAKE_FADEOUT_START_MS = (FLAKE_LIFE_MS * 4) / 5; // last 1/5 of life

	// Spatial tuning in map-cell units.
	// Original client scatters within ~300 internal units around the player and spawns ~100 units above ground.
	// roBrowser scales gat/world heights by 0.2 (1 cell ~= 5 internal units), so:
	// 300 / 5 ~= 60 cells radius, 100 / 5 ~= 20 cells height.
	let SCATTER_RADIUS_CELLS = 60;
	let SPAWN_HEIGHT_MIN_CELLS = 18;
	let SPAWN_HEIGHT_MAX_CELLS = 22;

	// Fall speed in cells per rag tick (original -0.5 internal units/tick => 0.1 cells/tick).
	let FALL_SPEED_CELLS_PER_TICK = 0.1;
	let FALL_SPEED_CELLS_PER_MS = FALL_SPEED_CELLS_PER_TICK / RAG_TICK_MS;

	// Official snow assets are stored under the "effect" sprite folder.
	// (Same folder used by ThreeDEffect: data/sprite/ÀÌÆÑÆ®/)
	let SPR_PATH = 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/ef_snow';

	// SINGLETON STATE
	let _instance = null;
	let _mapName = '';
	let _isStopping = false;

	function SnowWeatherEffect(Params) {
		this.effectID = Params.Inst.effectID;
		this.ownerAID = Params.Init.ownerAID;
		this.startTick = Params.Inst.startTick;
		this.endTick = Params.Inst.endTick; // -1 for infinite

		this.lastEmitTick = this.startTick;
		this.flakes = [];

		this.spr = null;
		this.act = null;

		this.ready = true;
		this.needCleanUp = false;
	}

	/**
	 * Active snow effects control.
	 */
	SnowWeatherEffect.ready = true;

	SnowWeatherEffect.isActive = function isActive() {
		return _instance;
	};

	/**
	 * Prepare SpriteRenderer state for snow flakes.
	 * EffectManager calls this once per constructor list each frame.
	 */
	SnowWeatherEffect.beforeRender = function beforeRender(gl, modelView, projection, fog) {
		// Render weather without depth so flakes are always visible.
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.depth = 0;
		SpriteRenderer.zIndex = 0;
	};

	SnowWeatherEffect.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	/**
	 * Start snow for an owner, or reuse/restart an existing one.
	 *
	 * Matches the official client behavior: don't restart while the previous
	 * snow is still running, but if it is in its 300‑tick fade‑out tail, revive it.
	 */
	SnowWeatherEffect.startOrRestart = function startOrRestart(Params) {
		let now = Params.Inst.startTick || Renderer.tick;
		let currentMap = MapRenderer ? MapRenderer.currentMap : '';

		// If map changed, force new instance
		if (_mapName !== currentMap) {
			_instance = null;
			_mapName = currentMap;
		}
		_isStopping = false;
		if (_instance && !_instance.needCleanUp) {
			// If snow is fading out, revive it
			if (_instance.endTick > 0) {
				_instance.endTick = -1;
				_instance.lastEmitTick = now;
			}
			return _instance;
		}

		_instance = new SnowWeatherEffect(Params);
		_mapName = currentMap;
		return _instance;
	};

	SnowWeatherEffect.renderAll = function renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) {
			return;
		}

		// Clean up if map changed abruptly
		if (_mapName !== (MapRenderer ? MapRenderer.currentMap : '')) {
			_instance = null;
			return;
		}

		this.beforeRender(gl, modelView, projection, fog);

		SpriteRenderer.runWithDepth(false, false, true, function () {
			_instance.render(gl, tick);
		});

		if (_instance.needCleanUp) {
			_instance.free();
			_instance = null;
		}

		this.afterRender(gl);
	};

	/**
	 * Fade out snow over the official ~300 ticks.
	 */
	SnowWeatherEffect.stop = function stop(ownerAID, tick) {
		if (!_instance) {
			return;
		}

		let now = tick || Renderer.tick;
		// The render loop will handle the fade out and eventual cleanup.
		if (_instance.endTick === -1) {
			_instance.endTick = now + FADEOUT_TAIL_MS;
			_isStopping = true;
		}
	};

	/**
	 * Spawn a single snowflake around the player.
	 */
	SnowWeatherEffect.prototype.spawnFlake = function spawnFlake(spawnTick) {
		if (!Session.Entity) {
			return;
		}

		let px = Session.Entity.position[0];
		let py = Session.Entity.position[1];

		let theta = Math.random() * Math.PI * 2;
		let radius = Math.random() * SCATTER_RADIUS_CELLS;
		let ox = Math.cos(theta) * radius;
		let oy = Math.sin(theta) * radius;

		let x = px + ox;
		let y = py + oy;

		let groundZ = Altitude.getCellHeight(x, y);
		let spawnHeight = SPAWN_HEIGHT_MIN_CELLS + Math.random() * (SPAWN_HEIGHT_MAX_CELLS - SPAWN_HEIGHT_MIN_CELLS);
		// In RO Browser coordinates, higher altitude is larger Z (falcon gliding adds +Z).
		// Spawn above ground by adding height, then fall by decreasing Z.
		let z = groundZ + spawnHeight;

		this.flakes.push({
			spawnTick: spawnTick,
			x: x,
			y: y,
			z: z,
			size: 0.5 + Math.random() * 0.3
		});
	};

	/**
	 * Render a single layer from the snow sprite.
	 */
	function renderLayer(layer, spr, pal, sizeScale, pos, alpha) {
		if (layer.index < 0) {
			return;
		}

		SpriteRenderer.image.palette = null;
		SpriteRenderer.sprite = spr.frames[layer.index];
		SpriteRenderer.palette = pal.palette;

		let index = layer.index;
		let is_rgba = layer.spr_type === 1 || spr.rgba_index === 0;

		if (!is_rgba) {
			SpriteRenderer.image.palette = pal.texture;
			SpriteRenderer.image.size[0] = 2 * spr.frames[index].width;
			SpriteRenderer.image.size[1] = 2 * spr.frames[index].height;
		} else if (layer.spr_type === 1) {
			index += spr.old_rgba_index;
		}

		let frame = spr.frames[index];
		let width = frame.width * layer.scale[0] * sizeScale;
		let height = frame.height * layer.scale[1] * sizeScale;

		if (layer.is_mirror) {
			width = -width;
		}

		SpriteRenderer.color.set([layer.color[0], layer.color[1], layer.color[2], layer.color[3] * alpha]);

		SpriteRenderer.angle = layer.angle;
		SpriteRenderer.size[0] = width;
		SpriteRenderer.size[1] = height;
		SpriteRenderer.offset[0] = layer.pos[0] + pos[0];
		SpriteRenderer.offset[1] = layer.pos[1] + pos[1];
		SpriteRenderer.xSize = 5;
		SpriteRenderer.ySize = 5;
		SpriteRenderer.image.texture = frame.texture;

		SpriteRenderer.render(false);
	}

	SnowWeatherEffect.prototype.render = function render(gl, tick) {
		if (!Session.Entity) {
			// Don't kill effect just because entity is missing momentarily,
			// but if map changed, we kill it via renderAll check.
			return;
		}
		// Always fetch from Client cache so MemoryManager knows it's still used.
		// This prevents long-lived weather effects from having their SPR textures evicted.
		let spr = Client.loadFile(SPR_PATH + '.spr', null, null, { to_rgba: true });
		let act = Client.loadFile(SPR_PATH + '.act');

		if (!spr || !act) {
			return;
		}

		this.spr = spr;
		this.act = act;

		// Effect lifetime / emission gating.
		let remaining = Infinity;
		if (this.endTick > 0) {
			remaining = this.endTick - tick;
			if (remaining <= 0) {
				this.needCleanUp = true;
				return;
			}
		}

		let allowEmit = remaining > EMIT_STOP_BEFORE_END_MS;
		if (allowEmit) {
			let ticksToEmit = Math.floor((tick - this.lastEmitTick) / RAG_TICK_MS);
			if (ticksToEmit > 0) {
				for (var i = 0; i < ticksToEmit; i++) {
					if (_isStopping) {
						break;
					}
					let emitTick = this.lastEmitTick + i * RAG_TICK_MS;
					this.spawnFlake(emitTick);
					this.spawnFlake(emitTick);
				}
				this.lastEmitTick += ticksToEmit * RAG_TICK_MS;
			}
		}

		// Render flakes
		let action = act.actions[0];
		let frameDelay = Math.max(action.delay || 150, 1);
		let frameCount = action.animations.length || 1;

		for (var f = this.flakes.length - 1; f >= 0; f--) {
			let flake = this.flakes[f];
			let age = tick - flake.spawnTick;

			if (age >= FLAKE_LIFE_MS) {
				this.flakes.splice(f, 1);
				continue;
			}

			// Update fall
			flake.z -= FALL_SPEED_CELLS_PER_MS * (tick - (flake._lastTick || flake.spawnTick));
			flake._lastTick = tick;

			// Alpha fade in/out
			let alpha = 1.0;
			if (age < FLAKE_FADEIN_MS) {
				alpha = age / FLAKE_FADEIN_MS;
			} else if (age > FLAKE_FADEOUT_START_MS) {
				alpha = Math.max(0, 1 - (age - FLAKE_FADEOUT_START_MS) / (FLAKE_LIFE_MS - FLAKE_FADEOUT_START_MS));
			}

			SpriteRenderer.position[0] = flake.x;
			SpriteRenderer.position[1] = flake.y;
			SpriteRenderer.position[2] = flake.z;
			SpriteRenderer.zIndex = 0;

			// Pick animation frame (simple time-based repeat).
			let frameIndex = Math.floor(age / frameDelay) % frameCount;
			let animation = action.animations[frameIndex];

			let layers = animation.layers;
			let pal = spr;
			let pos = [0, 0];
			for (var l = 0; l < layers.length; l++) {
				renderLayer(layers[l], spr, pal, flake.size, pos, alpha);
			}
		}
	};

	SnowWeatherEffect.prototype.free = function free() {
		this.ready = false;
		this.flakes = [];
	};
export default SnowWeatherEffect;