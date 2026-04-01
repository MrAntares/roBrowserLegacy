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

// Load dependencies
const fs = self.requireNode && self.requireNode('fs');

/**
 * FileManager namespace
 */
class FileManager {
	/**
	 * Where is the remote client located ?
	 * @var {string} http
	 */
	static remoteClient = '';

	/**
	 * List of Game Archives loads
	 * @var {array} GameFile[]
	 */
	static gameFiles = [];

	/**
	 * Files alias
	 * @var {object}
	 */
	static filesAlias = {};

	/**
	 * Initialize file manager with a list of files
	 *
	 * @param {mixed} grf list
	 */
	static init(grfList) {
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
			list.sort((a, b) => a.size - b.size);
		}

		// Load Game files
		for (i = 0, count = list.length; i < count; ++i) {
			this.addGameFile(list[i]);
		}
	}

	/**
	 * Add a game archive to the list
	 *
	 * @param {File} file to load
	 */
	static addGameFile(file) {
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
	}

	/**
	 * Clean up Game files
	 */
	static clean() {
		this.gameFiles.length = 0;
	}

	/**
	 * Search a file in each GameFile
	 *
	 * @param {RegExp} regex
	 * @return {Array} filename list
	 */
	static search(regex) {
		// Use hosted client (only one to be async ?)
		if (!this.gameFiles.length && this.remoteClient) {
			const req = new XMLHttpRequest();
			req.open('POST', this.remoteClient, false);
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.overrideMimeType('text/plain; charset=ISO-8859-1');
			req.send(`filter=${encodeURIComponent(regex.source)}`);
			return req.responseText.split('\n');
		}

		return Array.from(new Set(this.gameFiles.flatMap(file => file.table.data.match(regex) || [])));
	}

	/**
	 * Get a file
	 *
	 * @param {string} filename
	 * @param {function} callback
	 * @returns {Promise}
	 */
	static get(filename, callback) {
		return new Promise((resolve, reject) => {
			// Trim the path
			filename = filename.replace(/^\s+|\s+$/g, '');

			if (fs && fs.existsSync(filename)) {
				const buffer = fs.readFileSync(filename);
				if (callback) {
					callback(buffer);
				}
				resolve(buffer);
				return;
			}

			// Search in filesystem
			FileSystem.getFile(
				filename,

				// Found in file system, youhou !
				file => {
					const reader = new FileReader();
					reader.onloadend = event => {
						const buffer = event.target.result;
						if (callback) {
							callback(buffer);
						}
						resolve(buffer);
					};
					reader.readAsArrayBuffer(file);
				},

				// Not found, fetching files
				async () => {
					try {
						const path = filename.replace(/\//g, '\\');
						const fileList = this.gameFiles;
						const count = fileList.length;

						for (let i = 0; i < count; ++i) {
							const found = await new Promise(res => {
								if (fileList[i].getFile(path, res)) {
									return;
								}
								res(null);
							});

							if (found) {
								if (callback) {
									callback(found);
								}
								resolve(found);
								return;
							}
						}

						// Not in GRFs ? Try to load it from
						// remote client host
						const result = await this.getHTTP(filename, callback);
						resolve(result);
					} catch (e) {
						if (callback) {
							callback(null, e.message);
						}
						reject(e);
					}
				}
			);
		});
	}

	/**
	 * Trying to load a file from the remote host
	 *
	 * @param {string} filename
	 * @param {function} callback
	 * @returns {Promise}
	 */
	static async getHTTP(filename, callback) {
		const originalFilename = filename;

		// Ensure remoteClient has a trailing slash
		if (this.remoteClient && !this.remoteClient.endsWith('/')) {
			this.remoteClient += '/';
		}
		filename = filename.replace(/\\/g, '/');
		let url = filename.replace(/[^/]+/g, a => encodeURIComponent(a));

		// Use http request here
		if (!this.remoteClient) {
			url = `/client/${url}`;
		} else {
			url = this.remoteClient + url;
		}

		// Don't load mp3 sounds to avoid blocking the queue
		// They can be load by the HTML5 Audio
		if (filename.match(/\.(mp3|wav)$/)) {
			if (callback) {
				callback(url);
			}
			return url;
		}

		// Use Fetch API for better performance and HTTP/2 multiplexing support
		try {
			console.log(`[FileManager] Fetching: ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				console.error(`[FileManager] Fetch failed: ${url} (HTTP ${response.status})`);
				throw new Error(`HTTP ${response.status}`);
			}

			// Detect HTML error pages returned with 200 status
			const contentType = response.headers.get('content-type') || '';
			if (contentType.indexOf('text/html') !== -1) {
				throw new Error('Received HTML instead of binary data (likely 404 page)');
			}

			const buffer = await response.arrayBuffer();
			if (callback) {
				callback(buffer);
			}
			FileSystem.saveFile(originalFilename, buffer);
			return buffer;
		} catch (e) {
			if (callback) {
				callback(null, "Can't get file");
			}
			throw e;
		}
	}

	/**
	 * Batch file loading - groups requests within a frame and sends them as one
	 * Falls back to individual requests if batch endpoint is unavailable
	 */
	static _batchQueue = [];
	static _batchTimer = null;

	static getBatchHTTP(filename, callback) {
		return new Promise((resolve, reject) => {
			// Only batch when using remote client
			if (!this.remoteClient) {
				this.getHTTP(filename, callback).then(resolve).catch(reject);
				return;
			}

			this._batchQueue.push({
				filename: filename,
				callback: (res, err) => {
					if (callback) {
						callback(res, err);
					}
					if (err) {
						reject(new Error(err));
					} else {
						resolve(res);
					}
				}
			});

			if (!this._batchTimer) {
				this._batchTimer = setTimeout(async () => {
					const queue = this._batchQueue.splice(0);
					this._batchTimer = null;

					// Single file - no need to batch
					if (queue.length === 1) {
						try {
							const res = await this.getHTTP(queue[0].filename);
							queue[0].callback(res);
						} catch (e) {
							queue[0].callback(null, e.message);
						}
						return;
					}

					const files = queue.map(q => q.filename.replace(/\\/g, '/'));

					try {
						const response = await fetch(`${this.remoteClient}batch`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ files: files })
						});

						const results = await response.json();

						queue.forEach(q => {
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
					} catch (e) {
						// Fallback: load individually
						for (const q of queue) {
							try {
								const res = await this.getHTTP(q.filename);
								q.callback(res);
							} catch (err) {
								q.callback(null, err.message);
							}
						}
					}
				}, 16); // Wait 1 frame (~16ms) to group requests
			}
		});
	}

	/**
	 * Load a file
	 *
	 * @param {string} filename
	 * @param {function} callback
	 * @param {object} args
	 * @returns {Promise}
	 */
	static load(filename, callback, args) {
		return new Promise(async (resolve, reject) => {
			if (!filename) {
				if (callback) {
					callback(null, 'undefined ?');
				}
				reject(new Error('undefined ?'));
				return;
			}

			filename = filename.replace(/^\s+|\s+$/g, '');

			try {
				const buffer = await this.get(filename);
				const ext = filename.match(/.[^.]+$/)?.toString().substr(1).toLowerCase();
				let result = null;
				let error = null;

				if (!buffer || buffer.byteLength === 0) {
					if (callback) {
						callback(null, "Buffer is empty");
					}
					reject(new Error("Buffer is empty"));
					return;
				}

				try {
					switch (ext) {
						// Regular images files
						case 'jpg':
						case 'jpeg':
						case 'bmp':
						case 'gif':
						case 'png':
							result = URL.createObjectURL(new Blob([buffer], { type: `image/${ext}` }));
							break;

						// Audio
						case 'wav':
						case 'mp3':
						case 'ogg':
							// From GRF : change the data to an URI
							if (buffer instanceof ArrayBuffer) {
								result = URL.createObjectURL(new Blob([buffer], { type: `audio/${ext}` }));
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
						case 'spr': {
							const spr = new Sprite(buffer);
							if (args && args.to_rgba) {
								spr.switchToRGBA();
							}

							result = spr.compile();
							break;
						}
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

				if (callback) {
					callback(result, error);
				}
				if (error) {
					reject(new Error(error));
				} else {
					resolve(result);
				}
			} catch (e) {
				if (callback) {
					callback(null, e.message);
				}
				reject(e);
			}
		});
	}
}

export default FileManager;
