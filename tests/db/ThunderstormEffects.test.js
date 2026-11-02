import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Thunderstorm (MG_THUNDERSTORM, skill 21), as the official client plays it:
// effect 30 once at the cell from the ground packet, nothing from its skill unit,
// and the standard hit flash (0) on each hit the unit deals. No wind hit (52).

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

describe('Thunderstorm effects', () => {
	it('plays 30 from the ground packet only and the hit flash on each hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_THUNDERSTORM\] = \{ groundEffectIdByLevel: \[30\], hitEffectId: \[0\] \};/
		);
	});

	it('plays the ground list from the ground packet alone', () => {
		const manager = read('Renderer/EffectManager.js');
		expect(manager).toMatch(/groundByLevel && groundByLevel\.length && position && level > 0/);
	});
});
