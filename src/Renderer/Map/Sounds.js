/**
 * Renderer/Map/Sounds.js
 *
 * Play 3D sounds
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define( ['Utils/gl-matrix', 'Audio/SoundManager'],
function(        glMatrix,         SoundManager )
{
	'use strict';


	/**
	 * Sound renderer namespace
	 */
	var vec2   = glMatrix.vec2;
	var _list  = [];


	/**
	 * Add 3D sound to the list
	 */
	function add( sound )
	{
		_list.push( sound );
	}


	/**
	 * Remove data from memory
	 */
	function free()
	{
		_list.length = 0;
	}


	/**
	 * Rendering sounds
	 *
	 * @param {vec3} position
	 */
	function render( position, tick )
	{
		var sound;
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			sound = _list[i];
			var dist = Math.floor(vec2.dist(sound.pos, position));
			// TODO: check for sound.height
			if (sound.tick < tick && dist <= sound.range) {
				//lerp - (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
				SoundManager.play( sound.file, Math.max(((1-Math.abs((dist - 1) * (1 - 0.01) / (sound.range - 1) + 0.01))*sound.vol), 0.05 ));
				sound.tick = tick + sound.cycle * 1000;
			}
		}
	}


	/**
	 * Export
	 */
	return {
		add:    add,
		free:   free,
		render: render
	};
});
