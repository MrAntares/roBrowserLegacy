/**
 * Renderer/Effects/CastFunnelSim.js
 *
 * Motion and geometry of the official client's funnel cast effect (primitive
 * 31, variant 4), without any WebGL, so it can be tested on its own.
 * Nightmare Erasion's effect 934 draws it with ring_white.tga, Shinkirou's
 * effect 2373 with ring_black.tga.
 *
 * As the official client builds it:
 *
 *  - Four bands, each a full ring of 20 strips standing on a small circle
 *    around the caster's feet and leaning out, like the cast circle's bands.
 *    A band has 21 points, 18 degrees apart; the last closes the ring.
 *  - Point j's height is 25 sin(9 j) units, breathing 15% as the band turns,
 *    each band a quarter period after the one before.
 *  - Every tick each band turns 5 degrees, its foot circle widens by 0.3
 *    units and it leans 1 degree flatter (80 degrees at first, 40 at most),
 *    so the four rings open out like a funnel.
 *  - Drawn white with normal alpha blending. Each band's alpha climbs 20 a
 *    tick to 200 over 10 ticks, then loses 5 a tick: it is gone on tick 50,
 *    whatever the effect's lifetime.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second), degrees.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as FUNNEL_TICK_MS };

const DEG = Math.PI / 180;

/** Bands, and points along a band. */
export const BANDS = 4;
export const POINTS = 21;

/** Numbers of variant 4. */
export const FUNNEL = {
	height: 25, // hump amplitude
	breathe: 0.15, // height swing, of the amplitude
	turn: 90, // start angle step between bands
	spin: 5, // degrees a tick
	lean: 80, // start lean from the ground
	leanStep: 1, // flatter by this a tick
	leanMin: 40,
	foot: 1, // foot circle radius of band 0; band b starts at b + 1
	spread: 0.3, // foot circle growth a tick
	alphaUp: 20, // a tick, for the first 10 ticks
	riseTicks: 10,
	alphaDown: 5 // a tick, afterwards
};

/** Ticks the funnel shows: alpha is 0 from then on. */
export const VISIBLE_TICKS = FUNNEL.riseTicks + (FUNNEL.alphaUp * FUNNEL.riseTicks) / FUNNEL.alphaDown;

/** Number of vertices of the funnel (triangles, 5 floats each). */
export const FUNNEL_VERTICES = BANDS * (POINTS - 1) * 6;

/**
 * A band's alpha (out of 255) on tick `t` (1 on the first). Every band is the same.
 *
 * @param {number} t
 * @return {number}
 */
export function funnelAlpha(t) {
	if (t <= FUNNEL.riseTicks) {
		return FUNNEL.alphaUp * Math.max(0, t);
	}
	return Math.max(0, FUNNEL.alphaUp * FUNNEL.riseTicks - FUNNEL.alphaDown * (t - FUNNEL.riseTicks));
}

/**
 * Band `b`'s state on tick `t`: start angle, lean and foot radius.
 *
 * @param {number} b band index
 * @param {number} t tick, 1 on the first
 * @return {{angle: number, lean: number, foot: number}}
 */
export function bandState(b, t) {
	return {
		angle: (FUNNEL.turn * b + FUNNEL.spin * t) % 360,
		lean: Math.max(FUNNEL.leanMin, FUNNEL.lean - FUNNEL.leanStep * t),
		foot: FUNNEL.foot + b + FUNNEL.spread * t
	};
}

/**
 * Height of point `j` of band `b` on tick `t`, in world units.
 *
 * @param {number} b
 * @param {number} j 0 to 20
 * @param {number} t
 * @return {number}
 */
export function pointHeight(b, j, t) {
	const hump = FUNNEL.height * Math.sin(9 * j * DEG);
	return hump * (1 + FUNNEL.breathe * Math.sin(((t + FUNNEL.turn * b) % 360) * DEG));
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
 * Fill `out` with every band's triangles on tick `t`.
 * V is 1 at a strip's foot and 0 at its tip; strip k runs U from k/21 to (k+1)/21.
 *
 * @param {Float32Array} out FUNNEL_VERTICES * 5 floats
 * @param {number} t tick, 1 on the first
 * @param {Array} center position, in cells
 * @return {number} vertices written
 */
export function buildFunnel(out, t, center) {
	const step = 360 / (POINTS - 1);
	let o = 0;
	for (let b = 0; b < BANDS; b++) {
		const band = bandState(b, t);
		const lean = Math.cos(band.lean * DEG);
		const rise = Math.sin(band.lean * DEG);
		let prev = null;
		for (let j = 0; j < POINTS; j++) {
			const angle = (j === POINTS - 1 ? band.angle : band.angle + j * step) * DEG;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const h = pointHeight(b, j, t);
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
	}
	return o / 5;
}
