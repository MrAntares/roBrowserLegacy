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
	 * Detect Post-Processing can be Enabled (Bad Combination of Chrome+SoftwareOnly+IntelXE(block-listed by WebGL- crbug.com/41479539))
	 */
	function detectBadWebGL(gl) {
		const renderer = gl.getParameter(gl.RENDERER) || "";
		const vendor   = gl.getParameter(gl.VENDOR)   || "";
		const ua       = navigator.userAgent;

		const isSwiftShader = renderer.toLowerCase().includes("swiftshader");
		const isIntel       = vendor.toLowerCase().includes("intel");
		const isChrome      = /chrome|chromium/i.test(ua) && !/edg|opr/i.test(ua);

		return {
			isSwiftShader,
			isIntel,
			isChrome,
			shouldDisableBloom: isSwiftShader && isIntel && isChrome
		};
	}


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

			// Context Loss Listeners
			this.canvas.addEventListener('webglcontextlost', this.onContextLost.bind(this), false);
			this.canvas.addEventListener('webglcontextrestored', this.onContextRestored.bind(this), false);

			this.gl = WebGL.getContext( this.canvas, param );
			this.isWebGL2 = WebGL.isWebGL2(this.gl);

			if (typeof console !== 'undefined' && console.info) {
				console.info('Renderer using WebGL ' + (this.isWebGL2 ? '2' : '1') + ' context');
			}

			jQuery(window)
				.resize(this.onResize.bind(this))
				.on('contextmenu',function(){
					return false;
				});

			this.render(null);
			this.resize();
			const webglCheck = detectBadWebGL(this.gl);

			if (webglCheck.shouldDisableBloom) {
				console.warn("[WebGL] PostProcessing disabled due to WebGL compatibility issue:", {
					reason: "Intel + Chrome + SwiftShader",
					vendor: this.gl.getParameter(this.gl.VENDOR),
					renderer: this.gl.getParameter(this.gl.RENDERER),
					version:this. gl.getParameter(this.gl.VERSION)
				});
				GraphicsSettings.bloom = false;
			} else
				this.initPostProcessing();
		}

		var gl = this.gl;
		this.isWebGL2 = WebGL.isWebGL2(gl);

		gl.clearDepth( 1.0 );
		gl.enable( gl.DEPTH_TEST );
		gl.depthFunc( gl.LEQUAL );

		gl.enable( gl.BLEND );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
	};

	/**
	 * Handle WebGL Context Loss
	 * stops the render loop and notifies the user
	 */
	Renderer.onContextLost = function(event) {
		event.preventDefault(); // Prevent default browser behavior (which is not restoring)
		this.contextLost = true;
		console.warn("[Renderer] WebGL Context Lost! Pausing rendering.");
		
		this.stop();

		// Create/Show overlay message
		if (!this.errorOverlay) {
			this.errorOverlay = document.createElement('div');
			this.errorOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); color:white; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:10000; font-family:sans-serif; text-align:center;';
			this.errorOverlay.innerHTML = '<h2 style="color:#ff6b6b; margin-bottom:10px;">Graphics Context Lost</h2><p>The browser lost connection to the GPU.</p><p style="font-size:0.9em; opacity:0.8;">Attempting to restore automatically...</p>';
			document.body.appendChild(this.errorOverlay);
		} else {
			this.errorOverlay.style.display = 'flex';
		}
	};

	/**
	 * Handle WebGL Context Restoration
	 * Re-initializes WebGL state and resumes rendering
	 */
	Renderer.onContextRestored = function(event) {
		console.info("[Renderer] WebGL Context Restored! Re-initializing...");
		this.contextLost = false;

		if (this.errorOverlay) {
			this.errorOverlay.style.display = 'none';
		}

		var gl = this.gl;
		
		// Re-detect capabilities
		this.isWebGL2 = WebGL.isWebGL2(gl);

		// Reset Global GL State
		gl.clearDepth( 1.0 );
		gl.enable( gl.DEPTH_TEST );
		gl.depthFunc( gl.LEQUAL );
		gl.enable( gl.BLEND );
		gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

		// Re-initialize Post Processing (Shaders/Framebuffers need to be recreated)
		if (this.postProcessProgram) {
			this.postProcessProgram = null; // Clear old reference
		}
		
		// Only re-enable bloom if it was previously enabled and safe
		if (GraphicsSettings.bloom) {
			const webglCheck = detectBadWebGL(gl);
			if (!webglCheck.shouldDisableBloom) {
				this.initPostProcessing();
			}
		}
		
		// Trigger resize to reset viewport and framebuffers
		this.resize();

		// Resume Render Loop
		this.render();
	};


	/**
	 * Post Processing Helpers
	 */
	Renderer.createPostProcessFbos = function(gl, width, height) {
		try {
			if (!gl.fbo || gl.fbo.width !== width || gl.fbo.height !== height) {
				gl.fbo = WebGL.createFramebuffer(gl, width, height);
			}
		} catch (e) {
			console.error("Failed to create PostProcess FBOs:", e);
			// Fallback: Disable bloom if FBO creation fails (likely OOM)
			GraphicsSettings.bloom = false;
			this.postProcessProgram = null;
		}
	};

	Renderer._drawPostProcessQuad = function(gl, program, texture) {
		// Guard against lost buffer/context
		if (!Renderer.quadBuffer || !gl.isBuffer(Renderer.quadBuffer)) return;
		
		gl.bindBuffer(gl.ARRAY_BUFFER, Renderer.quadBuffer);

		var posLoc = program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};

	/**
	 * Initialize Post Processing
	 */
	Renderer.initPostProcessing = function() {
		var gl = this.gl;
		if (!gl || this.contextLost) return;

		var commonVS = `
			#version 300 es
			#pragma vscode_glsllint_stage : vert
			precision highp float;
			in vec2 aPosition;
			out vec2 vUv;

			void main() {
				vUv = aPosition * 0.5 + 0.5;
				gl_Position = vec4(aPosition, 0.0, 1.0);
			}
		`;

		var bloomFS = `
			#version 300 es
			#pragma vscode_glsllint_stage : frag
			precision mediump float;
			uniform sampler2D uTexture;
			uniform float uBloomIntensity;
			uniform float uBloomThreshold;
			uniform float uBloomSoftKnee;
			in vec2 vUv;
			out vec4 fragColor;

			float luminance(vec3 c) {
				return dot(c, vec3(0.2126, 0.7152, 0.0722));
			}

			void main() {
				vec3 color = texture(uTexture, vUv).rgb;
				float l = luminance(color);
				// ---- DARK AREA FILTER (BRIGHT PASS) ----
				float knee = uBloomThreshold * uBloomSoftKnee;
				float bloomFactor = smoothstep(
					uBloomThreshold - knee,
					uBloomThreshold + knee,
					l
				);
				vec3 bloom = color * bloomFactor * uBloomIntensity;
				fragColor = vec4(color + bloom, 1.0);
			}
		`;

		var bloomProgram = null;

		try {
			bloomProgram = WebGL.createShaderProgram(gl, commonVS, bloomFS);
		} catch (e) {
			console.error("Error when compiling shader BLOOM.", e);
			return;
		}

		this.postProcessProgram = bloomProgram;

		var quadVertices = new Float32Array([
			-1, -1,
			 1, -1,
			-1,  1,
			-1,  1,
			 1, -1,
			 1,  1
		]);

		this.quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

		if (this.postProcessProgram) {
			var width, height, quality, dpr = window.devicePixelRatio || 1;

			width  = window.innerWidth  || document.body.offsetWidth;
			height = window.innerHeight || document.body.offsetHeight;
			quality = Configs.get('quality', 100) / 100;

			var renderWidth = width * quality * dpr;
			var renderHeight = height * quality * dpr;

			this.createPostProcessFbos(gl, renderWidth, renderHeight);
		}
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
		// Don't resize if context is lost
		if (this.contextLost || !this.gl) return;
		
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

		try {
			this.gl.viewport( 0, 0, width * dpr, height * dpr );
		} catch(e) { console.error("Viewport resize failed", e); }

		mat4.perspective( this.vFov, width/height, 1, 1000, Camera.projection );

		Background.resize( this.width, this.height );

  		if (this.postProcessProgram) {
  	          this.createPostProcessFbos(this.gl, width * dpr, height * dpr);
		}

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
	Renderer._render = function render(time) {
		// Stop if context is lost
		if (this.contextLost) return;
		
		// time: DOMHighResTimeStamp (from rAF) or undefined if fallback
		var now = (typeof time === 'number') ? time : Date.now();
	
		// bind cache for scheduling (avoid new bind each frame)
		if (!this._renderBound) {
			this._renderBound = this._render.bind(this);
		}
	
		// initialize lastFrameTime on first run
		if (typeof this._lastFrameTime === 'undefined' || this._lastFrameTime === 0) {
			this._lastFrameTime = now;
			// ensure tick has a sane initial value
			if (!this.tick) this.tick = Date.now();
		}
	
		// Throttle when frameLimit > 0
		if (this.frameLimit > 0) {
			var interval = 1000 / this.frameLimit;
			var elapsed = now - this._lastFrameTime;
	
			if (elapsed < interval) {
				// Not enough time elapsed for next allowed frame — schedule next rAF and exit
				this.updateId = _requestAnimationFrame(this._renderBound);
				return;
			}
	
			// Advance lastFrameTime preserving alignment (avoid time drift)
			// keep lastFrameTime at nearest interval boundary
			this._lastFrameTime = now - (elapsed % interval);
		} else {
			// No limit => run every rAF
			this._lastFrameTime = now;
		}
	
		// Use Date.now for serverTick and Events processing, to keep existing behavior intact
		var newTick = Date.now();
	
		// Increment serverTick with delta
		Session.serverTick += (newTick - this.tick);
	
		// Update engine tick
		this.tick = newTick;
	
		// Execute events
		Events.process(this.tick);
	
		// Execute render callbacks
		var i, count;
		for (i = 0, count = this.renderCallbacks.length; i < count; ++i) {
			try {
				this.renderCallbacks[i](this.tick, this.gl);
			} catch (e) {
				// Defensive: a single callback shouldn't break the whole loop
				console.error('[Renderer] render callback error', e);
				
				// Memory Pressure Detection / Fallback
				// If we hit an error during rendering, check if it's OOM or Context Lost related
				if (this.gl.isContextLost()) {
					// Handled by event listener, but break loop now
					return;
				}

				// Basic Heuristic: If errors persist or explicitly OOM
				// We could disable bloom/fancy effects here to recover
				if (GraphicsSettings.bloom) {
					console.warn("[Renderer] Disabling bloom due to render error (potential resource pressure)");
					GraphicsSettings.bloom = false;
					this.postProcessProgram = null;
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
	Renderer.render = function renderCallback(fn) {
		if (fn) {
			this.renderCallbacks.push(fn);
		}
	
		if (!this.rendering) {
			this.rendering = true;
	
			// Cancel any previous interval/animation to be safe
			try {
				clearInterval(this.updateId);
			} catch (e) {}
			try {
				_cancelAnimationFrame(this.updateId);
			} catch (e) {}
	
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
	Renderer.stop = function stop( fn )
	{
		// No callback specified, remove all
		if (!arguments.length) {
			this.renderCallbacks.length = 0;
			this.rendering = false; // Ensure rendering flag is cleared
			try {
				_cancelAnimationFrame(this.updateId);
			} catch(e) {}
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
