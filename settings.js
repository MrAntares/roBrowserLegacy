// Your custom settings
// See parameters in http://www.robrowser.com/getting-started#API
var ROConfig = {
    development: true, // don't need to compile javascript files in chrome app since it's already a package.
    grfList: ['data.grf'],
    readDataFolder: true,
    rootFolder: "G:\\Private Servers\\Ragnarok\\roBrowser\\ROData\\",
    servers: [
        {
            display: 'Localhost Server',
            desc: "roBrowser's demo server",
            address: '127.0.0.1',
            port: 6900,
            version: 55,
            langtype: 5,
            packetver: 20180620,
            //packetKeys:  [0x5ED10A48,0x667F4301,0x2E5D761F],
            // socketProxy: 'wss://127.0.0.1:5999/',
            //adminList:   [2000000]
        },
    ],
    saveFiles: false,
    skipIntro: true,
    skipServerList: true,
    version: 1.272,
    //charCreateVer:   1,
    plugins: {},
};
