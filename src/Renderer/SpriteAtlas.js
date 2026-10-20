/**
 * Renderer/SpriteAtlas.js
 *
 * The textures SpriteBatch draws entity sprites from, shared by every sprite
 * file, so that the layers of a player (body, head, headgear, weapon, each
 * its own file with its own palette) and the next player all draw from the
 * same textures and can share one instanced draw.
 *
 * - Palette frames go into one texture array, RGBA frames into another. A
 *   sprite file is packed the first time one of its frames is drawn, and its
 *   space is given back when MemoryManager frees the file: a layer whose
 *   files are all gone is reused. The arrays grow (and copy what they hold)
 *   when they are full, up to a limit; a frame that does not fit keeps its
 *   own texture, as it does when batching is off.
 * - Palettes go into one texture, a row each, filled as they are first used.
 *   When it is full, it starts over at the next frame.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import GraphicsSettings from 'Preferences/Graphics.js';

/**
 * Rows of the palette texture.
 */
const PALETTE_ROWS = 512;

/**
 * Texture units SpriteBatch binds the atlas to, clear of the ones other
 * passes use (0-2).
 */
const UNIT_INDEX = 5;
const UNIT_RGBA = 6;
const UNIT_PALETTES = 7;

/**
 * One texture array, its layers packed in shelves.
 */
class ArrayAtlas {
	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {boolean} rgba - RGBA frames, or palette indices
	 * @param {number} size - width and height of a layer
	 * @param {number} layers - layers to start with
	 * @param {number} maxLayers - layers it may grow to
	 */
	constructor(gl, rgba, size, layers, maxLayers) {
		this.gl = gl;
		this.rgba = rgba;
		this.size = Math.min(size, gl.getParameter(gl.MAX_TEXTURE_SIZE) || size);
		this.maxLayers = Math.min(maxLayers, gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) || maxLayers);
		this.capacity = 0;
		this.texture = null;
		this.filter = null;

		// Sprite files living on each layer
		this.use = [];

		// Where the next frame goes
		this.layer = -1;
		this.x = 0;
		this.y = 0;
		this.shelf = 0;

		this.allocate(Math.min(layers, this.maxLayers));
	}

	/**
	 * Make the texture hold `layers` layers, keeping what the old one held.
	 */
	allocate(layers) {
		const gl = this.gl;
		const old = this.texture;
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, this.rgba ? gl.RGBA8 : gl.R8, this.size, this.size, layers);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		this.texture = texture;
		this.filter = null;
		this.updateFilter();

		if (old) {
			const framebuffer = gl.createFramebuffer();
			const previous = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer);
			for (let i = 0; i < this.capacity; i++) {
				gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, old, 0, i);
				gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, 0, 0, this.size, this.size);
			}
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previous);
			gl.deleteFramebuffer(framebuffer);
			gl.deleteTexture(old);
		}

		for (let i = this.capacity; i < layers; i++) {
			this.use[i] = 0;
		}
		this.capacity = layers;
	}

	/**
	 * RGBA frames are smoothed unless pixel perfect sprites are on; palette
	 * frames are read texel by texel.
	 */
	updateFilter() {
		const gl = this.gl;
		const filter = this.rgba && !GraphicsSettings.pixelPerfectSprites ? gl.LINEAR : gl.NEAREST;
		if (filter !== this.filter) {
			this.filter = filter;
			gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, filter);
		}
	}

	/**
	 * Move to an empty layer: one no file lives on any more, or a new one.
	 *
	 * @returns {boolean} false when it cannot grow any more
	 */
	nextLayer() {
		let layer = -1;
		for (let i = 0; i < this.capacity; i++) {
			if (i !== this.layer && this.use[i] === 0) {
				layer = i;
				break;
			}
		}
		if (layer < 0) {
			if (this.capacity >= this.maxLayers) {
				return false;
			}
			layer = this.capacity;
			this.allocate(Math.min(this.capacity * 2, this.maxLayers));
		}
		this.layer = layer;
		this.x = 0;
		this.y = 0;
		this.shelf = 0;
		return true;
	}

	/**
	 * Find room for a w x h rectangle.
	 *
	 * @param {Set} layers - the layers the file being packed is on; a layer
	 *   joins it (and is counted as used) as soon as the file has a frame on it
	 * @returns {object|null} { layer, x, y }
	 */
	place(w, h, layers) {
		if (w > this.size || h > this.size) {
			return null;
		}
		if (this.layer < 0 && !this.nextLayer()) {
			return null;
		}
		if (this.x + w > this.size) {
			this.y += this.shelf;
			this.x = 0;
			this.shelf = 0;
		}
		if (this.y + h > this.size) {
			if (!this.nextLayer()) {
				return null;
			}
		}

		if (!layers.has(this.layer)) {
			layers.add(this.layer);
			this.use[this.layer]++;
		}

		const spot = { layer: this.layer, x: this.x, y: this.y };
		this.x += w;
		this.shelf = Math.max(this.shelf, h);
		return spot;
	}

	/**
	 * A file on these layers was freed.
	 */
	release(layers) {
		for (const layer of layers) {
			if (--this.use[layer] === 0 && layer === this.layer) {
				// Nothing left on the layer being filled: start it over
				this.x = 0;
				this.y = 0;
				this.shelf = 0;
			}
		}
	}

	/**
	 * Copy one shelf of a file's frames to the GPU, with a copy of each
	 * frame's edge pixels around it, so sampling past its edge reads what
	 * CLAMP_TO_EDGE read on its own texture.
	 *
	 * @param {Array} spots - { frame, layer, x, y } on one shelf, left to right
	 */
	upload(spots) {
		const gl = this.gl;
		const first = spots[0];
		const last = spots[spots.length - 1];
		const left = first.x;
		const width = last.x + last.frame.width + 2 - left;
		let height = 0;
		for (const spot of spots) {
			height = Math.max(height, spot.frame.height + 2);
		}

		const pixels = this.rgba ? new Uint32Array(width * height) : new Uint8Array(width * height);

		for (const { frame, x } of spots) {
			const fw = frame.width;
			const fh = frame.height;
			const src = this.rgba ? new Uint32Array(frame.data.buffer, frame.data.byteOffset, fw * fh) : frame.data;
			const dx = x - left + 1;

			for (let row = -1; row <= fh; row++) {
				const srcRow = Math.min(Math.max(row, 0), fh - 1) * fw;
				const dst = (row + 1) * width + dx;
				pixels[dst - 1] = src[srcRow];
				pixels.set(src.subarray(srcRow, srcRow + fw), dst);
				pixels[dst + fw] = src[srcRow + fw - 1];
			}
		}

		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
		gl.texSubImage3D(
			gl.TEXTURE_2D_ARRAY,
			0,
			left,
			first.y,
			first.layer,
			width,
			height,
			1,
			this.rgba ? gl.RGBA : gl.RED,
			gl.UNSIGNED_BYTE,
			this.rgba ? new Uint8Array(pixels.buffer) : pixels
		);
	}

	destroy() {
		if (this.texture) {
			this.gl.deleteTexture(this.texture);
			this.texture = null;
		}
	}
}

let _gl = null;
let _generation = 0;
let _index = null;
let _rgba = null;

let _palettes = null;
let _paletteRows = new WeakMap();
let _paletteNext = 0;

/**
 * Sprite atlas namespace
 */
class SpriteAtlas {
	/**
	 * @type {number} rows of the palette texture
	 */
	static PALETTE_ROWS = PALETTE_ROWS;

	/**
	 * @type {number} texture units the atlas is bound to while drawing
	 */
	static UNIT_INDEX = UNIT_INDEX;
	static UNIT_RGBA = UNIT_RGBA;
	static UNIT_PALETTES = UNIT_PALETTES;

	/**
	 * Create the textures for a context (again, if it changed).
	 *
	 * @param {WebGL2RenderingContext} gl
	 */
	static init(gl) {
		if (_gl === gl) {
			return;
		}
		if (_index) {
			_index.destroy();
			_rgba.destroy();
		}
		_gl = gl;
		_generation++;
		_index = new ArrayAtlas(gl, false, 2048, 2, 16);
		_rgba = new ArrayAtlas(gl, true, 1024, 1, 16);

		_palettes = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0 + UNIT_PALETTES);
		gl.bindTexture(gl.TEXTURE_2D, _palettes);
		gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 256, PALETTE_ROWS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.activeTexture(gl.TEXTURE0);
		_paletteRows = new WeakMap();
		_paletteNext = 0;
	}

	/**
	 * @returns {object} { index, rgba, palettes, indexSize } the textures to bind
	 */
	static get textures() {
		_rgba.updateFilter();
		return {
			index: _index.texture,
			rgba: _rgba.texture,
			palettes: _palettes,
			indexSize: _index.size
		};
	}

	/**
	 * Where a frame is in the atlas, packing its sprite file on first use.
	 *
	 * @param {object} spr - compiled sprite file
	 * @param {object} frame - one of spr.frames
	 * @returns {object|null} { rgba, layer, u0, v0, u1, v1 }, or null if it has no room
	 */
	static frame(spr, frame) {
		if (spr._atlasGeneration !== _generation) {
			pack(spr);
		}
		return frame._atlas || null;
	}

	/**
	 * The palette texture's row holding a palette, uploading it on first use.
	 *
	 * @param {WebGLTexture} texture - the palette's own texture, as a key
	 * @param {Uint8Array} data - its 256 RGBA colours
	 * @returns {number} the row, or -1 when the texture is full (or no data)
	 */
	static paletteRow(texture, data) {
		const known = _paletteRows.get(texture);
		if (known !== undefined) {
			return known;
		}
		if (_paletteNext >= PALETTE_ROWS || !data || data.length < 1024) {
			return -1;
		}

		const gl = _gl;
		const row = _paletteNext++;
		gl.activeTexture(gl.TEXTURE0 + UNIT_PALETTES);
		gl.bindTexture(gl.TEXTURE_2D, _palettes);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,
			0,
			row,
			256,
			1,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			data.length === 1024 ? data : data.subarray(0, 1024)
		);
		gl.activeTexture(gl.TEXTURE0);
		_paletteRows.set(texture, row);
		return row;
	}

	/**
	 * Start the palette texture over if it filled up. Call between frames,
	 * never while sprites using its rows wait to be drawn.
	 */
	static recyclePalettes() {
		if (_paletteNext >= PALETTE_ROWS) {
			_paletteRows = new WeakMap();
			_paletteNext = 0;
		}
	}
}

/**
 * Pack every frame of a sprite file, tallest first, and upload it.
 */
function pack(spr) {
	spr._atlasGeneration = _generation;

	const placed = [];
	const owned = [];

	for (const atlas of [_index, _rgba]) {
		const frames = [];
		for (let i = 0; i < spr.frames.length; i++) {
			const frame = spr.frames[i];
			if (!frame || !!frame.type !== atlas.rgba) {
				continue;
			}
			frame._atlas = null;
			if (frame.data && frame.width > 0 && frame.height > 0) {
				frames.push(frame);
			}
		}
		if (!frames.length) {
			continue;
		}

		frames.sort((a, b) => b.height - a.height || b.width - a.width);

		const layers = new Set();
		const spots = [];
		for (const frame of frames) {
			const spot = atlas.place(frame.width + 2, frame.height + 2, layers);
			if (!spot) {
				continue;
			}
			spot.frame = frame;
			spots.push(spot);

			const size = atlas.size;
			frame._atlas = {
				rgba: atlas.rgba,
				layer: spot.layer,
				u0: (spot.x + 1) / size,
				v0: (spot.y + 1) / size,
				u1: (spot.x + 1 + frame.width) / size,
				v1: (spot.y + 1 + frame.height) / size
			};
		}

		// One upload per shelf
		let start = 0;
		for (let i = 1; i <= spots.length; i++) {
			if (i === spots.length || spots[i].layer !== spots[start].layer || spots[i].y !== spots[start].y) {
				atlas.upload(spots.slice(start, i));
				start = i;
			}
		}

		if (layers.size) {
			owned.push({ atlas, layers });
		}
		placed.push(...spots);
	}

	const generation = _generation;
	spr._atlasRelease = () => {
		spr._atlasRelease = null;
		spr._atlasGeneration = 0;
		if (generation !== _generation) {
			return;
		}
		for (const { atlas, layers } of owned) {
			atlas.release(layers);
		}
		for (const spot of placed) {
			spot.frame._atlas = null;
		}
	};
}

/**
 * Export
 */
export default SpriteAtlas;
