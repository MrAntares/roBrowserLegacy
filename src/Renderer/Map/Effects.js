/**
 * Renderer/Map/Effects.js
 *
 * Display 3D effects
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
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
	function add( effect )
	{
		_list.push( effect );
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
        var effect;
        var count = _list[length];
        for (var i = 0; i < count; ++i) {
            effect = _list[i];
            if (effect[name] == GID) return effect;
        }
        return null;
    }

	/**
	 * Add effects to scene
	 *
	 * @param {vec3} position
	 */
	function spam( position, tick )
	{
		var effect;
		var i, count = _list.length;

		for (i = 0; i < count; ++i) {
			effect = _list[i];

			// distance need to be less than 25 cells (seems like it's
			// how the official client handle it).
			if (effect.tick < tick && vec3.dist(effect.pos, position) < 25) {
				var EffectDB      = require('DB/Effects/EffectTable');
				
				// there should be something done with effect.param[0] ~ effect.param[3] but have no idea what they are. Perhaps rotation?
				
				if(effect.id in EffectDB){
					var mapEff = EffectDB[effect.id];
					
					for (var i = 0, count = mapEff.length; i < count; ++i) {
						//var dupli = mapEff[i].duplicate;  // duplicate handling. Not needed for now.
						
						//for (var j = 0; j <= dupli ; ++j) {
							EffectManager.spamEffect(mapEff[i], effect.name+'-'+i, 0, effect.pos, 0, tick + effect.delay, false, 0);
						//}
					}
					
				}
				
				effect.tick = tick + effect.delay;
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
