/**
 * Renderer/Effects/Bloom.js
 * Implementation of the Bloom post-processing effect.
 * Filters bright areas of the scene and applies an additive blur to simulate intense light glow.
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
	var Configs          = require('Core/Configs');
	var PostProcess      = require('Renderer/Effects/PostProcess');

	var _program, _buffer, _fbo;

	/**
	 * Vertex Shader: Maps the quad to cover the entire screen
	 */
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

	/**
	 * Fragment Shader: Filters brightness and combines it with the original color
	 */
	var bloomFS = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision mediump float;
		uniform sampler2D uTexture;
		uniform float uBloomIntensity;
		uniform float uBloomThreshold;
		uniform float uBloomSoftKnee;
		uniform vec2 uTexelSize;

		in vec2 vUv;
		out vec4 fragColor;

		float luminance(vec3 c) {
			return dot(c, vec3(0.2126, 0.7152, 0.0722));
		}

		// Got from ReShade https://github.com/crosire/reshade/blob/8cf85bd12d56697d756d4fcb45e501f5d1b540fa/res/shaders/mipmap_cs_5_0.hlsl#L10
		vec3 spdReduce4(vec3 c0, vec3 c1, vec3 c2, vec3 c3) {
			return (c0 + c1 + c2 + c3) * 0.25;
		}

		vec3 load_and_reduce(sampler2D tex, vec2 uv, vec2 texelSize) {  
			vec2 offset = texelSize * 0.5;  
			  
			vec3 c0 = texture(tex, uv + vec2(-offset.x, -offset.y)).rgb;  
			vec3 c1 = texture(tex, uv + vec2(offset.x, -offset.y)).rgb;  
			vec3 c2 = texture(tex, uv + vec2(-offset.x, offset.y)).rgb;  
			vec3 c3 = texture(tex, uv + vec2(offset.x, offset.y)).rgb;  
			  
			return spdReduce4(c0, c1, c2, c3);
		}  

		void main() {
			vec3 color = load_and_reduce(uTexture, vUv, uTexelSize);  
			float l = luminance(color);
			// ---- DARK AREA FILTER (BRIGHT PASS) ----
			float knee = uBloomThreshold * uBloomSoftKnee;
			float bloomFactor = smoothstep(
				uBloomThreshold - knee,
				uBloomThreshold + knee,
				l
			);

			vec3 bloom = color * bloomFactor * uBloomIntensity;
			vec3 original = texture(uTexture, vUv).rgb; 
			fragColor = vec4(original + bloom, 1.0);
		}
	`;

	/**
	 * @constructor Bloom
	 */
	function Bloom() {}

	/**
	 * Renders the Bloom effect to the screen or a specific framebuffer
	 * @param {WebGLRenderingContext} gl - WebGL Context
	 * @param {WebGLTexture} texture - Input texture (original scene)
	 * @param {WebGLFramebuffer} [framebuffer=null] - Destination framebuffer
	 */
	Bloom.render = function render(gl, texture, framebuffer = null) {
		// Guard against lost buffer/context
		if (!_buffer || !_program || !Bloom.isActive()) return;

		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		Bloom.beforeRender(gl);

		gl.useProgram(_program);

		// Update uniforms based on user settings
		gl.uniform1f(_program.uniform.uBloomIntensity, GraphicsSettings.bloomIntensity);
		gl.uniform1f(_program.uniform.uBloomThreshold, 0.88); // Ignore Shadows factor
		gl.uniform1f(_program.uniform.uBloomSoftKnee, 0.45); // Soft Transition factor

		// boxsample Config
		var boxsampleFactor = 4.0;
  
		gl.uniform2f(_program.uniform.uTexelSize, (1.0/gl.canvas.width)*boxsampleFactor, (1.0/gl.canvas.height)*boxsampleFactor);  

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);

		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		Bloom.afterRender(gl);
	};

	/**
	 * Cleans up WebGL state after rendering
	 * @param {WebGLRenderingContext} gl
	 */
	Bloom.afterRender = function(gl) {
		// Guard against lost buffer/context
		if (!_buffer || !_program || !Bloom.isActive()) return;

		gl.useProgram(null);  
		gl.bindBuffer(gl.ARRAY_BUFFER, null);  
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	};

	/**
	 * Prepares the viewport and clears buffers before drawing
	 * @param {WebGLRenderingContext} gl
	 */
	Bloom.beforeRender = function beforeRender(gl) {
		if (!_buffer || !_program || !Bloom.isActive()) return;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	};

	/**
	 * Initializes shaders, geometry buffers, and FBO
	 * @param {WebGLRenderingContext} gl
	 */
	Bloom.init = function init(gl) {
		if (!gl) return;

		var bloomProgram = null;

		try {
			bloomProgram = WebGL.createShaderProgram(gl, commonVS, bloomFS);
		} catch (e) {
			console.error("Error compiling BLOOM shader.", e);
			return;
		}

		_program = bloomProgram;

		// Define a quad covering the entire screen (-1 to 1)
		var quadVertices = new Float32Array([
			-1, -1,
			 1, -1,
			-1,  1,
			-1,  1,
			 1, -1,
			 1,  1
		]);

		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

		if (_program) {
			// Create the necessary Framebuffer for the effect
			if(!(_fbo = PostProcess.createFbo(gl, gl.canvas.width, gl.canvas.height, _fbo))){
				// Fallback: Disable bloom if FBO creation fails (likely OOM)
				GraphicsSettings.bloom = false;
				_program = null;
				console.error('Failed to create bloom program');
			}
		}
	};

	/**
	 * Recreates the FBO when the window size changes
	 */
	Bloom.recreateFbo = function recreateFbo(gl, width, height) {
		if(_program)
			_fbo = PostProcess.createFbo(gl, width, height, _fbo);
	};

	/** @returns {boolean} Whether the effect is active in settings */
	Bloom.isActive = function isActive() {
		return GraphicsSettings.bloom;
	};

	/** @returns {Object} The Bloom FBO object */
	Bloom.getFbo = function getFbo() {
		return _fbo;
	};

	/** @returns {WebGLProgram} The loaded shader program */
	Bloom.program = function program() {
		return _program;
	};

	/** Clears memory references */
	Bloom.clean = function clean() {
		_program = _buffer = _fbo = null;
	};

	return Bloom;
});