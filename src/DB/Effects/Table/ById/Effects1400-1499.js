/**
 * @module DB/Effects/Table/ById/Effects1400-1499
 *
 * Effects 1400 to 1499 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import CastCircle from 'Renderer/Effects/CastCircle.js';

export default {
	// Jack Frost Nova cast, with 1449: the client plays new_jackfrost_cast.str for the cast time
	1446: [
		{
			type: 'STR',
			file: 'new_jackfrost/new_jackfrost_cast/new_jackfrost_cast',
			texturePath: 'new_jackfrost/new_jackfrost_cast/',
			min: 'new_jackfrost/new_jackfrost_cast/min_new_jackfrost_cast',
			castLoop: true,
			attachedEntity: true
		}
	],

	1449: [
		{
			// Jack Frost Nova cast: the client's tinted cast circle in new_jackfrost/ring_ice.tga,
			// mode 2 (bluish, normal blending), for the cast time (CastCircleSim.js).
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCircle(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'new_jackfrost/ring_ice.tga',
						2
					),
					Params
				);
			}
		}
	]
};
