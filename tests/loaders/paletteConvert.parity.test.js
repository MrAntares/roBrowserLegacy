import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Turn on/off the WASM path without touching the production code
let forceFallback = false;
vi.mock('Loaders/wasm/paletteConvert.js', async importOriginal => {
	const real = await importOriginal();
	return {
		...real,
		getPaletteConvertWasm: () => (forceFallback ? null : real.getPaletteConvertWasm()),
	};
});

import SPR from 'Loaders/Sprite.js';
import { PALETTE_CONVERT_WASM_BASE64, getPaletteConvertWasm } from 'Loaders/wasm/paletteConvert.js';
import { buildMinimalSPR } from './Sprite.test.helpers.js'; // extract existing helper

function makeFrame(w, h) {
	const pixels = new Uint8Array(w * h);
	// Lines different from each other, to detect errors in the vertical flip; uses the indexes 0..255 
	for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 7 + Math.floor(i / w)) & 0xff;
	return { w, h, pixels };
}

function convert(frames, fallback) {
	forceFallback = fallback;
	const spr = new SPR(buildMinimalSPR(frames));
	spr.switchToRGBA();
	return spr.frames.map(f => f.data);
}

describe('SPR.switchToRGBA WASM vs. fallback', () => {
	beforeEach(() => { forceFallback = false; });

	it('WASM is available in the test environment', () => {
		expect(getPaletteConvertWasm()).not.toBeNull();
	});

	it.each([
		['multi-row (vertical flip)', [makeFrame(5, 3)]],
		['multiple frames', [makeFrame(4, 4), makeFrame(1, 9), makeFrame(9, 1)]],
		['large frame (forces memory.grow)', [makeFrame(300, 300)]], // 90k px * 5 bytes > 64KiB
	])('identical output: %s', (_, frames) => {
		const wasm = convert(frames, false);
		const js = convert(frames, true);
		expect(wasm.length).toBe(js.length);
		wasm.forEach((buf, i) => expect(Buffer.from(buf).equals(Buffer.from(js[i]))).toBe(true));
	});

	it('fallback applies the vertical flip correctly', () => {
		const [out] = convert([makeFrame(2, 2)], true);
		const [ref] = convert([makeFrame(2, 2)], false);
		// the first row of the output should come from the last row of the input
		expect(out.subarray(0, 8)).toEqual(ref.subarray(0, 8));
	});
}); 
describe('paletteConvert.wat in sync with Base64', () => {
	it('wat2wasm(.wat) === Built-in Base64', async () => {
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/paletteConvert.wat'), 'utf8');
		const mod = wabt.parseWat('paletteConvert.wat', src);
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(Buffer.from(buffer).toString('base64')).toBe(PALETTE_CONVERT_WASM_BASE64);
	});
});