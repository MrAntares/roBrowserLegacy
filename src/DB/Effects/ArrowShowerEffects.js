/**
 * DB/Effects/ArrowShowerEffects.js
 *
 * Arrow Shower (AC_SHOWER), played like the official client (kRO 2025-07-16):
 * from each damage packet, arrows fly from the caster to the damaged actor and
 * to the centre of the 8 cells around it. The ground packet plays none. Each
 * arrow waits 18 frames of 24 ms before it shows, then flies 8 frames, from 2
 * cells (10 official units) up to 4 cells (20 units) up at the end point.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** The 8 cells around the centre, in the client's order. */
export const NEIGHBOUR_CELLS = [
	[1, 0],
	[1, 1],
	[1, -1],
	[-1, 0],
	[-1, 1],
	[-1, -1],
	[0, 1],
	[0, -1]
];

/** The client's arrow frame. */
const FRAME_MS = 24;

/** Wait before an arrow shows: 18 frames. */
export const START_DELAY_MS = 18 * FRAME_MS;

/** Flight: 8 frames. */
export const FLIGHT_MS = 8 * FRAME_MS;

/**
 * One arrow from the caster (the effect's other entity) to its owner's
 * position plus a cell offset.
 * @param {number[]} offset [x, y] in cells
 */
function arrow(offset) {
	return {
		type: '3D',
		alphaMax: 1,
		angle: 180,
		attachedEntity: false,
		delayStart: START_DELAY_MS,
		duration: FLIGHT_MS,
		absoluteSpriteName: 'data/sprite/npc/skel_archer_arrow',
		toSrc: true,
		endCellOffset: offset,
		rotateToTarget: true,
		rotateWithCamera: true,
		size: 100,
		zOffset: 2,
		zOffsetEnd: 2,
		zIndex: 1
	};
}

/** EffectTable rows. */
export function arrowShowerEffects() {
	return {
		// Each damage packet: the damaged actor and the 8 cells around it
		ef_arrow_shower_target: [arrow([0, 0]), ...NEIGHBOUR_CELLS.map(arrow)]
	};
}
