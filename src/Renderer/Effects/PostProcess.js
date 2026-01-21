/**
 * Renderer/Effects/PostProcess.js
 *
 * Helper utilities for managing Framebuffer Objects (FBO)
 * used in post-processing effects.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(function(require) {
	'use strict';

	var WebGL            = require('Utils/WebGL'); 

	var _effects = [];
	var _activeEffects = [];

	function PostProcess() {}

	/**
	 * Register module in pass priority order and init
	 * @param {ShaderModule} module - Post Process Modular effect.
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 */
	PostProcess.register = function( module, gl ) {
		if(!module.program || !module.isActive || !module.getFbo || !module.init || !module.render || !module.clean)
		{
			console.error('[PostProcess] Incorrect modular Post-Process format registred - please Fix');
			return;
		}
		_effects.push(module);
		module.init( gl );
	};

	/**
	 * Prepare first pass FBO if it's need.
	 * @param {WebGLRenderingContext} gl - The WebGL context.
	 */
	PostProcess.prepare = function( gl ) {
		_activeEffects = _effects.filter(e => e.program() && e.isActive());
		
		if (_activeEffects.length > 0) {
			// The first active effect provides the FBO for the initial scene drawing.
			var fbo = _activeEffects[0].getFbo();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
		}
		else
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	};

	/**
	* Executes the post-processing pipeline. (Auto Ping-Pong)
	* @param {WebGLRenderingContext} gl - The WebGL context.
	*/
	PostProcess.render = function( gl ) {
		if (_activeEffects.length === 0) return;

		for (var i = 0; i < _activeEffects.length; i++) {
			var current = _activeEffects[i];
			var next = _activeEffects[i + 1];
			
			// If there is a subsequent effect, render it in its FBO.
			// If it's the last one, render it to the screen (null).
			var targetFbo = next ? next.getFbo().framebuffer : null;
			var sourceTexture = current.getFbo().texture;

			current.render(gl, sourceTexture, targetFbo);
		}
	};

	/**
	 * restart Modules when crashs
	 */
	PostProcess.restartModules = function restartModules(gl, width, height) {
		for (var i = 0; i < _activeEffects.length; i++) {
			var module = _activeEffects[i];
			module.clean();
			module.init(gl);
		}
	};

	/**
	 * Recreates the FBO when the window size changes
	 */
	PostProcess.recreateFbo = function recreateFbo(gl, width, height) {
		for (var i = 0; i < _effects.length; i++) {
			var module = _effects[i];
			module.recreateFbo(gl, width, height);
		}
	};

	/**
	 * Clean current registered modules
	 */
	PostProcess.clean = function() {
		for (var i = 0; i < _effects.length; i++) {
			var module = _effects[i];
			module.clean();
		}
		_effects = [];
		_activeEffects = [];
	};

	/**
	 * Creates or validates an existing FBO by comparing dimensions.
	 * @param {WebGLRenderingContext} gl
	 * @param {number} width - Desired width
	 * @param {number} height - Desired height
	 * @param {Object} fbo - Current FBO object (if it exists)
	 * @returns {Object|null} New FBO object or the current one if still valid
	 */
	PostProcess.createFbo = function(gl, width, height, fbo) {
		try {
			if (!fbo || fbo.width !== width || fbo.height !== height) {
				return this.createFramebuffer(gl, width, height, fbo);
			}
			return fbo;
		} catch (e) {
			console.error("Failed to create PostProcess FBOs:", e);
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
				if(gl.isTexture(oldfbo.texture)) gl.deleteTexture(oldfbo.texture);
				if(gl.isRenderbuffer(oldfbo.rbo)) gl.deleteRenderbuffer(oldfbo.rbo);
				if(gl.isFramebuffer(oldfbo.framebuffer)) gl.deleteFramebuffer(oldfbo.framebuffer);
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
				throw new Error("WebGL::createFramebuffer() - Incomplete Framebuffer! Status: " + status);
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
			console.error("WebGL::createFramebuffer failed (likely OOM or context loss):", e);
			// Clean up partially created resources
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			return null;
		}
	};

	return PostProcess;
});