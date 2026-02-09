/**
 * Renderer/Effects/Shaders/FXAA.js
 * Implementation of Fast Approximate Anti-Aliasing (FXAA).
 * Smoothens jagged edges based on luma difference in a single pass.
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

	var _program, _buffer;
	var _fxaaEdgeThresholdMin = 0.0;

	var commonVS = require('text!./GLSL/Common.vs');

	var fxaaFS = require('text!./GLSL/FXAA.fs');

	function FXAA() {}

	FXAA.render = function render(gl, inputTexture, outputFramebuffer) {
		if (!_buffer || !_program || !FXAA.isActive()) {
			return;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(_program);

		gl.uniform1f(_program.uniform.uSubpix, GraphicsSettings.fxaaSubpix || 0.25);
		gl.uniform1f(_program.uniform.uEdgeThreshold, GraphicsSettings.fxaaEdgeThreshold || 0.125);
		gl.uniform1f(_program.uniform.uEdgeThresholdMin, 0.0);
		gl.uniform2f(_program.uniform.uTexelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		FXAA.afterRender(gl);
	};

	FXAA.afterRender = function (gl) {
		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	FXAA.init = function init(gl) {
		if (!gl) {
			return;
		}
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, fxaaFS);
		} catch (e) {
			console.error('Error compiling FXAA shader.', e);
			return;
		}
		var quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
	};

	FXAA.isActive = function isActive() {
		return GraphicsSettings.fxaaEnabled;
	};

	FXAA.program = function program() {
		return _program;
	};

	FXAA.clean = function clean(gl) {
		if (_buffer) {
			gl.deleteBuffer(_buffer);
		}
		_program = _buffer = null;
	};

	return FXAA;
});
