import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// When a character deals skill damage, the official client queues one hit message
// per damage packet, whatever the hit count, so the skill's hit effects play once.
// Skills marked hitEffectOnce do the same; the others keep one per hit.

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

const hits = (EffectManager, skillId) => {
	for (let i = 0; i < 3; ++i) {
		EffectManager.spamSkillHit(skillId, 20, 1000 + 200 * i, 10, i);
	}
};

describe('hitEffectOnce', () => {
	it('plays the hit effects on the first hit of a packet only', () => {
		const { EffectManager, spammed } = loadEffectManager({ 1: { hitEffectId: [49, 1], hitEffectOnce: true } });
		hits(EffectManager, 1);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.startTick])).toEqual([
			[49, 20, 1000],
			[1, 20, 1000]
		]);
	});

	it('also limits hitEffectIdOnCaster', () => {
		const { EffectManager, spammed } = loadEffectManager({ 1: { hitEffectIdOnCaster: 7, hitEffectOnce: true } });
		hits(EffectManager, 1);
		expect(spammed.map(p => [p.effectId, p.ownerAID])).toEqual([[7, 10]]);
	});

	it('keeps one per hit for the other skills', () => {
		const { EffectManager, spammed } = loadEffectManager({ 1: { hitEffectId: 52 } });
		hits(EffectManager, 1);
		expect(spammed.map(p => p.startTick)).toEqual([1000, 1200, 1400]);
	});

	it('is told which hit it is by the damage packet handler', () => {
		expect(read('Engine/MapEngine/Entity.js')).toMatch(
			/EffectManager\.spamSkillHit\(\s*pkt\.SKID,\s*pkt\.targetID,\s*startTick,\s*pkt\.AID,\s*i\s*\);/
		);
	});
});
