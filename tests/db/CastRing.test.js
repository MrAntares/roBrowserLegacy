import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectTableSource } from '../helpers/effectTableSource.js';

// The official client's cast-aura ring (effects 2367, 1556, 1565, 1938).
//
// Read as text: the tables import the renderer, which does not load without a canvas.
const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');
const effectTable = effectTableSource().replace(/\r\n/g, '\n');

const { MIN_FRAMES, RING_VERTICES, ringFrames, ringMode, ringTint, bandLengths, createRing, stepRing, buildRing } =
	await import('Renderer/Effects/CastRingSim.js');

function entry(id) {
	const start = effectTable.indexOf(`\n\t${id}: [`);
	expect(start, `${id} is defined`).toBeGreaterThan(-1);
	return effectTable.slice(start, effectTable.indexOf('\n\t],', start)).replace(/\s+/g, ' ');
}

function run(ring, ticks) {
	for (let i = 0; i < ticks; i++) {
		stepRing(ring);
	}
	return ring;
}

describe('cast-aura ring effects', () => {
	it('builds each effect with the client\'s texture and arguments', () => {
		for (const [id, args] of [
			[2367, "'ring_yellow.tga', [0, 0] )"],
			[1556, "'ring_blue.tga', [20, 21] )"],
			[1565, "'ring_yellow.tga', [23, 23] )"],
			[1938, "'new_battle_w/abr_battle_warior.tga', [0, 0] )"]
		]) {
			const e = entry(id);
			expect(e).toContain("type: 'FUNC'");
			expect(e).toContain('castLoop: true');
			expect(e).toContain("wav: 'effect/ef_beginspell'");
			expect(e).toContain(
				`new CastRing( Params.Init.ownerEntity.position, Params.Inst.startTick, Params.Init.duration, ${args}`
			);
		}
	});

	it('lasts the cast time, but at least 56 ticks', () => {
		expect(MIN_FRAMES).toBe(56);
		expect(ringFrames(0)).toBe(56);
		expect(ringFrames(895)).toBe(56);
		expect(ringFrames(3000)).toBe(187);
	});

	it('colours each ring by its argument, additive', () => {
		expect(ringMode(0)).toBe(5);
		expect(ringTint(0)).toEqual({ color: [255, 255, 255], additive: true });
		expect(ringTint(20)).toEqual({ color: [10, 66, 114], additive: true });
		expect(ringTint(21)).toEqual({ color: [35, 146, 185], additive: true });
		expect(ringTint(23)).toEqual({ color: [84, 169, 205], additive: true });
		expect(ringTint(1).color).toEqual([255, 255, 170]);
		expect(ringTint(5).color).toEqual([100, 100, 255]);
		expect(bandLengths(0)).toEqual([20, 19, 18, 17]);
		expect(bandLengths(2)).toEqual([25, 24, 23, 22]);
		expect(bandLengths(22)).toEqual([15, 14, 13, 12]);
	});

	it('starts the bands upright, at size + 135 / 90 / 45 / 0 alpha', () => {
		const ring = createRing(45, 0, 120);
		expect(ring.bands.map(b => b.alpha)).toEqual([180, 135, 90, 45]);
		expect(ring.bands.map(b => b.start)).toEqual([180, 270, 0, 90]);
		expect(createRing(25, 0, 120).bands.map(b => b.alpha)).toEqual([160, 115, 70, 25]);
		run(ring, 1);
		expect(ring.bands.map(b => b.alpha)).toEqual([177, 132, 87, 42]);
		expect(ring.bands[0].lean).toBe(79);
		expect(ring.bands[0].foot).toBeCloseTo(4.17, 5);
		// point 10 is the hump's top: 20 x (1 + 0.3 x sin(1 deg))
		expect(ring.bands[0].points[0]).toBe(20);
		expect(ring.bands[0].points[10]).toBeCloseTo(20 * (1 + 0.3 * Math.sin(Math.PI / 180)), 6);
	});

	it('fades a band out by 3 a tick, then starts it again', () => {
		const ring = run(createRing(45, 0, 120), 15);
		const band = ring.bands[3];
		expect(band.alpha).toBe(0);
		expect(band.foot).toBeCloseTo(3.37, 5);
		expect(band.lean).toBe(74);
		run(ring, 9);
		expect(band.alpha).toBe(90);
		run(ring, 1);
		expect(band.alpha).toBe(87);
	});

	it('stops starting bands again 30 ticks before the end', () => {
		const ring = run(createRing(45, 0, 70), 60);
		expect(ring.bands[0].alpha).toBe(0);
		expect(ring.bands[0].lean).toBe(20);
	});

	it('starts every band at 0, 5 ticks apart, on casts under 61 ticks', () => {
		const ring = createRing(45, 0, 56);
		expect(ring.bands.map(b => b.alpha)).toEqual([0, 0, 0, 0]);
		expect(ring.bands.map(b => b.counter)).toEqual([0, -5, -10, -15]);
		run(ring, 2);
		expect(ring.bands[0].alpha).toBe(10);
		expect(ring.bands[1].foot).toBeCloseTo(4.1, 5);
	});

	it('draws 4 bands of 20 strips', () => {
		expect(RING_VERTICES).toBe(480);
		const ring = run(createRing(45, 0, 120), 1);
		const out = new Float32Array(RING_VERTICES * 5);
		buildRing(out, ring, [0, 0, 0]);
		// Band 0 starts at 180 degrees: its first foot is 4.17 units (0.834 cells) to -x.
		expect(out[0]).toBeCloseTo(0.5 - 4.17 / 5, 4);
		expect(out[1]).toBeCloseTo(0, 6);
		expect(out[4]).toBe(1);
	});
});
