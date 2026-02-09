/**
 * Renderer/Renderer.js
 *
 * Rendering sprite in 2D or 3D context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var WebGL = require('Utils/WebGL');
	var jQuery = require('Utils/jquery');
	var glMatrix = require('Utils/gl-matrix');
	var Configs = require('Core/Configs');
	var GraphicsSettings = require('Preferences/Graphics');
	var Events = require('Core/Events');
	var Background = require('UI/Background');
	var Cursor = require('UI/CursorManager');
	var Mouse = require('Controls/MouseEventHandler');
	var Camera = require('Renderer/Camera');
	var Session = require('Engine/SessionStorage');
	var PostProcess = require('Renderer/Effects/PostProcess');
	var mat4 = glMatrix.mat4;
	var getModule = require;

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
	Renderer.gl = null;

	/**
	 * @var {boolean} true when using a WebGL2 context
	 */
	Renderer.isWebGL2 = false;

	/**
	 * @var {boolean} flag for context lost state
	 */
	Renderer.contextLost = false;

	/**
	 * @var {HTMLElement} overlay for context loss message
	 */
	Renderer.errorOverlay = null;

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
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback)
		{
			return window.setTimeout(callback, 1000 / 60);
		};
	/**
	 * Shime for cancelAnimationFrame
	 */
	var _cancelAnimationFrame =
		window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		function (updateId)
		{
			window.clearTimeout(updateId);
		};
	/**
	 * Initialize renderer
	 */
	Renderer.init = function init(param)
	{
		if (!this.gl)
		{
			this.canvas.style.position = 'absolute';
			this.canvas.style.top = '0px';
			this.canvas.style.left = '0px';
			this.canvas.style.zIndex = 0;

			// Context Loss Listeners
			this.canvas.addEventListener('webglcontextlost', this.onContextLost.bind(this), false);
			this.canvas.addEventListener('webglcontextrestored', this.onContextRestored.bind(this), false);

			this.gl = WebGL.getContext(this.canvas, param);
			this.isWebGL2 = WebGL.isWebGL2(this.gl);

			if (typeof console !== 'undefined' && console.info)
			{
				console.info('Renderer using WebGL ' + (this.isWebGL2 ? '2' : '1') + ' context');
			}

			jQuery(window)
				.resize(this.onResize.bind(this))
				.on('contextmenu', function ()
				{
					return false;
				});

			this.render(null);
			this.resize();
		}

		var gl = this.gl;
		this.isWebGL2 = WebGL.isWebGL2(gl);

		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	/**
	 * Handle WebGL Context Loss
	 * stops the render loop and notifies the user
	 */
	Renderer.onContextLost = function (event)
	{
		event.preventDefault(); // Prevent default browser behavior (which is not restoring)
		this.contextLost = true;
		console.warn('[Renderer] WebGL Context Lost! Pausing rendering.');

		this.stop();

		// Create/Show overlay message
		if (!this.errorOverlay)
		{
			this.errorOverlay = document.createElement('div');
			this.errorOverlay.style.cssText =
				'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:10000; text-align:center;';
			this.errorOverlay.innerHTML =
				'<h2 style="color:#ff6b6b; margin-bottom:10px;">Graphics Context Lost</h2><p>The browser lost connection to the GPU.</p><p style="font-size:0.9em; opacity:0.8;">Attempting to restore automatically...</p>';
			document.body.appendChild(this.errorOverlay);
		}
		else
		{
			this.errorOverlay.style.display = 'flex';
		}
	};

	/**
	 * Handle WebGL Context Restoration
	 * Re-initializes WebGL state and resumes rendering
	 */
	Renderer.onContextRestored = function (event)
	{
		console.info('[Renderer] WebGL Context Restored! Re-initializing...');
		this.contextLost = false;

		if (this.errorOverlay)
		{
			this.errorOverlay.style.display = 'none';
		}

		var gl = this.gl;

		// Re-detect capabilities
		this.isWebGL2 = WebGL.isWebGL2(gl);

		// Reset Global GL State
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Restart post process active modules
		PostProcess.restartModules(gl);

		// Trigger resize to reset viewport and framebuffers
		this.resize();

		// Resume Render Loop
		this.render();
	};

	/**
	 * Show renderer
	 */
	Renderer.show = function show()
	{
		if (!this.canvas.parentNode)
		{
			document.body.appendChild(this.canvas);
		}
	};

	/**
	 * Remove renderer
	 */
	Renderer.remove = function remove()
	{
		if (this.canvas.parentNode)
		{
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
		Events.clearTimeout(this.resizeTimeOut);
		this.resizeTimeOut = Events.setTimeout(this.resize.bind(this), 500);
	};

	/**
	 * Resizing window
	 */
	Renderer.resize = function resize()
	{
		// Don't resize if context is lost
		if (this.contextLost || !this.gl) {return;}

		var width,
			height,
			quality,
			dpr = window.devicePixelRatio || 1;

		width = window.innerWidth || document.body.offsetWidth;
		height = window.innerHeight || document.body.offsetHeight;

		Mouse.screen.width = this.width = width;
		Mouse.screen.height = this.height = height;

		quality = Configs.get('quality', 100) / 100;
		width *= quality;
		height *= quality;

		this.canvas.width = width * dpr;
		this.canvas.height = height * dpr;
		this.canvas.style.width = this.width + 'px';
		this.canvas.style.height = this.height + 'px';

		try
		{
			this.gl.viewport(0, 0, width * dpr, height * dpr);
		}
		catch (e)
		{
			console.error('Viewport resize failed', e);
		}

		mat4.perspective(this.vFov, width / height, 1, 1000, Camera.projection);

		Background.resize(this.width, this.height);

		// Updates FBO sizes
		PostProcess.recreateFbo(this.gl, width * dpr, height * dpr);

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
		getModule('UI/UIManager').fixResizeOverflow(this.width, this.height);
	};

	/**
	 * @var {boolean} Rendering ?
	 */
	Renderer.rendering = false;

	/**
	 * Rendering scene
	 */
	Renderer._render = function render(time)
	{
		// Stop if context is lost
		if (this.contextLost) {return;}

		// time: DOMHighResTimeStamp (from rAF) or undefined if fallback
		var now = typeof time === 'number' ? time : Date.now();

		// bind cache for scheduling (avoid new bind each frame)
		if (!this._renderBound)
		{
			this._renderBound = this._render.bind(this);
		}

		// initialize lastFrameTime on first run
		if (typeof this._lastFrameTime === 'undefined' || this._lastFrameTime === 0)
		{
			this._lastFrameTime = now;
			// ensure tick has a sane initial value
			if (!this.tick) {this.tick = Date.now();}
		}

		// Throttle when frameLimit > 0
		if (this.frameLimit > 0)
		{
			var interval = 1000 / this.frameLimit;
			var elapsed = now - this._lastFrameTime;

			if (elapsed < interval)
			{
				// Not enough time elapsed for next allowed frame — schedule next rAF and exit
				this.updateId = _requestAnimationFrame(this._renderBound);
				return;
			}

			// Advance lastFrameTime preserving alignment (avoid time drift)
			// keep lastFrameTime at nearest interval boundary
			this._lastFrameTime = now - (elapsed % interval);
		}
		else
		{
			// No limit => run every rAF
			this._lastFrameTime = now;
		}

		// Use Date.now for serverTick and Events processing, to keep existing behavior intact
		var newTick = Date.now();

		// Increment serverTick with delta
		Session.serverTick += newTick - this.tick;

		// Update engine tick
		this.tick = newTick;

		// Execute events
		Events.process(this.tick);

		// Execute render callbacks
		var i, count;
		for (i = 0, count = this.renderCallbacks.length; i < count; ++i)
		{
			try
			{
				this.renderCallbacks[i](this.tick, this.gl);
			}
			catch (e)
			{
				// Defensive: a single callback shouldn't break the whole loop
				console.error('[Renderer] render callback error', e);

				// Memory Pressure Detection / Fallback
				// If we hit an error during rendering, check if it's OOM or Context Lost related
				if (this.gl.isContextLost())
				{
					// Handled by event listener, but break loop now
					return;
				}

				// Basic Heuristic: If errors persist or explicitly OOM
				// We could disable bloom/fancy effects here to recover
				if (GraphicsSettings.bloom)
				{
					console.warn('[Renderer] Disabling bloom due to render error (potential resource pressure)');
					GraphicsSettings.bloom = false;
				}
			}
		}

		Cursor.render(this.tick);

		// Schedule next frame
		this.updateId = _requestAnimationFrame(this._renderBound);
	};

	/**
	 * Start rendering
	 */
	Renderer.render = function renderCallback(fn)
	{
		if (fn)
		{
			this.renderCallbacks.push(fn);
		}

		if (!this.rendering)
		{
			this.rendering = true;

			// Cancel any previous interval/animation to be safe
			try
			{
				clearInterval(this.updateId);
			}
			catch (e) {}
			try
			{
				_cancelAnimationFrame(this.updateId);
			}
			catch (e) {}

			// Reset timing helpers so first rAF initializes cleanly
			this._lastFrameTime = 0;
			this._renderBound = this._render.bind(this);

			// Start loop with requestAnimationFrame (safer & sync with browser)
			this.updateId = _requestAnimationFrame(this._renderBound);
		}
	};

	/**
	 * Stop rendering
	 */
	Renderer.stop = function stop(fn)
	{
		// No callback specified, remove all
		if (!arguments.length)
		{
			this.renderCallbacks.length = 0;
			this.rendering = false; // Ensure rendering flag is cleared
			try
			{
				_cancelAnimationFrame(this.updateId);
			}
			catch (e) {}
			return;
		}

		var pos = this.renderCallbacks.indexOf(fn);
		if (pos > -1)
		{
			this.renderCallbacks.splice(pos, 1);
		}
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	};

	/**
	 * Export
	 */
	return Renderer;
});
