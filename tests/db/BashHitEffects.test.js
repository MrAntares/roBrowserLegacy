import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Bash (SM_BASH, skill 5): the official client plays no effect of its own,
// and on each hit that lands plays the standard hit flash (0) and EF_HIT2 (1) on the target.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Bash effects', () => {
	it('plays 0 and 1 on each target hit, and nothing at cast', () => {
		expect(source).toMatch(/SkillEffect\[SK\.SM_BASH\] = \{ hitEffectId: \[0, 1\] \};/);
	});

	it('is shared by the mercenary Bash', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MS_BASH\] = SkillEffect\[SK\.SM_BASH\];/);
	});
});
