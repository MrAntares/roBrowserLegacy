/**  
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
	enableAchievements: true,
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
