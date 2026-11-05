import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let current;
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: () => current } }));

import {
	BANDS,
	POINTS,
	FUNNEL_VERTICES,
	VISIBLE_TICKS,
	funnelAlpha,
	bandState,
	pointHeight,
	buildFunnel
} from 'Renderer/Effects/CastFunnelSim.js';
import CasterMarks, { SCHEDULES, colorAt, splitAlpha } from 'Renderer/Effects/CasterMarks.js';
import { effectTableSource } from '../helpers/effectTableSource.js';

// Cast effects 934 (SS_AKUMUKESU), 2373 (SS_SHINKIROU) and 502 (HN_SPIRAL_PIERCE_MAX)
// as the official client (2026-02-11) plays them.

const effectTable = effectTableSource().replace(/\r\n/g, '\n');

function entry(id) {
	const start = effectTable.indexOf(`\n\t${id}: [`);
	expect(start, `${id} is defined`).toBeGreaterThan(-1);
	return effectTable.slice(start, effectTable.indexOf('\n\t],', start)).replace(/\s+/g, ' ');
}

describe('funnel (primitive 31, variant 4)', () => {
	it('is four full rings of 21 points', () => {
		expect(BANDS).toBe(4);
		expect(POINTS).toBe(21);
		expect(FUNNEL_VERTICES).toBe(4 * 20 * 6);
	});

	it('fades in 20 a tick to 200, then out 5 a tick, gone on tick 50', () => {
		expect(funnelAlpha(1)).toBe(20);
		expect(funnelAlpha(10)).toBe(200);
		expect(funnelAlpha(11)).toBe(195);
		expect(funnelAlpha(49)).toBe(5);
		expect(funnelAlpha(50)).toBe(0);
		expect(funnelAlpha(300)).toBe(0);
		expect(VISIBLE_TICKS).toBe(50);
	});

	it('turns 5 a tick, widens 0.3 a tick and leans flatter down to 40 degrees', () => {
		expect(bandState(0, 1)).toEqual({ angle: 5, lean: 79, foot: 1.3 });
		expect(bandState(3, 1).angle).toBe(275);
		expect(bandState(3, 1).foot).toBeCloseTo(4.3);
		expect(bandState(0, 40).lean).toBe(40);
		expect(bandState(0, 60).lean).toBe(40);
		expect(bandState(1, 60).foot).toBeCloseTo(20);
	});

	it('is a hump 25 units high, breathing 15%, bands a quarter period apart', () => {
		expect(pointHeight(0, 0, 1)).toBeCloseTo(0);
		expect(pointHeight(0, 10, 90)).toBeCloseTo(25 * 1.15);
		expect(pointHeight(1, 10, 0)).toBeCloseTo(25 * 1.15);
		expect(pointHeight(0, 10, 270)).toBeCloseTo(25 * 0.85);
	});

	it('builds closed rings around the centre', () => {
		const out = new Float32Array(FUNNEL_VERTICES * 5);
		expect(buildFunnel(out, 1, [10, 20, 0])).toBe(FUNNEL_VERTICES);
		// first foot vertex of band 0: radius 1.3 units at 5 degrees
		expect(out[0]).toBeCloseTo(10.5 + (1.3 * Math.cos((5 * Math.PI) / 180)) / 5);
		expect(out[1]).toBeCloseTo(0);
		expect(out[3]).toBe(0);
		expect(out[4]).toBe(1);
	});
});

describe('caster marks', () => {
	beforeEach(() => {
		current = {
			GID: 1,
			_flashColor: new Float32Array([1, 1, 1, 1]),
			recalculateBlendingColor: vi.fn(),
			animations: { add: vi.fn() }
		};
	});

	it('934: added body and glow copy two ticks out of four, ticks 12 to 33', () => {
		const on = [];
		for (let age = 0; age < 300; age++) {
			const s = SCHEDULES[934](age);
			expect(s.add).toBe(s.glow);
			expect(s.split).toBe(false);
			expect(s.color).toBe(null);
			if (s.add) {
				on.push(age);
			}
		}
		expect(on).toEqual([12, 13, 16, 17, 20, 21, 24, 25, 28, 29, 32, 33]);
	});

	it('2373: red, added and glowing to tick 30, split images all along', () => {
		expect(SCHEDULES[2373](0)).toEqual({ add: true, glow: true, split: true, color: [255, 0, 0] });
		expect(SCHEDULES[2373](30).color).toEqual([255, 0, 0]);
		expect(SCHEDULES[2373](31)).toEqual({ add: false, glow: false, split: true, color: null });
		expect(colorAt(SCHEDULES[2373], 32)).toEqual([255, 16, 16]);
		expect(colorAt(SCHEDULES[2373], 62)).toEqual([255, 255, 255]);
		expect(colorAt(SCHEDULES[2373], 63)).toBe(null);
		expect(splitAlpha(0)).toBe(150);
		expect(splitAlpha(29)).toBe(5);
		expect(splitAlpha(30)).toBe(0);
	});

	it('502: yellow (added) and white each tick, glow copy to tick 140', () => {
		expect(SCHEDULES[502](0)).toEqual({ add: true, glow: true, split: false, color: [250, 250, 100] });
		expect(SCHEDULES[502](1)).toEqual({ add: false, glow: true, split: false, color: [255, 255, 255] });
		expect(SCHEDULES[502](140).color).toEqual([250, 250, 100]);
		expect(SCHEDULES[502](141)).toEqual({ add: false, glow: false, split: false, color: null });
		expect(colorAt(SCHEDULES[502], 142)).toEqual([255, 255, 116]);
	});

	it('marks the owner on its ticks and takes the marks off when freed', () => {
		const marks = new CasterMarks(current, 0, 100, 2373);
		marks.render(null, 0);
		expect(current._additiveBody).toBe(1);
		expect(current._castGlow).toBe(1);
		expect(current._splitImageAge).toBe(0);
		expect(Array.from(current._flashColor.slice(0, 3))).toEqual([1, 0, 0]);
		marks.render(null, (31 * 1000) / 60 + 1);
		expect(current._additiveBody).toBe(0);
		expect(current._castGlow).toBe(0);
		expect(current._splitImageAge).toBe(31);
		marks.free();
		expect(current._splitImageAge).toBeUndefined();
		// the colour keeps recovering after the effect
		expect(current.animations.add).toHaveBeenCalledTimes(1);
	});

	it('ends with its lifetime or its owner', () => {
		const marks = new CasterMarks(current, 0, 10, 934);
		marks.render(null, 100);
		expect(marks.needCleanUp).toBeUndefined();
		marks.render(null, 200);
		expect(marks.needCleanUp).toBe(true);
		const other = new CasterMarks(current, 0, 300, 502);
		current = { GID: 2 };
		other.render(null, 0);
		expect(other.needCleanUp).toBe(true);
	});
});

describe('effect rows', () => {
	it('934: white funnel and marks for 300 ticks, kept when the cast is cancelled', () => {
		const row = entry(934);
		expect(row).toContain("'ring_white.tga'");
		expect(row).toContain('300, 934');
		expect(row).not.toContain('castLoop');
		expect(row).not.toContain('wav');
	});

	it('2373: black funnel and marks for the cast time', () => {
		const row = entry(2373);
		expect(row).toContain("'ring_black.tga'");
		expect(row).toContain('Params.Init.duration / 16, 2373');
		expect(row.match(/castLoop: true/g)).toHaveLength(2);
		expect(row).not.toContain('wav');
	});

	it('502: marks for the cast time, with EF_BeginSpell.wav', () => {
		const row = entry(502);
		expect(row).toContain('Params.Init.duration / 16, 502');
		expect(row).toContain('castLoop: true');
		expect(row).toContain("wav: 'effect/ef_beginspell'");
	});
});
