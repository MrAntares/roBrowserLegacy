/**
 * @module Renderer/Map/Models
 *
 * Rendering Models
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define([
	'text!Renderer/Effects/Shaders/GLSL/Models.vs',
	'text!Renderer/Effects/Shaders/GLSL/Models.fs',
	'Utils/WebGL',
	'Preferences/Map'
], function (_vertexShader, _fragmentShader, WebGL, Preferences)
{
	'use strict';

	/**
	 * @var {WebGLProgram}
	 */
	var _program = null;

	/**
	 * @var {WebGLBuffer}
	 */
	var _buffer = null;

	/**
	 * @var {Array} list of meshes
	 */
	var _objects = [];

	/**
	 * Initialize models
	 *
	 * @param {object} gl context
	 * @param {object} data ( models )
	 */
	function init(gl, data)
	{
		var i, count;
		var objects;

		objects = data.infos;
		count = objects.length;
		_objects.length = count;

		// Bind buffer
		if (!_buffer)
		{
			_buffer = gl.createBuffer();
		}

		if (!_program)
		{
			_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);

		function onTextureLoaded(texture, i)
		{
			_objects[i].texture = texture;
			_objects[i].complete = true;
		}

		// Fetch all images, and draw them in a mega-texture
		for (i = 0; i < count; ++i)
		{
			if (!_objects[i])
			{
				_objects[i] = {};
			}

			_objects[i].vertCount = data.infos[i].vertCount;
			_objects[i].vertOffset = data.infos[i].vertOffset;
			_objects[i].complete = false;

			WebGL.texture(gl, data.infos[i].texture, onTextureLoaded, i);
		}
	}

	/**
	 * Render models
	 *
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {mat3} normalMat
	 * @param {object} fog structure
	 * @param {object} light structure
	 */
	function render(gl, modelView, projection, normalMat, fog, light)
	{
		var uniform = _program.uniform;
		var attribute = _program.attribute;
		var i, count;

		gl.useProgram(_program);

		// Bind matrix
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Bind light
		gl.uniform3fv(uniform.uLightDirection, light.direction);
		gl.uniform1f(uniform.uLightOpacity, light.opacity);
		gl.uniform3fv(uniform.uLightAmbient, light.ambient);
		gl.uniform3fv(uniform.uLightDiffuse, light.diffuse);
		gl.uniform3fv(uniform.uLightEnv, light.env);

		// Use shadows
		gl.uniform1i(uniform.uLightMapUse, Preferences.lightmap);

		// Fog settings
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		// Enable all attributes
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aVertexNormal);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
		gl.enableVertexAttribArray(attribute.aAlpha);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);

		// Link attribute
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(attribute.aVertexNormal, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 9 * 4, 6 * 4);
		gl.vertexAttribPointer(attribute.aAlpha, 1, gl.FLOAT, false, 9 * 4, 8 * 4);

		// Textures
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);

		for (i = 0, count = _objects.length; i < count; ++i)
		{
			if (_objects[i].complete)
			{
				gl.bindTexture(gl.TEXTURE_2D, _objects[i].texture);
				gl.drawArrays(gl.TRIANGLES, _objects[i].vertOffset, _objects[i].vertCount);
			}
		}

		// Is it needed ?
		gl.disableVertexAttribArray(attribute.aPosition);
		gl.disableVertexAttribArray(attribute.aVertexNormal);
		gl.disableVertexAttribArray(attribute.aTextureCoord);
		gl.disableVertexAttribArray(attribute.aAlpha);
	}

	/**
	 * Clean textures/buffer from memory
	 *
	 * @param {object} gl context
	 */
	function free(gl)
	{
		var i, count;

		if (_buffer)
		{
			gl.deleteBuffer(_buffer);
			_buffer = null;
		}

		if (_program)
		{
			gl.deleteProgram(_program);
			_program = null;
		}

		for (i = 0, count = _objects.length; i < count; ++i)
		{
			gl.deleteTexture(_objects[i].texture);
		}

		_objects.length = 0;
	}

	/**
	 * Export
	 */
	return {
		init: init,
		render: render,
		free: free
	};
});
