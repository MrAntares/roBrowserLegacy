import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// Effect 441 (EF_BLUECASTING), the blue cast aura: the official client builds it
// like the yellow (12) and white (58) cast auras, with effect\ring_blue.tga and
// EF_BeginSpell.wav. Read as text: the table imports the renderer.
const table = readFileSync(join(process.cwd(), 'src/DB/Effects/EffectTable.js'), 'utf8').replace(/\r\n/g, '\n');

function entry(id) {
	const start = table.indexOf(`\n\t${id}: [`);
	expect(start, `${id} is defined`).toBeGreaterThan(-1);
	const end = table.indexOf('\n\t],', start);
	return vm.runInNewContext(`(${table.slice(start, end + 3).trim().replace(/^\d+:/, '')})`);
}

describe('EF_BLUECASTING (441)', () => {
	it('is the white cast aura with the blue ring', () => {
		const [blue] = entry(441);
		const [white] = entry(58);
		expect(blue).toEqual({ ...white, textureName: 'ring_blue' });
	});
});
