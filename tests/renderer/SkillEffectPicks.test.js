import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import shuffledGrid from '../../src/Renderer/Effects/ShuffledGrid.js';
import spinSets, { SPIN_SLOT } from '../../src/Renderer/Effects/SpinSets.js';

// The SkillEffect fields that pick which effect a skill plays, and where:
// by skill level, by where the target is on screen, from each damage packet,
// over a grid or in spinning sets. EffectManager is read as text: it imports
// the renderer, which does not load without a canvas.
const source = readFileSync(join(process.cwd(), 'src/Renderer/EffectManager.js'), 'utf8')
	.replace(/\r\n/g, '\n')
	.replace(/^import .*;$/gm, '')
	.replace('export default EffectManager;', 'this.EffectManager = EffectManager;');

// Entities 1 (caster) and 2 (target); the target is `angle` degrees clockwise
// from straight right on screen (screenAngle is stubbed).
function load(skill, { angle = 0, sector = 0, side = 0, random } = {}) {
	const entities = {
		1: { position: [10, 10, 0] },
		2: { position: [12, 10, 0] }
	};
	const context = vm.createContext({
		console,
		Math: random ? Object.assign(Object.create(Math), { random }) : Math,
		SU: {},
		SkillUnit: {},
		SkillEffect: { 100: skill },
		Renderer: { tick: 1000 },
		EntityManager: { get: id => entities[id] || null },
		screenAngle: () => angle,
		screenSector: () => sector,
		screenSide: () => side,
		shuffledGrid,
		spinSets,
		SPIN_SLOT
	});
	vm.runInContext(source, context);
	const spammed = [];
	context.EffectManager.spam = params => spammed.push(params);
	return { EffectManager: context.EffectManager, spammed };
}

describe('effects picked by skill level', () => {
	it('plays the level - 1 entry on the caster or the target, the last one past the end', () => {
		const skill = { successEffectIdOnCasterByLevel: ['c1', 'c2'], successEffectIdOnTargetByLevel: ['t1', 't2', 't3'] };
		const { EffectManager, spammed } = load(skill);
		EffectManager.spamSkillSuccess(100, 2, 500, 1, 2);
		EffectManager.spamSkillSuccess(100, 2, 500, 1, 5);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.otherAID, p.skillLevel])).toEqual([
			['c2', 1, 2, 2],
			['t2', 2, 1, 2],
			['c2', 1, 2, 5],
			['t3', 2, 1, 5]
		]);
	});

	it('plays nothing without a level', () => {
		const { EffectManager, spammed } = load({ successEffectIdOnCasterByLevel: ['c1'] });
		EffectManager.spamSkillSuccess(100, 2, 500, 1);
		expect(spammed).toEqual([]);
	});

	it('plays a ground file by level from the ground packet only', () => {
		const { EffectManager, spammed } = load({ groundEffectIdByLevel: ['g1', 'g2'] });
		EffectManager.spamSkill(100, 1, [5, 6, 0], 500, 1, 1);
		EffectManager.spamSkill(100, 1, null, 500, 1, 1);
		expect(spammed.map(p => [p.effectId, p.position, p.skillLevel])).toEqual([['g1', [5, 6, 0], 1]]);
	});
});

describe('effects picked by where the target is on screen', () => {
	it('plays the file of the target sector on the caster', () => {
		const files = Array.from({ length: 12 }, (_, i) => 'dir' + i);
		const { EffectManager, spammed } = load({ successEffectIdOnCasterByScreenDirection: files }, { sector: 4 });
		EffectManager.spamSkillSuccess(100, 2, 500, 1);
		expect(spammed.map(p => [p.effectId, p.ownerAID])).toEqual([['dir4', 1]]);
	});

	it('plays the file of the target half where the target stands', () => {
		const bySide = { right: 'on_right', left: 'on_left' };
		for (const side of ['right', 'left']) {
			const { EffectManager, spammed } = load({ successEffectIdOnTargetByScreenSide: bySide }, { side });
			EffectManager.spamSkillSuccess(100, 2, 500, 1);
			expect(spammed.map(p => [p.effectId, p.ownerAID])).toEqual([['on_' + side, 2]]);
		}
	});

	it('turns an aimed effect on the caster toward the target', () => {
		const { EffectManager, spammed } = load({ successEffectIdOnCasterAimed: 'aim' }, { angle: 135 });
		EffectManager.spamSkillSuccess(100, 2, 500, 1);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.screenTurn])).toEqual([['aim', 1, 135]]);
	});

	it('throws an effect from the caster onto the target spot', () => {
		const { EffectManager, spammed } = load({ successEffectThrowAtTarget: 'orb' });
		EffectManager.spamSkillSuccess(100, 2, 500, 1);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.position])).toEqual([['orb', 1, [12, 10, 0]]]);
	});

	it('needs both entities', () => {
		const { EffectManager, spammed } = load({
			successEffectIdOnCasterAimed: 'aim',
			successEffectIdOnTargetByScreenSide: { right: 'on_right', left: 'on_left' },
			successEffectThrowAtTarget: 'orb'
		});
		EffectManager.spamSkillSuccess(100, 3, 500, 1);
		expect(spammed).toEqual([]);
	});
});

describe('effects spread around the target', () => {
	it('spreads a grid sized by level, one spot per row and column, a step apart', () => {
		const skill = {
			successEffectGridIds: ['floor', ['a', 'b']],
			successEffectGridSizeByLevel: [3, 5],
			successEffectGridStep: 32
		};
		const { EffectManager, spammed } = load(skill, { random: () => 0.99 });
		EffectManager.spamSkillSuccess(100, 2, 500, 1, 1);
		expect(spammed).toHaveLength(6);
		expect(spammed.filter(p => p.effectId === 'floor').map(p => p.startTick)).toEqual([500, 532, 564]);
		expect(spammed.filter(p => p.effectId !== 'floor').every(p => p.effectId === 'b')).toBe(true);
		const spots = spammed.filter(p => p.effectId === 'floor').map(p => [p.position[0] - 12, p.position[1] - 10]);
		expect(new Set(spots.map(s => s[0]))).toEqual(new Set([-1, 0, 1]));
		expect(new Set(spots.map(s => s[1]))).toEqual(new Set([-1, 0, 1]));
	});

	it('fans spinning sets at the target, each copy turned and slotted', () => {
		const { EffectManager, spammed } = load({ successEffectSpinSets: ['s0', 's1'] });
		EffectManager.spamSkillSuccess(100, 2, 500, 1);
		expect(spammed.length).toBeGreaterThanOrEqual(30);
		spammed.forEach(p => {
			expect(['s0', 's1']).toContain(p.effectId);
			expect(p.position).toEqual([12, 10, 0]);
			expect((p.startTick - 500) % SPIN_SLOT).toBe(0);
			expect(typeof p.screenTurn).toBe('number');
		});
	});
});

describe('effects played from each damage packet', () => {
	it('plays on the caster and the target, one random entry of a list', () => {
		const { EffectManager, spammed } = load({
			damageEffectIdOnCaster: 'swing',
			damageEffectIdOnTarget: [['hit_a', 'hit_b']]
		});
		EffectManager.spamSkillDamage(100, 2, 500, 1, () => 0.6);
		expect(spammed.map(p => [p.effectId, p.ownerAID, p.otherAID])).toEqual([
			['swing', 1, 2],
			['hit_b', 2, 1]
		]);
	});

	it('ignores skills without a row', () => {
		const { EffectManager, spammed } = load({});
		EffectManager.spamSkillDamage(999, 2, 500, 1);
		expect(spammed).toEqual([]);
	});
});
