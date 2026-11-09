import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectTableSource } from '../helpers/effectTableSource.js';

// Cast auras 830 (EF_BEGINSPELL_N1, two pulsing bubble crowns) and 2368
// (the bubble cone in black), as the official client builds them.
const {
	VARIANTS,
	PULSE_MIN_FRAMES,
	PULSE_CROWNS,
	PULSE_LENGTHS,
	CONE_VERTICES,
	coneFrames,
	pulseBands,
	buildPulse
} = await import('Renderer/Effects/CastConeSim.js');

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

function entry(id) {
	const table = effectTableSource().replace(/\r\n/g, '\n');
	const start = table.indexOf(`\n\t${id}: [`);
	expect(start, `${id} is defined`).toBeGreaterThan(-1);
	return table.slice(start, table.indexOf('\n\t],', start));
}

describe('2368: the black cone', () => {
	it('is variant 11: black, twice the band alpha, blended normally', () => {
		expect(VARIANTS[11]).toEqual({ rgb: [0, 0, 0], gain: 2, additive: false });
	});

	it('is the cone with variant 11 and the cast sound', () => {
		const body = entry(2368);
		expect(body).toContain('new CastCone(');
		expect(body).toContain('variant: 11');
		expect(body).toContain("wav: 'effect/ef_beginspell'");
	});
});

describe('830: the pulsing crowns', () => {
	it('lasts the cast time, but at least 100 ticks', () => {
		expect(PULSE_MIN_FRAMES).toBe(100);
		expect(coneFrames(0, PULSE_MIN_FRAMES)).toBe(100);
		expect(coneFrames(3200, PULSE_MIN_FRAMES)).toBe(200);
	});

	it('has a light blue additive crown and a white one, out of step', () => {
		expect(PULSE_CROWNS).toEqual([
			{ alpha: [180, 135, 90, 45], rgb: [100, 100, 255], additive: true },
			{ alpha: [160, 115, 70, 25], rgb: [255, 255, 255], additive: false }
		]);
		expect(PULSE_LENGTHS).toEqual([30, 29, 28, 27]);
	});

	it('fades each band 3 a tick while it leans out and widens', () => {
		const [a, , , d] = pulseBands(1, 200, [180, 135, 90, 45]);
		expect(a.alpha).toBe(177);
		expect(a.tilt).toBe(79);
		expect(a.foot).toBeCloseTo(4.17, 5);
		expect(d.alpha).toBe(42);
	});

	it('starts a band over, low and narrow, when it is gone, then flashes it in', () => {
		// 45 - 3 * 15 = 0 on tick 15
		const gone = pulseBands(15, 200, [45])[0];
		expect(gone).toEqual({ alpha: 0, tilt: 74, foot: Math.fround(3.37) });
		const flash = pulseBands(16, 200, [45])[0];
		expect(flash.alpha).toBe(10);
		expect(flash.tilt).toBe(73);
		// 3.37 + 0.07 a tick reaches 4 after 9 ticks: up 10 a tick until then
		expect(pulseBands(23, 200, [45])[0].alpha).toBe(80);
		expect(pulseBands(25, 200, [45])[0].alpha).toBe(87);
	});

	it('no longer starts a band over in the last 30 ticks', () => {
		// The 45 band goes out on tick 15, then about every 38 ticks.
		const frames = 100;
		const last = pulseBands(frames, frames, [45])[0];
		expect(last.alpha).toBe(0);
		expect(last.tilt).toBeLessThan(74 - 20);
	});

	it('stands the bands on their foot circle, not turning', () => {
		const out = new Float32Array(CONE_VERTICES * 5);
		const center = [100, 200, 0];
		const states = pulseBands(1, 200, PULSE_CROWNS[0].alpha);
		buildPulse(out, 1, center, states);
		const again = new Float32Array(CONE_VERTICES * 5);
		buildPulse(again, 1, center, states.slice());
		expect(again).toEqual(out);
		for (let i = 0; i < CONE_VERTICES; i++) {
			if (out[i * 5 + 4] === 1) {
				expect(out[i * 5 + 1]).toBe(-0);
				const reach = Math.hypot(out[i * 5] - 100.5, out[i * 5 + 2] - 200.5) * 5;
				expect(reach).toBeCloseTo(4.17, 4);
			}
		}
	});

	it('is the pulse kind of the cone, with the cast sound', () => {
		const body = entry(830);
		expect(body).toContain('new CastCone(');
		expect(body).toContain('pulse: true');
		expect(body).toContain("wav: 'effect/ef_beginspell'");
	});

	it('is removed with 2368 when the cast is cancelled', () => {
		expect(read('Engine/MapEngine/Entity.js')).toMatch(/\[[^\]]*\b830, 2368, [^\]]*\]/);
	});
});
