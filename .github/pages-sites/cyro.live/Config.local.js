/**
 * Config of https://robrowser.suuuper.app/<build>/cyro.live/ (assembled by pages-sites.yml, one copy per
 * build in BUILDS): cyro.live's server block, the client folder from the roBrowser relay extension.
 *
 * GitHub Pages serves no /grf/, /userconfig, /emblem or /api: pwa/relay-sw.js answers them, from
 * the relay's folder and from https://cyro.live/api. They stay root-absolute; the service worker
 * sees every request of the pages it controls, whatever the path. gate.js holds the boot until both
 * the relay and that worker are there.
 */
// This copy's folder, /<build>/cyro.live/ (or /cyro.live/): the plugins are under it.
const PAGES_SITE = new URL('.', location.href).href;
// The upstream and cyro builds have no native plugin manager.
const PAGES_PLUGIN_MANAGER = !/^\/(upstream|cyro)\//.test(new URL(PAGES_SITE).pathname);

window.ROConfigLocal = {
	version: 1775350421,
	development: false,
	enableConsole: true,
	disableConsole: false,
	remoteClient: '/grf/',
	registrationweb: 'https://cyro.live/?module=account&action=create',
	webserverAddress: 'https://cyro.live/api',
	socketProxy: 'wss://cyro.live/ws/',
	servers: [
		{
			display: 'CyRO',
			desc: 'Play in RO in Browser',
			address: '127.0.0.1',
			port: 6900,
			version: 55,
			langtype: 240,
			packetver: 20211103,
			renewal: false,
			packetKeys: false,
			adminList: [2000000]
		}
	],
	skipServerList: true,
	skipIntro: true,
	// Rocache refuses to init without it.
	fetchIntercept: true,
	// The Patch Notes window reads the patch log of its own build (none on cyro/).
	patchNotes: { url: `${PAGES_SITE}patchlog.json`, product: PAGES_PLUGIN_MANAGER ? 'robrowser' : 'robrowser upstream' },
	// Native entries must start with '/' or 'http'; full URLs, since a keyed build runs the client from
	// a blob: URL, which resolves no path. Community = the public v3 plugin registry.
	plugins: PAGES_PLUGIN_MANAGER
		? {
				LocalPluginManager: {
					path: `${PAGES_SITE}plugins/local-plugin-manager/local-plugin-manager.esm.js`,
					pars: { registries: { Community: 'https://cdn.jsdelivr.net/gh/meitogi/ro-plugins@main/index.json' } }
				},
				PluginManagerUI: `${PAGES_SITE}plugins/plugin-manager-ui/plugin-manager-ui.esm.js`
			}
		: {}
};

// The tab says which server it plays.
document.title = `${window.ROConfigLocal.servers[0].display} — ${document.title}`;

for (const src of ['pwa/pwa-client.js', 'pwa/relay-client.js', 'access-key.js', 'gate.js']) {
	document.head.appendChild(Object.assign(document.createElement('script'), { src, async: false }));
}
