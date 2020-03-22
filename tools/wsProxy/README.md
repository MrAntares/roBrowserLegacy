wsProxy
=======
[![Build Status](https://travis-ci.org/herenow/wsProxy.svg?branch=master)](https://travis-ci.org/herenow/wsProxy)

This is a websocket to tcp proxy, written in node.js. It is dynamic and will proxy to various tcp servers.


Installation
----------
```
npm install wsproxy -g
```


Usage
----------

```
wsproxy [-p PORT] [-t THREADS (# of threads to spawn)] [-s ENABLE_SSL] [-k KEY_FILE] [-c CERT_FILE]
```
* `-p` Port to bind wsProxy to
	* If no `port` is specified it will default to `process.env.PORT` or port 5999.
* `-a` List of allowed servers to proxy to
	* By default wsProxy will proxy to any ip:port, this is a major risk, since malicous users may use your
	wsProxy server for illegal activity, or any other use other then connecting to your athena server.
	* The list of IP:PORT's should be separate by comma! Ex:
	```bash
	wsproxy -a 127.0.0.1:6900,127.0.0.1:6121,127.0.0.1:5121
	```
	* Note: Use the same IP's you configured your server address at ROConfig at roBrowser.
* `-t` Number of cpu cores that wsProxy should use
* `-s` Enable SSL
	* `-k` Path to ssl key file
	* `-c` Path to ssl cert file
* Use `wsproxy --help` for a list of available commands.


Client usage
----------
When connecting to this websocket you will give it an IP:PORT uri, for example:
```
ws://websocket.example.com:5999/127.0.0.1:6900
```
* You can edit allowed.js to only allow proxy to certain IP:PORT
	* Note: if you pass in the `-a` or `--allow` option when starting the `wsproxy` this file will be ignored.
* We will soon release a version, with better standards for this.


Writing modules for wsProxy guidelines
------------
* Simply require and extend current files from the `/src` folder, once done, require them on wsProxy `/index.js`.
* ***BE CAREFUL, MODULES NEED TO BE LIGHTWEIGHT, LIMIT YOURSELF TO SIMPLE I/O OPERATIONS, DON'T BLOCK, AND CREATE LITTLE GARBAGE!*** 
* Don't forget that node.js is single threaded, cpu intensive blocks of code will block the entire proxy!
* Don't create to much garbage, or the garbage collector will also block for extended periods of time, thus creating "lag" for the users.


Authors
---------
This was created for and by the roBrowser project.
- [vthibault](https://github.com/vthibault)
- [herenow](https://github.com/herenow)


Thank you
----------
- Einaros/ws for providing the websocket middleware
