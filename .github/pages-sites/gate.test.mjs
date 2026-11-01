// shared/gate.js (run in a vm) on a keyed build: the client it decrypts belongs to the key slots it read.
//   node --test .github/pages-sites/gate.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

async function play(decrypt) {
	const fetches = [];
	const shown = [];
	const window = {
		loadApp() {},
		roAccessKey: {
			slots: async () => [{}],
			stored: () => 'k',
			open: async () => ({}),
			forget() {},
			decrypt
		}
	};
	const element = () => ({ style: {}, append() {} });
	const document = {
		readyState: 'complete',
		documentElement: { dataset: { roRelay: 'ready' } },
		createElement: element,
		getElementById: () => ({ replaceChildren: el => shown.push(el.textContent), remove() {} }),
		body: { replaceChildren() {} }
	};
	// A top page: gate.js reads the relay state on window.parent's document
	window.document = document;
	window.parent = window;
	runInNewContext(readFileSync(new URL('shared/gate.js', import.meta.url), 'utf8'), {
		window,
		roAccessKey: window.roAccessKey,
		document,
		navigator: { serviceWorker: { ready: Promise.resolve(), controller: {} } },
		fetch: async (url, init) => {
			fetches.push([url, init && init.cache]);
			return { ok: true, arrayBuffer: async () => new ArrayBuffer(0) };
		},
		location: { href: 'https://site.test/cyro.live/api.html' },
		// api.html's own globals
		deepMerge: (into, from) => Object.assign(into, from),
		URL,
		Blob,
		setTimeout,
		clearTimeout,
		// the blob: import of the client has no loader in a vm
		console: { error() {} }
	});
	window.loadApp('ONLINE');
	await flush();
	await flush();
	return { fetches, shown };
}

test('Online.js.enc is read past the HTTP cache, like keyslots.json', async () => {
	const { fetches } = await play(async () => '');
	assert.deepEqual(fetches, [['Online.js.enc', 'no-cache']]);
});

test('a client the slots do not open says to reload instead of failing silently', async () => {
	const { shown } = await play(async () => {
		throw new Error('The operation failed for an operation-specific reason');
	});
	assert.deepEqual(shown, ['The client was updated while it loaded. Reload the page.']);
});
