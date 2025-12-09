/**
 * Renderer/Effects/Damage.js
 *
 * Rendering damage particles
 * TODO: Create a particle class to manage the process
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';


	// Load dependencies
	var WebGL          = require('Utils/WebGL');
	var Client         = require('Core/Client');
	var Configs        = require('Core/Configs');
	var Sprite         = require('Loaders/Sprite');
	var Renderer       = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var MapPreferences = require('Preferences/Map');
	var DB             = require('DB/DBManager');
	var Sound          = require('Audio/SoundManager');
	var EffectManager  = require('Renderer/EffectManager');
	var MemoryManager = require('Core/MemoryManager');
	var Entity            = require('Renderer/Entity/Entity');
	var GraphicsSettings = require('Preferences/Graphics');
	var EndureSound    = "player_metal.wav";
	var dpr            = window.devicePixelRatio || 1;

	var _skin = 0; 
	var _damageSkins = {  
		0: { // DT_Default  
			BaseNumber: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/\xbc\xfd\xc0\xda.spr',  
			BaseMsg: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/msg.spr',  
			BaseBlue: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/bluemsg.spr'  
		},  
		1: { // DT_NewNumber  
			BaseNumber: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumber.spr',  
			BaseMsg: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumber_MSG.spr',  
			BaseBlue: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumber_BMSG.spr'  
		},  
		2: { // DT_Han  
			BaseNumber: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/Han.spr',  
			BaseMsg: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/Han_MSG.spr',  
			BaseBlue: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/Han_BMSG.spr'  
		},  
		3: { // DT_Invi  
			BaseNumber: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumberH.spr',  
			BaseMsg: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumberH_MSG.spr',  
			BaseBlue: 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/NewNumberH_BMSG.spr'  
		}  
	};

	/**
	 * Set damage skin
	 *
	 * @param {number} skin
	 */
	Damage.setSkin = function SetSkin(skin)
	{
		_skin = skin;
	};

	/**
	 * Damage Namespace
	 */
	function Damage()
	{
		this.entity   = null;
		this.startTick    = 0;
		this.type     = 0;
		this.color    = new Float32Array(4);
		this.delay    = 1500;
		this.texture  = null;
		this.width    = 0;
		this.height   = 0;
	}


	/**
	 * Damage type constant
	 */
	Damage.TYPE = {
		HEAL:          1 << 0,
		MISS:          1 << 1,
		DAMAGE:        1 << 2,
		ENEMY:         1 << 3,
		COMBO:         1 << 4,
		COMBO_FINAL:   1 << 5,
		SP:            1 << 6,
		CRIT:          1 << 7,
		LUCKY:         1 << 8,
		ENDURE:        1 << 9,
		COMBO_B:       1 << 10
	};


	// Damage suffix status
	var _enableSuffix = false;

	/**
	 * @var {string} Sprite of the damage sprite
	 */
	var _numbers;
	var _msgNames = {
		0: 'miss',
		1: 'guard',
		2: 'crit',
		3: 'critbg',
		4: 'luckybg',
		5: 'lucky',
	}
	var _msg     = new Array(6);
	var _msgBlue = new Array(6);


	/**
	 * @var {Damage[]} List of damages
	 */
	var _list = [];

	/**
	 * @var previus combo time
	 */
	var prevCombo = [];

	/**
	 * Convert sprite to image Data
	 * @param {object} gl - WebGL context
	 */
	Damage.init = function init( gl )
	{
		var confChange = !(_enableSuffix === Configs.get('enableDmgSuffix'));

		_enableSuffix = Configs.get('enableDmgSuffix');

		_skin = GraphicsSettings.damageSkin || 0;
		var currentSkin = _damageSkins[_skin];

		// Already loaded
		if (_numbers && _numbers[0] && _msg.miss && _msgBlue.miss) {
			if(confChange){
				// Remove old file, need to get different version of the sprite
				MemoryManager.remove(gl, currentSkin.BaseMsg);
			} else {
				return;
			}
		}

		_numbers = new Array(_enableSuffix ? 12 : 10);

		Client.getFiles([
			currentSkin.BaseNumber,
			currentSkin.BaseMsg,
			currentSkin.BaseBlue
		], function( numbers, msg, bluemsg ) {
			var sprNumbers, sprMsg, sprBlue;
			var enableMipmap = Configs.get('enableMipmap');

			// Load it properly later using webgl
			MemoryManager.remove(gl, msg);

			try {
				sprNumbers = new Sprite(numbers);
				sprMsg   = new Sprite(msg);
				sprBlue   = new Sprite(bluemsg);
			}
			catch(e) {
				console.error('Damage::init() - ' + e.message );
				return;
			}

			// Create SpriteSheet
			for (var i = 0; i < _numbers.length; ++i) {
				_numbers[i]  = sprNumbers.getCanvasFromFrame(i);
			}

			for(var i = 0; i < 6; i++){  //msg.spr miss crit lucky...

				var source = sprMsg.getCanvasFromFrame(i);
				var canvas = document.createElement('canvas');
				var ctx    = canvas.getContext('2d');

				canvas.width  = WebGL.toPowerOfTwo(source.width) * dpr;
				canvas.height = WebGL.toPowerOfTwo(source.height) * dpr;
				ctx.drawImage( source, (canvas.width-source.width)/2, (canvas.height-source.height)/2, source.width, source.height );

				_msg[_msgNames[i]] = {
					texture: gl.createTexture(),
					canvas:  canvas
				};

				gl.bindTexture( gl.TEXTURE_2D, _msg[_msgNames[i]].texture );
				gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				if(enableMipmap) {
					gl.generateMipmap( gl.TEXTURE_2D );
				}
			}

			for(var i = 0; i < 6; i++){  //bluemsg.spr miss crit lucky...

				var source = sprBlue.getCanvasFromFrame(i);
				var canvas = document.createElement('canvas');
				var ctx    = canvas.getContext('2d');

				canvas.width  = WebGL.toPowerOfTwo(source.width) * dpr;
				canvas.height = WebGL.toPowerOfTwo(source.height) * dpr;
				ctx.drawImage( source, (canvas.width-source.width)/2, (canvas.height-source.height)/2, source.width, source.height );

				_msgBlue[_msgNames[i]] = {
					texture: gl.createTexture(),
					canvas:  canvas
				};

				gl.bindTexture( gl.TEXTURE_2D, _msgBlue[_msgNames[i]].texture );
				gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				if(enableMipmap) {
					gl.generateMipmap( gl.TEXTURE_2D );
				}
			}

		});
	};

	/**
	 * Add Damage to the scene
	 *
	 * @param {number} damage
	 * @param {Entity} entity to receive the damage
	 * @param {number} tick
	 * @param {number} type - Damage|Heal
	 */
	Damage.add = function add( damage, entity, tick, weapon, type)
	{
		// Can not display negative damages.
		// Need to wait the client to load damage sprite
		if (damage < 0 || !_numbers[0] || !_msg.miss || !_msgBlue.miss) {
			return;
		}

		// Can't render floating points
		damage = Math.floor(damage);

		var PADDING = 2;
		var i, count, start_x, start_y;
		var frame;

		var canvas  = document.createElement('canvas');
		var ctx     = canvas.getContext('2d');
		var numbers;
		var suffix = null;

		if (_enableSuffix) {
			// Check for large numbers and convert accordingly
			if (damage >= 100000000) {
				damage = Math.floor(damage / 1000000);
				suffix = 11; // 'M'
			} else if (damage >= 1000000) {
				damage = Math.floor(damage / 1000);
				suffix = 10; // 'K'
			}
		}

		numbers = damage.toString().split('');

		// Add suffix to numbers if it exists
		if (suffix !== null) {
		    numbers.push(suffix);
		}

		var width   = 0;
		var height  = 0;
		var gl      = Renderer.gl;
		var texture;

		var obj      = new Damage();

		obj.type     = type || (damage ? Damage.TYPE.DAMAGE : Damage.TYPE.MISS);
		if (entity.objecttype === entity.constructor.TYPE_PC) {
			obj.type |= Damage.TYPE.ENEMY;
		}

		obj.color    = [1.0, 1.0, 1.0, 1.0]; // for sprite renderer
		obj.delay    = 1500;
		obj.startTick    = tick;
		obj.entity   = entity;

		if (obj.type & Damage.TYPE.SP) {
			// blue
			obj.color[0] = 0.13;
			obj.color[1] = 0.19;
			obj.color[2] = 0.75;
		}
		else if (obj.type & Damage.TYPE.HEAL) {
			// green
			obj.color[0] = 0.0;
			obj.color[1] = 1.0;
			obj.color[2] = 0.0;
		}
		else if (obj.type & Damage.TYPE.ENEMY) {
			// red
			obj.color[0] = 1.0;
			obj.color[1] = 0.0;
			obj.color[2] = 0.0;
		}
		else if (obj.type & Damage.TYPE.COMBO) {
			// yellow
			obj.color[0] = 0.9;
			obj.color[1] = 0.9;
			obj.color[2] = 0.15;
			obj.delay    = 3000;
		}
		else if (obj.type & Damage.TYPE.CRIT) {
			// yellow
			obj.color[0] = 0.9;
			obj.color[1] = 0.9;
			obj.color[2] = 0.15;

			// Add CRIT background
			var bgObj      = new Damage();
			bgObj.type     = Damage.TYPE.CRIT;
			bgObj.color    = [0.66, 0.66, 0.66, 1.0];
			bgObj.delay    = 1500;
			bgObj.startTick    = tick;
			bgObj.entity   = entity;
			bgObj.texture  = _msg.critbg.texture;
			bgObj.width    = _msg.critbg.canvas.width * 0.6;
			bgObj.height   = _msg.critbg.canvas.height * 0.6;
			bgObj.offset   = [0.0, -6.0];
			bgObj.isDisposable = false;
			_list.push(bgObj);

			// Add hit effect
			var EF_Init_Par = {
				effectId: 1,
				ownerAID: entity.GID,
				position: entity.position,
				startTick: tick
			};
			EffectManager.spam( EF_Init_Par );
		}
		else if (obj.type & Damage.TYPE.COMBO_B) {
			// white
			obj.color[0] = 1.0;
			obj.color[1] = 1.0;
			obj.color[2] = 1.0;

			// Add Blue CRIT background
			var bgObj      = new Damage();
			bgObj.type     = obj.type;
			bgObj.color    = [0.66, 0.66, 0.66, 1.0];
			bgObj.delay    = 1500;
			bgObj.startTick    = tick;
			bgObj.entity   = entity;
			bgObj.texture  = _msgBlue.critbg.texture;
			bgObj.width    = _msgBlue.critbg.canvas.width * 0.6;
			bgObj.height   = _msgBlue.critbg.canvas.height * 0.6;
			bgObj.offset   = [0.0, -6.0];
			bgObj.isDisposable = false;
			_list.push(bgObj);
		}
		else {
			// white
			obj.color[0] = 1.0;
			obj.color[1] = 1.0;
			obj.color[2] = 1.0;
		}

		// Miss
		if (!damage) {
			if (MapPreferences.miss) {
				obj.texture  = _msg.miss.texture;
				obj.width    = _msg.miss.canvas.width;
				obj.height   = _msg.miss.canvas.height;
				obj.isDisposable = false;
				_list.push(obj);
			}
			return;
		}

		// Calculate canvas width and height
		for (i = 0, count = numbers.length; i < count; ++i) {
			frame  = _numbers[ numbers[i] ];
			width += frame.width + PADDING;
			height = Math.max( height, frame.height );
		}

		// Set canvas size (pow of 2 for webgl).
		ctx.canvas.width  = WebGL.toPowerOfTwo( width ) * dpr;
		ctx.canvas.height = WebGL.toPowerOfTwo( height ) * dpr;

		// find where to start to get the image at the center
		start_x = (ctx.canvas.width  - width ) >> 1;
		start_y = (ctx.canvas.height - height) >> 1;

		// build texture
		width = 0;
		for (i = 0, count = numbers.length; i < count; ++i) {
			frame  = _numbers[ numbers[i] ];
			ctx.drawImage(
				frame,
				start_x + width,
				start_y + ((height - frame.height) >> 1)
			);
			width += frame.width + PADDING;
		}

		texture = gl.createTexture();

		var enableMipmap = Configs.get('enableMipmap');
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		if(enableMipmap) {
			gl.generateMipmap( gl.TEXTURE_2D );
		}

		obj.texture  = texture;
		obj.width    = canvas.width;
		obj.height   = canvas.height;
		obj.isDisposable = true;

		var hitSound;
		if(entity.objecttype === Entity.TYPE_PC){
			hitSound = DB.getJobHitSound(entity._job);
		} else {
			if((weapon || weapon === 0)){
				hitSound = DB.getWeaponHitSound(weapon);
			}
		}

		if(hitSound){
			obj.soundFile = hitSound;
		}

		_list.push( obj );

	};


	/**
	 * Remove damages from map, clean up memory
	 *
	 * @param {object} gl context
	 */
	Damage.free = function free( gl )
	{
		var i, count;

		for (i = 0, count = _list.length ; i < count ; ++i) {
			if (_list[i].isDisposable) {
				gl.deleteTexture(_list[i].texture);
			}
		}

		_list.length = 0;
	};


	/**
	 * Rendering damages on maps
	 *
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog structure
	 * @param {number} tick - game tick
	 */
	// Render all damages.
	Damage.render = function render( gl, modelView, projection, fog, tick )
	{
		// Nothing to render exiting
		if (!_list.length) {
			return;
		}

		// Init program
		SpriteRenderer.bind3DContext( gl, modelView, projection, fog );
		SpriteRenderer.disableDepthCorrection = true;

		// Damage indicators should always be visible: render without depth test/writes.
		gl.disable(gl.DEPTH_TEST);
		SpriteRenderer.setDepthMask(false);

		// Base parameters
		SpriteRenderer.shadow    = 1.0;
		SpriteRenderer.angle     = 0;
		SpriteRenderer.image.palette = null;

		var i, count, perc;
		var damage;
		var size;

		// Render all list
		for (i = 0, count = _list.length; i < count; ++i) {

			damage = _list[i];

			// Not now.
			if (damage.startTick > tick) {
				continue;
			}

			// Remove it from list, time passed.
			if (damage.startTick + damage.delay < tick) {
				if (damage.isDisposable) {
					gl.deleteTexture( damage.texture );
				}
				_list.splice( i, 1 );
				count--;
				i--;
				continue;
			}

			perc = (tick - damage.startTick) / damage.delay;

			// Combo title
			if (damage.type & Damage.TYPE.COMBO || damage.type & Damage.TYPE.COMBO_B) {
				//Combo title need to remove if new one come up
				if(damage.startTick < prevCombo[damage.entity.GID]){
					continue;
				}
				prevCombo[damage.entity.GID] = damage.startTick;

				// TODO: fix it
				size = Math.min( perc, 0.05 ) * 70;

				// Remove it
				if (!(damage.type & Damage.TYPE.COMBO_FINAL) && perc > 0.15) {
					damage.startTick = 0;
				}

				SpriteRenderer.position[0] = damage.entity.position[0];
				SpriteRenderer.position[1] = damage.entity.position[1];
				SpriteRenderer.position[2] = damage.entity.position[2] + 7 + perc;
			}

			// Damage
			else if ((damage.type & Damage.TYPE.DAMAGE) || (damage.type & Damage.TYPE.CRIT)) {
				size = ( 1 - perc ) * 4;
				SpriteRenderer.position[0] = damage.entity.position[0] + perc * 4;
				SpriteRenderer.position[1] = damage.entity.position[1] - perc * 4;
				SpriteRenderer.position[2] = damage.entity.position[2] + 2 + Math.sin( -Math.PI/2 + ( Math.PI * (0.5 + perc * 1.5 ) ) ) * 5;
				if(damage.soundFile){
					if(damage.type & Damage.TYPE.ENDURE){
						Sound.playPosition(EndureSound, damage.entity.position);
					}

					Sound.playPosition(damage.soundFile, damage.entity.position);
					delete damage.soundFile;
				}
			}

			// Heal
			else if (damage.type & Damage.TYPE.HEAL) {
				size = Math.max( (1 - perc * 2) * 3, 0.8);
				SpriteRenderer.position[0] = damage.entity.position[0];
				SpriteRenderer.position[1] = damage.entity.position[1];
				SpriteRenderer.position[2] = damage.entity.position[2] + 2 + ( perc < 0.4 ? 0 : (perc - 0.4) *5 );
			}

			// Miss
			else if (damage.type & Damage.TYPE.MISS) {
				perc = (( tick - damage.startTick ) / 800);
				size = 0.5;
				SpriteRenderer.position[0] = damage.entity.position[0];
				SpriteRenderer.position[1] = damage.entity.position[1];
				SpriteRenderer.position[2] = damage.entity.position[2] + 3.5 + perc * 7;
			}

			// Miss
			else if (damage.type & Damage.TYPE.LUCKY) {
				perc = (( tick - damage.startTick ) / 800);
				size = 0.5;
				SpriteRenderer.position[0] = damage.entity.position[0];
				SpriteRenderer.position[1] = damage.entity.position[1];
				SpriteRenderer.position[2] = damage.entity.position[2] + 3.5 + perc * 7;
			}

			SpriteRenderer.size[0] = damage.width  * size;
			SpriteRenderer.size[1] = damage.height * size;
			damage.color[3]        = 1.0 - perc;

			if(damage.offset){
				SpriteRenderer.offset[0] = damage.offset[0];
				SpriteRenderer.offset[1] = damage.offset[1];
			} else {
				SpriteRenderer.offset[0] = 0;
				SpriteRenderer.offset[1] = 0;
			}

			SpriteRenderer.depth = i;

			SpriteRenderer.color.set( damage.color );
			SpriteRenderer.image.texture = damage.texture;
			SpriteRenderer.render();
		}

		// Restore GL state
		SpriteRenderer.setDepthMask(true);
		gl.enable(gl.DEPTH_TEST);
		SpriteRenderer.disableDepthCorrection = false;
		SpriteRenderer.unbind( gl );
	};

	/**
	 * Export
	 */
	return Damage;
});
