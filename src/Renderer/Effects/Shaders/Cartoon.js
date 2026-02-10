/**
 * Renderer/Effects/Shaders/Cartoon.js
 * Implementation of a Cel-Shaded/Cartoon effect.
 * Performs edge detection and color posterization.
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

	var commonVS = require('text!./GLSL/Common.vs');

	var cartoonFS = require('text!./GLSL/Cartoon.fs');

	function Cartoon() {}

	Cartoon.render = function render(gl, inputTexture, outputFramebuffer) {
		if (!_buffer || !_program || !Cartoon.isActive()) {
			return;
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(_program);

		gl.uniform1f(_program.uniform.uPower, GraphicsSettings.cartoonPower || 1.5);
		gl.uniform1f(_program.uniform.uEdgeSlope, GraphicsSettings.cartoonEdgeSlope || 1.5);
		gl.uniform2f(_program.uniform.uTexelSize, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		Cartoon.afterRender(gl);
	};

	Cartoon.afterRender = function (gl) {
		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	Cartoon.init = function init(gl) {
		if (!gl) {
			return;
		}
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, cartoonFS);
		} catch (e) {
			console.error('Error compiling Cartoon shader.', e);
			return;
		}
		var quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
	};

	Cartoon.isActive = function isActive() {
		return GraphicsSettings.cartoonEnabled;
	};

	Cartoon.program = function program() {
		return _program;
	};

	Cartoon.clean = function clean(gl) {
		if (_buffer) {
			gl.deleteBuffer(_buffer);
		}
		_program = _buffer = null;
	};

	return Cartoon;
});
