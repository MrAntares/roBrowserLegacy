const fs = require('fs');
const path = require('path');

/**
 * Audit ESM conversion status in a directory
 */

function auditDirectory(dir, results = { esm: [], amd: [], unknown: [] }) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			auditDirectory(fullPath, results);
		} else if (file.endsWith('.js')) {
			const content = fs.readFileSync(fullPath, 'utf8');
			
			const hasImport = /^\s*import\s/m.test(content);
			const hasExport = /^\s*export\s/m.test(content);
			const hasDefine = /define\s*\(/m.test(content);
            const hasRequireArray = /require\s*\(\s*\[/m.test(content);

			if ((hasImport || hasExport) && !hasDefine) {
				results.esm.push(fullPath);
			} else if (hasDefine || hasRequireArray) {
				results.amd.push(fullPath);
			} else {
				results.unknown.push(fullPath);
			}
		}
	}

	return results;
}

const target = process.argv[2] || 'src';
if (!fs.existsSync(target)) {
	console.error(`Directory not found: ${target}`);
	process.exit(1);
}

console.log(`\nAuditing directory: ${target}...\n`);

const results = auditDirectory(target);

console.log('-------------------------------------------');
console.log(`ESM (Converted):  ${results.esm.length}`);
console.log(`AMD (Pending):    ${results.amd.length}`);
console.log(`Unknown/Other:    ${results.unknown.length}`);
console.log('-------------------------------------------');

if (results.amd.length > 0) {
	console.log('\nPending AMD files:');
	results.amd.forEach(f => console.log(`  [ ] ${f}`));
}

if (results.unknown.length > 0) {
    console.log('\nUnknown status (Check manually):');
    results.unknown.forEach(f => console.log(`  [?] ${f}`));
}

console.log('\nSummary: ' + (results.amd.length === 0 ? '✨ ALL CONVERTED!' : `${results.esm.length} / ${results.esm.length + results.amd.length} completed.`) + '\n');
