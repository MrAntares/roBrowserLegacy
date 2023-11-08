/**
 * Renderer/Entity/EntityDropEffect.js
 *
 * Helper to manage entity's drop effect 
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Bastien Bruant
 */
define(['DB/Effects/EffectConst'], function(EffectConst)
{
	'use strict';

	const dropEffects = [
		EffectConst.DROPEFFECT_PINK,
		EffectConst.DROPEFFECT_BLUE,
		EffectConst.DROPEFFECT_YELLOW,
		EffectConst.DROPEFFECT_PURPLE,
		EffectConst.DROPEFFECT_GREEN,
		EffectConst.DROPEFFECT_RED,
	];
	
	/**
	 * drop effect class
	 *
	 * @constructor
	 * @param {object} entity
	 */
	function DropEffect( entity )
	{
		this.isLoaded = false; // to avoid duplicate drop effects
		this.entity = entity; // reference to attached entity
	}

	/**
	 * Show drop effect
	 */
	DropEffect.prototype.load = function load( effectManager, dropEffectMode )
	{ 
		// TODO the dropEffectMode 0 means that we need to get the EffectID from the lua file
		// Right now, it's only used for cards and they all have the pink drop effect.
		// But we should load the EffectID from ItemInfo.lua when we implement it.
		var effect = dropEffects[dropEffectMode];

		// check if drop effect is valid
		if(!effect) {
			return;
		}

		// check if entity is visible
		if(this.entity.isVisible()) {
			// drop effect is already loaded
			if(!this.isLoaded) {
				console.log(this.entity.position[2]);
				// add drop effect
				effectManager.spam( {
					ownerAID: this.entity.GID,
					// set the position of the drop effect directly on the ground
					position: [this.entity.position[0], this.entity.position[1], this.entity.position[2] - 7.5],
					effectId: effect,
					persistent: true
				} );
					// set flag to avoid duplicate drop effects
					this.isLoaded = true;
			}
		} else {
			// remove drop effect if entity is invisible
			this.remove( effectManager );
		}
	};

	/**
	 * Hide drop effect
	 */
	DropEffect.prototype.remove = function remove( effectManager )
	{
		// remove drop effects
		effectManager.remove( null, this.entity.GID, dropEffects );
		// free drop effect - needs to be separate to avoid circular dependency
		this.free();
	};

	/**
	 * Hide drop effect
	 */
	DropEffect.prototype.free = function free()
	{
		// reset flag to allow drop effect to be loaded
		this.isLoaded = false;
	};

	/**
	 * Export
	 */
	return function init()
	{
		this.dropEffect = new DropEffect(this);
	};
});
