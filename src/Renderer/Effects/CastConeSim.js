/**
 * Renderer/Effects/CastConeSim.js
 *
 * Motion and geometry of the official client's cone cast auras
 * (EF_BEGINSPELL_N2 831, EF_BEGINSPELL_N3..N8 840-845 and 2368, and the pulsing
 * crowns of EF_BEGINSPELL_N1 830), without any WebGL, so it can be tested on its own.
 *
 * As the official client builds them:
 *
 *  - The cone is four bands of W_bubble01..27.tga, one inside the other, all
 *    rising from a small circle around the caster's feet and leaning out, the
 *    first nearly upright (75 degrees), the last flatter (40 degrees). Each band
 *    is a ring of 20 strips, 23 world units long, turning 3 degrees a tick. A
 *    band's strips swell and shrink in length (up to 30%) along the ring, and
 *    the circle at its feet breathes as it turns. All bands show the same
 *    bubble frame, the next one each tick.
 *  - Each band is drawn twice: once white and faint (normal alpha blending),
 *    once in the cone's colour, brighter (two or three times the alpha),
 *    additive except for 2368's black, which darkens. Its alpha climbs 3 a
 *    tick for its first 29 ticks (to 87) and falls 2 a tick over its last 46.
 *  - Enchanting Sky's cone (831) also has two squares of cir0002.bmp flat on
 *    the ground, 23 degrees apart, as wide as the cone, in blue. They pulse in
 *    size, out of step, and fade out over the last 25 ticks.
 *  - The effect lasts the cast time, but at least 120 ticks.
 *
 * 830 is a sibling of the cone: two crowns of the same four bubble bands, which
 * do not turn but pulse. Each band flashes in while low and narrow, then fades
 * out as it leans flatter and its foot circle widens, and starts over when it
 * is gone. The bands start at different alphas, so they pulse out of step.
 * The first crown is light blue and additive, the second white. It lasts the
 * cast time, but at least 100 ticks.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second), degrees.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as CONE_TICK_MS };

const DEG = Math.PI / 180;

/** The shortest a cone plays, in ticks. */
export const MIN_FRAMES = 120;

/** W_bubble01..27.tga */
export const BUBBLE_FRAMES = 27;

/** The bands: how far each leans from the ground, and where it starts turning. */
export const BANDS = [
	{ tilt: 75, turn: 180 },
	{ tilt: 63, turn: 270 },
	{ tilt: 52, turn: 0 },
	{ tilt: 40, turn: 90 }
];

/** Strips around a band. */
export const STRIPS = 20;

/** A strip's length, and the radius of the circle the bands rise from. */
const LENGTH = 23;
const FOOT = 4.3;

/**
 * The cone's colour, how much brighter than the white pass it is, and whether
 * it adds light (otherwise it is blended normally), by variant.
 */
export const VARIANTS = {
	0: { rgb: [0, 0, 255], gain: 3, additive: true }, // 831, blue
	3: { rgb: [255, 0, 0], gain: 3, additive: true }, // 840, red
	4: { rgb: [0, 255, 0], gain: 2, additive: true }, // 841, green
	5: { rgb: [255, 255, 0], gain: 2, additive: true }, // 842, yellow
	6: { rgb: [255, 255, 255], gain: 2, additive: true }, // 843, white
	7: { rgb: [255, 0, 255], gain: 2, additive: true }, // 844, purple
	8: { rgb: [0, 255, 255], gain: 2, additive: true }, // 845, turquoise
	11: { rgb: [0, 0, 0], gain: 2, additive: false } // 2368, black
};

/** The shortest 830's crowns play, in ticks. */
export const PULSE_MIN_FRAMES = 100;

/** 830's two crowns: each band's starting alpha, colour and blending, in drawing order. */
export const PULSE_CROWNS = [
	{ alpha: [180, 135, 90, 45], rgb: [100, 100, 255], additive: true },
	{ alpha: [160, 115, 70, 25], rgb: [255, 255, 255], additive: false }
];

/** 830's band lengths. */
export const PULSE_LENGTHS = [30, 29, 28, 27];

/** How 830's bands start, and start over. */
const PULSE = {
	tilt: 80,
	foot: 4.1,
	restartTilt: 74,
	restartFoot: 3.37,
	minTilt: 10,
	grow: 0.07,
	flashBelow: 4,
	flashUp: 10,
	fadeDown: 3,
	lastRestart: 30
};

/** The ground squares under 831: texture, colour, start alpha, size and angle of each. */
export const GROUND = {
	texture: 'cir0002.bmp',
	rgb: [35, 35, 255],
	alpha: 200,
	size: 24,
	layers: [
		{ angle: 0, pulse: 0 },
		{ angle: 23, pulse: 180 }
	]
};

/**
 * How long a cone plays, in ticks, for a cast of `castTime` ms.
 *
 * @param {number} castTime
 * @return {number}
 */
export function coneFrames(castTime, min = MIN_FRAMES) {
	const ticks = Math.floor((castTime > 0 ? castTime : 0) / 16);
	return Math.max(min, ticks);
}

/**
 * The state of one crown's bands on tick `t` (1 on the first): alpha (0-255),
 * lean (degrees) and foot radius (world units) of each.
 * The client keeps the foot radius in single precision, so this does too.
 *
 * @param {number} t
 * @param {number} frames
 * @param {Array<number>} alphas each band's starting alpha
 * @return {Array<{alpha: number, tilt: number, foot: number}>}
 */
export function pulseBands(t, frames, alphas) {
	const f = Math.fround;
	return alphas.map(start => {
		let alpha = start;
		let tilt = PULSE.tilt;
		let foot = f(PULSE.foot);

		for (let age = 1; age <= t; age++) {
			tilt -= 1;
			foot = f(foot + f(PULSE.grow));
			let base = alpha;
			if (tilt < PULSE.minTilt) {
				tilt = PULSE.minTilt;
				base = 0;
			}
			if (foot < PULSE.flashBelow) {
				alpha = base + PULSE.flashUp;
			} else {
				alpha = base - PULSE.fadeDown;
				if (alpha < 1) {
					alpha = 0;
					if (age < frames - PULSE.lastRestart) {
						foot = f(PULSE.restartFoot);
						tilt = PULSE.restartTilt;
					}
				}
			}
		}
		return { alpha: Math.min(255, alpha), tilt, foot };
	});
}

/**
 * A band's alpha (0-255 scale, before the passes' gain) on tick `t` (1 on the first).
 *
 * @param {number} t
 * @param {number} frames
 * @return {number}
 */
export function bandAlpha(t, frames) {
	const up = Math.min(100, 3 * Math.min(t, 29));
	const down = 2 * Math.max(0, t - (frames - 46));
	return Math.max(0, up - down);
}

/**
 * The ground squares' alpha on tick `t`.
 *
 * @param {number} t
 * @param {number} frames
 * @return {number}
 */
export function groundAlpha(t, frames) {
	return Math.max(0, GROUND.alpha - 8 * Math.max(0, t - (frames - 25)));
}

/**
 * Which W_bubble frame (0-26) shows on tick `t`.
 *
 * @param {number} t
 * @return {number}
 */
export function bubbleFrame(t) {
	return t % BUBBLE_FRAMES;
}

/** Number of vertices of the cone (triangles, 5 floats each). */
export const CONE_VERTICES = BANDS.length * STRIPS * 6;

/** Number of vertices of the ground squares. */
export const GROUND_VERTICES = GROUND.layers.length * 6;

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
 * How far around its swell a band is on tick `t`, in degrees.
 */
function swellPhase(band, t) {
	return band < 2 ? t + band * 90 : (t + band * 45) * 2;
}

/**
 * Fill `out` with the cone's triangles on tick `t`.
 * V is 1 at a strip's foot and 0 at its tip; U runs 1/21 a strip.
 *
 * @param {Float32Array} out CONE_VERTICES * 5 floats
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 */
export function buildCone(out, t, center) {
	buildBands(
		out,
		t,
		center,
		BANDS.map(band => {
			const turn = (band.turn + 3 * t) % 360;
			return { turn, foot: FOOT + Math.sin(turn * DEG), tilt: band.tilt, length: LENGTH };
		})
	);
}

/**
 * Fill `out` with one of 830's crowns on tick `t`, for the band states from pulseBands().
 * Same layout as buildCone(), but the bands do not turn.
 *
 * @param {Float32Array} out CONE_VERTICES * 5 floats
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 * @param {Array<{tilt: number, foot: number}>} states
 */
export function buildPulse(out, t, center, states) {
	buildBands(
		out,
		t,
		center,
		BANDS.map((band, b) => ({
			turn: band.turn,
			foot: states[b].foot,
			tilt: states[b].tilt,
			length: PULSE_LENGTHS[b]
		}))
	);
}

/**
 * The four bands' strips: each band rises from a circle of radius `foot`,
 * starting at angle `turn`, its strips `length` long (swelling along the ring)
 * and leaning `tilt` degrees from the ground.
 */
function buildBands(out, t, center, bands) {
	let o = 0;

	for (let b = 0; b < bands.length; b++) {
		const { turn, foot, tilt, length: base } = bands[b];
		const lean = Math.cos(tilt * DEG);
		const rise = Math.sin(tilt * DEG);
		const swell = Math.sin(swellPhase(b, t) * DEG);

		let prev = null;
		for (let j = 0; j <= STRIPS; j++) {
			const angle = (turn + (360 / STRIPS) * j) * DEG;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const length = base * (1 + 0.3 * Math.sin(9 * j * DEG) * swell);
			const point = {
				fx: foot * cos,
				fy: foot * sin,
				tx: (foot + length * lean) * cos,
				ty: (foot + length * lean) * sin,
				up: length * rise,
				u: j / 21
			};

			if (prev) {
				o = vertex(out, o, center, prev.fx, prev.fy, 0, prev.u, 1);
				o = vertex(out, o, center, point.fx, point.fy, 0, point.u, 1);
				o = vertex(out, o, center, point.tx, point.ty, point.up, point.u, 0);

				o = vertex(out, o, center, point.tx, point.ty, point.up, point.u, 0);
				o = vertex(out, o, center, prev.tx, prev.ty, prev.up, prev.u, 0);
				o = vertex(out, o, center, prev.fx, prev.fy, 0, prev.u, 1);
			}
			prev = point;
		}
	}
}

/**
 * Fill `out` with the ground squares on tick `t`, 1 world unit above the ground.
 *
 * @param {Float32Array} out GROUND_VERTICES * 5 floats
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 */
export function buildGround(out, t, center) {
	const uv = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1]
	];
	let o = 0;

	for (const layer of GROUND.layers) {
		const pulse = (layer.pulse + 3 * t) % 360;
		const reach = GROUND.size * (0.8 + 0.1 * (1 + Math.sin(pulse * DEG)));
		const corners = [0, 1, 2, 3].map(k => {
			const a = (layer.angle + 90 * k) * DEG;
			return [Math.cos(a) * reach, Math.sin(a) * reach];
		});

		for (const k of [0, 1, 2, 2, 3, 0]) {
			o = vertex(out, o, center, corners[k][0], corners[k][1], 1, uv[k][0], uv[k][1]);
		}
	}
}
