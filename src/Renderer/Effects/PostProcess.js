/**
 * Renderer/Effects/PostProcess.js
 *
 * Manages the Post-Processing pipeline using a Ping-Pong buffer architecture.
 * Ensures the main scene is rendered at full resolution before applying effects.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var WebGL = require('Utils/WebGL');

	var _effects = [];
	var _activeEffects = [];

	// Ping-Pong Buffers (Full Resolution)
	var _readFbo = null;
	var _writeFbo = null;

	function PostProcess() {}

	/**
	 * Register module in pass priority order and init
	 * @param {ShaderModule} module - Post Process Modular effect.
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 */
	PostProcess.register = function (module, gl) {
		if (!module.program || !module.isActive || !module.init || !module.render || !module.clean) {
			console.error('[PostProcess] Incorrect modular Post-Process format registered - please Fix');
			return;
		}
		_effects.push(module);
		module.init(gl);
	};

	/**
	 * Prepare the pipeline for the scene rendering.
	 * Always binds a full-resolution buffer to ensure the 3D scene is sharp.
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 */
	PostProcess.prepare = function (gl) {
		_activeEffects = _effects.filter(e => e.isActive());

		// Ensure global buffers exist and match canvas size
		this.validateBuffers(gl);

		if (_activeEffects.length > 0) {
			// Render the scene into the write buffer (which becomes read buffer in .render())
			gl.bindFramebuffer(gl.FRAMEBUFFER, _writeFbo.framebuffer);
		} else {
			// No effects? Render directly to screen
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	};

	/**
	 * Executes the post-processing pipeline using Ping-Pong swapping.
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 */
	PostProcess.render = function (gl) {
		if (_activeEffects.length === 0) {
			return;
		}

		// The buffer we just drew the 3D scene into (_writeFbo) becomes the source (_readFbo)
		this.swapBuffers();

		for (var i = 0; i < _activeEffects.length; i++) {
			var effect = _activeEffects[i];
			var isLast = i === _activeEffects.length - 1;

			// Destination: Screen (null) if last, otherwise the next offscreen buffer
			var targetFbo = isLast ? null : _writeFbo.framebuffer;

			// Render the effect: Source (Read) -> Effect Logic -> Destination (Write)
			effect.render(gl, _readFbo.texture, targetFbo);

			// If not the last effect, swap buffers so the output becomes the input for the next one
			if (!isLast) {
				this.swapBuffers();
			}
		}
	};

	/**
	 * Swaps the read and write FBO references.
	 */
	PostProcess.swapBuffers = function () {
		var temp = _readFbo;
		_readFbo = _writeFbo;
		_writeFbo = temp;
	};

	/**
	 * Ensures Ping-Pong buffers are created and resized if necessary.
	 */
	PostProcess.validateBuffers = function (gl) {
		if (!_readFbo || _readFbo.width !== gl.canvas.width || _readFbo.height !== gl.canvas.height) {
			_readFbo = this.createFbo(gl, gl.canvas.width, gl.canvas.height, _readFbo);
			_writeFbo = this.createFbo(gl, gl.canvas.width, gl.canvas.height, _writeFbo);
		}
	};

	/**
	 * restart Modules when crashs
	 */
	PostProcess.restartModules = function restartModules(gl) {
		for (var i = 0; i < _activeEffects.length; i++) {
			var module = _activeEffects[i];
			module.clean(gl);
			module.init(gl);
		}
		_activeEffects = [];

		// Physically delete Ping-Pong buffers from GPU memory
		if (_readFbo) {
			if (gl.isTexture(_readFbo.texture)) {
				gl.deleteTexture(_readFbo.texture);
			}
			if (gl.isRenderbuffer(_readFbo.rbo)) {
				gl.deleteRenderbuffer(_readFbo.rbo);
			}
			if (gl.isFramebuffer(_readFbo.framebuffer)) {
				gl.deleteFramebuffer(_readFbo.framebuffer);
			}
		}

		if (_writeFbo) {
			if (gl.isTexture(_writeFbo.texture)) {
				gl.deleteTexture(_writeFbo.texture);
			}
			if (gl.isRenderbuffer(_writeFbo.rbo)) {
				gl.deleteRenderbuffer(_writeFbo.rbo);
			}
			if (gl.isFramebuffer(_writeFbo.framebuffer)) {
				gl.deleteFramebuffer(_writeFbo.framebuffer);
			}
		}

		_readFbo = null;
		_writeFbo = null;
	};

	/**
	 * Recreates the FBO when the window size changes
	 */
	PostProcess.recreateFbo = function recreateFbo(gl, width, height) {
		// Recreate global buffers
		_readFbo = this.createFbo(gl, width, height, _readFbo);
		_writeFbo = this.createFbo(gl, width, height, _writeFbo);

		// Notify modules to recreate their internal buffers (if any)
		for (var i = 0; i < _effects.length; i++) {
			var module = _effects[i];
			if (module.recreateFbo) {
				module.recreateFbo(gl, width, height);
			}
		}
	};

	/**
	 * Clean current registered modules
	 */
	PostProcess.clean = function (gl) {
		for (var i = 0; i < _effects.length; i++) {
			var module = _effects[i];
			module.clean(gl);
		}
		_effects = [];
		_activeEffects = [];

		// Physically delete Ping-Pong buffers from GPU memory
		if (_readFbo) {
			if (gl.isTexture(_readFbo.texture)) {
				gl.deleteTexture(_readFbo.texture);
			}
			if (gl.isRenderbuffer(_readFbo.rbo)) {
				gl.deleteRenderbuffer(_readFbo.rbo);
			}
			if (gl.isFramebuffer(_readFbo.framebuffer)) {
				gl.deleteFramebuffer(_readFbo.framebuffer);
			}
		}

		if (_writeFbo) {
			if (gl.isTexture(_writeFbo.texture)) {
				gl.deleteTexture(_writeFbo.texture);
			}
			if (gl.isRenderbuffer(_writeFbo.rbo)) {
				gl.deleteRenderbuffer(_writeFbo.rbo);
			}
			if (gl.isFramebuffer(_writeFbo.framebuffer)) {
				gl.deleteFramebuffer(_writeFbo.framebuffer);
			}
		}

		_readFbo = null;
		_writeFbo = null;
	};

	/**
	 * Creates or validates an existing FBO by comparing dimensions.
	 * @param {WebGLRenderingContext} gl
	 * @param {number} width - Desired width
	 * @param {number} height - Desired height
	 * @param {Object} fbo - Current FBO object (if it exists)
	 * @param {number} downsampleFactor - Multiplier for resolution (default 1.0)
	 * @returns {Object|null} New FBO object or the current one if still valid
	 */
	PostProcess.createFbo = function (gl, width, height, fbo, downsampleFactor = 1.0) {
		const targetWidth = Math.floor(width * downsampleFactor);
		const targetHeight = Math.floor(height * downsampleFactor);

		try {
			if (!fbo || fbo.width !== targetWidth || fbo.height !== targetHeight) {
				return this.createFramebuffer(gl, targetWidth, targetHeight, fbo);
			}
			return fbo;
		} catch (e) {
			console.error('Failed to create PostProcess FBOs:', e);
			return null;
		}
	};

	/**
	 * Physically creates the Framebuffer, Texture, and Renderbuffer in WebGL.
	 * @param {WebGLRenderingContext} gl
	 * @param {number} width
	 * @param {number} height
	 * @param {Object} oldfbo - Old object for resource cleanup
	 * @returns {Object|null}
	 */
	PostProcess.createFramebuffer = function createFramebuffer(gl, width, height, oldfbo) {
		try {
			if (oldfbo) {
				// Free old resources to prevent memory leaks
				if (gl.isTexture(oldfbo.texture)) {
					gl.deleteTexture(oldfbo.texture);
				}
				if (gl.isRenderbuffer(oldfbo.rbo)) {
					gl.deleteRenderbuffer(oldfbo.rbo);
				}
				if (gl.isFramebuffer(oldfbo.framebuffer)) {
					gl.deleteFramebuffer(oldfbo.framebuffer);
				}
			}

			var fbo = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

			// Setup Texture where the scene will be drawn
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

			// Parameters to avoid distortions
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

			// Setup Renderbuffer for depth testing (Z-buffer)
			var rbo = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

			// Validate Framebuffer state
			var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status !== gl.FRAMEBUFFER_COMPLETE) {
				throw new Error('WebGL::createFramebuffer() - Incomplete Framebuffer! Status: ' + status);
			}

			// Clean up bindings
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);

			return {
				framebuffer: fbo,
				texture: texture,
				rbo: rbo,
				width: width,
				height: height
			};
		} catch (e) {
			console.error('WebGL::createFramebuffer failed (likely OOM or context loss):', e);
			// Clean up partially created resources
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			return null;
		}
	};

	return PostProcess;
});
