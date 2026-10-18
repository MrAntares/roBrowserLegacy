/**
 * Renderer/TextureArrayManager.js
 *
 *
 * @Author AoShinHo
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/**
 * LRU eviction decision
 * ---------------------
 * When the array reaches maxCapacity and `_grow()` cannot expand further, we
 * evict the least-recently-used layer and reuse its slot rather than forcing
 * the batcher to flush + rebuild the whole array from scratch. LRU preserves
 * batching efficiency in long-running scenes where the visible sprite working
 * set slowly rotates (background NPCs fading in/out, etc.). The evicted layer
 * is re-uploaded the next time its source texture is requested.
 *
 * Callers must flush any pending batch before triggering an eviction, because
 * an evicted layer may be referenced by in-flight instances of that batch.
 * SpriteBatcher honors this by checking `atCapacity` and flushing first.
 */
export default class TextureArrayManager {
	constructor(gl, options = {}) {
		this._gl = gl;
		const layerSize = options.layerSize || 128;
		this._layerWidth = options.layerWidth || layerSize;
		this._layerHeight = options.layerHeight || layerSize;
		this._initialCap = options.initialCapacity || 64;
		this._maxCap = options.maxCapacity || 128;

		this._texture = null;
		this._capacity = 0;
		this._nextFreeLayer = 0;

		// Slots freed by eviction, reused before growing.
		this._freeLayers = [];
		// Monotonic access counter for LRU ordering.
		this._useCounter = 0;

		// Map<WebGLTexture, { layer, uvScaleX, uvScaleY, width, height, lastUsed }>
		this._entries = new Map();

		this._readFBO = null;
		this._drawFBO = null;

		this._init();
	}

	get texture() {
		return this._texture;
	}
	get capacity() {
		return this._capacity;
	}
	get usedLayers() {
		return this._nextFreeLayer;
	}

	/**
	 * True when the next allocation will need to evict a live layer.
	 * Callers (SpriteBatcher) use this to flush pending work first.
	 */
	get atCapacity() {
		return this._freeLayers.length === 0 && this._nextFreeLayer >= this._capacity && this._capacity >= this._maxCap;
	}

	_init() {
		const gl = this._gl;
		this._readFBO = gl.createFramebuffer();
		this._drawFBO = gl.createFramebuffer();

		const cap = Math.min(this._initialCap, this._maxCap);
		this._texture = this._createArrayTexture(cap);
		this._capacity = cap;
		this._nextFreeLayer = 0;
	}

	_createArrayTexture(capacity) {
		const gl = this._gl;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, this._layerWidth, this._layerHeight, capacity);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
		return tex;
	}

	_touch(entry) {
		entry.lastUsed = ++this._useCounter;
	}

	/**
	 * Allocate a layer slot. Preference order:
	 *   1. Recycle a slot freed by a previous eviction.
	 *   2. Use the next never-allocated slot.
	 *   3. Grow the array (doubling) if allowed.
	 *   4. Evict the LRU entry and reuse its slot.
	 * Returns -1 if none succeed.
	 */
	_allocLayer() {
		if (this._freeLayers.length > 0) return this._freeLayers.pop();
		if (this._nextFreeLayer < this._capacity) return this._nextFreeLayer++;
		if (this._grow()) return this._nextFreeLayer++;
		if (this._evictLRU()) return this._freeLayers.pop();
		return -1;
	}

	_evictLRU() {
		let oldestKey = null;
		let oldestEntry = null;
		for (const [k, e] of this._entries) {
			if (!oldestEntry || e.lastUsed < oldestEntry.lastUsed) {
				oldestEntry = e;
				oldestKey = k;
			}
		}
		if (!oldestEntry) return false;
		this._entries.delete(oldestKey);
		this._freeLayers.push(oldestEntry.layer);
		return true;
	}

	/**
	 * @param {WebGLTexture} srcTexture
	 * @param {number} width
	 * @param {number} height
	 * @returns {{layer:number, uvScaleX:number, uvScaleY:number}|null}
	 */
	getLayer(srcTexture, width, height) {
		const cached = this._entries.get(srcTexture);
		if (cached) {
			this._touch(cached);
			return cached;
		}

		if (width > this._layerWidth || height > this._layerHeight) {
			return null;
		}

		const layer = this._allocLayer();
		if (layer < 0) return null;

		// Do not cache the entry when the upload failed: the slot has been
		// recycled into _freeLayers and may be handed to a different texture,
		// which would alias this key to whatever data ends up there.
		if (!this._blitIntoLayer(srcTexture, layer, width, height)) {
			return null;
		}

		const entry = {
			layer,
			width,
			height,
			uvScaleX: width / this._layerWidth,
			uvScaleY: height / this._layerHeight,
			lastUsed: ++this._useCounter
		};
		this._entries.set(srcTexture, entry);
		return entry;
	}

	/**
	 * Upload pixels to a fresh layer without registering them for reuse.
	 * Used to reserve e.g. palette layer 0 as a dummy/identity layer.
	 * @returns {number} layer index or -1
	 */
	reserveLayer(pixels, width, height) {
		if (width > this._layerWidth || height > this._layerHeight) return -1;
		const layer = this._allocLayer();
		if (layer < 0) return -1;
		const gl = this._gl;
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._texture);
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, width, height, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
		return layer;
	}

	_grow() {
		if (this._capacity >= this._maxCap) return false;
		const newCap = Math.min(this._capacity * 2, this._maxCap);

		const gl = this._gl;
		const oldTex = this._texture;
		const newTex = this._createArrayTexture(newCap);

		const prevRead = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
		const prevDraw = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);

		for (let i = 0; i < this._nextFreeLayer; i++) {
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._readFBO);
			gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, oldTex, 0, i);

			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._drawFBO);
			gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, newTex, 0, i);

			gl.blitFramebuffer(
				0,
				0,
				this._layerWidth,
				this._layerHeight,
				0,
				0,
				this._layerWidth,
				this._layerHeight,
				gl.COLOR_BUFFER_BIT,
				gl.NEAREST
			);
		}

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevRead);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDraw);

		gl.deleteTexture(oldTex);
		this._texture = newTex;
		this._capacity = newCap;
		return true;
	}

	has(srcTexture) {
		return this._entries.has(srcTexture);
	}

	_blitIntoLayer(srcTexture, layer, width, height) {
		const gl = this._gl;
		const prevRead = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
		const prevDraw = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._readFBO);
		gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, srcTexture, 0);

		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._drawFBO);
		gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this._texture, 0, layer);

		const status = gl.checkFramebufferStatus(gl.READ_FRAMEBUFFER);
		if (status !== gl.FRAMEBUFFER_COMPLETE) {
			// Recycle the slot; the caller must not cache an entry for it.
			this._freeLayers.push(layer);
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevRead);
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDraw);
			return false;
		}

		gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, gl.COLOR_BUFFER_BIT, gl.NEAREST);

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevRead);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDraw);
		return true;
	}

	dispose() {
		const gl = this._gl;
		if (this._texture) gl.deleteTexture(this._texture);
		if (this._readFBO) gl.deleteFramebuffer(this._readFBO);
		if (this._drawFBO) gl.deleteFramebuffer(this._drawFBO);
		this._entries.clear();
		this._freeLayers.length = 0;
		this._texture = null;
		this._readFBO = null;
		this._drawFBO = null;
		this._capacity = 0;
		this._nextFreeLayer = 0;
	}
}
