import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Improve Concentration (AC_CONCENTRATION, skill 45): the official client (kRO 2025-07-16, same as
// 2020-12-29) plays 153 on the caster from the skill-use packet only when the result is set.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Improve Concentration effects', () => {
	it('plays 153 on the caster only on a successful use packet', () => {
		expect(source).toMatch(/SkillEffect\[SK\.AC_CONCENTRATION\] = \{ successEffectIdOnCaster: 153 \};/);
	});
});
