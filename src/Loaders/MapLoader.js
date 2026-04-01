/**
 * Loaders/MapLoader.js
 *
 * Loaders for Ragnarok Map
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import FileManager from 'Core/FileManager.js';

/**
 * Helper to load list
 */
class Loader {
	/**
	 * @var {number} static file count (avoid "too much recursion from firefox")
	 */
	static count = 0;

	/**
	 * @var {number} How many files do you want to load at the same time ?
	 * PHP servers: keep at 4-6 to avoid connection exhaustion.
	 * Node.js (RemoteClient-JS): supports 12+ with HTTP/2 multiplexing.
	 */
	parallelDownload = 6;

	/**
	 * Constructor
	 * @param {array} list - file list to load
	 */
	constructor(list) {
		this.files = list;
		this.list = list.slice(0);
		this.offset = 0;
		this.count = list.length;
		this.out = new Array(this.count);
	}

	/**
	 * Start to load the list
	 */
	start() {
		this.offset = 0;

		// No files...
		if (!this.list.length) {
			if (this.onload) {
				this.onload(this.list, this.list);
			}
			return;
		}

		const count = Math.min(this.count, this.parallelDownload);
		for (let i = 0; i < count; ++i) {
			this._next();
		}
	}

	/**
	 * Next file to load
	 */
	async _next() {
		if (!this.list.length) {
			return;
		}

		const filename = this.list.shift();

		try {
			const data = await FileManager.load(filename);

			// Store the result
			this.out[this.files.indexOf(filename)] = data;
			this.offset++;

			// Start the progress
			if (this.onprogress && this.offset <= this.count) {
				this.onprogress(this.offset, this.count);
			}

			// Ended ?
			if (this.offset === this.count) {
				if (this.onload) {
					this.onload(this.out, this.files);
				}
				return;
			}

			// Continue the queue
			if (this.list.length) {
				// To fix "too much recursion" on Firefox
				if (++Loader.count % 50 === 0) {
					setTimeout(() => this._next(), 4);
				} else {
					this._next();
				}
			}
		} catch (error) {
			// Handle error by continuing to show progress if possible
			// or by providing a null result for the file
			this.out[this.files.indexOf(filename)] = null;
			this.offset++;

			if (this.offset === this.count) {
				if (this.onload) {
					this.onload(this.out, this.files);
				}
				return;
			}

			if (this.list.length) {
				this._next();
			}
		}
	}
}

/**
 * MapLoader class
 */
class MapLoader {
	/**
	 * Count files to load
	 * @var {number}
	 */
	fileCount = 0;

	/**
	 * MapLoader Progress
	 * @var {number}
	 */
	progress = 0;

	/**
	 * Offset in the progress
	 * @var {number}
	 */
	offset = 0;

	/**
	 * Constructor
	 * @param {string} mapname
	 */
	constructor(mapname) {
		if (mapname) {
			this.load(mapname);
		}
	}

	/**
	 * MapLoader update progress
	 * @param {number} percent
	 */
	setProgress(percent) {
		const progress = Math.min(100, Math.floor(percent));

		if (progress !== this.progress) {
			if (this.onprogress) {
				this.onprogress(progress);
			}
			this.progress = progress;
		}
	}

	/**
	 * Get file path (if it's a copy of a file)
	 * @param {string} path
	 * @returns {string}
	 */
	_getFilePath(path) {
		if (path in FileManager.filesAlias) {
			return FileManager.filesAlias[path];
		}
		return path;
	}

	/**
	 * Load a map
	 * @param {string} mapname
	 */
	async load(mapname) {
		// Initialize the loading
		this.setProgress(0);

		try {
			// Start loading World Resource file
			const world = await FileManager.load(`data\\${this._getFilePath(mapname)}`);
			if (!world) {
				if (this.onload) {
					this.onload(false, `Can't find file "${mapname}" ! `);
				}
				return;
			}

			this.setProgress(1);

			// Load Altitude
			const altitude = await FileManager.load(`data\\${this._getFilePath(world.files.gat)}`);
			if (!altitude) {
				if (this.onload) {
					this.onload(false, `Can't find file "${world.files.gat}" !`);
				}
				return;
			}

			this.setProgress(2);
			if (this.ondata) {
				this.ondata('MAP_ALTITUDE', altitude.compile());
			}

			// Load Ground
			const ground = await FileManager.load(`data\\${this._getFilePath(world.files.gnd)}`);
			if (!ground) {
				if (this.onload) {
					this.onload(false, `Can't find file "${world.files.gnd}" !`);
				}
				return;
			}

			this.setProgress(3);

			// Compiling ground
			if (ground && ground.version >= 1.8) {
				world.water = ground.water;
			}
			const compiledGround = ground.compile(world.water.level, world.water.waveHeight);

			// Just to approximate, guess we have 2 textures for each models
			// To get a more linear loading
			this.fileCount = ground.textures.length + world.models.length * 3;

			// Add water to the list
			if (compiledGround.waterVertCount) {
				this.fileCount += 32;
			}

			// Loading Gound and Water textures
			this.loadGroundTextures(world, compiledGround, (waters, textures) => {
				world.water.images = waters;
				compiledGround.textures = textures;

				if (this.ondata) {
					this.ondata('MAP_WORLD', world.compile());
					this.ondata('MAP_GROUND', compiledGround);
				}

				// Start loading models
				this.loadModels(world.models, ground);
			});
		} catch (error) {
			if (this.onload) {
				this.onload(false, error.message);
			}
		}
	}

	/**
	 * Loading Ground and Water textures
	 * @param {object} world - resource file
	 * @param {object} ground - compiled ground
	 * @param {function} callback
	 */
	loadGroundTextures(world, ground, callback) {
		const textures = [];

		// Get water textures
		if (ground.waterVertCount) {
			const path = `data\\texture\\\xbf\xf6\xc5\xcd/water${world.water.type}`;
			for (let i = 0; i < 32; ++i) {
				textures.push(`${path}${i < 10 ? '0' + i : i}.jpg`);
			}
		}

		// Load ground textures
		for (let i = 0; i < ground.textures.length; ++i) {
			textures.push(`data\\texture\\${ground.textures[i]}`);
		}

		// Start loading
		const loader = new Loader(textures);

		// On progress
		loader.onprogress = () => {
			this.setProgress(3 + (97 / this.fileCount) * ++this.offset);
		};

		// Once load
		loader.onload = (_textures) => {
			callback(_textures.splice(0, ground.waterVertCount ? 32 : 0), _textures);
		};

		// Start the queue
		loader.start();
	}

	/**
	 * Loading World Models
	 * @param {Array} models - model list
	 * @param {object} ground - ground info
	 */
	loadModels(models, ground) {
		const files = [];

		// Get a list of files to load
		for (let i = 0; i < models.length; ++i) {
			models[i].filename = `data\\model\\${models[i].filename}`;

			if (files.indexOf(models[i].filename) < 0) {
				files.push(models[i].filename);
			}
		}

		const loader = new Loader(files);

		// Update the progressbar
		loader.onprogress = () => {
			this.setProgress(3 + (97 / this.fileCount) * ++this.offset);
		};

		// Start creating instances
		loader.onload = (objects, filenames) => {
			for (let i = 0; i < models.length; ++i) {
				const pos = filenames.indexOf(models[i].filename);

				// Duplicate from a model removed from list
				if (pos === -1) {
					continue;
				}

				// Because of a problem the model isn't load, remove it from the list
				if (!objects[pos]) {
					objects.splice(pos, 1);
					filenames.splice(pos, 1);
					continue;
				}

				objects[pos].filename = filenames[pos];
				objects[pos].createInstance(models[i], ground.width, ground.height);
			}

			this.compileModels(objects);
		};

		// Start loading models
		loader.start();
	}

	/**
	 * Extract model meshes
	 * @param {Array} objects - objects list
	 */
	compileModels(objects) {
		const progress = this.progress;
		const models = [];
		const animatedModels = [];
		let bufferSize = 0;

		for (let i = 0; i < objects.length; ++i) {
			// Check if this model has animation - skip static compilation
			if (objects[i].hasAnimation && objects[i].hasAnimation()) {
				animatedModels.push(objects[i]);
				this.setProgress(progress + (((100 - progress) / objects.length) * (i + 1)) / 2);
				continue; // Don't include in static mesh, will be rendered by AnimatedModels
			}

			const object = objects[i].compile();
			const nodes = object.meshes;

			for (let j = 0; j < nodes.length; ++j) {
				const meshes = nodes[j];

				for (const index in meshes) {
					models.push({
						texture: `data\\texture\\${object.textures[index]}`,
						alpha: objects[i].alpha,
						mesh: meshes[index]
					});

					bufferSize += meshes[index].length;
				}
			}

			this.setProgress(progress + (((100 - progress) / objects.length) * (i + 1)) / 2);
		}

		// Store animated models for later
		this._animatedModels = animatedModels;

		// Merge mesh
		this.mergeMeshes(models, bufferSize);
	}

	/**
	 * Merge objects using the same texture to avoid drawcall
	 * @param {Array} objects - objects list
	 * @param {number} bufferSize
	 */
	mergeMeshes(objects, bufferSize) {
		const textures = [];
		const infos = [];
		const fcount = 1 / 9;
		const progress = this.progress;

		// Create buffer where to concat meshes
		const buffer = new Float32Array(bufferSize);
		let offset = 0;
		let texture = null;

		// Sort objects by textures type
		objects.sort(MapLoader._sortMeshByTextures);

		// Merge meshes
		for (let i = 0, j = 0; i < objects.length; ++i) {
			const object = objects[i];
			const size = object.mesh.length;

			// Same texture, just change vertCount to save drawcall
			// and avoid loading multiple time the same texture.
			if (texture === object.texture) {
				infos[j - 1].vertCount += size * fcount;
			} else {
				texture = object.texture;
				textures.push(texture);

				infos[j++] = {
					filename: texture,
					vertOffset: offset * fcount,
					vertCount: size * fcount
				};
			}

			// Add to buffer
			buffer.set(object.mesh, offset);
			offset += size;
		}

		// Load texture
		const loader = new Loader(textures);

		// On Progress
		loader.onprogress = (index, count) => {
			this.setProgress(progress + ((100 - progress) / count) * (index + 1));
		};

		// Once texture loaded, push the textures
		// in the resulted mesh, and send it back
		loader.onload = (_textures, filenames) => {
			for (let i = 0; i < infos.length; ++i) {
				const pos = filenames.indexOf(infos[i].filename);
				infos[i].texture = _textures[pos];
			}

			if (this.ondata) {
				this.ondata('MAP_MODELS', {
					buffer: buffer,
					infos: infos
				});
			}

			// Send animated models data
			if (this._animatedModels && this._animatedModels.length > 0) {
				this.sendAnimatedModels(this._animatedModels);
			}

			if (this.onload) {
				this.onload(true);
			}
		};

		loader.start();
	}

	/**
	 * Sort the Object by their textures
	 * @static
	 * @param {Object} a
	 * @param {Object} b
	 * @returns {number}
	 */
	static _sortMeshByTextures(a, b) {
		const reg_tga = /\.tga$/i;

		if (a.texture.match(reg_tga)) {
			return 1;
		}

		if (b.texture.match(reg_tga)) {
			return -1;
		}

		if (a.alpha !== b.alpha) {
			return a.alpha < b.alpha ? 1 : 0;
		}

		if (a.texture < b.texture) {
			return -1;
		}

		if (a.texture > b.texture) {
			return 1;
		}

		return 0;
	}

	/**
	 * Send animated model data to main thread
	 * @param {Array} animatedModels - RSM objects with animation
	 */
	sendAnimatedModels(animatedModels) {
		for (let i = 0; i < animatedModels.length; i++) {
			const model = animatedModels[i];

			// Serialize model data for transfer
			const modelData = {
				filename: model.filename,
				animLen: model.animLen,
				frameRatePerSecond: model.frameRatePerSecond || 30,
				shadeType: model.shadeType,
				alpha: model.alpha,
				textures: model.textures.slice(),
				instances: [],
				nodes: [],
				box: {
					center: Array.from(model.box.center),
					max: Array.from(model.box.max),
					min: Array.from(model.box.min),
					offset: Array.from(model.box.offset),
					range: Array.from(model.box.range)
				}
			};

			// Serialize instances
			for (let j = 0; j < model.instances.length; j++) {
				modelData.instances.push(Array.from(model.instances[j]));
			}

			// Serialize nodes
			for (let k = 0; k < model.nodes.length; k++) {
				const node = model.nodes[k];

				modelData.nodes.push({
					name: node.name,
					parentname: node.parentname,
					is_only: node.is_only,
					textures: node.textures.slice(),
					vertices: node.vertices,
					tvertices: Array.from(node.tvertices),
					faces: node.faces,
					pos: Array.from(node.pos),
					rotangle: node.rotangle,
					rotaxis: Array.from(node.rotaxis),
					scale: Array.from(node.scale),
					offset: Array.from(node.offset),
					mat3: Array.from(node.mat3),
					rotKeyframes: node.rotKeyframes || [],
					posKeyframes: node.posKeyframes || [],
					scaleKeyFrames: node.scaleKeyFrames || []
				});
			}

			if (this.ondata) {
				this.ondata('MAP_ANIMATED_MODEL', modelData);
			}
		}
	}
}

export default MapLoader;
