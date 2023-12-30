# Advanced roBrowser client usage

## Settings overview

Here the current init parameters supported by the client:

```js
function initialize() {
      var ROConfig = {
          type:          ROBrowser.TYPE.FRAME,  // Possible: .FRAME (instert into current document), .POPUP (open new window)
          target:        document.getElementById("robrowser"),  // When using TYPE.FRAME this is the id of the target iframe in the current document
          application:   ROBrowser.APP.ONLINE,  // Possible: .ONLINE (game), .MAPVIEWER, .GRFVIEWER, .MODELVIEWER, .STRVIEWER, .GRANNYMODELVIEWER (not implemented)
          width:          800,    // Only affects TYPE.POPUP
          height:         600,    // Only affects TYPE.POPUP
          development:    false,  // When false needs a compiled Online.js in the root (faster load). When true, the client will directly use the javascript files from src/ (slower load, for debugging/development only)
          version:        20230927.0959, // Update this value every time you update your robrowser, to trigger a source refresh on every browser. Recommended to use a decimal timestamp (YYYYMMDD.hhmm), but can be anything
          
          servers: [{  // Game server info. You must configure this! You can have multiple servers like: servers: [{..}, {..}, {..}], you can also use clientinfo to set the server list (servers: "data/clientinfo.xml",)
              display:      "Demo Server",  // Display name, can be anything
              desc:         "roBrowser's demo server",  // Description, can be anything
              address:      "127.0.0.1",   // Must match your game server's
              port:         6900,          // Must match your game server's
              langtype:     12,            // Must match your game server's
              packetver:    20191223,      // Must match your game server's
              //grfList:    "DATA.INI",    // By default uses DATA.INI to get grf list, but you can define an array (grfList: ['custom.grf', 'palette.grf', 'data.grf'],) or a regex (grfList: /\.grf$/i,)
              remoteClient: "http://127.0.0.1/client", // Your remote client address. Defaults to http://grf.robrowser.com/
              renewal:      true,          // Must match your game server's type (true/false). When using clientinfo.xml you can add the <renewal>true</renewal> custom tag.
              packetKeys:   false,         // Packet encryption keys ( not implemented?? )
              socketProxy:  "ws://127.0.0.1:5999/",  // The websocket proxy's address you set up previously for robrowser (wsproxy)
              adminList:    [2000000]      // List admins' account IDs here like: [2000000, 2000001, 2000002 .... etc]
          }],

          packetDump:      false,  // Dump packet as hex in console?
          skipServerList:  true,   // Skip server selection?
          skipIntro:       false,  // Skip intro page?
          
          enableCashShop:  false,  // Enable Cash Shop UI?
          enableBank:      false,  // Enable Bank UI? (Requires PACKETVER 20130724 above)
          enableMapName:   false,  // Enable Map Name Banner? (Requires client data (GRF) newer than 2019.06.19)
          enableCheckAttendance: false, // Enable Check Attendance? (Requires PACKETVER 20180307 above)
          
       /* OPTIONAL/CUSTOM CONFIGS */
       /* Add/Remove the below as you wish */
          
          //clientHash:    '113e195e6c051bb1cfb12a644bb084c5', // Set fixed client hash value here (less secure, for development only)
          calculateHash:   false,  // When true, the client will calculate it's own hash and send that value (slower, more secure, only when development is false). Must provide the list of files in hashFiles!
          hashFiles:       ["api.html", "api.js", "Online.js", "ThreadEventHandler.js"],  // List of files to calculate the Hash based on. Add all files your robrowser uses, including your "main page/index.html" where you set up the RoBrowser Config. Only used when calculateHash is true.
          
          /* Plugins */
          plugins:  {
                        /* Syntax */

                        // Simple (no parameters):
                        // PluginName: 'Plugin_JS_Path_In_PluginsFolder_Without_Extension',

                        // Complex (with configurable parameters):
                        // PluginName: { path:'Plugin_JS_Path_In_PluginsFolder_Without_Extension', pars: { param1: <val1>, param2: <val2>, param3: <val3>... } }

                        /* Example: */
                        // KeyToMove: 'KeyToMove/KeyToMove'
                        // IntroMessage: { path:'IntroMessage/IntroMessage', pars: { newsUrl: 'https://yourserver.com/news/news.html' } }
                    },
          
          /* Custom, "for fun" camera modes */
          ThirdPersonCamera: false,  // When true you can zoom in more and rotate camera around player more freely with mouse
          FirstPersonCamera: false,  // When true you can look from the player's head, like an FPS game and rotate camera without limit
          CameraMaxZoomOut: 5,  // How far can you zoom out the camera, default:5. Note: Extreme values can break camera and/or mouse.
      };
      var RO = new ROBrowser(ROConfig);
      RO.start();
  }
  
  window.addEventListener("load", initialize, false);  // When the webpage loads this will start roBrowser
```
In case of the `langtype` option, we added support for some custom types:

Normal
- 160: Central European
- 161: Greek
- 162: Turkish
- 163: Hebrew
- 164: Estonian, Latvian, Lithuaninan

Unicode
- 240: UTF-8
- 241: UTF-16LE
- 242: UTF-16BE

**Using these custom types makes roBrowser incompatible with other clients without modifying them as well! Only use them if you know what you are doing!**

You can set up your own `index.html` / integrate roBrowser into your website as well based on the .examples/ and this example above.

## Custom plugins

- Copy your custom plugins into `src\Plugins`

Some examples: https://github.com/MrAntares/roBrowserLegacy-plugins
