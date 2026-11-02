/**
 * Renderer/Effects/IceSpikesSim.js
 *
 * Motion and geometry of the official client's ice spikes (primitive 9), as
 * Frost Diver draws them, without any WebGL, so they can be tested on their
 * own.
 *
 *  - A spike is a four-sided pyramid of ice.tga: a square base 2S wide, its tip
 *    H out along the spike's axis. The axis leans from straight up by the
 *    spike's pitch (90 = upright) toward its yaw.
 *  - It starts 30 units under the ground and pushes out along its axis: 3 units
 *    on the first tick, 0.15 less each tick, stopping on tick 20 (28.5 units).
 *  - It lives 40 ticks, fading in a straight line from tick 30.
 *  - Effect 27 (Frost Diver's path, on the caster) puts one thin spike a tick
 *    along the line to the target: the first 5 units out, then every 2 units,
 *    the last once the line is within 2.5 units of the target.
 *  - Effect 28 (Frost Diver's hit, on the target) puts 8 wide spikes at the
 *    target's feet at once.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second), degrees.
 * r(k) is a whole number from 0 to k - 1.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as SPIKE_TICK_MS };

const DEG = Math.PI / 180;

/** Numbers shared by every spike. */
export const SPIKE = {
	life: 40,
	fadeStart: 30,
	depth: 30, // start under the ground
	speed: 3, // units on the first tick...
	slow: (3 / 40) * 2, // ...and this much less each tick after
	stopAge: 20, // it stops here
	uStep: 0.25 // texture U across each face
};

/** Frost Diver's path (effect 27). */
export const PATH = {
	first: 5, // first spike this far along the line
	step: 2, // then every this many units, one a tick
	near: 2.5, // the last one once the line is this close to the target
	life: 150, // effect 27
	alpha: 254,
	radial: [5, 10], // a spike sits (radial[0] + r(radial[1])) / 10 off the line, any way round
	base: [60, 40], // half width (base[0] + r(base[1])) / 100
	height: [150, 30], // height (height[0] + r(height[1])) / 10
	pitch: [75, 30] // pitch pitch[0] + r(pitch[1])
};

/** Frost Diver's hit (effect 28). */
export const SHARDS = {
	count: 8,
	life: 100, // effect 28
	alpha: 200,
	radial: [1, 4],
	base: [100, 250],
	height: [200, 100],
	pitch: [80, 20]
};

/** Vertices of one spike: four triangles. */
export const SPIKE_VERTICES = 12;

/**
 * A whole number from 0 to k - 1
 */
export function randomInt(k, random = Math.random) {
	return Math.min(k - 1, Math.floor(random() * k));
}

/**
 * One spike's random look, at a point (units, relative to the effect)
 */
function makeSpike(spawn, x, y, set, alpha, random) {
	const turn = randomInt(360, random) * DEG;
	const radial = (set.radial[0] + randomInt(set.radial[1], random)) / 10;
	return {
		spawn,
		x: x + Math.cos(turn) * radial,
		y: y + Math.sin(turn) * radial,
		size: (set.base[0] + randomInt(set.base[1], random)) / 100,
		height: (set.height[0] + randomInt(set.height[1], random)) / 10,
		yaw: randomInt(360, random),
		pitch: set.pitch[0] + randomInt(set.pitch[1], random),
		alpha
	};
}

/**
 * Plan Frost Diver's path: one spike a tick from the caster toward the target.
 *
 * @param {number} dx target minus caster, units
 * @param {number} dy
 * @param {function} [random] returns a number in [0, 1)
 * @return {Array} spikes (points relative to the caster)
 */
export function planPath(dx, dy, random = Math.random) {
	const distance = Math.hypot(dx, dy);
	const ux = distance ? dx / distance : 1;
	const uy = distance ? dy / distance : 0;
	const spikes = [];

	for (let tick = 0; tick < PATH.life; ++tick) {
		const along = PATH.first + PATH.step * tick;
		const x = ux * along;
		const y = uy * along;
		spikes.push(makeSpike(tick, x, y, PATH, PATH.alpha, random));
		if (Math.hypot(dx - x, dy - y) <= PATH.near) {
			break;
		}
	}

	return spikes;
}

/**
 * Plan Frost Diver's hit: 8 wide spikes at the target's feet.
 *
 * @param {function} [random] returns a number in [0, 1)
 * @return {Array} spikes (points relative to the target)
 */
export function planShards(random = Math.random) {
	const spikes = [];
	for (let i = 0; i < SHARDS.count; ++i) {
		spikes.push(makeSpike(0, 0, 0, SHARDS, SHARDS.alpha, random));
	}
	return spikes;
}

/**
 * How far a spike has pushed out, and its alpha, at the given age
 *
 * @param {object} spike
 * @param {number} age ticks since it started
 * @return {object|null} rise (units along the axis), alpha; null once gone
 */
export function spikeAt(spike, age) {
	if (age < 0 || age >= SPIKE.life) {
		return null;
	}
	const t = Math.min(age, SPIKE.stopAge);
	const rise = SPIKE.speed * t - (SPIKE.slow * t * (t + 1)) / 2;
	const alpha =
		age <= SPIKE.fadeStart ? spike.alpha : (spike.alpha * (SPIKE.life - age)) / (SPIKE.life - SPIKE.fadeStart);
	return { rise, alpha };
}

/**
 * The spike's axis (toward its tip) and two directions across it
 *
 * @param {object} spike
 * @return {Array} [axis, across1, across2], unit vectors (x, y, up)
 */
export function spikeAxes(spike) {
	const yaw = spike.yaw * DEG;
	const pitch = spike.pitch * DEG;
	const axis = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
	const side = [-Math.sin(yaw), Math.cos(yaw), 0];
	const other = [
		axis[1] * side[2] - axis[2] * side[1],
		axis[2] * side[0] - axis[0] * side[2],
		axis[0] * side[1] - axis[1] * side[0]
	];
	return [axis, side, other];
}

function vertex(out, i, center, x, y, up, u, v) {
	out[i + 0] = center[0] + 0.5 + x / UNITS_PER_CELL;
	out[i + 1] = -center[2] - up / UNITS_PER_CELL;
	out[i + 2] = center[1] + 0.5 + y / UNITS_PER_CELL;
	out[i + 3] = u;
	out[i + 4] = v;
	return i + 5;
}

/**
 * Build one spike: four faces, each from two base corners (V 1) to the tip (V 0),
 * a quarter of the texture across.
 *
 * @param {Float32Array} out
 * @param {number} offset first float to write
 * @param {object} spike
 * @param {number} rise from spikeAt
 * @param {Array} center effect position, in cells
 * @return {number} next float to write
 */
// Base corner signs (p, q) in order round the spike
const CORNER_P = [-1, 1, 1, -1];
const CORNER_Q = [-1, -1, 1, 1];

export function buildSpike(out, offset, spike, rise, center) {
	// The axes only depend on the spike: work them out once.
	const [axis, a, b] = spike.axes || (spike.axes = spikeAxes(spike));
	const baseX = spike.x + axis[0] * rise;
	const baseY = spike.y + axis[1] * rise;
	const baseZ = -SPIKE.depth + axis[2] * rise;
	const S = spike.size;
	const H = spike.height;
	const tipX = baseX + axis[0] * H;
	const tipY = baseY + axis[1] * H;
	const tipZ = baseZ + axis[2] * H;
	let o = offset;
	let u = 0;

	for (let i = 0; i < 4; ++i) {
		const j = (i + 1) % 4;
		const p0 = CORNER_P[i] * S;
		const q0 = CORNER_Q[i] * S;
		const p1 = CORNER_P[j] * S;
		const q1 = CORNER_Q[j] * S;
		o = vertex(
			out,
			o,
			center,
			baseX + a[0] * p0 + b[0] * q0,
			baseY + a[1] * p0 + b[1] * q0,
			baseZ + a[2] * p0 + b[2] * q0,
			u,
			1
		);
		o = vertex(out, o, center, tipX, tipY, tipZ, u, 0);
		o = vertex(
			out,
			o,
			center,
			baseX + a[0] * p1 + b[0] * q1,
			baseY + a[1] * p1 + b[1] * q1,
			baseZ + a[2] * p1 + b[2] * q1,
			u + SPIKE.uStep,
			1
		);
		u += SPIKE.uStep;
	}

	return o;
}
