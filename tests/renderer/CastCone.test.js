import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const {
	MIN_FRAMES,
	VARIANTS,
	CONE_VERTICES,
	GROUND_VERTICES,
	coneFrames,
	bandAlpha,
	groundAlpha,
	bubbleFrame,
	buildCone,
	buildGround
} = await import('Renderer/Effects/CastConeSim.js');

const center = [100, 200, 0];

describe('cone cast auras (831, 840-845)', () => {
	it('lasts the cast time, but at least 120 ticks', () => {
		expect(coneFrames(0)).toBe(MIN_FRAMES);
		expect(coneFrames(1000)).toBe(MIN_FRAMES);
		expect(coneFrames(3200)).toBe(200);
	});

	it('fades in to 87 over 29 ticks and out to 0 over the last 46', () => {
		expect(bandAlpha(1, 200)).toBe(3);
		expect(bandAlpha(29, 200)).toBe(87);
		expect(bandAlpha(154, 200)).toBe(87);
		expect(bandAlpha(160, 200)).toBe(75);
		expect(bandAlpha(200, 200)).toBe(0);
	});

	it('fades the ground squares over the last 25 ticks', () => {
		expect(groundAlpha(1, 120)).toBe(200);
		expect(groundAlpha(95, 120)).toBe(200);
		expect(groundAlpha(100, 120)).toBe(160);
		expect(groundAlpha(120, 120)).toBe(0);
	});

	it('shows the next bubble frame each tick', () => {
		expect(bubbleFrame(1)).toBe(1);
		expect(bubbleFrame(27)).toBe(0);
	});

	it('is blue for 831 and turquoise for 845', () => {
		expect(VARIANTS[0]).toEqual({ rgb: [0, 0, 255], gain: 3, additive: true });
		expect(VARIANTS[8]).toEqual({ rgb: [0, 255, 255], gain: 2, additive: true });
	});

	it('stands its bands on a small circle around the caster and leans them out', () => {
		const out = new Float32Array(CONE_VERTICES * 5);
		buildCone(out, 1, center);
		let maxReach = 0;
		let maxUp = 0;
		for (let i = 0; i < CONE_VERTICES; i++) {
			const x = out[i * 5] - 100.5;
			const y = out[i * 5 + 2] - 200.5;
			const up = -out[i * 5 + 1];
			const reach = Math.hypot(x, y);
			if (out[i * 5 + 4] === 1) {
				expect(up).toBe(0);
				expect(reach).toBeGreaterThan(3.2 / 5);
				expect(reach).toBeLessThan(5.4 / 5);
			}
			maxReach = Math.max(maxReach, reach);
			maxUp = Math.max(maxUp, up);
		}
		// 23 units long, up to 30% more, at 40 to 75 degrees: a few cells out and up.
		expect(maxReach).toBeGreaterThan(4);
		expect(maxReach).toBeLessThan(7.5);
		expect(maxUp).toBeGreaterThan(4);
		expect(maxUp).toBeLessThan(6);
	});

	it('lays two squares flat on the ground, as wide as the cone', () => {
		const out = new Float32Array(GROUND_VERTICES * 5);
		buildGround(out, 1, center);
		for (let i = 0; i < GROUND_VERTICES; i++) {
			expect(out[i * 5 + 1]).toBeCloseTo(-0.2, 5);
			const reach = Math.hypot(out[i * 5] - 100.5, out[i * 5 + 2] - 200.5);
			expect(reach).toBeGreaterThan(19.2 / 5 - 1e-4);
			expect(reach).toBeLessThan(24 / 5 + 1e-4);
		}
	});
});

describe('Enchanting Sky', () => {
	it('casts with the blue cone', () => {
		const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');
		expect(source).toMatch(/SkillEffect\[SK\.SKE_ENCHANTING_SKY\] = \{[^}]*castAuraEffectId: 831 \}/);
	});

	it('defines effect 831 with the cone and its ground squares', () => {
		const table = readFileSync(join(process.cwd(), 'src/DB/Effects/EffectTable.js'), 'utf8').replace(/\r\n/g, '\n');
		const start = table.indexOf('\n\t831: [');
		expect(start).toBeGreaterThan(-1);
		const body = table.slice(start, table.indexOf('\n\t],', start));
		expect(body).toContain('new CastCone(');
		expect(body).toContain('variant: 0');
		expect(body).toContain('ground: true');
	});

	it('is removed when the cast is cancelled', () => {
		const source = readFileSync(join(process.cwd(), 'src/Engine/MapEngine/Entity.js'), 'utf8');
		expect(source).toMatch(/454, 60, 513, 831[,\]]/);
	});
});
