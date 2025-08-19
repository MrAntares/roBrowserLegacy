/**
 * Renderer/MapRenderer.js
 *
 * Rendering sprite in 2D or 3D context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var Thread         = require('Core/Thread');
	var SoundManager   = require('Audio/SoundManager');
	var BGM            = require('Audio/BGM');
	var DB             = require('DB/DBManager');
	var UIManager      = require('UI/UIManager');
	var Background     = require('UI/Background');
	var Cursor         = require('UI/CursorManager');
	var Session        = require('Engine/SessionStorage');
	var MemoryManager  = require('Core/MemoryManager');
	var Mouse          = require('Controls/MouseEventHandler');
	var Renderer       = require('Renderer/Renderer');
	var Camera         = require('Renderer/Camera');
	var EntityManager  = require('Renderer/EntityManager');
	var GridSelector   = require('Renderer/Map/GridSelector');
	var Ground         = require('Renderer/Map/Ground');
	var Altitude       = require('Renderer/Map/Altitude');
	var Water          = require('Renderer/Map/Water');
	var Models         = require('Renderer/Map/Models');
	var Sounds         = require('Renderer/Map/Sounds');
	var Effects        = require('Renderer/Map/Effects');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var EffectManager  = require('Renderer/EffectManager');
	var Sky            = require('Renderer/Effects/Sky');
	var Damage         = require('Renderer/Effects/Damage');
	var MapPreferences = require('Preferences/Map');
	const glMatrix     = require('Utils/gl-matrix');
	const PACKETVER    = require('Network/PacketVerManager');
	
	const mat4         = glMatrix.mat4;

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
		use:    MapPreferences.useFog,
		exist:  true,
		far:    30,
		near:   180,
		factor: 1.0,
		color:  new Float32Array([1,1,1])
	};


	/**
	 * Load a map
	 *
	 * @param {string} mapname to load
	 */
	MapRenderer.setMap = function loadMap( mapname )
	{
		// TODO: stop the map loading, and start to load the new map.
		if (this.loading) {
			return;
		}

		// Support for instance map
		// Is it always 3 digits ?
		mapname = mapname
			.replace(/^(\d{3})(\d@)/, '$2') // 0061@tower   -> 1@tower
			.replace(/^\d{3}#/, '');        // 003#prontera -> prontera

		// Clean objects
		SoundManager.stop();
		Renderer.stop();
		UIManager.removeComponents();
		Cursor.setType(Cursor.ACTION.DEFAULT);

		// Don't reload a map when it's just a local teleportation
		if (this.currentMap !== mapname) {
			this.loading = true;
			BGM.stop();
			this.currentMap = mapname;

			// Parse the filename (ugly RO)
			var filename = mapname.replace(/\.gat$/i, '.rsw');

			Background.setLoading(function() {
				// Hooking Thread
				Thread.hook('MAP_PROGRESS', onProgressUpdate.bind(MapRenderer) );
				Thread.hook('MAP_WORLD',    onWorldComplete.bind(MapRenderer) );
				Thread.hook('MAP_GROUND',   onGroundComplete.bind(MapRenderer) );
				Thread.hook('MAP_ALTITUDE', onAltitudeComplete.bind(MapRenderer) );
				Thread.hook('MAP_MODELS',   onModelsComplete.bind(MapRenderer) );

				// Start Loading
				MapRenderer.free();
				Renderer.remove();
				Thread.send('LOAD_MAP', filename, onMapComplete.bind(MapRenderer) );
			});

			return;
		}

		var gl = Renderer.getContext();
		EntityManager.free();
		Damage.free( gl );
		EffectManager.free( gl );

		// Basic TP
		Background.remove(function(){
			MapRenderer.onLoad();
			Sky.setUpCloudData();

			Renderer.render( MapRenderer.onRender );
		});
	};


	/**
	 * Clean up data
	 */
	MapRenderer.free = function Free()
	{
		var gl = Renderer.getContext();

		EntityManager.free();
		GridSelector.free( gl );
		Sounds.free();
		Effects.free();
		Ground.free( gl );
		Water.free( gl );
		Models.free( gl );
		Damage.free( gl );
		EffectManager.free( gl );
		SoundManager.stop();
		BGM.stop();

		Mouse.intersect = false;

		this.light   = null;
		this.water   = null;
		this.sounds  = null;
		this.effects = null;
	};


	/**
	 * Received progress from Thread
	 *
	 * @param {number} percent (progress)
	 */
	function onProgressUpdate( percent )
	{
		Background.setPercent( percent );
	}


	/**
	 * Received parsed world
	 */
	function onWorldComplete( data )
	{
		this.light   = data.light;
		this.water   = data.water;
		this.sounds  = data.sound;
		this.effects = data.effect;
		this.diffuse = new Float32Array(this.light.diffuse);

		// Set default env color
		this.light.env = new Float32Array([
			1 - (1 - this.light.diffuse[0]) * (1 - this.light.ambient[0]),
			1 - (1 - this.light.diffuse[1]) * (1 - this.light.ambient[1]),
			1 - (1 - this.light.diffuse[2]) * (1 - this.light.ambient[2]),
		]);

		// Calculate light direction
		this.light.direction = new Float32Array(3);
		var longitude        = this.light.longitude * Math.PI / 180;
		var latitude         = this.light.latitude  * Math.PI / 180;

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
	function onGroundComplete( data )
	{
		var gl = Renderer.getContext();

		this.water.mesh      = data.waterMesh;
		this.water.vertCount = data.waterVertCount;

		Ground.init( gl, data );
		Water.init( gl, this.water );

		// Initialize sounds
		var i, count, tmp;

		count = this.sounds.length;
		for (i = 0; i < count; ++i) {
			tmp                    = -this.sounds[i].pos[1];
			this.sounds[i].pos[0] += data.width;
			this.sounds[i].pos[1]  = this.sounds[i].pos[2] + data.height;
			this.sounds[i].pos[2]  = tmp;
			this.sounds[i].range  *= 0.2;
			this.sounds[i].tick    =   0;
			this.sounds[i].cycle    =   !this.sounds[i].cycle ? 7:this.sounds[i].cycle;
			Sounds.add(this.sounds[i]);
		}


		count = this.effects.length;
		for (i = 0; i < count; ++i) {
			// Note: effects objects do not need to be centered in a cell
			// as we apply +0.5 in the shader, we have to revert it.
			tmp                     = -this.effects[i].pos[1] + 1; //WTF????????
			this.effects[i].pos[0] += data.width - 0.5;
			this.effects[i].pos[1]  = this.effects[i].pos[2] + data.height - 0.5;
			this.effects[i].pos[2]  = tmp;

			this.effects[i].tick    = 0;

			Effects.add(this.effects[i]);
		}

		this.effects.length = 0;
		this.sounds.length  = 0;
	}


	/**
	 * Receiving parsed GAT from Thread
	 */
	function onAltitudeComplete( data )
	{
		var gl = Renderer.getContext();
		Altitude.init( data );
		GridSelector.init( gl );
	}


	/**
	 * Receiving parsed RSMs from Thread
	 */
	function onModelsComplete( data )
	{
		Models.init( Renderer.getContext(), data );
	}


	/**
	 * Once the map finished to load
	 */
	function onMapComplete( success, error )
	{
		var worldResource = this.currentMap.replace(/\.gat$/i, '.rsw');
		var mapInfo       = DB.getMap(worldResource);

		// Problem during loading ?
		if (!success) {
			UIManager.showErrorBox( error ).ui.css('zIndex', 1000);
			return;
		}

		// Play BGM
		BGM.play((mapInfo && mapInfo.mp3) || '01.mp3');

		// Apply fog to map
		this.fog.exist = !!(mapInfo && mapInfo.fog);
		if (this.fog.exist) {
			this.fog.near   = mapInfo.fog.near * 240;
			this.fog.far    = mapInfo.fog.far  * 240;
			this.fog.factor = mapInfo.fog.factor;
			this.fog.color.set( mapInfo.fog.color );
		}

		// Initialize renderers
		Renderer.init();
		var gl = Renderer.getContext();

		SpriteRenderer.init(gl);
		Sky.init( gl, worldResource );
		Damage.init(gl);
		EffectManager.init(gl);

		// Starting to render
		Background.remove(function(){
			MapRenderer.loading = false;
			Mouse.intersect     = true;

			MapRenderer.onLoad();
			Sky.setUpCloudData();

			// Display game
			Renderer.show();
			Renderer.render( MapRenderer.onRender );
		});
	}


	/**
	 * Rendering world
	 *
	 * @param {number} tick - game tick
	 * @param {object} gl context
	 */
	var _pos = new Uint16Array(2);
	MapRenderer.onRender = function OnRender( tick, gl )
	{
		var fog   = MapRenderer.fog;
		fog.use   = MapPreferences.fog;
		var light = MapRenderer.light;

		var modelView, projection, normalMat;
		var x, y;

		// Clean mouse position in world
		Mouse.world.x =  -1;
		Mouse.world.y =  -1;
		Mouse.world.z =  -1;

		// Clear screen, update camera
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		Camera.update( tick );

		modelView  = Camera.modelView;
		projection = Camera.projection;
		normalMat  = Camera.normalMat;

		// Spam map effects
		Effects.spam( Session.Entity.position, tick);

		Ground.render(gl, modelView, projection, normalMat, fog, light );
		Models.render(gl, modelView, projection, normalMat, fog, light );

		if (Mouse.intersect && Altitude.intersect( modelView, projection, _pos)) {
			x = _pos[0];
			y = _pos[1];
			const isWalkable = Altitude.getCellType( x, y ) & Altitude.TYPE.WALKABLE;

			Mouse.world.x =  x;
			Mouse.world.y =  y;
			Mouse.world.z =  Altitude.getCellHeight( x, y );

			if (isWalkable) {
				GridSelector.render( gl, modelView, projection, fog, x, y );
			}

			// NO walk cursor
			// TODO: Know the packet version for this feature
			if (PACKETVER.value >= 20200101) {
				if (Cursor.getActualType() === Cursor.ACTION.NOWALK && isWalkable)
					Cursor.setType( Cursor.ACTION.DEFAULT, false );
				if (Cursor.getActualType() === Cursor.ACTION.DEFAULT && !isWalkable)
					Cursor.setType( Cursor.ACTION.NOWALK, false );
			}

		}

		// Display zone effects and entities
		Sky.render( gl, modelView, projection, fog, tick );
		EffectManager.render( gl, modelView, projection, fog, tick, true);

		//Render Entities (no effects)
		EntityManager.render( gl, modelView, projection, fog, false );

		// Rendering water
		Water.render( gl, modelView, projection, fog, light, tick );

		// Rendering effects
		Damage.render( gl, modelView, projection, fog, tick );
		EffectManager.render( gl, modelView, projection, fog, tick, false);
		EntityManager.render( gl, modelView, projection, fog, true );

		// Play sounds
		Sounds.render( Session.Entity.position, tick );

		// Find entity over the cursor
		if (Mouse.intersect) {
			var entity = EntityManager.intersect();
			EntityManager.setOverEntity( entity );
		}

		// Clean up
		MemoryManager.clean(gl, tick);
	};


	/**
	 * Callback to execute once the map is loaded
	 */
	MapRenderer.onLoad = function onLoad()
	{
	};

	/**
	 * Set night mode by changing the diffuse color
	 * This effect is the same as SC_SKE
	 * 
	 * @param {boolean} night - true for night mode, false for day mode
	 */
	MapRenderer.setNight = function(night) {
		const intervalId = setInterval(() => {
			if (night) {
				if (this.diffuse[0] > 0.5)
					this.diffuse[0] -= 0.005;
				if (this.diffuse[1] > 0.5)
					this.diffuse[1] -= 0.005;
			} else {
				if (this.diffuse[0] < this.light.diffuse[0])
					this.diffuse[0] += 0.005;
				if (this.diffuse[1] < this.light.diffuse[1])
					this.diffuse[1] += 0.005; 
			}
	
			this.light.env = [
				1 - (1 - this.diffuse[0]) * (1 - this.light.ambient[0]),
				1 - (1 - this.diffuse[1]) * (1 - this.light.ambient[1]),
				1 - (1 - this.diffuse[2]) * (1 - this.light.ambient[2])
			]

			if ((night && this.diffuse[0] <= 0.5 && this.diffuse[1] <= 0.5) ||
				(!night && this.diffuse[0] >= this.light.diffuse[0] && this.diffuse[1] >= this.light.diffuse[1])) {
					clearInterval(intervalId);
			}
		}, 8);
	}

	/**
	 * Export
	 */
	return MapRenderer;
});
