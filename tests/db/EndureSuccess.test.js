import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Endure (SM_ENDURE, skill 8): the official client plays effect 11 on the caster from the
// skill-use packet only when its result byte is set (a failed use plays nothing).

const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

describe('Endure effects', () => {
	it('plays 11 on the caster on a successful use only', () => {
		expect(source).toMatch(/SkillEffect\[SK\.SM_ENDURE\] = \{ successEffectIdOnCaster: 11 \};/);
	});
});
