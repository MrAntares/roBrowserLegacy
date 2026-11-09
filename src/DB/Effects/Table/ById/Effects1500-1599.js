/**
 * @module DB/Effects/Table/ById/Effects1500-1599
 *
 * Effects 1500 to 1599 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import CastRing from 'Renderer/Effects/CastRing.js';

export default {
	1556: [
		{
			// Soul of Heaven and Earth cast: the cast-aura ring in ring_blue.tga, arguments
			// 20 and 21 (two blues, additive) (CastRingSim.js).
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastRing(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'ring_blue.tga',
						[20, 21]
					),
					Params
				);
			}
		}
	],

	1565: [
		{
			// Circle of Directions and Elementals cast: the cast-aura ring in ring_yellow.tga,
			// argument 23 (light blue, additive) (CastRingSim.js).
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastRing(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration,
						'ring_yellow.tga',
						[23, 23]
					),
					Params
				);
			}
		}
	]
};
