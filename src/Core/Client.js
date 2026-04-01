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

import Executable from 'Utils/Executable.js';
import Texture from 'Utils/Texture.js';
import WebGL from 'Utils/WebGL.js';
import Configs from './Configs.js';
import Thread from './Thread.js';
import Memory from './MemoryManager.js';
import PACKETVER from 'Network/PacketVerManager.js';
import GraphicsSettings from 'Preferences/Graphics.js';

/**
 * @class Client
 * @description Central manager for client assets, GRF interaction, and GPU resource preparation.
 */
class Client {
	static #fileInput = { filename: '', args: null };
	static #loadInput = { filename: '', args: null };

	/**
	 * Initialize Client
	 * Load interesting files (executable, data.ini, GRFs, ...)
	 * @param {File[]} files
	 */
	static init(files) {
		const packetver = Configs.get('packetver');
		const remoteClient = Configs.get('remoteClient');

		const onDate = (date) => {
			if (date > 20000000) {
				PACKETVER.value = date;
			}
		};

		// Find executable and set the packetver
		if (!packetver || String(packetver).match(/^executable$/i)) {
			const executable = files.find(f => Executable.isROExec(f));
			if (executable) {
				Executable.getDate(executable, onDate);
			}
		} else if (typeof packetver === 'number') {
			PACKETVER.value = packetver;
		}

		// GRF Host config
		if (remoteClient) {
			Thread.send('SET_HOST', remoteClient);
		}

		// Save full client
		this.#savingFiles(files);
	}

	/**
	 * Saving fullclient files in filesystem, display a progressbar during the upload
	 * @param {File[]} files
	 */
	static #savingFiles(files) {
		const list = files.map(file => ({
			file,
			path: file.fullPath || file.relativePath || file.webkitRelativePath || file.name
		}));

		if (list.length) {
			const progressbar = document.createElement('div');
			const info = document.createElement('div');
			let lastTick = Date.now();

			// Progressbar styling
			Object.assign(progressbar.style, {
				position: 'fixed',
				zIndex: '2147483647',
				top: '0px',
				left: '0px',
				backgroundColor: 'rgb(180,0,0)',
				transition: 'width 500ms linear',
				width: '0px',
				height: '3px'
			});

			progressbar.onmouseover = () => { info.style.display = 'block'; };
			progressbar.onmouseout = () => { info.style.display = 'none'; };

			// Progress text styling
			info.textContent = 'Saving fullclient... (0.00 %)';
			Object.assign(info.style, {
				position: 'absolute',
				left: '20px',
				top: '0px',
				whiteSpace: 'nowrap',
				zIndex: '2147483646',
				height: '12px',
				padding: '5px',
				background: 'linear-gradient( rgb(180,0,0), rgb(136,0,0) 30%)',
				color: 'white',
				textShadow: '1px 1px black',
				borderRadius: '0 0 5px 5px',
				textAlign: 'center',
				width: '160px',
				display: 'none'
			});

			document.body.appendChild(progressbar);
			document.body.appendChild(info);

			// Get progress on saving the client
			Thread.hook('CLIENT_SAVE_PROGRESS', (data) => {
				const now = Date.now();
				if (lastTick + 400 < now) {
					const perc = data.total.perc;
					progressbar.style.width = `${perc}%`;
					info.textContent = `Saving fullclient... (${perc} %)`;
					lastTick = now;
				}
			});

			Thread.hook('CLIENT_SAVE_COMPLETE', () => {
				progressbar.remove();
				info.remove();
			});
		}

		// Get temporary storage info
		const temporaryStorage = navigator.temporaryStorage || navigator.webkitTemporaryStorage || {
			queryUsageAndQuota: (cb) => cb(0, 0)
		};

		temporaryStorage.queryUsageAndQuota((used, remaining) => {
			Thread.send('CLIENT_INIT', {
				files: list,
				grfList: Configs.get('grfList') || 'DATA.INI',
				save: !!Configs.get('saveFiles'),
				quota: { used: used, remaining: remaining }
			}, (count) => {
				this.onFilesLoaded(count);
			});
		});
	}

	/**
	 * Get a file from Game Data files
	 * @param {string} filename
	 * @param {function} onload
	 * @param {function} onerror
	 * @param {Array} [args]
	 */
	static getFile(filename, onload, onerror, args = null) {
		if (!Memory.exist(filename)) {
			this.#fileInput.filename = filename;
			this.#fileInput.args = args;

			Thread.send('GET_FILE', this.#fileInput, (data, error, input) => {
				Memory.set(input.filename, data, error);
			});
		}

		return Memory.get(filename, onload, onerror);
	}

	/**
	 * Get multiple files
	 * @param {string[]} filenames
	 * @param {function} callback
	 */
	static getFiles(filenames, callback) {
		const count = filenames.length;
		const out = new Array(count);
		let index = 0;

		const next = () => {
			this.getFile(filenames[index], (data) => {
				out[index++] = data;
				if (index === count) {
					if (callback) {callback(...out);}
				} else {
					next();
				}
			});
		};

		if (count > 0) {next();}
	}

	/**
	 * Get and load a file (with processor)
	 * @param {string} filename
	 * @param {function} onload
	 * @param {function} onerror
	 * @param {object} [args]
	 */
	static loadFile(filename, onload, onerror, args = {}) {
		if (!Memory.exist(filename)) {
			this.#loadInput.filename = filename;
			this.#loadInput.args = args;

			Thread.send('LOAD_FILE', this.#loadInput, this.#processFile.bind(this));
		}

		return Memory.get(filename, onload, onerror);
	}

	/**
	 * Internal file processor after loading from worker
	 */
	static async #processFile(data, error, input) {
		if (!data || error) {
			Memory.set(input.filename, data, error);
			return;
		}

		const ext = input.filename.split('.').pop().toLowerCase();
		const { default: Renderer } = await import('Renderer/Renderer.js');
		const gl = Renderer.getContext();

		switch (ext) {
			case 'bmp':
				Texture.load(data, function() {
					Memory.set(input.filename, this.toDataURL(), error);
				});
				return;

			case 'str': {
				const layers = data.layers;
				for (let i = 0; i < data.layernum; ++i) {
					layers[i].materials = new Array(layers[i].texcnt);
					for (let j = 0; j < layers[i].texcnt; ++j) {
						((url, mat, id) => {
							this.loadFile(url, (loadedUrl) => {
								WebGL.texture(gl, loadedUrl, (tex) => { mat[id] = tex; });
							});
						})(layers[i].texname[j], layers[i].materials, j);
					}
				}
				break;
			}

			case 'spr': {
				const { frames } = data;
				for (const frame of frames) {
					frame.texture = gl.createTexture();
					const precision = GraphicsSettings.pixelPerfectSprites ? gl.NEAREST : (frame.type ? gl.LINEAR : gl.NEAREST);
					const size = frame.type ? gl.RGBA : gl.LUMINANCE;
					gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
					gl.bindTexture(gl.TEXTURE_2D, frame.texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, size, frame.width, frame.height, 0, size, gl.UNSIGNED_BYTE, frame.data);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, precision);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, precision);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				}

				if (data.rgba_index !== 0) {
					data.texture = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, data.texture);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data.palette);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				}
				break;
			}

			case 'pal': {
				const texture = gl.createTexture();
				const palette = new Uint8Array(data);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, palette);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				if (Configs.get('enableMipmap')) {gl.generateMipmap(gl.TEXTURE_2D);}
				data = { palette, texture };
				break;
			}
		}

		Memory.set(input.filename, data, error);
	}

	/**
	 * Load multiple files
	 * @param {string[]} filenames
	 * @param {function} callback
	 */
	static loadFiles(filenames, callback) {
		const count = filenames.length;
		const out = new Array(count);
		let index = 0;

		const next = () => {
			this.loadFile(filenames[index], (data) => {
				out[index++] = data;
				if (index === count) {
					if (callback) {callback(...out);}
				} else {
					next();
				}
			});
		};

		if (count > 0) {next();}
	}

	/**
	 * Search for a file using regex
	 * @param {RegExp} regex
	 * @param {function} callback
	 */
	static search(regex, callback) {
		Thread.send('SEARCH_FILE', regex, callback);
	}

	/**
	 * Placeholder for files loaded callback
	 */
	static onFilesLoaded() {}
}

export default Client;
