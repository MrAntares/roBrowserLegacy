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
 * The files of one map load, each loaded once, by whichever step asks first.
 * The map loads in steps (world, altitude, ground, ground textures, models,
 * model textures), and each used to ask for its files only when the step
 * before had finished: over a remote link, a round trip per step with the
 * connection idle. Asking for a later step's files as soon as their names are
 * known lets them arrive while the earlier steps still run; the steps still
 * run in the same order.
 *
 * At most `limit` files load at once across all the steps, as when each step
 * ran alone. A file a step is waiting for goes before one asked for early.
 */
class MapFiles {
	/**
	 * @param {number} limit - files loading at once
	 */
	constructor(limit) {
		this.limit = limit;
		this.running = 0;
		this.closed = false;
		this.files = new Map(); // filename to entry, until a step takes it
		this.needed = []; // entries a step waits for
		this.early = []; // entries asked for early
	}

	/**
	 * Ask for a file before a step needs it.
	 *
	 * @param {string} filename
	 * @returns {Promise} the loaded file
	 */
	request(filename) {
		if (this.closed) {
			return Promise.resolve(null);
		}

		let entry = this.files.get(filename);
		if (!entry) {
			entry = this._entry(filename);
			this.files.set(filename, entry);
			this.early.push(entry);
			this._run();
		}
		return entry.promise;
	}

	/**
	 * The file, for the one step that uses it. An image comes as a blob URL,
	 * and Texture.load revokes it once the image has loaded, so two steps must
	 * not share one: a texture the ground and a model both use would load for
	 * whichever came first and never for the other. A later step that needs
	 * the same file asks again, and gets its own.
	 *
	 * @param {string} filename
	 * @returns {Promise} the loaded file
	 */
	take(filename) {
		let entry = this.files.get(filename);
		if (entry) {
			this.files.delete(filename);
			const index = this.early.indexOf(entry);
			if (index !== -1) {
				this.early.splice(index, 1);
				this.needed.push(entry);
			}
		} else {
			entry = this._entry(filename);
			this.needed.push(entry);
		}
		this._run();
		return entry.promise;
	}

	/**
	 * The load is over, done or failed: ask for nothing more, and free the
	 * blob URLs of files no step took, now or when they arrive.
	 */
	close() {
		this.closed = true;
		this.needed.length = 0;
		this.early.length = 0;
		for (const entry of this.files.values()) {
			entry.dropped = true;
			if (entry.done) {
				release(entry.data);
			}
		}
		this.files.clear();
	}

	_entry(filename) {
		const entry = { filename, done: false, dropped: false, data: null };
		entry.promise = new Promise(resolve => (entry.resolve = resolve));
		return entry;
	}

	_run() {
		while (!this.closed && this.running < this.limit) {
			const entry = this.needed.shift() || this.early.shift();
			if (!entry) {
				return;
			}

			this.running++;
			FileManager.load(entry.filename, data => {
				this.running--;
				entry.done = true;
				entry.data = data;
				if (entry.dropped) {
					release(data);
				}
				entry.resolve(data);
				this._run();
			});
		}
	}
}

/**
 * Free a loaded file no step will use.
 *
 * @param {*} data
 */
function release(data) {
	if (typeof data === 'string' && data.startsWith('blob:')) {
		URL.revokeObjectURL(data);
	}
}

/**
 * Helper to load list
 *
 * @param {array} file list to load
 */
class Loader {
	/**
	 * @param {Array} list of files to load
	 * @param {MapFiles} requests - the map's files
	 */
	constructor(list, requests) {
		this.requests = requests;
		this.files = list;
		this.list = list.slice(0);
		this.offset = 0;
		this.count = list.length;
		this.out = new Array(this.count);
	}

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
	 * Start to load the list
	 */
	start() {
		let i;
		this.offset = 0;

		// No files...
		if (!this.list.length) {
			this.onload(this.list, this.list);
			return;
		}

		for (i = 0; i < this.count && i < this.parallelDownload; ++i) {
			this._next();
		}
	}

	/**
	 * Next file to load
	 *
	 * @param {number} index in list
	 */
	_next() {
		// Possible problem with setTimeout
		if (!this.list.length) {
			return;
		}

		const filename = this.list.shift();
		this.requests.take(filename).then(data => {
			// Store the result
			this.out[this.files.indexOf(filename)] = data;
			this.offset++;

			// Start the progress
			if (this.onprogress && this.offset <= this.count) {
				this.onprogress(this.offset, this.count);
			}

			// Ended ?
			if (this.offset === this.count) {
				this.onload(this.out, this.files);
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
		});
	}
}
/**
 * MapLoader constructor
 *
 * @param {string} mapname
 */
class MapLoader {
	constructor(mapname) {
		if (mapname) {
			this.load(mapname);
		}
	}

	/**
	 * Count files to load
	 * @var integer
	 */
	fileCount = 0;

	/**
	 * MapLoader Progress
	 * @var integer
	 */
	progress = 0;

	/**
	 * Offset in the progress
	 * @var integer
	 */
	offset = 0;

	/**
	 * MapLoader update progress
	 *
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
	 * Load a map
	 *
	 * @param {string} mapname
	 */
	load(mapname) {
		// Initialize the loading
		this.setProgress(0);

		const loader = this;
		// The same limit as Loader.parallelDownload
		const requests = (this.requests = new MapFiles(6));
		let world;

		//  Get file path (if it's a copy of a file)
		function getFilePath(path) {
			if (path in FileManager.filesAlias) {
				return FileManager.filesAlias[path];
			}

			return path;
		}

		// loading world
		function onWorldReady(resourceWorld) {
			if (!resourceWorld) {
				loader.onload(false, `Can't find file "${mapname}" ! `);
				return;
			}

			world = resourceWorld;
			loader.setProgress(1);

			// Ask for the ground now, while the altitude loads. Once it arrives,
			// ask for its textures, which are needed first, then the models.
			const ground = requests.request(`data\\${getFilePath(world.files.gnd)}`).then(resourceGround => {
				for (const texture of resourceGround?.textures || []) {
					requests.request(`data\\texture\\${texture}`);
				}
				for (const model of world.models) {
					requests.request(`data\\model\\${model.filename}`);
				}
				return resourceGround;
			});

			// Load Altitude
			requests.request(`data\\${getFilePath(world.files.gat)}`).then(altitude => {
				if (onAltitudeReady(altitude)) {
					ground.then(onGroundReady);
				}
			});
		}

		// Loading altitude
		function onAltitudeReady(altitude) {
			if (!altitude) {
				requests.close();
				loader.onload(false, `Can't find file "${world.files.gat}" !`);
				return false;
			}

			loader.setProgress(2);
			loader.ondata('MAP_ALTITUDE', altitude.compile());
			return true;
		}

		// Load ground
		function onGroundReady(ground) {
			if (!ground) {
				requests.close();
				loader.onload(false, `Can't find file "${world.files.gnd}" !`);
				return;
			}

			loader.setProgress(3);

			// Compiling ground
			if (ground && ground.version >= 1.8) {
				world.water = ground.water;
			}
			const compiledGround = ground.compile(world.water.level, world.water.waveHeight);

			// Just to approximate, guess we have 2 textures for each models
			// To get a more linear loading
			loader.fileCount = ground.textures.length + world.models.length * 3;

			// Add water to the list
			if (compiledGround.waterVertCount) {
				loader.fileCount += 32;
			}

			// Loading Gound and Water textures
			loader.loadGroundTextures(world, compiledGround, function onLoaded(waters, textures) {
				world.water.images = waters;
				compiledGround.textures = textures;

				loader.ondata('MAP_WORLD', world.compile());
				loader.ondata('MAP_GROUND', compiledGround);

				// Start loading models
				loader.loadModels(world.models, ground);
			});
		}

		// Start loading World Resource file
		FileManager.load(`data\\${getFilePath(mapname)}`, onWorldReady);
	}

	/**
	 * Loading Ground and Water textures
	 *
	 * @param {object} world resource file
	 * @param {object} compiledGround
	 * @param {function} callback
	 */
	loadGroundTextures(world, ground, callback) {
		let i, count;
		const textures = [];

		// Get water textures
		if (ground.waterVertCount) {
			const path = `data\\texture\\\xbf\xf6\xc5\xcd/water${world.water.type}`;
			for (i = 0; i < 32; ++i) {
				textures.push(`${path}${i < 10 ? '0' + i : i}.jpg`);
			}
		}

		// Load ground textures
		for (i = 0, count = ground.textures.length; i < count; ++i) {
			textures.push(`data\\texture\\${ground.textures[i]}`);
		}

		// Start loading
		const loader = new Loader(textures, this.requests);

		// On progress
		loader.onprogress = () => {
			this.setProgress(3 + (97 / this.fileCount) * ++this.offset);
		};

		// Once load
		loader.onload = _textures => {
			callback(_textures.splice(0, ground.waterVertCount ? 32 : 0), _textures);
		};

		// Start the queue
		loader.start();
	}

	/**
	 * Loading World Models
	 *
	 * @param {Array} model list
	 * @param {Ground}
	 * @returns {object} compiled mesh
	 */
	loadModels(models, ground) {
		let i, count;
		const files = [];

		// Get a list of files to load
		for (i = 0, count = models.length; i < count; ++i) {
			models[i].filename = `data\\model\\${models[i].filename}`;

			if (files.indexOf(models[i].filename) < 0) {
				files.push(models[i].filename);
			}
		}

		const loader = new Loader(files, this.requests);

		// Update the progressbar
		loader.onprogress = () => {
			this.setProgress(3 + (97 / this.fileCount) * ++this.offset);
		};

		// Start creating instances
		loader.onload = (objects, filenames) => {
			let pos;

			for (i = 0, count = models.length; i < count; ++i) {
				pos = filenames.indexOf(models[i].filename);

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
	 *
	 * @param {Array} objects list
	 */
	compileModels(objects) {
		let i, j, count, size, bufferSize;
		let object, nodes, meshes;
		let index;
		const progress = this.progress;
		const models = [];
		const animatedModels = [];

		bufferSize = 0;

		for (i = 0, count = objects.length; i < count; ++i) {
			// Check if this model has animation - skip static compilation
			if (objects[i].hasAnimation && objects[i].hasAnimation()) {
				animatedModels.push(objects[i]);
				this.setProgress(progress + (((100 - progress) / count) * (i + 1)) / 2);
				continue; // Don't include in static mesh, will be rendered by AnimatedModels
			}

			object = objects[i].compile();
			nodes = object.meshes;

			for (j = 0, size = nodes.length; j < size; ++j) {
				meshes = nodes[j];

				for (index in meshes) {
					models.push({
						texture: `data\\texture\\${object.textures[index]}`,
						alpha: objects[i].alpha,
						mesh: meshes[index]
					});

					bufferSize += meshes[index].length;
				}
			}

			this.setProgress(progress + (((100 - progress) / count) * (i + 1)) / 2);
		}

		// Store animated models for later
		this._animatedModels = animatedModels;

		// Merge mesh
		this.mergeMeshes(models, bufferSize);
	}

	/**
	 * Merge objects using the same texture to avoid drawcall
	 *
	 * @param {Array} objects list
	 * @param {number} BufferSize
	 */
	mergeMeshes(objects, bufferSize) {
		let i, j, count, size, offset;
		let object, texture;
		const textures = [],
			infos = [];

		const fcount = 1 / 9;
		const progress = this.progress;

		// Create buffer where to concat meshes
		const buffer = new Float32Array(bufferSize);
		offset = 0;

		// Sort objects by textures type
		objects.sort(SortMeshByTextures);

		// Merge meshes
		for (i = 0, j = 0, count = objects.length; i < count; ++i) {
			object = objects[i];
			size = object.mesh.length;

			// Same texture, just change vertCount to save drawcall
			// and avoid loading multiple time the same texture.
			if (texture === object.texture) {
				infos[j - 1].vertCount += size * fcount;
			}

			// Load the texture
			else {
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
		const loader = new Loader(textures, this.requests);

		// On Progress
		loader.onprogress = (index, _count) => {
			this.setProgress(progress + ((100 - progress) / _count) * (index + 1));
		};

		// Once texture loaded, push the textures
		// in the resulted mesh, and send it back
		loader.onload = (_textures, filenames) => {
			let pos;

			for (i = 0, count = infos.length; i < count; ++i) {
				pos = filenames.indexOf(infos[i].filename);
				infos[i].texture = _textures[pos];
			}

			this.ondata('MAP_MODELS', {
				buffer: buffer,
				infos: infos
			});

			// Send animated models data
			if (this._animatedModels && this._animatedModels.length > 0) {
				this.sendAnimatedModels(this._animatedModels);
			}

			this.requests.close();
			this.onload(true);
		};

		loader.start();
	}

	/**
	 * Send animated model data to main thread
	 *
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

			this.ondata('MAP_ANIMATED_MODEL', modelData);
		}
	}
}

/**
 * Sort the Object by their textures
 * To avoid some problem in the render, the textures with
 * alpha opacity should be rendered first !
 *
 * @param {Object} a
 * @param {Object} b
 * @return {number}
 */
function SortMeshByTextures(a, b) {
	const reg_tga = /\.tga$/i;

	if (a.texture.match(reg_tga)) {
		return 1;
	}

	if (b.texture.match(reg_tga)) {
		return -1;
	}

	if (a.alpha !== b.alpha) {
		return a.alpha < b.alpha ? 1 : -1;
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
 * Export
 */
export default MapLoader;
