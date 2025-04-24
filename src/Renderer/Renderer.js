/**
 * Renderer/Renderer.js
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
	var WebGL         = require('Utils/WebGL');
	var jQuery        = require('Utils/jquery');
	var glMatrix      = require('Utils/gl-matrix');
	var Configs       = require('Core/Configs');
	var GraphicsSettings = require('Preferences/Graphics');
	var Events        = require('Core/Events');
	var Background    = require('UI/Background');
	var Cursor        = require('UI/CursorManager');
	var Mouse         = require('Controls/MouseEventHandler');
	var Camera        = require('Renderer/Camera');
	var Session       = require('Engine/SessionStorage');
	var mat4          = glMatrix.mat4;
	var getModule     = require;


	/**
	 * Renderer Namespace
	 */
	var Renderer = {};


	/**
	 * @var {HTML5 canvas}
	 */
	Renderer.canvas = document.createElement('canvas');


	/**
	 * @var {WebGLContext}
	 */
	Renderer.gl     = null;


	/**
	 * @var {integer} screen width
	 */
	Renderer.width = 0;


	/**
	 * @var {integer} screen height
	 */
	Renderer.height = 0;


	/**
	 * @var {integer} store the last time the windows was resize (to avoid to resize the context on each 16ms)
	 */
	Renderer.resizeTimeOut = 0;


	/**
	 * @var {long} unique identifier of the current render callback (can be used for cancelAnimationFrame/clearInterval)
	 */
	Renderer.updateId = 0;


	/**
	 * @var {integer} frame rate limit
	 */
	Renderer.frameLimit = GraphicsSettings.fpslimit;


	/**
	 * @var {integer} game tick
	 */
	Renderer.tick = 0;
	
	/**
	 * @var {float} vertical field of view in degrees
	 */
	Renderer.vFov = 15.0;

	/**
	 * @var {function[]} callbacks to execute
	 */
	Renderer.renderCallbacks = [];


	/**
	 * Shime for requestAnimationFrame
	 */
	var _requestAnimationFrame =
		window.requestAnimationFrame        ||
		window.webkitRequestAnimationFrame  ||
		window.mozRequestAnimationFrame     ||
		window.oRequestAnimationFrame       ||
		window.msRequestAnimationFrame      ||
		function(callback){
			return window.setTimeout( callback, 1000/60 );
		}
	;


	/**
	 * Shime for cancelAnimationFrame
	 */
	var _cancelAnimationFrame =
		window.cancelAnimationFrame        ||
		window.webkitCancelAnimationFrame  ||
		window.mozCancelAnimationFrame     ||
		window.oCancelAnimationFrame       ||
		window.msCancelAnimationFrame      ||
		function(updateId){
			window.clearTimeout( updateId );
		}
	;


	/**
	 * Initialize renderer
	 */
	Renderer.init = function init( param )
	{
		if (!this.gl) {
			this.canvas.style.position = 'absolute';
			this.canvas.style.top      = '0px';
			this.canvas.style.left     = '0px';
			this.canvas.style.zIndex   =  0;

			this.gl = WebGL.getContext( this.canvas, param );

			jQuery(window)
				.resize(this.onResize.bind(this))
				.on('contextmenu',function(){
					return false;
				});

			this.render(null);
			this.resize();
		}

		var gl = this.gl;

		gl.clearDepth( 1.0 );
		gl.enable( gl.DEPTH_TEST );
		gl.depthFunc( gl.LEQUAL );

		gl.enable( gl.BLEND );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	};


	/**
	 * Show renderer
	 */
	Renderer.show = function show(){
		if (!this.canvas.parentNode) {
			document.body.appendChild(this.canvas);
		}
	};


	/**
	 * Remove renderer
	 */
	Renderer.remove = function remove(){
		if (this.canvas.parentNode) {
			document.body.removeChild(this.canvas);
		}
	};


	/**
	 * Get back WebGL Context
	 */
	Renderer.getContext = function getContext()
	{
		return this.gl;
	};


	/**
	 * Ask for resizing the window, avoid flooding the function (can flood the context), wait for 500ms each time
	 */
	Renderer.onResize = function onResize()
	{
		Events.clearTimeout( this.resizeTimeOut );
		this.resizeTimeOut = Events.setTimeout( this.resize.bind(this), 500 );
	};


	/**
	 * Resizing window
	 */
	Renderer.resize = function resize()
	{
		var width, height, quality, dpr = window.devicePixelRatio || 1;

		width  = window.innerWidth  || document.body.offsetWidth;
		height = window.innerHeight || document.body.offsetHeight;

		Mouse.screen.width  = this.width  = width;
		Mouse.screen.height = this.height = height;

		quality = Configs.get('quality', 100) / 100;
		width  *= quality;
		height *= quality;

		this.canvas.width         = width * dpr;
		this.canvas.height        = height * dpr;
		this.canvas.style.width   = this.width + 'px';
		this.canvas.style.height  = this.height + 'px';

		this.gl.viewport( 0, 0, width * dpr, height * dpr );

		mat4.perspective( this.vFov, width/height, 1, 1000, Camera.projection );

		Background.resize( this.width, this.height );

		/*
		* Note about this hack:
		 * require.js parse function and search for "require()" string.
		 * Once done, it get the files to use as dependencies for this function and
		 * load them before executing the function.
		 *
		 * As UI/UIManager was loaded as dependencies before Renderer/Renderer
		 * and in the file UI/UIManager, there were a dependencies for Renderer/Renderer,
		 * we just cause a big circular dependencies resulting as having Renderer variable as null in
		 * UI/UIManager.
		 */
		getModule('UI/UIManager').fixResizeOverflow( this.width, this.height );
	};


	/**
	 * @var {boolean} Rendering ?
	 */
	Renderer.rendering = false;


	/**
	 * Rendering scene
	 */
	Renderer._render = function render( timeDelta )
	{
		var newTick = Date.now();

		if( this.frameLimit > 0 ) {
			if( typeof( timeDelta ) !== 'undefined' ) {
				_cancelAnimationFrame( this.updateId );
			}

			if( ( 100 / ( newTick - this.tick ) ) > ( 1000 / this.frameLimit ) ) return;
		}
		else {
			if( typeof( timeDelta ) === 'undefined' ) {
				clearInterval( this.updateId );
			}

			this.updateId = _requestAnimationFrame( this._render.bind(this), this.canvas );
		}
		
		// Increment serverTick with delta
		Session.serverTick += (newTick - this.tick);

		// TODO: clamp this so we don't accumulate a huge delta if we're set inactive for a while
		this.tick = newTick;

		// Execute events
		Events.process( this.tick );

		var i, count;

		for (i = 0, count = this.renderCallbacks.length; i < count; ++i) {
			this.renderCallbacks[i]( this.tick, this.gl );
		}

		Cursor.render( this.tick );
	};


	/**
	 * Start rendering
	 */
	Renderer.render = function renderCallback( fn )
	{
		if (fn) {
			this.renderCallbacks.push(fn);
		}

		if (!this.rendering) {
			this.rendering = true;
			if( this.frameLimit > 0 ) {
				this.updateId = setInterval( this._render.bind(this), 1000 / this.frameLimit );
			}
			else {
				this._render();
			}
		}
	};


	/**
	 * Stop rendering
	 */
	Renderer.stop = function stop( fn )
	{
		// No callback specified, remove all
		if (!arguments.length) {
			this.renderCallbacks.length = 0;
			return;
		}

		var pos = this.renderCallbacks.indexOf(fn);
		if (pos > -1) {
			this.renderCallbacks.splice( pos, 1 );
		}
	};


	/**
	 * Export
	 */
	return Renderer;
});
