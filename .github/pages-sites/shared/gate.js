// Holds api.html's loadApp() until the roBrowser relay extension holds a client folder and the service
// worker that reads it (pwa/sw.js) controls the page; otherwise says what is missing and the client is
// never loaded. The relay's content script sets <html data-ro-relay="ready|nogrf|off"> and fires `ro-relay`:
// neither within RELAY_WAIT = no extension.
// On a keyed build (keyslots.json, access-key.js) it also needs the access key stored by index.html: it opens
// Online.js.enc with it and imports the client from a blob: URL.
(() => {
	const RELAY_WAIT = 1500;
	const WORKER_WAIT = 10000;

	// The extension runs in the top page only: a same-origin frame (a camera tile) takes its parent's state.
	function relayPage() {
		try {
			return window.parent !== window && window.parent.document ? window.parent : window;
		} catch {
			return window;
		}
	}

	function relayState() {
		const page = relayPage();
		const state = page.document.documentElement.dataset.roRelay;
		if (state) {
			return Promise.resolve(state);
		}
		return new Promise((resolve) => {
			const timer = setTimeout(() => resolve('missing'), RELAY_WAIT);
			page.addEventListener(
				'ro-relay',
				(e) => {
					const detail = e.detail || {};
					clearTimeout(timer);
					resolve(detail.state || (detail.ready ? 'ready' : 'off'));
				},
				{ once: true }
			);
		});
	}

	function controlled() {
		if (!('serviceWorker' in navigator)) {
			return Promise.resolve(false);
		}
		const sw = navigator.serviceWorker;
		const claimed = sw.ready.then(
			() =>
				sw.controller ||
				new Promise((resolve) => {
					sw.addEventListener('controllerchange', () => resolve(true), { once: true });
				})
		);
		const timeout = new Promise((resolve) => {
			setTimeout(() => resolve(false), WORKER_WAIT);
		});
		return Promise.race([claimed, timeout]).then(Boolean);
	}

	const MESSAGES = {
		missing:
			'This page runs only with the roBrowser relay extension (Firefox). Install it, choose your client folder in its popup, then reload.',
		off: 'The roBrowser relay is off or holds no client folder. Open its popup, choose the folder, switch it on, then reload.',
		nogrf: 'The roBrowser relay holds no client folder. Open its popup, choose your client folder, then reload.',
		worker: 'The service worker does not control this page. Reload normally (a forced reload bypasses it); a private window has none.',
		key: 'This client needs an access key.',
		badkey: 'Your access key does not open this client any more.'
	};

	function block(reason) {
		const box = document.getElementById('ro-preloader');
		const text = Object.assign(document.createElement('p'), { textContent: MESSAGES[reason] });
		text.style.cssText = 'max-width:32em;padding:0 16px;color:#ddd;font:16px/1.5 system-ui,sans-serif;text-align:center';
		if (reason === 'key' || reason === 'badkey') {
			const link = Object.assign(document.createElement('a'), { href: './', textContent: 'Enter a key' });
			link.style.color = 'inherit';
			text.append(' ', link);
		}
		if (box) {
			box.replaceChildren(text);
		} else {
			document.body.replaceChildren(text);
		}
	}

	// The client of a keyed build, as a blob: module ({ url }), or why it does not open ({ reason }). new URL('<Worker>.js', import.meta.url) cannot resolve
	// against a blob: URL: import.meta.url becomes the URL Online.js would have had.
	async function unlock(slots) {
		const hex = roAccessKey.stored();
		if (!hex) {
			return { reason: 'key' };
		}
		const key = await roAccessKey.open(hex, slots);
		if (!key) {
			roAccessKey.forget();
			return { reason: 'badkey' };
		}
		const res = await fetch('Online.js.enc');
		if (!res.ok) {
			throw new Error(`Online.js.enc: HTTP ${res.status}`);
		}
		const source = (await roAccessKey.decrypt(key, await res.arrayBuffer())).replaceAll(
			'import.meta.url',
			JSON.stringify(new URL('Online.js', location.href).href)
		);
		return { url: URL.createObjectURL(new Blob([source], { type: 'text/javascript' })) };
	}

	// api.html's loadApp() for the ONLINE app, importing the decrypted client.
	function loadLocked(url, extraConfig) {
		let config = deepMerge({}, window.ROConfigBase || {});
		if (window.ROConfigLocal) {
			config = deepMerge(config, window.ROConfigLocal);
		}
		if (extraConfig) {
			config = deepMerge(config, extraConfig);
		}
		window.ROConfig = config;
		import(url).then(
			() => document.getElementById('ro-preloader')?.remove(),
			(err) => console.error('Failed to load app: Online.js', err)
		);
	}

	const checks = Promise.all([relayState(), controlled(), roAccessKey.slots()]);

	function wrap() {
		const loadApp = window.loadApp;
		window.loadApp = function (...args) {
			checks.then(async ([relay, worker, slots]) => {
				if (relay !== 'ready') {
					block(relay);
				} else if (!worker) {
					block('worker');
				} else if (slots && args[0] === 'ONLINE') {
					const { url, reason } = await unlock(slots);
					if (url) {
						loadLocked(url, args[1]);
					} else {
						block(reason);
					}
				} else {
					loadApp.apply(this, args);
				}
			});
		};
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', wrap);
	} else {
		wrap();
	}
})();
