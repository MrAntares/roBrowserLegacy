/**
 * Renderer/Effects/Shaders/VerticalFlip.js
 *
 * Screen vertical inversion effect (Illusion/Hallucination effect).
 * Inverts UV coordinates in the fragment shader.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(['text!./Imports/VerticalFlip.vert', 'text!./Imports/VerticalFlip.fs', 'Utils/WebGL', 'Renderer/Effects/PostProcess', 'Core/Configs'], function(vs, fs, WebGL, PostProcess, Configs) {

	'use strict';

	var _program, _buffer;
	var _active = false;

	return {
		/**
		 * Initializes shaders and buffers
		 */
		init: function(gl) {
			if (_program) return;
			try {
				_program = WebGL.createShaderProgram(gl, vs, fs);
			} catch (e) {
				console.error("Error when compiling shader VerticalFlip.", e);
				return;
			}

			_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);

			// Format: X, Y, U, V (Draws a TRIANGLE_STRIP quad)
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]), gl.STATIC_DRAW);
		},

		/**
		 * Executes the inverted drawing
		 * @param {WebGLRenderingContext} gl
		 * @param {WebGLTexture} inputTexture - Texture to be inverted
		 * @param {WebGLFramebuffer} outputFramebuffer - Target
		 */
		render: function(gl, inputTexture, outputFramebuffer) {
			if (!_buffer || !_program || !_active) return;  

			gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
			
			// Viewport
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.useProgram(_program);      

			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);   
   
			// Position Attribute (X, Y)
			var posLoc = _program.attribute.aPosition;
			gl.enableVertexAttribArray(posLoc);  
			gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

			// Texture Coordinate Attribute (U, V)
			posLoc = _program.attribute.aTextureCoord;
			gl.enableVertexAttribArray(posLoc);
			gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 8);      
            
			gl.activeTexture(gl.TEXTURE0);      
			gl.bindTexture(gl.TEXTURE_2D, inputTexture);      
			gl.uniform1i(_program.uniform.uTexture, 0);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			this.afterRender(gl);  
		},

		/** Cleans up WebGL states */
		afterRender: function(gl) {  
			if (!_active || !_program || !_buffer) return; 

			gl.useProgram(null);  
			gl.bindBuffer(gl.ARRAY_BUFFER, null);  
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		},

		/**
		 * @returns {WebGLProgram} Shader program
		 */
		program: function() {
			return _program;
		},

		/** Resets effect state */
		clean: function( gl ) {
			_active = false;
			if (_buffer) gl.deleteBuffer(_buffer);
			_program = _buffer = null;
		},

		/** @returns {boolean} Whether the effect is active */
		isActive: function() { return _active; },

		/** @param {boolean} bool - Enables/disables the effect */
		setActive: function(bool) { _active = bool; }
	};
});