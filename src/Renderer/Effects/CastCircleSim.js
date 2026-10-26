/**
 * Renderer/Effects/CastCircleSim.js
 *
 * Motion and geometry of the official client's cast circle, without any
 * WebGL, so it can be tested on its own. Hell's Drive casts with the untinted
 * circle (effect 1709, new_earthdrive/ring_brown.tga); the client's wind and
 * dark element cast auras (56, 59) use it with Magic_Green / Magic_Violet.
 * Effects 54, 55 and 57 use the tinted circle (see TINT_MODES).
 *
 * As the official client builds it:
 *
 *  - Four bands, each a ring of strips standing on a small circle around the
 *    caster's feet and leaning out. A band has 21 points; each strip runs from
 *    the foot circle up to a tip out along the band's lean.
 *  - A point's height is the band's amplitude times sin(9 j) for point j, so a
 *    band is a hump, low at both ends of its arc. The three inner bands turn
 *    (3, 4 and 5 degrees a tick) and grow to full height over 90 ticks. The
 *    fourth, nearly upright and very tall, stays put and grows the same way,
 *    then pulses slowly between 10% and 100%.
 *  - Drawn white with normal alpha blending. The inner bands keep alpha 180
 *    and lose 5 a tick over the last 40 ticks; the tall band climbs from 70 to
 *    100 and loses 3 a tick at the end.
 *  - It lasts the cast time, but at least 70 ticks.
 *  - The tinted circle has the same bands, coloured and blended by its mode.
 *    Its tall band stays at alpha 60, loses 2 a tick at the end and does not
 *    pulse: it grows over 90 ticks and holds, like the others.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second), degrees.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as CIRCLE_TICK_MS };

const DEG = Math.PI / 180;

/** The shortest a circle plays, in ticks. */
export const MIN_FRAMES = 70;

/** Points along a band. */
export const POINTS = 21;

/** Ticks a band takes to grow to full height. */
const GROW = 90;

/** Ticks before the end when the bands start to fade. */
const FADE = 40;

/**
 * The bands: foot circle radius, lean from the ground, arc, turn a tick,
 * height amplitude, start angle and start alpha.
 */
export const BANDS = [
	{ foot: 4.5, tilt: 70, arc: 315, spin: 3, height: 25, turn: 0, alpha: 180 },
	{ foot: 5.0, tilt: 57, arc: 315, spin: 4, height: 22, turn: 90, alpha: 180 },
	{ foot: 5.5, tilt: 45, arc: 315, spin: 5, height: 19, turn: 180, alpha: 180 },
	{ foot: 4.0, tilt: 89, arc: 360, spin: 0, height: 250, turn: 0, alpha: 70, pulse: true }
];

/** Strips drawn per band: one between each step of the arc, plus the 315 degree bands' extra step. */
function stripsOf(band) {
	return Math.floor(band.arc / Math.floor(band.arc / (POINTS - 1)));
}

/**
 * The tinted circle's modes: texture colour (0-255) and blending. Effect 54 is
 * ring_blue.tga in mode 2, 55 ring_yellow.tga in mode 1, 57 ring_yellow.tga in mode 0.
 */
export const TINT_MODES = {
	0: { color: [255, 255, 255], additive: false },
	1: { color: [255, 175, 175], additive: true },
	2: { color: [195, 195, 255], additive: false }
};

/** Number of vertices of the circle (triangles, 5 floats each). */
export const CIRCLE_VERTICES = BANDS.reduce((sum, band) => sum + stripsOf(band) * 6, 0);

/**
 * How long a circle plays, in ticks, for a cast of `castTime` ms.
 *
 * @param {number} castTime
 * @return {number}
 */
export function circleFrames(castTime) {
	const ticks = Math.floor((castTime > 0 ? castTime : 0) / 16);
	return Math.max(MIN_FRAMES, ticks);
}

/**
 * A band's alpha (out of 255) on tick `t` (1 on the first).
 *
 * @param {number} b band index
 * @param {number} t
 * @param {number} frames
 * @param {boolean} [tinted] the tinted circle (effects 54, 55, 57)
 * @return {number}
 */
export function bandAlpha(b, t, frames, tinted = false) {
	const band = BANDS[b];
	const fadeFrom = frames - FADE;
	if (!band.pulse) {
		return Math.max(0, band.alpha - 5 * Math.max(0, t - fadeFrom + 1));
	}
	const up = Math.min(tinted ? 60 : 100, band.alpha + 8 * Math.min(t, fadeFrom - 1, 19));
	return Math.max(0, up - (tinted ? 2 : 3) * Math.max(0, t - fadeFrom + 1));
}

/**
 * Height of point `j` of band `b` on tick `t`, in world units.
 *
 * @param {number} b
 * @param {number} j 0 to 20
 * @param {number} t
 * @param {boolean} [tinted] the tinted circle: no band pulses
 * @return {number}
 */
export function pointHeight(b, j, t, tinted = false) {
	const band = BANDS[b];
	const full = band.height * Math.sin(9 * j * DEG);
	if (t < GROW + 1) {
		return Math.max(0, full * Math.sin(t * DEG));
	}
	if (!band.pulse || tinted || t === GROW + 1) {
		return Math.max(0, full);
	}
	return full * 0.55 + full * 0.45 * Math.sin((t % 360) * DEG);
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
 * Fill `out` with band `b`'s triangles on tick `t`.
 * V is 1 at a strip's foot and 0 at its tip; strip k runs U from k/21 to (k+1)/21.
 *
 * @param {Float32Array} out
 * @param {number} o first float to write
 * @param {number} b band index
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 * @param {boolean} tinted
 * @return {number} next float
 */
function buildBand(out, o, b, t, center, tinted) {
	const band = BANDS[b];
	const step = Math.floor(band.arc / (POINTS - 1));
	const turn = (band.turn + band.spin * t) % 360;
	const lean = Math.cos(band.tilt * DEG);
	const rise = Math.sin(band.tilt * DEG);

	let prev = null;
	for (let i = 0, a = 0; a <= band.arc; i++, a += step) {
		const j = Math.min(i, POINTS - 1);
		const angle = (band.arc === 360 && j === POINTS - 1 ? turn : turn + a) * DEG;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const h = pointHeight(b, j, t, tinted);
		const point = {
			fx: band.foot * cos,
			fy: band.foot * sin,
			tx: (band.foot + h * lean) * cos,
			ty: (band.foot + h * lean) * sin,
			up: h * rise
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
	return o;
}

/**
 * Fill `out` with every band's triangles on tick `t`, and say where each band starts.
 *
 * @param {Float32Array} out CIRCLE_VERTICES * 5 floats
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 * @param {boolean} [tinted] the tinted circle (effects 54, 55, 57)
 * @return {number[]} first vertex of each band, then the total
 */
export function buildCircle(out, t, center, tinted = false) {
	const starts = [];
	let o = 0;
	for (let b = 0; b < BANDS.length; b++) {
		starts.push(o / 5);
		o = buildBand(out, o, b, t, center, tinted);
	}
	starts.push(o / 5);
	return starts;
}
