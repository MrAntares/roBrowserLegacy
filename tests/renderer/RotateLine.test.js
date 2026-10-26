import { describe, expect, it } from 'vitest';

const { LINES, POINTS, LOOKS, TEXTURE, rotateLineFrames, createLines, stepLines, pointAngle, pointCorners } =
	await import('Renderer/Effects/RotateLineSim.js');

function run(ticks, effectId = 986, random = () => 0.5) {
	const lines = createLines(effectId, random);
	for (let age = 0; age < ticks; age++) {
		stepLines(lines, age);
	}
	return lines;
}

describe('rotate line (986 gray, 1000 blue)', () => {
	it('is four ribbons of 21 cloud11.tga points, gray and normal-blended or blue and additive', () => {
		expect(TEXTURE).toBe('cloud11.tga');
		expect(LINES).toBe(4);
		expect(POINTS).toBe(21);
		expect(LOOKS[986]).toEqual({ rgb: [50, 50, 50], additive: false, radius: 0 });
		expect(LOOKS[1000]).toEqual({ rgb: [100, 100, 255], additive: true, radius: 3 });
	});

	it('lasts the cast time, castTime / 16 ticks', () => {
		expect(rotateLineFrames(1600)).toBe(100);
		expect(rotateLineFrames(1000)).toBe(62);
		expect(rotateLineFrames(0)).toBe(0);
	});

	it('stacks the lines: start angle 90 L, height 28 - 5L, radius 7 - L (+3 blue), tilt 80..100', () => {
		const lines = createLines(986, () => 0);
		expect(lines.map(l => l.points[0].angle)).toEqual([0, 90, 180, 270]);
		expect(lines.map(l => l.height)).toEqual([28, 23, 18, 13]);
		expect(lines.map(l => l.points[0].radius)).toEqual([7, 6, 5, 4]);
		expect(lines[0].tilt).toBe(80);
		expect(createLines(986, () => 0.999)[0].tilt).toBe(100);
		expect(createLines(1000, () => 0)[3].points[0].radius).toBe(7);
	});

	it('turns 5 degrees a tick, each point 5 further, the span widening 3 a tick and a point', () => {
		const head = run(1)[0].points;
		expect(head[0]).toMatchObject({ angle: 5, span: 33, alpha: 51, radius: 7 });
		expect(head[20]).toMatchObject({ angle: 105, span: 93, alpha: 71 });
		expect(pointAngle(head[20], 20)).toBe(185);
		expect(run(60)[0].points[0].span).toBe(180);
		expect(run(72)[0].points[0].angle).toBe(0);
	});

	it('fades in for 13 ticks, holds, then fades 1 a tick from tick 52 while spiralling out', () => {
		let p = run(13)[0].points;
		expect(p[0].alpha).toBe(63);
		expect(p[20].alpha).toBe(83);
		expect(p[20].radius).toBe(7);

		p = run(14)[0].points;
		expect(p[0].radius).toBeCloseTo(7.1);
		expect(p[20].radius).toBeCloseTo(9.1);
		expect(p[20].alpha).toBe(83);

		p = run(51)[0].points;
		expect(p[0].alpha).toBe(63);
		expect(p[0].radius).toBeCloseTo(10.8);

		p = run(52)[0].points;
		expect(p[0].alpha).toBe(62);
		expect(p[20].alpha).toBe(42);

		p = run(114)[0].points;
		expect(p.every(point => point.alpha === 0)).toBe(true);
	});

	it('hangs each ribbon about 2 units below its upper edge, leaning by the tilt', () => {
		const lines = run(1, 986, () => 10 / 21);
		expect(lines[0].tilt).toBe(90);
		const out = pointCorners(lines[0], 0, new Float32Array(6));
		expect(out[0]).toBeCloseTo(7 * Math.cos((5 * Math.PI) / 180));
		expect(out[1]).toBe(-28);
		expect(out[4]).toBeCloseTo(-26);
		expect(out[3]).toBeCloseTo(out[0]);
	});
});
