// applications/shared/demo-config.js
//
// Single source of truth for the roBrowserLegacy demo configuration.
//
// This file is consumed by every demo build target so the server list and
// demo defaults only have to be maintained in one place:
//   - applications/browser-examples/demo.html
//   - applications/electron/index.html
//   - .github/workflows/pages.yml (GitHub Pages deployment)
//
// It is a plain (non-module) script that exposes the config as
// `window.RODemoConfig`. Runtime/platform-specific values (target, type,
// application, version, webserverAddress, ...) are intentionally NOT set here;
// each target layers those on top.
//
// Real deployments should NOT edit this file. Provide a gitignored
// `Config.local.js` that sets `window.ROConfigLocal` instead (see
// Config.local.js.example); it is deep-merged over this config at runtime.
(function (root) {
	root.RODemoConfig = {
		development: true,
		remoteClient: 'https://grf.robrowser.com/',
		servers: [
			{
				display: 'Your Local Server[PRE]',
				desc: '2013 demo server',
				address: '127.0.0.1',
				port: 6900,
				version: 25,
				langtype: 12,
				packetver: 20130618,
				renewal: false,
				worldMapSettings: { episode: 12 },
				packetKeys: false,
				socketProxy: 'ws://localhost:5999',
				remoteClient: '/remote-client/',
				adminList: []
			},
			{
				display: 'Your Local Server[RE]',
				desc: '2025 demo server',
				address: '127.0.0.1',
				port: 6900,
				version: 55,
				langtype: 12,
				packetver: 20250618,
				renewal: true,
				worldMapSettings: { episode: 21 },
				packetKeys: false,
				socketProxy: 'ws://localhost:5999',
				remoteClient: '/remote-client/',
				adminList: []
			},
			{
				display: 'NiktoutRO Chaos',
				desc: 'NiktoutRO Chaos [100k/100k/10%]',
				address: 'chaos.niktoutro.com',
				port: 6905,
				version: 55,
				langtype: 1,
				packetver: 20151104,
				renewal: true,
				socketProxy: 'wss://classicweb.niktoutro.com:5999',
				remoteClient: 'https://classicweb.niktoutro.com/chaosclient/',
				registrationweb: 'https://niktoutro.com/?module=account&action=create',
				packetKeys: true,
				adminList: [2000002]
			}
			// ADD PUBLIC TEST SERVERS HERE. IF YOU DON'T ALLOW _M _F REGISTRATION BE SURE TO ADD THE registrationweb CONFIG
		],
		packetDump: false,
		skipServerList: true,
		skipIntro: false,
		aura: {},
		autoLogin: [],
		BGMFileExtension: ['mp3'],
		calculateHash: false,
		CameraMaxZoomOut: 5,
		charBlockSize: 0,
		clientHash: null,
		clientVersionMode: 'PacketVer',
		disableConsole: false,
		enableAchievements: true,
		enableBank: true,
		enableCashShop: true,
		enableCheckAttendance: true,
		enableDmgSuffix: true,
		enableHomunAutoFeed: true,
		enableMapName: true,
		enableRoulette: true,
		FirstPersonCamera: false,
		grfList: null,
		hashFiles: [],
		loadLua: true,
		onReady: null,
		plugins: {},
		registrationweb: '',
		saveFiles: false,
		ThirdPersonCamera: false,
		transitionDuration: 500,
		restoreChatFocus: false
	};
})(typeof window !== 'undefined' ? window : this);

// GitHub Pages public demo: trim heavy/local-only features on top of
// the shared demo config (window.RODemoConfig defined above).
window.ROConfigLocal = Object.assign({}, window.RODemoConfig, {
    enableAchievements: false,
    enableBank: false,
    enableCashShop: false,
    enableCheckAttendance: false,
    enableDmgSuffix: false,
    enableHomunAutoFeed: false,
    enableMapName: false,
    enableRoulette: false,
    loadLua: false,
    saveFiles: true
});
