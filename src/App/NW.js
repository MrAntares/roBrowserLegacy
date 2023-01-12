// Add support for node.js + requirejs
window.gui = require('nw.gui');
window.requireNode = window.require;
delete window.require;
window.requireNode.version = process.versions.node;
delete process.versions.node;

if(ROConfig.rootFolder){
    ROConfig.dataPath = ROConfig.rootFolder;
}else{
    ROConfig.dataPath = process.execPath.replace('nw.exe', '');
}

console.log('[Flavors] ' + process.versions['nw-flavor']);
console.log('[Working Path] ' + ROConfig.dataPath);
console.log('[NW Path] ' + process.execPath.replace('nw.exe', ''));

nw.RODataPath = ROConfig.dataPath;

//Add Path to GRF List
if (ROConfig.grfList) {
    for (let i = 0; i < ROConfig.grfList.length; i++) {
        ROConfig.grfList[i] = ROConfig.dataPath + ROConfig.grfList[i];
    }
}

var fs = requireNode('fs');
var path = requireNode('path');

async function recursive(dir, done) {
    var results = [];

    await fs.readdir(dir, function (err, list) {
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


//TODO: need to rewrite this idiot nested function.
recursive(ROConfig.dataPath + 'BGM\\', function (err, results) {
    if (err) throw err;
    let files = [];

    for (let i = 0; i < results.length; i++) {
        files.push(
            new File(
                results[i],
                results[i].replace(ROConfig.dataPath, '').replace('\\', '/')
            )
        );
    }

    recursive(ROConfig.dataPath + 'System\\', function (err, results2) {
        if (err) throw err;
        for (let i = 0; i < results2.length; i++) {
            files.push(
                new File(
                    results2[i],
                    results2[i]
                        .replace(ROConfig.dataPath, '')
                        .replace('\\', '/')
                )
            );
        }

        for (let i = 0; i < files.length; i++) {
            files[i].fullPath = files[i].name;
        }
        ROConfig.fileList = files;
    });
});