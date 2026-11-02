import { describe, expect, it } from 'vitest';

const { default: SkillId } = await import('DB/Skills/SkillConst.js');
const { CAST_AREA, castSize, spinAngle, targetAlpha } = await import('Renderer/Effects/MagicTargetSim.js');

describe('ground cast circle (magic_target.tga)', () => {
	it('knows every skill the client lists', () => {
		expect(Object.keys(CAST_AREA)).toHaveLength(79);
	});

	it('is area + 2 cells across, by skill only', () => {
		expect(castSize(SkillId.MG_NAPALMBEAT)).toBe(5);
		expect(castSize(SkillId.PR_SANCTUARY)).toBe(7);
		expect(castSize(SkillId.PR_MAGNUS)).toBe(9);
		expect(castSize(SkillId.WZ_STORMGUST)).toBe(11);
		expect(castSize(SkillId.WZ_VERMILION)).toBe(13);
		expect(castSize(SkillId.WL_COMET)).toBe(20);
	});

	it('is 2 x 2 for a skill the client does not list', () => {
		expect(castSize(SkillId.MG_SAFETYWALL)).toBe(2);
		expect(castSize(999999)).toBe(2);
	});

	it('draws nothing for area -2', () => {
		expect(castSize(SkillId.SO_PSYCHIC_WAVE)).toBe(0);
		expect(castSize(SkillId.SO_DIAMONDDUST)).toBe(0);
	});

	it('turns 0.5 / N radians a tick', () => {
		expect(spinAngle(60, 5)).toBeCloseTo(6);
		expect(spinAngle(60, 11)).toBeCloseTo(30 / 11);
	});

	it('pulses its alpha between 88 and 168 with the spin', () => {
		expect(targetAlpha(0)).toBe(128);
		expect(targetAlpha(Math.PI / 2)).toBe(168);
		expect(targetAlpha(-Math.PI / 2)).toBe(88);
		expect(targetAlpha(1)).toBe(128 + Math.trunc(40 * Math.sin(1)));
	});
});
