import SpriteRenderer from '../SpriteRenderer.js';

const MAX_TEXTURES = 128;
const cache = new Map();
let active = null;

function createLayerCanvas(frame, palette, color) {
	const canvas = document.createElement('canvas');
	canvas.width = frame.width;
	canvas.height = frame.height;
	const context = canvas.getContext('2d');
	const imageData = context.createImageData(frame.width, frame.height);
	const output = new Uint32Array(imageData.data.buffer);

	if (frame.type === 1) {
		const input = new Uint32Array(frame.data.buffer);
		for (let i = 0; i < output.length; i++) {
			const pixel = input[i];
			if (!pixel) continue;
			const r = ((pixel & 0xff) * color[0]) | 0;
			const g = (((pixel >>> 8) & 0xff) * color[1]) | 0;
			const b = (((pixel >>> 16) & 0xff) * color[2]) | 0;
			const a = (((pixel >>> 24) & 0xff) * color[3]) | 0;
			output[i] = (a << 24) | (b << 16) | (g << 8) | r;
		}
	} else {
		for (let i = 0; i < output.length; i++) {
			const paletteIndex = frame.data[i] * 4;
			if (!frame.data[i]) continue;
			const r = (palette[paletteIndex] * color[0]) | 0;
			const g = (palette[paletteIndex + 1] * color[1]) | 0;
			const b = (palette[paletteIndex + 2] * color[2]) | 0;
			const a = (255 * color[3]) | 0;
			output[i] = (a << 24) | (b << 16) | (g << 8) | r;
		}
	}

	context.putImageData(imageData, 0, 0);
	return canvas;
}

function capture(entity, frame, palette, offset) {
	if (!active || !frame || frame.width <= 0 || frame.height <= 0) {
		return false;
	}

	const width = Math.abs(SpriteRenderer.size[0]);
	const height = Math.abs(SpriteRenderer.size[1]);
	const radians = (SpriteRenderer.angle / 180) * Math.PI;
	const boundsWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
	const boundsHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));

	active.layers.push({
		frame,
		palette,
		color: Array.from(SpriteRenderer.color),
		angle: SpriteRenderer.angle,
		width: SpriteRenderer.size[0],
		height: SpriteRenderer.size[1],
		x: offset[0],
		y: offset[1],
		boundsWidth,
		boundsHeight
	});
	return true;
}

class EntityComposer {
	static begin(entity) {
		active = { entity, layers: [] };
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
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');

		for (const layer of work.layers) {
			const source = createLayerCanvas(layer.frame, layer.palette, layer.color);
			context.save();
			context.translate(layer.x - minX, layer.y - minY);
			context.rotate((layer.angle / 180) * Math.PI);
			context.scale(Math.sign(layer.width) || 1, Math.sign(layer.height) || 1);
			context.drawImage(
				source,
				-Math.abs(layer.width) / 2,
				-Math.abs(layer.height) / 2,
				Math.abs(layer.width),
				Math.abs(layer.height)
			);
			context.restore();
		}

		SpriteRenderer.image.size[0] = width;
		SpriteRenderer.image.size[1] = height;
		SpriteRenderer.size[0] = width;
		SpriteRenderer.size[1] = height;
		SpriteRenderer.offset[0] = minX + width / 2;
		SpriteRenderer.offset[1] = minY + height / 2;
		SpriteRenderer.angle = 0;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.zIndex = 1;

		if (SpriteRenderer.renderCanvas(canvas)) return;

		const gl = SpriteRenderer.gl;
		if (!gl) return;
		let texture = cache.get(work.entity);
		if (!texture) {
			texture = gl.createTexture();
			cache.set(work.entity, texture);
			if (cache.size > MAX_TEXTURES) {
				const oldest = cache.keys().next().value;
				gl.deleteTexture(cache.get(oldest));
				cache.delete(oldest);
			}
		}

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

		SpriteRenderer.image.texture = texture;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.image.frame = null;
		SpriteRenderer.image.spr = null;
		SpriteRenderer.sprite = { type: 1 };
		SpriteRenderer.render(false);
	}
}

export default EntityComposer;
