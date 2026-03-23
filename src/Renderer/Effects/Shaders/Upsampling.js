/**
 * Renderer/Effects/Shaders/Upsampling.js
 * Implementation of the Upsampling post-processing effect.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var GraphicsSettings = require('Preferences/Graphics');
	var WebGL = require('Utils/WebGL');
	var PostProcess = require('Renderer/Effects/PostProcess');

	var _program;
	var _buffer;

	/**
	 * Vertex Shader: Common quad
	 */
	var commonVS = require('text!./GLSL/Common.vs');

	/**
	 * Fragment Shader: Upsample the scene.
	 */
	var compositeFS = require('text!./GLSL/CommonUpsampling.fs');

	/**
	 * @constructor Upsampling
	 */
	function Upsampling() {}

	/**
	 * Renders the Upsampling effect
	 * @param {WebGLRenderingContext} gl - WebGL Context
	 * @param {WebGLTexture} inputTexture - Low resolution scene texture
	 * @param {WebGLFramebuffer} outputFramebuffer - Destination (Screen or next effect)
	 */
	Upsampling.render = function render(gl, inputTexture, outputFbo) {
		if (!_buffer || !_program || !Upsampling.isActive()) {
			return;
		}
		PostProcess.beforeRenderPass(gl, outputFbo);

		gl.useProgram(_program);
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		let posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);

		// isso aqui já resolve o upscale
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.uniform1i(_program.uniform.uSceneTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		PostProcess.afterRenderPass(gl);
	};

	/**
	 * Initializes shaders and buffers
	 */
	Upsampling.init = function init(gl) {
		if (!gl) {
			return;
		}

		try {
			_program = WebGL.createShaderProgram(gl, commonVS, compositeFS);
		} catch (e) {
			console.error('Error compiling Upsampling shader.', e);
			return;
		}

		var quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
	};

	/** @returns {boolean} always false here */
	Upsampling.isActive = function isActive() {
		return GraphicsSettings.performanceMode;
	};

	/** @returns {WebGLProgram} The loaded shader program (returning one for validation check) */
	Upsampling.program = function program() {
		return _program;
	};

	/** Clears memory references */
	Upsampling.clean = function clean(gl) {
		_program = null;
		if (_buffer) {
			gl.deleteBuffer(_buffer);
		}
		_buffer = null;
	};

	return Upsampling;
});
