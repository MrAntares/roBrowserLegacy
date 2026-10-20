import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getSpriteCompileWasm, SPRITE_COMPILE_WASM_BASE64 } from 'Loaders/wasm/spriteCompile.js';

// Independent reference implementation for PAL -> Canvas RGBA (ABGR in Little-Endian)
function referencePal(pal, indices, width, height) {
	// pal32 with flip=true: (a<<24) | (b<<16) | (g<<8) | r
	const pal32 = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		const r = pal[i * 4 + 0];
		const g = pal[i * 4 + 1];
		const b = pal[i * 4 + 2];
		const a = i === 0 ? 0 : 255;
		pal32[i] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
	}

	const out = new Uint8Array(width * height * 4);
	const out32 = new Uint32Array(out.buffer);
	for (let y = 0; y < height; y++) {
		const rowStart = y * width;
		for (let x = 0; x < width; x++) {
			out32[rowStart + x] = pal32[indices[rowStart + x]];
		}
	}
	return out;
}

// Independent reference implementation for RGBA -> Canvas RGBA (with vertical flip and channel swizzle)
function referenceRgba(src, width, height) {
	const out = new Uint8Array(width * height * 4);
	const out32 = new Uint32Array(out.buffer);
	const src32 = new Uint32Array(src.buffer, src.byteOffset, width * height);

	for (let y = 0; y < height; y++) {
		const srcRow = y * width;
		const dstRow = (height - y - 1) * width;
		for (let x = 0; x < width; x++) {
			const p = src32[srcRow + x];
			out32[dstRow + x] = (
				((p & 0x000000ff) << 24) |
				((p & 0x0000ff00) << 8) |
				((p & 0x00ff0000) >> 8) |
				((p & 0xff000000) >>> 24)
			) >>> 0;
		}
	}
	return out;
}

function makePalette() {
	const pal = new Uint8Array(1024);
	for (let i = 0; i < 256; i++) {
		pal[i * 4 + 0] = i;
		pal[i * 4 + 1] = (255 - i) & 0xff;
		pal[i * 4 + 2] = (i * 37) & 0xff;
		pal[i * 4 + 3] = 0;
	}
	return pal;
}

function makePalIndices(width, height) {
	const data = new Uint8Array(width * height);
	for (let i = 0; i < data.length; i++) {
		// Include 0 (transparent) and varied values
		data[i] = (i * 7 + Math.floor(i / width) * 13) & 0xff;
	}
	return data;
}

function makeRgbaData(width, height) {
	const data = new Uint8Array(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		// Test alpha 0 and 255 along with color variations
		const a = i % 5 === 0 ? 0 : 255;
		const b = (i * 11) & 0xff;
		const g = (i * 7) & 0xff;
		const r = (i * 3) & 0xff;
		data[i * 4 + 0] = a;
		data[i * 4 + 1] = b;
		data[i * 4 + 2] = g;
		data[i * 4 + 3] = r;
	}
	return data;
}

async function loadSPR({ fallback }) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/spriteCompile.js', () => ({ getSpriteCompileWasm: () => null }));
	} else {
		vi.doUnmock('Loaders/wasm/spriteCompile.js');
		const { getSpriteCompileWasm } = await import('Loaders/wasm/spriteCompile.js');
		expect(getSpriteCompileWasm()).not.toBeNull();
	}
	return (await import('Loaders/Sprite.js')).default;
}

function ensureWasm(mem, need) {
	if (mem.buffer.byteLength < need) {
		mem.grow(Math.ceil((need - mem.buffer.byteLength) / 65536));
	}
}

// Non-symmetric dimensions to detect incorrect vertical flip
const TEST_CASES = [
	['small frame', 7, 13],
	['asymmetric rect', 35, 17],
	['medium frame', 128, 64],
	['large frame (grow WASM linear memory)', 300, 300]
];

describe('spriteCompile WASM direct exports parity with reference', () => {
	const wasm = getSpriteCompileWasm();
	it('WASM instance available and exports new functions', () => {
		expect(wasm).not.toBeNull();
		expect(wasm.exports.framePalToCanvas).toBeTypeOf('function');
		expect(wasm.exports.frameRgbaToCanvas).toBeTypeOf('function');
	});

	it.each(TEST_CASES)('framePalToCanvas %s (%ix%i)', (_desc, w, h) => {
		const { memory, framePalToCanvas } = wasm.exports;
		const pal = makePalette();
		const pal32 = new Uint32Array(256);
		for (let i = 0; i < 256; i++) {
			const r = pal[i * 4 + 0], g = pal[i * 4 + 1], b = pal[i * 4 + 2], a = i === 0 ? 0 : 255;
			pal32[i] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
		}

		const src = makePalIndices(w, h);
		const palPtr = 0;
		const srcPtr = 1024;
		const dstPtr = srcPtr + w * h;
		const totalNeeded = dstPtr + w * h * 4;

		ensureWasm(memory, totalNeeded);
		new Uint32Array(memory.buffer, palPtr, 256).set(pal32);
		new Uint8Array(memory.buffer, srcPtr, w * h).set(src);

		framePalToCanvas(palPtr, srcPtr, dstPtr, w, h);

		const result = new Uint8Array(memory.buffer, dstPtr, w * h * 4).slice();
		const expected = referencePal(pal, src, w, h);
		expect(Buffer.from(result).equals(Buffer.from(expected))).toBe(true);
	});

	it.each(TEST_CASES)('frameRgbaToCanvas %s (%ix%i)', (_desc, w, h) => {
		const { memory, frameRgbaToCanvas } = wasm.exports;
		const src = makeRgbaData(w, h);
		const srcPtr = 1024;
		const dstPtr = srcPtr + w * h * 4;
		const totalNeeded = dstPtr + w * h * 4;

		ensureWasm(memory, totalNeeded);
		new Uint8Array(memory.buffer, srcPtr, w * h * 4).set(src);

		frameRgbaToCanvas(srcPtr, dstPtr, w, h);

		const result = new Uint8Array(memory.buffer, dstPtr, w * h * 4).slice();
		const expected = referenceRgba(src, w, h);
		expect(Buffer.from(result).equals(Buffer.from(expected))).toBe(true);
	});
});

describe('spriteCompile.wat in sync with Base64', () => {
	it('wat2wasm(.wat) === SPRITE_COMPILE_WASM_BASE64', async () => {
		const wabt = await (await import('wabt')).default();
		const watSrc = fs.readFileSync(path.resolve('src/Loaders/wasm/spriteCompile.wat'), 'utf8');
		const mod = wabt.parseWat('spriteCompile.wat', watSrc);
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(Buffer.from(buffer).toString('base64')).toBe(SPRITE_COMPILE_WASM_BASE64);
	});
});

describe.each([['WASM', false], ['fallback JS', true]])('SPR.getCanvasFromFrame() via %s', (_name, fallback) => {
	afterEach(() => {
		vi.doUnmock('Loaders/wasm/spriteCompile.js');
	});

	it.each(TEST_CASES)('PAL frame %s (%ix%i) matches reference', async (_desc, w, h) => {
		const SPR = await loadSPR({ fallback });
		const pal = makePalette();
		const indices = makePalIndices(w, h);

		let capturedImageData = null;
		const originalPut = CanvasRenderingContext2D.prototype.putImageData;
		CanvasRenderingContext2D.prototype.putImageData = function (imgData) {
			capturedImageData = imgData;
			return originalPut.apply(this, arguments);
		};

		try {
			const spr = Object.create(SPR.prototype);
			spr.palette = pal;
			spr.frames = [{
				type: SPR.TYPE_PAL,
				width: w,
				height: h,
				data: indices
			}];

			const canvas = spr.getCanvasFromFrame(0);
			expect(canvas.width).toBe(w);
			expect(canvas.height).toBe(h);
			expect(capturedImageData).not.toBeNull();

			const expected = referencePal(pal, indices, w, h);
			expect(Buffer.from(capturedImageData.data).equals(Buffer.from(expected))).toBe(true);
		} finally {
			CanvasRenderingContext2D.prototype.putImageData = originalPut;
		}
	});

	it.each(TEST_CASES)('RGBA frame %s (%ix%i) matches reference', async (_desc, w, h) => {
		const SPR = await loadSPR({ fallback });
		const rgbaData = makeRgbaData(w, h);

		let capturedImageData = null;
		const originalPut = CanvasRenderingContext2D.prototype.putImageData;
		CanvasRenderingContext2D.prototype.putImageData = function (imgData) {
			capturedImageData = imgData;
			return originalPut.apply(this, arguments);
		};

		try {
			const spr = Object.create(SPR.prototype);
			spr.palette = makePalette();
			spr.frames = [{
				type: SPR.TYPE_RGBA,
				width: w,
				height: h,
				data: rgbaData
			}];

			const canvas = spr.getCanvasFromFrame(0);
			expect(canvas.width).toBe(w);
			expect(canvas.height).toBe(h);
			expect(capturedImageData).not.toBeNull();

			const expected = referenceRgba(rgbaData, w, h);
			expect(Buffer.from(capturedImageData.data).equals(Buffer.from(expected))).toBe(true);
		} finally {
			CanvasRenderingContext2D.prototype.putImageData = originalPut;
		}
	});

	it('returns error canvas for empty or invalid frame dimensions', async () => {
		const SPR = await loadSPR({ fallback });
		const spr = Object.create(SPR.prototype);
		spr.frames = [{ type: SPR.TYPE_PAL, width: 0, height: 0, data: new Uint8Array(0) }];

		const canvas = spr.getCanvasFromFrame(0);
		expect(canvas.width).toBe(30);
		expect(canvas.height).toBe(30);
	});

	it('reuses cached _pal32Canvas across multiple getCanvasFromFrame calls', async () => {
		const SPR = await loadSPR({ fallback });
		const spr = Object.create(SPR.prototype);
		spr.palette = makePalette();
		spr.frames = [{
			type: SPR.TYPE_PAL,
			width: 10,
			height: 10,
			data: makePalIndices(10, 10)
		}];

		spr.getCanvasFromFrame(0);
		expect(spr._pal32Canvas).toBeDefined();
		expect(spr._pal32Canvas).not.toBeNull();
		const cached = spr._pal32Canvas;

		spr.getCanvasFromFrame(0);
		expect(spr._pal32Canvas).toBe(cached);
	});
});
