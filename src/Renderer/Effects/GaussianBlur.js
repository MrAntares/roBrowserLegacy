/**
 * Renderer/Effects/GaussianBlur.js
 * Implementation of Full Screen Gaussian Blur.
 * Smooth, uniform blur with configurable intensity.
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
		uniform float uBlurIntensity;
		uniform float uFocusRadius;
		uniform float uFocusFalloff;

		in vec2 vUv;
		out vec4 fragColor;

		const float RADIUS = 3.0; 

		void main() {
			float dist = distance(vUv, vec2(0.5));

			float effectMask = smoothstep(uFocusRadius, uFocusRadius + uFocusFalloff, dist);
			if (effectMask <= 0.01) {
				fragColor = texture(uTexture, vUv);
				return;
			}

			vec2 texelSize = 1.0 / uResolution;
			vec4 color = vec4(0.0);
			float totalWeight = 0.0;

			float currentIntensity = uBlurIntensity * effectMask;
			float sigma = currentIntensity * 0.5;
			float sigma2 = 2.0 * sigma * sigma;
			float piSigma2 = 3.14159 * sigma2;

			for (float x = -RADIUS; x <= RADIUS; x++) {
				for (float y = -RADIUS; y <= RADIUS; y++) {
					vec2 offset = vec2(x, y) * currentIntensity;
					float weight = exp(-(x*x + y*y) / sigma2) / piSigma2;

					color += texture(uTexture, vUv + offset * texelSize) * weight;
					totalWeight += weight;
				}
			}

			fragColor = color / totalWeight;
		}
	`;

	function GaussianBlur() {}

	GaussianBlur.render = function render(gl, texture, framebuffer = null) {
		if (!_buffer || !_program || !GaussianBlur.isActive()) return;

		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		GaussianBlur.beforeRender(gl);

		gl.useProgram(_program);

		var intensity = GraphicsSettings.blurIntensity || 2.5;

		var focusRadius = GraphicsSettings.blurArea / 100; 
		var focusFalloff = 0.5; 

		gl.uniform1f(_program.uniform.uBlurIntensity, intensity);
		gl.uniform1f(_program.uniform.uFocusRadius, focusRadius);
		gl.uniform1f(_program.uniform.uFocusFalloff, focusFalloff);
		gl.uniform2f(_program.uniform.uResolution, gl.canvas.width, gl.canvas.height);

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
