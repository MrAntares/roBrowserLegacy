import { describe, expect, it } from 'vitest';
import shuffledGrid from '../../src/Renderer/Effects/ShuffledGrid.js';
import spinSets, { SPIN_SLOT } from '../../src/Renderer/Effects/SpinSets.js';
import groundScatter from '../../src/Renderer/Effects/GroundScatter.js';
import {
	STEP,
	TURN_FAR,
	TURN_NEAR,
	controlPoint,
	fromWorld,
	pathLeft,
	pathPoint,
	raiseOnScreen,
	throwPoint,
	toWorld
} from 'Renderer/Effects/BezierArcThrowSim.js';

// Placement helpers the official client uses for world-placed skill effect copies.

const TICK = 1000 / 60;
const close = (a, b) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 5));

describe('shuffledGrid', () => {
	it('puts one spot in each row and column, centred, one cell apart', () => {
		for (const n of [3, 5, 7, 9]) {
			for (let run = 0; run < 20; run++) {
				const spots = shuffledGrid(n);
				const half = (n - 1) / 2;
				expect(spots).toHaveLength(n);
				const range = Array.from({ length: n }, (_, i) => i - half);
				expect(spots.map(s => s[0]).sort((a, b) => a - b)).toEqual(range);
				expect(spots.map(s => s[1]).sort((a, b) => a - b)).toEqual(range);
			}
		}
	});

	it('pairs the two shuffles in order', () => {
		// random() always 0: each shuffle moves the front element to the back in turn
		expect(shuffledGrid(3, () => 0)).toEqual([
			[0, 0],
			[1, 1],
			[-1, -1]
		]);
	});
});

describe('spinSets', () => {
	it('fans 15-19 copies per set all round, in shuffled 32 ms slots, sets 10 slots apart', () => {
		expect(SPIN_SLOT).toBe(32);
		for (let run = 0; run < 50; run++) {
			const copies = spinSets(3);
			for (let set = 0; set < 3; set++) {
				const mine = copies.filter(c => c.set === set);
				const n = mine.length;
				expect(n).toBeGreaterThanOrEqual(15);
				expect(n).toBeLessThanOrEqual(19);
				const step = 360 / n;
				mine.forEach((c, i) => {
					expect(c.turn).toBeGreaterThanOrEqual(i * step);
					expect(c.turn).toBeLessThan(i * step + Math.floor(step));
					expect(Math.abs(Math.round(c.turn - i * step) - (c.turn - i * step))).toBeLessThan(1e-9);
				});
				const slots = mine.map(c => c.slot - 10 * set).sort((a, b) => a - b);
				expect(slots).toEqual(Array.from({ length: n }, (_, i) => i));
			}
		}
	});

	it('uses the edges of the random ranges', () => {
		// random() always 0: 15 copies, no jitter
		const low = spinSets(1, () => 0);
		expect(low).toHaveLength(15);
		expect(low.map(c => c.turn)).toEqual(Array.from({ length: 15 }, (_, i) => i * 24));
		// random() just under 1: 19 copies, jitter up to floor(360 / 19) - 1 = 17
		const high = spinSets(1, () => 0.999999);
		expect(high).toHaveLength(19);
		expect(high[0].turn).toBe(17);
	});
});

describe('groundScatter', () => {
	it('scatters each axis by -14..+15 official units, in cells', () => {
		expect(groundScatter(15, () => 0)).toEqual([3, 3]);
		expect(groundScatter(15, () => 0.999999)).toEqual([-2.8, -2.8]);
		const seen = new Set();
		for (let i = 0; i < 30; i++) {
			seen.add(groundScatter(15, () => i / 30)[0]);
		}
		expect(seen.size).toBe(30);
	});
});

describe('BezierArcThrow path', () => {
	it('drops 0.07 of the path each tick and lands after 14 drawn ticks', () => {
		expect(STEP).toBe(0.07);
		expect(pathLeft(0)).toBeCloseTo(0.93);
		expect(pathLeft(13 * TICK)).toBeCloseTo(0.02);
		expect(pathLeft(14 * TICK)).toBeLessThan(0);
	});

	it('flies a quadratic Bezier from start to end', () => {
		const start = [0, -2, 0];
		const control = [4, 0, 6];
		const end = [10, 0, 0];
		close(pathPoint(start, control, end, 1), start);
		close(pathPoint(start, control, end, 0), end);
		close(pathPoint(start, control, end, 0.5), [4.5, -0.5, 3]);
	});

	it('puts the control point beyond the end, the throw turned about the vertical', () => {
		const start = [0, -2, 0];
		const end = [10, 0, 0];
		// 10 cells along x, turned 120 degrees in the ground plane
		close(controlPoint(start, end, TURN_FAR), [10 - 5, 2, -10 * Math.sin(TURN_FAR)]);
		close(controlPoint(start, end, TURN_NEAR), [10 - 5, 2, -10 * Math.sin(TURN_NEAR)]);
	});

	it('starts 2 cells up the screen from the caster and bows by depth', () => {
		// Camera looking down -z with screen up along world -y (roBrowser's up)
		const view = new Float32Array([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, -50, 1]);
		close(raiseOnScreen([3, 0, 4], 2, view), [3, -2, 4]);
		const caster = [0, 0, 10]; // nearer the camera
		const cell = [0, 0, 0];
		const start = [0, -2, 10];
		close(throwPoint(caster, cell, 1, view), start);
		close(throwPoint(caster, cell, 0, view), cell);
		close(throwPoint(caster, cell, 0.5, view), pathPoint(start, controlPoint(start, cell, TURN_NEAR), cell, 0.5));
		const raised = [0, -2, 0];
		close(throwPoint(cell, caster, 0.5, view), pathPoint(raised, controlPoint(raised, caster, TURN_FAR), caster, 0.5));
	});

	it('maps positions to the STR shader world and back', () => {
		close(toWorld([3, 4, 5]), [3.5, -5, 4.5]);
		close(fromWorld(toWorld([3, 4, 5])), [3, 4, 5]);
	});
});
