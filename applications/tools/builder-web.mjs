import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

const startTime = Date.now();
const args = getArgs();

const buildDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
const dist = './dist/';
const platform = 'Web';

// Aliases (same as vite.config.js)
const aliases = {
	jquery: path.resolve(__dirname, '../../src/Vendors/jquery-1.9.1.js'),
	App: path.resolve(__dirname, '../../src/App'),
	Audio: path.resolve(__dirname, '../../src/Audio'),
	Controls: path.resolve(__dirname, '../../src/Controls'),
	Core: path.resolve(__dirname, '../../src/Core'),
	DB: path.resolve(__dirname, '../../src/DB'),
	Engine: path.resolve(__dirname, '../../src/Engine'),
	Loaders: path.resolve(__dirname, '../../src/Loaders'),
	Network: path.resolve(__dirname, '../../src/Network'),
	Plugins: path.resolve(__dirname, '../../src/Plugins'),
	Preferences: path.resolve(__dirname, '../../src/Preferences'),
	Renderer: path.resolve(__dirname, '../../src/Renderer'),
	UI: path.resolve(__dirname, '../../src/UI'),
	Utils: path.resolve(__dirname, '../../src/Utils'),
	Vendors: path.resolve(__dirname, '../../src/Vendors')
};

const header = [
	'/*',
	' * Build with RONW Builder [MrUnzO] (https://github.com/MrUnzO/RONW)',
	' * ',
	' * This file is part of ROBrowser, (http://www.robrowser.com/).',
	' * @author Vincent Thibault and the community',
	' */\n'
].join('\n');

// Map appName to entry file path (relative to project root)
const entryMap = {
	ThreadEventHandler: 'src/Core/ThreadEventHandler.js',
	GrannyModelViewer: 'src/App/GrannyModelViewer.js',
	GrfViewer: 'src/App/GrfViewer.js',
	MapViewer: 'src/App/MapViewer.js',
	ModelViewer: 'src/App/ModelViewer.js',
	Online: 'src/App/Online.js',
	StrViewer: 'src/App/StrViewer.js',
	EffectViewer: 'src/App/EffectViewer.js'
};

(async function build() {
	const basePath = dist + platform;

	const modules = {
		G: { path: '/GrannyModelViewer.js', action: () => compile('GrannyModelViewer', args['m']) },
		D: { path: '/GrfViewer.js', action: () => compile('GrfViewer', args['m']) },
		V: { path: '/MapViewer.js', action: () => compile('MapViewer', args['m']) },
		M: { path: '/ModelViewer.js', action: () => compile('ModelViewer', args['m']) },
		O: { path: '/Online.js', action: () => compile('Online', args['m']) },
		S: { path: '/StrViewer.js', action: () => compile('StrViewer', args['m']) },
		E: { path: '/EffectViewer.js', action: () => compile('EffectViewer', args['m']) },
		T: { path: '/ThreadEventHandler.js', action: () => compile('ThreadEventHandler', args['m']) },
		H: { path: '/index.html', action: createHTML },
		PWA: {
			path: '/index.html',
			action: () => {
				createHTML(true);
				copyPwaFiles();
			}
		}
	};

	// Ensure base directories exist
	if (!fs.existsSync(dist)) {
		fs.mkdirSync(dist);
	}
	if (!fs.existsSync(basePath)) {
		fs.mkdirSync(basePath);
	}

	// Filter and process only necessary modules
	const isAll = args['all'] || Object.keys(args).length === 0;
	const activeModules = Object.keys(modules).filter(key => isAll || args[key]);

	for (const key of activeModules) {
		const { path: modPath, action } = modules[key];
		const fullPath = `${basePath}${modPath}`;
		if (fs.existsSync(fullPath)) {
			fs.rmSync(fullPath, { recursive: true, force: true });
		}
		await action();
	}
})();

async function compile(appName, isMinify) {
	console.log(appName + '.js', '- Compiling...', '[ Minify:', isMinify ? 'true' : 'false', ']');

	const { build } = await import('vite');
	const projectRoot = path.resolve(__dirname, '../../');
	const entry = path.resolve(projectRoot, entryMap[appName]);
	const outDir = path.resolve(projectRoot, dist + platform);

	try {
		await build({
			configFile: false,
			root: projectRoot,
			base: './',
			logLevel: 'warn',
			resolve: {
				alias: aliases
			},
			worker: {
				rollupOptions: {
					output: {
						entryFileNames: '[name].js'
					}
				}
			},
			build: {
				outDir: outDir,
				emptyOutDir: false,
				assetsInlineLimit: 1024 * 1024,
				rollupOptions: {
					input: entry,
					output: {
						format: 'es',
						entryFileNames: appName + '.js', //Online -> Online.js
						codeSplitting: false,
						banner: header
					},
					onwarn(warning, warn) {
						if (warning.code === 'PLUGIN_TIMINGS') {
							// just appears if vite spending much time to compile css and assets
							return;
						}
						warn(warning);
					}
				},
				minify: isMinify ? 'terser' : false,
				terserOptions: isMinify
					? {
							output: {
								ascii_only: true,
								comments: false
							}
						}
					: undefined,
				// Don't copy public assets for each module build
				copyPublicDir: false
			}
		});

		console.log(appName + '.js has been created in', Date.now() - startTime, 'ms.');
	} catch (err) {
		console.error('Error building ' + appName + ':', err);
	}
}

function createHTML(includeManifest = false) {
	const start = Date.now();
	let manifest = includeManifest ? `<link rel="manifest" href="./manifest.webmanifest">` : ``;
	const body = `<!DOCTYPE html>  
<html>  
    <head>  
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>  
        <meta charset="UTF-8">  
        <title>roBrowser [${pkg.version} - ${buildDate}]</title>  
        <link rel="icon" type="image/png" href="./icon.png">  
  
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">  
        <meta name="HandheldFriendly" content="true">  
  
        <meta name="apple-mobile-web-app-capable" content="yes">  
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">  
        <meta name="apple-mobile-web-app-title" content="roBrowser">  
        <meta name="mobile-web-app-capable" content="yes">  
  
        <meta name="description" content="roBrowser">  
        <meta name="keywords" content="roBrowser">  
        <meta name="author" content="roBrowser">  
        <meta name="robots" content="index">  
  
        <meta name="theme-color" content="#ff8cb5">  
  
        <meta property="og:title" content="roBrowser">  
        <meta property="og:description" content="roBrowser">  
        <meta property="og:type" content="website">  
        <meta property="og:locale" content="en_US">  
  
        <link rel="apple-touch-icon" href="./icon.png">  
        ${manifest}  
    </head>  
    <body>  
        <script src="Config.js"></script>  
        <script>  
            // Load optional Config.local.js for overrides (fails silently if not present)  
            (function() {  
                var script = document.createElement('script');  
                script.src = 'Config.local.js';  
                script.onerror = function() {  
                    console.log('Config.local.js not found, using defaults from Config.js');  
                };  
                document.head.appendChild(script);  
            })();  
        </script>  
        <script>  
            function deepMerge(target, source) {  
                for (var key in source) {  
                    if (source.hasOwnProperty(key)) {  
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {  
                            target[key] = deepMerge(target[key] || {}, source[key]);  
                        } else {  
                            target[key] = source[key];  
                        }  
                    }  
                }  
                return target;  
            }  
  
            window.addEventListener("load", (event) => {  
                // Merge Config.js defaults with Config.local.js overrides  
                var config = deepMerge({}, window.ROConfigBase || {});  
                if (window.ROConfigLocal) {  
                    config = deepMerge(config, window.ROConfigLocal);  
                }  
                window.ROConfig = config;  
  
				var script = document.createElement('script');  
				script.type = 'module';  
				script.src = 'Online.js';  
				document.getElementsByTagName('body')[0].appendChild(script);
            });  
        </script>  
    </body>  
</html>  
`;
	fs.writeFileSync(dist + platform + '/index.html', body, { encoding: 'utf8' });
	createConfigJS();
	console.log('index.html has been created in', Date.now() - start, 'ms.');
}

function createConfigJS() {
	const configContent = `/**  
 * ROBrowser Configuration - Default Settings  
 *  
 * This file contains default configuration values.  
 * To override settings without modifying this file, create Config.local.js  
 * with your custom values in window.ROConfigLocal.  
 *  
 * Example Config.local.js:  
 *   window.ROConfigLocal = {  
 *       servers: [{ display: 'My Server', address: '192.168.1.1', ... }],  
 *       skipIntro: true  
 *   };  
 */  
window.ROConfigBase = {  
    development: false,  
    remoteClient: 'https://grf.robrowser.com/',  
    servers: [{  
        display: 'roBrowser Demo Server',  
        desc: 'roBrowser demo server',  
        address: '127.0.0.1',  
        port: 6900,  
        version: 55,  
        langtype: 1,  
        packetver: 20130618,  
        renewal: false,  
        worldMapSettings: { episode: 12 },  
        packetKeys: false,  
        socketProxy: 'wss://connect.robrowser.com',  
        adminList: [2000000]  
    }],  
    webserverAddress: 'http://127.0.0.1:8888',  
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
    clientVersionMode: "PacketVer",  
    disableConsole: false,  
    enableBank: true,  
    enableCashShop: true,  
    enableCheckAttendance: true,  
    enableDmgSuffix: true,  
    enableHomunAutoFeed: true,  
    enableMapName: true,  
    enableRoulette: false,  
    FirstPersonCamera: false,  
    grfList: null,  
    hashFiles: [],  
    loadLua: false,  
    customItemInfo: [],  
    onReady: null,  
    plugins: {},  
    registrationweb: '',  
    saveFiles: true,  
    ThirdPersonCamera: false,  
    transitionDuration: 500,  
    restoreChatFocus: false,  
};  
`;
	fs.writeFileSync(dist + platform + '/Config.js', configContent, { encoding: 'utf8' });
}

function copyPwaFiles() {
	const start = Date.now();
	fs.copyFileSync('./applications/pwa/icon.png', dist + platform + '/icon.png');
	fs.copyFileSync('./applications/pwa/manifest.webmanifest', dist + platform + '/manifest.webmanifest');
	fs.copyFileSync('./applications/pwa/screenshotwide.png', dist + platform + '/screenshotwide.png');
	fs.copyFileSync('./applications/pwa/screenshotnarrow.png', dist + platform + '/screenshotnarrow.png');
	console.log('PWA files copied', Date.now() - start, 'ms.');
}

function copyFolder(src, dest) {
	const start = Date.now();
	fs.cpSync(src, dest, { recursive: true });
	console.log(src.replace('./', '') + ' folder and files has been created in', Date.now() - start, 'ms.');
}

function getArgs() {
	const args = {};
	process.argv.slice(2, process.argv.length).forEach(arg => {
		if (arg.slice(0, 2) === '--') {
			const longArg = arg.split('=');
			const longArgFlag = longArg[0].slice(2, longArg[0].length);
			const longArgValue = longArg.length > 1 ? longArg[1] : true;
			args[longArgFlag] = longArgValue;
		} else if (arg[0] === '-') {
			const flags = arg.slice(1, arg.length).split('');
			flags.forEach(flag => {
				args[flag] = true;
			});
		}
	});
	return Object.keys(args).length === 0 ? false : args;
}
