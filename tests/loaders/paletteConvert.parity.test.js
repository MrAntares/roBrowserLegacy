import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const W = 64, H = 32; // multi-line, no vertical symmetry

function makePalette() {
	const pal = new Uint8Array(1024);
	for (let i = 0; i < 256; i++) {
		pal[i * 4] = i; pal[i * 4 + 1] = 255 - i; pal[i * 4 + 2] = (i * 37) & 0xff; pal[i * 4 + 3] = 0;
	}
	return pal;
}

function makeIndices(w, h) {
	const d = new Uint8Array(w * h);
	for (let i = 0; i < d.length; i++) d[i] = (i * 7 + Math.floor(i / w) * 13) & 0xff; // includes index 0 (transparent) 
	return d;
}

// Reference: specification independent of production code
function reference(pal, idx, w, h) {
	const out = new Uint8Array(w * h * 4);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const c = idx[y * w + x];
			const o = ((h - y - 1) * w + x) * 4;
			// convert32bPal(pal, false) => (r<<24|g<<16|b<<8|a) in LE => bytes [a, b, g, r] 
			out[o] = c === 0 ? 0 : 255;
			out[o + 1] = pal[c * 4 + 2];
			out[o + 2] = pal[c * 4 + 1];
			out[o + 3] = pal[c * 4];
		}
	}
	return out;
}

async function loadSPR({ fallback }) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/paletteConvert.js', () => ({ getPaletteConvertWasm: () => null }));
	} else {
		vi.doUnmock('Loaders/wasm/paletteConvert.js');
		const { getPaletteConvertWasm } = await import('Loaders/wasm/paletteConvert.js');
		expect(getPaletteConvertWasm()).not.toBeNull();
	}
	return (await import('Loaders/Sprite.js')).default;
}

const CASES = [
	['multi-line (vertical flip)', [[W, H]]],
	['multiple frames', [[4, 4], [1, 9], [9, 1], [0, 0]]],
	['large frame (force memory.grow)', [[300, 300]]], // 90k*5 bytes > 1 page of 64KiB
];

afterEach(() => { vi.doUnmock('Loaders/wasm/paletteConvert.js'); });

// SPR RLE: zeros become [0, count]; other bytes are literals
function encodeRLE(px) {
	const out = [];
	for (let i = 0; i < px.length;) {
		if (px[i] === 0) {
			let n = 0;
			while (i < px.length && px[i] === 0 && n < 255) { n++; i++; }
			out.push(0, n);
		} else out.push(px[i++]);
	}
	return Uint8Array.from(out);
}

// SPR v2.1 with N indexed frames
function buildSPR(frames, pal) {
	const rles = frames.map(f => {
		const rle = encodeRLE(f.idx);
		if (rle.length > 0xFFFF) throw new Error(`RLE ${rle.length} B exceeds uint16 (${f.w}x${f.h})`);
		return rle;
	});
	const size = 8 + rles.reduce((s, r) => s + 6 + r.length, 0) + 1024;
	const buff = new ArrayBuffer(size), v = new DataView(buff), b = new Uint8Array(buff);
	b.set([0x53, 0x50, 1, 2]); v.setUint16(4, frames.length, true); v.setUint16(6, 0, true);
	let off = 8;
	frames.forEach((f, i) => {
		v.setUint16(off, f.w, true); v.setUint16(off + 2, f.h, true); v.setUint16(off + 4, rles[i].length, true);
		b.set(rles[i], off + 6); off += 6 + rles[i].length;
	});
	b.set(pal, size - 1024);
	return buff;
}

function makeFrames(dims) {
	return dims.map(([w, h]) => {
		const idx = makeIndices(w, h);
		if (idx.length > 8) idx.fill(0, 0, 8); // guarantees a sequence of zeros (transparency) 
		return { w, h, idx };
	});
}

function check(SPR, spr, frames, pal) {
	expect(spr.frames.length).toBe(frames.length);
	frames.forEach((f, i) => {
		expect(spr.frames[i].type).toBe(SPR.TYPE_RGBA);
		expect(Buffer.from(spr.frames[i].data).equals(Buffer.from(reference(pal, f.idx, f.w, f.h)))).toBe(true);
	});
}

const PARSE_CASES = [
	['multi-line (vertical flip)', [[W, H]]],
	['multiple frames + empty', [[4, 4], [1, 9], [9, 1], [0, 0], [W, H]]],
];
const DIRECT_CASES = [
	...PARSE_CASES,
	['large frame (force memory.grow)', [[300, 300]]], // 90k*5 B > 64KiB
];

describe.each([['WASM', false], ['fallback JS', true]])('switchToRGBA via %s', (_, fallback) => {
	it.each(PARSE_CASES)('parsed SPR matches reference: %s', async (_n, dims) => {
		const SPR = await loadSPR({ fallback });
		const pal = makePalette(), frames = makeFrames(dims);
		const spr = new SPR(buildSPR(frames, pal));
		// ensures that parse didn't truncate anything 
		frames.forEach((f, i) => expect(Buffer.from(spr.frames[i].data).equals(Buffer.from(f.idx))).toBe(true));
		spr.switchToRGBA();
		check(SPR, spr, frames, pal);
	});

	it.each(DIRECT_CASES)('injected frames match reference: %s', async (_n, dims) => {
		const SPR = await loadSPR({ fallback });
		const pal = makePalette(), frames = makeFrames(dims);
		const spr = Object.create(SPR.prototype);
		spr.palette = pal;
		spr.indexed_count = frames.length;
		spr.frames = frames.map(f => ({ type: SPR.TYPE_PAL, width: f.w, height: f.h, data: f.idx.slice() }));
		spr.switchToRGBA();
		check(SPR, spr, frames, pal);
	});
});

describe('paletteConvert.wat in sync with Base64', () => {
	it('wat2wasm(.wat) === Built-in Base64', async () => {
		vi.doUnmock('Loaders/wasm/paletteConvert.js');
		vi.resetModules();
		const { PALETTE_CONVERT_WASM_BASE64 } = await import('Loaders/wasm/paletteConvert.js');
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/paletteConvert.wat'), 'utf8');
		const mod = wabt.parseWat('paletteConvert.wat', src);
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(PALETTE_CONVERT_WASM_BASE64).toBeTypeOf('string');
		expect(Buffer.from(buffer).toString('base64')).toBe(PALETTE_CONVERT_WASM_BASE64);
	});
});