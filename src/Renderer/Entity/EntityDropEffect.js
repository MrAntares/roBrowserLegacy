/**
 * Renderer/Entity/EntityDropEffect.js
 *
 * Helper to manage entity's drop effect 
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Bastien Bruant
 */
define(function(require)
{
	'use strict';

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
		var effect = getDropEffect(dropEffectMode);

		// check if drop effect is valid
		if(!effect) {
			return;
		}

		// check if entity is visible
		if(this.entity.isVisible()) {
			// drop effect is already loaded
			if(!this.isLoaded) {
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

	function getDropEffect( dropEffectMode ) {
		var dropEffect;

		switch(dropEffectMode) {
			case 1:
				// TODO: get the effectId from the lua file
			break;
			case 2:
				dropEffect = 'new_dropitem_blue';
			break;
			case 3:
				dropEffect = 'new_dropitem_yellow';
			break;
			case 4:
				dropEffect = 'new_dropitem_purple';
			break;
			case 5:
				dropEffect = 'new_dropitem_green';
			break;
			case 6:
				dropEffect = 'new_dropitem_red';
			break;
			case 0:
			default:
				dropEffect = undefined
			break;
		}

		return dropEffect;

	}
	/**
	 * Export
	 */
	return function init()
	{
		this.dropEffect = new DropEffect(this);
	};
});
