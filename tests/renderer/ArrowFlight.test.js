import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import {
	ARROW_FRAME_MS,
	arrowFlightMs,
	arrowFlightBetween,
	bowAttackTiming
} from '../../src/Renderer/Effects/ArrowFlight.js';
import { effectTableSource } from '../helpers/effectTableSource.js';

// The official client's flying arrow (kRO 2025-07-16): released at the attack motion's hit frame,
// 8 frames of 24 ms in flight, at least 5 units (one cell) a frame under 40 units.

const src = name => readFileSync(join(process.cwd(), 'src', name), 'utf8');

describe('arrow flight', () => {
	it('flies 8 frames of 24 ms from 8 cells on', () => {
		expect(ARROW_FRAME_MS).toBe(24);
		expect(arrowFlightMs(8)).toBe(192);
		expect(arrowFlightMs(14)).toBe(192);
	});

	it('flies one cell a frame when closer', () => {
		expect(arrowFlightMs(4)).toBe(96);
		expect(arrowFlightMs(1)).toBe(24);
		expect(arrowFlightMs(0)).toBe(0);
	});

	it('measures between two positions, height included', () => {
		expect(arrowFlightBetween([0, 0, 0], [3, 4, 0])).toBe(120);
		expect(arrowFlightBetween([10, 10, 0], [10, 10, 2])).toBe(48);
		expect(arrowFlightBetween(null, [1, 1, 0])).toBe(192);
		expect(arrowFlightBetween([10, 10, 0], [10, 10, 0])).toBe(1);
	});

	it('releases at the hit frame times the motion speed and lands 8 frames later', () => {
		expect(bowAttackTiming(10, 1)).toEqual({ releaseMs: 240, hitMs: 432 });
		expect(bowAttackTiming(10, 0.5)).toEqual({ releaseMs: 120, hitMs: 312 });
	});
});

describe('arrow rows and the bow attack', () => {
	it('gives the arrow projectile its flight from its distance', () => {
		expect(effectTableSource()).toMatch(
			/ef_arrow_projectile: \[[\s\S]*?duration: Params => arrowFlightBetween\(Params\.Inst\.otherPosition, Params\.Inst\.position\),/
		);
	});

	it('lets a row work out its duration per instance', () => {
		const code = src('Renderer/EffectManager.js');
		const start = code.indexOf('Params.Inst.duration =');
		const end = code.indexOf(';', start);
		const context = vm.createContext({ Params: { effect: { duration: P => P.Init.d * 2 }, Init: { d: 40 }, Inst: {} } });
		vm.runInContext(code.slice(start, end + 1), context);
		expect(context.Params.Inst.duration).toBe(80);
		context.Params = { effect: { duration: 140 }, Init: { duration: 5 }, Inst: {} };
		vm.runInContext(code.slice(start, end + 1), context);
		expect(context.Params.Inst.duration).toBe(140);
		context.Params = { effect: {}, Init: { duration: 5 }, Inst: {} };
		vm.runInContext(code.slice(start, end + 1), context);
		expect(context.Params.Inst.duration).toBe(5);
	});

	it('starts a bow attack arrow at its release and shows the hit when it lands', () => {
		const code = src('Engine/MapEngine/Entity.js');
		expect(code).toMatch(/const bow = bowAttackTiming\(m_attackMotion, m_motionSpeed\);/);
		expect(code).toMatch(/pkt\.attackMT = bow\.hitMs;/);
		expect(code).toMatch(/effectId: 'ef_arrow_projectile',[\s\S]{0,120}startTick: Renderer\.tick \+ bow\.releaseMs,/);
	});
});
