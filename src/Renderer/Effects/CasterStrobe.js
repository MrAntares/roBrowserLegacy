/**
 * Renderer/Effects/CasterStrobe.js
 *
 * The official client's black and white strobe on a caster (classic effect 812,
 * Kunai - Nightmare's cast start). On ticks 6 to 60 of the effect the caster is
 * drawn white on odd ticks and black on even ones. Tick 60 leaves it black, and
 * the client's own colour recovery then brings it back by 8 out of 255 a tick.
 * A poisoned caster gets its poison tint straight back instead.
 */

import StatusConst from 'DB/Status/StatusState.js';
import { PRIM_TICK_MS } from './EffectPrimSim.js';

/**
 * @var {object} strobe ticks (1/60 s) and recovery step (out of 255)
 */
export const STROBE = { first: 6, last: 60, recoverStep: 8 };

/**
 * Colour multiplier of the caster on a tick of the effect
 *
 * @param {number} frame tick since the effect started
 * @return {number} 0 (black) .. 1 (normal)
 */
export function casterStrobeShade(frame) {
	if (frame < STROBE.first) {
		return 1;
	}

	if (frame <= STROBE.last) {
		return frame % 2 ? 1 : 0;
	}

	return Math.min(1, ((frame - STROBE.last) * STROBE.recoverStep) / 255);
}

/**
 * Run the strobe on an entity, through its flash colour
 *
 * @param {Entity} entity
 */
export function startCasterStrobe(entity) {
	if (!entity || !entity.animations || !entity._flashColor) {
		return;
	}

	const setShade = shade => {
		entity._flashColor[0] = shade;
		entity._flashColor[1] = shade;
		entity._flashColor[2] = shade;
		entity._flashColor[3] = 1.0;
		entity.recalculateBlendingColor();
	};

	entity.animations.add(tick => {
		const frame = Math.floor(tick / PRIM_TICK_MS);
		const poisoned = (entity._healthState & StatusConst.HealthState.POISON) !== 0;
		const done = frame > STROBE.last && (poisoned || casterStrobeShade(frame) >= 1);

		setShade(done ? 1.0 : casterStrobeShade(frame));
		return done;
	});
}
