/**
 * Renderer/Effects/VerticalFlip.js
 * Flip Camera
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(['Utils/WebGL', 'Renderer/Renderer'], function(WebGL, Renderer) {

	'use strict';

	var _program, _buffer;
	var _active = false;
	
	return {
	    init: function(gl) {
			if (_program) return;
			var vs = `
				#version 300 es
				in vec2 aPosition;
				in vec2 aTextureCoord;
				out vec2 vTextureCoord;
				void main() {
					vTextureCoord = aTextureCoord;
					gl_Position = vec4(aPosition, 0.0, 1.0);
			}`;
			var fs = `
				#version 300 es
				precision highp float;
				in vec2 vTextureCoord;
				out vec4 fragColor;
				uniform sampler2D uTexture;
				void main() {
					fragColor = texture(uTexture, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
			}`;
			_program = WebGL.createShaderProgram(gl, vs, fs);
			_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]), gl.STATIC_DRAW);
		},
		render: function(gl, modelView, projection, fog) {
			if (!_active || !gl.fbo ||!gl.fbo.framebuffer || !gl.fbo.texture) return; 

			var texture = gl.fbo.texture;

			gl.useProgram(_program);    
			gl.uniform1i(_program.uniform.uTexture, 0);  
		      
			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);    
			gl.enableVertexAttribArray(0);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);    
			gl.enableVertexAttribArray(1);    
			gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);    
			gl.activeTexture(gl.TEXTURE0);    
			gl.bindTexture(gl.TEXTURE_2D, texture);    
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);    
		},
		isActive: function() { return _active; },
		setActive: function(bool) { _active = bool; }
	};
});