/**
 * Config of https://robrowser.suuuper.app/cyro.live/ (assembled by pages-sites.yml): cyro.live's
 * server block, the client folder from the roBrowser relay extension.
 *
 * GitHub Pages serves no /grf/, /userconfig, /emblem or /api: pwa/relay-sw.js answers them, from
 * the relay's folder and from https://cyro.live/api. They stay root-absolute; the service worker
 * sees every request of the pages it controls, whatever the path. gate.js holds the boot until both
 * the relay and that worker are there.
 */
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
	// Native entries must start with '/' or 'http'. Community = the v3 plugins of `wtf dev`, on
	// this machine only (http://localhost is a trustworthy origin from an https page).
	plugins: {
		ItemDb: '/cyro.live/plugins/item-db/item-db.esm.js',
		LocalPluginManager: {
			path: '/cyro.live/plugins/local-plugin-manager/local-plugin-manager.esm.js',
			pars: { registries: { Community: 'http://localhost:6980/index.json' } }
		},
		PluginManagerUI: '/cyro.live/plugins/plugin-manager-ui/plugin-manager-ui.esm.js'
	}
};

for (const src of ['pwa/pwa-client.js', 'pwa/relay-client.js', 'gate.js']) {
	document.head.appendChild(Object.assign(document.createElement('script'), { src, async: false }));
}
