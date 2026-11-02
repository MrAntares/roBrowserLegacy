/**
 * DB/Effects/SoulStrikeEffect.js
 *
 * Effect 15 (EF_SOULSTRIKE) as the official client draws it from the
 * caster: one particle1 soul per hit, each with its sound, flying to the
 * target on a curve and trailing 11 fading copies. Motion in
 * Renderer/Effects/SoulStrikeSim.js.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from 'Renderer/Effects/EffectPrimSim.js';
import { SOUL, planSouls, soulAt, trailLook } from 'Renderer/Effects/SoulStrikeSim.js';

/**
 * The 3D effect drawing step `i` of a soul's trail (0 the soul itself). It
 * starts on the soul's tick and shows where the soul was `i` ticks before.
 *
 * @param {object} soul from planSouls
 * @param {Array} dir unit direction to the target on the map, [x, y]
 * @param {number} distance to the target, units
 * @param {number} i
 * @param {number} [rise] the target's height above the caster's, cells: the
 *   soul climbs to it as it goes
 * @return {object}
 */
export function soulTrailEffect(soul, dir, distance, i, rise = 0) {
	const look = trailLook(i);
	return {
		type: '3D',
		spriteName: 'particle1',
		alphaMax: 1,
		attachedEntity: false,
		duration: SOUL.life * PRIM_TICK_MS,
		zIndex: 1,
		wav: i === 0 ? 'effect/ef_soulstrike' : undefined,
		track(age) {
			const k = Math.floor(age);
			// The client updates before it draws: k + 1 updates; the trail lags i of them.
			const n = k + 1 - i;
			if (k < 0 || k >= SOUL.life || n < 1) {
				return null;
			}
			const p = soulAt(soul, dir, distance, n);
			return {
				x: p.x / UNITS_PER_CELL,
				y: p.y / UNITS_PER_CELL,
				z: p.up / UNITS_PER_CELL + rise * soulProgress(p, dir, distance, n),
				size: look.scale * 100,
				alpha: look.alpha / 255
			};
		}
	};
}

/**
 * How far along the way to the target a soul is, 0 to 1.
 *
 * @param {object} p from soulAt
 * @param {Array} dir
 * @param {number} distance units
 * @param {number} n the soul's update count: with no distance, the climb goes by its life
 * @return {number}
 */
export function soulProgress(p, dir, distance, n) {
	if (!distance) {
		return Math.min(1, n / SOUL.life);
	}
	return Math.min(1, Math.max(0, (p.x * dir[0] + p.y * dir[1]) / distance));
}

/**
 * Direction and distance from the caster to the target, in units, and how
 * much higher the target stands, in cells.
 *
 * @param {Array} from caster [x, y, z]
 * @param {Array} to target [x, y, z]
 * @return {object} { dir: [x, y], distance, rise }
 */
export function soulAim(from, to) {
	const dx = (to[0] - from[0]) * UNITS_PER_CELL;
	const dy = (to[1] - from[1]) * UNITS_PER_CELL;
	const distance = Math.hypot(dx, dy);
	const rise = (to[2] || 0) - (from[2] || 0);
	return distance ? { dir: [dx / distance, dy / distance], distance, rise } : { dir: [0, 1], distance: 0, rise };
}

/** EffectTable rows for 15. */
export const soulStrikeEffect = [
	{
		//EF_SOULSTRIKE	Soul Strike: one soul per hit from the caster to the target (kRO 2025 0xbd3030)
		type: 'FUNC',
		attachedEntity: false,
		func: function (Params) {
			const from = Params.Inst.position;
			const to = Params.Inst.otherPosition || from;
			const { dir, distance, rise } = soulAim(from, to);
			planSouls(Params.Init.hitCount || 1).forEach((soul, s) => {
				for (let i = 0; i < SOUL.trail; i++) {
					this.spamEffect({
						effect: soulTrailEffect(soul, dir, distance, i, rise),
						Inst: {
							effectID: 15,
							duplicateID: s * SOUL.trail + i,
							startTick: Params.Inst.startTick + soul.spawn * PRIM_TICK_MS
						},
						Init: Params.Init
					});
				}
			});
		}
	}
];
