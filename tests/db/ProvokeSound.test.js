import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// Provoke (SM_PROVOKE, effect 67): the official client plays swordman_provoke.wav
// on tick 5 and again on tick 30 (60 ticks a second).

const TICK = 1000 / 60;
const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

// The effect table imports most of the renderer, so read entry 67 from its source.
function effectEntry(id) {
	const source = read('DB/Effects/EffectTable.js');
	const start = source.indexOf(`\n\t${id}: [`);
	const end = source.indexOf('\n\t],', start);
	const body = source.slice(start, end + 3).trim().replace(/^\d+:/, '').replace(/,$/, '');
	return vm.runInNewContext(`(${body})`);
}

describe('Provoke (effect 67)', () => {
	it('is still the success effect of SM_PROVOKE, on the target', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(/SkillEffect\[SK\.SM_PROVOKE\] = \{ successEffectId: 67 \};/);
	});

	it('draws the provoke STR once and plays the sound on tick 5 and tick 30', () => {
		const rows = effectEntry(67);
		expect(rows.filter(r => r.type === 'STR')).toEqual([expect.objectContaining({ file: 'provoke' })]);
		const sounds = rows.filter(r => r.wav === 'effect/swordman_provoke').map(r => r.delayWav);
		expect(sounds).toEqual([Math.round(5 * TICK), Math.round(30 * TICK)]);
	});
});
