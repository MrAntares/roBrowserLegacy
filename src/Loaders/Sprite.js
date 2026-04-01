/**
 * Loaders/Sprite.js
 *
 * Loaders for Gravity .spr file (Sprite)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader, { SEEK_CUR } from 'Utils/BinaryReader.js';

/**
 * @class SPR
 * @description Loader for Gravity .spr files (Sprite textures and palettes)
 */
class SPR {
	static TYPE_PAL = 0;
	static TYPE_RGBA = 1;

	/**
	 * @constructor
	 * @param {ArrayBuffer} [data] - optional data to work with
	 */
	constructor(data) {
		this.fp = null;
		this.header = 'SP';
		this.version = 0.0;
		this.indexed_count = 0;
		this._indexed_count = 0;
		this.rgba_count = 0;
		this.rgba_index = 0;
		this.palette = null;
		this.frames = [];

		if (data) {
			this.load(data);
		}
	}

	/**
	 * Load a Sprite data
	 * @param {ArrayBuffer} data - file content
	 */
	load(data) {
		this.fp = new BinaryReader(data);
		this.header = this.fp.readBinaryString(2);
		this.version = this.fp.readUByte() / 10 + this.fp.readUByte();

		if (this.header !== 'SP') {
			throw new Error(`SPR::load() - Incorrect header "${this.header}", must be "SP"`);
		}

		this.indexed_count = this.fp.readUShort();
		this._indexed_count = this.indexed_count;

		if (this.version > 1.1) {
			this.rgba_count = this.fp.readUShort();
		}

		this.frames = new Array(this.indexed_count + this.rgba_count);
		this.rgba_index = this.indexed_count;

		if (this.version < 2.1) {
			this.readIndexedImage();
		} else {
			this.readIndexedImageRLE();
		}

		this.readRgbaImage();

		// Read palettes.
		if (this.version > 1.0) {
			this.palette = new Uint8Array(this.fp.buffer, this.fp.length - 1024, 1024);
		}
	}

	/**
	 * Parse SPR indexed images
	 */
	readIndexedImage() {
		const { indexed_count, fp, frames } = this;

		for (let i = 0; i < indexed_count; ++i) {
			const width = fp.readUShort();
			const height = fp.readUShort();
			frames[i] = {
				type: SPR.TYPE_PAL,
				width,
				height,
				data: new Uint8Array(fp.buffer, fp.tell(), width * height)
			};

			fp.seek(width * height, SEEK_CUR);
		}
	}

	/**
	 * Parse SPR indexed images encoded with RLE
	 */
	readIndexedImageRLE() {
		const { indexed_count, fp, frames } = this;

		for (let i = 0; i < indexed_count; ++i) {
			const width = fp.readUShort();
			const height = fp.readUShort();
			const size = width * height;
			const data = new Uint8Array(size);
			let index = 0;
			const end = fp.readUShort() + fp.tell();

			while (fp.tell() < end) {
				const c = fp.readUByte();
				data[index++] = c;

				if (!c) {
					const count = fp.readUByte();
					if (count) {
						for (let j = 1; j < count; ++j) {
							data[index++] = c;
						}
					} else {
						data[index++] = count;
					}
				}
			}

			frames[i] = {
				type: SPR.TYPE_PAL,
				width,
				height,
				data
			};
		}
	}

	/**
	 * Parse SPR rgba images
	 */
	readRgbaImage() {
		const { rgba_count, rgba_index, fp, frames } = this;

		for (let i = 0; i < rgba_count; ++i) {
			const width = fp.readShort();
			const height = fp.readShort();

			frames[i + rgba_index] = {
				type: SPR.TYPE_RGBA,
				width,
				height,
				data: new Uint8Array(fp.buffer, fp.tell(), width * height * 4)
			};

			fp.seek(width * height * 4, SEEK_CUR);
		}
	}

	/**
	 * Builds a 32-bit palette lookup table.
	 * @param {Uint8Array} pal
	 * @param {boolean} [flip=false]
	 * @returns {Uint32Array}
	 */
	convert32bPal(pal, flip = false) {
		const pal32 = new Uint32Array(256);
		for (let i = 0; i < 256; i++) {
			const r = pal[i * 4 + 0];
			const g = pal[i * 4 + 1];
			const b = pal[i * 4 + 2];
			const a = i === 0 ? 0 : 255;

			if (flip) {
				// Memory (LE): [R, G, B, A] -> Canvas RGBA
				pal32[i] = (a << 24) | (b << 16) | (g << 8) | r;
			} else {
				// Memory (LE): [A, B, G, R] -> ABGR layout
				pal32[i] = (r << 24) | (g << 16) | (b << 8) | a;
			}
		}
		return pal32;
	}

	/**
	 * Change SPR mode: indexed to rgba
	 */
	switchToRGBA() {
		const { frames, palette: pal, indexed_count } = this;
		const pal32 = this.convert32bPal(pal, false);

		for (let i = 0; i < indexed_count; ++i) {
			const frame = frames[i];
			if (frame.type !== SPR.TYPE_PAL) {
				continue;
			}

			const { width, height, data } = frame;
			const out = new Uint8Array(width * height * 4);
			const out32 = new Uint32Array(out.buffer);

			for (let y = 0; y < height; ++y) {
				const srcRowStart = y * width;
				const dstRowStart = (height - y - 1) * width;

				for (let x = 0; x < width; ++x) {
					out32[dstRowStart + x] = pal32[data[srcRowStart + x]];
				}
			}

			frame.data = out;
			frame.type = SPR.TYPE_RGBA;
		}

		this.indexed_count = 0;
		this.rgba_count = frames.length;
		this.rgba_index = 0;
	}

	/**
	 * Get back a canvas from a frame
	 * @param {number} index - frame index
	 * @returns {HTMLCanvasElement}
	 */
	getCanvasFromFrame(index) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		const frame = this.frames[index];

		if (!frame || frame.width <= 0 || frame.height <= 0) {
			const size = 30;
			canvas.width = canvas.height = size;
			ctx.fillStyle = 'red';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = `${Math.floor(size * 0.8)}px sans-serif`;
			ctx.fillText('X', size / 2, size / 2);
			return canvas;
		}

		const { width, height } = frame;
		canvas.width = width;
		canvas.height = height;

		const imageData = ctx.createImageData(width, height);
		const data32 = new Uint32Array(imageData.data.buffer);

		if (frame.type === SPR.TYPE_RGBA) {
			const frameData32 = new Uint32Array(frame.data.buffer);
			for (let y = 0; y < height; ++y) {
				const srcRow = y * width;
				const dstRow = (height - y - 1) * width;
				for (let x = 0; x < width; ++x) {
					const pixel = frameData32[srcRow + x];
					data32[dstRow + x] =
						((pixel & 0x000000ff) << 24) | // A
						((pixel & 0x0000ff00) << 8) | // R
						((pixel & 0x00ff0000) >> 8) | // G
						((pixel & 0xff000000) >> 24); // B
				}
			}
		} else {
			const pal32 = this.convert32bPal(this.palette, true);
			for (let y = 0; y < height; ++y) {
				const rowStart = y * width;
				for (let x = 0; x < width; ++x) {
					data32[rowStart + x] = pal32[frame.data[rowStart + x]];
				}
			}
		}

		ctx.putImageData(imageData, 0, 0);
		return canvas;
	}

	/**
	 * Compile a SPR file
	 * @returns {object} compiled data
	 */
	compile() {
		const { frames, palette: pal } = this;
		const output = new Array(frames.length);

		frames.forEach((frame, i) => {
			const { data, width, height } = frame;

			const gl_width = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));
			const gl_height = Math.pow(2, Math.ceil(Math.log(height) / Math.log(2)));
			const start_x = Math.floor((gl_width - width) * 0.5);
			const start_y = Math.floor((gl_height - height) * 0.5);

			let out;

			if (frame.type === SPR.TYPE_PAL) {
				const pal32 = this.convert32bPal(pal, true);
				const MAGENTA = 0xffff00ff;

				out = new Uint8Array(gl_width * gl_height);
				for (let y = 0; y < height; ++y) {
					const srcRow = y * width;
					const dstRow = (y + start_y) * gl_width + start_x;
					for (let x = 0; x < width; ++x) {
						const idx = data[srcRow + x];
						out[dstRow + x] = pal32[idx] === MAGENTA ? 0 : idx;
					}
				}
			} else {
				out = new Uint8Array(gl_width * gl_height * 4);
				const out32 = new Uint32Array(out.buffer);

				for (let y = 0; y < height; ++y) {
					const srcRow = (height - y - 1) * width * 4;
					const dstRow = (y + start_y) * gl_width + start_x;

					for (let x = 0; x < width; ++x) {
						const srcIdx = srcRow + x * 4;
						const a = data[srcIdx];
						if (a === 0) {
							out32[dstRow + x] = 0;
						} else {
							const r = data[srcIdx + 3];
							const g = data[srcIdx + 2];
							const b = data[srcIdx + 1];
							out32[dstRow + x] = (a << 24) | (b << 16) | (g << 8) | r;
						}
					}
				}
			}

			output[i] = {
				type: frame.type,
				width: gl_width,
				height: gl_height,
				originalWidth: width,
				originalHeight: height,
				data: out
			};
		});

		return {
			frames: output,
			palette: pal,
			rgba_index: this.rgba_index,
			old_rgba_index: this._indexed_count
		};
	}
}

export default SPR;
