// Holds api.html's loadApp() until the roBrowser relay extension holds a client folder and the service
// worker that reads it (pwa/sw.js) controls the page; otherwise says what is missing and the client is
// never loaded. The relay's content script sets <html data-ro-relay="ready|off"> and fires `ro-relay`:
// neither within RELAY_WAIT = no extension.
(() => {
	const RELAY_WAIT = 1500;
	const WORKER_WAIT = 10000;

	function relayState() {
		const state = document.documentElement.dataset.roRelay;
		if (state) {
			return Promise.resolve(state);
		}
		return new Promise((resolve) => {
			const timer = setTimeout(() => resolve('missing'), RELAY_WAIT);
			window.addEventListener(
				'ro-relay',
				(e) => {
					clearTimeout(timer);
					resolve(e.detail && e.detail.ready ? 'ready' : 'off');
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
		worker: 'The service worker does not control this page. Reload normally (a forced reload bypasses it); a private window has none.'
	};

	function block(reason) {
		const box = document.getElementById('ro-preloader');
		const text = Object.assign(document.createElement('p'), { textContent: MESSAGES[reason] });
		text.style.cssText = 'max-width:32em;padding:0 16px;color:#ddd;font:16px/1.5 system-ui,sans-serif;text-align:center';
		if (box) {
			box.replaceChildren(text);
		} else {
			document.body.replaceChildren(text);
		}
	}

	const checks = Promise.all([relayState(), controlled()]);

	function wrap() {
		const loadApp = window.loadApp;
		window.loadApp = function (...args) {
			checks.then(([relay, worker]) => {
				if (relay !== 'ready') {
					block(relay);
				} else if (!worker) {
					block('worker');
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
