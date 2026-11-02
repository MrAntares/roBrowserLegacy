/**
 * Renderer/Effects/SoulStrikeSim.js
 *
 * The official client's Soul Strike souls (effect 15, EF_SOULSTRIKE),
 * without any WebGL (kRO 2025-07-16, 0xbd3030 with primitive 8, update
 * 0xb50500, trail 0xb7f2b0, draw 0xb639e0):
 *
 *  - The effect is launched once on the caster as the damage packet arrives,
 *    with its hit count n (1 to 7; other counts show nothing).
 *  - Soul k (1..n) starts on tick 11k - 5 (6, 17, 28...) with its own
 *    EF_SoulStrike.wav: a particle1 sprite at scale 2.75, 10 units up, that
 *    lives 40 ticks and flies from the caster to the target.
 *  - It first backs off and then speeds up (3.5 units a tick taken off its
 *    speed, falling by 0.175 a tick), and bows out sideways and back on a
 *    curve (an offset starting at -2 a tick, rising by 0.1). The souls fan
 *    out around the line to the target: soul k bows at k * step - 90 degrees
 *    (n = 1: 1 degree, i.e. up; 2: 180; 3: 90; 4: 60; 5: 45; 6: 30; 7: 25).
 *  - It draws a trail of its last 12 positions, alpha 254 down by 254/12
 *    and scale down by 2.75/24 for each step back.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Numbers of a soul. */
export const SOUL = {
	every: 11, // soul k starts on tick every * k - lead
	lead: 5,
	maxHits: 7,
	life: 40,
	up: 10,
	back: 3.5, // taken off the speed, falling to -3.5 over the life
	bow: -2, // sideways step, rising to +2 over the life
	scale: 2.75,
	alpha: 254,
	trail: 12
};

/** Degrees between the souls' bows, by hit count; the first is 1 degree when alone. */
const STEPS = [0, 1, 180, 90, 60, 45, 30, 25];

/**
 * The souls of a damage packet.
 *
 * @param {number} hits the packet's hit count
 * @return {Array} { spawn (tick), bow (degrees) }
 */
export function planSouls(hits) {
	if (!(hits >= 1 && hits <= SOUL.maxHits)) {
		return [];
	}
	const base = hits === 1 ? 0 : -90;
	const out = [];
	for (let k = 1; k <= hits; k++) {
		out.push({ spawn: SOUL.every * k - SOUL.lead, bow: k * STEPS[hits] + base });
	}
	return out;
}

/**
 * Where a soul is after `n` updates, in units from the caster's feet.
 *
 * @param {object} soul from planSouls
 * @param {Array} dir unit direction to the target on the map, [x, y]
 * @param {number} distance to the target, units
 * @param {number} n updates (1..life)
 * @param {object} [kind] the flight's numbers: SOUL, or another effect's with the same keys
 *   (life, back, bow, up; the speed covers the distance `speedTimes` times, default 1)
 * @return {object} { x, y, up }
 */
export function soulAt(soul, dir, distance, n, kind = SOUL) {
	const speed = ((kind.speedTimes || 1) * distance) / kind.life;
	const backStep = (2 * kind.back) / kind.life;
	const bowStep = (-2 * kind.bow) / kind.life;
	// along the line: the speed, less a back-off that falls each tick
	const along = n * speed - (kind.back * n - (backStep * n * (n + 1)) / 2);
	// across it: the sum of a step that rises each tick
	const across = kind.bow * n + (bowStep * n * (n - 1)) / 2;
	const a = (soul.bow * Math.PI) / 180;
	// The bow turns around the line: 0 is up (the client's y runs down), 90 to the side.
	const side = across * Math.sin(a);
	return {
		x: dir[0] * along + dir[1] * side,
		y: dir[1] * along - dir[0] * side,
		up: kind.up - across * Math.cos(a)
	};
}

/**
 * Alpha (0..254) and scale of trail step `i` (0 the soul itself).
 *
 * @param {number} i
 * @return {object} { alpha, scale }
 */
export function trailLook(i) {
	return {
		alpha: SOUL.alpha - (SOUL.alpha / SOUL.trail) * i,
		scale: SOUL.scale - (SOUL.scale / SOUL.trail) * i * 0.5
	};
}
