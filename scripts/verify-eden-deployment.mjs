const baseUrl = String(process.argv[2] || '').replace(/\/+$/, '');
if (!baseUrl) throw new Error('Usage: node verify-deployment.mjs https://host.example/ro');

const failures = [];
const request = async pathname => {
	const response = await fetch(`${baseUrl}/${pathname}`, { redirect: 'manual' });
	return { response, text: await response.text() };
};

for (const file of ['index.html', 'api.html', 'api.js', 'Online.js']) {
	const { response, text } = await request(file);
	if (!response.ok) failures.push(`${file}: HTTP ${response.status}`);
	if (file.endsWith('.js') && !/javascript|ecmascript/i.test(response.headers.get('content-type') || ''))
		failures.push(`${file}: invalid Content-Type ${response.headers.get('content-type') || '(missing)'}`);
	if (/undefined\.js/i.test(text)) failures.push(`${file}: contains undefined.js`);
	if (/event\.data\.application\s*\+\s*['"]\.js/i.test(text))
		failures.push(`${file}: dynamically concatenates an unvalidated application script name`);
}

const missing = await request(`missing-${Date.now()}.js`);
if (missing.response.status !== 404) failures.push(`missing .js: expected 404, received ${missing.response.status}`);

if (failures.length) {
	console.error(failures.map(message => `FAIL ${message}`).join('\n'));
	process.exitCode = 1;
} else console.log(`PASS ${baseUrl}: entry files, MIME types, fallback and missing-resource behavior are valid.`);
