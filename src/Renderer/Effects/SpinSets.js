/**
 * Renderer/Effects/SpinSets.js
 *
 * Copies the official client fans out round a spot (Kunai - Nightmare's
 * blades): one set per EZ2 row, 15 to 19 copies a set. Copy i of n is turned
 * i x 360 / n degrees plus a random few, so a set covers every direction. Each
 * copy starts in a 32 ms slot: a random order within the set, and set k
 * starting 10 slots after set k - 1, so the sets overlap.
 */

import { shuffled } from './ShuffledGrid.js';

/** Start-delay slot length, ms */
export const SPIN_SLOT = 32;

/** Slots from one set's start to the next */
const SET_GAP = 10;

/** Copies in a set: SET_MIN plus 0 .. SET_SPREAD - 1 */
const SET_MIN = 15;
const SET_SPREAD = 5;

/**
 * @param {number} sets how many sets (one per row)
 * @param {function} [random] source of numbers in [0, 1), Math.random by default
 * @return {{set: number, turn: number, slot: number}[]} one entry per copy: its set,
 *   its clockwise turn on screen in degrees, and its start slot (x SPIN_SLOT ms)
 */
export default function spinSets(sets, random = Math.random) {
	const copies = [];
	for (let set = 0; set < sets; set++) {
		const n = SET_MIN + Math.floor(random() * SET_SPREAD);
		const step = 360 / n;
		const jitter = Math.floor(step);
		const order = shuffled(n, random);
		for (let i = 0; i < n; i++) {
			copies.push({
				set,
				turn: i * step + Math.floor(random() * jitter),
				slot: order[i] + SET_GAP * set
			});
		}
	}
	return copies;
}
