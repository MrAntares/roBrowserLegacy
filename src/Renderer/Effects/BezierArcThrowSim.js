/**
 * Renderer/Effects/BezierArcThrowSim.js
 *
 * The path of a thrown effect, as the official client flies Thundering Orb's
 * orb: a quadratic Bezier from above the thrower to the landing point that
 * bows out to one side. No WebGL here, so the numbers can be tested.
 *
 * Points are in roBrowser's GL world space: (x + 0.5, -height, y + 0.5), so the
 * ground is the x/z plane and up is -y.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Official ticks run at 60 Hz. */
export const TICK_MS = 1000 / 60;

/** How much of the path is left drops by this much each tick, from 1. */
export const STEP = 0.07;

/** The start is the thrower's feet moved this far up the screen, in cells (10 client units). */
export const RAISE = 2;

/** Turn of the control point when the thrower is as near the camera as the landing point or nearer. */
export const TURN_NEAR = (4 * Math.PI) / 3;

/** Turn of the control point when the thrower is farther from the camera. */
export const TURN_FAR = (2 * Math.PI) / 3;

/**
 * How much of the path is left, `elapsed` ms after the throw: 1 at the start,
 * one step less on the first tick. Done at 0 or below.
 *
 * @param {number} elapsed ms
 * @return {number}
 */
export function pathLeft(elapsed) {
	return 1 - STEP * (elapsed / TICK_MS + 1);
}

/**
 * A world point moved `cells` up the screen.
 *
 * @param {number[]} point GL world
 * @param {number} cells
 * @param {Float32Array|number[]} modelView the camera's, column major
 * @return {number[]}
 */
export function raiseOnScreen(point, cells, modelView) {
	// The world direction the camera draws as up: its view y row, scaled back
	// to world units
	const ux = modelView[1];
	const uy = modelView[5];
	const uz = modelView[9];
	const k = cells / (ux * ux + uy * uy + uz * uz || 1);
	return [point[0] + ux * k, point[1] + uy * k, point[2] + uz * k];
}

/**
 * How far a world point is from the camera.
 *
 * @param {number[]} point GL world
 * @param {Float32Array|number[]} modelView
 * @return {number}
 */
export function depth(point, modelView) {
	return -(modelView[2] * point[0] + modelView[6] * point[1] + modelView[10] * point[2] + modelView[14]);
}

/**
 * The control point: the landing point plus the throw (landing point minus
 * start) turned about the vertical axis.
 *
 * @param {number[]} start GL world
 * @param {number[]} end GL world
 * @param {number} turn radians
 * @return {number[]}
 */
export function controlPoint(start, end, turn) {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];
	const dz = end[2] - start[2];
	const c = Math.cos(turn);
	const s = Math.sin(turn);
	return [end[0] + dx * c + dz * s, end[1] + dy, end[2] - dx * s + dz * c];
}

/**
 * Where the thrown effect is.
 *
 * @param {number[]} start GL world
 * @param {number[]} control GL world
 * @param {number[]} end GL world
 * @param {number} left how much of the path is left, 1 to 0
 * @return {number[]}
 */
export function pathPoint(start, control, end, left) {
	const a = left * left;
	const b = 2 * left * (1 - left);
	const e = (1 - left) * (1 - left);
	return [
		a * start[0] + b * control[0] + e * end[0],
		a * start[1] + b * control[1] + e * end[1],
		a * start[2] + b * control[2] + e * end[2]
	];
}

/**
 * The thrown effect's point for a frame.
 *
 * @param {number[]} from thrower's feet, GL world
 * @param {number[]} to landing point, GL world
 * @param {number} left how much of the path is left
 * @param {Float32Array|number[]} modelView
 * @return {number[]}
 */
export function throwPoint(from, to, left, modelView) {
	const start = raiseOnScreen(from, RAISE, modelView);
	const turn = depth(from, modelView) <= depth(to, modelView) ? TURN_NEAR : TURN_FAR;
	return pathPoint(start, controlPoint(start, to, turn), to, left);
}

/**
 * roBrowser position (x, y, height) to GL world.
 *
 * @param {number[]} position
 * @return {number[]}
 */
export function toWorld(position) {
	return [position[0] + 0.5, -position[2], position[1] + 0.5];
}

/**
 * GL world to roBrowser position (x, y, height).
 *
 * @param {number[]} point
 * @return {number[]}
 */
export function fromWorld(point) {
	return [point[0] - 0.5, point[2] - 0.5, -point[1]];
}

export default { pathLeft, raiseOnScreen, depth, controlPoint, pathPoint, throwPoint, toWorld, fromWorld };
