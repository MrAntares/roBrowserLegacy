# Getting started

## Local testing
This guide section help you running robrowser locally.
### Prerequisite
- install websocket proxy `npm install wsproxy -g`
- Run http server at root of Ragna.roBrowser directory (use any of [one liner http server](https://gist.github.com/willurd/5720255))
![](img/start-http-server.png)
- You own a full client

We assume in guide below http server to run on port `8000`.
### Compile files
- Access `http://localhost:8000/tools/build/index.html` with your browser
  ![](img/start-tools.png)
- click on "Online", compilation should takes around 10secs, if it run forever there might be an issue.
- click on "Thread"
- place `Online.js`and `ThreadEventHandler.js` files under Ragna.roBrowser `build/`directory

### Add game assets
- copy your `.grf` under `client/resources` directory
- copy your BGM `.mp3` under `client/BGM` directory
- copy your data directory under `client/data`directory
- copy your AI files under `AI` directory


In all `AI/*.lua` files :
- Replace all `require "AI\\Const"` with `dofile "./AI/Const.lua"`
- Replace all `require "AI\\Util"` with `dofile "./AI/Util.lua"`

### Configure ROBrowser
- edit `examples/api-online-frame.html` 
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
              version:     25,
              langtype:    12,
              packetver:   20191223,
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

### Start websocket proxy
- run `wsproxy -a 127.0.0.1:6900,127.0.0.1:6121,127.0.0.1:5121`
also don't forget to start your server

### Enjoy!
- Access to `http://localhost:8000/examples/api-online-frame.html` with your browser
- 
![](img/start-robrowser.png)


## Troubleshooting
### Screen is blank
Check that you don't have an extension using [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/message_event), it will conflict with code in `api.html` which listen for message.

I personally had to disable `metamask` extension.

### AI%5cConst.js(404 not found)
![](img/start-ai-error.png)

You have probably forgotten step about `AI` `require` replacement in `Add game assets` section