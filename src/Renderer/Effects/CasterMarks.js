/**
 * Renderer/Effects/CasterMarks.js
 *
 * What the official client's cast effects 934 (Nightmare Erasion), 2373
 * (Shinkirou) and 502 (Spiral Pierce Max) do to the caster's own sprite. It
 * draws nothing itself: it marks the owner each tick, and EntityRender reads
 * the marks.
 *
 * The client sets bits on the caster on each tick of the effect, and the
 * caster's tick clears them after a draw, so a mark shows only on the ticks
 * the effect sets it:
 *
 *  - added body (bit 0x1): the sprite is drawn adding light (BodyGlow's mark);
 *  - glow copy (bit 0x8): one more copy of the sprite, in its own colour,
 *    added, a few pixels larger on every side (see EntityRender);
 *  - split images (bit 0x1000, with the effect's age): four white copies of the
 *    sprite sliding out right, left, down and up, fading out by age 30;
 *  - colour: the caster's colour, which every actor's tick brings back by
 *    8 out of 255 a channel once nothing sets it.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, func(Params) {
 *       this.add(new CasterMarks(Params.Init.ownerEntity, Params.Inst.startTick, frames, 934), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import EntityManager from 'Renderer/EntityManager.js';
import { PRIM_TICK_MS } from './EffectPrimSim.js';

/** Colour recovery a tick, out of 255, and the split images' fade. */
export const RECOVER_STEP = 8;
export const SPLIT_TICKS = 30;

const RED = [255, 0, 0];
const YELLOW = [250, 250, 100];
const WHITE = [255, 255, 255];

/**
 * What each effect sets on the caster on its tick `age` (0 on the first).
 * `color` is the colour it sets (0-255), or null to leave it.
 */
export const SCHEDULES = {
	// Nightmare Erasion: added body and glow copy two ticks out of four, ages 12 to 33.
	934: age => {
		const on = age >= 10 && age <= 34 && age % 4 < 2;
		return { add: on, glow: on, split: false, color: null };
	},
	// Shinkirou: split images all along, red added body and glow copy to age 30.
	2373: age => {
		const on = age <= 30;
		return { add: on, glow: on, split: true, color: on ? RED : null };
	},
	// Spiral Pierce Max: glow copy to age 140, flickering yellow (added) and white.
	502: age => {
		const on = age <= 140;
		const even = age % 2 === 0;
		return { add: on && even, glow: on, split: false, color: on ? (even ? YELLOW : WHITE) : null };
	}
};

/**
 * The caster's colour on tick `age`: the last colour the effect set, brought
 * back by 8 a tick since.
 *
 * @param {function} schedule
 * @param {number} age
 * @return {number[]|null} 0-255 per channel, or null when never set
 */
export function colorAt(schedule, age) {
	for (let a = age; a >= 0 && age - a <= Math.ceil(255 / RECOVER_STEP); a--) {
		const set = schedule(a).color;
		if (set) {
			return set.map(c => Math.min(255, c + RECOVER_STEP * (age - a)));
		}
	}
	return null;
}

/**
 * Split images' alpha (out of 255) at age `age`.
 *
 * @param {number} age
 * @return {number}
 */
export function splitAlpha(age) {
	return Math.max(0, (SPLIT_TICKS - age) * 5);
}

/**
 * Recover a colour on an entity by 8 a tick until it is back to normal
 *
 * @param {Entity} entity
 * @param {number[]} color 0-255 per channel
 */
function recoverColor(entity, color) {
	if (!entity.animations || !entity._flashColor) {
		return;
	}
	entity.animations.add(tick => {
		const steps = Math.floor(tick / PRIM_TICK_MS);
		let done = true;
		for (let i = 0; i < 3; i++) {
			const c = Math.min(255, color[i] + RECOVER_STEP * steps);
			entity._flashColor[i] = c / 255;
			done = done && c >= 255;
		}
		entity.recalculateBlendingColor();
		return done;
	});
}

export default class CasterMarks {
	static ready = true;
	// Before the entities, so a mark set on a tick shows on that tick's draw.
	static renderBeforeEntities = true;
	static beforeRender() {}
	static afterRender() {}

	/**
	 * @param {Entity} owner the caster
	 * @param {number} startTick
	 * @param {number} frames lifetime in ticks (1/60 s)
	 * @param {number} effectId 934, 2373 or 502
	 */
	constructor(owner, startTick, frames, effectId) {
		this.owner = owner || null;
		this.startTick = startTick || 0;
		this.frames = Math.max(1, Math.floor(frames));
		this.schedule = SCHEDULES[effectId];
		this.add = false;
		this.glow = false;
		this.color = null;
		this.ready = true;
	}

	/**
	 * Put the marks of tick `age` on the owner, or take them all off (null)
	 */
	mark(age) {
		const owner = this.owner;
		const state = age === null ? { add: false, glow: false, split: false } : this.schedule(age);

		if (state.add !== this.add) {
			owner._additiveBody = Math.max(0, (owner._additiveBody || 0) + (state.add ? 1 : -1));
			this.add = state.add;
		}
		if (state.glow !== this.glow) {
			owner._castGlow = Math.max(0, (owner._castGlow || 0) + (state.glow ? 1 : -1));
			this.glow = state.glow;
		}
		if (state.split) {
			owner._splitImageAge = age;
			this._split = true;
		} else if (this._split) {
			owner._splitImageAge = undefined;
			this._split = false;
		}

		if (age !== null && owner._flashColor) {
			const color = colorAt(this.schedule, age);
			if (color || this.color) {
				const c = color || WHITE;
				owner._flashColor[0] = c[0] / 255;
				owner._flashColor[1] = c[1] / 255;
				owner._flashColor[2] = c[2] / 255;
				owner.recalculateBlendingColor();
				this.color = color;
			}
		}
	}

	render(gl, tick) {
		if (!this.owner || EntityManager.get(this.owner.GID) !== this.owner) {
			this.needCleanUp = true;
			return;
		}
		if (tick < this.startTick) {
			return;
		}
		const age = Math.floor((tick - this.startTick) / PRIM_TICK_MS);
		if (age >= this.frames) {
			this.needCleanUp = true;
			return;
		}
		this.mark(age);
	}

	free() {
		if (this.owner) {
			this.mark(null);
			// The caster's own tick keeps bringing its colour back after the effect.
			if (this.color && this.color.some(c => c < 255)) {
				recoverColor(this.owner, this.color);
			}
		}
		this.owner = null;
	}
}
