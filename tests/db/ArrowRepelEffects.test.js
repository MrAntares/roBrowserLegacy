import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Arrow Repel (AC_CHARGEARROW, skill 148): the official client (kRO 2025-07-16, same as
// 2020-12-29) plays 16 (EF_BASH) on the caster per damage packet and no arrow (action 7, not
// the bow attack), and on each hit that lands only the standard hit flash (0) on the target;
// the skill is not in the client's hit map.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Arrow Repel effects', () => {
	it('plays 16 on the caster per damage packet, no arrow, and the hit flash on each hit', () => {
		expect(source).toMatch(
			/SkillEffect\[SK\.AC_CHARGEARROW\] = \{ hideCastAura: true, damageEffectIdOnCaster: 16, hitEffectId: \[0\] \};/
		);
	});

	it('is shared by the mercenary Arrow Repel', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MA_CHARGEARROW\] = SkillEffect\[SK\.AC_CHARGEARROW\];/);
	});
});
