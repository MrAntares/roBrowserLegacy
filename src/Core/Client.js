/**
 * Core/Client.js
 *
 * Client Manager
 * Manage client files, load GRFs, DATA.INI, extract files from GRFs, ...
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

// Load dependencies
import Executable from 'Utils/Executable.js';
import Configs from './Configs.js';
import Thread from './Thread.js';
import Memory from './MemoryManager.js';
import PACKETVER from 'Network/PacketVerManager.js';

class Client {
	/**
	 * Initialize Client
	 * Load interesting files (executable, data.ini, GRFs, ...)
	 *
	 * @param {Array} FileList to load
	 */
	static init(files) {
		let i, count;
		const packetver = Configs.get('packetver');
		const remoteClient = Configs.get('remoteClient');

		function OnDate(date) {
			// Avoid errors
			if (date > 20000000) {
				PACKETVER.value = date;
			}
		}

		// Find executable and set the packetver
		if (!packetver || String(packetver).match(/^executable$/i)) {
			for (i = 0, count = files.length; i < count; ++i) {
				if (Executable.isROExec(files[i])) {
					Executable.getDate(files[i], OnDate);
					break;
				}
			}
		} else if (typeof packetver === 'number') {
			PACKETVER.value = packetver;
		}

		// GRF Host config
		if (remoteClient) {
			Thread.send('SET_HOST', remoteClient);
		}

		// Save full client
		savingFiles(files);
	}

	/**
	 * Get a file from Game Data files
	 *
	 * @param {string} filename
	 * @param {function} onload
	 * @param {function} onerror
	 * @param {Array} args - optional
	 */
	static getFile = (function getFilClosure() {
		const _input = { filename: '', args: null };

		function callback(data, error, input) {
			Memory.set(input.filename, data, error);
		}

		return function (filename, onload, onerror, args) {
			if (!Memory.exist(filename)) {
				_input.filename = filename;
				_input.args = args || null;

				Thread.send('GET_FILE', _input, callback);
			}

			return Memory.get(filename, onload, onerror);
		};
	})();

	/**
	 * Get files from Game Data files
	 *
	 * @param {string[]} filenames
	 * @param {function} callback once loaded
	 */
	static getFiles(filenames, callback) {
		let index;
		const count = filenames.length;
		const out = new Array(count);

		function onload(data) {
			out[index++] = data;

			if (index === count) {
				if (callback) {
					callback.apply(null, out);
				}
				return;
			}

			Client.getFile(filenames[index], onload);
		}

		index = 0;

		Client.getFile(filenames[index], onload);
	}

	/**
	 * Get and load a file from Game Data files
	 *
	 * @param {string} filename
	 * @param {function} onload
	 * @param {function} onerror
	 * @param {Array} args - optional
	 */
	static loadFile = (function loadFileClosure() {
		const _input = { filename: '', args: null };

		function callback(data, error, input) {
			Memory.set(input.filename, data, error);
		}

		return (filename, onload, onerror, args = {}) => {
			if (!Memory.exist(filename)) {
				_input.filename = filename;
				_input.args = args || null;

				Thread.send('LOAD_FILE', _input, callback);
			}

			return Memory.get(filename, onload, onerror);
		};
	})();

	/**
	 * Get and load files from Game Data files
	 *
	 * @param {string[]} filenames
	 * @param {function} callback once loaded
	 */
	static loadFiles(filenames, callback) {
		let index;
		const count = filenames.length;
		const out = new Array(count);

		function onload(data) {
			out[index++] = data;

			if (index === count) {
				if (callback) {
					callback.apply(null, out);
				}
				return;
			}

			Client.loadFile(filenames[index], onload);
		}

		index = 0;

		Client.loadFile(filenames[index], onload);
	}

	/**
	 * Apply a regex on fileList to search a file
	 *
	 * @param regex
	 * @param callback
	 */
	static search(regex, callback) {
		Thread.send('SEARCH_FILE', regex, callback);
	}

	static onFilesLoaded = () => {};
}

/**
 * Saving fullclient files in filesystem, display a progressbar during the upload
 *
 * @param {Array} FileList
 */
function savingFiles(files) {
	const progressbar = document.createElement('div');
	const info = document.createElement('div');
	let last_tick = Date.now();
	const list = [];
	let i, count;

	if (files.length) {
		// Progressbar
		progressbar.style.position = 'fixed';
		progressbar.style.zIndex = '2147483647';
		progressbar.style.top = '0px';
		progressbar.style.left = '0px';
		progressbar.style.backgroundColor = 'rgb(180,0,0)';
		progressbar.style.transition = 'width 500ms linear';
		progressbar.style.width = '0px';
		progressbar.style.height = '3px';
		progressbar.onmouseover = function () {
			info.style.display = 'block';
		};
		progressbar.onmouseout = function () {
			info.style.display = 'none';
		};

		// Progress text on hover 'Saving fullclient... (x%)'
		info.textContent = 'Saving fullclient... (0.00 %)';
		info.style.position = 'absolute';
		info.style.left = '20px';
		info.style.top = '0px';
		info.style.whiteSpace = 'nowrap';
		info.style.zIndex = '2147483646';
		info.style.height = '12px';
		info.style.padding = '5px';
		info.style.background = 'linear-gradient( rgb(180,0,0), rgb(136,0,0) 30%)';
		info.style.color = 'white';
		info.style.textShadow = '1px 1px black';
		info.style.borderBottomLeftRadius = '5px';
		info.style.borderBottomRightRadius = '5px';
		info.style.textAlign = 'center';
		info.style.width = '160px';
		info.style.display = 'none';

		document.body.appendChild(progressbar);
		document.body.appendChild(info);

		// Get progress on saving the client
		Thread.hook('CLIENT_SAVE_PROGRESS', data => {
			const now = Date.now();
			if (last_tick + 400 < now) {
				progressbar.style.width = data.total.perc + '%';
				info.textContent = 'Saving fullclient... (' + data.total.perc + ' %)';
				last_tick = now;
			}
		});

		Thread.hook('CLIENT_SAVE_COMPLETE', () => {
			if (progressbar.parentNode) {
				document.body.removeChild(progressbar);
			}
			if (info.parentNode) {
				document.body.removeChild(info);
			}
		});

		// Seems like files property are reset when sent to another thread
		for (i = 0, count = files.length; i < count; ++i) {
			list.push({
				file: files[i],
				path: files[i].fullPath || files[i].relativePath || files[i].webkitRelativePath || files[i].name
			});
		}
	}

	// Get temporary storage info at main thread, the worker can't access it.
	// https://github.com/vthibault/roBrowser/issues/110
	const temporaryStorage = navigator.temporaryStorage ||
		navigator.webkitTemporaryStorage || {
			queryUsageAndQuota: function (callback) {
				callback(0, 0);
			}
		};

	temporaryStorage.queryUsageAndQuota((used, remaining) => {
		const quota = {
			used: used,
			remaining: remaining
		};

		// Initialize client files (load GRF, etc).
		Thread.send(
			'CLIENT_INIT',
			{
				files: list,
				grfList: Configs.get('grfList') || 'DATA.INI',
				save: !!Configs.get('saveFiles'),
				quota: quota
			},
			Client.onFilesLoaded
		);
	});
}

/**
 * Export
 */
export default {
	init: Client.init,
	getFile: Client.getFile,
	getFiles: Client.getFiles,
	loadFile: Client.loadFile,
	loadFiles: Client.loadFiles,
	search: Client.search,
	onFilesLoaded: Client.onFilesLoaded
};
