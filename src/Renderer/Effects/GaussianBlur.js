/**
 * Renderer/Effects/GaussianBlur.js
 * Implementation of Radial Gaussian Blur.
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

	var _program, _buffer;

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
	 */
	var blurFS = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision mediump float;

		uniform sampler2D uTexture;
		uniform float uFocusRadius;
		uniform float uFocusFalloff;
		uniform vec2 uTexelSize;

		in vec2 vUv;
		out vec4 fragColor;

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

	/**
	 * Renders the Blur effect
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLTexture} inputTexture - Texture from previous pass
	 * @param {WebGLFramebuffer} outputFramebuffer - Target buffer
	 */
	GaussianBlur.render = function render(gl, inputTexture, outputFramebuffer) {
		if (!_buffer || !_program || !GaussianBlur.isActive()) return;

		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
		
		// Viewport handling
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(_program);

		var focusRadius = GraphicsSettings.blurArea / 100; 
		var focusFalloff = 0.5; 

		gl.uniform1f(_program.uniform.uFocusRadius, focusRadius);
		gl.uniform1f(_program.uniform.uFocusFalloff, focusFalloff);

		var boxsampleFactor = GraphicsSettings.blurIntensity;
  
		gl.uniform2f(_program.uniform.uTexelSize, (1.0/gl.canvas.width)*boxsampleFactor, (1.0/gl.canvas.height)*boxsampleFactor);  

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
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
	};

	GaussianBlur.isActive = function isActive() {
		return GraphicsSettings.blur;
	};

	GaussianBlur.program = function program() { return _program; };
	
	// No internal FBO needed for this effect in this architecture
	GaussianBlur.clean = function clean( gl ) { _program = _buffer = null; };

	return GaussianBlur;
});