import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Soul Strike (MG_SOULSTRIKE, skill 13): the official client (2025-07-16) plays the
// standard hit flash (0) on the target on every hit, and EF_HIT2 (1) with the first hit
// of each damage packet only.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Soul Strike hit', () => {
	it('plays 0 on every hit and 1 on the first hit of a packet', () => {
		expect(source).toMatch(
			/SkillEffect\[SK\.MG_SOULSTRIKE\] = \{ damageEffectIdOnCaster: 15, hitEffectId: 0, firstHitEffectId: 1 \};/
		);
	});
});
