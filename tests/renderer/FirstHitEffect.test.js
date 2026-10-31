import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// firstHitEffectId plays on the first hit of a damage packet only: the official client
// sends a multi-hit packet's hit-map effect with its first hit message, while the hit
// flash comes with every hit. Double Strafe: 0 on each arrow hit, 1 on the first.

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

function loadEffectManager(skillTable) {
	const source = read('Renderer/EffectManager.js')
		.replace(/^import .*;$/gm, '')
		.replace('export default EffectManager;', 'this.EffectManager = EffectManager;');
	const context = vm.createContext({
		console,
		Math,
		Number,
		Float32Array,
		SU: {},
		SkillUnit: {},
		SkillEffect: skillTable,
		Renderer: { tick: 1000 },
		EntityManager: { get: () => null }
	});
	vm.runInContext(source, context);
	const spammed = [];
	context.EffectManager.spam = params => spammed.push(params);
	return { EffectManager: context.EffectManager, spammed };
}

describe('firstHitEffectId', () => {
	it('plays the hit flash on every hit and the first-hit effect once', () => {
		const { EffectManager, spammed } = loadEffectManager({ 1: { hitEffectId: 0, firstHitEffectId: 1 } });
		[0, 1, 2].forEach(i => EffectManager.spamSkillHit(1, 20, 1000 + 200 * i, 10, i));
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.startTick])).toEqual([
			[0, 20, 1000],
			[1, 20, 1000],
			[0, 20, 1200],
			[0, 20, 1400]
		]);
	});

	it("runs Double Strafe's real row: the hit flash on each hit, EF_HIT2 on the first", () => {
		const source = read('DB/Skills/SkillEffect.js');
		const literal = source.match(/SkillEffect\[SK\.AC_DOUBLE\] = (\{[\s\S]*?\});/)[1];
		const row = vm.runInNewContext(`(${literal})`);
		const { EffectManager, spammed } = loadEffectManager({ 46: row });
		[0, 1].forEach(i => EffectManager.spamSkillHit(46, 20, 1000 + 200 * i, 10, i));
		expect(spammed.map(p => [p.effectId, p.startTick])).toEqual([
			[0, 1000],
			[1, 1000],
			[0, 1200]
		]);
	});
});
