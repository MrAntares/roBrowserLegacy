/**
 * Renderer/Effects/Shaders/Blind.js
 * Implementation of Radial Blindness effect.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(function(require) {
	'use strict';

	var WebGL            = require('Utils/WebGL'); 
	var Camera           = require('Renderer/Camera');  

	var _program, _buffer;
	var _active = false;

	var commonVS = require('text!./GLSL/Common.vs');

	/**
	 * Fragment Shader: Radial Blindness
	 */
	var blindFS = require('text!./GLSL/Blind.fs');

	function Blind() {}

	/**
	 * Renders the Blind effect
	 * @param {WebGLRenderingContext} gl
	 * @param {WebGLTexture} inputTexture - Texture from previous pass
	 * @param {WebGLFramebuffer} outputFramebuffer - Target buffer
	 */
	Blind.render = function render(gl, inputTexture, outputFramebuffer) {
		if (!_buffer || !_program || !Blind.isActive()) return;

		gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
		
		// Viewport handling
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(_program);

		var baseRadius = 0.20;  
		var baseFalloff = 0.5;  
		var zoom = Camera.zoomFinal;  
      
		var focusRadius = baseRadius + ((63 - zoom)/1000);
		var focusFalloff = baseFalloff + ((63 - zoom)/1000);

		gl.uniform1f(_program.uniform.uFocusRadius, focusRadius);
		gl.uniform1f(_program.uniform.uFocusFalloff, focusFalloff);
		gl.uniform2f(_program.uniform.uAspectRatio, gl.canvas.width / gl.canvas.height,1.0);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		var posLoc = _program.attribute.aPosition;
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, inputTexture);
		gl.uniform1i(_program.uniform.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		Blind.afterRender(gl);
	};

	Blind.afterRender = function(gl) {
		if (!_buffer || !_program) return;
		gl.useProgram(null);  
		gl.bindBuffer(gl.ARRAY_BUFFER, null);  
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	Blind.init = function init(gl) {
		if (!gl) return;
		try {
			_program = WebGL.createShaderProgram(gl, commonVS, blindFS);
		} catch (e) {
			console.error("Error compiling Blind shader.", e);
			return;
		}
		var quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
	};

	Blind.isActive = function isActive() {
		return _active;
	};

	Blind.setActive = function setActive( bool ) {
		_active = bool;
	};

	Blind.program = function program() { return _program; };
	
	// No internal FBO needed for this effect in this architecture
	Blind.clean = function clean( gl ) {
		if (_buffer) gl.deleteBuffer(_buffer);
		_program = _buffer = null; 
	};

	return Blind;
});