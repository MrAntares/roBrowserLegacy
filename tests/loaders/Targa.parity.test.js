import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ---------------- TGA builders ----------------

/**
 * Build a synthetic TGA binary.
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} opts.pixelDepth - 8, 16, 24 or 32
 * @param {number} opts.imageType - Targa.Type
 * @param {number} opts.flags - origin bits (0x00 BL, 0x10 BR, 0x20 TL, 0x30 TR)
 * @param {Uint8Array} [opts.palette] - BGR palette (3 bytes per entry)
 * @param {Uint8Array} [opts.payload] - raw/RLE pixel payload
 */
function buildTGA({ width, height, pixelDepth, imageType = 2, flags = 0x20, palette = null, payload = null }) {
	const headerSize = 18;
	const palSize = palette ? palette.length : 0;
	const body = payload || new Uint8Array(width * height * (pixelDepth >> 3));
	const data = new Uint8Array(headerSize + palSize + body.length);
	const view = new DataView(data.buffer);

	data[0] = 0;                    // idLength
	data[1] = palette ? 1 : 0;      // colorMapType
	data[2] = imageType;            // imageType
	view.setUint16(3, 0, true);     // colorMapIndex
	view.setUint16(5, palSize / 3, true); // colorMapLength (entries)
	data[7] = palette ? 24 : 0;     // colorMapDepth
	view.setUint16(8, 0, true);     // offsetX
	view.setUint16(10, 0, true);    // offsetY
	view.setUint16(12, width, true);
	view.setUint16(14, height, true);
	data[16] = pixelDepth;          // pixelDepth
	data[17] = flags;               // flags (origin)

	if (palette) {
		data.set(palette, headerSize);
	}
	data.set(body, headerSize + palSize);
	return data;
}

/**
 * Encode raw pixels as a TGA RLE stream (RLE + raw packets).
 *
 * TGA RLE packets count *pixels*, not bytes: an RLE packet is followed by a
 * single pixel that is repeated `count` times, a raw packet is followed by
 * `count` pixels.
 */
function encodeRLE(px, pixelSize = 1) {
	const out = [];
	const pixelCount = Math.floor(px.length / pixelSize);
	const same = (a, b) => {
		for (let k = 0; k < pixelSize; k++) {
			if (px[a * pixelSize + k] !== px[b * pixelSize + k]) return false;
		}
		return true;
	};

	let p = 0;
	while (p < pixelCount) {
		// RLE packet: count the identical pixels that follow
		let run = 1;
		while (p + run < pixelCount && run < 128 && same(p, p + run)) {
			run++;
		}

		if (run >= 2) {
			out.push(0x80 | (run - 1));
			for (let k = 0; k < pixelSize; k++) out.push(px[p * pixelSize + k]);
			p += run;
			continue;
		}

		// Raw packet: gather pixels until a run of 2+ identical pixels starts
		let len = 1;
		while (p + len < pixelCount && len < 128) {
			if (p + len + 1 < pixelCount && same(p + len, p + len + 1)) break;
			len++;
		}
		out.push(len - 1);
		for (let k = 0; k < len; k++) {
			for (let c = 0; c < pixelSize; c++) out.push(px[(p + k) * pixelSize + c]);
		}
		p += len;
	}
	return Uint8Array.from(out);
}

function makePalette() {
	const pal = new Uint8Array(256 * 3); // BGR
	for (let i = 0; i < 256; i++) {
		pal[i * 3] = i;
		pal[i * 3 + 1] = 255 - i;
		pal[i * 3 + 2] = (i * 37) & 0xff;
	}
	return pal;
}

function makeRawPixels(width, height, pixelSize) {
	const px = new Uint8Array(width * height * pixelSize);
	for (let i = 0; i < px.length; i++) {
		px[i] = (i * 13 + (i >> 5)) & 0xff;
	}
	return px;
}

function makeIndices(width, height) {
	const px = new Uint8Array(width * height);
	for (let i = 0; i < px.length; i++) {
		px[i] = (i * 7 + Math.floor(i / width) * 13) & 0xff;
	}
	return px;
}

/**
 * Reference RLE decoder, independent from the production code.
 * Reading past the end of the stream yields zero bytes, exactly like the
 * production JS fallback (`data[offset++]` is `undefined` and coerces to 0).
 */
function referenceRLE(data, offset, pixelSize, outputSize) {
	const output = new Uint8Array(outputSize);
	const pixels = new Uint8Array(pixelSize);
	let pos = 0;

	while (pos < outputSize) {
		const c = data[offset++];
		const count = (c & 0x7f) + 1;

		if (c & 0x80) {
			for (let i = 0; i < pixelSize; ++i) {
				pixels[i] = data[offset++];
			}
			for (let i = 0; i < count; ++i) {
				output.set(pixels, pos);
				pos += pixelSize;
			}
		} else {
			const total = count * pixelSize;
			for (let i = 0; i < total; ++i) {
				output[pos++] = data[offset++];
			}
		}
	}
	return output;
}

// ---------------- Module loading ----------------

async function loadTarga({ fallback }) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/targa.js', () => ({ getTargaWasm: () => null }));
	} else {
		vi.doUnmock('Loaders/wasm/targa.js');
		const { getTargaWasm } = await import('Loaders/wasm/targa.js');
		expect(getTargaWasm()).not.toBeNull();
	}
	return (await import('Loaders/Targa.js')).default;
}

/**
 * Reset the WASM mock between runs.
 * NOTE: must live inside a `describe` block, Vitest 4 no longer accepts
 * top-level `afterEach` hooks.
 */
function resetWasmMock() {
	vi.doUnmock('Loaders/wasm/targa.js');
}

// ---------------- Test cases ----------------

const RLE_CASES = [
	['24-bit RLE_RGB', 24, 10, 3],
	['16-bit RLE_RGB', 16, 10, 2],
	['8-bit RLE_INDEXED', 8, 9, 1]
];

describe.each([['WASM', false], ['fallback JS', true]])('Targa RLE decoding via %s', (_label, fallback) => {
	afterEach(resetWasmMock);

	it.each(RLE_CASES)('%s matches the reference decoder', async (_name, pixelDepth, imageType, pixelSize) => {
		const Targa = await loadTarga({ fallback });

		const width = 16;
		const height = 8;
		const palette = imageType === 9 ? makePalette() : null;
		const raw = pixelSize === 1 ? makeIndices(width, height) : makeRawPixels(width, height, pixelSize);
		const rle = encodeRLE(raw, pixelSize);

		const tga = new Targa();
		const file = buildTGA({ width, height, pixelDepth, imageType, flags: 0x20, palette, payload: rle });
		tga.load(file);

		// The decoded stream must match the reference decoder byte for byte.
		const headerSize = 18;
		const palSize = palette ? palette.length : 0;
		const expected = referenceRLE(file, headerSize + palSize, pixelSize, raw.length);

		expect(tga.imageData.length).toBe(raw.length);
		expect(Buffer.from(tga.imageData).equals(Buffer.from(expected))).toBe(true);
	});

	it('decodes a large stream (forces memory.grow)', async () => {
		const Targa = await loadTarga({ fallback });

		const width = 256;
		const height = 256;
		const raw = makeRawPixels(width, height, 3);
		const rle = encodeRLE(raw, 3);

		const tga = new Targa();
		const file = buildTGA({ width, height, pixelDepth: 24, imageType: 10, flags: 0x20, payload: rle });
		tga.load(file);

		const expected = referenceRLE(file, 18, 3, raw.length);
		expect(tga.imageData.length).toBe(raw.length);
		expect(Buffer.from(tga.imageData).equals(Buffer.from(expected))).toBe(true);
	});

	it.each([3, 256 * 3])('zero-fills missing RLE pixels with %i palette bytes', async paletteBytes => {
		const Targa = await loadTarga({ fallback });
		const palette = makePalette();
		const file = buildTGA({
			width: 256,
			height: 256,
			pixelDepth: 8,
			imageType: 9,
			palette,
			payload: new Uint8Array(0)
		}).subarray(0, 18 + paletteBytes);

		const tga = new Targa();
		tga.load(file);

		expect(tga.palette).toEqual(palette.subarray(0, paletteBytes));
		expect(tga.imageData).toEqual(referenceRLE(file, 18 + palette.length, 1, 256 * 256));
	});

	it('rejects an RLE run longer than the image', async () => {
		const Targa = await loadTarga({ fallback });
		const file = buildTGA({
			width: 1,
			height: 1,
			pixelDepth: 24,
			imageType: 10,
			payload: Uint8Array.from([0x81, 1, 2, 3])
		});
		expect(() => new Targa().load(file)).toThrow(RangeError);
	});

	it('zero-fills a truncated stream instead of returning a short buffer', async () => {
		const Targa = await loadTarga({ fallback });

		const width = 16;
		const height = 8;
		const raw = makeRawPixels(width, height, 3);
		// Keep only the first packet: the decoder must still fill the whole buffer.
		const rle = encodeRLE(raw, 3).subarray(0, 4);

		const tga = new Targa();
		const file = buildTGA({ width, height, pixelDepth: 24, imageType: 10, flags: 0x20, payload: rle });
		tga.load(file);

		const expected = referenceRLE(file, 18, 3, raw.length);
		expect(tga.imageData.length).toBe(raw.length);
		expect(Buffer.from(tga.imageData).equals(Buffer.from(expected))).toBe(true);
	});
});

describe('Targa.wat in sync with Base64', () => {
	it('wat2wasm(.wat) === Built-in Base64', async () => {
		vi.doUnmock('Loaders/wasm/targa.js');
		vi.resetModules();
		const { TARGA_WASM_BASE64 } = await import('Loaders/wasm/targa.js');
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/targa.wat'), 'utf8');
		const mod = wabt.parseWat('targa.wat', src);
		mod.validate({});
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(TARGA_WASM_BASE64).toBeTypeOf('string');
		expect(Buffer.from(buffer).toString('base64')).toBe(TARGA_WASM_BASE64);
	});
});
