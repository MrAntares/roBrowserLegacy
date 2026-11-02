import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Magnum Break (SM_MAGNUM, skill 7): which effects the official client plays, and when. The 16 on the caster
// per non-splash damage packet is the default caster motion effect (CasterMotionEffect.test.js).

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Magnum Break effect sequence', () => {
	it('plays 17 on the caster from the use packet, 49 and 17 on each target hit', () => {
		expect(source).toMatch(
			/SkillEffect\[SK\.SM_MAGNUM\] = \{ successEffectIdOnCaster: 17, hitEffectId: \[49, 17\] \};/
		);
	});

	it('has no screen shake', () => {
		const line = source.split('\n').find(l => l.startsWith('SkillEffect[SK.SM_MAGNUM]'));
		expect(line).not.toMatch(/quake/);
	});

	it('is shared by the mercenary Magnum Break', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MS_MAGNUM\] = SkillEffect\[SK\.SM_MAGNUM\];/);
	});
});
