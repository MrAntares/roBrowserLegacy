## RONW
RONW is forked from [roBrowserLegacy](https://github.com/MrAntares/Ragna.roBrowser) but we focus on putting it in NW.js to make it run standalone as the original did.

## How to run it?
* You have to download the release.
* Copy the data.grf,rdata.grf,BGM,System folders to the root of RONW
* edit the main.js
* start RONW.exe
### We are recommended you to use [ROenglishRE](https://github.com/llchrisll/ROenglishRE) (make a new grf file and add the new one in main.js)

## Why did we choose NW.js?
The benefit of using NW.js is you can compile the source code to v8 Snapshot. That means you can protect your source code. You don't need to run the web server for this version because it will read directly from the Grf files, which means the speed of loading.

## Developer
* If you want to run from the latest code you can clone the project by the command below. (need to install git)
* run `git clone https://github.com/MrUnzO/RONW.git` to clone the project.
* run `npm install`
* there are 4 commands you can use.
* `npm run dev` to run RONW from the `src` folder.
* `npm run build` to build the source code into a single file and also create the necessary files into `./dist` folder.
* `npm run prod` to run RONW from the `./dist/` folder but you have to build it with the command above first.
* `npm run release` to build the complete RONW into the folder release. (need to run the `npm run build` to build the project first.)

## RONW Discord
* [RONW Discord](https://discord.gg/CE2HEhPamT)


All credits to the original owners/creators and the new ones.

## Plugins
For available plugins and information on how to install them please visit the [roBrowserLegacy-plugins](https://github.com/MrAntares/roBrowserLegacy-plugins) repository.

## Contributing

roBrowser was started by this [awesome team](https://github.com/vthibault/roBrowser/graphs/contributors) and [we](https://github.com/MrAntares/roBrowserLegacy/graphs/contributors) continue it. We also manually add content from other forks that didn't made it back to the original branch, huge shoutout to them! If you wish to contribute then check out the [documentation](http://www.robrowser.com/getting-started#API) or the code itself and submit a pull request!

Original branch:
* [roBrowserLegacy](https://github.com/MrAntares/roBrowserLegacy/)
* [Demo](http://demo.robrowser.com/)
* [roBrowser website](http://www.robrowser.com/)
* [roBrowser forum](http://forum.robrowser.com/)
* IRC Channel: *irc.rizon.net* / Channel: *#roBrowser*
