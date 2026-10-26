/**
 * Renderer/Effects/RotateLineSim.js
 *
 * Motion of the official client's rotate-line effect (EF_ROTATE_LINE_GRAY 986,
 * EF_ROTATE_LINE_BLUE 1000), without any WebGL, so it can be tested on its own.
 * 986 is the cast effect of the Huuma Shuriken and Kunai skills, played with
 * EF_DARKCASTING (454).
 *
 * As the official client draws it:
 *
 *  - Four ribbons of cloud11.tga circle the caster, one above the other: line L
 *    starts at 90 * L degrees, 28 - 5L units up, radius 7 - L (3 more for the
 *    blue one), leaning by a random tilt of 80..100 degrees.
 *  - Each ribbon is 21 points along an arc; a quad joins each point to the one
 *    before it. The head turns 5 degrees a tick and every point trails it by
 *    5 degrees more; the arc's span starts at 30 degrees and widens 3 a tick
 *    (and 3 a point) up to 180.
 *  - Alpha starts at 50 and climbs 1 a tick for 13 ticks (each point i is i
 *    brighter than the head), holds, then from tick 51 falls 1 a tick (each
 *    point i is i dimmer). From tick 13 the radius grows 0.1 a tick, and 0.1 a
 *    point along the arc, so the ribbons spiral out as they fade.
 *  - 986 is dark gray (50, 50, 50) with normal blending; 1000 is blue
 *    (100, 100, 255), additive.
 *  - The ring turns with the camera: angle 0 is screen right, 90 away from it.
 *  - It lasts the cast time (castTime / 16 ticks).
 *
 * Units are the client's: world units (5 to a cell, negative height is up),
 * ticks (60 a second), degrees.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as ROTATE_LINE_TICK_MS, UNITS_PER_CELL };

const DEG = Math.PI / 180;

/** Texture, under data/texture/effect/. */
export const TEXTURE = 'cloud11.tga';

/** Ribbons, and points along each. */
export const LINES = 4;
export const POINTS = 21;

/** Colour, blending and extra radius by effect id. */
export const LOOKS = {
	986: { rgb: [50, 50, 50], additive: false, radius: 0 },
	1000: { rgb: [100, 100, 255], additive: true, radius: 3 }
};

/** Starting values of every ribbon. */
export const START = {
	turn: 90, // degrees between the lines' start angles
	height: 28, // units up, line 0
	heightStep: 5,
	radius: 7, // units, line 0
	radiusStep: 1,
	span: 30, // degrees
	alpha: 50,
	drop: 3, // the lower edge hangs drop - sin(tilt) below the upper one
	tiltMin: 80,
	tiltRange: 21 // tilt is tiltMin + 0..20
};

/** Per-tick change. */
export const STEP = {
	turn: 5, // degrees a tick, and between points
	span: 3, // degrees a tick, and between points
	maxSpan: 180,
	alphaInTicks: 13, // alpha climbs 1 a tick while the age is below this
	fadeAfter: 50, // alpha falls 1 a tick once the age is past this
	grow: 0.1 // radius, units a tick from alphaInTicks on, and between points
};

/**
 * How long the effect plays, in ticks, for a cast of `castTime` ms.
 *
 * @param {number} castTime ms
 * @return {number}
 */
export function rotateLineFrames(castTime) {
	return Math.max(0, Math.floor((castTime || 0) / 16));
}

/**
 * The four ribbons as the client sets them up.
 *
 * @param {number} effectId 986 or 1000
 * @param {function} random returns 0 <= x < 1 (the tilts)
 * @return {Array<object>}
 */
export function createLines(effectId, random = Math.random) {
	const look = LOOKS[effectId] || LOOKS[986];
	const lines = [];
	for (let L = 0; L < LINES; L++) {
		const points = [];
		for (let i = 0; i < POINTS; i++) {
			points.push({
				angle: START.turn * L,
				span: START.span,
				alpha: START.alpha,
				radius: START.radius - START.radiusStep * L + look.radius
			});
		}
		lines.push({
			tilt: START.tiltMin + Math.floor(random() * START.tiltRange),
			height: START.height - START.heightStep * L,
			points
		});
	}
	return lines;
}

/**
 * One client tick: `age` is the ticks already run (the client reads it before
 * counting the tick).
 *
 * @param {Array<object>} lines from createLines, changed in place
 * @param {number} age
 */
export function stepLines(lines, age) {
	for (const line of lines) {
		const head = line.points[0];
		head.angle = (head.angle + STEP.turn) % 360;
		head.span = Math.min(STEP.maxSpan, head.span + STEP.span);
		if (age < STEP.alphaInTicks) {
			head.alpha += 1;
		} else {
			head.radius += STEP.grow;
			if (age > STEP.fadeAfter) {
				head.alpha = Math.max(0, head.alpha - 1);
			}
		}

		for (let i = 1; i < POINTS; i++) {
			const point = line.points[i];
			point.angle = (head.angle + STEP.turn * i) % 360;
			point.span = Math.min(STEP.maxSpan, head.span + STEP.span * i);
			if (age < STEP.alphaInTicks) {
				point.alpha = head.alpha + i;
			} else {
				point.radius = head.radius + STEP.grow * i;
				if (age > STEP.fadeAfter) {
					point.alpha = Math.max(0, head.alpha - i);
				}
			}
		}
	}
}

/**
 * Where point i of a ribbon sits on its circle, whole degrees.
 *
 * @param {object} point
 * @param {number} i
 * @return {number}
 */
export function pointAngle(point, i) {
	return (Math.trunc(point.span / POINTS) * i + point.angle) % 360;
}

/**
 * The upper and lower corners of point i, in the camera-turned frame: x toward
 * screen right, z away from the camera, y height (negative is up), world units.
 *
 * @param {object} line
 * @param {number} i
 * @param {Float32Array} out [upper x, y, z, lower x, y, z]
 * @return {Float32Array} out
 */
export function pointCorners(line, i, out) {
	const point = line.points[i];
	const p = pointAngle(point, i) * DEG;
	const cos = Math.cos(p);
	const sin = Math.sin(p);
	const lean = Math.cos(line.tilt * DEG);
	const up = -line.height;
	out[0] = cos * point.radius;
	out[1] = up;
	out[2] = sin * point.radius;
	out[3] = cos * (point.radius + lean);
	out[4] = up + START.drop - Math.sin(line.tilt * DEG);
	out[5] = sin * (point.radius + lean);
	return out;
}

/**
 * Screen right and away-from-camera directions on the ground, from the view matrix.
 *
 * @param {mat4} modelView view matrix (gl-matrix, column-major)
 * @param {Float32Array} right out: screen right, GL world
 * @param {Float32Array} away out: away from the camera, GL world
 */
export function cameraFrame(modelView, right, away) {
	// Rows of the view rotation are the camera's axes in world space
	let x = modelView[0];
	let z = modelView[8];
	let length = Math.hypot(x, z) || 1;
	right[0] = x / length;
	right[1] = 0;
	right[2] = z / length;

	// The camera looks down, so its up axis leans away from it over the ground
	x = modelView[1];
	z = modelView[9];
	length = Math.hypot(x, z);
	if (length < 1e-6) {
		// Camera level with the ground: away is a quarter turn from right
		away[0] = -right[2];
		away[2] = right[0];
	} else {
		away[0] = x / length;
		away[2] = z / length;
	}
	away[1] = 0;
}
