/**
 * Renderer/Effects/GaussianBlur.js
 * Implementation of Radial Gaussian Blur.
 * Smooth, uniform radial blur with configurable intensity and area.
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

	var _program, _buffer, _fbo;

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
	 * Fragment Shader: Single-Pass Gaussian Blur
	 * Uses a sampled grid to average pixel colors.
	 */
	var blurFS = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision mediump float;

		uniform sampler2D uTexture;
		uniform vec2 uResolution;
		uniform float uFocusRadius;
		uniform float uFocusFalloff;
		uniform vec2 uTexelSize;

		in vec2 vUv;
		out vec4 fragColor;

		// Got from ReShade https://github.com/crosire/reshade/blob/8cf85bd12d56697d756d4fcb45e501f5d1b540fa/res/shaders/mipmap_cs_5_0.hlsl#L10
		vec3 spdReduce4(vec3 c0, vec3 c1, vec3 c2, vec3 c3) {
			return (c0 + c1 + c2 + c3) * 0.25;
		}

		vec3 load_and_reduce(sampler2D tex, vec2 uv, vec2 texelSize, float intensity) {  
			vec2 offset = texelSize * (intensity * 0.5); 
			  
			vec3 c0 = texture(tex, uv + vec2(-offset.x, -offset.y)).rgb;  
			vec3 c1 = texture(tex, uv + vec2(offset.x, -offset.y)).rgb;  
			vec3 c2 = texture(tex, uv + vec2(-offset.x, offset.y)).rgb;  
			vec3 c3 = texture(tex, uv + vec2(offset.x, offset.y)).rgb;  
			  
			return spdReduce4(c0, c1, c2, c3);
		}  

		void main() {
			float dist = distance(vUv, vec2(0.5));
			vec3 original = texture(uTexture, vUv).rgb;
			float effectMask = smoothstep(uFocusRadius, uFocusRadius + uFocusFalloff, dist);

			if (effectMask <= 0.01) {
				fragColor = texture(uTexture, vUv);
				return;
			}

			vec3 blurred = load_and_reduce(uTexture, vUv, uTexelSize, effectMask);
			fragColor = vec4(mix(original, blurred, effectMask), 1.0);
		}
	`;

	function GaussianBlur() {}

	GaussianBlur.render = function render(gl, texture, framebuffer = null) {
		if (!_buffer || !_program || !GaussianBlur.isActive()) return;

		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		GaussianBlur.beforeRender(gl);

		gl.useProgram(_program);

		var focusRadius = GraphicsSettings.blurArea / 100; 
		var focusFalloff = 0.5; 

		gl.uniform1f(_program.uniform.uFocusRadius, focusRadius);
		gl.uniform1f(_program.uniform.uFocusFalloff, focusFalloff);
		gl.uniform2f(_program.uniform.uResolution, gl.canvas.width, gl.canvas.height);

		var boxsampleFactor = GraphicsSettings.blurIntensity;
  
		gl.uniform2f(_program.uniform.uTexelSize, (1.0/gl.canvas.width)*boxsampleFactor, (1.0/gl.canvas.height)*boxsampleFactor);  

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		GaussianBlur.afterRender(gl);
	};

	GaussianBlur.afterRender = function(gl) {
		if (!_buffer || !_program) return;
		gl.useProgram(null);  
		gl.bindBuffer(gl.ARRAY_BUFFER, null);  
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	GaussianBlur.beforeRender = function beforeRender(gl) {
		if (!_buffer || !_program) return;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	};

	GaussianBlur.init = function init(gl) {
		if (!gl) return;
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, blurFS);
		} catch (e) {
			console.error("Error compiling Lens Blur shader.", e);
			return;
		}
		var quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

		if (_program) {
			if(!(_fbo = PostProcess.createFbo(gl, gl.canvas.width, gl.canvas.height, _fbo))){
				GraphicsSettings.blur = false;
				_program = null;
			}
		}
	};

	GaussianBlur.recreateFbo = function recreateFbo(gl, width, height) {
		if(_program) _fbo = PostProcess.createFbo(gl, width, height, _fbo);
	};

	GaussianBlur.isActive = function isActive() {
		return GraphicsSettings.blur;
	};

	GaussianBlur.getFbo = function getFbo() { return _fbo; };
	GaussianBlur.program = function program() { return _program; };
	GaussianBlur.clean = function clean() { _program = _buffer = _fbo = null; };

	return GaussianBlur;
});
