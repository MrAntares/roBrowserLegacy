import SpriteRenderer from '../SpriteRenderer.js';

const MAX_TEXTURES = 128;
const cache = new Map();
const scratchCanvases = new Map();
let active = null;
let cacheGL = null;

function getScratch(width, height) {
	const key = `${width}x${height}`;
	let scratch = scratchCanvases.get(key);
	if (!scratch) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		scratch = { canvas, ctx, imageData: ctx.createImageData(width, height) };
		scratchCanvases.set(key, scratch);
	}
	return scratch;
}

function createLayerCanvas(frame, palette, color) {
	const { canvas, ctx, imageData } = getScratch(frame.width, frame.height);
	const input = frame.data;
	const output = new Uint32Array(imageData.data.buffer);
	const rMul = color[0];
	const gMul = color[1];
	const bMul = color[2];
	const aMul = color[3];

	if (frame.type === 1) {
		const input32 = new Uint32Array(input.buffer, input.byteOffset, input.byteLength >>> 2);
		if (rMul === 1 && gMul === 1 && bMul === 1 && aMul === 1) {
			output.set(input32);
		} else {
			for (let i = 0; i < output.length; i++) {
				const pixel = input32[i];
				if (!pixel) {
					output[i] = 0;
					continue;
				}
				const r = (pixel & 0xff) * rMul;
				const g = ((pixel >>> 8) & 0xff) * gMul;
				const b = ((pixel >>> 16) & 0xff) * bMul;
				const a = ((pixel >>> 24) & 0xff) * aMul;
				output[i] = (a << 24) | (b << 16) | (g << 8) | r;
			}
		}
	} else {
		const pal32 = new Uint32Array(256);
		for (let i = 1; i < 256; i++) {
			const p = i * 4;
			const r = (palette[p] * rMul) | 0;
			const g = (palette[p + 1] * gMul) | 0;
			const b = (palette[p + 2] * bMul) | 0;
			const a = (255 * aMul) | 0;
			pal32[i] = (a << 24) | (b << 16) | (g << 8) | r;
		}
		for (let i = 0; i < output.length; i++) output[i] = pal32[input[i]];
	}
	ctx.putImageData(imageData, 0, 0);
	return canvas;
}

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

function evictOldest(gl) {
	const oldest = cache.keys().next().value;
	const entry = cache.get(oldest);
	if (entry && entry.texture && gl) gl.deleteTexture(entry.texture);
	cache.delete(oldest);
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
		if (gl && entry && sameKey(entry.key, key)) {
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
				gl
			};
			entry.ctx = entry.canvas.getContext('2d');
			if (cache.size >= MAX_TEXTURES) evictOldest(gl);
			cache.set(work.entity, entry);
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
			const source = createLayerCanvas(layer.frame, layer.palette, layer.color);
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
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, entry.canvas);
		}
		useEntry(entry);
	}
}

export default EntityComposer;
