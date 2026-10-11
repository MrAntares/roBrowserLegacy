// roBrowser relay, service worker side, loaded by sw.js (importScripts). Its fetch listener runs
// before the shell's and takes the requests the shell leaves to the network:
//
// - /grf/: when the roBrowser relay extension is on, read from the client folder it holds (a GRF File
//   plus loose files such as BGM/), the way grf-serve.mjs does: loose files first, then the archive,
//   then the data/resnametable.txt alias.
// - /userconfig, /emblem, /api: straight to cyro.live while the relay is on (the extension adds the
//   CORS headers cyro does not send).
//
// The files arrive from the page (relay-client.js), which gets them from the extension. A restarted
// worker has lost them and asks the open pages again.

const CYRO_API = 'https://cyro.live/api';
const MIME = {
	mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
	txt: 'text/plain; charset=utf-8', xml: 'text/plain; charset=utf-8', lua: 'text/plain; charset=utf-8',
	bmp: 'image/bmp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
};
const OCTET = 'application/octet-stream';

// undefined: not known yet (ask the pages); null: no relay; else { grf, root, alias }.
let relay;
let asking = null;

self.addEventListener('message', (e) => {
	if (e.data && e.data.roRelay === 'files') {
		relay = e.data.files ? open(e.data.files) : null;
	}
});

function getRelay() {
	if (relay !== undefined) {
		return relay;
	}
	if (!asking) {
		asking = (async () => {
			for (const client of await self.clients.matchAll({ type: 'window' })) {
				client.postMessage({ roRelay: 'sw-want-files' });
			}
			// The pages answer with files or null; no page or no answer = no relay this time.
			const t0 = Date.now();
			while (relay === undefined && Date.now() - t0 < 3000) {
				await new Promise((r) => setTimeout(r, 50));
			}
			asking = null;
			return relay === undefined ? null : relay;
		})();
	}
	return asking;
}

const inflate = (blob) =>
	new Response(blob.stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();

// Header and file table of a GRF 0x200 / 0x300, the same layout as grf-reader.mjs. Names are latin1
// (raw EUC-KR bytes), keyed by a full toLowerCase() like the client's GameFile.
async function openGrf(file) {
	const h = new DataView(await file.slice(0, 46).arrayBuffer());
	const sig = new TextDecoder('latin1').decode(new Uint8Array(h.buffer, 0, 15)).split('\0')[0];
	const isV3 = sig === 'Event Horizon';
	if (!isV3 && sig !== 'Master of Magic') {
		throw new Error(`invalid GRF signature ${JSON.stringify(sig)}`);
	}
	const tableOffset = isV3 ? Number(h.getBigUint64(30, true)) : h.getUint32(30, true);
	const tableStart = 46 + tableOffset + (isV3 ? 4 : 0);
	const packSize = new DataView(await file.slice(tableStart, tableStart + 4).arrayBuffer()).getUint32(0, true);
	const table = new Uint8Array(await inflate(file.slice(tableStart + 8, tableStart + 8 + packSize)));
	const view = new DataView(table.buffer);
	const latin1 = new TextDecoder('latin1');
	const trail = isV3 ? 21 : 17;
	const index = {};
	for (let off = 0; off < table.length; ) {
		const nul = table.indexOf(0, off);
		if (nul === -1 || nul + 1 + trail > table.length) {
			break;
		}
		const p = nul + 1;
		const name = latin1.decode(table.subarray(off, nul));
		index[name.toLowerCase()] = {
			name,
			pack: view.getUint32(p, true),
			aligned: view.getUint32(p + 4, true),
			real: view.getUint32(p + 8, true),
			type: table[p + 12],
			offset: isV3 ? Number(view.getBigUint64(p + 13, true)) : view.getUint32(p + 13, true),
		};
		off = p + trail;
	}
	return { file, index };
}

// A plain archive file, or null: directories, empty records and DES-encrypted entries
// (type & 6, not handled here) are left to the network.
function grfEntry(grf, key) {
	const e = grf.index[key];
	return e && e.type & 1 && e.aligned > 0 && !(e.type & 6) ? e : null;
}

async function open(files) {
	const grf = files.grf ? await openGrf(files.grf) : null;
	// data/resnametable.txt: `old#new#` per line, relative to data\, chained.
	const alias = {};
	const table = files.root['data/resnametable.txt'] || (grf && grfEntry(grf, 'data\\resnametable.txt'));
	if (table) {
		const raw = table instanceof Blob ? await table.arrayBuffer() : await readEntry(grf, table);
		for (const line of new TextDecoder('latin1').decode(raw).split(/\r?\n/)) {
			const parts = line.split('#');
			if (!line.startsWith('//') && parts.length >= 2 && parts[0] && parts[1]) {
				alias[parts[0].toLowerCase()] = parts[1];
			}
		}
	}
	console.log(`[sw] relay: ${grf ? Object.keys(grf.index).length + ' archive entries' : 'no archive'}, ` +
		`${Object.keys(files.root).length} loose files, ${Object.keys(alias).length} aliases`);
	return { grf, root: files.root, alias };
}

function readEntry(grf, e) {
	const start = 46 + e.offset;
	return inflate(grf.file.slice(start, start + e.pack));
}

// Same order as grf-serve.mjs resolve(): loose files, archive, then the alias on a data\ miss.
function lookup(r, segs) {
	const loose = r.root[segs.join('/').toLowerCase()];
	if (loose) {
		return { loose };
	}
	const entry = r.grf && grfEntry(r.grf, segs.join('\\').toLowerCase());
	return entry ? { entry } : null;
}

function resolve(r, segs) {
	const direct = lookup(r, segs);
	if (direct || segs.length < 2 || segs[0].toLowerCase() !== 'data') {
		return direct;
	}
	let cur = segs.slice(1).join('\\');
	for (let hops = 0; hops < 8; hops++) {
		const next = r.alias[cur.toLowerCase()];
		if (!next || next.toLowerCase() === cur.toLowerCase()) {
			break;
		}
		cur = next;
	}
	return cur === segs.slice(1).join('\\') ? null : lookup(r, ['data', ...cur.split('\\')]);
}

// The client encodes each segment with encodeURIComponent over latin1 char codes.
function decodePath(pathname) {
	const segs = [];
	for (const raw of pathname.slice('/grf/'.length).split('/')) {
		const pct = decodeURIComponent(raw);
		let out = '';
		for (let i = 0; i < pct.length; i++) {
			out += String.fromCharCode(pct.charCodeAt(i) & 0xff);
		}
		segs.push(out);
	}
	return segs;
}

async function fromRelay(request, url) {
	const r = await getRelay();
	if (!r) {
		return null;
	}
	if (request.method === 'POST' && url.pathname === '/grf/') {
		// FileManager.search(): filter=<regex source>, names out as latin1, one per line.
		const m = /(?:^|&)filter=([^&]*)/.exec(await request.clone().text());
		if (!m || !r.grf) {
			return null;
		}
		const re = new RegExp(decodeURIComponent(m[1]), 'i');
		const names = [];
		for (const key in r.grf.index) {
			const name = r.grf.index[key].name;
			if (re.test(name) && names.push(name) >= 5000) {
				break;
			}
		}
		const bytes = Uint8Array.from(names.join('\n'), (c) => c.charCodeAt(0));
		return new Response(bytes, { headers: { 'Content-Type': 'text/plain; charset=ISO-8859-1' } });
	}
	if (request.method !== 'GET' || url.pathname.length <= '/grf/'.length) {
		return null;
	}
	let segs;
	try {
		segs = decodePath(url.pathname);
	} catch {
		return null;
	}
	const hit = resolve(r, segs);
	if (!hit) {
		return null;
	}
	if (hit.loose) {
		const ext = segs[segs.length - 1].split('.').pop().toLowerCase();
		return new Response(hit.loose, { headers: { 'Content-Type': MIME[ext] || OCTET } });
	}
	return new Response(await readEntry(r.grf, hit.entry), { headers: { 'Content-Type': OCTET } });
}

// With the relay on, cyro.live first: the extension adds the CORS headers cyro does not send. Without
// it a direct call is blocked, so the request is left to this server's proxy (null).
async function api(request, url) {
	if (!(await getRelay())) {
		return null;
	}
	const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.blob();
	const path = url.pathname.startsWith('/api/') ? url.pathname.slice(4) : url.pathname;
	return fetch(CYRO_API + path + url.search, {
		method: request.method,
		headers: body && body.type ? { 'Content-Type': body.type } : undefined,
		body,
		credentials: 'omit',
	});
}

self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	if (url.origin !== self.location.origin) {
		return;
	}
	const p = url.pathname;
	if (p === '/grf' || p.startsWith('/grf/')) {
		e.respondWith(fromRelay(e.request, url).then((res) => res || network(e.request)));
	} else if (/^\/(userconfig|emblem|api)(\/|$)/.test(p)) {
		e.respondWith(api(e.request, url).then((res) => res || fetch(e.request)));
	}
});
