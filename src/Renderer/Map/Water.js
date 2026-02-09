/**
 * Renderer/Map/Water.js
 *
 * Rendering water
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Utils/WebGL', 'Renderer/SpriteRenderer', 'text!./Water.vs', 'text!./Water.fs'], function (
	WebGL,
	SpriteRenderer,
	_vertexShader,
	_fragmentShader
)
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
	 * @var {number} total vertices
	 */
	var _vertCount = 0;

	/**
	 * @var {Array} textures list
	 */
	var _textures = new Array(32);

	/**
	 * @var {number} wave speed
	 */
	var _waveSpeed = 0;

	/**
	 * @var {number} wave height
	 */
	var _waveHeight = 0;

	/**
	 * @var {number} wave pitch
	 */
	var _wavePitch = 0;

	/**
	 * @var {number} water height
	 */
	var _waterLevel = 0;

	/**
	 * @var {number} animation speed
	 */
	var _animSpeed = 0;

	/**
	 * @var {number} water opacity
	 */
	var _waterOpacity = 0.9;

	/**
	 * Initialize water data
	 *
	 * @param {object} gl context
	 * @param {object} water data
	 */
	function init(gl, water)
	{
		var i;

		// Water informations
		_vertCount = water.vertCount;
		_waveHeight = water.waveHeight;
		_waveSpeed = water.waveSpeed;
		_waterLevel = water.level;
		_animSpeed = water.animSpeed;
		_wavePitch = water.wavePitch;
		_waterOpacity = water.type !== 4 && water.type !== 6 ? 0.8 : 1.0;

		// No water ?
		if (!_vertCount)
		{
			return;
		}

		// Link program	if not loaded
		if (!_program)
		{
			_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		}

		// Bind mesh
		_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
		gl.bufferData(gl.ARRAY_BUFFER, water.mesh, gl.STATIC_DRAW);

		function onTextureLoaded(texture, i)
		{
			_textures[i] = texture;
		}

		// Bind water textures
		for (i = 0; i < 32; ++i)
		{
			WebGL.texture(gl, water.images[i], onTextureLoaded, i);
		}
	}

	/**
	 * Render water
	 *
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog structure
	 * @param {object} light structure
	 * @param {number} tick (game tick)
	 */
	function render(gl, modelView, projection, fog, light, tick)
	{
		// If no water, don't need to process.
		if (!_vertCount)
		{
			return;
		}

		var uniform = _program.uniform;
		var attribute = _program.attribute;
		var frame = tick / (1000 / 60); // 60fps

		gl.useProgram(_program);

		// Bind matrix
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Fog settings
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		// Enable all attributes
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);

		gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);

		// Link attribute
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

		// Textures
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);

		// Water infos
		gl.uniform1f(uniform.uWaveHeight, _waveHeight);
		gl.uniform1f(uniform.uOpacity, _waterOpacity);
		gl.uniform1f(uniform.uWavePitch, _wavePitch);
		gl.uniform1f(uniform.uWaterOffset, ((frame * _waveSpeed) % 360) - 180);

		// Send mesh
		gl.bindTexture(gl.TEXTURE_2D, _textures[((frame / _animSpeed) % 32) | 0]);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//depthtest, depthmask, disabledepthcorrection(isometric draw)
		SpriteRenderer.runWithDepth(true, false, false, function ()
		{
			gl.drawArrays(gl.TRIANGLES, 0, _vertCount);
		});

		// Is it needed ?
		gl.disableVertexAttribArray(attribute.aPosition);
		gl.disableVertexAttribArray(attribute.aTextureCoord);
	}

	/**
	 * Clean texture/buffer from memory
	 *
	 * @param {object} gl context
	 */
	function free(gl)
	{
		var i;

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

		for (i = 0; i < 32; ++i)
		{
			if (_textures[i])
			{
				gl.deleteTexture(_textures[i]);
				_textures[i] = null;
			}
		}
	}

	/**
	 * Export
	 */
	return {
		init: init,
		free: free,
		render: render
	};
});
