const fs = require('fs');
const requirejs = require('requirejs');
const Terser = require('terser');
const package = require('../package.json');
const startTime = Date.now();
const args = getArgs();

const buildDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

(function build() {
    const dist = './dist/';
    //delete all files in dist
    fs.rmSync('./dist/AI', { recursive: true, force: true });
    fs.rmSync('./dist/static', { recursive: true, force: true });
    fs.rmSync('./dist/main.html', { recursive: true, force: true });
    fs.rmSync('./dist/main.js', { recursive: true, force: true });
    fs.rmSync('./dist/Online.js', { recursive: true, force: true });
    fs.rmSync('./dist/ThreadEventHandler.js', { recursive: true, force: true });
    fs.rmSync('./dist/package.json', { recursive: true, force: true });

    if (!fs.existsSync(dist)){
        fs.mkdirSync(dist);
    }

    if ((args && args['O']) || args['all'] || Object.keys(args).length === 0) {
        compile("Online", args['m']);
    }

    if ((args && args['T']) || args['all'] || Object.keys(args).length === 0) {
        compile("ThreadEventHandler", args['m']);
    }

    if ((args && args['H']) || args['all'] || Object.keys(args).length === 0) {
        createHTML();
    }
    
    if ((args && args['A']) || args['all'] || Object.keys(args).length === 0) {
        copyFolder('./AI', './dist/AI');
    }
    
    if ((args && args['M']) || args['all'] || Object.keys(args).length === 0) {
        createMain();
    }
    
    if ((args && args['J']) || args['all'] || Object.keys(args).length === 0) {
        createJSON();
    }

    copyFolder('./static', './dist/static');
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
                console.log(appName + ".js - Minifying...");
                const options = {
                    output: {
                        ascii_only: true
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
                <title>RONW [${package.version} - ${buildDate}]</title>
            </head>
            <body>
                <script src="main.js"></script>
            </body>
        </html>
    `;
    fs.writeFileSync('./dist/main.html', body, { encoding: "utf8" });
    console.log("main.html has been created in", (Date.now() - start), "ms.");
}

function copyFolder(src, dest){
    const   start = Date.now();
    fs.cpSync(src, dest, {recursive: true});
    console.log(src.replace('./', '') + " folder and files has been created in", (Date.now() - start), "ms.");
}

function createMain(){
    const start = Date.now();
    let body = fs.readFileSync('./main.js', {encoding:'utf8', flag:'r'});
    // 
    body = body.replace(/development:(.*)/gm, '');
    body = body.replace(/readDataFolder(.*)/, '');
    body = body.replace(/rootFolder(.*)/, '//rootFolder: \'\', //Edit this line if you need to read the data from specific folder.');
    body = `// Check if player try to use this on sdk version
if(process.versions['nw-flavor'] === 'sdk'){
    alert('Oops! Don\\'t do that.');
    nw.App.closeAllWindows();
}\n` + body;
    fs.writeFileSync('./dist/main.js', body, { encoding: "utf8" });
    console.log("Main.js has been created in", (Date.now() - start), "ms.");
}

function createJSON(){
    var start = Date.now();
    const body = `
    {
        "name": "${package.name}",
        "main": "${package.main}",
        "version": "${package.version}",
        "window": {
            "width": 1024,
            "height": 768,
            "min_width": 1024,
            "max_width": 2560,
            "min_height": 768,
            "max_height": 1440,
            "fullscreen": false,
            "frame": true,
            "icon": "static/icon_128.png"
        },
        "build": {
            "nwVersion": "${package.devDependencies.nw.replace('-sdk', '')}",
            "nwFlavor": "normal",
            "output": "../release/",
            "win": {
                "productName": "RONW",
                "companyName": "RONW",
                "icon": "static/icon.ico"
            }
        },
        "chromium-args": "--enable-webgl --ignore-gpu-blacklist --enable-node-worker --user-data-dir=save --disable-raf-throttling",
        "author": "MrUnzO (kwon.unzo@gmail.com)",
        "license": "GNU GPL V3"
    }
    
    `;
    fs.writeFileSync('./dist/package.json', body, { encoding: "utf8" });
    console.log("package.json has been created in", (Date.now() - start), "ms.");
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