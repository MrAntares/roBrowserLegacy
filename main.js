console.log('RONW Version:', require('./package.json').version);
// Add support for node.js + requirejs
window.gui = require('nw.gui');
window.requireNode = window.require;
delete window.require;
window.requireNode.version = process.versions.node;
delete process.versions.node;

var fs = requireNode('fs');
var path = requireNode('path');

const ROConfig = {
    development: true, // don't need to compile javascript files in chrome app since it's already a package.
    grfList: ['data.grf','rdata.grf'],
    readDataFolder: true,
    rootFolder: "G:/Private Servers/Ragnarok/roBrowser/ROData2018/",
    servers: [
        {
            display: 'Localhost Server',
            desc: "roBrowser's demo server",
            address: '127.0.0.1',
            port: 6900,
            version: 55,
            langtype: 5,
            packetver: 20180704,
            packetKeys: true
        },
    ],
    saveFiles: false,
    skipIntro: false,
    skipServerList: true,
    version: 1.272,
    //charCreateVer:   1,
    plugins: {},
};

window.ROConfig = ROConfig;

(async function () {
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

    if (ROConfig.rootFolder) {
        ROConfig.dataPath = ROConfig.rootFolder;
    } else {
        ROConfig.dataPath = process.execPath.replace('nw.exe', '');
    }

    console.log('[Flavors] ' + process.versions['nw-flavor']);
    console.log('[Working Path] ' + ROConfig.dataPath);
    console.log('[NW Path] ' + process.execPath.replace('nw.exe', ''));

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
    
    ROConfig.fileList = [];
    const folderList = ['System', 'BGM'];
    const promises = folderList.map(async function(folder){
        console.log('[' + folder + '] Crawling...');
        const results = getAllFiles(ROConfig.dataPath + folder + '/');
        for (let i = 0; i < results.length; i++) {
            ROConfig.fileList.push(
                new File(
                    results[i],
                    results[i].slice(ROConfig.dataPath.length).replace('\\', '/')
                )
            );
            ROConfig.fileList[ROConfig.fileList.length - 1].fullPath = ROConfig.fileList[ROConfig.fileList.length - 1].name;
        }
    })
    await Promise.all(promises)
    console.log("Finish crawling folders.");
    console.log("Files added:", ROConfig.fileList.length);
    //Inject the script after we load all files into the fileList.
    if(ROConfig.development){
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'src/Vendors/require.js';
        script.setAttribute("data-main",'src/App/Online');
        document.getElementsByTagName('body')[0].appendChild(script);
    }else{
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'Online.js';
        document.getElementsByTagName('body')[0].appendChild(script);
    }
})();

function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(dirPath, "/", file))
      }
    })
  
    return arrayOfFiles
}