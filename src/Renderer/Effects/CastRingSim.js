/**
 * Renderer/Effects/CastRingSim.js
 *
 * Motion and geometry of the official client's cast-aura ring, without any
 * WebGL, so it can be tested on its own. The 4th-job cast effects 2367
 * (ring_yellow), 1556 (ring_blue), 1565 (ring_yellow) and 1938
 * (new_battle_w/abr_battle_warior) each draw two of these rings, built with
 * sizes 45 and 25. 911 (ring_white, 15) uses the same
 * ring; 2369 (ring_white) uses its colour-cycling twin, the client's primitive
 * 139.
 *
 * As the official client builds it:
 *
 *  - Four bands, each a full circle of 20 strips standing on a small foot
 *    circle round the caster and leaning out. Bands start at 180, 270, 0 and
 *    90 degrees and do not turn.
 *  - A band starts upright (lean 80) on a 4.1 foot circle, with alpha size +
 *    135, + 90, + 45 and + 0. Each tick its foot widens by 0.07 and it leans
 *    out by a degree; once the foot is past 4 it fades by 3 a tick. When it is
 *    gone it starts again (foot 3.37, lean 74), fading in by 10 a tick until
 *    the foot reaches 4, as long as there are more than 30 ticks left.
 *  - A strip's length is the band's length (20, 19, 18, 17) give or take 30%,
 *    a hump across the circle that breathes slowly.
 *  - Casts shorter than 61 ticks start every band at alpha 0, 5 ticks apart.
 *  - Coloured and blended by the ring's mode, picked by its argument. The
 *    colour-cycling twin starts in mode 4 whatever its argument and steps to
 *    the next of modes 4, 6, 7, 8 (blue, red, green, pale yellow) every 25 ticks.
 *  - The effect lasts the cast time, but at least 56 ticks.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second), degrees.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as RING_TICK_MS };

const DEG = Math.PI / 180;
const f32 = Math.fround;

/** The shortest a ring effect plays, in ticks. */
export const MIN_FRAMES = 56;

/** Effects that live less than this start their bands at alpha 0, one after another. */
export const SHORT_LIFE = 61;

/** Points along a band (the last one closes the circle). */
export const POINTS = 21;

/** Strips per band. */
export const STRIPS = POINTS - 1;

/** Where each band starts on the circle, degrees. */
export const BAND_START = [180, 270, 0, 90];

/** Alpha added to the ring's size for each band. */
export const BAND_ALPHA = [135, 90, 45, 0];

const FOOT_START = f32(4.1);
const FOOT_RESTART = f32(3.37);
const FOOT_STEP = f32(0.07);
const FOOT_FULL = 4;
const LEAN_START = 80;
const LEAN_MIN = 10;
const WOBBLE = 0.3;

/** Number of vertices of a ring (triangles, 5 floats each). */
export const RING_VERTICES = BAND_START.length * STRIPS * 6;

/**
 * The ring's mode by argument (the client's builder maps its last argument to
 * a mode; any other argument is mode 5).
 */
const ARG_MODE = {
	1: 8,
	2: 5,
	3: 10,
	4: 11,
	5: 4,
	6: 12,
	15: 7,
	20: 24,
	21: 25,
	22: 26,
	23: 27,
	31: 31,
	42: 42,
	43: 43,
	44: 44,
	45: 45,
	46: 46,
	47: 47,
	48: 48,
	49: 49,
	50: 50
};

/**
 * Colour (0-255) and blending of each mode the ring uses. Modes not listed are
 * white and additive.
 */
export const RING_MODES = {
	4: { color: [100, 100, 255], additive: true },
	5: { color: [255, 255, 255], additive: true },
	6: { color: [255, 100, 100], additive: true },
	7: { color: [100, 255, 100], additive: true },
	8: { color: [255, 255, 170], additive: true },
	10: { color: [255, 89, 182], additive: true },
	11: { color: [170, 170, 255], additive: true },
	12: { color: [50, 50, 50], additive: false },
	24: { color: [10, 66, 114], additive: true },
	25: { color: [35, 146, 185], additive: true },
	26: { color: [164, 205, 254], additive: true },
	27: { color: [84, 169, 205], additive: true },
	31: { color: [244, 187, 124], additive: true },
	42: { color: [43, 40, 46], additive: false },
	43: { color: [125, 182, 160], additive: false },
	44: { color: [180, 55, 30], additive: false },
	45: { color: [65, 141, 231], additive: true },
	46: { color: [164, 47, 29], additive: true },
	47: { color: [172, 154, 56], additive: true },
	48: { color: [80, 20, 20], additive: true },
	49: { color: [200, 130, 84], additive: true },
	50: { color: [255, 198, 91], additive: true }
};

/** The colour-cycling ring's modes, in order, and how many ticks it holds each. */
export const CYCLE_MODES = [4, 6, 7, 8];
export const CYCLE_TICKS = 25;

/**
 * @param {number} arg the ring's argument
 * @return {number} its mode
 */
export function ringMode(arg) {
	return arg in ARG_MODE ? ARG_MODE[arg] : 5;
}

/**
 * @param {number} mode
 * @return {{color: number[], additive: boolean}}
 */
export function modeTint(mode) {
	return RING_MODES[mode] || RING_MODES[5];
}

/**
 * @param {number} arg
 * @return {{color: number[], additive: boolean}}
 */
export function ringTint(arg) {
	return modeTint(ringMode(arg));
}

/**
 * Band lengths (foot to tip, before the wobble) by argument.
 *
 * @param {number} arg
 * @return {number[]}
 */
export function bandLengths(arg) {
	if (arg === 2) {
		return [25, 24, 23, 22];
	}
	if (arg === 22) {
		return [15, 14, 13, 12];
	}
	return [20, 19, 18, 17];
}

/**
 * How long a ring effect plays, in ticks, for a cast of `castTime` ms.
 *
 * @param {number} castTime
 * @return {number}
 */
export function ringFrames(castTime) {
	const ticks = Math.floor((castTime > 0 ? castTime : 0) / 16);
	return Math.max(MIN_FRAMES, ticks);
}

/**
 * A new ring, as the client builds it on the effect's first tick.
 *
 * @param {number} size 45 or 25
 * @param {number} arg the ring's argument
 * @param {number} frames the effect's lifetime, ticks
 * @param {boolean} [cycle] the colour-cycling twin (primitive 139)
 * @return {object}
 */
export function createRing(size, arg, frames, cycle = false) {
	const short = frames < SHORT_LIFE;
	const lengths = bandLengths(arg);
	return {
		arg,
		frames,
		cycle,
		mode: cycle ? CYCLE_MODES[0] : ringMode(arg),
		bands: BAND_START.map((start, b) => ({
			start,
			length: lengths[b],
			alpha: short ? 0 : size + BAND_ALPHA[b],
			counter: short ? 0 - 5 * b : 0,
			foot: FOOT_START,
			lean: LEAN_START,
			points: new Array(POINTS).fill(0)
		}))
	};
}

function phaseOf(b, c) {
	switch (b) {
		case 0:
			return c;
		case 1:
			return c + 90;
		case 2:
			return (c + 90) * 2;
		default:
			return (c + 135) * 2;
	}
}

/**
 * Run a ring one tick.
 *
 * @param {object} ring from createRing
 */
export function stepRing(ring) {
	const slow = ring.arg === 22;
	for (let b = 0; b < ring.bands.length; b++) {
		const band = ring.bands[b];
		band.counter++;
		// The twin's bands each set the ring's mode as their counter passes a step.
		if (ring.cycle && band.counter >= 0 && band.counter % CYCLE_TICKS === 0) {
			ring.mode = CYCLE_MODES[(band.counter / CYCLE_TICKS) % CYCLE_MODES.length];
		}
		if (band.counter <= 0) {
			continue;
		}

		band.foot = f32(band.foot + FOOT_STEP);
		band.lean--;
		if (band.lean < LEAN_MIN) {
			band.lean = LEAN_MIN;
			band.alpha = 0;
		}

		if (band.foot < FOOT_FULL) {
			band.alpha += slow ? 5 : 10;
		} else {
			band.alpha -= 3;
			if (band.alpha < 1) {
				band.alpha = 0;
				if (band.counter < ring.frames - 30) {
					band.foot = FOOT_RESTART;
					band.lean = slow ? 64 : 74;
				}
			}
		}

		const wave = Math.sin((phaseOf(b, band.counter) % 360) * DEG);
		for (let j = 0; j < POINTS; j++) {
			band.points[j] = band.length + band.length * WOBBLE * Math.sin(9 * j * DEG) * wave;
		}
	}
}

/**
 * Write one vertex in roBrowser's GL space, from client units about `center`.
 */
function vertex(out, i, center, x, y, up, u, v) {
	out[i + 0] = center[0] + 0.5 + x / UNITS_PER_CELL;
	out[i + 1] = -center[2] - up / UNITS_PER_CELL;
	out[i + 2] = center[1] + 0.5 + y / UNITS_PER_CELL;
	out[i + 3] = u;
	out[i + 4] = v;
	return i + 5;
}

/**
 * Fill `out` with the ring's triangles, band after band (STRIPS * 6 vertices each).
 * V is 1 at a strip's foot and 0 at its tip; strip k runs U from k/21 to (k+1)/21.
 *
 * @param {Float32Array} out RING_VERTICES * 5 floats
 * @param {object} ring
 * @param {Array} center position, in cells
 */
export function buildRing(out, ring, center) {
	let o = 0;
	for (const band of ring.bands) {
		const reach = Math.cos(band.lean * DEG);
		const up_ = Math.sin(band.lean * DEG);
		let prev = null;
		for (let j = 0; j < POINTS; j++) {
			const angle = ((band.start + 18 * j) % 360) * DEG;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const p = band.points[j];
			const point = {
				fx: band.foot * cos,
				fy: band.foot * sin,
				tx: (band.foot + p * reach) * cos,
				ty: (band.foot + p * reach) * sin,
				up: p * up_
			};
			if (prev) {
				const u0 = (j - 1) / 21;
				const u1 = j / 21;
				o = vertex(out, o, center, prev.fx, prev.fy, 0, u0, 1);
				o = vertex(out, o, center, point.fx, point.fy, 0, u1, 1);
				o = vertex(out, o, center, point.tx, point.ty, point.up, u1, 0);

				o = vertex(out, o, center, prev.tx, prev.ty, prev.up, u0, 0);
				o = vertex(out, o, center, point.tx, point.ty, point.up, u1, 0);
				o = vertex(out, o, center, prev.fx, prev.fy, 0, u0, 1);
			}
			prev = point;
		}
	}
}
