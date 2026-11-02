/**
 * The effect table's source text, for tests that read it.
 *
 * DB/Effects/EffectTable.js joins the parts in DB/Effects/Table/ (Jobs/ for the
 * rows of one class, Common/ for the rest). This returns the main file followed
 * by every part, in the order the main file spreads them, so a test
 * can match a row without knowing which part holds it.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src/DB/Effects');

export function effectTableSource(encoding = 'utf8') {
	const main = readFileSync(join(DIR, 'EffectTable.js'), encoding);
	// Each part's last row gets back the comma it had in the one-file table.
	const parts = [...main.matchAll(/^import \w+ from 'DB\/Effects\/(Table\/[\w/-]+\.js)';/gm)].map(m =>
		readFileSync(join(DIR, m[1]), encoding).replace(/([^\s,])([ \t]*(?:\/\/[^\r\n]*)?)(\r?\n\};\s*)$/, '$1,$2$3')
	);
	return [main, ...parts].join('\r\n');
}
