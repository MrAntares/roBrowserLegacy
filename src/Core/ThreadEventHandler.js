/**
 * Core/ThreadEventHandler.js
 *
 * Handler data received from Main Thread and process.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import FileManager from 'Core/FileManager.js';
import FileSystem from 'Core/FileSystem.js';
import MapLoader from 'Loaders/MapLoader.js';

/**
 * @class ThreadEventHandler
 * @description Handles messages received in the Web Worker from the Main Thread.
 */
class ThreadEventHandler {
	/**
	 * Initialize the worker event listener
	 */
	static init() {
		self.onmessage = (e) => this.receive(e);
		postMessage({ type: 'THREAD_READY' });
	}

	/**
	 * Send an Error to main thread
	 *
	 * @param {...any} args
	 */
	static sendError(...args) {
		postMessage({ type: 'THREAD_ERROR', data: args });
	}

	/**
	 * Send a message log to main thread
	 *
	 * @param {...any} args
	 */
	static sendLog(...args) {
		postMessage({ type: 'THREAD_LOG', data: args });
	}

	/**
	 * Receiving data, process action
	 *
	 * @param {MessageEvent} event
	 */
	static async receive(event) {
		const msg = event.data;

		switch (msg.type) {
			// Modify client host
			case 'SET_HOST':
				if (typeof msg.data === 'string' && !msg.data.endsWith('/')) {
					msg.data += '/';
				}
				FileManager.remoteClient = msg.data;
				break;

			// Save full client and use it
			case 'CLIENT_INIT':
				FileSystem.bind('onprogress', (progress) => {
					postMessage({ type: 'CLIENT_SAVE_PROGRESS', data: progress });
				});

				// full client saved !
				FileSystem.bind('onuploaded', () => {
					postMessage({ type: 'CLIENT_SAVE_COMPLETE' });
				});

				FileManager.onGameFileLoaded = (filename) => {
					this.sendLog(`Success to load GRF file "${filename}"`);
				};

				FileManager.onGameFileError = (filename, error) => {
					this.sendError(`Error loading GRF file "${filename}" : ${error}`);
				};

				// Start loading GRFs files
				FileSystem.bind('onready', () => {
					FileManager.clean();
					FileManager.init(msg.data.grfList);

					postMessage({
						uid: msg.uid,
						arguments: [FileManager.gameFiles.length, null, msg.data],
					});
				});

				// Saving full client
				FileSystem.init(msg.data.files, msg.data.save, msg.data.quota);
				break;

			// Files alias
			case 'CLIENT_FILES_ALIAS':
				FileManager.filesAlias = msg.data;
				break;

			// Get a file from client/grf
			case 'GET_FILE':
				try {
					const result = await FileManager.get(msg.data.filename);
					if (msg.uid) {
						postMessage({
							uid: msg.uid,
							arguments: [result, null, msg.data],
						});
					}
				} catch (error) {
					const errorMsg = `[Thread] ${error.message} (${msg.data.filename})`;
					this.sendError(errorMsg);
					if (msg.uid) {
						postMessage({
							uid: msg.uid,
							arguments: [null, error.message, msg.data],
						});
					}
				}
				break;

			// Get and load a file from client/grf
			case 'LOAD_FILE':
				try {
					const result = await FileManager.load(msg.data.filename, null, msg.data.args);
					if (msg.uid) {
						postMessage({
							uid: msg.uid,
							arguments: [result, null, msg.data],
						});
					}
				} catch (error) {
					const errorMsg = `[Thread] ${error.message} (${msg.data.filename})`;
					this.sendError(errorMsg);
					if (msg.uid) {
						postMessage({
							uid: msg.uid,
							arguments: [null, error.message, msg.data],
						});
					}
				}
				break;

			// Search a file in Client
			case 'SEARCH_FILE':
				if (msg.uid) {
					postMessage({
						uid: msg.uid,
						arguments: [FileManager.search(msg.data), null, msg.data],
					});
				}
				break;

			// Start loading a map
			case 'LOAD_MAP': {
				const map = new MapLoader();

				map.onprogress = (progress) => {
					postMessage({ type: 'MAP_PROGRESS', data: progress });
				};

				map.onload = (success, error) => {
					if (msg.uid) {
						postMessage({
							uid: msg.uid,
							arguments: [success, error, msg.data],
						});
					}
				};

				map.ondata = (type, data) => {
					postMessage({ type: type, data: data });
				};

				await map.load(msg.data);
				break;
			}
		}
	}
}

// Start the handler
ThreadEventHandler.init();

export default ThreadEventHandler;
