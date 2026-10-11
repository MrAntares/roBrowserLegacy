// Service worker for `wtf robrowser prod --local-grf` (https://cyro.localhost:6988) and its static copy
// (https://robrowser.suuuper.app/cyro.live/): the page shell (api.html, scripts, workers, plugins)
// network first, the last good copy when the server is down.
// Assets (/grf/) and the cyro API (/userconfig, /emblem, /api) are not cached: left to the network.
importScripts('pwa/relay-sw.js');

const SHELL = 'shell-v1';
// A server stopped behind a forwarded port can leave the connection hanging instead of refused:
// give up on the network after NETWORK_TIMEOUT (until the response headers). After a failure the
// server counts as down for DOWN_FOR, so the next requests go to the cache at once.
const NETWORK_TIMEOUT = 3000;
const DOWN_FOR = 10000;
let downUntil = 0;

async function network(request) {
	if (Date.now() < downUntil) {
		throw new TypeError('server down');
	}
	try {
		return await fetch(request, { signal: AbortSignal.timeout(NETWORK_TIMEOUT) });
	} catch (err) {
		downUntil = Date.now() + DOWN_FOR;
		throw err;
	}
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function shell(request) {
	const cache = await caches.open(SHELL);
	try {
		const response = await network(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (err) {
		// api.html is one page whatever its query (?app=ONLINE, &relay-probe…).
		const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
		if (cached) {
			return cached;
		}
		throw err;
	}
}

self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	if (url.origin !== self.location.origin || e.request.method !== 'GET') {
		return;
	}
	if (/^\/(grf|userconfig|emblem|api)(\/|$)/.test(url.pathname)) {
		return;
	}
	e.respondWith(shell(e.request));
});
