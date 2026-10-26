import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// Cast effects marked castLoop replay for the whole cast time and stop when it
// ends, like the official client's cast effects. No game data or GL needed.
const sourceRoot = process.env.EFFECT_SOURCE_ROOT || join(process.cwd(), 'src');
const source = name => readFileSync(join(sourceRoot, name), 'utf8').replace(/^import .*;\r?$/gm, '');
const load = (code, bindings) => {
	const context = vm.createContext({ console, Float32Array, Int32Array, Int16Array, Math, Number, ...bindings });
	vm.runInContext(code, context);
	return context;
};

// A 45-frame STR at 60 fps lasts 750 ms, like Sky Moon's cast effect.
const strFile = { fps: 60, maxKey: 45, layernum: 0 };
const SKILL = 5503;

function setup(row) {
	const str = load(
		source('Renderer/Effects/StrEffect.js').replace('export default StrEffect;', 'this.StrEffect = StrEffect;'),
		{ Client: { loadFile: () => strFile }, glMatrix: { mat4: { create: () => new Float32Array(16) } } }
	);
	const played = [];
	const context = load(
		source('Renderer/EffectManager.js').replace(
			'export default EffectManager;',
			'this.EffectManager = EffectManager; this.list = _list;'
		),
		{
			SU: {},
			SkillUnit: {},
			SkillEffect: { [SKILL]: { beginCastEffectId: 'cast_fx' } },
			EffectDB: { cast_fx: [row] },
			StrEffect: str.StrEffect,
			Preferences: { effect: true },
			Sound: { playPosition: filename => played.push(filename) },
			Events: { setTimeout: run => run() },
			Session: { Entity: { position: [0, 0, 0] } },
			GraphicsSettings: { performanceMode: false },
			Renderer: { tick: 1000 },
			EntityManager: { get: () => ({ GID: 7, position: [0, 0, 0], direction: 0 }) }
		}
	);
	return { context, played };
}

const loopRow = () => ({ type: 'STR', file: 'cast', wav: 'cast', castLoop: true });

describe('cast effects that loop for the cast time', () => {
	it('replays until the cast ends, then stops, with one sound', () => {
		const { context, played } = setup(loopRow());
		const { EffectManager, list } = context;
		EffectManager.spamSkillCast(SKILL, 7, null, 0, 1000);

		const first = list.StrEffect[0];
		assert.equal(first._Params.Inst.endTick, 2000, 'cut at the cast end');

		// The first loop finishes at 1750 and starts again.
		first.render({}, 1750);
		assert.ok(first.needCleanUp);
		context.Renderer.tick = 1750;
		vm.runInContext('repeatEffect(list.StrEffect[0])', context);
		assert.equal(list.StrEffect.length, 2, 'second loop started');
		const second = list.StrEffect[1];
		assert.equal(second._Params.Inst.startTick, 1750);
		assert.equal(played.length, 1, 'the sound plays once per cast');

		// The second loop is cut when the cast ends and does not start a third.
		second.render({}, 1900);
		vm.runInContext('stopEndedCastLoop(list.StrEffect[1], 1900)', context);
		assert.ok(!second.needCleanUp, 'still playing before the cast ends');
		vm.runInContext('stopEndedCastLoop(list.StrEffect[1], 2000)', context);
		assert.ok(second.needCleanUp, 'stopped at the cast end');
		context.Renderer.tick = 2000;
		vm.runInContext('repeatEffect(list.StrEffect[1])', context);
		assert.equal(list.StrEffect.length, 2, 'no loop after the cast');
	});

	it('plays once when there is no cast time', () => {
		const { context } = setup(loopRow());
		const { EffectManager, list } = context;
		EffectManager.spamSkillCast(SKILL, 7, null, 0, 0);
		const fx = list.StrEffect[0];
		assert.equal(fx._Params.Inst.endTick, -1);
		fx.render({}, 1750);
		context.Renderer.tick = 1750;
		vm.runInContext('repeatEffect(list.StrEffect[0])', context);
		assert.equal(list.StrEffect.length, 1);
	});

	it('leaves rows without castLoop as they were', () => {
		const { context } = setup({ type: 'STR', file: 'cast' });
		const { EffectManager, list } = context;
		EffectManager.spamSkillCast(SKILL, 7, null, 0, 1000);
		assert.equal(list.StrEffect[0]._Params.Inst.endTick, -1);
		assert.equal(list.StrEffect[0]._Params.Inst.repeatEnd, 0);
	});

	it('removes the loop when the cast is cancelled', () => {
		const { context } = setup(loopRow());
		const { EffectManager, list } = context;
		EffectManager.spamSkillCast(SKILL, 7, null, 0, 1000);
		assert.equal(list.StrEffect.length, 1);
		EffectManager.removeCastLoops(7);
		assert.equal(list.StrEffect, undefined);
	});
});
