/**
 * Renderer/Entity/EntityAura.js
 *
 * Helper to manage entity's aura
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Gulfaraz Rahman
 */
define(['DB/Effects/EffectConst', 'Preferences/Map'],
function(EffectConst, MapPreferences)
{
	'use strict';

	var normalEffects = [
		EffectConst.EF_LEVEL99,
		EffectConst.EF_LEVEL99_2,
		EffectConst.EF_LEVEL99_3
	];

	var simpleEffects = [
		EffectConst.EF_LEVEL99_3
	];

	/**
	 * Aura class
	 *
	 * @constructor
	 * @param {object} entity
	 */
	function Aura( entity )
	{
		this.isLoaded = false; // to avoid duplicate aura effects
		this.entity = entity; // reference to attached entity
	}

	/**
	 * Show aura
	 */
	Aura.prototype.load = function load( effectManager )
	{
		// check if qualifies for aura and /aura2 preference
		if( MapPreferences.aura > 0 && this.entity.clevel >= 99) {
			// check if entity is visible
			if(this.entity.isVisible()) {
				// aura is already loaded
				if(!this.isLoaded) {
					// select effects based on /aura preference
					var effects = MapPreferences.aura < 2 ? simpleEffects : normalEffects;
					// add aura effects
					for (let effectIndex = 0; effectIndex < effects.length; effectIndex++) {
						effectManager.spam( {
							ownerAID: this.entity.GID,
							position: this.entity.position,
							effectId: effects[effectIndex]
						} );
					  }
					  // set flag to avoid duplicate aura effects
					  this.isLoaded = true;
				}
			} else {
				// remove aura if entity is invisible
				this.remove( effectManager );
			}
		}
	};

	/**
	 * Hide aura
	 */
	Aura.prototype.remove = function remove( effectManager )
	{
		// remove aura effects
		effectManager.remove( null, this.entity.GID, normalEffects );
		// free aura - needs to be separate to avoid circular dependency
		this.free();
	};

	/**
	 * Hide aura
	 */
	Aura.prototype.free = function free()
	{
		// reset flag to allow aura to be loaded
		this.isLoaded = false;
	};

	/**
	 * Export
	 */
	return function init()
	{
		this.aura = new Aura(this);
	};
});
