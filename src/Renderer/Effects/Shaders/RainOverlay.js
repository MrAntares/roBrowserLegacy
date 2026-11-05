/**
 * Renderer/Effects/Shaders/RainOverlay.js
 *
 * Post-process pass that blends a coloured overlay over the scene texture.
 * Replaces the former SpriteRenderer-based grey/thunder filter in RainWeather.js.
 * RainWeather calls setOverlay() every frame with the computed RGBA values;
 * this module composites them on the GPU via the PostProcess ping-pong pipeline.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import commonVS from './GLSL/Common.vs?raw';
import rainOverlayFS from './GLSL/RainOverlay.fs?raw';
import PostProcess from 'Renderer/Effects/PostProcess.js';
import RainWeather from 'Renderer/Effects/RainWeather.js';

let _program, _buffer;

// Overlay colour pushed by RainWeather each frame.
let _overlayR = 0.65;
let _overlayG = 0.67;
let _overlayB = 0.7;
let _overlayA = 0.0;

class RainOverlay {
	/**
	 * Composites the rain colour overlay over the scene texture.
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLTexture} inputTexture - Texture from previous pass
	 * @param {WebGLFramebuffer|null} outputFbo - Target buffer (null = screen)
	 */
	static render(gl, inputTexture, outputFbo) {
		if (!_buffer || !_program) return;
		const alpha = this.isActive() ? _overlayA : 0.0;

		PostProcess.beforeRenderPass(gl, outputFbo);

		gl.useProgram(_program);

		// Bind fullscreen quad
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		const posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		// Bind scene texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		// Upload overlay colour uniforms
		gl.uniform3f(_program.uniform.uOverlayColor, _overlayR, _overlayG, _overlayB);
		gl.uniform1f(_program.uniform.uOverlayAlpha, alpha);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		PostProcess.afterRenderPass(gl);
	}

	static init(gl) {
		if (!gl) {
			return;
		}
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, rainOverlayFS);
		} catch (e) {
			console.error('Error compiling RainOverlay shader.', e);
			return;
		}
		const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
	}

	static isActive() {
		return RainWeather.isActive();
	}

	/**
	 * Push overlay colour for the current frame.
	 * Called by RainWeather.render() before returning.
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	static setOverlay(r, g, b, a) {
		_overlayR = r;
		_overlayG = g;
		_overlayB = b;
		_overlayA = a;
	}

	static program() {
		return _program;
	}

	// RainOverlay.clean
	static clean(gl) {
		if (gl) {
			if (_buffer && gl.isBuffer(_buffer)) gl.deleteBuffer(_buffer);
			if (_program && gl.isProgram(_program)) gl.deleteProgram(_program);
		}
		_program = _buffer = null;
	}
}

export default RainOverlay;
