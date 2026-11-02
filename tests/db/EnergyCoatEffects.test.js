import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Energy Coat (MG_ENERGYCOAT, skill 157): the official client plays 169 (EnergyCoat.str)
// on the caster from the use packet only when its result is set; a failed use shows
// nothing.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Energy Coat effects', () => {
	it('plays 169 on the caster only on a successful use', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MG_ENERGYCOAT\] = \{ successEffectIdOnCaster: 169 \};/);
	});
});
