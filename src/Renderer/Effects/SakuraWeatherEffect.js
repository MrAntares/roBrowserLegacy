/**
 * Renderer/Effects/SakuraWeather.js
 *
 * Weather effect for Sakura (Cherry Blossom) and Maple leaves.
 * Adapted from C++ CRagEffect::Sakura/Maple and CEffectPrim::PrimSakura.
 * * Logic features:
 * - Spawns less frequently than snow.
 * - leaves sway back and forth (sine wave movement) rather than falling straight.
 * - Maple leaves fall significantly slower than Sakura petals.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function(require) {
	'use strict';

	var Client         = require('Core/Client');
	var Renderer       = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Altitude       = require('Renderer/Map/Altitude');
	var Session        = require('Engine/SessionStorage');
	var getModule      = require;

	// Constants based on RO Client behavior
	var RAG_TICK_MS = 25;
	var FADEOUT_TAIL_MS = 1000 * RAG_TICK_MS;

	// Emission settings (Reduced quantity compared to snow)
	// Snow is 2 per tick. Sakura/Maple is roughly 1 every 2 calls in C++, so ~1 per 150ms.
	var EMIT_INTERVAL_MS = 150; 
	var EMIT_STOP_BEFORE_END_MS = 160 * RAG_TICK_MS;

	// Lifetime
	var LEAVE_LIFE_MS = 600 * RAG_TICK_MS; // Lasts a bit longer to allow slow falling
	var LEAVE_FADEIN_MS = 20 * RAG_TICK_MS;
	var LEAVE_FADEOUT_START_MS = LEAVE_LIFE_MS * 4 / 5;

	// Spatial constants
	var SCATTER_RADIUS_CELLS = 70;
	var SPAWN_HEIGHT_MIN_CELLS = 32;
	var SPAWN_HEIGHT_MAX_CELLS = 42;

	// Effect IDs
	var EF_SAKURA = 163;
	var EF_MAPLE = 333;

	// Paths
	var PATH_SAKURA = 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/sakura01';
	var PATH_MAPLE  = 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xb4\xdc\xc7\xb3';

	// SINGLETON STATE
	let _instance = null;
	let _mapName = '';
	let _isStopping = false;

	function SakuraWeatherEffect(Params) {
		this.effectID = Params.Inst.effectID;
		this.startTick = Params.Inst.startTick;
		this.endTick = Params.Inst.endTick;

		this.lastEmitTick = this.startTick;
		this.leaves = [];
		this.isMaple = (this.effectID === EF_MAPLE);

		this.spr = null;
		this.act = null;

		this.ready = true;
		this.needCleanUp = false;
	}

	SakuraWeatherEffect.ready = true;

	SakuraWeatherEffect.isActive = function isActive(){ return _instance; };

	SakuraWeatherEffect.beforeRender = function beforeRender(gl, modelView, projection, fog) {
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.depth = 0;
		SpriteRenderer.zIndex = 0;
	};

	SakuraWeatherEffect.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	SakuraWeatherEffect.startOrRestart = function startOrRestart(Params) {
		var now = Params.Inst.startTick || Renderer.tick;
		var currentMap = getModule("Renderer/MapRenderer").currentMap;

		if (_mapName !== currentMap) {
			_instance = null;
			_mapName = currentMap;
		}
		_isStopping = false;
		
		// If instance exists and is valid
		if (_instance && !_instance.needCleanUp) {
			// Check if we are switching from Sakura to Maple or vice versa
			var isNewMaple = (Params.Inst.effectID === EF_MAPLE); 
			if (_instance.isMaple !== isNewMaple) {
				_instance = null; // Force recreate if type changed
			} else {
				if (_instance.endTick > 0) {
					_instance.endTick = -1;
					_instance.lastEmitTick = now;
				}
				return _instance;
			}
		}

		_instance = new SakuraWeatherEffect(Params);
		_mapName = currentMap;
		return _instance;
	};

	SakuraWeatherEffect.renderAll = function renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) return;

		if (_mapName !== getModule("Renderer/MapRenderer").currentMap) {
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

	SakuraWeatherEffect.stop = function stop(ownerAID, tick) {
		if (!_instance) return;
		var now = tick || Renderer.tick;
		if (_instance.endTick === -1) {
			_instance.endTick = now + FADEOUT_TAIL_MS;
			_isStopping = true;
		}
	};

	SakuraWeatherEffect.prototype.spawnLeave = function spawnLeave(spawnTick) {
		if (!Session.Entity) return;

		var px = Session.Entity.position[0];
		var py = Session.Entity.position[1];

		// Random position around player
		var theta = Math.random() * Math.PI * 2;
		var radius = Math.random() * SCATTER_RADIUS_CELLS;
		var x = px + Math.cos(theta) * radius;
		var y = py + Math.sin(theta) * radius;

		var groundZ = Altitude.getCellHeight(x, y);
		var spawnHeight = SPAWN_HEIGHT_MIN_CELLS + Math.random() * (SPAWN_HEIGHT_MAX_CELLS - SPAWN_HEIGHT_MIN_CELLS);
		var z = groundZ + spawnHeight;
		
		// Speed
		// Sakura: (random(2)+2)*0.1f -> 0.2 to 0.3 internal units
		// Maple:  (random(4)+2)*0.03f -> 0.06 to 0.18 internal units (Much slower)
		var fallSpeedBase = this.isMaple 
			? (2 + Math.random() * 4) * 0.03 
			: (2 + Math.random() * 2) * 0.1;
		
		// Convert to roBrowser scale
		// Snow was 0.1 cells/tick. 
		var fallSpeed = fallSpeedBase * 0.5; // Tweak this multiplier to taste

		// Sway Amplitude Factors
		// Sakura: X=0.24, Z=0.30
		// Maple:  X=0.12, Z=0.15
		var swayFactorX = this.isMaple ? 0.12 : 0.24;
		var swayFactorY = this.isMaple ? 0.15 : 0.30;

		this.leaves.push({
			spawnTick: spawnTick,
			x: x, 
			y: y, 
			z: z,
			baseX: x, // Center of the sway
			baseY: y, // Center of the sway
			size: 0.5 + Math.random() * 0.3,
			
			// Movement Props
			speed: fallSpeed,
			swayFacX: swayFactorX,
			swayFacY: swayFactorY,

			// Angle logic from C++
			// angX = current angle, targetX = destination angle
			angX: Math.random() * 360,
			targetX: Math.random() * 360,
			angY: Math.random() * 360, // Maps to C++ Z axis
			targetY: Math.random() * 360,

			_lastTick: spawnTick
		});
	};

	// Logic from CEffectPrim::PrimSakura to update sway angles
	function updateSwayAngle(current, target) {
		if (target > current) {
			current += 3;
			if (current > 359) current = 359;
			if (current > target) {
				// Reached target, pick new random lower target
				target = Math.random() * current;
			}
		} else {
			current -= 2;
			if (current < 0) current = 0;
			if (current <= target) {
				// Reached target, pick new random higher target
				target = 359 - (Math.random() * current); 
			}
		}
		return { c: current, t: target };
	}

	SakuraWeatherEffect.prototype.render = function render(gl, tick) {
		if (!Session.Entity) return;

		var path = this.isMaple ? PATH_MAPLE : PATH_SAKURA;
		var spr = Client.loadFile(path + '.spr', null, null, { to_rgba: true });
		var act = Client.loadFile(path + '.act');

		if (!spr || !act) return;

		// Emission
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
			// Check if enough time passed for next spawn
			if (tick - this.lastEmitTick >= EMIT_INTERVAL_MS) {
				if (!_isStopping) {
					// Spawn 1 leave per interval (reduced quantity)
					this.spawnLeave(tick);
				}
				this.lastEmitTick = tick;
			}
		}

		// Update & Render leaves
		var action = act.actions[0];
		var frameDelay = Math.max(action.delay || 150, 1);
		// Maple acts often have only 1 frame simple rotation, Sakura has animation.
		var frameCount = action.animations.length || 1;

		for (var f = this.leaves.length - 1; f >= 0; f--) {
			var leave = this.leaves[f];
			var age = tick - leave.spawnTick;

			if (age >= LEAVE_LIFE_MS) {
				this.leaves.splice(f, 1);
				continue;
			}
			
			// 1. Update Sway Angles
			var resX = updateSwayAngle(leave.angX, leave.targetX);
			leave.angX = resX.c;
			leave.targetX = resX.t;

			var resY = updateSwayAngle(leave.angY, leave.targetY);
			leave.angY = resY.c;
			leave.targetY = resY.t;

			// 2. Calculate Position
			// Vertical Fall
			var dt = tick - leave._lastTick;
			leave.z -= leave.speed * (dt / RAG_TICK_MS); // Scale speed by delta

			// Horizontal Sway (Sinusoidal offset from base position)
			// RO: vecB_pre.x += factor * sin(angle)
			// This accumulates in C++. Here we can just calculate offset from the "falling line".
			// However, C++ logic adds to the position vector directly. 
			// Let's emulate accumulation or simple offset. Simple offset is smoother for web.
			// But to match the "drifting" feel, we drift the BaseX/Y.
			
			var radX = leave.angX * Math.PI / 180;
			var radY = leave.angY * Math.PI / 180;

			// Drift the center slightly based on wind (Sway Factor)
			var driftX = leave.swayFacX * Math.sin(radX); 
			var driftY = leave.swayFacY * Math.sin(radY);

			// Apply drift to current position
			leave.x += driftX * 0.1; // Scale down for smoothness
			leave.y += driftY * 0.1;

			leave._lastTick = tick;

			// 3. Render
			var alpha = 1.0;

			var alphaCap = 1.0;
			if(!this.isMaple)
				alphaCap = 0.5;

			if (age < LEAVE_FADEIN_MS) {
				alpha = (age / LEAVE_FADEIN_MS) * alphaCap;
			} else if (age > LEAVE_FADEOUT_START_MS) {
				alpha = Math.max(0, (1 - (age - LEAVE_FADEOUT_START_MS) / (LEAVE_LIFE_MS - LEAVE_FADEOUT_START_MS)) * alphaCap);
			}

			SpriteRenderer.position[0] = leave.x;
			SpriteRenderer.position[1] = leave.y;
			SpriteRenderer.position[2] = leave.z;
			SpriteRenderer.zIndex = 0;

			var frameIndex = Math.floor(age / frameDelay) % frameCount;
			var animation = action.animations[frameIndex];
			var layers = animation.layers;
			var pal = spr;
			var pos = [0, 0];

			for (var l = 0; l < layers.length; l++) {
				renderLayer(layers[l], spr, pal, leave.size, pos, alpha);
			}
		}
	};

	SakuraWeatherEffect.prototype.free = function free() {
		this.ready = false;
		this.leaves = [];
	};

	// Helper function for rendering layers
	function renderLayer(layer, spr, pal, sizeScale, pos, alpha) {
		if (layer.index < 0) return;

		SpriteRenderer.image.palette = null;
		SpriteRenderer.sprite = spr.frames[layer.index];
		SpriteRenderer.palette = pal.palette;

		var index = layer.index;
		var is_rgba = layer.spr_type === 1 || spr.rgba_index === 0;

		if (!is_rgba) {
			SpriteRenderer.image.palette = pal.texture;
			SpriteRenderer.image.size[0] = 2 * spr.frames[index].width;
			SpriteRenderer.image.size[1] = 2 * spr.frames[index].height;
		} else if (layer.spr_type === 1) {
			index += spr.old_rgba_index;
		}

		var frame = spr.frames[index];
		var width = frame.width * layer.scale[0] * sizeScale;
		var height = frame.height * layer.scale[1] * sizeScale;

		if (layer.is_mirror) width = -width;

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

	return SakuraWeatherEffect;
});