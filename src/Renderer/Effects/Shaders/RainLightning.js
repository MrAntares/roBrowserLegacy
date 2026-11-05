/**
 * Renderer/Effects/Shaders/RainLightning.js
 *
 * Post-process pass that composites procedural lightning crossing the sky.
 * Receives the procedural lightning texture and alpha from RainWeather.js
 * and blends it additively over the scene in the post-process ping-pong pipeline.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import commonVS from './GLSL/Common.vs?raw';
import rainLightningFS from './GLSL/RainLightning.fs?raw';
import PostProcess from 'Renderer/Effects/PostProcess.js';
import RainWeather from 'Renderer/Effects/RainWeather.js';

let _program, _buffer;
let _dummyTexture = null;

let _lightningTexture = null;
let _lightningAlpha = 0.0;

class RainLightning {
	/**
	 * Composites the procedural lightning over the scene texture.
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLTexture} inputTexture - Texture from previous pass
	 * @param {WebGLFramebuffer|null} outputFbo - Target buffer (null = screen)
	 */
	static render(gl, inputTexture, outputFbo) {
		if (!_buffer || !_program || !this.isActive()) {
			return;
		}

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

		// Bind lightning texture
		gl.activeTexture(gl.TEXTURE1);
		const boltTex = _lightningTexture && gl.isTexture(_lightningTexture) ? _lightningTexture : _dummyTexture;
		gl.bindTexture(gl.TEXTURE_2D, boltTex);
		gl.uniform1i(_program.uniform.uLightningTex, 1);

		gl.uniform1f(_program.uniform.uLightningAlpha, _lightningTexture ? _lightningAlpha : 0.0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		PostProcess.afterRenderPass(gl);
	}

	static init(gl) {
		if (!gl) {
			return;
		}
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, rainLightningFS);
		} catch (e) {
			console.error('Error compiling RainLightning shader.', e);
			return;
		}

		const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

		// 1x1 empty fallback texture
		if (!_dummyTexture) {
			_dummyTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, _dummyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
	}

	static isActive() {
		return RainWeather.isActive();
	}

	/**
	 * Sets the procedural lightning texture and alpha for the current frame.
	 * Called by RainWeather.js during the flash envelope.
	 * @param {WebGLTexture|null} texture
	 * @param {number} alpha
	 */
	static setLightning(texture, alpha) {
		_lightningTexture = texture;
		_lightningAlpha = alpha;
	}

	static program() {
		return _program;
	}

	static clean(gl) {
		if (_buffer && gl && gl.isBuffer(_buffer)) {
			gl.deleteBuffer(_buffer);
		}
		if (_dummyTexture && gl && gl.isTexture(_dummyTexture)) {
			gl.deleteTexture(_dummyTexture);
		}
		_program = null;
		_buffer = null;
		_dummyTexture = null;
		_lightningTexture = null;
		_lightningAlpha = 0.0;
	}
}

export default RainLightning;

