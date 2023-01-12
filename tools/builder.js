const fs = require('fs');
const requirejs = require('requirejs');
const Terser = require('terser');
const startTime = Date.now();
const args = getArgs();

(function build() {
    const dist = './dist/';
    //delete all files in dist
    fs.rmSync(dist, { recursive: true });

    if (!fs.existsSync(dist)){
        fs.mkdirSync(dist);
    }

    if ((args && args['O']) || args['all']) {
        compile("Online", args['m']);
    }

    if ((args && args['T']) || args['all']) {
        compile("ThreadEventHandler", args['m']);
    }

    if ((args && args['H']) || args['all']) {
        createHTML();
    }
    
    if ((args && args['A']) || args['all']) {
        copyAI();
    }
    
    if ((args && args['M']) || args['all']) {
        createMain();
    }
    
    if ((args && args['J']) || args['all']) {
        createJSON();
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
    const start = Date.now();
    const body = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>ROBrowser - NW</title>
            </head>
            <body>
                <script src="main.js"></script>
                <script src="Online.js"></script>
            </body>
        </html>
    `;
    fs.writeFile('./dist/main.html', body, { encoding: "utf8" }, function () {
        console.log("main.html has been created in", (Date.now() - start), "ms.");
    });
}

function copyAI(){
    const   start = Date.now(),
            src = 'AI',
            dest = './dist/AI';

    fs.cp(src, dest, {recursive: true}, function(err){
        if (err) throw err;
        console.log("AI folder and files has been created in", (Date.now() - start), "ms.");
    });
}

// function createSetting(){
//     const start = Date.now();
//     const body = `
//         // Your custom settings
//         var ROConfig = {
//             //always set to false for compiled version.
//             development: false,
//             grfList: ['data.grf'],
//             // if you want to read data folder. (still have some bugs with this.)
//             readDataFolder: false,
//             //if you need the read the specific directory you can provide the path in this variable. (need have \\ at the end)
//             //Otherwise the client will read the current directory that nw.exe is running
//             //In case you put all dist files along with the nw.exe files, client will read from that folder, so, you just put grf files, System, AI and BGM folder in that folder to make client read the file.
//             // rootFolder: "C:\\Path\\To\\Root\\Folder\\Contain\\GRF_file\\",
//             servers: [
//                 {
//                     display: 'Localhost Server',
//                     desc: "Demo server",
//                     address: '127.0.0.1',
//                     port: 6900,
//                     version: 55,
//                     langtype: 5,
//                     packetver: 20180704,
//                 },
//             ],
//             skipIntro: true,
//             skipServerList: true,
//             version: '0.1.0',
//             plugins: {},
//         };
//     `;
//     fs.writeFile('./dist/settings.js', body, { encoding: "utf8" }, function () {
//         console.log("settings.js has been created in", (Date.now() - start), "ms.");
//     });
// }

function createMain(){
    const start = Date.now();
    let body = fs.readFileSync('./main.js', {encoding:'utf8', flag:'r'});
    // 
    body = body.replace(/development:(.*)/gm, '');
    fs.writeFile('./dist/main.js', body, { encoding: "utf8" }, function () {
        console.log("Main.js has been created in", (Date.now() - start), "ms.");
    });
}

function createJSON(){
    var start = Date.now();
    const body = `
    {
        "name": "ronwjs",
        "main": "main.html",
        "version": "0.1.0",
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
        "chromium-args": "--enable-webgl --ignore-gpu-blacklist --enable-node-worker --user-data-dir=save --disable-raf-throttling",
        "author": "MrUnzO (kwon.unzo@gmail.com)",
        "license": "GNU GPL V3"
    }
    
    `;
    fs.writeFile('./dist/package.json', body, { encoding: "utf8" }, function () {
        console.log("package.json has been created in", (Date.now() - start), "ms.");
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