/**
 * ApiConfig.js
 *
 * Robrowser starting config definitions.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
import ApiEnums from 'Api/ApiEnums.js';
class ApiConfig {
	static DEFAULT_LUA_PATH = 'data/luafiles514/lua files/';

	/**
	 * @type {Object} ROBrowser configuration object
	 */
	static config = {
		/**
		 * @type {number} screen width
		 */
		width: 0,

		/**
		 * @type {number} screen height
		 */
		height: 0,

		/**
		 * @type {mixed} grf listing
		 *
		 * a) {Array} of GRFs:
		 *    [ 'custom.grf', 'palette.grf', 'data.grf' ]
		 *
		 * b) {string} DATA.INI filename to load
		 *    'DATA.INI'
		 *
		 * c) {RegExp} to filter grf files:
		 *     /\.grf$/i
		 */
		grfList: null,

		/**
		 * @type {servers} server listing
		 *
		 * a) {string} clientinfo file to load
		 *    'data/clientinfo.xml'
		 *
		 * b) {Array} server list to display:
		 */
		servers: 'data/clientinfo.xml',

		/**
		 * @type {number} server port
		 */
		port: 6900,

		/**
		 * @type {boolean} enable renewal client mode
		 */
		renewal: false,

		/**
		 * @type {number} server language type
		 */
		langtype: 1,

		/**
		 * @type {string} Host where to download files
		 */
		remoteClient: 'https://grf.robrowser.com/',

		/**
		 * @type {number|string} packet version
		 *
		 * Supported value:
		 *    a) YYYYMMDD     (number: date you want)
		 *    c) 'executable' (detect packetver from executable compilation date)
		 */
		packetver: 'auto',

		/**
		 * @type {number} character info block size
		 * If not set, it will try to guess the type based on the packetver and the block total length
		 */
		charBlockSize: 0,

		/**
		 * @type {string} client hash to send to server
		 */
		clientHash: null,

		/**
		 * @type {string} calculate client hash
		 */
		calculateHash: false,

		/**
		 * @type {string} files to hash for hash calculation
		 */
		hashFiles: [],

		/**
		 * @type {array} list of IDs to consider admin users.
		 */
		adminList: [],

		/**
		 * @type {constant} application name (see: ROBrowser.APP.* )
		 *
		 * Known applications:
		 *   a) ApiEnums.APP.ONLINE    - RoBrowser online mode
		 *   b) ApiEnums.APP.GRFVIEWER - parse and visualize GRF contents
		 *   c) ApiEnums.APP.MAPVIEWER - parse and visualize maps
		 */
		application: ApiEnums.APP.ONLINE,

		/**
		 * @type {constant} container type (see: TYPE.POPUP)
		 */
		type: ApiEnums.TYPE.POPUP,

		/**
		 * @type {string} element ID
		 * If using container type 'frame', place the content in the HTMLElement specify
		 */
		target: null,

		/**
		 * @type {boolean} is in development mode ?
		 */
		development: false,

		/**
		 * @type {boolean} load lua files ?
		 */
		loadLua: false,

		/**
		 * @type {function} callback to execute once roBrowser is ready
		 */
		onReady: null,

		/**
		 * @type {boolean} use API once ready ?
		 */
		api: false,

		/**
		 * @type {string} proxy server ex: 'ws://pserver.com:5200/'
		 */
		socketProxy: null,

		/**
		 * @type {string} web-server api: 'http://<yourserverip>:<port>/' (used only to electron build)
		 */
		webserverAddress: null,

		/**
		 * @type {boolean}dump packet as hex in console ?
		 */
		packetDump: false,

		/**
		 * @type {integer|boolean|array} packetKeys
		 * see: http://hercules.ws/board/topic/1105-hercules-wpe-free-june-14th-patch/
		 *
		 * Supported value:
		 * - integer : client date,
		 *         ex: packetKeys: 20131223,
		 * - boolean : supported ? If it's the case, will use the executable compiled date to get the keys
		 *         ex: packetKeys: true,
		 * - array: the keys you want to use:
		 *         ex: packetKeys: [0xFF2615DE, 0x96AAE533, 0x1166CC33],
		 */
		packetKeys: false,

		/**
		 * @type {boolean} should we save files in chrome filesystem ?
		 *
		 * If set to true, then we try to save the files loaded from server/grfs on a filesystem to load
		 * them faster the next time.
		 *
		 * Only working on Chrome, status: deprecated.
		 */
		saveFiles: true,

		/**
		 * @type {boolean} skip server list if only one server define ?
		 *
		 * If set to true and the server list (clientinfo, char-server list) just have one
		 * element defined, the window will be skipped and you will auto-connect to the server.
		 *
		 * Set to false, will display the server list even if there is just one server set.
		 */
		skipServerList: true,

		/**
		 * @type {boolean} do we skip the intro ?
		 * Note: if you skip it, the user will not be able to load their local fullclient
		 */
		skipIntro: false,

		/**
		 * @type {Array} do you want to auto-login to the server ?
		 * Can be used in a securized session to auto-connect to the server without inserting login-pass (ie: Facebook app ?)
		 * Using as autoLogin: ["username", "userpass"]
		 */
		autoLogin: [],

		/**
		 * @type {boolean} Enable Cash Shop UI
		 */
		enableCashShop: false,

		/**
		 * @type {boolean} Enable Bank UI
		 */
		enableBank: false,

		/**
		 * @type {boolean} Enable Damage Suffix
		 */
		enableDmgSuffix: false,

		/**
		 * @type {boolean} Enable Map Name Banner
		 */
		enableMapName: false,

		/**
		 * @type {boolean} Enable Check Attendance UI
		 */
		enableCheckAttendance: false,

		/**
		 * @type {boolean} Enable Homunculus Auto Feed for older PACKETVER than 20170920
		 */
		enableHomunAutoFeed: false,

		/**
		 * @type {boolean} Enable Roulette feature.
		 */
		enableRoulette: false,

		/**
		 * @type {boolean} User interface version selection mode (PacketVer | PreRenewal | Renewal)
		 */
		clientVersionMode: 'PacketVer',

		/**
		 * @type {mixed} set a version to avoid browser cache problem so
		 * your users wil get the latest version running instead of a
		 * cached one.
		 */
		version: '98',

		/**
		 * @type {URL} URL to the server's registration site
		 */
		registrationweb: '',

		/**
		 * @type {Object} Dettings for World Map
		 */
		worldMapSettings: {},

		/**
		 * @type {boolean} Enable use address to connect in all servers (login, char, map)
		 */
		forceUseAddress: false,

		/**
		 * @type {boolean} Enable console in non-development environment
		 */
		enableConsole: false,

		/**
		 * @type {boolean} Force disable console in any environment
		 */
		disableConsole: false,

		/**
		 * @type {Object} Settings for display aura levels
		 */
		aura: {},

		/**
		 * @type {Array} list of extensions you want to use for your BGMs.
		 * It will test each extensions until there is one it can read.
		 *
		 * Examples: ['ogg', 'mp4', 'mp3']
		 * Will try to see if it can load '.ogg' audio file, if it fail, will try to see if it can load .mp4, etc.
		 */
		BGMFileExtension: ['mp3'],

		/**
		 * @type {Object} Define plugin to execute
		 * It will test each extensions until there is one it can read.
		 */
		plugins: {},

		// Custom camera support
		ThirdPersonCamera: false,
		FirstPersonCamera: false,
		CameraMaxZoomOut: 5,

		/**
		 * @type {integer} transition duration in milliseconds
		 * used for fade out and fade in when teleport/change map
		 * the total will be the double in ms because its used on fade in then on fade out
		 * eg: if you use 500ms the transition will take 1000ms in total
		 */
		transitionDuration: 500,

		/**
		 * @type {object} custom path settings for LUA files.
		 */
		customLUAPaths: {
			checkAttendance: ['System/CheckAttendance.lub'],
			itemInfo: ['System/itemInfo.lub'],
			mapInfo: ['System/mapInfo.lub'],
			ongoingQuestInfoList: ['System/OngoingQuestInfoList.lub'],
			ongoingQuestInfoData: ['SystemEN/OngoingQuests.lub'],
			petEvolution: ['System/PetEvolutionCln.lub'],
			petInfo: [ApiConfig.DEFAULT_LUA_PATH + 'datainfo/petinfo.lub'],
			signBoardData: ['SystemEN/Sign_Data.lub'],
			signBoardList: [ApiConfig.DEFAULT_LUA_PATH + 'SignBoardList.lub'],
			townInfo: ['System/Towninfo.lub'],
			townData: ['SystemEN/Towninfo.lub']
		},

		/**
		 * @type {boolean} restoreChatFocus.
		 */
		restoreChatFocus: false
	};
}

/**
 * Export
 */
export default ApiConfig;
