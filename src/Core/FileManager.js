/**
 * Core/FileManager.js
 *
 * Manage and load files
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import GameFile from 'Loaders/GameFile.js';
import World from 'Loaders/World.js';
import Ground from 'Loaders/Ground.js';
import Altitude from 'Loaders/Altitude.js';
import Model from 'Loaders/Model.js';
import Sprite from 'Loaders/Sprite.js';
import Action from 'Loaders/Action.js';
import Str from 'Loaders/Str.js';
import FileSystem from 'Core/FileSystem.js';
import TextEncoding from 'Utils/CodepageManager.js';

// Load dependencies
const fs = self.requireNode && self.requireNode('fs');

/**
 * FileManager namespace
 */
const FileManager = {};

/**
 * Where is the remote client located ?
 * @var {string} http
 */
FileManager.remoteClient = '';

/**
 * List of Game Archives loads
 * @var {array} GameFile[]
 */
FileManager.gameFiles = [];

/**
 * Files alias
 * @var {object}
 */
FileManager.filesAlias = {};

/**
 * Initialize file manager with a list of files
 *
 * @param {mixed} grf list
 */
FileManager.init = function Init(grfList) {
	let content, files, result, regex;
	let i,
		count,
		sortBySize = true;
	let list = [];

	// load GRFs from a file (DATA.INI)
	if (typeof grfList === 'string') {
		if (fs) {
			content = fs.readFileSync(grfList);
		} else if ((files = FileSystem.search(grfList)).length) {
			content = new FileReaderSync().readAsText(files[0]);
		} else {
			grfList = /\.grf$/i;
		}

		if (content) {
			regex = /(\d+)=([^\s]+)/g;

			// Get a list of GRF
			while ((result = regex.exec(content))) {
				list[parseInt(result[1])] = result[2];
			}

			// Remove empty slot from list
			for (i = 0, count = list.length; i < count; ) {
				if (list[i] === undefined) {
					list.splice(i, 1);
					count--;
					continue;
				}
				i++;
			}

			grfList = list;
			sortBySize = false;
		}
	}

	// Load grfs from a list defined by the user
	if (grfList instanceof Array) {
		list = grfList;
		for (i = 0, count = list.length; i < count; ++i) {
			if (fs && fs.existsSync(list[i])) {
				list[i] = {
					name: list[i],
					size: fs.statSync(list[i]).size,
					fd: fs.openSync(list[i], 'r')
				};
				continue;
			}
			list[i] = FileSystem.getFileSync(list[i]);
		}
	}

	// Search GRF from a regex
	if (grfList instanceof RegExp) {
		list = FileSystem.search(grfList);
	}

	if (sortBySize) {
		list.sort(function (a, b) {
			return a.size - b.size;
		});
	}

	// Load Game files
	for (i = 0, count = list.length; i < count; ++i) {
		FileManager.addGameFile(list[i]);
	}
};

/**
 * Add a game archive to the list
 *
 * @param {File} file to load
 */
FileManager.addGameFile = function AddGameFile(file) {
	try {
		const grf = new GameFile();
		grf.load(file);

		this.gameFiles.push(grf);

		if (this.onGameFileLoaded) {
			this.onGameFileLoaded(file.name);
		}
	} catch (e) {
		if (this.onGameFileError) {
			this.onGameFileError(file.name, e.message);
		}
	}
};

/**
 * Clean up Game files
 */
FileManager.clean = function Clean() {
	this.gameFiles.length = 0;
};

/**
 * Search a file in each GameFile
 *
 * @param {RegExp} regex
 * @return {Array} filename list
 */
FileManager.search = function Search(regex) {
	// Use hosted client (only one to be async ?)
	if (!this.gameFiles.length && this.remoteClient) {
		const req = new XMLHttpRequest();
		req.open('POST', this.remoteClient, false);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.overrideMimeType('text/plain; charset=ISO-8859-1');
		req.send('filter=' + encodeURIComponent(regex.source));
		return req.responseText.split('\n');
	}

	return Array.from(new Set(this.gameFiles.flatMap(file => file.table.data.match(regex) || [])));
};

/**
 * Get a file
 *
 * @param {string} filename
 * @param {function} callback
 */
FileManager.get = function Get(filename, callback) {
	// Trim the path
	filename = filename.replace(/^\s+|\s+$/g, '');

	if (fs && fs.existsSync(filename)) {
		callback(fs.readFileSync(filename));
		return;
	}

	// Search in filesystem
	FileSystem.getFile(
		filename,

		// Found in file system, youhou !
		function onFound(file) {
			const reader = new FileReader();
			reader.onloadend = function onLoad(event) {
				callback(event.target.result);
			};
			reader.readAsArrayBuffer(file);
		},

		// Not found, fetching files
		function onNotFound() {
			let i, count;
			let fileList;
			let path;

			path = filename.replace(/\//g, '\\');
			fileList = FileManager.gameFiles;
			count = fileList.length;

			for (i = 0; i < count; ++i) {
				if (fileList[i].getFile(path, callback)) {
					return;
				}
			}

			// Not in GRFs ? Try to load it from
			// remote client host
			FileManager.getHTTP(filename, callback);
		}
	);
};

/**
 * Trying to load a file from the remote host
 *
 * @param {string} filename
 * @param {function} callback
 */
FileManager.getHTTP = function GetHTTP(filename, callback) {
	filename = filename.replace(/\\/g, '/');
	let url = filename.replace(/[^/]+/g, function (a) {
		return encodeURIComponent(a);
	});

	// Use http request here
	if (!this.remoteClient) {
		url = '/client/' + url;
	} else {
		url = this.remoteClient + url;
	}

	// Don't load mp3 sounds to avoid blocking the queue
	// They can be load by the HTML5 Audio
	if (filename.match(/\.(mp3|wav)$/)) {
		callback(url);
		return;
	}

	// Use Fetch API for better performance and HTTP/2 multiplexing support
	if (typeof fetch !== 'undefined') {
		fetch(url)
			.then(function (response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status);
				}

				// Detect HTML error pages returned with 200 status
				const contentType = response.headers.get('content-type') || '';
				if (contentType.indexOf('text/html') !== -1) {
					throw new Error('Received HTML instead of binary data (likely 404 page)');
				}

				return response.arrayBuffer();
			})
			.then(function (buffer) {
				callback(buffer);
				FileSystem.saveFile(filename, buffer);
			})
			.catch(function () {
				callback(null, "Can't get file");
			});
		return;
	}

	// Fallback to XMLHttpRequest for older environments
	const xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function () {
		if (xhr.status == 200) {
			callback(xhr.response);
			FileSystem.saveFile(filename, xhr.response);
		} else {
			callback(null, "Can't get file");
		}
	};
	xhr.onerror = function () {
		callback(null, "Can't get file");
	};

	// Can throw an error if not connected to internet
	try {
		xhr.send(null);
	} catch (e) {
		callback(null, "Can't get file");
	}
};

/**
 * Batch file loading - groups requests within a frame and sends them as one
 * Falls back to individual requests if batch endpoint is unavailable
 */
const _batchQueue = [];
let _batchTimer = null;

FileManager.getBatchHTTP = function GetBatchHTTP(filename, callback) {
	// Only batch when using remote client
	if (!this.remoteClient) {
		this.getHTTP(filename, callback);
		return;
	}

	_batchQueue.push({ filename: filename, callback: callback });

	if (!_batchTimer) {
		const self = this;
		_batchTimer = setTimeout(function () {
			const queue = _batchQueue.splice(0);
			_batchTimer = null;

			// Single file - no need to batch
			if (queue.length === 1) {
				self.getHTTP(queue[0].filename, queue[0].callback);
				return;
			}

			const files = queue.map(function (q) {
				return q.filename.replace(/\\/g, '/');
			});

			fetch(self.remoteClient + 'batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ files: files })
			})
				.then(function (r) {
					return r.json();
				})
				.then(function (results) {
					queue.forEach(function (q) {
						const key = q.filename.replace(/\\/g, '/');
						if (results[key]) {
							const binary = atob(results[key]);
							const buffer = new ArrayBuffer(binary.length);
							const view = new Uint8Array(buffer);
							for (let i = 0; i < binary.length; i++) {
								view[i] = binary.charCodeAt(i);
							}
							q.callback(buffer);
							FileSystem.saveFile(q.filename, buffer);
						} else {
							q.callback(null, "Can't get file");
						}
					});
				})
				.catch(function () {
					// Fallback: load individually
					queue.forEach(function (q) {
						self.getHTTP(q.filename, q.callback);
					});
				});
		}, 16); // Wait 1 frame (~16ms) to group requests
	}
};

/**
 * Load a file
 *
 * @param {string} filename
 * @param {function} callback
 * @return {string|object}
 */
FileManager.load = function Load(filename, callback, args) {
	if (!filename) {
		callback(null, 'undefined ?');
		return;
	}

	filename = filename.replace(/^\s+|\s+$/g, '');

	this.get(filename, function (buffer, error) {
		const ext = filename
			.match(/.[^.]+$/)
			.toString()
			.substr(1)
			.toLowerCase();
		let result = null;

		if (!buffer || buffer.byteLength === 0) {
			callback(null, error);
			return;
		}

		error = null;

		try {
			switch (ext) {
				// Regular images files
				case 'jpg':
				case 'jpeg':
				case 'bmp':
				case 'gif':
				case 'png':
					result = URL.createObjectURL(new Blob([buffer], { type: 'image/' + ext }));
					break;

				// Audio
				case 'wav':
				case 'mp3':
				case 'ogg':
					// From GRF : change the data to an URI
					if (buffer instanceof ArrayBuffer) {
						result = URL.createObjectURL(new Blob([buffer], { type: 'audio/' + ext }));
						break;
					}
					result = buffer;
					break;

				case 'tga':
					result = buffer;
					break;

				// Texts
				case 'xml':
				case 'txt':
				case 'lua':
				case 'lub':
				case 'csv':
					result = new Uint8Array(buffer);
					break;

				// Sprite
				case 'spr':
					const spr = new Sprite(buffer);
					if (args && args.to_rgba) {
						spr.switchToRGBA();
					}

					result = spr.compile();
					break;

				// Binary
				case 'rsw':
					result = new World(buffer);
					break;

				case 'gnd':
					result = new Ground(buffer);
					break;

				case 'gat':
					result = new Altitude(buffer);
					break;

				case 'rsm':
				case 'rsm2':
					result = new Model(buffer);
					break;

				case 'act':
					result = new Action(buffer).compile();
					break;

				case 'str':
					result = new Str(buffer, args?.texturePath ?? '');
					break;

				default:
					result = buffer;
					break;
			}
		} catch (e) {
			error = e.message;
		}

		callback(result, error);
	});
};

/**
 * Export
 */
export default FileManager;
