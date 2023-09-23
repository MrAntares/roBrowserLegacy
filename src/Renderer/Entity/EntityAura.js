/**
 * Renderer/Entity/EntityAura.js
 *
 * Helper to manage entity's aura
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Gulfaraz Rahman
 */
define(['Renderer/EffectManager', 'DB/Effects/EffectConst', 'Preferences/Map'],
function(EffectManager, EffectConst, MapPreferences)
{
	'use strict';

	var effects = [
		EffectConst.EF_LEVEL99,
		EffectConst.EF_LEVEL99_2,
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
		this.isShown = false;
		this.entity = entity;
	}


	/**
	 * Show aura
	 */
	Aura.prototype.render = function render()
	{
		if( MapPreferences.aura > 0 && this.entity.clevel >= 99 && !this.isShown ) {
			for (let effectIndex = 0; effectIndex < effects.length; effectIndex++) {
				EffectManager.spam({
					ownerAID: this.entity.GID,
					position: this.entity.position,
					effectId: effects[effectIndex]
				});
			  }
			this.isShown = true;
		}
	};

	/**
	 * Hide aura
	 */
	Aura.prototype.clean = function clean()
	{
		if( this.isShown ) {
			EffectManager.remove( null, this.entity.GID, effects );
			this.isShown = false;
		}
	};

	/**
	 * Export
	 */
	return function init()
	{
		this.aura = new Aura(this);
	};
});
