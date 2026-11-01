// roBrowser relay, page side: hands the service worker (registered by pwa-client.js) the client folder
// held by the roBrowser relay extension, or null when the relay is off or absent.
(() => {
	// The extension runs in the top page only, which hands the files: a same-origin frame (a camera tile)
	// would hand the worker null and take them from every page.
	try {
		if (!('serviceWorker' in navigator) || (window.parent !== window && window.parent.document)) {
			return;
		}
	} catch {
		// A cross-origin parent: this page is its own top
	}

	// The extension's content script answers { roRelay: 'want-files' } with { roRelay: 'files', files };
	// no extension = no answer.
	let pending = null;
	function relayFiles() {
		if (!pending) {
			pending = new Promise((resolve) => {
				const timer = setTimeout(() => resolve(null), 1000);
				window.addEventListener('message', function on(e) {
					if (e.source === window && e.data && e.data.roRelay === 'files') {
						window.removeEventListener('message', on);
						clearTimeout(timer);
						resolve(e.data.files || null);
					}
				});
				window.postMessage({ roRelay: 'want-files' }, location.origin);
			});
		}
		return pending;
	}

	async function send(worker) {
		const files = await relayFiles();
		worker.postMessage({ roRelay: 'files', files });
		if (files) {
			window.postMessage({ roRelay: 'used' }, location.origin);
		}
	}

	// A restarted worker lost the files and asks again.
	navigator.serviceWorker.onmessage = (e) => {
		if (e.data && e.data.roRelay === 'sw-want-files') {
			send(e.source);
		}
	};
	navigator.serviceWorker.ready.then((reg) => send(reg.active));
})();
