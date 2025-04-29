## ROBrowser Legacy
This is a continuation of [roBrowser](https://www.robrowser.com/) expanded with some features. This repo is not directly forked from the original repository due to safety concerns, but it is roBrowser.

If you wish to discuss anything related to this project, or you want to join, contact us on [Discord](https://discord.gg/8JdHwM4Kqm) or in the [GIT Discussions](https://github.com/MrAntares/roBrowserLegacy/discussions)

For info on how to setup the client read the contents of our [Getting Started doc](https://github.com/MrAntares/roBrowserLegacy/blob/master/doc/README.md). For the original branche's docs please visit the https://www.robrowser.com/ site.

All credits to the original owners/creators and the new ones.

## DEMO

[![Start!](https://github.com/MrAntares/roBrowserLegacy/raw/master/src/UI/Components/Intro/images/play.png "Start Demo")](https://mrantares.github.io/roBrowserLegacy/applications/browser-examples/demo.html)

_Use `<Username>_M` or `<Username>_F` to register a male or a female account on the login screen._

More live examples:
* [#robrowser-servers on Discord](https://discord.gg/MFtJj9n5Hr)
* [roBrowserLegacy Servers on Discussions](https://github.com/MrAntares/roBrowserLegacy/discussions/categories/robrowserlegacy-servers)

## Guide
Checkout the [getting started guide](doc/README.md)

## Remote Client
Remote Client serves game assets to roBrowser via http by extracting them from their GRFs. You will need to setup a remote client if you want to serve the game assets centrally from your server. roBrowser can use local game assets via the Intro screen by dragging them into the file box. The original implementation of the Remote Client is written in PHP:
- [roBrowserLegacy-RemoteClient-PHP](https://github.com/MrAntares/roBrowserLegacy-RemoteClient-PHP)

Other implementations may arise and when they do we will list them here:
- [roBrowserLegacy-RemoteClient-JS](https://github.com/FranciscoWallison/roBrowserLegacy-RemoteClient-JS)

## WebSocket Proxy
The game server uses TCP/IP to communicate with the client, while roBrowser being a web page can't use TCP/IP. We use the WebSocket API to communicate with a proxy server that translates the packets into TCP/IP packets. This server is called wsProxy. You will need to install and configure wsProxy to make roBrowser able to connect to a game server. For more info, please visit the [roBrowserLegacy-wsProxy](https://github.com/MrAntares/roBrowserLegacy-wsProxy) repository.

## Plugins
For available plugins and information on how to install them please visit the [roBrowserLegacy-plugins](https://github.com/MrAntares/roBrowserLegacy-plugins) repository.

## Contributing

roBrowser was started by this [awesome team](https://github.com/vthibault/roBrowser/graphs/contributors) and [we](https://github.com/MrAntares/roBrowserLegacy/graphs/contributors) continue it. We also manually add content from other forks that didn't made it back to the original branch, huge shoutout to them! If you wish to contribute then check out the [documentation](http://www.robrowser.com/getting-started#API) or the code itself and submit a pull request!

## Contact

* Join us on [Discord](https://discord.gg/8JdHwM4Kqm)
* Or in the [GIT Discussions](https://github.com/MrAntares/roBrowserLegacy/discussions)
