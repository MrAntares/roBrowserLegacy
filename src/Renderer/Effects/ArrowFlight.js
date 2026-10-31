/**
 * Renderer/Effects/ArrowFlight.js
 *
 * Timing of the official client's flying arrow (CArrowEffect, kRO 2025-07-16),
 * used by bow attacks, bow skills and archer monsters.
 *
 *  - The client counts the arrow in 24 ms frames.
 *  - A player's bow attack releases the arrow at the attack motion's hit frame
 *    (hit frame x motion speed frames after the attack starts), and the hit
 *    lands 8 frames later.
 *  - The arrow flies 8 frames (192 ms). When the end is closer than 40 units
 *    (8 cells) it flies at 5 units a frame instead, so a shorter flight: about
 *    24 ms a cell.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** The client's arrow frame, in ms. */
export const ARROW_FRAME_MS = 24;

/** Frames of a full flight. */
export const ARROW_FLIGHT_FRAMES = 8;

/** Under this distance (client units, 5 to a cell) the arrow flies at the minimum speed. */
const MIN_SPEED_DISTANCE = 40;

/** Client units in a cell. */
const UNITS_PER_CELL = 5;

/**
 * Flight time of an arrow.
 *
 * @param {number} cells distance from start to end, in cells
 * @return {number} ms
 */
export function arrowFlightMs(cells) {
	const units = Math.max(cells, 0) * UNITS_PER_CELL;
	return ARROW_FLIGHT_FRAMES * ARROW_FRAME_MS * Math.min(1, units / MIN_SPEED_DISTANCE);
}

/**
 * Flight time between two positions ([x, y, z] in cells). At least 1 ms: the client drops a
 * zero-length arrow at once, and a zero duration would mean an endless effect here.
 *
 * @param {number[]} from
 * @param {number[]} to
 * @return {number} ms
 */
export function arrowFlightBetween(from, to) {
	if (!from || !to) {
		return ARROW_FLIGHT_FRAMES * ARROW_FRAME_MS;
	}
	return Math.max(arrowFlightMs(Math.hypot(to[0] - from[0], to[1] - from[1], (to[2] || 0) - (from[2] || 0))), 1);
}

/**
 * When a player's bow attack releases its arrow, and when the hit lands.
 *
 * @param {number} hitFrame the attack motion's hit frame
 * @param {number} motionSpeed the attack motion's speed factor
 * @return {{ releaseMs: number, hitMs: number }} ms after the attack starts
 */
export function bowAttackTiming(hitFrame, motionSpeed) {
	const releaseMs = hitFrame * motionSpeed * ARROW_FRAME_MS;
	return { releaseMs, hitMs: releaseMs + ARROW_FLIGHT_FRAMES * ARROW_FRAME_MS };
}
