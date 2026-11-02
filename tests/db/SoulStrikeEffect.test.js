import { describe, expect, it } from 'vitest';
import { SOUL, planSouls, soulAt, trailLook } from 'Renderer/Effects/SoulStrikeSim.js';
import { soulStrikeEffect, soulTrailEffect, soulAim } from 'DB/Effects/SoulStrikeEffect.js';
import EffectTable from 'DB/Effects/EffectTable.js';

// Soul Strike's souls (effect 15), kRO 2025-07-16 0xbd3030 with primitive 8:
// one particle1 soul per hit from the caster, on ticks 6, 17, 28..., flying
// to the target on a curve with a trail of 12.

describe('Soul Strike souls', () => {
	it('start one per hit, 11 ticks apart, fanned around the line', () => {
		expect(planSouls(1)).toEqual([{ spawn: 6, bow: 1 }]);
		expect(planSouls(2)).toEqual([
			{ spawn: 6, bow: 90 },
			{ spawn: 17, bow: 270 }
		]);
		expect(planSouls(5).map(s => s.bow)).toEqual([-45, 0, 45, 90, 135]);
		expect(planSouls(7).map(s => s.spawn)).toEqual([6, 17, 28, 39, 50, 61, 72]);
		expect(planSouls(0)).toEqual([]);
		expect(planSouls(8)).toEqual([]);
	});

	it('back off, then reach just past the target in 40 ticks', () => {
		const soul = { bow: 0 };
		expect(soulAt(soul, [1, 0], 100, 1).x).toBeCloseTo(2.5 - 3.325);
		const end = soulAt(soul, [1, 0], 100, SOUL.life);
		expect(end.x).toBeCloseTo(103.5);
		expect(end.y).toBeCloseTo(0);
	});

	it('bow up and come back down when alone', () => {
		const soul = { bow: 0 };
		const start = soulAt(soul, [1, 0], 100, 1);
		const mid = soulAt(soul, [1, 0], 100, 20);
		const end = soulAt(soul, [1, 0], 100, SOUL.life);
		expect(start.up).toBeCloseTo(12);
		expect(mid.up).toBeCloseTo(10 + 40 - 19);
		expect(end.up).toBeCloseTo(12);
	});

	it('bow to the side at 90 degrees', () => {
		const p = soulAt({ bow: 90 }, [1, 0], 100, 20);
		expect(p.up).toBeCloseTo(10);
		expect(Math.abs(p.y)).toBeCloseTo(21);
	});

	it('trail 12 steps, fading and shrinking to half', () => {
		expect(trailLook(0)).toEqual({ alpha: 254, scale: 2.75 });
		expect(trailLook(6).alpha).toBeCloseTo(127);
		expect(trailLook(12).scale).toBeCloseTo(1.375);
	});
});

describe('Soul Strike effect', () => {
	it('plays from the caster, once per packet', () => {
		expect(EffectTable[15]).toBe(soulStrikeEffect);
		expect(soulStrikeEffect[0]).toMatchObject({ type: 'FUNC', attachedEntity: false });
	});

	it('draws particle1 at 2.75 scale, the sound with the soul itself only', () => {
		const { dir, distance } = soulAim([0, 0], [0, 20]);
		expect(dir).toEqual([0, 1]);
		expect(distance).toBe(100);
		const head = soulTrailEffect({ bow: 0 }, dir, distance, 0);
		expect(head).toMatchObject({ type: '3D', spriteName: 'particle1', wav: 'effect/ef_soulstrike' });
		expect(head.track(0)).toMatchObject({ size: 275, alpha: 254 / 255 });
		expect(head.track(SOUL.life)).toBeNull();
		const tail = soulTrailEffect({ bow: 0 }, dir, distance, 3);
		expect(tail.wav).toBeUndefined();
		expect(tail.track(2)).toBeNull();
		expect(tail.track(3).y).toBeCloseTo(head.track(0).y);
	});

	it('climbs to a target standing higher, reaching its height at the end', () => {
		const { dir, distance, rise } = soulAim([0, 0, 1], [0, 20, 3]);
		expect(rise).toBe(2);
		const flat = soulTrailEffect({ bow: 0 }, dir, distance, 0);
		const up = soulTrailEffect({ bow: 0 }, dir, distance, 0, rise);
		expect(up.track(0).z).toBeCloseTo(flat.track(0).z, 1);
		const end = SOUL.life - 1;
		const progress = up.track(end).y * 5 / distance;
		expect(up.track(end).z - flat.track(end).z).toBeCloseTo(2 * Math.min(1, progress));
	});

	it('climbs over its life when the target stands in the same cell', () => {
		const { dir, distance, rise } = soulAim([5, 5, 0], [5, 5, 2]);
		expect(distance).toBe(0);
		const flat = soulTrailEffect({ bow: 0 }, dir, distance, 0);
		const up = soulTrailEffect({ bow: 0 }, dir, distance, 0, rise);
		expect(up.track(0).z - flat.track(0).z).toBeCloseTo(2 / SOUL.life);
		expect(up.track(SOUL.life - 1).z - flat.track(SOUL.life - 1).z).toBeCloseTo(2);
	});

	it('spawns 12 sprites a soul, from the soul tick', () => {
		const spammed = [];
		const ctx = { spamEffect: p => spammed.push(p) };
		soulStrikeEffect[0].func.call(ctx, {
			Inst: { position: [0, 0, 0], otherPosition: [5, 0, 0], startTick: 1000 },
			Init: { hitCount: 3 }
		});
		expect(spammed).toHaveLength(36);
		expect(spammed[0].Inst.startTick).toBeCloseTo(1000 + 6 * (1000 / 60));
		expect(spammed[35].Inst.startTick).toBeCloseTo(1000 + 28 * (1000 / 60));
	});
});
