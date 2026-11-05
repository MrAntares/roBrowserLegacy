/**
 * @module DB/Effects/Table/ById/Effects2300-2399
 *
 * Effects 2300 to 2399 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import CastCone from 'Renderer/Effects/CastCone.js';
import CastRing from 'Renderer/Effects/CastRing.js';
import CastFunnel from 'Renderer/Effects/CastFunnel.js';
import CasterMarks from 'Renderer/Effects/CasterMarks.js';

export default {
	2367: [
		{
			// Night Watch, Soul Ascetic and Spirit Handler cast aura: the client's cast-aura ring in
			// ring_yellow.tga, argument 0 (white, additive), twice (CastRingSim.js).
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
						[0, 0]
					),
					Params
				);
			}
		}
	],

	2368: [
		{
			// Talisman of Black Tortoise cast: the official client's bubble cone in black (variant 11, CastConeSim.js).
			type: 'FUNC',
			attachedEntity: true,
			wav: 'effect/ef_beginspell',
			func: function (Params) {
				this.add(
					new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, {
						variant: 11
					}),
					Params
				);
			}
		}
	],

	2369: [
		{
			// Breaking Limit, Rule Break and Talisman of Four Bearing God cast: the colour-cycling
			// ring (client primitive 139) in ring_white.tga, argument 0, twice: blue, red, green and
			// pale yellow, 25 ticks each (CastRingSim.js).
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
						'ring_white.tga',
						[0, 0],
						true
					),
					Params
				);
			}
		}
	],

	2373: [
		{
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			func: function (Params) {
				this.add(
					new CastFunnel(
						Params.Init.ownerEntity.position,
						Params.Inst.startTick,
						Params.Init.duration / 16,
						'ring_black.tga'
					),
					Params
				);
			}
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			castLoop: true,
			func: function (Params) {
				this.add(
					new CasterMarks(Params.Init.ownerEntity, Params.Inst.startTick, Params.Init.duration / 16, 2373),
					Params
				);
			}
		}
	]
};
