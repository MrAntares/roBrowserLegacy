import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const W = 64, H = 32; // multi-linha, sem simetria vertical

function makePalette() {
	const pal = new Uint8Array(1024);
	for (let i = 0; i < 256; i++) {
		pal[i * 4] = i; pal[i * 4 + 1] = 255 - i; pal[i * 4 + 2] = (i * 37) & 0xff; pal[i * 4 + 3] = 0;
	}
	return pal;
}

function makeIndices(w, h) {
	const d = new Uint8Array(w * h);
	for (let i = 0; i < d.length; i++) d[i] = (i * 7 + Math.floor(i / w) * 13) & 0xff; // inclui o índice 0 (transparente)
	return d;
}

// Referência: especificação independente do código de produção
function reference(pal, idx, w, h) {
	const out = new Uint8Array(w * h * 4);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const c = idx[y * w + x];
			const o = ((h - y - 1) * w + x) * 4;
			// convert32bPal(pal, false) => (r<<24|g<<16|b<<8|a) em LE => bytes [a, b, g, r]
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
	}
	return (await import('Loaders/Sprite.js')).default;
}

function run(SPR, dims) {
	const pal = makePalette();
	const inputs = dims.map(([w, h]) => makeIndices(w, h));
	const spr = Object.create(SPR.prototype);
	spr.palette = pal;
	spr.indexed_count = dims.length;
	spr.frames = dims.map(([w, h], i) => ({ type: SPR.TYPE_PAL, width: w, height: h, data: inputs[i] }));
	spr.switchToRGBA();
	return spr.frames.map((f, i) => ({ got: f.data, want: reference(pal, inputs[i], ...dims[i]), type: f.type }));
}

const CASES = [
	['multi-linha (flip vertical)', [[W, H]]],
	['vários frames', [[4, 4], [1, 9], [9, 1], [0, 0]]],
	['frame grande (força memory.grow)', [[300, 300]]], // 90k*5 bytes > 1 página de 64KiB
];

afterEach(() => { vi.doUnmock('Loaders/wasm/paletteConvert.js'); });

describe.each([['WASM', false], ['fallback JS', true]])('switchToRGBA via %s', (_, fallback) => {
	it.each(CASES)('bate com a referência: %s', async (_n, dims) => {
		const SPR = await loadSPR({ fallback });
		for (const { got, want, type } of run(SPR, dims)) {
			expect(type).toBe(SPR.TYPE_RGBA);
			expect(got.length).toBe(want.length);
			expect(Buffer.from(got).equals(Buffer.from(want))).toBe(true);
		}
	});
});

describe('paletteConvert.wat em sincronia com o Base64', () => {
	it('WASM instancia', async () => {
		vi.resetModules();
		const { getPaletteConvertWasm } = await import('Loaders/wasm/paletteConvert.js');
		expect(getPaletteConvertWasm()).not.toBeNull();
	});

	it('wat2wasm(.wat) === Base64 embutido', async () => {
		const { PALETTE_CONVERT_WASM_BASE64 } = await import('Loaders/wasm/paletteConvert.js');
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/paletteConvert.wat'), 'utf8');
		const mod = wabt.parseWat('paletteConvert.wat', src);
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(Buffer.from(buffer).toString('base64')).toBe(PALETTE_CONVERT_WASM_BASE64);
	});
});