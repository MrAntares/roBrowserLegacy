/**
 * Renderer/Map/Effects.js
 *
 * Display 3D effects
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define( ['Utils/gl-matrix', 'Renderer/EffectManager'],
function(        glMatrix,            EffectManager)
{
	'use strict';


	/**
	 * Sound renderer namespace
	 */
	var vec3   = glMatrix.vec3;
	var _list  = [];


	/**
	 * Add 3D sound to the list
	 */
	function add( mapEffect )
	{
		_list.push( mapEffect );
	}


	/**
	 * Remove data from memory
	 */
	function free()
	{
		_list.length = 0;
	}

	/**
	 * Get effect from list
	 */
	function get(GID) {
		var mapEffect;
		var count = _list.length;
		for (var i = 0; i < count; ++i) {
			mapEffect = _list[i];
			if (mapEffect.name == GID) return mapEffect;
		}
		return null;
	}

	/**
	 * Remove effect from list
	 */
	function remove(GID) {
		var mapEffect;
		var count = _list.length;
		for (var i = 0; i < count; ++i) {
			mapEffect = _list[i];
			if (mapEffect.name == GID){
				_list.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Add effects to scene
	 *
	 * @param {vec3} position
	 */
	function spam( position, tick )
	{
		var mapEffect;
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			mapEffect = _list[i];

			// distance need to be less than 25 cells (seems like it's
			// how the official client handle it).
			if (mapEffect.tick < tick && vec3.dist(mapEffect.pos, position) < 25) {
				var EffectDB      = require('DB/Effects/EffectTable');

				// In case of map effects something has to be done with params
				//mapEffect.param[0] = ?? size?
				//mapEffect.param[1] = ?? animspeed?
				//mapEffect.param[2] = ??
				//mapEffect.param[3] = ??


				if(mapEffect.id in EffectDB){
					var effect = EffectDB[mapEffect.id];

					for (var i = 0, count = effect.length; i < count; ++i) {
						//var dupli = effect[i].duplicate;  // duplicate handling. Not needed for now.

						//for (var j = 0; j <= dupli ; ++j) {

							if(mapEffect.param[0]) effect[i].size       = 100 * mapEffect.param[0]; //size
							if(mapEffect.param[1]) effect[i].delayFrame = 100 / (1+mapEffect.param[1]); // animspeed

							EffectManager.spamEffect(effect[i], mapEffect.name+'-'+i, 0, mapEffect.pos, 0, tick, false, null);
						//}
					}

					mapEffect.tick = tick + (mapEffect.delay) / (mapEffect.param[1] ? Math.pow(10, mapEffect.param[1]) : 1); // Don't even ask why, I don't know either...
				}


			}
		}
	}


	/**
	 * Export
	 */
	return {
		add:    add,
		free:   free,
		get:	get,
		spam:   spam
	};
});
