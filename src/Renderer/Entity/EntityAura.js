/**
 * Renderer/Entity/EntityAura.js
 *
 * Helper to manage entity's aura
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Gulfaraz Rahman
 */
define(['Renderer/EffectManager', 'DB/Effects/EffectConst'],
function(EffectManager, EffectConst)
{
	'use strict';

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
	Aura.prototype.show = function show()
	{
		if(this.entity.clevel >= 99 && !this.isShown) {
			var effects = this.getEffects();
			effects.forEach(function(effect) { EffectManager.spam(effect); });
			this.isShown = true;
		}
	};

	/**
	 * Hide aura
	 */
	Aura.prototype.hide = function hide()
	{
		if(this.isShown) {
			EffectManager.remove( null, this.entity.GID, [EffectConst.EF_LEVEL99, EffectConst.EF_LEVEL99_2, EffectConst.EF_LEVEL99_3] );
			this.isShown = false;
		}
	};

	/**
	 * Get effects to display as aura
	 */
	Aura.prototype.getEffects = function getEffects()
	{
		return [
			{
				ownerAID: this.entity.GID,
				position: this.entity.position,
				effectId: EffectConst.EF_LEVEL99
			},
			{
				ownerAID: this.entity.GID,
				position: this.entity.position,
				effectId: EffectConst.EF_LEVEL99_2
			},
			{
				ownerAID: this.entity.GID,
				position: this.entity.position,
				effectId: EffectConst.EF_LEVEL99_3
			}
		];

	}

	/**
	 * Export
	 */
	return function init()
	{
		this.aura = new Aura(this);
	};
});
