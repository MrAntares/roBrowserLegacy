/**
 * Renderer/Effects/BoltRainSim.js
 *
 * Motion and geometry of the official client's bolt effects, Cold Bolt (effect
 * 26) and Fire Bolt (effect 31), without any WebGL, so they can be tested on
 * their own.
 *
 * As the official client plays them, on the target as the damage packet arrives,
 * with the packet's hit count n:
 *
 *  - One bolt on tick 12, then one every 10 ticks, n in all.
 *  - A bolt starts at x 25 + r(10), y 15 + r(10), 60 up, always on the same side
 *    of the target. It heads for a point near the feet, (r(4) - 2, r(4) - 2),
 *    dropping at the angle whose tangent is 60 over its start's ground distance,
 *    2.75 units a tick.
 *  - Once at or under the ground it stops there, with 25 ticks left: 5 at full
 *    alpha, then a straight fade to 0. A ring opens at the target's feet then.
 *  - A bolt is two crossed quads along its line (one level, one upright), half
 *    length L and half width W, U from 0 at the tail to 1 at the head.
 *  - The ring (primitive 12) lives 30 ticks: radius speed 1.2 changing by
 *    (1.2 / 70) x -2 a tick, band 10 wide, alpha up 25.4 a tick, fading from tick 20.
 *  - Fire Bolt also sheds a spark (primitive 5, particle4 sprite) every 4 ticks
 *    from the newest bolt's point, flying back up its line, 20 degrees either
 *    side and 10 up or down, slowing to a third, shrinking and fading to nothing.
 *
 * Units are the client's: world units (5 to a cell), ticks (60 a second).
 * r(k) is a whole number from 0 to k - 1.
 */

import { PRIM_TICK_MS, UNITS_PER_CELL } from './EffectPrimSim.js';

export { PRIM_TICK_MS as BOLT_TICK_MS };

/** Numbers shared by both bolts. */
export const BOLT = {
	first: 12, // tick of the first bolt (and of the sound)
	every: 10, // ticks between bolts
	life: 70, // a bolt's lifetime
	landAge: 45, // a bolt's age right after it lands
	fadeStart: 50, // age the fade starts
	speed: 2.75, // units a tick
	height: 60, // start height
	startX: 25, // start x is startX + r(spread)
	startY: 15, // start y is startY + r(spread)
	spread: 10,
	aim: 4, // aim point is r(aim) - aim / 2 on both ground axes
	alpha: 254,
	effectLife: 160, // effects 26 and 31
	maxCount: 50 // the client keeps at most 50 hits
};

/** The look of each bolt. Fire Bolt's frames change every tick. */
export const BOLT_KINDS = {
	cold: {
		length: 11.5,
		width: 3.8,
		frames: ['icearrow.tga'],
		ring: 'ring_blue.tga'
	},
	fire: {
		length: 14,
		width: 3.5,
		frames: [1, 2, 3, 4, 5, 6].map(i => `\xba\xd2\xc8\xad\xbb\xec${i}.tga`),
		ring: 'ring_yellow.tga'
	}
};

/** The ring each landing opens, as an EffectPrimSim description. */
export const BOLT_RING = {
	prim: 'ring',
	frames: 30,
	radius: 0,
	radiusSpeed: 1.2,
	radiusAccel: (1.2 / 70) * -2,
	width: 10,
	segments: 10,
	alpha: 0,
	alphaSpeed: 254 / 10,
	fadeOutFrame: 20
};

/** Vertices of one bolt: two quads, two triangles each. */
export const BOLT_VERTICES = 12;

/**
 * A whole number from 0 to k - 1
 *
 * @param {number} k
 * @param {function} [random] returns a number in [0, 1)
 * @return {number}
 */
export function randomInt(k, random = Math.random) {
	return Math.min(k - 1, Math.floor(random() * k));
}

/**
 * Plan every bolt of one effect
 *
 * @param {number} count the damage packet's hit count
 * @param {function} [random] returns a number in [0, 1)
 * @return {Array} bolts: spawn tick, start point, step a tick, ticks of flight
 */
export function planBolts(count, random = Math.random) {
	const n = Math.max(1, Math.min(BOLT.maxCount, Math.floor(count) || 1));
	const bolts = [];

	for (let i = 0; i < n; ++i) {
		const start = {
			x: BOLT.startX + randomInt(BOLT.spread, random),
			y: BOLT.startY + randomInt(BOLT.spread, random),
			up: BOLT.height
		};
		const aimX = randomInt(BOLT.aim, random) - BOLT.aim / 2;
		const aimY = randomInt(BOLT.aim, random) - BOLT.aim / 2;

		// Heading toward the aim point; elevation from the start's distance to the feet.
		const heading = Math.atan2(aimY - start.y, aimX - start.x);
		const elevation = Math.atan2(BOLT.height, Math.hypot(start.x, start.y));
		const flat = Math.cos(elevation) * BOLT.speed;
		const step = {
			x: Math.cos(heading) * flat,
			y: Math.sin(heading) * flat,
			up: -Math.sin(elevation) * BOLT.speed
		};

		bolts.push({
			spawn: BOLT.first + BOLT.every * i,
			start,
			step,
			flight: Math.ceil(BOLT.height / -step.up)
		});
	}

	return bolts;
}

/**
 * Where a bolt is and how visible, at the given age (ticks since it started)
 *
 * @param {object} bolt from planBolts
 * @param {number} age
 * @return {object|null} x, y, up, alpha (0..254); null once it is gone
 */
export function boltAt(bolt, age) {
	if (age < 0) {
		return null;
	}

	const moving = Math.min(age, bolt.flight);
	// After landing the bolt's age jumps to landAge and it lives out its last ticks.
	const ownAge = age <= bolt.flight ? age : BOLT.landAge + (age - bolt.flight);

	if (ownAge >= BOLT.life) {
		return null;
	}

	const alpha =
		ownAge <= BOLT.fadeStart ? BOLT.alpha : (BOLT.alpha * (BOLT.life - ownAge)) / (BOLT.life - BOLT.fadeStart);

	return {
		x: bolt.start.x + bolt.step.x * moving,
		y: bolt.start.y + bolt.step.y * moving,
		up: bolt.start.up + bolt.step.up * moving,
		alpha
	};
}

/**
 * Tick (since the effect started) on which a bolt lands and opens its ring
 *
 * @param {object} bolt
 * @return {number}
 */
export function ringStart(bolt) {
	return bolt.spawn + bolt.flight;
}

/**
 * Write one vertex in roBrowser's GL space (x, y on the map, up; GL keeps the
 * map plane in x/z and points y down)
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
 * Build one bolt: two quads crossing along its line, one level and one upright.
 *
 * @param {Float32Array} out
 * @param {number} offset first float to write
 * @param {object} bolt from planBolts
 * @param {object} point from boltAt
 * @param {object} kind BOLT_KINDS entry
 * @param {Array} center target position, in cells
 * @return {number} next float to write
 */
export function buildBolt(out, offset, bolt, point, kind, center) {
	// The line and the two axes across it only depend on the bolt: work them out once.
	// 9 numbers: the line, the level side axis, then the upright one.
	let axes = bolt.axes;
	if (!axes) {
		const len = Math.hypot(bolt.step.x, bolt.step.y, bolt.step.up);
		const dx = bolt.step.x / len;
		const dy = bolt.step.y / len;
		const dz = bolt.step.up / len;
		const flat = Math.hypot(dx, dy) || 1;
		const sx = -dy / flat;
		const sy = dx / flat;
		axes = bolt.axes = [dx, dy, dz, sx, sy, 0, sy * dz, -sx * dz, sx * dy - sy * dx];
	}
	const L = kind.length;
	const W = kind.width;
	let o = offset;

	for (let quad = 0; quad < 2; ++quad) {
		const ax = axes[3 + quad * 3];
		const ay = axes[4 + quad * 3];
		const az = axes[5 + quad * 3];
		// Tail and head points on the line; corners are those +-W across.
		const tx = point.x - axes[0] * L;
		const ty = point.y - axes[1] * L;
		const tz = point.up - axes[2] * L;
		const hx = point.x + axes[0] * L;
		const hy = point.y + axes[1] * L;
		const hz = point.up + axes[2] * L;
		const wx = ax * W;
		const wy = ay * W;
		const wz = az * W;

		// U 0 at the tail, 1 at the head; V 1 on the -W side, 0 on the +W side
		o = vertex(out, o, center, tx - wx, ty - wy, tz - wz, 0, 1);
		o = vertex(out, o, center, hx - wx, hy - wy, hz - wz, 1, 1);
		o = vertex(out, o, center, tx + wx, ty + wy, tz + wz, 0, 0);

		o = vertex(out, o, center, hx - wx, hy - wy, hz - wz, 1, 1);
		o = vertex(out, o, center, hx + wx, hy + wy, hz + wz, 1, 0);
		o = vertex(out, o, center, tx + wx, ty + wy, tz + wz, 0, 0);
	}

	return o;
}

/**
 * Which texture frame a bolt shows at the given age
 *
 * @param {object} kind
 * @param {number} age
 * @return {number}
 */
export function boltFrame(kind, age) {
	return Math.max(0, age) % kind.frames.length;
}

/** Fire Bolt's sparks. */
export const SPARK = {
	every: 4, // ticks between sparks
	life: 6, // life is life + r(lifeSpread) ticks
	lifeSpread: 24,
	speed: 60, // start speed is (speed + r(speedSpread)) / 100 units a tick
	speedSpread: 90,
	slow: 1.5, // the speed falls by start speed / life / slow a tick
	scale: 20, // scale is (scale + r(scaleSpread)) / 100, shrinking to 0
	scaleSpread: 30,
	turn: 20, // heading: the bolt's, -turn + r(2 turn) degrees, backward
	tilt: 10 // elevation: the bolt's, -tilt + r(2 tilt) degrees
};

/**
 * Plan Fire Bolt's sparks. One every 4 ticks while the effect lasts, from the newest
 * bolt's point (where it flies, or where it stuck), once the first bolt is out.
 *
 * @param {Array} bolts from planBolts
 * @param {function} [random] returns a number in [0, 1)
 * @return {Array} sparks: tick, start and end points, life in ticks, scale
 */
export function planSparks(bolts, random = Math.random) {
	const sparks = [];
	const DEG = Math.PI / 180;

	for (let tick = SPARK.every; tick < BOLT.effectLife; tick += SPARK.every) {
		const bolt = bolts.filter(b => b.spawn <= tick).pop();
		if (!bolt) {
			continue;
		}

		const age = Math.min(tick - bolt.spawn, bolt.flight);
		const start = {
			x: bolt.start.x + bolt.step.x * age,
			y: bolt.start.y + bolt.step.y * age,
			up: bolt.start.up + bolt.step.up * age
		};
		const life = SPARK.life + randomInt(SPARK.lifeSpread, random);
		const heading = Math.atan2(bolt.step.y, bolt.step.x) + (randomInt(2 * SPARK.turn, random) - SPARK.turn) * DEG;
		const elevation =
			Math.atan2(-bolt.step.up, Math.hypot(bolt.step.x, bolt.step.y)) +
			(randomInt(2 * SPARK.tilt, random) - SPARK.tilt) * DEG;
		const speed = (SPARK.speed + randomInt(SPARK.speedSpread, random)) / 100;
		const scale = (SPARK.scale + randomInt(SPARK.scaleSpread, random)) / 100;

		// Distance over its life: the speed falls first, then the spark moves.
		const slow = speed / life / SPARK.slow;
		const distance = speed * life - (slow * life * (life + 1)) / 2;
		const flat = Math.cos(elevation) * distance;

		sparks.push({
			tick,
			start,
			end: {
				x: start.x - Math.cos(heading) * flat,
				y: start.y - Math.sin(heading) * flat,
				up: start.up + Math.sin(elevation) * distance
			},
			life,
			scale
		});
	}

	return sparks;
}
