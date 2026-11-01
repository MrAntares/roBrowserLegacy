// A same-origin frame (a camera tile) of a relay page: shared/gate.js takes the top page's relay state, and
// shared/pwa/relay-client.js leaves the files to the top page (both run in a vm).
//   node --test .github/pages-sites/relay-frame.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const HERE = new URL('.', import.meta.url);
const GATE = readFileSync(new URL('shared/gate.js', HERE), 'utf8');
const RELAY_CLIENT = readFileSync(new URL('shared/pwa/relay-client.js', HERE), 'utf8');

/** A window with a <html data-ro-relay> and its events; `parent` is itself when there is none */
function page(relay, parent) {
	const listeners = {};
	const win = {
		document: {
			readyState: 'complete',
			documentElement: { dataset: relay ? { roRelay: relay } : {} },
			getElementById: () => null,
			createElement: () => ({ style: {}, append() {} }),
			body: {
				replaceChildren(text) {
					win.blocked = text.textContent;
				}
			}
		},
		addEventListener(type, fn) {
			(listeners[type] ||= []).push(fn);
		},
		dispatch(type, detail) {
			for (const fn of listeners[type] || []) {
				fn({ detail });
			}
		},
		location: { origin: 'https://robrowser.suuuper.app' },
		posted: [],
		postMessage(data) {
			win.posted.push(data);
		}
	};
	win.parent = parent || win;
	return win;
}

/** Runs gate.js in `win`; resolves with the app it let load, or null once it blocked */
function gate(win) {
	return new Promise((resolve) => {
		const worker = { ready: Promise.resolve(), controller: {} };
		win.loadApp = (name) => resolve(name);
		win.roAccessKey = { slots: () => Promise.resolve(null) };
		runInNewContext(
			GATE,
			Object.assign(win, {
				window: win,
				navigator: { serviceWorker: worker },
				setTimeout: (fn) => setTimeout(fn, 10),
				clearTimeout
			})
		);
		win.loadApp('ONLINE');
		setTimeout(() => win.blocked && resolve(null), 50);
	});
}

test('a frame of a relay page loads the client', async () => {
	assert.equal(await gate(page(null, page('ready'))), 'ONLINE');
});

test("a frame waits for its top page's ro-relay event", async () => {
	const top = page(null);
	const loaded = gate(page(null, top));
	top.dispatch('ro-relay', { state: 'ready' });
	assert.equal(await loaded, 'ONLINE');
});

test('a frame of a page without the relay says the extension is missing', async () => {
	const tile = page(null, page(null));
	assert.equal(await gate(tile), null);
	assert.match(tile.blocked, /relay extension/);
});

test('only the top page hands the worker its files', async () => {
	const run = (win) => {
		const sent = [];
		const reg = { active: { postMessage: (m) => sent.push(m) } };
		runInNewContext(
			RELAY_CLIENT,
			Object.assign(win, {
				window: win,
				navigator: { serviceWorker: { ready: Promise.resolve(reg) } },
				setTimeout,
				clearTimeout
			})
		);
		return sent;
	};
	const top = page('ready');
	const fromTop = run(top);
	const fromTile = run(page(null, top));
	await new Promise((resolve) => setTimeout(resolve, 1100));
	assert.equal(fromTop.length, 1);
	assert.deepEqual(fromTile, []);
});
