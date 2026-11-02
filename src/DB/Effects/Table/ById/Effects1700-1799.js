/**
 * @module DB/Effects/Table/ById/Effects1700-1799
 *
 * Effects 1700 to 1799 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import CastCircle from 'Renderer/Effects/CastCircle.js';

export default {
	1709: [
		{
			// Hell's Drive cast aura: the client's untinted cast circle in
			// new_earthdrive/ring_brown.tga, white, for the cast time (CastCircleSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCircle(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'new_earthdrive/ring_brown.tga'
					),
					Params
				);
			}
		}
	],

	// Shinkirou cast, with 2373: the client plays mystery_illusion_cast_bottom.str for the cast time
	1774: [
		{
			type: 'STR',
			file: 'mystery_illusion/mystery_illusion_cast_bottom/mystery_illusion_cast_bottom',
			texturePath: 'mystery_illusion/mystery_illusion_cast_bottom/',
			min: 'mystery_illusion/mystery_illusion_cast_bottom/min_mystery_illusion_cast_bottom',
			wav: 'effect/ef_beginspell',
			renderBeforeEntities: true,
			castLoop: true,
			attachedEntity: true
		}
	]
};
