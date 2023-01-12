const ROConfig = {
    development: true, // don't need to compile javascript files in chrome app since it's already a package.
    grfList: ['data.grf','rdata.grf'],
    readDataFolder: true,
    rootFolder: "G:\\Private Servers\\Ragnarok\\roBrowser\\ROData2018\\",
    servers: [
        {
            display: 'Localhost Server',
            desc: "roBrowser's demo server",
            address: '127.0.0.1',
            port: 6900,
            version: 55,
            langtype: 5,
            packetver: 20180704,
        },
    ],
    saveFiles: false,
    skipIntro: false,
    skipServerList: true,
    version: 1.272,
    //charCreateVer:   1,
    plugins: {},
};

var fs = require('fs');
var path = require('path');

(function () {
    ROConfig.grfList = ROConfig.grfList || null;
    ROConfig.charBlockSize = ROConfig.charBlockSize || 0;
    ROConfig.clientHash = ROConfig.clientHash || null;
    ROConfig.calculateHash = ROConfig.calculateHash || false;
    ROConfig.development = ROConfig.development || false;
    ROConfig.packetKeys = false;
    ROConfig.saveFiles = false;
    ROConfig.skipServerList = true;
    ROConfig.skipIntro = true;
    ROConfig.autoLogin = [];
    ROConfig.version = ROConfig.version || '';
    ROConfig.BGMFileExtension = ROConfig.BGMFileExtension || ['mp3'];
    ROConfig.plugins = ROConfig.plugins || {};
    ROConfig.ThirdPersonCamera = false;
    ROConfig.FirstPersonCamera = false;

    console.log('[Flavors] ' + process.versions['nw-flavor']);
    console.log('[Working Path] ' + ROConfig.dataPath);
    console.log('[NW Path] ' + process.execPath.replace('nw.exe', ''));

    if (ROConfig.rootFolder) {
        ROConfig.dataPath = ROConfig.rootFolder;
    } else {
        ROConfig.dataPath = process.execPath.replace('nw.exe', '');
    }

    //Add Path to GRF List
    if (ROConfig.grfList) {
        for (let i = 0; i < ROConfig.grfList.length; i++) {
            var grfName = ROConfig.grfList[i];
            ROConfig.grfList[i] = ROConfig.dataPath + ROConfig.grfList[i];
            if (!fs.existsSync(ROConfig.grfList[i])) {
                alert('File not found: ' + grfName);
                ROConfig.grfList.splice(i, 1);
                i--;
            }
        }
    }

    if (ROConfig.grfList.length < 1) {
        console.log("Closing app.")
        nw.App.closeAllWindows();
    }

    const files = [];
    ['System', 'BGM'].forEach(function (folder, index) {
        recursive(ROConfig.dataPath + folder + '\\', function (err, results) {
            if (err) throw err;

            console.log('[' + folder + '] Crawling...');

            for (let i = 0; i < results.length; i++) {
                files.push(
                    new File(
                        results[i],
                        results[i].replace(ROConfig.dataPath, '').replace('\\', '/')
                    )
                );
            }
        });
    });

    for (let i = 0; i < files.length; i++) {
        files[i].fullPath = files[i].name;
    }
    ROConfig.fileList = files;
    window.ROConfig = ROConfig;

})();

function recursive(dir, done) {
    var results = [];

    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    recursive(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
}

// Add support for node.js + requirejs
window.gui = require('nw.gui');
window.requireNode = window.require;
delete window.require;
window.requireNode.version = process.versions.node;
delete process.versions.node;