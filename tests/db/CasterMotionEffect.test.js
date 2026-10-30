import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { getMotionEffect, motionEffectForPacket } from 'DB/Skills/SkillMotionEffect.js';

// The caster's motion effect, as the official client (kRO 2025-07-16) plays it: one effect on the
// caster as each skill damage packet arrives, 16 (EF_BASH) unless its table says otherwise; not for
// splash packets that hit, the bolts, or level -2.

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
		motionEffectForPacket,
		Renderer: { tick: 1000 },
		EntityManager: { get: () => null }
	});
	vm.runInContext(source, context);
	const spammed = [];
	context.EffectManager.spam = params => spammed.push(params);
	return { EffectManager: context.EffectManager, spammed };
}

describe('caster motion effect table', () => {
	it('is 16 by default (Bash, Magnum Break, Double Strafe, Arrow Repel, Envenom, Mammonite)', () => {
		[5, 7, 46, 148, 52, 42, 8201, 8202].forEach(id => expect(getMotionEffect(id)).toBe(16));
	});

	it('follows the table for the skills it lists', () => {
		expect(getMotionEffect(24)).toBe(12); // Ruwach: EF_BEGINSPELL
		expect(getMotionEffect(45)).toBe(43); // Improve Concentration
		expect(getMotionEffect(57)).toBe(144); // Brandish Spear
		expect(getMotionEffect(47)).toBe(null); // Arrow Shower
		expect(getMotionEffect(263)).toBe(null); // Triple Attack
		expect(getMotionEffect(5401)).toBe(null); // 4th jobs
	});

	it('leaves out skills whose value comes from data it does not read', () => {
		expect(getMotionEffect(3004)).toBe(null); // KO_JYUMONJIKIRI (skilleffectinfo)
		expect(getMotionEffect(1172)).toBe(null); // registered skill object
	});
});

describe('caster motion effect per damage packet', () => {
	it('plays for skill damage types with a known target', () => {
		[4, 6, 8, 9, 13].forEach(type => expect(motionEffectForPacket(5, type, 10, true)).toBe(16));
	});

	it('does not play for normal, critical or lucky packets', () => {
		[0, 7, 10, 11, 12].forEach(type => expect(motionEffectForPacket(5, type, 10, true)).toBe(null));
	});

	it('does not play for a splash packet that hit, unless the skill treats splash as normal', () => {
		expect(motionEffectForPacket(7, 5, 10, true)).toBe(null);
		expect(motionEffectForPacket(7, 14, 10, true)).toBe(null);
		expect(motionEffectForPacket(7, 5, 10, false)).toBe(16);
		expect(motionEffectForPacket(273, 5, 10, true)).toBe(null); // treated as normal, but its table value is none
		expect(motionEffectForPacket(2284, 5, 10, true)).toBe(null);
	});

	it('does not play for the bolts, or when the level is -2', () => {
		[11, 14, 17, 19, 20, 21, 77, 86].forEach(id => expect(motionEffectForPacket(id, 6, 10, true)).toBe(null));
		expect(motionEffectForPacket(5, 6, -2, true)).toBe(null);
		expect(motionEffectForPacket(5, 6, -1, true)).toBe(16);
	});
});

describe('EffectManager.spamSkillMotion', () => {
	it('spams 16 on the caster for a Bash damage packet', () => {
		const { EffectManager, spammed } = loadEffectManager({ 5: { hitEffectId: [0, 1] } });
		EffectManager.spamSkillMotion(5, 10, 20, 1500, 6, 10, true);
		expect(spammed).toEqual([{ effectId: 16, ownerAID: 10, startTick: 1500, otherAID: 20 }]);
	});

	it('plays nothing for a Magnum Break splash packet that hit, 16 for a non-splash one', () => {
		const { EffectManager, spammed } = loadEffectManager({ 7: {} });
		EffectManager.spamSkillMotion(7, 10, 20, 1500, 5, 10, true);
		expect(spammed).toEqual([]);
		EffectManager.spamSkillMotion(7, 10, 20, 1500, 6, 10, true);
		expect(spammed.map(e => e.effectId)).toEqual([16]);
	});

	it('does not play it twice when the skill already lists it in damageEffectIdOnCaster', () => {
		const { EffectManager, spammed } = loadEffectManager({ 46: { damageEffectIdOnCaster: 16 } });
		EffectManager.spamSkillMotion(46, 10, 20, 1500, 8, 10, true);
		expect(spammed).toEqual([]);
	});

	it('is called for every skill damage packet', () => {
		expect(read('Engine/MapEngine/Entity.js')).toMatch(
			/EffectManager\.spamSkillMotion\(pkt\.SKID, pkt\.AID, pkt\.targetID, Renderer\.tick, pkt\.action, pkt\.level, !!dstEntity\);/
		);
	});
});
