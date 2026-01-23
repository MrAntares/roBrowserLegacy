/**
 * Renderer/Effects/Bloom.js
 * Implementation of the Bloom post-processing effect.
 * Supports downsampling via a two-pass approach:
 * 1. Prefilter (Threshold + Downsample to internal FBO + Soft Blur)
 * 2. Composite (Mix Original Scene + Upsampled Bloom)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(function(require) {
	'use strict';

	var GraphicsSettings = require('Preferences/Graphics');
	var WebGL            = require('Utils/WebGL'); 
	var PostProcess      = require('Renderer/Effects/PostProcess');

	var _programs = {};
	var _buffer;
	var _internalFbo;
	var _downsampleFactor = 0.25; // 25% resolution for performance and softer blur

	/**
	 * Vertex Shader: Common quad
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
	 * Pass 1 Shader: Extract brightness (Threshold)
	 * This runs on the small internal FBO.
	 */
	var prefilterFS = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision mediump float;
		uniform sampler2D uTexture;
		uniform float uBloomThreshold;
		uniform float uBloomSoftKnee;
		uniform vec2 uTexelSize;

		in vec2 vUv;
		out vec4 fragColor;

		float luminance(vec3 c) {
			return dot(c, vec3(0.2126, 0.7152, 0.0722)); // Use BT.709 coefficients  
		}

		float threshold(float l, float threshold, float knee) {  
			float soft = l - threshold + knee;  
			soft = clamp(soft, 0.0, 2.0 * knee);  
			return max(soft * soft / (4.0 * knee + 1e-6), l - threshold) / max(l, 1e-6);  
		}  

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

			// Soft Threshold logic (Knee curve)
			float contribution = threshold(l, uBloomThreshold, uBloomThreshold * uBloomSoftKnee);

			fragColor = vec4(color * contribution, 1.0);
		}
	`;

	/**
	 * Pass 2 Shader: Composite
	 * Mixes the sharp original scene with the blurred bloom texture.
	 */
	var compositeFS = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision mediump float;
		uniform sampler2D uSceneTexture;
		uniform sampler2D uBloomTexture;
		uniform float uBloomIntensity;

		in vec2 vUv;
		out vec4 fragColor;

		void main() {
			vec3 original = texture(uSceneTexture, vUv).rgb; 
			// Hardware handles bilinear upsampling here
			vec3 bloom = texture(uBloomTexture, vUv).rgb;
			fragColor = vec4(original + (bloom * uBloomIntensity), 1.0);
		}
	`;

	/**
	 * @constructor Bloom
	 */
	function Bloom() {}

	/**
	 * Renders the Bloom effect
	 * @param {WebGLRenderingContext} gl - WebGL Context
	 * @param {WebGLTexture} inputTexture - Full resolution scene texture
	 * @param {WebGLFramebuffer} outputFramebuffer - Destination (Screen or next effect)
	 */
	Bloom.render = function render(gl, inputTexture, outputFramebuffer) {
		if (!_buffer || !_programs.prefilter || !Bloom.isActive()) return;

		// --- PASS 1: Downsample & Extract Brightness ---
		// We render to the internal small FBO
		gl.bindFramebuffer(gl.FRAMEBUFFER, _internalFbo.framebuffer);
		gl.viewport(0, 0, _internalFbo.width, _internalFbo.height);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(_programs.prefilter);
		
		// Update uniforms
		gl.uniform1f(_programs.prefilter.uniform.uBloomThreshold, 0.88);
		gl.uniform1f(_programs.prefilter.uniform.uBloomSoftKnee, 0.45);
		var boxsampleFactor = 4.0;
		gl.uniform2f(_programs.prefilter.uniform.uTexelSize, (1.0/_internalFbo.width)*boxsampleFactor, (1.0/_internalFbo.width)*boxsampleFactor);  

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _programs.prefilter.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		// Bind Source (Full Res Scene)
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_programs.prefilter.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		// --- PASS 2: Composite ---
		// We render to the destination (Full Res)
		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
		
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.useProgram(_programs.composite);
		
		// Attributes (buffer already bound)
		posLoc = _programs.composite.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1f(_programs.composite.uniform.uBloomIntensity, GraphicsSettings.bloomIntensity);

		// Unit 0: Original Scene (Sharp)
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_programs.composite.uniform.uSceneTexture, 0);

		// Unit 1: Bloom Result (Blurred/Downsampled)
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, _internalFbo.texture);
		gl.uniform1i(_programs.composite.uniform.uBloomTexture, 1);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		Bloom.afterRender(gl);
	};

	/**
	 * Cleans up bindings
	 */
	Bloom.afterRender = function(gl) {
		gl.useProgram(null);  
		gl.bindBuffer(gl.ARRAY_BUFFER, null);  
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	/**
	 * Initializes shaders and buffers
	 */
	Bloom.init = function init(gl) {
		if (!gl) return;

		try {
			_programs.prefilter = WebGL.createShaderProgram(gl, commonVS, prefilterFS);
			_programs.composite = WebGL.createShaderProgram(gl, commonVS, compositeFS);
		} catch (e) {
			console.error("Error compiling BLOOM shader.", e);
			return;
		}

		var quadVertices = new Float32Array([
			-1, -1, 1, -1, -1,  1,
			-1,  1, 1, -1,  1,  1
		]);

		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

		// Create the downsampled internal buffer
		this.recreateFbo(gl, gl.canvas.width, gl.canvas.height);
	};

	/**
	 * Recreates the Internal FBO when the window size changes
	 */
	Bloom.recreateFbo = function recreateFbo(gl, width, height) {
		if(_programs.prefilter)
			_internalFbo = PostProcess.createFbo(gl, width, height, _internalFbo, _downsampleFactor);
	};

	/** @returns {boolean} Whether the effect is active */
	Bloom.isActive = function isActive() {
		return GraphicsSettings.bloom;
	};

	/** @returns {WebGLProgram} The loaded shader program (returning one for validation check) */
	Bloom.program = function program() {
		return _programs.prefilter;
	};

	/** Clears memory references */
	Bloom.clean = function clean( gl ) {
		_programs = {};
		_buffer = null;
		// Physically delete Internal Buffer from GPU memory
		if (_internalFbo) {
			if (gl.isTexture(_internalFbo.texture)) gl.deleteTexture(_internalFbo.texture);
			if (gl.isRenderbuffer(_internalFbo.rbo)) gl.deleteRenderbuffer(_internalFbo.rbo);
			if (gl.isFramebuffer(_internalFbo.framebuffer)) gl.deleteFramebuffer(_internalFbo.framebuffer);
		}
		_internalFbo = null;
	};

	return Bloom;
});