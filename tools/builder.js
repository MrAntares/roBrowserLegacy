const fs = require('fs');
const requirejs = require('requirejs');
const Terser = require('terser');
const startTime = Date.now();
const args = getArgs();

(function build() {
    if ((args && args['O'])) {
        compile("Online", args['M']);
    }

    if ((args && args['T'])) {
        compile("ThreadEventHandler", args['M']);
    }

    if ((args && args['H'])) {
        createHTML();
    }
    
    if ((args && args['S'])) {
        createSetting();
    }
})();

function compile(appName, isMinify) {
    console.log(appName + ".js", "- Compiling...", "[ Minify:", isMinify ? "true" : "false", "]");

    let appPath, startFile;

    switch (appName) {
        case "ThreadEventHandler":
            appPath = "Core/ThreadEventHandler";
            startFile = ["src/Vendors/require.js"];
            break;

        case "Online":
            appPath = "App/Online";
            startFile = [/* "build/settings.js", "build/bootstrap.js", */ "src/Vendors/require.js"];
            break;

        default:
            break;
    }

    const config = {
        name: 'RONW',
        baseUrl: 'src',
        paths: {
            text: 'Vendors/text.require',
            jquery: 'Vendors/jquery-3.5.1',
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
                ' * Build with RONW Builder [MrUnzO]',
                ' * ',
                ' * This file is part of ROBrowser, (http://www.robrowser.com/).',
                ' * @author Vincent Thibault and the community',
                ' */\n',
            ].join("\n");
            // Remove importScripts(requirejs), included directly
            source = source.replace(/importScripts\([^\)]+\)(\,|\;|\n)?/g, '');

            let fileName = "./dist/" + appName + '.js';

            if (isMinify) {
                console.log(appName + ".js - Minifing...");
                const options = {
                    output: {
                        ascii_only: true
                    }
                };
                source = await Terser.minify(source, options);
                source = source.code;
                fileName = "./dist/" + appName + '.min.js';
            }

            fs.writeFile(fileName, header + source, { encoding: "utf8" }, function () {
                console.log(appName + ".js has been created in", (Date.now() - startTime), "ms.");
            });
        }
    };

    requirejs.optimize(config, function (buildResponse) {
    }, function (err) {
        console.error(err);
    });
}

function createHTML(){
    const body = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>ROBrowser - NW</title>
            </head>
            <body>
                <script src="settings.js"></script>
                <script src="bootstrap.js"></script>
            </body>
        </html>
    `;
    fs.writeFile('./dist/main.html', body, { encoding: "utf8" }, function () {
        console.log("main.html has been created in", (Date.now() - startTime), "ms.");
    });
}

function createSetting(){
    const body = `
        // Your custom settings
        var ROConfig = {
            development: false,
            grfList: ['data.grf'],
            servers: [
                {
                    display: 'Localhost Server',
                    desc: "Demo server",
                    address: '127.0.0.1',
                    port: 6900,
                    version: 55,
                    langtype: 5,
                    packetver: 20180704,
                },
            ],
            skipIntro: true,
            skipServerList: true,
            version: 0.1.0,
            plugins: {},
        };
    `;
    fs.writeFile('./dist/settings.js', body, { encoding: "utf8" }, function () {
        console.log("settings.js has been created in", (Date.now() - startTime), "ms.");
    });
}

function createBootstrap(){
    const body = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>ROBrowser - NW</title>
            </head>
            <body>
                <script src="settings.js"></script>
                <script src="bootstrap.js"></script>
            </body>
        </html>
    `;
    fs.writeFile('./dist/settings.js', body, { encoding: "utf8" }, function () {
        console.log("settings.js has been created in", (Date.now() - startTime), "ms.");
    });
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