import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { effectTableSource } from '../helpers/effectTableSource.js';

const { PRIM_TICK_MS, createPrimState, advancePrim, buildPrimGeometry, primVertexCount } = await import(
	'Renderer/Effects/EffectPrimSim.js'
);
// The effect table imports most of the renderer, so read entry 17 from its source.
function effectEntry(id) {
	const source = effectTableSource();
	const start = source.indexOf(`\n\t${id}: [`);
	const end = source.indexOf('\n\t],', start) + 4; // the row's closing bracket
	const body = source.slice(start, end).trim().replace(/^\d+:/, '').replace(/,\s*$/, '');
	return vm.runInNewContext(`(${body})`);
}

const ring = {
	prim: 'ring',
	frames: 30,
	radiusSpeed: 1.75,
	radiusAccel: -(1.75 / 30) * 0.5,
	width: 12,
	alpha: 0,
	alphaSpeed: 254 / 15,
	fadeOutFrame: 15
};

describe('official effect primitives', () => {
	it('runs on a 60 Hz clock', () => {
		expect(PRIM_TICK_MS).toBeCloseTo(16.667, 3);
	});

	it('fades in over 15 ticks, then out to 0 on the last tick', () => {
		const state = createPrimState(ring);
		expect(state.alpha).toBe(0);

		advancePrim(state, 1);
		expect(state.alpha).toBeCloseTo(254 / 15, 5);

		advancePrim(state, 15);
		expect(state.alpha).toBeCloseTo(254, 5);

		advancePrim(state, 16);
		expect(state.alpha).toBeCloseTo(254 - 254 / 15, 5);

		advancePrim(state, 30);
		expect(state.alpha).toBeCloseTo(0, 5);
	});

	it('grows the ring to about 39 units and never steps past its lifetime', () => {
		const state = createPrimState(ring);
		advancePrim(state, 1000);
		expect(state.frame).toBe(30);
		expect(state.radius).toBeCloseTo(38.94, 1);
		expect(advancePrim(state, 1001)).toBe(false);
	});

	it('builds a flat band with U wrapping every four segments', () => {
		const state = createPrimState(ring);
		advancePrim(state, 30);

		const out = new Float32Array(primVertexCount(ring) * 5);
		buildPrimGeometry(out, ring, state, [100, 200, 3]);

		expect(primVertexCount(ring)).toBe(60);
		for (let i = 0; i < 60; ++i) {
			const x = out[i * 5] - 100.5;
			const z = out[i * 5 + 2] - 200.5;
			const radius = Math.hypot(x, z) * 5;
			const v = out[i * 5 + 4];

			expect(out[i * 5 + 1]).toBe(-3);
			expect(radius).toBeCloseTo(v ? state.radius - 12 : state.radius, 3);
		}

		// First vertex of segments 0, 3 and 4.
		expect(out[3]).toBe(0);
		expect(out[3 * 30 + 3]).toBe(0.75);
		expect(out[4 * 30 + 3]).toBe(0);
	});

	it('keeps the inner edge at the centre while the ring is smaller than its width', () => {
		const state = createPrimState(ring);
		advancePrim(state, 2);

		const out = new Float32Array(primVertexCount(ring) * 5);
		buildPrimGeometry(out, ring, state, [0, 0, 0]);
		expect(out[2 * 5]).toBeCloseTo(0.5, 5);
		expect(out[2 * 5 + 2]).toBeCloseTo(0.5, 5);
	});

	it('builds a sphere centred on the position', () => {
		const sphere = { prim: 'sphere', frames: 30, radiusSpeed: 1.15, radiusAccel: -(1.15 / 30) * 0.5, spin: 3 };
		const state = createPrimState(sphere);
		advancePrim(state, 30);
		expect(state.yaw).toBe(90);

		const count = primVertexCount(sphere);
		const out = new Float32Array(count * 5);
		buildPrimGeometry(out, sphere, state, [10, 10, 0]);

		expect(count).toBe(300);
		let top = 0;
		for (let i = 0; i < count; ++i) {
			const d = Math.hypot(out[i * 5] - 10.5, out[i * 5 + 1], out[i * 5 + 2] - 10.5) * 5;
			expect(d).toBeCloseTo(state.radius, 3);
			top = Math.min(top, out[i * 5 + 1]);
		}
		// GL y points down: the top of the sphere is at -radius.
		expect(top).toBeCloseTo(-state.radius / 5, 3);
	});

	it('draws Magnum Break as two rings and a sphere', () => {
		const parts = effectEntry(17);
		expect(parts.map(part => `${part.type}:${part.prim}`)).toEqual(['PRIM:ring', 'PRIM:sphere', 'PRIM:ring']);
		expect(parts.filter(part => part.wav)).toHaveLength(1);
		for (const part of parts) {
			expect(part.duration).toBeCloseTo(part.frames * PRIM_TICK_MS, 0);
		}
	});
});

describe('a primitive whose texture is missing', () => {
	function load() {
		const source = readFileSync(join(process.cwd(), 'src/Renderer/Effects/EffectPrim.js'), 'utf8')
			.replace(/^import .*;\r?$/gm, '')
			.replace('export default EffectPrim;', 'this.EffectPrim = EffectPrim;');
		const context = vm.createContext({
			Float32Array,
			Math,
			PRIM_TICK_MS,
			createPrimState,
			advancePrim,
			buildPrimGeometry,
			primVertexCount,
			Client: { loadFile: (file, onload, onerror) => onerror() },
			WebGL: { texture: () => {} }
		});
		vm.runInContext(source, context);
		return context.EffectPrim;
	}

	it('asks to be cleaned up instead of waiting forever', () => {
		const EffectPrim = load();
		const prim = new EffectPrim({ ...ring, texture: 'missing' }, { position: [0, 0, 0], startTick: 0 }, {});
		prim.init({ createBuffer: () => ({}) });
		expect(prim.ready).toBeFalsy();
		expect(prim.needCleanUp).toBe(true);
	});

	it('is expired by the effect manager once its time is up, ready or not', () => {
		const manager = readFileSync(join(process.cwd(), 'src/Renderer/EffectManager.js'), 'utf8').replace(/\r\n/g, '\n');
		expect(manager).toContain(
			'} else if (effect.endTick > 0 && tick > effect.endTick) {\n\t\t\t\t\t\t\t// Never became ready (its texture is missing): expire it anyway\n\t\t\t\t\t\t\teffect.needCleanUp = true;'
		);
	});
});
