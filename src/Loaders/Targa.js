/**
 * Loaders/Targa.js
 *
 * Loaders for .tga image file (Targa Truevision)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * TGA Class
 */
class Targa {
	/**
	 * @var {object} TGA type constants
	 */
	static Type = {
		NO_DATA: 0,
		INDEXED: 1,
		RGB: 2,
		GREY: 3,
		RLE_INDEXED: 9,
		RLE_RGB: 10,
		RLE_GREY: 11
	};

	/**
	 * @var {object} TGA origin constants
	 */
	static Origin = {
		BOTTOM_LEFT: 0x00,
		BOTTOM_RIGHT: 0x01,
		TOP_LEFT: 0x02,
		TOP_RIGHT: 0x03,
		SHIFT: 0x04,
		MASK: 0x30
	};

	/**
	 * Check the header of TGA file to detect errors
	 * @static
	 * @private
	 * @param {object} header - tga header structure
	 * @throws Error
	 */
	static _checkHeader(header) {
		// What the need of a file without data ?
		if (header.imageType === Targa.Type.NO_DATA) {
			throw new Error('Targa::_checkHeader() - No data');
		}

		// Indexed type
		if (header.hasColorMap) {
			if (header.colorMapLength > 256 || header.colorMapSize !== 24 || header.colorMapType !== 1) {
				throw new Error('Targa::_checkHeader() - Invalid colormap for indexed type');
			}
		} else {
			if (header.colorMapType) {
				throw new Error('Targa::_checkHeader() - Why does the image contain a palette ?');
			}
		}

		// Check image size
		if (header.width <= 0 || header.height <= 0) {
			throw new Error('Targa::_checkHeader() - Invalid image size');
		}

		// Check pixel size
		if (header.pixelDepth !== 8 && header.pixelDepth !== 16 && header.pixelDepth !== 24 && header.pixelDepth !== 32) {
			throw new Error(`Targa::_checkHeader() - Invalid pixel size "${header.pixelDepth}"`);
		}
	}

	/**
	 * Decode RLE compression
	 * @static
	 * @private
	 * @param {Uint8Array} data
	 * @param {number} offset - offset in data to start loading RLE
	 * @param {number} pixelSize
	 * @param {number} outputSize - output buffer size
	 * @returns {Uint8Array}
	 */
	static _decodeRLE(data, offset, pixelSize, outputSize) {
		const output = new Uint8Array(outputSize);
		const pixels = new Uint8Array(pixelSize);
		let pos = 0;

		while (pos < outputSize) {
			const c = data[offset++];
			let count = (c & 0x7f) + 1;

			// RLE pixels.
			if (c & 0x80) {
				// Bind pixel tmp array
				for (let i = 0; i < pixelSize; ++i) {
					pixels[i] = data[offset++];
				}

				// Copy pixel array
				for (let i = 0; i < count; ++i) {
					output.set(pixels, pos);
					pos += pixelSize;
				}
			}

			// Raw pixels.
			else {
				count *= pixelSize;
				for (let i = 0; i < count; ++i) {
					output[pos++] = data[offset++];
				}
			}
		}

		return output;
	}

	/**
	 * Constructor
	 */
	constructor() {
		this.header = null;
		this.palette = null;
		this.imageData = null;
	}

	/**
	 * Open a targa file using fetch
	 * @param {string} path - Path of the filename to load
	 * @returns {Promise<Targa>}
	 */
	async open(path) {
		try {
			const response = await fetch(path);
			if (!response.ok) {
				throw new Error(`Targa::open() - HTTP error! status: ${response.status}`);
			}
			const buffer = await response.arrayBuffer();
			this.load(new Uint8Array(buffer));
			return this;
		} catch (error) {
			console.error(`Targa::open() - Failed to load ${path}`, error);
			throw error;
		}
	}

	/**
	 * Load and parse a TGA file
	 * @param {Uint8Array} data - TGA file buffer array
	 */
	load(data) {
		let offset = 0;

		// Not enough data to contain header ?
		if (data.length < 0x12) {
			throw new Error('Targa::load() - Not enough data to contain header');
		}

		// Read TgaHeader
		this.header = {
			/* 0x00  BYTE */ idLength: data[offset++],
			/* 0x01  BYTE */ colorMapType: data[offset++],
			/* 0x02  BYTE */ imageType: data[offset++],
			/* 0x03  WORD */ colorMapIndex: data[offset++] | (data[offset++] << 8),
			/* 0x05  WORD */ colorMapLength: data[offset++] | (data[offset++] << 8),
			/* 0x07  BYTE */ colorMapDepth: data[offset++],
			/* 0x08  WORD */ offsetX: data[offset++] | (data[offset++] << 8),
			/* 0x0a  WORD */ offsetY: data[offset++] | (data[offset++] << 8),
			/* 0x0c  WORD */ width: data[offset++] | (data[offset++] << 8),
			/* 0x0e  WORD */ height: data[offset++] | (data[offset++] << 8),
			/* 0x10  BYTE */ pixelDepth: data[offset++],
			/* 0x11  BYTE */ flags: data[offset++]
		};

		// Set shortcut
		this.header.hasEncoding =
			this.header.imageType === Targa.Type.RLE_INDEXED ||
			this.header.imageType === Targa.Type.RLE_RGB ||
			this.header.imageType === Targa.Type.RLE_GREY;
		this.header.hasColorMap =
			this.header.imageType === Targa.Type.RLE_INDEXED || this.header.imageType === Targa.Type.INDEXED;
		this.header.isGreyColor =
			this.header.imageType === Targa.Type.RLE_GREY || this.header.imageType === Targa.Type.GREY;

		// Check if a valid TGA file (or if we can load it)
		Targa._checkHeader(this.header);

		// Move to data
		offset += this.header.idLength;
		if (offset >= data.length) {
			throw new Error('Targa::load() - No data');
		}

		// Read palette
		if (this.header.hasColorMap) {
			const colorMapSize = this.header.colorMapLength * (this.header.colorMapDepth >> 3);
			this.palette = data.subarray(offset, offset + colorMapSize);
			offset += colorMapSize;
		}

		const pixelSize = this.header.pixelDepth >> 3;
		const imageSize = this.header.width * this.header.height;
		const pixelTotal = imageSize * pixelSize;

		// RLE encoded
		if (this.header.hasEncoding) {
			this.imageData = Targa._decodeRLE(data, offset, pixelSize, pixelTotal);
		}

		// RAW pixels
		else {
			this.imageData = data.subarray(offset, offset + (this.header.hasColorMap ? imageSize : pixelTotal));
		}
	}

	/**
	 * Return a ImageData object from a TGA file
	 * @param {object} imageData - Optional ImageData to work with
	 * @returns {object} imageData
	 */
	getImageData(imageData = null) {
		const { width, height, flags, pixelDepth, isGreyColor } = this.header;

		// Create an imageData
		if (!imageData) {
			imageData = { width, height, data: new Uint8ClampedArray(width * height * 4) };
		}

		const origin = (flags & Targa.Origin.MASK) >> Targa.Origin.SHIFT;
		let x_start, x_step, x_end, y_start, y_step, y_end;

		if (origin === Targa.Origin.TOP_LEFT || origin === Targa.Origin.TOP_RIGHT) {
			y_start = 0;
			y_step = 1;
			y_end = height;
		} else {
			y_start = height - 1;
			y_step = -1;
			y_end = -1;
		}

		if (origin === Targa.Origin.TOP_LEFT || origin === Targa.Origin.BOTTOM_LEFT) {
			x_start = 0;
			x_step = 1;
			x_end = width;
		} else {
			x_start = width - 1;
			x_step = -1;
			x_end = -1;
		}

		const data = imageData.data;
		const input = this.imageData;
		const buffer32 = new Uint32Array(data.buffer);
		let i = 0;

		switch (pixelDepth) {
			case 8:
				if (isGreyColor) {
					// 8-bit grayscale
					for (let y = y_start; y !== y_end; y += y_step) {
						const rowOffset = y * width;
						for (let x = x_start; x !== x_end; x += x_step) {
							const v = input[i++];
							buffer32[rowOffset + x] = (255 << 24) | (v << 16) | (v << 8) | v;
						}
					}
				} else {
					// 8-bit indexed (paletted)
					const colormap = this.palette;
					for (let y = y_start; y !== y_end; y += y_step) {
						const rowOffset = y * width;
						for (let x = x_start; x !== x_end; x += x_step) {
							const idx = input[i++] * 3;
							const b = colormap[idx + 0];
							const g = colormap[idx + 1];
							const r = colormap[idx + 2];
							buffer32[rowOffset + x] = (255 << 24) | (b << 16) | (g << 8) | r;
						}
					}
				}
				break;

			case 16:
				if (isGreyColor) {
					// 16-bit grayscale (intensity + alpha)
					for (let y = y_start; y !== y_end; y += y_step) {
						const rowOffset = y * width;
						for (let x = x_start; x !== x_end; x += x_step) {
							const intensity = input[i++];
							const alpha = input[i++];
							buffer32[rowOffset + x] = (alpha << 24) | (intensity << 16) | (intensity << 8) | intensity;
						}
					}
				} else {
					// 16-bit 5-5-5-1
					for (let y = y_start; y !== y_end; y += y_step) {
						const rowOffset = y * width;
						for (let x = x_start; x !== x_end; x += x_step) {
							const color = input[i] | (input[i + 1] << 8);
							i += 2;

							const r = (color & 0x7c00) >> 7;
							const g = (color & 0x03e0) >> 2;
							const b = (color & 0x001f) >> 3;
							const a = color & 0x8000 ? 255 : 0;

							buffer32[rowOffset + x] = (a << 24) | (b << 16) | (g << 8) | r;
						}
					}
				}
				break;

			case 24:
				for (let y = y_start; y !== y_end; y += y_step) {
					const rowOffset = y * width;
					for (let x = x_start; x !== x_end; x += x_step) {
						const b = input[i++];
						const g = input[i++];
						const r = input[i++];
						buffer32[rowOffset + x] = (255 << 24) | (b << 16) | (g << 8) | r;
					}
				}
				break;

			case 32: {
				const MAGENTA_MASK = 0x00ff00ff;
				const PIXEL_MASK = 0x00ffffff;
				for (let y = y_start; y !== y_end; y += y_step) {
					const rowOffset = y * width;
					for (let x = x_start; x !== x_end; x += x_step) {
						const pixel = (input[i + 3] << 24) | (input[i] << 16) | (input[i + 1] << 8) | input[i + 2];
						i += 4;
						buffer32[rowOffset + x] = (pixel & PIXEL_MASK) === MAGENTA_MASK ? 0 : pixel;
					}
				}
				break;
			}
		}
		return imageData;
	}

	/**
	 * Return a canvas with the TGA render on it
	 * @returns {HTMLCanvasElement}
	 */
	getCanvas() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const { width, height } = this.header;

		canvas.width = width;
		canvas.height = height;

		const imageData = ctx.createImageData(width, height);
		ctx.putImageData(this.getImageData(imageData), 0, 0);

		return canvas;
	}

	/**
	 * Return a dataURI of the TGA file
	 * @param {string} type - Optional image content-type to output (default: image/png)
	 * @returns {string} url
	 */
	getDataURL(type = 'image/png') {
		return this.getCanvas().toDataURL(type);
	}
}

export default Targa;
