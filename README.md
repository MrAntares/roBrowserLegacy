This is a fork of roBrowser tailored to my server and expanded with some features.

If you wish to discuss anything related to this project, or you want to join, contact us on Discord: https://discord.gg/8JdHwM4Kqm

For info on how to setup the client read the contents of this readme or our [Getting Started doc](https://github.com/MrAntares/Ragna.roBrowser/blob/master/doc/Start.md). For the original branche's docs please visit the https://www.robrowser.com/ site.

All credits to the original owners/creators.

## Installing

### Prerequisites

To run roBrowser you will need a browser that supports [WebGL](http://www.chromeexperiments.com/webgl/) and is OpenGL ES 2.0 compatible. We've tested the following browsers:

* Chrome
* FireFox
* Opera
* IE11

If you don't run roBrowser in a Chrome App, you will need a Java plugin installed instead.

### Quickstart

1.  Install and run an HTTP server on your PC/Device. Take note of the port you run the server on, this guide assumes you use port 8000.

2.  [Download roBrowser](https://github.com/MrAntares/Ragna.roBrowser/archive/refs/heads/master.zip) and extract the files to the folder that will be the root of your HTTP Server.

3.  Open your browser and go to `http://TypeYourHTTPServerIPhere:8000/tools/build/index.html` - replace `"TypeYourHTTPServerIPhere"` with the PC/Device HTTP Server address that is hosting the Ragna.roBrowser files you extracted.
    Here you will compile scripts to reduce loading times. 

    3a. To get the client compiled for playing, click/tap Online then Thread and place the Online.js and ThreadEventHandler.js to the root of your Ragna.roBrowser folder.

    3b. [Optional] Compile any of these; GRF Viewer, STR Viewer, Model Viewer, Map Viewer if you want to look through the game files.

4.  [Convert DB] Go to `http://TypeYourHTTPServerIPhere:8000/tools/converter/index.html` to get custom content to roBrowser.

5.  Setup your client version:
    Copy your `.grf` and `DATA.INI`(Note DATA.INI is case sensitive so make sure it's capitalized or edit the name in configs.php) to the /client/resources/ folder.
    Also double check that your `DATA.INI` file has all the `.grf` files you intend to use.

    5a. Copy your BGM folder `mp3`'s to the `/client/BGM/`.

    5b. Copy your `data` folder contents to `/client/data/`.

    5c. Copy your AI files to the `/AI/`folder then open each `*.lua` file then find and replace:
   `require "AI\\Const"` with `dofile "./AI/Const.lua"`
   `require "AI\\Util"` with `dofile "./AI/Util.lua"`

6.  Create a new text file and name it `index.html`

    6a.  Copy the following and paste it into your index html file. 
     Edit your Game Server address, packet version and other settings:
```js
function initialize() {
      var ROConfig = {
          target:        document.getElementById("robrowser"),
          type:          ROBrowser.TYPE.FRAME,
          application:   ROBrowser.APP.ONLINE,
          width:          800,
          height:         600,
          development:    false,
          servers: [{
              display:     "Demo Server",
              desc:        "roBrowser's demo server",
              address:     "127.0.0.1",
              port:        6900,
              version:     30,
              langtype:    1,
              packetver:   20120410,
              packetKeys:  false,
              socketProxy: "ws://127.0.0.1:5999/",
              adminList:   [2000000]
          }],
          skipServerList:  true,
          skipIntro:       false,
      };
      var RO = new ROBrowser(ROConfig);
      RO.start();
  }
  window.addEventListener("load", initialize, false);
```
7.  Install the [websocket proxy](https://github.com/herenow/wsProxy/blob/master/README.md) on your Game Server and edit the parameter `socketProxy: "ws://127.0.0.1:5999/",`
 to `socketProxy: "ws://TypeYourHerculesOrRathenaServerHere:5999/",` in your `index.html` .

    7a. Run websocket proxy: `wsproxy -a 127.0.0.1:6900,127.0.0.1:6121,127.0.0.1:5121` replace `127.0.0.1` with your Game Server IP.
    
    Note: Most of the browsers nowadays don't support mixed security, so either use `https` & `wss` everywhere or `http` & `ws`. Some browsers recently started to disable non-secure websocket calls, so `https` & `wss` is highly recommended if you are using roBrowser on a non-local/open server.

8.  Configure and customize roBrowser - [documentation](http://www.robrowser.com/getting-started#API) and some [examples](https://github.com/vthibault/roBrowser/tree/master/examples).

9. Go to `http://YourHTTPServerIP/index.html` and enjoy!
 
Checkout [getting started guide](https://github.com/MrAntares/Ragna.roBrowser/blob/master/doc/Start.md)

## Contributing

roBrowser was started by this [awesome team](https://github.com/vthibault/roBrowser/graphs/contributors) and [we](https://github.com/MrAntares/Ragna.roBrowser/graphs/contributors) continue it. We also manually add content from other forks that didn't made it back to the original branch, huge shoutout to them! If you wish to contribute then check out the [documentation](http://www.robrowser.com/getting-started#API) or the code itself and submit a pull request!

## Contact

* [Discord](https://discord.gg/8JdHwM4Kqm)

Original branch:
* [Demo](http://demo.robrowser.com/)
* [roBrowser website](http://www.robrowser.com/)
* [roBrowser forum](http://forum.robrowser.com/)
* IRC Channel: *irc.rizon.net* / Channel: *#roBrowser*
