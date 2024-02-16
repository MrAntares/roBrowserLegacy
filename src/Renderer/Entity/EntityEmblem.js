/**
 * Renderer/EntityEmblem.js
 *
 * Manage Emblem GUI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alison Serafim
 */
define(['Utils/gl-matrix', 'Renderer/Renderer'], function( glMatrix, Renderer )
{
	'use strict';


	/**
	 * Global methods
	 */
	var vec4  = glMatrix.vec4;
	var _pos  = new Float32Array(4);
	var _size = new Float32Array(2);


	/**
	 * Emblem class
	 */
	function Emblem()
	{
		this.emblem  =  null;
		this.display = false;
		this.canvas  = document.createElement('canvas');
		this.ctx     = this.canvas.getContext('2d');
		this.canvas.style.position = 'absolute';
		this.canvas.style.zIndex   = 1;
		this.entity  = null;
	}


	/**
	 * Remove Emblem GUI
	 */
	Emblem.prototype.remove = function remove()
	{
		this.display = false;
		if (this.canvas.parentNode) {
			document.body.removeChild(this.canvas);
		}
	};


	/**
	 * Clean Up Emblem
	 */
	Emblem.prototype.clean = function clean()
	{
		this.remove();
		//this.ctx    = null;
		//this.canvas = null;
	};


	/**
	 * Update Emblem
	 */
	Emblem.prototype.update = function update()
	{
		var width  = 24, height =  24;
		var Entity = this.entity.constructor;

		// Init variables
		this.display = true;
		var ctx      = this.ctx;

		// Set size
		ctx.canvas.width  = width;
		ctx.canvas.height = height;

		// Draw Emblem
		if(this.emblem !== null) {
			ctx.drawImage( this.emblem, 0, 0 );
		}

	};


	/**
	 * Rendering Emblem
	 *
	 * @param {mat4} matrix
	 */
	Emblem.prototype.render = function Render( matrix )
	{
		var canvas = this.canvas;
		var z;

		// Cast position
		_pos[0] =  0.0;
		_pos[1] = -0.5;
		_pos[2] =  0.0;
		_pos[3] =  1.0;

		// Set the viewport
		_size[0] = Renderer.width  / 2;
		_size[1] = Renderer.height / 2;

		// Project point to scene
		vec4.transformMat4( _pos, _pos, matrix );

		// Calculate position
		z = _pos[3] === 0.0 ? 1.0 : ( 1.0 / _pos[3] );
		_pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
		_pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

		canvas.style.top  = (_pos[1] - 100 | 0 ) + 'px';
		canvas.style.left = ((_pos[0] - canvas.width / 2) | 0) + 'px';

		// Append to body
		if (!canvas.parentNode) {
			document.body.appendChild(canvas);
		}
	};


	/**
	 * Export
	 */
	return function Init()
	{
		this.emblem        = new Emblem();
		this.emblem.entity = this;
	};
});
