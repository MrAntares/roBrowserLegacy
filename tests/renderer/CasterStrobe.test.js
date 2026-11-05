import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { effectTableSource } from '../helpers/effectTableSource.js';

const { PRIM_TICK_MS, createPrimState, advancePrim, buildPrimGeometry, primVertexCount } = await import(
	'Renderer/Effects/EffectPrimSim.js'
);
const { STROBE, casterStrobeShade, startCasterStrobe } = await import('Renderer/Effects/CasterStrobe.js');

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

// The effect table imports most of the renderer, so read entry 812 from its source.
function effectEntry(id) {
	const source = effectTableSource().replace(/\r\n/g, '\n');
	const start = source.indexOf(`\n\t${id}: [`);
	const end = source.indexOf('\n\t],', start) + 4; // the row's closing bracket
	const body = source.slice(start, end).trim().replace(/^\d+:/, '').replace(/,\s*$/, '');
	return vm.runInNewContext(`(${body})`, { startCasterStrobe: () => {} });
}

describe("effect 812, the black body flash (Kunai - Nightmare's cast start)", () => {
	const [flash, strobe] = effectEntry(812);

	it('draws a near-black fashasha square one cell up, then strobes the caster', () => {
		expect(flash).toMatchObject({
			type: 'PRIM',
			prim: 'quad',
			texture: 'fashasha',
			attachedEntity: false,
			frames: 57,
			color: [10, 10, 10],
			height: 5,
			fadeOutFrame: 30
		});
		expect(flash.duration).toBeCloseTo(57 * PRIM_TICK_MS, 5);
		expect(flash.wav).toBeUndefined();
		expect(strobe).toMatchObject({ type: 'FUNC', attachedEntity: true });
	});

	it('spreads fast for 10 ticks, then slowly', () => {
		const state = createPrimState(flash);
		advancePrim(state, 10);
		expect(state.size).toBeCloseTo(15 + (1.5 / 14) * 55, 5); // 20.89
		advancePrim(state, 11);
		expect(state.size - (15 + (1.5 / 14) * 55)).toBeCloseTo(0.1 + 0.1 / 30, 5);
		advancePrim(state, 1000);
		expect(state.frame).toBe(57);
		expect(state.size).toBeCloseTo(15 + (1.5 / 14) * 55 + 4.7 + (0.1 / 30) * 1128, 4); // 29.35
	});

	it('stays at 254 alpha until tick 30, then fades to 0 on its last tick', () => {
		const state = createPrimState(flash);
		advancePrim(state, 30);
		expect(state.alpha).toBe(254);
		advancePrim(state, 31);
		expect(state.alpha).toBeCloseTo(254 - 254 / 27, 4);
		advancePrim(state, 57);
		expect(state.alpha).toBeCloseTo(0, 4);
	});

	it('builds a level square centred on the position, height units up', () => {
		const state = createPrimState(flash);
		advancePrim(state, 10);
		const out = new Float32Array(primVertexCount(flash) * 5);
		buildPrimGeometry(out, flash, state, [100, 200, 3]);

		expect(primVertexCount(flash)).toBe(6);
		const corners = new Set();
		for (let i = 0; i < 6; ++i) {
			const x = (out[i * 5] - 100.5) * 5;
			const y = (out[i * 5 + 2] - 200.5) * 5;
			expect(Math.abs(x)).toBeCloseTo(state.size, 4);
			expect(Math.abs(y)).toBeCloseTo(state.size, 4);
			expect(out[i * 5 + 1]).toBeCloseTo(-3 - 1, 5);
			corners.add(`${Math.sign(x)},${Math.sign(y)}:${out[i * 5 + 3]},${out[i * 5 + 4]}`);
		}
		// Each corner keeps one texture corner.
		expect([...corners].sort()).toEqual(['-1,-1:1,1', '-1,1:0,1', '1,-1:1,0', '1,1:0,0']);
	});

	it('strobes black and white on ticks 6 to 60, then recovers by 8 a tick', () => {
		expect(STROBE).toEqual({ first: 6, last: 60, recoverStep: 8 });
		expect([0, 5].map(casterStrobeShade)).toEqual([1, 1]);
		expect([6, 7, 8, 59, 60].map(casterStrobeShade)).toEqual([0, 1, 0, 1, 0]);
		expect(casterStrobeShade(61)).toBeCloseTo(8 / 255, 6);
		expect(casterStrobeShade(91)).toBeCloseTo(248 / 255, 6);
		expect(casterStrobeShade(92)).toBe(1);
	});

	const fakeEntity = healthState => {
		const entity = {
			_healthState: healthState,
			_flashColor: [1, 1, 1, 1],
			recalculateBlendingColor() {},
			animations: { add: callback => (entity.callback = callback) }
		};
		return entity;
	};

	it("drives the caster's flash colour and stops once it is back to normal", () => {
		const entity = fakeEntity(0);
		startCasterStrobe(entity);
		const at = frame => entity.callback(frame * PRIM_TICK_MS + 1);

		expect(at(6)).toBe(false);
		expect(entity._flashColor).toEqual([0, 0, 0, 1]);
		expect(at(7)).toBe(false);
		expect(entity._flashColor).toEqual([1, 1, 1, 1]);
		expect(at(70)).toBe(false);
		expect(entity._flashColor[0]).toBeCloseTo(80 / 255, 6);
		expect(at(92)).toBe(true);
		expect(entity._flashColor).toEqual([1, 1, 1, 1]);
	});

	it('gives a poisoned caster its colour back right after the strobe', () => {
		const entity = fakeEntity(0x0001);
		startCasterStrobe(entity);
		expect(entity.callback(60 * PRIM_TICK_MS + 1)).toBe(false);
		expect(entity._flashColor[0]).toBe(0);
		expect(entity.callback(61 * PRIM_TICK_MS + 1)).toBe(true);
		expect(entity._flashColor).toEqual([1, 1, 1, 1]);
	});
});
