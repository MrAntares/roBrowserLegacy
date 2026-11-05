import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectTableSource } from '../helpers/effectTableSource.js';

// Stone Curse (MG_STONECURSE, skill 16), as the official client plays it: when the use
// packet reports success, effect 23 (StoneCurse.str) on the target and _stonecurse.wav
// at the target; nothing on a failed attempt. Effect 23 has no sound of its own.

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

const entry = (table, key) => {
	const start = table.indexOf(`\n\t${key}: [`);
	expect(start).toBeGreaterThan(-1);
	return table.slice(start, table.indexOf('\n\t],', start));
};

describe('Stone Curse effects', () => {
	it('plays 23 and the sound on success only', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_STONECURSE\] = \{ successEffectId: \[23, 'stonecurse_sound'\] \};/
		);
	});

	it('keeps the sound out of effect 23 and plays _stonecurse.wav', () => {
		const table = effectTableSource().replace(/\r\n/g, '\n');
		expect(entry(table, '23')).not.toMatch(/wav:/);
		expect(entry(table, 'stonecurse_sound')).toMatch(/wav: '_stonecurse'/);
	});
});
