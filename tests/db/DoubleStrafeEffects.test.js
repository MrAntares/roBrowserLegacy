import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Double Strafe (AC_DOUBLE, skill 46): the official client (kRO 2025-07-16, same as 2020-12-29)
// plays 16 (EF_BASH) on the caster and one bow arrow per damage packet; every hit that lands
// plays the standard hit flash (0), the first hit of each packet also EF_HIT2 (1).

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Double Strafe effects', () => {
	it('plays 16 on the caster and one arrow per damage packet, 0 per hit, 1 on the first', () => {
		expect(source).toMatch(
			/SkillEffect\[SK\.AC_DOUBLE\] = \{\r?\n\tdamageEffectIdOnCaster: 16,\r?\n\tdamageEffectIdOnTarget: 'ef_arrow_projectile',\r?\n\thitEffectId: 0,\r?\n\tfirstHitEffectId: 1\r?\n\}; \/\/Double Strafe/
		);
	});

	it('is shared by the mercenary Double Strafe', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MA_DOUBLE\] = SkillEffect\[SK\.AC_DOUBLE\];/);
	});
});
