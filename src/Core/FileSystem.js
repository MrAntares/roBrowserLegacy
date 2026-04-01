/**
 * Core/FileSystem.js
 *
 * File System
 * Manage the client files (saving it)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class FileSystem
 * @description Manages client-side file persistence using the FileSystem API.
 */
class FileSystem {
	static #files = [];
	static #clientSize = 0;
	static #streamOffset = 0;
	static #events = {};
	static #fsSync = null;
	static #fs = null;
	static #available = !!(self.requestFileSystemSync || self.webkitRequestFileSystemSync);
	static #save = false;

	/**
	 * Initialize FileSystem API
	 *
	 * @param {Array} files
	 * @param {boolean} save files
	 * @param {Object} quota information
	 */
	static init(files, save, quota) {
		this.#files = this.#normalizeFilesPath(files);

		if (!this.#available) {
			this.#trigger('onready');
			return;
		}

		this.#calculateClientSize();

		const requestFileSystemSync = self.requestFileSystemSync || self.webkitRequestFileSystemSync;
		const requestFileSystem = self.requestFileSystem || self.webkitRequestFileSystem;

		const size = this.#clientSize || quota.used || quota.remaining;

		requestFileSystem(
			self.TEMPORARY,
			size,
			(fs) => {
				this.#fs = fs;
				this.#fsSync = requestFileSystemSync(self.TEMPORARY, size);

				if (save && this.#files.length) {
					this.cleanup();
					this.#buildHierarchy();
					this.#processUpload(0);
				}

				this.#save = save;
				this.#trigger('onready');
			},
			this.#errorHandler.bind(this)
		);
	}

	/**
	 * Normalize file path
	 *
	 * @param {Array} files
	 * @returns {Array} normalized filelist
	 */
	static #normalizeFilesPath(files) {
		const backslash = /\\\\/g;
		return files.map(item => {
			const file = item.file;
			file._path = item.path.replace(backslash, '/');
			return file;
		});
	}

	/**
	 * Error Handler give a human error
	 */
	static #errorHandler(e) {
		let msg = '';
		const FileError = {
			QUOTA_EXCEEDED_ERR: 22,
			NOT_FOUND_ERR: 1,
			SECURITY_ERR: 2,
			INVALID_MODIFICATION_ERR: 9,
			INVALID_STATE_ERR: 7
		};

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR: msg = 'QUOTA_EXCEEDED_ERR'; break;
			case FileError.NOT_FOUND_ERR: msg = 'NOT_FOUND_ERR'; break;
			case FileError.SECURITY_ERR: msg = 'SECURITY_ERR'; break;
			case FileError.INVALID_MODIFICATION_ERR: msg = 'INVALID_MODIFICATION_ERR'; break;
			case FileError.INVALID_STATE_ERR: msg = 'INVALID_STATE_ERR'; break;
			default: msg = 'Unknown Error'; break;
		}

		this.#trigger('onerror', msg);
	}

	/**
	 * Calculate FullClient total size
	 * @returns {number}
	 */
	static #calculateClientSize() {
		this.#clientSize = this.#files.reduce((total, file) => total + (file.size || 0), 0);
	}

	/**
	 * Start to upload files to FileSystem (async !)
	 *
	 * @param {number} index
	 */
	static #processUpload(index) {
		const file = this.#files[index];

		// Finished.
		if (index >= this.#files.length) {
			const tmpDir = this.#fsSync.root.getDirectory('/__tmp_upload/', {});
			const dirReader = tmpDir.createReader();
			const entries = dirReader.readEntries();

			entries.forEach(entry => entry.moveTo(this.#fsSync.root, entry.name));
			tmpDir.removeRecursively();
			this.#files.length = 0;

			this.#trigger('onuploaded');
			return;
		}

		if (file.name[0] === '.') {
			this.#files.splice(index, 1);
			this.#processUpload(index);
			return;
		}

		this.#fs.root.getFile(
			'/__tmp_upload/' + file._path,
			{ create: true },
			(fileEntry) => {
				fileEntry.createWriter((writer) => {
					writer.onerror = this.#errorHandler.bind(this);
					writer.onwriteend = () => {
						this.#streamOffset += file.size;
						this.#processUpload(index + 1);
					};

					let last_tick = Date.now();
					writer.onprogress = (evt) => {
						const now = Date.now();
						if (last_tick + 100 > now) {
							return;
						}

						last_tick = now;
						this.#trigger('onprogress', {
							filename: file.name,
							filePath: file._path,
							file: {
								total: evt.total,
								loaded: evt.loaded,
								perc: ((evt.loaded / evt.total) * 100).toFixed(2)
							},
							total: {
								total: this.#clientSize,
								loaded: this.#streamOffset + evt.loaded,
								perc: (((this.#streamOffset + evt.loaded) / this.#clientSize) * 100).toFixed(2)
							}
						});
					};

					writer.write(file);
				});
			},
			this.#errorHandler.bind(this)
		);
	}

	/**
	 * Build directory hierarchy
	 */
	static #buildHierarchy() {
		const cache = {};
		const filenameRegex = /\/?[^/]+$/;

		this.#files.forEach(file => {
			let path = file._path.split('/').slice(0, -1).join('/');
			while (!(path in cache) && path.length) {
				cache[path] = true;
				path = path.replace(filenameRegex, '');
			}
		});

		const keys = Object.keys(cache).sort();
		this.#fsSync.root.getDirectory('/__tmp_upload/', { create: true });

		keys.forEach(key => {
			this.#fsSync.root.getDirectory('/__tmp_upload/' + key, { create: true });
		});
	}

	/**
	 * Remove all files from FileSystem
	 */
	static cleanup() {
		const dirReader = this.#fsSync.root.createReader();
		const entries = dirReader.readEntries();

		const removeWithRetry = (entry, callback, retryCount = 0) => {
			try {
				if (entry.isDirectory) {
					entry.removeRecursively(callback, callback);
				} else {
					entry.remove(callback, callback);
				}
			} catch (e) {
				if (retryCount < 3 && e.name === 'InvalidModificationError') {
					setTimeout(() => removeWithRetry(entry, callback, retryCount + 1), 100);
				} else {
					callback(e);
				}
			}
		};

		entries.forEach(entry => {
			removeWithRetry(entry, (error) => {
				if (error) {
					console.warn('Failed to remove entry:', error);
				}
			});
		});
	}

	/**
	 * Trigger an event
	 *
	 * @param {string} eventname
	 * @param {...*} args
	 */
	static #trigger(eventname, ...args) {
		if (this.#events[eventname]) {
			this.#events[eventname](...args);
		}
	}

	/**
	 * Bind an event
	 *
	 * @param {string} eventname
	 * @param {Function} callback
	 */
	static bind(eventname, callback) {
		this.#events[eventname] = callback;
	}

	/**
	 * Get a file in FileSystem (sync)
	 *
	 * @param {string} filename
	 * @returns {File|null}
	 */
	static getFileSync(filename) {
		filename = filename.replace(/\\/g, '/');

		if (!this.#available || this.#files.length) {
			const file = this.#files.find(f => f._path.toLowerCase() === filename.toLowerCase());
			return file || null;
		}

		try {
			const fileEntry = this.#fsSync.root.getFile(filename, { create: false });
			return fileEntry.isFile ? fileEntry.file() : null;
		} catch (e) {
			return null;
		}
	}

	/**
	 * Get a file in FileSystem (async)
	 *
	 * @param {string} filename
	 * @param {Function} onload
	 * @param {Function} onerror
	 */
	static getFile(filename, onload, onerror) {
		filename = filename.replace(/\\/g, '/');

		if (!this.#available || this.#files.length) {
			const file = this.#files.find(f => f._path.toLowerCase() === filename.toLowerCase());
			if (file) {
				onload(file);
			} else {
				onerror();
			}
			return;
		}

		this.#fs.root.getFile(
			filename,
			{ create: false },
			(fileEntry) => {
				if (fileEntry.isFile) {
					fileEntry.file(onload);
				} else {
					onerror();
				}
			},
			onerror
		);
	}

	/**
	 * Save the content of a files in file system
	 * (used to save the remote client)
	 *
	 * @param {string} filePath
	 * @param {ArrayBuffer} buffer
	 */
	static saveFile(filePath, buffer) {
		if (!this.#save || !this.#available) {
			return;
		}

		const filename = filePath.replace(/\\/g, '/');
		const directories = filename.split('/').slice(0, -1);
		let path = '';

		while (directories.length) {
			path += directories.shift() + '/';
			this.#fsSync.root.getDirectory(path, { create: true });
		}

		const fileEntry = this.#fsSync.root.getFile(filename, { create: true });
		const writer = fileEntry.createWriter();
		writer.write(new Blob([buffer]));
	}

	/**
	 * Search a file from FileSystem using a regex
	 *
	 * @param {RegExp|string} regex to match the filename
	 * @returns {Array} List of files
	 */
	static search(regex) {
		if (!(regex instanceof RegExp)) {
			regex = new RegExp('^' + regex.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1') + '$', 'i');
		}

		if (!this.#available || this.#files.length) {
			return this.#files.filter(file => file.name.match(regex));
		}

		const entries = this.#fsSync.root.createReader().readEntries();
		return entries
			.filter(entry => entry.isFile && entry.name.match(regex))
			.map(entry => entry.file());
	}
}

export default FileSystem;
