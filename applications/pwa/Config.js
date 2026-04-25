/**
 * ROBrowser Configuration - Default Settings
 *
 * This file contains *overridden* sample configuration values.
 * To override settings without modifying this file, create Config.local.js
 * with your custom values in window.ROConfigLocal.
 *
 * Example Config.local.js:
 *   window.ROConfigLocal = {
 *       servers: [{ display: 'My Server', address: '192.168.1.1', ... }],
 *       skipIntro: true
 *   };
 *
 * For a list of all possible configuration values and their defaults,
 * see src/Api/ApiConfig.js.
 */
window.ROConfigBase = {
	type: 'FRAME',
	application: 'ONLINE',
	development: true,
	remoteClient: 'https://grf.robrowser.com/',
	servers: [
		{
			display: 'roBrowser Demo Server',
			desc: 'demo server',
			address: '127.0.0.1',
			version: 25,
			langtype: 12,
			packetver: 20130618,
			worldMapSettings: { episode: 12 },
			socketProxy: 'wss://connect.robrowser.com',
			adminList: [2000000]
		}
		// ADD PUBLIC TEST SERVERS HERE WITH _M _F REGISTRATION
	]
};
