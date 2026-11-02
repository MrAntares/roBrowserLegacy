import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Napalm Beat (MG_NAPALMBEAT, skill 11): the official client plays no effect of its own,
// and on each hit that lands plays the standard hit flash (0) and EF_HIT2 (1) on the target.

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Napalm Beat effects', () => {
	it('plays 0 and 1 on each target hit, and nothing else', () => {
		expect(source).toMatch(/SkillEffect\[SK\.MG_NAPALMBEAT\] = \{ hitEffectId: \[0, 1\] \};/);
	});
});
