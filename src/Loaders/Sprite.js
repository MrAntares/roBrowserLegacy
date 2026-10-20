/**
 * Loaders/Sprite.js
 *
 * Loaders for Gravity .spr file (Sprite)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import BinaryReader from 'Utils/BinaryReader.js';
import { getPaletteConvertWasm } from 'Loaders/wasm/paletteConvert.js';
import { getSpriteCompileWasm } from 'Loaders/wasm/spriteCompile.js';

/**
 * Sprite Constructor
 *
 * @param {ArrayBuffer} data - optional data to work with
 */
class SPR {
	constructor(data) {
		if (data) {
			this.load(data);
		}
	}

	/**
	 * Sprite Constants
	 */
	static TYPE_PAL = 0;
	static TYPE_RGBA = 1;

	/**
	 * Sprite public methods
	 */
	fp = null;
	header = 'SP';
	version = 0.0;
	indexed_count = 0;
	_indexed_count = 0;
	rgba_count = 0;
	rgba_index = 0;
	palette = null;
	_pal32Canvas = null;
	frames = null;

	/**
	 * Load a Sprite data
	 *
	 * @param {ArrayBuffer} data - file content
	 */
	load(data) {
		this._pal32Canvas = null;
		this.fp = new BinaryReader(data);
		this.header = this.fp.readBinaryString(2);
		this.version = this.fp.readUByte() / 10 + this.fp.readUByte();

		if (this.header != 'SP') {
			throw new Error(`SPR::load() - Incorrect header "${this.header}", must be "SP"`);
		}

		this.indexed_count = this.fp.readUShort();
		this._indexed_count = this.indexed_count + 0;

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
		const pal_count = this.indexed_count;
		const fp = this.fp;
		let i, width, height;
		const frames = this.frames;

		for (i = 0; i < pal_count; ++i) {
			width = fp.readUShort();
			height = fp.readUShort();
			frames[i] = {
				type: SPR.TYPE_PAL,
				width: width,
				height: height,
				data: new Uint8Array(fp.buffer, fp.tell(), width * height)
			};

			fp.seek(width * height, SEEK_CUR);
		}
	}

	/**
	 * Parse SPR indexed images encoded with RLE
	 */
	readIndexedImageRLE() {
		const pal_count = this.indexed_count;
		const fp = this.fp;
		let i, width, height, size, data, index, c, count, j, end;
		const frames = this.frames;

		for (i = 0; i < pal_count; ++i) {
			width = fp.readUShort();
			height = fp.readUShort();
			size = width * height;
			data = new Uint8Array(size);
			index = 0;
			end = fp.readUShort() + fp.tell();

			while (fp.tell() < end) {
				c = fp.readUByte();
				data[index++] = c;

				if (!c) {
					count = fp.readUByte();
					if (!count) {
						data[index++] = count;
					} else {
						for (j = 1; j < count; ++j) {
							data[index++] = c;
						}
					}
				}
			}

			frames[i] = {
				type: SPR.TYPE_PAL,
				width: width,
				height: height,
				data: data
			};
		}
	}

	/**
	 * Parse SPR rgba images
	 */
	readRgbaImage() {
		const rgba = this.rgba_count;
		const index = this.rgba_index;
		const fp = this.fp;
		const frames = this.frames;
		let i, width, height;

		for (i = 0; i < rgba; ++i) {
			width = fp.readShort();
			height = fp.readShort();

			frames[i + index] = {
				type: SPR.TYPE_RGBA,
				width: width,
				height: height,
				data: new Uint8Array(fp.buffer, fp.tell(), width * height * 4)
			};

			fp.seek(width * height * 4, SEEK_CUR);
		}
	}

	/**
	 * Builds a 32-bit palette lookup table.
	 *
	 * NOTE ABOUT ENDIANNESS:
	 * JavaScript TypedArrays are Little Endian.
	 *
	 * Writing (A<<24 | B<<16 | G<<8 | R) produces memory bytes [R, G, B, A],
	 * which matches Canvas ImageData (RGBA).
	 *
	 * The exact byte layout depends on the chosen packing below.
	 */
	convert32bPal(pal, flip = false) {
		const pal32 = new Uint32Array(256);
		for (let i = 0; i < 256; i++) {
			const r = pal[i * 4 + 0];
			const g = pal[i * 4 + 1];
			const b = pal[i * 4 + 2];
			const a = i === 0 ? 0 : 255; // A? A = 255

			// If flip=true, we prepare the integer to be written as ABGR in memory
			// effectively resulting in RGBA sequence in Little Endian systems.
			if (flip === true) // Memory (LE): [R, G, B, A]  -> Canvas RGBA
			{
				pal32[i] = (a << 24) | (b << 16) | (g << 8) | r;
			} // Memory (LE): [A, B, G, R]  -> ABGR layout
			else {
				pal32[i] = (r << 24) | (g << 16) | (b << 8) | a;
			}
		}
		return pal32;
	}

	/**
	 * Change SPR mode : indexed to rgba
	 * (why keep palette for hat/weapon/shield/monster ?)
	 */
	switchToRGBA() {
		const frames = this.frames,
			pal = this.palette;
		// Create a lookup table of Uint32 colors to speed up conversion
		const pal32 = this.convert32bPal(pal, false);
		const wasmInstance = getPaletteConvertWasm();

		if (wasmInstance) {
			const memory = wasmInstance.exports.memory;
			const convertPal = wasmInstance.exports.convertPal;
			const palPtr = 0; // 256 * 4 bytes = 1024 bytes
			const srcPtr = 1024;

			// Copy palette to WASM linear memory once for all frames
			new Uint32Array(memory.buffer, palPtr, 256).set(pal32);

			for (let i = 0; i < this.indexed_count; ++i) {
				const frame = frames[i];
				if (frame.type !== SPR.TYPE_PAL) {
					continue;
				}

				const width = frame.width,
					height = frame.height;
				const pixelCount = width * height;

				if (pixelCount <= 0) {
					frame.data = new Uint8Array(0);
					frame.type = SPR.TYPE_RGBA;
					continue;
				}

				const dstPtr = srcPtr + pixelCount;
				const totalBytesNeeded = dstPtr + pixelCount * 4;

				// Grow WASM linear memory if frame requires more than current buffer capacity
				if (memory.buffer.byteLength < totalBytesNeeded) {
					const additionalPages = Math.ceil((totalBytesNeeded - memory.buffer.byteLength) / 65536);
					memory.grow(additionalPages);
					// Re-copy palette if memory buffer detached on grow
					new Uint32Array(memory.buffer, palPtr, 256).set(pal32);
				}

				// Copy indexed pixel data to WASM linear memory
				new Uint8Array(memory.buffer, srcPtr, pixelCount).set(frame.data);

				// Convert via WASM (with vertical flip)
				convertPal(palPtr, srcPtr, dstPtr, width, height);

				// Copy converted RGBA bytes into a standalone Uint8Array
				frame.data = new Uint8Array(new Uint8Array(memory.buffer, dstPtr, pixelCount * 4));
				frame.type = SPR.TYPE_RGBA;
			}
		} else {
			for (let i = 0; i < this.indexed_count; ++i) {
				const frame = frames[i];
				if (frame.type !== SPR.TYPE_PAL) {
					continue;
				}

				const width = frame.width,
					height = frame.height;
				const data = frame.data; // Uint8 indexes
				const out = new Uint8Array(width * height * 4);

				// We map a Uint32View to the output buffer to write 4 bytes at once
				const out32 = new Uint32Array(out.buffer);

				for (let y = 0; y < height; ++y) {
					// reverse height
					const srcRowStart = y * width;
					const dstRowStart = (height - y - 1) * width;

					for (let x = 0; x < width; ++x) {
						// Single 32-bit assignment from pre-calculated palette table
						out32[dstRowStart + x] = pal32[data[srcRowStart + x]];
					}
				}

				frame.data = out;
				frame.type = SPR.TYPE_RGBA;
			}
		}

		this.indexed_count = 0;
		this.rgba_count = frames.length;
		this.rgba_index = 0;
	}

	/**
	 * Get back a canvas from a frame
	 *
	 * @param {number} index frame
	 * @return {HTMLElement} canvas
	 */
	getCanvasFromFrame(index) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const frame = this.frames[index];

		// Missing/empty frame?
		if (!frame || frame.width <= 0 || frame.height <= 0) {
			// Create a red X on a 30x30 canvas as error image
			const size = 30;
			const fontSize = Math.floor(size * 0.8);
			canvas.width = canvas.height = size;
			ctx.fillStyle = 'red';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = `${fontSize}px sans-serif`;
			ctx.fillText('X', size / 2, size / 2);

			return canvas; // Return error image. Caller expects a canvas..
		}

		const width = (canvas.width = frame.width);
		const height = (canvas.height = frame.height);
		const imageData = ctx.createImageData(width, height);

		const wasmInstance = getSpriteCompileWasm();

		// RGBA
		if (frame.type === SPR.TYPE_RGBA) {
			const pixelCount = width * height;
			const srcBytes = pixelCount * 4;
			const dstBytes = pixelCount * 4;

			if (wasmInstance && wasmInstance.exports.frameRgbaToCanvas) {
				const memory = wasmInstance.exports.memory;
				const srcPtr = 1024;
				const dstPtr = srcPtr + srcBytes;
				const totalBytesNeeded = dstPtr + dstBytes;

				if (memory.buffer.byteLength < totalBytesNeeded) {
					const additionalPages = Math.ceil((totalBytesNeeded - memory.buffer.byteLength) / 65536);
					memory.grow(additionalPages);
				}

				const frameBytes = new Uint8Array(frame.data.buffer, frame.data.byteOffset, srcBytes);
				new Uint8Array(memory.buffer, srcPtr, srcBytes).set(frameBytes);

				wasmInstance.exports.frameRgbaToCanvas(srcPtr, dstPtr, width, height);

				new Uint8Array(imageData.data.buffer).set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
			} else {
				// Fallback JS
				const data32 = new Uint32Array(imageData.data.buffer);
				let frameData32;
				if ((frame.data.byteOffset & 3) === 0) {
					frameData32 = new Uint32Array(frame.data.buffer, frame.data.byteOffset, pixelCount);
				} else {
					frameData32 = new Uint32Array(pixelCount);
					new Uint8Array(frameData32.buffer).set(
						new Uint8Array(frame.data.buffer, frame.data.byteOffset, pixelCount * 4)
					);
				}
				for (let y = 0; y < height; ++y) {
					const srcRow = y * width;
					const dstRow = (height - y - 1) * width; // Flip Y
					for (let x = 0; x < width; ++x) {
						const pixel = frameData32[srcRow + x];
						data32[dstRow + x] =
							((pixel & 0x000000ff) << 24) | // A
							((pixel & 0x0000ff00) << 8) | // R
							((pixel & 0x00ff0000) >> 8) | // G
							((pixel & 0xff000000) >>> 24); // B
					}
				}
			}
		}

		// Palette
		else {
			// Cache converted 32bit palette (flip=true for ABGR order / Little Endian -> RGBA)
			if (!this._pal32Canvas && this.palette) {
				this._pal32Canvas = this.convert32bPal(this.palette, true);
			}
			const pal32 = this._pal32Canvas || this.convert32bPal(this.palette, true);

			const pixelCount = width * height;
			const srcBytes = pixelCount;
			const dstBytes = pixelCount * 4;

			if (wasmInstance && wasmInstance.exports.framePalToCanvas) {
				const memory = wasmInstance.exports.memory;
				const palPtr = 0;
				const srcPtr = 1024;
				const dstPtr = srcPtr + srcBytes;
				const totalBytesNeeded = dstPtr + dstBytes;

				if (memory.buffer.byteLength < totalBytesNeeded) {
					const additionalPages = Math.ceil((totalBytesNeeded - memory.buffer.byteLength) / 65536);
					memory.grow(additionalPages);
				}

				new Uint32Array(memory.buffer, palPtr, 256).set(pal32);

				const frameBytes = new Uint8Array(frame.data.buffer, frame.data.byteOffset, srcBytes);
				new Uint8Array(memory.buffer, srcPtr, srcBytes).set(frameBytes);

				wasmInstance.exports.framePalToCanvas(palPtr, srcPtr, dstPtr, width, height);

				new Uint8Array(imageData.data.buffer).set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
			} else {
				// Fallback JS
				const data32 = new Uint32Array(imageData.data.buffer);
				const frameIndices = new Uint8Array(frame.data.buffer, frame.data.byteOffset, pixelCount);
				for (let y = 0; y < height; ++y) {
					const rowStart = y * width;
					for (let x = 0; x < width; ++x) {
						const idx = frameIndices[rowStart + x];
						data32[rowStart + x] = pal32[idx];
					}
				}
			}
		}

		// Export
		ctx.putImageData(imageData, 0, 0);
		return canvas;
	}

	/**
	 * Compile a SPR file
	 */
	compile() {
		const frames = this.frames;
		let frame;
		let i;
		const count = frames.length;
		let data, width, height, gl_width, gl_height, start_x, start_y;
		let out;
		const output = new Array(count);

		// Pre-calculate the palette with flip=true once for fast transparency checking across all PAL frames
		let pal32 = null;
		const MAGENTA = 0xffff00ff;

		const wasmInstance = getSpriteCompileWasm();
		let wasmMem = null;
		let wasmPalPtr = 0;
		let wasmSrcPtr = 0;
		let wasmPalInitialized = false;

		if (wasmInstance) {
			wasmMem = wasmInstance.exports.memory;
			wasmPalPtr = 0; // 256 * 4 bytes = 1024 bytes
			wasmSrcPtr = 1024;
		}

		for (i = 0; i < count; ++i) {
			// Avoid look up
			frame = frames[i];
			data = frame.data;
			width = frame.width;
			height = frame.height;

			// Calculate new texture size (Power of Two)
			gl_width = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));
			gl_height = Math.pow(2, Math.ceil(Math.log(height) / Math.log(2)));
			start_x = Math.floor((gl_width - width) * 0.5);
			start_y = Math.floor((gl_height - height) * 0.5);

			// If palette.
			if (frame.type === SPR.TYPE_PAL) {
				if (!pal32) {
					pal32 = this.convert32bPal(this.palette, true);
				}

				if (width <= 0 || height <= 0) {
					out = new Uint8Array(gl_width * gl_height);
				} else if (wasmInstance) {
					const srcBytes = width * height;
					const dstBytes = gl_width * gl_height;
					const dstPtr = wasmSrcPtr + srcBytes;
					const totalBytesNeeded = dstPtr + dstBytes;

					if (wasmMem.buffer.byteLength < totalBytesNeeded) {
						const additionalPages = Math.ceil((totalBytesNeeded - wasmMem.buffer.byteLength) / 65536);
						wasmMem.grow(additionalPages);
					}

					if (!wasmPalInitialized) {
						new Uint32Array(wasmMem.buffer, wasmPalPtr, 256).set(pal32);
						wasmPalInitialized = true;
					}

					// Zero-initialize destination buffer in WASM memory
					new Uint8Array(wasmMem.buffer, dstPtr, dstBytes).fill(0);
					// Copy source indices into WASM memory
					new Uint8Array(wasmMem.buffer, wasmSrcPtr, srcBytes).set(data);

					wasmInstance.exports.compilePal(
						wasmPalPtr,
						wasmSrcPtr,
						dstPtr,
						width,
						height,
						gl_width,
						gl_height,
						start_x,
						start_y
					);

					out = new Uint8Array(new Uint8Array(wasmMem.buffer, dstPtr, dstBytes));
				} else {
					out = new Uint8Array(gl_width * gl_height);
					for (let y = 0; y < height; ++y) {
						const srcRow = y * width;
						const dstRow = (y + start_y) * gl_width + start_x; // precomputed destination row offset
						for (let x = 0; x < width; ++x) {
							const idx = data[srcRow + x];

							// Fast transparency check using pre-calculated 32-bit palette
							// OLD: O(pixels * 3)
							// NEW: O(256) + O(pixels * 1)
							// Set all colors to 0 if collor is Magenta (RO Magic Collor)
							if (pal32[idx] === MAGENTA) {
								out[dstRow + x] = 0; // Fully transparent pixel
							} else {
								out[dstRow + x] = idx;
							}
						}
					}
				}
			}

			// RGBA Images
			else {
				if (width <= 0 || height <= 0) {
					out = new Uint8Array(gl_width * gl_height * 4);
				} else if (wasmInstance) {
					const srcBytes = width * height * 4;
					const dstBytes = gl_width * gl_height * 4;
					const dstPtr = wasmSrcPtr + srcBytes;
					const totalBytesNeeded = dstPtr + dstBytes;

					if (wasmMem.buffer.byteLength < totalBytesNeeded) {
						const additionalPages = Math.ceil((totalBytesNeeded - wasmMem.buffer.byteLength) / 65536);
						wasmMem.grow(additionalPages);
					}

					// Zero-initialize destination buffer in WASM memory
					new Uint8Array(wasmMem.buffer, dstPtr, dstBytes).fill(0);
					// Copy source RGBA into WASM memory
					new Uint8Array(wasmMem.buffer, wasmSrcPtr, srcBytes).set(data);

					wasmInstance.exports.compileRgba(wasmSrcPtr, dstPtr, width, height, gl_width, start_x, start_y);

					out = new Uint8Array(new Uint8Array(wasmMem.buffer, dstPtr, dstBytes));
				} else {
					out = new Uint8Array(gl_width * gl_height * 4);
					// Use 32-bit views destination for maximum throughput
					const out32 = new Uint32Array(out.buffer);

					for (let y = 0; y < height; ++y) {
						const srcRow = (height - y - 1) * width * 4;
						const dstRow = (y + start_y) * gl_width + start_x;

						for (let x = 0; x < width; ++x) {
							const srcIdx = srcRow + x * 4;

							/**
							 * OLD LOGIC: Manual per-channel assignments (out[dst+0]=... out[dst+3]=...). 4 loads + 4 stores + branches.
							 * NEW LOGIC: Reads RGBA bytes, remaps color channels using bitwise operations, and writes the result as a single 32-bit integer. 4 loads + 1 store.
							 */

							// Set all colors to 0 if alpha is also 0
							// This fixes white outlines appearing on RGBA sprites
							const a = data[srcIdx];
							if (a === 0) {
								out32[dstRow + x] = 0; // Fully transparent pixel
							} else {
								const r = data[srcIdx + 3];
								const g = data[srcIdx + 2];
								const b = data[srcIdx + 1];
								// Writing (A<<24 | B<<16 | G<<8 | R) produces LE memory bytes [R, G, B, A], which matches Canvas ImageData (RGBA).
								// Reconstruct as 32-bit integer (A B G R -> 0xAABBGGRR)
								out32[dstRow + x] = (a << 24) | (b << 16) | (g << 8) | r;
							}
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
		}

		return {
			frames: output,
			palette: this.palette,
			rgba_index: this.rgba_index,
			old_rgba_index: this._indexed_count
		};
	}
}
export default SPR;
