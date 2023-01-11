var fs = require('fs');
var requirejs = require('requirejs');
var Terser = require('terser');
const startTime = Date.now();
const args = getArgs();
// console.log(args);

function build(){
    if(args && args['O']){
        compile("Online", args['M']);
    }
    
    if(args && args['T']){
        compile("ThreadEventHandler", args['M']);
    }
}

function compile(appName, isMinify){
    console.log("Compiling", appName + ".js", "...");
    console.log("Minify:", isMinify ? "yes":"no");
    
    let appPath,startFile;

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
        name:    'RONW',
        baseUrl: 'src',
        paths: {
            text:   'Vendors/text.require',
            jquery: 'Vendors/jquery-3.5.1',
        },
        useStrict:   true,
        optimize: "none",
        wrap: {
            startFile: startFile,
        },
        name: appPath,
        out: async (source) => {
            var header = [
                '/*',
                ' * Build with RONW Builder [MrUnzO]',
                ' * This file is part of ROBrowser, (http://www.robrowser.com/).',
                ' * @author Vincent Thibault and the community',
                ' */\n',
            ].join("\n");
            // Remove importScripts(requirejs), included directly
            source = source.replace(/importScripts\([^\)]+\)(\,|\;|\n)?/g, '');
            
            let fileName = "./dist/" + appName + '.js';
    
            if(isMinify){
                const options = {
                    output: {
                        ascii_only: true
                    }
                };
                
                source = await Terser.minify(source, options);
                source = source.code;
                fileName = "./dist/" + appName + '.min.js';
                
            }

            fs.writeFileSync(fileName, header + source, { encoding: "utf8" });
            console.log(appName + ".js has been created in", (Date.now() - startTime), "ms.");
        }
    };

    requirejs.optimize(config, async function (buildResponse) {
        // console.log(buildResponse);
    }, function(err) {
        console.error(err);
    });
}

function getArgs(){
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach( arg => {
        // long arg
        if (arg.slice(0,2) === '--') {
            const longArg = arg.split('=');
            const longArgFlag = longArg[0].slice(2,longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === '-') {
            const flags = arg.slice(1,arg.length).split('');
            flags.forEach(flag => {
            args[flag] = true;
            });
        }
    });
    return args;
}

build();