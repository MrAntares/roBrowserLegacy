/**
 * Renderer/Effects/EndureSim.js
 *
 * The official client's Endure look (effect 11, EF_ENDURE), without any WebGL,
 * so it can be tested on its own.
 *
 * As the official client (kRO 2025-07-16) draws it, on the caster when Endure
 * succeeds, for 80 ticks:
 *
 *  - endure.tga, 20 px above the feet: half size 150 px, shrinking by 5 px a
 *    tick, the shrink slowing by 5/45 a tick until it stops at tick 45 (half
 *    size 40).
 *  - One alpha_down.tga streak a tick on ticks 0-49, each pointing along a
 *    random direction, starting 100-139 px from the same point and sliding back
 *    toward it at 4 px a tick, slowing by 0.1 a tick (78 px over its 40 ticks).
 *    Half width (60 + r(100)) / 100 px, half length 30 + r(20) px.
 *  - Alpha 0 to 254 over 20 ticks, then from a third before the end falling to
 *    0 at the end. A streak that would outlive the effect starts fading at once
 *    from 0, so the streaks born after tick 41 never show.
 *
 * The client draws these flat on the screen, in screen pixels, around the
 * caster's projected feet. Here they are sprite pixels (35 to a cell) on the
 * camera plane. Angles are degrees clockwise from straight up; y is down.
 * r(k) is a whole number from 0 to k - 1.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/** Numbers of the effect. */
export const ENDURE = {
	life: 80,
	lift: 20,
	alphaMax: 254,
	fadeIn: 20,
	ring: { half: 150, speed: -5, shrinkTicks: 45 },
	streak: { ticks: 50, life: 40, speed: -4, accel: 0.1 }
};

const r = (random, k) => Math.floor(random() * k);
const rad = deg => (deg * Math.PI) / 180;

/**
 * Alpha (0-254) after k ticks of a prim's life.
 *
 * @param {number} k
 * @param {number} life
 * @return {number}
 */
export function primAlpha(k, life) {
	const fadeStart = life - Math.floor(life / 3);
	const rise = alpha => Math.min((ENDURE.alphaMax / ENDURE.fadeIn) * alpha, ENDURE.alphaMax);
	if (k < fadeStart) {
		return rise(k);
	}
	return Math.max((rise(fadeStart) * (life - k)) / (life - fadeStart), 0);
}

/**
 * Half size of endure.tga after k ticks.
 *
 * @param {number} k
 * @return {number}
 */
export function ringHalfSize(k) {
	const { half, speed, shrinkTicks } = ENDURE.ring;
	const n = Math.min(k, shrinkTicks);
	const accel = -speed / shrinkTicks;
	return half + speed * n + (accel * n * (n + 1)) / 2;
}

/**
 * endure.tga `age` ticks after the effect started, or null outside its life.
 *
 * @param {number} age
 * @return {?object} { offsetX, offsetY, sizeX, sizeY, alpha 0-254, angle }
 */
export function ringAt(age) {
	const k = Math.floor(age);
	if (k < 0 || k >= ENDURE.life) {
		return null;
	}
	const size = ringHalfSize(k) * 2;
	return { offsetX: 0, offsetY: -ENDURE.lift, sizeX: size, sizeY: size, alpha: primAlpha(k, ENDURE.life), angle: 0 };
}

/**
 * The streaks that show (born on ticks 0-41).
 *
 * @param {function} [random] returns a number in [0, 1)
 * @return {Array<object>} { spawn, angle, dist, halfWidth, halfLength }
 */
export function planStreaks(random = Math.random) {
	const streaks = [];
	for (let spawn = 0; spawn < ENDURE.streak.ticks; spawn++) {
		const streak = {
			spawn,
			angle: r(random, 360),
			dist: 100 + r(random, 40),
			halfWidth: (60 + r(random, 100)) / 100,
			halfLength: 30 + r(random, 20)
		};
		if (spawn + ENDURE.streak.life <= ENDURE.life + 1) {
			streaks.push(streak);
		}
	}
	return streaks;
}

/**
 * Distance a streak has slid back after k ticks.
 *
 * @param {number} k
 * @return {number}
 */
export function streakSlide(k) {
	const { speed, accel } = ENDURE.streak;
	return -(speed * k + (accel * k * (k + 1)) / 2);
}

/**
 * A streak `age` ticks after its spawn, or null outside its life.
 *
 * @param {object} streak from planStreaks
 * @param {number} age
 * @return {?object} { offsetX, offsetY, sizeX, sizeY, alpha 0-254, angle }
 */
export function streakAt(streak, age) {
	const k = Math.floor(age);
	if (k < 0 || k >= ENDURE.streak.life) {
		return null;
	}
	const dist = streak.dist - streakSlide(k);
	return {
		offsetX: Math.sin(rad(streak.angle)) * dist,
		offsetY: -Math.cos(rad(streak.angle)) * dist - ENDURE.lift,
		sizeX: streak.halfWidth * 2,
		sizeY: streak.halfLength * 2,
		alpha: primAlpha(k, ENDURE.streak.life),
		angle: streak.angle
	};
}
