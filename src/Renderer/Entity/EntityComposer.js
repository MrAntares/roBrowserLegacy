/**
 * Renderer/Entity/EntityComposer.js
 * Single sprite Player composer.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */

import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import SpriteBatch from 'Renderer/SpriteBatch.js';
import GraphicsSettings from 'Preferences/Graphics.js';
import { getFrameCanvas } from 'Renderer/SpriteRenderer.js';

/**
 * How long a composite can stay in the cache without being drawn before its
 * texture is released (2 seconds).
 * @type {number}
 */
const STALE_MS = 2000;

/**
 * Safety cap on the number of composite textures kept alive at the same time.
 * Every composite owns a texture of its own, so this bounds the video memory
 * used when a lot of entities are visible at once.
 * @type {number}
 */
const MAX_TEXTURES = 512;

const cache = new Map();
const canvasCache = new WeakMap();

// Textures waiting for the pending batch to be drawn: deleting one while a
// queued draw still references it would blank the sprite.
const pendingDeletion = [];
let active = null;
let cacheGL = null;

function capture(entity, frame, palette, offset) {
	if (!active || !frame || frame.width <= 0 || frame.height <= 0) return false;
	const width = Math.abs(SpriteRenderer.size[0]);
	const height = Math.abs(SpriteRenderer.size[1]);
	const angle = SpriteRenderer.angle;
	const radians = (angle / 180) * Math.PI;
	const boundsWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
	const boundsHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
	active.layers.push({
		frame,
		palette,
		color: Array.from(SpriteRenderer.color),
		angle,
		width: SpriteRenderer.size[0],
		height: SpriteRenderer.size[1],
		x: offset[0],
		y: offset[1],
		boundsWidth,
		boundsHeight
	});
	return true;
}

function makeKey(layers, width, height) {
	const parts = [width, height];
	for (const layer of layers) {
		parts.push(
			layer.frame,
			layer.palette,
			layer.color[0],
			layer.color[1],
			layer.color[2],
			layer.color[3],
			layer.angle,
			layer.width,
			layer.height,
			layer.x,
			layer.y,
			layer.boundsWidth,
			layer.boundsHeight
		);
	}
	return parts;
}

function sameKey(a, b) {
	if (!a || a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

/**
 * Delete the texture of a composite.
 *
 * The texture is deleted with the context it was created with, not with the
 * current one: the two may differ after a context loss.
 *
 * @param {object} entry - the cache entry
 * @param {WebGLRenderingContext} gl - fallback context
 */
function releaseEntry(entry, gl) {
	const ctx = (entry && entry.gl) || gl;
	if (entry && entry.texture && ctx) {
		ctx.deleteTexture(entry.texture);
	}
	if (entry) {
		entry.texture = null;
	}
}

function useEntry(entry) {
	if (SpriteRenderer.renderCanvas(entry.canvas)) return;
	SpriteRenderer.image.size[0] = entry.width;
	SpriteRenderer.image.size[1] = entry.height;
	SpriteRenderer.size[0] = entry.width;
	SpriteRenderer.size[1] = entry.height;
	SpriteRenderer.offset[0] = entry.offsetX;
	SpriteRenderer.offset[1] = entry.offsetY;
	SpriteRenderer.angle = 0;
	SpriteRenderer.color.set([1, 1, 1, 1]);
	SpriteRenderer.image.texture = entry.texture;
	SpriteRenderer.image.palette = null;
	SpriteRenderer.image.frame = null;
	SpriteRenderer.image.spr = null;
	SpriteRenderer.sprite = { type: 1, width: entry.width, height: entry.height };
	SpriteRenderer.render(false);
}

class EntityComposer {
	static begin(entity) {
		active = SpriteRenderer.gl && !SpriteRenderer.is2D ? { entity, layers: [] } : null;
	}

	static get active() {
		return !!active;
	}

	static suspend(callback) {
		const current = active;
		active = null;
		try {
			callback();
		} finally {
			active = current;
		}
	}

	static capture(entity, frame, palette, offset) {
		return capture(entity, frame, palette, offset);
	}

	static end() {
		const work = active;
		active = null;
		if (!work || !work.layers.length) return;

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const layer of work.layers) {
			minX = Math.min(minX, layer.x - layer.boundsWidth / 2);
			minY = Math.min(minY, layer.y - layer.boundsHeight / 2);
			maxX = Math.max(maxX, layer.x + layer.boundsWidth / 2);
			maxY = Math.max(maxY, layer.y + layer.boundsHeight / 2);
		}
		const width = Math.max(1, Math.ceil(maxX - minX));
		const height = Math.max(1, Math.ceil(maxY - minY));
		const key = makeKey(work.layers, width, height);
		const gl = SpriteRenderer.gl;
		let entry = cache.get(work.entity);
		if (cacheGL !== gl) {
			if (cacheGL && gl) {
				for (const cached of cache.values()) cacheGL.deleteTexture(cached.texture);
			}
			cache.clear();
			cacheGL = gl;
			entry = null;
		}
		const now = Date.now();

		if (gl && entry && sameKey(entry.key, key)) {
			entry.lastUsed = now;
			cache.delete(work.entity);
			cache.set(work.entity, entry);
			useEntry(entry);
			return;
		}

		if (!entry) {
			entry = {
				texture: gl ? gl.createTexture() : null,
				canvas: document.createElement('canvas'),
				ctx: null,
				gl,
				lastUsed: now
			};
			entry.ctx = entry.canvas.getContext('2d');
			cache.set(work.entity, entry);
		} else {
			entry.lastUsed = now;
		}
		if (entry.canvas.width !== width || entry.canvas.height !== height) {
			entry.canvas.width = width;
			entry.canvas.height = height;
		}
		entry.width = width;
		entry.height = height;
		entry.key = key;
		entry.minX = minX;
		entry.minY = minY;
		entry.offsetX = minX + width / 2;
		entry.offsetY = minY + height / 2;
		entry.ctx.clearRect(0, 0, width, height);
		for (const layer of work.layers) {
			const source = getFrameCanvas(canvasCache, layer.frame, layer.palette, layer.color);
			entry.ctx.save();
			entry.ctx.translate(layer.x - minX, layer.y - minY);
			entry.ctx.rotate((layer.angle / 180) * Math.PI);
			entry.ctx.scale(Math.sign(layer.width) || 1, Math.sign(layer.height) || 1);
			entry.ctx.drawImage(
				source,
				-Math.abs(layer.width) / 2,
				-Math.abs(layer.height) / 2,
				Math.abs(layer.width),
				Math.abs(layer.height)
			);
			entry.ctx.restore();
		}
		if (gl) {
			gl.bindTexture(gl.TEXTURE_2D, entry.texture);
			const filter = GraphicsSettings.pixelPerfectSprites ? gl.NEAREST : gl.LINEAR;
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, entry.canvas);
		}
		useEntry(entry);
	}

	/**
	 * Release the composites that were not drawn for a while.
	 *
	 * Call it once per frame, AFTER the batch has been drawn: a texture can
	 * only be deleted when no queued draw references it anymore. Deleting one
	 * earlier (while the entity pass is still recording) blanks the sprite it
	 * belongs to, since the draw only happens at flush time.
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	static endFrame(gl) {
		// The textures freed during the frame: the batch has been drawn, so
		// nothing references them anymore.
		for (const entry of pendingDeletion) {
			releaseEntry(entry, gl);
		}
		pendingDeletion.length = 0;

		// The composites that were not drawn for a while.
		const now = Date.now();
		for (const [entity, entry] of cache) {
			if (now - entry.lastUsed > STALE_MS) {
				cache.delete(entity);
				releaseEntry(entry, gl);
			}
		}

		// Safety cap: the least recently drawn composites go first. Applied
		// here and not in end(), so a texture is never deleted while the
		// batch still holds a draw of it.
		if (cache.size > MAX_TEXTURES) {
			const entries = [...cache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
			for (let i = 0; i < entries.length - MAX_TEXTURES; i++) {
				cache.delete(entries[i][0]);
				releaseEntry(entries[i][1], gl);
			}
		}
	}

	/**
	 * Forget the composite of an entity that left the scene.
	 *
	 * The texture is deleted right away when no batch is recording, and after
	 * the next flush when a batch still holds a draw of it.
	 *
	 * @param {object} entity
	 */
	static remove(entity) {
		const entry = cache.get(entity);
		if (!entry) {
			return;
		}
		cache.delete(entity);

		if (SpriteBatch.active) {
			pendingDeletion.push(entry);
		} else {
			releaseEntry(entry);
		}
	}

	/**
	 * Forget every composite: the WebGL context was lost, its textures are
	 * gone and cannot be deleted anymore.
	 */
	static reset() {
		cache.clear();
		pendingDeletion.length = 0;
		cacheGL = null;
	}
}

export default EntityComposer;
