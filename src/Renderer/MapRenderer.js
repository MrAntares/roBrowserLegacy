/**
 * Renderer/MapRenderer.js
 *
 * Rendering sprite in 2D or 3D context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Load dependencies
	 */
	const getModule = require;
	var Thread = require('Core/Thread');
	var SoundManager = require('Audio/SoundManager');
	var BGM = require('Audio/BGM');
	var DB = require('DB/DBManager');
	var UIManager = require('UI/UIManager');
	var Background = require('UI/Background');
	var Cursor = require('UI/CursorManager');
	var Session = require('Engine/SessionStorage');
	var MemoryManager = require('Core/MemoryManager');
	var Mouse = require('Controls/MouseEventHandler');
	var Renderer = require('Renderer/Renderer');
	var Camera = require('Renderer/Camera');
	var EntityManager = require('Renderer/EntityManager');
	var GridSelector = require('Renderer/Map/GridSelector');
	var Ground = require('Renderer/Map/Ground');
	var Altitude = require('Renderer/Map/Altitude');
	var Water = require('Renderer/Map/Water');
	var Models = require('Renderer/Map/Models');
	var AnimatedModels = require('Renderer/Map/AnimatedModels');
	var Sounds = require('Renderer/Map/Sounds');
	var Effects = require('Renderer/Map/Effects');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var EffectManager = require('Renderer/EffectManager');
	var SignboardManager = require('Renderer/SignboardManager');
	var ScreenEffectManager = require('Renderer/ScreenEffectManager');
	var Sky = require('Renderer/Effects/Sky');
	var Damage = require('Renderer/Effects/Damage');
	var GraphicsSettings = require('Preferences/Graphics');
	var MapPreferences = require('Preferences/Map');
	const glMatrix = require('Utils/gl-matrix');
	const PACKETVER = require('Network/PacketVerManager');
	var JoystickUI = require('UI/Components/JoystickUI/JoystickUI');

	var PostProcess = require('Renderer/Effects/PostProcess');
	var Bloom = require('Renderer/Effects/Shaders/Bloom');
	var VerticalFlip = require('Renderer/Effects/Shaders/VerticalFlip');
	var GaussianBlur = require('Renderer/Effects/Shaders/GaussianBlur');
	var CAS = require('Renderer/Effects/Shaders/CAS');
	var FXAA = require('Renderer/Effects/Shaders/FXAA');
	var Vibrance = require('Renderer/Effects/Shaders/Vibrance');
	var Cartoon = require('Renderer/Effects/Shaders/Cartoon');
	var Blind = require('Renderer/Effects/Shaders/Blind');

	var WebGL = require('Utils/WebGL');

	const mat4 = glMatrix.mat4;

	/**
	 * Renderer Namespace
	 */
	var MapRenderer = {};

	/**
	 * @var {string} current map's name
	 */
	MapRenderer.currentMap = '';

	/**
	 * @var {object} Global Light Structure
	 */
	MapRenderer.light = null;

	/**
	 * @var {object} Water Structure
	 */
	MapRenderer.water = null;

	/**
	 * @var {array} Sounds object list
	 */
	MapRenderer.sounds = null;

	/**
	 * @var {array} Effects object list
	 */
	MapRenderer.effects = null;

	/**
	 * @var {array} is loading a map ?
	 */
	MapRenderer.loading = false;

	/**
	 * @var {Float32Array} diffuse Modified diffuse color
	 */
	MapRenderer.diffuse = null;

	/**
	 * @var {Object} Fog structure
	 */
	MapRenderer.fog = {
		use: MapPreferences.useFog,
		exist: true,
		far: 30,
		near: 180,
		factor: 1.0,
		color: new Float32Array([1, 1, 1])
	};

	/**
	 * Load a map
	 *
	 * @param {string} mapname to load
	 * @param {bool} force reload map renderer
	 */
	MapRenderer.setMap = function loadMap(mapname, force = false) {
		// TODO: stop the map loading, and start to load the new map.
		if (this.loading) {
			return;
		}

		// Support for instance map
		// Is it always 3 digits ?
		mapname = mapname
			.replace(/^(\d{3})(\d@)/, '$2') // 0061@tower   -> 1@tower
			.replace(/^\d{3}#/, ''); // 003#prontera -> prontera

		// Clean objects
		SoundManager.stop();
		Renderer.stop();
		UIManager.removeComponents();
		Cursor.setType(Cursor.ACTION.DEFAULT);

		// Don't reload a map when it's just a local teleportation
		if (this.currentMap !== mapname || force) {
			this.loading = true;
			BGM.stop();
			this.currentMap = mapname;

			// Parse the filename (ugly RO)
			var filename = mapname.replace(/\.gat$/i, '.rsw');

			Background.setLoading(function () {
				// Hooking Thread
				Thread.hook('MAP_PROGRESS', onProgressUpdate.bind(MapRenderer));
				Thread.hook('MAP_WORLD', onWorldComplete.bind(MapRenderer));
				Thread.hook('MAP_GROUND', onGroundComplete.bind(MapRenderer));
				Thread.hook('MAP_ALTITUDE', onAltitudeComplete.bind(MapRenderer));
				Thread.hook('MAP_MODELS', onModelsComplete.bind(MapRenderer));
				Thread.hook('MAP_ANIMATED_MODEL', onAnimatedModelComplete.bind(MapRenderer));

				// Start Loading
				MapRenderer.free();
				Renderer.remove();
				Thread.send('LOAD_MAP', filename, onMapComplete.bind(MapRenderer));
			});

			return;
		}

		var gl = Renderer.getContext();
		EntityManager.free();
		Damage.free(gl);
		EffectManager.free(gl);

		// Basic TP
		Background.remove(function () {
			MapRenderer.onLoad();
			Sky.setUpCloudData();

			Renderer.render(MapRenderer.onRender);
		});
	};

	/**
	 * Trick to reload sprite renderer
	 * Same behavior to @refresh
	 */
	MapRenderer.forceReloadMap = function forceReloadMap() {
		var gl = Renderer.getContext();
		var sprFiles = MemoryManager.search(/\.spr$/i);
		for (
			var i = 0;
			i < sprFiles.length;
			i++ // reloads spr memory cache
		)
			MemoryManager.remove(gl, sprFiles[i]);

		getModule('Engine/MapEngine').onMapChange(
			{
				xPos: Session.Entity.position[0],
				yPos: Session.Entity.position[1],
				mapName: this.currentMap
			},
			true
		);
	};

	/**
	 * Clean up data
	 */
	MapRenderer.free = function Free() {
		var gl = Renderer.getContext();

		EntityManager.free();
		GridSelector.free(gl);
		Sounds.free();
		Effects.free();
		Ground.free(gl);
		Water.free(gl);
		Models.free(gl);
		AnimatedModels.free(gl);
		Damage.free(gl);
		EffectManager.free(gl);
		SignboardManager.free();
		SoundManager.stop();
		BGM.stop();

		// Release WebGL resources for post-processing effects
		PostProcess.clean(gl);

		Mouse.intersect = false;

		this.light = null;
		this.water = null;
		this.sounds = null;
		this.effects = null;
	};

	/**
	 * Received progress from Thread
	 *
	 * @param {number} percent (progress)
	 */
	function onProgressUpdate(percent) {
		Background.setPercent(percent);
	}

	/**
	 * Received parsed world
	 */
	function onWorldComplete(data) {
		this.light = data.light;
		this.water = data.water;
		this.sounds = data.sound;
		this.effects = data.effect;
		this.diffuse = new Float32Array(this.light.diffuse);

		// Set default env color
		this.light.env = new Float32Array([
			1 - (1 - this.light.diffuse[0]) * (1 - this.light.ambient[0]),
			1 - (1 - this.light.diffuse[1]) * (1 - this.light.ambient[1]),
			1 - (1 - this.light.diffuse[2]) * (1 - this.light.ambient[2])
		]);

		// Calculate light direction
		this.light.direction = new Float32Array(3);
		var longitude = (this.light.longitude * Math.PI) / 180;
		var latitude = (this.light.latitude * Math.PI) / 180;

		const dirMat4 = mat4.create();
		// Original client first rotates around X then Y, but then multiplies matrixes in reverse order
		// Which means we have to rotate Y first then X
		mat4.rotateY(dirMat4, dirMat4, longitude);
		mat4.rotateX(dirMat4, dirMat4, latitude);
		const dirVec = mat4.multiplyVec3([0, 1, 0], dirMat4);

		this.light.direction[0] = -dirVec[0];
		this.light.direction[1] = -dirVec[1];
		this.light.direction[2] = -dirVec[2];
	}

	/**
	 * Received ground data from Thread
	 */
	function onGroundComplete(data) {
		var gl = Renderer.getContext();

		this.water.mesh = data.waterMesh;
		this.water.vertCount = data.waterVertCount;

		Ground.init(gl, data);
		Water.init(gl, this.water);

		// Initialize sounds
		var i, count, tmp;

		count = this.sounds.length;
		for (i = 0; i < count; ++i) {
			tmp = -this.sounds[i].pos[1];
			this.sounds[i].pos[0] += data.width;
			this.sounds[i].pos[1] = this.sounds[i].pos[2] + data.height;
			this.sounds[i].pos[2] = tmp;
			this.sounds[i].range *= 0.2;
			this.sounds[i].tick = 0;
			this.sounds[i].cycle = !this.sounds[i].cycle ? 7 : this.sounds[i].cycle;
			Sounds.add(this.sounds[i]);
		}

		count = this.effects.length;
		for (i = 0; i < count; ++i) {
			// Note: effects objects do not need to be centered in a cell
			// as we apply +0.5 in the shader, we have to revert it.
			tmp = -this.effects[i].pos[1] + 1; //WTF????????
			this.effects[i].pos[0] += data.width - 0.5;
			this.effects[i].pos[1] = this.effects[i].pos[2] + data.height - 0.5;
			this.effects[i].pos[2] = tmp;

			this.effects[i].tick = 0;

			Effects.add(this.effects[i]);
		}

		this.effects.length = 0;
		this.sounds.length = 0;
	}

	/**
	 * Receiving parsed GAT from Thread
	 */
	function onAltitudeComplete(data) {
		var gl = Renderer.getContext();
		Altitude.init(data);
		GridSelector.init(gl);
	}

	/**
	 * Receiving parsed RSMs from Thread
	 */
	function onModelsComplete(data) {
		Models.init(Renderer.getContext(), data);
	}

	/**
	 * Receiving animated RSM model from Thread
	 */
	function onAnimatedModelComplete(data) {
		var gl = Renderer.getContext();
		AnimatedModels.add(gl, data);
	}

	/**
	 * Register PostProcessing Modules in pass order
	 */
	function registerPostProcessModules(gl) {
		if (WebGL.detectBadWebGL(gl)) GraphicsSettings.bloom = false;
		else PostProcess.register(Bloom, gl);
		PostProcess.register(GaussianBlur, gl);
		PostProcess.register(FXAA, gl);
		PostProcess.register(CAS, gl);
		PostProcess.register(Cartoon, gl);
		PostProcess.register(Vibrance, gl);
		PostProcess.register(VerticalFlip, gl);
		PostProcess.register(Blind, gl);
	}

	/**
	 * Once the map finished to load
	 */
	function onMapComplete(success, error) {
		var worldResource = this.currentMap.replace(/\.gat$/i, '.rsw');
		var mapInfo = DB.getMap(worldResource);

		// Problem during loading ?
		if (!success) {
			UIManager.showErrorBox(error).ui.css('zIndex', 1000);
			return;
		}

		// Play BGM
		BGM.play((mapInfo && mapInfo.mp3) || '01.mp3');

		// Apply fog to map
		this.fog.exist = !!(mapInfo && mapInfo.fog);
		if (this.fog.exist) {
			this.fog.near = mapInfo.fog.near * 240;
			this.fog.far = mapInfo.fog.far * 240;
			this.fog.factor = mapInfo.fog.factor;
			this.fog.color.set(mapInfo.fog.color);
		}

		// Initialize renderers
		Renderer.init();
		var gl = Renderer.getContext();

		SpriteRenderer.init(gl);
		Sky.init(gl, worldResource);
		Damage.init(gl);
		EffectManager.init(gl);
		ScreenEffectManager.init(gl, worldResource);
		registerPostProcessModules(gl);
		JoystickUI.onRestore();

		// Starting to render
		Background.remove(function () {
			MapRenderer.loading = false;
			Mouse.intersect = true;

			MapRenderer.onLoad();
			Sky.setUpCloudData();
			ScreenEffectManager.startMapflagEffect(worldResource);

			// Display game
			Renderer.show();
			Renderer.render(MapRenderer.onRender);
		});
	}

	/**
	 * Rendering world
	 *
	 * @param {number} tick - game tick
	 * @param {object} gl context
	 */
	var _pos = new Uint16Array(2);
	MapRenderer.onRender = function OnRender(tick, gl) {
		PostProcess.prepare(gl);

		var fog = MapRenderer.fog;
		fog.use = MapPreferences.fog;
		var light = MapRenderer.light;

		var modelView, projection, normalMat;
		var x, y;

		// Clean mouse position in world
		Mouse.world.x = -1;
		Mouse.world.y = -1;
		Mouse.world.z = -1;

		// Update camera
		Camera.update(tick);

		modelView = Camera.modelView;
		projection = Camera.projection;
		normalMat = Camera.normalMat;

		// Spam map effects
		Effects.spam(Session.Entity.position, tick);

		Ground.render(gl, modelView, projection, normalMat, fog, light);
		Models.render(gl, modelView, projection, normalMat, fog, light);
		AnimatedModels.render(gl, modelView, projection, normalMat, fog, light, tick);

		// Rendering water (before sprites due cloaks and cart can't overdraw them when looking front)
		Water.render(gl, modelView, projection, fog, light, tick);

		if (Mouse.intersect && Altitude.intersect(modelView, projection, _pos)) {
			x = _pos[0];
			y = _pos[1];
			const isWalkable = Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE;

			Mouse.world.x = x;
			Mouse.world.y = y;
			Mouse.world.z = Altitude.getCellHeight(x, y);

			if (isWalkable) {
				if (Session.captchaGetIdOnFloorClick) {
					// render Grid Selector on floor range
					let range = Session.captchaGetIdOnFloorRange;

					// render on range
					let cells = Altitude.getCellsInSquareRange(x, y, range);
					cells.forEach(cell => {
						GridSelector.render(gl, modelView, projection, fog, cell.x, cell.y);
					});
				}
				GridSelector.render(gl, modelView, projection, fog, x, y);
			}

			// NO walk cursor
			// TODO: Know the packet version for this feature
			if (PACKETVER.value >= 20200101) {
				if (Cursor.getActualType() === Cursor.ACTION.NOWALK && isWalkable)
					Cursor.setType(Cursor.ACTION.DEFAULT, false);
				if (Cursor.getActualType() === Cursor.ACTION.DEFAULT && !isWalkable)
					Cursor.setType(Cursor.ACTION.NOWALK, false);
			}
		}

		// Display zone effects and entities
		Sky.render(gl, modelView, projection, fog, tick);
		EffectManager.render(gl, modelView, projection, fog, tick, true);

		//Render Entities (no effects)
		EntityManager.render(gl, modelView, projection, fog, false);

		// Rendering effects
		Damage.render(gl, modelView, projection, fog, tick);
		EffectManager.render(gl, modelView, projection, fog, tick, false);
		EntityManager.render(gl, modelView, projection, fog, true);

		// Render signboards
		SignboardManager.render(gl, modelView, projection);

		// Screen overlayed Effects
		ScreenEffectManager.render(gl, modelView, projection, fog, tick);

		// Play sounds
		Sounds.render(Session.Entity.position, tick);

		// Find entity over the cursor
		if (Mouse.intersect) {
			var entity = EntityManager.intersect();
			EntityManager.setOverEntity(entity);
		}

		// Clean up
		MemoryManager.clean(gl, tick);

		// Finalize frame with post-processing effects
		PostProcess.render(gl);
	};

	/**
	 * Callback to execute once the map is loaded
	 */
	MapRenderer.onLoad = function onLoad() {};

	/**
	 * Export
	 */
	return MapRenderer;
});
