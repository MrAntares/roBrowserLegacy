import { describe, expect, it } from 'vitest';
import {
	ENDURE,
	primAlpha,
	ringHalfSize,
	ringAt,
	planStreaks,
	streakSlide,
	streakAt
} from '../../src/Renderer/Effects/EndureSim.js';
import { endureEffect, endureStreakEffect } from '../../src/DB/Effects/EndureEffect.js';

// Endure (SM_ENDURE, effect 11) as the official client (kRO 2025-07-16) draws it.

let seed = 7;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const TICK = 1000 / 60;

describe('Endure (effect 11)', () => {
	it('plays EF_Endure.wav with endure.tga for 80 ticks, then the streaks', () => {
		expect(endureEffect).toHaveLength(2);
		expect(endureEffect[0]).toMatchObject({ type: '3D', file: 'effect/endure.tga', wav: 'effect/ef_endure' });
		expect(endureEffect[0].duration).toBeCloseTo(80 * TICK, 6);
		expect(endureEffect[1].type).toBe('FUNC');
	});

	it('shrinks endure.tga from half size 150 to 40 over 45 ticks, then holds', () => {
		expect(ringHalfSize(0)).toBe(150);
		expect(ringHalfSize(1)).toBeCloseTo(150 - 5 + 5 / 45, 6);
		expect(ringHalfSize(45)).toBeCloseTo(40, 6);
		expect(ringHalfSize(70)).toBeCloseTo(40, 6);
		expect(ringAt(0)).toMatchObject({ offsetX: 0, offsetY: -20, sizeX: 300, sizeY: 300, alpha: 0 });
		expect(ringAt(80)).toBeNull();
	});

	it('fades in over 20 ticks and out over the last third', () => {
		expect(primAlpha(10, 80)).toBeCloseTo(127, 6);
		expect(primAlpha(20, 80)).toBe(254);
		expect(primAlpha(54, 80)).toBe(254);
		expect(primAlpha(67, 80)).toBeCloseTo(127, 6);
		expect(primAlpha(80, 80)).toBe(0);
		expect(primAlpha(27, 40)).toBe(254);
		expect(primAlpha(40, 40)).toBe(0);
	});

	it('makes one streak a tick, and only those born by tick 41 show', () => {
		const streaks = planStreaks(random);
		expect(streaks.map(s => s.spawn)).toEqual(Array.from({ length: 42 }, (_, i) => i));
		for (const s of streaks) {
			expect(s.angle).toBeGreaterThanOrEqual(0);
			expect(s.angle).toBeLessThan(360);
			expect(s.dist).toBeGreaterThanOrEqual(100);
			expect(s.dist).toBeLessThanOrEqual(139);
			expect(s.halfWidth).toBeGreaterThanOrEqual(0.6);
			expect(s.halfWidth).toBeLessThanOrEqual(1.59 + 1e-9);
			expect(s.halfLength).toBeGreaterThanOrEqual(30);
			expect(s.halfLength).toBeLessThanOrEqual(49);
		}
	});

	it('slides each streak 78 px back toward the point 20 px above the feet, pointing outward', () => {
		expect(streakSlide(0)).toBeCloseTo(0, 6);
		expect(streakSlide(1)).toBeCloseTo(3.9, 6);
		expect(streakSlide(40)).toBeCloseTo(78, 6);
		const streak = { spawn: 0, angle: 90, dist: 120, halfWidth: 1, halfLength: 40 };
		const start = streakAt(streak, 0);
		expect(start.offsetX).toBeCloseTo(120, 6);
		expect(start.offsetY).toBeCloseTo(-20, 6);
		expect(start).toMatchObject({ sizeX: 2, sizeY: 80, angle: 90, alpha: 0 });
		expect(streakAt(streak, 39).offsetX).toBeCloseTo(120 - streakSlide(39), 6);
		const up = streakAt({ ...streak, angle: 0 }, 0);
		expect(up.offsetX).toBeCloseTo(0, 6);
		expect(up.offsetY).toBeCloseTo(-140, 6);
		expect(streakAt(streak, 40)).toBeNull();
	});

	it('draws a streak as a 3D row on the caster, in screen offsets', () => {
		const row = endureStreakEffect({ spawn: 3, angle: 0, dist: 100, halfWidth: 1, halfLength: 30 });
		expect(row).toMatchObject({
			type: '3D',
			file: 'effect/alpha_down.tga',
			sharedTexture: true,
			attachedEntity: true
		});
		expect(row.duration).toBeCloseTo(ENDURE.streak.life * TICK, 6);
		const p = row.track(20);
		expect(p.offsetY).toBeCloseTo(-(100 - streakSlide(20)) - 20, 6);
		expect(p.alpha).toBeCloseTo(1 - 1 / 255, 6);
		expect(row.track(40)).toBeNull();
	});
});
