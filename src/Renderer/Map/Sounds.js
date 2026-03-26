/**
 * Renderer/Map/Sounds.js
 *
 * Play 3D sounds
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Utils/gl-matrix', 'Audio/SoundManager'], function (glMatrix, SoundManager) {
	'use strict';

	/**
	 * Sound renderer namespace
	 */
	var vec2 = glMatrix.vec2;
	var _list = [];

	/**
	 * Add 3D sound to the list
	 */
	function add(sound) {
		_list.push(sound);
	}

	/**
	 * Remove data from memory
	 */
	function free() {
		_list.length = 0;
	}

	/**
	 * Rendering sounds
	 *
	 * @param {vec2} position
	 */
	function render(position, tick) {
		_list.forEach(sound => {
			var dist = Math.floor(vec2.dist(sound.pos, position));
			if (sound.tick < tick && dist <= sound.range) {
				SoundManager.playPosition(sound.file, sound.pos);
				sound.tick = tick + sound.cycle * 1000;
			}
		});
	}

	/**
	 * Export
	 */
	return {
		add: add,
		free: free,
		render: render
	};
});
