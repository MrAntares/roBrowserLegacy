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

	var Session          = require('Engine/SessionStorage');
	var GraphicsSettings = require('Preferences/Graphics');
	var WebGL            = require('Utils/WebGL'); 

	function PostProcess() {}

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