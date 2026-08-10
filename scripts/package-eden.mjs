import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'dist', 'Web');
const output = path.join(root, 'dist', 'V6-Eden');
const requiredFiles = [
	'Config.js',
	'Online.js',
	'PathFindingWorker.js',
	'ThreadEventHandler.js',
	'api.html',
	'api.js',
	'index.html'
];

for (const file of requiredFiles) {
	if (!fs.existsSync(path.join(source, file))) throw new Error(`Missing build artifact: dist/Web/${file}`);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of requiredFiles) fs.copyFileSync(path.join(source, file), path.join(output, file));
for (const file of ['DEPLOYMENT.md', 'nginx-ro.conf', 'Config.local.example.js']) {
	fs.copyFileSync(path.join(root, 'deploy', 'V6-Eden', file), path.join(output, file));
}
fs.copyFileSync(path.join(root, 'scripts', 'verify-eden-deployment.mjs'), path.join(output, 'verify-deployment.mjs'));

const manifest = [
	...requiredFiles,
	'DEPLOYMENT.md',
	'nginx-ro.conf',
	'Config.local.example.js',
	'verify-deployment.mjs'
]
	.sort()
	.map(file => {
		const digest = crypto
			.createHash('sha256')
			.update(fs.readFileSync(path.join(output, file)))
			.digest('hex');
		return `${digest}  ${file}`;
	})
	.join('\n');
fs.writeFileSync(path.join(output, 'SHA256SUMS'), `${manifest}\n`);
console.log(`V6-Eden deployment bundle created: ${output}`);
