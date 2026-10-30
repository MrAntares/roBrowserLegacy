import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// Help Angel (NV_HELPANGEL) as the official client plays it: effect\priest_sanctuary.wav,
// then effects 1367 (help_angel) and 1368 (help_angel_bottom, drawn flat on the floor).

const read = file => readFileSync(join(process.cwd(), 'src/DB', file), 'utf8').replace(/\r\n/g, '\n');
const effectTable = read('Effects/EffectTable.js');

function effectEntry(name) {
	const start = effectTable.indexOf(`\n\t${name}: [`);
	expect(start, `${name} is defined`).toBeGreaterThan(-1);
	const end = effectTable.indexOf('\n\t],', start);
	return vm.runInNewContext(`(${effectTable.slice(start, end + 3).trim().replace(/^\w+:/, '').replace(/,$/, '')})`);
}

describe('Help Angel', () => {
	it('is the skill effect of NV_HELPANGEL, on the source of a successful use packet', () => {
		expect(read('Skills/SkillEffect.js')).toMatch(/SkillEffect\[SK\.NV_HELPANGEL\] = \{ successEffectIdOnCaster: 'ef_nv_helpangel' \};/);
	});

	it('plays the sanctuary sound with the angel, and the bottom ring on the floor', () => {
		const [angel, bottom] = effectEntry('ef_nv_helpangel');
		expect(angel).toMatchObject({ type: 'STR', file: 'help_angel/help_angel/help_angel', wav: 'effect/priest_sanctuary' });
		expect(bottom).toMatchObject({
			type: 'STR',
			file: 'help_angel/help_angel_bottom/help_angel_bottom',
			renderBeforeEntities: true
		});
		expect(bottom.wav).toBeUndefined();
	});
});
