import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Lightning Bolt (MG_LIGHTNINGBOLT, skill 20), as the official client plays it:
// effect 29 (Lightning.str, nothing else) on the target as the damage packet arrives,
// then effect 52 (wind hit) on every hit as it lands (2025-07-16 client).

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

describe('Lightning Bolt effects', () => {
	it('plays 29 at packet arrival and 52 on every hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_LIGHTNINGBOLT\] = \{ damageEffectIdOnTarget: 29, hitEffectId: 52 \};/
		);
	});

	it('draws effect 29 as Lightning.str alone', () => {
		const table = read('DB/Effects/EffectTable.js');
		const start = table.indexOf('\n\t29: [');
		const entry = table.slice(start, table.indexOf('\n\t],', start));
		expect(entry).toMatch(/file: 'lightning'/);
		expect(entry).not.toMatch(/windhit/);
		expect(entry.match(/type: /g)).toHaveLength(1);
	});
});
