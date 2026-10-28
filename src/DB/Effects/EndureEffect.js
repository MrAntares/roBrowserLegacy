/**
 * DB/Effects/EndureEffect.js
 *
 * Effect 11 (EF_ENDURE) as the official client draws it: EF_Endure.wav, the
 * shrinking endure.tga and alpha_down.tga streaks sliding in toward the
 * caster. Motion in Renderer/Effects/EndureSim.js.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import { PRIM_TICK_MS } from 'Renderer/Effects/EffectPrimSim.js';
import { ENDURE, ringAt, planStreaks, streakAt } from 'Renderer/Effects/EndureSim.js';

/**
 * A 3D row drawing one prim on the caster from a sampler.
 *
 * @param {string} file texture
 * @param {number} life ticks
 * @param {function} at age -> sample in client numbers, or null
 * @return {object}
 */
function primEffect(file, life, at) {
	return {
		type: '3D',
		file,
		sharedTexture: true,
		alphaMax: 1,
		attachedEntity: true,
		duration: life * PRIM_TICK_MS,
		zIndex: 10,
		track(age) {
			const p = at(age);
			if (!p) {
				return null;
			}
			return {
				x: 0,
				y: 0,
				z: 0,
				offsetX: p.offsetX,
				offsetY: p.offsetY,
				sizeX: p.sizeX,
				sizeY: p.sizeY,
				alpha: p.alpha / 255,
				angle: p.angle
			};
		}
	};
}

/** The endure.tga row. */
export const endureRingEffect = primEffect('effect/endure.tga', ENDURE.life, ringAt);

/**
 * The row of one streak. It starts on the streak's own tick.
 *
 * @param {object} streak from planStreaks
 * @return {object}
 */
export function endureStreakEffect(streak) {
	return primEffect('effect/alpha_down.tga', ENDURE.streak.life, age => streakAt(streak, age));
}

/** EffectTable row for 11. */
export const endureEffect = [
	{
		//EF_ENDURE	Endure, on the caster when it succeeds
		...endureRingEffect,
		wav: 'effect/ef_endure'
	},
	{
		type: 'FUNC',
		attachedEntity: true,
		func: function (Params) {
			planStreaks().forEach((streak, i) => {
				this.spamEffect({
					effect: endureStreakEffect(streak),
					Inst: {
						effectID: 11,
						duplicateID: i + 1,
						startTick: Params.Inst.startTick + streak.spawn * PRIM_TICK_MS
					},
					Init: Params.Init
				});
			});
		}
	}
];
