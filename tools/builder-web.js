const fs = require('fs');
const requirejs = require('./build/r');
const Terser = require('terser');
const package = require('../package.json');
const startTime = Date.now();
const args = getArgs();

const buildDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
const dist = './dist/';
const platform = "Web";
(function build() {
    const basePath = dist + platform;
    
    // Object mapping each module to its respective file path and compile function
    const modules = {
        'G': { path: '/GrannyModelViewer.js', action: () => compile("GrannyModelViewer", args['m']) },
        'D': { path: '/GrfViewer.js', action: () => compile("GrfViewer", args['m']) },
        'V': { path: '/MapViewer.js', action: () => compile("MapViewer", args['m']) },
        'M': { path: '/ModelViewer.js', action: () => compile("ModelViewer", args['m']) },
        'O': { path: '/Online.js', action: () => compile("Online", args['m']) },
        'S': { path: '/StrViewer.js', action: () => compile("StrViewer", args['m']) },
        'E': { path: '/EffectViewer.js', action: () => compile("EffectViewer", args['m']) },
        'T': { path: '/ThreadEventHandler.js', action: () => compile("ThreadEventHandler", args['m']) },
        'H': { path: '/index.html', action: createHTML },
        'A': { path: '/AI', action: () => copyFolder('./AI', `${basePath}/AI`) }
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
    activeModules.forEach(key => {
        const { path, action } = modules[key];
        const fullPath = `${basePath}${path}`;
        if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
        action();
    });
})();

function compile(appName, isMinify) {
    console.log(appName + ".js", "- Compiling...", "[ Minify:", isMinify ? "true" : "false", "]");

    let appPath, startFile;

    switch (appName) {
        case "ThreadEventHandler":
            appPath = "Core/ThreadEventHandler";
            startFile = ["src/Vendors/require.js"];
            break;

        case "GrannyModelViewer":
            appPath = "App/GrannyModelViewer";
            startFile = ["src/Vendors/require.js"];
            break;

        case "GrfViewer":
            appPath = "App/GrfViewer";
            startFile = ["src/Vendors/require.js"];
            break;

        case "MapViewer":
            appPath = "App/MapViewer";
            startFile = ["src/Vendors/require.js"];
            break;
            break;

        case "ModelViewer":
            appPath = "App/ModelViewer";
            startFile = ["src/Vendors/require.js"];
            break;

        case "Online":
            appPath = "App/Online";
            startFile = ["src/Vendors/require.js"];
            break;

        case "StrViewer":
            appPath = "App/StrViewer";
            startFile = ["src/Vendors/require.js"];
            break;

		case "EffectViewer":
            appPath = "App/EffectViewer";
            startFile = ["src/Vendors/require.js"];
            break;

        default:
            break;
    }

    const config = {
        name: 'RONW',
        baseUrl: 'src',
        paths: {
            text: 'Vendors/text.require',
            jquery: 'Vendors/jquery-1.9.1',
        },
        useStrict: true,
        optimize: "none",
        wrap: {
            startFile: startFile,
        },
        name: appPath,
        out: async (source) => {
            const header = [
                '/*',
                ' * Build with RONW Builder [MrUnzO] (https://github.com/MrUnzO/RONW)',
                ' * ',
                ' * This file is part of ROBrowser, (http://www.robrowser.com/).',
                ' * @author Vincent Thibault and the community',
                ' */\n',
            ].join("\n");
            // Remove importScripts(requirejs), included directly
            source = source.replace(/importScripts\([^\)]+\)(\,|\;|\n)?/g, '');

            let fileName = dist + platform + "/" + appName + '.js';

            if (isMinify) {
                console.log(appName + ".js - Minifying...");
                const options = {
                    output: {
                        ascii_only: true,
                        comments: false
                    }
                };
                source = await Terser.minify(source, options);
                source = source.code;
                // fileName = "./dist/" + appName + '.min.js';
            }

            fs.writeFileSync(fileName, header + source, { encoding: "utf8" });
            console.log(appName + ".js has been created in", (Date.now() - startTime), "ms.");
        }
    };

    requirejs.optimize(config, function (buildResponse) {
    }, function (err) {
        console.error(err);
    });
}

function createHTML(){
    const start = Date.now();
    const body = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <title>roBrowser [${package.version} - ${buildDate}]</title>
            </head>
            <body>
                <script>
                    window.addEventListener("load", (event) => {
                        window.ROConfig = {
                            development: false, // don't need to compile javascript files in chrome app since it's already a package.
                            remoteClient:  "http://roclient.localhost/",
                            servers: [
                                {
                                    display: 'Localhost Server',
                                    desc: "roBrowser's demo server",
                                    address: '127.0.0.1',
                                    port: 6900,
                                    version: 55,
                                    langtype: 5,
                                    packetver: 20180704,
                                    forceUseAddress: false,
                                    socketProxy: "ws://127.0.0.1:5999/",
                                    packetKeys: false
                                },
                            ],
                            packetDump:  false,
                            skipServerList:  true,
                            skipIntro:       true,
                            clientVersionMode: 'PacketVer',
                            plugins: {},
							clientHash: null,
							enableCashShop: false,
							enableBank: false,
							enableMapName: false,
                            enableRefineUI: false,
                            enableDmgSuffix: false,
							enableCheckAttendance: false,
							CameraMaxZoomOut: 5,
                            loadLua: true,
                        };

                        script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.src = 'Online.js';
                        document.getElementsByTagName('body')[0].appendChild(script);
                    });
                </script>
            </body>
        </html>
    `;
    fs.writeFileSync(dist + platform + '/index.html', body, { encoding: "utf8" });
    copyFolder('./src/UI/Components/Intro/images/', dist + platform + '/src/UI/Components/Intro/images/');
    console.log("index.html has been created in", (Date.now() - start), "ms.");
}

function copyFolder(src, dest){
    const   start = Date.now();
    fs.cpSync(src, dest, {recursive: true});
    console.log(src.replace('./', '') + " folder and files has been created in", (Date.now() - start), "ms.");
}

function getArgs() {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            else if (arg[0] === '-') {
                const flags = arg.slice(1, arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });
    return (Object.keys(args).length === 0) ? false : args;
}
