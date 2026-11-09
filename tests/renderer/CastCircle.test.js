import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectTableSource } from '../helpers/effectTableSource.js';

const { MIN_FRAMES, BANDS, CIRCLE_VERTICES, circleFrames, bandAlpha, pointHeight, buildCircle } = await import(
	'Renderer/Effects/CastCircleSim.js'
);

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');
const center = [100, 200, 0];

describe('untinted cast circle (Hell\'s Drive, effect 1709)', () => {
	it('lasts the cast time, but at least 70 ticks', () => {
		expect(MIN_FRAMES).toBe(70);
		expect(circleFrames(0)).toBe(70);
		expect(circleFrames(1000)).toBe(70);
		expect(circleFrames(1200)).toBe(75);
		expect(circleFrames(3200)).toBe(200);
	});

	it('has the client\'s four bands', () => {
		expect(BANDS.map(b => [b.foot, b.tilt, b.arc, b.spin, b.height, b.turn, b.alpha])).toEqual([
			[4.5, 70, 315, 3, 25, 0, 180],
			[5, 57, 315, 4, 22, 90, 180],
			[5.5, 45, 315, 5, 19, 180, 180],
			[4, 89, 360, 0, 250, 0, 70]
		]);
		// 21 strips on the 315 degree bands (one extra past 300), 20 round the full ring
		expect(CIRCLE_VERTICES).toBe((21 * 3 + 20) * 6);
	});

	it('keeps the inner bands at 180 and fades them 5 a tick over the last 40', () => {
		expect(bandAlpha(0, 1, 100)).toBe(180);
		expect(bandAlpha(0, 59, 100)).toBe(180);
		expect(bandAlpha(0, 60, 100)).toBe(175);
		expect(bandAlpha(2, 95, 100)).toBe(0);
	});

	it('brings the tall band from 70 to 100, 8 a tick, and fades it 3 a tick', () => {
		expect(bandAlpha(3, 1, 100)).toBe(78);
		expect(bandAlpha(3, 3, 100)).toBe(94);
		expect(bandAlpha(3, 4, 100)).toBe(100);
		expect(bandAlpha(3, 59, 100)).toBe(100);
		expect(bandAlpha(3, 60, 100)).toBe(97);
		expect(bandAlpha(3, 100, 100)).toBe(0);
	});

	it('grows each band as a hump over 90 ticks; the tall one then pulses', () => {
		expect(pointHeight(0, 10, 90)).toBeCloseTo(25);
		expect(pointHeight(0, 10, 30)).toBeCloseTo(12.5);
		expect(pointHeight(0, 5, 200)).toBeCloseTo(25 * Math.sin(Math.PI / 4));
		expect(pointHeight(0, 0, 200)).toBeCloseTo(0);
		expect(pointHeight(3, 10, 91)).toBeCloseTo(250);
		expect(pointHeight(3, 10, 270)).toBeCloseTo(250 * 0.1);
		expect(pointHeight(3, 10, 450)).toBeCloseTo(250);
	});

	it('stands the strips on the foot circle and leans their tips out', () => {
		const out = new Float32Array(CIRCLE_VERTICES * 5);
		const starts = buildCircle(out, 120, center);
		expect(starts).toEqual([0, 126, 252, 378, 498]);
		let maxUp = 0;
		let minFoot = Infinity;
		for (let i = 0; i < CIRCLE_VERTICES; i++) {
			const x = out[i * 5] - 100.5;
			const y = out[i * 5 + 2] - 200.5;
			const up = -out[i * 5 + 1];
			if (out[i * 5 + 4] === 1) {
				expect(up).toBe(0);
				minFoot = Math.min(minFoot, Math.hypot(x, y));
			}
			maxUp = Math.max(maxUp, up);
		}
		expect(minFoot).toBeCloseTo(4 / 5);
		// The tall band reaches 250 sin 89 units, about 50 cells
		expect(maxUp).toBeGreaterThan(40);
		expect(maxUp).toBeLessThanOrEqual((250 * Math.sin((89 * Math.PI) / 180)) / 5 + 1e-4);
	});

	it('is Hell\'s Drive\'s cast aura, cancelled with the cast', () => {
		const table = effectTableSource().replace(/\r\n/g, '\n');
		const start = table.indexOf('\n\t1709: [');
		expect(start).toBeGreaterThan(-1);
		const row = table.slice(start, table.indexOf('\n\t],', start));
		expect(row).toContain("'new_earthdrive/ring_brown.tga'");
		expect(row).toContain("wav: 'effect/ef_beginspell'");
		expect(row).toContain('new CastCircle(');
		expect(read('DB/Skills/SkillEffect.js')).toMatch(/HN_HELLS_DRIVE\] = \{[^}]*castAuraEffectId: 1709 \}/);
		expect(read('Engine/MapEngine/Entity.js')).toMatch(/EffectManager\.remove\(\s*null,\s*entity\.GID,\s*\[[^\]]*\b1709\b/);
	});
});
