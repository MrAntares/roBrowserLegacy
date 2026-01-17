/**
 * Renderer/Effects/VerticalFlip.js
 *
 * Screen vertical inversion effect (Illusion/Hallucination effect).
 * Inverts UV coordinates in the fragment shader to draw the world upside down.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(['Utils/WebGL', 'Renderer/Effects/PostProcess', 'Core/Configs'], function(WebGL, PostProcess, Configs) {

	'use strict';

	var _program, _buffer, _fbo;
	var _active = false;

 	/**
	 * Vertex Shader: Passes position and texture coordinates to the fragment shader
	 */
	var vs = `
		#version 300 es
		#pragma vscode_glsllint_stage : vert
		in vec2 aPosition;
		in vec2 aTextureCoord;
		out vec2 vTextureCoord;
		void main() {
			vTextureCoord = aTextureCoord;
			gl_Position = vec4(aPosition, 0.0, 1.0);
		}
	`;

	/**
	 * Fragment Shader: Inverts the texture's Y axis (1.0 - y)
	 */
	var fs = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision highp float;
		in vec2 vTextureCoord;
		out vec4 fragColor;
		uniform sampler2D uTexture;
		void main() {
			fragColor = texture(uTexture, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
		}
	`;

	return {
		/**
		 * Initializes shaders and prepares the quad with texture coordinates
		 * @param {WebGLRenderingContext} gl
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

			if(_program){
				if(!(_fbo = PostProcess.createFbo(gl, gl.canvas.width, gl.canvas.height, _fbo))){
					_program = null;
					console.error('Failed to create VerticalFlip program');
				}
			}
		},

		/**
		 * Executes the inverted drawing
		 * @param {WebGLRenderingContext} gl
		 * @param {WebGLTexture} texture - Scene texture to be inverted
		 * @param {WebGLFramebuffer} [framebuffer=null] - Target (null for screen)
		 */
		render: function(gl, texture, framebuffer = null) {
			if (!_buffer || !_program || !_active) return;  


			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

			this.beforeRender(gl);
			gl.useProgram(_program);      
			gl.uniform1i(_program.uniform.uTexture, 0);    

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
			gl.bindTexture(gl.TEXTURE_2D, texture);      
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
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		},

		/** Prepares the viewport */
		beforeRender: function(gl) {  
			if (!_active || !_program || !_buffer) return;   
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		},

		/** Adjusts FBO on resize */
		recreateFbo:function(gl, width, height) {
			if(_program)
				_fbo = PostProcess.createFbo(gl, width, height, _fbo);
		},

		/** @returns {Object} Effect Framebuffer */
		getFbo: function() {
			return _fbo;
		},

		/** @returns {WebGLProgram} Shader program */
		program: function() {
			return _program;
		},

		/** Resets effect state */
		clean: function() {
			_active = false;
			_program = _buffer = _fbo = null;
		},

		/** @returns {boolean} Whether the illusion effect is active */
		isActive: function() { return _active; },

		/** @param {boolean} bool - Enables/disables the effect */
		setActive: function(bool) { _active = bool; }
	};
});